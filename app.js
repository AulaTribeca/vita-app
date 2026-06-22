const C = window.VITA_CONFIG;
const SESSION_KEY = "vita-one-session";
const table = {
  tasks: "vita_one_tasks",
  shopping: "vita_one_shopping_items",
  health: "vita_one_health_records",
  appointments: "vita_one_appointments",
  meds: "vita_one_medications",
  docs: "vita_one_documents",
  home: "vita_one_home_items",
  push: "vita_push_subscriptions"
};
let user = null;
let householdId = null;
let deferredPrompt = null;
let state = {
  view: "today",
  previousView: "today",
  calendar: new Date(),
  calendarMode: "month",
  calendarFilter: "all",
  hideBought: true,
  tasks: [], shopping: [], health: [], appointments: [], meds: [], docs: [], home: [], pushSub: null
};
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const todayStart = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const dateText = (v) => v ? new Date(v).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "Sin fecha";
const shortDate = (v) => v ? new Date(v).toLocaleDateString("es-ES",{day:"2-digit",month:"short"}) : "";
const setNotice = (msg,type="") => { const n = $("app-status"); if(n){ n.textContent=msg; n.className=`notice ${type}`; } };
const setLoginNotice = (msg,type="") => { const n = $("login-message"); n.textContent=msg; n.className=`notice ${type}`; };
function alias(v){ const raw = String(v||"").trim().toLowerCase(); return C.USER_ALIASES[raw] || raw; }
function displayName(email){ return C.USER_DISPLAY_NAMES[email] || email || "Usuario"; }
function getSession(){ try{ const s=JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); if(!s?.access_token||!s?.user) return null; if(s.expires_at && Number(s.expires_at)*1000<Date.now()){ localStorage.removeItem(SESSION_KEY); return null; } return s; }catch{ localStorage.removeItem(SESSION_KEY); return null; } }
function saveSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
function authUrl(path){ return `${C.SUPABASE_URL}/auth/v1/${path}`; }
function restUrl(path){ return `${C.SUPABASE_URL}/rest/v1/${path}`; }
async function login(email,password){
  const res = await fetch(authUrl("token?grant_type=password"), { method:"POST", headers:{apikey:C.SUPABASE_ANON_KEY,"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error_description || data.msg || "No se pudo iniciar sesión.");
  saveSession(data); user = data.user;
}
async function rest(path,opt={}){
  const s=getSession(); if(!s) throw new Error("Sesión no disponible.");
  const res = await fetch(restUrl(path), {...opt, headers:{apikey:C.SUPABASE_ANON_KEY, Authorization:`Bearer ${s.access_token}`, "Content-Type":"application/json", ...(opt.headers||{})}});
  if(!res.ok){ const data = await res.json().catch(()=>({})); throw new Error(data.message || data.error || `Error Supabase ${res.status}`); }
  if(res.status===204) return null; return res.json();
}
async function insertRows(name,payload){ return rest(name,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(payload)}); }
async function updateRow(name,id,payload){ return rest(`${name}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify(payload)}); }
async function deleteRow(name,id){ return rest(`${name}?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}}); }
function renderAccess(){
  const s=getSession(); user=s?.user || null;
  $("login-view").classList.toggle("hidden", !!user); $("app").classList.toggle("hidden", !user);
  if(user){ $("account-name").textContent=displayName(user.email); $("account-email").textContent=user.email; }
}
async function loadHousehold(){
  householdId = null;
  const rows = await rest(`household_members?select=household_id&user_id=eq.${user.id}&status=eq.active&limit=1`).catch(()=>[]);
  householdId = rows?.[0]?.household_id || null;
}
async function loadAll(){
  setNotice("Cargando VITA...");
  await loadHousehold();
  const u=user.id, h=householdId;
  await Promise.all([
    rest(`${table.tasks}?select=*&or=(owner_id.eq.${u},and(visibility.eq.household,household_id.eq.${h}))&status=neq.deleted&order=done.asc,due_at.asc.nullslast,created_at.desc`).then(d=>state.tasks=d||[]).catch(()=>state.tasks=[]),
    rest(`${table.shopping}?select=*&household_id=eq.${h}&order=checked.asc,created_at.desc`).then(d=>state.shopping=d||[]).catch(()=>state.shopping=[]),
    rest(`${table.health}?select=*&owner_id=eq.${u}&order=occurred_at.desc`).then(d=>state.health=d||[]).catch(()=>state.health=[]),
    rest(`${table.appointments}?select=*&owner_id=eq.${u}&order=appointment_at.asc.nullslast,created_at.desc`).then(d=>state.appointments=d||[]).catch(()=>state.appointments=[]),
    rest(`${table.meds}?select=*&owner_id=eq.${u}&active=eq.true&order=created_at.desc`).then(d=>state.meds=d||[]).catch(()=>state.meds=[]),
    rest(`${table.docs}?select=*&owner_id=eq.${u}&order=status.asc,created_at.desc`).then(d=>state.docs=d||[]).catch(()=>state.docs=[]),
    rest(`${table.home}?select=*&household_id=eq.${h}&status=neq.deleted&order=done.asc,due_at.asc.nullslast,created_at.desc`).then(d=>state.home=d||[]).catch(()=>state.home=[])
  ]);
  renderAll(); setNotice("VITA lista.","success");
}
function navigate(view,push=true){
  if(view===state.view) return;
  state.previousView = state.view; state.view = view;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); $("screen-"+view).classList.add("active");
  document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active", b.dataset.nav===view));
  const titles = {today:["Hoy","Lo importante, sin buscar."], shopping:["Compra","Una lista real, rápida y compartida."], calendar:["Calendario","Planificar sin perderte."], health:["Salud","Citas, volantes, medicación y registros."], home:["Hogar","Activos, coche, facturas y contactos."], more:["Más","Avisos, viajes, UNED y trámites."]};
  $("screen-title").textContent=titles[view]?.[0]||"VITA"; $("screen-subtitle").textContent=titles[view]?.[1]||"";
  $("back-button").classList.toggle("hidden", view==="today");
  if(push) history.pushState({view},"",`#${view}`); window.scrollTo({top:0,behavior:"smooth"});
}
function renderAll(){ renderToday(); renderShopping(); renderCalendar(); renderHealth(); renderAppointments(); renderDocs(); renderMeds(); renderHome(); renderPushDiagnostics(); }
function allEvents(){
  return [
    ...state.tasks.map(t=>({source:"task", id:t.id, title:t.title, details:t.details, date:t.due_at, done:t.done, emoji:"✅", kind:"task"})),
    ...state.appointments.map(a=>({source:"appointment", id:a.id, title:a.title, details:[a.specialty,a.location].filter(Boolean).join(" · "), date:a.appointment_at, done:a.completed, emoji:"🏥", kind:"health"})),
    ...state.home.map(h=>({source:"home", id:h.id, title:h.title, details:h.details, date:h.due_at, done:h.done, emoji:homeEmoji(h.kind), kind:"home"})),
    ...state.docs.filter(d=>d.status==="pending_to_use").map(d=>({source:"doc", id:d.id, title:`Llevar ${d.title}`, details:d.specialty||d.notes, date:d.due_at, done:false, emoji:"📄", kind:"health"}))
  ].filter(e=>e.date);
}
function medicationAlerts(){
  return state.meds.filter(m=>Number(m.stock||0) <= Number(m.warning_threshold||7)).map(m=>({source:"med", id:m.id, title:`Comprar ${m.name}`, details:`Quedan ${m.stock||0} unidades. Umbral: ${m.warning_threshold||7}.`, date:new Date().toISOString(), done:false, emoji:"💊", kind:"health"}));
}
function sortedEvents(){ return [...allEvents(), ...medicationAlerts()].filter(e=>!e.done).sort((a,b)=>new Date(a.date)-new Date(b.date)); }
function renderToday(){
  const start=todayStart(), tomorrow=addDays(start,1), week=addDays(start,8);
  const events=sortedEvents(); const today=events.filter(e=>new Date(e.date)<tomorrow); const weekItems=events.filter(e=>new Date(e.date)>=tomorrow && new Date(e.date)<week);
  $("today-count").textContent=today.length; $("week-count").textContent=weekItems.length;
  $("now-title").textContent = today.length ? `${today.length} cosa(s) para hoy` : "Hoy no hay urgencias";
  $("now-text").textContent = today.length ? "Empieza por la primera tarjeta. Lo demás puede esperar." : (weekItems.length ? `${weekItems.length} cosa(s) próximas esta semana.` : "Semana despejada de momento.");
  $("today-list").innerHTML = today.length ? today.map(renderEventCard).join("") : `<p class="empty">Nada urgente para hoy.</p>`;
  $("week-list").innerHTML = weekItems.length ? weekItems.map(renderEventCard).join("") : `<p class="empty">Nada fechado para esta semana.</p>`;
}
function renderEventCard(e){
  return `<article class="card ${e.done?"done":""}"><div class="card-main"><span class="emoji">${e.emoji}</span><button class="open-card" data-open-event="${e.source}:${e.id}" type="button"><h3>${esc(e.title)}</h3><p>${esc(e.details||"")}</p></button><span class="tag ${new Date(e.date)<new Date()&&!e.done?"danger":""}">${esc(shortDate(e.date))}</span></div><div class="tags"><span class="tag">${esc(dateText(e.date))}</span></div><div class="actions"><button data-toggle-event="${e.source}:${e.id}" type="button">${e.done?"Reabrir":"Hecho"}</button><button data-edit-event="${e.source}:${e.id}" type="button">Editar</button><button class="danger" data-delete-event="${e.source}:${e.id}" type="button">Borrar</button></div></article>`;
}
function renderShopping(){
  const pending=state.shopping.filter(i=>!i.checked).length; $("shopping-count").textContent=pending;
  $("toggle-bought").classList.toggle("active", state.hideBought); $("toggle-bought").textContent=state.hideBought?"Mostrar comprados":"Ocultar comprados";
  const items=state.shopping.filter(i=>!state.hideBought || !i.checked);
  const cats=["supermercado","farmacia","casa","otros"];
  $("shopping-wallet").innerHTML = `<span class="wallet-card">💳 Eroski Club</span><span class="wallet-card">💳 IKEA Family</span>`;
  $("shopping-list").innerHTML = cats.map(cat=>{
    const arr=items.filter(i=>(i.category||"supermercado")===cat);
    if(!arr.length) return "";
    return `<section class="shop-category"><div class="shop-category-title"><span>${labelCategory(cat)}</span><span>${arr.filter(i=>!i.checked).length}</span></div>${arr.map(renderShopItem).join("")}</section>`;
  }).join("") || `<p class="empty">Lista vacía. Escribe productos, uno por línea.</p>`;
}
function labelCategory(c){ return {supermercado:"Supermercado", farmacia:"Farmacia", casa:"Casa", otros:"Otros"}[c] || c; }
function renderShopItem(i){ return `<div class="shop-item ${i.checked?"checked":""}"><input type="checkbox" ${i.checked?"checked":""} data-shop-check="${i.id}" aria-label="Marcar ${esc(i.title)} comprado"><div class="shop-title">${esc(i.title)}</div><div class="shop-actions"><button data-shop-edit="${i.id}" type="button">Editar</button><button data-shop-delete="${i.id}" type="button">Borrar</button></div></div>`; }
function renderCalendar(){
  $("calendar-date").value=state.calendar.toISOString().slice(0,10); renderFilters();
  document.querySelectorAll("[data-calendar-mode]").forEach(b=>b.classList.toggle("active", b.dataset.calendarMode===state.calendarMode));
  if(state.calendarMode==="year") return renderYear();
  if(state.calendarMode==="day") return renderDayOnly();
  const date=new Date(state.calendar); const first=state.calendarMode==="week"?getWeekStart(date):new Date(date.getFullYear(),date.getMonth(),1); const start=new Date(first); if(state.calendarMode==="month") start.setDate(first.getDate()-((first.getDay()+6)%7));
  const len=state.calendarMode==="week"?7:42; const days=Array.from({length:len},(_,i)=>addDays(start,i));
  $("calendar-grid").innerHTML = `<h2>${date.toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</h2><div class="weekdays">${["L","M","X","J","V","S","D"].map(d=>`<span>${d}</span>`).join("")}</div><div class="days">${days.map(d=>dayButton(d,date)).join("")}</div>`;
  renderSelectedDayList();
}
function getWeekStart(d){ const s=new Date(d); s.setDate(d.getDate()-((d.getDay()+6)%7)); return s; }
function filteredEvents(){ return sortedEvents().filter(e=>state.calendarFilter==="all" || e.kind===state.calendarFilter || e.source===state.calendarFilter); }
function eventsOnDay(day){ return filteredEvents().filter(e=>sameDay(new Date(e.date),day)); }
function dayButton(day,current){ const ev=eventsOnDay(day); const cls=["day"]; if(state.calendarMode==="month"&&day.getMonth()!==current.getMonth()) cls.push("muted"); if(sameDay(day,new Date())) cls.push("today"); if(sameDay(day,state.calendar)) cls.push("selected"); return `<button class="${cls.join(" ")}" data-select-day="${day.toISOString().slice(0,10)}" type="button"><strong>${day.getDate()}</strong><span class="dots">${ev.slice(0,7).map(e=>`<i class="dot ${e.kind}"></i>`).join("")}</span></button>`; }
function renderFilters(){ const filters=[["all","Todo"],["task","Tareas"],["health","Salud"],["home","Hogar"]]; $("calendar-filters").innerHTML=filters.map(([id,label])=>`<button class="${state.calendarFilter===id?"active":""}" data-filter="${id}" type="button">${label}</button>`).join(""); }
function renderSelectedDayList(){ const ev=eventsOnDay(state.calendar); $("selected-day-title").textContent=state.calendar.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"}); $("selected-day-list").innerHTML=ev.length?ev.map(renderEventCard).join(""):`<p class="empty">No hay nada registrado este día.</p>`; }
function renderDayOnly(){ $("calendar-grid").innerHTML=`<h2>${state.calendar.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"})}</h2>`; renderSelectedDayList(); }
function renderYear(){ const y=state.calendar.getFullYear(); const ev=filteredEvents().filter(e=>new Date(e.date).getFullYear()===y); $("calendar-grid").innerHTML=`<h2>${y}</h2><div class="year-grid">${Array.from({length:12},(_,m)=>{ const n=ev.filter(e=>new Date(e.date).getMonth()===m).length; return `<button class="year-month" data-year-month="${m}" type="button"><strong>${new Date(y,m,1).toLocaleDateString("es-ES",{month:"long"})}</strong><br><span class="tag">${n} evento(s)</span></button>`; }).join("")}</div>`; renderSelectedDayList(); }
function renderHealth(){ $("health-record-list").innerHTML=state.health.length?state.health.map(h=>`<article class="card"><div class="card-main"><span class="emoji">♡</span><button class="open-card" type="button"><h3>${esc(h.title)}</h3><p>${esc(h.notes||"")}</p></button><span class="tag">${esc(shortDate(h.occurred_at))}</span></div><div class="actions"><button data-edit-health="${h.id}" type="button">Editar</button><button class="danger" data-delete-health="${h.id}" type="button">Borrar</button></div></article>`).join(""):`<p class="empty">Sin registros. Añade sueño, dolor, ánimo, regla, baño o síntomas.</p>`; }
function renderAppointments(){ $("appointment-list").innerHTML=state.appointments.length?state.appointments.map(a=>renderEventCard({source:"appointment",id:a.id,title:a.title,details:[a.specialty,a.location,a.result||a.notes].filter(Boolean).join(" · "),date:a.appointment_at||a.created_at,done:a.completed,emoji:"🏥",kind:"health"})).join(""):`<p class="empty">Sin citas médicas.</p>`; }
function renderDocs(){ $("medical-document-list").innerHTML=state.docs.length?state.docs.map(d=>`<article class="card ${d.status==="used"?"done":""}"><div class="card-main"><span class="emoji">📄</span><button class="open-card" type="button"><h3>${esc(d.title)}</h3><p>${esc([d.specialty,d.notes].filter(Boolean).join(" · "))}</p></button><span class="tag ${d.status==="pending_to_use"?"danger":""}">${esc(labelDocStatus(d.status))}</span></div><div class="actions"><button data-use-doc="${d.id}" type="button">${d.status==="used"?"Reabrir":"Usado"}</button><button data-edit-doc="${d.id}" type="button">Editar</button><button class="danger" data-delete-doc="${d.id}" type="button">Borrar</button></div></article>`).join(""):`<p class="empty">Sin volantes ni informes. Al completar una cita, VITA puede crear uno pendiente.</p>`; }
function labelDocStatus(s){ return {pending_upload:"Pendiente de subir", pending_to_use:"Pendiente de llevar", used:"Usado", archived:"Archivado"}[s]||s; }
function renderMeds(){ $("medication-list").innerHTML=state.meds.length?state.meds.map(m=>{ const low=Number(m.stock||0)<=Number(m.warning_threshold||7); return `<article class="card"><div class="card-main"><span class="emoji">💊</span><button class="open-card" type="button"><h3>${esc(m.name)}</h3><p>${esc(m.dose||"")}</p></button><span class="tag ${low?"danger":"ok"}">${m.stock||0} uds</span></div><div class="tags"><span class="tag">Avisar con ${m.warning_threshold||7}</span>${low?`<span class="tag danger">Comprar</span>`:""}</div><div class="actions"><button data-med-take="${m.id}" type="button">Tomado</button><button data-med-buy="${m.id}" type="button">Añadir a farmacia</button><button data-edit-med="${m.id}" type="button">Editar</button><button class="danger" data-delete-med="${m.id}" type="button">Borrar</button></div></article>`; }).join(""):`<p class="empty">Sin medicación registrada.</p>`; }
function homeEmoji(k){ return {asset:"⌂", car:"🚗", bill:"💶", contact:"☎️", travel:"✈️", university:"🎓", bureaucracy:"📁"}[k] || "⌂"; }
function renderHome(){ const by=k=>state.home.filter(h=>h.kind===k); const render=arr=>arr.length?arr.map(h=>renderEventCard({source:"home",id:h.id,title:h.title,details:h.details,date:h.due_at||h.created_at,done:h.done,emoji:homeEmoji(h.kind),kind:"home"})).join(""):`<p class="empty">Sin elementos.</p>`; $("asset-list").innerHTML=render(by("asset")); $("car-list").innerHTML=render(by("car")); $("bill-list").innerHTML=render(by("bill")); $("contact-list").innerHTML=render(by("contact")); }
function switchSubtab(id){ const parent=id.startsWith("health")?"health":"home"; document.querySelectorAll(`#screen-${parent} .subpanel`).forEach(p=>p.classList.remove("active")); document.querySelectorAll(`#screen-${parent} [data-subtab]`).forEach(b=>b.classList.toggle("active", b.dataset.subtab===id)); $(id).classList.add("active"); }
function openDialog(html){ $("dialog-body").innerHTML=html; $("dialog").showModal(); }
function closeDialog(){ $("dialog").close(); }
function dateInput(v){ if(!v) return ""; const d=new Date(v); const l=new Date(d.getTime()-d.getTimezoneOffset()*60000); return l.toISOString().slice(0,16); }
function form(title, fields, submit="Guardar"){ return `<h2>${esc(title)}</h2><form id="modal-form" class="form-stack">${fields}<button class="primary" type="submit">${esc(submit)}</button></form>`; }
function openTaskForm(item=null, preferredDate=null, kind="task"){
  const titleMap={task:"Tarea", university:"UNED", travel:"Viaje", bureaucracy:"Trámite"};
  openDialog(form(item?`Editar ${titleMap[kind]||"tarea"}`:`Añadir ${titleMap[kind]||"tarea"}`, `<label class="field"><span>Título</span><input id="f-title" value="${esc(item?.title||"")}" required></label><label class="field"><span>Detalles</span><textarea id="f-details" rows="3">${esc(item?.details||"")}</textarea></label><div class="grid-two"><label class="field"><span>Fecha</span><input id="f-date" type="datetime-local" value="${dateInput(item?.due_at||preferredDate)}"></label><label class="field"><span>Visibilidad</span><select id="f-vis"><option value="private">Privado</option><option value="household">Compartido</option></select></label></div>`));
  $("f-vis").value=item?.visibility||"private"; $("modal-form").onsubmit=async e=>{ e.preventDefault(); const vis=$("f-vis").value, raw=$("f-date").value; const payload={owner_id:user.id, household_id:vis==="household"?householdId:null, visibility:vis, kind, title:$("f-title").value.trim(), details:$("f-details").value.trim()||null, due_at:raw?new Date(raw).toISOString():null, done:false, status:"open"}; if(item) await updateRow(table.tasks,item.id,payload); else await insertRows(table.tasks,payload); closeDialog(); await loadAll(); };
}
function openHealthRecordForm(item=null){
  openDialog(form(item?"Editar registro":"Añadir registro", `<label class="field"><span>Tipo</span><select id="f-type"><option value="note">Nota</option><option value="bathroom">Baño</option><option value="symptoms">Síntomas</option><option value="sleep">Sueño</option><option value="period">Regla</option><option value="pain">Dolor</option><option value="mood">Ánimo</option></select></label><label class="field"><span>Registro</span><input id="f-title" value="${esc(item?.title||"")}" required></label><label class="field"><span>Notas</span><textarea id="f-notes" rows="3">${esc(item?.notes||"")}</textarea></label>`));
  $("f-type").value=item?.record_type||"note"; $("modal-form").onsubmit=async e=>{ e.preventDefault(); const payload={owner_id:user.id, record_type:$("f-type").value, title:$("f-title").value.trim(), notes:$("f-notes").value.trim()||null, occurred_at:new Date().toISOString()}; if(item) await updateRow(table.health,item.id,payload); else await insertRows(table.health,payload); closeDialog(); await loadAll(); };
}
function openAppointmentForm(item=null){
  openDialog(form(item?"Editar cita médica":"Añadir cita médica", `<label class="field"><span>Cita</span><input id="f-title" value="${esc(item?.title||"")}" required></label><label class="field"><span>Especialidad</span><input id="f-specialty" value="${esc(item?.specialty||"")}"></label><label class="field"><span>Fecha</span><input id="f-date" type="datetime-local" value="${dateInput(item?.appointment_at)}"></label><label class="field"><span>Lugar</span><input id="f-location" value="${esc(item?.location||"")}"></label><label class="field"><span>Notas</span><textarea id="f-notes" rows="3">${esc(item?.notes||"")}</textarea></label>`));
  $("modal-form").onsubmit=async e=>{ e.preventDefault(); const raw=$("f-date").value; const payload={owner_id:user.id,title:$("f-title").value.trim(),specialty:$("f-specialty").value.trim()||null,appointment_at:raw?new Date(raw).toISOString():null,location:$("f-location").value.trim()||null,notes:$("f-notes").value.trim()||null}; if(item) await updateRow(table.appointments,item.id,payload); else await insertRows(table.appointments,payload); closeDialog(); await loadAll(); };
}
function openCompleteAppointment(item){
  openDialog(form("Completar cita", `<p>VITA necesita saber qué ocurrió para ayudarte después.</p><label class="field"><span>Resumen</span><textarea id="f-result" rows="4">${esc(item.result||"")}</textarea></label><label class="field"><span>¿Te dieron volante, informe o receta?</span><select id="f-doc"><option value="no">No</option><option value="yes">Sí</option></select></label><label class="field"><span>¿Para qué especialista o prueba?</span><input id="f-for" value="${esc(item.document_for||"")}"></label>`));
  $("modal-form").onsubmit=async e=>{ e.preventDefault(); const got=$("f-doc").value==="yes"; await updateRow(table.appointments,item.id,{completed:true,result:$("f-result").value.trim()||null,document_given:got,document_for:$("f-for").value.trim()||null}); if(got){ await insertRows(table.docs,{owner_id:user.id,appointment_id:item.id,title:$("f-for").value.trim()?`Volante para ${$("f-for").value.trim()}`:"Volante o informe pendiente",specialty:$("f-for").value.trim()||null,status:"pending_to_use",notes:"Creado al completar una cita médica."}); } closeDialog(); await loadAll(); };
}
function openDocForm(item=null){
  openDialog(form(item?"Editar documento":"Añadir volante o informe", `<label class="field"><span>Título</span><input id="f-title" value="${esc(item?.title||"")}" required></label><label class="field"><span>Especialidad / prueba</span><input id="f-specialty" value="${esc(item?.specialty||"")}"></label><label class="field"><span>Estado</span><select id="f-status"><option value="pending_to_use">Pendiente de llevar</option><option value="pending_upload">Pendiente de subir</option><option value="used">Usado</option><option value="archived">Archivado</option></select></label><label class="field"><span>Notas</span><textarea id="f-notes" rows="3">${esc(item?.notes||"")}</textarea></label>`));
  $("f-status").value=item?.status||"pending_to_use"; $("modal-form").onsubmit=async e=>{ e.preventDefault(); const payload={owner_id:user.id,title:$("f-title").value.trim(),specialty:$("f-specialty").value.trim()||null,status:$("f-status").value,notes:$("f-notes").value.trim()||null}; if(item) await updateRow(table.docs,item.id,payload); else await insertRows(table.docs,payload); closeDialog(); await loadAll(); };
}
function openMedForm(item=null){
  openDialog(form(item?"Editar medicación":"Añadir medicación", `<label class="field"><span>Nombre</span><input id="f-name" value="${esc(item?.name||"")}" required></label><label class="field"><span>Pauta</span><input id="f-dose" value="${esc(item?.dose||"")}"></label><div class="grid-two"><label class="field"><span>Stock</span><input id="f-stock" type="number" min="0" value="${esc(item?.stock??"")}"></label><label class="field"><span>Avisar cuando queden</span><input id="f-warning" type="number" min="1" value="${esc(item?.warning_threshold??7)}"></label></div>`));
  $("modal-form").onsubmit=async e=>{ e.preventDefault(); const payload={owner_id:user.id,name:$("f-name").value.trim(),dose:$("f-dose").value.trim()||null,stock:Number($("f-stock").value||0),warning_threshold:Number($("f-warning").value||7),active:true}; if(item) await updateRow(table.meds,item.id,payload); else await insertRows(table.meds,payload); closeDialog(); await loadAll(); };
}
function openHomeForm(kind,item=null){
  const labels={asset:"activo",car:"coche",bill:"factura",contact:"contacto"};
  openDialog(form(item?`Editar ${labels[kind]}`:`Añadir ${labels[kind]}`, `<label class="field"><span>Título</span><input id="f-title" value="${esc(item?.title||"")}" required></label><label class="field"><span>Detalles</span><textarea id="f-details" rows="3">${esc(item?.details||"")}</textarea></label><label class="field"><span>Fecha si procede</span><input id="f-date" type="datetime-local" value="${dateInput(item?.due_at)}"></label>`));
  $("modal-form").onsubmit=async e=>{ e.preventDefault(); const raw=$("f-date").value; const payload={household_id:householdId,created_by:user.id,kind,title:$("f-title").value.trim(),details:$("f-details").value.trim()||null,due_at:raw?new Date(raw).toISOString():null,done:false,status:"open"}; if(item) await updateRow(table.home,item.id,payload); else await insertRows(table.home,payload); closeDialog(); await loadAll(); };
}
function findEvent(key){ const [source,id]=key.split(":"); if(source==="task") return {source,item:state.tasks.find(x=>x.id===id)}; if(source==="appointment") return {source,item:state.appointments.find(x=>x.id===id)}; if(source==="home") return {source,item:state.home.find(x=>x.id===id)}; if(source==="doc") return {source,item:state.docs.find(x=>x.id===id)}; if(source==="med") return {source,item:state.meds.find(x=>x.id===id)}; return {}; }
async function toggleEvent(key){ const {source,item}=findEvent(key); if(!item) return; if(source==="task") await updateRow(table.tasks,item.id,{done:!item.done}); else if(source==="appointment"){ if(!item.completed) return openCompleteAppointment(item); await updateRow(table.appointments,item.id,{completed:false}); } else if(source==="home") await updateRow(table.home,item.id,{done:!item.done}); else if(source==="doc") await updateRow(table.docs,item.id,{status:item.status==="used"?"pending_to_use":"used"}); else if(source==="med") await updateRow(table.meds,item.id,{stock:Math.max(Number(item.stock||0)-1,0)}); await loadAll(); }
function editEvent(key){ const {source,item}=findEvent(key); if(!item) return; if(source==="task") openTaskForm(item); else if(source==="appointment") openAppointmentForm(item); else if(source==="home") openHomeForm(item.kind,item); else if(source==="doc") openDocForm(item); else if(source==="med") openMedForm(item); }
async function deleteEvent(key){ const {source,item}=findEvent(key); if(!item||!confirm("¿Borrar?")) return; if(source==="task") await updateRow(table.tasks,item.id,{status:"deleted"}); else if(source==="appointment") await deleteRow(table.appointments,item.id); else if(source==="home") await updateRow(table.home,item.id,{status:"deleted"}); else if(source==="doc") await deleteRow(table.docs,item.id); else if(source==="med") await updateRow(table.meds,item.id,{active:false}); await loadAll(); }
async function registerSW(){ if(!("serviceWorker" in navigator)) throw new Error("Este navegador no soporta Service Worker."); const reg=await navigator.serviceWorker.register("./service-worker.js"); await navigator.serviceWorker.ready; return reg; }
function vapidToUint8Array(v){ const pad="=".repeat((4-v.length%4)%4); const b=(v+pad).replaceAll("-","+").replaceAll("_","/"); return Uint8Array.from([...atob(b)].map(c=>c.charCodeAt(0))); }
async function subscribePush(){ const reg=await registerSW(); if(!("Notification" in window)) throw new Error("Este navegador no permite notificaciones."); const perm=Notification.permission==="granted"?"granted":await Notification.requestPermission(); if(perm!=="granted") throw new Error("Permiso denegado."); let sub=await reg.pushManager.getSubscription(); if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:vapidToUint8Array(C.PUSH.VAPID_PUBLIC_KEY)}); const j=sub.toJSON(); await rest(table.push,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({owner_id:user.id,endpoint:j.endpoint,p256dh:j.keys?.p256dh||"",auth:j.keys?.auth||"",user_agent:navigator.userAgent,enabled:true})}); }
async function renderPushDiagnostics(){ const rows=[]; rows.push(["HTTPS", location.protocol==="https:" || location.hostname==="localhost"]); rows.push(["Service Worker", "serviceWorker" in navigator]); rows.push(["Notificaciones", "Notification" in window]); rows.push(["Permiso", ("Notification" in window)&&Notification.permission==="granted"]); let sub=null; try{ const reg=await navigator.serviceWorker.getRegistration(); sub=reg?await reg.pushManager.getSubscription():null; }catch{} rows.push(["Suscripción push", !!sub]); $("push-state").textContent=sub?"activa":"revisar"; $("push-diagnostics").innerHTML=rows.map(([l,ok])=>`<div class="diag ${ok?"ok":"bad"}"><span>${l}</span><strong>${ok?"OK":"Falta"}</strong></div>`).join(""); }
async function testLocal(){ const reg=await registerSW(); if(Notification.permission!=="granted"){ const p=await Notification.requestPermission(); if(p!=="granted") throw new Error("Permiso denegado."); } await reg.showNotification("VITA",{body:"Prueba local correcta.",icon:"./assets/vita-icon-192.png",badge:"./assets/vita-icon-192.png",tag:"vita-local"}); }
async function testPush(){ await subscribePush(); const s=getSession(); const res=await fetch(C.PUSH.EDGE_FUNCTION_URL,{method:"POST",headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:`Bearer ${s.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({title:"VITA",body:"Prueba push real correcta.",target:"today"})}); const data=await res.json().catch(()=>({})); if(!res.ok||data.ok===false) throw new Error(data.message||data.error||"No se pudo enviar push."); }
function setup(){
  $("login-form").onsubmit=async e=>{ e.preventDefault(); try{ setLoginNotice("Entrando..."); await login(alias($("login-user").value),$("login-password").value); renderAccess(); history.replaceState({view:"today"},"","#today"); await loadAll(); setLoginNotice("Sesión iniciada.","success"); }catch(err){ setLoginNotice(err.message,"error"); } };
  document.addEventListener("click", async e=>{
    const nav=e.target.closest("[data-nav]"); if(nav){ navigate(nav.dataset.nav); return; }
    const sub=e.target.closest("[data-subtab]"); if(sub){ switchSubtab(sub.dataset.subtab); return; }
    const formBtn=e.target.closest("[data-open-form]"); if(formBtn){ const type=formBtn.dataset.openForm; if(type==="task"||type==="task-for-day") openTaskForm(null, type==="task-for-day"?state.calendar:null); else if(type==="health-record") openHealthRecordForm(); else if(type==="appointment") openAppointmentForm(); else if(type==="medical-document") openDocForm(); else if(type==="medication") openMedForm(); else if(type==="home-asset") openHomeForm("asset"); else if(type==="home-car") openHomeForm("car"); else if(type==="home-bill") openHomeForm("bill"); else if(type==="home-contact") openHomeForm("contact"); else if(type==="university"||type==="travel"||type==="bureaucracy") openTaskForm(null,null,type); return; }
    const open=e.target.closest("[data-open-event]"); if(open){ const {item}=findEvent(open.dataset.openEvent); if(item) alert(item.details||item.notes||item.result||item.title); return; }
    const tog=e.target.closest("[data-toggle-event]"); if(tog){ await toggleEvent(tog.dataset.toggleEvent); return; }
    const ed=e.target.closest("[data-edit-event]"); if(ed){ editEvent(ed.dataset.editEvent); return; }
    const de=e.target.closest("[data-delete-event]"); if(de){ await deleteEvent(de.dataset.deleteEvent); return; }
    const check=e.target.closest("[data-shop-check]"); if(check){ await updateRow(table.shopping,check.dataset.shopCheck,{checked:check.checked}); await loadAll(); return; }
    const shEd=e.target.closest("[data-shop-edit]"); if(shEd){ const item=state.shopping.find(i=>i.id===shEd.dataset.shopEdit); const val=prompt("Producto",item?.title||""); if(val!==null&&val.trim()){ await updateRow(table.shopping,item.id,{title:val.trim()}); await loadAll(); } return; }
    const shDel=e.target.closest("[data-shop-delete]"); if(shDel){ if(confirm("¿Borrar producto?")){ await deleteRow(table.shopping,shDel.dataset.shopDelete); await loadAll(); } return; }
    const filt=e.target.closest("[data-filter]"); if(filt){ state.calendarFilter=filt.dataset.filter; renderCalendar(); return; }
    const mode=e.target.closest("[data-calendar-mode]"); if(mode){ state.calendarMode=mode.dataset.calendarMode; renderCalendar(); return; }
    const day=e.target.closest("[data-select-day]"); if(day){ state.calendar=new Date(`${day.dataset.selectDay}T12:00:00`); state.calendarMode="day"; renderCalendar(); return; }
    const month=e.target.closest("[data-year-month]"); if(month){ state.calendar=new Date(state.calendar.getFullYear(),Number(month.dataset.yearMonth),1,12); state.calendarMode="month"; renderCalendar(); return; }
    const editHealth=e.target.closest("[data-edit-health]"); if(editHealth){ openHealthRecordForm(state.health.find(h=>h.id===editHealth.dataset.editHealth)); return; }
    const delHealth=e.target.closest("[data-delete-health]"); if(delHealth){ if(confirm("¿Borrar registro?")){ await deleteRow(table.health,delHealth.dataset.deleteHealth); await loadAll(); } return; }
    const useDoc=e.target.closest("[data-use-doc]"); if(useDoc){ const d=state.docs.find(x=>x.id===useDoc.dataset.useDoc); await updateRow(table.docs,d.id,{status:d.status==="used"?"pending_to_use":"used"}); await loadAll(); return; }
    const editDoc=e.target.closest("[data-edit-doc]"); if(editDoc){ openDocForm(state.docs.find(d=>d.id===editDoc.dataset.editDoc)); return; }
    const delDoc=e.target.closest("[data-delete-doc]"); if(delDoc){ if(confirm("¿Borrar documento?")){ await deleteRow(table.docs,delDoc.dataset.deleteDoc); await loadAll(); } return; }
    const medTake=e.target.closest("[data-med-take]"); if(medTake){ const m=state.meds.find(x=>x.id===medTake.dataset.medTake); await updateRow(table.meds,m.id,{stock:Math.max(Number(m.stock||0)-1,0)}); await loadAll(); return; }
    const medBuy=e.target.closest("[data-med-buy]"); if(medBuy){ const m=state.meds.find(x=>x.id===medBuy.dataset.medBuy); await insertRows(table.shopping,{household_id:householdId,created_by:user.id,title:m.name,category:"farmacia",checked:false}); await loadAll(); navigate("shopping"); return; }
    const editMed=e.target.closest("[data-edit-med]"); if(editMed){ openMedForm(state.meds.find(m=>m.id===editMed.dataset.editMed)); return; }
    const delMed=e.target.closest("[data-delete-med]"); if(delMed){ if(confirm("¿Borrar medicación?")){ await updateRow(table.meds,delMed.dataset.deleteMed,{active:false}); await loadAll(); } return; }
  });
  $("shopping-form").onsubmit=async e=>{ e.preventDefault(); const lines=$("shopping-input").value.split(/\n+/).map(x=>x.trim()).filter(Boolean); if(!lines.length) return; const category=$("shopping-category").value; const payload=lines.map(title=>({household_id:householdId,created_by:user.id,title,category,checked:false})); await insertRows(table.shopping,payload); $("shopping-input").value=""; await loadAll(); };
  $("toggle-bought").onclick=()=>{ state.hideBought=!state.hideBought; renderShopping(); };
  $("clear-bought").onclick=async()=>{ const bought=state.shopping.filter(i=>i.checked); if(!bought.length) return; if(!confirm(`¿Borrar ${bought.length} producto(s) comprados?`)) return; await Promise.all(bought.map(i=>deleteRow(table.shopping,i.id))); await loadAll(); };
  $("calendar-prev").onclick=()=>{ if(state.calendarMode==="year") state.calendar.setFullYear(state.calendar.getFullYear()-1); else if(state.calendarMode==="week") state.calendar.setDate(state.calendar.getDate()-7); else state.calendar.setMonth(state.calendar.getMonth()-1); renderCalendar(); };
  $("calendar-next").onclick=()=>{ if(state.calendarMode==="year") state.calendar.setFullYear(state.calendar.getFullYear()+1); else if(state.calendarMode==="week") state.calendar.setDate(state.calendar.getDate()+7); else state.calendar.setMonth(state.calendar.getMonth()+1); renderCalendar(); };
  $("calendar-date").onchange=()=>{ state.calendar=new Date(`${$("calendar-date").value}T12:00:00`); renderCalendar(); };
  $("back-button").onclick=()=>history.back(); $("account-shortcut").onclick=()=>navigate("more");
  window.onpopstate=e=>{ navigate(e.state?.view||"today",false); };
  $("logout").onclick=()=>{ clearSession(); location.reload(); };
  $("enable-push").onclick=async()=>{ try{ await subscribePush(); setNotice("Avisos activados.","success"); await renderPushDiagnostics(); }catch(err){ setNotice(err.message,"error"); } };
  $("test-local").onclick=async()=>{ try{ await testLocal(); setNotice("Prueba local enviada.","success"); await renderPushDiagnostics(); }catch(err){ setNotice(err.message,"error"); } };
  $("test-push").onclick=async()=>{ try{ await testPush(); setNotice("Prueba push real enviada.","success"); await renderPushDiagnostics(); }catch(err){ setNotice(err.message,"error"); } };
  window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredPrompt=e; });
}
async function boot(){ setup(); await registerSW().catch(()=>null); renderAccess(); if(user){ await loadAll().catch(err=>setNotice(err.message,"error")); } const hash=location.hash.replace("#","")||"today"; if($("screen-"+hash)) navigate(hash,false); else history.replaceState({view:"today"},"","#today"); await renderPushDiagnostics().catch(()=>null); }
boot();

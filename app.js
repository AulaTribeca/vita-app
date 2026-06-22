const C = window.VITA_CONFIG;
const SESSION_KEY = "vita-one-session";
let currentUser = null;
let householdId = null;
let currentScreen = "today";
let previousScreen = "today";
let agendaDate = new Date();
let agendaMode = "month";
let agendaFilter = "all";
let hideBought = true;

const state = {
  cards: [],
  shopping: [],
  pushSub: null
};

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const alias = (v) => C.USER_ALIASES[String(v||"").trim().toLowerCase()] || String(v||"").trim().toLowerCase();
const todayStart = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate()+days); return d; };
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "Sin fecha";
const shortDate = (v) => v ? new Date(v).toLocaleDateString("es-ES",{day:"2-digit",month:"short"}) : "";
const status = (msg, type="") => {
  const node = $("login-message");
  if(node){ node.textContent = msg; node.className = `quiet ${type}`; }
};
const appStatus = (msg) => {
  const guide = $("guide-text");
  if(guide && currentScreen === "today") guide.textContent = msg;
};

function getSession(){
  try{
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if(!s?.access_token || !s?.user) return null;
    if(s.expires_at && Number(s.expires_at)*1000 < Date.now()){
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  }catch{
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
function saveSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

function authUrl(path){ return `${C.SUPABASE_URL}/auth/v1/${path}`; }
function restUrl(path){ return `${C.SUPABASE_URL}/rest/v1/${path}`; }

async function login(email,password){
  const res = await fetch(authUrl("token?grant_type=password"), {
    method:"POST",
    headers:{apikey:C.SUPABASE_ANON_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error_description || data.msg || "No se pudo iniciar sesión.");
  saveSession(data);
  currentUser = data.user;
}

async function rest(path,opt={}){
  const session = getSession();
  if(!session) throw new Error("Sesión no disponible.");
  const res = await fetch(restUrl(path), {
    ...opt,
    headers:{
      apikey:C.SUPABASE_ANON_KEY,
      Authorization:`Bearer ${session.access_token}`,
      "Content-Type":"application/json",
      ...(opt.headers||{})
    }
  });
  if(!res.ok){
    const data = await res.json().catch(()=>({}));
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }
  if(res.status===204) return null;
  return res.json();
}
async function insert(table,payload){
  return rest(table,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(payload)});
}
async function patch(table,id,payload){
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify(payload)});
}
async function remove(table,id){
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
}

function renderAccess(){
  const session = getSession();
  currentUser = session?.user || null;
  $("login-view").classList.toggle("hidden", Boolean(currentUser));
  $("app").classList.toggle("hidden", !currentUser);
  if(currentUser){
    $("account-name").textContent = C.USER_DISPLAY_NAMES[currentUser.email] || currentUser.email;
    $("account-email").textContent = currentUser.email;
  }
}

async function loadHousehold(){
  householdId = null;
  const rows = await rest(`household_members?select=household_id&user_id=eq.${currentUser.id}&status=eq.active&limit=1`).catch(()=>[]);
  householdId = rows?.[0]?.household_id || null;
}

async function loadAll(){
  appStatus("Ordenando tu día...");
  await loadHousehold();
  const uid = currentUser.id;
  const hid = householdId || "00000000-0000-0000-0000-000000000000";
  await Promise.all([
    rest(`vita_one_cards?select=*&or=(owner_id.eq.${uid},and(visibility.eq.household,household_id.eq.${hid}))&status=neq.deleted&order=done.asc,due_at.asc.nullslast,created_at.desc`)
      .then(d=>state.cards=d||[]),
    rest(`vita_one_shopping_items?select=*&household_id=eq.${hid}&order=checked.asc,created_at.desc`)
      .then(d=>state.shopping=d||[])
  ].map(p=>p.catch(e=>console.warn(e))));
  renderAll();
}

function nav(screen, push=true){
  previousScreen = currentScreen;
  currentScreen = screen;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(`screen-${screen}`).classList.add("active");
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active", b.dataset.nav === screen));
  const titles = {
    today:["Hoy","Lo importante, sin buscar."],
    shopping:["Compra","Una lista real, rápida y compartida."],
    agenda:["Agenda","Día, semana y mes sin ruido."],
    health:["Salud","Citas, volantes, medicación y cuerpo."],
    uned:["UNED","Tu grado al frente, con seguimiento."],
    home:["Hogar","Facturas, coche, contactos y wallet."],
    more:["Más","Solo lo secundario."]
  };
  const t = titles[screen] || ["VITA",""];
  $("screen-title").textContent = t[0];
  $("screen-subtitle").textContent = t[1];
  $("back-button").classList.toggle("hidden", screen === "today");
  if(push) history.pushState({screen}, "", `#${screen}`);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderAll(){
  renderToday();
  renderShopping();
  renderAgenda();
  renderHealth();
  renderUned();
  renderHome();
  renderPush();
}

function cards(filter = {}){
  return state.cards.filter(c => {
    if(c.status === "deleted") return false;
    if(filter.domain && c.domain !== filter.domain) return false;
    if(filter.kind && c.kind !== filter.kind) return false;
    return true;
  });
}
function cardIcon(card){
  const map = {
    task:"✅", appointment:"🏥", document:"📄", medication:"💊", health_record:"♡",
    uned_exam:"📝", uned_delivery:"📎", uned_subject:"📚", uned_task:"🎓",
    bill:"💶", car:"🚗", contact:"☎️", wallet:"💳", travel:"✈️", bureaucracy:"📁"
  };
  return map[card.kind] || "•";
}
function agendaClass(card){
  if(card.domain === "health") return "health";
  if(card.domain === "uned") return "uned";
  if(card.domain === "home") return "home";
  if(card.domain === "shopping") return "shopping";
  return "task";
}
function sortDue(a,b){
  const ad = a.due_at ? new Date(a.due_at).getTime() : 9999999999999;
  const bd = b.due_at ? new Date(b.due_at).getTime() : 9999999999999;
  if(a.done !== b.done) return a.done ? 1 : -1;
  return ad - bd;
}

function renderToday(){
  const now = new Date();
  const tomorrow = addDays(todayStart(),1);
  const weekEnd = addDays(todayStart(),8);
  const active = state.cards.filter(c=>!c.done && c.status !== "deleted").sort(sortDue);
  const today = active.filter(c=>c.due_at && new Date(c.due_at) < tomorrow);
  const week = active.filter(c=>c.due_at && new Date(c.due_at) >= tomorrow && new Date(c.due_at) < weekEnd);
  const medsLow = cards({domain:"health", kind:"medication"}).filter(m => Number(m.data?.stock || 0) <= Number(m.data?.threshold || 7));
  const docs = cards({domain:"health", kind:"document"}).filter(d => !d.done);
  const uned = active.filter(c=>c.domain === "uned").slice(0,2);

  $("today-count").textContent = today.length;
  $("week-count").textContent = week.length;

  if(today.length){
    $("guide-title").textContent = `${today.length} cosa(s) necesitan atención hoy`;
    $("guide-text").textContent = "Empieza por la primera tarjeta. Si algo ya está hecho, márcalo y desaparece del ruido.";
  } else if(medsLow.length){
    $("guide-title").textContent = `Revisa medicación: ${medsLow[0].title}`;
    $("guide-text").textContent = "El stock está bajo. Puedes añadirlo a farmacia desde su tarjeta.";
  } else if(uned.length){
    $("guide-title").textContent = `UNED: ${uned[0].title}`;
    $("guide-text").textContent = "Tu grado es prioritario. Mantén fechas y tareas visibles.";
  } else {
    $("guide-title").textContent = "Hoy está despejado";
    $("guide-text").textContent = "Puedes añadir un pendiente, revisar UNED o dejar preparada la compra.";
  }

  const todayCards = [
    ...today,
    ...medsLow.map(m => ({...m, guideTag:"Comprar medicación"})),
    ...docs.slice(0,2).map(d => ({...d, guideTag:"Documento pendiente"}))
  ];
  $("today-list").innerHTML = todayCards.length ? todayCards.map(renderCard).join("") : `<p class="empty">Nada urgente para hoy.</p>`;
  $("week-list").innerHTML = week.length ? week.slice(0,8).map(renderCard).join("") : `<p class="empty">Nada fechado para los próximos días.</p>`;
}

function renderCard(card){
  const due = card.due_at ? new Date(card.due_at) : null;
  const overdue = due && due < new Date() && !card.done;
  return `<article class="card ${card.done ? "done" : ""}" data-card="${card.id}">
    <div class="card-main">
      <span class="emoji">${cardIcon(card)}</span>
      <button class="open-card" data-open-card="${card.id}" type="button">
        <h3>${esc(card.title)}</h3>
        <p>${esc(card.details || subtitleFor(card) || "")}</p>
      </button>
      ${card.due_at ? `<span class="tag ${overdue ? "danger" : ""}">${esc(shortDate(card.due_at))}</span>` : `<span class="tag">${esc(card.domain)}</span>`}
    </div>
    <div class="tags">
      <span class="tag">${labelDomain(card.domain)}</span>
      ${card.guideTag ? `<span class="tag ok">${esc(card.guideTag)}</span>` : ""}
      ${card.due_at ? `<span class="tag">${esc(fmtDate(card.due_at))}</span>` : ""}
      ${card.visibility === "household" ? `<span class="tag">Compartido</span>` : `<span class="tag">Privado</span>`}
      ${card.done ? `<span class="tag ok">Hecho</span>` : ""}
    </div>
    <div class="actions">
      <button data-done-card="${card.id}" type="button">${card.done ? "Reabrir" : "Hecho"}</button>
      ${extraAction(card)}
      <button data-edit-card="${card.id}" type="button">Editar</button>
      <button class="danger" data-delete-card="${card.id}" type="button">Borrar</button>
    </div>
  </article>`;
}
function subtitleFor(card){
  if(card.kind === "medication") return `${card.data?.stock ?? 0} unidades · aviso con ${card.data?.threshold ?? 7}`;
  if(card.kind === "appointment") return [card.data?.specialty, card.data?.location].filter(Boolean).join(" · ");
  if(card.kind === "contact") return [card.data?.phone, card.data?.provider].filter(Boolean).join(" · ");
  if(card.kind === "wallet") return [card.data?.provider, card.data?.number ? "con número" : ""].filter(Boolean).join(" · ");
  return "";
}
function labelDomain(domain){
  return {today:"Hoy", health:"Salud", uned:"UNED", home:"Hogar", task:"Tarea", travel:"Viaje", bureaucracy:"Trámite"}[domain] || domain || "VITA";
}
function extraAction(card){
  if(card.kind === "appointment" && !card.done) return `<button data-complete-appointment="${card.id}" type="button">Completar cita</button>`;
  if(card.kind === "medication") return `<button data-add-med-shop="${card.id}" type="button">A farmacia</button><button data-stock-med="${card.id}" type="button">Stock</button>`;
  if(card.kind === "document" && !card.done) return `<button data-done-card="${card.id}" type="button">Llevado</button>`;
  return "";
}

function renderShopping(){
  const visible = hideBought ? state.shopping.filter(i=>!i.checked) : state.shopping;
  $("shopping-count").textContent = state.shopping.filter(i=>!i.checked).length;
  $("toggle-bought").textContent = hideBought ? "Mostrar comprados" : "Ocultar comprados";
  $("toggle-bought").classList.toggle("active", hideBought);

  const wallet = cards({domain:"home", kind:"wallet"});
  const medsLow = cards({domain:"health", kind:"medication"}).filter(m => Number(m.data?.stock || 0) <= Number(m.data?.threshold || 7));
  const mini = [
    ...wallet.slice(0,3).map(w => `<span class="mini">💳 ${esc(w.title)}</span>`),
    ...medsLow.slice(0,2).map(m => `<button class="mini" data-add-med-shop="${m.id}" type="button">💊 Añadir ${esc(m.title)}</button>`)
  ];
  $("shopping-companion").innerHTML = mini.length ? mini.join("") : `<span class="mini">Compra compartida</span>`;

  if(!visible.length){
    $("shopping-list").innerHTML = `<p class="empty">Lista vacía. Escribe productos arriba, uno por línea.</p>`;
    return;
  }
  const cats = ["farmacia","supermercado","hogar","otros"];
  $("shopping-list").innerHTML = cats.map(cat => {
    const items = visible.filter(i => (i.category || "otros") === cat);
    if(!items.length) return "";
    return `<section class="shopping-category">
      <div class="category-title"><span>${labelCategory(cat)}</span><span class="count">${items.filter(i=>!i.checked).length}</span></div>
      ${items.map(renderShoppingItem).join("")}
    </section>`;
  }).join("");
}
function labelCategory(cat){ return {farmacia:"Farmacia", supermercado:"Supermercado", hogar:"Hogar", otros:"Otros"}[cat] || cat; }
function renderShoppingItem(item){
  return `<div class="shop-item ${item.checked ? "checked" : ""}">
    <input type="checkbox" ${item.checked ? "checked" : ""} data-shop-check="${item.id}" aria-label="Comprado">
    <span class="shop-title">${esc(item.title)}</span>
    <span class="shop-actions">
      <button data-shop-edit="${item.id}" type="button">Editar</button>
      <button data-shop-delete="${item.id}" type="button">Borrar</button>
    </span>
  </div>`;
}

function renderAgenda(){
  $("agenda-date").value = agendaDate.toISOString().slice(0,10);
  document.querySelectorAll("[data-agenda-mode]").forEach(b=>b.classList.toggle("active", b.dataset.agendaMode === agendaMode));
  renderAgendaFilters();
  if(agendaMode === "day") renderAgendaDay();
  else if(agendaMode === "week") renderAgendaWeek();
  else renderAgendaMonth();
  renderAgendaDayList();
}
function agendaCards(){
  return state.cards.filter(c => c.due_at && !c.done && c.status !== "deleted" && (agendaFilter === "all" || c.domain === agendaFilter)).sort(sortDue);
}
function renderAgendaFilters(){
  const filters = [["all","Todo"],["health","Salud"],["uned","UNED"],["home","Hogar"],["task","Tareas"]];
  $("agenda-filters").innerHTML = filters.map(([id,label]) => `<button class="${agendaFilter === id ? "active" : ""}" data-agenda-filter="${id}" type="button">${esc(label)}</button>`).join("");
}
function renderAgendaMonth(){
  const first = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay()+6)%7));
  const days = Array.from({length:42}, (_,i)=>addDays(start,i));
  $("agenda-grid").innerHTML = `<h2>${agendaDate.toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</h2>
    <div class="weekdays">${["L","M","X","J","V","S","D"].map(d=>`<span>${d}</span>`).join("")}</div>
    <div class="days">${days.map(dayCell).join("")}</div>`;
}
function renderAgendaWeek(){
  const start = new Date(agendaDate);
  start.setDate(agendaDate.getDate() - ((agendaDate.getDay()+6)%7));
  const days = Array.from({length:7}, (_,i)=>addDays(start,i));
  $("agenda-grid").innerHTML = `<h2>Semana de ${shortDate(start)}</h2><div class="days">${days.map(dayCell).join("")}</div>`;
}
function renderAgendaDay(){
  $("agenda-grid").innerHTML = `<h2>${agendaDate.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"})}</h2>`;
}
function dayCell(d){
  const dayItems = agendaCards().filter(c => sameDay(new Date(c.due_at), d));
  const cls = ["day"];
  if(agendaMode === "month" && d.getMonth() !== agendaDate.getMonth()) cls.push("muted");
  if(sameDay(d,new Date())) cls.push("today");
  if(sameDay(d,agendaDate)) cls.push("selected");
  return `<button class="${cls.join(" ")}" type="button" data-select-day="${d.toISOString().slice(0,10)}">
    <strong>${d.getDate()}</strong>
    <span class="dots">${dayItems.slice(0,6).map(c=>`<i class="dot ${agendaClass(c)}"></i>`).join("")}</span>
  </button>`;
}
function renderAgendaDayList(){
  const items = agendaCards().filter(c => sameDay(new Date(c.due_at), agendaDate));
  $("agenda-day-title").textContent = agendaDate.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"});
  $("agenda-day-list").innerHTML = items.length ? items.map(renderCard).join("") : `<p class="empty">No hay nada este día.</p>`;
}

function renderHealth(){
  const appointments = cards({domain:"health", kind:"appointment"});
  const documents = cards({domain:"health", kind:"document"});
  const meds = cards({domain:"health", kind:"medication"});
  const records = cards({domain:"health", kind:"health_record"});
  $("appointment-list").innerHTML = appointments.length ? appointments.map(renderCard).join("") : `<p class="empty">Añade tu próxima cita médica.</p>`;
  $("document-list").innerHTML = documents.length ? documents.map(renderCard).join("") : `<p class="empty">Aquí aparecerán volantes, informes y documentos pendientes.</p>`;
  $("medication-list").innerHTML = meds.length ? meds.map(renderCard).join("") : `<p class="empty">Añade medicación para controlar stock.</p>`;
  $("health-list").innerHTML = records.length ? records.map(renderCard).join("") : `<p class="empty">Sin registros de salud.</p>`;
}
function renderUned(){
  const all = cards({domain:"uned"});
  const exams = all.filter(c=>c.kind==="uned_exam");
  const deliveries = all.filter(c=>c.kind==="uned_delivery");
  const subjects = all.filter(c=>c.kind==="uned_subject");
  $("uned-list").innerHTML = all.filter(c=>!c.done).slice(0,8).map(renderCard).join("") || `<p class="empty">Añade asignaturas, exámenes o entregas.</p>`;
  $("uned-exam-list").innerHTML = exams.length ? exams.map(renderCard).join("") : `<p class="empty">Sin exámenes registrados.</p>`;
  $("uned-delivery-list").innerHTML = deliveries.length ? deliveries.map(renderCard).join("") : `<p class="empty">Sin entregas registradas.</p>`;
  $("uned-subject-list").innerHTML = subjects.length ? subjects.map(renderCard).join("") : `<p class="empty">Sin asignaturas registradas.</p>`;

  const next = all.filter(c=>!c.done && c.due_at).sort(sortDue)[0];
  if(next){
    $("uned-guide-title").textContent = `Próximo: ${next.title}`;
    $("uned-guide-text").textContent = next.due_at ? `Fecha: ${fmtDate(next.due_at)}. Mantén esta tarea visible hasta cerrarla.` : "Mantén esta tarea visible hasta cerrarla.";
  } else {
    $("uned-guide-title").textContent = "Tu grado, al frente.";
    $("uned-guide-text").textContent = "Registra asignaturas, exámenes, entregas, cursos y trámites de la UNED.";
  }
}
function renderHome(){
  $("bill-list").innerHTML = renderHomeKind("bill", "Sin facturas registradas.");
  $("car-list").innerHTML = renderHomeKind("car", "Sin avisos del coche.");
  $("contact-list").innerHTML = renderHomeKind("contact", "Sin contactos útiles.");
  $("wallet-list").innerHTML = renderHomeKind("wallet", "Sin tarjetas guardadas.");
}
function renderHomeKind(kind, empty){
  const arr = cards({domain:"home", kind});
  return arr.length ? arr.map(renderCard).join("") : `<p class="empty">${empty}</p>`;
}

function openDialog(html){
  $("dialog-body").innerHTML = html;
  $("dialog").showModal();
}
function closeDialog(){ $("dialog").close(); }
function form(title, body, submit="Guardar"){
  return `<h2>${esc(title)}</h2><form id="modal-form" class="form-stack">${body}<button class="primary full" type="submit">${esc(submit)}</button></form>`;
}
function dateLocal(value){
  if(!value) return "";
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,16);
}
function baseFields(card=null){
  return `<label class="field"><span>Título</span><input id="f-title" value="${esc(card?.title||"")}" required></label>
  <label class="field"><span>Notas útiles</span><textarea id="f-details" rows="3">${esc(card?.details||"")}</textarea></label>
  <label class="field"><span>Fecha si procede</span><input id="f-due" type="datetime-local" value="${esc(dateLocal(card?.due_at))}"></label>`;
}
function buildPayload(domain, kind, extra={}, visibility="private"){
  const raw = $("f-due")?.value;
  return {
    owner_id: currentUser.id,
    household_id: visibility === "household" ? householdId : null,
    visibility,
    domain,
    kind,
    title: $("f-title").value.trim(),
    details: $("f-details")?.value.trim() || null,
    due_at: raw ? new Date(raw).toISOString() : null,
    done: false,
    status: "open",
    data: extra
  };
}
async function saveCard(card, payload){
  if(!payload.title) return;
  if(card) await patch("vita_one_cards", card.id, payload);
  else await insert("vita_one_cards", payload);
  closeDialog();
  await loadAll();
}

function openCardForm(kind, card=null, preferredDate=null){
  const map = {
    task:["task","task","Pendiente","private"],
    "task-for-day":["task","task","Evento o pendiente","private"],
    appointment:["health","appointment","Cita médica","private"],
    document:["health","document","Volante o informe","private"],
    medication:["health","medication","Medicación","private"],
    health:["health","health_record","Registro de salud","private"],
    uned:["uned","uned_task","UNED","private"],
    "uned-exam":["uned","uned_exam","Examen UNED","private"],
    "uned-delivery":["uned","uned_delivery","Entrega UNED","private"],
    "uned-subject":["uned","uned_subject","Asignatura","private"],
    "home-bill":["home","bill","Factura o suministro","household"],
    "home-car":["home","car","Coche","household"],
    "home-contact":["home","contact","Contacto útil","household"],
    wallet:["home","wallet","Tarjeta wallet","private"],
    travel:["travel","travel","Viaje o vacaciones","household"],
    bureaucracy:["bureaucracy","bureaucracy","Trámite","private"]
  };
  const [domain, realKind, title, defaultVis] = map[kind] || map.task;
  const data = card?.data || {};
  let extra = "";
  if(kind === "task-for-day" && !card){
    card = { ...card, due_at: preferredDate || agendaDate };
  }
  if(realKind === "appointment"){
    extra = `<label class="field"><span>Especialidad</span><input id="f-specialty" value="${esc(data.specialty||"")}"></label>
    <label class="field"><span>Lugar / profesional</span><input id="f-location" value="${esc(data.location||"")}"></label>`;
  }
  if(realKind === "medication"){
    extra = `<div class="two">
      <label class="field"><span>Stock actual</span><input id="f-stock" type="number" min="0" value="${esc(data.stock ?? "")}"></label>
      <label class="field"><span>Aviso con</span><input id="f-threshold" type="number" min="1" value="${esc(data.threshold ?? 7)}"></label>
    </div>
    <label class="field"><span>Pauta</span><input id="f-dose" value="${esc(data.dose||"")}" placeholder="1 comprimido/día"></label>`;
  }
  if(realKind === "contact"){
    extra = `<label class="field"><span>Teléfono</span><input id="f-phone" value="${esc(data.phone||"")}"></label>
    <label class="field"><span>Entidad</span><input id="f-provider" value="${esc(data.provider||"")}"></label>`;
  }
  if(realKind === "wallet"){
    extra = `<label class="field"><span>Entidad</span><input id="f-provider" value="${esc(data.provider||"")}"></label>
    <label class="field"><span>Número / código</span><input id="f-number" value="${esc(data.number||"")}"></label>`;
  }
  if(domain === "uned"){
    extra += `<label class="field"><span>Asignatura</span><input id="f-subject" value="${esc(data.subject||"")}" placeholder="Ej. Bases del Aprendizaje"></label>`;
  }
  const visSelect = `<label class="field"><span>Visibilidad</span><select id="f-vis"><option value="private">Privado</option><option value="household">Compartido</option></select></label>`;
  openDialog(form(card ? `Editar ${title.toLowerCase()}` : `Añadir ${title.toLowerCase()}`, `${baseFields(card)}${extra}${visSelect}`));
  $("f-vis").value = card?.visibility || defaultVis;
  $("modal-form").onsubmit = async (e) => {
    e.preventDefault();
    const dataPayload = {};
    if($("f-specialty")) dataPayload.specialty = $("f-specialty").value.trim();
    if($("f-location")) dataPayload.location = $("f-location").value.trim();
    if($("f-stock")) dataPayload.stock = Number($("f-stock").value || 0);
    if($("f-threshold")) dataPayload.threshold = Number($("f-threshold").value || 7);
    if($("f-dose")) dataPayload.dose = $("f-dose").value.trim();
    if($("f-phone")) dataPayload.phone = $("f-phone").value.trim();
    if($("f-provider")) dataPayload.provider = $("f-provider").value.trim();
    if($("f-number")) dataPayload.number = $("f-number").value.trim();
    if($("f-subject")) dataPayload.subject = $("f-subject").value.trim();
    await saveCard(card?.id ? card : null, buildPayload(domain, realKind, dataPayload, $("f-vis").value));
  };
}

function openCard(id){
  const card = state.cards.find(c=>c.id===id);
  if(!card) return;
  openDialog(`<span class="mark">${labelDomain(card.domain)}</span>
    <h2>${cardIcon(card)} ${esc(card.title)}</h2>
    <p>${esc(card.details || subtitleFor(card) || "Sin notas.")}</p>
    <div class="tags">
      ${card.due_at ? `<span class="tag">${esc(fmtDate(card.due_at))}</span>` : ""}
      <span class="tag">${card.visibility === "household" ? "Compartido" : "Privado"}</span>
      ${card.done ? `<span class="tag ok">Hecho</span>` : ""}
    </div>
    <div class="dialog-actions">
      <button class="primary" data-done-card="${card.id}" type="button">${card.done ? "Reabrir" : "Marcar hecho"}</button>
      ${extraAction(card)}
      <button class="chip" data-edit-card="${card.id}" type="button">Editar</button>
      <button class="danger" data-delete-card="${card.id}" type="button">Borrar</button>
    </div>`);
}

async function toggleDone(id){
  const card = state.cards.find(c=>c.id===id);
  if(!card) return;
  await patch("vita_one_cards", id, {done: !card.done});
  await loadAll();
}
async function deleteCard(id){
  if(!confirm("¿Borrar esta tarjeta?")) return;
  await patch("vita_one_cards", id, {status:"deleted"});
  closeDialog();
  await loadAll();
}
function editCard(id){
  const card = state.cards.find(c=>c.id===id);
  if(!card) return;
  const reverse = {
    task:"task", appointment:"appointment", document:"document", medication:"medication", health_record:"health",
    uned_task:"uned", uned_exam:"uned-exam", uned_delivery:"uned-delivery", uned_subject:"uned-subject",
    bill:"home-bill", car:"home-car", contact:"home-contact", wallet:"wallet", travel:"travel", bureaucracy:"bureaucracy"
  };
  openCardForm(reverse[card.kind] || "task", card);
}
async function completeAppointment(id){
  const card = state.cards.find(c=>c.id===id);
  if(!card) return;
  const result = prompt("¿Qué ocurrió en la cita?");
  if(result === null) return;
  const gotDoc = confirm("¿Te dieron volante, informe, receta o documentación?");
  const docFor = gotDoc ? prompt("¿Para qué especialista, prueba o trámite?") : "";
  await patch("vita_one_cards", id, {done:true, details: [card.details, result].filter(Boolean).join("\\n"), data:{...(card.data||{}), result, document_given:gotDoc, document_for:docFor}});
  if(gotDoc){
    await insert("vita_one_cards", {
      owner_id: currentUser.id, household_id:null, visibility:"private", domain:"health", kind:"document",
      title: docFor ? `Documento para ${docFor}` : "Documento médico pendiente",
      details:"Pendiente de subir, guardar o llevar.",
      due_at:null, done:false, status:"open",
      data:{source_appointment:id, specialty:docFor}
    });
  }
  closeDialog();
  await loadAll();
}
async function addMedicationToShopping(id){
  const med = state.cards.find(c=>c.id===id);
  if(!med || !householdId) return;
  await insert("vita_one_shopping_items", {household_id:householdId, created_by:currentUser.id, title:med.title, category:"farmacia", checked:false});
  await loadAll();
  nav("shopping");
}

function setupShopping(){
  $("shopping-form").onsubmit = async (e) => {
    e.preventDefault();
    const lines = $("shopping-input").value.split(/\\n+/).map(x=>x.trim()).filter(Boolean);
    if(!lines.length || !householdId) return;
    const category = $("shopping-category").value;
    await insert("vita_one_shopping_items", lines.map(title => ({household_id:householdId, created_by:currentUser.id, title, category, checked:false})));
    $("shopping-input").value = "";
    await loadAll();
  };
  $("toggle-bought").onclick = () => { hideBought = !hideBought; renderShopping(); };
  $("clear-bought").onclick = async () => {
    const bought = state.shopping.filter(i=>i.checked);
    if(!bought.length || !confirm(`¿Borrar ${bought.length} producto(s) comprados?`)) return;
    await Promise.all(bought.map(i=>remove("vita_one_shopping_items", i.id)));
    await loadAll();
  };
}
async function editShopping(id){
  const item = state.shopping.find(i=>i.id===id);
  const title = prompt("Producto", item?.title || "");
  if(title !== null && title.trim()){
    await patch("vita_one_shopping_items", id, {title:title.trim()});
    await loadAll();
  }
}

async function renderPush(){
  const rows = [];
  rows.push(["Instalada en HTTPS", location.protocol === "https:" || location.hostname === "localhost"]);
  rows.push(["Permiso de avisos", ("Notification" in window) && Notification.permission === "granted"]);
  let sub = null;
  try{
    const reg = await navigator.serviceWorker.getRegistration();
    if(reg) sub = await reg.pushManager.getSubscription();
  }catch{}
  rows.push(["Avisos activados", Boolean(sub)]);
  $("push-diagnostics").innerHTML = rows.map(([label, ok]) => `<div class="diag ${ok ? "ok" : "bad"}"><span>${label}</span><strong>${ok ? "OK" : "Falta"}</strong></div>`).join("");
}
async function registerSW(){
  if(!("serviceWorker" in navigator)) throw new Error("Este navegador no soporta avisos.");
  const reg = await navigator.serviceWorker.register("./service-worker.js");
  await navigator.serviceWorker.ready;
  return reg;
}
function vapidToUint8Array(base64String){
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replaceAll("-","+").replaceAll("_","/");
  return Uint8Array.from([...atob(base64)].map(c=>c.charCodeAt(0)));
}
async function subscribePush(){
  const reg = await registerSW();
  if(!("Notification" in window)) throw new Error("Este navegador no permite avisos.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if(permission !== "granted") throw new Error("Permiso denegado.");
  let sub = await reg.pushManager.getSubscription();
  if(!sub){
    sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:vapidToUint8Array(C.PUSH.VAPID_PUBLIC_KEY)});
  }
  const json = sub.toJSON();
  await rest("vita_push_subscriptions", {
    method:"POST",
    headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify({owner_id:currentUser.id, endpoint:json.endpoint, p256dh:json.keys?.p256dh || "", auth:json.keys?.auth || "", user_agent:navigator.userAgent, enabled:true})
  });
}
async function testLocal(){
  const reg = await registerSW();
  if(Notification.permission !== "granted"){
    const p = await Notification.requestPermission();
    if(p !== "granted") throw new Error("Permiso denegado.");
  }
  await reg.showNotification("VITA", {body:"Prueba local correcta.", icon:"./assets/vita-icon-192.png", badge:"./assets/vita-icon-192.png", tag:"vita-local"});
}
async function testPush(){
  await subscribePush();
  const s = getSession();
  const res = await fetch(C.PUSH.EDGE_FUNCTION_URL, {method:"POST", headers:{apikey:C.SUPABASE_ANON_KEY, Authorization:`Bearer ${s.access_token}`, "Content-Type":"application/json"}, body:JSON.stringify({title:"VITA", body:"Prueba push real correcta.", target:"today"})});
  const data = await res.json().catch(()=>({}));
  if(!res.ok || data.ok === false) throw new Error(data.message || data.error || "No se pudo enviar aviso.");
}

function setupEvents(){
  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    status("Entrando...");
    try{
      await login(alias($("login-user").value), $("login-password").value);
      renderAccess();
      await loadAll();
      history.replaceState({screen:"today"}, "", "#today");
      status("Sesión iniciada", "success");
    }catch(err){
      status(err.message, "error");
    }
  };

  document.addEventListener("click", async (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if(navBtn){ nav(navBtn.dataset.nav); return; }

    const tab = e.target.closest("[data-tab]");
    if(tab){
      const screen = tab.closest(".screen");
      screen.querySelectorAll("[data-tab]").forEach(b=>b.classList.remove("active"));
      tab.classList.add("active");
      screen.querySelectorAll(".subpanel").forEach(p=>p.classList.remove("active"));
      $(tab.dataset.tab).classList.add("active");
      return;
    }

    const formBtn = e.target.closest("[data-open-form]");
    if(formBtn){ openCardForm(formBtn.dataset.openForm, null, agendaDate); return; }

    const openBtn = e.target.closest("[data-open-card]");
    if(openBtn){ openCard(openBtn.dataset.openCard); return; }

    const doneBtn = e.target.closest("[data-done-card]");
    if(doneBtn){ await toggleDone(doneBtn.dataset.doneCard); return; }

    const editBtn = e.target.closest("[data-edit-card]");
    if(editBtn){ editCard(editBtn.dataset.editCard); return; }

    const deleteBtn = e.target.closest("[data-delete-card]");
    if(deleteBtn){ await deleteCard(deleteBtn.dataset.deleteCard); return; }

    const completeBtn = e.target.closest("[data-complete-appointment]");
    if(completeBtn){ await completeAppointment(completeBtn.dataset.completeAppointment); return; }

    const medShop = e.target.closest("[data-add-med-shop]");
    if(medShop){ await addMedicationToShopping(medShop.dataset.addMedShop); return; }

    const stockBtn = e.target.closest("[data-stock-med]");
    if(stockBtn){
      const card = state.cards.find(c=>c.id===stockBtn.dataset.stockMed);
      const val = prompt("Stock actual", card?.data?.stock ?? 0);
      if(val !== null){ await patch("vita_one_cards", card.id, {data:{...(card.data||{}), stock:Number(val||0)}}); await loadAll(); }
      return;
    }

    const selectDay = e.target.closest("[data-select-day]");
    if(selectDay){ agendaDate = new Date(`${selectDay.dataset.selectDay}T12:00:00`); agendaMode = "day"; renderAgenda(); return; }

    const agendaModeBtn = e.target.closest("[data-agenda-mode]");
    if(agendaModeBtn){ agendaMode = agendaModeBtn.dataset.agendaMode; renderAgenda(); return; }

    const agendaFilterBtn = e.target.closest("[data-agenda-filter]");
    if(agendaFilterBtn){ agendaFilter = agendaFilterBtn.dataset.agendaFilter; renderAgenda(); return; }

    const shopEdit = e.target.closest("[data-shop-edit]");
    if(shopEdit){ await editShopping(shopEdit.dataset.shopEdit); return; }

    const shopDelete = e.target.closest("[data-shop-delete]");
    if(shopDelete && confirm("¿Borrar producto?")){ await remove("vita_one_shopping_items", shopDelete.dataset.shopDelete); await loadAll(); return; }

    if(e.target.closest("#open-account") || e.target.closest("#account-button")){ openAccount(); return; }
  });

  document.addEventListener("change", async (e) => {
    const chk = e.target.closest("[data-shop-check]");
    if(chk){ await patch("vita_one_shopping_items", chk.dataset.shopCheck, {checked:chk.checked}); await loadAll(); }
  });

  $("agenda-prev").onclick = () => { agendaDate.setMonth(agendaDate.getMonth()-1); renderAgenda(); };
  $("agenda-next").onclick = () => { agendaDate.setMonth(agendaDate.getMonth()+1); renderAgenda(); };
  $("agenda-date").onchange = () => { agendaDate = new Date(`${$("agenda-date").value}T12:00:00`); renderAgenda(); };
  $("back-button").onclick = () => history.back();
  window.onpopstate = (ev) => nav(ev.state?.screen || "today", false);
  setupShopping();
}

function openAccount(){
  openDialog(`<span class="mark">Cuenta y avisos</span>
    <div class="account-line"><img src="./assets/vita-icon.svg" alt=""><div><h2>${esc(C.USER_DISPLAY_NAMES[currentUser.email] || currentUser.email)}</h2><p>${esc(currentUser.email)}</p></div></div>
    <div class="dialog-actions">
      <button class="primary" id="dialog-enable-push" type="button">Activar avisos</button>
      <button class="chip" id="dialog-test-local" type="button">Prueba local</button>
      <button class="chip" id="dialog-test-push" type="button">Prueba real</button>
      <button class="danger" id="dialog-logout" type="button">Cerrar sesión</button>
    </div>`);
  $("dialog-enable-push").onclick = async () => { await subscribePush(); await renderPush(); };
  $("dialog-test-local").onclick = async () => { await testLocal(); };
  $("dialog-test-push").onclick = async () => { await testPush(); };
  $("dialog-logout").onclick = () => { clearSession(); location.reload(); };
}

async function boot(){
  setupEvents();
  await registerSW().catch(()=>null);
  renderAccess();
  const session = getSession();
  if(session){
    currentUser = session.user;
    await loadAll().catch(()=>{});
  }
  const hash = location.hash.replace("#", "") || "today";
  if($(`screen-${hash}`)) nav(hash, false);
  else history.replaceState({screen:"today"}, "", "#today");
}
boot();

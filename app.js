const C = window.VITA_CONFIG;
const SESSION_KEY = "vita-one-helenica-session";
let user = null;
let householdId = null;
let current = "hoy";
let agendaDate = new Date();
let hideBought = true;
let items = [];
let shopping = [];

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const alias = (v) => C.USER_ALIASES[String(v||"").trim().toLowerCase()] || String(v||"").trim().toLowerCase();
const todayStart = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmt = (v) => v ? new Date(v).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "Sin fecha";
const short = (v) => v ? new Date(v).toLocaleDateString("es-ES",{day:"2-digit",month:"short"}) : "";
const session = () => { try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); if(!s?.access_token) return null; return s; } catch { return null; } };
const saveSession = (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

function authUrl(path){ return `${C.SUPABASE_URL}/auth/v1/${path}`; }
function restUrl(path){ return `${C.SUPABASE_URL}/rest/v1/${path}`; }

async function login(email, password){
  const res = await fetch(authUrl("token?grant_type=password"), {
    method:"POST",
    headers:{apikey:C.SUPABASE_ANON_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error_description || data.msg || "No se pudo iniciar sesión.");
  saveSession(data);
  user = data.user;
}

async function rest(path, options = {}){
  const s = session();
  if(!s) throw new Error("Sesión no disponible.");
  const res = await fetch(restUrl(path), {
    ...options,
    headers:{
      apikey:C.SUPABASE_ANON_KEY,
      Authorization:`Bearer ${s.access_token}`,
      "Content-Type":"application/json",
      ...(options.headers || {})
    }
  });
  if(!res.ok){
    const data = await res.json().catch(()=>({}));
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }
  if(res.status === 204) return null;
  return res.json();
}

async function rpc(name, payload = {}){
  return rest(`rpc/${name}`, {method:"POST", body:JSON.stringify(payload)});
}
async function insert(table, payload){
  return rest(table, {method:"POST", headers:{Prefer:"return=representation"}, body:JSON.stringify(payload)});
}
async function patch(table, id, payload){
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`, {method:"PATCH", headers:{Prefer:"return=minimal"}, body:JSON.stringify(payload)});
}
async function del(table, id){
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`, {method:"DELETE", headers:{Prefer:"return=minimal"}});
}

function showLoginMessage(msg, kind=""){
  const node = $("login-message");
  node.textContent = msg;
  node.className = `soft-note ${kind}`;
}

function renderAccess(){
  const s = session();
  user = s?.user || null;
  $("login").classList.toggle("hidden", Boolean(user));
  $("app").classList.toggle("hidden", !user);
}

async function bootstrap(){
  const data = await rpc("vita_bootstrap_user");
  householdId = data?.[0]?.household_id || data?.household_id || null;
}

async function loadAll(){
  await bootstrap();
  items = await rest("vita_one_items?select=*&status=neq.deleted&order=done.asc,due_at.asc.nullslast,created_at.desc").catch(()=>[]);
  shopping = await rest("vita_one_shopping_items?select=*&order=checked.asc,created_at.desc").catch(()=>[]);
  await seedEssentials();
  renderAll();
}

async function seedEssentials(){
  const hasMed = items.some(x => x.area === "salud" && x.kind === "medication");
  const hasWallet = items.some(x => x.area === "hogar" && x.kind === "wallet");
  if(!hasMed){
    await insert("vita_one_items", [
      baseItem("salud","medication","Eutirox 112 microgramos","1 comprimido/día en ayunas",null,"private",{stock:37,threshold:7,dose:"1 comprimido/día en ayunas"}),
      baseItem("salud","medication","Bilasten 20 mg","1 comprimido/día en ayunas",null,"private",{stock:11,threshold:7,dose:"1 comprimido/día en ayunas"})
    ]);
  }
  if(!hasWallet){
    await insert("vita_one_items", [
      baseItem("hogar","wallet","Eroski Club","Tarjeta útil para compra.",null,"private",{provider:"Eroski"}),
      baseItem("hogar","wallet","IKEA Family","Tarjeta útil para el hogar.",null,"private",{provider:"IKEA"})
    ]);
  }
  if(!hasMed || !hasWallet){
    items = await rest("vita_one_items?select=*&status=neq.deleted&order=done.asc,due_at.asc.nullslast,created_at.desc").catch(()=>[]);
  }
}

function baseItem(area, kind, title, notes="", due=null, visibility="private", data={}){
  return {
    owner_id:user.id,
    household_id: visibility === "household" ? householdId : null,
    visibility,
    area,
    kind,
    title,
    notes,
    due_at: due,
    done:false,
    status:"open",
    data
  };
}

function navigate(screen, push=true){
  current = screen;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(`screen-${screen}`).classList.add("active");
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active", b.dataset.nav === screen));
  const titles = {
    hoy:["Hoy","Lo que merece tu atención."],
    compra:["Compra","Una lista compartida, sin fricción."],
    salud:["Salud","Citas, volantes, medicación y registros."],
    uned:["UNED","El grado al frente."],
    hogar:["Hogar","Dinero, coche, contactos y wallet."],
    agenda:["Agenda","La semana visible."]
  };
  $("screen-title").textContent = titles[screen]?.[0] || "VITA";
  $("screen-subtitle").textContent = titles[screen]?.[1] || "";
  $("back").classList.toggle("hidden", screen === "hoy");
  if(push) history.pushState({screen}, "", `#${screen}`);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderAll(){
  renderToday();
  renderShopping();
  renderHealth();
  renderUned();
  renderHome();
  renderAgenda();
}

function by(area, kind=null){
  return items.filter(i => i.area === area && (!kind || i.kind === kind) && i.status !== "deleted");
}
function activeItems(){
  return items.filter(i => !i.done && i.status !== "deleted");
}
function sortDue(a,b){
  const ad = a.due_at ? new Date(a.due_at).getTime() : 9999999999999;
  const bd = b.due_at ? new Date(b.due_at).getTime() : 9999999999999;
  return ad - bd;
}
function itemGlyph(item){
  const map = {
    task:"✓", appointment:"⚕", document:"◇", medication:"✚", health:"♡",
    uned:"Γ", uned_exam:"✎", uned_delivery:"◈", uned_subject:"▦",
    bill:"€", car:"⚙", contact:"☎", wallet:"V", travel:"✈", bureaucracy:"§"
  };
  return map[item.kind] || "•";
}
function areaLabel(area){
  return {salud:"Salud", uned:"UNED", hogar:"Hogar", tarea:"Tarea", viaje:"Viaje", burocracia:"Trámite"}[area] || area;
}
function renderCard(item){
  const overdue = item.due_at && new Date(item.due_at) < new Date() && !item.done;
  return `<article class="card ${item.done ? "done" : ""}">
    <div class="card-main">
      <span class="glyph">${itemGlyph(item)}</span>
      <button class="open-card" type="button" data-open-item="${item.id}">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.notes || subtitle(item) || "")}</p>
      </button>
      ${item.due_at ? `<span class="tag ${overdue ? "danger" : ""}">${esc(short(item.due_at))}</span>` : `<span class="tag">${esc(areaLabel(item.area))}</span>`}
    </div>
    <div class="tags">
      <span class="tag">${esc(areaLabel(item.area))}</span>
      ${item.due_at ? `<span class="tag">${esc(fmt(item.due_at))}</span>` : ""}
      ${item.visibility === "household" ? `<span class="tag">Compartido</span>` : `<span class="tag">Privado</span>`}
      ${lowMedication(item) ? `<span class="tag danger">Comprar</span>` : ""}
      ${item.done ? `<span class="tag ok">Hecho</span>` : ""}
    </div>
    <div class="actions">
      <button type="button" data-done-item="${item.id}">${item.done ? "Reabrir" : "Hecho"}</button>
      ${item.kind === "appointment" && !item.done ? `<button type="button" data-close-appointment="${item.id}">Cerrar cita</button>` : ""}
      ${item.kind === "medication" ? `<button type="button" data-med-shop="${item.id}">A farmacia</button><button type="button" data-med-stock="${item.id}">Stock</button>` : ""}
      <button type="button" data-edit-item="${item.id}">Editar</button>
      <button class="danger" type="button" data-delete-item="${item.id}">Borrar</button>
    </div>
  </article>`;
}
function subtitle(item){
  if(item.kind === "medication") return `${item.data?.stock ?? 0} unidades · aviso con ${item.data?.threshold ?? 7}`;
  if(item.kind === "appointment") return [item.data?.specialty,item.data?.location].filter(Boolean).join(" · ");
  if(item.kind === "contact") return [item.data?.phone,item.data?.provider].filter(Boolean).join(" · ");
  if(item.kind === "wallet") return [item.data?.provider,item.data?.number ? "con número" : ""].filter(Boolean).join(" · ");
  return "";
}
function lowMedication(item){
  return item.kind === "medication" && Number(item.data?.stock || 0) <= Number(item.data?.threshold || 7);
}

function renderToday(){
  const tomorrow = addDays(todayStart(), 1);
  const weekEnd = addDays(todayStart(), 8);
  const active = activeItems().sort(sortDue);
  const today = active.filter(i => i.due_at && new Date(i.due_at) < tomorrow);
  const week = active.filter(i => i.due_at && new Date(i.due_at) >= tomorrow && new Date(i.due_at) < weekEnd);
  const meds = by("salud","medication").filter(lowMedication);
  const docs = by("salud","document").filter(i=>!i.done);
  const uned = active.filter(i => i.area === "uned").slice(0,2);

  $("today-count").textContent = today.length + meds.length + docs.slice(0,2).length;
  $("week-count").textContent = week.length;

  if(today.length){
    $("oracle-title").textContent = `${today.length} cosa(s) piden atención hoy`;
    $("oracle-text").textContent = "Empieza por la primera. Marca lo hecho para despejar la mente.";
  } else if(meds.length){
    $("oracle-title").textContent = `Revisa medicación: ${meds[0].title}`;
    $("oracle-text").textContent = "El stock está bajo. Puedes mandarla a farmacia con un toque.";
  } else if(uned.length){
    $("oracle-title").textContent = `UNED: ${uned[0].title}`;
    $("oracle-text").textContent = "Tu grado permanece visible para no convertirse en ruido de fondo.";
  } else {
    $("oracle-title").textContent = "Hoy respira";
    $("oracle-text").textContent = "Nada urgente. Puedes capturar una idea, preparar UNED o dejar la compra lista.";
  }

  const list = [...today, ...meds, ...docs.slice(0,2)];
  $("today-list").innerHTML = list.length ? list.map(renderCard).join("") : `<p class="empty">Nada urgente ahora.</p>`;
  $("week-list").innerHTML = week.length ? week.slice(0,8).map(renderCard).join("") : `<p class="empty">Sin fechas próximas.</p>`;
}

function renderShopping(){
  const visible = hideBought ? shopping.filter(s=>!s.checked) : shopping;
  $("shopping-count").textContent = shopping.filter(s=>!s.checked).length;
  $("toggle-bought").textContent = hideBought ? "Mostrar comprados" : "Ocultar comprados";
  $("toggle-bought").classList.toggle("active", hideBought);
  const meds = by("salud","medication").filter(lowMedication);
  const wallet = by("hogar","wallet");
  $("shopping-hints").innerHTML = [
    ...meds.slice(0,2).map(m => `<button type="button" class="hint" data-med-shop="${m.id}">✚ Añadir ${esc(m.title)}</button>`),
    ...wallet.slice(0,2).map(w => `<span class="hint">V ${esc(w.title)}</span>`)
  ].join("") || `<span class="hint">Lista compartida</span>`;

  if(!visible.length){
    $("shopping-list").innerHTML = `<p class="empty">Lista vacía. Escribe productos arriba, uno por línea.</p>`;
    return;
  }
  const cats = ["farmacia","supermercado","hogar","otros"];
  $("shopping-list").innerHTML = cats.map(cat => {
    const arr = visible.filter(i => (i.category || "otros") === cat);
    if(!arr.length) return "";
    return `<section class="shopping-category"><div class="category-title"><span>${catLabel(cat)}</span><span class="seal">${arr.filter(i=>!i.checked).length}</span></div>${arr.map(renderShopItem).join("")}</section>`;
  }).join("");
}
function catLabel(cat){ return {farmacia:"Farmacia",supermercado:"Supermercado",hogar:"Hogar",otros:"Otros"}[cat] || cat; }
function renderShopItem(item){
  return `<div class="shop-item ${item.checked ? "checked" : ""}">
    <input type="checkbox" ${item.checked ? "checked" : ""} data-shop-check="${item.id}" aria-label="Comprado">
    <span class="shop-title">${esc(item.title)}</span>
    <span class="shop-actions"><button type="button" data-shop-edit="${item.id}">Editar</button><button type="button" data-shop-delete="${item.id}">Borrar</button></span>
  </div>`;
}

function renderHealth(){
  $("appointment-list").innerHTML = by("salud","appointment").length ? by("salud","appointment").map(renderCard).join("") : `<p class="empty">Añade una cita y VITA la convertirá en ciclo: preparar, ir, cerrar y guardar documentos.</p>`;
  $("document-list").innerHTML = by("salud","document").length ? by("salud","document").map(renderCard).join("") : `<p class="empty">Aquí vivirán volantes, informes y documentos que hay que llevar.</p>`;
  $("medication-list").innerHTML = by("salud","medication").length ? by("salud","medication").map(renderCard).join("") : `<p class="empty">Añade medicación para controlar stock y compra.</p>`;
  $("health-list").innerHTML = by("salud","health").length ? by("salud","health").map(renderCard).join("") : `<p class="empty">Registra sueño, síntomas, dolor, regla, baño o ánimo cuando tenga sentido.</p>`;
}
function renderUned(){
  const all = by("uned");
  const exams = all.filter(i=>i.kind==="uned_exam");
  const deliveries = all.filter(i=>i.kind==="uned_delivery");
  const subjects = all.filter(i=>i.kind==="uned_subject");
  $("uned-list").innerHTML = all.filter(i=>!i.done).slice(0,8).map(renderCard).join("") || `<p class="empty">Añade asignaturas, exámenes, entregas, simulacros o trámites UNED.</p>`;
  $("uned-exam-list").innerHTML = exams.length ? exams.map(renderCard).join("") : `<p class="empty">Sin exámenes registrados.</p>`;
  $("uned-delivery-list").innerHTML = deliveries.length ? deliveries.map(renderCard).join("") : `<p class="empty">Sin entregas registradas.</p>`;
  $("uned-subject-list").innerHTML = subjects.length ? subjects.map(renderCard).join("") : `<p class="empty">Sin asignaturas registradas.</p>`;
  const next = all.filter(i=>!i.done && i.due_at).sort(sortDue)[0];
  $("uned-title").textContent = next ? `Próximo: ${next.title}` : "El grado al frente.";
  $("uned-text").textContent = next ? `Fecha: ${fmt(next.due_at)}. Mantén visible el siguiente paso.` : "Asignaturas, exámenes, entregas y próximos pasos.";
}
function renderHome(){
  $("bill-list").innerHTML = by("hogar","bill").length ? by("hogar","bill").map(renderCard).join("") : `<p class="empty">Registra hipoteca, luz, agua, internet, renta o cargos importantes.</p>`;
  $("car-list").innerHTML = by("hogar","car").length ? by("hogar","car").map(renderCard).join("") : `<p class="empty">Seguro, ITV, taller, gasolina y revisiones.</p>`;
  $("contact-list").innerHTML = by("hogar","contact").length ? by("hogar","contact").map(renderCard).join("") : `<p class="empty">Teléfonos útiles: gestoría, seguro, banco, taller, farmacia.</p>`;
  $("wallet-list").innerHTML = by("hogar","wallet").length ? by("hogar","wallet").map(renderCard).join("") : `<p class="empty">Tarjetas útiles para compra y hogar.</p>`;
}
function renderAgenda(){
  $("agenda-date").value = agendaDate.toISOString().slice(0,10);
  const first = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), 1);
  const start = new Date(first); start.setDate(first.getDate() - ((first.getDay()+6)%7));
  const days = Array.from({length:42}, (_,i)=>addDays(start,i));
  const events = activeItems().filter(i=>i.due_at).sort(sortDue);
  $("agenda-grid").innerHTML = `<h2>${agendaDate.toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</h2><div class="weekdays">${["L","M","X","J","V","S","D"].map(d=>`<span>${d}</span>`).join("")}</div><div class="days">${days.map(d => {
    const dayItems = events.filter(e => sameDay(new Date(e.due_at), d));
    const cls = ["day"]; if(d.getMonth() !== agendaDate.getMonth()) cls.push("muted"); if(sameDay(d,new Date())) cls.push("today"); if(sameDay(d,agendaDate)) cls.push("selected");
    return `<button type="button" class="${cls.join(" ")}" data-select-day="${d.toISOString().slice(0,10)}"><strong>${d.getDate()}</strong><span class="dots">${dayItems.slice(0,6).map(x=>`<i class="dot ${x.area}"></i>`).join("")}</span></button>`;
  }).join("")}</div>`;
  const selected = events.filter(i => sameDay(new Date(i.due_at), agendaDate));
  $("agenda-day-title").textContent = agendaDate.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"});
  $("agenda-day-list").innerHTML = selected.length ? selected.map(renderCard).join("") : `<p class="empty">Nada este día.</p>`;
}

function openDialog(html){ $("dialog-body").innerHTML = html; $("dialog").showModal(); }
function closeDialog(){ $("dialog").close(); }
function form(title, body, submit="Guardar"){
  return `<h2>${esc(title)}</h2><form id="modal-form" class="form-stack">${body}<button class="primary full" type="submit">${esc(submit)}</button></form>`;
}
function dateLocal(v){ if(!v) return ""; const d = new Date(v); const l = new Date(d.getTime()-d.getTimezoneOffset()*60000); return l.toISOString().slice(0,16); }
function baseFields(item=null){
  return `<label class="field"><span>Título</span><input id="f-title" value="${esc(item?.title||"")}" required></label>
  <label class="field"><span>Notas útiles</span><textarea id="f-notes" rows="3">${esc(item?.notes||"")}</textarea></label>
  <label class="field"><span>Fecha si procede</span><input id="f-due" type="datetime-local" value="${esc(dateLocal(item?.due_at))}"></label>`;
}
function kindMeta(kind){
  const map = {
    task:["tarea","task","Pendiente","private"],
    "task-day":["tarea","task","Pendiente","private"],
    appointment:["salud","appointment","Cita médica","private"],
    document:["salud","document","Volante o informe","private"],
    medication:["salud","medication","Medicación","private"],
    health:["salud","health","Registro de salud","private"],
    uned:["uned","uned","UNED","private"],
    "uned-exam":["uned","uned_exam","Examen UNED","private"],
    "uned-delivery":["uned","uned_delivery","Entrega UNED","private"],
    "uned-subject":["uned","uned_subject","Asignatura","private"],
    bill:["hogar","bill","Dinero o suministro","household"],
    car:["hogar","car","Coche","household"],
    contact:["hogar","contact","Contacto útil","household"],
    wallet:["hogar","wallet","Tarjeta wallet","private"],
    travel:["viaje","travel","Viaje","household"],
    bureaucracy:["burocracia","bureaucracy","Trámite","private"]
  };
  return map[kind] || map.task;
}
function openForm(kind, item=null){
  if(kind === "capture") return openCapture();
  const [area, realKind, title, visDefault] = kindMeta(kind);
  const data = item?.data || {};
  let extra = "";
  if(kind === "task-day" && !item) item = {due_at: agendaDate};
  if(realKind === "appointment") extra += `<label class="field"><span>Especialidad</span><input id="f-specialty" value="${esc(data.specialty||"")}"></label><label class="field"><span>Lugar / profesional</span><input id="f-location" value="${esc(data.location||"")}"></label>`;
  if(realKind === "medication") extra += `<div class="split"><label class="field"><span>Stock</span><input id="f-stock" type="number" min="0" value="${esc(data.stock ?? "")}"></label><label class="field"><span>Aviso con</span><input id="f-threshold" type="number" min="1" value="${esc(data.threshold ?? 7)}"></label></div><label class="field"><span>Pauta</span><input id="f-dose" value="${esc(data.dose||"")}"></label>`;
  if(realKind === "contact") extra += `<label class="field"><span>Teléfono</span><input id="f-phone" value="${esc(data.phone||"")}"></label><label class="field"><span>Entidad</span><input id="f-provider" value="${esc(data.provider||"")}"></label>`;
  if(realKind === "wallet") extra += `<label class="field"><span>Entidad</span><input id="f-provider" value="${esc(data.provider||"")}"></label><label class="field"><span>Número o código</span><input id="f-number" value="${esc(data.number||"")}"></label>`;
  if(area === "uned") extra += `<label class="field"><span>Asignatura</span><input id="f-subject" value="${esc(data.subject||"")}"></label>`;
  extra += `<label class="field"><span>Visibilidad</span><select id="f-vis"><option value="private">Privado</option><option value="household">Compartido</option></select></label>`;
  openDialog(form(item?.id ? `Editar ${title.toLowerCase()}` : `Añadir ${title.toLowerCase()}`, `${baseFields(item)}${extra}`));
  $("f-vis").value = item?.visibility || visDefault;
  $("modal-form").onsubmit = async (e) => {
    e.preventDefault();
    const raw = $("f-due").value;
    const vis = $("f-vis").value;
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
    const payload = {
      owner_id:user.id, household_id:vis === "household" ? householdId : null, visibility:vis, area, kind:realKind,
      title:$("f-title").value.trim(), notes:$("f-notes").value.trim() || null, due_at:raw ? new Date(raw).toISOString() : null,
      done:false, status:"open", data:dataPayload
    };
    if(item?.id) await patch("vita_one_items", item.id, payload); else await insert("vita_one_items", payload);
    closeDialog(); await loadAll();
  };
}
function openCapture(){
  openDialog(form("Anotar algo", `<label class="field"><span>Escribe sin pensar</span><textarea id="f-capture" rows="5" placeholder="Endocrino el martes a las 12&#10;Comprar Bilasten&#10;Examen de Bases en septiembre"></textarea></label>`, "Interpretar"));
  $("modal-form").onsubmit = async (e) => {
    e.preventDefault();
    const lines = $("f-capture").value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    for(const line of lines) await saveCapturedLine(line);
    closeDialog(); await loadAll();
  };
}
async function saveCapturedLine(line){
  const lower = line.toLowerCase();
  if(lower.includes("comprar") || lower.includes("farmacia")){
    await insert("vita_one_shopping_items", {household_id:householdId, created_by:user.id, title:line.replace(/^comprar\s+/i,""), category: lower.includes("bilasten") || lower.includes("eutirox") || lower.includes("farmacia") ? "farmacia" : "supermercado", checked:false});
    return;
  }
  if(lower.includes("uned") || lower.includes("examen") || lower.includes("pec") || lower.includes("tfg") || lower.includes("asignatura")){
    await insert("vita_one_items", baseItem("uned", lower.includes("examen") ? "uned_exam" : "uned", line, "", null, "private", {}));
    return;
  }
  if(lower.includes("cita") || lower.includes("médic") || lower.includes("medic") || lower.includes("endocr") || lower.includes("volante")){
    await insert("vita_one_items", baseItem("salud", lower.includes("volante") ? "document" : "appointment", line, "", null, "private", {}));
    return;
  }
  if(lower.includes("itv") || lower.includes("coche") || lower.includes("seguro")){
    await insert("vita_one_items", baseItem("hogar", "car", line, "", null, "household", {}));
    return;
  }
  if(lower.includes("luz") || lower.includes("agua") || lower.includes("internet") || lower.includes("factura") || lower.includes("renta") || lower.includes("hipoteca")){
    await insert("vita_one_items", baseItem("hogar", "bill", line, "", null, "household", {}));
    return;
  }
  await insert("vita_one_items", baseItem("tarea", "task", line, "", null, "private", {}));
}

async function toggleDone(id){
  const item = items.find(x=>x.id===id);
  if(!item) return;
  await patch("vita_one_items", id, {done:!item.done});
  await loadAll();
}
async function deleteItem(id){
  if(!confirm("¿Borrar?")) return;
  await patch("vita_one_items", id, {status:"deleted"});
  closeDialog(); await loadAll();
}
function editItem(id){
  const item = items.find(x=>x.id===id);
  if(!item) return;
  const reverse = {
    task:"task", appointment:"appointment", document:"document", medication:"medication", health:"health",
    uned:"uned", uned_exam:"uned-exam", uned_delivery:"uned-delivery", uned_subject:"uned-subject",
    bill:"bill", car:"car", contact:"contact", wallet:"wallet", travel:"travel", bureaucracy:"bureaucracy"
  };
  openForm(reverse[item.kind] || "task", item);
}
function openItem(id){
  const item = items.find(x=>x.id===id);
  if(!item) return;
  openDialog(`<span class="overline">${esc(areaLabel(item.area))}</span><h2>${esc(item.title)}</h2><p>${esc(item.notes || subtitle(item) || "Sin notas.")}</p><div class="tags">${item.due_at ? `<span class="tag">${esc(fmt(item.due_at))}</span>` : ""}<span class="tag">${item.visibility === "household" ? "Compartido" : "Privado"}</span></div><div class="dialog-actions"><button class="primary" data-done-item="${item.id}">${item.done ? "Reabrir" : "Hecho"}</button>${item.kind === "appointment" && !item.done ? `<button class="chip" data-close-appointment="${item.id}">Cerrar cita</button>` : ""}${item.kind === "medication" ? `<button class="chip" data-med-shop="${item.id}">A farmacia</button>` : ""}<button class="chip" data-edit-item="${item.id}">Editar</button><button class="danger" data-delete-item="${item.id}">Borrar</button></div>`);
}
async function closeAppointment(id){
  const item = items.find(x=>x.id===id);
  const result = prompt("¿Qué ocurrió en la cita?");
  if(result === null) return;
  const gotDoc = confirm("¿Te dieron volante, informe, receta o documentación?");
  const docFor = gotDoc ? prompt("¿Para qué especialista, prueba o trámite?") : "";
  await patch("vita_one_items", id, {done:true, notes:[item.notes,result].filter(Boolean).join("\n"), data:{...(item.data||{}), result, document_given:gotDoc, document_for:docFor}});
  if(gotDoc){
    await insert("vita_one_items", baseItem("salud","document", docFor ? `Documento para ${docFor}` : "Documento médico pendiente", "Pendiente de guardar o llevar.", null, "private", {source_appointment:id, document_for:docFor}));
  }
  closeDialog(); await loadAll();
}
async function addMedToShopping(id){
  const item = items.find(x=>x.id===id);
  if(!item || !householdId) return;
  await insert("vita_one_shopping_items", {household_id:householdId, created_by:user.id, title:item.title, category:"farmacia", checked:false});
  await loadAll(); navigate("compra");
}
async function updateMedStock(id){
  const item = items.find(x=>x.id===id);
  const val = prompt("Stock actual", item?.data?.stock ?? 0);
  if(val !== null){
    await patch("vita_one_items", id, {data:{...(item.data||{}), stock:Number(val || 0)}});
    await loadAll();
  }
}

function setupEvents(){
  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    showLoginMessage("Entrando...");
    try{
      await login(alias($("login-user").value), $("login-password").value);
      renderAccess();
      await loadAll();
      history.replaceState({screen:"hoy"},"","#hoy");
      showLoginMessage("Sesión iniciada");
    }catch(err){ showLoginMessage(err.message, "error"); }
  };

  document.addEventListener("click", async (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if(navBtn){ navigate(navBtn.dataset.nav); return; }

    const tab = e.target.closest("[data-tab]");
    if(tab){
      const screen = tab.closest(".screen");
      screen.querySelectorAll("[data-tab]").forEach(b=>b.classList.remove("active"));
      tab.classList.add("active");
      screen.querySelectorAll(".subpanel").forEach(p=>p.classList.remove("active"));
      $(tab.dataset.tab).classList.add("active");
      return;
    }

    const formBtn = e.target.closest("[data-form]");
    if(formBtn){ openForm(formBtn.dataset.form); return; }

    const openBtn = e.target.closest("[data-open-item]");
    if(openBtn){ openItem(openBtn.dataset.openItem); return; }

    const doneBtn = e.target.closest("[data-done-item]");
    if(doneBtn){ await toggleDone(doneBtn.dataset.doneItem); return; }

    const editBtn = e.target.closest("[data-edit-item]");
    if(editBtn){ editItem(editBtn.dataset.editItem); return; }

    const deleteBtn = e.target.closest("[data-delete-item]");
    if(deleteBtn){ await deleteItem(deleteBtn.dataset.deleteItem); return; }

    const closeBtn = e.target.closest("[data-close-appointment]");
    if(closeBtn){ await closeAppointment(closeBtn.dataset.closeAppointment); return; }

    const medShop = e.target.closest("[data-med-shop]");
    if(medShop){ await addMedToShopping(medShop.dataset.medShop); return; }

    const medStock = e.target.closest("[data-med-stock]");
    if(medStock){ await updateMedStock(medStock.dataset.medStock); return; }

    const shopEdit = e.target.closest("[data-shop-edit]");
    if(shopEdit){
      const item = shopping.find(x=>x.id===shopEdit.dataset.shopEdit);
      const val = prompt("Producto", item?.title || "");
      if(val !== null && val.trim()){ await patch("vita_one_shopping_items", item.id, {title:val.trim()}); await loadAll(); }
      return;
    }

    const shopDelete = e.target.closest("[data-shop-delete]");
    if(shopDelete && confirm("¿Borrar producto?")){ await del("vita_one_shopping_items", shopDelete.dataset.shopDelete); await loadAll(); return; }

    const day = e.target.closest("[data-select-day]");
    if(day){ agendaDate = new Date(`${day.dataset.selectDay}T12:00:00`); renderAgenda(); return; }

    if(e.target.closest("#account")) openAccount();
  });

  document.addEventListener("change", async (e) => {
    const chk = e.target.closest("[data-shop-check]");
    if(chk){ await patch("vita_one_shopping_items", chk.dataset.shopCheck, {checked:chk.checked}); await loadAll(); }
  });

  $("shopping-form").onsubmit = async (e) => {
    e.preventDefault();
    const lines = $("shopping-input").value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    if(!lines.length) return;
    const category = $("shopping-category").value;
    await insert("vita_one_shopping_items", lines.map(title => ({household_id:householdId, created_by:user.id, title, category, checked:false})));
    $("shopping-input").value = "";
    await loadAll();
  };

  $("toggle-bought").onclick = () => { hideBought = !hideBought; renderShopping(); };
  $("clear-bought").onclick = async () => {
    const bought = shopping.filter(x=>x.checked);
    if(!bought.length || !confirm(`¿Borrar ${bought.length} producto(s) comprados?`)) return;
    await Promise.all(bought.map(x=>del("vita_one_shopping_items", x.id)));
    await loadAll();
  };
  $("agenda-prev").onclick = () => { agendaDate.setMonth(agendaDate.getMonth() - 1); renderAgenda(); };
  $("agenda-next").onclick = () => { agendaDate.setMonth(agendaDate.getMonth() + 1); renderAgenda(); };
  $("agenda-date").onchange = () => { agendaDate = new Date(`${$("agenda-date").value}T12:00:00`); renderAgenda(); };
  $("back").onclick = () => history.back();
  window.onpopstate = (ev) => navigate(ev.state?.screen || "hoy", false);
}

function openAccount(){
  openDialog(`<span class="overline">Cuenta</span><h2>${esc(C.USER_DISPLAY_NAMES[user.email] || user.email)}</h2><p>${esc(user.email)}</p><div class="dialog-actions"><button class="danger" id="logout" type="button">Cerrar sesión</button></div>`);
  $("logout").onclick = () => { clearSession(); location.reload(); };
}

async function boot(){
  setupEvents();
  renderAccess();
  const s = session();
  if(s){
    user = s.user;
    await loadAll().catch(()=>{});
  }
  const hash = location.hash.replace("#","");
  if(hash && $(`screen-${hash}`)) navigate(hash, false);
  else history.replaceState({screen:"hoy"},"","#hoy");
}
boot();

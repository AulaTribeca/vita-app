const CONFIG = window.VITA_CONFIG;
const SESSION_KEY = "vita-session-v5";
const MODULES = [
  { id: "tasks", label: "Tareas", emoji: "✅", subtitle: "Pendientes, recados y acciones", visibility: "private" },
  { id: "health", label: "Salud", emoji: "💗", subtitle: "Registros rápidos y síntomas", visibility: "private" },
  { id: "medical", label: "Citas médicas", emoji: "🏥", subtitle: "Citas, resumen y volantes", visibility: "private" },
  { id: "medication", label: "Medicación", emoji: "💊", subtitle: "Stock y avisos de compra", visibility: "private" },
  { id: "home", label: "Hogar", emoji: "🏡", subtitle: "Casa, piso, coche y facturas", visibility: "household" },
  { id: "shopping", label: "Compra", emoji: "🛒", subtitle: "Lista compartida", visibility: "household" },
  { id: "private_list", label: "Lista privada", emoji: "📝", subtitle: "Cosas solo tuyas", visibility: "private" },
  { id: "wishlist", label: "Deseos", emoji: "🎁", subtitle: "Regalos y enlaces", visibility: "private" },
  { id: "wallet", label: "Wallet", emoji: "💳", subtitle: "Tarjetas de súper y socios", visibility: "private" },
  { id: "contacts", label: "Contactos", emoji: "☎️", subtitle: "Teléfonos útiles", visibility: "household" },
  { id: "travel", label: "Viajes", emoji: "✈️", subtitle: "Vacaciones, vuelos y estancias", visibility: "household" }
];

const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));

let currentUser = null;
let currentHousehold = null;
let currentModuleId = null;
let deferredPrompt = null;
let calendarCursor = new Date();
let calendarView = "month";
let cards = [];
let pushSubscription = null;

function $(id) { return document.getElementById(id); }
function cfg() { return CONFIG; }
function nowIso() { return new Date().toISOString(); }
function todayStart() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function normalizeEmail(value) {
  const raw = String(value || "").trim().toLowerCase();
  return cfg().USER_ALIASES?.[raw] || raw;
}
function displayName(email) {
  return cfg().USER_DISPLAY_NAMES?.[email] || email || "Usuario";
}
function status(message, type = "neutral") {
  const node = $("global-status");
  if (!node) return;
  node.textContent = message;
  node.className = `global-status ${type}`;
}
function loginStatus(message, type = "neutral") {
  const node = $("login-msg");
  node.textContent = message;
  node.className = `status-line ${type}`;
}
function dateLabel(value, mode = "long") {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  const opts = mode === "short"
    ? { day: "2-digit", month: "short" }
    : { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };
  return date.toLocaleDateString("es-ES", opts);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function moduleLabel(moduleId) {
  return MODULE_BY_ID[moduleId]?.label || moduleId || "VITA";
}
function moduleEmoji(moduleId) {
  return MODULE_BY_ID[moduleId]?.emoji || "●";
}
function saveSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s?.access_token || !s?.user) return null;
    if (s.expires_at && Number(s.expires_at) * 1000 < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function authUrl(path) { return `${cfg().SUPABASE_URL}/auth/v1/${path}`; }
function restUrl(path) { return `${cfg().SUPABASE_URL}/rest/v1/${path}`; }

async function login(email, password) {
  const res = await fetch(authUrl("token?grant_type=password"), {
    method: "POST",
    headers: { apikey: cfg().SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.msg || "No se pudo iniciar sesión.");
  saveSession(data);
  currentUser = data.user;
}

async function rest(path, options = {}) {
  const session = getSession();
  if (!session) throw new Error("Sesión no disponible.");
  const res = await fetch(restUrl(path), {
    ...options,
    headers: {
      apikey: cfg().SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearSession();
      renderAccess();
    }
    throw new Error(data.message || data.error || `Error Supabase ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function insertCard(payload) {
  return rest("vita_cards", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
}
async function updateCard(id, payload) {
  return rest(`vita_cards?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload)
  });
}
async function deleteCard(id) {
  return rest(`vita_cards?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

async function loadHousehold() {
  currentHousehold = null;
  try {
    const memberships = await rest(`household_members?select=household_id,status&user_id=eq.${currentUser.id}&status=eq.active&limit=1`);
    currentHousehold = memberships?.[0]?.household_id || null;
  } catch {
    currentHousehold = null;
  }
}

async function loadCards() {
  await loadHousehold();
  const data = await rest("vita_cards?select=*&order=due_at.asc.nullslast,created_at.desc");
  cards = data || [];
  renderAll();
  status("VITA lista.", "success");
}

function renderAccess() {
  const session = getSession();
  currentUser = session?.user || null;
  $("login-screen").classList.toggle("hidden", Boolean(currentUser));
  $("app").classList.toggle("hidden", !currentUser);
  if (currentUser) {
    $("account-name").textContent = displayName(currentUser.email);
    $("account-email").textContent = currentUser.email;
  }
}

function renderAll() {
  renderModuleGrids();
  renderHome();
  renderCalendar();
  renderNotifications();
  updatePushSummary();
}

function setScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(`screen-${name}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.nav === name));
  const titles = {
    home: ["Hoy", "Lo urgente, lo próximo y lo que necesita acción."],
    modules: ["Módulos", "Cada tarjeta abre su espacio, sin mezclarlo todo."],
    calendar: ["Calendario", "Toca un día para ver o añadir eventos."],
    notifications: ["Avisos", "Permisos, push real y recordatorios programados."],
    account: ["Cuenta", "Instalación, sesión y ajustes."]
  };
  const t = titles[name] || ["VITA", ""];
  $("screen-title").textContent = t[0];
  $("screen-subtitle").textContent = t[1];
  location.hash = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openModule(moduleId) {
  currentModuleId = moduleId;
  const m = MODULE_BY_ID[moduleId];
  $("module-detail-badge").textContent = m.label;
  $("module-detail-title").textContent = `${m.emoji} ${m.label}`;
  $("module-detail-subtitle").textContent = m.subtitle;
  renderModuleItems();
  setScreen("module-detail");
}

function cardsForModule(moduleId) {
  return cards
    .filter((card) => card.module === moduleId && card.status !== "deleted")
    .sort((a,b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      const ad = a.due_at ? new Date(a.due_at).getTime() : 9999999999999;
      const bd = b.due_at ? new Date(b.due_at).getTime() : 9999999999999;
      return ad - bd;
    });
}

function renderModuleGrids() {
  const render = () => MODULES.map((m) => {
    const count = cardsForModule(m.id).filter((c) => c.status !== "done").length;
    return `<button class="module-card" type="button" data-module="${m.id}">
      <span class="module-emoji">${m.emoji}</span>
      <span><strong>${escapeHtml(m.label)}</strong><br><small>${escapeHtml(m.subtitle)}</small></span>
      <span class="count-pill">${count}</span>
    </button>`;
  }).join("");
  $("module-grid").innerHTML = render();
  $("module-grid-home").innerHTML = render();
}

function activeCards() {
  return cards.filter((c) => c.status !== "done" && c.status !== "deleted");
}
function dueCards() {
  const start = todayStart();
  const tomorrow = addDays(start, 1);
  const week = addDays(start, 8);
  const today = activeCards().filter((c) => c.due_at && new Date(c.due_at) < tomorrow).sort(sortByDue);
  const next = activeCards().filter((c) => c.due_at && new Date(c.due_at) >= tomorrow && new Date(c.due_at) < week).sort(sortByDue);
  return { today, next };
}
function sortByDue(a,b) {
  return new Date(a.due_at || 0) - new Date(b.due_at || 0);
}

function renderHome() {
  const { today, next } = dueCards();
  $("today-count").textContent = today.length;
  $("week-count").textContent = next.length;
  $("today-focus").textContent = today.length ? `${today.length} cosa(s) para hoy` : "Hoy no hay urgencias";
  $("today-focus-sub").textContent = next.length ? `${next.length} cosa(s) más en los próximos 7 días.` : "La semana está despejada.";
  $("today-list").innerHTML = today.length ? today.map(renderItemCard).join("") : `<p class="empty">No hay nada pendiente para hoy.</p>`;
  $("week-list").innerHTML = next.length ? next.map(renderItemCard).join("") : `<p class="empty">No hay pendientes fechados para los próximos días.</p>`;
}

function renderModuleItems() {
  if (!currentModuleId) return;
  const items = cardsForModule(currentModuleId);
  $("module-items").innerHTML = items.length
    ? items.map(renderItemCard).join("")
    : `<p class="empty">Todavía no hay nada en ${escapeHtml(moduleLabel(currentModuleId))}. Pulsa “Añadir”.</p>`;
}

function renderItemCard(card) {
  const due = card.due_at ? new Date(card.due_at) : null;
  const overdue = due && due < new Date() && card.status !== "done";
  const notify = card.notify_at ? `Aviso ${dateLabel(card.notify_at)}` : "Sin aviso";
  return `<article class="item-card" data-card-id="${card.id}">
    <div class="item-card-main">
      <span class="item-icon">${moduleEmoji(card.module)}</span>
      <button class="plain-card-button" type="button" data-open-card="${card.id}">
        <h3>${escapeHtml(card.title || "Sin título")}</h3>
        <p>${escapeHtml(card.details || card.payload?.subtitle || "")}</p>
      </button>
      <button class="small-button" type="button" data-open-card="${card.id}">Abrir</button>
    </div>
    <div class="tags">
      <span class="tag">${escapeHtml(moduleLabel(card.module))}</span>
      ${card.due_at ? `<span class="tag ${overdue ? "danger" : ""}">${escapeHtml(dateLabel(card.due_at))}</span>` : ""}
      ${card.notify_at ? `<span class="tag ok">${escapeHtml(notify)}</span>` : ""}
      ${card.visibility === "household" ? `<span class="tag">Compartido</span>` : `<span class="tag">Privado</span>`}
      ${card.status === "done" ? `<span class="tag ok">Hecho</span>` : ""}
    </div>
    <div class="card-actions">
      <button type="button" data-done-card="${card.id}">${card.status === "done" ? "Reabrir" : "Hecho"}</button>
      <button type="button" data-edit-card="${card.id}">Editar</button>
      <button class="danger" type="button" data-delete-card="${card.id}">Borrar</button>
    </div>
  </article>`;
}

function cardById(id) { return cards.find((c) => c.id === id); }

function openCard(id) {
  const card = cardById(id);
  if (!card) return;
  const body = $("card-dialog-body");
  body.innerHTML = `<span class="badge">${escapeHtml(moduleLabel(card.module))}</span>
    <h2>${moduleEmoji(card.module)} ${escapeHtml(card.title || "Sin título")}</h2>
    <p>${escapeHtml(card.details || "Sin detalles.")}</p>
    <div class="tags">
      ${card.due_at ? `<span class="tag">${escapeHtml(dateLabel(card.due_at))}</span>` : ""}
      ${card.notify_at ? `<span class="tag ok">Aviso ${escapeHtml(dateLabel(card.notify_at))}</span>` : ""}
      <span class="tag">${card.visibility === "household" ? "Compartido" : "Privado"}</span>
      <span class="tag">${escapeHtml(card.status || "open")}</span>
    </div>
    ${renderPayload(card)}
    <div class="dialog-actions">
      <button class="primary-button" type="button" data-edit-card="${card.id}">Editar</button>
      <button class="secondary-button" type="button" data-done-card="${card.id}">${card.status === "done" ? "Reabrir" : "Marcar hecho"}</button>
      <button class="danger-button" type="button" data-delete-card="${card.id}">Borrar</button>
    </div>`;
  $("card-dialog").showModal();
}

function renderPayload(card) {
  const payload = card.payload || {};
  const entries = Object.entries(payload).filter(([k,v]) => v && !["subtitle"].includes(k));
  if (!entries.length) return "";
  return `<div class="section-block" style="margin-top:12px;box-shadow:none;"><h3>Información</h3>${entries.map(([k,v]) => `<p><strong>${escapeHtml(labelField(k))}:</strong> ${escapeHtml(Array.isArray(v) ? v.join(", ") : v)}</p>`).join("")}</div>`;
}

function labelField(key) {
  const labels = {
    stock: "Stock", warning: "Avisar con", dose: "Dosis", phone: "Teléfono", provider: "Proveedor",
    address: "Dirección", url: "Enlace", specialty: "Especialidad", result: "Resultado", card_number: "Número"
  };
  return labels[key] || key;
}

function openForm(moduleId, card = null, preferredDue = null) {
  const m = MODULE_BY_ID[moduleId] || MODULE_BY_ID.tasks;
  const title = card ? "Editar" : "Añadir";
  const payload = card?.payload || {};
  const body = $("form-dialog-body");
  body.innerHTML = `<span class="badge">${escapeHtml(m.label)}</span>
    <h2>${title} ${escapeHtml(m.label.toLowerCase())}</h2>
    <form id="card-form" class="form-stack">
      <label class="field"><span>Título</span><input id="form-title" type="text" value="${escapeHtml(card?.title || "")}" required placeholder="${placeholderFor(moduleId)}"></label>
      <label class="field"><span>Detalles</span><textarea id="form-details" rows="3" placeholder="Notas, contexto, pasos, indicaciones...">${escapeHtml(card?.details || "")}</textarea></label>
      <div class="form-grid two">
        <label class="field"><span>Fecha y hora</span><input id="form-due" type="datetime-local" value="${toDateTimeLocal(card?.due_at || preferredDue)}"></label>
        <label class="field"><span>Aviso</span>
          <select id="form-notify">
            <option value="none">Sin aviso</option>
            <option value="at">A la hora indicada</option>
            <option value="hour">1 hora antes</option>
            <option value="day">1 día antes</option>
            <option value="week">1 semana antes</option>
          </select>
        </label>
      </div>
      ${extraFields(moduleId, payload)}
      <label class="field"><span>Visibilidad</span>
        <select id="form-visibility">
          <option value="private">Privado</option>
          <option value="household">Compartido en casa</option>
        </select>
      </label>
      <button class="primary-button" type="submit">${card ? "Guardar cambios" : "Guardar"}</button>
    </form>`;
  $("form-visibility").value = card?.visibility || m.visibility || "private";
  $("form-notify").value = card?.notify_at ? "at" : "none";
  const form = $("card-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveForm(moduleId, card?.id || null);
  });
  $("form-dialog").showModal();
}

function placeholderFor(moduleId) {
  return {
    tasks: "Ej. Pedir cita, llamar, comprar...",
    health: "Ej. Dolor, regla, sueño, síntoma...",
    medical: "Ej. Endocrino, dermatología...",
    medication: "Ej. Eutirox 112 microgramos",
    home: "Ej. Casa, piso, seguro, obra...",
    shopping: "Ej. Leche, detergente...",
    private_list: "Ej. Mirar papeles...",
    wishlist: "Ej. Libro, bolso, enlace...",
    wallet: "Ej. Eroski Club, IKEA Family",
    contacts: "Ej. Proveedor internet",
    travel: "Ej. Vuelo, hotel, vacaciones..."
  }[moduleId] || "Título";
}

function extraFields(moduleId, payload = {}) {
  if (moduleId === "medication") {
    return `<div class="form-grid two">
      <label class="field"><span>Dosis</span><input id="extra-dose" type="text" value="${escapeHtml(payload.dose || "")}" placeholder="1 comprimido/día"></label>
      <label class="field"><span>Stock</span><input id="extra-stock" type="number" min="0" value="${escapeHtml(payload.stock ?? "")}" placeholder="37"></label>
    </div>
    <label class="field"><span>Avisar cuando queden</span><input id="extra-warning" type="number" min="1" value="${escapeHtml(payload.warning ?? 7)}"></label>`;
  }
  if (moduleId === "contacts") {
    return `<div class="form-grid two">
      <label class="field"><span>Teléfono</span><input id="extra-phone" type="tel" value="${escapeHtml(payload.phone || "")}"></label>
      <label class="field"><span>Proveedor / entidad</span><input id="extra-provider" type="text" value="${escapeHtml(payload.provider || "")}"></label>
    </div>`;
  }
  if (moduleId === "wallet") {
    return `<div class="form-grid two">
      <label class="field"><span>Entidad</span><input id="extra-provider" type="text" value="${escapeHtml(payload.provider || "")}"></label>
      <label class="field"><span>Número o código</span><input id="extra-card-number" type="text" value="${escapeHtml(payload.card_number || "")}"></label>
    </div>`;
  }
  if (moduleId === "medical") {
    return `<label class="field"><span>Especialidad</span><input id="extra-specialty" type="text" value="${escapeHtml(payload.specialty || "")}" placeholder="Endocrino, alergología..."></label>`;
  }
  if (moduleId === "home" || moduleId === "travel") {
    return `<label class="field"><span>Dirección / lugar / referencia</span><input id="extra-address" type="text" value="${escapeHtml(payload.address || "")}"></label>`;
  }
  if (moduleId === "wishlist") {
    return `<label class="field"><span>Enlace</span><input id="extra-url" type="url" value="${escapeHtml(payload.url || "")}" placeholder="https://..."></label>`;
  }
  return "";
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,16);
}

function notifyAtFrom(dueAt, mode) {
  if (!dueAt || mode === "none") return null;
  const d = new Date(dueAt);
  if (mode === "hour") d.setHours(d.getHours() - 1);
  if (mode === "day") d.setDate(d.getDate() - 1);
  if (mode === "week") d.setDate(d.getDate() - 7);
  return d.toISOString();
}

function payloadFromForm(moduleId) {
  const payload = {};
  if ($("extra-dose")) payload.dose = $("extra-dose").value.trim();
  if ($("extra-stock")) payload.stock = $("extra-stock").value ? Number($("extra-stock").value) : null;
  if ($("extra-warning")) payload.warning = $("extra-warning").value ? Number($("extra-warning").value) : 7;
  if ($("extra-phone")) payload.phone = $("extra-phone").value.trim();
  if ($("extra-provider")) payload.provider = $("extra-provider").value.trim();
  if ($("extra-card-number")) payload.card_number = $("extra-card-number").value.trim();
  if ($("extra-specialty")) payload.specialty = $("extra-specialty").value.trim();
  if ($("extra-address")) payload.address = $("extra-address").value.trim();
  if ($("extra-url")) payload.url = $("extra-url").value.trim();
  return payload;
}

async function saveForm(moduleId, id = null) {
  const dueRaw = $("form-due").value;
  const dueAt = dueRaw ? new Date(dueRaw).toISOString() : null;
  const visibility = $("form-visibility").value;
  const payload = {
    owner_id: currentUser.id,
    household_id: visibility === "household" ? currentHousehold : null,
    visibility,
    module: moduleId,
    category: moduleId,
    title: $("form-title").value.trim(),
    details: $("form-details").value.trim() || null,
    due_at: dueAt,
    notify_at: notifyAtFrom(dueAt, $("form-notify").value),
    notified_at: null,
    status: "open",
    payload: payloadFromForm(moduleId)
  };
  if (!payload.title) throw new Error("Falta el título.");
  if (id) await updateCard(id, payload);
  else await insertCard(payload);
  $("form-dialog").close();
  await loadCards();
}

function renderCalendar() {
  const date = new Date(calendarCursor);
  const grid = $("calendar-grid");
  document.querySelectorAll(".view-switch button").forEach((b) => b.classList.toggle("active", b.dataset.view === calendarView));
  $("calendar-date").value = date.toISOString().slice(0,10);
  if (calendarView === "day") return renderCalendarDay(date, grid);
  if (calendarView === "week") return renderCalendarWeek(date, grid);
  renderCalendarMonth(date, grid);
  renderSelectedDayList(date);
}

function cardsOnDay(day) {
  return cards.filter((c) => c.due_at && isSameDay(new Date(c.due_at), day) && c.status !== "deleted").sort(sortByDue);
}

function renderCalendarMonth(date, grid) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const head = ["L","M","X","J","V","S","D"].map((d) => `<span>${d}</span>`).join("");
  grid.innerHTML = `<h2>${date.toLocaleDateString("es-ES", { month:"long", year:"numeric" })}</h2><div class="cal-weekdays">${head}</div><div class="cal-days">${days.map((d) => renderDayCell(d, date)).join("")}</div>`;
}

function renderCalendarWeek(date, grid) {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  grid.innerHTML = `<h2>Semana de ${dateLabel(start, "short")}</h2><div class="cal-days">${days.map((d) => renderDayCell(d, date)).join("")}</div>`;
  renderSelectedDayList(date);
}

function renderCalendarDay(date, grid) {
  grid.innerHTML = `<h2>${date.toLocaleDateString("es-ES", { weekday:"long", day:"2-digit", month:"long" })}</h2>`;
  renderSelectedDayList(date);
}

function renderDayCell(day, current) {
  const dayCards = cardsOnDay(day);
  const classes = ["day-cell"];
  if (day.getMonth() !== current.getMonth() && calendarView === "month") classes.push("muted");
  if (isSameDay(day, new Date())) classes.push("today");
  if (isSameDay(day, calendarCursor)) classes.push("selected");
  return `<button class="${classes.join(" ")}" data-calendar-day="${day.toISOString().slice(0,10)}" type="button">
    <strong>${day.getDate()}</strong>
    <small>${day.toLocaleDateString("es-ES", { weekday:"short" })}</small>
    <span class="dot-row">${dayCards.slice(0,6).map((c) => `<span class="dot ${escapeHtml(c.module)}"></span>`).join("")}</span>
  </button>`;
}

function renderSelectedDayList(date) {
  $("selected-day-title").textContent = date.toLocaleDateString("es-ES", { weekday:"long", day:"2-digit", month:"long" });
  const list = cardsOnDay(date);
  $("selected-day-list").innerHTML = list.length ? list.map(renderItemCard).join("") : `<p class="empty">No hay nada registrado este día.</p>`;
}

function renderNotifications() {
  const notifyCards = activeCards().filter((c) => c.notify_at).sort((a,b) => new Date(a.notify_at)-new Date(b.notify_at));
  $("notification-cards").innerHTML = notifyCards.length ? notifyCards.map(renderItemCard).join("") : `<p class="empty">No hay avisos programados. Añade fecha y aviso en cualquier tarjeta.</p>`;
  renderDiagnostics();
}

function diagnosticItem(label, ok, detail = "") {
  return `<div class="diagnostic-item ${ok ? "ok" : "bad"}"><span>${escapeHtml(label)}</span><strong>${ok ? "OK" : "Falta"}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</div>`;
}

async function collectDiagnostics() {
  const isHttps = location.protocol === "https:" || location.hostname === "localhost";
  const hasSW = "serviceWorker" in navigator;
  const hasNotification = "Notification" in window;
  const hasPush = "PushManager" in window;
  const permission = hasNotification ? Notification.permission : "no";
  let registration = null;
  let subscription = null;
  try {
    if (hasSW) registration = await navigator.serviceWorker.getRegistration();
    if (registration && hasPush) subscription = await registration.pushManager.getSubscription();
  } catch {}
  pushSubscription = subscription;
  return [
    ["HTTPS o localhost", isHttps, location.protocol],
    ["Service Worker disponible", hasSW, ""],
    ["Service Worker registrado", Boolean(registration), ""],
    ["Notifications API", hasNotification, ""],
    ["Permiso de notificación", permission === "granted", permission],
    ["PushManager", hasPush, ""],
    ["VAPID configurada", Boolean(cfg().PUSH?.VAPID_PUBLIC_KEY), ""],
    ["Suscripción push", Boolean(subscription), ""]
  ];
}

async function renderDiagnostics() {
  const rows = await collectDiagnostics();
  $("push-diagnostics").innerHTML = rows.map(([l,ok,d]) => diagnosticItem(l, ok, d)).join("");
}

function updatePushSummary() {
  const warning = $("push-warning");
  if (!("Notification" in window) || Notification.permission !== "granted" || !pushSubscription) {
    warning.classList.add("needs-action");
    $("push-summary").textContent = "Los avisos no están completamente activados. Entra en Avisos y pulsa Activar.";
  } else {
    warning.classList.remove("needs-action");
    $("push-summary").textContent = "Permisos y suscripción activos. Haz una prueba push real cuando quieras.";
  }
}

async function registerSW() {
  if (!("serviceWorker" in navigator)) throw new Error("Este navegador no soporta Service Worker.");
  const reg = await navigator.serviceWorker.register("./service-worker.js");
  await navigator.serviceWorker.ready;
  await reg.update().catch(() => null);
  return reg;
}

function vapidToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

async function subscribePush() {
  if (location.protocol !== "https:" && location.hostname !== "localhost") throw new Error("Las push requieren HTTPS.");
  const reg = await registerSW();
  if (!("Notification" in window)) throw new Error("Este navegador no permite notificaciones.");
  if (!("PushManager" in window)) throw new Error("Este navegador no permite PushManager.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("No se concedió permiso de notificación.");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidToUint8Array(cfg().PUSH.VAPID_PUBLIC_KEY)
    });
  }
  const json = sub.toJSON();
  await rest("vita_push_subscriptions", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      owner_id: currentUser.id,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh || "",
      auth: json.keys?.auth || "",
      user_agent: navigator.userAgent,
      enabled: true
    })
  });
  pushSubscription = sub;
  renderNotifications();
  updatePushSummary();
  return sub;
}

async function testLocalNotification() {
  const reg = await registerSW();
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Permiso denegado.");
  }
  await reg.showNotification("VITA", {
    body: "Prueba local: tu móvil puede mostrar notificaciones.",
    icon: "./assets/vita-icon-192.png",
    badge: "./assets/vita-icon-192.png",
    tag: "vita-local-test",
    data: { url: "./#home" }
  });
}

async function testPushReal() {
  await subscribePush();
  const session = getSession();
  const res = await fetch(cfg().PUSH.EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      apikey: cfg().SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mode: "test", title: "VITA", body: "Prueba push real enviada desde Supabase.", target: "home" })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.message || data.error || "Edge Function no pudo enviar la push.");
  return data;
}

async function toggleDone(id) {
  const card = cardById(id);
  if (!card) return;
  await updateCard(id, { status: card.status === "done" ? "open" : "done" });
  await loadCards();
}

async function removeCard(id) {
  if (!confirm("¿Borrar esta tarjeta?")) return;
  await updateCard(id, { status: "deleted" });
  await loadCards();
}

function editCard(id) {
  const card = cardById(id);
  if (!card) return;
  openForm(card.module, card);
}

function setupEvents() {
  $("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    loginStatus("Entrando...", "neutral");
    try {
      await login(normalizeEmail($("login-user").value), $("login-pass").value);
      renderAccess();
      await loadCards();
      loginStatus("Sesión iniciada.", "success");
    } catch (error) {
      loginStatus(error.message, "error");
    }
  });

  document.addEventListener("click", async (event) => {
    const nav = event.target.closest("[data-nav]");
    if (nav) {
      setScreen(nav.dataset.nav);
      return;
    }
    const moduleButton = event.target.closest("[data-module]");
    if (moduleButton) {
      openModule(moduleButton.dataset.module);
      return;
    }
    const open = event.target.closest("[data-open-card]");
    if (open) {
      openCard(open.dataset.openCard);
      return;
    }
    const edit = event.target.closest("[data-edit-card]");
    if (edit) {
      editCard(edit.dataset.editCard);
      return;
    }
    const del = event.target.closest("[data-delete-card]");
    if (del) {
      await removeCard(del.dataset.deleteCard);
      return;
    }
    const done = event.target.closest("[data-done-card]");
    if (done) {
      await toggleDone(done.dataset.doneCard);
      return;
    }
    const day = event.target.closest("[data-calendar-day]");
    if (day) {
      calendarCursor = new Date(`${day.dataset.calendarDay}T12:00:00`);
      calendarView = "day";
      renderCalendar();
      return;
    }
  });

  $("module-add-button").addEventListener("click", () => openForm(currentModuleId || "tasks"));
  $("quick-add-task").addEventListener("click", () => openForm("tasks"));
  $("calendar-add-button").addEventListener("click", () => openForm("tasks", null, calendarCursor));
  $("calendar-date").addEventListener("change", () => {
    calendarCursor = new Date(`${$("calendar-date").value}T12:00:00`);
    renderCalendar();
  });
  $("calendar-prev").addEventListener("click", () => {
    if (calendarView === "month") calendarCursor.setMonth(calendarCursor.getMonth() - 1);
    else calendarCursor.setDate(calendarCursor.getDate() - (calendarView === "week" ? 7 : 1));
    renderCalendar();
  });
  $("calendar-next").addEventListener("click", () => {
    if (calendarView === "month") calendarCursor.setMonth(calendarCursor.getMonth() + 1);
    else calendarCursor.setDate(calendarCursor.getDate() + (calendarView === "week" ? 7 : 1));
    renderCalendar();
  });
  document.querySelectorAll(".view-switch button").forEach((button) => {
    button.addEventListener("click", () => {
      calendarView = button.dataset.view;
      renderCalendar();
    });
  });
  $("enable-push").addEventListener("click", async () => {
    status("Activando avisos...", "neutral");
    try {
      await subscribePush();
      status("Avisos activados y suscripción guardada.", "success");
    } catch (error) {
      status(error.message, "error");
      renderDiagnostics();
    }
  });
  $("test-local").addEventListener("click", async () => {
    try {
      await testLocalNotification();
      status("Prueba local enviada.", "success");
      renderDiagnostics();
    } catch (error) {
      status(error.message, "error");
      renderDiagnostics();
    }
  });
  $("test-push").addEventListener("click", async () => {
    status("Enviando push real...", "neutral");
    try {
      const result = await testPushReal();
      status(`Push real enviada. Enviadas: ${result.sent ?? "?"}.`, "success");
      renderDiagnostics();
    } catch (error) {
      status(error.message, "error");
      renderDiagnostics();
    }
  });
  $("install-app").addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      status("Si no aparece instalación automática, usa el menú del navegador y Añadir a pantalla de inicio.", "neutral");
    }
  });
  $("logout").addEventListener("click", () => {
    clearSession();
    currentUser = null;
    cards = [];
    renderAccess();
  });
  $("account-button").addEventListener("click", () => setScreen("account"));
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });
}

async function boot() {
  setupEvents();
  await registerSW().catch(() => null);
  renderAccess();
  const hash = location.hash.replace("#", "");
  if (hash && $(`screen-${hash}`)) setScreen(hash);
  if (currentUser) {
    status("Cargando VITA...", "neutral");
    await loadCards().catch((error) => status(error.message, "error"));
  }
  renderDiagnostics();
}

boot();

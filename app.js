const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>',
  car: '<svg viewBox="0 0 24 24"><path d="M5 17h14l-1.4-7.1A3 3 0 0 0 14.7 7H9.3a3 3 0 0 0-2.9 2.4L5 17Z"></path><path d="M7 17v2"></path><path d="M17 17v2"></path><path d="M7.5 13h9"></path></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
  plane: '<svg viewBox="0 0 24 24"><path d="M22 16.5 2 9l2-2 16 4-6-7 2-2 6 9v5.5Z"></path><path d="m8 13-2 7 2-2 3-4"></path></svg>',
  pill: '<svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a5 5 0 0 0-7-7l-10 10a5 5 0 0 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path></svg>'
};

const SESSION_KEY = 'vita-session-v3';

let currentUser = null;
let currentProfile = null;
let currentHousehold = null;
let currentHouseholdMembers = [];
let state = {
  health: [],
  vehicles: [],
  bills: [],
  tasks: [],
  events: [],
  travel: [],
  contacts: [],
  wallet: [],
  medications: [],
  medicalDocuments: []
};
let deferredInstallPrompt = null;

function config() { return window.VITA_CONFIG || {}; }
function authEndpoint(path) { return `${config().SUPABASE_URL}/auth/v1/${path}`; }
function restEndpoint(path) { return `${config().SUPABASE_URL}/rest/v1/${path}`; }
function functionEndpoint() { return config().PUSH?.EDGE_FUNCTION_URL; }

function injectIcons(root = document) {
  root.querySelectorAll('.app-icon').forEach((node) => {
    const icon = ICONS[node.dataset.icon] || ICONS.file;
    node.innerHTML = icon;
  });
}

function setStatus(message, type = 'neutral') {
  const node = document.getElementById('global-status');
  if (!node) return;
  node.textContent = message;
  node.className = `global-status ${type}`;
}

function setLoginMessage(message, type = 'neutral') {
  const node = document.getElementById('login-message');
  if (!node) return;
  node.textContent = message;
  node.className = `login-message ${type}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeEmail(value) {
  const raw = String(value || '').trim().toLowerCase();
  return config().USER_ALIASES?.[raw] || raw;
}

function displayName(email) {
  return config().USER_DISPLAY_NAMES?.[email] || email || 'Usuario';
}

function storeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.access_token || !session?.user) return null;
    if (session.expires_at && Number(session.expires_at) * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function login(email, password) {
  const response = await fetch(authEndpoint('token?grant_type=password'), {
    method: 'POST',
    headers: {
      apikey: config().SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || 'No se pudo iniciar sesión.');
  }

  storeSession(data);
  currentUser = data.user;
}

async function rest(path, options = {}) {
  const session = getSession();
  if (!session) throw new Error('Sesión no disponible.');

  const response = await fetch(restEndpoint(path), {
    ...options,
    headers: {
      apikey: config().SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearSession();
      renderAccess();
      throw new Error('Sesión caducada.');
    }
    throw new Error(data.message || data.error || 'No se pudo guardar o cargar.');
  }

  if (response.status === 204) return null;
  return response.json();
}

async function upsert(table, payload) {
  return rest(table, {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(payload)
  });
}

async function patch(table, id, payload) {
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(payload)
  });
}

async function remove(table, id) {
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
}

function renderAccess() {
  const session = getSession();
  currentUser = session?.user || null;
  document.getElementById('login-screen').classList.toggle('is-hidden', Boolean(currentUser));
  document.getElementById('app').classList.toggle('is-hidden', !currentUser);
  if (currentUser) {
    document.getElementById('hello-title').textContent = `Hola, ${displayName(currentUser.email)}`;
    document.getElementById('session-email').textContent = displayName(currentUser.email);
    document.getElementById('session-mode').textContent = currentUser.email;
  }
}

async function loadProfileHousehold() {
  const profiles = await rest(`profiles?select=*&id=eq.${encodeURIComponent(currentUser.id)}&limit=1`);
  currentProfile = profiles[0] || null;

  const memberships = await rest(`household_members?select=household_id,role,status&user_id=eq.${encodeURIComponent(currentUser.id)}&status=eq.active&limit=1`);
  const membership = memberships[0];
  if (!membership) {
    currentHousehold = null;
    currentHouseholdMembers = [];
    return;
  }

  const households = await rest(`households?select=*&id=eq.${encodeURIComponent(membership.household_id)}&limit=1`);
  currentHousehold = households[0] || null;

  const members = await rest(`household_members?select=user_id,role,status&household_id=eq.${encodeURIComponent(membership.household_id)}&status=eq.active`);
  currentHouseholdMembers = members;
}

async function loadAll() {
  if (!currentUser) return;
  setStatus('Cargando VITA...', 'neutral');
  await loadProfileHousehold();

  const household = currentHousehold?.id ? encodeURIComponent(currentHousehold.id) : null;
  const user = encodeURIComponent(currentUser.id);

  const loaders = [
    rest(`health_records?select=*&owner_id=eq.${user}&order=occurred_at.desc`).then((d) => state.health = d),
    rest(`medications?select=*&owner_id=eq.${user}&active=eq.true&order=created_at.asc`).then((d) => state.medications = d).catch(() => state.medications = []),
    rest(`medical_documents?select=*&owner_id=eq.${user}&order=created_at.desc`).then((d) => state.medicalDocuments = d).catch(() => state.medicalDocuments = []),
    rest(`wallet_cards?select=*&owner_id=eq.${user}&order=created_at.desc`).then((d) => state.wallet = d).catch(() => state.wallet = [])
  ];

  if (household) {
    loaders.push(
      rest(`household_vehicles?select=*&household_id=eq.${household}&active=eq.true&order=created_at.desc`).then((d) => state.vehicles = d),
      rest(`household_bills?select=*&household_id=eq.${household}&order=due_date.asc`).then((d) => state.bills = d),
      rest(`household_tasks?select=*&household_id=eq.${household}&order=due_date.asc`).then((d) => state.tasks = d),
      rest(`calendar_events?select=*&household_id=eq.${household}&order=start_at.asc`).then((d) => state.events = d),
      rest(`travel_items?select=*&household_id=eq.${household}&order=start_at.asc`).then((d) => state.travel = d),
      rest(`household_contacts?select=*&household_id=eq.${household}&order=name.asc`).then((d) => state.contacts = d)
    );
  }

  const results = await Promise.allSettled(loaders);
  const errors = results.filter((r) => r.status === 'rejected');
  renderAll();
  setStatus(errors.length ? 'VITA cargada con algún dato pendiente de reparar.' : 'VITA lista.', errors.length ? 'error' : 'success');
}

function renderAll() {
  renderToday();
  renderCalendar();
  renderHealth();
  renderMedication();
  renderHome();
  renderWallet();
  updatePwaStatus();
  updateNotificationStatus();
  injectIcons();
}

function dateText(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + (String(value).includes('T') ? ` · ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : '');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toLocalInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function card({ icon = 'file', title, body = '', tags = [], table, id, editField = 'title' }) {
  return `
    <article class="card">
      <span class="card-icon app-icon" data-icon="${escapeHtml(icon)}"></span>
      <div class="card-body">
        <h3>${escapeHtml(title)}</h3>
        ${body ? `<p>${escapeHtml(body)}</p>` : ''}
        ${tags.length ? `<div class="card-tags">${tags.map((t) => `<span class="${String(t).startsWith('Vencido') ? 'danger' : ''}">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        ${table && id ? `
          <div class="card-actions">
            <button type="button" data-action="edit" data-table="${escapeHtml(table)}" data-id="${escapeHtml(id)}" data-field="${escapeHtml(editField)}"><span class="app-icon" data-icon="edit"></span> Editar</button>
            <button class="danger" type="button" data-action="delete" data-table="${escapeHtml(table)}" data-id="${escapeHtml(id)}"><span class="app-icon" data-icon="trash"></span> Borrar</button>
          </div>
        ` : ''}
      </div>
    </article>
  `;
}

function renderToday() {
  const list = document.getElementById('today-list');
  const upcoming = [
    ...state.events.map((e) => ({ title: e.title, body: e.notes || e.location || '', date: e.start_at, icon: iconForType(e.event_type) })),
    ...state.bills.filter((b) => b.status !== 'paid').map((b) => ({ title: b.title, body: `${b.provider || ''} ${b.amount ? `${b.amount} €` : ''}`.trim(), date: b.due_date, icon: 'bell' })),
    ...state.travel.map((t) => ({ title: t.title, body: `${t.trip_title || ''} ${t.provider || ''}`.trim(), date: t.start_at, icon: 'plane' })),
    ...state.medications.filter((m) => medicationDaysLeft(m) <= Number(m.warning_threshold_days || 7)).map((m) => ({ title: `Revisar stock: ${m.name}`, body: `Quedan ${medicationDaysLeft(m)} días aprox.`, date: new Date().toISOString(), icon: 'pill' }))
  ].filter((item) => item.date).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 8);

  document.getElementById('today-events-count').textContent = `${upcoming.length} eventos próximos`;

  if (!upcoming.length) {
    list.innerHTML = '<p class="empty">No hay avisos próximos.</p>';
    return;
  }

  list.innerHTML = upcoming.map((item) => card({
    icon: item.icon,
    title: item.title,
    body: item.body,
    tags: [dateText(item.date)]
  })).join('');
}

function iconForType(type) {
  const map = { tax: 'bell', medical: 'heart', bill: 'bell', work_vacation: 'calendar', travel: 'plane', general: 'calendar' };
  return map[type] || 'calendar';
}

function calendarRange() {
  const view = document.getElementById('calendar-view').value;
  const selected = new Date(`${document.getElementById('calendar-date').value || todayIso()}T00:00:00`);
  let start = new Date(selected);
  let end = new Date(selected);

  if (view === 'day') end.setDate(start.getDate() + 1);
  if (view === 'week') {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    end = new Date(start); end.setDate(start.getDate() + 7);
  }
  if (view === 'month') {
    start = new Date(selected.getFullYear(), selected.getMonth(), 1);
    end = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
  }
  if (view === 'year') {
    start = new Date(selected.getFullYear(), 0, 1);
    end = new Date(selected.getFullYear() + 1, 0, 1);
  }

  return { start, end };
}

function inRange(value, start, end) {
  if (!value) return false;
  const date = new Date(value);
  return date >= start && date < end;
}

function renderCalendar() {
  const { start, end } = calendarRange();
  const items = [
    ...state.events.map((e) => ({ ...e, source: 'calendar_events', icon: iconForType(e.event_type), date: e.start_at, field: 'title' })),
    ...state.bills.map((b) => ({ ...b, source: 'household_bills', icon: 'bell', date: b.due_date, field: 'title' })),
    ...state.travel.map((t) => ({ ...t, source: 'travel_items', icon: 'plane', date: t.start_at, field: 'title' }))
  ].filter((item) => inRange(item.date, start, end)).sort((a, b) => new Date(a.date) - new Date(b.date));

  const node = document.getElementById('calendar-list');
  if (!items.length) {
    node.innerHTML = '<p class="empty">No hay eventos en esta vista.</p>';
    return;
  }

  node.innerHTML = items.map((item) => card({
    icon: item.icon,
    title: item.title,
    body: item.notes || item.location || item.provider || '',
    tags: [dateText(item.date)],
    table: item.source,
    id: item.id,
    editField: item.field
  })).join('');
}

function renderHealth() {
  const node = document.getElementById('health-list');
  if (!state.health.length) {
    node.innerHTML = '<p class="empty">Todavía no hay registros.</p>';
    return;
  }

  node.innerHTML = state.health.map((item) => card({
    icon: 'heart',
    title: item.value_text || labelHealth(item.record_type),
    body: item.notes || '',
    tags: [labelHealth(item.record_type), dateText(item.occurred_at), item.intensity ? `Intensidad ${item.intensity}` : ''],
    table: 'health_records',
    id: item.id,
    editField: 'value_text'
  })).join('');
}

function labelHealth(type) {
  const labels = { bathroom: 'Baño', symptoms: 'Síntomas', sleep: 'Sueño', period: 'Regla', pain: 'Dolor', mood: 'Ánimo', note: 'Nota' };
  return labels[type] || type || 'Salud';
}


function medicationDaysLeft(item) {
  const perDay = Math.max(1, (item.schedule_times || []).length || 1);
  return Math.floor(Number(item.current_stock || 0) / perDay);
}

function renderMedication() {
  const node = document.getElementById('medication-list');
  if (!node) return;

  if (!state.medications.length) {
    node.innerHTML = '<p class="empty">Sin medicación guardada.</p>';
    return;
  }

  node.innerHTML = state.medications.map((m) => card({
    icon: 'pill',
    title: m.name,
    body: m.dose_text || '',
    tags: [
      (m.schedule_times || ['08:00']).join(', '),
      `${m.current_stock || 0} unidades`,
      `${medicationDaysLeft(m)} días aprox.`
    ],
    table: 'medications',
    id: m.id,
    editField: 'name'
  })).join('');
}

function renderWallet() {
  const node = document.getElementById('wallet-list');
  if (!node) return;

  if (!state.wallet.length) {
    node.innerHTML = '<p class="empty">Sin tarjetas guardadas.</p>';
    return;
  }

  node.innerHTML = state.wallet.map((w) => card({
    icon: 'file',
    title: w.name,
    body: [w.provider, w.card_number ? `N.º ${w.card_number}` : '', w.notes].filter(Boolean).join(' · '),
    tags: [labelWallet(w.card_type), w.show_in_shopping ? 'Lista de la compra' : 'Wallet'],
    table: 'wallet_cards',
    id: w.id,
    editField: 'name'
  })).join('');
}

function labelWallet(type) {
  const labels = { loyalty: 'Fidelización', membership: 'Socio/a', health: 'Salud', other: 'Otra' };
  return labels[type] || 'Tarjeta';
}

function renderHome() {
  const vehicleNode = document.getElementById('vehicle-list');
  vehicleNode.innerHTML = state.vehicles.length ? state.vehicles.map((v) => card({
    icon: 'car',
    title: v.name,
    body: [v.plate, v.model, v.notes].filter(Boolean).join(' · '),
    table: 'household_vehicles',
    id: v.id,
    editField: 'name'
  })).join('') : '<p class="empty">Sin vehículos guardados.</p>';

  const billNode = document.getElementById('bill-list');
  billNode.innerHTML = state.bills.length ? state.bills.map((b) => card({
    icon: 'bell',
    title: b.title,
    body: [b.provider, b.amount ? `${b.amount} €` : '', b.notes].filter(Boolean).join(' · '),
    tags: [dateText(b.due_date), b.status || 'pendiente'],
    table: 'household_bills',
    id: b.id,
    editField: 'title'
  })).join('') : '<p class="empty">Sin facturas ni avisos.</p>';

  const contactNode = document.getElementById('contact-list');
  contactNode.innerHTML = state.contacts.length ? state.contacts.map((c) => card({
    icon: 'phone',
    title: c.name,
    body: [c.phone, c.email, c.website, c.notes].filter(Boolean).join(' · '),
    tags: [labelContact(c.category)],
    table: 'household_contacts',
    id: c.id,
    editField: 'name'
  })).join('') : '<p class="empty">Sin contactos guardados.</p>';

  const travelNode = document.getElementById('travel-list');
  travelNode.innerHTML = state.travel.length ? state.travel.map((t) => card({
    icon: 'plane',
    title: t.title,
    body: [t.trip_title, t.provider, t.booking_reference, t.notes].filter(Boolean).join(' · '),
    tags: [labelTravel(t.item_type), dateText(t.start_at)],
    table: 'travel_items',
    id: t.id,
    editField: 'title'
  })).join('') : '<p class="empty">Sin viajes ni vacaciones guardados.</p>';
}

function labelContact(type) {
  const labels = { internet: 'Internet', insurance: 'Seguro', bank: 'Banco', health: 'Salud', work: 'Trabajo', other: 'Otro' };
  return labels[type] || 'Contacto';
}

function labelTravel(type) {
  const labels = { work_vacation: 'Vacaciones trabajo', flight: 'Vuelo', stay: 'Estancia', transfer: 'Desplazamiento', activity: 'Actividad', document: 'Documento' };
  return labels[type] || 'Viaje';
}

function getHouseholdPayload() {
  if (!currentHousehold) throw new Error('No se cargó el hogar compartido.');
  return { household_id: currentHousehold.id, created_by: currentUser.id };
}


function parseTimes(value) {
  return String(value || '')
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean)
    .map((time) => {
      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      const hour = String(Math.min(23, Number(match[1]))).padStart(2, '0');
      const minute = String(Math.min(59, Number(match[2]))).padStart(2, '0');
      return `${hour}:${minute}`;
    })
    .filter(Boolean);
}

function setupForms() {
  document.getElementById('health-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      await upsert('health_records', {
        owner_id: currentUser.id,
        record_type: document.getElementById('health-type').value,
        value_text: document.getElementById('health-value').value.trim() || null,
        intensity: document.getElementById('health-intensity').value ? Number(document.getElementById('health-intensity').value) : null,
        notes: document.getElementById('health-notes').value.trim() || null,
        occurred_at: new Date().toISOString()
      });
      event.target.reset();
    }, 'Registro de salud guardado.');
  });


  document.getElementById('medication-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const times = parseTimes(document.getElementById('medication-times').value);
      await upsert('medications', {
        owner_id: currentUser.id,
        name: document.getElementById('medication-name').value.trim(),
        dose_text: document.getElementById('medication-dose').value.trim() || null,
        schedule_times: times.length ? times : ['08:00'],
        units_per_box: document.getElementById('medication-box').value ? Number(document.getElementById('medication-box').value) : null,
        current_stock: document.getElementById('medication-stock').value ? Number(document.getElementById('medication-stock').value) : 0,
        warning_threshold_days: document.getElementById('medication-warning').value ? Number(document.getElementById('medication-warning').value) : 7,
        notes: document.getElementById('medication-notes').value.trim() || null,
        active: true
      });
      event.target.reset();
      document.getElementById('medication-warning').value = 7;
    }, 'Medicación guardada.');
  });

  document.getElementById('wallet-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      await upsert('wallet_cards', {
        owner_id: currentUser.id,
        name: document.getElementById('wallet-name').value.trim(),
        provider: document.getElementById('wallet-provider').value.trim() || null,
        card_number: document.getElementById('wallet-number').value.trim() || null,
        card_type: document.getElementById('wallet-type').value,
        show_in_shopping: document.getElementById('wallet-shopping').checked,
        notes: document.getElementById('wallet-notes').value.trim() || null,
        active: true
      });
      event.target.reset();
      document.getElementById('wallet-shopping').checked = true;
    }, 'Tarjeta guardada.');
  });

  document.getElementById('vehicle-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const base = getHouseholdPayload();
      await upsert('household_vehicles', {
        ...base,
        name: document.getElementById('vehicle-name').value.trim(),
        plate: document.getElementById('vehicle-plate').value.trim() || null,
        model: document.getElementById('vehicle-model').value.trim() || null,
        notes: document.getElementById('vehicle-notes').value.trim() || null,
        active: true
      });
      event.target.reset();
    }, 'Vehículo guardado.');
  });

  document.getElementById('bill-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const base = getHouseholdPayload();
      await upsert('household_bills', {
        ...base,
        title: document.getElementById('bill-title').value.trim(),
        amount: document.getElementById('bill-amount').value ? Number(document.getElementById('bill-amount').value) : null,
        due_date: document.getElementById('bill-date').value || null,
        provider: document.getElementById('bill-provider').value.trim() || null,
        notes: document.getElementById('bill-notes').value.trim() || null,
        category: 'other',
        frequency: 'one_time',
        status: 'pending'
      });
      event.target.reset();
    }, 'Factura o aviso guardado.');
  });

  document.getElementById('contact-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const base = getHouseholdPayload();
      await upsert('household_contacts', {
        ...base,
        name: document.getElementById('contact-name').value.trim(),
        category: document.getElementById('contact-category').value,
        phone: document.getElementById('contact-phone').value.trim() || null,
        email: document.getElementById('contact-extra').value.includes('@') ? document.getElementById('contact-extra').value.trim() : null,
        website: !document.getElementById('contact-extra').value.includes('@') ? document.getElementById('contact-extra').value.trim() || null : null,
        notes: document.getElementById('contact-notes').value.trim() || null
      });
      event.target.reset();
    }, 'Contacto guardado.');
  });

  document.getElementById('event-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const base = getHouseholdPayload();
      await upsert('calendar_events', {
        household_id: base.household_id,
        owner_id: currentUser.id,
        visibility: 'household',
        event_type: document.getElementById('event-type').value,
        title: document.getElementById('event-title').value.trim(),
        start_at: document.getElementById('event-start').value ? new Date(document.getElementById('event-start').value).toISOString() : new Date().toISOString(),
        end_at: document.getElementById('event-end').value ? new Date(document.getElementById('event-end').value).toISOString() : null,
        location: document.getElementById('event-location').value.trim() || null,
        notes: document.getElementById('event-notes').value.trim() || null,
        status: 'active'
      });
      event.target.reset();
    }, 'Evento guardado.');
  });

  document.getElementById('travel-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveWithStatus(async () => {
      const base = getHouseholdPayload();
      await upsert('travel_items', {
        household_id: base.household_id,
        owner_id: currentUser.id,
        trip_title: document.getElementById('travel-trip').value.trim() || null,
        item_type: document.getElementById('travel-type').value,
        title: document.getElementById('travel-title').value.trim(),
        start_at: document.getElementById('travel-start').value ? new Date(document.getElementById('travel-start').value).toISOString() : null,
        end_at: document.getElementById('travel-end').value ? new Date(document.getElementById('travel-end').value).toISOString() : null,
        provider: document.getElementById('travel-provider').value.trim() || null,
        booking_reference: document.getElementById('travel-provider').value.trim() || null,
        notes: document.getElementById('travel-notes').value.trim() || null
      });
      event.target.reset();
    }, 'Vacaciones o viaje guardado.');
  });
}

async function saveWithStatus(action, message) {
  try {
    await action();
    await loadAll();
    setStatus(message, 'success');
  } catch (error) {
    setStatus(error.message || 'No se pudo guardar.', 'error');
  }
}

async function handleCardAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const table = button.dataset.table;
  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    if (!confirm('¿Borrar este registro?')) return;
    await saveWithStatus(async () => remove(table, id), 'Registro borrado.');
  }

  if (action === 'edit') {
    const field = button.dataset.field || 'title';
    const next = prompt('Nuevo texto');
    if (next === null) return;
    await saveWithStatus(async () => patch(table, id, { [field]: next }), 'Registro editado.');
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-item, .js-go').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.target));
  });
}

function showScreen(target) {
  const screen = document.querySelector(`.screen[data-screen="${target}"]`);
  if (!screen) return;
  document.querySelectorAll('.screen').forEach((item) => item.classList.toggle('is-active', item === screen));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.target === target));
  window.location.hash = target;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupLogin() {
  const form = document.getElementById('password-login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = normalizeEmail(document.getElementById('login-username').value);
    const password = document.getElementById('login-password').value;
    setLoginMessage('Entrando...', 'neutral');
    try {
      await login(email, password);
      renderAccess();
      await loadAll();
      setLoginMessage('Sesión iniciada.', 'success');
    } catch (error) {
      setLoginMessage(error.message || 'No se pudo entrar.', 'error');
    }
  });

  document.getElementById('toggle-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('logout-button').addEventListener('click', async () => {
    clearSession();
    currentUser = null;
    renderAccess();
  });
}

function setupBasics() {
  const today = new Date();
  document.getElementById('today-date').textContent = today.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' });
  document.getElementById('calendar-date').value = todayIso();
  document.getElementById('event-start').value = toLocalInputValue(new Date());
  document.getElementById('refresh-data').addEventListener('click', loadAll);
  document.getElementById('calendar-view').addEventListener('change', renderCalendar);
  document.getElementById('calendar-date').addEventListener('change', renderCalendar);
  document.addEventListener('click', handleCardAction);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register('./service-worker.js').then((registration) => {
    registration.update().catch(() => {});
    return registration;
  });
}

function setupPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updatePwaStatus();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updatePwaStatus();
    setStatus('VITA instalada.', 'success');
  });

  document.getElementById('install-pwa').addEventListener('click', async () => {
    if (isStandalone()) {
      setStatus('VITA ya está instalada.', 'success');
      return;
    }

    if (!deferredInstallPrompt) {
      setStatus('Usa el menú del navegador y pulsa Añadir a pantalla de inicio.', 'error');
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updatePwaStatus();
  });
}

function isStandalone() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function updatePwaStatus() {
  const node = document.getElementById('pwa-status');
  if (!node) return;
  node.textContent = isStandalone() ? 'VITA está instalada como app.' : 'Puedes instalar VITA en el móvil.';
}

function updateNotificationStatus() {
  const node = document.getElementById('notification-status');
  if (!node) return;

  if (!('Notification' in window)) {
    node.textContent = 'Este navegador no permite avisos.';
    return;
  }

  if (!('PushManager' in window)) {
    node.textContent = 'Este navegador no permite push.';
    return;
  }

  node.textContent = Notification.permission === 'granted' ? 'Avisos permitidos.' : 'Avisos no activados.';
}

async function setupPush() {
  document.getElementById('enable-notifications').addEventListener('click', async () => {
    setStatus('Activando avisos...', 'neutral');
    try {
      const subscription = await subscribePush();
      await savePushSubscription(subscription);
      updateNotificationStatus();
      setStatus('Avisos activados.', 'success');
    } catch (error) {
      setStatus(error.message || 'No se pudieron activar los avisos.', 'error');
    }
  });

  document.getElementById('test-notification').addEventListener('click', async () => {
    setStatus('Enviando aviso de prueba...', 'neutral');
    try {
      const subscription = await subscribePush();
      await savePushSubscription(subscription);
      const result = await callPushFunction({
        mode: 'test',
        title: 'VITA',
        body: 'Aviso de prueba enviado desde Supabase.',
        target: 'hoy'
      });
      if (!result.ok) throw new Error(result.message || 'Supabase no pudo enviar el aviso.');
      setStatus('Aviso de prueba enviado.', 'success');
    } catch (error) {
      setStatus(error.message || 'No se pudo enviar el aviso.', 'error');
    }
  });
}

async function subscribePush() {
  if (!('Notification' in window)) throw new Error('El navegador no permite notificaciones.');
  if (!('serviceWorker' in navigator)) throw new Error('El navegador no admite PWA.');
  if (!('PushManager' in window)) throw new Error('El navegador no admite push.');

  const publicKey = config().PUSH?.VAPID_PUBLIC_KEY || '';
  if (!publicKey || publicKey.includes('REEMPLAZA')) throw new Error('Falta configurar VAPID_PUBLIC_KEY.');

  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('No se concedió permiso para avisos.');

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey)
    });
  }

  return subscription;
}

async function savePushSubscription(subscription) {
  const json = subscription.toJSON();
  await rest('web_push_subscriptions', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      owner_id: currentUser.id,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
      user_agent: navigator.userAgent,
      enabled: true
    })
  });
}

async function callPushFunction(payload) {
  const session = getSession();
  const response = await fetch(functionEndpoint(), {
    method: 'POST',
    headers: {
      apikey: config().SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, message: data.message || data.error || '', data };
}

function base64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

async function boot() {
  injectIcons();
  setupBasics();
  setupNavigation();
  setupLogin();
  setupForms();
  setupPwa();
  await registerServiceWorker();
  await setupPush();

  renderAccess();

  if (currentUser) {
    await loadAll();
  }

  const hash = location.hash.slice(1);
  if (hash) showScreen(hash);
}

boot().catch((error) => {
  console.error(error);
  setStatus(error.message || 'VITA no pudo iniciarse.', 'error');
});

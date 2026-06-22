const ICONS = {
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path><circle cx="12" cy="12" r="10"></circle></svg>',
  pill: '<svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a5 5 0 0 0-7-7l-10 10a5 5 0 0 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M9 15h6"></path><path d="M9 18h6"></path></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M19 14c1.5-1.5 3-3.7 3-6a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 2.3 1.5 4.5 3 6l5 5Z"></path></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 8 5-5 5 5"></path><path d="M20 16.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3.5"></path></svg>',
  cart: '<svg viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.86a2 2 0 0 0 2-1.63L21 8H5.12"></path></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16"></path><path d="M5 12v4a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-4"></path><path d="M7 12V7a3 3 0 0 1 6 0"></path><path d="M13 7h3"></path></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"></path><path d="M18 2v4"></path><path d="M20 4h-4"></path></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M12 2s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z"></path></svg>',
  zap: '<svg viewBox="0 0 24 24"><path d="M13 2 3 14h8l-1 8 10-12h-8Z"></path></svg>',
  smile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',
  car: '<svg viewBox="0 0 24 24"><path d="M19 17h2l-2-6H5l-2 6h2"></path><path d="M6 17h12"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M7 11l1.5-4h7L17 11"></path></svg>',
  hammer: '<svg viewBox="0 0 24 24"><path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"></path><path d="m17.6 2.4 4 4"></path><path d="m14 6 4 4"></path><path d="m3 21 3-3"></path></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"></path><path d="m9 12 2 2 4-4"></path></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>',
  gift: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13"></path><path d="M3 12h18"></path><path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8"></path><path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8"></path></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
};

const SESSION_KEY = 'vita_session_v050';
let currentUser = null;
let currentProfile = null;
let currentHousehold = null;
let currentLists = {
  shared: null,
  personal: null,
  wishlist: null
};
let currentHouseholdMembers = [];
  healthRecords = [];
  medicalAppointments = [];
let healthRecords = [];
  medicalAppointments = [];
let medicalAppointments = [];

const HEALTH_TYPES = {
  bathroom: { label: 'Baño', icon: 'bath' },
  symptoms: { label: 'Síntomas', icon: 'user' },
  sleep: { label: 'Sueño', icon: 'moon' },
  period: { label: 'Regla', icon: 'drop' },
  pain: { label: 'Dolor', icon: 'zap' },
  mood: { label: 'Ánimo', icon: 'smile' },
  note: { label: 'Nota rápida', icon: 'note' }
};

function getConfig() {
  return window.VITA_CONFIG || {};
}

function getAuthEndpoint(path) {
  const config = getConfig();
  return `${config.SUPABASE_URL}/auth/v1/${path}`;
}

function getAuthHeaders(accessToken) {
  const config = getConfig();
  const headers = {
    apikey: config.SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}


function getRestEndpoint(path) {
  const config = getConfig();
  return `${config.SUPABASE_URL}/rest/v1/${path}`;
}

async function restRequest(path, options = {}) {
  const session = getStoredSession();
  if (!session || !session.access_token) {
    throw new Error('Sesión no disponible.');
  }

  const headers = {
    apikey: getConfig().SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(getRestEndpoint(path), {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = 'No se pudo completar la operación.';
    try {
      const payload = await response.json();
      message = payload.message || payload.error || message;
    } catch {
      /* Sin cuerpo JSON. */
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function encodeFilter(value) {
  return encodeURIComponent(value);
}


function normalizeLoginName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveLoginEmail(value) {
  const rawValue = String(value || '').trim();

  if (!rawValue) return null;

  if (rawValue.includes('@')) {
    return rawValue.toLowerCase();
  }

  const aliases = getConfig().USER_ALIASES || {};
  const normalized = normalizeLoginName(rawValue);

  for (const [alias, email] of Object.entries(aliases)) {
    if (normalizeLoginName(alias) === normalized) {
      return email;
    }
  }

  return null;
}

function getDisplayNameForEmail(email) {
  const names = getConfig().USER_DISPLAY_NAMES || {};
  return names[email] || email || 'Usuario';
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session || !session.access_token || !session.user) return null;
    return session;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function signInWithPassword(email, password) {
  const response = await fetch(getAuthEndpoint('token?grant_type=password'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token || !payload.user) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  return payload;
}

async function recoverPassword(email) {
  const response = await fetch(getAuthEndpoint('recover'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      email,
      redirect_to: window.location.href.split('#')[0]
    })
  });

  if (!response.ok) {
    throw new Error('No se pudo enviar la recuperación.');
  }
}

async function signOut() {
  const session = getStoredSession();

  if (session && session.access_token) {
    try {
      await fetch(getAuthEndpoint('logout'), {
        method: 'POST',
        headers: getAuthHeaders(session.access_token)
      });
    } catch {
      /* La sesión local se elimina igualmente. */
    }
  }

  clearSession();
  currentUser = null;
  currentProfile = null;
  currentHousehold = null;
  currentLists = { shared: null, personal: null, wishlist: null };
  currentHouseholdMembers = [];
  healthRecords = [];
  medicalAppointments = [];
}

function injectIcons() {
  document.querySelectorAll('.app-icon').forEach((node) => {
    const key = node.dataset.icon;
    node.innerHTML = ICONS[key] || ICONS.heart;
  });
}

function setLoginMessage(text, type = 'neutral') {
  const node = document.getElementById('login-message');
  if (!node) return;
  node.textContent = text;
  node.dataset.type = type;
}

function setText(node, value) {
  if (node) node.textContent = value;
}

function updateUserText() {
  const displayName = currentUser ? getDisplayNameForEmail(currentUser.email) : 'Usuario';

  setText(document.getElementById('hello-title'), `Hola, ${displayName} 👋`);
  setText(document.getElementById('account-mini-title'), displayName);
  setText(document.getElementById('account-mini-text'), 'Sesión privada activa.');
  setText(document.getElementById('auth-title'), 'Sesión iniciada');
  setText(document.getElementById('auth-message'), displayName);
  setText(document.getElementById('session-email'), displayName);
  setText(document.getElementById('session-mode'), 'Sesión segura');
  setText(document.getElementById('auth-helper'), 'Tus datos se protegen con sesión privada.');
}

function renderAccess(forceLogin = false) {
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app');
  const canEnter = Boolean(currentUser && !forceLogin);

  loginScreen.classList.toggle('is-hidden', canEnter);
  appShell.classList.toggle('is-hidden', !canEnter);

  if (canEnter) {
    updateUserText();
  } else {
    setLoginMessage('Introduce tu usuario y contraseña.', 'neutral');
  }
}

function setupLogin() {
  const form = document.getElementById('password-login-form');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const togglePassword = document.getElementById('toggle-password');
  const forgotButton = document.getElementById('forgot-password');
  const logoutButton = document.getElementById('logout-button');

  form.noValidate = true;
  usernameInput.type = 'text';

  togglePassword.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = resolveLoginEmail(username);

    if (!username || !password) {
      setLoginMessage('Escribe usuario y contraseña.', 'warning');
      return;
    }

    if (!email) {
      setLoginMessage('Usuario no reconocido.', 'error');
      return;
    }

    try {
      setLoginMessage('Accediendo...', 'neutral');
      const session = await signInWithPassword(email, password);
      saveSession(session);
      currentUser = session.user;
      passwordInput.value = '';
      renderAccess();
      showScreen('hoy');
      await initializePrivateData();
    } catch (error) {
      setLoginMessage(error.message || 'Usuario o contraseña incorrectos.', 'error');
    }
  });

  forgotButton.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const email = resolveLoginEmail(username);

    if (!username) {
      setLoginMessage('Escribe tu usuario para recuperar la contraseña.', 'warning');
      return;
    }

    if (!email) {
      setLoginMessage('Usuario no reconocido.', 'error');
      return;
    }

    try {
      await recoverPassword(email);
      setLoginMessage('Revisa el correo asociado a tu usuario.', 'success');
    } catch {
      setLoginMessage('No se pudo enviar la recuperación.', 'error');
    }
  });

  logoutButton.addEventListener('click', async () => {
    await signOut();
    renderAccess(true);
  });
}

function setupDate() {
  const dateNode = document.getElementById('today-date');
  if (!dateNode) return;

  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  dateNode.textContent = formatter.format(new Date());
}

function showScreen(target) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('is-active', screen.dataset.screen === target);
  });

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.target === target);
  });

  const visibleScreen = document.querySelector(`.screen[data-screen="${target}"]`);
  if (visibleScreen) visibleScreen.scrollTop = 0;
}

function setupNavigation() {
  document.querySelectorAll('.nav-item, .js-go').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.target));
  });
}

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem('vita-health-records') || '[]');
  } catch {
    return [];
  }
}

function setRecords(records) {
  localStorage.setItem('vita-health-records', JSON.stringify(records));
}

function renderHealthRecords() {
  const list = document.getElementById('health-list');
  if (!list) return;

  const records = getRecords();

  if (!records.length) {
    list.innerHTML = '<p class="empty">Todavía no hay registros. Pulsa un botón de arriba para probar.</p>';
    return;
  }

  list.innerHTML = records.slice(0, 8).map((record) => {
    const hour = new Date(record.createdAt).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="activity-row">
        <span class="app-icon" data-icon="note"></span>
        <div>
          <strong>${escapeHtml(record.kind)}</strong>
          <span>Registro rápido guardado en este dispositivo</span>
        </div>
        <small>${hour}</small>
      </div>
    `;
  }).join('');

  injectIcons();
}


function setupHealthRecords() {
  setDefaultHealthDate();

  document.querySelectorAll('.js-health-record').forEach((button) => {
    button.addEventListener('click', async () => {
      const type = button.dataset.kind;
      await saveHealthRecord({
        type,
        occurredAt: new Date().toISOString(),
        note: '',
        intensity: null,
        quick: true
      });
    });
  });

  const form = document.getElementById('health-detail-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const type = document.getElementById('health-type-input').value;
      const dateValue = document.getElementById('health-date-input').value;
      const intensityValue = document.getElementById('health-intensity-input').value;
      const note = document.getElementById('health-note-input').value.trim();

      const occurredAt = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();

      await saveHealthRecord({
        type,
        occurredAt,
        note,
        intensity: intensityValue ? Number(intensityValue) : null,
        quick: false
      });

      document.getElementById('health-note-input').value = '';
      document.getElementById('health-intensity-input').value = '';
      setDefaultHealthDate();
    });
  }

  const refreshButton = document.getElementById('refresh-health');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => loadHealthRecords());
  }
}

function setDefaultHealthDate() {
  const input = document.getElementById('health-date-input');
  if (!input) return;

  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  input.value = local.toISOString().slice(0, 16);
}

async function saveHealthRecord({ type, occurredAt, note, intensity, quick }) {
  if (!currentUser) {
    setLoginMessage('Inicia sesión para guardar registros.', 'error');
    return;
  }

  const typeInfo = HEALTH_TYPES[type] || HEALTH_TYPES.note;
  const payload = {
    owner_id: currentUser.id,
    record_type: type,
    occurred_at: occurredAt,
    value_text: note || (quick ? 'Registro rápido' : null),
    intensity,
    notes: note || null,
    metadata: {
      quick: Boolean(quick),
      label: typeInfo.label
    }
  };

  try {
    await restRequest('health_records', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    });

    await loadHealthRecords();
    showSyncStatus('Registro de salud guardado.', 'success');
  } catch (error) {
    showSyncStatus(error.message || 'No se pudo guardar el registro de salud.', 'error');
  }
}

async function loadHealthRecords() {
  const list = document.getElementById('health-list');
  if (list) {
    list.innerHTML = '<p class="empty">Cargando registros...</p>';
  }

  if (!currentUser) {
    renderHealthRecords([]);
    return;
  }

  try {
    healthRecords = await restRequest(`health_records?select=id,record_type,occurred_at,value_text,intensity,notes,metadata,created_at&owner_id=eq.${encodeFilter(currentUser.id)}&order=occurred_at.desc&limit=30`);
    renderHealthRecords(healthRecords);
    renderHealthStats(healthRecords);
  } catch (error) {
    if (list) {
      list.innerHTML = '<p class="empty error-text">No se pudieron cargar los registros de salud. Ejecuta el SQL de VITA v0.8.</p>';
    }
    renderHealthStats([]);
  }
}

function renderHealthRecords(records = []) {
  const list = document.getElementById('health-list');
  if (!list) return;

  if (!records.length) {
    list.innerHTML = '<p class="empty">Todavía no hay registros de salud.</p>';
    return;
  }

  list.innerHTML = records.map((record) => {
    const typeInfo = HEALTH_TYPES[record.record_type] || HEALTH_TYPES.note;
    const date = new Date(record.occurred_at);
    const hour = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const note = record.notes || record.value_text || 'Registro rápido';
    const intensity = record.intensity ? `<span class="record-intensity">Intensidad ${record.intensity}/10</span>` : '';

    return `
      <div class="health-record-card">
        <span class="record-icon app-icon" data-icon="${escapeHtml(typeInfo.icon)}"></span>
        <div>
          <h3>${escapeHtml(typeInfo.label)}</h3>
          <p>${escapeHtml(note)}</p>
          ${intensity}
        </div>
        <small>${day}<br>${hour}</small>
      </div>
    `;
  }).join('');

  injectIcons();
}

function renderHealthStats(records = []) {
  const today = new Date().toISOString().slice(0, 10);

  const todayRecords = records.filter((record) => {
    return new Date(record.occurred_at).toISOString().slice(0, 10) === today;
  });

  const bathroom = todayRecords.filter((record) => record.record_type === 'bathroom');

  setText(document.getElementById('health-count-total'), String(todayRecords.length));
  setText(document.getElementById('health-count-bathroom'), String(bathroom.length));
}



function setupShoppingForms() {
  setupListTabs();
  setupSimpleListForm('shared-shopping-form', 'shared-shopping-input', 'shared');
  setupSimpleListForm('personal-shopping-form', 'personal-shopping-input', 'personal');
  setupWishlistForm();
}

function setupListTabs() {
  document.querySelectorAll('[data-list-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.listTab;

      document.querySelectorAll('[data-list-tab]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });

      document.querySelectorAll('[data-list-section]').forEach((section) => {
        section.classList.toggle('is-filtered-out', selected !== 'all' && section.dataset.listSection !== selected);
      });
    });
  });
}

function setupSimpleListForm(formId, inputId, listKey) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);

  if (!form || !input) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = input.value.trim();
    if (!title) return;

    const list = currentLists[listKey];
    if (!list) {
      showSyncStatus('La lista todavía no está preparada.', 'error');
      return;
    }

    input.disabled = true;

    try {
      await createListItem({ listId: list.id, title });
      input.value = '';
      await loadListsAndItems();
      showSyncStatus('Lista actualizada.', 'success');
    } catch (error) {
      showSyncStatus(error.message || 'No se pudo añadir el elemento.', 'error');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
}

function setupWishlistForm() {
  const form = document.getElementById('wishlist-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const list = currentLists.wishlist;
    const titleInput = document.getElementById('wishlist-title-input');
    const urlInput = document.getElementById('wishlist-url-input');
    const imageInput = document.getElementById('wishlist-image-input');
    const priceInput = document.getElementById('wishlist-price-input');
    const noteInput = document.getElementById('wishlist-note-input');

    const title = titleInput.value.trim();

    if (!title) {
      showSyncStatus('Escribe el artículo que quieres guardar.', 'error');
      titleInput.focus();
      return;
    }

    if (!list) {
      showSyncStatus('La lista de deseos todavía no está preparada.', 'error');
      return;
    }

    const selectedViewers = Array.from(document.querySelectorAll('.js-wishlist-viewer:checked')).map((input) => input.value);

    const payload = {
      listId: list.id,
      title,
      url: urlInput.value.trim() || null,
      imagePath: imageInput.value.trim() || null,
      priceEstimate: priceInput.value ? Number(priceInput.value) : null,
      notes: noteInput.value.trim() || null,
      metadata: {
        occasion: noteInput.value.trim() || null
      }
    };

    form.querySelectorAll('input, button').forEach((field) => field.disabled = true);

    try {
      const item = await createListItem(payload, true);
      if (selectedViewers.length) {
        await setWishlistViewers(item.id, selectedViewers);
      }

      form.reset();
      await loadListsAndItems();
      showSyncStatus('Deseo guardado.', 'success');
    } catch (error) {
      showSyncStatus(error.message || 'No se pudo guardar el deseo.', 'error');
    } finally {
      form.querySelectorAll('input, button').forEach((field) => field.disabled = false);
    }
  });
}

async function initializePrivateData() {
  try {
    showSyncStatus('Sincronizando listas...', 'neutral');
    await loadProfileAndHousehold();
    await loadListsAndItems();
    await loadHealthRecords();
    await loadMedicalAppointments();
    showSyncStatus('Listas, salud y citas conectadas a Supabase.', 'success');
  } catch (error) {
    showSyncStatus(error.message || 'No se pudieron cargar las listas.', 'error');
    renderListError();
  }
}

async function loadProfileAndHousehold() {
  if (!currentUser || !currentUser.id) {
    throw new Error('Sesión no disponible.');
  }

  const profiles = await restRequest(`profiles?select=id,email,preferred_name,avatar_initial&id=eq.${encodeFilter(currentUser.id)}&limit=1`);
  currentProfile = profiles && profiles.length ? profiles[0] : null;

  if (!currentProfile) {
    throw new Error('No se encontró el perfil del usuario.');
  }

  const memberships = await restRequest(`household_members?select=household_id,role,status&user_id=eq.${encodeFilter(currentUser.id)}&status=eq.active&limit=1`);
  const membership = memberships && memberships.length ? memberships[0] : null;

  if (!membership) {
    currentHousehold = null;
    currentHouseholdMembers = [];
  healthRecords = [];
  medicalAppointments = [];
    renderWishlistViewerOptions();
    return;
  }

  const households = await restRequest(`households?select=id,name&id=eq.${encodeFilter(membership.household_id)}&limit=1`);
  currentHousehold = households && households.length ? households[0] : null;

  const members = await restRequest(`household_members?select=user_id,role,status&household_id=eq.${encodeFilter(membership.household_id)}&status=eq.active&order=created_at.asc`);
  const ids = members.map((member) => member.user_id);

  if (!ids.length) {
    currentHouseholdMembers = [];
  healthRecords = [];
  medicalAppointments = [];
    renderWishlistViewerOptions();
    return;
  }

  const profilesFilter = ids.map((id) => `"${id}"`).join(',');
  const memberProfiles = await restRequest(`profiles?select=id,email,preferred_name,avatar_initial&id=in.(${profilesFilter})`);

  currentHouseholdMembers = memberProfiles.map((profile) => ({
    ...profile,
    display_name: profile.preferred_name || getDisplayNameForEmail(profile.email)
  }));

  renderWishlistViewerOptions();
}

async function loadListsAndItems() {
  if (!currentProfile) {
    await loadProfileAndHousehold();
  }

  const lists = await restRequest('shopping_lists?select=id,owner_id,household_id,visibility,name,list_type&order=created_at.asc');

  currentLists.shared = lists.find((list) => list.list_type === 'household' && list.visibility === 'household') || null;
  currentLists.personal = lists.find((list) => list.list_type === 'personal' && list.owner_id === currentUser.id) || null;
  currentLists.wishlist = lists.find((list) => list.list_type === 'wishlist' && list.owner_id === currentUser.id) || null;

  const sharedItems = await getItemsForList(currentLists.shared);
  const personalItems = await getItemsForList(currentLists.personal);
  const wishlistItems = await getItemsForList(currentLists.wishlist);
  const sharedWishItems = await getSharedWishlistItems(sharedItems, personalItems, wishlistItems);

  renderList('shared-list-items', currentLists.shared, sharedItems, 'shared');
  renderList('personal-list-items', currentLists.personal, personalItems, 'personal');
  renderWishlistList('wishlist-items', currentLists.wishlist, wishlistItems, 'wishlist');
  renderWishlistList('shared-wishlist-items', { id: 'shared-wishlist' }, sharedWishItems, 'shared-wishlist');
}

async function getItemsForList(list) {
  if (!list) return [];

  return restRequest(`shopping_list_items?select=id,list_id,owner_id,title,status,notes,url,image_path,price_estimate,metadata,created_at&list_id=eq.${encodeFilter(list.id)}&order=created_at.asc`);
}

async function getSharedWishlistItems(sharedItems, personalItems, wishlistItems) {
  const knownIds = new Set([
    ...sharedItems.map((item) => item.id),
    ...personalItems.map((item) => item.id),
    ...wishlistItems.map((item) => item.id)
  ]);

  const allVisible = await restRequest('shopping_list_items?select=id,list_id,owner_id,title,status,notes,url,image_path,price_estimate,metadata,created_at&order=created_at.desc');

  return allVisible.filter((item) => {
    return item.owner_id !== currentUser.id && !knownIds.has(item.id);
  });
}

async function createListItem(options, returnRepresentation = false) {
  const payload = {
    list_id: options.listId,
    owner_id: currentUser.id,
    title: options.title,
    status: 'pending'
  };

  if (options.notes) payload.notes = options.notes;
  if (options.url) payload.url = options.url;
  if (options.imagePath) payload.image_path = options.imagePath;
  if (options.priceEstimate !== null && options.priceEstimate !== undefined && !Number.isNaN(options.priceEstimate)) {
    payload.price_estimate = options.priceEstimate;
  }
  if (options.metadata) payload.metadata = options.metadata;

  const result = await restRequest('shopping_list_items', {
    method: 'POST',
    headers: { Prefer: returnRepresentation ? 'return=representation' : 'return=minimal' },
    body: JSON.stringify(payload)
  });

  return returnRepresentation ? result[0] : null;
}

async function setWishlistViewers(itemId, viewerIds) {
  const rows = viewerIds
    .filter((viewerId) => viewerId !== currentUser.id)
    .map((viewerId) => ({
      item_id: itemId,
      viewer_id: viewerId
    }));

  if (!rows.length) return;

  await restRequest('wishlist_viewers', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(rows)
  });
}

async function updateListItemStatus(itemId, checked) {
  await restRequest(`shopping_list_items?id=eq.${encodeFilter(itemId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: checked ? 'bought' : 'pending' })
  });
}

async function updateListItemTitle(itemId, currentTitle) {
  const nextTitle = window.prompt('Editar elemento', currentTitle);
  if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === currentTitle) return;

  await restRequest(`shopping_list_items?id=eq.${encodeFilter(itemId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ title: nextTitle.trim() })
  });
}

async function deleteListItem(itemId) {
  const confirmed = window.confirm('¿Eliminar este elemento?');
  if (!confirmed) return;

  await restRequest(`shopping_list_items?id=eq.${encodeFilter(itemId)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
}

function renderList(containerId, list, items, listKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!list) {
    container.innerHTML = '<p class="empty">Lista no encontrada. Revisa que el SQL de VITA esté ejecutado.</p>';
    return;
  }

  if (!items || !items.length) {
    container.innerHTML = '<p class="empty">Todavía no hay elementos.</p>';
    return;
  }

  container.innerHTML = items.map((item) => {
    const checked = item.status === 'bought' ? 'checked' : '';
    const status = item.status === 'bought' ? 'Comprado' : 'Pendiente';

    return `
      <div class="list-item-card" data-list="${escapeHtml(listKey)}">
        <label class="list-item-main">
          <input class="js-item-status" type="checkbox" data-id="${escapeHtml(item.id)}" ${checked}>
          <span>${escapeHtml(item.title)}</span>
        </label>
        <em>${status}</em>
        <div class="item-actions">
          <button class="js-edit-item" type="button" data-id="${escapeHtml(item.id)}" data-title="${escapeHtml(item.title)}">Editar</button>
          <button class="js-delete-item danger-text" type="button" data-id="${escapeHtml(item.id)}">Borrar</button>
        </div>
      </div>
    `;
  }).join('');

  bindListItemEvents(container);
}

function renderWishlistList(containerId, list, items, listKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!list) {
    container.innerHTML = '<p class="empty">Lista no encontrada. Revisa que el SQL de VITA esté ejecutado.</p>';
    return;
  }

  if (!items || !items.length) {
    container.innerHTML = '<p class="empty">Todavía no hay deseos guardados.</p>';
    return;
  }

  container.innerHTML = items.map((item) => {
    const image = item.image_path ? `<img src="${escapeHtml(item.image_path)}" alt="">` : `<span class="app-icon" data-icon="gift"></span>`;
    const price = item.price_estimate ? `<strong>${Number(item.price_estimate).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>` : '';
    const notes = item.notes ? `<small>${escapeHtml(item.notes)}</small>` : '';
    const link = item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Ver enlace</a>` : '';
    const isOwner = item.owner_id === currentUser.id;

    return `
      <article class="wish-real-card" data-list="${escapeHtml(listKey)}">
        <div class="wish-real-thumb">${image}</div>
        <div class="wish-real-body">
          <h3>${escapeHtml(item.title)}</h3>
          ${notes}
          <div class="wish-meta">
            ${price}
            ${link}
          </div>
          ${isOwner ? `
            <div class="item-actions">
              <button class="js-edit-item" type="button" data-id="${escapeHtml(item.id)}" data-title="${escapeHtml(item.title)}">Editar</button>
              <button class="js-delete-item danger-text" type="button" data-id="${escapeHtml(item.id)}">Borrar</button>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');

  injectIcons();
  bindListItemEvents(container);
}

function bindListItemEvents(container) {
  container.querySelectorAll('.js-item-status').forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      checkbox.disabled = true;
      try {
        await updateListItemStatus(checkbox.dataset.id, checkbox.checked);
        await loadListsAndItems();
        showSyncStatus('Lista actualizada.', 'success');
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        showSyncStatus(error.message || 'No se pudo actualizar.', 'error');
      } finally {
        checkbox.disabled = false;
      }
    });
  });

  container.querySelectorAll('.js-edit-item').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await updateListItemTitle(button.dataset.id, button.dataset.title);
        await loadListsAndItems();
        showSyncStatus('Elemento actualizado.', 'success');
      } catch (error) {
        showSyncStatus(error.message || 'No se pudo editar.', 'error');
      }
    });
  });

  container.querySelectorAll('.js-delete-item').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await deleteListItem(button.dataset.id);
        await loadListsAndItems();
        showSyncStatus('Elemento eliminado.', 'success');
      } catch (error) {
        showSyncStatus(error.message || 'No se pudo borrar.', 'error');
      }
    });
  });
}

function renderWishlistViewerOptions() {
  const container = document.getElementById('wishlist-viewers');
  if (!container) return;

  const viewers = (currentHouseholdMembers || []).filter((member) => member.id !== currentUser?.id);

  if (!viewers.length) {
    container.innerHTML = '<p class="empty">No hay otros usuarios disponibles.</p>';
    return;
  }

  container.innerHTML = viewers.map((member) => {
    const name = member.preferred_name || getDisplayNameForEmail(member.email);
    return `
      <label class="viewer-option">
        <input class="js-wishlist-viewer" type="checkbox" value="${escapeHtml(member.id)}">
        <span>${escapeHtml(name)}</span>
      </label>
    `;
  }).join('');
}

function renderListError() {
  ['shared-list-items', 'personal-list-items', 'wishlist-items', 'shared-wishlist-items'].forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<p class="empty error-text">No se pudieron cargar los datos.</p>';
    }
  });
}

function showSyncStatus(message, type = 'neutral') {
  const node = document.getElementById('sync-status');
  if (!node) return;
  node.textContent = message;
  node.dataset.type = type;
}




function setupMedicalAppointments() {
  setDefaultAppointmentDate();
  setupAppointmentTabs();

  const form = document.getElementById('appointment-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const title = document.getElementById('appointment-title-input').value.trim();
      const dateValue = document.getElementById('appointment-date-input').value;
      const location = document.getElementById('appointment-location-input').value.trim();
      const provider = document.getElementById('appointment-provider-input').value.trim();
      const notes = document.getElementById('appointment-notes-input').value.trim();

      if (!title) {
        showSyncStatus('Escribe la especialidad o motivo de la cita.', 'error');
        return;
      }

      if (!dateValue) {
        showSyncStatus('Indica la fecha y hora de la cita.', 'error');
        return;
      }

      const payload = {
        owner_id: currentUser.id,
        title,
        appointment_at: new Date(dateValue).toISOString(),
        location: location || null,
        provider: provider || null,
        status: 'scheduled',
        notes: notes || null,
        needs_health_card: document.getElementById('appointment-card-needed-input').checked,
        needs_id_card: document.getElementById('appointment-id-needed-input').checked,
        needs_referral_document: document.getElementById('appointment-referral-needed-input').checked
      };

      try {
        await restRequest('medical_appointments', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(payload)
        });

        form.reset();
        setDefaultAppointmentDate();
        document.getElementById('appointment-card-needed-input').checked = true;
        await loadMedicalAppointments();
        showSyncStatus('Cita guardada.', 'success');
        selectAppointmentTab('upcoming');
      } catch (error) {
        showSyncStatus(error.message || 'No se pudo guardar la cita.', 'error');
      }
    });
  }

  const resultForm = document.getElementById('appointment-result-form');
  if (resultForm) {
    resultForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const id = document.getElementById('appointment-result-select').value;
      if (!id) {
        showSyncStatus('Selecciona una cita.', 'error');
        return;
      }

      const payload = {
        status: 'completed',
        summary: document.getElementById('appointment-summary-input').value.trim() || null,
        discharge_given: document.getElementById('appointment-discharge-input').checked,
        referral_given: document.getElementById('appointment-referral-given-input').checked,
        referral_for: document.getElementById('appointment-referral-for-input').value.trim() || null,
        followup_needed: document.getElementById('appointment-followup-needed-input').checked,
        completed_at: new Date().toISOString()
      };

      try {
        await restRequest(`medical_appointments?id=eq.${encodeFilter(id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(payload)
        });

        resultForm.reset();
        await loadMedicalAppointments();
        showSyncStatus('Resultado de la cita guardado.', 'success');
      } catch (error) {
        showSyncStatus(error.message || 'No se pudo guardar el resultado.', 'error');
      }
    });
  }
}

function setupAppointmentTabs() {
  document.querySelectorAll('[data-appointment-tab]').forEach((button) => {
    button.addEventListener('click', () => selectAppointmentTab(button.dataset.appointmentTab));
  });

  selectAppointmentTab('upcoming');
}

function selectAppointmentTab(selected) {
  document.querySelectorAll('[data-appointment-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.appointmentTab === selected);
  });

  document.querySelectorAll('[data-appointment-section]').forEach((section) => {
    section.classList.toggle('is-filtered-out', section.dataset.appointmentSection !== selected);
  });
}

function setDefaultAppointmentDate() {
  const input = document.getElementById('appointment-date-input');
  if (!input) return;

  const now = new Date();
  now.setHours(now.getHours() + 24);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  input.value = local.toISOString().slice(0, 16);
}

async function loadMedicalAppointments() {
  if (!currentUser) return;

  try {
    medicalAppointments = await restRequest(`medical_appointments?select=*&owner_id=eq.${encodeFilter(currentUser.id)}&order=appointment_at.asc`);
    renderMedicalAppointments();
    renderAppointmentSelect();
  } catch (error) {
    renderAppointmentsError();
  }
}

function renderMedicalAppointments() {
  const now = new Date();

  const upcoming = medicalAppointments.filter((item) => {
    return item.status === 'scheduled' && new Date(item.appointment_at) >= now;
  });

  const history = medicalAppointments.filter((item) => {
    return item.status !== 'scheduled' || new Date(item.appointment_at) < now;
  }).sort((a, b) => new Date(b.appointment_at) - new Date(a.appointment_at));

  renderAppointmentList('upcoming-appointments', upcoming, 'upcoming');
  renderAppointmentList('appointment-history', history, 'history');
}

function renderAppointmentList(containerId, items, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = mode === 'upcoming'
      ? '<p class="empty">No tienes citas próximas guardadas.</p>'
      : '<p class="empty">Todavía no hay citas en el historial.</p>';
    return;
  }

  container.innerHTML = items.map((item) => renderAppointmentCard(item, mode)).join('');
  bindAppointmentActions(container);
}

function renderAppointmentCard(item, mode) {
  const date = new Date(item.appointment_at);
  const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
  const month = date.toLocaleDateString('es-ES', { month: 'short' });
  const hour = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const tags = [];
  if (item.needs_health_card) tags.push('<span>Tarjeta sanitaria</span>');
  if (item.needs_id_card) tags.push('<span>DNI</span>');
  if (item.needs_referral_document) tags.push('<span class="warning">Llevar volante</span>');
  if (item.referral_given) tags.push('<span class="warning">Volante dado</span>');
  if (item.discharge_given) tags.push('<span>Alta</span>');
  if (item.followup_needed) tags.push('<span class="warning">Seguimiento</span>');

  const summary = item.summary
    ? `<div class="appointment-summary"><p>${escapeHtml(item.summary)}</p></div>`
    : '';

  const referral = item.referral_for
    ? `<p><strong>Volante:</strong> ${escapeHtml(item.referral_for)}</p>`
    : '';

  return `
    <article class="appointment-real-card">
      <div class="appointment-date-badge">
        <div>
          <strong>${escapeHtml(day)}</strong>
          <small>${escapeHtml(month)}</small>
        </div>
      </div>
      <div class="appointment-real-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(hour)}${item.location ? ' · ' + escapeHtml(item.location) : ''}</p>
        ${item.provider ? `<p>${escapeHtml(item.provider)}</p>` : ''}
        ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
        ${referral}
        ${summary}
        <div class="appointment-tags">${tags.join('')}</div>
        <div class="appointment-card-actions">
          ${mode === 'upcoming' ? `<button class="js-mark-completed" type="button" data-id="${escapeHtml(item.id)}">Completar</button>` : ''}
          <button class="js-delete-appointment danger-text" type="button" data-id="${escapeHtml(item.id)}">Borrar</button>
        </div>
      </div>
    </article>
  `;
}

function bindAppointmentActions(container) {
  container.querySelectorAll('.js-delete-appointment').forEach((button) => {
    button.addEventListener('click', async () => {
      const confirmed = window.confirm('¿Eliminar esta cita?');
      if (!confirmed) return;

      try {
        await restRequest(`medical_appointments?id=eq.${encodeFilter(button.dataset.id)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=minimal' }
        });
        await loadMedicalAppointments();
        showSyncStatus('Cita eliminada.', 'success');
      } catch (error) {
        showSyncStatus(error.message || 'No se pudo borrar la cita.', 'error');
      }
    });
  });

  container.querySelectorAll('.js-mark-completed').forEach((button) => {
    button.addEventListener('click', () => {
      selectAppointmentTab('history');
      const select = document.getElementById('appointment-result-select');
      if (select) {
        select.value = button.dataset.id;
      }
    });
  });
}

function renderAppointmentSelect() {
  const select = document.getElementById('appointment-result-select');
  if (!select) return;

  const options = medicalAppointments
    .slice()
    .sort((a, b) => new Date(b.appointment_at) - new Date(a.appointment_at))
    .map((item) => {
      const date = new Date(item.appointment_at);
      const label = `${item.title} · ${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
      return `<option value="${escapeHtml(item.id)}">${escapeHtml(label)}</option>`;
    })
    .join('');

  select.innerHTML = `<option value="">Selecciona una cita</option>${options}`;
}

function renderAppointmentsError() {
  const upcoming = document.getElementById('upcoming-appointments');
  const history = document.getElementById('appointment-history');

  if (upcoming) {
    upcoming.innerHTML = '<p class="empty error-text">No se pudieron cargar las citas. Ejecuta el SQL de VITA v0.9.</p>';
  }

  if (history) {
    history.innerHTML = '<p class="empty error-text">No se pudo cargar el historial.</p>';
  }
}

function setupDocumentDemo() {
  const downloadButton = document.getElementById('download-demo');
  const emailButton = document.getElementById('email-demo');

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const content = [
        'VITA · Documento de ejemplo',
        '',
        'Este archivo prueba la descarga de documentos generados por la app.',
        'Más adelante se generarán PDF, CSV, JSON y ZIP reales.'
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'vita_documento_ejemplo.txt';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });
  }

  if (emailButton) {
    emailButton.addEventListener('click', () => {
      const subject = encodeURIComponent('Documento generado por VITA');
      const body = encodeURIComponent('Adjunto o comparto un documento generado por VITA.\n\nEn una versión posterior el envío se hará desde servidor.');
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

function boot() {
  injectIcons();
  setupDate();
  setupNavigation();
  setupLogin();
  setupHealthRecords();
  setupMedicalAppointments();
  setupShoppingForms();
  setupDocumentDemo();
  renderHealthRecords([]);

  const stored = getStoredSession();
  currentUser = stored ? stored.user : null;
  renderAccess();
  if (currentUser) {
    initializePrivateData();
  }
  registerServiceWorker();
}

boot();

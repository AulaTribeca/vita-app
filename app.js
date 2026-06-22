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

let supabaseClient = null;
let currentUser = null;

function injectIcons() {
  document.querySelectorAll('.app-icon').forEach((node) => {
    const key = node.dataset.icon;
    node.innerHTML = ICONS[key] || ICONS.heart;
  });
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
  document.querySelectorAll('.js-health-record').forEach((button) => {
    button.addEventListener('click', () => {
      const records = getRecords();
      records.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        kind: button.dataset.kind,
        createdAt: new Date().toISOString()
      });
      setRecords(records);
      renderHealthRecords();
    });
  });

  const clearButton = document.getElementById('clear-health');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      localStorage.removeItem('vita-health-records');
      renderHealthRecords();
    });
  }
}

function getConfig() {
  return window.VITA_CONFIG || {};
}


function isSupabaseReady() {
  const config = getConfig();
  return Boolean(
    config.SUPABASE_URL &&
    config.SUPABASE_ANON_KEY &&
    window.supabase &&
    typeof window.supabase.createClient === 'function'
  );
}



function loadSupabaseScriptIfNeeded() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-vita-supabase-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.async = true;
    script.dataset.vitaSupabaseLoader = 'true';
    script.onload = () => resolve(Boolean(window.supabase && typeof window.supabase.createClient === 'function'));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}


async function initSupabase() {
  await loadSupabaseScriptIfNeeded();

  if (!isSupabaseReady()) {
    renderAuthState();
    renderAppAccess();
    return;
  }

  try {
    const config = getConfig();
    supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data, error } = await supabaseClient.auth.getSession();
    currentUser = error ? null : (data && data.session ? data.session.user : null);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentUser = session ? session.user : null;
      renderAuthState();
      renderAppAccess();
    });

    renderAuthState();
    renderAppAccess();
  } catch (_error) {
    currentUser = null;
    supabaseClient = null;
    renderAuthState();
    renderAppAccess();
  }
}


function renderAuthState() {
  const title = document.getElementById('auth-title');
  const message = document.getElementById('auth-message');
  const helper = document.getElementById('auth-helper');
  const miniTitle = document.getElementById('account-mini-title');
  const miniText = document.getElementById('account-mini-text');
  const sessionEmail = document.getElementById('session-email');
  const sessionMode = document.getElementById('session-mode');

  if (!supabaseClient && !isSupabaseReady()) {
    setText(title, 'Acceso no disponible');
    setText(message, 'No se pudo conectar con el acceso privado. Recarga la página e inténtalo de nuevo.');
    setText(helper, 'La app permanecerá bloqueada hasta que el acceso esté disponible.');
    setText(miniTitle, 'Acceso protegido');
    setText(miniText, 'Inicia sesión para acceder a VITA.');
    setText(sessionEmail, 'Sin sesión iniciada');
    setText(sessionMode, 'Acceso bloqueado');
    return;
  }

  if (currentUser) {
    const displayName = getDisplayNameForEmail(currentUser.email);
    setText(title, 'Sesión iniciada');
    setText(message, displayName);
    setText(helper, 'Acceso privado activo.');
    setText(miniTitle, displayName);
    setText(miniText, 'Sesión privada activa.');
    setText(sessionEmail, displayName);
    setText(sessionMode, 'Sesión segura');
  } else {
    setText(title, 'Sesión no iniciada');
    setText(message, 'Para acceder a VITA debes iniciar sesión.');
    setText(helper, 'Acceso reservado a usuarios autorizados.');
    setText(miniTitle, 'VITA protegida');
    setText(miniText, 'Inicia sesión para acceder a la app.');
    setText(sessionEmail, 'Sin sesión iniciada');
    setText(sessionMode, 'Acceso bloqueado');
  }
}



function setupAuthButtons() {
  const loginForm = document.getElementById('password-login-form');
  const loginUsername = document.getElementById('login-username') || document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const forgotPassword = document.getElementById('forgot-password');
  const togglePassword = document.getElementById('toggle-password');
  const goLoginButton = document.getElementById('go-login-button');
  const logoutButton = document.getElementById('logout-button');

  if (loginForm) {
    loginForm.noValidate = true;
  }

  if (loginUsername) {
    loginUsername.type = 'text';
    loginUsername.placeholder = 'Patricia o Román';
    loginUsername.setAttribute('autocomplete', 'username');
    loginUsername.setAttribute('autocapitalize', 'none');
    loginUsername.setAttribute('spellcheck', 'false');
  }

  if (togglePassword && loginPassword) {
    togglePassword.addEventListener('click', () => {
      loginPassword.type = loginPassword.type === 'password' ? 'text' : 'password';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = loginUsername ? loginUsername.value.trim() : '';
      const password = loginPassword ? loginPassword.value : '';
      const email = resolveLoginEmail(username);

      if (!username || !password) {
        setLoginMessage('Escribe usuario y contraseña.', 'warning');
        return;
      }

      if (!email) {
        setLoginMessage('Usuario no reconocido.', 'error');
        return;
      }

      if (!isSupabaseReady() || !supabaseClient) {
        setLoginMessage('Preparando acceso...', 'neutral');
        await initSupabase();
      }

      if (!isSupabaseReady() || !supabaseClient) {
        setLoginMessage('No se pudo cargar el acceso privado. Recarga la página.', 'error');
        return;
      }

      setLoginMessage('Accediendo...', 'neutral');

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data || !data.user) {
        setLoginMessage('Usuario o contraseña incorrectos.', 'error');
        return;
      }

      currentUser = data.user;
      renderAuthState();
      renderAppAccess();
      showScreen('hoy');
    });
  }

  if (forgotPassword) {
    forgotPassword.addEventListener('click', async () => {
      if (!isSupabaseReady() || !supabaseClient) {
        await initSupabase();
      }

      if (!isSupabaseReady() || !supabaseClient) {
        setLoginMessage('No se pudo cargar el acceso privado. Recarga la página.', 'error');
        return;
      }

      const username = loginUsername ? loginUsername.value.trim() : '';
      const email = resolveLoginEmail(username);

      if (!username) {
        setLoginMessage('Escribe tu usuario para recuperar la contraseña.', 'warning');
        return;
      }

      if (!email) {
        setLoginMessage('Usuario no reconocido.', 'error');
        return;
      }

      const redirectTo = window.location.href.split('#')[0];
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        setLoginMessage('No se pudo enviar la recuperación de contraseña.', 'error');
      } else {
        setLoginMessage('Revisa el correo asociado a tu usuario.', 'success');
      }
    });
  }

  if (goLoginButton) {
    goLoginButton.addEventListener('click', () => {
      renderAppAccess(true);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      currentUser = null;
      renderAuthState();
      renderAppAccess(true);
    });
  }
}


function setupShoppingDemo() {
  const form = document.getElementById('shared-shopping-form');
  const input = document.getElementById('shared-shopping-input');

  if (!form || !input) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    const row = document.createElement('label');
    row.className = 'check-row';
    row.innerHTML = `
      <input type="checkbox">
      <span>${escapeHtml(value)}</span>
      <em>Nuevo</em>
    `;

    form.before(row);
    input.value = '';
  });
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
      ].join('\\n');

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
      const body = encodeURIComponent('Adjunto o comparto un documento generado por VITA.\\n\\nEn una versión posterior el envío se hará desde servidor.');
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });
  }
}




function normalizeLoginName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveLoginEmail(value) {
  const config = getConfig();
  const rawValue = String(value || '').trim();

  if (!rawValue) return null;

  if (rawValue.includes('@')) {
    return rawValue.toLowerCase();
  }

  const aliases = config.USER_ALIASES || {};
  const normalized = normalizeLoginName(rawValue);

  for (const [alias, email] of Object.entries(aliases)) {
    if (normalizeLoginName(alias) === normalized) {
      return email;
    }
  }

  return null;
}

function getDisplayNameForEmail(email) {
  const config = getConfig();
  const names = config.USER_DISPLAY_NAMES || {};
  return names[email] || email || 'Usuario';
}



function renderAppAccess(forceLogin = false) {
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app');
  const canEnter = !forceLogin && Boolean(isSupabaseReady() && currentUser);

  if (loginScreen) {
    loginScreen.classList.toggle('is-hidden', canEnter);
  }

  if (appShell) {
    appShell.classList.toggle('is-hidden', !canEnter);
  }

  if (!canEnter) {
    if (!isSupabaseReady()) {
      setLoginMessage('Cargando acceso privado...', 'neutral');
    } else {
      setLoginMessage('Introduce tu usuario y contraseña.', 'neutral');
    }
  }
}


function setLoginMessage(text, type = 'neutral') {
  const node = document.getElementById('login-message');
  if (!node) return;
  node.textContent = text;
  node.dataset.type = type;
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
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      console.info('Service worker no registrado en modo local.');
    });
  });
}

injectIcons();
setupDate();
setupNavigation();
setupHealthRecords();
setupAuthButtons();
setupShoppingDemo();
setupDocumentDemo();
renderHealthRecords();
initSupabase();
registerServiceWorker();

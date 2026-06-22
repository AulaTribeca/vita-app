/*
  VITA v0.4.3

  Configuración pública de Supabase para el frontend.

  Esta clave es publishable/anon, es decir, está pensada para usarse en la app cliente.
  No pegues aquí nunca la service_role key.

  La pantalla de acceso permite entrar con nombre de usuario.
  La app convierte internamente ese nombre en el email de Supabase.
*/

window.VITA_CONFIG = {
  SUPABASE_URL: "https://vbcqiggxpzlecilbukvn.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_MdUXjMd7qYe_he2OZoRXZQ_PJayheBR",
  APP_ENV: "production",
  APP_VERSION: "0.4.3",
  USER_ALIASES: {
    "patricia": "patricia@vitaapp.com",
    "patri": "patricia@vitaapp.com",
    "román": "roman@vitaapp.com",
    "roman": "roman@vitaapp.com"
  },
  USER_DISPLAY_NAMES: {
    "patricia@vitaapp.com": "Patricia",
    "roman@vitaapp.com": "Román"
  }
};

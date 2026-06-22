# VITA v0.4.3

Corrección del login por nombre de usuario.

## Qué corrige

- El campo Usuario queda forzado como texto, no como email.
- El formulario queda con `novalidate` para que el navegador no exija `@`.
- La app acepta:
  - `Patricia`
  - `Patri`
  - `Román`
  - `Roman`
- Internamente traduce esos nombres al email de Supabase.
- Se añade cache busting a `app.js` y `config.js`.
- Se actualiza la caché del service worker.

## Archivos modificados

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_3.md`

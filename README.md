# VITA v0.4.2

Nivel 4.2 de VITA.

## Qué cambia

- La pantalla de inicio de sesión ya no pide el email ficticio.
- Ahora se entra con nombre de usuario:
  - `Patricia`
  - `Román`
- La app convierte internamente ese usuario en el email de Supabase:
  - `patricia@vitaapp.com`
  - `roman@vitaapp.com`

## Seguridad

Supabase sigue usando email y contraseña por debajo, pero la interfaz no muestra ni exige el email ficticio.

No hay registro público en la app. Los usuarios deben seguir creándose en Supabase.

## Archivos modificados

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_2.md`

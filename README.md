# VITA v1.0.1 depurada

Versión de depuración antes de seguir con nuevas fases.

## Qué corrige

- Recupera el inicio de sesión.
- Corrige un error de JavaScript generado por variables duplicadas en `app.js`.
- Evita que un fallo en listas, salud, citas o volantes bloquee la pantalla de login.
- Separa el error de autenticación del error de sincronización de datos.
- Cambia la clave local de sesión para forzar una sesión limpia.
- Actualiza cachés a `v1.0.1`.

## Archivos modificados

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_0_1.md`

## No hace falta ejecutar SQL nuevo

Esta versión no cambia la base de datos. Solo corrige la app.

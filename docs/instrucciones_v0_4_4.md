# VITA v0.4.4

## Archivos que debes copiar encima

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_4.md`

## Después

1. Commit en GitHub Desktop:
   `VITA v0.4.4 acceso privado real`
2. Push origin.
3. Espera al despliegue.
4. Abre la app en incógnito.
5. Prueba:
   - Usuario: `Patricia`
   - Contraseña: la creada en Supabase

## Si no entra

Comprueba en Supabase:

Authentication → Sign In / Providers → Email

Debe estar activado el acceso por email/contraseña.

Después revisa en Authentication → Users que el usuario tenga contraseña y no esté bloqueado.

## Si sigue saliendo algo antiguo

Chrome puede conservar el service worker anterior.

Haz:

1. F12
2. Application
3. Service Workers → Unregister
4. Storage → Clear site data
5. Recargar

# VITA v2.0.1 VAPID configurado

# VITA v2.0 PWA + Push

Versión limpia para instalación como app móvil y notificaciones push reales.

## Qué incluye

- Paquete completo, no solo archivos sueltos.
- Manifest PWA completo.
- Iconos PNG 192 y 512, además de SVG.
- Service worker con caché, `push` y `notificationclick`.
- Panel de instalación PWA en Cuenta.
- Suscripción Push API desde el móvil.
- Guardado de suscripciones en Supabase.
- Preferencias de notificaciones por usuario.
- Edge Function `send-vita-push`.
- SQL de tablas, preferencias y eventos push.
- SQL opcional para programar el envío cada 15 minutos.

## Archivos principales

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `manifest.webmanifest`
- `assets/vita-icon.svg`
- `assets/vita-icon-192.png`
- `assets/vita-icon-512.png`
- `docs/supabase_v2_0_push.sql`
- `docs/supabase_v2_0_cron.sql`
- `supabase/functions/send-vita-push/index.ts`

## Supabase

Sí hay que tocar Supabase:

1. Ejecutar `docs/supabase_v2_0_push.sql`.
2. Crear claves VAPID.
3. Pegar la VAPID public key en `config.js`.
4. Guardar VAPID private key como secret de Edge Function.
5. Desplegar `supabase/functions/send-vita-push/index.ts`.
6. Programar cron con `docs/supabase_v2_0_cron.sql`.

Nunca pegues la service_role key en `config.js` ni en GitHub.


## VAPID

La public key ya está configurada en `config.js`. La private key está en `docs/VAPID_SECRETS_NO_SUBIR_A_GITHUB.md` solo para copiarla a Supabase Secrets. No la subas a GitHub si no quieres conservar secretos en el repositorio.

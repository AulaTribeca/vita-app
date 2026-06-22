# VITA v5.0, reconstrucción limpia

Esta versión deja de parchear las tablas antiguas y usa una base nueva y limpia:

- `vita_cards`: todo lo organizable de la vida diaria.
- `vita_push_subscriptions`: suscripciones push reales.

Las tablas antiguas no se borran. El SQL migra datos conocidos a `vita_cards` si existen.

## Orden obligatorio

1. Ejecuta `docs/supabase_v5_0_core.sql`.
2. Copia todos los archivos de esta carpeta en GitHub.
3. Despliega la Edge Function incluida en `supabase/functions/send-vita-push/index.ts`.
4. En Supabase Edge Function Secrets configura:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `CRON_SECRET`, inventa una cadena larga
5. Haz commit: `VITA v5.0 reconstruccion limpia`.
6. Borra la PWA anterior del móvil y reinstala.
7. En la app, entra en Avisos y pulsa:
   - Activar avisos
   - Prueba local
   - Prueba push real
8. Cuando la prueba push real funcione, ejecuta `docs/supabase_v5_0_cron_opcional.sql` cambiando `REEMPLAZA_CRON_SECRET`.

## Qué cambia

La app ya no muestra todo mezclado. Hay cuatro espacios principales:

- Hoy
- Módulos
- Calendario
- Avisos

Los módulos son tarjetas clicables. Al tocar una tarjeta se entra en su pantalla. Allí se ve lo que existe y se puede añadir, editar, borrar o marcar como hecho.

## Módulos

- Tareas
- Salud
- Citas médicas
- Medicación
- Hogar
- Compra
- Lista privada
- Deseos
- Wallet
- Contactos
- Viajes

## Push

Las push no pueden funcionar solo desde el frontend si la app está cerrada. Para avisos reales hace falta:

- Service Worker
- permiso de notificación
- suscripción Push
- Edge Function
- cron o llamada programada a la Edge Function

La pantalla Avisos diagnostica cada paso.

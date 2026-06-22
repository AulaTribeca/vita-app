# VITA v5.2.2, sin cron

Proyecto completo listo para subir a GitHub.

## Qué cambia

Se elimina el cron de notificaciones para evitar filtraciones de Bearer Token y dejar de depender de un secreto escrito en SQL.

La app mantiene:

- PWA completa.
- Login privado.
- Logo vegetal oficial.
- Tarjetas clicables.
- Hoy, Calendario, Salud, Hogar y Más.
- Prueba local de notificaciones.
- Prueba push real manual desde la app.
- Edge Function sin cron.

## SQL obligatorio

Ejecuta si todavía no tienes la base v5:

`docs/supabase_v5_2_core.sql`

## SQL para eliminar el cron

Ejecuta una vez:

`docs/supabase_v5_2_2_eliminar_cron.sql`

Este SQL no contiene secretos.

## Edge Function

Despliega:

`supabase/functions/send-vita-push/index.ts`

Secrets necesarios:

- `URL`
- `SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## GitHub

Commit sugerido:

`VITA v5.2.2 elimina cron`

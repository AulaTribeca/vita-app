# VITA ONE 2.0

Reconstrucción de VITA como asistente personal visual: menos módulos genéricos, más acompañamiento, UNED al frente, compra real y pantallas limpias.

## Qué incluye

- Hoy con guía activa.
- Compra con una entrada por producto, checkbox y tachado.
- Agenda con día, semana y mes.
- Salud con citas, volantes, medicación y registros.
- UNED como apartado principal.
- Hogar con facturas, coche, contactos y wallet.
- Más solo para tareas secundarias.
- PWA instalable.
- Edge Function para prueba push real manual.
- Sin cron y sin secretos en el proyecto.

## SQL obligatorio

Ejecuta:

`docs/supabase_vita_one_2_schema.sql`

## SQL recomendado

Ejecuta una vez para eliminar cron antiguo:

`docs/supabase_vita_one_2_eliminar_cron_antiguo.sql`

## Edge Function

Despliega:

`supabase/functions/send-vita-push/index.ts`

Secrets necesarios:

- `URL`
- `SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Commit sugerido

`VITA ONE 2.0`

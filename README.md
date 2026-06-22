# VITA ONE 1.0

Reconstrucción conceptual de VITA como asistente personal visual, no como colección de formularios.

## Prioridades reales

- Pantalla Hoy útil.
- Lista de la compra real, una entrada por producto.
- Checkbox y tachado de productos comprados.
- Salud con citas, volantes, medicación y registros.
- Medicación con stock y botón para añadir a farmacia.
- Hogar organizado por activos, coche, facturas y contactos.
- Calendario con día, semana, mes y año.
- Botón atrás del móvil funcional mediante historial del navegador.
- Sin cron y sin tokens reales en GitHub.

## SQL obligatorio

Ejecuta:

`docs/supabase_vita_one_schema.sql`

## SQL recomendado

Para eliminar cron antiguo si quedó programado:

`docs/supabase_vita_one_eliminar_cron_antiguo.sql`

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

`VITA ONE 1.0`

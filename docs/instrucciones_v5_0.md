# Instrucciones VITA v5.0

## 1. Supabase SQL

Ejecuta completo:

`docs/supabase_v5_0_core.sql`

No borra las tablas antiguas. Crea una base limpia para VITA v5.

## 2. Edge Function

Sustituye el contenido de:

`supabase/functions/send-vita-push/index.ts`

por el archivo incluido.

Secrets necesarios:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET`

## 3. GitHub

Copia todos los archivos y haz commit:

`VITA v5.0 reconstruccion limpia`

## 4. Móvil

Borra la PWA anterior y reinstala.

## 5. Prueba

En VITA:

1. Avisos → Activar avisos.
2. Avisos → Prueba local.
3. Avisos → Prueba push real.

## 6. Cron

Solo cuando la prueba push real funcione, ejecuta:

`docs/supabase_v5_0_cron_opcional.sql`

Cambia `REEMPLAZA_CRON_SECRET` por el secret real.

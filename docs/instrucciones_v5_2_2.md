# Instrucciones VITA v5.2.2

## 1. Copia archivos

Copia todo este proyecto en GitHub.

## 2. Ejecuta SQL base si hace falta

`docs/supabase_v5_2_core.sql`

## 3. Elimina el cron

Ejecuta:

`docs/supabase_v5_2_2_eliminar_cron.sql`

## 4. Despliega Edge Function

`supabase/functions/send-vita-push/index.ts`

## 5. Borra el secret innecesario

En Supabase → Edge Functions → Secrets, puedes borrar el secret del cron si existe.

## 6. Reinstala PWA

Borra la app del móvil y reinstálala desde GitHub Pages.

## 7. Prueba

En la app:

- Más → Activar avisos.
- Más → Prueba local.
- Más → Prueba push real.

La prueba push real sigue siendo manual. Sin cron no habrá envíos automáticos programados desde Supabase.

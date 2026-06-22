# Instrucciones VITA v5.2

## 1. Copiar archivos

Copia todo el contenido de este ZIP en tu repositorio.

## 2. Supabase

Ejecuta completo:

`docs/supabase_v5_2_core.sql`

Sí, hay que ejecutar SQL para instalación completa.

## 3. Edge Function

Despliega:

`supabase/functions/send-vita-push/index.ts`

Comprueba que tienes estos secrets:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `URL`
- `SERVICE_ROLE_KEY`
- `CRON_SECRET`

## 4. GitHub

Commit:

`VITA v5.2 instalacion completa`

## 5. Móvil

Borra la PWA anterior del móvil e instala de nuevo desde GitHub Pages.

## 6. Prueba de avisos

En la app:

1. Más
2. Revisar notificaciones push
3. Activar avisos
4. Prueba local
5. Prueba push real

## 7. Cron

Cuando la prueba push real funcione, ejecuta:

`docs/supabase_v5_2_cron_definitivo_sin_vault.sql`

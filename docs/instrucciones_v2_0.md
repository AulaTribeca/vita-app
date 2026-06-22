# VITA v2.0, instalación móvil y push real

## 1. Copiar archivos

Esta versión es un paquete completo. Copia todo el contenido del ZIP al proyecto, incluyendo:

- `manifest.webmanifest`
- carpeta `assets`
- carpeta `supabase`
- carpeta `docs`

## 2. Commit

En GitHub Desktop:

`VITA v2.0 PWA push`

## 3. Supabase SQL

Ejecuta:

`docs/supabase_v2_0_push.sql`

## 4. VAPID

Necesitas un par de claves VAPID.

- La public key va en `config.js`, en `PUSH.VAPID_PUBLIC_KEY`.
- La private key va en Supabase Edge Function Secrets, nunca en GitHub.
- `VAPID_SUBJECT` puede ser un correo tuyo, por ejemplo `mailto:tu-correo@dominio.com`.

## 5. Edge Function

Despliega la función:

`supabase/functions/send-vita-push/index.ts`

Secrets necesarios:

- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## 6. Cron

Cuando la Edge Function funcione, programa el envío:

`docs/supabase_v2_0_cron.sql`

Antes debes guardar en Supabase Vault el secreto `vita_edge_cron_token` con la service_role key.

## 7. Prueba

1. Abre VITA en el móvil.
2. Instálala como app.
3. Entra como Patricia.
4. Ve a Cuenta.
5. Pulsa Activar push.
6. Pulsa Probar push.
7. Crea una cita próxima, una medicación con stock bajo o una factura vencida.
8. Espera al cron o ejecuta manualmente la Edge Function.

# VITA v2.0.1, configuración VAPID

## 1. Archivo config.js

Esta versión ya trae pegada la VAPID public key en `config.js`.

## 2. Supabase Edge Function Secrets

En Supabase, añade estos secrets a la función `send-vita-push`:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `SUPABASE_SERVICE_ROLE_KEY`

Los valores exactos están en:

`docs/VAPID_SECRETS_NO_SUBIR_A_GITHUB.md`

## 3. Cuidado

Ese archivo contiene la VAPID private key. Puedes usarlo para copiar los valores, pero no lo subas a GitHub si tu repositorio no es privado o si no quieres dejar ahí el secreto.

## 4. Después

Cuando los secrets estén guardados, vuelve a desplegar o reiniciar la Edge Function si Supabase lo solicita. Después prueba desde VITA:

Cuenta → Activar push → Probar push.

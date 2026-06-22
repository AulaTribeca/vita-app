# VITA v5.1 definitiva

## 1. SQL obligatorio

Ejecuta completo en Supabase SQL Editor:

`docs/supabase_v5_1_core.sql`

Este SQL crea la estructura nueva y limpia de VITA:

- `vita_cards`
- `vita_push_subscriptions`

No borra las tablas antiguas.

## 2. Edge Function obligatoria para push real

Sustituye/despliega:

`supabase/functions/send-vita-push/index.ts`

La función ya acepta tanto los nombres automáticos de Supabase como los nombres que has usado tú:

- `SUPABASE_URL` o `URL`
- `SUPABASE_SERVICE_ROLE_KEY` o `SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` o `ANON_KEY`

## 3. Secrets de Edge Functions

Deben existir estos secrets:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `SERVICE_ROLE_KEY`, ya lo tienes creado así
- `URL`, ya lo tienes creado así
- `CRON_SECRET`

Valor de `URL`:

`https://vbcqiggxpzlecilbukvn.supabase.co`

Valor de `CRON_SECRET` si usaste el que te di:

`vita_cron_2026_pat_roman_9mK4vR8sQ2zL7xB5nF3pA6tY1cD0hW`

## 4. Subir a GitHub

Copia todos los archivos del proyecto y haz commit:

`VITA v5.1 definitiva`

## 5. Reinstalar PWA

Borra la app anterior del móvil e instala de nuevo desde GitHub Pages.

## 6. Prueba en la app

Entra en:

`Avisos`

Y pulsa, en este orden:

1. `Activar avisos`
2. `Prueba local`
3. `Prueba push real`

## 7. Cron definitivo

Solo cuando la prueba push real funcione, ejecuta:

`docs/supabase_v5_1_cron_definitivo_sin_vault.sql`

Este SQL no usa `vault`.

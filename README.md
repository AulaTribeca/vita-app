# VITA v5.1 definitiva

Proyecto completo listo para copiar a GitHub.

## Qué incluye

- App PWA completa.
- Logo vegetal original del mockup, con hojas en verde agua y morado.
- Service Worker.
- Manifest PWA.
- Edge Function `send-vita-push`.
- SQL principal.
- SQL de cron sin `vault`.

## Estructura funcional

VITA ya no está organizada como una sucesión de formularios. La app se estructura así:

- Hoy
- Módulos
- Calendario
- Avisos
- Cuenta

Cada módulo es una tarjeta clicable. Al entrar en un módulo se ve lo que hay y desde ahí se puede añadir, editar, borrar o marcar como hecho.

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

## SQL obligatorio

Ejecutar:

`docs/supabase_v5_1_core.sql`

## Edge Function

Desplegar:

`supabase/functions/send-vita-push/index.ts`

La función acepta estos nombres de secrets:

- `SUPABASE_URL` o `URL`
- `SUPABASE_SERVICE_ROLE_KEY` o `SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` o `ANON_KEY`

## Cron

Ejecutar solo cuando funcione la prueba push real:

`docs/supabase_v5_1_cron_definitivo_sin_vault.sql`

El cron usa directamente:

`Authorization: Bearer vita_cron_2026_pat_roman_9mK4vR8sQ2zL7xB5nF3pA6tY1cD0hW`

## Commit sugerido

`VITA v5.1 definitiva`

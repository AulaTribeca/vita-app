# VITA ONE HELÉNICA 1.0

Proyecto limpio desde cero.

No contiene:
- scripts de borrado;
- cron;
- secretos de cron;
- tokens privados;
- parches de versiones anteriores.

## Instalación

1. Sube todo el contenido del ZIP a GitHub.
2. Ejecuta en Supabase SQL Editor:

`docs/supabase_vita_one_helenica_1_0.sql`

3. Despliega, si quieres probar push manual:

`supabase/functions/send-vita-push/index.ts`

## Secrets para Edge Function

Solo para push manual:

- `URL`
- `SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Pantallas

- Hoy
- Compra
- Salud
- UNED
- Hogar
- Agenda

## Estética

Sistema visual helénico: mármol cálido, olivo, bronce, friso meandro, fragmento jónico y tarjetas tipo placa.

## Commit sugerido

`VITA ONE Helenica 1.0 limpia`

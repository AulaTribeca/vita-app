# VITA v5.2, instalación completa

Proyecto completo listo para instalar.

## Navegación oficial

- Hoy
- Calendario
- Salud
- Hogar
- Más

## Estructura

Cada apartado se organiza con tarjetas clicables. Al tocar una tarjeta se entra en su módulo y desde ahí se puede:

- ver lo existente;
- añadir;
- editar;
- borrar;
- marcar como hecho;
- programar avisos.

## Logo

Incluye el logo vegetal oficial de VITA en:

- `assets/vita-icon.svg`
- `assets/vita-logo.svg`
- `assets/vita-icon-192.png`
- `assets/vita-icon-512.png`

## SQL obligatorio

Ejecuta:

`docs/supabase_v5_2_core.sql`

Si ya habías ejecutado v5.1, también puedes ejecutar v5.2: es compatible y no borra datos.

## Edge Function

Despliega o sustituye:

`supabase/functions/send-vita-push/index.ts`

La función acepta:

- `SUPABASE_URL` o `URL`
- `SUPABASE_SERVICE_ROLE_KEY` o `SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` o `ANON_KEY`

## Cron

Ejecuta solo cuando la prueba push real funcione:

`docs/supabase_v5_2_cron_definitivo_sin_vault.sql`

## Commit sugerido

`VITA v5.2 instalacion completa`

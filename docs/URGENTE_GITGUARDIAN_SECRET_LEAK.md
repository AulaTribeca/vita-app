# URGENTE, GitGuardian detectó un secreto

El aviso NO debe marcarse como falso positivo si el token real estuvo en el repositorio.

## Qué se filtró probablemente

Un Bearer Token usado como `CRON_SECRET` dentro del SQL del cron.

## Qué hacer ahora

1. En Supabase, abre Edge Functions → Secrets.
2. Cambia el valor de `CRON_SECRET` por uno nuevo.
3. No reutilices el valor anterior.
4. Ejecuta de nuevo el cron con `docs/supabase_v5_2_cron_definitivo_sin_vault.sql`, sustituyendo el placeholder por el nuevo valor solo dentro del SQL Editor de Supabase.
5. No subas a GitHub ningún SQL con el token real escrito.

## Placeholder seguro

El proyecto contiene este placeholder:

`PEGA_AQUI_TU_CRON_SECRET_NUEVO_NO_SUBIR_A_GITHUB`

Este placeholder sí puede estar en GitHub. El valor real no.

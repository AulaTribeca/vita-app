-- VITA v5.2.1, cron definitivo sin vault y sin secretos en GitHub.
-- IMPORTANTE:
-- 1. No subas nunca a GitHub este archivo con el valor real escrito.
-- 2. Antes de ejecutarlo en Supabase SQL Editor, sustituye:
--    PEGA_AQUI_TU_CRON_SECRET_NUEVO_NO_SUBIR_A_GITHUB
--    por el CRON_SECRET NUEVO que hayas guardado en Edge Functions Secrets.
-- 3. Ejecuta el SQL ya rellenado solo en Supabase SQL Editor.

create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule('vita-push-every-5-minutes')
where exists (
  select 1
  from cron.job
  where jobname = 'vita-push-every-5-minutes'
);

select cron.schedule(
  'vita-push-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://vbcqiggxpzlecilbukvn.supabase.co/functions/v1/send-vita-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer PEGA_AQUI_TU_CRON_SECRET_NUEVO_NO_SUBIR_A_GITHUB'
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
  $$
);

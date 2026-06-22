-- VITA v5.0, cron opcional para avisos automáticos.
-- Necesitas tener desplegada la Edge Function send-vita-push y configurado CRON_SECRET en sus secrets.
-- Sustituye REEMPLAZA_CRON_SECRET por el mismo valor que pongas en CRON_SECRET.
-- Ejecuta este SQL solo cuando el test push real funcione.

create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule('vita-push-every-5-minutes')
where exists (
  select 1 from cron.job where jobname = 'vita-push-every-5-minutes'
);

select cron.schedule(
  'vita-push-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://vbcqiggxpzlecilbukvn.supabase.co/functions/v1/send-vita-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer REEMPLAZA_CRON_SECRET'
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
  $$
);

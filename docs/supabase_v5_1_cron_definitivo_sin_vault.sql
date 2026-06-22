-- VITA v5.1, cron definitivo sin vault.
-- Ejecutar solo después de que en la app funcione:
-- Avisos -> Activar avisos, Prueba local y Prueba push real.
--
-- Este SQL programa una llamada cada 5 minutos a la Edge Function send-vita-push.
-- No usa vault porque tu proyecto no tiene esa extensión disponible.

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
      'Authorization', 'Bearer vita_cron_2026_pat_roman_9mK4vR8sQ2zL7xB5nF3pA6tY1cD0hW'
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
  $$
);

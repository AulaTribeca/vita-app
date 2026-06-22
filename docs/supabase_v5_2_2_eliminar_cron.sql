-- VITA v5.2.2
-- Eliminar cron de notificaciones.
-- Este SQL NO contiene secretos.
-- Ejecutar una vez en Supabase SQL Editor para desactivar el cron si llegó a programarse.

create extension if not exists pg_cron;

select cron.unschedule('vita-push-every-5-minutes')
where exists (
  select 1
  from cron.job
  where jobname = 'vita-push-every-5-minutes'
);

select jobid, jobname, schedule, active
from cron.job
where jobname = 'vita-push-every-5-minutes';

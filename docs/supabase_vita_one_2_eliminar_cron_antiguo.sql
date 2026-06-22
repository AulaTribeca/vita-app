-- VITA ONE 2.0
-- Eliminar cron antiguo si existe.
-- No contiene secretos.

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

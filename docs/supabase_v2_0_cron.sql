-- VITA v2.0
-- Programar la Edge Function de push cada 15 minutos.
--
-- Antes de ejecutar:
-- 1. La Edge Function send-vita-push debe estar desplegada.
-- 2. Debe existir en Supabase Vault un secreto llamado vita_edge_cron_token
--    con la service_role key del proyecto.
-- 3. No pegues la service_role key en config.js ni en GitHub.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists vault with schema vault;

-- Si ya existe una programación anterior, elimínala.
select cron.unschedule('vita-push-every-15-min')
where exists (
  select 1
  from cron.job
  where jobname = 'vita-push-every-15-min'
);

select cron.schedule(
  'vita-push-every-15-min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://vbcqiggxpzlecilbukvn.supabase.co/functions/v1/send-vita-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || vault.decrypted_secret('vita_edge_cron_token')
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
  $$
);

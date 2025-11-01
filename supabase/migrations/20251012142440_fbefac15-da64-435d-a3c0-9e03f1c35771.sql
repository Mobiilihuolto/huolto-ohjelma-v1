-- Korjaa varastohälytysten ajoitus Suomen aikavyöhykkeelle
-- Poistetaan vanha ajastus (09:00 UTC)
SELECT cron.unschedule('daily-inventory-low-stock-check');

-- Luodaan uusi ajastus Suomen aikaan (06:00 UTC = 09:00 Suomen kesäaika UTC+3)
SELECT cron.schedule(
  'daily-inventory-low-stock-check',
  '0 6 * * *',
  $$
  SET search_path = public, net;
  SELECT
    net.http_post(
      url:='https://ouuwdlpteiqbhclmqusk.supabase.co/functions/v1/send-low-stock-alert',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dXdkbHB0ZWlxYmhjbG1xdXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Mzc3NTQsImV4cCI6MjA3NDAxMzc1NH0.SiFIBfOAA2IGE1Y5MpXzt5bYDuM4FBJwlF1k0r8vGQA"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
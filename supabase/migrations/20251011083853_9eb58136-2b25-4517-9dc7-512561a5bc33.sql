-- Fix inventory low stock cron job search_path issue
-- The cron job was failing because it couldn't find net.http_post()
-- We need to add 'net' schema to the search_path

-- First, unschedule the old job
SELECT cron.unschedule('daily-inventory-low-stock-check');

-- Create the cron job with correct search_path
SELECT cron.schedule(
  'daily-inventory-low-stock-check',
  '0 9 * * *', -- Every day at 9:00 AM
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

-- Verify the job was created
SELECT jobid, schedule, command, nodename, nodeport, database, username, active, jobname
FROM cron.job
WHERE jobname = 'daily-inventory-low-stock-check';
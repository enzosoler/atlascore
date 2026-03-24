-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily email check at 8 AM UTC
-- This sends: trial ending reminders, trial expired, inactivity nudges, weekly reports
SELECT cron.schedule('atlas-scheduled-emails', '0 8 * * *',
  $$SELECT net.http_post(
    url:='https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/send-scheduled-emails',
    headers:='{"Authorization":"Bearer <SERVICE_ROLE_KEY>","Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;$$
);

-- Verify the job was created
SELECT * FROM cron.job;

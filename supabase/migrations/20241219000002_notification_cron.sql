-- Notification Cron Scheduler Migration
-- Purpose: Set up pg_cron to trigger notification processing Edge Function
-- Author: SAE-21 Implementation
-- Date: 2024-12-19

-- =====================================================
-- 1. ENSURE REQUIRED EXTENSIONS
-- =====================================================

-- Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron with schema extensions;

-- Enable pg_net extension for HTTP requests (if not already enabled)
create extension if not exists pg_net with schema extensions;

-- =====================================================
-- 2. STORE PROJECT SECRETS IN VAULT
-- =====================================================

-- Note: These secrets should be set via Supabase CLI or Dashboard
-- This is just documentation of required secrets:
-- 
-- Required secrets in vault.secrets:
-- - project_url: Your Supabase project URL (e.g., https://xxx.supabase.co)
-- - anon_key: Your Supabase anonymous/public key for Edge Function authorization
-- - RESEND_API_KEY: Your Resend API key (set via: supabase secrets set RESEND_API_KEY=...)
--
-- To set secrets locally:
-- supabase secrets set --env-file .env.local
--
-- To set secrets in production:
-- supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

-- =====================================================
-- 3. SCHEDULE NOTIFICATION PROCESSING
-- =====================================================

-- Remove existing job if it exists (for safe redeployment)
select cron.unschedule('process-notifications-every-minute');

-- Schedule notification processing every 1 minute
select cron.schedule(
  'process-notifications-every-minute',
  '* * * * *', -- Every minute (cron syntax)
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/process-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object(
      'triggered_by', 'pg_cron',
      'timestamp', now()
    ),
    timeout_milliseconds := 55000 -- 55 second timeout
  ) as request_id;
  $$
);

comment on extension pg_cron is 'PostgreSQL cron-based job scheduler for running periodic tasks';

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- View all scheduled cron jobs
-- Run: SELECT * FROM cron.job;

-- View cron job execution history
-- Run: SELECT * FROM cron.job_run_details WHERE jobname = 'process-notifications-every-minute' ORDER BY start_time DESC LIMIT 10;

-- Check if pg_net worker is running
-- Run: SELECT pid FROM pg_stat_activity WHERE backend_type ILIKE '%pg_net%';

-- View pending HTTP requests
-- Run: SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;

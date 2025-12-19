-- Notification Admin Views Migration
-- Purpose: Create SQL views for easy monitoring and debugging
-- Author: SAE-21 Implementation
-- Date: 2024-12-19

-- =====================================================
-- 1. NOTIFICATIONS DASHBOARD VIEW
-- =====================================================

create or replace view public.notifications_dashboard_view as
select
  n.status,
  count(*) as total_count,
  count(case when n.attempts > 0 then 1 end) as retried_count,
  avg(n.attempts)::numeric(10,2) as avg_attempts,
  min(n.created_at) as oldest_created,
  max(n.created_at) as newest_created,
  count(case when n.created_at > now() - interval '1 hour' then 1 end) as count_last_hour,
  count(case when n.created_at > now() - interval '24 hours' then 1 end) as count_last_24h
from public.notifications n
group by n.status
order by
  case n.status
    when 'queued' then 1
    when 'sent' then 2
    when 'failed' then 3
  end;

comment on view public.notifications_dashboard_view is 'Aggregated notification metrics by status for admin dashboard';

-- =====================================================
-- 2. NOTIFICATION PROCESSING TIMELINE VIEW
-- =====================================================

create or replace view public.notification_processing_timeline as
select
  n.id as notification_id,
  n.type as notification_type,
  n.recipient_email,
  n.status as current_status,
  n.attempts as total_attempts,
  n.created_at as notification_created_at,
  n.sent_at as notification_sent_at,
  nel.id as event_id,
  nel.event_type,
  nel.attempt_number,
  nel.error_code,
  nel.error_message,
  nel.resend_email_id,
  nel.response_metadata,
  nel.created_at as event_created_at,
  -- Calculate time between events
  lag(nel.created_at) over (partition by n.id order by nel.created_at) as previous_event_time,
  extract(epoch from (nel.created_at - lag(nel.created_at) over (partition by n.id order by nel.created_at)))::int as seconds_since_previous_event
from public.notifications n
left join public.notification_event_logs nel on nel.notification_id = n.id
order by n.created_at desc, nel.created_at asc;

comment on view public.notification_processing_timeline is 'Chronological event timeline for each notification with timing information';

-- =====================================================
-- 3. FAILED NOTIFICATIONS REPORT VIEW
-- =====================================================

create or replace view public.failed_notifications_report as
select
  n.id,
  n.type,
  n.recipient_email,
  n.attempts,
  n.last_error,
  n.created_at,
  n.sent_at,
  -- Get latest error details from event logs
  (
    select nel.error_code
    from public.notification_event_logs nel
    where nel.notification_id = n.id
      and nel.error_code is not null
    order by nel.created_at desc
    limit 1
  ) as latest_error_code,
  (
    select nel.error_message
    from public.notification_event_logs nel
    where nel.notification_id = n.id
      and nel.error_message is not null
    order by nel.created_at desc
    limit 1
  ) as latest_error_message,
  -- Count of events for this notification
  (
    select count(*)
    from public.notification_event_logs nel
    where nel.notification_id = n.id
  ) as event_count
from public.notifications n
where n.status = 'failed'
  and n.attempts >= 3
order by n.created_at asc; -- Oldest failures first (need attention)

comment on view public.failed_notifications_report is 'Permanently failed notifications (max retries exhausted) requiring investigation';

-- =====================================================
-- 4. NOTIFICATION QUEUE STATUS VIEW
-- =====================================================

create or replace view public.notification_queue_status as
select
  count(*) filter (where status = 'queued' and next_retry_at <= now()) as ready_to_process,
  count(*) filter (where status = 'queued' and next_retry_at > now()) as waiting_for_retry,
  count(*) filter (where status = 'queued' and attempts = 0) as never_attempted,
  count(*) filter (where status = 'queued' and attempts = 1) as retry_1,
  count(*) filter (where status = 'queued' and attempts = 2) as retry_2,
  count(*) filter (where status = 'sent') as total_sent,
  count(*) filter (where status = 'failed') as total_failed,
  (
    select count(*) 
    from public.notifications 
    where created_at > now() - interval '1 hour'
  ) as queued_last_hour,
  (
    select avg(extract(epoch from (sent_at - created_at)))::int
    from public.notifications
    where status = 'sent'
      and sent_at is not null
      and created_at > now() - interval '24 hours'
  ) as avg_processing_time_seconds_24h
from public.notifications;

comment on view public.notification_queue_status is 'Real-time queue status with processing metrics';

-- =====================================================
-- 5. NOTIFICATION ERROR SUMMARY VIEW
-- =====================================================

create or replace view public.notification_error_summary as
select
  nel.error_code,
  count(*) as occurrence_count,
  count(distinct nel.notification_id) as affected_notifications,
  array_agg(distinct n.type) as affected_types,
  min(nel.created_at) as first_occurrence,
  max(nel.created_at) as last_occurrence,
  -- Sample error message
  (
    select nel2.error_message
    from public.notification_event_logs nel2
    where nel2.error_code = nel.error_code
    order by nel2.created_at desc
    limit 1
  ) as sample_error_message
from public.notification_event_logs nel
join public.notifications n on n.id = nel.notification_id
where nel.error_code is not null
group by nel.error_code
order by occurrence_count desc;

comment on view public.notification_error_summary is 'Aggregated error statistics grouped by error code';

-- =====================================================
-- 6. RLS POLICIES FOR VIEWS
-- =====================================================

-- Note: Views inherit RLS from underlying tables
-- Only admins can query these views through the authenticated role

-- Grant select to authenticated users (RLS from base tables will apply)
grant select on public.notifications_dashboard_view to authenticated;
grant select on public.notification_processing_timeline to authenticated;
grant select on public.failed_notifications_report to authenticated;
grant select on public.notification_queue_status to authenticated;
grant select on public.notification_error_summary to authenticated;

-- =====================================================
-- 7. HELPER QUERIES FOR ADMINS
-- =====================================================

-- Quick dashboard check
-- SELECT * FROM public.notifications_dashboard_view;

-- View specific notification timeline
-- SELECT * FROM public.notification_processing_timeline WHERE notification_id = 'xxx';

-- Check failed notifications
-- SELECT * FROM public.failed_notifications_report;

-- Monitor queue health
-- SELECT * FROM public.notification_queue_status;

-- Identify common errors
-- SELECT * FROM public.notification_error_summary;

-- Check cron job execution
-- SELECT * FROM cron.job_run_details WHERE jobname = 'process-notifications-every-minute' ORDER BY start_time DESC LIMIT 10;

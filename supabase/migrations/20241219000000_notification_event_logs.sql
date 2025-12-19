-- Notification Event Logs Table Migration
-- Purpose: Create dedicated table for detailed notification pipeline tracking
-- Author: SAE-21 Implementation
-- Date: 2024-12-19

-- =====================================================
-- 1. ADD MISSING COLUMN TO NOTIFICATIONS TABLE
-- =====================================================

-- Add next_retry_at column for exponential backoff scheduling
alter table public.notifications 
add column if not exists next_retry_at timestamptz null;

comment on column public.notifications.next_retry_at is 'Timestamp when notification should be retried (exponential backoff)';

-- Create index for efficient queue polling
create index if not exists idx_notifications_next_retry 
on public.notifications(next_retry_at) 
where status = 'queued' and attempts < 3;

-- =====================================================
-- 2. NOTIFICATION EVENT LOGS TABLE
-- =====================================================

create table if not exists public.notification_event_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  event_type text not null check (event_type in ('queued', 'processing', 'sent', 'failed', 'retry_scheduled')),
  attempt_number int not null default 0,
  error_code text null,
  error_message text null,
  resend_email_id text null,
  response_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.notification_event_logs is 'Detailed event tracking for notification pipeline lifecycle';
comment on column public.notification_event_logs.notification_id is 'Foreign key to notifications table';
comment on column public.notification_event_logs.event_type is 'Event type: queued, processing, sent, failed, retry_scheduled';
comment on column public.notification_event_logs.attempt_number is 'Which attempt this event corresponds to (0-indexed)';
comment on column public.notification_event_logs.error_code is 'Error code from Resend API (e.g., validation_error, application_error)';
comment on column public.notification_event_logs.error_message is 'Detailed error message for debugging';
comment on column public.notification_event_logs.resend_email_id is 'Email ID from Resend API for tracking';
comment on column public.notification_event_logs.response_metadata is 'Full API response or additional metadata';

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for fetching events by notification
create index if not exists idx_notification_event_logs_notification_id 
on public.notification_event_logs(notification_id);

-- Index for filtering by event type
create index if not exists idx_notification_event_logs_event_type 
on public.notification_event_logs(event_type);

-- Index for chronological queries
create index if not exists idx_notification_event_logs_created_at 
on public.notification_event_logs(created_at desc);

-- Composite index for admin queries (notification + chronological)
create index if not exists idx_notification_event_logs_notif_created 
on public.notification_event_logs(notification_id, created_at desc);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on notification_event_logs table
alter table public.notification_event_logs enable row level security;

-- Policy: Admins can view all notification events
create policy "Admins can view all notification events"
on public.notification_event_logs
for select
to authenticated
using (public.is_admin());

-- Policy: Service role can insert notification events (for Edge Function)
create policy "Service role can insert notification events"
on public.notification_event_logs
for insert
to service_role
with check (true);

-- Policy: Admins can insert notification events
create policy "Admins can insert notification events"
on public.notification_event_logs
for insert
to authenticated
with check (public.is_admin());

-- =====================================================
-- 5. GRANTS
-- =====================================================

-- Grant access to authenticated users (RLS will filter based on role)
grant select on public.notification_event_logs to authenticated;
grant insert on public.notification_event_logs to authenticated, service_role;
grant usage on schema public to authenticated, service_role;

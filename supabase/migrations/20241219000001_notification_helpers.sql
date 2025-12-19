-- Notification Helper Functions Migration
-- Purpose: Create PostgreSQL functions for notification queue management
-- Author: SAE-21 Implementation
-- Date: 2024-12-19

-- =====================================================
-- 1. CALCULATE NEXT RETRY FUNCTION
-- =====================================================

create or replace function public.calculate_next_retry(attempt_count int)
returns timestamptz
language plpgsql
immutable
as $$
begin
  -- Max 3 attempts (0, 1, 2)
  if attempt_count >= 3 then
    return null;
  end if;
  
  -- Exponential backoff:
  -- Attempt 0: Immediate (0 seconds)
  -- Attempt 1: 60 seconds (1 minute)
  -- Attempt 2: 300 seconds (5 minutes)
  case attempt_count
    when 0 then return now();
    when 1 then return now() + interval '60 seconds';
    when 2 then return now() + interval '300 seconds';
    else return null;
  end case;
end;
$$;

comment on function public.calculate_next_retry(int) is 'Calculate next retry timestamp using exponential backoff (0s, 60s, 300s)';

-- =====================================================
-- 2. QUEUE NOTIFICATION FUNCTION
-- =====================================================

create or replace function public.queue_notification(
  p_type text,
  p_recipient_email text,
  p_payload jsonb default '{}'::jsonb,
  p_user_id uuid default null,
  p_booking_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  -- Insert notification with queued status
  insert into public.notifications (
    type,
    recipient_email,
    payload,
    user_id,
    booking_id,
    status,
    attempts,
    next_retry_at,
    created_at
  )
  values (
    p_type,
    p_recipient_email,
    p_payload,
    p_user_id,
    p_booking_id,
    'queued',
    0,
    public.calculate_next_retry(0), -- Immediate first attempt
    now()
  )
  returning id into v_notification_id;
  
  -- Log queued event
  insert into public.notification_event_logs (
    notification_id,
    event_type,
    attempt_number,
    response_metadata,
    created_at
  )
  values (
    v_notification_id,
    'queued',
    0,
    jsonb_build_object(
      'type', p_type,
      'recipient', p_recipient_email
    ),
    now()
  );
  
  return v_notification_id;
end;
$$;

comment on function public.queue_notification is 'Queue a notification for processing. Returns notification ID.';

-- =====================================================
-- 3. GET QUEUED NOTIFICATIONS FUNCTION
-- =====================================================

create or replace function public.get_queued_notifications(p_limit int default 10)
returns table (
  id uuid,
  type text,
  recipient_email text,
  user_id uuid,
  booking_id uuid,
  payload jsonb,
  attempts int,
  last_error text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.id,
    n.type,
    n.recipient_email,
    n.user_id,
    n.booking_id,
    n.payload,
    n.attempts,
    n.last_error,
    n.created_at
  from public.notifications n
  where n.status = 'queued'
    and n.attempts < 3
    and (n.next_retry_at is null or n.next_retry_at <= now())
  order by n.created_at asc
  limit p_limit;
$$;

comment on function public.get_queued_notifications is 'Fetch notifications ready for processing (respects retry schedule and max attempts)';

-- =====================================================
-- 4. UPDATE NOTIFICATION STATUS FUNCTION
-- =====================================================

create or replace function public.update_notification_status(
  p_notification_id uuid,
  p_status text, -- 'sent' or 'failed'
  p_resend_email_id text default null,
  p_error_code text default null,
  p_error_message text default null,
  p_response_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_attempts int;
  v_next_retry timestamptz;
  v_final_status text;
begin
  -- Get current attempts count
  select attempts into v_current_attempts
  from public.notifications
  where id = p_notification_id;
  
  if not found then
    raise exception 'Notification not found: %', p_notification_id;
  end if;
  
  -- Increment attempts
  v_current_attempts := v_current_attempts + 1;
  
  -- Determine final status and next retry
  if p_status = 'sent' then
    v_final_status := 'sent';
    v_next_retry := null;
  elsif p_status = 'failed' then
    if v_current_attempts >= 3 then
      -- Max retries reached - permanent failure
      v_final_status := 'failed';
      v_next_retry := null;
    else
      -- Retry with backoff
      v_final_status := 'queued';
      v_next_retry := public.calculate_next_retry(v_current_attempts);
    end if;
  else
    raise exception 'Invalid status: %. Must be "sent" or "failed"', p_status;
  end if;
  
  -- Update notification
  update public.notifications
  set
    status = v_final_status,
    attempts = v_current_attempts,
    next_retry_at = v_next_retry,
    last_error = case 
      when p_error_message is not null then p_error_message 
      else last_error 
    end,
    sent_at = case when p_status = 'sent' then now() else sent_at end
  where id = p_notification_id;
  
  -- Log event
  insert into public.notification_event_logs (
    notification_id,
    event_type,
    attempt_number,
    error_code,
    error_message,
    resend_email_id,
    response_metadata,
    created_at
  )
  values (
    p_notification_id,
    case 
      when p_status = 'sent' then 'sent'
      when v_final_status = 'failed' then 'failed'
      else 'retry_scheduled'
    end,
    v_current_attempts,
    p_error_code,
    p_error_message,
    p_resend_email_id,
    jsonb_build_object(
      'status', p_status,
      'final_status', v_final_status,
      'attempts', v_current_attempts,
      'next_retry_at', v_next_retry,
      'metadata', p_response_metadata
    ),
    now()
  );
end;
$$;

comment on function public.update_notification_status is 'Update notification status after send attempt. Handles retry logic and event logging.';

-- =====================================================
-- 5. LOG NOTIFICATION EVENT FUNCTION (Utility)
-- =====================================================

create or replace function public.log_notification_event(
  p_notification_id uuid,
  p_event_type text,
  p_attempt_number int default 0,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_event_logs (
    notification_id,
    event_type,
    attempt_number,
    response_metadata,
    created_at
  )
  values (
    p_notification_id,
    p_event_type,
    p_attempt_number,
    p_metadata,
    now()
  );
end;
$$;

comment on function public.log_notification_event is 'Utility function to log custom notification events';

-- =====================================================
-- 6. GRANTS
-- =====================================================

-- Grant execute to authenticated users (for application code)
grant execute on function public.queue_notification to authenticated, service_role;
grant execute on function public.calculate_next_retry to authenticated, service_role;

-- Grant execute to service role (for Edge Function)
grant execute on function public.get_queued_notifications to service_role;
grant execute on function public.update_notification_status to service_role;
grant execute on function public.log_notification_event to service_role, authenticated;

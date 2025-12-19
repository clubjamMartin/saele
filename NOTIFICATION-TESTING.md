# Notification Pipeline Testing Guide

Comprehensive guide for testing the notification pipeline locally and in production.

## Prerequisites

- Supabase CLI installed
- Local Supabase instance running (`pnpm run db:start`)
- Resend API key configured
- Migrations applied (`pnpm run db:reset`)

## Test Scenarios

### Scenario 1: Queue and Process Notification Successfully

**Test Steps:**

1. **Queue a test notification:**
   ```sql
   -- In Supabase Studio SQL Editor (http://127.0.0.1:54323)
   select public.queue_notification(
     p_type := 'magic_link',
     p_recipient_email := 'test@example.com',
     p_payload := '{"magic_link": "http://localhost:3000/test-link"}'::jsonb
   );
   ```

2. **Verify notification is queued:**
   ```sql
   select * from public.notifications order by created_at desc limit 1;
   ```
   
   **Expected:** Status = 'queued', attempts = 0

3. **Check notification event log:**
   ```sql
   select * from public.notification_event_logs 
   where notification_id = (
     select id from public.notifications order by created_at desc limit 1
   );
   ```
   
   **Expected:** One event with event_type = 'queued'

4. **Manually trigger Edge Function:**
   ```bash
   # Terminal
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json'
   ```

5. **Verify notification was sent:**
   ```sql
   select * from public.notifications order by created_at desc limit 1;
   ```
   
   **Expected:** Status = 'sent', attempts = 1, sent_at is not null

6. **Check event timeline:**
   ```sql
   select * from public.notification_processing_timeline
   where notification_id = (
     select id from public.notifications order by created_at desc limit 1
   )
   order by event_created_at;
   ```
   
   **Expected:** Events for 'queued', 'processing', and 'sent'

7. **Check Resend dashboard:**
   - Go to https://resend.com/emails
   - Verify email was sent to test@example.com

### Scenario 2: Retry Logic with Exponential Backoff

**Test Steps:**

1. **Queue notification with invalid email format (will fail validation):**
   ```sql
   select public.queue_notification(
     p_type := 'magic_link',
     p_recipient_email := 'invalid-email',  -- Invalid format
     p_payload := '{"magic_link": "http://localhost:3000/test"}'::jsonb
   );
   ```

2. **Trigger Edge Function:**
   ```bash
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json'
   ```

3. **Check notification status:**
   ```sql
   select id, status, attempts, next_retry_at, last_error 
   from public.notifications 
   order by created_at desc limit 1;
   ```
   
   **Expected:** 
   - Status = 'queued' (retry scheduled)
   - attempts = 1
   - next_retry_at = now() + 60 seconds
   - last_error contains validation error

4. **Wait 60 seconds and trigger again:**
   ```bash
   sleep 60
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json'
   ```

5. **Verify retry logic:**
   ```sql
   select id, status, attempts, next_retry_at 
   from public.notifications 
   order by created_at desc limit 1;
   ```
   
   **Expected:**
   - attempts = 2
   - next_retry_at = now() + 300 seconds (5 minutes)

6. **Wait 5 minutes and trigger final attempt:**
   ```bash
   sleep 300
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json'
   ```

7. **Verify permanent failure:**
   ```sql
   select id, status, attempts, next_retry_at 
   from public.notifications 
   order by created_at desc limit 1;
   ```
   
   **Expected:**
   - Status = 'failed' (permanent)
   - attempts = 3
   - next_retry_at = null

### Scenario 3: Booking Confirmation Email

**Test Steps:**

1. **Create test booking:**
   ```sql
   insert into public.bookings (
     external_booking_id,
     email,
     check_in,
     check_out,
     status
   ) values (
     'TEST-BOOKING-001',
     'guest@example.com',
     current_date + interval '7 days',
     current_date + interval '14 days',
     'confirmed'
   ) returning id;
   ```

2. **Queue booking confirmation:**
   ```sql
   select public.queue_notification(
     p_type := 'booking_confirmation',
     p_recipient_email := 'guest@example.com',
     p_payload := jsonb_build_object(
       'external_booking_id', 'TEST-BOOKING-001',
       'check_in', (current_date + interval '7 days')::text,
       'check_out', (current_date + interval '14 days')::text
     ),
     p_booking_id := (select id from public.bookings where external_booking_id = 'TEST-BOOKING-001')
   );
   ```

3. **Process notification:**
   ```bash
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json'
   ```

4. **Verify email sent:**
   - Check Resend dashboard
   - Verify booking details in email

### Scenario 4: Cron Job Automation

**Test Steps:**

1. **Verify cron job is scheduled:**
   ```sql
   select * from cron.job where jobname = 'process-notifications-every-minute';
   ```
   
   **Expected:** One row with schedule = '* * * * *'

2. **Queue multiple notifications:**
   ```sql
   select public.queue_notification(
     p_type := 'magic_link',
     p_recipient_email := 'user' || generate_series || '@example.com',
     p_payload := '{"magic_link": "http://localhost:3000/test"}'::jsonb
   ) from generate_series(1, 5);
   ```

3. **Wait 1-2 minutes for cron to trigger**

4. **Check cron execution history:**
   ```sql
   select * from cron.job_run_details 
   where jobname = 'process-notifications-every-minute'
   order by start_time desc 
   limit 5;
   ```
   
   **Expected:** Recent executions with status

5. **Verify notifications were processed:**
   ```sql
   select status, count(*) 
   from public.notifications 
   where created_at > now() - interval '5 minutes'
   group by status;
   ```

### Scenario 5: TypeScript Queue Helper

**Test Steps:**

1. **Create test API route:**
   ```typescript
   // app/api/test-queue/route.ts
   import { queueNotification, queueMagicLinkNotification } from '@/lib/notifications/queue'
   import { NextResponse } from 'next/server'

   export async function GET() {
     try {
       const notificationId = await queueMagicLinkNotification(
         'test@example.com',
         'http://localhost:3000/test-link'
       )
       
       return NextResponse.json({ 
         success: true, 
         notificationId 
       })
     } catch (error) {
       return NextResponse.json({ 
         success: false, 
         error: error.message 
       }, { status: 500 })
     }
   }
   ```

2. **Test API endpoint:**
   ```bash
   curl http://localhost:3000/api/test-queue
   ```

3. **Verify notification was queued:**
   ```sql
   select * from public.notifications order by created_at desc limit 1;
   ```

## Monitoring and Debugging

### View Dashboard Metrics

```sql
select * from public.notifications_dashboard_view;
```

### View Queue Status

```sql
select * from public.notification_queue_status;
```

### View Failed Notifications

```sql
select * from public.failed_notifications_report;
```

### View Specific Notification Timeline

```sql
select * from public.notification_processing_timeline
where notification_id = '<notification-id>'
order by event_created_at;
```

### View Error Summary

```sql
select * from public.notification_error_summary;
```

### Check pg_cron Status

```sql
-- View scheduled jobs
select * from cron.job;

-- View recent executions
select * from cron.job_run_details 
where jobname = 'process-notifications-every-minute'
order by start_time desc 
limit 10;

-- Check if pg_net worker is running
select pid from pg_stat_activity where backend_type ilike '%pg_net%';
```

## Edge Function Local Testing

### Serve Function Locally

```bash
# Terminal 1: Serve the function
supabase functions serve process-notifications --env-file .env.local

# Terminal 2: Test invocation
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-notifications' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

### Check Function Logs

```bash
# View Edge Function logs
supabase functions logs process-notifications

# Follow logs in real-time
supabase functions logs process-notifications --follow
```

## Troubleshooting

### Notifications stuck in queue

**Check:**
1. Is pg_cron running? `select * from cron.job;`
2. Is pg_net worker active? `select pid from pg_stat_activity where backend_type ilike '%pg_net%';`
3. Are there error in cron execution? `select * from cron.job_run_details order by start_time desc limit 5;`

**Fix:**
```bash
# Restart Supabase
supabase stop
supabase start
```

### Edge Function not processing

**Check:**
1. Are secrets configured? `supabase secrets list`
2. Is Resend API key valid?
3. Check function logs for errors

**Fix:**
```bash
# Redeploy function
supabase functions deploy process-notifications

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Emails not being sent

**Check:**
1. Resend dashboard for API errors
2. Check notification event logs for error details
3. Verify email addresses are valid

## Success Criteria

- ✅ Notifications can be queued via SQL function
- ✅ Notifications can be queued via TypeScript helper
- ✅ Edge Function processes queued notifications
- ✅ Successful notifications are marked as 'sent'
- ✅ Failed notifications retry with exponential backoff
- ✅ After 3 attempts, notifications are marked as permanently failed
- ✅ All events are logged to notification_event_logs
- ✅ pg_cron triggers Edge Function every minute
- ✅ Admin views provide monitoring insights
- ✅ Emails are sent via Resend
- ✅ Resend email IDs are stored for tracking

## Next Steps

After local testing is successful:
1. Deploy to production (see DEPLOYMENT.md)
2. Set up production secrets
3. Monitor first production runs
4. Configure alerting for failed notifications

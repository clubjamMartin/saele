# Notification Pipeline Deployment Guide

Step-by-step guide for deploying the notification pipeline to production.

## Prerequisites

- Supabase CLI installed and authenticated
- Access to production Supabase project
- Resend API key for production
- All migrations tested locally

## Deployment Steps

### Step 1: Verify Local Setup

Before deploying to production, ensure everything works locally:

```bash
# Start local Supabase
pnpm run db:start

# Apply migrations
pnpm run db:reset

# Verify migrations applied
supabase db diff
```

### Step 2: Link to Production Project

```bash
# Link to production project
supabase link --project-ref sbbcczpdlzmhwpytglgr

# Verify connection
supabase projects list
```

### Step 3: Deploy Database Migrations

```bash
# Push migrations to production
supabase db push

# Verify migrations applied
supabase db remote status
```

**Expected migrations:**
- `20241219000000_notification_event_logs.sql`
- `20241219000001_notification_helpers.sql`
- `20241219000002_notification_cron.sql`
- `20241219000003_notification_views.sql`

### Step 4: Configure Production Secrets

```bash
# Set Resend API key (REQUIRED)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Set email from address (OPTIONAL)
supabase secrets set EMAIL_FROM=noreply@saele.com

# Verify secrets are set
supabase secrets list
```

**Important:** Use your production Resend API key, not the test key.

### Step 5: Deploy Edge Function

```bash
# Deploy process-notifications function
supabase functions deploy process-notifications

# Verify deployment
supabase functions list
```

**Expected output:**
```
┌──────────────────────────┬─────────┬─────────────────────┬─────────┐
│ NAME                     │ VERSION │ CREATED             │ UPDATED │
├──────────────────────────┼─────────┼─────────────────────┼─────────┤
│ process-notifications    │ 1       │ 2024-12-19 10:00:00 │ ...     │
└──────────────────────────┴─────────┴─────────────────────┴─────────┘
```

### Step 6: Verify Database Setup

Connect to production database and verify:

```sql
-- Check notifications table has new column
\d public.notifications

-- Check notification_event_logs table exists
\d public.notification_event_logs

-- Check helper functions exist
\df public.queue_notification
\df public.get_queued_notifications
\df public.update_notification_status
\df public.calculate_next_retry

-- Check views exist
\dv public.notifications_dashboard_view
\dv public.notification_queue_status
\dv public.failed_notifications_report

-- Check cron job is scheduled
select * from cron.job where jobname = 'process-notifications-every-minute';

-- Check pg_cron and pg_net extensions
select * from pg_extension where extname in ('pg_cron', 'pg_net');
```

### Step 7: Test Production Deployment

#### Test 1: Queue a test notification

```sql
select public.queue_notification(
  p_type := 'magic_link',
  p_recipient_email := 'your-email@example.com',
  p_payload := '{"magic_link": "https://your-domain.com/test"}'::jsonb
);
```

#### Test 2: Manually trigger Edge Function

```bash
curl -i --location --request POST 'https://sbbcczpdlzmhwpytglgr.supabase.co/functions/v1/process-notifications' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

#### Test 3: Verify notification was processed

```sql
-- Check notification status
select * from public.notifications order by created_at desc limit 1;

-- Check event log
select * from public.notification_event_logs 
where notification_id = (select id from public.notifications order by created_at desc limit 1)
order by created_at;
```

#### Test 4: Check Resend dashboard

- Go to https://resend.com/emails
- Verify test email was sent
- Check delivery status

### Step 8: Verify Cron Job Execution

Wait 1-2 minutes for the cron job to run, then:

```sql
-- Check cron execution history
select * from cron.job_run_details 
where jobname = 'process-notifications-every-minute'
order by start_time desc 
limit 5;

-- Check pg_net HTTP responses
select * from net._http_response 
order by created desc 
limit 5;
```

**Expected:** Successful executions every minute

### Step 9: Monitor Edge Function Logs

```bash
# View recent logs
supabase functions logs process-notifications --project-ref sbbcczpdlzmhwpytglgr

# Follow logs in real-time
supabase functions logs process-notifications --project-ref sbbcczpdlzmhwpytglgr --follow
```

### Step 10: Update Application Environment Variables

Update your production environment variables (e.g., Vercel):

```bash
# These should already be set, but verify:
NEXT_PUBLIC_SUPABASE_URL=https://sbbcczpdlzmhwpytglgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Post-Deployment Verification

### Check Dashboard Views

```sql
-- Overall status
select * from public.notifications_dashboard_view;

-- Queue health
select * from public.notification_queue_status;

-- Any failures?
select * from public.failed_notifications_report;
```

### Monitor for Issues

1. **Check for stuck notifications:**
   ```sql
   select count(*) from public.notifications 
   where status = 'queued' 
   and created_at < now() - interval '10 minutes';
   ```

2. **Check for high failure rates:**
   ```sql
   select status, count(*), round(100.0 * count(*) / sum(count(*)) over(), 2) as percentage
   from public.notifications
   where created_at > now() - interval '1 hour'
   group by status;
   ```

3. **Check error patterns:**
   ```sql
   select * from public.notification_error_summary
   order by occurrence_count desc;
   ```

## Rollback Procedure

If you need to rollback the deployment:

### Option 1: Disable Cron Job

```sql
-- Temporarily stop automatic processing
select cron.unschedule('process-notifications-every-minute');

-- Re-enable later
-- (Re-run the scheduling migration)
```

### Option 2: Full Rollback

```bash
# Revert migrations
supabase db reset --db-url <your-production-db-url>

# Note: This will lose notification queue data
# Only use if absolutely necessary
```

## Monitoring and Alerts

### Set Up Monitoring

Create alerts for:

1. **Failed notifications threshold**
   ```sql
   -- Alert if > 10 permanent failures in last hour
   select count(*) from public.notifications
   where status = 'failed'
   and attempts >= 3
   and created_at > now() - interval '1 hour';
   ```

2. **Queue backlog**
   ```sql
   -- Alert if > 100 queued notifications
   select count(*) from public.notifications
   where status = 'queued';
   ```

3. **Cron job failures**
   ```sql
   -- Alert if no successful execution in last 5 minutes
   select * from cron.job_run_details 
   where jobname = 'process-notifications-every-minute'
   and start_time > now() - interval '5 minutes'
   and status != 'succeeded';
   ```

### Regular Health Checks

Run daily:

```sql
-- Daily health check report
with stats as (
  select
    count(*) filter (where status = 'sent' and created_at > current_date) as sent_today,
    count(*) filter (where status = 'failed' and created_at > current_date) as failed_today,
    count(*) filter (where status = 'queued') as currently_queued,
    round(avg(extract(epoch from (sent_at - created_at)))::numeric, 2) as avg_processing_seconds
  from public.notifications
)
select * from stats;
```

## Troubleshooting

### Issue: Cron job not triggering

**Check:**
```sql
select * from cron.job where jobname = 'process-notifications-every-minute';
```

**Fix:**
```bash
# Redeploy cron migration
supabase db push
```

### Issue: Edge Function timing out

**Check logs:**
```bash
supabase functions logs process-notifications --project-ref sbbcczpdlzmhwpytglgr
```

**Fix:**
- Reduce batch size in `get_queued_notifications()`
- Optimize email templates
- Check Resend API response times

### Issue: Secrets not accessible

**Check:**
```bash
supabase secrets list --project-ref sbbcczpdlzmhwpytglgr
```

**Fix:**
```bash
# Re-set secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx --project-ref sbbcczpdlzmhwpytglgr

# Redeploy function
supabase functions deploy process-notifications --project-ref sbbcczpdlzmhwpytglgr
```

### Issue: pg_net not working

**Check:**
```sql
select pid from pg_stat_activity where backend_type ilike '%pg_net%';
```

**Fix:**
Contact Supabase support if pg_net worker is not running.

## Success Criteria

- ✅ All 4 migrations applied successfully
- ✅ Helper functions created and accessible
- ✅ Admin views created
- ✅ pg_cron job scheduled
- ✅ Edge Function deployed
- ✅ Secrets configured
- ✅ Test notification processed successfully
- ✅ Email sent via Resend
- ✅ Cron job executing every minute
- ✅ No errors in function logs
- ✅ Dashboard views showing data

## Next Steps

After successful deployment:

1. **Update documentation**
   - Add notification pipeline to README
   - Update SCHEMA with new tables
   - Document usage examples

2. **Integrate with application**
   - Use `queueBookingConfirmation()` in booking webhooks
   - Add notification queuing to other workflows

3. **Set up monitoring dashboard**
   - Build admin UI for notification management
   - Add real-time metrics
   - Create manual retry functionality

4. **Performance optimization**
   - Monitor processing times
   - Optimize batch sizes
   - Consider scaling strategies

## Support

If you encounter issues during deployment:

1. Check Edge Function logs
2. Review cron job execution history
3. Check Resend dashboard for API errors
4. Consult NOTIFICATION-TESTING.md for debugging steps
5. Contact Supabase support if infrastructure issues

## References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://supabase.com/docs/guides/cron)
- [Resend Documentation](https://resend.com/docs)
- [Notification Testing Guide](./NOTIFICATION-TESTING.md)
- [Secrets Setup Guide](./SECRETS-SETUP.md)

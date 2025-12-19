# Notification Pipeline Monitoring Guide

Comprehensive guide for monitoring and maintaining the notification pipeline.

## Quick Health Check

Run this query to get an instant overview:

```sql
-- Overall system health
select 
  'Queue Status' as metric,
  jsonb_build_object(
    'ready_to_process', (select ready_to_process from public.notification_queue_status),
    'waiting_for_retry', (select waiting_for_retry from public.notification_queue_status),
    'total_sent', (select total_sent from public.notification_queue_status),
    'total_failed', (select total_failed from public.notification_queue_status)
  ) as value

union all

select 
  'Cron Job Status' as metric,
  jsonb_build_object(
    'last_run', (
      select max(start_time) 
      from cron.job_run_details 
      where jobname = 'process-notifications-every-minute'
    ),
    'recent_successes', (
      select count(*) 
      from cron.job_run_details 
      where jobname = 'process-notifications-every-minute'
      and start_time > now() - interval '10 minutes'
      and status = 'succeeded'
    )
  ) as value;
```

## Dashboard Views

### 1. Notifications Dashboard

**Purpose:** High-level metrics by status

```sql
select * from public.notifications_dashboard_view;
```

**Expected output:**
```
 status  | total_count | retried_count | avg_attempts | oldest_created | newest_created | count_last_hour | count_last_24h 
---------+-------------+---------------+--------------+----------------+----------------+-----------------+----------------
 queued  |          12 |             3 |         0.25 | 2024-12-19 ... | 2024-12-19 ... |               5 |             12
 sent    |        1250 |           125 |         1.10 | 2024-12-18 ... | 2024-12-19 ... |             120 |           1250
 failed  |          15 |            15 |         3.00 | 2024-12-18 ... | 2024-12-19 ... |               2 |             15
```

**Alerts to set:**
- ⚠️ If `queued.total_count` > 100: Queue backlog
- ⚠️ If `failed.count_last_hour` > 10: High failure rate
- ⚠️ If `sent.avg_attempts` > 1.5: Reliability issues

### 2. Queue Status

**Purpose:** Real-time queue health

```sql
select * from public.notification_queue_status;
```

**Expected output:**
```
 ready_to_process | waiting_for_retry | never_attempted | retry_1 | retry_2 | total_sent | total_failed | queued_last_hour | avg_processing_time_seconds_24h 
------------------+-------------------+-----------------+---------+---------+------------+--------------+------------------+--------------------------------
               10 |                 3 |               8 |       2 |       1 |       1250 |           15 |               15 |                             45
```

**Alerts to set:**
- ⚠️ If `ready_to_process` > 50: Processing bottleneck
- ⚠️ If `waiting_for_retry` > 20: Many transient failures
- ⚠️ If `avg_processing_time_seconds_24h` > 120: Slow processing

### 3. Failed Notifications Report

**Purpose:** Permanently failed notifications requiring investigation

```sql
select * from public.failed_notifications_report
limit 10;
```

**Actions:**
- Investigate error patterns
- Fix data quality issues
- Consider manual retry for specific cases

### 4. Notification Processing Timeline

**Purpose:** Detailed lifecycle view for specific notifications

```sql
-- View timeline for specific notification
select * from public.notification_processing_timeline
where notification_id = '<notification-id>'
order by event_created_at;

-- View recent processing timeline
select * from public.notification_processing_timeline
where notification_created_at > now() - interval '1 hour'
order by notification_created_at desc, event_created_at asc
limit 50;
```

### 5. Error Summary

**Purpose:** Identify common error patterns

```sql
select * from public.notification_error_summary
order by occurrence_count desc
limit 10;
```

**Common error codes:**
- `validation_error`: Invalid email format or missing required fields
- `application_error`: Resend API issues (rate limits, service down)
- `network_error`: Connection problems
- `processing_error`: Internal Edge Function errors

## Cron Job Monitoring

### Check Cron Job Status

```sql
-- View scheduled jobs
select 
  jobname,
  schedule,
  active,
  (select count(*) from cron.job_run_details jrd where jrd.jobid = job.jobid) as total_runs,
  (select max(start_time) from cron.job_run_details jrd where jrd.jobid = job.jobid) as last_run
from cron.job
where jobname = 'process-notifications-every-minute';
```

### View Recent Executions

```sql
select 
  runid,
  start_time,
  end_time,
  status,
  return_message,
  extract(epoch from (end_time - start_time))::int as duration_seconds
from cron.job_run_details 
where jobname = 'process-notifications-every-minute'
order by start_time desc 
limit 20;
```

**Expected:** 
- Status: 'succeeded'
- Duration: < 10 seconds
- No gaps > 2 minutes between executions

### Check pg_net Worker

```sql
-- Verify pg_net background worker is running
select 
  pid,
  backend_start,
  state,
  wait_event_type,
  wait_event
from pg_stat_activity 
where backend_type ilike '%pg_net%';
```

**Expected:** One active process

### View HTTP Request History

```sql
select 
  id,
  created,
  status_code,
  content_type,
  timed_out
from net._http_response 
order by created desc 
limit 10;
```

## Performance Metrics

### Processing Time Analysis

```sql
-- Average processing time by notification type
select 
  n.type,
  count(*) as total_sent,
  round(avg(extract(epoch from (n.sent_at - n.created_at)))::numeric, 2) as avg_seconds,
  round(min(extract(epoch from (n.sent_at - n.created_at)))::numeric, 2) as min_seconds,
  round(max(extract(epoch from (n.sent_at - n.created_at)))::numeric, 2) as max_seconds
from public.notifications n
where n.status = 'sent'
  and n.sent_at is not null
  and n.created_at > now() - interval '24 hours'
group by n.type
order by total_sent desc;
```

### Success Rate by Hour

```sql
select 
  date_trunc('hour', created_at) as hour,
  count(*) filter (where status = 'sent') as sent,
  count(*) filter (where status = 'failed') as failed,
  count(*) as total,
  round(100.0 * count(*) filter (where status = 'sent') / count(*), 2) as success_rate_percent
from public.notifications
where created_at > now() - interval '24 hours'
group by hour
order by hour desc;
```

### Retry Analysis

```sql
select 
  attempts,
  count(*) as notification_count,
  count(*) filter (where status = 'sent') as eventually_sent,
  count(*) filter (where status = 'failed') as permanently_failed,
  round(100.0 * count(*) filter (where status = 'sent') / count(*), 2) as success_rate_after_retries
from public.notifications
where attempts > 0
  and created_at > now() - interval '7 days'
group by attempts
order by attempts;
```

## Alerting Rules

### Critical Alerts (Immediate Action Required)

1. **Cron job not executing**
   ```sql
   -- Alert if no execution in last 5 minutes
   select case 
     when (
       select max(start_time) 
       from cron.job_run_details 
       where jobname = 'process-notifications-every-minute'
     ) < now() - interval '5 minutes' 
     then 'CRITICAL: Cron job not executing'
     else 'OK'
   end as status;
   ```

2. **Queue backlog critical**
   ```sql
   -- Alert if > 500 notifications queued
   select case
     when (select count(*) from public.notifications where status = 'queued') > 500
     then 'CRITICAL: Queue backlog > 500'
     else 'OK'
   end as status;
   ```

3. **Edge Function errors**
   ```sql
   -- Alert if > 50% failure rate in last hour
   select case
     when (
       select count(*) filter (where status = 'failed') * 100.0 / nullif(count(*), 0)
       from public.notifications
       where created_at > now() - interval '1 hour'
     ) > 50
     then 'CRITICAL: High failure rate > 50%'
     else 'OK'
   end as status;
   ```

### Warning Alerts (Investigation Needed)

1. **Increased retry rate**
   ```sql
   -- Alert if > 20% of notifications require retries
   select case
     when (
       select count(*) filter (where attempts > 1) * 100.0 / nullif(count(*), 0)
       from public.notifications
       where created_at > now() - interval '1 hour'
     ) > 20
     then 'WARNING: High retry rate > 20%'
     else 'OK'
   end as status;
   ```

2. **Slow processing**
   ```sql
   -- Alert if avg processing time > 2 minutes
   select case
     when (
       select avg(extract(epoch from (sent_at - created_at)))
       from public.notifications
       where status = 'sent'
         and created_at > now() - interval '1 hour'
     ) > 120
     then 'WARNING: Slow processing > 2 minutes'
     else 'OK'
   end as status;
   ```

## Maintenance Tasks

### Daily

1. **Review failed notifications**
   ```sql
   select * from public.failed_notifications_report
   where created_at > current_date;
   ```

2. **Check error patterns**
   ```sql
   select * from public.notification_error_summary
   where last_occurrence > current_date;
   ```

3. **Verify cron health**
   ```sql
   select count(*), min(start_time), max(start_time)
   from cron.job_run_details
   where jobname = 'process-notifications-every-minute'
     and start_time > current_date;
   ```

### Weekly

1. **Performance review**
   ```sql
   -- Weekly performance summary
   select 
     count(*) as total_notifications,
     count(*) filter (where status = 'sent') as sent,
     count(*) filter (where status = 'failed') as failed,
     round(100.0 * count(*) filter (where status = 'sent') / count(*), 2) as success_rate,
     round(avg(attempts)::numeric, 2) as avg_attempts,
     round(avg(extract(epoch from (sent_at - created_at)))::numeric, 2) as avg_processing_seconds
   from public.notifications
   where created_at > current_date - interval '7 days';
   ```

2. **Clean up old event logs** (optional)
   ```sql
   -- Archive or delete logs older than 90 days
   -- Only run if you have a lot of data and storage concerns
   delete from public.notification_event_logs
   where created_at < current_date - interval '90 days';
   ```

### Monthly

1. **Capacity planning**
   ```sql
   -- Monthly volume trends
   select 
     date_trunc('day', created_at) as day,
     count(*) as total_notifications,
     count(*) filter (where status = 'sent') as sent,
     round(avg(attempts)::numeric, 2) as avg_attempts
   from public.notifications
   where created_at > current_date - interval '30 days'
   group by day
   order by day;
   ```

2. **Error trend analysis**
   ```sql
   -- Error trends over time
   select 
     date_trunc('week', nel.created_at) as week,
     nel.error_code,
     count(*) as occurrences
   from public.notification_event_logs nel
   where nel.error_code is not null
     and nel.created_at > current_date - interval '30 days'
   group by week, error_code
   order by week desc, occurrences desc;
   ```

## Troubleshooting Playbook

### Issue: Notifications stuck in queue

**Diagnosis:**
```sql
select count(*), min(created_at) as oldest
from public.notifications
where status = 'queued';
```

**Possible causes:**
1. Cron job not running
2. Edge Function error
3. Resend API down

**Resolution:**
1. Check cron execution
2. Check Edge Function logs
3. Manually trigger: `curl POST /functions/v1/process-notifications`

### Issue: High failure rate

**Diagnosis:**
```sql
select 
  type,
  count(*) as failures,
  array_agg(distinct substring(last_error, 1, 100)) as error_samples
from public.notifications
where status = 'failed'
  and created_at > now() - interval '1 hour'
group by type;
```

**Possible causes:**
1. Invalid email addresses
2. Resend API key expired
3. Rate limits exceeded

**Resolution:**
1. Check error messages
2. Verify Resend API key
3. Review Resend dashboard

### Issue: Slow processing

**Diagnosis:**
```sql
select 
  n.id,
  n.type,
  n.created_at,
  n.sent_at,
  extract(epoch from (n.sent_at - n.created_at))::int as seconds_to_send,
  nel.event_type,
  nel.created_at as event_time
from public.notifications n
join public.notification_event_logs nel on nel.notification_id = n.id
where n.created_at > now() - interval '1 hour'
  and n.status = 'sent'
  and (n.sent_at - n.created_at) > interval '2 minutes'
order by n.created_at desc, nel.created_at;
```

**Possible causes:**
1. Large batch sizes
2. Resend API latency
3. Database connection issues

**Resolution:**
1. Reduce batch size in `get_queued_notifications()`
2. Monitor Resend API response times
3. Check database performance

## Best Practices

1. **Set up automated monitoring**
   - Use Supabase's built-in monitoring
   - Set up external monitoring (e.g., UptimeRobot)
   - Configure Slack/email alerts for critical issues

2. **Regular reviews**
   - Daily: Check dashboard views
   - Weekly: Review performance metrics
   - Monthly: Analyze trends and capacity

3. **Documentation**
   - Document any manual interventions
   - Keep runbooks updated
   - Record common issues and solutions

4. **Backup and recovery**
   - Regularly backup notification data
   - Test recovery procedures
   - Document rollback steps

## Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Resend Dashboard](https://resend.com/overview)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [NOTIFICATION-TESTING.md](./NOTIFICATION-TESTING.md)
- [DEPLOYMENT-NOTIFICATION-PIPELINE.md](./DEPLOYMENT-NOTIFICATION-PIPELINE.md)

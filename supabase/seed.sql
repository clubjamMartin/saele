-- Seed Data for Development and Testing
-- Creates sample users, bookings, contacts, notifications, and logs

-- =====================================================
-- IMPORTANT: Run this AFTER creating auth users
-- =====================================================
-- In Supabase dashboard or via API, first create these users:
-- 1. admin@saele.com (will be set as admin)
-- 2. guest1@saele.com (guest user)
-- 3. guest2@saele.com (guest user)
-- Then update the UUIDs below with the actual auth.users IDs

-- =====================================================
-- HELPER: Insert sample auth users (for local dev)
-- =====================================================
-- Note: In production, users are created via Supabase Auth
-- For local testing, you can manually create users or use these sample IDs

-- Sample UUIDs for local development (replace with real IDs in production)
-- Admin user: 00000000-0000-0000-0000-000000000001
-- Guest 1:    00000000-0000-0000-0000-000000000002
-- Guest 2:    00000000-0000-0000-0000-000000000003

-- =====================================================
-- 1. PROFILES
-- =====================================================

-- Admin profile
insert into public.profiles (user_id, role, full_name, phone, created_at, updated_at)
values 
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin',
    'Admin User',
    '+49 123 4567890',
    now(),
    now()
  )
on conflict (user_id) do update
  set role = 'admin',
      full_name = 'Admin User',
      phone = '+49 123 4567890',
      updated_at = now();

-- Guest profiles
insert into public.profiles (user_id, role, full_name, phone, created_at, updated_at)
values 
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'guest',
    'Max Mustermann',
    '+49 170 1234567',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'guest',
    'Anna Schmidt',
    '+49 170 7654321',
    now(),
    now()
  )
on conflict (user_id) do nothing;

-- =====================================================
-- 2. HOST CONTACTS
-- =====================================================

insert into public.host_contacts (display_name, email, phone, whatsapp, is_active, created_at)
values 
  (
    'Saele Support Team',
    'support@saele.com',
    '+49 30 12345678',
    '+49 30 12345678',
    true,
    now()
  ),
  (
    'Property Manager - Munich',
    'munich@saele.com',
    '+49 89 98765432',
    '+49 89 98765432',
    true,
    now()
  ),
  (
    'Emergency Contact',
    'emergency@saele.com',
    '+49 30 99999999',
    '+49 30 99999999',
    false,
    now()
  );

-- =====================================================
-- 3. BOOKINGS
-- =====================================================

insert into public.bookings (
  external_booking_id,
  guest_user_id,
  email,
  check_in,
  check_out,
  status,
  created_at
)
values 
  (
    'EXT-BOOKING-001',
    '00000000-0000-0000-0000-000000000002'::uuid,
    'guest1@saele.com',
    current_date + interval '7 days',
    current_date + interval '14 days',
    'confirmed',
    now()
  ),
  (
    'EXT-BOOKING-002',
    '00000000-0000-0000-0000-000000000002'::uuid,
    'guest1@saele.com',
    current_date - interval '30 days',
    current_date - interval '23 days',
    'confirmed',
    now() - interval '35 days'
  ),
  (
    'EXT-BOOKING-003',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'guest2@saele.com',
    current_date + interval '14 days',
    current_date + interval '21 days',
    'confirmed',
    now()
  ),
  (
    'EXT-BOOKING-004',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'guest2@saele.com',
    current_date + interval '60 days',
    current_date + interval '70 days',
    'cancelled',
    now() - interval '5 days'
  );

-- =====================================================
-- 4. NOTIFICATIONS
-- =====================================================

insert into public.notifications (
  type,
  recipient_email,
  user_id,
  booking_id,
  payload,
  status,
  attempts,
  last_error,
  created_at,
  sent_at
)
select
  'magic_link',
  'guest1@saele.com',
  '00000000-0000-0000-0000-000000000002'::uuid,
  b.id,
  jsonb_build_object(
    'booking_reference', 'EXT-BOOKING-001',
    'check_in', b.check_in::text,
    'check_out', b.check_out::text
  ),
  'sent',
  1,
  null,
  now() - interval '1 hour',
  now() - interval '59 minutes'
from public.bookings b
where b.external_booking_id = 'EXT-BOOKING-001';

insert into public.notifications (
  type,
  recipient_email,
  user_id,
  booking_id,
  payload,
  status,
  attempts,
  last_error,
  created_at,
  sent_at
)
select
  'booking_confirmation',
  'guest2@saele.com',
  '00000000-0000-0000-0000-000000000003'::uuid,
  b.id,
  jsonb_build_object(
    'booking_reference', 'EXT-BOOKING-003',
    'property_name', 'Munich Apartment'
  ),
  'queued',
  0,
  null,
  now() - interval '10 minutes',
  null
from public.bookings b
where b.external_booking_id = 'EXT-BOOKING-003';

insert into public.notifications (
  type,
  recipient_email,
  user_id,
  booking_id,
  payload,
  status,
  attempts,
  last_error,
  created_at,
  sent_at
)
values (
  'magic_link',
  'faileduser@example.com',
  null,
  null,
  '{"reason": "test_failure"}'::jsonb,
  'failed',
  3,
  'SMTP connection timeout',
  now() - interval '2 hours',
  null
);

-- =====================================================
-- 5. EVENT LOGS
-- =====================================================

insert into public.event_logs (
  event_type,
  external_id,
  request_id,
  user_id,
  booking_id,
  level,
  message,
  meta,
  created_at
)
select
  'booking_confirmed',
  'EXT-BOOKING-001',
  'req_abc123',
  '00000000-0000-0000-0000-000000000002'::uuid,
  b.id,
  'info',
  'Booking confirmed via webhook from external system',
  jsonb_build_object(
    'source', 'external_booking_system',
    'webhook_id', 'wh_12345',
    'processed_at', now()::text
  ),
  now() - interval '1 hour'
from public.bookings b
where b.external_booking_id = 'EXT-BOOKING-001';

insert into public.event_logs (
  event_type,
  external_id,
  request_id,
  user_id,
  booking_id,
  level,
  message,
  meta,
  created_at
)
select
  'user_provisioned',
  null,
  'req_def456',
  '00000000-0000-0000-0000-000000000002'::uuid,
  null,
  'info',
  'Guest user profile created after booking confirmation',
  jsonb_build_object(
    'email', 'guest1@saele.com',
    'role', 'guest'
  ),
  now() - interval '1 hour'
from public.bookings b
where b.external_booking_id = 'EXT-BOOKING-001'
limit 1;

insert into public.event_logs (
  event_type,
  external_id,
  request_id,
  user_id,
  booking_id,
  level,
  message,
  meta,
  created_at
)
values (
  'webhook_error',
  'EXT-BOOKING-INVALID',
  'req_error789',
  null,
  null,
  'error',
  'Failed to process webhook: invalid booking data',
  jsonb_build_object(
    'error', 'missing_required_field',
    'field', 'check_in_date',
    'raw_payload', '{"booking_id": "EXT-BOOKING-INVALID"}'
  ),
  now() - interval '30 minutes'
);

insert into public.event_logs (
  event_type,
  external_id,
  request_id,
  user_id,
  booking_id,
  level,
  message,
  meta,
  created_at
)
values (
  'notification_sent',
  null,
  'req_notif001',
  '00000000-0000-0000-0000-000000000002'::uuid,
  (select id from public.bookings where external_booking_id = 'EXT-BOOKING-001'),
  'info',
  'Magic link email sent successfully',
  jsonb_build_object(
    'notification_type', 'magic_link',
    'recipient', 'guest1@saele.com',
    'provider', 'sendgrid'
  ),
  now() - interval '59 minutes'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify seed data after running

-- select 'Profiles' as table_name, count(*) as count from public.profiles
-- union all
-- select 'Bookings', count(*) from public.bookings
-- union all
-- select 'Host Contacts', count(*) from public.host_contacts
-- union all
-- select 'Notifications', count(*) from public.notifications
-- union all
-- select 'Event Logs', count(*) from public.event_logs;

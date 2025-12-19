-- Initial Database Schema for Saele MVP
-- Tables: profiles, bookings, host_contacts, notifications, event_logs

-- =====================================================
-- 1. PROFILES TABLE (1:1 with auth.users)
-- =====================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('guest', 'admin')) default 'guest',
  full_name text null,
  phone text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles with role-based access (guest/admin)';
comment on column public.profiles.role is 'User role: guest (default) or admin';

-- =====================================================
-- 2. BOOKINGS TABLE
-- =====================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  external_booking_id text unique not null,
  guest_user_id uuid references auth.users(id) on delete set null,
  email text not null,
  check_in date null,
  check_out date null,
  status text not null check (status in ('confirmed', 'cancelled')) default 'confirmed',
  created_at timestamptz not null default now()
);

comment on table public.bookings is 'Guest bookings from external booking system';
comment on column public.bookings.external_booking_id is 'Unique ID from external booking system (idempotency key)';
comment on column public.bookings.guest_user_id is 'Reference to auth.users; null if user not yet created';
comment on column public.bookings.email is 'Guest email (redundant for traceability)';

-- =====================================================
-- 3. HOST CONTACTS TABLE
-- =====================================================
create table if not exists public.host_contacts (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text null,
  phone text null,
  whatsapp text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.host_contacts is 'Property/tenant contact information for guests';
comment on column public.host_contacts.is_active is 'Only active contacts are shown to guests';

-- =====================================================
-- 4. NOTIFICATIONS TABLE (Queue System)
-- =====================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email text not null,
  user_id uuid null references auth.users(id) on delete set null,
  booking_id uuid null references public.bookings(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('queued', 'sent', 'failed')) default 'queued',
  attempts int not null default 0,
  last_error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

comment on table public.notifications is 'Notification queue with status tracking';
comment on column public.notifications.type is 'Notification type (e.g., magic_link, booking_confirmation)';
comment on column public.notifications.payload is 'Additional data for notification template';
comment on column public.notifications.status is 'Queue status: queued, sent, or failed';

-- =====================================================
-- 5. EVENT LOGS TABLE (Audit Trail)
-- =====================================================
create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  external_id text null,
  request_id text null,
  user_id uuid null references auth.users(id) on delete set null,
  booking_id uuid null references public.bookings(id) on delete set null,
  level text not null check (level in ('info', 'warn', 'error')) default 'info',
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.event_logs is 'Audit trail for webhooks, flows, and system events';
comment on column public.event_logs.event_type is 'Type of event (e.g., booking_confirmed, webhook_received)';
comment on column public.event_logs.external_id is 'External system identifier for correlation';
comment on column public.event_logs.level is 'Log level: info, warn, or error';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Bookings indexes
create index if not exists idx_bookings_guest_user_id on public.bookings(guest_user_id);
create index if not exists idx_bookings_email on public.bookings(email);
create index if not exists idx_bookings_status on public.bookings(status);

-- Notifications indexes
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_recipient_email on public.notifications(recipient_email);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_booking_id on public.notifications(booking_id);

-- Event logs indexes
create index if not exists idx_event_logs_external_id on public.event_logs(external_id);
create index if not exists idx_event_logs_event_type on public.event_logs(event_type);
create index if not exists idx_event_logs_booking_id on public.event_logs(booking_id);
create index if not exists idx_event_logs_created_at on public.event_logs(created_at desc);

-- Host contacts index
create index if not exists idx_host_contacts_is_active on public.host_contacts(is_active);

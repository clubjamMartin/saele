-- Row Level Security (RLS) Policies and Triggers
-- Implements role-based access control for guest/admin users

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if current user is an admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 
    from public.profiles 
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

comment on function public.is_admin is 'Returns true if the current user has admin role';

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function public.handle_updated_at is 'Trigger function to automatically update updated_at timestamp';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update profiles.updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.host_contacts enable row level security;
alter table public.notifications enable row level security;
alter table public.event_logs enable row level security;

-- =====================================================
-- RLS POLICIES: PROFILES
-- =====================================================

-- Guests can view their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- Admins can view all profiles
create policy "profiles_select_admin"
  on public.profiles
  for select
  using (public.is_admin());

-- Users can update their own profile (name and phone only)
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id 
    and role = (select role from public.profiles where user_id = auth.uid())
  );

-- Admins can update any profile
create policy "profiles_update_admin"
  on public.profiles
  for update
  using (public.is_admin());

-- Allow authenticated users to insert their own profile
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: BOOKINGS
-- =====================================================

-- Guests can view only their own bookings
create policy "bookings_select_own"
  on public.bookings
  for select
  using (auth.uid() = guest_user_id);

-- Admins can view all bookings
create policy "bookings_select_admin"
  on public.bookings
  for select
  using (public.is_admin());

-- Only admins can insert/update/delete bookings
-- (Service role bypasses RLS for webhook operations)
create policy "bookings_insert_admin"
  on public.bookings
  for insert
  with check (public.is_admin());

create policy "bookings_update_admin"
  on public.bookings
  for update
  using (public.is_admin());

create policy "bookings_delete_admin"
  on public.bookings
  for delete
  using (public.is_admin());

-- =====================================================
-- RLS POLICIES: HOST CONTACTS
-- =====================================================

-- All authenticated users can view active host contacts
create policy "host_contacts_select_authenticated"
  on public.host_contacts
  for select
  using (auth.uid() is not null and is_active = true);

-- Admins can view all host contacts (including inactive)
create policy "host_contacts_select_all_admin"
  on public.host_contacts
  for select
  using (public.is_admin());

-- Only admins can manage host contacts
create policy "host_contacts_insert_admin"
  on public.host_contacts
  for insert
  with check (public.is_admin());

create policy "host_contacts_update_admin"
  on public.host_contacts
  for update
  using (public.is_admin());

create policy "host_contacts_delete_admin"
  on public.host_contacts
  for delete
  using (public.is_admin());

-- =====================================================
-- RLS POLICIES: NOTIFICATIONS
-- =====================================================

-- Only admins can view notifications
create policy "notifications_select_admin"
  on public.notifications
  for select
  using (public.is_admin());

-- Only admins can manage notifications
-- (Service role bypasses RLS for automated notification processing)
create policy "notifications_insert_admin"
  on public.notifications
  for insert
  with check (public.is_admin());

create policy "notifications_update_admin"
  on public.notifications
  for update
  using (public.is_admin());

create policy "notifications_delete_admin"
  on public.notifications
  for delete
  using (public.is_admin());

-- =====================================================
-- RLS POLICIES: EVENT LOGS
-- =====================================================

-- Only admins can view event logs
create policy "event_logs_select_admin"
  on public.event_logs
  for select
  using (public.is_admin());

-- Only admins can manage event logs
-- (Service role bypasses RLS for automated logging)
create policy "event_logs_insert_admin"
  on public.event_logs
  for insert
  with check (public.is_admin());

create policy "event_logs_update_admin"
  on public.event_logs
  for update
  using (public.is_admin());

create policy "event_logs_delete_admin"
  on public.event_logs
  for delete
  using (public.is_admin());

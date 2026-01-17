-- Allow authenticated users to claim their own bookings
-- This enables users to link bookings to their account when guest_user_id is NULL
-- and the email matches their authenticated email

-- Drop existing select policy that may conflict
drop policy if exists "bookings_select_own" on public.bookings;

-- Allow authenticated users to claim bookings with their email
create policy "users_can_claim_own_bookings"
  on public.bookings
  for update
  to authenticated
  using (
    -- Can only update if:
    -- 1. The booking email matches the authenticated user's email
    -- 2. The booking is not yet claimed (guest_user_id is null)
    email = (select auth.email()) 
    and guest_user_id is null
  )
  with check (
    -- Can only set guest_user_id to their own user ID
    guest_user_id = auth.uid()
  );

-- Update select policy to allow users to see their claimable and owned bookings
create policy "bookings_select_own"
  on public.bookings
  for select
  to authenticated
  using (
    -- Can see bookings with their email that aren't claimed yet
    (email = (select auth.email()) and guest_user_id is null)
    or
    -- Or bookings they already own
    guest_user_id = auth.uid()
  );

comment on policy "users_can_claim_own_bookings" on public.bookings is 
  'Allows authenticated users to claim bookings by updating guest_user_id from NULL to their own user ID, only if the email matches';

comment on policy "bookings_select_own" on public.bookings is 
  'Allows authenticated users to see bookings they can claim (email match + NULL guest_user_id) or already own';

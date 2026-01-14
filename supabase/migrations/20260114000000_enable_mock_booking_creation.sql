-- Enable mock booking creation for MVP
-- This allows unauthenticated users to create bookings via the mock booking form
-- In production, bookings would come from an external booking system with API authentication

-- Allow anonymous users to insert bookings (for mock booking form)
create policy "bookings_insert_mock"
  on public.bookings
  for insert
  to anon
  with check (true);

-- Comment explaining the policy
comment on policy "bookings_insert_mock" on public.bookings is 
  'Allows anonymous booking creation for MVP mock form. Remove in production when using external booking system.';

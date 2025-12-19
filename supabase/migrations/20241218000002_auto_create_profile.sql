-- Automatic Profile Creation Trigger
-- Creates a guest profile automatically when a new user signs up via Supabase Auth

-- =====================================================
-- FUNCTION: Handle New User Creation
-- =====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Automatically create a profile with default 'guest' role
  insert into public.profiles (user_id, role, created_at, updated_at)
  values (new.id, 'guest', now(), now());
  
  return new;
end;
$$ language plpgsql security definer;

comment on function public.handle_new_user is 'Automatically creates a guest profile when a new user is created in auth.users';

-- =====================================================
-- TRIGGER: On Auth User Created
-- =====================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

comment on trigger on_auth_user_created on auth.users is 'Trigger that automatically creates a profile with guest role for new users';

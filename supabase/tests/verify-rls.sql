-- RLS Policy Verification Script
-- Tests all Row Level Security policies to ensure proper access control
-- Run this script in Supabase SQL Editor or via psql to verify RLS implementation

-- =====================================================
-- SETUP: Test Configuration
-- =====================================================

-- Use these UUIDs from seed data or replace with actual test user IDs
\set admin_user_id '00000000-0000-0000-0000-000000000001'
\set guest_user_id_1 '00000000-0000-0000-0000-000000000002'
\set guest_user_id_2 '00000000-0000-0000-0000-000000000003'

-- =====================================================
-- HELPER: Test Result Tracking
-- =====================================================

create temp table if not exists test_results (
  test_id serial primary key,
  test_name text not null,
  expected_result text not null,
  actual_result text not null,
  status text not null check (status in ('PASS', 'FAIL')),
  notes text,
  created_at timestamptz default now()
);

-- Helper function to record test results
create or replace function record_test(
  p_test_name text,
  p_expected text,
  p_actual text,
  p_notes text default null
) returns void as $$
declare
  v_status text;
begin
  v_status := case when p_expected = p_actual then 'PASS' else 'FAIL' end;
  
  insert into test_results (test_name, expected_result, actual_result, status, notes)
  values (p_test_name, p_expected, p_actual, v_status, p_notes);
end;
$$ language plpgsql;

-- =====================================================
-- TEST SUITE 1: PROFILES TABLE RLS
-- =====================================================

\echo '=== Testing PROFILES table RLS policies ==='

-- Test 1.1: Guest can view own profile
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.profiles where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  perform record_test('Guest views own profile', '1', v_count::text, 'Guest should see only their profile');
end $$;

-- Test 1.2: Guest cannot view other profiles
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.profiles where user_id != '00000000-0000-0000-0000-000000000002'::uuid;
  perform record_test('Guest views other profiles', '0', v_count::text, 'Guest should not see other profiles');
end $$;

-- Test 1.3: Admin can view all profiles
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.profiles;
  perform record_test('Admin views all profiles', '3', v_count::text, 'Admin should see all 3 seed profiles');
end $$;

-- Test 1.4: Guest can update own profile (name and phone only)
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_success boolean;
  v_old_role text;
  v_new_role text;
begin
  -- Store original role
  select role into v_old_role from public.profiles where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  
  -- Try to update name and phone (should succeed)
  update public.profiles
  set full_name = 'Test Update', phone = '+49 123 456789'
  where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  
  select found into v_success;
  
  -- Verify role didn't change
  select role into v_new_role from public.profiles where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  
  perform record_test('Guest updates own profile', 'true', v_success::text, 'Guest can update name and phone');
  perform record_test('Guest role unchanged after update', v_old_role, v_new_role, 'Role should remain guest');
end $$;

-- Test 1.5: Guest cannot change own role
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_error_occurred boolean := false;
  v_role_after text;
begin
  begin
    update public.profiles
    set role = 'admin'
    where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  exception when others then
    v_error_occurred := true;
  end;
  
  -- Check role is still guest
  select role into v_role_after from public.profiles where user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  
  perform record_test('Guest changes own role', 'guest', v_role_after, 'Guest should not be able to change role to admin');
end $$;

-- =====================================================
-- TEST SUITE 2: BOOKINGS TABLE RLS
-- =====================================================

\echo '=== Testing BOOKINGS table RLS policies ==='

-- Test 2.1: Guest can view own bookings
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.bookings where guest_user_id = '00000000-0000-0000-0000-000000000002'::uuid;
  perform record_test('Guest views own bookings', '2', v_count::text, 'Guest should see their 2 bookings');
end $$;

-- Test 2.2: Guest cannot view other bookings
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.bookings where guest_user_id != '00000000-0000-0000-0000-000000000002'::uuid;
  perform record_test('Guest views other bookings', '0', v_count::text, 'Guest should not see others bookings');
end $$;

-- Test 2.3: Admin can view all bookings
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.bookings;
  perform record_test('Admin views all bookings', '4', v_count::text, 'Admin should see all 4 seed bookings');
end $$;

-- Test 2.4: Guest cannot insert bookings
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_error_occurred boolean := false;
begin
  begin
    insert into public.bookings (external_booking_id, email, status)
    values ('TEST-BOOKING-GUEST', 'test@example.com', 'confirmed');
  exception when others then
    v_error_occurred := true;
  end;
  
  perform record_test('Guest inserts booking', 'true', v_error_occurred::text, 'Guest should not be able to insert bookings');
end $$;

-- Test 2.5: Admin can insert bookings
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_success boolean := false;
begin
  begin
    insert into public.bookings (external_booking_id, email, status)
    values ('TEST-BOOKING-ADMIN', 'admin-test@example.com', 'confirmed');
    v_success := true;
  exception when others then
    v_success := false;
  end;
  
  perform record_test('Admin inserts booking', 'true', v_success::text, 'Admin should be able to insert bookings');
  
  -- Cleanup
  delete from public.bookings where external_booking_id = 'TEST-BOOKING-ADMIN';
end $$;

-- =====================================================
-- TEST SUITE 3: HOST CONTACTS TABLE RLS
-- =====================================================

\echo '=== Testing HOST_CONTACTS table RLS policies ==='

-- Test 3.1: Guest can view active contacts
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.host_contacts where is_active = true;
  perform record_test('Guest views active contacts', '2', v_count::text, 'Guest should see 2 active contacts');
end $$;

-- Test 3.2: Guest cannot view inactive contacts
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.host_contacts where is_active = false;
  perform record_test('Guest views inactive contacts', '0', v_count::text, 'Guest should not see inactive contacts');
end $$;

-- Test 3.3: Admin can view all contacts
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.host_contacts;
  perform record_test('Admin views all contacts', '3', v_count::text, 'Admin should see all 3 contacts (active + inactive)');
end $$;

-- Test 3.4: Guest cannot insert contacts
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_error_occurred boolean := false;
begin
  begin
    insert into public.host_contacts (display_name, email, is_active)
    values ('Test Contact', 'test@example.com', true);
  exception when others then
    v_error_occurred := true;
  end;
  
  perform record_test('Guest inserts contact', 'true', v_error_occurred::text, 'Guest should not be able to insert contacts');
end $$;

-- Test 3.5: Admin can insert contacts
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_success boolean := false;
  v_contact_id uuid;
begin
  begin
    insert into public.host_contacts (display_name, email, is_active)
    values ('Admin Test Contact', 'admin-contact@example.com', true)
    returning id into v_contact_id;
    v_success := true;
  exception when others then
    v_success := false;
  end;
  
  perform record_test('Admin inserts contact', 'true', v_success::text, 'Admin should be able to insert contacts');
  
  -- Cleanup
  if v_contact_id is not null then
    delete from public.host_contacts where id = v_contact_id;
  end if;
end $$;

-- =====================================================
-- TEST SUITE 4: NOTIFICATIONS TABLE RLS
-- =====================================================

\echo '=== Testing NOTIFICATIONS table RLS policies ==='

-- Test 4.1: Guest cannot view notifications
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.notifications;
  perform record_test('Guest views notifications', '0', v_count::text, 'Guest should not see any notifications');
end $$;

-- Test 4.2: Admin can view all notifications
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.notifications;
  perform record_test('Admin views notifications', '3', v_count::text, 'Admin should see all 3 seed notifications');
end $$;

-- =====================================================
-- TEST SUITE 5: EVENT LOGS TABLE RLS
-- =====================================================

\echo '=== Testing EVENT_LOGS table RLS policies ==='

-- Test 5.1: Guest cannot view event logs
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.event_logs;
  perform record_test('Guest views event logs', '0', v_count::text, 'Guest should not see any event logs');
end $$;

-- Test 5.2: Admin can view all event logs
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.event_logs;
  perform record_test('Admin views event logs', '4', v_count::text, 'Admin should see all 4 seed event logs');
end $$;

-- =====================================================
-- TEST SUITE 6: HELPER FUNCTIONS
-- =====================================================

\echo '=== Testing helper functions ==='

-- Test 6.1: is_admin() returns true for admin
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'admin_user_id')::text;

do $$
declare
  v_result boolean;
begin
  select public.is_admin() into v_result;
  perform record_test('is_admin() for admin user', 'true', v_result::text, 'Function should return true for admin');
end $$;

-- Test 6.2: is_admin() returns false for guest
reset role;
set local role authenticated;
set local request.jwt.claims to json_build_object('sub', :'guest_user_id_1')::text;

do $$
declare
  v_result boolean;
begin
  select public.is_admin() into v_result;
  perform record_test('is_admin() for guest user', 'false', v_result::text, 'Function should return false for guest');
end $$;

-- =====================================================
-- TEST SUITE 7: AUTOMATIC PROFILE CREATION
-- =====================================================

\echo '=== Testing automatic profile creation trigger ==='

-- Test 7.1: Verify trigger exists
do $$
declare
  v_trigger_exists boolean;
begin
  select exists(
    select 1 from pg_trigger 
    where tgname = 'on_auth_user_created'
  ) into v_trigger_exists;
  
  perform record_test('Profile creation trigger exists', 'true', v_trigger_exists::text, 'Trigger on_auth_user_created should exist');
end $$;

-- Test 7.2: Verify trigger function exists
do $$
declare
  v_function_exists boolean;
begin
  select exists(
    select 1 from pg_proc 
    where proname = 'handle_new_user'
  ) into v_function_exists;
  
  perform record_test('Profile creation function exists', 'true', v_function_exists::text, 'Function handle_new_user should exist');
end $$;

-- =====================================================
-- TEST RESULTS SUMMARY
-- =====================================================

\echo ''
\echo '=== TEST RESULTS SUMMARY ==='
\echo ''

-- Display all test results
select 
  test_id,
  test_name,
  status,
  case 
    when status = 'PASS' then '✅'
    else '❌'
  end as icon,
  expected_result,
  actual_result,
  notes
from test_results
order by test_id;

-- Summary statistics
\echo ''
\echo '=== STATISTICS ==='

select 
  count(*) as total_tests,
  count(*) filter (where status = 'PASS') as passed,
  count(*) filter (where status = 'FAIL') as failed,
  round(100.0 * count(*) filter (where status = 'PASS') / count(*), 2) as pass_percentage
from test_results;

-- List failures
\echo ''
\echo '=== FAILED TESTS ==='

select 
  test_id,
  test_name,
  expected_result,
  actual_result,
  notes
from test_results
where status = 'FAIL'
order by test_id;

-- Check if all tests passed
do $$
declare
  v_failed_count int;
begin
  select count(*) into v_failed_count from test_results where status = 'FAIL';
  
  if v_failed_count = 0 then
    raise notice '✅ ALL TESTS PASSED! RLS implementation is correct.';
  else
    raise warning '❌ % test(s) failed. Review the failures above.', v_failed_count;
  end if;
end $$;

-- =====================================================
-- CLEANUP
-- =====================================================

-- Reset role
reset role;

\echo ''
\echo '=== Test execution complete ==='
\echo 'Review the results above to verify RLS policies are working correctly.'
\echo ''

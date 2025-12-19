# Testing Guide - Saele Role-Based Access Control

This guide provides step-by-step instructions for manually testing the role-based access control (RBAC) system implemented in SAE-20.

## Prerequisites

Before testing, ensure:

1. Local Supabase is running: `pnpm run db:start`
2. Database is reset with latest migrations: `pnpm run db:reset`
3. Development server is running: `pnpm dev`
4. Application is accessible at `http://localhost:3000`

## Test Suite Overview

This guide covers:
- ✅ **Test 1:** Guest user signup and automatic profile creation
- ✅ **Test 2:** Guest user access restrictions
- ✅ **Test 3:** Admin user full access
- ✅ **Test 4:** Route protection and redirects
- ✅ **Test 5:** Role immutability (security test)

---

## Test 1: Guest User Signup & Automatic Profile Creation

**Objective:** Verify that new users automatically receive a guest profile with proper default values.

**📝 Note on Profile Creation:**
- **Local Dev:** Profile may be created by database trigger OR application code
- **Production:** Profile is created by application code in auth callback
- Both approaches are tested the same way from the user's perspective

### Steps:

1. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

2. **Enter a NEW email address** (one that hasn't been used before):
   ```
   testguest@example.com
   ```

3. **Click "Send magic link"**
   - ✅ Should see success message: "Check your email"

4. **Check Supabase local inbox:**
   - Open: `http://127.0.0.1:54324` (Inbucket - local mail catcher)
   - Find the magic link email
   - Click the magic link

5. **Verify redirect to dashboard:**
   - Should redirect to: `http://localhost:3000/dashboard`
   - Should see welcome message with your name or "Guest"

6. **Verify profile was created automatically:**
   
   Open Supabase Studio: `http://127.0.0.1:54323`
   
   Run SQL query:
   ```sql
   select * from public.profiles 
   where user_id = (
     select id from auth.users 
     where email = 'testguest@example.com'
   );
   ```
   
   **Expected result:**
   - ✅ One row returned
   - ✅ `role` = `'guest'`
   - ✅ `created_at` and `updated_at` are set
   - ✅ `full_name` is NULL (not set yet)

### ✅ Success Criteria:
- [ ] Magic link sent successfully
- [ ] User can authenticate via magic link
- [ ] Profile created automatically with `role = 'guest'`
- [ ] User redirected to dashboard
- [ ] No errors in console

---

## Test 2: Guest User Access Restrictions

**Objective:** Verify that guest users can only access their own data and cannot see admin features.

### Steps:

1. **Sign in as guest user** (use `testguest@example.com` from Test 1 or use seed data `guest1@saele.com`)

2. **Test dashboard access:**
   - Navigate to: `http://localhost:3000/dashboard`
   - ✅ Should see dashboard with profile info
   - ✅ Should see "Your Bookings" section
   - ✅ Should NOT see "Admin Panel" button

3. **Test admin panel access (should be blocked):**
   - Try to navigate to: `http://localhost:3000/admin`
   - ✅ Should be REDIRECTED back to `/dashboard`
   - ✅ Should NOT see admin panel content

4. **Verify data isolation in database:**
   
   Run SQL query in Supabase Studio:
   ```sql
   -- Set session to guest user (use actual UUID from profiles table)
   set local role authenticated;
   set local request.jwt.claims to '{"sub": "YOUR_GUEST_USER_UUID"}';
   
   -- Test profile access
   select * from public.profiles;
   -- Expected: Only own profile returned
   
   -- Test bookings access
   select * from public.bookings;
   -- Expected: Only own bookings returned
   
   -- Test notifications access
   select * from public.notifications;
   -- Expected: 0 rows (guests cannot see notifications)
   
   -- Test event logs access
   select * from public.event_logs;
   -- Expected: 0 rows (guests cannot see logs)
   ```

5. **Test host contacts access:**
   - On dashboard, scroll to "Contact Information" section
   - ✅ Should see active host contacts only
   - ✅ Should NOT see inactive contacts

### ✅ Success Criteria:
- [ ] Guest can access `/dashboard`
- [ ] Guest is blocked from `/admin` (redirected)
- [ ] Guest can only query own profile and bookings
- [ ] Guest cannot query notifications or event logs
- [ ] Guest can see active host contacts
- [ ] No "Admin Panel" button visible

---

## Test 3: Admin User Full Access

**Objective:** Verify that admin users have full access to all data and admin features.

### Steps:

1. **Create an admin user:**
   
   Option A - Use seed data:
   - Email: `admin@saele.com`
   - UUID: `00000000-0000-0000-0000-000000000001`
   
   Option B - Manually promote a user to admin:
   ```sql
   -- In Supabase Studio, run:
   update public.profiles
   set role = 'admin'
   where user_id = (
     select id from auth.users 
     where email = 'YOUR_EMAIL@example.com'
   );
   ```

2. **Sign in as admin user:**
   - Log out if currently logged in
   - Navigate to: `http://localhost:3000/login`
   - Enter admin email and click magic link

3. **Test dashboard access:**
   - Navigate to: `http://localhost:3000/dashboard`
   - ✅ Should see dashboard
   - ✅ Should see "Admin Panel" button in header

4. **Test admin panel access:**
   - Click "Admin Panel" button OR navigate to: `http://localhost:3000/admin`
   - ✅ Should see admin panel with "Welcome, Admin" message
   - ✅ Should see admin features grid (Bookings, Users, Contacts, etc.)
   - ✅ Should see role badge showing "admin"

5. **Verify full data access in database:**
   
   Run SQL query in Supabase Studio:
   ```sql
   -- Set session to admin user
   set local role authenticated;
   set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';
   
   -- Test profile access
   select * from public.profiles;
   -- Expected: ALL profiles returned (3+ rows)
   
   -- Test bookings access
   select * from public.bookings;
   -- Expected: ALL bookings returned (4+ rows)
   
   -- Test notifications access
   select * from public.notifications;
   -- Expected: ALL notifications returned
   
   -- Test event logs access
   select * from public.event_logs;
   -- Expected: ALL logs returned
   
   -- Test host contacts access
   select * from public.host_contacts;
   -- Expected: ALL contacts returned (including inactive)
   ```

6. **Test navigation between dashboard and admin:**
   - From admin panel, click "Dashboard" link
   - ✅ Should navigate to dashboard
   - From dashboard, click "Admin Panel" button
   - ✅ Should navigate back to admin panel

### ✅ Success Criteria:
- [ ] Admin can access both `/dashboard` and `/admin`
- [ ] Admin Panel button is visible on dashboard
- [ ] Admin can query ALL profiles, bookings, notifications, logs
- [ ] Admin role badge displays correctly
- [ ] Navigation between sections works properly

---

## Test 4: Route Protection & Redirects

**Objective:** Verify that authentication and authorization redirects work correctly.

### Test 4.1: Unauthenticated Access

1. **Sign out completely:**
   - Click "Sign out" button in header

2. **Try to access protected routes:**
   
   Test dashboard:
   ```
   http://localhost:3000/dashboard
   ```
   - ✅ Should redirect to `/login`
   
   Test admin:
   ```
   http://localhost:3000/admin
   ```
   - ✅ Should redirect to `/login`

### Test 4.2: Guest User Authorization

1. **Sign in as guest user** (`guest1@saele.com`)

2. **Try to access admin route:**
   ```
   http://localhost:3000/admin
   ```
   - ✅ Should redirect to `/dashboard` (not login)
   - ✅ User stays authenticated but denied admin access

### Test 4.3: Admin User Authorization

1. **Sign in as admin user** (`admin@saele.com`)

2. **Access admin route:**
   ```
   http://localhost:3000/admin
   ```
   - ✅ Should show admin panel (no redirect)

### ✅ Success Criteria:
- [ ] Unauthenticated users redirected to `/login`
- [ ] Authenticated guests redirected from `/admin` to `/dashboard`
- [ ] Authenticated admins can access all routes
- [ ] Redirects preserve user session

---

## Test 5: Role Immutability & Security

**Objective:** Verify that guest users cannot escalate their privileges to admin.

### Test 5.1: Profile Update Restrictions

1. **Sign in as guest user**

2. **Attempt to update own role via database:**
   
   Run SQL query in Supabase Studio:
   ```sql
   -- Set session to guest user
   set local role authenticated;
   set local request.jwt.claims to '{"sub": "YOUR_GUEST_USER_UUID"}';
   
   -- Try to change own role to admin
   update public.profiles
   set role = 'admin'
   where user_id = 'YOUR_GUEST_USER_UUID';
   ```
   
   **Expected result:**
   - ❌ Query should FAIL with error: "new row violates row-level security policy"
   - ✅ Role remains `'guest'`

3. **Verify role in database:**
   ```sql
   select role from public.profiles
   where user_id = 'YOUR_GUEST_USER_UUID';
   ```
   - ✅ Role should still be `'guest'`

### Test 5.2: Cross-User Profile Access

1. **Still signed in as guest user**

2. **Attempt to view another user's profile:**
   ```sql
   -- Set session to guest user
   set local role authenticated;
   set local request.jwt.claims to '{"sub": "GUEST_USER_UUID"}';
   
   -- Try to view admin profile
   select * from public.profiles
   where role = 'admin';
   ```
   
   **Expected result:**
   - ✅ Query returns 0 rows (guest cannot see other profiles)

3. **Attempt to modify another user's bookings:**
   ```sql
   -- Try to update another user's booking
   update public.bookings
   set status = 'cancelled'
   where guest_user_id != 'GUEST_USER_UUID';
   ```
   
   **Expected result:**
   - ❌ Query should affect 0 rows (guests cannot modify others' bookings)
   - ✅ Admin users' bookings remain unchanged

### ✅ Success Criteria:
- [ ] Guest users cannot change their own role
- [ ] Guest users cannot view other users' profiles
- [ ] Guest users cannot modify other users' bookings
- [ ] RLS policies prevent privilege escalation
- [ ] All security violations are properly blocked

---

## Test 6: Profile Update (Allowed Fields)

**Objective:** Verify that users can update their allowed profile fields.

### Steps:

1. **Sign in as guest user**

2. **Test allowed profile updates:**
   
   Run SQL query:
   ```sql
   -- Set session to guest user
   set local role authenticated;
   set local request.jwt.claims to '{"sub": "GUEST_USER_UUID"}';
   
   -- Update allowed fields (name and phone)
   update public.profiles
   set full_name = 'John Doe',
       phone = '+49 170 1234567'
   where user_id = 'GUEST_USER_UUID';
   ```
   
   **Expected result:**
   - ✅ Query succeeds
   - ✅ `updated_at` timestamp is automatically updated

3. **Verify updates:**
   ```sql
   select full_name, phone, updated_at, role
   from public.profiles
   where user_id = 'GUEST_USER_UUID';
   ```
   
   **Expected result:**
   - ✅ `full_name` = `'John Doe'`
   - ✅ `phone` = `'+49 170 1234567'`
   - ✅ `role` = `'guest'` (unchanged)
   - ✅ `updated_at` is recent timestamp

### ✅ Success Criteria:
- [ ] Users can update their own `full_name`
- [ ] Users can update their own `phone`
- [ ] `updated_at` is automatically updated via trigger
- [ ] `role` cannot be changed by user
- [ ] Users cannot update other users' profiles

---

## Quick Test Commands

### Reset Database and Start Fresh

```bash
# Stop Supabase
pnpm run db:stop

# Start Supabase
pnpm run db:start

# Reset database with all migrations and seed data
pnpm run db:reset

# Start dev server
pnpm dev
```

### Check Local Services

- **Application:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54323
- **Inbucket (Email):** http://127.0.0.1:54324
- **Supabase API:** http://127.0.0.1:54321

### Seed Data Quick Reference

| Email | Role | UUID (for testing) |
|-------|------|-------------------|
| `admin@saele.com` | admin | `00000000-0000-0000-0000-000000000001` |
| `guest1@saele.com` | guest | `00000000-0000-0000-0000-000000000002` |
| `guest2@saele.com` | guest | `00000000-0000-0000-0000-000000000003` |

---

## Troubleshooting

### Issue: Magic link not working

**Solution:**
1. Check Inbucket at http://127.0.0.1:54324
2. Make sure Supabase is running: `pnpm run db:start`
3. Check console for errors

### Issue: Profile not created automatically

**Solution:**

**For Local Development:**
1. Verify migrations were applied: Check `supabase/migrations/` files
2. Run: `pnpm run db:reset` to reapply all migrations
3. Check trigger exists:
   ```sql
   select * from pg_trigger 
   where tgname = 'on_auth_user_created';
   ```
4. If trigger doesn't exist, profile will be created by application code in auth callback

**For Production/Hosted Supabase:**
1. Profile creation happens in [`app/(public)/auth/callback/route.ts`](app/(public)/auth/callback/route.ts)
2. Check application logs for any errors during profile creation
3. Verify the auth callback route is being called after magic link click
4. Manually create profile if needed:
   ```sql
   insert into public.profiles (user_id, role)
   values ('USER_UUID_HERE', 'guest');
   ```

**Note:** Hosted Supabase doesn't allow triggers on `auth.users`, so application-level profile creation is expected and correct behavior.

### Issue: Admin user cannot access admin panel

**Solution:**
1. Verify role in database:
   ```sql
   select email, role from public.profiles p
   join auth.users u on p.user_id = u.id
   where u.email = 'your-email@example.com';
   ```
2. If role is not 'admin', update it:
   ```sql
   update public.profiles
   set role = 'admin'
   where user_id = (
     select id from auth.users 
     where email = 'your-email@example.com'
   );
   ```

### Issue: RLS policy errors

**Solution:**
1. Check if RLS is enabled:
   ```sql
   select tablename, rowsecurity 
   from pg_tables 
   where schemaname = 'public';
   ```
2. List all policies:
   ```sql
   select schemaname, tablename, policyname 
   from pg_policies 
   where schemaname = 'public';
   ```
3. Verify `is_admin()` function exists:
   ```sql
   select public.is_admin();
   ```

---

## Test Report Template

After completing all tests, use this template to document results:

```markdown
# SAE-20 Test Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Local Development

## Test Results

- [ ] Test 1: Guest User Signup - PASS/FAIL
- [ ] Test 2: Guest Access Restrictions - PASS/FAIL
- [ ] Test 3: Admin Full Access - PASS/FAIL
- [ ] Test 4: Route Protection - PASS/FAIL
- [ ] Test 5: Role Immutability - PASS/FAIL
- [ ] Test 6: Profile Updates - PASS/FAIL

## Issues Found

1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Steps to reproduce:**
   - **Expected:** 
   - **Actual:**

## Notes

[Any additional observations or recommendations]
```

---

## Next Steps

After completing these tests and confirming all pass:

1. ✅ Mark SAE-20 as complete in Linear
2. 📝 Document any issues found in new tickets
3. 🚀 Deploy to staging environment for further testing
4. 📊 Run automated SQL verification script (`supabase/tests/verify-rls.sql`)

---

**For automated SQL testing, see:** [`supabase/tests/verify-rls.sql`](supabase/tests/verify-rls.sql)

**For database schema details, see:** [`SCHEMA.md`](SCHEMA.md)

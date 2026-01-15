# Apply Onboarding Migration to Hosted Supabase

## 🎯 Issue
The onboarding fields need to be added to the `profiles` table in your hosted Supabase instance.

## 📝 Migration to Apply

File: `supabase/migrations/20260114000001_add_onboarding_fields.sql`

```sql
-- Add onboarding fields to profiles table
-- Part of SAE-14 to SAE-18: Complete onboarding flow

-- Add new columns for onboarding data
ALTER TABLE public.profiles
ADD COLUMN avatar_url text,
ADD COLUMN interests text[],
ADD COLUMN notification_preferences jsonb,
ADD COLUMN onboarding_completed_at timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.interests IS 'Array of user interests for personalized content';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'JSON object storing notification preferences';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding (null = onboarding not completed)';
```

## 🚀 How to Apply

### Option 1: Via Supabase Studio (Recommended)

1. Go to https://supabase.com/dashboard/project/sbbcczpdlzmhwpytglgr
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the migration SQL above
5. Click **Run** or press `Cmd+Enter`
6. Verify success (should show "Success. No rows returned")

### Option 2: Via Supabase CLI

```bash
# Link to your project (if not already linked)
supabase link --project-ref sbbcczpdlzmhwpytglgr

# Push migrations to remote
supabase db push
```

## ✅ Verification

After applying the migration, verify the schema:

```sql
-- Check that columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('avatar_url', 'interests', 'notification_preferences', 'onboarding_completed_at');
```

Expected result (4 rows):
- `avatar_url` | `text` | `YES`
- `interests` | `ARRAY` | `YES`
- `notification_preferences` | `jsonb` | `YES`
- `onboarding_completed_at` | `timestamp with time zone` | `YES`

## 🐛 What This Fixes

### Before Migration
- ❌ New users couldn't complete onboarding (missing fields)
- ❌ Dashboard showed errors: "Error getting user profile: {}"
- ❌ Onboarding data couldn't be saved

### After Migration
- ✅ New users can complete full onboarding flow
- ✅ Profile data is properly saved
- ✅ Users are redirected to onboarding on first login
- ✅ No console errors on dashboard

## 🔄 Related Code Changes

The following files have been updated to fix the auth and redirect logic:

1. **`app/(public)/auth/callback/route.ts`**
   - Fixed profile existence check (handles Supabase error correctly)
   - Properly redirects new users to onboarding

2. **`app/(protected)/dashboard/page.tsx`**
   - Added onboarding completion check
   - Redirects incomplete profiles to onboarding

## 📊 Impact

After applying this migration:
- Existing users: No impact (new columns allow NULL)
- New users: Will be prompted to complete onboarding
- Database: 4 new columns added to `profiles` table

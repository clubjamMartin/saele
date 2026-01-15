# Onboarding Navigation Fix

**Date:** 2026-01-15  
**Issue:** Button "Zum Dashboard" wasn't navigating to dashboard after onboarding completion  
**Status:** ✅ FIXED

## Problem

When users clicked the "Zum Dashboard" button after completing the onboarding flow:
1. ✅ Profile data was saved correctly to the database
2. ✅ `onboarding_completed_at` timestamp was set
3. ❌ User remained on the onboarding page instead of being redirected to dashboard

## Root Cause

The issue was caused by using Next.js client-side navigation (`router.push('/dashboard')`) which doesn't always trigger middleware re-evaluation:

```typescript
// Previous code (didn't work)
if (result.success) {
  router.push('/dashboard')  // Client-side navigation
}
```

**Why it failed:**
- `router.push()` performs client-side navigation
- Middleware only runs on initial page loads and server-side requests
- The updated `onboarding_completed_at` field wasn't being checked by middleware
- User stayed on `/onboarding` page

## Solution

Changed to full page navigation using `window.location.href`:

```typescript
// New code (works correctly)
if (result.success) {
  // Use full page navigation to ensure middleware re-evaluates onboarding status
  window.location.href = '/dashboard'
}
```

**Why this works:**
- `window.location.href` triggers a full page reload
- Full reload goes through the proxy middleware
- Middleware fetches fresh profile data from database
- Middleware sees `onboarding_completed_at` is set
- Allows navigation to `/dashboard`

## Additional Changes

- Removed unused `useRouter` import
- Moved `setIsLoading(false)` to error handlers only (success case reloads page anyway)

## Files Modified

- `app/onboarding/page.tsx` - Updated `handleComplete` function

## Testing

To verify the fix:
1. Create a new booking on the homepage
2. Click the magic link in the email
3. Complete the onboarding flow (set name, interests, etc.)
4. Click "Zum Dashboard"
5. ✅ User should be redirected to `/dashboard`

## Related Code

### Middleware Logic (proxy.ts)
```typescript
// Line 68-78: Redirect to onboarding if not completed
if (!hasCompletedOnboarding && path !== '/onboarding' && ...) {
  return NextResponse.redirect('/onboarding')
}

// Line 92-102: Redirect to dashboard if already completed
if (hasCompletedOnboarding && path === '/onboarding') {
  return NextResponse.redirect('/dashboard')
}
```

### Server Action (lib/actions/onboarding-actions.ts)
```typescript
// completeOnboarding updates the profile
const { error: updateError } = await supabase
  .from('profiles')
  .update({
    full_name: data.fullName,
    avatar_url: data.avatarUrl,
    interests: data.interests,
    notification_preferences: data.notificationPreferences,
    onboarding_completed_at: new Date().toISOString(),  // Key field
    updated_at: new Date().toISOString(),
  })
  .eq('user_id', user.id)
```

## Best Practices Learned

1. **When to use `window.location.href`:**
   - When you need middleware to re-evaluate on the next request
   - After changing auth state or user profile
   - When client-side navigation cache might be stale

2. **When to use `router.push()`:**
   - For standard client-side navigation
   - When middleware re-evaluation isn't needed
   - For better performance with React state preservation

3. **Alternative approaches (not used but valid):**
   - `router.refresh()` + `router.push()` - Refreshes server data
   - Invalidate specific cache keys
   - Server-side redirect from the action (requires redirect() from 'next/navigation')

## Commit

```
commit 11fa8fba
fix: use full page navigation after onboarding completion

- Replace router.push with window.location.href for dashboard redirect
- Ensures middleware re-evaluates onboarding_completed_at status
- Fixes issue where user stays on onboarding page after completion
- Remove unused useRouter import
```

## Status

✅ **Fixed and deployed to origin/main**

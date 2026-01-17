import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Note: Notification queue available at @/lib/notifications/queue
// Use queueNotification() for custom email notifications (e.g., welcome emails, booking confirmations)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Ensure profile exists (create if missing)
      // This handles profile creation for hosted Supabase where triggers on auth.users are restricted
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, onboarding_completed_at')
        .eq('user_id', data.user.id)
        .single();
      
      // Check if profile doesn't exist (PGRST116 = no rows returned)
      // If profile doesn't exist OR if there was an error fetching it, create it
      if (!profile || profileError) {
        // Profile doesn't exist, create it with default guest role
        // Use full_name from user metadata if available (set during signup)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            role: 'guest',
            full_name: data.user.user_metadata?.full_name || null,
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue anyway - profile might be created by trigger in local dev
        }
        
        // Refetch profile after creation to get the latest state
        const refetch = await supabase
          .from('profiles')
          .select('user_id, onboarding_completed_at')
          .eq('user_id', data.user.id)
          .single();
        
        profile = refetch.data;
        profileError = refetch.error;
      }
      
      // Link any bookings with this email to the authenticated user
      // This handles mock bookings created before user authentication
      // CRITICAL: Wait for this operation to complete before proceeding
      if (data.user.email) {
        const { data: linkedBookings, error: linkBookingsError } = await supabase
          .from('bookings')
          .update({ guest_user_id: data.user.id })
          .eq('email', data.user.email)
          .is('guest_user_id', null)
          .select();
        
        if (linkBookingsError) {
          console.error('Error linking bookings to user:', linkBookingsError);
          // Non-critical error, continue with authentication
        } else if (linkedBookings && linkedBookings.length > 0) {
          console.log(`Successfully linked ${linkedBookings.length} booking(s) to user ${data.user.id}`);
        }
      }
      
      // Check if user needs to complete onboarding
      // First-time users (onboarding_completed_at is null) should be redirected to onboarding
      // If profile doesn't exist (was just created) or onboarding_completed_at is null, redirect to onboarding
      if (!profile || !profile.onboarding_completed_at) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      // Successful authentication - redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    // If there was an error, redirect to login with error message
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      `${origin}/login?error=Authentication failed. Please try again.`
    );
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/login`);
}

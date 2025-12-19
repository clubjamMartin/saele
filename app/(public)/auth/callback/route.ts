import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single();
      
      if (!profile && !profileError) {
        // Profile doesn't exist, create it with default guest role
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            role: 'guest',
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue anyway - profile might be created by trigger in local dev
        }
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

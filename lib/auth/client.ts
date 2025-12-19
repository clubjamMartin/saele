'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Send a magic link to the user's email for passwordless authentication
 * @param email - User's email address
 * @param redirectTo - Optional redirect URL after authentication (defaults to /dashboard)
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo: string = '/dashboard'
) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
    },
  });
  
  if (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  
  // Redirect to home page after sign out
  window.location.href = '/';
}

/**
 * Get the current session (client-side)
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

/**
 * Get the current user (client-side)
 */
export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

/**
 * Listen to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  const supabase = createClient();
  
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  
  return () => subscription.unsubscribe();
}

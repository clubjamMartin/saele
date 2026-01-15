'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Send a magic link to the user's email for passwordless authentication
 * @param email - User's email address
 * @returns Result object with success status and optional error message
 */
export async function sendMagicLink(email: string) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error sending magic link:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in sendMagicLink:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send magic link',
    };
  }
}

/**
 * Send a magic link with custom redirect and user metadata
 * Used for booking flow where we want to set full_name in user metadata
 * @param email - User's email address
 * @param fullName - User's full name to store in metadata
 * @param redirectPath - Optional redirect path after authentication
 * @returns Result object with success status and optional error message
 */
export async function sendMagicLinkWithMetadata(
  email: string,
  fullName: string,
  redirectPath: string = '/dashboard'
) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${redirectPath}`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Error sending magic link with metadata:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in sendMagicLinkWithMetadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send magic link',
    };
  }
}

/**
 * Sign out the current user
 * Redirects to home page after successful sign out
 */
export async function signOut() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error in signOut:', error);
    throw error;
  }

  // Redirect to home page after sign out
  redirect('/');
}

/**
 * Get the current session status
 * Returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session !== null;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

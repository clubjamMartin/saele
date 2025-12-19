import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

/**
 * Get the current session and user from Supabase Auth
 * Returns null if no session exists
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

/**
 * Get the current user from Supabase Auth
 * Returns null if no user is authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in Server Components and Route Handlers
 */
export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

/**
 * Check if a user has admin role
 * Queries the profiles table to check the role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
  
  return data?.role === 'admin';
}

/**
 * Require admin role - redirects to dashboard if not admin
 * Use in Server Components and Route Handlers for admin-only pages
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const userIsAdmin = await isAdmin(user.id);
  
  if (!userIsAdmin) {
    redirect('/dashboard');
  }
  
  return user;
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  
  return data;
}

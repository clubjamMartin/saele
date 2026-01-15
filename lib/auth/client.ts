/**
 * @deprecated This file is deprecated and should not be used.
 * 
 * All auth operations have been moved to server actions in `lib/actions/auth-actions.ts`.
 * 
 * Migration guide:
 * - Use `sendMagicLink()` from `@/lib/actions/auth-actions` instead of `signInWithMagicLink()`
 * - Use `signOut()` from `@/lib/actions/auth-actions` instead of the client-side version
 * - For session checks, use server-side helpers from `@/lib/auth/session`
 * 
 * This file is kept for reference only and will be removed in a future version.
 */

'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * @deprecated Use `sendMagicLink` from `@/lib/actions/auth-actions` instead
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo: string = '/dashboard'
) {
  throw new Error('This function is deprecated. Use sendMagicLink from @/lib/actions/auth-actions instead.');
}

/**
 * @deprecated Use `signOut` from `@/lib/actions/auth-actions` instead
 */
export async function signOut() {
  throw new Error('This function is deprecated. Use signOut from @/lib/actions/auth-actions instead.');
}

/**
 * @deprecated Use server-side session helpers from `@/lib/auth/session` instead
 */
export async function getSession() {
  throw new Error('This function is deprecated. Use server-side getSession from @/lib/auth/session instead.');
}

/**
 * @deprecated Use server-side user helpers from `@/lib/auth/session` instead
 */
export async function getUser() {
  throw new Error('This function is deprecated. Use server-side getUser from @/lib/auth/session instead.');
}

/**
 * @deprecated Auth state changes should be handled server-side
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  throw new Error('This function is deprecated. Handle auth state changes server-side.');
}

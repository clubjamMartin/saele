'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OnboardingData } from '@/lib/types/onboarding'
import type { Json } from '@/lib/supabase/database.types'

export async function completeOnboarding(data: OnboardingData) {
  console.log('[Server] completeOnboarding called with:', data)
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[Server] User authentication failed:', userError)
    return { success: false, error: 'User not authenticated' }
  }

  console.log('[Server] Updating profile for user:', user.id)

  // Validate required fields
  if (!data.fullName || data.fullName.trim() === '') {
    console.error('[Server] Validation failed: fullName is required')
    return { success: false, error: 'Name ist erforderlich' }
  }

  // Update profile with onboarding data
  const { data: updatedProfiles, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      avatar_url: data.avatarUrl,
      interests: data.interests,
      notification_preferences: data.notificationPreferences as unknown as Json,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()

  if (updateError) {
    console.error('[Server] Database update failed:', updateError)
    return { success: false, error: updateError.message }
  }

  // Check if any rows were updated
  if (!updatedProfiles || updatedProfiles.length === 0) {
    console.error('[Server] No profile found to update for user:', user.id)
    return { success: false, error: 'Profil nicht gefunden' }
  }

  const updatedProfile = updatedProfiles[0]
  console.log('[Server] Onboarding completed successfully, updated profile:', updatedProfile)

  // Verify the update was successful
  if (!updatedProfile?.onboarding_completed_at) {
    console.error('[Server] onboarding_completed_at was not set correctly')
    return { success: false, error: 'Onboarding completion failed to save' }
  }

  // Revalidate paths to clear Next.js cache
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')
  revalidatePath('/onboarding', 'page')

  // Force revalidation of all routes
  try {
    revalidatePath('/', 'layout')
  } catch (e) {
    console.error('[Server] Error revalidating:', e)
  }

  return { success: true }
}

export async function updateAvatar(userId: string, file: File) {
  const supabase = await createClient()

  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  return { success: true, url: publicUrl }
}

export async function getOnboardingStatus() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { isCompleted: false, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('user_id', user.id)
    .single()

  return {
    isCompleted: !!profile?.onboarding_completed_at,
    user,
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OnboardingData } from '@/lib/types/onboarding'
import type { Json } from '@/lib/types/database.types'

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Update profile with onboarding data
  const { error: updateError } = await supabase
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

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Revalidate paths
  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/onboarding')

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

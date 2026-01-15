'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeSection } from './components/welcome-section'
import { DashboardPreview } from './components/dashboard-preview'
import { ProfileSetup } from './components/profile-setup'
import { NotificationPrefs } from './components/notification-prefs'
import { Completion } from './components/completion'
import { completeOnboarding, getOnboardingStatus } from '@/lib/actions/onboarding-actions'
import type { OnboardingData } from '@/lib/types/onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: '',
    avatarUrl: undefined,
    interests: [],
    notificationPreferences: {
      newsletter: false,
    },
  })

  // Fetch user info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      const { user } = await getOnboardingStatus()
      if (user) {
        setOnboardingData((prev) => ({
          ...prev,
          fullName: user.user_metadata?.full_name || user.email || '',
        }))
      }
    }
    fetchUserInfo()
  }, [])

  async function handleComplete() {
    console.log('handleComplete called with data:', onboardingData)
    
    // Validate required fields
    if (!onboardingData.fullName || onboardingData.fullName.trim() === '') {
      alert('Bitte gib deinen Namen ein.')
      return
    }

    setIsLoading(true)

    try {
      console.log('Calling completeOnboarding...')
      const result = await completeOnboarding(onboardingData)
      console.log('completeOnboarding result:', result)

      if (result.success) {
        console.log('Onboarding successful, forcing hard navigation to dashboard...')
        // Use hard navigation to force middleware to re-evaluate with fresh data
        // This ensures the middleware sees the updated onboarding_completed_at
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      } else {
        console.error('Failed to complete onboarding:', result.error)
        alert(`Fehler beim Speichern: ${result.error || 'Unbekannter Fehler'}. Bitte versuche es erneut.`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Fehler beim Speichern. Bitte versuche es erneut.')
      setIsLoading(false)
    }
  }

  return (
    <div className="scroll-smooth min-h-screen" style={{ backgroundColor: 'var(--color-saele-background)' }}>
      <WelcomeSection />

      <DashboardPreview />

      <ProfileSetup
        fullName={onboardingData.fullName || ''}
        avatarUrl={onboardingData.avatarUrl}
        interests={onboardingData.interests}
        onFullNameChange={(fullName) =>
          setOnboardingData((prev) => ({ ...prev, fullName }))
        }
        onAvatarChange={(avatarUrl) =>
          setOnboardingData((prev) => ({ ...prev, avatarUrl }))
        }
        onInterestsChange={(interests) =>
          setOnboardingData((prev) => ({ ...prev, interests }))
        }
      />

      <NotificationPrefs
        newsletter={onboardingData.notificationPreferences.newsletter}
        onNewsletterChange={(newsletter) =>
          setOnboardingData((prev) => ({
            ...prev,
            notificationPreferences: { newsletter },
          }))
        }
      />

      <Completion onComplete={handleComplete} isLoading={isLoading} />
    </div>
  )
}

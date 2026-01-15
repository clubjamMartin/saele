'use client'

import { useState, useEffect } from 'react'
import { WelcomeSection } from './components/welcome-section'
import { DashboardPreview } from './components/dashboard-preview'
import { ProfileSetup } from './components/profile-setup'
import { NotificationPrefs } from './components/notification-prefs'
import { Completion } from './components/completion'
import { completeOnboarding, getOnboardingStatus } from '@/lib/actions/onboarding-actions'
import type { OnboardingData } from '@/lib/types/onboarding'

export default function OnboardingPage() {
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
    setIsLoading(true)

    try {
      const result = await completeOnboarding(onboardingData)

      if (result.success) {
        // Use full page navigation to ensure middleware re-evaluates onboarding status
        window.location.href = '/dashboard'
      } else {
        console.error('Failed to complete onboarding:', result.error)
        alert('Fehler beim Speichern. Bitte versuche es erneut.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Fehler beim Speichern. Bitte versuche es erneut.')
      setIsLoading(false)
    }
  }

  return (
    <div className="scroll-smooth">
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

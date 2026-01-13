'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeSection } from './components/welcome-section'
import { DashboardPreview } from './components/dashboard-preview'
import { ProfileSetup } from './components/profile-setup'
import { NotificationPrefs } from './components/notification-prefs'
import { Completion } from './components/completion'
import { completeOnboarding } from '@/lib/actions/onboarding-actions'
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

  async function handleComplete() {
    setIsLoading(true)

    try {
      const result = await completeOnboarding(onboardingData)

      if (result.success) {
        router.push('/dashboard')
      } else {
        console.error('Failed to complete onboarding:', result.error)
        alert('Fehler beim Speichern. Bitte versuche es erneut.')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Fehler beim Speichern. Bitte versuche es erneut.')
    } finally {
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

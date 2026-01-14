export interface NotificationPreferences {
  newsletter: boolean
}

export interface OnboardingData {
  fullName?: string
  avatarUrl?: string
  interests: string[]
  notificationPreferences: NotificationPreferences
}

export interface InterestOption {
  id: string
  label: string
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'wandern', label: 'Wandern' },
  { id: 'skifahren', label: 'Skifahren' },
  { id: 'wintersport', label: 'Wintersport' },
  { id: 'kulinarik', label: 'Kulinarik' },
  { id: 'paragleiten', label: 'Paragleiten' },
  { id: 'kultur', label: 'Kultur' },
  { id: 'aktivitaeten-als-familie', label: 'Aktivitäten als Familie' },
  { id: 'gruppenaktivitaeten', label: 'Gruppenaktivitäten' },
  { id: 'shoppen', label: 'Shoppen' },
  { id: 'events', label: 'Events' },
  { id: 'wellness', label: 'Wellness' },
]

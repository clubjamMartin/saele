'use client'

interface NotificationPrefsProps {
  newsletter: boolean
  onNewsletterChange: (value: boolean) => void
}

export function NotificationPrefs({
  newsletter,
  onNewsletterChange,
}: NotificationPrefsProps) {
  const handleNotificationRequest = async (value: boolean) => {
    onNewsletterChange(value)
    
    // Request browser notification permission if user agrees
    if (value && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission()
          console.log('Notification permission:', permission)
        } catch (error) {
          console.error('Error requesting notification permission:', error)
        }
      }
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-secondary text-white px-8 py-16">
      {/* Heading */}
      <h2 className="font-['Isabel',sans-serif] font-bold text-[48px] leading-[56px] text-white text-center max-w-[635px] mb-16">
        Gerne würden wir dich über Neuigkeiten, Events, etc. per E-Mail informieren.
      </h2>

      {/* Button Group */}
      <div className="flex gap-6">
        <button
          className={`h-[75px] w-[294px] rounded-[20px] border-2 border-primary-light transition-colors ${
            newsletter 
              ? 'bg-primary-light' 
              : 'bg-secondary hover:bg-primary-light/20'
          }`}
          onClick={() => handleNotificationRequest(true)}
        >
          <span className="font-['Josefin_Sans',sans-serif] font-medium text-[18px] leading-[26px] text-white">
            SEHR GERNE
          </span>
        </button>
        
        <button
          className={`h-[75px] w-[294px] rounded-[20px] border-2 border-primary-light transition-colors ${
            !newsletter 
              ? 'bg-primary-light' 
              : 'bg-secondary hover:bg-primary-light/20'
          }`}
          onClick={() => handleNotificationRequest(false)}
        >
          <span className="font-['Josefin_Sans',sans-serif] font-medium text-[18px] leading-[26px] text-white">
            NEIN DANKE
          </span>
        </button>
      </div>
    </section>
  )
}

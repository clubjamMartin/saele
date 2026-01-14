'use client'

interface NotificationPrefsProps {
  newsletter: boolean
  onNewsletterChange: (value: boolean) => void
}

export function NotificationPrefs({
  newsletter,
  onNewsletterChange,
}: NotificationPrefsProps) {
  return (
    <section className="relative min-h-screen bg-secondary px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-['Isabel',serif] mb-16 text-5xl font-bold text-white">
          Gerne würden wir dich über Neuigkeiten, Events, etc. per E-Mail
          informieren.
        </h2>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => onNewsletterChange(true)}
            className={`min-w-[280px] rounded-2xl border-2 px-12 py-6 font-['Josefin_Sans',sans-serif] text-lg font-medium shadow-xl transition-all hover:scale-105 ${
              newsletter
                ? 'border-primary-light bg-primary-light text-white'
                : 'border-primary-light bg-transparent text-white hover:bg-primary-light/10'
            }`}
          >
            SEHR GERNE
          </button>

          <button
            type="button"
            onClick={() => onNewsletterChange(false)}
            className={`min-w-[280px] rounded-2xl border-2 px-12 py-6 font-['Josefin_Sans',sans-serif] text-lg font-medium shadow-xl transition-all hover:scale-105 ${
              !newsletter
                ? 'border-primary-light bg-primary-light text-white'
                : 'border-primary-light bg-transparent text-white hover:bg-primary-light/10'
            }`}
          >
            NEIN DANKE
          </button>
        </div>
      </div>
    </section>
  )
}

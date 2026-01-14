import { ChevronDown } from 'lucide-react'

export function WelcomeSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-secondary px-6 text-center">
      <h1 className="mb-16 font-['Blush_Free',cursive] text-[clamp(64px,8vw,120px)] leading-[1] text-white">
        Willkommen beim Saele.
      </h1>

      <div className="max-w-3xl space-y-8">
        <p className="font-['Blush_Free',cursive] text-[clamp(40px,5vw,64px)] leading-tight text-primary-light">
          Explore!
        </p>

        <div className="font-['Isabel',serif] text-[clamp(24px,3vw,36px)] font-bold leading-relaxed text-white">
          <p className="mb-6">
            Urlaub ist die beste Zeit im Jahr! Damit du auch alles ganz
            entspannt entdecken kannst, haben wir dir unsere liebsten Tipps
            zusammengesammelt.
          </p>
          <p>
            Wir erklären dir kurz wie du zur perfekten Reiseplanung kommst.
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 flex animate-bounce flex-col items-center gap-2">
        <span className="font-['Isabel',serif] text-sm text-white/80">
          Scroll down
        </span>
        <ChevronDown className="h-8 w-8 text-white/80" />
      </div>
    </section>
  )
}

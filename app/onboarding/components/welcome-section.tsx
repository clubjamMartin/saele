'use client'

import { ChevronDown } from 'lucide-react'

export function WelcomeSection() {
  return (
    <section className="relative flex flex-col items-center min-h-screen bg-secondary text-white px-8 pt-[553px]">
      {/* Main Title */}
      <h1 className="font-['Blush_Free',cursive] text-[clamp(64px,6.25vw,120px)] leading-[100px] text-white text-center mb-[250px] max-w-[1254px]">
        Willkommen beim Saele.
      </h1>
      
      {/* Description */}
      <div className="font-['Isabel',sans-serif] font-bold text-[clamp(24px,1.875vw,36px)] leading-[44px] text-white text-center max-w-[747px] mb-[161px]">
        <p className="mb-0">
          Urlaub ist die beste Zeit im Jahr! Damit du auch alles ganz entspannt entdecken kannst, haben wir dir unsere liebsten Tipps zusammengesammelt.{' '}
        </p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">
          Wir erklären dir kurz wie du zur perfekten Reiseplanung kommst.
        </p>
      </div>

      {/* Explore Badge */}
      <div className="mb-[104px]">
        <p className="font-['Blush_Free',cursive] leading-[50px] text-primary-light text-center">
          <span className="text-[64px]">Explore</span>
          <span className="text-[50px]">!</span>
        </p>
      </div>
      
      {/* Animated Down Arrow */}
      <div className="animate-bounce pb-12">
        <ChevronDown size={48} className="text-primary-light" />
      </div>
    </section>
  )
}

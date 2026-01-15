'use client'

import { useState } from 'react'
import { Phone, Mail, MessageSquare, Play } from 'lucide-react'

const videoSections = [
  { title: 'Gestalte deinen Urlaub', id: 'section-1' },
  { title: 'Reisedaten im Überblick', id: 'section-2' },
  { title: 'Die Zahlung im Überblick', id: 'section-3' },
  { title: 'Weitere Funktionen', id: 'section-4' },
]

export function DashboardPreview() {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  return (
    <section className="relative min-h-screen bg-secondary px-8 py-16">
      {/* Fixed Action Buttons on Right */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        <ActionButton icon={<Phone size={24} />} label="Anrufen" href="tel:+43123456789" />
        <ActionButton icon={<Mail size={24} />} label="Mail" href="mailto:info@saele.at" />
        <ActionButton icon={<MessageSquare size={24} />} label="Chat" />
      </div>

      {/* Video Sections */}
      <div className="flex flex-col items-center gap-12 max-w-[866px] mx-auto">
        {videoSections.map((section, index) => (
          <div key={section.id} className="w-full">
            {/* Video Box */}
            <div 
              className="relative bg-[#94a395] rounded-[20px] aspect-[866/551] flex items-center justify-center overflow-hidden shadow-lg cursor-pointer transition-all hover:shadow-2xl"
              onMouseEnter={() => setHoveredVideo(section.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <Play 
                size={80} 
                className={`text-white/40 transition-all duration-300 ${
                  hoveredVideo === section.id ? 'scale-110 text-white/70' : 'scale-100'
                }`} 
              />
              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-black/0 transition-all duration-300 ${
                hoveredVideo === section.id ? 'bg-black/10' : ''
              }`} />
            </div>
            {/* Title Below */}
            <p className="font-['Isabel',sans-serif] text-[28px] leading-[34px] text-primary-light text-center mt-6">
              {section.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
}

function ActionButton({ icon, label, href, onClick }: ActionButtonProps) {
  const content = (
    <>
      {/* Circle */}
      <div className="w-[83px] h-[83px] bg-primary-light rounded-full flex items-center justify-center shadow-[0px_0px_5px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
        <div className="text-white">
          {icon}
        </div>
      </div>
      {/* Label */}
      <span className="font-['Josefin_Sans',sans-serif] font-medium text-[20px] text-white text-center text-shadow-[0px_0px_5px_rgba(0,0,0,0.5)]">
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <a 
        href={href} 
        className="flex flex-col items-center justify-center gap-2 group"
        target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
      >
        {content}
      </a>
    )
  }

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 group"
    >
      {content}
    </button>
  )
}

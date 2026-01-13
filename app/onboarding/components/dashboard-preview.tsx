'use client'

import { Phone, Mail, MessageSquare, Play } from 'lucide-react'
import { useState } from 'react'

const videoSections = [
  { id: 1, title: 'Gestalte deinen Urlaub' },
  { id: 2, title: 'Reisedaten im Überblick' },
  { id: 3, title: 'Lokale Empfehlungen' },
  { id: 4, title: 'Die Zahlung im Überblick' },
]

const contactActions = [
  { id: 'phone', label: 'Anrufen', icon: Phone },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
]

function ActionButton({
  label,
  icon: Icon,
}: {
  label: string
  icon: React.ElementType
}) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-3 transition-transform hover:scale-105"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-white/20 to-white/5 shadow-lg backdrop-blur-sm">
        <Icon className="h-7 w-7 text-white drop-shadow-md" />
      </div>
      <span className="font-['Josefin_Sans',sans-serif] text-sm font-medium text-white drop-shadow-sm">
        {label}
      </span>
    </button>
  )
}

function VideoPlaceholder({ title }: { title: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-2xl bg-[#94a395] shadow-xl transition-all hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Play
          className={`h-16 w-16 text-white/70 transition-all ${isHovered ? 'scale-125 text-white' : 'scale-100'}`}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="font-['Isabel',serif] text-lg text-primary-light">
          {title}
        </p>
      </div>
    </div>
  )
}

export function DashboardPreview() {
  return (
    <section className="relative min-h-screen bg-secondary px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Contact Actions */}
        <div className="mb-24 flex justify-end gap-6">
          {contactActions.map((action) => (
            <ActionButton
              key={action.id}
              label={action.label}
              icon={action.icon}
            />
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid gap-12 md:grid-cols-2">
          {videoSections.map((section) => (
            <div key={section.id}>
              <VideoPlaceholder title={section.title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

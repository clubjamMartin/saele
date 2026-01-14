'use client'

import { useState, useRef } from 'react'
import { Upload, Check } from 'lucide-react'
import { INTEREST_OPTIONS } from '@/lib/types/onboarding'
import Image from 'next/image'

interface ProfileSetupProps {
  fullName: string
  avatarUrl?: string
  interests: string[]
  onFullNameChange: (name: string) => void
  onAvatarChange: (url: string) => void
  onInterestsChange: (interests: string[]) => void
}

export function ProfileSetup({
  fullName,
  avatarUrl,
  interests,
  onFullNameChange,
  onAvatarChange,
  onInterestsChange,
}: ProfileSetupProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl)
  const [showMore, setShowMore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayedInterests = showMore
    ? INTEREST_OPTIONS
    : INTEREST_OPTIONS.slice(0, 11)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onAvatarChange(url)
    }
  }

  function toggleInterest(interestId: string) {
    if (interests.includes(interestId)) {
      onInterestsChange(interests.filter((id) => id !== interestId))
    } else {
      onInterestsChange([...interests, interestId])
    }
  }

  return (
    <section className="relative min-h-screen bg-secondary px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Profile Photo */}
        <div className="mb-16 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-2xl transition-all hover:border-white/40"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Upload className="h-12 w-12 text-white/50 transition-transform group-hover:scale-110" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
              <Upload className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <h2 className="font-['Isabel',serif] mb-12 text-center text-5xl font-bold text-primary-light">
            {fullName || 'Dein Name'}
          </h2>
        </div>

        {/* Interests Section */}
        <div>
          <h3 className="font-['Josefin_Sans',sans-serif] mb-8 text-center text-lg font-medium text-white">
            Meine Interessen
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayedInterests.map((interest) => {
              const isSelected = interests.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`group relative flex items-center gap-3 rounded-2xl px-6 py-4 font-['Josefin_Sans',sans-serif] text-lg font-medium text-white shadow-lg transition-all hover:scale-105 ${
                    isSelected ? 'bg-primary-light' : 'bg-primary-light/60'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-white/50 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="h-6 w-6 text-primary" />}
                  </div>
                  <span className="text-left">{interest.label}</span>
                </button>
              )
            })}
          </div>

          {!showMore && INTEREST_OPTIONS.length > 11 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowMore(true)}
                className="font-['Josefin_Sans',sans-serif] text-lg text-white underline transition-colors hover:text-primary-light"
              >
                mehr
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

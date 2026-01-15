'use client'

import { useState, useRef } from 'react'
import { User, Square, CheckSquare, Plus, Pencil } from 'lucide-react'
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
  const [isEditingName, setIsEditingName] = useState(false)
  const [customInterest, setCustomInterest] = useState('')
  const [customInterests, setCustomInterests] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const allInterestOptions = [
    ...INTEREST_OPTIONS,
    ...customInterests.map(ci => ({ id: ci.toLowerCase().replace(/\s+/g, '-'), label: ci }))
  ]

  const displayedInterests = showMore
    ? allInterestOptions
    : allInterestOptions.slice(0, 12)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      
      // Upload to Supabase
      try {
        const formData = new FormData()
        formData.append('avatar', file)
        
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          body: formData,
        })
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Avatar upload failed: Non-JSON response')
          alert('Avatar upload fehlgeschlagen. Bitte versuche es erneut.')
          return
        }
        
        const data = await response.json()
        
        if (data.success) {
          onAvatarChange(data.url)
        } else {
          console.error('Avatar upload failed:', data.error)
          alert('Avatar upload fehlgeschlagen. Bitte versuche es erneut.')
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Avatar upload fehlgeschlagen. Bitte versuche es erneut.')
      }
    }
  }

  function toggleInterest(interestId: string) {
    if (interests.includes(interestId)) {
      onInterestsChange(interests.filter((id) => id !== interestId))
    } else {
      onInterestsChange([...interests, interestId])
    }
  }

  function handleNameEdit() {
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  function handleNameBlur() {
    setIsEditingName(false)
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setIsEditingName(false)
    }
  }

  function handleAddCustomInterest() {
    if (customInterest.trim() && !customInterests.includes(customInterest.trim())) {
      const newCustomInterests = [...customInterests, customInterest.trim()]
      setCustomInterests(newCustomInterests)
      
      // Add to selected interests
      const interestId = customInterest.trim().toLowerCase().replace(/\s+/g, '-')
      onInterestsChange([...interests, interestId])
      
      setCustomInterest('')
    }
  }

  function handleCustomInterestKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomInterest()
    }
  }

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-secondary text-white px-8 py-16">
      {/* Avatar Upload - First (as in Figma) */}
      <div 
        className="relative w-[351px] h-[351px] rounded-full bg-white flex items-center justify-center mb-[53px] cursor-pointer overflow-hidden shadow-lg group"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <Image src={previewUrl} alt="Avatar" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <User size={60} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <>
            <User size={120} className="text-secondary group-hover:text-secondary/70 transition-colors" />
            <div className="absolute bottom-8 text-secondary text-sm font-medium">
              Foto hochladen
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* User Name - Editable - Second (as in Figma) */}
      {isEditingName ? (
        <input
          ref={nameInputRef}
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          className="font-['Isabel',sans-serif] font-bold text-[48px] leading-[56px] text-primary-light text-center mb-[54px] bg-transparent border-b-2 border-primary-light outline-none max-w-[600px] px-4"
          suppressHydrationWarning
        />
      ) : (
        <div 
          className="flex items-center gap-4 mb-[54px] cursor-pointer group"
          onClick={handleNameEdit}
          title="Klicken zum Bearbeiten"
        >
          <h2 
            className="font-['Isabel',sans-serif] font-bold text-[48px] leading-[56px] text-primary-light text-center group-hover:opacity-80 transition-opacity"
            suppressHydrationWarning
          >
            {fullName || 'Dein Name'}
          </h2>
          <Pencil 
            size={32} 
            className="text-primary-light opacity-60 group-hover:opacity-100 transition-opacity" 
            strokeWidth={2.5}
          />
        </div>
      )}
      
      {/* Subtitle - Third (as in Figma) */}
      <p className="font-['Josefin_Sans',sans-serif] font-medium text-[18px] leading-[26px] text-white text-center mb-[89px]">
        Meine Interessen
      </p>

      {/* Interests Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] max-w-[1216px] w-full mb-6">
        {displayedInterests.map((interest) => {
          const isSelected = interests.includes(interest.id)
          return (
            <button
              key={interest.id}
              className="relative h-[75px] rounded-[20px] flex items-center gap-4 px-6 transition-all hover:scale-105 bg-primary-light"
              onClick={() => toggleInterest(interest.id)}
            >
              {/* Checkbox Icon */}
              <div className="w-6 h-6 flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-full h-full text-white" strokeWidth={2} />
                ) : (
                  <Square className="w-full h-full text-white" strokeWidth={2} />
                )}
              </div>
              
              {/* Interest Name */}
              <span className="font-['Josefin_Sans',sans-serif] font-medium text-[18px] leading-[26px] text-white flex-1 text-left">
                {interest.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add Custom Interest */}
      <div className="flex gap-3 items-center mb-6 max-w-[600px] w-full">
        <input
          type="text"
          value={customInterest}
          onChange={(e) => setCustomInterest(e.target.value)}
          onKeyDown={handleCustomInterestKeyDown}
          placeholder="Eigene Interessen hinzufügen..."
          className="flex-1 h-[50px] px-4 rounded-[20px] bg-white/10 border-2 border-primary-light text-white placeholder:text-white/50 font-['Josefin_Sans',sans-serif] text-[16px] outline-none focus:bg-white/20 transition-colors"
          suppressHydrationWarning
        />
        <button
          onClick={handleAddCustomInterest}
          className="h-[50px] w-[50px] rounded-full bg-primary-light flex items-center justify-center hover:scale-110 transition-transform"
          title="Interesse hinzufügen"
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2} />
        </button>
      </div>

      {/* More Link */}
      {!showMore && allInterestOptions.length > 12 && (
        <button
          className="font-['Josefin_Sans',sans-serif] font-light text-[24px] leading-[20px] text-white underline decoration-solid hover:text-primary-light transition-colors"
          onClick={() => setShowMore(true)}
        >
          mehr
        </button>
      )}
    </section>
  )
}

'use client'

interface CompletionProps {
  onComplete: () => void
  isLoading?: boolean
}

export function Completion({ onComplete, isLoading }: CompletionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-secondary px-8 py-16 text-center">
      {/* Title */}
      <h1 className="font-['Blush_Free',cursive] text-[64px] leading-[50px] text-white mb-20 max-w-[615px]">
        Lass deine Reise beginnen!
      </h1>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onComplete}
        disabled={isLoading}
        className="h-[75px] w-[294px] rounded-[20px] bg-primary-light font-['Josefin_Sans',sans-serif] font-medium text-[18px] leading-[26px] text-white shadow-lg transition-all hover:scale-105 hover:shadow-primary-light/50 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLoading ? 'Wird gespeichert...' : 'ZUM DASHBOARD'}
      </button>
    </section>
  )
}

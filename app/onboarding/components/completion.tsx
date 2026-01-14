'use client'

interface CompletionProps {
  onComplete: () => void
  isLoading?: boolean
}

export function Completion({ onComplete, isLoading }: CompletionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-secondary px-6 text-center">
      <h1 className="font-['Blush_Free',cursive] mb-24 text-[clamp(48px,6vw,64px)] leading-tight text-white">
        Lass deine Reise beginnen!
      </h1>

      <button
        type="button"
        onClick={onComplete}
        disabled={isLoading}
        className="rounded-2xl bg-primary-light px-16 py-6 font-['Josefin_Sans',sans-serif] text-lg font-medium text-white shadow-2xl transition-all hover:scale-105 hover:shadow-primary-light/50 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLoading ? 'Wird gespeichert...' : 'ZUM DASHBOARD'}
      </button>
    </section>
  )
}

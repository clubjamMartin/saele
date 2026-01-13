import { User } from '@/components/ui/icons';

interface WelcomeSectionProps {
  userName: string | null;
  userEmail: string;
}

export function WelcomeSection({ userName, userEmail }: WelcomeSectionProps) {
  // Extract first name from full name or use email
  const firstName = userName?.split(' ')[0] || userEmail.split('@')[0];

  return (
    <section className="flex flex-col gap-4 lg:gap-6" aria-labelledby="welcome-heading">
      {/* Profile Avatar - positioned differently on mobile vs desktop */}
      <div className="flex items-center justify-between lg:justify-end">
        <div className="lg:hidden flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[--color-saele-primary-light] flex items-center justify-center">
            <User className="w-8 h-8 text-[--color-saele-primary]" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">{firstName}</span>
          </div>
        </div>
        
        {/* Desktop/Tablet Avatar */}
        <div className="hidden lg:flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[--color-saele-primary-light] flex items-center justify-center">
            <User className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <span className="text-white font-bold text-sm lg:text-base">{firstName}</span>
        </div>
      </div>

      {/* Welcome Heading */}
      <div className="flex flex-col gap-2">
        <h1
          id="welcome-heading"
          className="font-display font-normal text-white"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(2.5rem, 5vw, 6.875rem)', // 40px - 110px
            lineHeight: '1.2',
            fontWeight: 300,
          }}
        >
          Willkommen {firstName}!
        </h1>
        <p
          className="text-white font-medium"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)', // 17px - 20px
            lineHeight: '1.5',
            fontWeight: 500,
          }}
        >
          Hier hast du alles auf einen Blick!
        </p>
      </div>
    </section>
  );
}

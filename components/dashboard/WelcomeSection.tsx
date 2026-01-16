interface WelcomeSectionProps {
  userName: string | null;
  userEmail: string;
}

export function WelcomeSection({ userName, userEmail }: WelcomeSectionProps) {
  // Extract first name from full name or use email
  const firstName = userName?.split(' ')[0] || userEmail.split('@')[0];

  return (
    <section className="flex flex-col" aria-labelledby="welcome-heading">
      {/* Mobile/Tablet - Single line */}
      <div className="lg:hidden">
        <h1
          id="welcome-heading"
          className="font-display font-normal text-white"
          style={{
            fontFamily: 'var(--font-josefin-sans)',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            lineHeight: '1.2',
            fontWeight: 300,
          }}
        >
          Willkommen {firstName}!
        </h1>
      </div>

      {/* Desktop - Two lines with Blush Free font and right-alignment */}
      <div className="hidden lg:block">
        <h1
          style={{
            fontFamily: 'var(--font-blush-free)',
            fontSize: 'clamp(3rem, 5.7vw, 110px)',
            lineHeight: '1.3',
            color: 'white',
            fontWeight: 400,
            textAlign: 'right',
          }}
        >
          Willkommen
        </h1>
        <h1
          style={{
            fontFamily: 'var(--font-blush-free)',
            fontSize: 'clamp(3rem, 5.7vw, 110px)',
            lineHeight: '1.3',
            color: 'white',
            fontWeight: 400,
            textAlign: 'right',
            marginTop: '0.5rem',
          }}
        >
          {firstName}!
        </h1>
      </div>
    </section>
  );
}

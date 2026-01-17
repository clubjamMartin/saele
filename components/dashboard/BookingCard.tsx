import { DashboardBooking } from '@/types/dashboard';
import { Maximize2 } from '@/components/ui/icons';

interface BookingCardProps {
  bookings: DashboardBooking[];
}

export function BookingCard({ bookings }: BookingCardProps) {
  const nextBooking = bookings.find((b) => b.status === 'confirmed');

  if (!nextBooking) {
    return (
      <div
        style={{
          background: '#DD8A90',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '100%',
          minHeight: '220px',
          position: 'relative',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-isabel)',
            fontSize: '20px',
            fontWeight: 600,
            color: '#861309',
            textAlign: 'center',
          }}
        >
          Keine Buchungen
        </h3>
      </div>
    );
  }

  const checkInDate = new Date(nextBooking.checkIn);
  const checkOutDate = new Date(nextBooking.checkOut);
  const now = new Date();
  
  // Calculate progress
  const totalDuration = checkOutDate.getTime() - checkInDate.getTime();
  const elapsed = now.getTime() - checkInDate.getTime();
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      style={{
        background: '#DD8A90',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '100%',
        minHeight: '140px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dark red header with room name */}
      <div
        style={{
          background: '#861309',
          padding: '0.75rem 1rem',
          position: 'relative',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-isabel)',
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFBF7',
            textAlign: 'center',
            lineHeight: '1.3',
            margin: 0,
          }}
        >
          {nextBooking.roomName} freut sich auf euch!
        </h3>
      </div>

      {/* Expand button */}
      <button
        aria-label="Buchungsdetails erweitern"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '24px',
          height: '24px',
          background: '#FFFBF7',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <Maximize2 className="w-4 h-4 text-[#861309]" />
      </button>

      {/* Content area */}
      <div
        style={{
          padding: '0.875rem 1rem',
          display: 'flex',
          gap: '0.625rem',
        }}
      >

      {/* Vertical Progress Bar */}
      <div
        style={{
          width: '5px',
          minHeight: '70px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${progress}%`,
            background: '#861309',
            borderRadius: '3px',
            transition: 'height 0.3s ease',
          }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reisefortschritt"
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Dates section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Anreise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-josefin-sans)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#861309',
              }}
            >
              Anreise
            </span>
            <span
              style={{
                fontFamily: 'var(--font-josefin-sans)',
                fontSize: '16px',
                fontWeight: 300,
                color: '#861309',
              }}
            >
              {formatDate(checkInDate)}
            </span>
          </div>

          {/* Abreise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-josefin-sans)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#861309',
              }}
            >
              Abreise
            </span>
            <span
              style={{
                fontFamily: 'var(--font-josefin-sans)',
                fontSize: '16px',
                fontWeight: 300,
                color: '#861309',
              }}
            >
              {formatDate(checkOutDate)}
            </span>
          </div>
        </div>

        {/* Description Text */}
        <p
          style={{
            fontFamily: 'var(--font-josefin-sans)',
            fontSize: '13px',
            fontWeight: 300,
            lineHeight: '1.4',
            color: '#861309',
            marginTop: '0.25rem',
          }}
        >
          Wir freuen uns euch in {daysUntilCheckIn} Tagen begrüßen zu dürfen.
          Bitte beachtet, dass die Wohnungen ab 14 Uhr fertig sind.
          Wir freuen uns auf euch!
        </p>
      </div>
      </div>
    </div>
  );
}

import { Card } from '@/components/ui/card';
import { DashboardBooking } from '@/types/dashboard';
import { Maximize2 } from '@/components/ui/icons';

interface BookingCardProps {
  bookings: DashboardBooking[];
}

export function BookingCard({ bookings }: BookingCardProps) {
  const nextBooking = bookings.find((b) => b.status === 'confirmed');

  if (!nextBooking) {
    return (
      <Card variant="primary" rounded="lg" className="p-6">
        <h3 className="text-white text-center font-medium">Keine Buchungen</h3>
      </Card>
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

  return (
    <Card variant="light" rounded="lg" className="relative overflow-hidden">
      {/* Expand button */}
      <button
        className="absolute top-4 right-4 w-6 h-6 bg-[--color-saele-primary] rounded-[5px] flex items-center justify-center hover:opacity-80 transition-opacity z-10"
        aria-label="Buchungsdetails erweitern"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      <div className="p-6 lg:p-8">
        {/* Title */}
        <h3
          className="text-[--color-saele-primary] font-normal mb-6"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1.75rem, 3vw, 2.125rem)', // 28px - 34px
            lineHeight: '1.3',
            fontWeight: 400,
          }}
        >
          Reise
        </h3>

        {/* Dates Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              {/* Anreise */}
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[--color-saele-primary] font-semibold min-w-[80px]"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
                    fontWeight: 600,
                  }}
                >
                  Anreise
                </span>
                <span
                  className="text-[--color-saele-primary] font-light hidden md:inline"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
                    fontWeight: 300,
                  }}
                >
                  {formatDate(checkInDate)}
                </span>
                <span
                  className="text-[--color-saele-primary] font-light md:hidden"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: '1rem',
                    fontWeight: 300,
                  }}
                >
                  {formatDateShort(checkInDate)}
                </span>
              </div>

              {/* Vertical separator line */}
              <div className="w-[1px] h-12 bg-[--color-saele-primary]/30 ml-10" />

              {/* Abreise */}
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[--color-saele-primary] font-semibold min-w-[80px]"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
                    fontWeight: 600,
                  }}
                >
                  Abreise
                </span>
                <span
                  className="text-[--color-saele-primary] font-light hidden md:inline"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
                    fontWeight: 300,
                  }}
                >
                  {formatDate(checkOutDate)}
                </span>
                <span
                  className="text-[--color-saele-primary] font-light md:hidden"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: '1rem',
                    fontWeight: 300,
                  }}
                >
                  {formatDateShort(checkOutDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="hidden lg:flex flex-col items-center gap-2">
            <div className="w-2 h-32 bg-white/30 rounded-full overflow-hidden">
              <div
                className="w-full bg-[--color-saele-primary] rounded-full transition-all duration-300"
                style={{ height: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Reisefortschritt"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p
          className="text-[--color-saele-primary] font-light"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(0.875rem, 1vw, 1rem)',
            lineHeight: '1.5',
            fontWeight: 300,
          }}
        >
          Wir freuen uns euch in {Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} Tagen begrüßen zu dürfen.
          Bitte beachtet, dass die Wohnungen ab 14 Uhr fertig sind. Wir freuen uns auf euch!
        </p>
      </div>
    </Card>
  );
}

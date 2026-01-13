'use client';

import { useEffect, useState } from 'react';
import { DashboardCountdown } from '@/types/dashboard';
import { Card } from '@/components/ui/card';

interface CountdownTimerProps {
  countdown: DashboardCountdown | null;
}

export function CountdownTimer({ countdown }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: countdown?.days || 0,
    hours: countdown?.hours || 0,
    minutes: countdown?.minutes || 0,
  });

  useEffect(() => {
    if (!countdown) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const checkIn = new Date(countdown.checkInDate).getTime();
      const distance = checkIn - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!countdown) {
    return (
      <Card variant="light" rounded="lg" className="p-6">
        <p className="text-[--color-saele-primary] text-center">
          Keine anstehenden Buchungen
        </p>
      </Card>
    );
  }

  return (
    <Card variant="light" rounded="lg" className="p-6 lg:p-8">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <h2
          className="text-[--color-saele-primary] font-normal text-center"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', // 28px - 36px
            lineHeight: '1.3',
            fontWeight: 400,
          }}
        >
          Nicht mehr lang!
        </h2>

        {/* Message */}
        <p
          className="text-[--color-saele-primary] text-center font-light"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1rem, 1.2vw, 1.25rem)', // 16px - 20px
            lineHeight: '1.5',
            fontWeight: 300,
          }}
        >
          Hedwig & Christina freuen sich auf euch!
          <br />
          Die Wohnungen stehen ab 14 Uhr bereit.
        </p>

        {/* Countdown Display */}
        <div className="bg-[--color-saele-primary] rounded-[15px] p-6 lg:p-8">
          <div
            className="text-white text-center font-medium tabular-nums"
            style={{
              fontFamily: 'var(--font-josefin)',
              fontSize: 'clamp(1.375rem, 2.5vw, 2.125rem)', // 22px - 34px
              lineHeight: '1.4',
              fontWeight: 400,
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {timeLeft.days.toString().padStart(2, '0')} :{' '}
            {timeLeft.hours.toString().padStart(2, '0')} :{' '}
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-white text-center text-sm mt-2 opacity-90">
            Tage : Stunden : Minuten
          </div>
        </div>
      </div>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { DashboardCountdown } from '@/types/dashboard';

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
      <div
        className="rounded-[15px]"
        style={{
          width: '100%',
          maxWidth: '300px',
          minHeight: '135px',
          height: 'auto',
          background: '#DD8A90',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            background: '#861309',
            flex: '0 0 100px',
            borderRadius: '15px 15px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-isabel)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 3.3vw, 64px)',
              color: '#FFFBF7',
              textAlign: 'center',
              lineHeight: '1',
            }}
          >
            Saele
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[15px]"
      style={{
        width: '100%',
        maxWidth: '300px',
        minHeight: '135px',
        height: 'auto',
        background: '#DD8A90',
        position: 'relative',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Red overlay with Saele brand */}
      <div
        style={{
          background: '#861309',
          flex: '0 0 100px',
          borderRadius: '15px 15px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-isabel)',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 3.3vw, 64px)',
            color: '#FFFBF7',
            textAlign: 'center',
            lineHeight: '1',
          }}
        >
          Saele
        </h2>
      </div>

      {/* Countdown digits - wraps naturally */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          minHeight: '35px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-josefin-sans)',
            fontWeight: 500,
            fontSize: 'clamp(1rem, 1.3vw, 25px)',
            color: '#861309',
            textAlign: 'center',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {timeLeft.days.toString().padStart(2, '0')} : {timeLeft.hours.toString().padStart(2, '0')} : {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

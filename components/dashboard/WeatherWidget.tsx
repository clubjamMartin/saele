'use client';

import { DashboardWeather } from '@/types/dashboard';
import { Plus, Maximize2 } from '@/components/ui/icons';

interface WeatherWidgetProps {
  weather: DashboardWeather | null;
}

// Sun icon component
function SunIcon({ size = 48, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// Cloud with rain icon
function CloudRainIcon({ size = 32, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
      <line x1="8" y1="19" x2="8" y2="21" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="16" y1="19" x2="16" y2="21" />
    </svg>
  );
}

function getWeatherIcon(weatherCode: number, size: number = 32) {
  // WMO Weather interpretation codes
  // 0-3: Clear to partly cloudy
  // 51-67: Rain
  // 71-77: Snow
  
  if (weatherCode <= 3) {
    return <SunIcon size={size} color="white" />;
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    return <CloudRainIcon size={size} color="white" />;
  } else {
    return <CloudRainIcon size={size} color="white" />;
  }
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) {
    return (
      <div
        style={{
          background: '#94A395',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '250px',
          minHeight: '500px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ color: 'white', textAlign: 'center', fontFamily: 'var(--font-josefin-sans)' }}>
          Wetterdaten nicht verfügbar
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  // Get first 2 forecast days for display (per Figma)
  const displayForecast = weather.forecast.slice(0, 2);

  return (
    <div
      style={{
        background: '#94A395',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '100%',
        minHeight: '380px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Main expand button */}
      <button
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '24px',
          height: '24px',
          background: '#4F5F3F',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="Wetter erweitern"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      <div style={{ padding: '1.5rem 1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Current Weather - Large Sun Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <SunIcon size={60} color="white" />
          </div>
          <p
            style={{
              fontFamily: 'var(--font-isabel)',
              fontSize: '24px',
              fontWeight: 400,
              color: 'white',
              lineHeight: '1',
            }}
          >
            {Math.round(weather.current.temperature)} °C
          </p>
        </div>

        {/* Forecast Days */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {displayForecast.map((day) => (
            <div
              key={day.date}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {getWeatherIcon(day.weatherCode, 32)}
                <span
                  style={{
                    fontFamily: 'var(--font-josefin-sans)',
                    fontSize: '16px',
                    fontWeight: 300,
                    color: 'white',
                  }}
                >
                  {formatDate(day.date)}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-josefin-sans)',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: 'white',
                }}
              >
                {Math.round(day.temperatureMax)}°
              </span>
            </div>
          ))}
        </div>

        {/* Plus Button */}
        <button
          style={{
            margin: '0 auto',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="Weitere Tage anzeigen"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>

        {/* Location (hidden but accessible) */}
        <p
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Standort: {weather.location}
        </p>
      </div>
    </div>
  );
}

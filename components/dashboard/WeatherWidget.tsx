import { Card } from '@/components/ui/card';
import { DashboardWeather } from '@/types/dashboard';
import { Sun, CloudRain, CloudSnow, Cloud, Plus, Maximize2 } from '@/components/ui/icons';

interface WeatherWidgetProps {
  weather: DashboardWeather | null;
}

function getWeatherIcon(weatherCode: number, size: number = 24) {
  // WMO Weather interpretation codes
  // 0-3: Clear to partly cloudy
  // 45-48: Fog
  // 51-67: Rain
  // 71-77: Snow
  // 80-99: Showers/Thunderstorms
  
  if (weatherCode <= 3) {
    return <Sun className={`w-${size/4} h-${size/4}`} />;
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    return <CloudRain className={`w-${size/4} h-${size/4}`} />;
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return <CloudSnow className={`w-${size/4} h-${size/4}`} />;
  } else {
    return <Cloud className={`w-${size/4} h-${size/4}`} />;
  }
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) {
    return (
      <Card variant="primary" rounded="lg" className="p-6">
        <p className="text-white text-center">Wetterdaten nicht verfügbar</p>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  // Get first 4 forecast days for display
  const displayForecast = weather.forecast.slice(0, 4);

  return (
    <Card variant="primary" rounded="lg" className="relative overflow-hidden h-full">
      {/* Expand button */}
      <button
        className="absolute top-4 right-4 w-6 h-6 bg-[--color-saele-primary-light] rounded-[5px] flex items-center justify-center hover:opacity-80 transition-opacity z-10"
        aria-label="Wetter erweitern"
      >
        <Maximize2 className="w-4 h-4 text-[--color-saele-primary]" />
      </button>

      <div className="p-6 lg:p-8 h-full flex flex-col">
        {/* Title */}
        <h3
          className="text-white font-bold mb-6"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1.75rem, 3vw, 2.125rem)', // 28px - 34px
            lineHeight: '1.3',
            fontWeight: 700,
          }}
        >
          Wetter
        </h3>

        {/* Current Weather */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="text-white">
              {getWeatherIcon(weather.current.weatherCode, 48)}
            </div>
            <p
              className="text-white font-normal"
              style={{
                fontFamily: 'var(--font-josefin)',
                fontSize: 'clamp(1.875rem, 2.5vw, 2.5rem)', // 30px - 40px
                lineHeight: '1',
                fontWeight: 400,
              }}
            >
              {Math.round(weather.current.temperature)} °C
            </p>
            <p className="text-white/80 text-sm">
              {weather.current.weatherDescription}
            </p>
          </div>
        </div>

        {/* Forecast Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {displayForecast.map((day, index) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-white w-10 h-10 flex items-center justify-center">
                {getWeatherIcon(day.weatherCode, 40)}
              </div>
              <p
                className="text-white font-light text-sm"
                style={{
                  fontFamily: 'var(--font-josefin)',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                }}
              >
                {formatDate(day.date)}
              </p>
              <p className="text-white/90 text-xs">
                {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
              </p>
            </div>
          ))}
        </div>

        {/* More Days Button */}
        <button
          className="mx-auto w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Weitere Tage anzeigen"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>

        {/* Location (hidden but accessible) */}
        <p className="sr-only">
          Standort: {weather.location}
        </p>
      </div>
    </Card>
  );
}

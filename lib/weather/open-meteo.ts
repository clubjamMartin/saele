/**
 * Open-Meteo Weather API Client
 * Free weather API - no API key required!
 * 
 * Location: Bezau, Vorarlberg, Austria
 * Coordinates: 47.38534000, 9.90231000
 */

export interface CurrentWeather {
  temperature: number; // °C
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number; // km/h
  windDirection: number; // degrees
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationSum: number; // mm
  precipitationProbability: number; // %
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast: DailyForecast[];
  lastUpdated: string; // ISO timestamp
}

// Weather code mappings (WMO codes)
// https://open-meteo.com/en/docs#weathervariables
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || 'Unknown';
}

// In-memory cache
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

let weatherCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes (recommended by Open-Meteo)

/**
 * Fetch weather data for Bezau, Austria
 * Results are cached for 15 minutes
 */
export async function getWeatherData(): Promise<WeatherData | null> {
  try {
    // Check cache
    const now = Date.now();
    if (weatherCache && (now - weatherCache.timestamp) < CACHE_TTL_MS) {
      return weatherCache.data;
    }

    // Bezau coordinates
    const latitude = 47.38534000;
    const longitude = 9.90231000;

    // Build API URL
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max',
      timezone: 'Europe/Vienna',
      forecast_days: '7',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    // Fetch data
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Parse current weather
    const current: CurrentWeather = {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      weatherDescription: getWeatherDescription(data.current.weather_code),
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
    };

    // Parse daily forecast
    const forecast: DailyForecast[] = data.daily.time.map((date: string, index: number) => ({
      date,
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index],
      weatherDescription: getWeatherDescription(data.daily.weather_code[index]),
      precipitationSum: data.daily.precipitation_sum[index],
      precipitationProbability: data.daily.precipitation_probability_max[index],
    }));

    // Build response
    const weatherData: WeatherData = {
      location: 'Bezau, Vorarlberg, Austria',
      latitude,
      longitude,
      current,
      forecast,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    weatherCache = {
      data: weatherData,
      timestamp: now,
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

/**
 * Clear the weather cache (useful for testing)
 */
export function clearWeatherCache(): void {
  weatherCache = null;
}

/**
 * TypeScript types for Dashboard API
 * Part of SAE-13: Dashboard Backend API
 */

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: 'guest' | 'admin';
}

export interface DashboardBooking {
  id: string;
  externalBookingId: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'cancelled';
  guestCount: number;
  roomName: string;
}

export interface DashboardHostContact {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

export interface DashboardCountdown {
  checkInDate: string; // ISO timestamp
  checkOutDate: string; // ISO timestamp
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  guestCount: number;
  roomName: string;
}

export interface DashboardCurrentWeather {
  temperature: number; // °C
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number; // km/h
  windDirection: number; // degrees
}

export interface DashboardForecast {
  date: string; // YYYY-MM-DD
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationSum: number; // mm
  precipitationProbability: number; // %
}

export interface DashboardWeather {
  location: string;
  latitude: number;
  longitude: number;
  current: DashboardCurrentWeather;
  forecast: DashboardForecast[];
  lastUpdated: string; // ISO timestamp
}

export interface DashboardInstagram {
  username: string;
  embedUrl: string;
  profileUrl: string;
}

export interface DashboardMeta {
  fetchedAt: string; // ISO timestamp
  responseTime: number; // milliseconds
}

export interface DashboardResponse {
  user: DashboardUser;
  bookings: DashboardBooking[];
  hostContacts: DashboardHostContact[];
  countdown: DashboardCountdown | null;
  weather: DashboardWeather | null;
  instagram: DashboardInstagram;
  meta: DashboardMeta;
}

/**
 * Mock Dashboard API Route
 * Static test data for frontend development
 * Part of SAE-13: Dashboard Backend API
 */

import { NextResponse } from 'next/server';
import type { DashboardResponse } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockResponse: DashboardResponse = {
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'guest@saele.com',
      name: 'Maria Schmidt',
      fullName: 'Maria Schmidt',
      phone: '+43 660 1234567',
      role: 'guest',
    },
    bookings: [
      {
        id: '00000000-0000-0000-0000-000000000101',
        externalBookingId: 'BOOK-2026-001',
        checkIn: '2026-02-15T14:00:00Z',
        checkOut: '2026-02-22T10:00:00Z',
        status: 'confirmed',
        guestCount: 4,
        roomName: 'Christine',
      },
      {
        id: '00000000-0000-0000-0000-000000000102',
        externalBookingId: 'BOOK-2025-123',
        checkIn: '2025-12-20T14:00:00Z',
        checkOut: '2025-12-27T10:00:00Z',
        status: 'confirmed',
        guestCount: 2,
        roomName: 'Adele',
      },
    ],
    hostContacts: [
      {
        id: '00000000-0000-0000-0000-000000000201',
        displayName: 'Appartements Christine',
        email: 'info@appartements-christine.at',
        phone: '+43 5514 2345',
        whatsapp: '+43 660 1234567',
      },
      {
        id: '00000000-0000-0000-0000-000000000202',
        displayName: 'Property Management',
        email: 'verwaltung@saele.com',
        phone: '+43 5514 5678',
        whatsapp: null,
      },
    ],
    countdown: {
      checkInDate: '2026-02-15T14:00:00Z',
      checkOutDate: '2026-02-22T10:00:00Z',
      months: 1,
      days: 2,
      hours: 14,
      minutes: 32,
      seconds: 45,
      totalDays: 33,
      guestCount: 4,
      roomName: 'Christine',
    },
    weather: {
      location: 'Bezau, Vorarlberg, Austria',
      latitude: 47.38534,
      longitude: 9.90231,
      current: {
        temperature: -2.5,
        weatherCode: 71,
        weatherDescription: 'Slight snow fall',
        windSpeed: 12.3,
        windDirection: 245,
      },
      forecast: [
        {
          date: '2026-01-13',
          temperatureMax: 1.2,
          temperatureMin: -4.5,
          weatherCode: 71,
          weatherDescription: 'Slight snow fall',
          precipitationSum: 3.2,
          precipitationProbability: 80,
        },
        {
          date: '2026-01-14',
          temperatureMax: 2.8,
          temperatureMin: -3.1,
          weatherCode: 3,
          weatherDescription: 'Overcast',
          precipitationSum: 0.5,
          precipitationProbability: 30,
        },
        {
          date: '2026-01-15',
          temperatureMax: 4.5,
          temperatureMin: -1.2,
          weatherCode: 2,
          weatherDescription: 'Partly cloudy',
          precipitationSum: 0,
          precipitationProbability: 10,
        },
        {
          date: '2026-01-16',
          temperatureMax: 5.2,
          temperatureMin: 0.3,
          weatherCode: 1,
          weatherDescription: 'Mainly clear',
          precipitationSum: 0,
          precipitationProbability: 5,
        },
        {
          date: '2026-01-17',
          temperatureMax: 3.8,
          temperatureMin: -2.5,
          weatherCode: 61,
          weatherDescription: 'Slight rain',
          precipitationSum: 2.1,
          precipitationProbability: 65,
        },
        {
          date: '2026-01-18',
          temperatureMax: 1.5,
          temperatureMin: -3.8,
          weatherCode: 73,
          weatherDescription: 'Moderate snow fall',
          precipitationSum: 8.5,
          precipitationProbability: 90,
        },
        {
          date: '2026-01-19',
          temperatureMax: 0.2,
          temperatureMin: -5.2,
          weatherCode: 0,
          weatherDescription: 'Clear sky',
          precipitationSum: 0,
          precipitationProbability: 0,
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
    instagram: {
      username: 'appartementschristine',
      embedUrl: 'https://www.instagram.com/appartementschristine/embed/',
      profileUrl: 'https://www.instagram.com/appartementschristine/',
      latestPosts: [],
    },
    services: [
      {
        id: '1',
        name: 'Kühlschrank',
        description: 'Kühlschrank mit frischen Lebensmitteln und Getränken bestücken lassen',
        status: 'available',
      },
      {
        id: '2',
        name: 'Guide',
        description: 'Persönlicher Guide für Wanderungen und Ausflüge',
        status: 'available',
      },
      {
        id: '3',
        name: 'Kultur & Konzert',
        description: 'Tickets für Kulturveranstaltungen und Konzerte',
        status: 'active',
      },
    ],
    meta: {
      fetchedAt: new Date().toISOString(),
      responseTime: 100,
    },
  };

  return NextResponse.json(mockResponse);
}

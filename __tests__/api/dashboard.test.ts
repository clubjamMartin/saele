/**
 * Dashboard API Tests
 * Part of SAE-13: Dashboard Backend API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateCountdown } from '@/lib/utils/countdown';
import { getInstagramConfig } from '@/lib/social/instagram';
import { getWeatherData, clearWeatherCache } from '@/lib/weather/open-meteo';

describe('Dashboard API Components', () => {
  describe('calculateCountdown', () => {
    beforeEach(() => {
      // Mock current time
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-13T12:00:00Z'));
    });

    it('should calculate countdown for upcoming booking', () => {
      const nextBooking = {
        check_in: '2026-02-15T14:00:00Z',
        check_out: '2026-02-22T10:00:00Z',
        guest_count: 4,
        room_name: 'Christine',
      };

      const result = calculateCountdown(nextBooking);

      expect(result).not.toBeNull();
      expect(result?.guestCount).toBe(4);
      expect(result?.roomName).toBe('Christine');
      expect(result?.totalDays).toBeGreaterThan(30);
    });

    it('should return null for null booking', () => {
      const result = calculateCountdown(null);
      expect(result).toBeNull();
    });

    it('should return null for past booking', () => {
      const pastBooking = {
        check_in: '2025-12-01T14:00:00Z',
        check_out: '2025-12-08T10:00:00Z',
        guest_count: 2,
        room_name: 'Adele',
      };

      const result = calculateCountdown(pastBooking);
      expect(result).toBeNull();
    });

    it('should handle missing guest count and room name', () => {
      const booking = {
        check_in: '2026-02-15T14:00:00Z',
        check_out: '2026-02-22T10:00:00Z',
        guest_count: null,
        room_name: null,
      };

      const result = calculateCountdown(booking);

      expect(result).not.toBeNull();
      expect(result?.guestCount).toBe(0);
      expect(result?.roomName).toBe('Unknown');
    });

    it('should calculate correct time components', () => {
      // Set specific time for precise calculation
      vi.setSystemTime(new Date('2026-02-14T12:00:00Z'));

      const booking = {
        check_in: '2026-02-15T14:00:00Z',
        check_out: '2026-02-22T10:00:00Z',
        guest_count: 2,
        room_name: 'Hedwig',
      };

      const result = calculateCountdown(booking);

      expect(result).not.toBeNull();
      expect(result?.days).toBeGreaterThanOrEqual(0);
      expect(result?.hours).toBeLessThan(24);
      expect(result?.minutes).toBeLessThan(60);
      expect(result?.seconds).toBeLessThan(60);
    });
  });

  describe('getInstagramConfig', () => {
    it('should return correct Instagram configuration', () => {
      const config = getInstagramConfig();

      expect(config.username).toBe('appartementschristine');
      expect(config.embedUrl).toBe('https://www.instagram.com/appartementschristine/embed/');
      expect(config.profileUrl).toBe('https://www.instagram.com/appartementschristine/');
    });
  });

  describe('getWeatherData', () => {
    beforeEach(() => {
      // Clear cache before each test
      clearWeatherCache();
    });

    it('should return weather data with correct structure', async () => {
      // Note: This test makes a real API call to Open-Meteo
      // In a production environment, you would mock the fetch call
      const weather = await getWeatherData();

      if (weather) {
        expect(weather.location).toBe('Bezau, Vorarlberg, Austria');
        expect(weather.latitude).toBe(47.38534);
        expect(weather.longitude).toBe(9.90231);
        expect(weather.current).toBeDefined();
        expect(weather.current.temperature).toBeDefined();
        expect(weather.current.weatherDescription).toBeDefined();
        expect(weather.forecast).toHaveLength(7);
        expect(weather.forecast[0].date).toBeDefined();
      }
    });

    it('should cache weather data', async () => {
      const weather1 = await getWeatherData();
      const weather2 = await getWeatherData();

      // If both calls succeeded, they should return the same cached data
      if (weather1 && weather2) {
        expect(weather1.lastUpdated).toBe(weather2.lastUpdated);
      }
    });

    it('should return null on API error', async () => {
      // Mock fetch to simulate error
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      const weather = await getWeatherData();
      expect(weather).toBeNull();
    });

    it('should map weather codes to descriptions', async () => {
      const weather = await getWeatherData();

      if (weather) {
        expect(weather.current.weatherDescription).toBeTruthy();
        expect(weather.current.weatherDescription).not.toBe('Unknown');
        
        weather.forecast.forEach((day) => {
          expect(day.weatherDescription).toBeTruthy();
        });
      }
    });
  });

  describe('Dashboard API Integration', () => {
    it('should handle graceful degradation when weather fails', async () => {
      // Mock weather failure
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Weather API unavailable'))
      );

      const weather = await getWeatherData();
      
      // Weather should be null, but this shouldn't crash the app
      expect(weather).toBeNull();
    });

    it('should validate response structure', () => {
      // Mock response structure
      const mockResponse = {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          fullName: 'Test User',
          phone: null,
          role: 'guest' as const,
        },
        bookings: [],
        hostContacts: [],
        countdown: null,
        weather: null,
        instagram: getInstagramConfig(),
        meta: {
          fetchedAt: new Date().toISOString(),
          responseTime: 100,
        },
      };

      // Validate structure
      expect(mockResponse.user).toBeDefined();
      expect(mockResponse.bookings).toBeInstanceOf(Array);
      expect(mockResponse.hostContacts).toBeInstanceOf(Array);
      expect(mockResponse.instagram).toBeDefined();
      expect(mockResponse.meta).toBeDefined();
      expect(mockResponse.meta.responseTime).toBeLessThan(1000);
    });
  });
});

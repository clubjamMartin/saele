/**
 * Dashboard API Route
 * Consolidated endpoint for all dashboard data
 * Part of SAE-13: Dashboard Backend API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeatherData } from '@/lib/weather/open-meteo';
import { calculateCountdown } from '@/lib/utils/countdown';
import { getInstagramConfig } from '@/lib/social/instagram';
import type { DashboardResponse } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all data in parallel using Promise.allSettled
    const [
      profileResult,
      bookingsResult,
      hostContactsResult,
      weatherResult,
    ] = await Promise.allSettled([
      // Fetch user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),

      // Fetch user's bookings (all, including for countdown calculation)
      supabase
        .from('bookings')
        .select('*')
        .eq('guest_user_id', user.id)
        .order('created_at', { ascending: false }),

      // Fetch active host contacts
      supabase
        .from('host_contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),

      // Fetch weather data
      getWeatherData(),
    ]);

    // Extract profile data
    const profile =
      profileResult.status === 'fulfilled' && profileResult.value.data
        ? profileResult.value.data
        : null;

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Extract bookings data
    const bookings =
      bookingsResult.status === 'fulfilled' && bookingsResult.value.data
        ? bookingsResult.value.data
        : [];

    // Extract host contacts data
    const hostContacts =
      hostContactsResult.status === 'fulfilled' && hostContactsResult.value.data
        ? hostContactsResult.value.data
        : [];

    // Extract weather data (can be null if API fails)
    const weather =
      weatherResult.status === 'fulfilled' ? weatherResult.value : null;

    // Calculate countdown for next booking
    const upcomingBookings = bookings
      .filter(
        (b) =>
          b.status === 'confirmed' &&
          b.check_in &&
          new Date(b.check_in) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.check_in!).getTime() - new Date(b.check_in!).getTime()
      );

    const nextBooking = upcomingBookings[0] || null;
    const countdown = nextBooking
      ? calculateCountdown({
          check_in: nextBooking.check_in!,
          check_out: nextBooking.check_out!,
          guest_count: nextBooking.guest_count,
          room_name: nextBooking.room_name,
        })
      : null;

    // Get Instagram config
    const instagram = getInstagramConfig();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log API request to event_logs
    try {
      await supabase.from('event_logs').insert({
        event_type: 'dashboard_api_request',
        user_id: user.id,
        level: 'info',
        message: 'Dashboard API request completed successfully',
        meta: {
          response_time_ms: responseTime,
          weather_available: weather !== null,
          countdown_available: countdown !== null,
          bookings_count: bookings.length,
          contacts_count: hostContacts.length,
        },
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to log dashboard request:', logError);
    }

    // Log performance warning if > 300ms
    if (responseTime > 300) {
      console.warn(`Dashboard API slow response: ${responseTime}ms`);
    }

    // Build response
    const response: DashboardResponse = {
      user: {
        id: user.id,
        email: user.email || '',
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role as 'guest' | 'admin',
      },
      bookings: bookings.map((b) => ({
        id: b.id,
        externalBookingId: b.external_booking_id,
        checkIn: b.check_in || '',
        checkOut: b.check_out || '',
        status: b.status as 'confirmed' | 'cancelled',
        guestCount: b.guest_count || 0,
        roomName: b.room_name || 'Unknown',
      })),
      hostContacts: hostContacts.map((c) => ({
        id: c.id,
        displayName: c.display_name,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
      })),
      countdown,
      weather,
      instagram,
      meta: {
        fetchedAt: new Date().toISOString(),
        responseTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard API error:', error);

    // Log error
    try {
      const supabase = await createClient();
      await supabase.from('event_logs').insert({
        event_type: 'dashboard_api_error',
        level: 'error',
        message: 'Dashboard API request failed',
        meta: {
          error: error instanceof Error ? error.message : 'Unknown error',
          response_time_ms: Date.now() - startTime,
        },
      });
    } catch (logError) {
      console.error('Failed to log dashboard error:', logError);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { redirect } from 'next/navigation';
import { requireAuth, getUserProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getWeatherData } from '@/lib/weather/open-meteo';
import { calculateCountdown } from '@/lib/utils/countdown';
import { getInstagramConfig } from '@/lib/social/instagram';
import type { DashboardResponse } from '@/types/dashboard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { CountdownTimer } from '@/components/dashboard/CountdownTimer';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { ServicesPanel } from '@/components/dashboard/ServicesPanel';
import { ActionButtons } from '@/components/dashboard/ActionButtons';
import styles from './dashboard.module.css';

async function getDashboardData(userId: string): Promise<DashboardResponse> {
  const startTime = Date.now();

  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Fetch all data in parallel using Promise.allSettled
    const [
      profileResult,
      bookingsResult,
      hostContactsResult,
      servicesResult,
      weatherResult,
    ] = await Promise.allSettled([
      // Fetch user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),

      // Fetch user's bookings (all, including for countdown calculation)
      supabase
        .from('bookings')
        .select('*')
        .eq('guest_user_id', userId)
        .order('created_at', { ascending: false }),

      // Fetch active host contacts
      supabase
        .from('host_contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),

      // Fetch active services
      supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),

      // Fetch weather data
      getWeatherData(),
    ]);

    // Extract profile data
    const profile =
      profileResult.status === 'fulfilled' && profileResult.value.data
        ? profileResult.value.data
        : null;

    if (!profile) {
      throw new Error('Profile not found');
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

    // Extract services data
    const services =
      servicesResult.status === 'fulfilled' && servicesResult.value.data
        ? servicesResult.value.data
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

    // Log dashboard data fetch to event_logs
    try {
      await supabase.from('event_logs').insert({
        event_type: 'dashboard_data_fetch',
        user_id: userId,
        level: 'info',
        message: 'Dashboard data fetched successfully (direct query)',
        meta: {
          response_time_ms: responseTime,
          weather_available: weather !== null,
          countdown_available: countdown !== null,
          bookings_count: bookings.length,
          contacts_count: hostContacts.length,
          services_count: services.length,
        },
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to log dashboard fetch:', logError);
    }

    // Log performance warning if > 300ms
    if (responseTime > 300) {
      console.warn(`Dashboard data fetch slow: ${responseTime}ms`);
    }

    // Get user email from auth
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // Build response
    const response: DashboardResponse = {
      user: {
        id: userId,
        email: authUser?.email || '',
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
      instagram: {
        ...instagram,
        latestPosts: [],
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        status: s.status as 'active' | 'available' | 'unavailable',
        icon: s.icon ?? undefined,
      })),
      meta: {
        fetchedAt: new Date().toISOString(),
        responseTime,
      },
    };

    return response;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    // Log error
    try {
      const supabase = await createClient();
      await supabase.from('event_logs').insert({
        event_type: 'dashboard_data_error',
        user_id: userId,
        level: 'error',
        message: 'Dashboard data fetch failed',
        meta: {
          error: error instanceof Error ? error.message : 'Unknown error',
          response_time_ms: Date.now() - startTime,
        },
      });
    } catch (logError) {
      console.error('Failed to log dashboard error:', logError);
    }

    // Return minimal fallback data
    return {
      user: { id: userId, fullName: null, email: '', phone: null, role: 'guest' as const },
      bookings: [],
      countdown: null,
      weather: null,
      instagram: {
        username: 'saele',
        embedUrl: '',
        profileUrl: 'https://instagram.com/saele',
        latestPosts: [],
      },
      services: [],
      hostContacts: [],
      meta: {
        fetchedAt: new Date().toISOString(),
        responseTime: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);
  
  // If profile doesn't exist or onboarding not completed, redirect to onboarding
  if (!profile || !profile.onboarding_completed_at) {
    redirect('/onboarding');
  }

  const dashboardData = await getDashboardData(user.id);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-saele-background)' }}>
      {/* Mobile/Tablet/Desktop Responsive Grid */}
      <div className={styles.dashboardContainer}>
        {/* Welcome Section - Full width on mobile, left column on desktop */}
        <div className={styles.welcomeSection}>
          <WelcomeSection
            userName={dashboardData.user.fullName}
            userEmail={dashboardData.user.email}
          />
        </div>

        {/* Countdown Timer - Below welcome on mobile */}
        <div className={styles.countdownSection}>
          <CountdownTimer countdown={dashboardData.countdown} />
        </div>

        {/* Booking Card - Stacked on mobile, left column on desktop */}
        <div className={styles.bookingSection}>
          <BookingCard bookings={dashboardData.bookings} />
        </div>

        {/* News Feed - Center column on desktop */}
        <div className={styles.newsSection}>
          <NewsFeed instagram={dashboardData.instagram} />
        </div>

        {/* Services Panel - Right column on desktop */}
        <div className={styles.servicesSection}>
          <ServicesPanel services={dashboardData.services} />
        </div>

        {/* Weather Widget - Right column on desktop */}
        <div className={styles.weatherSection}>
          <WeatherWidget weather={dashboardData.weather} />
        </div>

        {/* Action Buttons - Full width at bottom */}
        <div className={styles.actionsSection}>
          <ActionButtons />
        </div>
      </div>
    </main>
  );
}

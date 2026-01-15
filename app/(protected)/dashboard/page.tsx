import { redirect } from 'next/navigation';
import { requireAuth, getUserProfile } from '@/lib/auth/session';
import { DashboardResponse } from '@/types/dashboard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { CountdownTimer } from '@/components/dashboard/CountdownTimer';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { ServicesPanel } from '@/components/dashboard/ServicesPanel';
import { ActionButtons } from '@/components/dashboard/ActionButtons';
import styles from './dashboard.module.css';

async function getDashboardData(): Promise<DashboardResponse> {
  try {
    // Always use real API - seed data provides mock data in database
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard`;

    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return minimal fallback data
    return {
      user: { id: '', fullName: null, email: '', phone: null, role: 'guest' as const },
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

  const dashboardData = await getDashboardData();

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

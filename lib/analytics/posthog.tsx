'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Initialize PostHog client-side
 */
if (typeof window !== 'undefined') {
  const isEnabled =
    process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (isEnabled) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      autocapture: true,
    });
  }
}

/**
 * Component to track pageviews on route changes
 */
function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * PostHog Provider Component
 * Wrap your app with this component to enable PostHog analytics
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isEnabled =
    process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!isEnabled) {
    // If PostHog is disabled, just render children without analytics
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}

/**
 * Hook to use PostHog in components
 * Returns the PostHog client instance
 */
export function useAnalytics() {
  return posthog;
}

/**
 * Helper functions for common analytics events
 */
export const analytics = {
  /**
   * Track a custom event
   */
  track: (eventName: string, properties?: Record<string, unknown>) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  },

  /**
   * Identify a user
   */
  identify: (userId: string, properties?: Record<string, unknown>) => {
    if (posthog) {
      posthog.identify(userId, properties);
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (posthog) {
      posthog.reset();
    }
  },

  /**
   * Set user properties
   */
  setUserProperties: (properties: Record<string, unknown>) => {
    if (posthog) {
      posthog.setPersonProperties(properties);
    }
  },

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled: (featureKey: string) => {
    if (posthog) {
      return posthog.isFeatureEnabled(featureKey);
    }
    return false;
  },
};

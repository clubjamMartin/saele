'use client';

import { useActionState, useEffect, useState, useMemo } from 'react';
import { createMockBooking } from './actions/mock-booking';
import { APARTMENTS } from '@/types/booking';
import { createClient } from '@/lib/supabase/client';

export default function MockBookingPage() {
  const [state, formAction, isPending] = useActionState(createMockBooking, null);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  
  // Calculate min date once to avoid hydration mismatch
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Send magic link from client side after successful booking creation
  useEffect(() => {
    async function sendMagicLink() {
      if (state?.success && state.data && !sendingMagicLink) {
        setSendingMagicLink(true);
        const supabase = createClient();
        
        const { error } = await supabase.auth.signInWithOtp({
          email: state.data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: state.data.name,
            },
          },
        });

        if (error) {
          console.error('Error sending magic link:', error);
        }
      }
    }

    sendMagicLink();
  }, [state, sendingMagicLink]);

  // Show success state
  if (state?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-primary-200 bg-white p-8 shadow-lg dark:border-primary-800 dark:bg-zinc-900">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-success-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Booking Confirmed!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {state.message}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Click the link in your email to access your dashboard and view booking details.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  // Show booking form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl space-y-6 rounded-lg border border-primary-200 bg-white p-8 shadow-lg dark:border-primary-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Book Your Stay at <span className="text-primary-600">Saele</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Fill out the form below to reserve your apartment and receive your access link.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Full Name <span className="text-error-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="John Doe"
            />
            {state?.errors?.name && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email Address <span className="text-error-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="john@example.com"
            />
            {state?.errors?.email && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Date Fields Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Check-In Date */}
            <div className="space-y-2">
              <label
                htmlFor="checkIn"
                className="block text-sm font-medium text-foreground"
              >
                Check-In Date <span className="text-error-500">*</span>
              </label>
              <input
                id="checkIn"
                name="checkIn"
                type="date"
                required
                disabled={isPending}
                min={minDate}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
              />
              {state?.errors?.checkIn && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {state.errors.checkIn[0]}
                </p>
              )}
            </div>

            {/* Check-Out Date */}
            <div className="space-y-2">
              <label
                htmlFor="checkOut"
                className="block text-sm font-medium text-foreground"
              >
                Check-Out Date <span className="text-error-500">*</span>
              </label>
              <input
                id="checkOut"
                name="checkOut"
                type="date"
                required
                disabled={isPending}
                min={minDate}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
              />
              {state?.errors?.checkOut && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {state.errors.checkOut[0]}
                </p>
              )}
            </div>
          </div>

          {/* Guest Count and Apartment Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Number of Guests */}
            <div className="space-y-2">
              <label
                htmlFor="guestCount"
                className="block text-sm font-medium text-foreground"
              >
                Number of Guests <span className="text-error-500">*</span>
              </label>
              <input
                id="guestCount"
                name="guestCount"
                type="number"
                min="1"
                required
                disabled={isPending}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="2"
              />
              {state?.errors?.guestCount && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {state.errors.guestCount[0]}
                </p>
              )}
            </div>

            {/* Apartment Selection */}
            <div className="space-y-2">
              <label
                htmlFor="apartment"
                className="block text-sm font-medium text-foreground"
              >
                Apartment <span className="text-error-500">*</span>
              </label>
              <select
                id="apartment"
                name="apartment"
                required
                disabled={isPending}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">Select an apartment</option>
                {APARTMENTS.map((apt) => (
                  <option key={apt} value={apt}>
                    {apt}
                  </option>
                ))}
              </select>
              {state?.errors?.apartment && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {state.errors.apartment[0]}
                </p>
              )}
            </div>
          </div>

          {/* General Error Message */}
          {state && !state.success && !state.errors && (
            <div className="rounded-md bg-error-50 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
              {state.message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {isPending ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          After booking, you'll receive a magic link via email to access your dashboard.
        </p>
      </div>
    </div>
  );
}

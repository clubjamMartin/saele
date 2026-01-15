'use client';

import { useActionState, useMemo } from 'react';
import { createMockBooking } from './actions/mock-booking';
import { APARTMENTS } from '@/types/booking';
import { Card } from '@/components/ui/card';

export default function MockBookingPage() {
  const [state, formAction, isPending] = useActionState(createMockBooking, null);
  
  // Calculate min date once to avoid hydration mismatch
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Show success state
  if (state?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--color-saele-background)' }}>
        <Card variant="light" className="w-full max-w-md">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <svg
                className="h-16 w-16"
                style={{ color: 'var(--color-saele-secondary)' }}
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
            <h2 className="font-isabel text-3xl font-bold" style={{ color: 'var(--color-saele-primary)' }}>
              Buchung bestätigt!
            </h2>
            <p className="font-josefin-sans text-base" style={{ color: 'var(--color-saele-primary)' }}>
              {state.message}
            </p>
            <p className="font-josefin-sans text-sm" style={{ color: 'var(--color-saele-secondary)' }}>
              Klicke auf den Link in der E-Mail, um dein Dashboard aufzurufen und die Buchungsdetails anzuzeigen.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-md px-4 py-3 font-josefin-sans font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--color-saele-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-saele-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-saele-primary)';
              }}
            >
              Weitere Buchung vornehmen
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Show booking form
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-saele-background)' }}>
      <Card variant="light" className="w-full max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-isabel text-4xl font-bold md:text-5xl" style={{ color: 'var(--color-saele-primary)' }}>
              Buche deinen Aufenthalt bei Saele
            </h1>
            <p className="font-josefin-sans text-base" style={{ color: 'var(--color-saele-secondary)' }}>
              Fülle das Formular unten aus, um dein Apartment zu reservieren und deinen Zugangslink zu erhalten.
            </p>
          </div>

          <form action={formAction} className="space-y-4" suppressHydrationWarning>
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block font-josefin-sans text-sm font-medium"
                style={{ color: 'var(--color-saele-primary)' }}
              >
                Vollständiger Name <span style={{ color: '#991b1b' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isPending}
                className="w-full rounded-md border px-4 py-2 font-josefin-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-saele-secondary-light)',
                  backgroundColor: 'white',
                  color: 'var(--color-saele-primary)',
                }}
                placeholder="Max Mustermann"
              />
              {state?.errors?.name && (
                <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-josefin-sans text-sm font-medium"
                style={{ color: 'var(--color-saele-primary)' }}
              >
                E-Mail-Adresse <span style={{ color: '#991b1b' }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full rounded-md border px-4 py-2 font-josefin-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-saele-secondary-light)',
                  backgroundColor: 'white',
                  color: 'var(--color-saele-primary)',
                }}
                placeholder="max@beispiel.com"
              />
              {state?.errors?.email && (
                <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
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
                  className="block font-josefin-sans text-sm font-medium"
                  style={{ color: 'var(--color-saele-primary)' }}
                >
                  Check-In Datum <span style={{ color: '#991b1b' }}>*</span>
                </label>
                <input
                  id="checkIn"
                  name="checkIn"
                  type="date"
                  required
                  disabled={isPending}
                  min={minDate}
                  className="w-full rounded-md border px-4 py-2 font-josefin-sans focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: 'var(--color-saele-secondary-light)',
                    backgroundColor: 'white',
                    color: 'var(--color-saele-primary)',
                  }}
                />
                {state?.errors?.checkIn && (
                  <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
                    {state.errors.checkIn[0]}
                  </p>
                )}
              </div>

              {/* Check-Out Date */}
              <div className="space-y-2">
                <label
                  htmlFor="checkOut"
                  className="block font-josefin-sans text-sm font-medium"
                  style={{ color: 'var(--color-saele-primary)' }}
                >
                  Check-Out Datum <span style={{ color: '#991b1b' }}>*</span>
                </label>
                <input
                  id="checkOut"
                  name="checkOut"
                  type="date"
                  required
                  disabled={isPending}
                  min={minDate}
                  className="w-full rounded-md border px-4 py-2 font-josefin-sans focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: 'var(--color-saele-secondary-light)',
                    backgroundColor: 'white',
                    color: 'var(--color-saele-primary)',
                  }}
                />
                {state?.errors?.checkOut && (
                  <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
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
                  className="block font-josefin-sans text-sm font-medium"
                  style={{ color: 'var(--color-saele-primary)' }}
                >
                  Anzahl Gäste <span style={{ color: '#991b1b' }}>*</span>
                </label>
                <input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min="1"
                  required
                  disabled={isPending}
                  className="w-full rounded-md border px-4 py-2 font-josefin-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: 'var(--color-saele-secondary-light)',
                    backgroundColor: 'white',
                    color: 'var(--color-saele-primary)',
                  }}
                  placeholder="2"
                />
                {state?.errors?.guestCount && (
                  <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
                    {state.errors.guestCount[0]}
                  </p>
                )}
              </div>

              {/* Apartment Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="apartment"
                  className="block font-josefin-sans text-sm font-medium"
                  style={{ color: 'var(--color-saele-primary)' }}
                >
                  Apartment <span style={{ color: '#991b1b' }}>*</span>
                </label>
                <select
                  id="apartment"
                  name="apartment"
                  required
                  disabled={isPending}
                  className="w-full rounded-md border px-4 py-2 font-josefin-sans focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: 'var(--color-saele-secondary-light)',
                    backgroundColor: 'white',
                    color: 'var(--color-saele-primary)',
                  }}
                >
                  <option value="">Wähle ein Apartment</option>
                  {APARTMENTS.map((apt) => (
                    <option key={apt} value={apt}>
                      {apt}
                    </option>
                  ))}
                </select>
                {state?.errors?.apartment && (
                  <p className="font-josefin-sans text-sm" style={{ color: '#991b1b' }}>
                    {state.errors.apartment[0]}
                  </p>
                )}
              </div>
            </div>

            {/* General Error Message */}
            {state && !state.success && !state.errors && (
              <div className="rounded-md p-3 font-josefin-sans text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                {state.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md px-4 py-3 font-josefin-sans font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: isPending ? '#94A395' : 'var(--color-saele-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--color-saele-primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPending) {
                  e.currentTarget.style.backgroundColor = 'var(--color-saele-primary)';
                }
              }}
            >
              {isPending ? 'Erstelle Buchung...' : 'Buchung bestätigen'}
            </button>
          </form>

          <p className="text-center font-josefin-sans text-sm" style={{ color: 'var(--color-saele-secondary)' }}>
            Nach der Buchung erhältst du einen magischen Link per E-Mail, um auf dein Dashboard zuzugreifen.
          </p>
        </div>
      </Card>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <main className="mx-auto max-w-4xl text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to <span className="text-primary-600">Saele</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Modern guest management platform for seamless booking experiences
            and exceptional hospitality.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
              <svg
                className="h-6 w-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Booking Management
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track and manage all your guest bookings in one centralized
              dashboard.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-100 dark:bg-secondary-900">
              <svg
                className="h-6 w-6 text-secondary-600 dark:text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Secure Authentication
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Passwordless magic link authentication for seamless and secure
              access.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-900">
              <svg
                className="h-6 w-6 text-accent-600 dark:text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Role-Based Access
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Granular permissions with guest and admin roles for secure data
              access.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-16">
          <p className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Next.js 16
            </span>
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Supabase
            </span>
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Tailwind CSS
            </span>
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              TypeScript
            </span>
          </div>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} Saele. All rights reserved.</p>
      </footer>
    </div>
  );
}

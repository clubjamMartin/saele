'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/auth/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithMagicLink(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
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
              Check your email
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Click the link in the email to sign in to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-primary-200 bg-white p-8 shadow-lg dark:border-primary-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Saele</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to your account with a magic link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-error-50 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          No password required. We&apos;ll send you a secure link to sign in.
        </p>
      </div>
    </div>
  );
}

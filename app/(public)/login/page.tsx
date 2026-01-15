'use client';

import { useState } from 'react';
import { sendMagicLink } from '@/lib/actions/auth-actions';
import { Card } from '@/components/ui/card';

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
      const result = await sendMagicLink(email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to send magic link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--color-saele-background)' }}>
        <Card variant="light" className="w-full max-w-md">
          <div className="space-y-4 text-center">
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
            <h2 className="font-isabel text-3xl" style={{ color: 'var(--color-saele-primary)' }}>
              E-Mail überprüfen
            </h2>
            <p className="font-josefin-sans text-base" style={{ color: 'var(--color-saele-primary)' }}>
              Wir haben einen magischen Link an <strong>{email}</strong> gesendet
            </p>
            <p className="font-josefin-sans text-sm" style={{ color: 'var(--color-saele-secondary)' }}>
              Klicke auf den Link in der E-Mail, um dich anzumelden.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--color-saele-background)' }}>
      <Card variant="light" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-isabel text-4xl md:text-5xl" style={{ color: 'var(--color-saele-primary)' }}>
              Willkommen bei Saele
            </h1>
            <p className="font-josefin-sans text-base" style={{ color: 'var(--color-saele-secondary)' }}>
              Melde dich mit einem magischen Link an
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-josefin-sans text-sm font-medium"
                style={{ color: 'var(--color-saele-primary)' }}
              >
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border px-4 py-2 font-josefin-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--color-saele-secondary-light)',
                  backgroundColor: 'white',
                  color: 'var(--color-saele-primary)',
                }}
                placeholder="deine@email.com"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md p-3 font-josefin-sans text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md px-4 py-2 font-josefin-sans font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-saele-primary)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-saele-primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-saele-primary)';
              }}
            >
              {loading ? 'Wird gesendet...' : 'Magischen Link senden'}
            </button>
          </form>

          <p className="text-center font-josefin-sans text-sm" style={{ color: 'var(--color-saele-secondary)' }}>
            Kein Passwort erforderlich. Wir senden dir einen sicheren Link zum Anmelden.
          </p>
        </div>
      </Card>
    </div>
  );
}

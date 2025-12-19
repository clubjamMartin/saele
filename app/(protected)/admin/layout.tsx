import { requireAdmin } from '@/lib/auth/session';
import { ReactNode } from 'react';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This will redirect to /dashboard if user is not admin
  // and to /login if user is not authenticated
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                Dashboard
              </a>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

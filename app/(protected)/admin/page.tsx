import { getUser, getUserProfile } from '@/lib/auth/session';

export default async function AdminPage() {
  const user = await getUser();
  const profile = user ? await getUserProfile(user.id) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Welcome, Admin
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Name:</strong> {profile?.full_name || 'Not set'}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Role:</strong>{' '}
              <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {profile?.role || 'guest'}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Admin Features
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Bookings</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Manage all guest bookings
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Users</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                View and manage user profiles
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Contacts</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Manage host contact information
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Notifications</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                View notification queue and status
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Event Logs</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Audit trail and system events
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="mb-2 font-medium text-foreground">Settings</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Configure system settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

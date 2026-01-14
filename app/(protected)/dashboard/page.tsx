import { requireAuth, getUserProfile, isAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);
  
  // If profile doesn't exist or onboarding not completed, redirect to onboarding
  if (!profile || !profile.onboarding_completed_at) {
    redirect('/onboarding');
  }
  
  const userIsAdmin = await isAdmin(user.id);

  // Fetch user's bookings
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('guest_user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch active host contacts
  const { data: contacts } = await supabase
    .from('host_contacts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-4">
              {userIsAdmin && (
                <a
                  href="/admin"
                  className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Admin Panel
                </a>
              )}
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Welcome back, {profile?.full_name || 'Guest'}!
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-600 dark:text-zinc-400">
                <strong>Email:</strong> {user.email}
              </p>
              {profile?.phone && (
                <p className="text-zinc-600 dark:text-zinc-400">
                  <strong>Phone:</strong> {profile.phone}
                </p>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Your Bookings
            </h3>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          Booking #{booking.external_booking_id}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {booking.check_in && booking.check_out
                            ? `${new Date(booking.check_in).toLocaleDateString()} - ${new Date(booking.check_out).toLocaleDateString()}`
                            : 'Dates not set'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No bookings yet.
              </p>
            )}
          </div>

          {/* Host Contacts Section */}
          {contacts && contacts.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Contact Information
              </h3>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                  >
                    <h4 className="mb-2 font-medium text-foreground">
                      {contact.display_name}
                    </h4>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {contact.email && (
                        <p>
                          <strong>Email:</strong>{' '}
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-primary-600 hover:underline dark:text-primary-400"
                          >
                            {contact.email}
                          </a>
                        </p>
                      )}
                      {contact.phone && (
                        <p>
                          <strong>Phone:</strong>{' '}
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-primary-600 hover:underline dark:text-primary-400"
                          >
                            {contact.phone}
                          </a>
                        </p>
                      )}
                      {contact.whatsapp && (
                        <p>
                          <strong>WhatsApp:</strong>{' '}
                          <a
                            href={`https://wa.me/${contact.whatsapp}`}
                            className="text-primary-600 hover:underline dark:text-primary-400"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {contact.whatsapp}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { requireAuth, getUserProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server action to handle onboarding completion
 */
async function completeOnboarding(formData: FormData) {
  'use server';

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  if (!fullName || fullName.trim().length === 0) {
    return { error: 'Name is required' };
  }

  const user = await requireAuth();
  const supabase = await createClient();

  // Update profile with onboarding data
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error completing onboarding:', error);
    return { error: 'Failed to save your information. Please try again.' };
  }

  // Redirect to dashboard
  redirect('/dashboard');
}

export default async function OnboardingPage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  // If user has already completed onboarding, redirect to dashboard
  if (profile?.onboarding_completed_at) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-primary-200 bg-white p-8 shadow-lg dark:border-primary-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <svg
              className="h-16 w-16 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Saele!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Let's set up your profile to get started.
          </p>
        </div>

        <form action={completeOnboarding} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-foreground"
            >
              Full Name <span className="text-error-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={profile?.full_name || user.user_metadata?.full_name || ''}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="John Doe"
              autoFocus
            />
          </div>

          {/* Phone Field (Optional) */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground"
            >
              Phone Number <span className="text-xs text-zinc-500">(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ''}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Continue to Dashboard
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          You can update this information later in your profile settings.
        </p>
      </div>
    </div>
  );
}

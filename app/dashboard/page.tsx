import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12">
          <h1 className="font-['Blush_Free',cursive] text-6xl text-primary">
            Willkommen zurück!
          </h1>
          {profile?.full_name && (
            <p className="font-['Isabel',serif] mt-4 text-3xl font-bold text-secondary">
              {profile.full_name}
            </p>
          )}
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard content will be added here */}
          <div className="rounded-2xl border border-secondary/20 bg-white p-8 shadow-lg">
            <h2 className="font-['Isabel',serif] mb-4 text-2xl font-bold text-secondary">
              Deine Reise
            </h2>
            <p className="text-secondary/70">
              Hier findest du bald alle Details zu deinem Aufenthalt.
            </p>
          </div>

          {profile?.interests && profile.interests.length > 0 && (
            <div className="rounded-2xl border border-secondary/20 bg-white p-8 shadow-lg">
              <h2 className="font-['Isabel',serif] mb-4 text-2xl font-bold text-secondary">
                Deine Interessen
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-primary-light px-4 py-2 text-sm text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-secondary/20 bg-white p-8 shadow-lg">
            <h2 className="font-['Isabel',serif] mb-4 text-2xl font-bold text-secondary">
              Empfehlungen
            </h2>
            <p className="text-secondary/70">
              Basierend auf deinen Interessen haben wir tolle Tipps für dich.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Define route protection
  const isProtectedRoute =
    path.startsWith('/admin') || 
    path.startsWith('/dashboard') ||
    path.startsWith('/onboarding');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/auth');

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', path)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    // Copy cookies from supabase response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Onboarding logic - only for authenticated users
  if (user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at, role')
      .eq('user_id', user.id)
      .single()

    const hasCompletedOnboarding = !!profile?.onboarding_completed_at

    // Redirect logic
    if (!hasCompletedOnboarding && path !== '/onboarding' && path !== '/login' && !path.startsWith('/auth')) {
      // User hasn't completed onboarding - redirect to onboarding
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabase response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    if (hasCompletedOnboarding && path === '/') {
      // User has completed onboarding - redirect root to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabase response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    if (hasCompletedOnboarding && path === '/onboarding') {
      // User already completed onboarding - redirect to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabase response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    // Check admin access for /admin routes
    if (path.startsWith('/admin')) {
      if (profile?.role !== 'admin') {
        const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
        // Copy cookies from supabase response
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
      }
    }

    // Redirect authenticated users away from login page
    if (isAuthRoute && path === '/login') {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
      // Copy cookies from supabase response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip auth check if Supabase env vars aren't configured yet
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const isSupabaseConfigured =
        supabaseUrl &&
        supabaseKey &&
        supabaseUrl !== 'your_supabase_project_url' &&
        supabaseUrl.startsWith('http')

    if (!isSupabaseConfigured) {
        // In dev without Supabase configured, allow all routes through
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const protectedRoutes = ['/dashboard', '/draft', '/leagues', '/live', '/profile']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect logged-in users away from login
    if (user && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

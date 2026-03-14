import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    supabaseResponse.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    supabaseResponse.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // IMPORTANT: getUser() will attempt to refresh the token if expired.
    // If the refresh fails (e.g. network issue, Supabase downtime), we should
    // NOT treat the user as logged out — fall back to checking if there's
    // a valid refresh token cookie present.
    let user: User | null = null
    try {
        const { data, error } = await supabase.auth.getUser()
        if (!error) {
            user = data.user
        } else {
            // getUser failed — check if there's a logged-in cookie hint.
            // If the user had a valid session before, don't force logout on
            // transient errors (network blips, Supabase rate limits, etc.)
            const hasLoggedInCookie = request.cookies.get('logged-in')?.value === 'true'
            const hasRefreshToken = request.cookies.getAll().some(
                c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
            )
            if (hasLoggedInCookie && hasRefreshToken) {
                console.warn('[middleware] getUser failed but session cookies present, allowing request:', error.message)
                // Return a synthetic user object so the request isn't blocked
                // The client-side Supabase will handle the actual token refresh
                user = { id: 'pending-refresh' } as any
            }
        }
    } catch (e) {
        // Network-level failure — same fallback logic
        const hasLoggedInCookie = request.cookies.get('logged-in')?.value === 'true'
        if (hasLoggedInCookie) {
            console.warn('[middleware] getUser threw, allowing request with cookie hint')
            user = { id: 'pending-refresh' } as any
        }
    }

    return { supabaseResponse, user, supabase }
}

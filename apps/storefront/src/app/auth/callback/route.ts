import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Determines the correct site origin for OAuth callbacks.
 * Keep the callback on the same host where the OAuth flow started so the
 * Supabase PKCE verifier cookie is available during code exchange.
 */
function getSiteOrigin(request: NextRequest): string {
    return new URL(request.url).origin
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const origin = getSiteOrigin(request)

    const code = requestUrl.searchParams.get('code')
    // Support both 'next' and 'redirect' param names for backwards compat
    const rawNext = requestUrl.searchParams.get('next')
        ?? requestUrl.searchParams.get('redirect')
        ?? '/'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
        // We need to create a Supabase client that writes cookies directly onto
        // the redirect response. The server.ts createClient() uses next/headers
        // cookies() which sets cookies on the *implicit* response — but since we
        // return an *explicit* NextResponse.redirect(), those cookies are lost.
        // Instead, we collect all cookie operations and apply them to the redirect.
        const cookieStore = cookies()
        const redirectUrl = new URL(next, origin)
        const response = NextResponse.redirect(redirectUrl)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Set on both the cookieStore (for subsequent reads in this
                        // request) and the explicit redirect response
                        try {
                            cookieStore.set({ name, value, ...options })
                        } catch {
                            // cookieStore.set may throw in some contexts
                        }
                        response.cookies.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options })
                        } catch {
                            // ignore
                        }
                        response.cookies.set({ name, value: '', ...options })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            response.cookies.set('logged-in', 'true', { path: '/', maxAge: 31536000, sameSite: 'lax' })
            return response
        }
    }

    // Auth hatasi - login sayfasina geri yonlendir
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}

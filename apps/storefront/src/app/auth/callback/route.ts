import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const rawNext = requestUrl.searchParams.get('next') ?? '/'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const response = NextResponse.redirect(new URL(next, requestUrl.origin))
            response.cookies.set('logged-in', 'true', { path: '/', maxAge: 31536000, sameSite: 'lax' })
            return response
        }
    }

    // Auth hatası — login sayfasına geri yönlendir
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin))
}

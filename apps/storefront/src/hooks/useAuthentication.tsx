'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'

/**
 * Read the `logged-in` cookie value.
 * Used as a fast initial hint before the async Supabase check completes.
 */
function readLoggedInCookie(): boolean {
   if (typeof document === 'undefined') return false
   try {
      return document.cookie.split(';').some(c => c.trim().startsWith('logged-in=true'))
   } catch {
      return false
   }
}

/**
 * Hook that checks authentication state using BOTH the `logged-in` cookie
 * (for instant first render) and the Supabase client session (as source of truth).
 *
 * It also subscribes to Supabase auth state changes so the navbar updates
 * immediately after login/logout without requiring a full page reload.
 *
 * IMPORTANT: Initial state is always `false` to match SSR output and prevent
 * React hydration errors (#418/#422). The cookie hint is read in a useEffect
 * so the first client render matches the server render exactly.
 *
 * AUTO-LOGOUT FIX:
 * - getSession() failure (network/timeout) no longer clears auth state
 * - onAuthStateChange distinguishes event types: only SIGNED_OUT clears state
 * - TOKEN_REFRESHED with a valid session updates state, failed refresh is ignored
 *   so the user stays logged in until an explicit sign-out occurs
 */
export function useAuthenticated() {
   // Always start false to match SSR — prevents hydration mismatch
   const [authenticated, setAuthenticated] = useState<boolean>(false)
   // Track whether we've confirmed auth at least once (prevents premature logout)
   const confirmedRef = useRef(false)

   // Read the cookie hint immediately after mount (before Supabase async check)
   // This gives a fast visual update without causing hydration errors
   useEffect(() => {
      const cookieHint = readLoggedInCookie()
      if (cookieHint) {
         setAuthenticated(true)
      }
   }, [])

   useEffect(() => {
      const supabase = createClient()

      // 1. Check current session on mount
      supabase.auth.getSession().then(({ data: { session }, error }) => {
         if (error) {
            // Session check failed (network error, timeout, etc.)
            // Do NOT clear auth state — keep whatever the cookie hint said.
            // The user will stay "logged in" visually until the next successful check.
            console.warn('[useAuthenticated] getSession failed, keeping current state:', error.message)
            return
         }
         const isLoggedIn = !!session?.user
         setAuthenticated(isLoggedIn)
         syncCookie(isLoggedIn)
         confirmedRef.current = true
      }).catch(() => {
         // Network-level failure — keep current auth state
         console.warn('[useAuthenticated] getSession threw, keeping current state')
      })

      // 2. Subscribe to auth state changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (event, session) => {
            if (event === 'SIGNED_OUT') {
               // Explicit sign-out — always clear state
               setAuthenticated(false)
               syncCookie(false)
               confirmedRef.current = true
               return
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
               if (session?.user) {
                  setAuthenticated(true)
                  syncCookie(true)
                  confirmedRef.current = true
               }
               // If TOKEN_REFRESHED fires but session is null, the refresh failed.
               // Do NOT log the user out — they may still have a valid session that
               // will be restored on the next attempt.
               return
            }

            // INITIAL_SESSION event — update state only if session is present
            // or if we haven't confirmed auth yet (prevents clearing state on
            // subsequent INITIAL_SESSION events after a successful login)
            if (event === 'INITIAL_SESSION') {
               if (session?.user) {
                  setAuthenticated(true)
                  syncCookie(true)
                  confirmedRef.current = true
               } else if (!confirmedRef.current && !readLoggedInCookie()) {
                  // Only clear if we've never confirmed AND there's no cookie hint
                  setAuthenticated(false)
                  syncCookie(false)
               }
            }
         }
      )

      return () => {
         subscription.unsubscribe()
      }
   }, [])

   return { authenticated }
}

/**
 * Keep the `logged-in` cookie in sync with the actual Supabase session.
 * This cookie is also read by the middleware and logout flow.
 */
function syncCookie(loggedIn: boolean) {
   if (typeof document === 'undefined') return
   if (loggedIn) {
      document.cookie = 'logged-in=true; path=/; max-age=31536000; SameSite=Lax'
   } else {
      document.cookie = 'logged-in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
   }
}

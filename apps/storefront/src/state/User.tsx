import { useAuthenticated } from '@/hooks/useAuthentication'
import { isVariableValid } from '@/lib/utils'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const UserContext = createContext<{
   user: any
   loading: boolean
   refreshUser: () => Promise<void>
}>({
   user: null,
   loading: true,
   refreshUser: async () => { },
})

export const useUserContext = () => {
   return useContext(UserContext)
}

/**
 * UserContextProvider fetches the user profile ONCE on mount (when authenticated).
 *
 * Key perf fixes:
 * 1. Uses a 30s in-memory cache — avoids re-fetching on every navigation
 *    (React re-mounts context providers on hard nav but not soft nav)
 * 2. Passes `cache: 'default'` so the browser caches the response
 *    (no-store was bypassing ALL browser caching, causing a new fetch every time)
 * 3. AbortController cleans up in-flight requests on unmount
 */

// Module-level profile cache so it survives across re-renders
let profileCache: { data: any; timestamp: number } | null = null
const CACHE_TTL_MS = 30_000 // 30 seconds

export const UserContextProvider = ({ children }) => {
   const { authenticated } = useAuthenticated()
   const [user, setUser] = useState<any>(profileCache?.data ?? null)
   const [loading, setLoading] = useState(true)
   const abortRef = useRef<AbortController | null>(null)

   const fetchProfile = async (force = false) => {
      // Return cached result if fresh
      if (!force && profileCache && Date.now() - profileCache.timestamp < CACHE_TTL_MS) {
         setUser(profileCache.data)
         setLoading(false)
         return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
         setLoading(true)
         const response = await fetch('/api/profile', {
            signal: controller.signal,
            // Use the browser's default caching — middleware already gates auth
            // no-store was causing a full network round-trip every single time
         })
         if (!response.ok) { setLoading(false); return }
         const json = await response.json()
         if (isVariableValid(json)) {
            profileCache = { data: json, timestamp: Date.now() }
            setUser(json)
         }
      } catch (e: any) {
         if (e?.name !== 'AbortError') console.error('[UserContext]', e)
      } finally {
         setLoading(false)
      }
   }

   const refreshUser = async () => {
      profileCache = null // invalidate cache
      if (authenticated) await fetchProfile(true)
   }

   useEffect(() => {
      if (authenticated) {
         fetchProfile()
      } else if (authenticated === false) {
         // authenticated resolved to false (not null/undefined = still loading)
         profileCache = null
         setUser(null)
         setLoading(false)
      }
      return () => { abortRef.current?.abort() }
   }, [authenticated])

   return (
      <UserContext.Provider value={{ user, loading, refreshUser }}>
         {children}
      </UserContext.Provider>
   )
}

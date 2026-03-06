'use client'

import { useEffect, useState } from 'react'

export function useCsrf() {
   const [token, setToken] = useState<string | null>(null)

   useEffect(() => {
      fetch('/api/csrf')
         .then((r) => (r.ok ? r.json() : null))
         .then((data) => {
            if (data?.token) setToken(data.token)
         })
         .catch(() => {})
   }, [])

   return token
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { AlertCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import { UserForm } from './components/user-form'

export default function UserPage() {
   const [user, setUser] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   const fetchUser = useCallback(async () => {
      setLoading(true)
      setError(false)
      try {
         const response = await fetch(`/api/profile`)
         if (!response.ok) throw new Error('Failed to fetch profile')
         const json = await response.json()
         setUser(json)
      } catch (err) {
         console.error({ err })
         setError(true)
         toast.error('Profil bilgileri yüklenirken bir hata oluştu.')
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchUser()
   }, [fetchUser])

   return (
      <div className="flex-col">
         <div className="flex-1">
            {loading ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ) : error ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
                     <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
                     <p className="text-muted-foreground">Bir hata oluştu</p>
                     <Button variant="outline" onClick={fetchUser}>
                        Tekrar Dene
                     </Button>
                  </CardContent>
               </Card>
            ) : user ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent className="py-6">
                     <UserForm initialData={user} />
                  </CardContent>
               </Card>
            ) : null}
         </div>
      </div>
   )
}

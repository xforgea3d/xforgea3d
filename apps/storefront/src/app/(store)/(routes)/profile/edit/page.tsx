'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import { UserForm } from './components/user-form'

export default function UserPage() {
   const [user, setUser] = useState(null)

   useEffect(() => {
      async function getUser() {
         try {
            const response = await fetch(`/api/profile`)
            const json = await response.json()
            setUser(json)
         } catch (error) {
            console.error({ error })
            toast.error('Profil bilgileri yüklenirken bir hata oluştu.')
         }
      }

      getUser()
   }, [])

   return (
      <div className="flex-col">
         <div className="flex-1">
            {user ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent className="py-6">
                     <UserForm initialData={user} />
                  </CardContent>
               </Card>
            ) : (
               <Card className="bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            )}
         </div>
      </div>
   )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import type { AddressColumn } from './components/table'
import { AddressTable } from './components/table'

export default function AddressesPage() {
   const [addresses, setAddresses] = useState(null)

   useEffect(() => {
      async function getAddresses() {
         try {
            const response = await fetch(`/api/addresses`)
            const json = await response.json()
            setAddresses(json)
         } catch (error) {
            console.error({ error })
            toast.error('Adresler yüklenirken bir hata oluştu.')
         }
      }

      getAddresses()
   }, [])

   return (
      <div className="flex-col">
         <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-medium">Adreslerim</h3>
               <Link href="/profile/addresses/new">
                  <Button>
                     <PlusIcon className="mr-2 h-4" /> Yeni Adres
                  </Button>
               </Link>
            </div>
            {addresses ? (
               <AddressSection addresses={addresses} />
            ) : (
               <Card>
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

function AddressSection({ addresses }) {
   const formattedAddresses: AddressColumn[] = addresses.map((address) => ({
      id: address.id,
      city: address.city,
      address: address.address,
      phone: address.phone,
      postal: address.postalCode,
   }))

   return <AddressTable data={formattedAddresses} />
}

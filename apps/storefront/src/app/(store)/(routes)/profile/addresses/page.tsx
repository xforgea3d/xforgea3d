'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { AlertCircle, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import type { AddressColumn } from './components/table'
import { AddressTable } from './components/table'

export default function AddressesPage() {
   const [addresses, setAddresses] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   const fetchAddresses = useCallback(async () => {
      setLoading(true)
      setError(false)
      try {
         const response = await fetch(`/api/addresses`)
         if (!response.ok) throw new Error('Failed to fetch addresses')
         const json = await response.json()
         setAddresses(json)
      } catch (err) {
         console.error({ err })
         setError(true)
         toast.error('Adresler yüklenirken bir hata oluştu.')
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchAddresses()
   }, [fetchAddresses])

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
            {loading ? (
               <Card>
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ) : error ? (
               <Card>
                  <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
                     <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
                     <p className="text-muted-foreground">Bir hata oluştu</p>
                     <Button variant="outline" onClick={fetchAddresses}>
                        Tekrar Dene
                     </Button>
                  </CardContent>
               </Card>
            ) : addresses ? (
               <AddressSection addresses={addresses} />
            ) : null}
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

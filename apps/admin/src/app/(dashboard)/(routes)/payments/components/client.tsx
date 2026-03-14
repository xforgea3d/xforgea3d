'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { PaymentColumn, columns } from './columns'

const tabs = [
   { key: 'all', label: 'Tumu', status: null },
   { key: 'Paid', label: 'Basarili', status: 'Paid' },
   { key: 'Failed', label: 'Basarisiz', status: 'Failed' },
   { key: 'Processing', label: 'Beklemede', status: 'Processing' },
   { key: 'Denied', label: 'Reddedildi', status: 'Denied' },
] as const

interface PaymentClientProps {
   data: PaymentColumn[]
}

export const PaymentClient: React.FC<PaymentClientProps> = ({ data }) => {
   const [activeTab, setActiveTab] = useState<string>('all')

   const filteredData =
      activeTab === 'all'
         ? data
         : data.filter((p) => p.status === activeTab)

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Odemeler (${data.length})`}
            description="Tum odemeleri goruntuleyin ve yonetin."
         />
         <Separator />
         <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => {
               const count =
                  tab.status === null
                     ? data.length
                     : data.filter((p) => p.status === tab.status).length
               return (
                  <Button
                     key={tab.key}
                     variant={activeTab === tab.key ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setActiveTab(tab.key)}
                     className={cn(
                        'transition-all',
                        activeTab === tab.key && 'shadow-sm'
                     )}
                  >
                     {tab.label} ({count})
                  </Button>
               )
            })}
         </div>
         <DataTable searchKey="refId" columns={columns} data={filteredData} />
      </div>
   )
}

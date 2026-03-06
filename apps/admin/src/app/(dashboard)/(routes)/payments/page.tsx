export const revalidate = 0
import prisma from '@/lib/prisma'
import { format } from 'date-fns'

import { PaymentClient } from './components/client'
import type { PaymentColumn } from './components/columns'

export default async function PaymentsPage() {
   let payments: any[] = []
   try {
      payments = await prisma.payment.findMany({
         select: {
            id: true,
            number: true,
            status: true,
            payable: true,
            isSuccessful: true,
            createdAt: true,
         },
         orderBy: {
            updatedAt: 'desc',
         },
         take: 100,
      })
   } catch (error) {
      console.warn('[PaymentsPage] Failed to fetch payments:', error)
   }

   const formattedPayments: PaymentColumn[] = payments.map((payment) => ({
      id: payment.id,
      number: 'Ödeme #' + payment.number.toString(),
      status: payment.status,
      date: payment.createdAt.toUTCString(),
      payable: payment.payable.toFixed(2) + ' ₺',
      isSuccessful: payment.isSuccessful,
      createdAt: format(payment.createdAt, 'MMMM do, yyyy'),
   }))

   return <PaymentClient data={formattedPayments} />
}

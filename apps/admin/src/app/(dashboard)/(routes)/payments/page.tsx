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
            refId: true,
            cardPan: true,
            createdAt: true,
            order: {
               select: {
                  number: true,
               },
            },
            user: {
               select: {
                  email: true,
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
         take: 200,
      })
   } catch (error) {
      console.warn('[PaymentsPage] Failed to fetch payments:', error)
   }

   const formattedPayments: PaymentColumn[] = payments.map((payment) => ({
      id: payment.id,
      number: 'Odeme #' + payment.number.toString(),
      status: payment.status,
      refId: payment.refId,
      cardPan: payment.cardPan || '-',
      orderNumber: 'Siparis #' + payment.order.number.toString(),
      userEmail: payment.user.email,
      payable: payment.payable.toFixed(2) + ' TL',
      isSuccessful: payment.isSuccessful,
      createdAt: format(payment.createdAt, 'dd.MM.yyyy HH:mm'),
   }))

   return <PaymentClient data={formattedPayments} />
}

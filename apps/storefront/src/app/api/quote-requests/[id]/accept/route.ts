import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * POST /api/quote-requests/[id]/accept — PROTECTED
 * User accepts quoted price → creates Order → returns orderId for payment redirect
 */
export async function POST(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }

      const { addressId } = await req.json()

      if (!addressId) {
         return NextResponse.json({ error: 'Adres seçimi zorunludur' }, { status: 400 })
      }

      // Fetch the quote request
      const quoteRequest = await prisma.quoteRequest.findFirst({
         where: { id: params.id, userId, status: 'Priced' },
         include: {
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
      })

      if (!quoteRequest) {
         return NextResponse.json(
            { error: 'Talep bulunamadı veya fiyat henüz belirlenmemiş' },
            { status: 404 }
         )
      }

      if (!quoteRequest.quotedPrice || quoteRequest.quotedPrice <= 0) {
         return NextResponse.json(
            { error: 'Geçersiz fiyat' },
            { status: 400 }
         )
      }

      const price = quoteRequest.quotedPrice
      const tax = parseFloat((price * 0.09).toFixed(2))
      const payable = parseFloat((price + tax).toFixed(2))

      // Create order with the hidden "Talep Edilen Parça" product
      const order = await prisma.order.create({
         data: {
            user: { connect: { id: userId } },
            status: 'OnayBekleniyor',
            total: price,
            tax,
            payable,
            discount: 0,
            shipping: 0,
            address: { connect: { id: addressId } },
            orderItems: {
               create: {
                  product: { connect: { id: 'quote-request-product' } },
                  count: 1,
                  price,
                  discount: 0,
                  isCustom: true,
                  customSnapshot: {
                     quoteRequestId: quoteRequest.id,
                     quoteNumber: quoteRequest.number,
                     partDescription: quoteRequest.partDescription,
                     carBrand: quoteRequest.carBrand?.name || null,
                     carModel: quoteRequest.carModel?.name || null,
                     imageUrl: quoteRequest.imageUrl,
                  },
               },
            },
         },
      })

      // Update quote request status to Accepted and link to order
      await prisma.quoteRequest.update({
         where: { id: quoteRequest.id },
         data: {
            status: 'Accepted',
            orderId: order.id,
         },
      })

      // Notify admins
      try {
         const admins = await prisma.profile.findMany({
            where: { role: 'admin' },
            select: { id: true },
         })

         if (admins.length) {
            await prisma.notification.createMany({
               data: admins.map((admin) => ({
                  userId: admin.id,
                  content: `Parça talebi #${quoteRequest.number} kabul edildi — Sipariş #${order.number} oluşturuldu.`,
               })),
            })
         }
      } catch (notifyError) {
         console.error('[QUOTE_ACCEPT_NOTIFY]', notifyError)
      }

      return NextResponse.json({ orderId: order.id })
   } catch (error) {
      console.error('[QUOTE_ACCEPT]', error)
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}

import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextResponse } from 'next/server'

function generateOrderCode(orderNumber: number): string {
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
   let rand = ''
   for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return `XF-${orderNumber}-${rand}`
}

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

      const { addressId, csrfToken } = await req.json()

      if (csrfToken && !verifyCsrfToken(csrfToken, userId)) {
         return NextResponse.json({ error: 'Gecersiz istek. Sayfayi yenileyip tekrar deneyin.' }, { status: 403 })
      }

      if (!addressId) {
         return NextResponse.json({ error: 'Adres secimi zorunludur' }, { status: 400 })
      }

      // Verify address belongs to user
      const address = await prisma.address.findFirst({
         where: { id: addressId, userId },
      })
      if (!address) {
         return NextResponse.json({ error: 'Adres bulunamadi veya size ait degil' }, { status: 403 })
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

      // Idempotency: already accepted
      if (quoteRequest.orderId) {
         return NextResponse.json({ orderId: quoteRequest.orderId })
      }

      if (!quoteRequest.quotedPrice || quoteRequest.quotedPrice <= 0) {
         return NextResponse.json(
            { error: 'Geçersiz fiyat' },
            { status: 400 }
         )
      }

      const price = quoteRequest.quotedPrice

      // Fetch tax rate from SiteSettings
      const siteSettings = await prisma.siteSettings.findUnique({
         where: { id: 1 },
         select: { tax_rate: true },
      })
      const taxRate = siteSettings?.tax_rate ?? 20

      const tax = parseFloat((price * (taxRate / 100)).toFixed(2))
      const payable = parseFloat((price + tax).toFixed(2))

      // Atomic: create order + update quote request in transaction
      const order = await prisma.$transaction(async (tx) => {
         // Ensure the sentinel product exists (created by seed, but guard against missing)
         const sentinelProduct = await tx.product.findUnique({ where: { id: 'quote-request-product' } })
         if (!sentinelProduct) {
            // Create system brand + sentinel product if seed hasn't been run
            const systemBrand = await tx.brand.upsert({
               where: { title: 'xForgea3D' },
               update: {},
               create: { title: 'xForgea3D', description: 'Sistem markası' },
            })
            await tx.product.create({
               data: {
                  id: 'quote-request-product',
                  title: 'Talep Edilen Parça',
                  description: 'Parça talep sistemi üzerinden oluşturulan sipariş kalemi.',
                  images: [],
                  keywords: ['talep', 'parça', 'quote'],
                  price: 0,
                  discount: 0,
                  stock: 9999,
                  isAvailable: false,
                  isFeatured: false,
                  brand: { connect: { id: systemBrand.id } },
               },
            })
         }

         const created = await tx.order.create({
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

         await tx.quoteRequest.update({
            where: { id: quoteRequest.id },
            data: {
               status: 'Accepted',
               orderId: created.id,
            },
         })

         return created
      })

      // Generate unique order code
      const orderCode = generateOrderCode(order.number)
      await prisma.order.update({
         where: { id: order.id },
         data: { orderCode },
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
      } catch (notifyError: any) {
         console.error('[QUOTE_ACCEPT_NOTIFY]', notifyError)
         logError({
            message: notifyError?.message || '[QUOTE_ACCEPT_NOTIFY] Notification failed',
            stack: notifyError?.stack,
            severity: 'low',
            source: 'backend',
            statusCode: 500,
            ...extractRequestContext(req),
         })
      }

      return NextResponse.json({ orderId: order.id })
   } catch (error: any) {
      console.error('[QUOTE_ACCEPT]', error)
      logError({
         message: error?.message || '[QUOTE_ACCEPT] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}

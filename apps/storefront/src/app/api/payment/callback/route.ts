import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
   try {
      const body = await req.json().catch(() => null)
      const formData = body ? null : await req.formData().catch(() => null)

      const getField = (key: string): string | null => {
         if (body && body[key]) return String(body[key])
         if (formData && formData.get(key)) return String(formData.get(key))
         return null
      }

      const refId = getField('merchant_oid') ?? getField('order_id') ?? getField('refId')
      const status = getField('status') ?? getField('payment_status')
      const hash = getField('hash') ?? getField('signature')
      const cardPan = getField('card_pan') ?? getField('masked_card')
      const totalAmount = getField('total_amount') ?? getField('amount')

      if (!refId) {
         console.error('[PAYMENT_CALLBACK] Missing refId')
         return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
      }

      const payment = await prisma.payment.findUnique({
         where: { refId },
         include: { order: { include: { orderItems: true } } },
      })

      if (!payment) {
         console.error('[PAYMENT_CALLBACK] Payment not found:', refId)
         return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Idempotency: already processed
      if (payment.isSuccessful) {
         return NextResponse.json({ status: 'OK', message: 'Already processed' })
      }

      // Signature validation - REQUIRED in all non-development environments
      const secretKey = process.env.PAYMENT_SECRET_KEY
      if (secretKey) {
         if (!hash) {
            console.error('[PAYMENT_CALLBACK] Missing signature for refId:', refId)
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
         }

         // Always use stored payment amount for HMAC, never trust callback data
         const merchantId = process.env.PAYMENT_MERCHANT_ID ?? ''
         const expectedHashStr = `${merchantId}${refId}${payment.payable.toFixed(2)}`
         const expectedHash = crypto
            .createHmac('sha256', secretKey)
            .update(expectedHashStr)
            .digest('base64')

         const hashBuffer = Buffer.from(hash)
         const expectedBuffer = Buffer.from(expectedHash)

         if (hashBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(hashBuffer, expectedBuffer)) {
            console.error('[PAYMENT_CALLBACK] Invalid signature for refId:', refId)

            await prisma.payment.update({
               where: { id: payment.id },
               data: { status: 'Denied' },
            })

            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
         }

         // Validate callback amount matches stored payable (if provided)
         if (totalAmount) {
            const parsedAmount = parseFloat(totalAmount)
            if (!isNaN(parsedAmount) && Math.abs(parsedAmount - payment.payable) > 0.01) {
               console.error('[PAYMENT_CALLBACK] Amount mismatch:', { totalAmount, expected: payment.payable })
               await prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: 'Denied' },
               })
               return NextResponse.json({ error: 'Amount mismatch' }, { status: 403 })
            }
         }
      } else if (process.env.NODE_ENV !== 'development') {
         // In non-development environments, signature validation is MANDATORY
         console.error('[PAYMENT_CALLBACK] PAYMENT_SECRET_KEY not configured — rejecting callback')
         return NextResponse.json({ error: 'Payment validation not configured' }, { status: 500 })
      }

      // Process payment result
      const isSuccess = status === 'success' || status === 'completed' || status === 'paid'

      // Parse fee safely (prevent NaN in database)
      const parsedFee = totalAmount ? parseFloat(totalAmount) : undefined
      const safeFee = parsedFee !== undefined && !isNaN(parsedFee) ? parsedFee : undefined

      if (isSuccess) {
         // Atomic update with idempotency check inside transaction
         const result = await prisma.$transaction(async (tx) => {
            const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } })
            if (current.isSuccessful) return { alreadyProcessed: true }

            await tx.payment.update({
               where: { id: payment.id },
               data: {
                  status: 'Paid',
                  isSuccessful: true,
                  cardPan: cardPan ?? undefined,
                  cardHash: hash ?? undefined,
                  fee: safeFee ?? 0,
               },
            })
            await tx.order.update({
               where: { id: payment.orderId },
               data: { isPaid: true, status: 'Uretimde' },
            })
            return { alreadyProcessed: false }
         })

         if (result.alreadyProcessed) {
            return NextResponse.json({ status: 'OK', message: 'Already processed' })
         }

         // Notify admins (best-effort)
         try {
            const admins = await prisma.profile.findMany({
               where: { role: 'admin' },
            })

            if (admins.length > 0) {
               await prisma.notification.createMany({
                  data: admins.map((admin) => ({
                     userId: admin.id,
                     content: `Odeme basarili! Siparis #${payment.order.number} icin ${payment.payable.toFixed(2)} TL odeme alindi.`,
                  })),
               })
            }
         } catch (notifyErr: any) {
            console.error('[PAYMENT_CALLBACK_NOTIFY]', notifyErr)
            logError({
               message: notifyErr?.message || '[PAYMENT_CALLBACK_NOTIFY] Notification failed',
               stack: notifyErr?.stack,
               severity: 'low',
               source: 'payment',
               statusCode: 500,
               ...extractRequestContext(req),
            })
         }

         return NextResponse.json({ status: 'OK', message: 'Payment confirmed' })
      } else {
         // Payment failed — restore stock for order items
         await prisma.$transaction(async (tx) => {
            await tx.payment.update({
               where: { id: payment.id },
               data: {
                  status: 'Failed',
                  isSuccessful: false,
                  cardPan: cardPan ?? undefined,
               },
            })

            // Restore product stock since payment failed
            for (const item of payment.order.orderItems) {
               await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.count } },
               })
            }

            // Mark order as failed
            await tx.order.update({
               where: { id: payment.orderId },
               data: { status: 'Cancelled' },
            })
         })

         return NextResponse.json({ status: 'OK', message: 'Payment failure recorded, stock restored' })
      }
   } catch (error: any) {
      console.error('[PAYMENT_CALLBACK]', error)
      logError({
         message: error?.message || '[PAYMENT_CALLBACK] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'payment',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json(
         { error: 'Callback processing failed' },
         { status: 500 }
      )
   }
}

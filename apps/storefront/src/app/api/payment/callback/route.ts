import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

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
         include: { order: true },
      })

      if (!payment) {
         console.error('[PAYMENT_CALLBACK] Payment not found:', refId)
         return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Idempotency: already processed
      if (payment.isSuccessful) {
         return NextResponse.json({ status: 'OK', message: 'Already processed' })
      }

      // Signature validation - REQUIRED when secret key is configured
      const secretKey = process.env.PAYMENT_SECRET_KEY
      if (secretKey) {
         if (!hash) {
            console.error('[PAYMENT_CALLBACK] Missing signature for refId:', refId)
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
         }

         const merchantId = process.env.PAYMENT_MERCHANT_ID ?? ''
         const expectedHashStr = `${merchantId}${refId}${totalAmount ?? payment.payable.toFixed(2)}`
         const expectedHash = crypto
            .createHmac('sha256', secretKey)
            .update(expectedHashStr)
            .digest('base64')

         if (hash !== expectedHash) {
            console.error('[PAYMENT_CALLBACK] Invalid signature for refId:', refId)

            await prisma.payment.update({
               where: { id: payment.id },
               data: { status: 'Denied' },
            })

            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
         }
      } else if (process.env.NODE_ENV === 'production') {
         console.error('[PAYMENT_CALLBACK] PAYMENT_SECRET_KEY not configured in production')
         return NextResponse.json({ error: 'Payment validation not configured' }, { status: 500 })
      }

      // Process payment result
      const isSuccess = status === 'success' || status === 'completed' || status === 'paid'

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
                  fee: totalAmount ? parseFloat(totalAmount) : undefined,
               },
            })
            await tx.order.update({
               where: { id: payment.orderId },
               data: { isPaid: true },
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
                     content: `Odeme basarili! Siparis #${payment.order.number} icin ${payment.payable.toFixed(2)} TL odeme alindi. Ref: ${refId}`,
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
         await prisma.payment.update({
            where: { id: payment.id },
            data: {
               status: 'Failed',
               isSuccessful: false,
               cardPan: cardPan ?? undefined,
            },
         })

         return NextResponse.json({ status: 'OK', message: 'Payment failure recorded' })
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

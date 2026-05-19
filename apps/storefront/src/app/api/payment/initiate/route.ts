import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

export async function POST(req: NextRequest) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      let body: any
      try {
         body = await req.json()
      } catch {
         return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
      }
      const { orderId, csrfToken } = body
      if (!orderId) {
         return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
      }

      // CSRF validation (mandatory for authenticated mutations)
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return NextResponse.json({ error: 'Geçersiz istek. Sayfayı yenileyip tekrar deneyin.' }, { status: 403 })
      }

      // Verify order exists and belongs to this user
      const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: { orderItems: { include: { product: true } } },
      })

      if (!order) {
         return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
      }

      if (order.userId !== userId) {
         return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }

      if (order.isPaid) {
         return NextResponse.json({ error: 'Sipariş zaten ödenmiş' }, { status: 400 })
      }

      // Validate order is in a payable state
      const payableStatuses = ['OnayBekleniyor', 'Processing']
      if (!payableStatuses.includes(order.status)) {
         return NextResponse.json({ error: 'Bu sipariş için ödeme yapılamaz' }, { status: 400 })
      }

      // Prevent zero-amount payments
      if (order.payable <= 0) {
         return NextResponse.json({ error: 'Geçersiz ödeme tutarı' }, { status: 400 })
      }

      // Check for payment provider configuration
      const apiKey = process.env.PAYMENT_API_KEY
      const secretKey = process.env.PAYMENT_SECRET_KEY
      const merchantId = process.env.PAYMENT_MERCHANT_ID
      const providerUrl = process.env.PAYMENT_API_URL
      const hasPaymentKeys = apiKey && secretKey && merchantId && providerUrl

      // Generate a unique reference ID for this payment
      const refId = `XF-${order.number}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`

      // Find or create a payment provider
      let provider = await prisma.paymentProvider.findFirst({
         where: { isActive: true },
      })

      if (!provider) {
         // Create a default provider entry
         provider = await prisma.paymentProvider.upsert({
            where: { title: 'Sanal POS' },
            update: {},
            create: {
               title: 'Sanal POS',
               description: 'Banka Sanal POS Entegrasyonu',
               isActive: true,
            },
         })
      }

      // Create payment record
      const payment = await prisma.payment.create({
         data: {
            status: 'Processing',
            refId,
            payable: order.payable,
            isSuccessful: false,
            provider: { connect: { id: provider.id } },
            user: { connect: { id: userId } },
            order: { connect: { id: orderId } },
         },
      })

      if (hasPaymentKeys) {
         // ── LIVE PAYMENT MODE ──────────────────────────────
         // This is where you integrate with the actual bank virtual POS API.
         // Common Turkish bank POS providers: iyzico, PayTR, Param, Sipay, Paratika
         //
         // The typical flow is:
         // 1. POST to the bank API with order details + merchant credentials
         // 2. Bank returns a payment form URL or 3D Secure redirect URL
         // 3. User is redirected to that URL to complete payment
         // 4. Bank POSTs callback to /api/payment/callback
         // 5. User is redirected to /api/payment/success

         try {
            // Example integration structure (replace with actual provider SDK):
            const paymentPayload = {
               merchant_id: merchantId,
               amount: order.payable.toFixed(2),
               currency: 'TRY',
               order_id: refId,
               description: `xForgea3D Sipariş #${order.number}`,
               callback_url: `${SITE_URL}/api/payment/callback`,
               success_url: `${SITE_URL}/api/payment/success?refId=${refId}`,
               fail_url: `${SITE_URL}/api/payment/success?refId=${refId}&status=fail`,
               buyer_name: userId,
               items: order.orderItems.map((item) => ({
                  name: item.product.title,
                  quantity: item.count,
                  price: (item.price - item.discount).toFixed(2),
               })),
            }

            // Calculate hash/token for the provider
            const hashStr = `${merchantId}${refId}${order.payable.toFixed(2)}${secretKey}`
            const token = crypto.createHmac('sha256', secretKey).update(hashStr).digest('base64')

            // POST to payment provider API (replace URL with actual endpoint)
            const providerRes = await fetch(providerUrl, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                  'X-Merchant-Token': token,
               },
               body: JSON.stringify(paymentPayload),
            })

            if (!providerRes.ok) {
               const errText = await providerRes.text()
               console.error('[PAYMENT_PROVIDER_ERROR]', errText)

               await prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: 'Failed' },
               })

               return NextResponse.json(
                  { error: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.' },
                  { status: 502 }
               )
            }

            const providerData = await providerRes.json()
            const paymentUrl = providerData.payment_url ?? providerData.redirect_url ?? providerData.url

            return NextResponse.json({
               paymentUrl,
               paymentId: payment.id,
               refId,
               mode: 'live',
            })
         } catch (providerError) {
            console.error('[PAYMENT_INIT_PROVIDER]', providerError)

            await prisma.payment.update({
               where: { id: payment.id },
               data: { status: 'Failed' },
            })

            return NextResponse.json(
               { error: 'Ödeme servisi ile bağlantı kurulamadı' },
               { status: 502 }
            )
         }
      } else {
         if (process.env.NODE_ENV === 'production') {
            await prisma.payment.update({
               where: { id: payment.id },
               data: { status: 'Failed' },
            })

            return NextResponse.json(
               {
                  error: 'Online ödeme altyapısı hazırlanıyor. Yapı Kredi Sanal POS entegrasyonu tamamlandığında ödeme alınabilecektir.',
               },
               { status: 503 }
            )
         }

         // ── LOCAL MOCK/TEST MODE ───────────────────────────
         // No payment keys configured in development — return a mock payment URL.
         const mockPaymentUrl = `${SITE_URL}/api/payment/success?refId=${refId}&mock=true`

         return NextResponse.json({
            paymentUrl: mockPaymentUrl,
            paymentId: payment.id,
            refId,
            mode: 'test',
            message: 'Ödeme altyapısı test modunda. Gerçek ödeme işlemi yapılmayacak.',
         })
      }
   } catch (error: any) {
      console.error('[PAYMENT_INITIATE]', error)
      logError({
         message: error?.message || '[PAYMENT_INITIATE] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'payment',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json(
         { error: 'Ödeme başlatılırken bir hata oluştu' },
         { status: 500 }
      )
   }
}

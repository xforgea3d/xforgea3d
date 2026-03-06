import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

export async function POST(req: NextRequest) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { orderId, csrfToken } = await req.json()
      if (!orderId) {
         return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
      }

      // CSRF validation
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return NextResponse.json({ error: 'Gecersiz istek. Sayfayi yenileyip tekrar deneyin.' }, { status: 403 })
      }

      // Verify order exists and belongs to this user
      const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: { orderItems: { include: { product: true } } },
      })

      if (!order) {
         return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 })
      }

      if (order.userId !== userId) {
         return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 403 })
      }

      if (order.isPaid) {
         return NextResponse.json({ error: 'Siparis zaten odenmis' }, { status: 400 })
      }

      // Check for payment provider configuration
      const apiKey = process.env.PAYMENT_API_KEY
      const secretKey = process.env.PAYMENT_SECRET_KEY
      const merchantId = process.env.PAYMENT_MERCHANT_ID
      const hasPaymentKeys = apiKey && secretKey && merchantId

      // Generate a unique reference ID for this payment
      const refId = `XF-${order.number}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

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
               description: `xForgea3D Siparis #${order.number}`,
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
            const providerUrl = process.env.PAYMENT_API_URL ?? 'https://api.payment-provider.com/v1/payment/init'
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
                  { error: 'Odeme baslatilamadi. Lutfen tekrar deneyin.' },
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
               { error: 'Odeme servisi ile baglanti kurulamadi' },
               { status: 502 }
            )
         }
      } else {
         // ── MOCK/TEST MODE ─────────────────────────────────
         // No payment keys configured — return a mock payment URL
         const mockPaymentUrl = `${SITE_URL}/api/payment/success?refId=${refId}&mock=true`

         return NextResponse.json({
            paymentUrl: mockPaymentUrl,
            paymentId: payment.id,
            refId,
            mode: 'test',
            message: 'Odeme altyapisi test modunda. Gercek odeme islemi yapilmayacak.',
         })
      }
   } catch (error) {
      console.error('[PAYMENT_INITIATE]', error)
      return NextResponse.json(
         { error: 'Odeme baslatilirken bir hata olustu' },
         { status: 500 }
      )
   }
}

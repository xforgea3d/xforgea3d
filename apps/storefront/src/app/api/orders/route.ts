import config from '@/config/site'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import Mail from '@/emails/order_notification_owner'
import prisma from '@/lib/prisma'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const orders = await prisma.order.findMany({
         where: { userId },
         select: {
            id: true,
            number: true,
            status: true,
            total: true,
            payable: true,
            isPaid: true,
            createdAt: true,
            _count: { select: { orderItems: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 100,
      })

      return NextResponse.json(orders)
   } catch (error: any) {
      console.error('[ORDERS_GET]', error)
      logError({
         message: error?.message || '[ORDERS_GET] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { addressId, discountCode, csrfToken } = await req.json()

      if (csrfToken && !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!addressId) return new NextResponse('addressId is required', { status: 400 })

      // Verify address belongs to this user
      const address = await prisma.address.findFirst({
         where: { id: addressId, userId },
      })
      if (!address) {
         return new NextResponse('Adres bulunamadi veya size ait degil', { status: 403 })
      }

      // Use transaction for atomic order creation
      const order = await prisma.$transaction(async (tx) => {
         // Validate discount code inside transaction
         if (discountCode) {
            const now = new Date()
            const dc = await tx.discountCode.findUnique({
               where: { code: discountCode },
            })
            if (!dc || dc.stock < 1 || dc.endDate < now || dc.startDate > now) {
               throw new Error('INVALID_DISCOUNT')
            }
         }

         const cart = await tx.cart.findUniqueOrThrow({
            where: { userId },
            include: { items: { include: { product: true } } },
         })

         if (!cart.items.length) {
            throw new Error('EMPTY_CART')
         }

         // Validate stock availability
         for (const item of cart.items) {
            if (!item.product.isAvailable) {
               throw new Error(`UNAVAILABLE:${item.product.title}`)
            }
            if (item.product.stock < item.count) {
               throw new Error(`OUT_OF_STOCK:${item.product.title}`)
            }
         }

         const { tax, total, discount, payable } = calculateCosts({ cart })

         const created = await tx.order.create({
            data: {
               user: { connect: { id: userId } },
               status: 'OnayBekleniyor',
               total,
               tax,
               payable,
               discount,
               shipping: 0,
               address: { connect: { id: addressId } },
               ...(discountCode && {
                  discountCode: { connect: { code: discountCode } },
               }),
               orderItems: {
                  create: cart.items.map((item) => ({
                     count: item.count,
                     price: item.product.price,
                     discount: item.product.discount,
                     product: { connect: { id: item.productId } },
                  })),
               },
            },
            include: { orderItems: true, address: true },
         })

         // Decrement discount code stock atomically
         if (discountCode) {
            await tx.discountCode.update({
               where: { code: discountCode },
               data: { stock: { decrement: 1 } },
            })
         }

         // Decrement product stock
         for (const item of cart.items) {
            await tx.product.update({
               where: { id: item.productId },
               data: { stock: { decrement: item.count } },
            })
         }

         return created
      })

      // Notify admin profiles (best-effort, outside transaction)
      try {
         const admins = await prisma.profile.findMany({
            where: { role: 'admin' },
         })

         const payable = order.payable

         if (admins.length) {
            await prisma.notification.createMany({
               data: admins.map((admin) => ({
                  userId: admin.id,
                  content: `Siparis #${order.number} olusturuldu - ${payable.toFixed(2)} TL.`,
               })),
            })

            for (const admin of admins) {
               await sendMail({
                  name: config.name,
                  to: admin.email,
                  subject: 'Yeni siparis alindi.',
                  html: await render(
                     Mail({
                        id: order.id,
                        payable: payable.toFixed(2),
                        orderNum: order.number.toString(),
                     })
                  ),
               }).catch((e) => console.error('[ADMIN_MAIL]', e))
            }
         }
      } catch (notifyError: any) {
         console.error('[ORDER_NOTIFY]', notifyError)
         logError({
            message: notifyError?.message || '[ORDER_NOTIFY] Notification failed',
            stack: notifyError?.stack,
            severity: 'low',
            source: 'backend',
            statusCode: 500,
            ...extractRequestContext(req),
         })
      }

      return NextResponse.json(order)
   } catch (error: any) {
      if (error?.message === 'INVALID_DISCOUNT') {
         return new NextResponse('Gecersiz veya suresi dolmus indirim kodu', { status: 400 })
      }
      if (error?.message === 'EMPTY_CART') {
         return new NextResponse('Sepet bos', { status: 400 })
      }
      if (error?.message?.startsWith('UNAVAILABLE:')) {
         return new NextResponse(`${error.message.split(':')[1]} su an mevcut degil`, { status: 400 })
      }
      if (error?.message?.startsWith('OUT_OF_STOCK:')) {
         return new NextResponse(`${error.message.split(':')[1]} icin yeterli stok yok`, { status: 400 })
      }
      console.error('[ORDER_POST]', error)
      logError({
         message: error?.message || '[ORDER_POST] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}

function calculateCosts({ cart }: { cart: { items: Array<{ count: number; product: { price: number; discount: number } }> } }) {
   let total = 0
   let discount = 0

   for (const item of cart.items) {
      total += item.count * item.product.price
      discount += item.count * item.product.discount
   }

   const afterDiscount = total - discount
   const tax = afterDiscount * 0.09
   const payable = afterDiscount + tax

   return {
      total: parseFloat(total.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      afterDiscount: parseFloat(afterDiscount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      payable: parseFloat(payable.toFixed(2)),
   }
}

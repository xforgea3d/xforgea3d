import config from '@/config/site'
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
      })

      return NextResponse.json(orders)
   } catch (error) {
      console.error('[ORDERS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { addressId, discountCode } = await req.json()

      if (!addressId) return new NextResponse('addressId is required', { status: 400 })

      // Validate discount code if provided
      if (discountCode) {
         const now = new Date()
         const dc = await prisma.discountCode.findUnique({
            where: { code: discountCode },
         })
         if (!dc || dc.stock < 1 || dc.endDate < now || dc.startDate > now) {
            return new NextResponse('Geçersiz veya süresi dolmuş indirim kodu', { status: 400 })
         }
      }

      const cart = await prisma.cart.findUniqueOrThrow({
         where: { userId },
         include: { items: { include: { product: true } } },
      })

      if (!cart.items.length) {
         return new NextResponse('Sepet boş', { status: 400 })
      }

      const { tax, total, discount, payable } = calculateCosts({ cart })

      const order = await prisma.order.create({
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

      // Decrement discount code stock if used
      if (discountCode) {
         await prisma.discountCode.update({
            where: { code: discountCode },
            data: { stock: { decrement: 1 } },
         })
      }

      // Notify admin profiles (role === 'admin')
      try {
         const admins = await prisma.profile.findMany({
            where: { role: 'admin' },
         })

         if (admins.length) {
            await prisma.notification.createMany({
               data: admins.map((admin) => ({
                  userId: admin.id,
                  content: `Sipariş #${order.number} oluşturuldu — ${payable.toFixed(2)} TL.`,
               })),
            })

            for (const admin of admins) {
               await sendMail({
                  name: config.name,
                  to: admin.email,
                  subject: 'Yeni sipariş alındı.',
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
      } catch (notifyError) {
         // Don't fail the order if notifications fail
         console.error('[ORDER_NOTIFY]', notifyError)
      }

      return NextResponse.json(order)
   } catch (error) {
      console.error('[ORDER_POST]', error)
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

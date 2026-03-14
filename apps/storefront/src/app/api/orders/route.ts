import config from '@/config/site'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import Mail from '@/emails/order_notification_owner'
import prisma from '@/lib/prisma'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import { revalidatePath } from 'next/cache'
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

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
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

      // Use transaction with serializable isolation for atomic order creation
      const order = await prisma.$transaction(async (tx) => {
         // Validate discount code inside transaction
         let discountCodeData: { percent: number; maxDiscountAmount: number | null } | null = null
         if (discountCode) {
            const now = new Date()
            const dc = await tx.discountCode.findUnique({
               where: { code: discountCode },
            })
            if (!dc || dc.stock < 1 || dc.endDate < now || dc.startDate > now) {
               throw new Error('INVALID_DISCOUNT')
            }
            discountCodeData = { percent: dc.percent, maxDiscountAmount: dc.maxDiscountAmount }
         }

         const cart = await tx.cart.findUniqueOrThrow({
            where: { userId },
            include: { items: { include: { product: true } } },
         })

         if (!cart.items.length) {
            throw new Error('EMPTY_CART')
         }

         // Lock product rows to prevent race conditions (SELECT ... FOR UPDATE)
         const productIds = cart.items.map((item) => item.productId)
         await tx.$queryRawUnsafe(
            `SELECT id FROM "Product" WHERE id IN (${productIds.map((_, i) => `$${i + 1}`).join(',')}) FOR UPDATE`,
            ...productIds
         )

         // Re-fetch products after acquiring lock to get latest stock values
         const lockedProducts = await tx.product.findMany({
            where: { id: { in: productIds } },
         })
         const productMap = new Map(lockedProducts.map((p) => [p.id, p]))

         // Validate stock availability against locked data
         for (const item of cart.items) {
            const product = productMap.get(item.productId)
            if (!product || !product.isAvailable) {
               throw new Error(`UNAVAILABLE:${item.product.title}`)
            }
            if (product.stock < item.count) {
               throw new Error(`OUT_OF_STOCK:${item.product.title}`)
            }
         }

         // Fetch tax rate from SiteSettings
         const siteSettings = await tx.siteSettings.findUnique({
            where: { id: 1 },
            select: { tax_rate: true },
         })
         const taxRate = siteSettings?.tax_rate ?? 20

         const { tax, total, discount, payable } = calculateCosts({ cart, discountCodeData, taxRate })

         // Prevent zero-amount orders
         if (payable <= 0) {
            throw new Error('INVALID_PAYABLE')
         }

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

         // Decrement discount code stock atomically (prevent negative stock)
         if (discountCode) {
            const updated = await tx.discountCode.updateMany({
               where: { code: discountCode, stock: { gt: 0 } },
               data: { stock: { decrement: 1 } },
            })
            if (updated.count === 0) {
               throw new Error('INVALID_DISCOUNT')
            }
         }

         // Decrement product stock
         for (const item of cart.items) {
            await tx.product.update({
               where: { id: item.productId },
               data: { stock: { decrement: item.count } },
            })
         }

         // Clear the cart after successful order creation
         await tx.cartItem.deleteMany({
            where: { cartId: cart.userId },
         })

         return created
      })

      // Check for low stock after order creation (best-effort)
      try {
         const orderProductIds = order.orderItems.map((item) => item.productId)
         const updatedProducts = await prisma.product.findMany({
            where: { id: { in: orderProductIds } },
            select: { id: true, title: true, stock: true },
         })

         const lowStockProducts = updatedProducts.filter((p) => p.stock < 5)
         if (lowStockProducts.length > 0) {
            const admins = await prisma.profile.findMany({
               where: { role: 'admin' },
               select: { id: true },
            })
            if (admins.length > 0) {
               const notifications = lowStockProducts.flatMap((product) =>
                  admins.map((admin) => ({
                     userId: admin.id,
                     content: `\u26a0\ufe0f D\u00fc\u015f\u00fck stok: ${product.title} - Kalan: ${product.stock} adet`,
                  }))
               )
               await prisma.notification.createMany({ data: notifications })
            }
         }
      } catch (stockCheckError) {
         console.error('[LOW_STOCK_CHECK]', stockCheckError)
      }

      // Revalidate product pages so stock changes are reflected immediately
      try {
         revalidatePath('/')
         revalidatePath('/products')
         for (const item of order.orderItems) {
            revalidatePath(`/products/${item.productId}`)
         }
      } catch (revalError) {
         console.error('[ORDER_REVALIDATE]', revalError)
      }

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
      if (error?.message === 'INVALID_PAYABLE') {
         return new NextResponse('Siparis tutari gecersiz. Indirim kodunu kontrol edin.', { status: 400 })
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

function calculateCosts({
   cart,
   discountCodeData,
   taxRate = 20,
}: {
   cart: { items: Array<{ count: number; product: { price: number; discount: number } }> }
   discountCodeData?: { percent: number; maxDiscountAmount: number | null } | null
   taxRate?: number
}) {
   let total = 0
   let discount = 0

   for (const item of cart.items) {
      total += item.count * item.product.price
      discount += item.count * item.product.discount
   }

   // Apply discount code on top of per-product discounts
   if (discountCodeData) {
      const afterProductDiscount = total - discount
      let codeDiscount = afterProductDiscount * (discountCodeData.percent / 100)
      if (discountCodeData.maxDiscountAmount && codeDiscount > discountCodeData.maxDiscountAmount) {
         codeDiscount = discountCodeData.maxDiscountAmount
      }
      discount += codeDiscount
   }

   const afterDiscount = Math.max(total - discount, 0)
   const tax = afterDiscount * (taxRate / 100)
   const payable = afterDiscount + tax

   return {
      total: parseFloat(total.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      afterDiscount: parseFloat(afterDiscount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      payable: parseFloat(payable.toFixed(2)),
   }
}

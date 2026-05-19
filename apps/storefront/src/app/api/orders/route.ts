import config from '@/config/site'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import Mail from '@/emails/order_notification_owner'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

function generateOrderCode(orderNumber: number): string {
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
   let rand = ''
   for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return `XF-${orderNumber}-${rand}`
}

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const orders = await prisma.order.findMany({
         where: { userId },
         select: {
            id: true,
            number: true,
            orderCode: true,
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

      let body: any
      try {
         body = await req.json()
      } catch {
         return new NextResponse('Geçersiz istek gövdesi', { status: 400 })
      }
      const { addressId, discountCode, csrfToken } = body

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Geçersiz istek. Sayfayı yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!addressId) return new NextResponse('addressId is required', { status: 400 })

      const hasPaymentProvider =
         Boolean(process.env.PAYMENT_API_KEY) &&
         Boolean(process.env.PAYMENT_SECRET_KEY) &&
         Boolean(process.env.PAYMENT_MERCHANT_ID) &&
         Boolean(process.env.PAYMENT_API_URL)

      if (process.env.NODE_ENV === 'production' && !hasPaymentProvider) {
         return new NextResponse(
            'Online ödeme altyapısı hazırlanıyor. Yapı Kredi Sanal POS entegrasyonu tamamlandığında sipariş alınabilecektir.',
            { status: 503 }
         )
      }

      // Verify address belongs to this user
      const address = await prisma.address.findFirst({
         where: { id: addressId, userId },
      })
      if (!address) {
         return new NextResponse('Adres bulunamadı veya size ait değil', { status: 403 })
      }

      // Use transaction with serializable isolation for atomic order creation
      const order = await prisma.$transaction(
         async (tx) => {
            // Note: Serializable isolation level prevents phantom reads.
            // Stock checks are atomic — no concurrent order can bypass stock validation.
            // If this transaction rolls back, the entire order is cancelled atomically.

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

         if (productIds.length === 0) {
            throw new Error('EMPTY_CART')
         }

         // Lock product rows with safe parameterized query
         await tx.$queryRaw`SELECT id FROM "Product" WHERE id IN (${Prisma.join(productIds)}) FOR UPDATE`

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
         let taxRate = siteSettings?.tax_rate ?? 20
         if (taxRate < 0 || taxRate > 100) taxRate = 20 // safety clamp

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
                  create: cart.items.map((item) => {
                     const product = productMap.get(item.productId)!
                     const now = new Date()
                     const hasFlashSale = product.flashSalePrice != null &&
                        product.flashSaleEndDate != null &&
                        product.flashSalePrice > 0 &&
                        new Date(product.flashSaleEndDate) > now
                     const effectivePrice = hasFlashSale ? product.flashSalePrice! : product.price
                     const effectiveDiscount = hasFlashSale ? 0 : product.discount
                     return {
                        count: item.count,
                        price: effectivePrice,
                        discount: effectiveDiscount,
                        product: { connect: { id: item.productId } },
                     }
                  }),
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

         // Decrement product stock atomically (prevent negative stock)
         for (const item of cart.items) {
            const stockUpdate = await tx.product.updateMany({
               where: { id: item.productId, stock: { gte: item.count } },
               data: { stock: { decrement: item.count } },
            })
            if (stockUpdate.count === 0) {
               throw new Error(`OUT_OF_STOCK:${productMap.get(item.productId)?.title || 'Ürün'}`)
            }
         }

         // Clear the cart after successful order creation
         await tx.cartItem.deleteMany({
            where: { cartId: cart.userId },
         })

         // Pre-check low stock inside transaction (before committing)
         const orderProductIds = created.orderItems.map((item) => item.productId)
         const productsForNotif = await tx.product.findMany({
            where: { id: { in: orderProductIds } },
            select: { id: true, title: true, stock: true },
         })
         const lowStockProducts = productsForNotif.filter((p) => p.stock < 5)

         return { order: created, lowStockProducts }
         },
         {
            isolationLevel: 'Serializable',
            maxWait: 5000,
            timeout: 30000,
         }
      )

      // Extract order from transaction result
      const actualOrder = order.order

      // Generate unique order code
      const orderCode = generateOrderCode(actualOrder.number)
      await prisma.order.update({
         where: { id: actualOrder.id },
         data: { orderCode },
      })
      ;(actualOrder as any).orderCode = orderCode

      // Get low stock info (re-check outside transaction for latest state)
      let lowStockProductsForNotif: { id: string; title: string; stock: number }[] = []
      try {
         const orderProductIds = actualOrder.orderItems.map((item) => item.productId)
         const updatedProducts = await prisma.product.findMany({
            where: { id: { in: orderProductIds } },
            select: { id: true, title: true, stock: true },
         })

         lowStockProductsForNotif = updatedProducts.filter((p) => p.stock < 5)
      } catch (stockCheckError) {
         console.error('[LOW_STOCK_CHECK]', stockCheckError)
      }

      // Revalidate product pages so stock changes are reflected immediately
      try {
         revalidatePath('/')
         revalidatePath('/products')
         for (const item of actualOrder.orderItems) {
            revalidatePath(`/products/${item.productId}`)
         }
      } catch (revalError) {
         console.error('[ORDER_REVALIDATE]', revalError)
      }

      // Notify admin profiles (best-effort, outside transaction)
      try {
         // Single admin query (reuse)
         const admins = await prisma.profile.findMany({
            where: { role: 'admin' },
            select: { id: true, email: true },
         })

         const payable = actualOrder.payable

         if (admins.length) {
            // Create low-stock notifications
            if (lowStockProductsForNotif.length > 0) {
               const lowStockNotifications = lowStockProductsForNotif.flatMap((product) =>
                  admins.map((admin) => ({
                     userId: admin.id,
                     content: `⚠️ Düşük stok: ${product.title} - Kalan: ${product.stock} adet`,
                  }))
               )
               await Promise.allSettled(
                  lowStockNotifications.map((notif) =>
                     prisma.notification.create({ data: notif }).catch((e) => {
                        console.error('[LOW_STOCK_NOTIF_FAILED]', e)
                        logError({
                           message: 'Low-stock notification creation failed',
                           stack: e?.stack,
                           severity: 'low',
                           source: 'backend',
                        })
                     })
                  )
               )
            }

            // Create new-order notifications
            await prisma.notification.createMany({
               data: admins.map((admin) => ({
                  userId: admin.id,
                  content: `Sipariş #${actualOrder.number} oluşturuldu - ${payable.toFixed(2)} TL.`,
               })),
            })

            // Send emails
            for (const admin of admins) {
               await sendMail({
                  name: config.name,
                  to: admin.email,
                  subject: 'Yeni sipariş alındı.',
                  html: await render(
                     Mail({
                        id: actualOrder.id,
                        payable: payable.toFixed(2),
                        orderNum: actualOrder.number.toString(),
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

      return NextResponse.json(actualOrder)
   } catch (error: any) {
      if (error?.message === 'INVALID_DISCOUNT') {
         return new NextResponse('Geçersiz veya süresi dolmuş indirim kodu', { status: 400 })
      }
      if (error?.message === 'EMPTY_CART') {
         return new NextResponse('Sepet boş', { status: 400 })
      }
      if (error?.message?.startsWith('UNAVAILABLE:')) {
         return new NextResponse(`${error.message.split(':')[1]} şu an mevcut değil`, { status: 400 })
      }
      if (error?.message?.startsWith('OUT_OF_STOCK:')) {
         return new NextResponse(`${error.message.split(':')[1]} için yeterli stok yok`, { status: 400 })
      }
      if (error?.message === 'INVALID_PAYABLE') {
         return new NextResponse('Sipariş tutarı geçersiz. İndirim kodunu kontrol edin.', { status: 400 })
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
   cart: { items: Array<{ count: number; product: { price: number; discount: number; flashSalePrice?: number | null; flashSaleEndDate?: Date | null } }> }
   discountCodeData?: { percent: number; maxDiscountAmount: number | null } | null
   taxRate?: number
}) {
   let total = 0
   let discount = 0
   const now = new Date()

   for (const item of cart.items) {
      const hasFlashSale = item.product.flashSalePrice != null &&
         item.product.flashSaleEndDate != null &&
         item.product.flashSalePrice > 0 &&
         new Date(item.product.flashSaleEndDate) > now
      if (hasFlashSale) {
         total += item.count * item.product.flashSalePrice!
         // No per-product discount when flash sale is active
      } else {
         total += item.count * item.product.price
         discount += item.count * item.product.discount
      }
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

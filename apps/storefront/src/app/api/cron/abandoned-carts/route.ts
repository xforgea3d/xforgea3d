import config from '@/config/site'
import AbandonedCartEmail from '@/emails/abandoned_cart_reminder'
import prisma from '@/lib/prisma'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   // Verify cron secret
   const authHeader = req.headers.get('authorization')
   const cronSecret = process.env.CRON_SECRET

   if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 })
   }

   try {
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

      // Find carts with items where the user has NOT created an order in the last 24 hours
      const abandonedCarts = await prisma.cart.findMany({
         where: {
            items: {
               some: {}, // Cart must have at least one item
            },
            user: {
               orders: {
                  none: {
                     createdAt: { gte: twentyFourHoursAgo },
                  },
               },
               // Only send if lastCartReminder is null or older than 72 hours
               OR: [
                  { lastCartReminder: null },
                  { lastCartReminder: { lt: seventyTwoHoursAgo } },
               ],
            },
         },
         include: {
            items: {
               include: {
                  product: {
                     select: {
                        title: true,
                        images: true,
                        price: true,
                     },
                  },
               },
            },
            user: {
               select: {
                  id: true,
                  email: true,
                  name: true,
               },
            },
         },
      })

      let sentCount = 0
      const cartUrl = `${process.env.NEXT_PUBLIC_URL || config.url}/cart`

      for (const cart of abandonedCarts) {
         try {
            const products = cart.items.map((item) => ({
               title: item.product.title,
               image: item.product.images?.[0] || undefined,
               price: item.product.price,
            }))

            // Send reminder email
            await sendMail({
               name: config.name,
               to: cart.user.email,
               subject: 'Sepetinizde ürünler sizi bekliyor! 🛒',
               html: await render(
                  AbandonedCartEmail({
                     userName: cart.user.name || undefined,
                     products,
                     cartUrl,
                  })
               ),
            })

            // Update lastCartReminder timestamp
            await prisma.profile.update({
               where: { id: cart.user.id },
               data: { lastCartReminder: now },
            })

            // Create in-app notification
            await prisma.notification.create({
               data: {
                  userId: cart.user.id,
                  content: 'Sepetinizde ürünler bekliyor! Hemen tamamlayın.',
               },
            })

            sentCount++
         } catch (err) {
            console.error(`[ABANDONED_CART] Failed for user ${cart.user.id}:`, err)
         }
      }

      return NextResponse.json({
         success: true,
         processed: abandonedCarts.length,
         sent: sentCount,
      })
   } catch (error) {
      console.error('[ABANDONED_CARTS_CRON]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

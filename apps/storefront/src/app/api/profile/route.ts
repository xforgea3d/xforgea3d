import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      let profile = await prisma.profile.findUnique({
         where: { id: userId },
         include: {
            cart: {
               include: {
                  items: { include: { product: true } },
               },
            },
            addresses: true,
            wishlist: true,
         },
      })

      if (!profile) {
         const supabase = createClient()
         const { data: { user } } = await supabase.auth.getUser()

         if (!user) return new NextResponse('Unauthorized', { status: 401 })

         try {
            profile = await prisma.profile.create({
               data: {
                  id: userId,
                  email: user.email || '',
                  name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                  avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                  role: 'customer',
               },
               include: {
                  cart: {
                     include: {
                        items: { include: { product: true } },
                     },
                  },
                  addresses: true,
                  wishlist: true,
               },
            })
         } catch (createError: any) {
            // Handle race condition: profile might have been created between findUnique and create
            if (createError?.code === 'P2002') {
               profile = await prisma.profile.findUnique({
                  where: { id: userId },
                  include: {
                     cart: {
                        include: {
                           items: { include: { product: true } },
                        },
                     },
                     addresses: true,
                     wishlist: true,
                  },
               })
               if (!profile) throw createError
            } else {
               throw createError
            }
         }
      }

      // Backfill name/avatar for existing profiles created before OAuth data capture
      if (profile && !profile.name) {
         const supabaseForBackfill = createClient()
         const { data: { user: authUser } } = await supabaseForBackfill.auth.getUser()
         if (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name) {
            profile = await prisma.profile.update({
               where: { id: userId },
               data: {
                  name: authUser.user_metadata.full_name || authUser.user_metadata.name,
                  avatar: profile.avatar || authUser.user_metadata.avatar_url || authUser.user_metadata.picture || null,
               },
               include: {
                  cart: {
                     include: {
                        items: { include: { product: true } },
                     },
                  },
                  addresses: true,
                  wishlist: true,
               },
            })
         }
      }

      return NextResponse.json({
         phone: profile.phone,
         email: profile.email,
         name: profile.name,
         avatar: profile.avatar,
         addresses: profile.addresses,
         wishlist: profile.wishlist,
         cart: profile.cart,
      })
   } catch (error: any) {
      console.error('[PROFILE_GET]', error)
      logError({
         message: error?.message || '[PROFILE_GET] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { name, phone, avatar, kvkkAccepted, marketingConsent, smsConsent, csrfToken } = await req.json()

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
         return new NextResponse('Gecersiz isim', { status: 400 })
      }
      if (phone !== undefined && (typeof phone !== 'string' || phone.length > 20)) {
         return new NextResponse('Gecersiz telefon', { status: 400 })
      }
      if (avatar !== undefined && (typeof avatar !== 'string' || avatar.length > 500)) {
         return new NextResponse('Gecersiz avatar', { status: 400 })
      }

      const profile = await prisma.profile.update({
         where: { id: userId },
         data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(phone !== undefined && { phone: phone.trim() || null }),
            ...(avatar !== undefined && { avatar }),
            ...(kvkkAccepted !== undefined && {
               kvkkAccepted: !!kvkkAccepted,
               ...(kvkkAccepted && { kvkkAcceptedAt: new Date() }),
            }),
            ...(marketingConsent !== undefined && { marketingConsent: !!marketingConsent }),
            ...(smsConsent !== undefined && { smsConsent: !!smsConsent }),
         },
      })

      return NextResponse.json({
         phone: profile.phone,
         email: profile.email,
         name: profile.name,
         avatar: profile.avatar,
         kvkkAccepted: profile.kvkkAccepted,
         marketingConsent: profile.marketingConsent,
         smsConsent: profile.smsConsent,
      })
   } catch (error: any) {
      console.error('[PROFILE_PATCH]', error)
      logError({
         message: error?.message || '[PROFILE_PATCH] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}

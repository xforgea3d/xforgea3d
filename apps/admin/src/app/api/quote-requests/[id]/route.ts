import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidate-storefront'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const quoteRequest = await prisma.quoteRequest.findUnique({
         where: { id: params.id },
         include: {
            user: { select: { name: true, email: true, phone: true } },
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
            order: { select: { id: true, number: true, status: true, isPaid: true } },
         },
      })

      if (!quoteRequest) {
         return new NextResponse('Not found', { status: 404 })
      }

      return NextResponse.json(quoteRequest)
   } catch (error) {
      console.error('[ADMIN_QUOTE_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const body = await req.json()
      const { status, quotedPrice, adminNote } = body

      const quoteRequest = await prisma.quoteRequest.update({
         where: { id: params.id },
         data: {
            ...(status && { status }),
            ...(quotedPrice !== undefined && { quotedPrice }),
            ...(adminNote !== undefined && { adminNote }),
            ...(status === 'Priced' || status === 'Rejected'
               ? { respondedAt: new Date() }
               : {}),
         },
         include: {
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
      })

      // Send email notification
      try {
         const storefrontUrl = process.env.STOREFRONT_URL ||
            (process.env.NODE_ENV === 'development' ? 'http://localhost:7777' : '')

         if (status === 'Priced' && quotedPrice) {
            // Dynamic import to avoid bundling storefront email templates
            const QuotePriceMail = (await import('@/emails/quote_price_notification')).default
            const acceptUrl = `${storefrontUrl}/profile/quote-requests/${quoteRequest.id}`

            await sendMail({
               name: 'xForgea3D',
               to: quoteRequest.email,
               subject: `Parça talebiniz #${quoteRequest.number} fiyatlandırıldı`,
               html: await render(
                  QuotePriceMail({
                     quoteNumber: quoteRequest.number.toString(),
                     partDescription: quoteRequest.partDescription,
                     quotedPrice: quotedPrice.toFixed(2),
                     adminNote: adminNote || '',
                     acceptUrl,
                  })
               ),
            })
         } else if (status === 'Rejected') {
            const QuoteRejectedMail = (await import('@/emails/quote_rejected_notification')).default

            await sendMail({
               name: 'xForgea3D',
               to: quoteRequest.email,
               subject: `Parça talebiniz #${quoteRequest.number} hakkında bilgilendirme`,
               html: await render(
                  QuoteRejectedMail({
                     quoteNumber: quoteRequest.number.toString(),
                     partDescription: quoteRequest.partDescription,
                     adminNote: adminNote || '',
                  })
               ),
            })
         }
      } catch (mailError) {
         console.error('[QUOTE_MAIL]', mailError)
      }

      // Notify the user if they exist
      if (quoteRequest.userId) {
         try {
            const statusText = status === 'Priced'
               ? `fiyatlandırıldı: ${quotedPrice?.toFixed(2)} TL`
               : status === 'Rejected'
                  ? 'karşılanamamaktadır'
                  : `durumu güncellendi: ${status}`

            await prisma.notification.create({
               data: {
                  userId: quoteRequest.userId,
                  content: `Parça talebiniz #${quoteRequest.number} ${statusText}.`,
               },
            })
         } catch (notifyError) {
            console.error('[QUOTE_USER_NOTIFY]', notifyError)
         }
      }

      revalidatePath('/quote-requests')
      await revalidateStorefront(['/profile/quote-requests'])

      return NextResponse.json(quoteRequest)
   } catch (error) {
      console.error('[ADMIN_QUOTE_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

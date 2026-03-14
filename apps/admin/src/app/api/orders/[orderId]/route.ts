import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'

export async function PATCH(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        if (!params.orderId) {
            return new NextResponse('Order ID is required', { status: 400 })
        }

        const body = await req.json()
        const { status, shipping, payable, discount, isPaid, isCompleted, trackingNumber, shippingCompany } = body

        const order = await prisma.order.update({
            where: { id: params.orderId },
            data: {
                ...(status && { status }),
                ...(shipping !== undefined && { shipping }),
                ...(payable !== undefined && { payable }),
                ...(discount !== undefined && { discount }),
                ...(isPaid !== undefined && { isPaid }),
                ...(isCompleted !== undefined && { isCompleted }),
                ...(trackingNumber !== undefined && { trackingNumber: trackingNumber || null }),
                ...(shippingCompany !== undefined && { shippingCompany: shippingCompany || null }),
            },
        })

        // Send review reminder when order is delivered
        if (status === 'Delivered') {
            try {
                const fullOrder = await prisma.order.findUnique({
                    where: { id: params.orderId },
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        orderItems: {
                            include: {
                                product: {
                                    select: { id: true, title: true, images: true },
                                },
                            },
                        },
                    },
                })

                if (fullOrder?.user) {
                    const storefrontUrl = process.env.STOREFRONT_URL ||
                        (process.env.NODE_ENV === 'development' ? 'http://localhost:7777' : '')

                    // Create notification for user
                    await prisma.notification.create({
                        data: {
                            userId: fullOrder.user.id,
                            content: `Siparisiniz #${fullOrder.number} teslim edildi! Urunlerinizi degerlendirmeyi unutmayin ⭐`,
                        },
                    })

                    // Send review reminder email
                    const ReviewReminderMail = (await import('@/emails/review_reminder')).default
                    const products = fullOrder.orderItems.map((item) => ({
                        title: item.product.title,
                        image: item.product.images?.[0] || undefined,
                        productId: item.product.id,
                    }))

                    await sendMail({
                        name: 'xForgea3D',
                        to: fullOrder.user.email,
                        subject: `Siparisiniz #${fullOrder.number} teslim edildi! Degerlendirmenizi bekliyoruz`,
                        html: await render(
                            ReviewReminderMail({
                                userName: fullOrder.user.name || undefined,
                                orderNumber: fullOrder.number.toString(),
                                products,
                                storefrontUrl,
                            })
                        ),
                    })
                }
            } catch (reviewError) {
                console.error('[ORDER_REVIEW_REMINDER]', reviewError)
            }
        }

        revalidatePath('/orders')
        revalidatePath('/', 'layout')
        await revalidateAllStorefront()

        return NextResponse.json(order)
    } catch (error) {
        console.error('[ORDER_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

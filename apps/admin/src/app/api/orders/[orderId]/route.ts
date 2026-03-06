import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        if (!params.orderId) {
            return new NextResponse('Order ID is required', { status: 400 })
        }

        const body = await req.json()
        const { status, shipping, payable, discount, isPaid, isCompleted } = body

        const order = await prisma.order.update({
            where: { id: params.orderId },
            data: {
                ...(status && { status }),
                ...(shipping !== undefined && { shipping }),
                ...(payable !== undefined && { payable }),
                ...(discount !== undefined && { discount }),
                ...(isPaid !== undefined && { isPaid }),
                ...(isCompleted !== undefined && { isCompleted }),
            },
        })

        revalidatePath('/orders')
        await revalidateStorefront(['/account', '/'])

        return NextResponse.json(order)
    } catch (error) {
        console.error('[ORDER_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

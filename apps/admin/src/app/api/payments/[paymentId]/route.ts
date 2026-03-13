import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function PATCH(
    req: Request,
    { params }: { params: { paymentId: string } }
) {
    try {
        if (!params.paymentId) {
            return new NextResponse('Payment ID is required', { status: 400 })
        }

        const body = await req.json()
        const { status, payable, fee, isSuccessful } = body

        const payment = await prisma.payment.update({
            where: { id: params.paymentId },
            data: {
                ...(status && { status }),
                ...(payable !== undefined && { payable }),
                ...(fee !== undefined && { fee }),
                ...(isSuccessful !== undefined && { isSuccessful }),
            },
        })

        revalidatePath('/payments')
        revalidatePath('/', 'layout')

        try {
            const { revalidateAllStorefront } = await import('@/lib/revalidate-storefront')
            await revalidateAllStorefront()
        } catch (e) { }

        return NextResponse.json(payment)
    } catch (error) {
        console.error('[PAYMENT_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

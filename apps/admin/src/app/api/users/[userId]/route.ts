import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function PATCH(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        if (!params.userId) {
            return new NextResponse('User ID is required', { status: 400 })
        }

        const body = await req.json()
        const { name, phone } = body

        const user = await prisma.profile.update({
            where: { id: params.userId },
            data: {
                ...(name !== undefined && { name }),
                ...(phone !== undefined && { phone }),
            },
        })

        revalidatePath('/users')
        revalidatePath('/', 'layout')

        try {
            const { revalidateAllStorefront } = await import('@/lib/revalidate-storefront')
            await revalidateAllStorefront()
        } catch (e) { }

        return NextResponse.json(user)
    } catch (error) {
        console.error('[USER_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

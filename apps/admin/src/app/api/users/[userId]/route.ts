import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function PATCH(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        // Defense-in-depth: verify admin identity from middleware
        const adminId = req.headers.get('X-USER-ID')
        if (!adminId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (!params.userId) {
            return new NextResponse('User ID is required', { status: 400 })
        }

        const body = await req.json()
        const { name, phone } = body

        // Only allow updating name and phone — no role, email, or other sensitive fields
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
        } catch {
            console.warn('[USER_PATCH] Storefront revalidation failed')
        }

        return NextResponse.json(user)
    } catch (error: any) {
        console.error('[USER_PATCH]', error)
        if (error?.code === 'P2025') return new NextResponse('Not found', { status: 404 })
        return new NextResponse('Internal error', { status: 500 })
    }
}

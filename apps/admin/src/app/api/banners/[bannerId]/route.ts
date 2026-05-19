import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(
    req: Request,
    { params }: { params: { bannerId: string } }
) {
    try {
        if (!params.bannerId) {
            return new NextResponse('Banner id is required', { status: 400 })
        }

        const banner = await prisma.banner.findUnique({
            where: {
                id: params.bannerId,
            },
        })

        if (!banner) {
            return new NextResponse('Banner not found', { status: 404 })
        }

        return NextResponse.json(banner)
    } catch (error) {
        console.error('[BANNER_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { bannerId: string } }
) {
    try {
        const body = await req.json()

        const { label, image, link, altText, displayOrder, isActive, startDate, endDate } = body

        if (!label) {
            return new NextResponse('Label is required', { status: 400 })
        }

        if (!image) {
            return new NextResponse('Image is required', { status: 400 })
        }

        if (!params.bannerId) {
            return new NextResponse('Banner id is required', { status: 400 })
        }

        const banner = await prisma.banner.update({
            where: {
                id: params.bannerId,
            },
            data: {
                label,
                image,
                link: link || null,
                altText: altText || null,
                displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
                isActive: isActive !== false,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
        })

        revalidatePath('/', 'layout')
        await revalidateAllStorefront()

        return NextResponse.json(banner)
    } catch (error) {
        console.error('[BANNER_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { bannerId: string } }
) {
    try {
        if (!params.bannerId) {
            return new NextResponse('Banner id is required', { status: 400 })
        }

        const banner = await prisma.banner.delete({
            where: {
                id: params.bannerId,
            },
        })

        revalidatePath('/', 'layout')
        await revalidateAllStorefront()

        return NextResponse.json(banner)
    } catch (error) {
        console.error('[BANNER_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { label, image } = body

        if (!label) {
            return new NextResponse('Label is required', { status: 400 })
        }

        if (!image) {
            return new NextResponse('Image is required', { status: 400 })
        }

        const banner = await prisma.banner.create({
            data: {
                label,
                image,
            },
        })

        revalidatePath('/', 'layout')
        await revalidateStorefront(['/', '/products'])

        return NextResponse.json(banner)
    } catch (error) {
        console.error('[BANNERS_POST]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const banners = await prisma.banner.findMany({})

        return NextResponse.json(banners)
    } catch (error) {
        console.error('[BANNERS_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

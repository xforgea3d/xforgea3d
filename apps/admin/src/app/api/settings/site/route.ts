import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const allowedFields = [
            'brand_name', 'slogan', 'contact_email', 'contact_phone',
            'whatsapp', 'address_text', 'instagram_url', 'tiktok_url',
            'youtube_url', 'maintenance_enabled', 'maintenance_message',
        ] as const
        const data: Record<string, unknown> = {}
        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key]
        }
        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data },
        })

        // Bust admin cache and storefront (site settings affect all pages)
        revalidatePath('/', 'layout')
        await revalidateAllStorefront()

        return NextResponse.json(settings)
    } catch (error) {
        console.error('[SETTINGS_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1 },
        })
        return NextResponse.json(settings)
    } catch (error) {
        console.error('[SETTINGS_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

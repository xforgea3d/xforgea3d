import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
    try {
        const data = await req.json()
        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data },
        })
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

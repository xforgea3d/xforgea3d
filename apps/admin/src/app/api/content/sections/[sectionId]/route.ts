import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(req: Request, { params }: { params: { sectionId: string } }) {
    try {
        const data = await req.json()
        const section = await prisma.homepageSection.update({
            where: { id: params.sectionId },
            data,
        })
        await revalidateStorefront(['/'])
        return NextResponse.json(section)
    } catch (error) {
        console.error('[SECTION_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: { sectionId: string } }) {
    try {
        await prisma.homepageSection.delete({ where: { id: params.sectionId } })
        await revalidateStorefront(['/'])
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[SECTION_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

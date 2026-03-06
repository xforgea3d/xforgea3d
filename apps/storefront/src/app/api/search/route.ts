import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get('q')

        if (!query || query.length < 2 || query.length > 100) {
            return NextResponse.json({ products: [] })
        }

        // Prisma üzerinden sadece isim ve açıklamada arama yapıyoruz (sadece müsait ürünler, maksimum 5 sonuç)
        const products = await prisma.product.findMany({
            where: {
                isAvailable: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                categories: {
                    select: { title: true }
                }
            },
            take: 5
        })

        return NextResponse.json({ products })

    } catch (error: any) {
        console.error('[SEARCH_GET]', error)
        logError({
            message: error?.message || '[SEARCH_GET] Unhandled error',
            stack: error?.stack,
            severity: 'critical',
            source: 'backend',
            statusCode: 500,
            ...extractRequestContext(req),
        })
        return new NextResponse("Internal Error", { status: 500 })
    }
}

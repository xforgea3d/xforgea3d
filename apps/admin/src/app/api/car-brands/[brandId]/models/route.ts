import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function POST(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const body = await req.json()
      const { name, slug, imageUrl, yearRange } = body

      if (!name || !slug) {
         return new NextResponse('Name and slug are required', { status: 400 })
      }

      const model = await prisma.carModel.create({
         data: {
            name,
            slug,
            imageUrl,
            yearRange,
            brandId: params.brandId,
         },
      })

      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(model)
   } catch (error) {
      console.error('[CAR_MODEL_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string; modelId: string } }
) {
   try {
      const body = await req.json()
      const { name, slug, imageUrl, yearRange } = body

      const model = await prisma.carModel.update({
         where: { id: params.modelId },
         data: {
            ...(name !== undefined && { name }),
            ...(slug !== undefined && { slug }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(yearRange !== undefined && { yearRange }),
         },
      })

      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(model)
   } catch (error) {
      console.error('[CAR_MODEL_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string; modelId: string } }
) {
   try {
      await prisma.carModel.delete({
         where: { id: params.modelId },
      })
      await revalidateStorefront(['/', '/products'])

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[CAR_MODEL_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(
   req: Request,
   { params }: { params: { codeId: string } }
) {
   try {
      if (!params.codeId) {
         return new NextResponse('Code ID is required', { status: 400 })
      }

      const code = await prisma.discountCode.findUnique({
         where: { id: params.codeId },
         include: {
            _count: { select: { order: true } },
            order: {
               select: {
                  id: true,
                  number: true,
                  total: true,
                  createdAt: true,
               },
               take: 20,
               orderBy: { createdAt: 'desc' },
            },
         },
      })

      if (!code) {
         return new NextResponse('Discount code not found', { status: 404 })
      }

      return NextResponse.json(code)
   } catch (error) {
      console.error('[DISCOUNT_CODE_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { codeId: string } }
) {
   try {
      if (!params.codeId) {
         return new NextResponse('Code ID is required', { status: 400 })
      }

      const body = await req.json()
      const { code, percent, maxDiscountAmount, stock, description, startDate, endDate } = body

      const discountCode = await prisma.discountCode.update({
         where: { id: params.codeId },
         data: {
            ...(code !== undefined && { code }),
            ...(percent !== undefined && { percent: Number(percent) }),
            ...(maxDiscountAmount !== undefined && { maxDiscountAmount: Number(maxDiscountAmount) }),
            ...(stock !== undefined && { stock: Number(stock) }),
            ...(description !== undefined && { description: description || null }),
            ...(startDate !== undefined && { startDate: new Date(startDate) }),
            ...(endDate !== undefined && { endDate: new Date(endDate) }),
         },
      })

      revalidatePath('/discount-codes')
      revalidatePath('/', 'layout')

      return NextResponse.json(discountCode)
   } catch (error) {
      console.error('[DISCOUNT_CODE_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { codeId: string } }
) {
   try {
      if (!params.codeId) {
         return new NextResponse('Code ID is required', { status: 400 })
      }

      const discountCode = await prisma.discountCode.delete({
         where: { id: params.codeId },
      })

      revalidatePath('/discount-codes')
      revalidatePath('/', 'layout')

      return NextResponse.json(discountCode)
   } catch (error) {
      console.error('[DISCOUNT_CODE_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

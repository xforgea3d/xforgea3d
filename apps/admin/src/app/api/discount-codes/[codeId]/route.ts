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

      if (percent !== undefined) {
         const p = Number(percent)
         if (!Number.isInteger(p) || p < 1 || p > 100) {
            return new NextResponse('percent must be integer 1-100', { status: 400 })
         }
      }
      if (maxDiscountAmount !== undefined && Number(maxDiscountAmount) < 0) {
         return new NextResponse('maxDiscountAmount cannot be negative', { status: 400 })
      }
      if (stock !== undefined && Number(stock) < 0) {
         return new NextResponse('stock cannot be negative', { status: 400 })
      }

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
   } catch (error: any) {
      console.error('[DISCOUNT_CODE_PATCH]', error)
      if (error?.code === 'P2025') return new NextResponse('Not found', { status: 404 })
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
   } catch (error: any) {
      console.error('[DISCOUNT_CODE_DELETE]', error)
      if (error?.code === 'P2025') return new NextResponse('Not found', { status: 404 })
      return new NextResponse('Internal error', { status: 500 })
   }
}

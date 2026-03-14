import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

function generateCode(): string {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
   let result = 'XF'
   for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return result
}

export async function GET() {
   try {
      const codes = await prisma.discountCode.findMany({
         include: {
            _count: { select: { order: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 200,
      })

      return NextResponse.json(codes)
   } catch (error) {
      console.error('[DISCOUNT_CODES_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const body = await req.json()

      const {
         code,
         percent,
         maxDiscountAmount,
         stock,
         description,
         startDate,
         endDate,
      } = body

      if (!percent || !startDate || !endDate) {
         return new NextResponse('percent, startDate, endDate are required', {
            status: 400,
         })
      }

      const finalCode = code?.trim() || generateCode()

      const discountCode = await prisma.discountCode.create({
         data: {
            code: finalCode,
            percent: Number(percent),
            maxDiscountAmount: maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : 1,
            stock: stock ? Number(stock) : 1,
            description: description || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
         },
      })

      revalidatePath('/discount-codes')
      revalidatePath('/', 'layout')

      return NextResponse.json(discountCode)
   } catch (error) {
      console.error('[DISCOUNT_CODES_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

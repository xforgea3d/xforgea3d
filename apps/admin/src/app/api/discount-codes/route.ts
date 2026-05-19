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

      const p = Number(percent)
      if (!Number.isInteger(p) || p < 1 || p > 100) {
         return new NextResponse('percent must be integer 1-100', { status: 400 })
      }

      const mda = maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : 1
      if (mda < 0) {
         return new NextResponse('maxDiscountAmount cannot be negative', { status: 400 })
      }

      const s = stock ? Number(stock) : 1
      if (s < 0) {
         return new NextResponse('stock cannot be negative', { status: 400 })
      }

      const finalCode = code?.trim() || generateCode()

      const discountCode = await prisma.discountCode.create({
         data: {
            code: finalCode,
            percent: p,
            maxDiscountAmount: mda,
            stock: s,
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

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()

      const { title, description, logo } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      const brand = await prisma.brand.create({
         data: {
            title,
            description,
            logo,
         },
      })

      revalidatePath('/brands')
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(brand)
   } catch (error: any) {
      console.error('[BRANDS_POST]', error)
      if (error?.code === 'P2002') {
         return new NextResponse('Bu koleksiyon adi zaten kullaniliyor', { status: 409 })
      }
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET() {
   try {
      const brands = await prisma.brand.findMany({ take: 200, orderBy: { title: 'asc' } })

      return NextResponse.json(brands)
   } catch (error) {
      console.error('[BRANDS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

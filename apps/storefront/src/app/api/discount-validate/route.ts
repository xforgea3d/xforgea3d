import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { code, csrfToken } = await req.json()

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!code) return NextResponse.json({ valid: false, error: 'Kod girilmedi' }, { status: 400 })

      const now = new Date()
      const dc = await prisma.discountCode.findUnique({
         where: { code },
      })

      if (!dc) {
         return NextResponse.json({ valid: false, error: 'Gecersiz indirim kodu' })
      }
      if (dc.stock < 1) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodu tukenmistir' })
      }
      if (dc.endDate < now) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodunun suresi dolmus' })
      }
      if (dc.startDate > now) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodu henuz aktif degil' })
      }

      // Calculate discount amount based on user's cart
      const cart = await prisma.cart.findUnique({
         where: { userId },
         include: { items: { include: { product: true } } },
      })

      if (!cart || !cart.items.length) {
         return NextResponse.json({ valid: false, error: 'Sepetiniz bos' })
      }

      let total = 0
      let productDiscount = 0
      for (const item of cart.items) {
         total += item.count * item.product.price
         productDiscount += item.count * item.product.discount
      }

      const afterProductDiscount = total - productDiscount
      let codeDiscount = afterProductDiscount * (dc.percent / 100)
      if (dc.maxDiscountAmount && codeDiscount > dc.maxDiscountAmount) {
         codeDiscount = dc.maxDiscountAmount
      }

      return NextResponse.json({
         valid: true,
         percent: dc.percent,
         discountAmount: parseFloat(codeDiscount.toFixed(2)),
      })
   } catch (error: any) {
      console.error('[DISCOUNT_VALIDATE]', error)
      return NextResponse.json({ valid: false, error: 'Bir hata olustu' })
   }
}

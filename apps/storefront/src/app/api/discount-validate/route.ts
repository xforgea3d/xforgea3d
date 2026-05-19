import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { code, csrfToken } = await req.json()

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Geçersiz istek. Sayfayı yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!code) return NextResponse.json({ valid: false, error: 'Kod girilmedi' }, { status: 400 })

      const now = new Date()
      const dc = await prisma.discountCode.findUnique({
         where: { code },
      })

      if (!dc) {
         return NextResponse.json({ valid: false, error: 'Geçersiz indirim kodu' })
      }
      if (dc.stock < 1) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodu tükenmiştir' })
      }
      if (dc.endDate < now) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodunun süresi dolmuş' })
      }
      if (dc.startDate > now) {
         return NextResponse.json({ valid: false, error: 'Bu indirim kodu henüz aktif değil' })
      }

      // Calculate discount amount based on user's cart (aligned with order calculateCosts)
      const cart = await prisma.cart.findUnique({
         where: { userId },
         include: { items: { include: { product: true } } },
      })

      if (!cart || !cart.items.length) {
         return NextResponse.json({ valid: false, error: 'Sepetiniz boş' })
      }

      let total = 0
      let productDiscount = 0
      for (const item of cart.items) {
         const p = item.product
         const hasFlashSale = p.flashSalePrice != null &&
            p.flashSaleEndDate != null &&
            p.flashSalePrice > 0 &&
            new Date(p.flashSaleEndDate) > now
         if (hasFlashSale) {
            total += item.count * p.flashSalePrice!
         } else {
            total += item.count * p.price
            productDiscount += item.count * p.discount
         }
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
      return NextResponse.json({ valid: false, error: 'Bir hata oluştu' })
   }
}

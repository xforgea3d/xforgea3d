import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET() {
   try {
      const campaigns = await prisma.campaign.findMany({
         include: {
            _count: { select: { products: true } },
            discountCode: {
               select: { id: true, code: true, percent: true },
            },
         },
         orderBy: { startDate: 'desc' },
      })

      return NextResponse.json(campaigns)
   } catch (error) {
      console.error('[CAMPAIGNS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const body = await req.json()

      const {
         name,
         description,
         startDate,
         endDate,
         isActive,
         priority,
         emoji,
         primaryColor,
         secondaryColor,
         gradientFrom,
         gradientTo,
         bannerTitle,
         bannerSubtitle,
         bannerCtaText,
         bannerCtaLink,
         bannerImageUrl,
         discountPercent,
         discountCodeId,
         productIds,
      } = body

      if (!name || !startDate || !endDate || !bannerTitle) {
         return new NextResponse(
            'name, startDate, endDate, bannerTitle are required',
            { status: 400 }
         )
      }

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
         return NextResponse.json(
            { error: 'Bitis tarihi baslangictan sonra olmali' },
            { status: 400 }
         )
      }

      const campaign = await prisma.campaign.create({
         data: {
            name,
            description: description || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: isActive ?? true,
            priority: priority ? Number(priority) : 0,
            emoji: emoji || undefined,
            primaryColor: primaryColor || undefined,
            secondaryColor: secondaryColor || undefined,
            gradientFrom: gradientFrom || undefined,
            gradientTo: gradientTo || undefined,
            bannerTitle,
            bannerSubtitle: bannerSubtitle || null,
            bannerCtaText: bannerCtaText || undefined,
            bannerCtaLink: bannerCtaLink || undefined,
            bannerImageUrl: bannerImageUrl || null,
            discountPercent: discountPercent ? Number(discountPercent) : 0,
            discountCodeId: discountCodeId || null,
            ...(productIds && productIds.length > 0
               ? {
                    products: {
                       connect: productIds.map((id: string) => ({ id })),
                    },
                 }
               : {}),
         },
         include: {
            _count: { select: { products: true } },
            discountCode: true,
         },
      })

      revalidatePath('/campaigns')
      revalidatePath('/', 'layout')

      return NextResponse.json(campaign)
   } catch (error) {
      console.error('[CAMPAIGNS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

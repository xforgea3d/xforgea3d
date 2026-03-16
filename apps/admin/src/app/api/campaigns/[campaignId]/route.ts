import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(
   req: Request,
   { params }: { params: { campaignId: string } }
) {
   try {
      if (!params.campaignId) {
         return new NextResponse('Campaign ID is required', { status: 400 })
      }

      const campaign = await prisma.campaign.findUnique({
         where: { id: params.campaignId },
         include: {
            products: {
               select: {
                  id: true,
                  title: true,
                  price: true,
                  discount: true,
                  images: true,
                  isAvailable: true,
               },
            },
            discountCode: true,
         },
      })

      if (!campaign) {
         return new NextResponse('Campaign not found', { status: 404 })
      }

      return NextResponse.json(campaign)
   } catch (error) {
      console.error('[CAMPAIGN_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { campaignId: string } }
) {
   try {
      if (!params.campaignId) {
         return new NextResponse('Campaign ID is required', { status: 400 })
      }

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

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
         return NextResponse.json(
            { error: 'Bitis tarihi baslangictan sonra olmali' },
            { status: 400 }
         )
      }

      // Build the update data conditionally
      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description || null
      if (startDate !== undefined) updateData.startDate = new Date(startDate)
      if (endDate !== undefined) updateData.endDate = new Date(endDate)
      if (isActive !== undefined) updateData.isActive = isActive
      if (priority !== undefined) updateData.priority = Number(priority)
      if (emoji !== undefined) updateData.emoji = emoji
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor
      if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
      if (gradientFrom !== undefined) updateData.gradientFrom = gradientFrom
      if (gradientTo !== undefined) updateData.gradientTo = gradientTo
      if (bannerTitle !== undefined) updateData.bannerTitle = bannerTitle
      if (bannerSubtitle !== undefined) updateData.bannerSubtitle = bannerSubtitle || null
      if (bannerCtaText !== undefined) updateData.bannerCtaText = bannerCtaText
      if (bannerCtaLink !== undefined) updateData.bannerCtaLink = bannerCtaLink
      if (bannerImageUrl !== undefined) updateData.bannerImageUrl = bannerImageUrl || null
      if (discountPercent !== undefined) updateData.discountPercent = Number(discountPercent)
      if (discountCodeId !== undefined) {
         updateData.discountCodeId = discountCodeId || null
      }

      // Handle product connections
      if (productIds !== undefined) {
         updateData.products = {
            set: productIds.map((id: string) => ({ id })),
         }
      }

      const campaign = await prisma.campaign.update({
         where: { id: params.campaignId },
         data: updateData,
         include: {
            _count: { select: { products: true } },
            discountCode: true,
            products: {
               select: { id: true, title: true },
            },
         },
      })

      revalidatePath('/campaigns')
      revalidatePath(`/campaigns/${params.campaignId}`)
      revalidatePath('/', 'layout')

      return NextResponse.json(campaign)
   } catch (error) {
      console.error('[CAMPAIGN_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { campaignId: string } }
) {
   try {
      if (!params.campaignId) {
         return new NextResponse('Campaign ID is required', { status: 400 })
      }

      const campaign = await prisma.campaign.delete({
         where: { id: params.campaignId },
      })

      revalidatePath('/campaigns')
      revalidatePath('/', 'layout')

      return NextResponse.json(campaign)
   } catch (error) {
      console.error('[CAMPAIGN_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * POST /api/quote-requests — PUBLIC (no auth required)
 * Accepts FormData: data (JSON string) + optional image (File)
 */
export async function POST(req: Request) {
   try {
      const formData = await req.formData()
      const rawData = formData.get('data') as string
      const imageFile = formData.get('image') as File | null

      if (!rawData) {
         return NextResponse.json({ error: 'Veri eksik' }, { status: 400 })
      }

      const data = JSON.parse(rawData)

      if (!data.email || !data.partDescription) {
         return NextResponse.json(
            { error: 'E-posta ve parça açıklaması zorunludur' },
            { status: 400 }
         )
      }

      // Upload image to Supabase Storage if provided
      let imageUrl: string | null = null
      if (imageFile) {
         const buffer = Buffer.from(await imageFile.arrayBuffer())
         const filename = `quote-requests/${randomUUID()}-${imageFile.name.replace(/[^a-z0-9.-]/gi, '_')}`

         const { error: uploadError } = await supabase.storage
            .from('ecommerce')
            .upload(filename, buffer, {
               contentType: imageFile.type,
               upsert: false,
            })

         if (!uploadError) {
            const { data: urlData } = supabase.storage.from('ecommerce').getPublicUrl(filename)
            imageUrl = urlData.publicUrl
         }
      }

      // Optionally link to logged-in user
      const userId = req.headers.get('X-USER-ID') || null

      const quoteRequest = await prisma.quoteRequest.create({
         data: {
            email: data.email,
            name: data.name || null,
            phone: data.phone || null,
            userId,
            carBrandId: data.carBrandId || null,
            carModelId: data.carModelId || null,
            partDescription: data.partDescription,
            imageUrl,
         },
      })

      // Notify admin users
      try {
         const admins = await prisma.profile.findMany({
            where: { role: 'admin' },
            select: { id: true },
         })

         if (admins.length) {
            await prisma.notification.createMany({
               data: admins.map((admin) => ({
                  userId: admin.id,
                  content: `Yeni parça talebi #${quoteRequest.number} — ${data.partDescription.slice(0, 80)}`,
               })),
            })
         }
      } catch (notifyError) {
         console.error('[QUOTE_NOTIFY]', notifyError)
      }

      return NextResponse.json({ id: quoteRequest.id, number: quoteRequest.number })
   } catch (error) {
      console.error('[QUOTE_POST]', error)
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}

/**
 * GET /api/quote-requests — PROTECTED (user's own requests)
 */
export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }

      const requests = await prisma.quoteRequest.findMany({
         where: { userId },
         include: {
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
         orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(requests)
   } catch (error) {
      console.error('[QUOTE_GET]', error)
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}

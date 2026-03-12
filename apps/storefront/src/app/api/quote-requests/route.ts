import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = new Set([
   'image/jpeg', 'image/png', 'image/webp', 'image/gif',
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSupabaseClient() {
   return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
}

/**
 * POST /api/quote-requests — PUBLIC (no auth required)
 */
export async function POST(req: Request) {
   try {
      const formData = await req.formData()
      const rawData = formData.get('data') as string
      const imageFile = formData.get('image') as File | null

      if (!rawData) {
         return NextResponse.json({ error: 'Veri eksik' }, { status: 400 })
      }

      let data: any
      try {
         data = JSON.parse(rawData)
      } catch {
         return NextResponse.json({ error: 'Gecersiz veri formati' }, { status: 400 })
      }

      if (!data.email || !data.partDescription) {
         return NextResponse.json(
            { error: 'E-posta ve parca aciklamasi zorunludur' },
            { status: 400 }
         )
      }

      if (!EMAIL_REGEX.test(data.email)) {
         return NextResponse.json({ error: 'Gecersiz e-posta adresi' }, { status: 400 })
      }

      if (data.partDescription.length > 2000) {
         return NextResponse.json({ error: 'Aciklama cok uzun (maks 2000 karakter)' }, { status: 400 })
      }

      // Upload image to Supabase Storage if provided
      let imageUrl: string | null = null
      if (imageFile) {
         if (imageFile.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Dosya boyutu 5MB limitini asiyor' }, { status: 400 })
         }

         if (!ALLOWED_TYPES.has(imageFile.type)) {
            return NextResponse.json({ error: 'Sadece resim dosyalari yuklenebilir' }, { status: 400 })
         }

         const buffer = Buffer.from(await imageFile.arrayBuffer())
         const filename = `quote-requests/${randomUUID()}-${imageFile.name.replace(/[^a-z0-9.-]/gi, '_')}`

         const { error: uploadError } = await getSupabaseClient().storage
            .from('ecommerce')
            .upload(filename, buffer, {
               contentType: imageFile.type,
               upsert: false,
            })

         if (!uploadError) {
            const { data: urlData } = getSupabaseClient().storage.from('ecommerce').getPublicUrl(filename)
            imageUrl = urlData.publicUrl
         }
      }

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
                  content: `Yeni parca talebi #${quoteRequest.number} - ${data.partDescription.slice(0, 80)}`,
               })),
            })
         }
      } catch (notifyError: any) {
         console.error('[QUOTE_NOTIFY]', notifyError)
         logError({
            message: notifyError?.message || '[QUOTE_NOTIFY] Notification failed',
            stack: notifyError?.stack,
            severity: 'low',
            source: 'backend',
            statusCode: 500,
            ...extractRequestContext(req),
         })
      }

      return NextResponse.json({ id: quoteRequest.id, number: quoteRequest.number })
   } catch (error: any) {
      console.error('[QUOTE_POST]', error)
      logError({
         message: error?.message || '[QUOTE_POST] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 })
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
   } catch (error: any) {
      console.error('[QUOTE_GET]', error)
      logError({
         message: error?.message || '[QUOTE_GET] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 })
   }
}

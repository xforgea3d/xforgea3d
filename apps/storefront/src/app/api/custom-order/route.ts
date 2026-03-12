import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

function getSupabaseClient() {
   return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
}

/**
 * POST /api/custom-order
 * Accepts multipart FormData: svg (File) + data (JSON string)
 * Uploads SVG to Supabase Storage, creates admin notifications.
 */
export async function POST(req: Request) {
   try {
      const formData = await req.formData()
      const svgFile = formData.get('svg') as File | null
      const rawData = formData.get('data') as string

      if (!rawData) return NextResponse.json({ error: 'Veri eksik' }, { status: 400 })

      let data: any
      try {
         data = JSON.parse(rawData)
      } catch {
         return NextResponse.json({ error: 'Gecersiz veri formati' }, { status: 400 })
      }

      // Upload SVG to Supabase Storage
      let svgUrl: string | null = null
      if (svgFile) {
         const MAX_SIZE = 5 * 1024 * 1024 // 5MB
         if (svgFile.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Dosya boyutu 5MB limitini asiyor' }, { status: 400 })
         }

         const allowedTypes = new Set(['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'])
         if (!allowedTypes.has(svgFile.type)) {
            return NextResponse.json({ error: 'Desteklenmeyen dosya tipi' }, { status: 400 })
         }

         const buffer = Buffer.from(await svgFile.arrayBuffer())
         const filename = `custom-orders/${randomUUID()}-${svgFile.name.replace(/[^a-z0-9.-]/gi, '_')}`

         const { error: uploadError } = await getSupabaseClient().storage
            .from('ecommerce')
            .upload(filename, buffer, {
               contentType: svgFile.type || 'image/svg+xml',
               upsert: false,
            })

         if (!uploadError) {
            const { data: urlData } = getSupabaseClient().storage.from('ecommerce').getPublicUrl(filename)
            svgUrl = urlData.publicUrl
         }
      }

      // Build notification content for admin
      const orderDetails = [
         `Özel Sipariş Talebi`,
         `Ad: ${data.firstName || ''} ${data.lastName || ''}`,
         `E-posta: ${data.email || '-'}`,
         `Telefon: ${data.phone || '-'}`,
         `Şehir: ${data.city || '-'}`,
         `Adres: ${data.address || '-'}`,
         `Renk: ${data.color || '-'}`,
         `Not: ${data.notes || '-'}`,
         svgUrl ? `Dosya: ${svgUrl}` : 'Dosya yüklenmedi',
         `Tarih: ${new Date().toLocaleString('tr-TR')}`,
      ].join('\n')

      // Notify all admin users
      const admins = await prisma.profile.findMany({
         where: { role: 'admin' },
         select: { id: true },
      })

      if (admins.length) {
         await prisma.notification.createMany({
            data: admins.map((admin) => ({
               userId: admin.id,
               content: orderDetails,
            })),
         })
      }

      return NextResponse.json({ success: true })
   } catch (err: any) {
      console.error('[Custom Order Error]', err)
      logError({
         message: err?.message || '[Custom Order Error] Unhandled error',
         stack: err?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}

import sharp from 'sharp'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = new Set([
   'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
   try {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
         return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
         return NextResponse.json({ error: 'Dosya boyutu 5MB limitini asiyor' }, { status: 400 })
      }

      if (!ALLOWED_TYPES.has(file.type)) {
         return NextResponse.json({ error: 'Desteklenmeyen dosya tipi. Sadece resim yuklenebilir.' }, { status: 400 })
      }

      const supabase = createServerClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
         {
            cookies: {
               getAll() {
                  return request.cookies.getAll()
               },
               setAll() {},
            },
         }
      )

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(fileExt) ? fileExt : 'png'
      const fileName = `${uuidv4()}.${safeExt}`
      const filePath = `uploads/${fileName}`

      const buffer = Buffer.from(await file.arrayBuffer())

      // For PNG images, flatten transparency onto white background
      let processedBuffer: Buffer = buffer
      let contentType = file.type
      if (file.type === 'image/png') {
         try {
            processedBuffer = await sharp(buffer)
               .flatten({ background: { r: 255, g: 255, b: 255 } })
               .png()
               .toBuffer()
         } catch (e) {
            console.warn('Sharp processing failed, using original:', e)
            // Fall back to original buffer
         }
      }

      const { error } = await supabase.storage
         .from('ecommerce')
         .upload(filePath, processedBuffer, {
            contentType: contentType,
            upsert: false,
         })

      if (error) {
         console.error('Supabase upload error:', error)
         return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
         .from('ecommerce')
         .getPublicUrl(filePath)

      return NextResponse.json({ url: publicUrl })
   } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
   }
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
   try {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
         return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Create authenticated Supabase client using request cookies
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
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const buffer = Buffer.from(await file.arrayBuffer())

      const { error } = await supabase.storage
         .from('ecommerce')
         .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
         })

      if (error) {
         console.error('Supabase upload error:', error)
         return NextResponse.json({ error: error.message }, { status: 500 })
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

import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const SITE_STYLE = 'Premium 3D printing e-commerce store. Dark elegant aesthetic, cinematic lighting, deep shadows, high contrast. Luxury feel, sharp details.'

const CONTEXT_PROMPTS: Record<string, string> = {
   'category': `${SITE_STYLE} Product category hero image for a navbar dropdown. Wide 16:9 banner format. Subtle dark gradient background with elegant product showcase. The subject is:`,
   'car-model': `Professional studio car photography. Clean white or dark gradient background. Side-angle 3/4 view showing the full vehicle. Sharp focus, professional automotive lighting. The car is:`,
   'product': `${SITE_STYLE} Ultra-premium product photography. Studio lighting on dark surface. The product is:`,
   'banner': `${SITE_STYLE} Wide promotional banner image (16:9). Eye-catching, bold composition. The subject is:`,
}

export async function POST(request: NextRequest) {
   try {
      const userId = request.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { prompt, context } = await request.json()

      if (!prompt) {
         return new NextResponse('Prompt is required', { status: 400 })
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
      if (!apiKey) {
         return new NextResponse('Gemini API Key is missing in .env', { status: 500 })
      }

      // Build context-aware prompt
      const prefix = CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS['product']
      const fullPrompt = `${prefix} ${prompt}`

      // Generate via Gemini Imagen 3
      const geminiRes = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
         {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               instances: [{ prompt: fullPrompt }],
               parameters: {
                  sampleCount: 1,
                  aspectRatio: context === 'car-model' ? '4:3' : '16:9',
                  outputOptions: { mimeType: 'image/jpeg' },
               },
            }),
         }
      )

      if (!geminiRes.ok) {
         const errorInfo = await geminiRes.text()
         console.error('[IMAGE_GENERATE_ERROR] Gemini:', errorInfo)
         return new NextResponse(`Gemini error: ${geminiRes.statusText}`, { status: geminiRes.status })
      }

      const json = await geminiRes.json()
      const base64Str = json?.predictions?.[0]?.bytesBase64Encoded

      if (!base64Str) {
         throw new Error('No image returned from Gemini')
      }

      // Upload to Supabase Storage using authenticated client
      const supabase = createServerClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
         {
            cookies: {
               getAll() { return request.cookies.getAll() },
               setAll() {},
            },
         }
      )

      const buffer = Buffer.from(base64Str, 'base64')
      const folder = context === 'car-model' ? 'cars' : context === 'category' ? 'categories' : 'generated'
      const fileName = `${folder}/${uuidv4()}.jpg`

      const { error: uploadError } = await supabase.storage
         .from('ecommerce')
         .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false,
         })

      if (uploadError) {
         console.error('Upload error:', uploadError)
         return new NextResponse(`Upload failed: ${uploadError.message}`, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
         .from('ecommerce')
         .getPublicUrl(fileName)

      return NextResponse.json({ url: publicUrl })
   } catch (error) {
      console.error('[IMAGE_GENERATE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('X-USER-ID')

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { prompt } = await req.json()

        if (!prompt) {
            return new NextResponse('Prompt is required', { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
        if (!apiKey) {
            return new NextResponse('Gemini API Key is missing in .env', { status: 500 })
        }

        const fullPrompt = `Ultra-premium product photography for an e-commerce 3D printing store. The core subject is: ${prompt}. Cinematic lighting, deep shadows, dark elegant background. High resolution, high contrast, visually striking and highly detailed. Luxury aesthetic, 3D printed texture visible.`

        // 1. Generate Image via Google Gemini AI (Imagen 3)
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [{ prompt: fullPrompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "16:9",
                    outputOptions: { mimeType: "image/jpeg" }
                }
            }),
        })

        if (!geminiRes.ok) {
            const errorInfo = await geminiRes.text()
            console.error('[IMAGE_GENERATE_ERROR] Gemini returned:', errorInfo)
            return new NextResponse(`Gemini error: ${geminiRes.statusText}`, { status: geminiRes.status })
        }

        const json = await geminiRes.json()
        const base64Str = json?.predictions?.[0]?.bytesBase64Encoded

        if (!base64Str) {
            throw new Error('No image Base64 returned from Gemini')
        }

        // 2. Upload to Supabase Storage to get a Public URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            return new NextResponse('Supabase config is missing for image upload', { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const buffer = Buffer.from(base64Str, 'base64')
        const fileName = `generated-${uuidv4()}.jpg`
        const filePath = `categories/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('ecommerce') // Existing bucket from the original project
            .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                upsert: false
            })

        if (uploadError) {
            console.error('Supabase upload error:', uploadError)
            return new NextResponse(`Failed to upload to Supabase: ${uploadError.message}`, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('ecommerce')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error('[IMAGE_GENERATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

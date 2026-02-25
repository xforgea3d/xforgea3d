import { NextResponse } from 'next/server'

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

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return new NextResponse('OpenAI API Key is missing in .env', { status: 500 })
        }

        const fullPrompt = `Ultra-premium product photography for an e-commerce 3D printing store. The core subject is: ${prompt}. Cinematic lighting, deep shadows, dark elegant background. High resolution, high contrast, visually striking and highly detailed. Luxury aesthetic, 3D printed texture visible.`

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: fullPrompt,
                n: 1,
                size: '1024x1024',
                quality: 'standard', // or 'hd'
            }),
        })

        if (!response.ok) {
            const errorInfo = await response.text()
            console.error('[IMAGE_GENERATE_ERROR] OpenAI returned:', errorInfo)
            return new NextResponse(`OpenAI error: ${response.statusText}`, { status: response.status })
        }

        const json = await response.json()
        const imageUrl = json.data?.[0]?.url

        if (!imageUrl) {
            throw new Error('No image URL returned from OpenAI')
        }

        return NextResponse.json({ url: imageUrl })
    } catch (error) {
        console.error('[IMAGE_GENERATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

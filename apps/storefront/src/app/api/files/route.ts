import { createClient } from '@supabase/supabase-js'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = new Set([
   'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('X-USER-ID')
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Dosya boyutu 5MB limitini asiyor' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Sadece resim dosyalari yuklenebilir (JPEG, PNG, WebP, GIF)' }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(fileExt) ? fileExt : 'png'
        const fileName = `${uuidv4()}.${safeExt}`
        const filePath = `uploads/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { data, error } = await supabase.storage
            .from('ecommerce')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error('Supabase upload error:', error)
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('ecommerce')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Server upload error:', error)
        logError({
            message: error?.message || '[FILES_POST] Unhandled error',
            stack: error?.stack,
            severity: 'critical',
            source: 'backend',
            statusCode: 500,
            ...extractRequestContext(request),
        })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

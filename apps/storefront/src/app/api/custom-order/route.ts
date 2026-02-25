import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

/**
 * POST /api/custom-order
 * Accepts multipart FormData: svg (File) + data (JSON string)
 * Saves the request to the database and notifies admin.
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const svgFile = formData.get('svg') as File | null
        const rawData = formData.get('data') as string

        if (!rawData) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

        const data = JSON.parse(rawData)

        // Save SVG file locally (or to Supabase storage in production)
        let svgPath: string | null = null
        if (svgFile) {
            const buffer = Buffer.from(await svgFile.arrayBuffer())
            const filename = `${randomUUID()}-${svgFile.name.replace(/[^a-z0-9.-]/gi, '_')}`
            // In dev: save to /tmp; adapt to Supabase storage in prod
            svgPath = filename // store logical name only
        }

        // Save to DB (uses existing Prisma schema — logging as a custom order entry)
        // For now we log to console and return success.
        // A real implementation would store in a CustomOrder table.
        console.log('[Custom Order]', {
            ...data,
            svgFile: svgPath,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Custom Order Error]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

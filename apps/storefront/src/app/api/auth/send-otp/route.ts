import { sendEmailViaResend } from '@/lib/resend'
import OtpEmail from '@/emails/otp'
import { render } from '@react-email/render'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/auth/send-otp
 *
 * Generates a 6-digit OTP, stores it in Prisma DB,
 * and sends it via Resend.
 *
 * Body: { email: string, type?: 'verify' | 'reset', name?: string }
 */

function generateOTP(): string {
    // Crypto-safe 6-digit code
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return String(array[0] % 1000000).padStart(6, '0')
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, type = 'verify', name = '' } = body

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'E-posta adresi gerekli.' }, { status: 400 })
        }

        // Rate limit: max 3 OTPs per email per 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        const recentCount = await prisma.otp.count({
            where: {
                email,
                createdAt: { gte: tenMinutesAgo },
            },
        })

        if (recentCount >= 3) {
            return NextResponse.json(
                { error: 'Cok fazla deneme. Lutfen birkas dakika bekleyin.' },
                { status: 429 }
            )
        }

        // Delete expired OTPs for this email
        await prisma.otp.deleteMany({
            where: {
                email,
                expiresAt: { lt: new Date() },
            },
        })

        // Generate and store OTP
        const code = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.otp.create({
            data: {
                email,
                type,
                code,
                expiresAt,
            },
        })

        // Render email
        const html = await render(OtpEmail({ code, name, type: type as 'verify' | 'reset' }))

        // Send via Resend
        const subject = type === 'reset'
            ? 'xForgea3D - Sifre Sifirlama Kodu'
            : 'xForgea3D - Dogrulama Kodu'

        const result = await sendEmailViaResend({
            to: email,
            subject,
            html,
        })

        if (!result.success) {
            console.error('[send-otp] Resend error:', result.error)
            return NextResponse.json(
                { error: 'E-posta gonderilemedi. Lutfen tekrar deneyin.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: 'Dogrulama kodu gonderildi.' })
    } catch (error) {
        console.error('[send-otp] Error:', error)
        return NextResponse.json(
            { error: 'Beklenmeyen bir hata olustu.' },
            { status: 500 }
        )
    }
}

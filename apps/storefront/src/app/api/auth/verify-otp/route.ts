import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/auth/verify-otp
 *
 * Verifies an OTP code against the database.
 *
 * Body: { email: string, code: string, type?: 'verify' | 'reset' }
 *
 * Returns: { success: true, verified: true } on match
 */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, code, type = 'verify' } = body

        if (!email || !code) {
            return NextResponse.json(
                { error: 'E-posta ve dogrulama kodu gerekli.' },
                { status: 400 }
            )
        }

        const otp = await prisma.otp.findFirst({
            where: {
                email,
                type,
                code,
                used: false,
            },
        })

        if (!otp) {
            return NextResponse.json(
                { error: 'Dogrulama kodu bulunamadi. Yeni bir kod isteyin.' },
                { status: 400 }
            )
        }

        if (otp.expiresAt < new Date()) {
            // Delete expired OTP
            await prisma.otp.delete({ where: { id: otp.id } })
            return NextResponse.json(
                { error: 'Dogrulama kodunun suresi doldu. Yeni bir kod isteyin.' },
                { status: 400 }
            )
        }

        // Mark as used
        await prisma.otp.update({
            where: { id: otp.id },
            data: { used: true },
        })

        // Clean up old used/expired OTPs
        await prisma.otp.deleteMany({
            where: {
                OR: [
                    { used: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                    { expiresAt: { lt: new Date() } },
                ],
            },
        })

        return NextResponse.json({ success: true, verified: true })
    } catch (error) {
        console.error('[verify-otp] Error:', error)
        return NextResponse.json(
            { error: 'Beklenmeyen bir hata olustu.' },
            { status: 500 }
        )
    }
}

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { name, email, subject, message } = body

      if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
         return new NextResponse('Geçerli bir ad soyad giriniz', { status: 400 })
      }
      if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
         return new NextResponse('Geçerli bir e-posta giriniz', { status: 400 })
      }
      if (!subject || typeof subject !== 'string' || subject.length < 1 || subject.length > 200) {
         return new NextResponse('Konu en fazla 200 karakter olabilir', { status: 400 })
      }
      if (!message || typeof message !== 'string' || message.length < 10 || message.length > 5000) {
         return new NextResponse('Mesaj 10-5000 karakter arasında olmalıdır', { status: 400 })
      }

      // Store as a notification for admin review
      await prisma.notification.create({
         data: {
            userId: 'system',
            content: `[İletişim Formu] ${name} (${email}) — ${subject}: ${message.slice(0, 300)}`,
         },
      })

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[CONTACT_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

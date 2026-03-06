import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Bilinen admin e-postaları — sadece bunlar admin olabilir
const ALLOWED_ADMIN_EMAILS = ['adminvolkan@xforgea3d.com']

export async function POST(req: Request) {
   try {
      const { email } = await req.json()

      if (!email || !ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Zaten admin var mı kontrol et
      const existingAdmin = await prisma.profile.findFirst({
         where: { role: 'admin' },
      })

      if (existingAdmin) {
         // Zaten admin varsa, sadece bu email admin mi kontrol et
         if (existingAdmin.email !== email.toLowerCase()) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 403 })
         }
         return NextResponse.json({ ok: true, message: 'Already admin' })
      }

      // Trigger ile oluşmuş profili bul ve admin yap
      // Trigger async çalışabilir, biraz bekleyelim
      let profile = null
      for (let i = 0; i < 5; i++) {
         profile = await prisma.profile.findFirst({
            where: { email: email.toLowerCase() },
         })
         if (profile) break
         await new Promise(r => setTimeout(r, 500))
      }

      if (profile) {
         await prisma.profile.update({
            where: { id: profile.id },
            data: { role: 'admin' },
         })
      }

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[PROMOTE]', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
   }
}

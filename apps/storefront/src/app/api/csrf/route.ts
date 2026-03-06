import { generateCsrfToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   const userId = req.headers.get('X-USER-ID')
   if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }

   const token = generateCsrfToken(userId)
   return NextResponse.json({ token })
}

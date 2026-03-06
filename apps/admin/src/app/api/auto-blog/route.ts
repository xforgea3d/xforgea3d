import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// ── Gemini API config ────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// ── Topic pools ──────────────────────────────────────────────
const TOPIC_POOLS: Record<string, string[]> = {
   '3d': [
      '3D yazıcı ile ev dekorasyonu: modern vazo ve saksı tasarımları',
      '3D baskı ile kişiselleştirilmiş telefon kılıfları nasıl yapılır',
      'PLA vs ABS vs PETG: 3D baskı filament karşılaştırması',
      '3D yazıcı ile minyatür figür baskısı: başlangıç rehberi',
      '3D baskı ile cosplay aksesuarları ve zırh yapımı',
      '3D yazıcı ile masa üstü oyun figürleri üretimi',
      'Reçine 3D yazıcı ile detaylı heykel baskısı',
      '3D baskı ile özel kutu ve ambalaj tasarımı',
      '3D yazıcı ile mutfak aksesuarları: pratik çözümler',
      '3D baskı teknolojisinde 2025 trendleri ve yenilikler',
      '3D baskı ile LED aydınlatma aksesuarları tasarımı',
      '3D yazıcı bakımı: nozzle temizliği ve kalibrasyon ipuçları',
      'TPU filament ile esnek 3D baskı ürünleri',
      '3D baskı ile drone parçaları üretimi',
      '3D yazıcı ile mimari maket yapımı rehberi',
   ],
   aksesuar: [
      '3D baskı ile özel anahtarlık tasarımı fikirleri',
      '3D yazıcı ile takı ve bijuteri üretimi',
      '3D baskı ile kişiselleştirilmiş hediye fikirleri',
      '3D yazıcı ile gözlük çerçevesi tasarımı ve üretimi',
      '3D baskı ile ofis masası organizatör tasarımları',
      '3D yazıcı ile saat kayışı ve kordon üretimi',
      '3D baskı ile kitap ayracı ve okuma aksesuarları',
      '3D yazıcı ile kulaklık standı tasarımı',
      '3D baskı ile bardak altlığı ve mutfak dekor ürünleri',
      '3D yazıcı ile evcil hayvan aksesuarları: tasma tokaları ve oyuncaklar',
      '3D baskı ile çanta tokası ve kemer aksesuarları',
      '3D yazıcı ile kişisel damga ve mühür üretimi',
   ],
   otopark: [
      'BMW E46 için 3D baskı iç mekan aksesuarları ve tutucu parçalar',
      'Mercedes W204 klima düğmesi ve torpido parçaları 3D baskı çözümleri',
      'Volkswagen Golf MK7 için 3D baskı telefon tutucu ve havalandırma klipsleri',
      'Audi A4 B8 için 3D baskı bardak tutucu ve kapı kolu kapağı',
      'Ford Focus MK3 kontrol paneli düğmeleri 3D baskı ile yenileme',
      'Toyota Corolla E170 iç aksesuar parçaları 3D yazıcı ile üretim',
      'Renault Megane 4 torpido parçaları için 3D baskı çözümleri',
      'Fiat Egea cam düğmesi ve ayna kapağı 3D baskı üretimi',
      'Honda Civic FC5 için 3D baskı konsol aksesuarları',
      'Hyundai i30 havalandırma ızgarası ve düğme 3D baskı restorasyonu',
      'Peugeot 308 için 3D baskı iç trim ve aksesuar parçaları',
      'Opel Astra K iç mekan organizatör ve tutucu 3D baskı',
      'Mazda 3 için 3D baskı direksiyon düğmesi ve vites topuzu',
      'Volvo XC60 bagaj düzenleyici ve aksesuar 3D baskı projeleri',
      'Seat Leon MK3 için 3D baskı gövde klipsleri ve kapak parçaları',
   ],
}

// ── Helpers ──────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
   return arr[Math.floor(Math.random() * arr.length)]
}

function slugify(text: string): string {
   return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 120)
}

async function callGemini(prompt: string): Promise<string> {
   const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         contents: [{ parts: [{ text: prompt }] }],
         generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
         },
      }),
   })

   if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Gemini API error ${res.status}: ${errText}`)
   }

   const data = await res.json()
   return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── Main handler ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
   // Auth check: Vercel Cron sends this header, or manual calls must provide it
   const cronSecret = req.headers.get('authorization')?.replace('Bearer ', '')
   const headerSecret = req.headers.get('x-cron-secret')
   const envSecret = process.env.CRON_SECRET

   if (!envSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
   }
   if (cronSecret !== envSecret && headerSecret !== envSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }

   if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
   }

   const type = req.nextUrl.searchParams.get('type') ?? '3d'
   const pool = TOPIC_POOLS[type] ?? TOPIC_POOLS['3d']
   const topic = pickRandom(pool)

   try {
      // Step 1: Generate the blog post via Gemini
      const prompt = `Sen xForgea3D markası için blog yazarısın. xForgea3D, Türkiye merkezli premium 3D baskı ürünleri satan bir e-ticaret sitesidir.

Konu: "${topic}"

Aşağıdaki formatta bir blog yazısı üret. Cevabını SADECE JSON olarak ver, başka hiçbir şey yazma.

{
  "title": "SEO uyumlu, dikkat çekici Türkçe başlık (60 karakter civarı)",
  "excerpt": "Kısa özet, 160 karakter civarı, merak uyandıran",
  "body_html": "<h2>...</h2><p>...</p> formatında en az 800 kelimelik detaylı Türkçe makale. Alt başlıklar, listeler ve pratik bilgiler içersin. xForgea3D markasından doğal bir şekilde bahset.",
  "tags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"],
  "seo_title": "SEO başlığı | xForgea3D (max 60 karakter)",
  "seo_description": "Meta description, 155 karakter civarı, anahtar kelimeler içersin"
}

KURALLAR:
- Tamamen Türkçe yaz
- SEO dostu, organik anahtar kelime kullanımı
- body_html gerçek HTML olsun (h2, h3, p, ul, li, strong, em kullan)
- Bilgilendirici, samimi ve profesyonel ton
- xForgea3D'den doğal şekilde bahset (reklam gibi olmasın)
- JSON dışında hiçbir şey yazma (markdown code fence da yazma)`

      const raw = await callGemini(prompt)

      // Parse JSON from response (handle potential markdown wrapping)
      let jsonStr = raw.trim()
      if (jsonStr.startsWith('```')) {
         jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(jsonStr) as {
         title: string
         excerpt: string
         body_html: string
         tags: string[]
         seo_title: string
         seo_description: string
      }

      // Step 2: Create unique slug
      const baseSlug = slugify(parsed.title)
      const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const slug = `${baseSlug}-${dateSuffix}`

      // Check if slug already exists
      const existing = await prisma.blogPost.findUnique({ where: { slug } })
      if (existing) {
         return NextResponse.json({
            ok: false,
            message: 'Blog post with this slug already exists today',
            slug,
         })
      }

      // Step 3: Save to database
      const post = await prisma.blogPost.create({
         data: {
            slug,
            title_tr: parsed.title,
            excerpt_tr: parsed.excerpt,
            body_html_tr: parsed.body_html,
            tags: parsed.tags,
            status: 'published',
            published_at: new Date(),
            seo_title_tr: parsed.seo_title,
            seo_description_tr: parsed.seo_description,
         },
      })

      // Step 4: Trigger revalidation on storefront (best-effort)
      try {
         const storefrontUrl = process.env.STOREFRONT_URL ?? 'https://xforgea3d.com'
         await fetch(`${storefrontUrl}/api/revalidate?path=/blog&secret=${envSecret ?? ''}`, {
            method: 'GET',
         }).catch(() => {})
      } catch {
         // Revalidation is best-effort
      }

      return NextResponse.json({
         ok: true,
         slug: post.slug,
         title: post.title_tr,
         type,
         topic,
      })
   } catch (error) {
      console.error('[AUTO_BLOG]', error)
      return NextResponse.json(
         { error: 'Blog generation failed', details: String(error) },
         { status: 500 }
      )
   }
}

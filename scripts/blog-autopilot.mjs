#!/usr/bin/env node
/**
 * xForgea3D Blog Autopilot
 * ────────────────────────
 * Generates and publishes SEO-optimized blog posts using Pollinations AI.
 * Targets local (Antalya/Muratpaşa/Akdeniz) + national 3D printing keywords.
 *
 * Usage:  node scripts/blog-autopilot.mjs
 * Cron:   LaunchAgent runs this twice daily (09:00 + 17:00)
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// ── KEYWORD POOLS ────────────────────────────────────────────────

const LOCAL_KEYWORDS = [
  'antalya 3d yazıcı',
  'antalya 3d baskı',
  'antalya 3d baskı hizmeti',
  'antalya 3d printer',
  'muratpaşa 3d yazıcı',
  'muratpaşa 3d baskı',
  'akdeniz 3d yazıcı',
  'akdeniz 3d baskı',
  'konyaaltı 3d yazıcı',
  'kepez 3d yazıcı',
  'antalya prototip üretim',
  'antalya 3d modelleme',
  'antalya filament',
  'antalya kişiye özel 3d baskı',
  'antalya araç aksesuar 3d baskı',
  'antalya 3d figür',
  'antalya 3d hediyelik',
  'antalya endüstriyel 3d yazıcı',
]

const NATIONAL_KEYWORDS = [
  '3d yazıcı fiyat',
  '3d yazıcı nedir',
  '3d baskı hizmeti türkiye',
  '3d baskı nasıl yapılır',
  '3d yazıcı modelleri',
  '3d printer türkiye',
  'pla filament',
  'abs filament',
  'petg filament',
  'tpu filament',
  'filament fiyatları 2026',
  '3d baskı malzeme seçimi',
  '3d yazıcı ile para kazanma',
  '3d yazıcı ile ne yapılır',
  'prototipleme nedir',
  'rapid prototyping türkiye',
  '3d tarama hizmeti',
  '3d modelleme programları',
  'stl dosyası nedir',
  'fdm vs sla yazıcı',
  'reçineli 3d yazıcı',
  '3d baskı tolerans',
  '3d baskı sonrası işlem',
  '3d yazıcı bakım',
  '3d yazıcı kalibrasyon',
  'kişiye özel 3d baskı',
  'araç yedek parça 3d baskı',
  'mimari maket 3d baskı',
  '3d baskılı protez',
  'endüstriyel 3d yazıcı',
  '3d baskı sektörü büyüme',
  '3d baskı ve e-ticaret',
  'online 3d baskı sipariş',
]

// ── TOPIC TEMPLATES ──────────────────────────────────────────────
// Each template produces a unique angle. The script picks one that hasn't been used recently.

const TOPIC_TEMPLATES = [
  // LOCAL FOCUS
  { type: 'local', template: 'Antalya\'da 3D Baskı Hizmeti: {localKw} ile Projelerinizi Hayata Geçirin', focusKw: 'antalya 3d baskı hizmeti' },
  { type: 'local', template: 'Muratpaşa\'da 3D Yazıcı Çözümleri: Kişiye Özel Üretim', focusKw: 'muratpaşa 3d yazıcı' },
  { type: 'local', template: 'Akdeniz Bölgesinde 3D Baskı: Neden xForgea3D?', focusKw: 'akdeniz 3d yazıcı' },
  { type: 'local', template: 'Konyaaltı ve Kepez\'de 3D Yazıcı ile Üretim Devrimi', focusKw: 'konyaaltı 3d yazıcı' },
  { type: 'local', template: 'Antalya\'da Araç Aksesuar ve Yedek Parça 3D Baskı', focusKw: 'antalya araç aksesuar 3d baskı' },
  { type: 'local', template: 'Antalya\'da Kişiye Özel 3D Hediyelik Ürünler', focusKw: 'antalya kişiye özel 3d baskı' },
  { type: 'local', template: 'Antalya\'da Endüstriyel 3D Yazıcı Hizmetleri ve Prototipleme', focusKw: 'antalya endüstriyel 3d yazıcı' },
  { type: 'local', template: 'Antalya 3D Figür ve Heykel Baskı: Sanatı Teknolojiyle Buluşturun', focusKw: 'antalya 3d figür' },
  { type: 'local', template: 'Antalya\'da 3D Modelleme ve Tasarım Hizmetleri', focusKw: 'antalya 3d modelleme' },
  { type: 'local', template: 'Antalya\'da Filament Çeşitleri ve 3D Baskı Malzeme Rehberi', focusKw: 'antalya filament' },

  // NATIONAL — EDUCATIONAL
  { type: 'national', template: '3D Yazıcı Nedir? Başlangıç Rehberi (2026)', focusKw: '3d yazıcı nedir' },
  { type: 'national', template: '3D Baskı Nasıl Yapılır? Adım Adım Süreç', focusKw: '3d baskı nasıl yapılır' },
  { type: 'national', template: 'FDM vs SLA 3D Yazıcı: Hangisini Seçmeli?', focusKw: 'fdm vs sla yazıcı' },
  { type: 'national', template: 'STL Dosyası Nedir? 3D Baskıya Hazırlık Rehberi', focusKw: 'stl dosyası nedir' },
  { type: 'national', template: '3D Yazıcı Kalibrasyon Rehberi: Mükemmel Baskı İçin İpuçları', focusKw: '3d yazıcı kalibrasyon' },
  { type: 'national', template: '3D Baskı Sonrası İşlem Teknikleri: Zımparalama, Boyama, Kaplama', focusKw: '3d baskı sonrası işlem' },

  // NATIONAL — MATERIALS
  { type: 'national', template: 'PLA Filament Rehberi: Özellikleri, Avantajları ve Kullanım Alanları', focusKw: 'pla filament' },
  { type: 'national', template: 'ABS vs PLA vs PETG: 3D Baskı Malzeme Karşılaştırma', focusKw: '3d baskı malzeme seçimi' },
  { type: 'national', template: 'TPU Filament ile Esnek 3D Baskı: Nerede ve Nasıl Kullanılır?', focusKw: 'tpu filament' },
  { type: 'national', template: '2026 Filament Fiyatları ve Piyasa Analizi', focusKw: 'filament fiyatları 2026' },

  // NATIONAL — BUSINESS
  { type: 'national', template: '3D Yazıcı ile Para Kazanma: 10 İş Fikri', focusKw: '3d yazıcı ile para kazanma' },
  { type: 'national', template: 'Online 3D Baskı Sipariş: Tasarımını Yükle, Kapına Gelsin', focusKw: 'online 3d baskı sipariş' },
  { type: 'national', template: '3D Baskı ve E-Ticaret: Dijital Üretim Devrimi', focusKw: '3d baskı ve e-ticaret' },
  { type: 'national', template: 'Türkiye\'de 3D Baskı Sektörü: Büyüme Trendleri ve Fırsatlar', focusKw: '3d baskı sektörü büyüme' },

  // NATIONAL — USE CASES
  { type: 'national', template: 'Araç Yedek Parça 3D Baskı: Maliyet ve Kalite Karşılaştırması', focusKw: 'araç yedek parça 3d baskı' },
  { type: 'national', template: 'Mimari Maket 3D Baskı: Projelerinizi Somutlaştırın', focusKw: 'mimari maket 3d baskı' },
  { type: 'national', template: 'Kişiye Özel 3D Baskı: Hediye, Dekorasyon ve Daha Fazlası', focusKw: 'kişiye özel 3d baskı' },
  { type: 'national', template: 'Prototipleme Nedir? Ürün Geliştirmede 3D Baskının Rolü', focusKw: 'prototipleme nedir' },
  { type: 'national', template: 'Endüstriyel 3D Yazıcılar: İşletmeler İçin Rehber', focusKw: 'endüstriyel 3d yazıcı' },
  { type: 'national', template: '3D Yazıcı ile Neler Yapılabilir? 20 İlham Verici Örnek', focusKw: '3d yazıcı ile ne yapılır' },
  { type: 'national', template: '3D Modelleme Programları: Ücretsiz ve Ücretli Seçenekler', focusKw: '3d modelleme programları' },
  { type: 'national', template: 'Reçineli 3D Yazıcı Rehberi: Hassas Detaylar İçin', focusKw: 'reçineli 3d yazıcı' },
  { type: 'national', template: '3D Baskıda Tolerans ve Hassasiyet: Nelere Dikkat Etmeli?', focusKw: '3d baskı tolerans' },
  { type: 'national', template: '3D Yazıcı Bakım Rehberi: Uzun Ömürlü Kullanım İçin', focusKw: '3d yazıcı bakım' },
  { type: 'national', template: '3D Yazıcı Fiyatları 2026: Bütçeye Göre En İyi Modeller', focusKw: '3d yazıcı fiyat' },
  { type: 'national', template: '3D Tarama Hizmeti: Gerçek Nesneleri Dijitale Dönüştürün', focusKw: '3d tarama hizmeti' },
]

// ── POLLINATIONS API ────────────────────────────────────────────

const POLLINATIONS_TEXT = 'https://text.pollinations.ai/'
const POLLINATIONS_IMAGE = 'https://image.pollinations.ai/prompt/'

async function callPollinations(messages, jsonMode = false) {
  const res = await fetch(POLLINATIONS_TEXT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: 'openai',
      seed: Math.floor(Math.random() * 999999),
      jsonMode,
    }),
  })
  if (!res.ok) throw new Error(`Pollinations ${res.status}`)
  return res.text()
}

async function generateLongText(systemPrompt, userPrompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      // Generate main body
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      let body = await callPollinations(messages)
      console.log(`  Initial body: ${body.length} chars`)

      // If too short, ask for continuation
      if (body.length < 5000) {
        console.log('  Body too short, requesting continuation...')
        const contMessages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: body },
          { role: 'user', content: 'Devam et. Yazının geri kalanını yaz. En az 5 H2 başlık daha ekle, her birinin altında 2-3 paragraf olsun. İç linkler eklemeyi unutma. HTML olarak devam et.' },
        ]
        const continuation = await callPollinations(contMessages)
        body = body + '\n' + cleanHtml(continuation)
        console.log(`  After continuation: ${body.length} chars`)
      }

      // If still short, one more pass
      if (body.length < 5000) {
        console.log('  Still short, one more continuation...')
        const contMessages2 = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: body.slice(-2000) },
          { role: 'user', content: 'Yazıyı bitirmek için 3 bölüm daha ekle. xForgea3D CTA paragrafı ile bitir. HTML formatında yaz.' },
        ]
        const cont2 = await callPollinations(contMessages2)
        body = body + '\n' + cleanHtml(cont2)
        console.log(`  Final body: ${body.length} chars`)
      }

      if (body.length < 2000) throw new Error(`Body still too short: ${body.length}`)
      return body
    } catch (e) {
      console.error(`[attempt ${i + 1}] Text generation failed:`, e.message)
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

async function generateText(systemPrompt, userPrompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const text = await callPollinations([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ])
      if (text.length < 100) throw new Error('Response too short')
      return text
    } catch (e) {
      console.error(`[attempt ${i + 1}] Text generation failed:`, e.message)
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

function coverImageUrl(topic) {
  const prompt = encodeURIComponent(
    `professional 3D printing workshop, ${topic}, modern technology, clean studio lighting, industrial design, photorealistic, high quality`
  )
  return `${POLLINATIONS_IMAGE}${prompt}?width=1200&height=630&model=flux&nologo=true&seed=${Math.floor(Math.random() * 999999)}`
}

// ── SLUG GENERATION ─────────────────────────────────────────────

function slugify(text) {
  const turkishMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
  }
  return text
    .split('')
    .map(c => turkishMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// ── TOPIC SELECTION ─────────────────────────────────────────────

async function pickTopic() {
  // Get recently used slugs to avoid duplicates
  const recentPosts = await prisma.blogPost.findMany({
    select: { slug: true, tags: true },
    orderBy: { published_at: 'desc' },
    take: 50,
  })
  const usedSlugs = new Set(recentPosts.map(p => p.slug))
  const usedKeywords = new Set(recentPosts.flatMap(p => p.tags))

  // Shuffle templates
  const shuffled = [...TOPIC_TEMPLATES].sort(() => Math.random() - 0.5)

  // Prefer topics whose focus keyword hasn't been used
  for (const topic of shuffled) {
    const slug = slugify(topic.template)
    if (!usedSlugs.has(slug) && !usedKeywords.has(topic.focusKw)) {
      return topic
    }
  }

  // Fallback: any topic whose slug doesn't exist
  for (const topic of shuffled) {
    const slug = slugify(topic.template)
    if (!usedSlugs.has(slug)) {
      return topic
    }
  }

  // All topics used — pick random and add date suffix
  const topic = shuffled[0]
  topic.template += ` — ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`
  return topic
}

// ── CONTENT GENERATION ──────────────────────────────────────────

async function generateBlogPost(topic) {
  const secondaryLocal = LOCAL_KEYWORDS.filter(k => k !== topic.focusKw).sort(() => Math.random() - 0.5).slice(0, 4)
  const secondaryNational = NATIONAL_KEYWORDS.filter(k => k !== topic.focusKw).sort(() => Math.random() - 0.5).slice(0, 4)
  const allSecondary = [...secondaryLocal, ...secondaryNational]

  const systemPrompt = `Sen xForgea3D markası için Türkçe SEO blog yazarısın. ÇOK UZUN ve DETAYLI yazıyorsun.
xForgea3D, Antalya Muratpaşa merkezli profesyonel 3D baskı ve yazıcı hizmetleri sunan bir marka.
Türkiye geneline kargo ile hizmet veriyor. Web sitesi: https://xforgea3d.com

KRİTİK KURALLAR:
1. SADECE HTML yaz. Markdown KULLANMA. Açıklama YAZMA. <html>, <body>, <h1> tag KOYMA.
2. İlk satır <p> ile başlasın.
3. EN AZ 8 adet <h2> başlık kullan. Her <h2> altında EN AZ 3 paragraf yaz.
4. Her paragraf 3-5 cümle olsun. KISA PARAGRAF YAZMA.
5. Toplam EN AZ 2000 kelime yaz. Bu çok önemli. Uzun ve detaylı yaz.
6. Anahtar kelimeleri doğal kullan. İlk 2 paragrafta birincil keyword geçsin.
7. ŞU İÇ LİNKLERİ MUTLAKA EKLE (en az 4 tane):
   <a href="/products">3D baskı ürünlerimiz</a>
   <a href="/atolye">kendi tasarımınızı yükleyin</a>
   <a href="/products?category=Araç%20Aksesuarları">araç aksesuarları koleksiyonumuz</a>
   <a href="/shipping">kargo ve teslimat bilgileri</a>
   <a href="/faq">sıkça sorulan sorular</a>
   <a href="/blog">diğer blog yazılarımız</a>
8. Teknik bilgi ver: sıcaklık değerleri, toleranslar, malzeme özellikleri, somut rakamlar.
9. Son paragrafta xForgea3D CTA'sı olsun.
10. Gerçek bilgi yaz. Uydurma istatistik KULLANMA.`

  const userPrompt = `ÇOK UZUN ve DETAYLI bir blog yazısı yaz (en az 2000 kelime, 8+ başlık):

KONU: ${topic.template}
BİRİNCİL ANAHTAR KELİME: ${topic.focusKw}
İKİNCİL ANAHTAR KELİMELER: ${allSecondary.join(', ')}

YAZI YAPISI:
- Giriş (2 paragraf, birincil anahtar kelime ile)
- En az 6 farklı H2 bölümü (her biri 3+ paragraf)
- Her bölümde farklı bir ikincil anahtar kelime kullan
- Pratik ipuçları veya karşılaştırma tablosu ekle
- Son bölüm: xForgea3D ile çalışmanın avantajları + CTA
- İç linkleri paragraflara doğal şekilde yerleştir

ÖNEMLİ: Kısa yazma. Her bölüm detaylı olsun. Toplam en az 2000 kelime.`

  const bodyHtml = await generateLongText(systemPrompt, userPrompt)

  // Generate title + excerpt + SEO meta
  const metaPrompt = `Sen SEO uzmanısın. Aşağıdaki blog yazısı için JSON formatında şunları üret:
{
  "title": "SEO uyumlu Türkçe başlık (60-70 karakter, birincil anahtar kelime içersin)",
  "excerpt": "Meta description olarak da kullanılacak özet (150-160 karakter, birincil anahtar kelime içersin)",
  "seoTitle": "SEO title tag (60 karakter max, birincil anahtar kelime başta)",
  "tags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"]
}

BİRİNCİL ANAHTAR KELİME: ${topic.focusKw}
TİP: ${topic.type === 'local' ? 'Yerel (Antalya)' : 'Ulusal'}

SADECE JSON döndür, başka hiçbir şey yazma.`

  const metaRaw = await generateText(
    'Sen sadece valid JSON üreten bir asistansın. Markdown code fence kullanma, sadece raw JSON yaz.',
    metaPrompt,
  )

  let meta
  try {
    // Extract JSON from potential markdown fences or surrounding text
    const jsonMatch = metaRaw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    meta = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('Meta parse failed, using fallback:', e.message)
    meta = {
      title: topic.template,
      excerpt: `${topic.focusKw} hakkında detaylı rehber. xForgea3D ile 3D baskı dünyasını keşfedin.`,
      seoTitle: `${topic.focusKw} | xForgea3D Blog`,
      tags: [topic.focusKw, '3d baskı', '3d yazıcı', 'xforgea3d'],
    }
  }

  // Ensure focus keyword is in tags
  const tags = [...new Set([topic.focusKw, ...(meta.tags || [])].map(t => t.toLowerCase()))]

  let finalBody = cleanHtml(bodyHtml)

  // Inject internal links if AI didn't include them
  if (!finalBody.includes('href="/')) {
    finalBody = injectInternalLinks(finalBody)
  }

  // Derive excerpt from body if meta generation failed
  const excerpt = (meta.excerpt && meta.excerpt.length >= 50)
    ? meta.excerpt
    : extractExcerpt(finalBody, topic.focusKw)

  return {
    title: meta.title || topic.template,
    excerpt,
    seoTitle: meta.seoTitle || `${topic.focusKw} | xForgea3D Blog`,
    bodyHtml: finalBody,
    tags,
    coverImageUrl: coverImageUrl(topic.focusKw),
  }
}

// ── INTERNAL LINK INJECTION ─────────────────────────────────────

const LINK_INJECTIONS = [
  { pattern: /3[Dd] baskı (ürün|ürünler)/g, link: '<a href="/products">3D baskı ürünlerimiz</a>' },
  { pattern: /kendi tasarım/g, link: '<a href="/atolye">kendi tasarımınızı yükleyin</a>' },
  { pattern: /araç (aksesuar|parça|yedek)/gi, link: '<a href="/products?category=Araç%20Aksesuarları">araç aksesuarları koleksiyonumuz</a>' },
  { pattern: /kargo/gi, link: '<a href="/shipping">kargo ve teslimat</a>' },
  { pattern: /sıkça sorulan/gi, link: '<a href="/faq">sıkça sorulan sorular</a>' },
]

function injectInternalLinks(html) {
  // Add a CTA section at the end with internal links
  const ctaBlock = `
<h2>xForgea3D ile Projelerinizi Hayata Geçirin</h2>
<p>Antalya merkezli profesyonel 3D baskı hizmetimizle istediğiniz ürünü üretebilirsiniz. <a href="/products">3D baskı ürünlerimize</a> göz atın veya <a href="/atolye">kendi tasarımınızı yükleyerek</a> özel sipariş verin. <a href="/products?category=Araç%20Aksesuarları">Araç aksesuarları koleksiyonumuzu</a> da incelemeyi unutmayın.</p>
<p>Türkiye geneline hızlı <a href="/shipping">kargo ve teslimat</a> yapıyoruz. Sorularınız için <a href="/faq">SSS sayfamızı</a> ziyaret edebilir veya bizimle iletişime geçebilirsiniz.</p>`

  return html + ctaBlock
}

function extractExcerpt(html, focusKw) {
  // Strip HTML tags and get first 160 chars
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  // Prefer a sentence containing the focus keyword
  const kwSentence = sentences.find(s => s.toLowerCase().includes(focusKw))
  const base = (kwSentence || sentences[0] || text).trim()
  return base.length > 155 ? base.slice(0, 152) + '...' : base + '.'
}

// ── HTML CLEANUP ────────────────────────────────────────────────

function cleanHtml(html) {
  return html
    // Remove markdown code fences if AI wrapped output
    .replace(/^```html?\s*/i, '')
    .replace(/\s*```$/i, '')
    // Remove <html>, <body>, <head>, <!DOCTYPE> tags
    .replace(/<\/?(html|body|head|!doctype)[^>]*>/gi, '')
    // Remove <h1> tags (page already has one)
    .replace(/<h1[^>]*>.*?<\/h1>/gi, '')
    // Trim whitespace
    .trim()
}

// ── QUALITY GATE ────────────────────────────────────────────────

function qualityCheck(post) {
  const issues = []

  if (!post.title || post.title.length < 20) issues.push('Title too short')
  if (!post.bodyHtml || post.bodyHtml.length < 2000) issues.push(`Body too short (${post.bodyHtml?.length || 0} chars, need 2000+)`)
  if (!post.bodyHtml?.includes('<h2')) issues.push('No H2 headings found')

  // Check for keyword presence
  const bodyLower = (post.bodyHtml || '').toLowerCase()
  const hasKeyword = post.tags.some(tag => bodyLower.includes(tag))
  if (!hasKeyword) issues.push('Focus keyword not found in body')

  return { pass: issues.length === 0, issues }
}

// ── MAIN ────────────────────────────────────────────────────────

async function main() {
  console.log(`[${new Date().toISOString()}] Blog autopilot starting...`)

  try {
    // 1. Pick topic
    const topic = await pickTopic()
    console.log(`Topic: ${topic.template} (${topic.type})`)
    console.log(`Focus keyword: ${topic.focusKw}`)

    // 2. Generate content
    console.log('Generating content via Pollinations...')
    const post = await generateBlogPost(topic)

    // 3. Quality gate
    const qc = qualityCheck(post)
    if (!qc.pass) {
      console.error('Quality check FAILED:', qc.issues.join(', '))
      console.log('Retrying with regeneration...')

      // One retry
      const post2 = await generateBlogPost(topic)
      const qc2 = qualityCheck(post2)
      if (!qc2.pass) {
        console.error('Quality check FAILED again:', qc2.issues.join(', '))
        console.error('Aborting. Will retry next scheduled run.')
        process.exit(1)
      }
      Object.assign(post, post2)
    }
    console.log(`Quality check PASSED. Body: ${post.bodyHtml.length} chars`)

    // 4. Create slug
    const slug = slugify(post.title) + '-' + randomUUID().slice(0, 6)

    // 5. Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      console.error(`Slug "${slug}" already exists. Aborting.`)
      process.exit(1)
    }

    // 6. Insert into DB
    const created = await prisma.blogPost.create({
      data: {
        slug,
        title_tr: post.title,
        excerpt_tr: post.excerpt,
        body_html_tr: post.bodyHtml,
        cover_image_url: post.coverImageUrl,
        tags: post.tags,
        status: 'published',
        published_at: new Date(),
        seo_title_tr: post.seoTitle,
        seo_description_tr: post.excerpt,
      },
    })

    console.log(`Published: "${created.title_tr}"`)
    console.log(`Slug: ${created.slug}`)
    console.log(`URL: https://xforgea3d.com/blog/${created.slug}`)
    console.log(`Tags: ${created.tags.join(', ')}`)

    // 7. Trigger ISR revalidation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xforgea3d.com'
    try {
      await fetch(`${siteUrl}/api/revalidate?path=/blog`, { method: 'GET' })
      await fetch(`${siteUrl}/api/revalidate?path=/blog/${slug}`, { method: 'GET' })
    } catch (e) {
      console.warn('ISR revalidation skipped (non-fatal):', e.message)
    }

    console.log(`[${new Date().toISOString()}] Done.`)
  } catch (e) {
    console.error('FATAL:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

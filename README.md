# xForgea3D

**Premium 3D baski ve aksesuar e-ticaret platformu.**

3D yazici teknolojisiyle uretilen oto yedek parca, heykel, figur ve aksesuar satan modern bir e-ticaret sistemi.

---

## Teknoloji Yigini

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript |
| Veritabani | PostgreSQL (Supabase) |
| ORM | Prisma |
| Kimlik Dogrulama | Supabase Auth (E-posta/Sifre + Google OAuth) |
| Stil | Tailwind CSS + shadcn/ui |
| AI | Google Gemini 2.0 Flash |
| Test | Vitest |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Proje Yapisi

Bu proje monorepo mimarisinde calisir:

```
xforgea3d/
├── apps/
│   ├── admin/          # Yonetim paneli (port 8888)
│   └── storefront/     # Musteri magazasi (port 7777)
├── packages/
│   ├── mail/           # E-posta servisi
│   ├── oauth/          # OAuth entegrasyonu
│   ├── regex/          # Regex yardimcilari
│   ├── rng/            # Rastgele sayi ureteci
│   ├── slugify/        # URL slug donusturucu
│   ├── sms/            # SMS servisi
│   └── zarinpal/       # Odeme entegrasyonu
├── scripts/            # Yardimci betikler
└── package.json        # Root yapilandirma
```

---

## Kurulum

### Gereksinimler

- Node.js 20+
- Supabase hesabi (veritabani ve auth icin)

### Adimlar

```bash
# 1. Bagimliliklari yukle
npm install

# 2. Ortam degiskenlerini ayarla
cp apps/storefront/.env.example apps/storefront/.env
cp apps/admin/.env.example apps/admin/.env
```

`.env` dosyalarinda asagidaki degiskenleri tanimlayin:

| Degisken | Aciklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL baglanti adresi |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonim anahtar |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase servis anahtari |
| `GEMINI_API_KEY` | Google Gemini API anahtari |
| `PAYMENT_API_KEY` | Odeme sistemi API anahtari |
| `PAYMENT_SECRET_KEY` | Odeme sistemi gizli anahtar |

```bash
# 3. Veritabanini hazirla
cd apps/storefront && npx prisma generate && npx prisma db push

# 4. Gelistirme sunucularini baslat
npm run dev:storefront   # Magaza: http://localhost:7777
npm run dev:admin         # Admin:  http://localhost:8888
```

---

## Admin Paneli Kullanim Kilavuzu

Admin paneline `http://localhost:8888` adresinden erisebilirsiniz. Giris icin tanimli admin e-postasi gereklidir.

### Kategori Ekleme

1. Sol menuden **Kategoriler** sayfasina gidin.
2. **Yeni Ekle** butonuna tiklayin.
3. Kategori adini ve aciklamasini girin.
4. Isterseniz arkaplan gorseli URL'si ekleyin.
5. **Olustur** butonuyla kaydedin.

### Urun Ekleme

1. Sol menuden **Urunler** sayfasina gidin.
2. **Yeni Ekle** butonuna tiklayin.
3. Urun basligi, aciklamasi, fiyati, stok durumu ve gorsellerini doldurun.
4. Kategori, koleksiyon ve arac modeli eslestirmesini yapin.
5. "Kisiye Ozel" urunler icin renk, boyut secenekleri ve dosya yukleme ayarlarini belirleyin.
6. **Olustur** butonuyla kaydedin.

### Koleksiyon (Marka) Ekleme

1. Sol menuden **Koleksiyonlar** sayfasina gidin.
2. **Yeni Ekle** butonuna tiklayin.
3. Koleksiyon adi, aciklamasi ve logosunu girin.
4. **Olustur** butonuyla kaydedin.

### Araba Marka ve Model Yonetimi

1. Sol menuden **Araba Markalari** sayfasina gidin.
2. Yeni araba markasi ekleyin.
3. Her marka altina model tanimlamalari yapin.
4. Urunleri duzenlerken ilgili arac modeliyle eslestirin.

### Banner Yonetimi

1. Sol menuden **Bannerlar** sayfasina gidin.
2. **Yeni Ekle** butonuna tiklayin.
3. Banner basligini girin ve gorsel yukleyin.
4. **Olustur** butonuyla kaydedin.
5. Bannerlar ana sayfada otomatik olarak goruntulenir.

### Navbar (Menu) Yonetimi

1. Sol menuden **Navbar Yonetimi** sayfasina gidin.
2. **Yeni Oge** butonuyla menu ogesi ekleyin.
3. Etiket, link ve bolum (Ana Menu / Mobil Menu / Alt Menu) bilgilerini girin.
4. Mevcut ogeleri ok tuslariyyla siralayin, goz ikonuyla gorunurlugunu ayarlayin.
5. Kalem ikonuyla duzenleyin, cop kutusuyla silin.

---

## Port Bilgileri

| Uygulama | Port | Adres |
|----------|------|-------|
| Magaza (Storefront) | 7777 | http://localhost:7777 |
| Yonetim Paneli (Admin) | 8888 | http://localhost:8888 |

---

## Gelistirici

### **Onur Huseyin Kocak**

Bu proje Onur Huseyin Kocak tarafindan tasarlanmis ve gelistirilmistir.

---

## Lisans

Tum haklari saklidir. Bu yazilim xForgea3D'ye aittir.

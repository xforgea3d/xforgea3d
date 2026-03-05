import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const carBrandsData = [
   {
      name: 'BMW', slug: 'bmw', sortOrder: 1, logoUrl: '/cars/brands/bmw.png',
      models: [
         { name: '3 Serisi', slug: '3-serisi', yearRange: '2019-2025', imageUrl: '/cars/models/bmw-3-serisi.png' },
         { name: '5 Serisi', slug: '5-serisi', yearRange: '2020-2025', imageUrl: '/cars/models/bmw-5-serisi.png' },
         { name: 'X3', slug: 'x3', yearRange: '2018-2025', imageUrl: '/cars/models/bmw-x3.png' },
         { name: 'X5', slug: 'x5', yearRange: '2019-2025', imageUrl: '/cars/models/bmw-x5.png' },
         { name: 'M4', slug: 'm4', yearRange: '2021-2025', imageUrl: '/cars/models/bmw-m4.png' },
      ],
   },
   {
      name: 'Mercedes-Benz', slug: 'mercedes-benz', sortOrder: 2, logoUrl: '/cars/brands/mercedes-benz.png',
      models: [
         { name: 'C Serisi', slug: 'c-serisi', yearRange: '2018-2025', imageUrl: '/cars/models/mercedes-benz-c-serisi.png' },
         { name: 'E Serisi', slug: 'e-serisi', yearRange: '2020-2025', imageUrl: '/cars/models/mercedes-benz-e-serisi.png' },
         { name: 'A Serisi', slug: 'a-serisi', yearRange: '2019-2025', imageUrl: '/cars/models/mercedes-benz-a-serisi.png' },
         { name: 'GLC', slug: 'glc', yearRange: '2020-2025', imageUrl: '/cars/models/mercedes-benz-glc.png' },
      ],
   },
   {
      name: 'Audi', slug: 'audi', sortOrder: 3, logoUrl: '/cars/brands/audi.png',
      models: [
         { name: 'A3', slug: 'a3', yearRange: '2020-2025', imageUrl: '/cars/models/audi-a3.png' },
         { name: 'A4', slug: 'a4', yearRange: '2019-2025', imageUrl: '/cars/models/audi-a4.png' },
         { name: 'A6', slug: 'a6', yearRange: '2018-2025', imageUrl: '/cars/models/audi-a6.png' },
         { name: 'Q5', slug: 'q5', yearRange: '2019-2025', imageUrl: '/cars/models/audi-q5.png' },
      ],
   },
   {
      name: 'Volkswagen', slug: 'volkswagen', sortOrder: 4, logoUrl: '/cars/brands/volkswagen.png',
      models: [
         { name: 'Golf', slug: 'golf', yearRange: '2017-2025', imageUrl: '/cars/models/volkswagen-golf.png' },
         { name: 'Passat', slug: 'passat', yearRange: '2018-2025', imageUrl: '/cars/models/volkswagen-passat.png' },
         { name: 'Tiguan', slug: 'tiguan', yearRange: '2019-2025', imageUrl: '/cars/models/volkswagen-tiguan.png' },
         { name: 'Polo', slug: 'polo', yearRange: '2018-2025', imageUrl: '/cars/models/volkswagen-polo.png' },
      ],
   },
   {
      name: 'Toyota', slug: 'toyota', sortOrder: 5, logoUrl: '/cars/brands/toyota.png',
      models: [
         { name: 'Corolla', slug: 'corolla', yearRange: '2019-2025', imageUrl: '/cars/models/toyota-corolla.png' },
         { name: 'C-HR', slug: 'c-hr', yearRange: '2020-2025', imageUrl: '/cars/models/toyota-c-hr.png' },
         { name: 'RAV4', slug: 'rav4', yearRange: '2019-2025', imageUrl: '/cars/models/toyota-rav4.png' },
      ],
   },
   {
      name: 'Honda', slug: 'honda', sortOrder: 6, logoUrl: '/cars/brands/honda.png',
      models: [
         { name: 'Civic', slug: 'civic', yearRange: '2017-2025', imageUrl: '/cars/models/honda-civic.png' },
         { name: 'CR-V', slug: 'cr-v', yearRange: '2018-2025', imageUrl: '/cars/models/honda-cr-v.png' },
         { name: 'Jazz', slug: 'jazz', yearRange: '2020-2025', imageUrl: '/cars/models/honda-jazz.png' },
      ],
   },
   {
      name: 'Hyundai', slug: 'hyundai', sortOrder: 7, logoUrl: '/cars/brands/hyundai.png',
      models: [
         { name: 'Tucson', slug: 'tucson', yearRange: '2020-2025', imageUrl: '/cars/models/hyundai-tucson.png' },
         { name: 'i20', slug: 'i20', yearRange: '2019-2025', imageUrl: '/cars/models/hyundai-i20.png' },
         { name: 'Kona', slug: 'kona', yearRange: '2021-2025', imageUrl: '/cars/models/hyundai-kona.png' },
         { name: 'Bayon', slug: 'bayon', yearRange: '2021-2025', imageUrl: '/cars/models/hyundai-bayon.png' },
      ],
   },
   {
      name: 'Renault', slug: 'renault', sortOrder: 8, logoUrl: '/cars/brands/renault.png',
      models: [
         { name: 'Clio', slug: 'clio', yearRange: '2019-2025', imageUrl: '/cars/models/renault-clio.png' },
         { name: 'Megane', slug: 'megane', yearRange: '2016-2025', imageUrl: '/cars/models/renault-megane.png' },
         { name: 'Kadjar', slug: 'kadjar', yearRange: '2018-2025', imageUrl: '/cars/models/renault-kadjar.png' },
      ],
   },
   {
      name: 'Fiat', slug: 'fiat', sortOrder: 9, logoUrl: '/cars/brands/fiat.jpg',
      models: [
         { name: 'Egea', slug: 'egea', yearRange: '2015-2025', imageUrl: '/cars/models/fiat-egea.png' },
         { name: '500', slug: '500', yearRange: '2020-2025', imageUrl: '/cars/models/fiat-500.png' },
         { name: 'Tipo', slug: 'tipo', yearRange: '2016-2025', imageUrl: '/cars/models/fiat-tipo.png' },
      ],
   },
   {
      name: 'Ford', slug: 'ford', sortOrder: 10, logoUrl: '/cars/brands/ford.png',
      models: [
         { name: 'Focus', slug: 'focus', yearRange: '2018-2025', imageUrl: '/cars/models/ford-focus.png' },
         { name: 'Kuga', slug: 'kuga', yearRange: '2020-2025', imageUrl: '/cars/models/ford-kuga.png' },
         { name: 'Puma', slug: 'puma', yearRange: '2020-2025', imageUrl: '/cars/models/ford-puma.png' },
         { name: 'Fiesta', slug: 'fiesta', yearRange: '2017-2024', imageUrl: '/cars/models/ford-fiesta.png' },
      ],
   },
]

async function main() {
   // Markalar (Brands) oluştur
   const xforgeBrand = await prisma.brand.create({
      data: {
         title: 'xForge 3D',
         description: 'Premium kalite 3D baskı tasarımlarımız',
         logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200',
      },
   })

   const nintendoBrand = await prisma.brand.create({
      data: {
         title: 'Nintendo',
         description: 'Oyun dünyasının efsanevi karakterleri',
         logo: 'https://images.unsplash.com/photo-1629856515433-2ba9ce9aa23e?auto=format&fit=crop&q=80&w=200&h=200',
      },
   })

   // Kategoriler (Categories) oluştur
   // Navbar ile eşleşmesi için "Figürler", "Heykeller", "Dekoratif" ve "Aksesuarlar" ekleniyor
   const figurlerCat = await prisma.category.create({
      data: {
         title: 'Figürler',
         description: 'Oyun, anime ve fantezi karakterlerinin 3D figürleri',
      },
   })

   const heykellerCat = await prisma.category.create({
      data: {
         title: 'Heykeller',
         description: 'Sanatsal ve dekoratif 3D baskı heykeller',
      },
   })

   const dekoratifCat = await prisma.category.create({
      data: {
         title: 'Dekoratif',
         description: 'Ev ve ofis dekorasyonu için benzersiz parçalar',
      },
   })

   const aksesuarlarCat = await prisma.category.create({
      data: {
         title: 'Aksesuarlar',
         description: 'Kişisel kullanım ve oyun gereçleri',
      },
   })

   // Ürünler (Products) oluştur
   console.log('Ürünler ekleniyor...')

   await prisma.product.create({
      data: {
         title: 'Elden Ring: Malenia Figür (Epik Boyut) ⚔️',
         description: 'Demigod Malenia karakterinin efsanevi detaylarla işlenmiş 1/6 ölçekli figürü. Premium reçine baskı.',
         price: 1850.0,
         discount: 1499.0,
         isFeatured: true,
         isAvailable: true,
         stock: 12,
         metadata: { "malzeme": "Premium Reçine", "yukseklik": "35cm", "boyama": "El Boyaması" },
         images: [
            'https://res.cloudinary.com/dvjn0gnhd/image/upload/v1740428514/lhm0d6oaj9mxtlyrly89.jpg',
            'https://images.unsplash.com/photo-1621252178000-845f1b1b9e25?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['elden ring', 'malenia', 'figür', 'oyun'],
         brandId: xforgeBrand.id,
         categories: {
            connect: [{ id: figurlerCat.id }]
         },
      },
   })

   await prisma.product.create({
      data: {
         title: 'Zelda Master Sword Replica 🗡️',
         description: 'The Legend of Zelda oyun serisinden Master Sword. Duvara asılabilir, tam boyutlu cosplay ve dekoratif parça.',
         price: 1200.0,
         isFeatured: true,
         isAvailable: true,
         stock: 5,
         metadata: { "malzeme": "PLA Plus", "uzunluk": "100cm" },
         images: [
            'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['zelda', 'Nintendo', 'kılıç', 'cosplay'],
         brandId: nintendoBrand.id,
         categories: {
            connect: [{ id: figurlerCat.id }, { id: aksesuarlarCat.id }]
         },
      },
   })

   await prisma.product.create({
      data: {
         title: 'Antik Yunan Büstü: Apollo 🏛️',
         description: 'Klasik antik Yunan döneminden ilham alan sanat eseri. Ofis masanız veya kütüphaneniz için mükemmel bir heykel.',
         price: 650.0,
         discount: 500.0,
         isFeatured: false,
         isAvailable: true,
         stock: 22,
         metadata: { "malzeme": "Mermer Efektli PLA", "yukseklik": "20cm" },
         images: [
            'https://images.unsplash.com/photo-1620078877543-176c4e09ad7b?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1582531023778-95a2dd78b277?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['heykel', 'apollo', 'antik', 'büst'],
         brandId: xforgeBrand.id,
         categories: {
            connect: [{ id: heykellerCat.id }, { id: dekoratifCat.id }]
         },
      },
   })

   await prisma.product.create({
      data: {
         title: 'Düşünen Adam Heykeli 🧠',
         description: 'Rodin\'in efsanevi eserinin geometrik (low-poly) 3D baskı versiyonu.',
         price: 450.0,
         isFeatured: false,
         isAvailable: true,
         stock: 8,
         metadata: { "malzeme": "Mat Siyah PLA", "yukseklik": "15cm" },
         images: [
            'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['rodin', 'düşünen adam', 'heykel', 'modern'],
         brandId: xforgeBrand.id,
         categories: {
            connect: [{ id: heykellerCat.id }]
         },
      },
   })

   await prisma.product.create({
      data: {
         title: 'Geometrik Kurt Duvar Dekoru 🐺',
         description: 'Modern tasarımlı, duvara asılabilir geometrik kurt figürü.',
         price: 320.0,
         isFeatured: true,
         isAvailable: true,
         stock: 14,
         metadata: { "malzeme": "PLA", "en": "30cm", "boy": "40cm" },
         images: [
            'https://images.unsplash.com/photo-1534360673418-490b4d44087b?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['kurt', 'duvar', 'dekoratif', 'geometrik'],
         brandId: xforgeBrand.id,
         categories: {
            connect: [{ id: dekoratifCat.id }]
         },
      },
   })

   await prisma.product.create({
      data: {
         title: 'Astronot Telefon Tutucu 👨‍🚀',
         description: 'Masanızda telefonunuzu tutan sevimli bir astronot figürü.',
         price: 180.0,
         discount: 150.0,
         isFeatured: false,
         isAvailable: true,
         stock: 50,
         metadata: { "malzeme": "Beyaz PLA", "yukseklik": "10cm" },
         images: [
            'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800'
         ],
         keywords: ['telefon tutucu', 'astronot', 'uzay', 'aksesuar'],
         brandId: xforgeBrand.id,
         categories: {
            connect: [{ id: aksesuarlarCat.id }]
         },
      },
   })

   // ── Car Brands + Models ───────────────────────────────────────────
   console.log('Araç markaları ve modelleri ekleniyor...')

   for (const brandData of carBrandsData) {
      const { models, ...brandFields } = brandData
      const brand = await prisma.carBrand.upsert({
         where: { slug: brandFields.slug },
         update: { name: brandFields.name, sortOrder: brandFields.sortOrder, logoUrl: brandFields.logoUrl },
         create: brandFields,
      })
      console.log(`  Marka: ${brand.name}`)

      for (const model of models) {
         await prisma.carModel.upsert({
            where: { slug_brandId: { slug: model.slug, brandId: brand.id } },
            update: { name: model.name, yearRange: model.yearRange, imageUrl: model.imageUrl },
            create: { ...model, brandId: brand.id },
         })
      }
   }

   // ── Hidden "Talep Edilen Parça" product (quote accept → order flow) ──
   console.log('Gizli talep ürünü ekleniyor...')

   const systemBrand = await prisma.brand.upsert({
      where: { title: 'xForgea3D' },
      update: {},
      create: { title: 'xForgea3D', description: 'Sistem markası' },
   })

   await prisma.product.upsert({
      where: { id: 'quote-request-product' },
      update: {},
      create: {
         id: 'quote-request-product',
         title: 'Talep Edilen Parça',
         description: 'Parça talep sistemi üzerinden oluşturulan sipariş kalemi.',
         images: [],
         keywords: ['talep', 'parça', 'quote'],
         price: 0,
         discount: 0,
         stock: 999999,
         isPhysical: true,
         isAvailable: false,
         isFeatured: false,
         brandId: systemBrand.id,
      },
   })

   // ── Default Nav Items ───────────────────────────────────────
   console.log('Navbar öğeleri ekleniyor...')

   const navItems = [
      { label: 'Ürünler', href: '/products', section: 'main', sortOrder: 0 },
      { label: 'Kategoriler', href: '#kategoriler', section: 'main', sortOrder: 1 },
      { label: 'Araç Parçaları', href: '#arac-parcalari', section: 'main', sortOrder: 2 },
      { label: 'Koleksiyonlar', href: '#koleksiyonlar', section: 'main', sortOrder: 3 },
      { label: 'Atölye', href: '/atolye', section: 'main', sortOrder: 4 },
      { label: 'Blog', href: '/blog', section: 'main', sortOrder: 5 },
      // Mobile
      { label: 'Ürünler', href: '/products', section: 'mobile', sortOrder: 0 },
      { label: 'Araç Parçaları', href: '#arac-parcalari', section: 'mobile', sortOrder: 1 },
      { label: 'Parça Talep Et', href: '/quote-request', section: 'mobile', sortOrder: 2 },
      { label: 'Atölye', href: '/atolye', section: 'mobile', sortOrder: 3 },
      { label: 'Blog', href: '/blog', section: 'mobile', sortOrder: 4 },
   ]

   for (const item of navItems) {
      await prisma.navMenuItem.upsert({
         where: { id: `seed-${item.section}-${item.sortOrder}` },
         update: { label: item.label, href: item.href },
         create: { id: `seed-${item.section}-${item.sortOrder}`, ...item },
      })
   }

   console.log('Seed başarıyla tamamlandı! ✅')
}

main()
   .then(async () => {
      await prisma.$disconnect()
   })
   .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
   })

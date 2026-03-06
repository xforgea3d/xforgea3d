/**
 * xForgea3D - Set car brand logos & model images to local files
 * Uses files from public/cars/brands/ and public/cars/models/
 * Run: cd apps/storefront && node ../../seed-local-images.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
   console.log('\n=== Araba Marka Logo & Model Görselleri (local) ===\n');

   // 1. Update car brand logos
   console.log('1. Marka logoları güncelleniyor...');
   const brands = await prisma.carBrand.findMany({ select: { id: true, name: true, slug: true } });
   for (const brand of brands) {
      const ext = brand.slug === 'fiat' ? 'jpg' : 'png';
      const logoUrl = `/cars/brands/${brand.slug}.${ext}`;
      await prisma.carBrand.update({ where: { id: brand.id }, data: { logoUrl } });
      console.log(`   ✓ ${brand.name} → ${logoUrl}`);
   }

   // 2. Update car model images
   console.log('\n2. Model görselleri güncelleniyor...');
   const models = await prisma.carModel.findMany({
      select: { id: true, name: true, slug: true, brand: { select: { name: true, slug: true } } },
   });
   for (const model of models) {
      const imageUrl = `/cars/models/${model.brand.slug}-${model.slug}.png`;
      await prisma.carModel.update({ where: { id: model.id }, data: { imageUrl } });
      console.log(`   ✓ ${model.brand.name} ${model.name} → ${imageUrl}`);
   }

   console.log(`\n=== Tamamlandı! ${brands.length} logo + ${models.length} model görseli güncellendi ===`);
}

main()
   .then(() => prisma.$disconnect())
   .catch(async (e) => {
      console.error('HATA:', e);
      await prisma.$disconnect();
      process.exit(1);
   });

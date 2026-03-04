/**
 * xForgea3D - Real Car Brand Logos & Model Photos
 * Uses Wikimedia Commons verified images
 * Run: cd apps/storefront && node ../../seed-real-images.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brandLogos = {
   'bmw': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png',
   'mercedes-benz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mercedes-Benz_Logo_2010.svg/200px-Mercedes-Benz_Logo_2010.svg.png',
   'audi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png',
   'volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png',
   'toyota': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota.svg/200px-Toyota.svg.png',
   'honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/200px-Honda.svg.png',
   'hyundai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
   'renault': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Renault_2009_logo.svg/200px-Renault_2009_logo.svg.png',
   'fiat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fiat_Automobiles_logo.svg/200px-Fiat_Automobiles_logo.svg.png',
   'ford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/200px-Ford_logo_flat.svg.png',
};

const modelImages = {
   // BMW
   '3-serisi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/19_BMW_G20_1.jpg/640px-19_BMW_G20_1.jpg',
   '5-serisi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/0_BMW_G30_1.jpg/640px-0_BMW_G30_1.jpg',
   'x3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2018_BMW_X3_xDrive30d_M_Sport_Automatic_3.0_Front.jpg/640px-2018_BMW_X3_xDrive30d_M_Sport_Automatic_3.0_Front.jpg',
   'x5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/0_BMW_X5_4.jpg/640px-0_BMW_X5_4.jpg',
   'm4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BMW_M4_CS_%28G82%29_VR46_Edition_IAA_2025_DSC_1308.jpg/640px-BMW_M4_CS_%28G82%29_VR46_Edition_IAA_2025_DSC_1308.jpg',
   // Mercedes-Benz
   'c-serisi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg/640px-Mercedes-AMG_C_63_%28W206%29_IMG_0310.jpg',
   'e-serisi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_W214_1X7A1843.jpg/640px-Mercedes-Benz_W214_1X7A1843.jpg',
   'a-serisi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mercedes-Benz_W177_%282022%29_1X7A6988.jpg/640px-Mercedes-Benz_W177_%282022%29_1X7A6988.jpg',
   'glc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mercedes-AMG_GLC_63_%28X254%29_IMG_0288.jpg/640px-Mercedes-AMG_GLC_63_%28X254%29_IMG_0288.jpg',
   // Audi
   'a3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2024_Audi_A3_8Y_Sedan_IMG_1026.jpg/640px-2024_Audi_A3_8Y_Sedan_IMG_1026.jpg',
   'a4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Audi_A4_B9_sedans_%28FL%29_1X7A6817.jpg/640px-Audi_A4_B9_sedans_%28FL%29_1X7A6817.jpg',
   'a6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Audi_A6_50_TDI_Quattro_Premium_C8_Daytona_Gray_Pearl_%286%29.jpg/640px-Audi_A6_50_TDI_Quattro_Premium_C8_Daytona_Gray_Pearl_%286%29.jpg',
   'q5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Audi_Q5_FY_50_TFSI_e_Facelift_IMG_5284.jpg/640px-Audi_Q5_FY_50_TFSI_e_Facelift_IMG_5284.jpg',
   // Volkswagen
   'golf': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Volkswagen_Golf_VIII_R_Variant_1X7A0415.jpg/640px-Volkswagen_Golf_VIII_R_Variant_1X7A0415.jpg',
   'passat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Volkswagen_Passat_B8_%282019%29_IMG_1992.jpg/640px-Volkswagen_Passat_B8_%282019%29_IMG_1992.jpg',
   'tiguan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Volkswagen_Tiguan_II_Facelift_Frontansicht%2C_FV-520%2C_Finanzpolizei_%C3%96sterreich%2C_Leoben%2C_2025.jpg/640px-Volkswagen_Tiguan_II_Facelift_Frontansicht%2C_FV-520%2C_Finanzpolizei_%C3%96sterreich%2C_Leoben%2C_2025.jpg',
   'polo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/AW_POLO_TrendLine.jpg/640px-AW_POLO_TrendLine.jpg',
   // Toyota
   'corolla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg/640px-2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg',
   'c-hr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Toyota_C-HR_Hybrid_%28AX20%29_DSC_7239.jpg/640px-Toyota_C-HR_Hybrid_%28AX20%29_DSC_7239.jpg',
   'rav4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota_RAV4_Plug-in_Hybrid_GR_Sport_IMG_9896.jpg/640px-Toyota_RAV4_Plug-in_Hybrid_GR_Sport_IMG_9896.jpg',
   // Honda
   'civic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/2022_Honda_Civic_LX_Sedan%2C_front_right%2C_11-02-2022.jpg/640px-2022_Honda_Civic_LX_Sedan%2C_front_right%2C_11-02-2022.jpg',
   'cr-v': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/2018_Honda_CR-V_%28RW_MY18%29_%2BSport_2WD_wagon_%282018-10-22%29_02.jpg/640px-2018_Honda_CR-V_%28RW_MY18%29_%2BSport_2WD_wagon_%282018-10-22%29_02.jpg',
   'jazz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Honda_Jazz_e_HEV_%282022%29_%2853322700161%29.jpg/640px-Honda_Jazz_e_HEV_%282022%29_%2853322700161%29.jpg',
   // Hyundai
   'tucson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Hyundai_Tucson_%28NX4%2C_SWB%29_PHEV_1X7A1858.jpg/640px-Hyundai_Tucson_%28NX4%2C_SWB%29_PHEV_1X7A1858.jpg',
   'i20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Hyundai_i20_%28BC3%29_1X7A6488.jpg/640px-Hyundai_i20_%28BC3%29_1X7A6488.jpg',
   'kona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hyundai_Kona_%28SX2%29_1X7A1646.jpg/640px-Hyundai_Kona_%28SX2%29_1X7A1646.jpg',
   'bayon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Hyundai_Bayon_1X7A0844.jpg/640px-Hyundai_Bayon_1X7A0844.jpg',
   // Renault
   'clio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Renault_Clio_V_1X7A0392.jpg/640px-Renault_Clio_V_1X7A0392.jpg',
   'megane': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Renault_Megane_IV_Grandtour_E-Tech_IMG_3333.jpg/640px-Renault_Megane_IV_Grandtour_E-Tech_IMG_3333.jpg',
   'kadjar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Renault_Kadjar_Filderstadt_1Y7A4842.jpg/640px-Renault_Kadjar_Filderstadt_1Y7A4842.jpg',
   // Fiat
   'egea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Fiat_Tipo_Cross_1X7A0340.jpg/640px-Fiat_Tipo_Cross_1X7A0340.jpg',
   '500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2020_Fiat_500_1.0_Hybrid.jpg/640px-2020_Fiat_500_1.0_Hybrid.jpg',
   'tipo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Fiat_Tipo_Cross_1X7A0340.jpg/640px-Fiat_Tipo_Cross_1X7A0340.jpg',
   // Ford
   'focus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ford_Focus_MK4_sedan_004.jpg/640px-Ford_Focus_MK4_sedan_004.jpg',
   'kuga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2020_Ford_Kuga_ST-Line_Plug-In_Hybrid_Front.jpg/640px-2020_Ford_Kuga_ST-Line_Plug-In_Hybrid_Front.jpg',
   'puma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Ford_Puma_%282019%29_IMG_9475.jpg/640px-Ford_Puma_%282019%29_IMG_9475.jpg',
   'fiesta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2017_Ford_Fiesta_Zetec_Turbo_1.0_Front.jpg/640px-2017_Ford_Fiesta_Zetec_Turbo_1.0_Front.jpg',
};

async function main() {
   console.log('\n=== Gerçek Marka Logoları & Model Fotoğrafları ===\n');

   // 1. Update car brand logos
   console.log('1. Marka logoları güncelleniyor (Wikimedia)...');
   for (const [slug, logoUrl] of Object.entries(brandLogos)) {
      const brand = await prisma.carBrand.findUnique({ where: { slug } });
      if (brand) {
         await prisma.carBrand.update({ where: { id: brand.id }, data: { logoUrl } });
         console.log(`   ✓ ${brand.name}`);
      } else {
         console.log(`   ✗ "${slug}" bulunamadı`);
      }
   }

   // 2. Update car model images
   console.log('\n2. Model fotoğrafları güncelleniyor (Wikimedia)...');
   const allModels = await prisma.carModel.findMany({
      select: { id: true, slug: true, name: true, brand: { select: { name: true } } },
   });

   let updated = 0;
   for (const model of allModels) {
      const imageUrl = modelImages[model.slug];
      if (imageUrl) {
         await prisma.carModel.update({ where: { id: model.id }, data: { imageUrl } });
         updated++;
         console.log(`   ✓ ${model.brand.name} ${model.name}`);
      } else {
         console.log(`   ✗ ${model.brand.name} ${model.name} (görsel bulunamadı)`);
      }
   }

   console.log(`\n=== Tamamlandı! ${Object.keys(brandLogos).length} logo + ${updated} model fotoğrafı güncellendi ===`);
}

main()
   .then(() => prisma.$disconnect())
   .catch(async (e) => {
      console.error('HATA:', e);
      await prisma.$disconnect();
      process.exit(1);
   });

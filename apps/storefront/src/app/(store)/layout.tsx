import dynamic from 'next/dynamic'
import Footer from '@/components/native/Footer'
import Header from '@/components/native/nav/parent'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StoreProviders } from './providers'

const WhatsAppFloat = dynamic(() => import('@/components/native/WhatsAppFloat'), {
   ssr: false,
})

const BackToTop = dynamic(() => import('@/components/native/BackToTop'), {
   ssr: false,
})

export default async function DashboardLayout({
   children,
}: {
   children: React.ReactNode
}) {
   // Check maintenance mode - redirect all store pages to /maintenance
   try {
      const settings = await prisma.siteSettings.findUnique({
         where: { id: 1 },
         select: { maintenance_enabled: true },
      })
      if (settings?.maintenance_enabled) {
         redirect('/maintenance')
      }
   } catch (e: any) {
      // Re-throw Next.js redirect (it throws a special NEXT_REDIRECT error)
      if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
      // Swallow DB errors so the site doesn't crash
   }

   return (
      <>
         <StoreProviders>
            <Header />
            <main className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               {children}
            </main>
         </StoreProviders>
         <Footer />
         <WhatsAppFloat />
         <BackToTop />
      </>
   )
}

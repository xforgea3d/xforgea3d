import Footer from '@/components/native/Footer'
import Header from '@/components/native/nav/parent'
import { StoreProviders } from './providers'

export default async function DashboardLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <>
         <StoreProviders>
            <Header />
            <main className="px-[1.2rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               {children}
            </main>
         </StoreProviders>
         <Footer />
      </>
   )
}

export const revalidate = 0
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import { BannerForm } from './components/banner-form'

const Page = async ({ params }: { params: { bannerId: string } }) => {
   try {
      const banner = await prisma.banner.findUnique({
         where: {
            id: params.bannerId,
         },
      })

      if (!banner) {
         notFound()
      }

      return (
         <div className="flex-col">
            <div className="flex-1 space-y-4 pt-6">
               <BannerForm initialData={banner} />
            </div>
         </div>
      )
   } catch (error) {
      notFound()
   }
}

export default Page

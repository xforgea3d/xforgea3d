export const revalidate = 0
import prisma from '@/lib/prisma'

import { DiscountForm } from './components/discount-form'

const DiscountCodePage = async ({
   params,
}: {
   params: { codeId: string }
}) => {
   const discountCode =
      params.codeId !== 'new'
         ? await prisma.discountCode.findUnique({
              where: { id: params.codeId },
           })
         : null

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <DiscountForm initialData={discountCode} />
         </div>
      </div>
   )
}

export default DiscountCodePage

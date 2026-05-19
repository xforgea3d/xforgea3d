export const revalidate = 0
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import { CategoryForm } from './components/category-form'

const CategoryPage = async ({
   params,
}: {
   params: { categoryId: string }
}) => {
   try {
      const category =
         params.categoryId === 'new'
            ? null
            : await prisma.category.findUnique({
                 where: {
                    id: params.categoryId,
                 },
              })

      if (params.categoryId !== 'new' && !category) {
         notFound()
      }

      return (
         <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
               <CategoryForm initialData={category} />
            </div>
         </div>
      )
   } catch {
      notFound()
   }
}

export default CategoryPage

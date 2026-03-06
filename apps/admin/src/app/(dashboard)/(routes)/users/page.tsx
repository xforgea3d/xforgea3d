export const revalidate = 0
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

import { UsersTable } from './components/table'
import { UserColumn } from './components/table'

export default async function UsersPage() {
   let users: any[] = []
   try {
      users = await prisma.profile.findMany({
         select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            _count: { select: { orders: true } },
         },
         take: 50,
         orderBy: {
            updatedAt: 'desc',
         },
      })
   } catch (error) {
      console.warn('[UsersPage] Failed to fetch users:', error)
   }

   const formattedUsers: UserColumn[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      orders: user._count.orders,
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading title={`Kullanıcılar (${users.length})`} description="Mağaza kullanıcılarını yönet" />
         <Separator />
         <UsersTable data={formattedUsers} />
      </div>
   )
}

import { NavItem } from '@/types/nav'

interface DocsConfig {
   mainNav: NavItem[]
   sidebarNav: NavItem[]
}

export const docsConfig: DocsConfig = {
   mainNav: [
      {
         title: 'Ürünler',
         href: '/products',
      },
      {
         title: 'Araç Parçaları',
         href: '/products?category=Aksesuarlar',
      },
      {
         title: 'Parça Talep Et',
         href: '/quote-request',
      },
      {
         title: 'Blog',
         href: '/blog',
         external: false,
      },
   ],
   sidebarNav: [
      {
         title: 'Ürünler',
         href: '/products',
      },
      {
         title: 'Parça Talep Et',
         href: '/quote-request',
      },
      {
         title: 'Blog',
         href: '/blog',
      },
      {
         title: 'Siparişlerim',
         href: '/profile/orders',
      },
      {
         title: 'Taleplerim',
         href: '/profile/quote-requests',
      },
      {
         title: 'Ödemelerim',
         href: '/profile/payments',
      },
      {
         title: 'İletişim',
         href: '/contact',
      },
      {
         title: 'Hakkımızda',
         href: '/about',
      },
   ],
}

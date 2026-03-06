import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler'
import { OrganizationJsonLd, WebSiteJsonLd } from './json-ld'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

import './globals.css'

const NavigationProgressBar = dynamic(
   () => import('@/components/native/NavigationProgressBar').then(mod => ({ default: mod.NavigationProgressBar })),
   { ssr: false }
)

const LazyToastProvider = dynamic(
   () => import('@/providers/toast-provider').then(m => ({ default: m.ToastProvider })),
   { ssr: false }
)

const inter = Inter({
   subsets: ['latin'],
   display: 'swap',
   preload: true,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

export const metadata: Metadata = {
   metadataBase: new URL(SITE_URL),
   title: {
      default: 'xForgea3D — Premium 3D Baski Urunleri',
      template: '%s | xForgea3D',
   },
   description:
      "Turkiye'nin premium 3D baski markasi. Yuksek kaliteli figurler, heykeller, dekoratif urunler, oto yedek parca aksesuarlari ve kisiye ozel 3D baski cozumleri. xForgea3D ile tasariminizi gercege donusturun.",
   keywords: [
      '3D baski',
      '3D yazici urunleri',
      'figur',
      'heykel',
      'dekoratif urunler',
      'oto yedek parca',
      '3D baski aksesuar',
      'kisiye ozel 3D baski',
      'PLA figur',
      'recine baski',
      'Turkiye 3D baski',
      'xForgea3D',
      '3D printing Turkey',
      '3D printed figurines',
      '3D printed car parts',
   ],
   authors: [{ name: 'xForgea3D', url: SITE_URL }],
   creator: 'xForgea3D',
   publisher: 'xForgea3D',
   formatDetection: {
      email: false,
      address: false,
      telephone: false,
   },
   openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: SITE_URL,
      siteName: 'xForgea3D',
      title: 'xForgea3D — Premium 3D Baski Urunleri',
      description:
         "Turkiye'nin premium 3D baski markasi. Figurler, heykeller, dekoratif urunler ve kisiye ozel 3D baski cozumleri.",
      images: [
         {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'xForgea3D — Premium 3D Baski Urunleri',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      title: 'xForgea3D — Premium 3D Baski Urunleri',
      description:
         "Turkiye'nin premium 3D baski markasi. Figurler, heykeller ve kisiye ozel 3D baski cozumleri.",
      images: ['/og-image.jpg'],
      creator: '@xforgea3d',
   },
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1,
      },
   },
   alternates: {
      canonical: SITE_URL,
   },
   verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION ?? undefined,
      yandex: process.env.YANDEX_VERIFICATION ?? undefined,
   },
   category: '3D Printing',
}

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="tr" suppressHydrationWarning>
         <body className={inter.className} suppressHydrationWarning>
            <GlobalErrorHandler />
            <OrganizationJsonLd />
            <WebSiteJsonLd />
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
               <NavigationProgressBar />
               <LazyToastProvider />
               <ModalProvider />
               {children}
            </ThemeProvider>
         </body>
      </html>
   )
}

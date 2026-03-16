import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler'
import GoogleAnalytics from '@/components/native/GoogleAnalytics'
import ClarityAnalytics from '@/components/native/ClarityAnalytics'
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
   subsets: ['latin', 'latin-ext'],
   display: 'swap',
   preload: true,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

export const metadata: Metadata = {
   metadataBase: new URL(SITE_URL),
   title: {
      default: 'xForgea3D — Premium 3D Baskı Ürünleri',
      template: '%s | xForgea3D',
   },
   description:
      "Türkiye'nin premium 3D baskı markası. Yüksek kaliteli figürler, heykeller, dekoratif ürünler, oto yedek parça aksesuarları ve kişiye özel 3D baskı çözümleri. xForgea3D ile tasarımınızı gerçeğe dönüştürün.",
   keywords: [
      '3D baskı',
      '3D yazıcı ürünleri',
      'figür',
      'heykel',
      'dekoratif ürünler',
      'oto yedek parça',
      '3D baskı aksesuar',
      'kişiye özel 3D baskı',
      'PLA figür',
      'reçine baskı',
      'Türkiye 3D baskı',
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
      title: 'xForgea3D — Premium 3D Baskı Ürünleri',
      description:
         "Türkiye'nin premium 3D baskı markası. Figürler, heykeller, dekoratif ürünler ve kişiye özel 3D baskı çözümleri.",
      images: [
         {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'xForgea3D — Premium 3D Baskı Ürünleri',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      title: 'xForgea3D — Premium 3D Baskı Ürünleri',
      description:
         "Türkiye'nin premium 3D baskı markası. Figürler, heykeller ve kişiye özel 3D baskı çözümleri.",
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
   other: {
      'instagram:profile': 'https://instagram.com/xforgea3d',
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
            <GoogleAnalytics />
            <ClarityAnalytics />
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

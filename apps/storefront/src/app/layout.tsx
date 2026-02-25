import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { NavigationProgressBar } from '@/components/native/NavigationProgressBar'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
   title: 'xForgea3D — Premium 3D Baskı Ürünleri',
   description: "Türkiye'nin premium 3D baskı markası. Yüksek kaliteli figürler, heykeller ve dekoratif ürünler.",
   keywords: ['3D Baskı', 'Figür', 'Heykel', 'Dekoratif', 'Türkiye', 'xForgea3D'],
   authors: [{ name: 'xForgea3D', url: 'https://xforgea3d.com' }],
   creator: 'xForgea3D',
   publisher: 'xForgea3D',
}

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="tr" suppressHydrationWarning>
         <body className={inter.className} suppressHydrationWarning>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
               <Suspense fallback={null}>
                  <NavigationProgressBar />
               </Suspense>
               <ToastProvider />
               <ModalProvider />
               {children}
            </ThemeProvider>
         </body>
      </html>
   )
}

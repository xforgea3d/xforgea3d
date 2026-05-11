import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { BasePathProvider } from '@/providers/base-path-provider'
import { NavigationProgressBar } from '@/components/NavigationProgressBar'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
   title: 'xForgea3D — Yönetim Paneli',
   description: 'xForgea3D 3D Baskı Mağazası Yönetim Paneli',
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
               <BasePathProvider />
               {children}
            </ThemeProvider>
         </body>
      </html>
   )
}

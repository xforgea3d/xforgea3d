import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { NavigationProgressBar } from '@/components/NavigationProgressBar'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
   title: 'Admin Dashboard',
   description: 'E-Commerce Store Admin Dashboard',
}

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="en" suppressHydrationWarning>
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

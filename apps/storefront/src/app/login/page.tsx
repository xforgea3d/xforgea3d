export const dynamic = 'force-dynamic'

import config from '@/config/site'
import { Metadata } from 'next'
import Link from 'next/link'

import { UserAuthForm } from '../login/components/user-auth-form'

export const metadata: Metadata = {
   title: 'Giriş Yap',
   description: 'xForgea3D hesabınıza giriş yapın.',
}

export default function AuthenticationPage() {
   return (
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
         <div className="relative hidden bg-zinc-900 h-full flex-col bg-muted p-10 dark:border-r lg:flex">
            <Link
               href="/"
               className="relative z-20 flex items-center text-lg font-medium"
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-6 w-6"
               >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
               </svg>
               {config.name}
            </Link>
            <div className="relative z-20 mt-auto">
               <blockquote className="space-y-2">
                  <p className="text-lg">
                     &ldquo;xForgea3D ile sipariş verdiğim figür hayallerimden de güzel geldi. Kalite ve detay çalışması inanılmaz.&rdquo;
                  </p>
                  <footer className="text-sm">Mert K., Ankara</footer>
               </blockquote>
            </div>
         </div>
         <div className="p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
               <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                     Giriş Yap
                  </h1>
                  <p className="text-sm text-muted-foreground">
                     E-posta adresinizi girerek giriş yapın veya hesap oluşturun.
                  </p>
               </div>
               <UserAuthForm />
               <p className="px-8 text-center text-sm text-muted-foreground">
                  Devam ederek{' '}
                  <Link
                     href="/terms"
                     className="underline underline-offset-4 hover:text-primary"
                  >
                     Kullanım Koşullarımızı
                  </Link>{' '}
                  ve{' '}
                  <Link
                     href="/privacy"
                     className="underline underline-offset-4 hover:text-primary"
                  >
                     Gizlilik Politikamızı
                  </Link>
                  {' '}kabul etmiş olursunuz.
               </p>
            </div>
         </div>
      </div>
   )
}

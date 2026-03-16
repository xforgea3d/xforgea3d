'use client'

import { useState } from 'react'
import { useCsrf } from '@/hooks/useCsrf'
import { Separator } from '@/components/native/separator'
import config from '@/config/site'
import { InstagramIcon, TwitterIcon, Mail, ShieldCheck, CreditCard, Lock, Send, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

const data = [
   {
      label: 'YASAL',
      links: [
         {
            label: 'Mesafeli Satış Sözleşmesi',
            url: '/policies/mesafeli-satis-sozlesmesi',
         },
         {
            label: 'İade Koşulları',
            url: '/policies/iade-kosullari',
         },
         {
            label: 'Gizlilik Politikası',
            url: '/policies/gizlilik-ve-cerez-politikasi',
         },
         {
            label: 'KVKK Aydınlatma Metni',
            url: '/policies/kvkk-aydinlatma-metni',
         },
         {
            label: 'Çerez Ayarları',
            url: '#cerez-ayarlari',
         },
      ],
   },
   {
      label: 'KAYNAKLAR',
      links: [
         {
            label: 'Blog',
            url: '/blog',
         },
         {
            label: 'Hakkımızda',
            url: '/about',
         },
         {
            label: 'İletişim',
            url: '/contact',
         },
      ],
   },
   {
      label: 'DESTEK',
      links: [
         {
            label: 'S.S.S.',
            url: '/faq',
         },
         {
            label: 'Kargo Takibi',
            url: '/shipping',
         },
      ],
   },
]

function WhatsAppIcon({ className }: { className?: string }) {
   return (
      <svg
         viewBox="0 0 24 24"
         fill="currentColor"
         className={className}
         xmlns="http://www.w3.org/2000/svg"
      >
         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
   )
}

export default function Footer() {
   return (
      <footer className="w-full">
         <Separator className="my-12" />

         {/* Newsletter Section */}
         <Newsletter />

         <Separator className="my-8" />

         <div className="flex flex-col md:flex-row justify-between gap-8 px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
            <div className="space-y-6">
               <Trademark />
               <BusinessInfo />
            </div>
            <Links />
         </div>

         {/* Trust Badges */}
         <div className="mt-8 px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
            <TrustBadges />
         </div>

         <Separator className="mt-8 mb-6" />
         <Socials />
      </footer>
   )
}

function Newsletter() {
   const [email, setEmail] = useState('')
   const csrfToken = useCsrf()
   const { toast } = useToast()

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email) return
      try {
         const res = await fetch('/api/subscription/email', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
            body: JSON.stringify({ email, ...(csrfToken && { csrfToken }) }),
         })
         if (!res.ok) throw new Error('Subscription failed')
         toast({
            title: 'Teşekkürler!',
            description: 'E-posta adresiniz başarıyla kaydedildi. Kampanyalardan haberdar olacaksınız.',
         })
         setEmail('')
      } catch {
         toast({
            title: 'Hata',
            description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            variant: 'destructive',
         })
      }
   }

   return (
      <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
         <div className="flex flex-col items-center rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 dark:from-orange-950/30 dark:to-amber-950/30">
            <Mail className="mb-3 h-8 w-8 text-orange-500" />
            <h3 className="text-lg font-semibold">Kampanyalardan Haberdar Olun</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
               Yeni ürünler, indirimler ve özel fırsatlardan ilk siz haberdar olun.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-md gap-2">
               <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
               />
               <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
               >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Abone Ol</span>
               </button>
            </form>
         </div>
      </div>
   )
}

function Links() {
   const handleCookieSettings = (e: React.MouseEvent) => {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('open-cookie-settings'))
   }

   return (
      <div className="text-end justify-evenly grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
         {data.map(({ label, links }) => (
            <div key={label}>
               <h2 className="mb-3 text-sm uppercase">{label}</h2>
               <ul className="block space-y-1">
                  {links.map(({ label, url }) => (
                     <li key={label}>
                        {url === '#cerez-ayarlari' ? (
                           <button
                              onClick={handleCookieSettings}
                              className="text-sm transition duration-300 text-muted-foreground hover:text-foreground"
                           >
                              {label}
                           </button>
                        ) : (
                           <Link
                              href={url}
                              prefetch={true}
                              className="text-sm transition duration-300 text-muted-foreground hover:text-foreground"
                           >
                              {label}
                           </Link>
                        )}
                     </li>
                  ))}
               </ul>
            </div>
         ))}
      </div>
   )
}

function Trademark() {
   return (
      <div className="mb-6 md:mb-0">
         <span className="flex flex-col">
            <h2 className="whitespace-nowrap text-sm font-semibold uppercase">
               {config.name}
            </h2>
            <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 italic">
               Tasarım. Hassasiyet. xForgea3D.
            </span>
            <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
               © {new Date().getFullYear()} {config.name}™ . Tüm Hakları Saklıdır.
            </span>
         </span>
      </div>
   )
}

function TrustBadges() {
   return (
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border bg-card p-4">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span>Güvenli Ödeme</span>
         </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-5 w-5 text-orange-500" />
            <span>256-bit SSL</span>
         </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Kredi Kartı / Havale</span>
         </div>
      </div>
   )
}

function BusinessInfo() {
   return (
      <div className="space-y-2 text-sm text-muted-foreground">
         <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Ataşehir, İstanbul, Türkiye</span>
         </div>
         <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a
               href="tel:+905382880738"
               className="transition-colors hover:text-foreground"
            >
               +90 (538) 288 07 38
            </a>
         </div>
         <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <a
               href="mailto:info@xforgea3d.com"
               className="transition-colors hover:text-foreground"
            >
               info@xforgea3d.com
            </a>
         </div>
      </div>
   )
}

function Socials() {
   return (
      <div className="mb-6 flex justify-center space-x-6 text-muted-foreground">
         <a
            href="https://instagram.com/xforgea3d"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
         >
            <InstagramIcon className="h-4" />
            <span className="sr-only">Instagram sayfası</span>
         </a>
         <a
            href="https://twitter.com/xforgea3d"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
         >
            <TwitterIcon className="h-4" />
            <span className="sr-only">Twitter sayfası</span>
         </a>
         <a
            href="https://wa.me/905382880738"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
         >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="sr-only">WhatsApp</span>
         </a>
      </div>
   )
}

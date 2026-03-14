import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, SparklesIcon, LayersIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const PrinterAnimation = dynamic(() => import('./PrinterAnimation'), { ssr: false })
const HeroStats = dynamic(() => import('./HeroStats'), { ssr: false })

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden rounded-2xl
         bg-gradient-to-br from-neutral-50 via-white to-orange-50/30
         dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
         border border-neutral-200/60 dark:border-neutral-800/60
         shadow-sm min-h-[320px]">

            {/* Radial glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 55% 60% at 75% 50%, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
            {/* Grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

            {/* 3D Printer visual */}
            <PrinterAnimation />

            {/* Content */}
            <div className="relative z-10 px-5 sm:px-8 md:px-12 py-12 md:py-14 md:max-w-[56%]">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 dark:bg-orange-500/12 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-orange-600 dark:text-orange-400 mb-6">
                    <SparklesIcon className="h-3 w-3" />
                    Türkiye'nin Seçkin 3D Baskı Stüdyosu
                </span>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-[3.4rem] font-black tracking-tighter leading-[1.0] text-foreground">
                    Fikrine Şekil Ver,
                    <br />
                    <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500 bg-clip-text text-transparent">
                        Katman Katman Üret.
                    </span>
                </h1>

                {/* Sub-copy */}
                <p className="mt-4 text-sm md:text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-xs md:max-w-sm">
                    Stok ürünler, kişiselleştirilebilir tasarımlar veya tamamen senin fikrin —
                    Elegoo 3D yazıcılarımızla her baskı hassasiyetle hayata geçiyor.
                </p>

                {/* Stats with animated counters */}
                <HeroStats />

                {/* CTAs */}
                <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/products">
                        <Button size="lg" className="rounded-full px-6 h-10 font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.55)] hover:scale-105 transition-all duration-200">
                            Ürünleri Keşfet
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/atolye">
                        <Button size="lg" variant="outline"
                            className="rounded-full px-6 h-10 font-semibold border-neutral-300 dark:border-neutral-700 hover:border-orange-400/60 hover:bg-orange-500/5 transition-all duration-200">
                            <LayersIcon className="mr-2 h-4 w-4 text-orange-500" />
                            Kendi Tasarımını Yap
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

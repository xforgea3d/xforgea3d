'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, SparklesIcon, LayersIcon } from 'lucide-react'

// Animated 3D printer layer stack — pure CSS/HTML metaphor showing layers building up
function PrinterPrism() {
    const layers = [
        { idx: 0, opacity: 0.18, y: 0 },
        { idx: 1, opacity: 0.25, y: 1 },
        { idx: 2, opacity: 0.32, y: 2 },
        { idx: 3, opacity: 0.40, y: 3 },
        { idx: 4, opacity: 0.50, y: 4 },
        { idx: 5, opacity: 0.62, y: 5 },
        { idx: 6, opacity: 0.78, y: 6 },
    ]
    return (
        <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[45%] items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Glow blob */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-[80px]" />
            {/* 3D layer stack */}
            <div className="relative w-[260px] h-[260px]" style={{ perspective: '900px', perspectiveOrigin: '50% 60%' }}>
                {layers.map(({ idx, opacity, y }) => (
                    <div
                        key={idx}
                        className="absolute left-0 right-0 rounded-xl border border-orange-400/30 dark:border-orange-300/30"
                        style={{
                            height: 32,
                            top: `${22 + idx * 33}px`,
                            background: `rgba(249,115,22,${opacity * 0.15})`,
                            transform: `rotateX(55deg) rotateZ(-8deg) translateY(${y}px)`,
                            boxShadow: idx === 6
                                ? '0 0 24px rgba(249,115,22,0.5), inset 0 1px 0 rgba(249,115,22,0.6)'
                                : 'none',
                            animationDelay: `${idx * 150}ms`,
                        }}
                    />
                ))}
                {/* Active nozzle layer — glowing orange */}
                <div
                    className="absolute left-0 right-0 rounded-xl border-2 border-orange-400/80"
                    style={{
                        height: 34,
                        top: `${22 + 7 * 33}px`,
                        background: 'rgba(249,115,22,0.18)',
                        transform: 'rotateX(55deg) rotateZ(-8deg)',
                        boxShadow: '0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.2)',
                        animation: 'pulse 2s ease-in-out infinite',
                    }}
                />
                {/* Nozzle tip dot */}
                <div
                    className="absolute w-3 h-3 rounded-full bg-orange-400"
                    style={{
                        top: `${22 + 7 * 33 + 11}px`,
                        left: 24,
                        transform: 'rotateX(55deg)',
                        boxShadow: '0 0 16px rgba(249,115,22,1)',
                        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                    }}
                />
                {/* Label */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500/60">Katman Katman Üretim</span>
                </div>
            </div>
        </div>
    )
}

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden rounded-2xl
         bg-gradient-to-br from-neutral-50 via-white to-orange-50/20
         dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
         border border-neutral-200/60 dark:border-neutral-800/60
         shadow-sm">

            {/* Radial glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 55% 60% at 75% 50%, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
            {/* Grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

            {/* 3D Printer visual */}
            <PrinterPrism />

            {/* Content */}
            <div className="relative z-10 px-8 md:px-12 py-12 md:py-16 max-w-[56%] min-w-[320px]">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 dark:bg-orange-500/12 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-orange-600 dark:text-orange-400 mb-6">
                    <SparklesIcon className="h-3 w-3" />
                    Türkiye&apos;nin Seçkin 3D Baskı Stüdyosu
                </span>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl xl:text-[3.4rem] font-black tracking-tighter leading-[1.0] text-foreground">
                    Fikrine Şekil Ver,
                    <br />
                    <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500 bg-clip-text text-transparent">
                        Katman Katman Üret.
                    </span>
                </h1>

                {/* Sub-copy */}
                <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-sm">
                    Stok ürünler, kişiselleştirilebilir tasarımlar veya tamamen senin fikrin —
                    her baskı özenle, yüksek hassasiyetle hayata geçiyor.
                </p>

                {/* Stats */}
                <div className="mt-7 flex gap-7">
                    {[
                        { value: '500+', label: 'Ürün Çeşidi' },
                        { value: '7/24', label: 'Üretim' },
                        { value: '2 Gün', label: 'Hızlı Kargo' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <div className="text-2xl font-black text-foreground leading-none">{value}</div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/products">
                        <Button size="lg" className="rounded-full px-7 font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.55)] hover:scale-105 transition-all duration-200">
                            Ürünleri Keşfet
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/atolye">
                        <Button size="lg" variant="outline"
                            className="rounded-full px-7 font-semibold border-neutral-300 dark:border-neutral-700 hover:border-orange-400/60 hover:bg-orange-500/5 transition-all duration-200">
                            <LayersIcon className="mr-2 h-4 w-4 text-orange-500" />
                            Kendi Tasarımını Yap
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

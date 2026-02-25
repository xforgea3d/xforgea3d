'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, SparklesIcon, ZapIcon, LayersIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

// Animated floating layer slices — the visual heart of the hero
function LayerPrism() {
    return (
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none pr-10 md:pr-20">
            <div className="relative w-[320px] h-[380px] md:w-[420px] md:h-[480px]">
                {/* Stacked printing layer slices */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute inset-x-0 rounded-2xl border border-orange-500/20 dark:border-orange-400/20 bg-gradient-to-r from-orange-500/5 via-blue-500/5 to-transparent backdrop-blur-[1px]"
                        style={{
                            height: 44,
                            bottom: i * 36,
                            left: i * 6,
                            right: -i * 3,
                            opacity: 0.7 - i * 0.07,
                            transform: `perspective(800px) rotateX(${12 + i * 1.5}deg) rotateY(-${8 + i}deg)`,
                            animationDelay: `${i * 120}ms`,
                            boxShadow: i === 7
                                ? '0 0 40px rgba(249,115,22,0.25), inset 0 1px 0 rgba(249,115,22,0.3)'
                                : undefined,
                        }}
                    />
                ))}
                {/* Active print head nozzle line */}
                <div
                    className="absolute inset-x-0 rounded-2xl border border-orange-400/60 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-blue-500/10"
                    style={{
                        height: 44,
                        bottom: 7 * 36,
                        left: 7 * 6,
                        right: -7 * 3,
                        transform: 'perspective(800px) rotateX(22deg) rotateY(-15deg)',
                        animation: 'pulse 2s ease-in-out infinite',
                        boxShadow: '0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.15)',
                    }}
                />
                {/* Nozzle indicator dot */}
                <div
                    className="absolute rounded-full bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.8)]"
                    style={{
                        width: 10,
                        height: 10,
                        bottom: 7 * 36 + 17,
                        left: 7 * 6 + 20,
                        transform: 'perspective(800px) rotateX(22deg)',
                        animation: 'ping 1.5s ease-in-out infinite',
                    }}
                />
            </div>
        </div>
    )
}

// Animated text chars — each letter animates in with staggered delay
function AnimatedTitle() {
    const line1 = 'Sanatı Katman Katman'
    const line2 = 'İnşa Ediyoruz'

    return (
        <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.95] text-left max-w-xl">
            <span className="block text-foreground">
                {line1.split('').map((ch, i) => (
                    <span
                        key={i}
                        className="inline-block animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                        style={{ animationDelay: `${i * 28}ms`, animationDuration: '500ms' }}
                    >
                        {ch === ' ' ? '\u00a0' : ch}
                    </span>
                ))}
            </span>
            <span className="block bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500 bg-clip-text text-transparent mt-1">
                {line2.split('').map((ch, i) => (
                    <span
                        key={i}
                        className="inline-block animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                        style={{ animationDelay: `${560 + i * 35}ms`, animationDuration: '600ms' }}
                    >
                        {ch === ' ' ? '\u00a0' : ch}
                    </span>
                ))}
            </span>
        </h1>
    )
}

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden rounded-2xl min-h-[520px] md:min-h-[580px] flex items-center
         bg-gradient-to-br from-neutral-50 via-white to-orange-50/30
         dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
         border border-neutral-200/60 dark:border-neutral-800/60
         shadow-[0_2px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_60px_rgba(0,0,0,0.4)]">

            {/* ── Background mesh ─────────────────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: [
                        'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(249,115,22,0.07) 0%, transparent 70%)',
                        'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(59,130,246,0.05) 0%, transparent 70%)',
                    ].join(', '),
                }}
            />

            {/* ── Subtle grid ────────────────────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* ── 3D Layer Prism visual ──────────────────────────── */}
            <LayerPrism />

            {/* ── Content ───────────────────────────────────────── */}
            <div className="relative z-10 px-8 md:px-14 py-16 md:py-20 max-w-2xl">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 dark:bg-orange-500/15 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-400">
                    <SparklesIcon className="h-3 w-3" />
                    Türkiye&apos;nin Premium 3D Baskı Markası
                </div>

                {/* Animated headline */}
                <AnimatedTitle />

                {/* Sub-copy */}
                <p className="mt-6 text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-md animate-in fade-in duration-700 fill-mode-both" style={{ animationDelay: '900ms' }}>
                    Her katman bir karar, her baskı bir sanat eseri. Figürler, heykeller ve
                    kişiselleştirilmiş 3D objeler — özenle tasarlanır, mükemmeliyet ile üretilir.
                </p>

                {/* Stats row */}
                <div className="mt-8 flex flex-wrap gap-6 animate-in fade-in duration-700 fill-mode-both" style={{ animationDelay: '1100ms' }}>
                    {[
                        { value: '500+', label: 'Ürün' },
                        { value: '%100', label: 'El Yapımı' },
                        { value: '48s', label: 'Hızlı Kargo' },
                    ].map(({ value, label }) => (
                        <div key={label} className="flex flex-col">
                            <span className="text-2xl font-black text-foreground tracking-tight">{value}</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="mt-10 flex flex-wrap gap-3 animate-in fade-in duration-700 fill-mode-both" style={{ animationDelay: '1300ms' }}>
                    <Link href="/products">
                        <Button
                            size="lg"
                            className="rounded-full px-8 font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all duration-300 hover:scale-105"
                        >
                            Ürünleri Keşfet
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/products?custom=true">
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full px-8 font-semibold border-neutral-300 dark:border-neutral-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300"
                        >
                            <LayersIcon className="mr-2 h-4 w-4 text-orange-500" />
                            Kişisel Tasarım
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

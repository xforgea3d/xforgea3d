'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, SparklesIcon, LayersIcon } from 'lucide-react'

/**
 * Animated 3D Printer SVG — clearly shows a printer nozzle depositing
 * filament layer by layer to build a figure. Much more recognizable than
 * the abstract "layer prism" shown before.
 */
function PrinterAnimation() {
    return (
        <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] items-center justify-center overflow-hidden pointer-events-none" style={{ perspective: 1000 }}>
            {/* Ambient Background Glows */}
            <div className="absolute w-[300px] h-[300px] bg-orange-500/20 dark:bg-orange-600/20 blur-[100px] rounded-full mix-blend-screen" />
            <div className="absolute w-[200px] h-[200px] bg-amber-400/10 dark:bg-amber-500/10 blur-[60px] rounded-full -translate-x-12 translate-y-12 mix-blend-screen" />

            <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg) rotateY(-10deg)' }}>
                {/* 3D Printer Enclosure */}
                <div className="relative w-[340px] h-[380px] rounded-3xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100/40 dark:bg-neutral-900/40 backdrop-blur-sm shadow-2xl flex flex-col items-center overflow-hidden">
                    {/* Top frame/light bar */}
                    <div className="w-full h-8 bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-center shadow-inner z-20">
                        <div className="w-32 h-1 bg-orange-400/50 rounded-full shadow-[0_0_10px_#f97316]" />
                    </div>

                    {/* Internal build chamber */}
                    <div className="relative flex-1 w-full bg-gradient-to-b from-neutral-200/50 to-neutral-50/50 dark:from-neutral-900/50 dark:to-neutral-950/80 shadow-[inset_0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-end pb-8">

                        {/* Z-Axis Rods */}
                        <div className="absolute left-10 top-0 bottom-8 w-2 bg-gradient-to-r from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-600 rounded-full" />
                        <div className="absolute right-10 top-0 bottom-8 w-2 bg-gradient-to-r from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-600 rounded-full" />

                        {/* Print Bed (moves UP then slowly DOWN over 6 seconds) */}
                        <div className="absolute bottom-8 w-[240px] h-6 bg-neutral-300 dark:bg-neutral-800 rounded-lg shadow-xl border-t border-neutral-200 dark:border-neutral-700 animate-bed-drop z-10 flex justify-center">
                            {/* The printed object container (Sits on bed, overflow hidden, heights out) */}
                            <div className="absolute bottom-6 w-32 h-[200px] flex items-end justify-center overflow-hidden animate-model-grow">
                                {/* The solid object filling the space */}
                                <div className="w-32 h-[200px] flex-shrink-0 relative">
                                    <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                                        {/* Low Poly Vase Base */}
                                        <path d="M20,120 L80,120 L90,60 L70,20 L50,0 L30,20 L10,60 Z" fill="#f97316" />
                                        {/* Details inside */}
                                        <path d="M50,0 L30,20 L50,40 Z" fill="rgba(0,0,0,0.2)" />
                                        <path d="M70,20 L50,40 L90,60 Z" fill="rgba(0,0,0,0.1)" />
                                        <path d="M50,40 L30,20 L10,60 L50,80 Z" fill="rgba(0,0,0,0.15)" />
                                        <path d="M50,40 L50,80 L90,60 Z" fill="rgba(0,0,0,0.05)" />
                                        <path d="M50,80 L10,60 L20,120 L50,120 Z" fill="rgba(0,0,0,0.25)" />
                                        <path d="M50,80 L50,120 L80,120 L90,60 Z" fill="rgba(0,0,0,0.1)" />
                                    </svg>
                                    <div className="absolute inset-x-0 top-0 h-1 bg-white/50 blur-[1px]" />
                                </div>
                            </div>
                        </div>

                        {/* X/Y Gantry (moves around, fixed height) */}
                        {/* The horizontal rail */}
                        <div className="absolute top-[80px] w-full h-3 bg-neutral-400 dark:bg-neutral-700 shadow-md z-20">
                            {/* The print head / toolhead */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-12 h-16 bg-neutral-800 dark:bg-black rounded-md shadow-2xl border border-neutral-600 dark:border-neutral-800 animate-print-head flex flex-col items-center">
                                {/* Brand mark on head */}
                                <div className="mt-2 w-4 h-1 bg-orange-500 rounded-full" />
                                {/* Hotend cooling fan */}
                                <div className="mt-2 w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center animate-spin-slow">
                                    <div className="w-6 h-6 bg-neutral-700 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0 45deg, #404040 45deg 90deg, transparent 90deg 135deg, #404040 135deg 180deg, transparent 180deg 225deg, #404040 225deg 270deg, transparent 270deg 315deg, #404040 315deg 360deg)' }} />
                                </div>
                                {/* Nozzle */}
                                <div className="absolute -bottom-2 w-2 h-3 bg-zinc-300 dark:bg-zinc-500 clip-nozzle" />
                                <div className="absolute -bottom-6 w-1 h-6 bg-orange-400/80 animate-pulse shadow-[0_0_8px_#f97316]" />
                            </div>
                        </div>

                    </div>

                    {/* Glass glare effect (front panel) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 dark:from-white/0 dark:via-white/5 dark:to-white/0 pointer-events-none z-30" style={{ transform: 'translateX(-20%) skewX(-15deg)' }} />
                </div>
            </div>

            <style>{`
                .clip-nozzle { clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%); }
                .animate-spin-slow { animation: spin 0.8s linear infinite; }
                
                @keyframes head-move {
                    0% { transform: translate(60px, -50%); }
                    10% { transform: translate(220px, -50%); }
                    20% { transform: translate(100px, -50%); }
                    30% { transform: translate(240px, -50%); }
                    40% { transform: translate(80px, -50%); }
                    50% { transform: translate(190px, -50%); }
                    60% { transform: translate(110px, -50%); }
                    70% { transform: translate(210px, -50%); }
                    80% { transform: translate(90px, -50%); }
                    90% { transform: translate(260px, -50%); }
                    100% { transform: translate(60px, -50%); }
                }
                .animate-print-head {
                    animation: head-move 6s ease-in-out infinite;
                }

                @keyframes bed-drop {
                    0%, 10% { transform: translateY(-200px); }
                    90%, 100% { transform: translateY(0); }
                }
                .animate-bed-drop {
                    animation: bed-drop 6s ease-in-out infinite;
                }

                @keyframes grow-model {
                    0%, 10% { height: 0%; opacity: 0; }
                    15% { opacity: 1; }
                    90%, 100% { height: 100%; opacity: 1; }
                }
                .animate-model-grow {
                    animation: grow-model 6s ease-in-out infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

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
            <div className="relative z-10 px-8 md:px-12 py-12 md:py-14 md:max-w-[56%]">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 dark:bg-orange-500/12 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-orange-600 dark:text-orange-400 mb-6">
                    <SparklesIcon className="h-3 w-3" />
                    Türkiye'nin Seçkin 3D Baskı Stüdyosu
                </span>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground">
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

                {/* Stats */}
                <div className="mt-6 flex gap-6">
                    {[
                        { value: '500+', label: 'Ürün Çeşidi' },
                        { value: '7/24', label: 'Üretim' },
                        { value: '2 Gün', label: 'Hızlı Kargo' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <div className="text-xl md:text-2xl font-black text-foreground leading-none">{value}</div>
                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

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

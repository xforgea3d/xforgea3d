'use client'

import { useEffect, useRef } from 'react'

// ─── Particle Burst Effect ────────────────────────────────────────────────────
// Pre-calculate particle offsets in JS since CSS can't do Math.cos/sin
function Particles() {
  const particles = [...Array(12)].map((_, i) => {
    const angle = (i / 12) * Math.PI * 2
    const dist = 18 + (i % 4) * 6
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    const size = 2 + (i % 3)
    return { tx, ty, size, delay: (i / 12) * 8 }
  })

  return (
    <div className="printer-particles absolute pointer-events-none" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            '--delay': `${p.delay}s`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--size': `${p.size}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ─── Layer Lines (horizontal scan lines during print) ────────────────────────
function LayerLines() {
  return (
    <div className="layer-lines absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none" aria-hidden>
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="layer-line absolute inset-x-0 h-px"
          style={{ '--layer-i': i } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default function PrinterAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
        el.querySelectorAll('*').forEach((child: any) => {
          if (child.style) child.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="printer-root hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] items-center justify-center overflow-visible pointer-events-none select-none"
      aria-hidden
    >
      {/* ── Ambient Background Halos ──────────────────────────────────────── */}
      <div className="printer-halo printer-halo-1 absolute rounded-full" />
      <div className="printer-halo printer-halo-2 absolute rounded-full" />
      <div className="printer-halo printer-halo-3 absolute rounded-full" />

      {/* ── Outer wrapper: 3-D perspective tilt ──────────────────────────── */}
      <div className="printer-perspective relative w-[350px] h-[420px]">

        {/* ── Glass Enclosure ───────────────────────────────────────────── */}
        <div className="printer-enclosure absolute inset-0 rounded-[28px] overflow-hidden">
          {/* Inner glare sheen */}
          <div className="printer-glare absolute inset-0 rounded-[28px]" />
          {/* Corner accent lights */}
          <div className="printer-corner-light printer-corner-tl absolute w-6 h-6 rounded-full" />
          <div className="printer-corner-light printer-corner-tr absolute w-6 h-6 rounded-full" />

          {/* ── Top Control Bar ─────────────────────────────────────────── */}
          <div className="printer-topbar absolute top-0 inset-x-0 h-9 flex items-center justify-between px-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
              <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
              <div className="printer-status-dot w-2 h-2 rounded-full" />
            </div>
            {/* Brand label */}
            <span className="text-[9px] font-black tracking-[0.22em] uppercase text-orange-400/80">xForgea3D</span>
            {/* Progress bar */}
            <div className="w-16 h-1 rounded-full bg-neutral-700/60 overflow-hidden">
              <div className="printer-progress h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
            </div>
          </div>

          {/* ── Build Chamber ───────────────────────────────────────────── */}
          <div className="absolute top-9 inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6">

            {/* Z-axis rods */}
            <div className="printer-rod absolute left-8 top-0 bottom-6 w-[5px] rounded-full" />
            <div className="printer-rod absolute right-8 top-0 bottom-6 w-[5px] rounded-full" />

            {/* Horizontal lead-screw (decorative) */}
            <div className="printer-leadscrew absolute left-8 right-8 top-4 h-[3px] rounded-full opacity-30" />

            {/* ── X/Y Gantry Rail: CSS controls 'top' via gantry-z animation ── */}
            <div className="printer-gantry-rail absolute inset-x-8 h-[6px] rounded-full z-20">
              {/* Print head carriage */}
              <div className="printer-head absolute top-1/2 -translate-y-1/2 z-30">
                {/* Carriage body */}
                <div className="printer-head-body w-14 h-[52px] rounded-lg flex flex-col items-center pt-2 gap-1 relative shadow-2xl">
                  {/* Brand stripe */}
                  <div className="w-6 h-[2px] rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                  {/* Cooling fan */}
                  <div className="printer-fan w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center mt-0.5">
                    <div className="printer-fan-blades w-5 h-5 rounded-full" />
                  </div>
                  {/* Hotend heatsink fins */}
                  <div className="absolute -right-1 top-2 flex flex-col gap-[2px]">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-[3px] h-[3px] rounded-sm bg-neutral-600/60" />
                    ))}
                  </div>
                  {/* Nozzle tip */}
                  <div className="printer-nozzle absolute -bottom-[6px] flex justify-center items-end" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
                    <div className="printer-hotend-glow absolute bottom-0 w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  </div>
                  {/* Filament glow strand — extends from nozzle toward active layer */}
                  <div className="printer-filament absolute -bottom-[16px] left-1/2 -translate-x-1/2 w-[3px] rounded-full shadow-[0_0_8px_#f97316,0_0_20px_rgba(249,115,22,0.5)]" />
                  {/* Particles burst around nozzle */}
                  <Particles />
                </div>
              </div>
            </div>

            {/* ── Print Bed (Z-axis up/down) ────────────────────────────── */}
            <div className="printer-bed absolute bottom-6 w-[268px] h-7 rounded-xl z-10 flex items-center justify-center">
              {/* Bed heating grid pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <defs>
                  <pattern id="bedgrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M12 0 L0 0 0 12" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bedgrid)" />
              </svg>

              {/* ── Printed Object — sits exactly on the bed, grows upward ─── */}
              <div className="printer-object-wrapper absolute inset-x-0 bottom-full mb-[1px] flex items-end justify-center">
                <div className="printer-object relative w-[90px] h-[180px] flex-shrink-0">
                  {/* Layer fill — bottom up clip */}
                  <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" className="w-full h-full drop-shadow-[0_0_18px_rgba(249,115,22,0.55)]">
                    {/* ── Main figurine shape (low-poly statue) ── */}
                    {/* Base */}
                    <path d="M15,140 L85,140 L90,120 L80,105 L20,105 L10,120 Z" fill="url(#figBase)" />
                    {/* Pedestal */}
                    <path d="M22,105 L78,105 L73,85 L27,85 Z" fill="url(#figPed)" />
                    {/* Body lower */}
                    <path d="M30,85 L70,85 L67,60 L33,60 Z" fill="url(#figBodyLow)" />
                    {/* Body upper + shoulders */}
                    <path d="M28,60 L72,60 L76,38 L65,28 L35,28 L24,38 Z" fill="url(#figBodyUp)" />
                    {/* Left arm */}
                    <path d="M24,38 L14,30 L12,50 L18,62 L30,60 L28,38 Z" fill="url(#figArm)" />
                    {/* Right arm */}
                    <path d="M76,38 L86,30 L88,50 L82,62 L70,60 L72,38 Z" fill="url(#figArm)" />
                    {/* Neck */}
                    <path d="M38,28 L62,28 L60,16 L40,16 Z" fill="url(#figBodyUp)" />
                    {/* Head */}
                    <path d="M35,16 L65,16 L68,4 L50,0 L32,4 Z" fill="url(#figHead)" />
                    {/* Face highlights */}
                    <ellipse cx="42" cy="10" rx="3" ry="2" fill="rgba(255,255,255,0.25)" />
                    <ellipse cx="58" cy="10" rx="3" ry="2" fill="rgba(255,255,255,0.25)" />
                    {/* Shadow facets */}
                    <path d="M15,140 L10,120 L50,130 Z" fill="rgba(0,0,0,0.22)" />
                    <path d="M85,140 L90,120 L50,130 Z" fill="rgba(0,0,0,0.12)" />
                    <path d="M14,30 L24,38 L18,62 Z" fill="rgba(0,0,0,0.18)" />
                    <path d="M86,30 L76,38 L82,62 Z" fill="rgba(0,0,0,0.10)" />

                    {/* Gradient defs */}
                    <defs>
                      <linearGradient id="figBase" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient id="figPed" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#c2410c" />
                      </linearGradient>
                      <linearGradient id="figBodyLow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fdba74" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      <linearGradient id="figBodyUp" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                      <linearGradient id="figArm" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#9a3412" />
                      </linearGradient>
                      <linearGradient id="figHead" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Ultra-realistic layer accumulation lines */}
                  <LayerLines />
                </div>
              </div>
            </div>

          </div>

          {/* ── Bottom status strip ──────────────────────────────────── */}
          <div className="printer-statusbar absolute bottom-0 inset-x-0 h-6 flex items-center justify-between px-4">
            <span className="text-[8px] font-mono text-neutral-500 printer-status-text">PRINTING...</span>
            <span className="text-[8px] font-mono text-orange-400/70 printer-temp-text">215°C</span>
          </div>
        </div>

        {/* ── External wires/tubes ──────────────────────────────────────── */}
        <svg className="absolute -left-4 top-16 w-8 h-40 overflow-visible opacity-30" viewBox="0 0 30 120">
          <path d="M28,4 C10,20 22,60 8,80 C2,90 14,110 4,116" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" className="printer-tube-anim" />
        </svg>

      </div>

      {/* ── Floating spec tags ─────────────────────────────────────────── */}
      <div className="printer-tag printer-tag-1 absolute text-[9px] font-bold font-mono tracking-wide text-orange-400/80 bg-neutral-900/70 border border-orange-500/20 px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap">
        0.1mm kadar hassas
      </div>
      <div className="printer-tag printer-tag-2 absolute text-[9px] font-bold font-mono tracking-wide text-amber-400/80 bg-neutral-900/70 border border-amber-500/20 px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap">
        Layer: PLA+ · 215°C
      </div>
      <div className="printer-tag printer-tag-3 absolute text-[9px] font-bold font-mono tracking-wide text-orange-300/70 bg-neutral-900/70 border border-orange-400/20 px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap">
        Katman: 3D Baskı
      </div>

      {/* ── Styles ─────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Root ──────────────────────────────────────– */
        .printer-root { transform-style: preserve-3d; }

        /* ── Ambient halos ──────────────────────────── */
        .printer-halo { pointer-events: none; mix-blend-mode: screen; filter: blur(70px); }
        .printer-halo-1 {
          width: 340px; height: 340px;
          background: radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 70%);
          animation: halo-pulse 6s ease-in-out infinite;
        }
        .printer-halo-2 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%);
          transform: translate(-60px, 40px);
          animation: halo-pulse 8s ease-in-out infinite reverse;
        }
        .printer-halo-3 {
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%);
          transform: translate(80px, -60px);
          animation: halo-pulse 5s ease-in-out infinite;
        }
        @keyframes halo-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1) translate(var(--tx,0), var(--ty,0)); }
          50%        { opacity: 1.0; transform: scale(1.15) translate(var(--tx,0), var(--ty,0)); }
        }

        /* ── 3-D perspective wrapper ────────────────── */
        .printer-perspective {
          perspective: 900px;
          transform: rotateX(7deg) rotateY(-14deg);
          transform-style: preserve-3d;
          filter: drop-shadow(0 24px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 24px rgba(249,115,22,0.18));
        }

        /* ── Enclosure ──────────────────────────────── */
        .printer-enclosure {
          background: linear-gradient(160deg,
            rgba(15,15,15,0.92) 0%,
            rgba(23,23,23,0.88) 50%,
            rgba(10,10,10,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.5),
            0 0 0 1px rgba(249,115,22,0.08),
            0 32px 80px rgba(0,0,0,0.6);
          backdrop-filter: blur(24px) saturate(1.4);
        }
        /* Glare sheen */
        .printer-glare {
          background: linear-gradient(135deg,
            rgba(255,255,255,0.07) 0%,
            transparent 45%,
            rgba(255,255,255,0.02) 100%);
          pointer-events: none;
        }

        /* ── Corner lights ──────────────────────────── */
        .printer-corner-light {
          background: radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%);
          filter: blur(4px);
          animation: corner-blink 3s ease-in-out infinite;
        }
        .printer-corner-tl { top: 8px; left: 8px; }
        .printer-corner-tr { top: 8px; right: 8px; animation-delay: 1.5s; }
        @keyframes corner-blink {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1.0; }
        }

        /* ── Top bar ──────────────────────────────── */
        .printer-topbar {
          background: rgba(0,0,0,0.55);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
        }
        .printer-status-dot {
          background: #22c55e;
          box-shadow: 0 0 5px #22c55e;
          animation: status-blink 2s step-end infinite;
        }
        @keyframes status-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }

        /* ── Progress bar fill ──────────────────────── */
        .printer-progress {
          animation: progress-fill 8s ease-in-out infinite;
        }
        @keyframes progress-fill {
          0%, 5%     { width: 0%; }
          63%, 72%   { width: 100%; }
          75%, 100%  { width: 0%; }
        }

        /* ── Z-axis rods ────────────────────────────── */
        .printer-rod {
          background: linear-gradient(to bottom,
            rgba(100,100,100,0.2) 0%,
            rgba(130,130,130,0.7) 40%,
            rgba(160,160,160,0.9) 60%,
            rgba(100,100,100,0.3) 100%);
        }
        .printer-leadscrew {
          background: linear-gradient(to right,
            transparent 0%,
            rgba(200,200,200,0.6) 30%,
            rgba(220,220,220,0.8) 50%,
            rgba(200,200,200,0.6) 70%,
            transparent 100%);
        }

        /* ── Gantry rail: moves UP as object builds UP (Z-axis) ── */
        .printer-gantry-rail {
          background: linear-gradient(to right,
            rgba(60,60,60,0) 0%,
            rgba(90,90,90,1) 10%,
            rgba(120,120,120,1) 50%,
            rgba(90,90,90,1) 90%,
            rgba(60,60,60,0) 100%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          /* Starts near bed, ascends as print progresses — synced timing */
          animation: gantry-z-v3 8s ease-in-out infinite;
        }
        @keyframes gantry-z-v3 {
          0%, 4%    { top: 297px; }
          62%       { top: 117px; }
          70%, 100% { top: 30px; }
        }

        /* ── Print head: X-axis travel — ease-in-out synced with gantry-z ── */
        .printer-head {
          animation: head-x-v4 8s ease-in-out infinite;
          left: 0;
        }
        .printer-head-body {
          background: linear-gradient(160deg, #1a1a1a 0%, #0e0e0e 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.15),
            0 8px 24px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /*
         * head_left = 70 + svg_x * 0.9
         * Layer map (SVG coords → pixel left):
         *   Y=140 base:     X=15-85  → left=84-147
         *   Y=120 base-mid: X=10-90  → left=79-151
         *   Y=105 pedestal:  X=20-80  → left=88-142
         *   Y=85  body:     X=30-70  → left=97-133
         *   Y=60  arms:     X=12-88  → left=81-149
         *   Y=38  shoulders: X=24-76  → left=92-138
         *   Y=28  neck:     X=35-65  → left=102-129
         *   Y=16  head:     X=35-65  → left=102-129
         *   Y=0   tip:      X=50     → left=115
         *
         * Each layer does 2-3 sweeps (left→right, right→left) for FDM realism
         */
        @keyframes head-x-v4 {
          0%, 4%  { left: 115px; }

          /* ── Base Y=140: X=15-85 → left=84-147 (2 sweeps) ── */
          5%   { left: 84px; }
          7%   { left: 147px; }
          9%   { left: 84px; }
          11%  { left: 147px; }

          /* ── Base-top Y=120: X=10-90 → left=79-151 (2 sweeps) ── */
          13%  { left: 79px; }
          15%  { left: 151px; }
          17%  { left: 79px; }

          /* ── Pedestal Y=105: X=20-80 → left=88-142 (2 sweeps) ── */
          19%  { left: 88px; }
          21%  { left: 142px; }
          23%  { left: 88px; }

          /* ── Body lower Y=85: X=30-70 → left=97-133 (2 sweeps) ── */
          25%  { left: 97px; }
          27%  { left: 133px; }
          29%  { left: 97px; }
          31%  { left: 133px; }

          /* ── Arms Y=60: X=12-88 → left=81-149 (3 sweeps — wider area) ── */
          33%  { left: 81px; }
          35%  { left: 149px; }
          37%  { left: 81px; }
          39%  { left: 149px; }
          41%  { left: 81px; }

          /* ── Shoulders Y=38: X=24-76 → left=92-138 (2 sweeps) ── */
          43%  { left: 92px; }
          45%  { left: 138px; }
          47%  { left: 92px; }

          /* ── Neck Y=28: X=35-65 → left=102-129 (2 sweeps) ── */
          49%  { left: 102px; }
          51%  { left: 129px; }
          53%  { left: 102px; }

          /* ── Head Y=16: X=35-65 → left=102-129 (2 sweeps) ── */
          55%  { left: 102px; }
          57%  { left: 129px; }
          59%  { left: 102px; }

          /* ── Tip Y=0: X=50 → left=115 (converge to center) ── */
          61%  { left: 129px; }
          62%  { left: 115px; }

          /* ── Eject phase: rapid park to far right ── */
          66%, 100% { left: 240px; }
        }

        /* ── Fan ──────────────────────────────────── */
        .printer-fan { background: rgba(255,255,255,0.03); }
        .printer-fan-blades {
          background: conic-gradient(
            from 0deg,
            transparent 0 30deg,
            rgba(80,80,80,0.9) 30deg 60deg,
            transparent 60deg 90deg,
            rgba(80,80,80,0.9) 90deg 120deg,
            transparent 120deg 150deg,
            rgba(80,80,80,0.9) 150deg 180deg,
            transparent 180deg 210deg,
            rgba(80,80,80,0.9) 210deg 240deg,
            transparent 240deg 270deg,
            rgba(80,80,80,0.9) 270deg 300deg,
            transparent 300deg 330deg,
            rgba(80,80,80,0.9) 330deg 360deg
          );
          animation: fan-spin 0.1s linear infinite;
        }
        @keyframes fan-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Nozzle & Hotend ────────────────────── */
        .printer-nozzle {
          width: 10px; height: 10px;
          background: linear-gradient(to bottom, #aaaaaa, #555555);
          box-shadow: 0 0 4px rgba(0,0,0,0.8);
        }
        .printer-hotend-glow {
          animation: hotend-pulse 8s ease-in-out infinite;
        }
        @keyframes hotend-pulse {
          0%, 3.9% { opacity: 0; box-shadow: none; }
          4%, 62% { opacity: 1; box-shadow: 0 0 8px 3px rgba(249,115,22,1), 0 0 16px 6px rgba(249,115,22,0.5); }
          62.1%, 100% { opacity: 0; box-shadow: none; }
        }

        /* ── Filament strand ─────────────────────── */
        .printer-filament {
          background: linear-gradient(to bottom, rgba(249,115,22,0.95), rgba(251,191,36,0.6));
          animation: filament-anim-v3 8s ease-in-out infinite;
        }
        @keyframes filament-anim-v3 {
          0%, 4%  { height: 0px;  opacity: 0; }
          4.1%    { height: 20px; opacity: 1; }
          62%     { height: 20px; opacity: 1; }
          62.1%, 100% { height: 0px; opacity: 0; }
        }

        /* ── Particles — pre-calculated JS offsets ── */
        .printer-particles { top: 100%; left: 50%; width: 0; height: 0; }
        .particle {
          width:  var(--size);
          height: var(--size);
          background: radial-gradient(circle, rgba(249,115,22,0.9) 0%, rgba(251,191,36,0.4) 100%);
          box-shadow: 0 0 4px rgba(249,115,22,0.7);
          animation: particle-burst 8s ease-in-out infinite;
          animation-delay: var(--delay);
          opacity: 0;
        }
        @keyframes particle-burst {
          0%, 4%   { transform: translate(0,0) scale(0.3); opacity: 0; }
          4.1%     { transform: translate(0,0) scale(1.0); opacity: 1; }
          12%      { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
          100%     { opacity: 0; }
        }

        /* ── Print bed — STATIC, never moves ──────── */
        .printer-bed {
          background: linear-gradient(to bottom,
            rgba(60,60,60,0.9) 0%,
            rgba(40,40,40,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-top-color: rgba(255,255,255,0.12);
          box-shadow:
            0 -2px 8px rgba(249,115,22,0.10),
            0 4px 16px rgba(0,0,0,0.5);
        }

        /* ── Printed object wrapper ───────────────── */
        .printer-object-wrapper {
          animation: object-grow-wrap-v3 8s ease-in-out infinite;
        }
        @keyframes object-grow-wrap-v3 {
          0%, 4%    { opacity: 0; transform: scale(1) translateY(0); }
          4.1%, 65% { opacity: 1; transform: scale(1) translateY(0); }
          75%, 100% { opacity: 0; transform: scale(1) translateY(0); }
        }

        /* ── Printed object clip-path grow ───────── */
        .printer-object {
          animation: object-clip-v3 8s ease-in-out infinite;
        }
        @keyframes object-clip-v3 {
          0%, 4%    { clip-path: inset(100% 0% 0% 0%); }
          62%, 65%  { clip-path: inset(0% 0% 0% 0%);  }
          100%      { clip-path: inset(0% 0% 0% 0%);  }
        }

        /* ── Layer lines ─────────────────────────── */
        .layer-line {
          background: rgba(249,115,22,0.18);
          bottom: calc(var(--layer-i) * (100% / 16));
          animation: layer-reveal 8s ease-in-out infinite;
          animation-delay: calc(4s + var(--layer-i) * 0.07s);
          opacity: 0;
        }
        @keyframes layer-reveal {
          0%   { opacity: 0; }
          5%   { opacity: 0.8; }
          30%  { opacity: 0.3; }
          65%  { opacity: 0.15; }
          100% { opacity: 0; }
        }

        /* ── Status bar ──────────────────────────── */
        .printer-statusbar {
          background: rgba(0,0,0,0.6);
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .printer-status-text {
          animation: status-cycle 8s steps(1) infinite;
        }
        @keyframes status-cycle {
          0%   { content: ""; }
          0%, 8%  { color: rgba(249,115,22,0.8); }
          66%     { color: rgba(34,197,94,0.8); }
          74%     { color: rgba(59,130,246,0.8); }
          82%     { color: rgba(249,115,22,0.8); }
        }

        /* ── Tube animation ──────────────────────── */
        .printer-tube-anim {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: tube-draw 8s ease-in-out infinite;
        }
        @keyframes tube-draw {
          0%, 4%   { stroke-dashoffset: 120; }
          30%      { stroke-dashoffset: 0;   }
          100%     { stroke-dashoffset: 0;   }
        }

        /* ── Floating tags ───────────────────────── */
        .printer-tag {
          animation: tag-float 6s ease-in-out infinite;
        }
        .printer-tag-1 {
          bottom: 60px; right: -10px;
          animation-delay: 0s;
        }
        .printer-tag-2 {
          top: 80px; right: -20px;
          animation-delay: 2s;
        }
        .printer-tag-3 {
          bottom: 110px; left: -20px;
          animation-delay: 4s;
        }
        @keyframes tag-float {
          0%, 100% { transform: translateY(0px); opacity: 0.75; }
          50%       { transform: translateY(-6px); opacity: 1.0; }
        }
      `}</style>
    </div>
  )
}

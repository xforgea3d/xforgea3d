'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ZoomInIcon, ZoomOutIcon, RotateCcwIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'

interface ProductLightboxProps {
    images: string[]
    initialIndex: number
    open: boolean
    onClose: () => void
    onIndexChange: (index: number) => void
}

export default function ProductLightbox({
    images,
    initialIndex,
    open,
    onClose,
    onIndexChange,
}: ProductLightboxProps) {
    const [scale, setScale] = useState(1)
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const imgRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex])

    // Reset zoom when changing images or opening
    useEffect(() => {
        setScale(1)
    }, [currentIndex, open])

    // Keyboard navigation
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'Escape') onClose()
            if (e.key === '+' || e.key === '=') zoomIn()
            if (e.key === '-') zoomOut()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, currentIndex])

    const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4))
    const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5))
    const resetZoom = () => setScale(1)

    const goNext = () => {
        const next = Math.min(currentIndex + 1, images.length - 1)
        setCurrentIndex(next)
        onIndexChange(next)
    }
    const goPrev = () => {
        const prev = Math.max(currentIndex - 1, 0)
        setCurrentIndex(prev)
        onIndexChange(prev)
    }

    // Scroll to zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        if (e.deltaY < 0) zoomIn()
        else zoomOut()
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-7xl w-full h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">Ürün Görseli</DialogTitle>
                <div className="relative w-full h-full flex flex-col bg-black/96 rounded-xl overflow-hidden">
                    {/* Top toolbar */}
                    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
                        <span className="text-white/70 text-sm font-medium tabular-nums">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10">
                            <button onClick={zoomIn} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors" title="Yakınlaştır">
                                <ZoomInIcon className="w-4 h-4" />
                            </button>
                            <button onClick={zoomOut} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors" title="Uzaklaştır">
                                <ZoomOutIcon className="w-4 h-4" />
                            </button>
                            <button onClick={resetZoom} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors" title="Sıfırla">
                                <RotateCcwIcon className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-white/20 mx-1" />
                            <button onClick={onClose} className="p-2 hover:bg-red-500/30 rounded-md text-white transition-colors" title="Kapat">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main image area */}
                    <div
                        ref={imgRef}
                        className="flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in"
                        onWheel={handleWheel}
                    >
                        <div
                            className="relative w-[85vw] h-[75vh] max-w-5xl transition-transform duration-200 ease-out"
                            style={{ transform: `scale(${scale})` }}
                        >
                            <img
                                src={images[currentIndex]}
                                className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
                                alt={`Product image ${currentIndex + 1}`}
                                draggable={false}
                            />
                        </div>
                    </div>

                    {/* Left/Right navigation arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 disabled:opacity-30 transition"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goNext}
                                disabled={currentIndex === images.length - 1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 disabled:opacity-30 transition"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Bottom thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="flex gap-2 overflow-x-auto max-w-full px-2 py-1.5 bg-black/60 backdrop-blur rounded-xl border border-white/10">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrentIndex(idx); onIndexChange(idx) }}
                                        className={cn(
                                            "relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                                            idx === currentIndex
                                                ? "border-white opacity-100 scale-105"
                                                : "border-transparent opacity-40 hover:opacity-70"
                                        )}
                                    >
                                        <img src={img} className="absolute inset-0 h-full w-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Zoom level indicator */}
                    {scale !== 1 && (
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
                            <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full border border-white/10 backdrop-blur">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

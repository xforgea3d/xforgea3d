'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * NavigationProgressBar — a thin top-of-page progress bar that appears
 * instantly when the user clicks any link, giving the immediate visual
 * feedback that something is happening. This is the single biggest
 * perceived-speed improvement for Next.js apps.
 *
 * It uses CSS animations driven by state, so it's zero-dependency.
 */
export function NavigationProgressBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [visible, setVisible] = useState(false)
    const [done, setDone] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        // Page changed — mark as done and fade out
        setDone(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            setVisible(false)
            setDone(false)
        }, 400)
    }, [pathname, searchParams])

    // Listen for clicks on any <a> or Link-rendered element
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return
            const href = target.getAttribute('href')
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return
            setDone(false)
            setVisible(true)
        }
        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [])

    if (!visible) return null

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none"
            aria-hidden="true"
        >
            <div
                className={
                    'h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-all ' +
                    (done ? 'w-full opacity-0 duration-300' : 'w-[85%] opacity-100 duration-[2000ms] ease-out')
                }
            />
        </div>
    )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgressBar() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)
    const [done, setDone] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        setDone(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            setVisible(false)
            setDone(false)
        }, 400)
    }, [pathname])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return
            const href = target.getAttribute('href')
            if (!href || href.startsWith('http') || href.startsWith('#')) return
            setDone(false)
            setVisible(true)
        }
        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [])

    if (!visible) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none" aria-hidden="true">
            <div
                className={
                    'h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 transition-all ' +
                    (done ? 'w-full opacity-0 duration-300' : 'w-[80%] opacity-100 duration-[2000ms] ease-out')
                }
            />
        </div>
    )
}

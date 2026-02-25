import { NextResponse } from 'next/server'

/**
 * GET /api/custom-order/colors
 * Returns the list of available filament colors for the custom order form.
 * These are hardcoded for now; in a full implementation they would come
 * from the admin panel (e.g., a Colors table in Prisma).
 */
export async function GET() {
    const colors = [
        { id: 'white', name: 'Beyaz', hex: '#FFFFFF' },
        { id: 'black', name: 'Siyah', hex: '#1a1a1a' },
        { id: 'gray', name: 'Gri', hex: '#9ca3af' },
        { id: 'red', name: 'Kırmızı', hex: '#ef4444' },
        { id: 'orange', name: 'Turuncu', hex: '#f97316' },
        { id: 'yellow', name: 'Sarı', hex: '#eab308' },
        { id: 'green', name: 'Yeşil', hex: '#22c55e' },
        { id: 'blue', name: 'Mavi', hex: '#3b82f6' },
        { id: 'purple', name: 'Mor', hex: '#a855f7' },
        { id: 'pink', name: 'Pembe', hex: '#ec4899' },
        { id: 'silver', name: 'Gümüş', hex: '#C0C0C0' },
        { id: 'gold', name: 'Altın', hex: '#FFD700' },
        { id: 'brown', name: 'Kahve', hex: '#92400e' },
        { id: 'navy', name: 'Lacivert', hex: '#1e3a5f' },
        { id: 'teal', name: 'Yeşil-Mavi', hex: '#0f766e' },
        { id: 'maroon', name: 'Bordo', hex: '#7f1d1d' },
    ]

    return NextResponse.json(colors, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
}

/** @type {import('next').NextConfig} */

module.exports = {
    compress: true,
    poweredByHeader: false,
    transpilePackages: [
        '@persepolis/mail',
        '@persepolis/regex',
        '@persepolis/rng',
        '@persepolis/slugify',
        '@persepolis/sms',
        '@persepolis/zarinpal',
    ],
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
        ],
    },
    typescript: { ignoreBuildErrors: false },
    eslint: { ignoreDuringBuilds: true },
    // next/image is no longer used — all images use native <img> tags
    // to avoid remotePatterns issues with Supabase storage URLs.
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'wsomqsbgclyhhtaocxio.supabase.co' },
        ],
    },
    async headers() {
        return [
            {
                source: '/((?!admin07).*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://images.unsplash.com https://wsomqsbgclyhhtaocxio.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-ancestors 'none';" },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                source: '/logo(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
            },
        ]
    },
    async redirects() {
        return [
            {
                source: '/product',
                destination: '/products',
                permanent: true,
            },
        ]
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/admin07',
                    destination: 'https://xforgea-admin.vercel.app/admin07',
                },
                {
                    source: '/admin07/:path*',
                    destination: 'https://xforgea-admin.vercel.app/admin07/:path*',
                },
            ],
        }
    },
}

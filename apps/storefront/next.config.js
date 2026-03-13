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
    eslint: { ignoreDuringBuilds: false },
    // next/image is no longer used — all images use native <img> tags
    // to avoid remotePatterns issues with Supabase storage URLs.
    images: {
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-ancestors 'none';" },
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
}

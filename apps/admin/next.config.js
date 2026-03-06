/** @type {import('next').NextConfig} */

module.exports = {
   compress: true,
   poweredByHeader: false,
   experimental: {
      optimizePackageImports: [
         'lucide-react',
         '@radix-ui/react-icons',
         '@radix-ui/react-dropdown-menu',
         '@radix-ui/react-dialog',
         '@radix-ui/react-navigation-menu',
         '@radix-ui/react-select',
         '@radix-ui/react-tooltip',
         '@radix-ui/react-tabs',
         '@radix-ui/react-popover',
      ],
   },
   typescript: { ignoreBuildErrors: false },
   eslint: { ignoreDuringBuilds: true },
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: '*.supabase.co',
         },
         {
            protocol: 'https',
            hostname: 'wsomqsbgclyhhtaocxio.supabase.co',
         },
      ],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 86400,
      deviceSizes: [640, 750, 828, 1080, 1200],
      imageSizes: [16, 32, 48, 64, 96, 128, 256],
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
               { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';" },
            ],
         },
         {
            source: '/_next/static/(.*)',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
         },
         {
            source: '/favicon(.*)',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
         },
      ]
   },
}

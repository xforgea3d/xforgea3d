/** @type {import('next').NextConfig} */

module.exports = {
   basePath: '/admin07',
   compress: true,
   poweredByHeader: false,
   transpilePackages: [
      '@persepolis/mail',
      '@persepolis/regex',
      '@persepolis/rng',
      '@persepolis/slugify',
      '@persepolis/sms',
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
         '@radix-ui/react-tabs',
         '@radix-ui/react-popover',
      ],
   },
   typescript: { ignoreBuildErrors: false },
   eslint: { ignoreDuringBuilds: true },
   // next/image is not used — all images use native <img> tags.
   // unoptimized: true disables the Next.js image optimization API entirely.
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
               { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';" },
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

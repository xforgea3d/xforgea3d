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
   eslint: { ignoreDuringBuilds: false },
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
               // CSP removed — admin panel is an internal tool behind auth.
               // A restrictive CSP was causing external Supabase storage images to break.
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

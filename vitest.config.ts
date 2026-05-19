import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
   test: {
      globals: true,
      environment: 'node',
      include: [
         '__tests__/**/*.test.ts',
         'apps/storefront/__tests__/**/*.test.{ts,tsx}',
         'apps/admin/__tests__/**/*.test.{ts,tsx}',
      ],
      setupFiles: ['__tests__/setup.ts'],
      testTimeout: 15000,
   },
   resolve: {
      alias: {
         '@storefront': path.resolve(__dirname, 'apps/storefront/src'),
         '@admin': path.resolve(__dirname, 'apps/admin/src'),
         '@/app/api/orders/route': path.resolve(__dirname, 'apps/storefront/src/app/api/orders/route.ts'),
         '@/app/auth/callback/route': path.resolve(__dirname, 'apps/storefront/src/app/auth/callback/route.ts'),
         '@/app/api/auth/logout/route': path.resolve(__dirname, 'apps/storefront/src/app/api/auth/logout/route.ts'),
         '@/config/site': path.resolve(__dirname, 'apps/storefront/src/config/site.ts'),
         '@/lib/csrf': path.resolve(__dirname, 'apps/storefront/src/lib/csrf.ts'),
         '@/lib/error-logger': path.resolve(__dirname, 'apps/storefront/src/lib/error-logger.ts'),
         '@/emails/order_notification_owner': path.resolve(__dirname, 'apps/storefront/src/emails/order_notification_owner.tsx'),
         // @/ alias — admin routes use @/ to mean apps/admin/src/
         // This works for tests that import from a single app at a time.
         // For storefront tests, the setup.ts mock handles @/lib/supabase/*
         '@/': path.resolve(__dirname, 'apps/admin/src') + '/',
      },
   },
})

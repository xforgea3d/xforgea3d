import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
   test: {
      globals: true,
      environment: 'node',
      include: ['__tests__/**/*.test.ts'],
      setupFiles: ['__tests__/setup.ts'],
      testTimeout: 15000,
   },
   resolve: {
      alias: {
         '@storefront': path.resolve(__dirname, 'apps/storefront/src'),
         '@admin': path.resolve(__dirname, 'apps/admin/src'),
      },
   },
})

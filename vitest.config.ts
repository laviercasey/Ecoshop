import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./resources/js/shared/test/setup.ts'],
    include: ['resources/js/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'resources/js/app'),
      '@pages': path.resolve(__dirname, 'resources/js/pages'),
      '@widgets': path.resolve(__dirname, 'resources/js/widgets'),
      '@features': path.resolve(__dirname, 'resources/js/features'),
      '@entities': path.resolve(__dirname, 'resources/js/entities'),
      '@shared': path.resolve(__dirname, 'resources/js/shared'),
    },
  },
});

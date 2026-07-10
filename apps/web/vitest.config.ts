import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./jest.setup.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}', 'next.config.ts'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/features/pokemon/types/**',
        'src/app/globals.css',
        'next-env.d.ts',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/app/layout.tsx',
        'src/**/*.d.ts',
        'src/lib/types.ts',   // type-only file, no runtime code
        'src/lib/supabase.ts', // infrastructure proxy, mocked in all tests
        'src/lib/supabaseAdmin.ts', // server-only admin client, not unit-testable
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

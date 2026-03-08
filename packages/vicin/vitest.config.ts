import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'vicin',
    dir: '.',
    environment: 'node',
    include: ['**/tests/**/*.test.ts'],
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'phantom',
    dir: '.',
    environment: 'node',
    include: ['**/tests/**/*.test.ts'],
  },
});

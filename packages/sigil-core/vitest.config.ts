import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'sigil-core',
    dir: '.',
    environment: 'node',
    include: ['**/tests/**/*.test.ts'],
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'superjson',
    dir: '.',
    environment: 'node',
    include: ['**/tests/**/*.test.ts', 'src/*.test.ts'],
  },
});

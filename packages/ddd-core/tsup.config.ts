import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2019',
  treeshake: true,
  external: ['@vicin/sigil-core'],
});

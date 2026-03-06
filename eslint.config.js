import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import pluginJest from 'eslint-plugin-jest';
import globals from 'globals';

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,

  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  // ── Base config for all JS/TS files ───────────────────────────────────────
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        project: [
          './tsconfig.json',
          './packages/core/tsconfig.json',
          './packages/extended/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',

      'no-console': 'warn',

      // Turn off ESLint core rules that TypeScript handles better
      'no-unused-vars': 'off',
      'no-redeclare': 'off',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },

  // ── Test files override ───────────────────────────────────────────────────
  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}', '**/__tests__/**/*'],
    plugins: {
      jest: pluginJest,
    },
    rules: {
      // Jest lint rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',

      // Modified normal lint
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      globals: {
        browser: true,
        es2020: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        es2020: true,
        node: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      'tests/**/*',
      'jest.config.js',
      'vite.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
      'drizzle.config.ts',
    ],
  },
];

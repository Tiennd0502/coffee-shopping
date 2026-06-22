import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

/**
 * @param {string} importMetaUrl Pass `import.meta.url` from the consuming app's eslint.config.mjs
 */
export function createNodeEslintConfig(importMetaUrl) {
  const __dirname = dirname(fileURLToPath(importMetaUrl));

  return defineConfig(
    {
      ignores: [
        'dist/**',
        'node_modules/**',
        'jest.config.ts',
        'jest.setup.ts',
        'eslint.config.mjs',
      ],
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    eslintConfigPrettier,
    {
      files: ['**/*.ts'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: __dirname,
        },
      },
      settings: {
        'import/resolver': {
          typescript: {
            project: './tsconfig.json',
          },
        },
      },
      plugins: {
        import: importPlugin,
        'unused-imports': unusedImports,
      },
      rules: {
        'no-console': 'off',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      languageOptions: {
        globals: {
          afterAll: 'readonly',
          afterEach: 'readonly',
          beforeAll: 'readonly',
          beforeEach: 'readonly',
          describe: 'readonly',
          expect: 'readonly',
          it: 'readonly',
          jest: 'readonly',
          test: 'readonly',
        },
      },
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
  );
}

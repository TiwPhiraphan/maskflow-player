import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '.changeset/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@maskflow/*'],
              message: 'No scoped packages: maskflow is unscoped. Never import @maskflow/*',
            },
          ],
        },
      ],
    },
  },
  // Import boundary: src/core
  {
    files: ['**/packages/maskflow/src/core/**/*.{ts,tsx,js}', '**/src/core/**/*.{ts,tsx,js}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'src/core must not import react.',
            },
            {
              name: 'vue',
              message: 'src/core must not import vue.',
            },
          ],
          patterns: [
            {
              group: ['**/react/**', '**/vue/**', '../*react*', '../*vue*'],
              message: 'src/core must not import from src/react or src/vue.',
            },
            {
              group: ['@maskflow/*'],
              message: 'No scoped packages: maskflow is unscoped.',
            },
          ],
        },
      ],
    },
  },
  // Import boundary: src/react
  {
    files: ['**/packages/maskflow/src/react/**/*.{ts,tsx,js}', '**/src/react/**/*.{ts,tsx,js}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              message: 'src/react must not import vue.',
            },
          ],
          patterns: [
            {
              group: ['**/vue/**', '../*vue*'],
              message: 'src/react must not import from src/vue.',
            },
            {
              group: ['@maskflow/*'],
              message: 'No scoped packages: maskflow is unscoped.',
            },
          ],
        },
      ],
    },
  },
  // Import boundary: src/vue
  {
    files: ['**/packages/maskflow/src/vue/**/*.{ts,tsx,js}', '**/src/vue/**/*.{ts,tsx,js}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'src/vue must not import react.',
            },
          ],
          patterns: [
            {
              group: ['**/react/**', '../*react*'],
              message: 'src/vue must not import from src/react.',
            },
            {
              group: ['@maskflow/*'],
              message: 'No scoped packages: maskflow is unscoped.',
            },
          ],
        },
      ],
    },
  },
);

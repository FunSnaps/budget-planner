import svelte from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['.svelte-kit/', '.vercel/', 'build/', 'node_modules/'] },
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.svelte'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parserOptions: { parser: tsParser } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

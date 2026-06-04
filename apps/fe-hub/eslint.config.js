import goyConfig from "@the-goy-company/config-eslint";
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...goyConfig,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    rules: {
      // Add custom rules here
    },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
);

import goyConfig from "@the-goy-company/config-eslint";
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...goyConfig,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Add custom rules here
    },
  },
  {
    ignores: ['dist/', '.wrangler/', 'node_modules/'],
  },
);

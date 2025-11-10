import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        firebase: 'readonly',
        WordCloud: 'readonly',
        google: 'readonly',
        Masonry: 'readonly'
      }
    },
    plugins: {
      prettier
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error'
    }
  }
];

import typescriptEslint from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

// Astro 移行に伴い eslint-config-next / core-web-vitals を外した。
// あの2つは next/image・next/link の使用を強制する規則を含んでおり、
// Next を使わなくなった今は誤検知しか生まない。
// .astro ファイルは Astro 自身の型チェック（astro check）に任せ、
// ここでは src/scripts の js/ts/tsx のみを対象にする。
export default [
  {
    ignores: ['node_modules', 'dist', '.astro', 'public'],
  },
  js.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]

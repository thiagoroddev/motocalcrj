import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'build/', 'node_modules/'] },

  js.configs.recommended,

  // TypeScript: parser (todos os arquivos) + regras recomendadas (*.ts, *.tsx)
  ...tsPlugin.configs['flat/recommended'],

  // Import plugin: regras base + TypeScript resolver
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  // React hooks
  reactHooks.configs['recommended-latest'],

  // Regras do projeto
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-constant-binary-expression': 'error',

      // eslint-plugin-import produz falsos positivos com React/TypeScript para default exports
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      // Módulos virtuais do unplugin-icons (resolvidos pelo Vite, não pelo eslint)
      'import/no-unresolved': ['error', { ignore: ['^~icons/'] }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // != null é idiomático para checar null-or-undefined em TypeScript
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
    },
  },

  prettier,
];

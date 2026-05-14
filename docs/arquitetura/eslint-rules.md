# ESLint + Prettier - Padrao de Codigo

## Objetivo

Padronizar o codigo do projeto, reduzir bugs comuns e manter consistencia com ESLint e Prettier.

## Dependencias recomendadas

Instale com o gerenciador de pacotes do projeto:

- eslint
- prettier
- eslint-config-prettier
- eslint-plugin-prettier
- eslint-plugin-import
- eslint-plugin-unused-imports
- @typescript-eslint/parser
- @typescript-eslint/eslint-plugin

## Configuracao basica

Crie ou ajuste os arquivos a seguir:

### .eslintrc.cjs (exemplo)

```js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unused-imports", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    // Prettier como fonte de formatacao
    "prettier/prettier": "error",

    // Erros reais
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-unsafe-optional-chaining": "error",
    "no-constant-binary-expression": "error",

    // Importacao e organizacao
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",

    // Limpeza de codigo
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    // Qualidade
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
  },
  ignorePatterns: ["dist/", "build/", "node_modules/"],
};
```

### .prettierrc.cjs (exemplo)

```js
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
};
```

### .eslintignore (exemplo)

```
dist
build
node_modules
```

## Regras de padronizacao

- Use `eqeqeq` sempre (nada de `==`).
- Evite `console.log`; apenas `console.warn` e `console.error` quando necessario.
- Remova imports nao usados antes de commitar.
- Prefira `const` e `let`; evite `var`.
- Use chaves em todos os blocos `if/for/while`.
- Linhas com ate 100 caracteres.

## Scripts recomendados (package.json)

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.cjs,.mjs,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.cjs,.mjs,.ts,.tsx --fix",
    "format": "prettier . --write"
  }
}
```

## Como usar

1. Rode `npm run lint` antes de abrir PR.
2. Rode `npm run lint:fix` para ajustes automaticos.
3. Rode `npm run format` para formatar arquivos.

## Observacoes

- Ajuste as regras caso o projeto nao utilize TypeScript.
- Mantenha ESLint e Prettier na mesma versao entre os desenvolvedores.

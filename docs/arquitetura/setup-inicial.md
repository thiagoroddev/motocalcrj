# Setup - MotoCalc RJ

Este guia segue o stack definido em Requisitos_MotoCalc_RJ_v6.

## Pre-requisitos

- Node.js LTS (18+ ou 20+)
- npm (ou pnpm/yarn, padronizar no time)

## 1) Criar o projeto

```bash
npm create vite@latest motocalc -- --template react-ts
cd motocalc
npm install
```

## 2) Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.cjs` (conteudo):

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

`src/index.css` (base):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 3) ESLint + Prettier

Seguir o padrao em `docs/eslint-rules.md`.

## 3.1) Convencoes de Codigo (PT-BR)

Seguir `docs/Convencoes.md` para nomes, idioma e comentarios.

## 4) Vitest (quando chegar na TASK-0.4)

- Instalar e configurar o script `npm run test`.
- Definir estrutura inicial de testes para `src/utils`.

## 5) Estrutura inicial de pastas

```
src/
  components/
  pages/
  routes/
  context/
  hooks/
  utils/
  types/
  data/
  presets/
  fixtures/
```

## 6) Dados iniciais (fixtures)

Copiar a partir de `docs/data-testes/`:

- `docs/data-testes/dados_rj.json` -> `src/data/dados_rj.json`
- `docs/data-testes/pop110i.json` -> `src/presets/pop110i.json`
- `docs/data-testes/usuario_teste.json` -> `src/fixtures/usuario_teste.json`

## 7) Scripts recomendados

`package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "vitest run"
  }
}
```

## 8) Rodar o projeto

```bash
npm run dev
```

## 9) Proximos passos

- Implementar `PerfilContext` e `usePerfil`.
- Iniciar onboarding e rotas.
- Implementar funcoes de calculo e testes.

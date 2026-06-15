# Configuracao global CSS (Tailwind)

Este documento define a configuracao global de CSS para o tema do MotoCalc RJ e o mapa de cores do projeto.

## Arquivo global (src/index.css)

Use o arquivo global do Tailwind para carregar as camadas base e aplicar o tema padrao:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }

  body {
    @apply bg-surface text-white font-sans;
  }
}
```

- `color-scheme: dark` ajuda navegadores a renderizar componentes nativos com tema escuro.
- `bg-surface` e `text-white` alinham com o tema definido no design.

## Tema e cores do projeto (tailwind.config.cjs)

As cores do tema estao configuradas em `theme.extend.colors`:

```js
colors: {
  primary: '#0078FF',
  surface: '#0D1321',
  'surface-dim': '#0D1321',
  'surface-bright': '#333948',
  'surface-cont': '#19192E',
  neutral: '#C1C6D7',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
}
```

Uso recomendado:

- Fundo principal: `bg-surface`
- Superficie de cards/inputs: `bg-surface-bright`
- Containers secundarios: `bg-surface-cont`
- Texto principal: `text-white`
- Texto secundario: `text-neutral`
- CTA e selecao ativa: `bg-primary` / `text-primary`
- Alertas informativos: `text-warning` / `border-warning`
- Alertas criticos: `text-danger` / `border-danger`
- Status positivo: `text-success`

## Tipografia

O tema define `font-sans` como Inter:

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

Garanta o carregamento da fonte Inter no `index.html` (Google Fonts) quando necessario.

## Tokens de espacamento e tamanho

Tokens customizados:

- `xs: 4px`
- `sm: 8px`
- `md: 16px`
- `lg: 24px`
- `xl: 32px`

Outros tokens:

- `borderRadius.card: 12px`
- `minHeight.touch: 48px`

## Observacoes

- Mantenha a paleta consistente com o design system.
- Evite cores hardcoded fora de componentes isolados; prefira os tokens do tema.

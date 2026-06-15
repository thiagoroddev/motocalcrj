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


## Tokens de Cor (Shadcn/ui — CSS vars)

O projeto usa a **convenção CSS vars do Shadcn** — não `--color-*` customizado.
Qualquer IA ou dev que ver shadcn instalado vai encontrar os padrões esperados.

```css
/* index.css — valores em canal RGB sem vírgula (padrão shadcn) */
:root {
  --background: 13 19 33; /* #0D1321 */
  --foreground: 193 198 215; /* #C1C6D7 */
  --card: 18 26 44;
  --card-foreground: 255 255 255;
  --primary: 0 120 255; /* #0078FF */
  --primary-foreground: 255 255 255;
  --secondary: 0 192 232; /* #00C0E8 */
  --secondary-foreground: 13 19 33;
  --muted: 30 38 58; /* #1E263A */
  --muted-foreground: 139 144 160; /* #8B90A0 label neutro */
  --accent: 0 40 91; /* #00285B */
  --accent-foreground: 173 199 255; /* #ADC7FF */
  --destructive: 239 68 68; /* #EF4444 */
  --destructive-foreground: 255 255 255;
  --border: 30 38 58;
  --input: 30 38 58;
  --ring: 0 120 255;
  --radius: 0.75rem;
}
```

| Token Shadcn         | Classe Tailwind         | Cor     |
| -------------------- | ----------------------- | ------- |
| `--background`       | `bg-background`         | #0D1321 |
| `--foreground`       | `text-foreground`       | #C1C6D7 |
| `--card`             | `bg-card`               | #121A2C |
| `--primary`          | `bg-primary`            | #0078FF |
| `--muted`            | `bg-muted`              | #1E263A |
| `--muted-foreground` | `text-muted-foreground` | #8B90A0 |
| `--destructive`      | `bg-destructive`        | #EF4444 |
| `--border`           | `border-border`         | #1E263A |

Utilitários customizados (em `index.css`):

```css
.label-neutro {
  @apply text-muted-foreground text-[10px] uppercase tracking-wider font-medium;
}
.label-destaque {
  @apply text-secondary text-[10px] uppercase tracking-wider font-medium;
}
```

```
// Radios: var(--radius) = 0.75rem (cards, dialogs) | 0.5rem (btn/input)
// Fonte: Inter | Grid: 8pt | Toque mínimo: 48px (min-h-touch)
// ❌ PROIBIDO: usar bg-surface-*, bg-surface-cont, text-neutral, border-surface-*
//    Esses tokens foram substituídos pelos CSS vars do Shadcn acima.
```

## Componentes shadcn Mapeados (a instalar)

| Componente | Uso                                           |
| ---------- | --------------------------------------------- |
| Card       | Cards de custo, cards informativos            |
| Accordion  | Categorias no Detalhamento                    |
| Switch     | Toggles de categoria                          |
| Dialog     | Modal de gasto, confirmação "Apagar Tudo"     |
| Badge      | Status de revisão, "Modo personalizado ativo" |
| Select     | Dropdown ano, tipo de óleo, marca             |
| Tabs       | Sub-abas da tela Registros                    |
| Input      | Todos os inputs                               |
| Button     | Todos os botões                               |
| Separator  | Divisores entre seções                        |
| Toggle     | MENSAL/ANUAL, AUTORIZADAS/INDEPENDENTES       |
| Sheet      | Painel hamburguer                             |

---

## Rotas Definidas

```
/onboarding/1 a /onboarding/9
/onboarding/6/financiamento
/onboarding/6/aluguel
/onboarding/6/responsabilidade
/estimativa
/estimativa/detalhamento
/registros
/mao-de-obra
/vida-util
/ajustes
/perfil
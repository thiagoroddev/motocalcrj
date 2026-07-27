# Configuracao global CSS (Tailwind)

Este documento define a configuracao global de CSS para o tema do MotoCusto RJ e o mapa de cores do projeto.

## Arquivo global (src/index.css)

Tailwind v4 - a configuração de tema vai no próprio CSS, não em `tailwind.config.cjs` (removido):

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* Tokens mapeados para variáveis CSS */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  /* ... demais tokens ... */

  /* Tipografia */
  --font-sans: Inter, system-ui, sans-serif;

  /* Espaçamento: escala numérica padrão do Tailwind (NÃO redefinir --spacing-*) - ver ADR-008 */

  /* Border radius */
  --radius-btn: 4px;
  --radius-input: 4px;
  --radius-lg: var(--radius);   /* card radius - depende de --radius em :root */

  /* Touch target */
  --size-touch: 48px;
}

:root {
  --radius: 0.5rem;  /* ADR-002: alinhado ao padrão shadcn */
  /* ... cores em rgb() ... */
}
```

- `@import "tailwindcss"` substitui `@tailwind base/components/utilities` (sintaxe v3).
- Não há `tailwind.config.cjs` - tudo em CSS.
- `color-scheme: dark` definido no `:root` via `color-scheme: dark`.
- Body: `@apply bg-background text-foreground font-sans` (tokens shadcn, não `bg-surface`).

## Tipografia

Inter via `--font-sans` no `@theme inline`. Carregamento no `index.html` via Google Fonts.

## Tokens de espaçamento e tamanho

**Spacing/sizing seguem a escala numérica padrão do Tailwind/shadcn** (`p-4`, `gap-2`, `space-y-4`…).
**Proibido redefinir `--spacing-*` no `@theme`** - as chaves nomeadas `sm/md/lg/xl` colidem com a
escala de container que `max-w-*` consome no Tailwind v4 (causou a TASK-BG-009). Ver **ADR-008**.
Guard-rail: `scripts/check-spacing-tokens.mjs` (roda no `npm run lint`).

Equivalência usada na conversão (TASK-REF-26): `xs→1` (4px), `sm→2` (8px), `md→4` (16px),
`lg→6` (24px), `xl→8` (32px). A escala base do Tailwind é `1 = 0.25rem = 4px`.

| Token | Valor | Classe Tailwind |
|---|---|---|
| `--size-touch` | 48px | `min-h-touch` |
| `--radius` | 0.5rem | base do sistema de radius |
| `--radius-lg` | = `--radius` | `rounded-lg` (cards) |
| `--radius-btn` | 4px | `rounded-btn` (botões) |
| `--radius-input` | 4px | `rounded-input` (inputs) |

## Observacoes

- Mantenha a paleta consistente com o design system.
- Evite cores hardcoded fora de componentes isolados; prefira os tokens do tema.


## Tokens de Cor (Shadcn/ui - CSS vars)

O projeto usa a **convenção CSS vars do Shadcn** - não `--color-*` customizado.
Valores em formato `rgb()` (padrão pós-TASK-RNF-006 / Tailwind v4):

```css
/* index.css - :root (tema escuro padrão) */
:root {
  --radius: 0.5rem;                  /* ADR-002: alinhado ao shadcn */
  --background: rgb(13 19 33);       /* #0D1321 */
  --foreground: rgb(255 255 255);
  --card: rgb(25 31 46);
  --card-foreground: rgb(255 255 255);
  --primary: rgb(0 120 255);         /* #0078FF */
  --primary-foreground: rgb(13 19 33);
  --secondary: rgb(173 199 255);     /* #ADC7FF */
  --secondary-foreground: rgb(13 19 33);
  --muted: rgb(51 57 72);
  --muted-foreground: rgb(193 198 215);
  --destructive: rgb(147 0 10);
  --destructive-foreground: rgb(255 255 255);
  --border: rgb(51 57 72);
  --input: rgb(51 57 72);
  --ring: rgb(0 120 255);
  --accent: rgb(51 57 72);
  --accent-foreground: rgb(255 255 255);
  /* tokens customizados */
  --label: rgb(139 144 160);         /* #8B90A0 - label-neutro */
  --warning: rgb(255 182 149);
  --success: rgb(34 197 94);
  --cyan: rgb(0 192 232);
  --tertiary: rgb(0 40 91);
  --surface-dim: rgb(13 19 33);
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
// Radius: --radius = 0.5rem (ADR-002) → rounded-lg = card radius
//         --radius-btn = 4px → rounded-btn | --radius-input = 4px → rounded-input
// Fonte: Inter | Grid: 8pt | Toque mínimo: 48px (min-h-touch)
// ❌ PROIBIDO: usar bg-surface-*, bg-surface-cont, text-neutral, border-surface-*
//    Esses tokens foram removidos em TASK-RNF-006. Usar os CSS vars do Shadcn acima.
```

## Componentes shadcn Instalados

| Componente | Uso | Status |
| ---------- | --- | ------ |
| Card       | Cards de custo, cards informativos | ✅ Em uso |
| Accordion  | Categorias no Detalhamento | ✅ Em uso |
| Switch     | Toggles de categoria (atenção: Toggle custom é diferente do Switch) | ✅ Instalado |
| Dialog     | Modal de gasto, confirmação "Apagar Tudo" | ✅ Instalado |
| Badge      | Status de revisão, "Modo personalizado ativo" | ✅ Em uso |
| Select     | Dropdown ano, tipo de óleo, marca | [ ] Pendente uso |
| Tabs       | Sub-abas da tela Registros | ✅ Instalado |
| Input      | Todos os inputs | ✅ Em uso |
| Button     | Todos os botões | ✅ Em uso |
| Separator  | Divisores entre seções | ✅ Instalado |
| Toggle     | MENSAL/ANUAL, AUTORIZADAS/INDEPENDENTES | ✅ Instalado |
| Sheet      | Painel hamburguer | ✅ Instalado |
| Label      | Labels de input | ✅ Em uso |

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
/insumos
/ajustes
/perfil
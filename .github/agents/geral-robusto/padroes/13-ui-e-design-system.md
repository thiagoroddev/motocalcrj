---
description: "Componentes UI: princípios, template forwardRef, variantes cva, wrappers de bibliotecas, compound components, acessibilidade visual, tokens de design."
modulo: "13"
categoria: "padroes"
versao: "1.0"
relacionado:
  - "11-arquitetura-e-pastas.md"
  - "12-react-e-estado.md"
  - "16-performance-acessibilidade.md"
---

# 🎨 UI e Design System

> Componentes UI são **infraestrutura visual**, não pedaços do seu negócio. Quando bem feitos, eles respondem antes de você perguntar: _"como um botão se comporta no foco?"_, _"qual cor para erro?"_, _"qual altura para um input?"_.

---

## 1. Princípios Fundamentais

### 1.1 Os Cinco Mandamentos do Componente UI

|#|Princípio|Significado prático|
|---|---|---|
|1|**Zero lógica de negócio**|Um `Botao` não sabe o que é "perfil" ou "pedido"|
|2|**Sempre aceitar `className`**|Permite extensão contextual sem virar prop nova|
|3|**Sempre `forwardRef`**|Bibliotecas (forms, animações) dependem de ref|
|4|**Exportar a interface de props**|Outros componentes vão estender|
|5|**Reutilizável em outro projeto**|Se não é, vai em `components/[dominio]/`|

### 1.2 O Teste Mental Definitivo

Antes de entregar um componente UI, pergunte:

> _"Posso copiar este arquivo para outro projeto React e usar sem mudar nada?"_

- **Sim** → está no lugar certo (`components/ui/`)
- **Não** → o que precisa mudar é o problema. Ou move para `components/[dominio]/`, ou refatora.

### 1.3 Não Reinventar a Roda

Acessibilidade é **difícil** de fazer certo. Dropdowns, modais, comboboxes, date pickers - todos têm armadilhas (foco preso no modal, navegação por teclado, ARIA corretos, screen reader anunciando).

**Use bibliotecas que já resolveram isso:**

|Biblioteca|O que oferece|
|---|---|
|**Radix UI**|Primitivos sem estilo, acessibilidade impecável|
|**shadcn/ui**|Componentes Radix + Tailwind, copiados para seu projeto|
|**Headless UI**|Alternativa ao Radix, vinculada ao Tailwind|
|**Ark UI**|Headless do time Park UI, multi-framework|

A escolha entre elas depende do projeto. **shadcn/ui + Radix** é uma combinação muito comum hoje (você terá muito material de aprendizado e exemplos), mas Headless UI e Ark UI também são escolhas válidas. O que importa é **não reinventar primitivos complexos**, não qual lib específica você usa.

### 1.4 Por Que shadcn/ui (e Não Outra Lib de Componentes)

Diferente de Material UI ou Chakra (que vêm como pacote npm), **shadcn/ui copia o código fonte para o seu projeto**. Você é dono dos componentes. Vantagens:

- **Customização total** sem brigar com `!important` ou tema mágico
- **Sem versionamento de breaking changes** - o código é seu
- **Bundle enxuto** - só inclui o que você usa
- **Aprendizado direto** - você lê o componente e entende como funciona

Desvantagem: você é responsável por manter atualizações manualmente.

---

## 2. Template Completo de Componente UI

Este é o template que **todo** componente em `components/ui/` deve seguir.

```tsx
// src/components/ui/Botao.tsx
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// 1. INTERFACE DE PROPS - sempre exportada
export interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'ghost' | 'destrutivo'
  tamanho?: 'sm' | 'md' | 'lg'
  carregando?: boolean
  larguraTotal?: boolean
}

// 2. COMPONENTE COM forwardRef
export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  (
    {
      variante = 'primario',
      tamanho = 'md',
      carregando = false,
      larguraTotal = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          // Base - todos os botões
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Variantes de cor
          variante === 'primario' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variante === 'secundario' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variante === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
          variante === 'destrutivo' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',

          // Tamanhos - sempre 48px+ de altura (toque mínimo)
          tamanho === 'sm' && 'h-12 px-3 text-sm',
          tamanho === 'md' && 'h-12 px-4 text-base',
          tamanho === 'lg' && 'h-14 px-6 text-lg',

          // Largura
          larguraTotal && 'w-full',

          // Permite override contextual - SEMPRE por último
          className
        )}
        {...props}
      >
        {carregando ? <Spinner /> : children}
      </button>
    )
  }
)

// 3. displayName - essencial para devtools
Botao.displayName = 'Botao'
```

### 2.1 Análise Linha por Linha

**Por que `forwardRef`?** Sem ref, libs como react-hook-form não conseguem focar o input quando há erro. Animações com Framer Motion precisam de ref. Plugins de scroll precisam. **`forwardRef` em todo componente UI** é regra inegociável.

**Por que estender `React.ButtonHTMLAttributes`?** Para que o componente herde naturalmente `onClick`, `onFocus`, `aria-label`, `type`, `disabled`. Sem isso, você teria que listar prop por prop manualmente - e esquecer alguma.

**Por que `disabled || carregando`?** Quando carregando, o botão tem que estar desabilitado funcionalmente (não clicável). A prop `disabled` original do consumidor ainda pode forçar disable independente do carregando.

**Por que `className` por último no `cn()`?** Para permitir **override contextual**. Se o consumidor passa `className="bg-red-500"`, ele vence as classes padrão. Sem isso, sua classe sempre venceria, frustrando customização.

**Por que `displayName`?** Sem isso, o componente aparece como `ForwardRef(Anonymous)` no React DevTools. Atrapalha debug.

### 2.2 A Função `cn()`

Vem do shadcn, mas você pode criar manualmente:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**O que ela faz:**

- `clsx` junta classes condicionais (`'a', { b: true, c: false }` → `'a b'`)
- `twMerge` resolve conflitos do Tailwind (`'p-2 p-4'` → `'p-4'`, em vez de aplicar ambos)

Sem `twMerge`, você teria `p-2 p-4` no DOM e a regra que vence depende da ordem do CSS - comportamento imprevisível.

---

## 3. Sistema de Variantes com `cva`

Para componentes com **muitas combinações de variantes**, o estilo "if-else inline" do exemplo acima fica verboso. A biblioteca `class-variance-authority` (cva) resolve isso elegantemente.

### 3.1 Mesma Botao Reescrita com cva

```tsx
// src/components/ui/Botao.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const botaoVariantes = cva(
  // Base - sempre aplicado
  [
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variante: {
        primario: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secundario: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destrutivo: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      tamanho: {
        sm: 'h-12 px-3 text-sm',
        md: 'h-12 px-4 text-base',
        lg: 'h-14 px-6 text-lg',
      },
      larguraTotal: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variante: 'primario',
      tamanho: 'md',
    },
  }
)

export interface BotaoProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof botaoVariantes> {
  carregando?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  ({ variante, tamanho, larguraTotal, carregando, className, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || carregando}
      className={cn(botaoVariantes({ variante, tamanho, larguraTotal }), className)}
      {...props}
    >
      {carregando ? <Spinner /> : children}
    </button>
  )
)

Botao.displayName = 'Botao'
```

### 3.2 Vantagens da cva

- **Tipos automáticos:** `VariantProps<typeof botaoVariantes>` gera os tipos das variantes
- **Defaults declarativos:** `defaultVariants` em um lugar só
- **Combinações compostas:** suporta `compoundVariants` (ex: "variante destrutivo + tamanho sm → cor diferente")
- **Mais legível:** as variantes ficam separadas da renderização

### 3.3 Quando Usar cva vs if-else Inline

|Use cva quando...|Use if-else inline quando...|
|---|---|
|3+ variantes de tipo (primary, secondary, ghost, destructive)|1-2 variantes simples|
|Componente do design system com muitos consumidores|Componente de uso pontual|
|Você quer combinar variantes (composição)|Variantes independentes|

Para projetos pequenos, **comece com if-else inline**. Migre para cva quando o componente crescer.

---

## 4. Wrappers de Bibliotecas (shadcn/ui, Radix)

A confusão mais comum: _"o shadcn já me dá um Botão, devo criar outro?"_

**Resposta:** depende do que você quer impor que o shadcn não impõe.

### 4.1 Por Que Criar Wrapper

Você cria wrapper para:

1. **Padronizar variantes do seu projeto** (`primario`, `destrutivo` - não `default`, `secondary`)
2. **Garantir acessibilidade adicional** (toque mínimo 48px que shadcn não força)
3. **Adicionar comportamento padrão** (estado de loading)
4. **Trocar idioma** (props em português quando o projeto é PT)
5. **Reduzir superfície de API** (esconder variantes que você não usa)

### 4.2 O Que NUNCA Fazer no Wrapper

- **Reimplementar comportamento** que o Radix já oferece (foco, ARIA, navegação por teclado)
- **Adicionar lógica de negócio** (`<BotaoSalvarPerfil>` é anti-padrão)
- **Quebrar a API original** sem motivo (se shadcn aceita `onClick`, seu wrapper também aceita)

### 4.3 Exemplo: Wrapper de Dialog (Modal) do Radix

```tsx
// src/components/ui/Dialog.tsx
// Wrapper do shadcn Dialog, customizado para o projeto

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50', className)}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-lg bg-background p-6 rounded-lg shadow-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

export { Dialog, DialogTrigger, DialogContent }
```

### 4.4 Análise

**O que o wrapper faz:**

- Adiciona estilos do projeto (overlay com `bg-black/50`, content centralizado)
- Inclui botão de fechar com ícone do lucide-react
- Adiciona `<span className="sr-only">` para screen readers

**O que o wrapper NÃO faz:**

- Não reimplementa foco preso no modal (Radix faz)
- Não reimplementa Escape para fechar (Radix faz)
- Não reimplementa overlay clicável (Radix faz)
- Não esconde scroll do body quando aberto (Radix faz)

Essa é a divisão correta: **Radix faz o difícil, o wrapper veste e impõe convenção.**

---

## 5. Compound Components

Para componentes complexos que têm **partes nomeadas**, use o padrão _compound_ (componentes-irmãos que se conhecem internamente).

### 5.1 Exemplo: Card

```tsx
// src/components/ui/Card.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

### 5.2 Uso

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Resumo do Mês</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Total: R$ 1.234,56</p>
  </CardContent>
</Card>
```

### 5.3 Por Que Esse Padrão

- **Composição flexível** - você pode omitir partes (`<Card>` sem `<CardHeader>`)
- **Cada parte tem estilo próprio** - espaçamento, tipografia consistentes
- **API descobrível** - autocomplete do editor mostra todas as partes
- **Casa com semântica HTML** - `<h3>` para título, `<div>` para conteúdo

### 5.4 Alternativa: Slots em Props

Para casos onde **você sempre tem as mesmas partes**, prefira slots:

```tsx
// Quando todas as Cards têm sempre header + body
<Card
  header={<Titulo>Resumo</Titulo>}
  body={<Total valor={123} />}
/>
```

|Use compound quando...|Use slots quando...|
|---|---|
|Partes são opcionais|Partes são sempre presentes|
|Ordem pode variar|Ordem é fixa|
|Múltiplas instâncias por parte (vários children no body)|Uma instância por slot|

---

## 6. Acessibilidade Visual Essencial

Estas são as regras **inegociáveis** para qualquer componente UI. Detalhes completos em [`16-performance-acessibilidade.md`](./16-performance-acessibilidade.md).

### 6.1 Toque Adequado em Elementos Interativos

Elementos interativos (botão, link, checkbox, switch) **devem buscar** pelo menos 48×48 pixels de área tocável. É o padrão WCAG AAA, essencial para mobile e usuários com motricidade fina reduzida.

```tsx
// ✅ Botão pequeno mas com 48px de altura
<button className="h-12 px-2 text-sm">×</button>

// ❌ Ícone clicável sem padding
<svg onClick={fechar} className="h-4 w-4" />

// ✅ Ícone clicável com área tocável adequada
<button onClick={fechar} className="h-12 w-12 inline-flex items-center justify-center">
  <X className="h-4 w-4" />
</button>
```

**Exceções aceitas:**

|Caso|Mínimo aceitável|Justificativa|
|---|---|---|
|Tabelas densas (planilhas, listas de admin)|32px|Usuários desktop, mouse preciso, alta densidade necessária|
|Botões inline em texto longo (links, "ver mais")|Sem mínimo|Comportam-se como links, não como botões|
|Componentes secundários (badges, tags clicáveis)|36px|Ações secundárias, raras em mobile|

Em qualquer dessas exceções, registre a decisão no `contexto-projeto-ai.md` ou ADR. **Quando em dúvida, busque 48px.**

### 6.2 Foco Visível

```tsx
// ✅ focus-visible com cor distinta do hover
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

**Por que `focus-visible` e não `focus`?** `focus` aparece em clique do mouse também - confunde usuário. `focus-visible` só aparece quando o foco vem do teclado.

### 6.3 Contraste Mínimo

- **Texto normal:** 4.5:1 contra fundo
- **Texto grande (18px+):** 3:1
- **Ícones e bordas funcionais:** 3:1

Use ferramentas: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) ou DevTools do navegador.

### 6.4 Labels e ARIA

```tsx
// ❌ Ícone clicável sem label
<button onClick={fechar}><X /></button>

// ✅ Com aria-label (botões só com ícone)
<button onClick={fechar} aria-label="Fechar modal"><X /></button>

// ✅ Ou com texto oculto para screen reader
<button onClick={fechar}>
  <X />
  <span className="sr-only">Fechar modal</span>
</button>
```

### 6.5 Ícones Decorativos

```tsx
// ✅ Ícone que acompanha texto = decorativo
<button>
  <Plus aria-hidden="true" />
  Adicionar
</button>
// Screen reader fala "Adicionar", não "Plus Adicionar"
```

### 6.6 Redução de Movimento

```tsx
// ✅ Respeitar prefers-reduced-motion
className="transition-all motion-reduce:transition-none"
```

Usuários com vestibular sensível desabilitam animações no SO. Seu componente deve respeitar.

---

## 7. Tokens de Design no Tailwind

Componentes UI **nunca** usam cores ou tamanhos hardcoded. Tudo passa pelos tokens definidos no `tailwind.config.js`.

### 7.1 Por Que Tokens

```tsx
// ❌ Hardcoded - mudar tema vira mudança em 100 arquivos
<div className="bg-blue-600 text-white" />

// ✅ Token - mudar tema é mudar 1 arquivo
<div className="bg-primary text-primary-foreground" />
```

### 7.2 Estrutura Padrão de Tokens (shadcn convention)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

```css
/* src/index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    /* ... */
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 47.4% 11.2%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### 7.3 Vantagens

- **Tema dinâmico:** trocar entre claro/escuro muda variáveis CSS, não classes
- **Manutenção centralizada:** todas as cores num lugar só
- **Semântica clara:** `primary` é mais legível que `blue-600`

### 7.4 Espaçamento e Tipografia

Tailwind já vem com escala padrão (`p-1`, `p-2`, `p-4`, etc.). Use ela. Só customize se houver motivo real (ex: grid de 12 colunas com gap fora do padrão).

Para tipografia, use as classes utilitárias diretamente:

```tsx
className="text-sm font-medium"      // ✅
className="text-[13.5px] font-[510]" // ❌ valores mágicos
```

---

## 8. Quando Criar Custom vs Usar shadcn Pronto

```
Preciso de um componente UI. Posso usar shadcn pronto?
│
├─ Sim, faz tudo que preciso
│   └─► Use direto, sem wrapper
│
├─ Sim, mas precisa de variantes específicas do meu projeto
│   └─► Crie wrapper (seção 4)
│
├─ Sim, mas a API não casa com meu padrão (idioma, naming)
│   └─► Crie wrapper só para renomear
│
├─ Parcialmente - tem 70% do que preciso
│   └─► Use o primitivo do Radix (sem shadcn) e construa
│
└─ Não - caso específico do meu projeto
    └─► Componente custom em components/ui/, mas se conhece o
        negócio é components/[dominio]/
```

### 8.1 Anti-Padrão: Wrapper Sem Valor

```tsx
// ❌ Wrapper que só re-exporta - inútil
import { Button } from 'shadcn/ui/button'
export const Botao = Button

// ✅ Sem wrapper - use direto
import { Button } from '@/components/ui/button'
```

Se seu wrapper não adiciona nada (variantes, defaults, acessibilidade extra), **não crie wrapper**.

### 8.2 Anti-Padrão: Reescrita Sem Motivo

```tsx
// ❌ Recriou Dialog do zero porque "quis"
function MeuModal({ aberto, fechar, children }) {
  if (!aberto) return null
  return <div onClick={fechar}>{/* sem foco, sem ARIA, sem trap */}</div>
}

// ✅ Wrapper do Radix Dialog com customização visual
// (veja seção 4.3)
```

Toda vez que você for "reescrever" um componente complexo (modal, popover, dropdown, combobox), pare e pergunte: _"o Radix já tem o primitivo disso?"_. Quase sempre tem.

---

## 9. Checklist Antes de Commitar Componente UI

Verifique cada item:

- [ ] Aceita `className` e passa para o elemento raiz
- [ ] Usa `forwardRef`
- [ ] Tem `displayName` definido
- [ ] Interface de props exportada
- [ ] Estende atributos HTML nativos do elemento
- [ ] Toque de 48×48px em elementos interativos (ou exceção registrada)
- [ ] `focus-visible` definido (não `focus` puro)
- [ ] Contraste verificado (4.5:1 para texto)
- [ ] Ícones funcionais têm `aria-label` ou texto oculto
- [ ] Ícones decorativos têm `aria-hidden="true"`
- [ ] Animações respeitam `motion-reduce`
- [ ] Não importa nada de `types/` ou `services/` (zero lógica de negócio)
- [ ] Componente funciona em outro projeto sem mudar (teste do "outro projeto")

---

## 10. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Reinventar Modal/Dropdown/Combobox?|Não. Use Radix|
|Criar wrapper de shadcn?|Sim, se adiciona valor (variantes, idioma, acessibilidade extra)|
|`forwardRef` é obrigatório?|Sim, em todo componente UI|
|`className` é obrigatório?|Sim, em todo componente UI|
|Toque mínimo?|48×48px como meta. Exceções aceitas em tabelas densas e elementos secundários|
|`focus` ou `focus-visible`?|Sempre `focus-visible`|
|Cores hardcoded?|Nunca. Use tokens do Tailwind|
|if-else ou cva?|if-else para 1-2 variantes; cva para 3+|
|Compound components?|Para componentes com partes nomeadas opcionais|

---

## 🔗 Módulos Relacionados

- [`11-arquitetura-e-pastas.md`](./11-arquitetura-e-pastas.md) - Onde os componentes vivem
- [`12-react-e-estado.md`](./12-react-e-estado.md) - Como os componentes são consumidos
- [`14-formularios-e-validacao.md`](./14-formularios-e-validacao.md) - Componentes UI específicos para forms
- [`16-performance-acessibilidade.md`](./16-performance-acessibilidade.md) - Acessibilidade completa e performance
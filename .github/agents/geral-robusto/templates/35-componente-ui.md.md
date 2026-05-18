---

description: "Template/scaffold para componentes UI genéricos. Cobre tipagem, forwardRef, variantes, acessibilidade e testes." modulo: "35" categoria: "templates" versao: "1.0" arquivo_destino: "src/components/ui/[NomeComponente].tsx" relacionado:

- "13-ui-e-design-system.md"
- "11-arquitetura-e-pastas.md"
- "16-performance-acessibilidade.md"

---

# 🧩 Template: Componente UI Genérico

> **Arquivo destino:** `src/components/ui/[NomeComponente].tsx` **Quando usar:** ao criar um componente reutilizável de UI que **não conhece o domínio do projeto** (funcionaria em qualquer outro projeto). Para componentes específicos do domínio, ver módulo 11 sobre `components/[domínio]/`.

---

## O Que Vai em `components/ui/`

A regra do módulo 11: vai em `ui/` o componente que **funciona em qualquer projeto sem modificação**.

|✅ Componente UI|❌ Componente de Domínio|
|---|---|
|Button, Input, Card, Modal, Tooltip|CardCliente, FormularioPedido, ListaProdutos|
|Skeleton, Spinner, Toast|DashboardVendas, PerfilUsuario|
|Tabs, Accordion, Dropdown|TabsRelatorios, AccordionFaq|

**Teste:** se a primeira palavra do nome menciona o negócio do app, é domínio, não UI.

---

## Princípios de Componente UI Bem-Feito

### 1. Tipagem completa e exportada

Props têm interface nomeada e exportada (não inline).

```tsx
// ✅
export interface BotaoProps { ... }
export function Botao(props: BotaoProps) { ... }

// ❌
export function Botao(props: { variante: string; tamanho: string }) { ... }
```

### 2. `className` aceito como prop

Componente nunca **impõe** estilo único. Aceita extensão.

```tsx
// ✅
<Botao className="mt-4 shadow-lg">Salvar</Botao>

// ❌ (impede ajuste contextual)
function Botao() { return <button className="bg-blue-500">...</button> }
```

### 3. `forwardRef` quando aplicável

Use quando:

- Componente envolve elemento focável (input, button, textarea, select)
- Componente vai ser usado em formulários (react-hook-form precisa de ref)
- Componente vai receber foco programaticamente

Não use quando:

- Componente é puramente visual sem interação (Skeleton, Spinner)
- Componente é composto (Card com múltiplos filhos — ref de qual?)

### 4. Variantes declaradas

Componente tem variantes **explícitas** (não mil booleans):

```tsx
// ✅
<Botao variante="primario" tamanho="medio">Salvar</Botao>

// ❌
<Botao primario medio destacado destrutivo>Salvar</Botao>
```

### 5. Valores default sensatos

Funciona sem props extras. Usuário sobrescreve quando precisa.

```tsx
// ✅
<Botao>Clique</Botao>  // funciona — usa defaults

// ❌
<Botao variante="primario" tamanho="medio" ...>Clique</Botao>  // tudo obrigatório
```

### 6. Acessibilidade desde o início

`aria-*`, foco visível, contraste mínimo. Detalhes em [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md).

### 7. Repassa props do elemento HTML

Para componentes que envolvem 1 elemento HTML, repassam props que façam sentido (`disabled`, `onClick`, `id`, etc.).

```tsx
interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario'
}
```

Aceita `onClick`, `disabled`, `type="submit"`, `aria-label`, etc., sem você precisar listar cada um.

### 8. Sem lógica de negócio

UI não consulta API, não acessa storage, não conhece tipos do domínio. Estado interno aceitável (controlado/não-controlado, hover, foco) — lógica de negócio, não.

---

## Anatomia do Componente

A maioria dos componentes UI tem 8 partes recorrentes:

```tsx
// 1. Imports
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'  // utilitário de className

// 2. Tipos / Interface das props
export interface ComponenteProps extends React.HTMLAttributes<HTMLElement> {
  variante?: 'a' | 'b'
  tamanho?: 'p' | 'm' | 'g'
}

// 3. Constantes (estilos por variante)
const variantes = {
  a: 'bg-blue-500 text-white',
  b: 'bg-gray-200 text-gray-900',
}

const tamanhos = {
  p: 'h-8 px-3 text-sm',
  m: 'h-10 px-4 text-base',
  g: 'h-12 px-6 text-lg',
}

// 4. Componente (com forwardRef se aplicável)
export const Componente = forwardRef<HTMLButtonElement, ComponenteProps>(
  (
    {
      // 5. Defaults
      variante = 'a',
      tamanho = 'm',
      className,
      children,
      ...rest
    },
    ref
  ) => {
    // 6. Lógica mínima (estado de UI, refs internas)

    // 7. Render
    return (
      <button
        ref={ref}
        className={cn(
          'base-classes',
          variantes[variante],
          tamanhos[tamanho],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

// 8. displayName para DevTools
Componente.displayName = 'Componente'
```

---

## Utilitário `cn`

Aparece em quase todo componente. Convenção comum:

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`clsx` resolve conditionals (`'btn'`, `isActive && 'btn-active'`). `twMerge` resolve conflitos (`'p-2'` + `'p-4'` → `'p-4'`).

Sem esse utilitário, componente sofre com conflitos de classe Tailwind.

---

## Exemplo Completo: Botão

Componente realista com variantes, tamanhos, estados, acessibilidade.

### Versão Simples (sem cva)

```tsx
// src/components/ui/Botao.tsx
import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VarianteBotao =
  | 'primario'
  | 'secundario'
  | 'ghost'
  | 'destrutivo'

export type TamanhoBotao = 'pequeno' | 'medio' | 'grande'

export interface BotaoProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  carregando?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

const variantes: Record<VarianteBotao, string> = {
  primario:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
  secundario:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary',
  ghost:
    'bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent',
  destrutivo:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
}

const tamanhos: Record<TamanhoBotao, string> = {
  pequeno: 'h-9 px-3 text-sm',
  medio: 'h-10 px-4 text-sm',
  grande: 'h-12 px-6 text-base',
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  (
    {
      variante = 'primario',
      tamanho = 'medio',
      carregando = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        aria-busy={carregando}
        className={cn(
          baseClasses,
          variantes[variante],
          tamanhos[tamanho],
          className
        )}
        {...rest}
      >
        {carregando && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    )
  }
)

Botao.displayName = 'Botao'
```

### Versão com `cva` (escalável)

Para componentes com **muitas combinações de variantes**, `class-variance-authority` reduz boilerplate.

```tsx
// src/components/ui/Botao.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const botaoVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variante: {
        primario: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secundario: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
        destrutivo: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      tamanho: {
        pequeno: 'h-9 px-3 text-sm',
        medio: 'h-10 px-4 text-sm',
        grande: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variante: 'primario',
      tamanho: 'medio',
    },
  }
)

export interface BotaoProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof botaoVariants> {
  carregando?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  ({ variante, tamanho, carregando = false, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        aria-busy={carregando}
        className={cn(botaoVariants({ variante, tamanho }), className)}
        {...rest}
      >
        {carregando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Botao.displayName = 'Botao'
```

### Qual escolher?

|Use **clsx + Record**|Use **cva**|
|---|---|
|1-2 dimensões de variante|3+ dimensões|
|Projeto pequeno|Projeto que vai crescer|
|Sem necessidade de tipos automáticos|Quer `VariantProps<typeof X>`|
|Sem dependência extra|Aceita 1 dependência pequena|

Para projeto solo, **clsx + Record** é suficiente. Para projeto profissional crescendo, **cva** vale.

---

## Template Vazio (Para Copiar)

```tsx
// src/components/ui/[NomeComponente].tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type Variante[NomeComponente] = 'opcao1' | 'opcao2'
export type Tamanho[NomeComponente] = 'pequeno' | 'medio' | 'grande'

export interface [NomeComponente]Props
  extends React.HTMLAttributes<HTML[Tipo]Element> {
  variante?: Variante[NomeComponente]
  tamanho?: Tamanho[NomeComponente]
  // adicione props específicas do componente aqui
}

const baseClasses = 'classes base que se aplicam sempre'

const variantes: Record<Variante[NomeComponente], string> = {
  opcao1: 'classes-opcao1',
  opcao2: 'classes-opcao2',
}

const tamanhos: Record<Tamanho[NomeComponente], string> = {
  pequeno: 'classes-pequeno',
  medio: 'classes-medio',
  grande: 'classes-grande',
}

export const [NomeComponente] = forwardRef<HTML[Tipo]Element, [NomeComponente]Props>(
  (
    {
      variante = 'opcao1',
      tamanho = 'medio',
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <[elemento]
        ref={ref}
        className={cn(
          baseClasses,
          variantes[variante],
          tamanhos[tamanho],
          className
        )}
        {...rest}
      >
        {children}
      </[elemento]>
    )
  }
)

[NomeComponente].displayName = '[NomeComponente]'
```

Substitua `[NomeComponente]`, `[Tipo]Element` (ex: `Button`, `Div`, `Input`), `[elemento]` (ex: `button`, `div`, `input`) e as classes pelos valores reais.

---

## Variante 1: Componente Sem Variantes (Skeleton, Spinner)

Componente puramente visual, sem múltiplas formas. Mais simples:

```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
      {...rest}
    />
  )
}
```

Sem `forwardRef` (não tem interação, ref raramente útil). Sem variantes (sem múltiplas formas). Sem displayName explícito (não-forwardRef já tem name automático).

---

## Variante 2: Componente Composto (Card)

Card geralmente tem subcomponentes (CardHeader, CardContent, CardFooter). Padrão de composição:

```tsx
// src/components/ui/Card.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...rest}
    />
  )
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...rest}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none', className)}
      {...rest}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...rest} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...rest}
    />
  )
)
CardFooter.displayName = 'CardFooter'
```

Uso na page:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
  <CardFooter>
    <Botao>Ação</Botao>
  </CardFooter>
</Card>
```

**Vantagens da composição:**

- Cada parte pode ser estilizada/omitida independentemente
- Sem prop hell (`<Card title="X" subtitle="Y" footer={<X/>} actions={[...]} />`)
- Usuário escolhe o que usar

---

## Variante 3: Componente que Envolve Input

Para campos de formulário, repasse `ref` para o input nativo:

```tsx
// src/components/ui/CampoTexto.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CampoTextoProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  erro?: string
}

export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(
  ({ erro, className, id, ...rest }, ref) => {
    const erroId = erro ? `${id}-erro` : undefined

    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={!!erro}
          aria-describedby={erroId}
          className={cn(
            'w-full h-10 px-3 rounded-md border bg-background',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:opacity-50',
            erro && 'border-destructive focus:ring-destructive',
            className
          )}
          {...rest}
        />
        {erro && (
          <p id={erroId} className="mt-1 text-sm text-destructive" role="alert">
            {erro}
          </p>
        )}
      </div>
    )
  }
)

CampoTexto.displayName = 'CampoTexto'
```

**Detalhes importantes:**

- `ref` chega no `<input>`, não num wrapper — react-hook-form precisa disso
- `aria-invalid` + `aria-describedby` ligam o input à mensagem de erro
- `role="alert"` no parágrafo de erro faz screen reader anunciar a mudança
- Label fica **fora** do componente (responsabilidade do form, não do campo)

---

## Acessibilidade — Checklist Específico para UI

Ao criar componente UI, verifique:

- [ ] **Foco visível.** `focus-visible:ring-*` em qualquer elemento interativo
- [ ] **Alvo de toque mínimo.** 48×48px (com exceções documentadas — ver [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md))
- [ ] **Contraste mínimo.** 4.5:1 para texto normal, 3:1 para texto grande
- [ ] **Estados anunciados.** `aria-pressed`, `aria-expanded`, `aria-selected` quando aplicável
- [ ] **Estados de erro.** `aria-invalid` + `aria-describedby` em inputs
- [ ] **Imagens.** `alt` significativo ou `alt=""` se decorativa
- [ ] **Ícones.** `aria-hidden="true"` em ícones decorativos; `aria-label` em ícones-botão
- [ ] **Loading.** `aria-busy` em elementos em estado de carregamento
- [ ] **Funciona com teclado.** Tab navega, Enter/Espaço aciona, Esc fecha
- [ ] **Sem violação WCAG AA** validado com axe-core ou similar

Detalhamento em [`../checklists/42-acessibilidade.md`](https://claude.ai/checklists/42-acessibilidade.md).

---

## Testes Mínimos para Componentes UI

```tsx
// src/components/ui/Botao.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Botao } from './Botao'

describe('Botao', () => {
  it('renderiza texto recebido como children', () => {
    render(<Botao>Salvar</Botao>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('aplica className passada', () => {
    render(<Botao className="extra-class">X</Botao>)
    expect(screen.getByRole('button')).toHaveClass('extra-class')
  })

  it('chama onClick ao clicar', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Botao onClick={onClick}>Click</Botao>)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fica desabilitado quando disabled=true', () => {
    render(<Botao disabled>X</Botao>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('fica desabilitado quando carregando=true', () => {
    render(<Botao carregando>X</Botao>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })
})
```

**Testes essenciais para qualquer componente UI:**

1. Renderiza children
2. Aplica `className` passada
3. Repassa eventos para o usuário (`onClick`, `onChange`)
4. Estados visuais (disabled, loading, erro)
5. Acessibilidade básica (`role`, `aria-*` corretos)

Mais detalhes em [módulo 15](https://claude.ai/padroes/15-testes.md).

---

## Mini-FAQ

**1. Quando criar componente novo vs reusar?** Use o fluxo de decisão do [módulo 24, seção 4.1](https://claude.ai/processos/24-figma-para-codigo.md#41-fluxo-de-decis%C3%A3o). Resumo: já existe? variação? domínio? Só crie em `ui/` se é genuinamente reutilizável.

**2. `interface` ou `type` para props?** Convenção do projeto vence. Sem convenção definida: `interface` para props (extensível via merge); `type` para uniões/derivados. Mas qualquer escolha consistente está OK.

**3. `forwardRef` em todo componente?** Não. Só onde faz sentido (ver seção "Princípios" item 3). Em componente sem interação, `forwardRef` é ruído.

**4. Onde defino as cores/tokens?** Em `tailwind.config.ts`. Componentes referenciam tokens (`bg-primary`, `text-foreground`) — nunca cores hex direto. Detalhes em [módulo 13](https://claude.ai/padroes/13-ui-e-design-system.md).

**5. Componente pode ter `useState` interno?** Sim, para estado **puramente visual** (hover, foco, expand/collapse). Não para estado de negócio. Componente controlado vs não-controlado é decisão de design — geralmente ambos via prop opcional (`value` controlado; sem `value` = não-controlado interno).

**6. Como nomeio o arquivo: PascalCase ou kebab-case?** PascalCase, igual ao componente: `Botao.tsx`. Convenção quase universal no ecossistema React.

**7. Devo usar shadcn/ui ou criar do zero?** shadcn/ui é uma **opção** entre outras (não recomendação forte do pacote). Se usar, mantenha consistência: ou tudo shadcn ou nada. Mistura cria inconsistência visual. Detalhes em [módulo 13](https://claude.ai/padroes/13-ui-e-design-system.md).

**8. E se preciso de animação?** Tailwind tem `animate-*` (spin, pulse, ping, bounce). Para animações complexas, considere Framer Motion. Mas em UI base, anime poucos elementos — sobrecarga visual e performance.

**9. Posso usar React.FC?** Pode, mas a comunidade tem se afastado (problemas com `children` implícito, generics, etc.). Prefira função normal + interface de props explícita.

**10. Como documento o componente?** JSDoc breve no export se ajudar:

```tsx
/**
 * Botão padronizado do design system.
 * Aceita variantes (primario, secundario, ghost, destrutivo) e tamanhos.
 */
export const Botao = ...
```

Mais que isso, mover para Storybook ou documentação dedicada.

---

## 🔗 Templates e Módulos Relacionados

- [`../padroes/13-ui-e-design-system.md`](https://claude.ai/padroes/13-ui-e-design-system.md) — Princípios de UI no projeto
- [`../padroes/16-performance-acessibilidade.md`](https://claude.ai/padroes/16-performance-acessibilidade.md) — Acessibilidade detalhada
- [`../padroes/11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Onde mora UI vs domínio
- [`../padroes/15-testes.md`](https://claude.ai/padroes/15-testes.md) — Testes detalhados
- [`36-hook-feature.md`](https://claude.ai/chat/36-hook-feature.md) — Template do hook que consome estes componentes
- [`../checklists/42-acessibilidade.md`](https://claude.ai/checklists/42-acessibilidade.md) — Checklist detalhado

```markdown
---
description: "Padrões de comportamento, boas práticas e processos de decisão para projetos TypeScript, React, Tailwind e Node.js. Genérico e reutilizável."
applyTo: "**/*"
---

# Comportamento Geral Projetos TS/React + Tailwind + Node

> **Propósito:** este documento define COMO você age em qualquer projeto da stack.
> **O QUE fazer** (contexto específico) está em `contexto-projeto-ai.md`.
> **O código é a fonte da verdade** nunca duplique em documentação o que o código já expressa.

---

## Índice de Comportamentos

| # | Comportamento | Quando Aplicar |
|---|---|---|
| 1 | [Primeiros Princípios](#1-primeiros-princípios) | Sempre |
| 2 | [Stack Coberta](#2-stack-coberta) | Ao decidir tecnologias |
| 3 | [Processo de Trabalho](#3-processo-de-trabalho-inegociável) | Em toda tarefa |
| 4 | [Convenções de Código](#4-convenções-de-código) | Ao escrever código |
| 5 | [Arquitetura e Organização](#5-arquitetura-e-organização-de-projetos) | Ao criar/editar arquivos |
| 6 | [Padrões React](#6-padrões-de-implementação-react) | Em componentes, hooks, estado |
| 7 | [Design System e UI](#7-design-system-e-componentes-ui) | Ao criar componentes visuais |
| 8 | [Testes](#8-testes) | Ao escrever ou atualizar testes |
| 9 | [Performance e Acessibilidade](#9-performance-e-acessibilidade) | Antes de entregar feature |
| 10 | [Figma → Código](#10-tradução-de-design-para-código-figma--spec--implementação) | Ao receber design visual |
| 11 | [Modelagem de Domínio (DDD)](#11-modelagem-de-domínio-ddd-tático) | Ao estruturar requisitos |
| 12 | [Análise de Impacto Arquitetural](#12-análise-de-impacto-arquitetural) | Antes de feature em sistema existente |
| 13 | [Revisão de Código](#13-revisão-de-código) | Ao revisar PR ou tarefa concluída |
| 14 | [Refatoração](#14-refatoração) | Ao melhorar código existente |
| 15 | [Segurança e Privacidade](#15-segurança-e-privacidade) | Em toda implementação |
| 16 | [Anti-Padrões](#16-anti-padrões-que-você-deve-evitar) | Como lembrete constante |
| 17 | [Documentação](#17-documentação) | Ao criar/atualizar docs |
| 18 | [Rituais de Tarefa](#18-rituais-de-tarefa) | Ao iniciar, bloquear ou concluir task |
| 19 | [Comunicação com o Humano](#19-comunicação-com-o-humano) | Ao pedir decisão ou reportar |
| 20 | [Referência de Comandos](#20-referência-rápida-de-comandos) | Consulta rápida |
| 21 | [Inicialização e Migração de Projeto](#21-inicialização-e-migração-de-projeto) | Ao entrar em um projeto novo ou com docs legadas |

---

## 1. Primeiros Princípios

### 1.1 Você é um artesão de software, não um autocompletador

- Entenda o **propósito** antes de tocar no código.
- Se receber um pedido ambíguo, **pergunte** nunca deduza.
- Código que funciona não é suficiente. Código precisa ser **legível, testável e alterável**.
- Pense em quem vai manter isso daqui a 6 meses (pode ser você).

### 1.2 Regra de Ouro

> **Antes de qualquer ação, confirme que entendeu.** Reformule o pedido com suas palavras e espere aprovação explícita. Nunca execute sem confirmação quando a ação envolver criar, deletar ou reestruturar arquivos.

### 1.3 O código é a verdade primária

- Documentação desatualizada é **pior que ausência de documentação**.
- Se algo pode ser lido e ententido explícitamente no código, não o duplique em docs (exceção para requisitos de sistema e contexto rápidos para IA's).
- Docs devem conter apenas o que **não está explícito no código**: decisões, contexto histórico, princípios de design, justificativas de trade-offs.

---

## 2. Stack Coberta

| Camada | Tecnologias primárias | Alternativas comuns suportadas |
|---|---|---|
| Frontend | React 18+, TypeScript 5+, Tailwind CSS 3+ | Next.js, Remix |
| Backend | Node.js 20+, Express 4+, Prisma | Fastify, Drizzle, Knex |
| Testes | Vitest, Testing Library | Jest, Playwright, Cypress |
| UI Base | shadcn/ui, Radix | Headless UI, Ark UI |
| State | Context API + useReducer, Zustand | Jotai, Redux Toolkit |
| Build | Vite | Next.js, Turbopack |
| Runtime | Node.js, Bun | Deno |
| Validação | Zod | Yup, Valibot |

**Princípio:** Quando o projeto já escolheu uma tecnologia, use-a. Não proponha trocar a stack sem um motivo extraordinário.

---

## 3. Processo de Trabalho Inegociável

```
ENTENDER → PLANEJAR → APROVAR → EXECUTAR → REGISTRAR
```

### 3.1 ENTENDER
- Reformule o pedido com suas palavras.
- Confirme: "Entendi que você quer [X]. É isso?"
- Se houver ambiguidade, liste as perguntas e aguarde respostas.

### 3.2 PLANEJAR
Apresente um plano com:
- **Arquivos que serão criados/modificados** (com caminhos exatos)
- **O que muda em cada arquivo** (resumo de 1-2 linhas)
- **Impacto em outros módulos** (o que pode quebrar?)
- **Dependências novas** (precisa instalar algo?)
- **Riscos identificados**

Formato recomendado:
```markdown
## Plano: [nome da task]

**O que muda:**
- `src/components/X.tsx`: extrair lógica para hook
- `src/hooks/useX.ts`: novo hook com estado e handlers
- `src/pages/PaginaX.tsx`: reduzir para < 60 linhas

**Impacto:** [módulos afetados]
**Riscos:** [o que pode dar errado]
**Dependências novas:** nenhuma

Posso prosseguir?
```

### 3.3 APROVAR
⚠️ **Nunca execute sem aprovação explícita do humano.** "Pode fazer" ou "Sim" é o gate.

### 3.4 EXECUTAR
- Siga o plano aprovado. Se descobrir algo que exija mudar o plano, **volte ao passo 2**.
- Mantenha cada commit/save coeso e atômico.
- Se encontrar um bug não relacionado, **anote e reporte** não corrija fora do escopo.

### 3.5 REGISTRAR
Ao concluir qualquer tarefa, registre criando um arquivo .md da task (em `docs/tarefas/concluidas/`) seguindo os passos descrito na seção 18



---

## 4. Convenções de Código

### 4.1 Idioma

**Defina um idioma no início do projeto e mantenha-o em tudo:** variáveis, funções, componentes, tipos, comentários, testes, mensagens de commit.

| Se o projeto é | Exemplos |
|---|---|
| Português | `calcularTotal()`, `temSeguro`, `usePerfil`, `PerfilUsuario` |
| Inglês | `calculateTotal()`, `hasInsurance`, `useProfile`, `UserProfile` |

⚠️ **Nunca misture idiomas no mesmo código-base.**

### 4.2 Nomenclatura

| Elemento | Convenção | Exemplo (PT) |
|---|---|---|
| Função/Variável | camelCase | `kmPorDia` |
| Boolean | `eh`/`tem`/`deve`/`esta` | `temSeguro`, `estaAtivo` |
| Componente React | PascalCase | `PainelEstimativa` |
| Hook | `use` + PascalCase | `usePerfil` |
| Tipo/Interface | PascalCase | `PerfilUsuario` |
| Constante global | UPPER_SNAKE | `LIMITE_ALERTA_KM` |
| Arquivo de componente | PascalCase.tsx | `PainelEstimativa.tsx` |
| Arquivo de hook | use + PascalCase.ts | `usePerfil.ts` |
| Arquivo de utilidade | camelCase.ts | `calculos.ts` |
| Arquivo de tipo | camelCase.ts | `perfil.ts` |

### 4.3 Proibições Absolutas

- ❌ `any` usar `unknown` + type guard
- ❌ `localStorage`/`sessionStorage` acessado diretamente em componentes usar serviço
- ❌ `useEffect` para derivar estado de outro estado usar `useMemo` ou cálculo direto
- ❌ `console.log` em produção com dados sensíveis
- ❌ Dados pessoais em URLs (query params)
- ❌ Chaves de array baseadas em índice (`key={i}`) usar IDs estáveis
- ❌ Comentários que repetem o código (`// incrementa i` acima de `i++`)

---

## 5. Arquitetura e Organização de Projetos

### 5.1 Estrutura Padrão de Pastas

```
src/
├── types/                  # Tipos do domínio (um arquivo por aggregate)
├── utils/                  # Funções puras (cálculos, formatação)
├── services/               # APIs externas e storage (efeitos colaterais)
├── context/                # Estado global (Context + useReducer)
├── hooks/                  # Hooks de feature (um por feature)
├── components/
│   ├── ui/                 # Wrappers do design system (zero lógica de negócio)
│   ├── layout/             # Header, Footer, NavBar, Sidebar
│   └── [dominio]/          # Componentes de domínio (conhecem o negócio)
├── pages/                  # Composição pura (máx. ~60 linhas)
├── data/                   # Constantes e dados estáticos
└── config/                 # Feature flags, env vars
```

### 5.2 Onde Cada Coisa Vive (se ainda não tiverem sido criados em outro lugar, se tiver, respeite a estrutura do projeto ou informe a necessidade de mudar para melhor organização)

| O que é | Onde vai | Regra |
|---|---|---|
| Tipos de domínio | `src/types/` | Um arquivo por entidade/aggregate |
| Funções puras | `src/utils/` | Sem side effects, fáceis de testar |
| Formatadores | `src/utils/formatters.ts` | Centralizados, nunca inline |
| Acesso a APIs externas | `src/services/` | Fetch/axios isolado aqui |
| Persistência local | `src/services/[nome]Storage.ts` | ÚNICO ponto de acesso a storage |
| Estado global | `src/context/` ou `src/stores/` | Um contexto por domínio |
| Hooks de acesso a estado | `src/hooks/use[Nome].ts` | Re-exporta do contexto |
| Hooks de feature | `src/hooks/use[Feature].ts` | Um hook por feature |
| Componentes UI base | `src/components/ui/` | Zero lógica de negócio |
| Componentes de domínio | `src/components/[dominio]/` | Conhecem o negócio |
| Layout | `src/components/layout/` | Header, Footer, NavBar, Sidebar |
| Páginas | `src/pages/` | Composição pura, máx. ~60 linhas |
| Dados estáticos | `src/data/` | JSON/TS com constantes |

Aqui está a seção 5.3 atualizada, refletindo a estrutura final que definimos ao longo da conversa:

markdown
### 5.3 Estrutura Padrão de Documentação
docs/
├── README.md # Visão geral do produto e stack
├── contexto-projeto-ai.md # Índice para IA com links e instruções específicas
│
├── requisitos/
│ ├── funcionais.md # RFs com IDs e critérios de aceite
│ ├── regras-negocio.md # RNs com invariantes
│ └── nao-funcionais.md # RNFs (desempenho, acessibilidade, PWA, etc.)
│
├── dominios/
│ ├── glossario.md # Linguagem ubíqua do domínio
│ ├── invariantes.md # Regras invioláveis
│ ├── divida-tecnica.md # Dívidas conscientes com gatilhos
│ └── modelagem/ # Modelagem detalhada (entidades, agregados, VOs)
│
├── design/
│ ├── telas-navegacao.md # Mapa de telas e navegação
│ └── fluxo-onboarding.md # Especificação detalhada do fluxo de onboarding
│
├── arquitetura/
│ ├── visao-geral.md # Estrutura de pastas e decisões de arquitetura
│ ├── estado-inicial.md # Persistência e estado inicial
│ ├── componentes-ui.md # Componentes shadcn instalados e wrappers
│ ├── rotas.md # Lista completa de rotas
│ ├── convencoes.md # Convenções de código e nomenclatura
│ ├── padrao-testes.md # Padrão de testes (Vitest, AAA, cobertura)
│ ├── tema-tailwind.md # Tokens de cor, tipografia, classes customizadas
│ ├── setup-inicial.md # Passo a passo para setup do projeto
│ └── ADR/ # Decisões arquiteturais
│ ├── ADR-001.md
│ └── ADR-002.md
│
└── tarefas/
├── pendentes.md # Backlog priorizado (uma linha por tarefa)
├── em-andamento.md # Tarefa atual em execução
└── concluidas/ # Histórico completo
└── PREFIXO-XXX-YYYY-MM-DD-HHhMM.md

text

**Regras:**
- `README.md` na raiz do projeto é o cartão de visita para humanos. 
- `contexto-projeto-ai.md` é o ponto de entrada da IA contém índice de links e instruções específicas.
- Nenhuma informação duplicada entre esses arquivos.
- O código continua sendo a verdade primária documentação só contém o que o código não expressa.


### 5.4 Regras de Ouro da Arquitetura

1. **Pages são para composição, não para lógica.**
2. **Hooks encapsulam estado + handlers + derivações.**
3. **Serviços isolam efeitos colaterais.**
4. **UI components não conhecem o domínio.**
5. **Domain components conhecem o negócio.**
6. **Documentação só contém o que o código não diz.**

---

## 6. Padrões de Implementação React

### 6.1 Padrão de Hook de Feature

```typescript
// src/hooks/useDetalhamento.ts
import { useState, useCallback, useMemo } from 'react'

export function useDetalhamento() {
  // 1. Estado local
  const [filtros, setFiltros] = useState<Filtros>({})
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})

  // 2. Derivações (useMemo)
  const totalFiltrado = useMemo(
    () => calcularTotal(filtros),
    [filtros]
  )

  // 3. Handlers (useCallback)
  const alternarFiltro = useCallback((id: string) => {
    setFiltros(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // 4. Interface mínima
  return { filtros, expandido, totalFiltrado, alternarFiltro, setExpandido }
}
```

**Regras:**
- `useMemo` para derivações, nunca `useEffect` + `setState`
- `useCallback` apenas quando o handler é passado para filhos memoizados
- O hook retorna apenas o que o JSX precisa

### 6.2 Padrão de Page Limpa

```tsx
// src/pages/PaginaDetalhamento.tsx
import { useDetalhamento } from '../hooks/useDetalhamento'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { Cartao } from '../components/detalhamento/Cartao'
import { Accordion } from '../components/detalhamento/Accordion'

export function PaginaDetalhamento() {
  const vm = useDetalhamento()
  if (!vm.dados) return <EstadoVazio mensagem="Nenhum dado encontrado." />
  return (
    <div className="px-4 py-4 space-y-3">
      <Cartao total={vm.totalFiltrado} />
      {/* Composição pura */}
    </div>
  )
}
// Meta: menos de 60 linhas
```

### 6.3 Estado Global

```typescript
// Prefira Context + useReducer para estado complexo
type Action =
  | { type: 'SET_CAMPO'; campo: string; valor: unknown }
  | { type: 'RESET' }

function reducer(estado: Estado, action: Action): Estado {
  switch (action.type) {
    case 'SET_CAMPO': return { ...estado, [action.campo]: action.valor }
    case 'RESET': return estadoInicial
  }
}
```

**Regras:**
- Um contexto por domínio. Não atomizar.
- Expor hooks facade em vez do dispatch bruto.
- Validar ações no reducer não deixar validação só para a UI.

### 6.4 Formulários

```tsx
<label htmlFor="kmPorDia" className="label-neutro">KM POR DIA</label>
<input
  id="kmPorDia"
  type="number"
  inputMode="numeric"
  value={kmPorDia}
  onChange={e => setKmPorDia(Number(e.target.value))}
  aria-describedby={erro ? 'kmPorDia-erro' : undefined}
  aria-invalid={!!erro}
/>
{erro && <span id="kmPorDia-erro" role="alert">{erro}</span>}
```

Princípios:
- Labels sempre visíveis, associados ao input com `htmlFor`
- `inputMode` apropriado: `"numeric"` para números, `"decimal"` para moeda
- Validação no `onBlur`, não enquanto digita
- Erros associados ao campo com `aria-describedby`

---

## 7. Design System e Componentes UI

### 7.1 Princípios

- **Zero lógica de negócio** nos componentes UI.
- **Sempre aceitar `className`** para permitir extensão contextual.
- **Sempre exportar a interface** de props.
- **Toque mínimo de 48px** em todo elemento interativo (`min-h-12`).
- **Labels sempre visíveis**, nunca confiar só em placeholder.

### 7.2 Template de Componente UI

```tsx
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'ghost' | 'destrutivo'
  tamanho?: 'sm' | 'md' | 'lg'
  carregando?: boolean
  larguraTotal?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  ({ variante = 'primario', tamanho = 'md', carregando, larguraTotal, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'min-h-12 inline-flex items-center justify-center rounded-md font-medium transition-colors',
          variante === 'primario' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          // ... outras variantes
          larguraTotal && 'w-full',
          (props.disabled || carregando) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={props.disabled || carregando}
        {...props}
      >
        {carregando ? 'Carregando...' : children}
      </button>
    )
  }
)
Botao.displayName = 'Botao'
```

### 7.3 Wrappers de Bibliotecas (shadcn/ui, Radix, etc.)

- **Nunca reimplemente** o que a biblioteca já faz.
- Wrappers existem para **impor convenções do projeto** (variantes, tamanhos, cores) e **garantir acessibilidade**.
- Se a biblioteca expõe `className`, seu wrapper também deve expor.
- Wrappers não devem conter lógica de domínio. Exceção: `stopPropagation` em switches dentro de accordions (comportamento de UI, não de negócio).

### 7.4 Teste Mental (UI)

Antes de entregar um componente UI, pergunte:
- "Posso usar este componente em outro projeto sem mudar nada?"
- "O `className` é aceito?"
- "Elementos interativos têm 48px de toque mínimo?"
- "As props estão em um único idioma consistente?"

---

## 8. Testes

### 8.1 Filosofia

**Todo desenvolvedor testa seu próprio código.** QA audita, não escreve testes de unidade para features novas.

### 8.2 Stack Padrão

- **Runner:** Vitest
- **Estilo:** `describe` + `it`
- **Estrutura:** AAA (Arrange-Act-Assert)
- **React:** Testing Library + user-event

### 8.3 Padrão de Escrita

```typescript
import { describe, it, expect } from 'vitest'

describe('calcularTotal', () => {
  it('soma todos os custos quando há múltiplas categorias', () => {
    // Arrange
    const custos = { combustivel: 100, manutencao: 50, seguro: 30 }
    // Act
    const total = calcularTotal(custos)
    // Assert
    expect(total).toBe(180)
  })

  it('retorna 0 quando não há custos', () => {
    expect(calcularTotal({})).toBe(0)
  })
})
```

### 8.4 Cobertura Mínima (Nível 3)

Para cada unidade nova ou modificada:
1. **Caminho feliz:** uso típico com entradas válidas
2. **Invariantes:** cada regra documentada tem um teste que tenta violá-la
3. **Edge cases relevantes:** null, undefined, array vazio, valor zero

**Não é necessário:** 100% de cobertura de branches, testar frameworks externos.

### 8.5 Atualização de Testes

⚠️ **Atualizar teste para "fazer passar" sem entender por que falhou é o erro mais grave.**

```
Teste falhou?
  ├─ A mudança no código foi INTENCIONAL?
  │   ├─ NÃO → É bug. Corrija o CÓDIGO.
  │   └─ SIM → O comportamento antigo ainda é desejado?
  │       ├─ SIM → Corrija o CÓDIGO para ambos coexistirem.
  │       └─ NÃO → Atualize o teste E DOCUMENTE o motivo.
```

---

## 9. Performance e Acessibilidade

### 9.1 Métricas-Alvo

| Métrica | Meta |
|---|---|
| Lighthouse Performance | ≥ 80 (mobile) |
| Lighthouse Acessibilidade | ≥ 95 |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

### 9.2 Performance Checklist

- [ ] **Code splitting:** `React.lazy` em rotas principais
- [ ] **Re-renders:** `useCallback` em handlers passados para filhos memoizados
- [ ] **Derivações:** `useMemo` para cálculos, nunca `useEffect` + `setState`
- [ ] **Imagens:** `loading="lazy"`, formatos modernos
- [ ] **Bundle:** evitar imports barrel que carregam módulos não usados
- [ ] **Fontes:** `font-display: swap`, preload de fontes críticas

### 9.3 Acessibilidade Checklist

- [ ] **Contraste:** ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- [ ] **Labels:** todo input tem `<label>` associado com `htmlFor`
- [ ] **Erros:** inputs com erro têm `aria-describedby` e `aria-invalid`
- [ ] **Ícones decorativos:** `aria-hidden="true"`
- [ ] **Ícones funcionais:** botões só com ícone têm `aria-label`
- [ ] **Toque mínimo:** 48×48px em todo elemento interativo
- [ ] **Foco:** ordem de tab lógica, `:focus-visible` visível
- [ ] **Redução de movimento:** respeitar `prefers-reduced-motion`

### 9.4 PWA (quando aplicável)

```typescript
{
  registerType: 'autoUpdate',
  manifest: {
    name: '[Nome do App]',
    short_name: '[Nome Curto]',
    display: 'standalone',
    background_color: '[cor]',
    theme_color: '[cor]',
    icons: [/* 192px e 512px */]
  }
}
```

---

## 10. Tradução de Design para Código (Figma → Spec → Implementação)

### 10.1 Fase 1: Análise do Visual

1. **Identificar componentes reutilizáveis:**
   - Quais elementos aparecem múltiplas vezes?
   - Quais já existem no design system do projeto?
   - Quais são variações de algo existente?

2. **Mapear hierarquia visual:**
   - Layout (header, sidebar, conteúdo, footer)
   - Seções da página (de cima para baixo)
   - Agrupamentos de elementos

3. **Listar estados da tela:**
   - Padrão (com dados)
   - Vazio (sem dados)
   - Carregando
   - Erro

### 10.2 Fase 2: Especificação Técnica

Produza uma spec estruturada antes de codar:

```markdown
## Spec: [Nome da Tela]

**Rota:** `/caminho`

### Mapeamento visual → código
| Elemento no Figma | Componente | Props |
|---|---|---|
| Botão azul "Salvar" | Botao | `variante="primario"` |
| Campo "Nome" | CampoEntrada | `tipo="text"` |

### Campos de formulário
| Campo | Variável | Tipo | Validação |
|---|---|---|---|
| "Nome completo" | `nome` | `string` | min: 3, max: 100 |

### Estados
| Estado | Condição | O que renderiza |
|---|---|---|
| Vazio | `!dados` | `EstadoVazio` |
| Erro | `erro` | `Alerta` com retry |

### Navegação
| Ação | Destino |
|---|---|
| Clicar "Salvar" | `/dashboard` |
```

### 10.3 Fase 3: Planejamento de Componentes

Para cada elemento:
```
Elemento no Figma
  ├─ Já existe no design system? → Reutilizar
  ├─ É variação de algo existente? → Adicionar variante
  ├─ É específico do domínio? → Criar em components/[dominio]/
  └─ É genérico reutilizável? → Criar em components/ui/
```

### 10.4 Fase 4: Implementação (Ordem)

```
types/ → hooks/ → components/ui/ (se novo) → components/[feature]/ → pages/
```

---

## 11. Modelagem de Domínio (DDD Tático)

### 11.1 Toolkit Conceitual

| Conceito | Definição | Exemplo |
|---|---|---|
| **Entidade** | Tem identidade única, persiste no tempo | `Usuario { id, nome, email }` |
| **Value Object** | Definido pelo valor, imutável, sem ID | `Endereco { rua, cidade, cep }` |
| **Aggregate** | Conjunto tratado como unidade, tem raiz | `Pedido` contém `ItemPedido[]` |
| **Invariante** | Regra que nunca pode ser violada | `total >= 0`, `dataFim > dataInicio` |
| **Domain Event** | Algo que aconteceu no negócio | `PedidoConfirmado`, `PagamentoRecebido` |
Sa
### 11.2 Linguagem Ubíqua

- Todo termo de negócio tem **um único significado** no código, docs e conversas.
- Mantenha um glossário (`docs/glossario.md`).
- Se dois stakeholders usam o mesmo termo com significados diferentes, **o glossário decide**.

### 11.3 Processo de Modelagem

1. **Identificar conceitos** nos requisitos: "o que disso existe no mundo real do usuário?"
2. **Classificar** cada conceito: entidade, value object, aggregate, evento
3. **Listar invariantes** para cada entidade
4. **Desenhar relacionamentos** entre entidades
5. **Validar** contra cenários reais de uso

### 11.4 Entregável da Modelagem (salvar em `docs/glossario.md`, `docs/invariantes.md`e dos/modelagem)

```markdown
## Entidade: [Nome]

### Conceito
[O que é no mundo real, sem jargão técnico]

### Identidade
[Como é identificada unicamente]

### Atributos
| Atributo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | string | Sim | Identificador único |

### Invariantes
- [regra que nunca pode ser falsa]

### Comportamentos
- `metodo()`: [o que faz]
```

### 11.5 Anti-Padrões

- ❌ **Modelo anêmico:** entidade só com dados, comportamento solto em utils
- ❌ **Categorização forçada:** fazer todo conceito virar entidade
- ❌ **Domínio inflado:** campo `observacao: string` não é entidade `Observacao`
- ❌ **Modelar sem ler o código existente:** documentação que diverge do código é tóxica

---

## 12. Análise de Impacto Arquitetural

Quando um requisito novo entra em sistema existente, **antes de codar**, produza:

```markdown
## Análise de Impacto: [Nome do Requisito]

### Áreas Afetadas
| Camada | Arquivos | Tipo de Mudança |
|---|---|---|
| types/ | `perfil.ts` | adicionar campo |
| hooks/ | `usePerfil.ts` | novo handler |

### Features Existentes em Risco
| Feature | Risco | Mitigação |
|---|---|---|
| [nome] | [o que pode quebrar] | [como evitar] |

### Decisões em Aberto
1. [pergunta para o humano]

### Riscos Não-Mitigados
- [risco residual que será dívida técnica]
```

---

## 13. Revisão de Código

# 📋 Política de Revisão de Tasks

> A seção `## Revisão` **sempre existe** no arquivo de toda task concluída preenchida ou marcada como `N/A`. Silêncio não é permitido.

---

## Quando a Revisão é Obrigatória?

| Situação | Revisão? | Responsável |
|---|:---:|---|
| Task que toca código crítico (cálculos, estado, persistência) | ✅ Sim obrigatória | IA se auto-revisa via checklist da seção 13, humano aprova |
| Task simples (correção de typo, atualização de doc) | ❌ Não precisa | Seção fica `N/A mudança trivial` |
| Task gerada por uma revisão anterior | ✅ Sim obrigatória | A revisão que gerou a task é o gatilho |

---

## Regra da Seção `## Revisão`

A seção **sempre existe** no arquivo da task concluída. Se não houve revisão formal, preenche-se com `N/A` e o motivo explícito.

```
## Revisão
N/A mudança trivial (correção de typo na linha 42 do README)
```

> **Por quê isso importa?** Quem ler o arquivo depois sabe que ninguém revisou mas foi uma **decisão consciente**, não um esquecimento.

A seção abaixo sempre deve existir no arquivo da task finalizada:

## Revisão
Possíveis preenchimentos

Quando houve revisão:
## Revisão
Revisado pela IA seguindo checklist da seção 13 e aprovado por humano.

Quando NÃO houve revisão:
## Revisão
N/A - Mudança trivial (ex: typo/documentação).

Motivo dessa regra:

Ter essa seção sempre presente evita “silêncio histórico”.
Quem ler a task no futuro saberá claramente se:

houve revisão formal
não houve revisão por decisão consciente

Isso mantém rastreabilidade e transparência do projeto.



### 13.1 Checklist Rápido

```
[ ] Idioma consistente com o projeto
[ ] Nenhum `any`
[ ] Storage acessado apenas via serviço
[ ] Funções críticas não foram alteradas sem aprovação
[ ] Pages com menos de 60 linhas
[ ] Testes passando (se task exige)
[ ] Toque mínimo 48px em elementos interativos
[ ] `inputMode` apropriado em campos numéricos
[ ] Labels visíveis em todos os inputs
[ ] Invariantes documentadas são respeitadas
[ ] Sem `console.log` com dados sensíveis em produção
[ ] Sem dados pessoais em URLs
```

### 13.2 Dimensões de Revisão

| Dimensão | O que checar |
|---|---|
| **Convenções** | Idioma, nomenclatura, estilo |
| **Arquitetura** | Arquivos no lugar certo, camadas respeitadas |
| **Regras de negócio** | Invariantes, cálculos, condições |
| **React** | Sem `useEffect` para derivações, keys estáveis |
| **Segurança** | Sem exposição de dados, storage correto |
| **Testes** | Cobertura mínima, padrão AAA, nomes descritivos |
| **Acessibilidade** | Labels, contraste, toque, aria |

### 13.3 Formato de Revisão



```markdown
## Revisão: [arquivo/task] 

### ✅ Bom
- [algo bem feito]

### 🔴 Bloqueante
**[Problema]**
- Onde: `arquivo.ts` linha X
- Problema: [descrição]
- Solução: [instrução concreta]

### 🟡 Importante
- [problema não-bloqueante]

### 🟢 Sugestão
- [melhoria opcional]

**Veredito:** APROVADO / APROVADO COM RESSALVAS / REPROVADO

### Tarefas Geradas pela Revisão
- [PREFIXO]-XXX: [descrição]
```


# 🔍 Tarefas Geradas por Revisão

> Toda revisão que encontra um problema gera uma ação rastreável. O tipo da ação depende da natureza do problema.

---

## Os Três Cenários

### Cenário 1 - O código viola um requisito existente

> **Exemplo:** `RevisaoGeral.status` só tem 2 estados (`concluido`, `pendente`), mas `RF-REG-05` exige 3 (`CONCLUÍDO`, `EM DIA`, `PRÓXIMO`).

**Ação:** Criar uma tarefa `BG` diretamente, referenciando o requisito violado. O requisito já existe - ele só foi descumprido.

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|:---:|:---:|---|:---:|
| BG-07 | status da RevisaoGeral com 2 estados (requisito RF-REG-05 pede 3) | Crítico | Imediata | P | - | `[ ]` |

---

### Cenário 2 - Problema de qualidade interna

> **Exemplo:** `PaginaDetalhamento.tsx` tem 537 linhas. `RNF-COMP-01` exige menos de 150 linhas.

**Ação:** Criar uma tarefa `REF` diretamente. O código funciona, mas viola uma regra de qualidade já existente.

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|:---:|:---:|---|:---:|
| REF-02 | Refatorar PaginaDetalhamento.tsx (537 linhas → < 150) | Importante | Esta Semana | G | REF-01 | `[ ]` |

---

### Cenário 3 - Problema que nenhum requisito cobre

> **Exemplo:** O gráfico donut não tem `aria-label`, e nenhum RNF obriga isso explicitamente.

**Ação:** Criar a tarefa **e** adicionar o requisito ao `docs/requisitos/...` - tudo no mesmo passo. Se for trivial, só a tarefa basta.

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|:---:|:---:|---|:---:|
| RNF-13 | Todos os gráficos devem ter aria-label descritivo | Importante | Este Mês | P | - | `[ ]` |

> ⚠️ Não se cria o requisito primeiro e a tarefa depois - criam-se **ambos de uma vez**, ou só a tarefa se for trivial.

---

## Árvore de Decisão

```
Problema encontrado na revisão
│
├─ Viola um requisito existente (RF, RN, RNF)?
│   └─► Tarefa BG ou REF - referencia o requisito violado
│
├─ É melhoria interna (código funciona, mas está ruim)?
│   └─► Tarefa REF direta
│
├─ É comportamento novo que nenhum requisito previu?
│   └─► Tarefa (BG ou RNF) + adicionar linha em docs/requisitos/
│       no mesmo passo
│
└─ É algo trivial (typo, espaçamento)?
    └─► Corrige na própria tarefa - sem gerar nova
```

---

## Rastreabilidade

O arquivo da tarefa concluída documenta tudo na seção **"Tarefas Geradas pela Revisão"**. Se um requisito novo foi criado, ele também é mencionado ali.

```md
## Tarefas Geradas pela Revisão
- BG-07: status da RevisaoGeral com 2 estados (viola RF-REG-05)
- RNF-13: aria-label em gráficos - requisito adicionado ao requisitos.md
```




---

## 14. Refatoração

### 14.1 Princípios

- **Refatoração mantém comportamento.** Se muda o que o código faz, é redesign.
- **Sempre tenha rede de segurança:** testes verdes antes de começar.
- **Refatore em passos pequenos:** cada passo deixa o código compilando e os testes passando.
- **Não refatore e adicione feature ao mesmo tempo.**

### 14.2 Code Smells que Justificam Refatoração

| Smell | Sinal | Ação |
|---|---|---|
| **God Component** | 200+ linhas, múltiplas responsabilidades | Extrair sub-componentes + hook |
| **Long Function** | 50+ linhas ou 5+ parâmetros | Extrair funções menores |
| **Duplicate Code** | Mesma lógica em 3+ lugares | Extrair função/hook/componente |
| **useEffect para derivar** | `useEffect(() => setTotal(a+b), [a,b])` | Cálculo direto |
| **Magic Numbers** | `* 52` solto no código | Constantes nomeadas |

### 14.3 Padrões SOLID Aplicáveis

| Princípio | Aplicação em React |
|---|---|
| **S**ingle Responsibility | Cada hook tem 1 motivo para mudar |
| **O**pen/Closed | Componentes abertos para extensão (children, render props) |
| **L**iskov Substitution | Wrappers não quebram o comportamento do componente base |
| **I**nterface Segregation | Props mínimas, não monolíticas |
| **D**ependency Inversion | Hooks dependem de interfaces (serviços), não de implementações concretas |

### 14.4 Patterns precisam de justificativa
Não introduza Strategy, Observer, Factory etc. sem ter **um problema concreto que ele resolve melhor que código direto**. Pattern aplicado sem necessidade é ruído cognitivo. Sempre analise a necessidade de algum deles.

---

## 15. Segurança e Privacidade

### 15.1 Checklist Bloqueante

```
[ ] Nenhum console.log com dados pessoais em produção
[ ] Nenhum dado pessoal em URL como query parameter
[ ] Storage limpo ao usar "Apagar Tudo" (localStorage, sessionStorage, IndexedDB)
[ ] Integrações externas não enviam dados pessoais do usuário
[ ] Fixtures de teste não vão para build de produção
[ ] Build de produção não carrega dados de desenvolvimento
```

### 15.2 O Que é Dado Pessoal

- Nome, email, telefone, endereço, CEP
- IP, geolocalização precisa
- Hábitos de uso detalhados
- Dados financeiros pessoais
- Combinação de dados que permite identificar alguém

### 15.3 Princípio do "Emprestar o Dispositivo"

> *"Se o usuário emprestar o dispositivo para alguém por 5 minutos, essa pessoa consegue ver dados que o usuário não compartilharia voluntariamente?"*

Se a resposta é **sim**, há vazamento de privacidade. Corrija.

---

## 16. Anti-Padrões que Você Deve Evitar

| Anti-Padrão | Por que é ruim | O que fazer |
|---|---|---|
| `any` | Perde type-safety | `unknown` + type guard |
| `useEffect` para derivar estado | Re-render extra | `useMemo` ou cálculo direto |
| `key={i}` em listas | Bugs com reordenação | ID estável da entidade |
| `localStorage` direto | Acoplamento | Serviço de storage |
| Comentário óbvio | Ruído | Só comentar *por que*, não *o que* |
| Função com 5+ parâmetros | Difícil chamar | Objeto de opções |
| Implementar sem confirmar | Risco de retrabalho | Reformule e aguarde "sim" |
| Refatorar fora do escopo | Arrasta escopo | Anote e proponha task separada |
| Instalar dependência sem aprovação | Quebra build | Proponha com justificativa |
| Atualizar teste para "fazer passar" | Esconde bug | Investigue a causa raiz |

---

## 17. Documentação

### 17.1 O Que Documentar

Você deve documentar quando for necessário:

- **Decisões arquiteturais** (ADR): contexto, decisão, consequências
- **Regras de negócio não-óbvias**
- **Glossário de domínio:** um significado único por termo
- **Dívida técnica:** decisão consciente de adiar, com gatilho para revisitar

### 17.2 O Que NÃO Documentar

- O que o código já expressa claramente
- Comentários que repetem o código
- Documentação de APIs externas (link para a doc oficial)

---
### 17.3 Formatos de Documentos do Projeto

#### `README.md` (raiz do projeto para humanos)

```markdown
# [Nome do Projeto]

> [1-2 frases sobre o que o produto faz e para quem]

## Stack

| Tecnologia | Versão |
|---|---|
| React | 18.3 |
| TypeScript | 5.6 (strict) |
| Tailwind | 3.4 |

## Como Rodar

``bash
npm install
npm run dev
---

#### `docs/requisitos/`
```markdown
# Requisitos [Nome do Projeto]

> Fonte de verdade do que o produto deve fazer.
NÃO CRIE REQUISITOS SEM PEDIR PERMISSÃO, EXPLIQUE O MOTIVO PRIMEIRO

## Regras de Negócio (RN)
| ID | Regra | Entidade | Origem | ADR | Data origem
|---|---|---|---|---|
| RN-01 | Todo pedido deve ter pelo menos um item | Pedido | Stakeholder | | Data origem

## Requisitos Funcionais (RF)
| ID | Descrição | Prioridade | Status | RN Relacionada | Tasks | Data origem
|---|---|---|---|---|---|
| RF-01 | O usuário pode criar conta | MUST | ✅ | | TASK-001 | 

## Requisitos Não-Funcionais (RNF)
| ID | Descrição | Métrica | Status | RF Relacionado | ADR | Data origem
|---|---|---|---|---|
| RNF-01 | App funciona offline | PWA | [ ] | ADR-003 |

## Histórico de Mudanças
| Data | Requisito | O que mudou | Motivo | Data mudança
|---|---|---|---|
```

#### `docs/glossario.md`
```markdown
# Glossário [Nome do Projeto]
> Cada termo tem um único significado.

| Termo | Definição | Sinônimos Proibidos | ADR Relacionada |
|---|---|---|---|
| Pedido | Solicitação de compra feita pelo cliente | `Order` | |

## Histórico
| Data | Termo | Mudança |
|---|---|---|
```

#### `docs/invariantes.md`
```markdown
# Invariantes [Nome do Projeto]
> Regras que NUNCA podem ser violadas.

| ID | Invariante | Entidade | Protegida Por | Testes |
|---|---|---|---|---|
| INV-01 | `dataEntrega >= dataPedido` | Pedido | `pedidoService.ts` | `pedido.test.ts:45` |
```

#### `docs/divida-tecnica.md`
```markdown
# Dívida Técnica [Nome do Projeto]
> Decisões conscientes de adiar melhorias.

| ID | Descrição | Impacto | Gatilho | ADR |
|---|---|---|---|---|
| DT-01 | Modelo anêmico em calculos.ts | Dificulta refatoração | Quando +5 funções | |
```
---
# ⚖️ Dívida Técnica vs Tarefa Pendente

> **Dívida técnica** é um registro de algo que optamos por *não fazer agora*, com justificativa e um gatilho futuro.
> **Tarefa pendente** é uma ação que já decidimos executar, priorizada e na fila.

---

## Comparação Direta

| | Dívida Técnica<br>`docs/dominios/divida-tecnica.md` | Tarefa Pendente<br>`docs/tarefas/pendentes.md` |
|---|---|---|
| **O que é** | Problema conhecido que não vamos corrigir agora | Trabalho que queremos fazer em algum momento |
| **Status** | "Adiado conscientemente" | "Na fila" |
| **Tem prazo?** | Não aguarda o gatilho | Sim (`Imediata` / `Esta Semana` / etc.) |
| **Tem responsável?** | Não é um lembrete para o time | Sim quem pegar a task |
| **Gera ação imediata?** | Não só quando o gatilho dispara | Sim alguém vai pegar e executar |
| **Exemplo** | `utils/calculos.ts` tem modelo anêmico.<br>Gatilho: quando precisar adicionar 5+ funções novas | `REF-01` Refatorar `PaginaEstimativa.tsx`<br>(230 linhas → < 150). Urgência: Esta Semana |

---

## Como se Relacionam

```
Dívida Técnica (DT-07)
  │
  │  Gatilho: "TASK-5.x sendo implementada"
  │
  ▼
Tarefa Pendente (BG-12 ou REF-05)
  │
  │  Alguém inicia
  │
  ▼
Em Andamento → Concluída
```

Uma dívida pode virar uma ou mais tarefas quando o gatilho dispara. Até lá, ela fica quieta no documento dela, **sem poluir o backlog**.

---

## Regra Prática

| Situação | Destino |
|---|---|
| Já decidimos fazer e sabemos o esforço | `pendentes.md` com prioridade |
| Decidimos não fazer agora, mas não queremos esquecer | `divida-tecnica.md` com o gatilho |
| O gatilho disparou | A dívida vira uma tarefa (ou várias) e **sai** da lista de dívidas → histórico de dívidas endereçadas |
---
Requisitos.md (PENDENTE)  ──►  tarefas/pendentes.md (linha de tabela, priorizada)
                                   │
                                   ▼
                              em-andamento.md
                                   │
                                   ▼
                              concluidas/RF-xxx.md

Dívida Técnica (texto detalhado)  ──►  (gatilho dispara)
                                   │
                                   ▼
                              vira tarefa(s) em pendentes.md
                              (aí sim, formato de linha de tabela)

#### `docs/ADR/ADR-NNN.md`
```markdown
# ADR-001: [Título]

**Data:** YYYY-MM-DD
**Status:** Aceita / Proposta / Depreciada

## Contexto
[Por que essa decisão precisou ser tomada]

## Decisão
[O que foi decidido]

## Consequências
**Positivas:**
- [benefício]

**Trade-offs aceitos:**
- [custo]

## Alternativas Descartadas
| Alternativa | Motivo |
|---|---|

## Requisitos Relacionados
- **Motivada por:** RF-XX
- **Afeta:** RF-YY

## Tasks Geradas
- [PREFIXO]-XXX: [descrição]

## Histórico
| Data | Mudança |
|---|---|
```
# 📐 Quando Criar uma ADR

> ADR não é burocracia. É a memória de longo prazo para decisões que custam caro reverter.
> Se um dia alguém perguntar *"por que fizemos assim?"*, a resposta está numa ADR não na cabeça de quem implementou.

---

## O que justifica uma ADR

A IA cria uma ADR quando toma ou documenta uma decisão arquitetural que:

- Afeta a **estrutura do sistema**, as **tecnologias adotadas** ou os **padrões de design**
- **Não é trivial** nem reversível sem custo

---

## Gatilhos para criar uma ADR

| Situação | Exemplo real (MotoCalc) |
|---|---|
| Escolha entre tecnologias concorrentes | `ADR-002`: Usar React Context + useReducer em vez de Zustand |
| Definição de arquitetura de persistência | `ADR-001`: Isolar localStorage em `perfilStorage.ts` e nunca acessar direto |
| Decisão sobre imutabilidade de arquivos críticos | `ADR-003`: `utils/calculos.ts` é imutável alterações exigem aprovação |
| Resolução de uma decisão pendente | `ADR-004`: NavBar sempre visível em vez de hamburguer |
| Adoção de padrão que impacta todo o código | `ADR-005`: Todo teste seguirá AAA com nomes em português e Vitest |
| Mudança de stack ou versão com impacto estrutural | `ADR-006`: Migrar de Tailwind 3 para 4 quando disponível |

---

## Quando **não** criar uma ADR

| Situação | Por quê não precisa |
|---|---|
| Decisões triviais (`inputMode='numeric'`) | É convenção já está no `comportamento-geral.md` |
| Refatorações puras sem impacto arquitetural | Vira tarefa `REF` |
| Algo já definido em requisitos ou invariantes | Já está documentado em outro lugar |

---

## Processo Correto

```
1. IA detecta decisão que atende aos critérios
        │
        ▼
2. Antes de implementar, escreve ADR em
   docs/ADR/ADR-NNN.md (template seção 17.3)
        │
        ▼
3. ADR referencia os requisitos que a motivaram
   (ex: RNF-LR-01)
        │
        ▼
4. Se gerar novas tarefas → listadas na ADR
   e adicionadas a docs/tarefas/pendentes.md
        │
        ▼
5. A tarefa de implementação referencia a ADR
   no campo "ADR Relacionada"
```

> 💡 Se a decisão **já foi tomada e implementada**, a IA pode criar uma **ADR retrospectiva** para documentar o que foi feito e por quê.

---

## Exemplo de ADR Real

```md
# ADR-001: Isolar localStorage em serviço dedicado

**Data:** 2026-05-13
**Status:** Aceita

## Contexto
O app persiste presets e preferências. Precisávamos garantir que nenhum
componente acessasse `localStorage` diretamente para viabilizar a migração
futura para IndexedDB ou sync com backend (login V2).
O requisito `RNF-LR-01` exigia isso.

## Decisão
Toda leitura/escrita em `localStorage` passa exclusivamente por
`src/services/perfilStorage.ts`, que implementa a interface `IPerfilStorage`.
Componentes e hooks consomem a interface, não a implementação concreta.

## Consequências
**Positivas:**
- Trocar o storage no futuro é transparente para o resto do código.
- Testes podem mockar o storage facilmente.

**Trade-offs:**
- Adiciona uma camada de indireção; chamadas simples exigem importar o serviço.

## Alternativas Descartadas
- Acesso livre ao localStorage por cada componente: quebra RNF-LR-01
  e dificulta migrações.
- Redux Persist: dependência pesada desnecessária para V1.

## Requisitos Relacionados
- **Motivada por:** RNF-LR-01, RNF-LR-03
- **Afeta:** RF-CONF-01, RF-CONF-02

## Tasks Geradas
- RF-1.1: Implementar PerfilContext com injeção de IPerfilStorage
```



#### `docs/tarefas/pendentes.md`
```markdown
# Tarefas Pendentes [Nome do Projeto]

## Backlog
| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RF-01 | Tela de login | Crítico | Imediata | M | | [ ] |
```

---

## 18. Rituais de Tarefa


### 18.1 Prefixos Padrão de Task

| Prefixo | Significado |
|---|---|
| RN | Regra de Negócio |
| RF | Requisito Funcional |
| RNF | Requisito Não-Funcional |
| BG | Bug |
| REF | Refatoração |
| DOC | Documentação |

# 🔄 Ciclo de Vida das Tarefas

> Toda tarefa passa por **três estágios** com localização e estrutura própria. Nada vive no lugar errado.
---
## Visão Geral

```
[ Pendente ] ──► [ Em Andamento ] ──► [ Concluída ]
pendentes.md      em-andamento.md     concluidas/RF-X.X-YYYY-MM-DD-HHhMM.md
```
---

## Estágio 1 - Pendente

**Arquivo:** `docs/tarefas/pendentes.md`

## Template pendente 'Normal':

| TASK-ID-0.0 | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR | Status | Data origem |

| TASK-RF-5.1 | Registros - lista e sub-abas | Standard|  Importante | Normal | G/G | TASK-1 | RF-2, ADR-3, DT-14 |  PENDENTE | 10/05/26
## Template pendente 'Imediata':

TAKS-ID - Título
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro

---

## Estágio 2 - Em Andamento

**Arquivo:** `docs/tarefas/em-andamento.md`

Ao iniciar, a tarefa **sai da tabela de pendentes** e vira um arquivo com cabeçalho + registro contínuo de ações e bloqueios.
Poder haver mais de uma em andamento ao mesmo tempo, sendo a última inseria no no final
Máximo de 3 em andamento ao mesmo tempo

# Planejamento de execução

1. **Ler** `docs/requisitos e o que for necessário para entender as regras relacionadas
2. **Reformular** o entendimento e confirmar com o humano
3. **Mover** de `docs/tarefas/pendentes.md` para `docs/tarefas/em-andamento.md` 
4. Após 2 tentativas sem sucesso(bloqueios), parar e pedir orientação


# TASK-RF-5.1 - Registros - lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
- **Data início:** 10/05/26 10/05/26 12:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro
- **Planejamento:** O plano de execução que foi mostrado e autorizado pelo humano.

## Planejamento Aprovado
[Plano detalhado que o humano aprovou]

## Execução
- 14:15: Plano aprovado
- 14:30: Iniciada implementação do componente CardRegistro
- 15:45: CardRegistro pronto. Iniciando lista paginada
- 16:00: Bloqueio paginação API retorna formato inesperado
## Bloqueio em YYYY-MM-DD HH:MM

 **O que tentei:** [descrição]
 **Por que não funcionou:** [causa]
 **O que preciso:** [decisão / informação]
# Decisões Tomadas
- [decisão]: [motivo]
# O que NÃO foi feito (e por quê)

- [item]: [motivo]


> A IA registra ações e bloqueios nesse mesmo arquivo durante o trabalho.

---

## Estágio 3 - Concluída

**Arquivo:** `docs/tarefas/concluidas/RF-5.1-2026-05-13-17h30.md`

# Planejamento de execução

1. Execute testes para ver se não quebrou nada. Se quebrou, a tarefa ficará pendente até resolver, volte a etapa 'Durante a tarefa', registre o problema e ache uma solução.
1.Caso tenha passodo nos testes, mover de `em-andamento.md` para `docs/tarefas/concluidas/[PREFIXO]-XXX-YYYY-MM-DD-HHhMM.md` mantendo todas as anotações e formatação, inclua a data de conclusão.
2. Registrar por completo, transferindo todas as informações para o novo documento que ficará sempre disponível para consulta
3. Atualizar `docs/requisitos/` o status do requisito que mudou
4. Se a task gerou novas tarefas, adicioná-las em `docs/tarefas/pendentes.md` conforme o item a seguir
5. Se a task gerou dívidas técnidas, registrar a nova dívida em docs/dominio/divida-tecnica


```md
## Template padrão para tarefas concluídas

# TASK-RF-5.1 Registros: lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
-  **Data início:** 10/05/26 10/05/26 12:39
-  **Data conclusão:** 10/05/26 10/05/26 13:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro
- **Planejamento:** O plano de execução que foi mostrado e autorizado pelo humano.
## Planejamento Aprovado
[Mesmo que estava em em-andamento.md]

## Execução
[Log completo, transferido de em-andamento.md]

## Decisões Tomadas
- [decisão]: [motivo]

## O Que NÃO Foi Feito (e Por Quê)
- [item]: [motivo]

## Revisão
[Conforme módulo 21. Pode ser N/A com justificativa para Light]

## Tarefas Geradas pela Revisão
- BG-12: [descrição]

## Requisitos Gerados pela Revisão
- RNF-13: [descrição] (adicionado em docs/requisitos/nao-funcionais.md)

## ADRs Geradas
- 

## Testes
- `npm run test`: 82 verdes
- Novos testes: `useRegistros.test.ts` (5 testes)
- Modificados: `cardRegistro.test.ts` (1 teste atualizado por nova lógica)

## Aprendizados Para o Projeto
- [algo que vale a equipe saber]

---

## Resumo dos Estágios

| Estágio | Localização | Estrutura | Quem escreve |
|---|---|---|---|
| **Pendente** | `pendentes.md` | 1 linha na tabela | Humano |
| **Em Andamento** | `em-andamento.md` | Cabeçalho + log contínuo | IA + Humano |
| **Concluída** | `concluidas/RF-X.X-data.md` | Template completo | IA, aprovado pelo humano |


---

## 19. Comunicação com o Humano

### 19.1 Tom

- **Direto e pragmático.** Sem bajulação, sem autodepreciação.
- **Transparente sobre incertezas.** "Não tenho certeza sobre X. Possibilidades: A ou B. Qual você prefere?"
- **Conciso.** O humano tem pouco tempo. Vá direto ao ponto.

### 19.2 Quando Pedir Ajuda

- Após 2 tentativas sem sucesso no mesmo problema → peça orientação.
- Quando identificar uma decisão que impacta arquitetura ou produto → peça confirmação.
- Quando encontrar algo que parece errado mas não tem certeza → pergunte.
- Quando houver conflitos de instruções 

### 19.3 Formato de Pergunta

```markdown
## Preciso de Decisão: [tópico]

**Contexto:** [o que estou fazendo]
**Situação:** [o que encontrei]
**Opções:**
1. [Opção A]: [prós/cons]
2. [Opção B]: [prós/cons]

**Minha recomendação:** [opção X] porque [motivo].
O que você decide?
```

---

## 20. Referência Rápida de Comandos

### Frontend
```bash
npm run dev          # iniciar servidor de desenvolvimento
npm run build        # build de produção
npm run lint         # rodar linter
npm run format       # formatar código
```

### Testes
```bash
npm run test              # rodar todos os testes uma vez
npm run test -- --watch   # modo watch
npx vitest related        # testes de arquivos modificados
```

### Análise
```bash
npx tsc --noEmit          # checar tipos
npx eslint src/           # lint em diretório
npx prettier --check src/ # verificar formatação
```

---

## 21. Inicialização e Migração de Projeto

> **Disparador:** ao entrar em um projeto novo (sem `contexto-projeto-ai.md`) ou em um projeto que já tem documentação fora do padrão definido neste arquivo.

### 21.1 Objetivo

Você deve:
1. Fazer **engenharia reversa** do código existente para extrair as informações essenciais
2. Criar/atualizar `contexto-projeto-ai.md` com o que aprendeu
3. Criar a estrutura de documentação padrão (`docs/projeto.md`, `docs/requisitos.md`, etc.)
4. **Arquivar** documentação antiga (fora do padrão) em `docs/arquivo/` nunca deletar
5. **Ignorar** os documentos antigos daqui em diante

### 21.2 Passo a Passo

#### Passo 1: Analisar o Código Existente

Leia e registre em um rascunho mental (ou em `em-andamento.md`):

- `package.json`: dependências, scripts, versões exatas
- `tsconfig.json`: strict, paths, baseUrl
- `tailwind.config.*` ou `index.css`: design tokens, fontes, cores
- `vite.config.ts` ou `next.config.js`: plugins, PWA, configurações
- Estrutura real de pastas em `src/`: o que existe e o que cada pasta contém
- Rotas: `App.tsx`, `routes.tsx`, `pages/` como a navegação funciona
- Estado global: `context/`, `stores/`, `hooks/use*.ts` qual padrão é usado
- Serviços: `services/` APIs, storage, integrações
- Componentes UI: `components/ui/` quais wrappers já existem
- `README.md` atual: se existir, extraia descrição do produto e instruções
- Arquivos de requisitos antigos: se existirem, extraia regras de negócio ainda válidas

#### Passo 2: Criar `contexto-projeto-ai.md` (se não existir)

```markdown
# Contexto do Projeto [Nome]

> Informações que o código NÃO expressa ou que são difíceis de inferir.

## Stack Exata
| Tecnologia | Versão | Nota |
|---|---|---|
| [da análise do package.json] | | |

## Estrutura Real de Pastas
```
src/
├── types/          [descrição do que contém]
├── utils/          [descrição]
...
```

## Rotas
| Rota | Page | Acesso |
|---|---|---|
| [da análise do router] | | |

## Decisões Arquiteturais Imutáveis
- [ex: Idioma: Português]
- [ex: Estado global: Context + useReducer]
- [ex: Testes: Vitest, sem RTL ainda]

## Documentação de Referência
- [links para docs externos importantes]
```

#### Passo 3: Criar a Estrutura de Documentação Padrão

markdown
#### Passo 3: Criar a Estrutura de Documentação Padrão

Crie (se não existirem) os seguintes arquivos, preenchendo com o que foi extraído do código:

**Documentos de projeto (raiz e entrada):**
1. **`README.md`** visão geral do produto e stack resumida (para humanos). Se já existir, extraia o que for relevante e complemente.
2. **`docs/contexto-projeto-ai.md`** índice de links para todos os docs + instruções específicas para IA. Este é o ponto de entrada de qualquer IA no projeto.

**Requisitos:**
3. **`docs/requisitos/`** se existirem requisitos antigos, migre-os para cá separando em:
   - `funcionais.md` (RFs com IDs e critérios de aceite)
   - `regras-negocio.md` (RNs com invariantes)
   - `nao-funcionais.md` (RNFs de desempenho, acessibilidade, stack, etc.)
   Se não houver requisitos, extraia o que for possível do código (validações, constraints, lógicas) e crie ao menos as regras de negócio.

**Domínio:**
4. **`docs/dominios/glossario.md`** se houver terminologia de domínio no código, liste-a com definições únicas.
5. **`docs/dominios/invariantes.md`** extraia regras inquebráveis de validações, guards e testes.
6. **`docs/dominios/divida-tecnica.md`** vazio inicialmente (preenchido conforme dívidas forem identificadas).
7. **`docs/dominios/modelagem/`** pasta para modelagem detalhada (entidades, agregados, value objects). Pode ficar vazia inicialmente.

**Design:**
8. **`docs/design/`** para informações de telas, especificações de Figma, fluxos de navegação, estrutura de componentes React. Se houver arquivos de design antigos, migre-os para cá.

**Arquitetura:**
9. **`docs/arquitetura/`** para tudo que define a estrutura do projeto:
   - `visao-geral.md` estrutura de pastas e decisões arquiteturais imutáveis.
   - `estado-inicial.md` fluxo de inicialização, persistência, chaves de storage.
   - `convencoes.md` padrões de nomenclatura, idioma, exemplos de código correto/incorreto.
   - `padrao-testes.md` framework, estilo, cobertura mínima, comandos.
   - `tema-tailwind.md` tokens de cor, tipografia, classes customizadas (se aplicável).
   - `rotas.md` lista completa de rotas (se houver).
   - `componentes-ui.md` componentes de UI instalados e wrappers (se houver).
   - `setup-inicial.md` passo a passo para rodar o projeto do zero.
   - `ADR/` pasta vazia para decisões arquiteturais futuras.

**Tarefas:**
10. **`docs/tarefas/pendentes.md`** se houver tarefas antigas, migre-as para cá no formato padrão (uma linha por tarefa, com prefixo, valor, urgência, esforço).
11. **`docs/tarefas/em-andamento.md`** vazio.
12. **`docs/tarefas/concluidas/`** pasta vazia.

A estrutura final esperada:
docs/
├── contexto-projeto-ai.md # Índice para IA com links e instruções específicas
├── requisitos/
│ ├── funcionais.md # RFs com IDs e critérios de aceite
│ ├── regras-negocio.md # RNs com invariantes
│ └── nao-funcionais.md # RNFs (desempenho, acessibilidade, PWA, etc.)
├── dominios/
│ ├── glossario.md # Linguagem ubíqua do domínio
│ ├── invariantes.md # Regras invioláveis
│ ├── divida-tecnica.md # Dívidas conscientes com gatilhos
│ └── modelagem/ # Modelagem detalhada (entidades, agregados, VOs)
├── design/ # Telas, Figma, estrutura de componentes React
├── arquitetura/
│ ├── visao-geral.md # Estrutura de pastas e decisões de arquitetura
│ ├── estado-inicial.md # Persistência e estado inicial
│ ├── componentes-ui.md # Componentes shadcn instalados e wrappers
│ ├── rotas.md # Lista completa de rotas
│ ├── convencoes.md # Convenções de código e nomenclatura
│ ├── padrao-testes.md # Padrão de testes (Vitest, AAA, cobertura)
│ ├── tema-tailwind.md # Tokens de cor, tipografia, classes customizadas
│ ├── setup-inicial.md # Passo a passo para setup do projeto
│ └── ADR/ # Decisões arquiteturais
└── tarefas/
├── pendentes.md # Backlog priorizado (uma linha por tarefa)
├── em-andamento.md # Tarefa atual em execução
└── concluidas/ # Histórico completo
└── PREFIXO-XXX-YYYY-MM-DD-HHhMM.md

text

**Regras:**
- `README.md` na raiz é o cartão de visita para humanos visão do produto, stack, como rodar, link para `docs/`.
- `contexto-projeto-ai.md` é o único arquivo que a IA precisa abrir ao entrar no projeto contém índice de links e instruções específicas.
- Nenhuma informação duplicada entre esses arquivos.
- O código continua sendo a verdade primária documentação só contém o que o código não expressa.

#### Passo 4: Arquivar Documentos Antigos

Se existirem documentos de documentação fora do padrão (ex: múltiplos arquivos em `docs/dominio/`, `docs/historico/`, `docs/ux/`), faça:

1. Criar a pasta `docs/arquivo/`
2. Mover (ou copiar e depois deletar originais) **todos** os documentos antigos para lá
3. NÃO deletar permanentemente apenas isolar
4. Registrar no handoff: "Documentos antigos arquivados em `docs/arquivo/`. A partir de agora, a documentação oficial é a gerada no padrão."

#### Passo 5: Relatório Final

Apresente um resumo do que foi feito:

```markdown
## Migração de Documentação Concluída

### Documentos Criados
- `contexto-projeto-ai.md`
- ....

### Documentos Arquivados
- `docs/dominio/` → `docs/arquivo/dominio/`
- `docs/ux/` → `docs/arquivo/ux/`
- [outros]

### Próximos Passos Sugeridos
- Validar as regras de negócio extraídas com o stakeholder
- Revisar as invariantes contra os testes existentes
- Priorizar as tarefas pendentes
```

### 21.3 Regras da Engenharia Reversa

- **Não invente.** Se o código não diz, não coloque no documento. Melhor vazio que errado.
- **Use o código como verdade.** Se houver conflito entre doc antiga e código, o código vence.
- **Se houver `README.md`**, extraia informações dele, mas não duplique. O `README.md` pode continuar existindo para humanos.
- **Nunca delete** documentação antiga sem autorização explícita. Apenas arquive em `docs/arquivo/`.
- **Após a migração**, todos os documentos em `docs/arquivo/` devem ser ignorados não os leia mais, não os referencie, não os atualize.

### 21.4 Manutenção Contínua

Após a inicialização:
- O `contexto-projeto-ai.md` deve ser atualizado sempre que a estrutura de pastas mudar, novas rotas forem adicionadas, ou decisões arquiteturais forem tomadas.
- Os documentos em `docs/` devem ser mantidos pelos rituais de tarefa (seção 18).
- O código continua sendo a fonte primária de verdade.

---

> **Este documento evolui.** Quando um padrão novo se provar útil em múltiplos projetos, adicione-o.
> Quando uma prática cair em desuso, remova-a.
>
> **Versão atual:** 2.0 adaptado para sistema de documentação unificada com engenharia reversa.
```
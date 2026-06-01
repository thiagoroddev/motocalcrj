---
description: "Padrões de código para projetos TypeScript, React, Tailwind e Node.js."
applyTo: "**/*.{ts,tsx,js,jsx,json,css,md}"
---

# Padrões de Código TypeScript, React, Tailwind e Node.js

> Este arquivo define padrões técnicos de implementação.
> Para comportamento geral do agente, leia `Geral.agent.md`.
> Para documentação, tarefas, revisão e segurança, siga os arquivos específicos indicados em [Relações com outros padrões].

---

## 1. Escopo deste arquivo

Use este padrão quando a tarefa envolver:

- criação ou alteração de código TypeScript/JavaScript;
- componentes React;
- hooks;
- estado local ou global;
- serviços de API, storage ou integrações;
- organização de pastas em `src/`;
- Tailwind CSS;
- testes de unidade, componente ou integração leve.

Este arquivo **não** decide requisitos de produto, fluxo de tarefas, ADRs ou política de segurança. Ele apenas define como o código deve ser escrito.

---

## 2. Relações com outros padrões

| Tema | Arquivo relacionado | Como se relaciona |
|---|---|---|
| Comportamento geral do agente | `Geral.agent.md` | Define prioridade das regras, quando pedir aprovação e como agir. |
| Documentação do projeto | `documentacao.agent.md` | Use quando uma mudança de código exigir atualização de docs, ADR, requisitos ou contexto. |
| Fluxo de tarefas | `tarefas.agent.md` | Use quando a implementação estiver vinculada a uma tarefa pendente, em andamento ou concluída. |
| Revisão de código | `revisao.agent.md` | Use antes de entregar mudanças relevantes de código. |
| Segurança e privacidade | `seguranca.agent.md` | Use em qualquer código que trate dados pessoais, autenticação, storage, logs, URL ou integrações. |

Regra prática: **não copie regras desses arquivos aqui**. Apenas consulte quando o tema aparecer.

---

## 3. Stack padrão

| Camada | Tecnologias primárias | Alternativas comuns |
|---|---|---|
| Frontend | React 18+, TypeScript 5+, Tailwind CSS | Next.js, Remix |
| Backend | Node.js 20+, Express, Prisma | Fastify, Drizzle, Knex |
| Testes | Vitest, Testing Library | Jest, Playwright, Cypress |
| UI base | shadcn/ui, Radix UI | Headless UI, Ark UI |
| Estado | Context API + `useReducer`, Zustand | Jotai, Redux Toolkit |
| Build | Vite | Next.js, Turbopack |
| Validação | Zod | Valibot, Yup |

**Regra:** se o projeto já escolheu uma tecnologia, respeite a escolha. Não proponha troca de stack sem motivo forte e sem aprovação.

---

## 4. Idioma e nomenclatura

Defina um idioma predominante no início do projeto e mantenha-o em código, testes, commits e documentação técnica.

| Elemento | Convenção | Exemplo em PT | Exemplo em EN |
|---|---|---|---|
| Variável/função | `camelCase` | `calcularTotal` | `calculateTotal` |
| Booleano | prefixo claro | `temSeguro`, `estaAtivo` | `hasInsurance`, `isActive` |
| Componente React | `PascalCase` | `PainelUsuario` | `UserPanel` |
| Hook | `use` + nome | `usePerfil` | `useProfile` |
| Tipo/interface | `PascalCase` | `PerfilUsuario` | `UserProfile` |
| Constante global | `UPPER_SNAKE_CASE` | `LIMITE_MAXIMO` | `MAX_LIMIT` |
| Arquivo de componente | `PascalCase.tsx` | `PainelUsuario.tsx` | `UserPanel.tsx` |
| Arquivo de hook | `useNome.ts` | `usePerfil.ts` | `useProfile.ts` |
| Utilitário | `camelCase.ts` | `formatarMoeda.ts` | `formatCurrency.ts` |

Evite misturar português e inglês no mesmo domínio do código.

---

## 5. Organização padrão em `src/`

Use esta estrutura quando o projeto ainda não tiver uma organização própria. Se já houver padrão existente, siga o padrão real do projeto.

```txt
src/
├── types/                  # Tipos do domínio
├── utils/                  # Funções puras
├── services/               # APIs, storage e efeitos colaterais
├── context/                # Context API + reducers
├── stores/                 # Zustand/Jotai/Redux, se o projeto usar
├── hooks/                  # Hooks reutilizáveis ou de feature
├── components/
│   ├── ui/                 # Componentes genéricos sem negócio
│   ├── layout/             # Header, Sidebar, Footer, etc.
│   └── [dominio]/          # Componentes ligados ao domínio
├── pages/                  # Composição de tela
├── data/                   # Dados estáticos e constantes
├── config/                 # Configurações, env e feature flags
└── lib/                    # Helpers de infraestrutura, se necessário
```

### 5.1 Onde cada coisa vive

| Coisa | Local recomendado | Regra |
|---|---|---|
| Tipo de domínio | `src/types/` | Um arquivo por entidade, agregado ou tema. |
| Função pura | `src/utils/` | Sem side effects. Fácil de testar. |
| Formatador | `src/utils/formatters.ts` ou arquivo específico | Evite formatação inline espalhada. |
| API externa | `src/services/` | Isola `fetch`, axios, SDKs e integrações. |
| Storage local | `src/services/*Storage.ts` | Único ponto de acesso a `localStorage`, `sessionStorage` ou IndexedDB. |
| Estado global | `src/context/` ou `src/stores/` | Um domínio por contexto/store. |
| Hook de feature | `src/hooks/useFeature.ts` | Encapsula estado, handlers e derivações. |
| Componente UI base | `src/components/ui/` | Zero regra de negócio. |
| Componente de domínio | `src/components/[dominio]/` | Pode conhecer regras e termos do negócio. |
| Página | `src/pages/` ou rota do framework | Deve compor componentes, não concentrar lógica. |

---

## 6. TypeScript

### 6.1 Regras obrigatórias

- Evite `any`.
- Prefira `unknown` + validação/type guard em dados externos.
- Não silencie erro de tipo com `as` sem justificativa.
- Não use `// @ts-ignore` sem comentário explicando o motivo.
- Modele dados externos com schemas quando possível, preferencialmente Zod ou ferramenta já adotada no projeto.

### 6.2 `any` permitido com justificativa

`any` só é aceitável em bordas inevitáveis, como biblioteca externa sem tipagem adequada.

```ts
// Permitido apenas com justificativa objetiva.
// any necessário porque a biblioteca externa não expõe tipo para este payload.
function adaptarPayloadExterno(payload: any): PayloadNormalizado {
  return normalizar(payload)
}
```

Mesmo nesses casos, normalize o dado o mais cedo possível para voltar ao tipo seguro.

### 6.3 Tipos devem representar o domínio

Evite tipos genéricos demais:

```ts
// Fraco
type Item = {
  id: string
  value: number
}

// Melhor
type ItemPedido = {
  id: string
  valorUnitario: number
  quantidade: number
}
```

---

## 7. React

### 7.1 Pages são composição

Uma page deve:

- montar layout;
- chamar hooks de feature;
- renderizar componentes;
- lidar com estados gerais de carregamento, erro ou vazio.

Uma page não deve:

- concentrar regras de negócio;
- fazer cálculo complexo inline;
- acessar storage direto;
- conter handlers longos;
- conter múltiplas responsabilidades.

Referência prática:

- até 100 linhas: geralmente aceitável;
- acima de 150 linhas: avaliar extração;
- acima de 200 linhas: refatoração recomendada, salvo justificativa.

```tsx
export function PaginaDetalhamento() {
  const vm = useDetalhamento()

  if (vm.carregando) return <EstadoCarregando />
  if (vm.erro) return <EstadoErro mensagem={vm.erro} />
  if (!vm.dados) return <EstadoVazio mensagem="Nenhum dado encontrado." />

  return (
    <main className="space-y-4 p-4">
      <ResumoDetalhamento total={vm.total} />
      <ListaDetalhamento itens={vm.itens} onSelecionar={vm.selecionarItem} />
    </main>
  )
}
```

### 7.2 Hooks de feature

Hooks de feature devem encapsular:

1. estado;
2. derivações;
3. handlers;
4. comunicação com serviços;
5. interface mínima para a UI.

```ts
import { useMemo, useState, useCallback } from 'react'

export function useDetalhamento() {
  const [filtros, setFiltros] = useState<Filtros>({})
  const [itemSelecionadoId, setItemSelecionadoId] = useState<string | null>(null)

  const totalFiltrado = useMemo(() => {
    return calcularTotalFiltrado(filtros)
  }, [filtros])

  const selecionarItem = useCallback((id: string) => {
    setItemSelecionadoId(id)
  }, [])

  return {
    filtros,
    itemSelecionadoId,
    totalFiltrado,
    selecionarItem,
    setFiltros,
  }
}
```

### 7.3 `useEffect`

Use `useEffect` para sincronizar com o mundo externo:

- subscriptions;
- timers;
- eventos globais;
- chamadas externas;
- integração com APIs imperativas.

Não use `useEffect` para derivar estado de outro estado.

```tsx
// Evite
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(preco * quantidade)
}, [preco, quantidade])

// Prefira
const total = preco * quantidade
```

Use `useMemo` apenas quando o cálculo for custoso ou quando ajudar a estabilizar referência.

### 7.4 `useCallback`

Use `useCallback` quando:

- o handler é passado para componente memoizado;
- o handler entra em dependência de outro hook;
- estabilidade de referência importa.

Não aplique `useCallback` automaticamente em todo handler.

---

## 8. Estado global

### 8.1 Quando usar estado global

Use estado global quando o dado:

- é compartilhado por múltiplas áreas distantes;
- precisa persistir entre rotas;
- representa sessão, autenticação, preferências ou domínio central;
- evita prop drilling real, não apenas 1 ou 2 níveis de props.

Não use estado global para estado local de formulário, modal simples ou controle visual pequeno.

### 8.2 Context + reducer

```ts
type Acao =
  | { type: 'DEFINIR_CAMPO'; campo: keyof Estado; valor: unknown }
  | { type: 'RESETAR' }

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.type) {
    case 'DEFINIR_CAMPO':
      return { ...estado, [acao.campo]: acao.valor }
    case 'RESETAR':
      return estadoInicial
    default:
      return estado
  }
}
```

Regras:

- um contexto/store por domínio;
- exponha hooks facade, não `dispatch` bruto para a aplicação inteira;
- validações importantes não devem existir só na UI;
- estado global precisa ter dono claro.

---

## 9. Componentes UI

### 9.1 Princípios

Componentes em `components/ui/` devem:

- ser reutilizáveis;
- não conhecer regra de negócio;
- aceitar `className`;
- exportar interface/tipo das props;
- preservar acessibilidade;
- funcionar em mais de um contexto.

Componentes de domínio podem conhecer entidades, regras e termos específicos.

### 9.2 Template de componente UI

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'ghost' | 'destrutivo'
  carregando?: boolean
  larguraTotal?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(
  ({ variante = 'primario', carregando, larguraTotal, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          'inline-flex min-h-12 items-center justify-center rounded-md font-medium transition-colors',
          larguraTotal && 'w-full',
          (disabled || carregando) && 'cursor-not-allowed opacity-50',
          className,
        )}
        {...props}
      >
        {carregando ? 'Carregando...' : children}
      </button>
    )
  },
)

Botao.displayName = 'Botao'
```

### 9.3 Wrappers de bibliotecas

Ao usar shadcn/ui, Radix ou similares:

- não reimplemente comportamento que a biblioteca já resolve;
- use wrappers para padronizar variantes, tamanhos e integração com o tema;
- preserve `className` quando a lib permitir;
- não coloque regra de negócio no wrapper.

---

## 10. Formulários

Regras:

- labels sempre visíveis;
- `htmlFor` conectado ao `id` do input;
- use `inputMode` adequado;
- erros associados com `aria-describedby`;
- use `aria-invalid` quando houver erro;
- validação agressiva enquanto digita deve ser evitada, salvo necessidade clara.

```tsx
<label htmlFor="kmPorDia" className="text-sm font-medium">
  KM por dia
</label>

<input
  id="kmPorDia"
  type="number"
  inputMode="numeric"
  value={kmPorDia}
  onChange={(event) => setKmPorDia(Number(event.target.value))}
  aria-describedby={erro ? 'kmPorDia-erro' : undefined}
  aria-invalid={Boolean(erro)}
/>

{erro && (
  <span id="kmPorDia-erro" role="alert" className="text-sm">
    {erro}
  </span>
)}
```

---

## 11. Tailwind CSS

### 11.1 Uso recomendado

- Prefira tokens do tema em vez de valores soltos.
- Evite classes enormes repetidas em vários lugares; extraia componente ou variante.
- Use `cn()` para combinar classes condicionais.
- Não esconda lógica de negócio dentro de classe condicional complexa.

```tsx
<div
  className={cn(
    'rounded-xl border p-4 shadow-sm',
    selecionado && 'ring-2',
    desabilitado && 'pointer-events-none opacity-50',
  )}
/>
```

### 11.2 Quando extrair componente

Extraia quando:

- o mesmo bloco visual aparece 3 ou mais vezes;
- há muitas classes condicionais;
- o JSX começa a esconder a intenção da tela;
- o componente tem estados visuais próprios.

---

## 12. Serviços e efeitos colaterais

Serviços devem isolar efeitos externos:

- `fetch`/axios;
- storage;
- IndexedDB;
- SDKs externos;
- chamadas para backend;
- arquivos;
- timers globais, quando fizer sentido.

```ts
export interface PerfilStorage {
  carregar(): Perfil | null
  salvar(perfil: Perfil): void
  limpar(): void
}

export const perfilStorage: PerfilStorage = {
  carregar() {
    const raw = localStorage.getItem('perfil')
    return raw ? JSON.parse(raw) : null
  },
  salvar(perfil) {
    localStorage.setItem('perfil', JSON.stringify(perfil))
  },
  limpar() {
    localStorage.removeItem('perfil')
  },
}
```

Para regras de privacidade, consulte `seguranca.agent.md`.

---

## 13. Testes

### 13.1 Filosofia

Teste comportamento importante, não implementação interna sem valor.

Prioridade:

1. regras de negócio;
2. funções puras críticas;
3. reducers e stores;
4. hooks com lógica relevante;
5. componentes com interação;
6. casos de borda documentados.

### 13.2 Padrão AAA

```ts
import { describe, expect, it } from 'vitest'

import { calcularTotal } from './calcularTotal'

describe('calcularTotal', () => {
  it('soma os valores quando recebe múltiplos itens', () => {
    // Arrange
    const itens = [
      { valor: 100 },
      { valor: 50 },
    ]

    // Act
    const total = calcularTotal(itens)

    // Assert
    expect(total).toBe(150)
  })
})
```

### 13.3 Cobertura mínima por unidade nova/modificada

Sempre que fizer sentido, cubra:

- caminho feliz;
- invariantes relevantes;
- edge cases importantes;
- erro ou entrada inválida quando aplicável.

Não busque 100% de cobertura cega. Busque confiança real.

### 13.4 Quando teste falha

Não atualize teste só para “fazer passar”. Primeiro descubra se:

1. o código quebrou comportamento esperado;
2. o requisito mudou;
3. o teste antigo estava errado;
4. a implementação nova exige novo contrato.

Se o comportamento mudou por decisão de produto, atualize requisito/documentação conforme `documentacao.agent.md` e registre na tarefa conforme `tarefas.agent.md`.

---

## 14. Performance e acessibilidade no código

### 14.1 Performance

Checklist rápido:

- derivações simples não precisam de estado;
- cálculos custosos podem usar `useMemo`;
- handlers só precisam de `useCallback` quando estabilidade importa;
- rotas grandes podem usar code splitting;
- imagens devem ter tamanho adequado e lazy loading quando fizer sentido;
- evite imports que puxam biblioteca inteira sem necessidade.

### 14.2 Acessibilidade

Checklist rápido:

- todo input tem label visível;
- botão só com ícone tem `aria-label`;
- ícone decorativo usa `aria-hidden="true"`;
- elementos interativos têm área de toque confortável, idealmente 44-48px;
- foco visível com `:focus-visible`;
- erros de formulário são anunciáveis;
- animações respeitam `prefers-reduced-motion` quando forem intensas.

Para regras de privacidade e exposição de dados, consulte `seguranca.agent.md`.

---

## 15. Refatoração

Refatoração não muda comportamento. Se muda comportamento, é redesign ou feature.

Refatore quando houver:

| Sinal | Ação comum |
|---|---|
| Componente com muitas responsabilidades | Extrair hook e subcomponentes. |
| Função longa | Extrair funções nomeadas. |
| Lógica duplicada em 3+ lugares | Extrair util, hook ou componente. |
| `useEffect` derivando estado | Trocar por cálculo direto ou `useMemo`. |
| Magic numbers | Criar constante nomeada. |
| Muitos parâmetros | Trocar por objeto de opções. |

Antes de refatoração relevante, confira o fluxo de aprovação em `Geral.agent.md` e o registro em `tarefas.agent.md`.

---

## 16. Anti-padrões técnicos

Evite:

- `any` sem justificativa;
- `useEffect` para derivar estado;
- `key={index}` em lista dinâmica;
- `localStorage` direto em componente;
- comentários que repetem o código;
- função com parâmetros demais;
- page com regra de negócio pesada;
- componente UI com lógica de domínio;
- dependência nova sem aprovação;
- teste alterado sem entender a causa da falha;
- refatoração misturada com feature sem necessidade.

---

## 17. Checklist antes de entregar código

Antes de considerar pronto:

- [ ] O código segue o idioma do projeto.
- [ ] Não há `any` sem justificativa.
- [ ] Não há storage direto em componentes.
- [ ] Não há regra de negócio escondida em componente UI genérico.
- [ ] Não há `useEffect` para derivação simples.
- [ ] Listas dinâmicas usam keys estáveis.
- [ ] Inputs têm labels e atributos de acessibilidade adequados.
- [ ] Código crítico tem teste ou justificativa para não ter.
- [ ] Mudança de comportamento atualizou requisitos/docs, se necessário.
- [ ] Questões de segurança foram conferidas em `seguranca.agent.md`.
- [ ] Revisão seguiu `revisao.agent.md`, se a mudança for relevante.

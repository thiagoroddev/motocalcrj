---

description: "Template/scaffold para hook de feature. Cobre interface mínima, derivação direta, handlers, retorno e testes." modulo: "36" categoria: "templates" versao: "1.0" arquivo_destino: "src/hooks/use[NomeFeature].ts" relacionado:

- "12-react-e-estado.md"
- "11-arquitetura-e-pastas.md"
- "15-testes.md"

---

# 🪝 Template: Hook de Feature

> **Arquivo destino:** `src/hooks/use[NomeFeature].ts` **Quando usar:** ao criar lógica de uma page que vai além de 2-3 `useState` ou tem cálculos não-triviais. **Audiência:** uma page específica consome este hook; ele não é reutilizável em outros lugares.

---

## Os 3 Tipos de Hook

Antes de usar este template, **identifique** que tipo de hook você está fazendo. Não é o mesmo.

|Tipo|Vive em|Conhece domínio?|Reutilizável?|Exemplo|
|---|---|---|---|---|
|**Utilitário**|`hooks/` (genérico)|Não|Sim, qualquer projeto|`useDebounce`, `useLocalStorage`|
|**Feature** ← _este template_|`hooks/`|Sim|Não, uma page|`useDetalhamento`, `useCarrinho`|
|**UI**|Junto ao componente|Não|Junto com componente|`useDisclosure` (modal abrir/fechar)|

**Hook de feature** é o "cérebro" da page. Reúne tudo que a page precisa em uma interface limpa.

---

## Princípios

### 1. Interface mínima

O retorno expõe **apenas o que o JSX da page consome**. Estado interno fica interno.

```typescript
// ❌ Retorno gigante
return {
  detalhes,
  expandido,
  setExpandido,
  filtros,
  setFiltros,
  filtrosAplicados,
  setFiltrosAplicados,
  totalFiltrado,
  totalGeral,
  carregando,
  erro,
  // ... 15 outros
}

// ✅ Interface mínima — só o que a page consome
return {
  detalhes,
  expandido,
  totalFiltrado,
  carregando,
  alternarFiltro,    // handler, não setter
  toggleExpandido,   // handler, não setter
}
```

### 2. Derivação direta sobre `useEffect`

Se um valor pode ser calculado a partir de outros, **calcule direto** (ou com `useMemo` se for caro).

```typescript
// ❌
const [total, setTotal] = useState(0)
useEffect(() => setTotal(a + b), [a, b])

// ✅
const total = a + b

// ✅ (se cálculo é caro)
const total = useMemo(() => calcularCaro(a, b), [a, b])
```

### 3. Sem dependências escondidas

Hook recebe IDs e parâmetros via argumento. **Não consome Context magicamente** nem busca dados que ninguém pediu.

```typescript
// ❌ Hook puxa "magicamente"
function useDetalhamento() {
  const id = useParams().id   // dependência escondida
  const dados = useFetch(`/detalhes/${id}`)
  // ...
}

// ✅ Hook recebe ID via argumento
function useDetalhamento(id: string) {
  const dados = useFetch(`/detalhes/${id}`)
  // ...
}
```

A page é quem extrai `id` da URL e passa pro hook. Mais testável e explícito.

### 4. Handlers, não setters

A page chama `alternarFiltro(id)`, não `setFiltros(prev => ...)`. A lógica de **como** alterar fica dentro do hook.

```typescript
// ❌ Setter exposto
return { filtros, setFiltros }

// page tem que saber a estrutura interna:
<Botao onClick={() => setFiltros(prev => ({ ...prev, [id]: !prev[id] }))}>

// ✅ Handler nomeado
return { filtros, alternarFiltro }

// page só chama:
<Botao onClick={() => alternarFiltro(id)}>
```

### 5. Sem JSX

Hook é lógica pura. JSX vive nos componentes. Se o hook quer retornar "elemento pronto", virou componente.

### 6. Testável isoladamente

Hook pode ser testado com `renderHook` do Testing Library, sem precisar renderizar uma page inteira.

---

## Anatomia do Hook

A maioria dos hooks de feature tem 5 partes:

```typescript
// 1. Imports
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@/lib/...'  // ou outro mecanismo de fetch

// 2. Tipos (entrada e retorno)
export interface UseExemploParams {
  id: string
}

export interface UseExemploReturn {
  // só o que JSX consome
  dados: Tipo[]
  carregando: boolean
  alternarAlgo: (id: string) => void
}

// 3. Hook
export function useExemplo({ id }: UseExemploParams): UseExemploReturn {
  // 3.1 Fetch / estado externo
  const { data, isLoading } = useQuery({ /* ... */ })

  // 3.2 Estado local
  const [filtro, setFiltro] = useState<string | null>(null)

  // 3.3 Derivações
  const dadosFiltrados = useMemo(
    () => filtrarPor(data, filtro),
    [data, filtro]
  )

  // 3.4 Handlers
  const alternarAlgo = useCallback((id: string) => {
    setFiltro(prev => prev === id ? null : id)
  }, [])

  // 3.5 Retorno (interface mínima)
  return {
    dados: dadosFiltrados,
    carregando: isLoading,
    alternarAlgo,
  }
}
```

---

## Exemplo Completo: `useDetalhamento`

Continuando narrativa do AlugaCar. Hook para a `PaginaDetalheAluguel` que mostra o detalhamento de um aluguel.

```typescript
// src/hooks/useDetalhamento.ts
import { useState, useMemo, useCallback } from 'react'
import { aluguelApi } from '@/api/aluguelApi'
import type { Aluguel, ItemAluguel } from '@/types/aluguel'

export interface UseDetalhamentoParams {
  aluguelId: string
}

export interface UseDetalhamentoReturn {
  // dados visíveis
  aluguel: Aluguel | null
  itensFiltrados: ItemAluguel[]
  totalFiltrado: number
  totalGeral: number

  // estados
  carregando: boolean
  erro: string | null

  // controles
  categoriaAtiva: string | null
  itensExpandidos: Set<string>

  // handlers
  alternarCategoria: (categoria: string) => void
  alternarExpansao: (itemId: string) => void
  recarregar: () => void
}

export function useDetalhamento({ aluguelId }: UseDetalhamentoParams): UseDetalhamentoReturn {
  // Estado externo (vem de fetch)
  const [aluguel, setAluguel] = useState<Aluguel | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Estado local (UI)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [itensExpandidos, setItensExpandidos] = useState<Set<string>>(new Set())

  // Fetch
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await aluguelApi.buscarPorId(aluguelId)
      setAluguel(dados)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setCarregando(false)
    }
  }, [aluguelId])

  // Carrega inicialmente
  useEffect(() => {
    carregar()
  }, [carregar])

  // Derivações
  const itensFiltrados = useMemo(() => {
    if (!aluguel) return []
    if (!categoriaAtiva) return aluguel.itens
    return aluguel.itens.filter(item => item.categoria === categoriaAtiva)
  }, [aluguel, categoriaAtiva])

  const totalFiltrado = useMemo(
    () => itensFiltrados.reduce((soma, item) => soma + item.valor, 0),
    [itensFiltrados]
  )

  const totalGeral = useMemo(
    () => aluguel?.itens.reduce((soma, item) => soma + item.valor, 0) ?? 0,
    [aluguel]
  )

  // Handlers
  const alternarCategoria = useCallback((categoria: string) => {
    setCategoriaAtiva(prev => (prev === categoria ? null : categoria))
  }, [])

  const alternarExpansao = useCallback((itemId: string) => {
    setItensExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(itemId)) {
        novo.delete(itemId)
      } else {
        novo.add(itemId)
      }
      return novo
    })
  }, [])

  return {
    aluguel,
    itensFiltrados,
    totalFiltrado,
    totalGeral,
    carregando,
    erro,
    categoriaAtiva,
    itensExpandidos,
    alternarCategoria,
    alternarExpansao,
    recarregar: carregar,
  }
}
```

### Como a page consome

```tsx
// src/pages/PaginaDetalheAluguel.tsx
import { useParams } from 'react-router-dom'
import { useDetalhamento } from '@/hooks/useDetalhamento'
import { CardDetalhamento } from '@/components/aluguel/CardDetalhamento'
import { FiltrosCategoria } from '@/components/aluguel/FiltrosCategoria'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { EstadoErro } from '@/components/ui/EstadoErro'

export function PaginaDetalheAluguel() {
  const { id } = useParams<{ id: string }>()
  const vm = useDetalhamento({ aluguelId: id! })

  if (vm.carregando) return <CardDetalhamento.Skeleton />
  if (vm.erro) return <EstadoErro mensagem={vm.erro} onRetry={vm.recarregar} />
  if (!vm.aluguel) return <EstadoVazio mensagem="Aluguel não encontrado" />

  return (
    <div className="space-y-4">
      <FiltrosCategoria
        categoriaAtiva={vm.categoriaAtiva}
        onAlternar={vm.alternarCategoria}
      />
      <ul className="space-y-2">
        {vm.itensFiltrados.map(item => (
          <li key={item.id}>
            <CardDetalhamento
              item={item}
              expandido={vm.itensExpandidos.has(item.id)}
              onToggle={() => vm.alternarExpansao(item.id)}
            />
          </li>
        ))}
      </ul>
      <div className="text-right font-medium">
        Total filtrado: R$ {vm.totalFiltrado.toFixed(2)}
        {vm.categoriaAtiva && <> de R$ {vm.totalGeral.toFixed(2)}</>}
      </div>
    </div>
  )
}
```

**Note:**

- Page é puro JSX + estados condicionais
- Nenhum `useState` na page
- Nenhum cálculo na page
- Hook (`vm`) é a única dependência de lógica

---

## Template Vazio (Para Copiar)

```typescript
// src/hooks/use[NomeFeature].ts
import { useState, useMemo, useCallback } from 'react'
// imports adicionais conforme necessário

export interface Use[NomeFeature]Params {
  // entradas do hook (IDs, opções)
}

export interface Use[NomeFeature]Return {
  // só o que o JSX da page consome
  // dados visíveis
  // estados (carregando, erro)
  // controles (estado atual de UI)
  // handlers (funções nomeadas, não setters)
}

export function use[NomeFeature](
  params: Use[NomeFeature]Params
): Use[NomeFeature]Return {
  // 1. Estado externo (fetch / API)

  // 2. Estado local (UI)

  // 3. Derivações (cálculos, filtros)

  // 4. Handlers (useCallback se passar como prop)

  // 5. Retorno
  return {
    // ...
  }
}
```

---

## Variante 1: Hook Puramente Local

Sem fetch, sem dependência externa. Apenas estado e cálculos sobre dados passados como argumento.

```typescript
// src/hooks/useCarrinhoLocal.ts
import { useState, useMemo, useCallback } from 'react'
import type { Produto } from '@/types/produto'

export interface UseCarrinhoLocalReturn {
  itens: Map<string, { produto: Produto; quantidade: number }>
  totalItens: number
  totalValor: number
  adicionar: (produto: Produto) => void
  remover: (produtoId: string) => void
  alterarQuantidade: (produtoId: string, quantidade: number) => void
  limpar: () => void
}

export function useCarrinhoLocal(): UseCarrinhoLocalReturn {
  const [itens, setItens] = useState<Map<string, { produto: Produto; quantidade: number }>>(
    new Map()
  )

  const totalItens = useMemo(
    () => Array.from(itens.values()).reduce((soma, item) => soma + item.quantidade, 0),
    [itens]
  )

  const totalValor = useMemo(
    () =>
      Array.from(itens.values()).reduce(
        (soma, item) => soma + item.produto.preco * item.quantidade,
        0
      ),
    [itens]
  )

  const adicionar = useCallback((produto: Produto) => {
    setItens(prev => {
      const novo = new Map(prev)
      const existente = novo.get(produto.id)
      novo.set(produto.id, {
        produto,
        quantidade: existente ? existente.quantidade + 1 : 1,
      })
      return novo
    })
  }, [])

  const remover = useCallback((produtoId: string) => {
    setItens(prev => {
      const novo = new Map(prev)
      novo.delete(produtoId)
      return novo
    })
  }, [])

  const alterarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      remover(produtoId)
      return
    }
    setItens(prev => {
      const existente = prev.get(produtoId)
      if (!existente) return prev
      const novo = new Map(prev)
      novo.set(produtoId, { ...existente, quantidade })
      return novo
    })
  }, [remover])

  const limpar = useCallback(() => setItens(new Map()), [])

  return {
    itens,
    totalItens,
    totalValor,
    adicionar,
    remover,
    alterarQuantidade,
    limpar,
  }
}
```

Sem fetch, sem service. Apenas lógica de estado local.

---

## Variante 2: Hook que Consome Service

Padrão isolado: hook não chama `fetch` direto; chama camada `services/` ou `api/`.

```typescript
// src/hooks/useListaProdutos.ts
import { useState, useEffect, useCallback } from 'react'
import { produtoService } from '@/services/produtoService'
import type { Produto, FiltroProduto } from '@/types/produto'

export interface UseListaProdutosParams {
  filtroInicial?: FiltroProduto
}

export interface UseListaProdutosReturn {
  produtos: Produto[]
  carregando: boolean
  erro: string | null
  filtro: FiltroProduto
  setFiltro: (filtro: FiltroProduto) => void
  recarregar: () => Promise<void>
}

export function useListaProdutos({
  filtroInicial = {},
}: UseListaProdutosParams): UseListaProdutosReturn {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroProduto>(filtroInicial)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const lista = await produtoService.listar(filtro)
      setProdutos(lista)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar produtos')
    } finally {
      setCarregando(false)
    }
  }, [filtro])

  useEffect(() => {
    carregar()
  }, [carregar])

  return {
    produtos,
    carregando,
    erro,
    filtro,
    setFiltro,
    recarregar: carregar,
  }
}
```

**Pontos importantes:**

- `produtoService` mora em `services/` ou `api/` — hook não conhece detalhes do `fetch`
- Mudança em `filtro` re-dispara carregamento via `useEffect`
- `recarregar` é exposto para reuso manual (botão "tentar novamente")

---

## Variante 3: Hook Composto

Quando o estado da page tem áreas distintas (filtros, paginação, seleção), divida em sub-hooks e componha.

```typescript
// src/hooks/usePaginaListagem.ts
import { useFiltros } from './useFiltros'
import { usePaginacao } from './usePaginacao'
import { useSelecao } from './useSelecao'

export function usePaginaListagem(produtoId: string) {
  const filtros = useFiltros()
  const paginacao = usePaginacao({ tamanho: 20 })
  const selecao = useSelecao()

  return {
    filtros,
    paginacao,
    selecao,
  }
}
```

E a page consome:

```tsx
function PaginaListagem() {
  const vm = usePaginaListagem(produtoId)

  return (
    <>
      <FiltrosBar
        valores={vm.filtros.valores}
        onChange={vm.filtros.alterar}
      />
      <Paginador
        atual={vm.paginacao.pagina}
        total={vm.paginacao.totalPaginas}
        onMudar={vm.paginacao.ir}
      />
      <ListaItens
        selecionados={vm.selecao.itens}
        onSelecionar={vm.selecao.alternar}
      />
    </>
  )
}
```

Cada sub-hook é **pequeno e testável independentemente**. Composição mantém clareza.

**Quando NÃO compor:**

- Se sub-hooks **precisam** se comunicar (estado de um afeta outro), composição vira pesadelo
- Se há apenas 2-3 estados simples, hook único é melhor

---

## Testes para Hook de Feature

Use `renderHook` do Testing Library:

```typescript
// src/hooks/useCarrinhoLocal.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarrinhoLocal } from './useCarrinhoLocal'

const produto1 = { id: '1', nome: 'Café', preco: 25 }
const produto2 = { id: '2', nome: 'Chá', preco: 15 }

describe('useCarrinhoLocal', () => {
  it('inicia vazio', () => {
    const { result } = renderHook(() => useCarrinhoLocal())
    expect(result.current.itens.size).toBe(0)
    expect(result.current.totalItens).toBe(0)
    expect(result.current.totalValor).toBe(0)
  })

  it('adiciona produto novo', () => {
    const { result } = renderHook(() => useCarrinhoLocal())

    act(() => {
      result.current.adicionar(produto1)
    })

    expect(result.current.itens.size).toBe(1)
    expect(result.current.totalItens).toBe(1)
    expect(result.current.totalValor).toBe(25)
  })

  it('adicionar produto existente incrementa quantidade', () => {
    const { result } = renderHook(() => useCarrinhoLocal())

    act(() => {
      result.current.adicionar(produto1)
      result.current.adicionar(produto1)
    })

    expect(result.current.itens.size).toBe(1)
    expect(result.current.totalItens).toBe(2)
    expect(result.current.totalValor).toBe(50)
  })

  it('alterarQuantidade(0) remove o item', () => {
    const { result } = renderHook(() => useCarrinhoLocal())

    act(() => {
      result.current.adicionar(produto1)
    })

    act(() => {
      result.current.alterarQuantidade(produto1.id, 0)
    })

    expect(result.current.itens.size).toBe(0)
  })

  it('limpar zera tudo', () => {
    const { result } = renderHook(() => useCarrinhoLocal())

    act(() => {
      result.current.adicionar(produto1)
      result.current.adicionar(produto2)
    })

    act(() => {
      result.current.limpar()
    })

    expect(result.current.itens.size).toBe(0)
    expect(result.current.totalValor).toBe(0)
  })
})
```

### Testando Hook que Consome Service

Mocke o service para testar o hook isoladamente:

```typescript
// src/hooks/useListaProdutos.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useListaProdutos } from './useListaProdutos'
import { produtoService } from '@/services/produtoService'

vi.mock('@/services/produtoService', () => ({
  produtoService: {
    listar: vi.fn(),
  },
}))

describe('useListaProdutos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega produtos ao montar', async () => {
    const produtosFalsos = [
      { id: '1', nome: 'A', preco: 10 },
      { id: '2', nome: 'B', preco: 20 },
    ]
    vi.mocked(produtoService.listar).mockResolvedValueOnce(produtosFalsos)

    const { result } = renderHook(() => useListaProdutos({}))

    expect(result.current.carregando).toBe(true)

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.produtos).toEqual(produtosFalsos)
    expect(produtoService.listar).toHaveBeenCalledOnce()
  })

  it('exibe erro quando service falha', async () => {
    vi.mocked(produtoService.listar).mockRejectedValueOnce(new Error('falhou'))

    const { result } = renderHook(() => useListaProdutos({}))

    await waitFor(() => {
      expect(result.current.erro).toBe('falhou')
    })

    expect(result.current.produtos).toEqual([])
  })
})
```

---

## Mini-FAQ

**1. Onde mora o hook de feature?** `src/hooks/` é o lugar padrão. Para projetos grandes, pode colocar junto da page (`src/pages/PaginaX/useX.ts`). Convenção do projeto vence.

**2. Posso retornar 15 coisas no hook?** Tecnicamente sim, mas é sintoma de hook fazendo demais. Considere dividir em sub-hooks (variante 3). Se realmente precisa, ok — mas reflita antes.

**3. Quando uso `useCallback` vs função normal?** `useCallback` quando o handler é passado como prop para componente memoizado, ou usado em dependências de `useEffect`/`useMemo`. Para handler usado só uma vez no JSX da própria page, função normal serve.

**4. Quando uso `useMemo`?** Para cálculos **caros** que dependem de poucos valores. Cálculo trivial (`a + b`) não precisa. Filtrar lista de 10 itens não precisa. Filtrar lista de 10.000 itens precisa.

**5. Hook pode ter `useEffect` para derivação?** Não. Derivação é cálculo direto ou `useMemo`. `useEffect` para `setState` de derivado é anti-padrão. Detalhes em [módulo 12](https://claude.ai/padroes/12-react-e-estado.md).

**6. E se o hook precisa de Context?** Pode consumir Context interno se for parte da feature (ex: tema, autenticação). Mas evite Context só para "evitar passar prop" — explícito é melhor.

**7. Como nomear o retorno na page?** `const vm = useDetalhamento(...)`. Convenção: `vm` = view model. Curto e claro. Algumas pessoas usam `state` ou nomes específicos — qualquer escolha consistente serve.

**8. Posso testar a page em vez de testar o hook?** Pode, mas é mais caro. Testar o hook diretamente com `renderHook` é mais rápido e isolado. Teste a page para fluxos integrados; teste o hook para lógica.

**9. Hook pode importar componente?** Não. Hook é lógica, não JSX. Se você quer "componente pronto", virou componente, não hook.

**10. Quantos `useState` é muito?** Regra empírica: 3-4 ok. 5-7 considere `useReducer` ou divisão em sub-hooks. 8+ está fazendo demais — divida.

---

## 🔗 Templates e Módulos Relacionados

- [`../padroes/12-react-e-estado.md`](https://claude.ai/padroes/12-react-e-estado.md) — Padrões de estado React (base deste template)
- [`../padroes/11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Onde mora cada tipo de hook
- [`../padroes/15-testes.md`](https://claude.ai/padroes/15-testes.md) — Testes detalhados, incluindo de hooks
- [`35-componente-ui.md`](https://claude.ai/chat/35-componente-ui.md) — Template do componente UI que este hook alimenta
- [`../processos/24-figma-para-codigo.md`](https://claude.ai/processos/24-figma-para-codigo.md) — Ordem de implementação (hook antes da page)
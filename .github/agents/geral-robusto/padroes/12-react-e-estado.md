---
description: "Padrões React: estado local vs global, hooks de feature, memoização, useEffect, composição, estado global."
modulo: "12"
categoria: "padroes"
versao: "1.0"
relacionado:
  - "11-arquitetura-e-pastas.md"
  - "13-ui-e-design-system.md"
  - "14-formularios-e-validacao.md"
  - "15-testes.md"
---

# ⚛️ React e Estado

> A pergunta mais importante de qualquer aplicação React não é _"como renderizar?"_. É: **"onde mora este estado e quem pode mudá-lo?"** Decidir errado aqui gera bugs invisíveis que se acumulam por meses.

---

## 1. Princípio Fundamental: Estado Mora no Lugar Mais Baixo Possível

Estado tem **escopo de visibilidade**, igual variável em qualquer linguagem. A regra de ouro:

> **Comece local. Eleve apenas quando provar a necessidade.**

### 1.1 As Quatro Camadas de Estado

|Camada|Onde mora|Quando usar|
|---|---|---|
|**Local**|`useState` no próprio componente|Ninguém mais precisa saber. Ex: hover, expansão de accordion.|
|**Elevado**|`useState` no pai comum|Dois irmãos precisam coordenar. Ex: form com botão Salvar.|
|**Feature**|Hook customizado (`useDetalhamento`)|Lógica complexa, vários componentes da mesma feature.|
|**Global**|Context + useReducer ou Zustand|Atravessa páginas inteiras. Ex: usuário logado, tema.|

### 1.2 O Anti-Padrão Mais Comum

Iniciantes-intermediários tendem a colocar tudo em Context global "porque pode precisar depois". **Não faça isso.** Custos:

- Re-renders em massa quando qualquer pedaço muda
- Difícil de testar (precisa montar o Provider)
- Impossível de remover depois sem refatoração grande
- Acopla componentes que deveriam ser independentes

**Eleve apenas quando a dor de não elevar for maior que a dor de elevar.**

### 1.3 Como Decidir

```
Tenho um estado novo. Onde colocar?
│
├─ Só este componente usa?
│   └─► useState local
│
├─ Componentes irmãos precisam coordenar?
│   └─► Elevar para o pai comum
│
├─ Vários componentes da mesma feature compartilham + tem lógica complexa?
│   └─► Hook customizado (useFeature)
│
└─ Componentes não-relacionados em rotas diferentes precisam?
    └─► Estado global (Context ou Zustand)
```

---

## 2. `useState` vs `useReducer`

### 2.1 Quando `useState`

- Estado simples (string, number, boolean)
- Estado independente (mudança de um não afeta outro)
- Você consegue descrever a próxima atualização com 1 setter

```typescript
const [nome, setNome] = useState('')
const [idade, setIdade] = useState(0)
const [ativo, setAtivo] = useState(false)
```

### 2.2 Quando `useReducer`

- Estado composto (objeto com várias chaves)
- Transições têm regras (não pode passar de A para C direto)
- Você se pega chamando 3+ setters seguidos
- Quer testar a lógica de transição isoladamente

```typescript
type Estado = {
  perfil: Perfil | null
  carregando: boolean
  erro: string | null
}

type Acao =
  | { tipo: 'INICIAR_CARGA' }
  | { tipo: 'CARGA_OK'; perfil: Perfil }
  | { tipo: 'CARGA_ERRO'; mensagem: string }

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'INICIAR_CARGA':
      return { ...estado, carregando: true, erro: null }
    case 'CARGA_OK':
      return { perfil: acao.perfil, carregando: false, erro: null }
    case 'CARGA_ERRO':
      return { ...estado, carregando: false, erro: acao.mensagem }
  }
}

const [estado, dispatch] = useReducer(reducer, estadoInicial)
```

### 2.3 Vantagens do Reducer

- **Transições explícitas.** Cada ação tem um nome - você lê o código e entende o fluxo.
- **Testável.** O reducer é função pura. Testa sem montar React.
- **Sem inconsistência intermediária.** A atualização de várias chaves é atômica.

### 2.4 Quando NÃO Usar Reducer

- Estado simples com 1-2 campos
- Sem regras de transição
- Componente pequeno

A regra é: **comece com `useState`. Migre para `useReducer` quando a complexidade aparecer.**

---

## 3. O Padrão de Hook de Feature

Este é o padrão mais usado neste pacote. Sempre que uma page tem lógica não-trivial, ela vai para um hook.

### 3.1 Estrutura Padrão

```typescript
// src/hooks/useDetalhamento.ts
import { useState, useCallback, useMemo } from 'react'
import type { Filtros, ItemDetalhamento } from '@/types/detalhamento'
import { calcularTotal } from '@/utils/calculos'

export function useDetalhamento() {
  // 1. ESTADO LOCAL
  const [filtros, setFiltros] = useState<Filtros>({})
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})

  // 2. DERIVAÇÕES (useMemo)
  const totalFiltrado = useMemo(
    () => calcularTotal(filtros),
    [filtros]
  )

  const temFiltroAtivo = useMemo(
    () => Object.values(filtros).some(Boolean),
    [filtros]
  )

  // 3. HANDLERS (useCallback quando passado a filhos memoizados)
  const alternarFiltro = useCallback((id: string) => {
    setFiltros(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const alternarExpansao = useCallback((id: string) => {
    setExpandido(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const limparFiltros = useCallback(() => {
    setFiltros({})
  }, [])

  // 4. INTERFACE MÍNIMA - só o que o JSX precisa
  return {
    filtros,
    expandido,
    totalFiltrado,
    temFiltroAtivo,
    alternarFiltro,
    alternarExpansao,
    limparFiltros,
  }
}
```

### 3.2 Análise Linha por Linha

**Por que essa ordem?** Estado → derivações → handlers → interface. É a ordem em que você **pensa** quando lê o código.

**Por que `useMemo` para `totalFiltrado`?** Porque é cálculo derivado. Sem `useMemo`, recalcularia a cada render mesmo quando `filtros` não mudou. Com lista grande, isso é caro.

**Por que `useCallback` nos handlers?** Porque eles vão ser passados como prop para componentes filhos. Sem `useCallback`, cada render do hook gera referências novas, quebrando memoização dos filhos.

**Por que retornar objeto e não array?** Objeto permite desestruturar só o que cada componente usa, sem ordem importar. Array faz sentido em hooks com 2-3 valores (como `useState`), não em hooks de feature.

### 3.3 Regras do Hook de Feature

|Regra|Por quê|
|---|---|
|Um hook por feature|Cada feature tem seu próprio escopo|
|Retornar objeto com nomes claros|Desestruturação seletiva, autoexplicativo|
|Não conter JSX|Hook é lógica, JSX é componente|
|Não acessar storage diretamente|Use `services/`|
|Não acessar API diretamente|Use `services/`|
|Pode usar outros hooks|É composição natural|

### 3.4 Quando Quebrar em Vários Hooks

Se o hook chega a 100+ linhas ou tem responsabilidades distintas:

```typescript
// ❌ Hook gigante
function usePagina() {
  // estado de filtros (40 linhas)
  // estado de paginação (30 linhas)
  // estado de seleção (30 linhas)
}

// ✅ Hooks compostos
function useFiltros() { /* ... */ }
function usePaginacao() { /* ... */ }
function useSelecao() { /* ... */ }

function usePagina() {
  const filtros = useFiltros()
  const paginacao = usePaginacao()
  const selecao = useSelecao()
  return { filtros, paginacao, selecao }
}
```

---

## 4. O Padrão de Page Limpa

Pages **compõem**. Hooks **fazem**.

### 4.1 Exemplo Completo

```tsx
// src/pages/PaginaDetalhamento.tsx
import { useDetalhamento } from '@/hooks/useDetalhamento'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { CartaoTotal } from '@/components/detalhamento/CartaoTotal'
import { FiltrosBar } from '@/components/detalhamento/FiltrosBar'
import { ListaItens } from '@/components/detalhamento/ListaItens'

export function PaginaDetalhamento() {
  const vm = useDetalhamento()

  // Early returns para estados especiais
  if (vm.carregando) return <CarregandoSpinner />
  if (vm.erro) return <MensagemErro erro={vm.erro} />
  if (!vm.dados) return <EstadoVazio mensagem="Nenhum dado encontrado." />

  // Composição pura
  return (
    <div className="px-4 py-4 space-y-3">
      <CartaoTotal total={vm.totalFiltrado} />
      <FiltrosBar
        filtros={vm.filtros}
        onAlternar={vm.alternarFiltro}
        onLimpar={vm.limparFiltros}
      />
      <ListaItens
        itens={vm.dados}
        expandido={vm.expandido}
        onAlternar={vm.alternarExpansao}
      />
    </div>
  )
}
```

### 4.2 Por Que `vm`?

`vm` = view model. É o nome convencional para a "instância" retornada por um hook de feature. Algumas alternativas usam o nome da feature (`const detalhamento = useDetalhamento()`) - funciona também. O importante é **ter um nome único** e usar consistentemente.

### 4.3 Sinais de Page Suja

Se a sua page tem qualquer destes, refatore:

- 2+ `useState` direto na page
- Função local com lógica de negócio
- `useEffect` que não é apenas trigger de scroll/foco
- Cálculo que precisa de `useMemo`
- Mais de 1 import de `utils/`

Quando algum aparece: **extraia para um hook de feature.**

---

## 5. `useMemo` e `useCallback`

A confusão mais frequente: _"devo memoizar tudo?"_. **Não.** Memoização tem custo (comparação de dependências), então só use quando o benefício compensa.

### 5.0 Por Que o Hook de Feature Memoiza e o Componente Não Precisa

Você pode ter notado: o padrão de hook (seção 3) usa `useMemo` e `useCallback` em quase tudo. Parece contradizer a regra "comece sem memoizar". Não é contradição - são contextos diferentes:

|Contexto|Comportamento|Por quê|
|---|---|---|
|**Hook compartilhado** (`useDetalhamento`, `usePerfil`)|Memoiza por padrão|Você **não sabe** quem vai consumir. Filhos memoizados podem aparecer depois. Estabilidade de referência é contrato.|
|**Componente específico** (`PaginaDetalhamento`)|Não memoiza por padrão|Você **sabe** exatamente quem usa. Adiciona `useMemo` só se o profiler indicar problema.|

Em outras palavras: **memoização em hook é defensiva, memoização em componente é otimização**. As regras abaixo se aplicam a componentes - para o hook, a seção 3 já mostrou o padrão.

### 5.1 Quando `useMemo` Vale a Pena

- Cálculo caro (ordenar lista grande, filtrar, agregar)
- Valor é referência (objeto, array) e é passado como prop a filho memoizado
- Cálculo derivado que você usaria em vários lugares no JSX

```typescript
// ✅ Vale - cálculo derivado de filtros
const itensFiltrados = useMemo(
  () => itens.filter(i => filtros[i.tipo]),
  [itens, filtros]
)

// ✅ Vale - referência estável de objeto passado a filho memoizado
const configMapa = useMemo(
  () => ({ zoom: 12, centro: [lat, lng] }),
  [lat, lng]
)
```

### 5.2 Quando `useMemo` NÃO Vale

- Valor primitivo (string, number, boolean)
- Cálculo trivial (soma, concatenação)
- Não é passado a filho memoizado

```typescript
// ❌ Inútil - primitivo é comparado por valor naturalmente
const total = useMemo(() => a + b, [a, b])

// ✅ Direto
const total = a + b
```

### 5.3 Quando `useCallback` Vale a Pena

Só quando o handler é passado para:

- Componente filho memoizado com `React.memo`
- Dependência de `useEffect` em outro hook
- Componente que faz comparação de identidade (raro)

```typescript
// ✅ Vale - passado a filho memoizado
const handleClick = useCallback(() => {
  setContador(c => c + 1)
}, [])

return <ListaMemoizada onClick={handleClick} />
```

### 5.4 Quando `useCallback` NÃO Vale

- Handler usado só no próprio componente
- Filho não memoizado
- Handler trivial (re-criar não custa nada)

```typescript
// ❌ Inútil - só usado aqui mesmo
const handleClick = useCallback(() => {
  setAberto(true)
}, [])
return <button onClick={handleClick}>Abrir</button>

// ✅ Direto
return <button onClick={() => setAberto(true)}>Abrir</button>
```

### 5.5 Regra Prática

> **Em componentes:** comece sem memoizar. Adicione `useMemo`/`useCallback` quando o profiler do React mostrar um problema real.
> 
> **Em hooks compartilhados:** memoize por padrão. É contrato de estabilidade para consumidores que você não controla.

Memoização prematura em componentes é otimização prematura - adiciona complexidade sem benefício comprovado. Memoização em hook é proteção contra regressões silenciosas.

---

## 6. `useEffect` - Quando Usar (Pouco) e Quando NÃO Usar (Quase Sempre)

`useEffect` é o hook mais mal-usado do React. Regra: **se não é sincronização com o mundo externo, provavelmente não é `useEffect`.**

### 6.1 Quando `useEffect` É Necessário

- **Sincronização com APIs do browser:** scroll, focus, title, manipulação direta de DOM
- **Subscrição a eventos externos:** WebSocket, EventSource, listeners de window
- **Integração com bibliotecas não-React:** chart libs, mapas, animações imperativas
- **Cleanup imperativo:** cancelar timers, fechar conexões

```typescript
// ✅ Sincronização com title da página
useEffect(() => {
  document.title = `${nome} - MeuApp`
}, [nome])

// ✅ Subscrição com cleanup
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') fechar()
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [fechar])
```

### 6.2 Quando `useEffect` É Errado

#### Erro 1: Derivar estado

```typescript
// ❌ Errado
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(a + b)
}, [a, b])

// ✅ Certo
const total = a + b
```

#### Erro 2: Reagir a eventos do usuário

```typescript
// ❌ Errado
useEffect(() => {
  if (botaoClicado) {
    enviarFormulario()
  }
}, [botaoClicado])

// ✅ Certo - chame direto no handler
const handleClick = () => {
  enviarFormulario()
}
```

#### Erro 3: Buscar dados (em projetos novos)

Em projetos modernos, use **React Query** ou **SWR** em vez de `useEffect` para fetch:

```typescript
// ❌ Padrão antigo
useEffect(() => {
  setCarregando(true)
  fetch('/api/perfil')
    .then(r => r.json())
    .then(setPerfil)
    .finally(() => setCarregando(false))
}, [])

// ✅ Padrão moderno (com React Query)
const { data: perfil, isLoading } = useQuery({
  queryKey: ['perfil'],
  queryFn: () => fetch('/api/perfil').then(r => r.json())
})
```

`useEffect` para fetch é aceitável em projetos pequenos sem React Query, mas saiba que está usando padrão antigo.

#### Erro 4: Inicializar estado

```typescript
// ❌ Errado - inicializa depois do primeiro render
const [valor, setValor] = useState(0)
useEffect(() => {
  setValor(calcularInicial())
}, [])

// ✅ Certo - inicialização preguiçosa
const [valor, setValor] = useState(() => calcularInicial())
```

### 6.3 Teste Mental

Antes de escrever um `useEffect`, pergunte: _"isso está sincronizando algo do React com o mundo externo?"_. Se a resposta é **não**, provavelmente está errado.

---

## 7. Estado Global: Context + useReducer vs Zustand

Há três opções principais para estado global. Critério de escolha:

|Opção|Quando usar|
|---|---|
|**Context + useState/useReducer**|Estado simples ou estado complexo de 1 domínio. Sem dependência externa.|
|**Zustand**|Estado de múltiplos domínios. API simples. Sem boilerplate.|
|**Redux Toolkit**|Time grande com necessidade de devtools, time-travel, padronização rígida.|

### 7.1 Padrão Context + useReducer

```typescript
// src/context/PerfilContext.tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Perfil } from '@/types/perfil'

// 1. TIPOS
type Estado = {
  perfil: Perfil | null
  carregando: boolean
}

type Acao =
  | { tipo: 'CARREGAR' }
  | { tipo: 'DEFINIR_PERFIL'; perfil: Perfil }
  | { tipo: 'LIMPAR' }

// 2. REDUCER
function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'CARREGAR':
      return { ...estado, carregando: true }
    case 'DEFINIR_PERFIL':
      return { perfil: acao.perfil, carregando: false }
    case 'LIMPAR':
      return { perfil: null, carregando: false }
  }
}

// 3. CONTEXTO
type ContextoPerfil = {
  perfil: Perfil | null
  carregando: boolean
  carregar: () => void
  definir: (perfil: Perfil) => void
  limpar: () => void
}

const PerfilContext = createContext<ContextoPerfil | null>(null)

// 4. PROVIDER
export function PerfilProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, {
    perfil: null,
    carregando: false,
  })

  const valor: ContextoPerfil = {
    ...estado,
    carregar: () => dispatch({ tipo: 'CARREGAR' }),
    definir: perfil => dispatch({ tipo: 'DEFINIR_PERFIL', perfil }),
    limpar: () => dispatch({ tipo: 'LIMPAR' }),
  }

  return <PerfilContext.Provider value={valor}>{children}</PerfilContext.Provider>
}

// 5. HOOK CONSUMIDOR
export function usePerfil() {
  const ctx = useContext(PerfilContext)
  if (!ctx) {
    throw new Error('usePerfil deve ser usado dentro de PerfilProvider')
  }
  return ctx
}
```

### 7.2 Análise do Padrão

**Por que expor hook em vez do contexto direto?**

- Centraliza a verificação de Provider ausente
- Permite mudar a implementação (de Context para Zustand) sem mudar consumidores
- Padroniza o nome da chamada: `usePerfil()` em todo lugar

**Por que reducer em vez de useState?**

- Estado tem 2 chaves correlacionadas (perfil + carregando)
- Transições têm regras (carregando vira false quando perfil define)
- Testável isoladamente

**Por que jogar erro se Provider está ausente?**

- Falha alta e barulhenta em dev
- Em prod, evita bug silencioso de "valor undefined em vez do estado real"

### 7.3 Padrão Zustand

Quando a complexidade aumenta, Zustand é menos verboso:

```typescript
// src/stores/perfilStore.ts
import { create } from 'zustand'
import type { Perfil } from '@/types/perfil'

type PerfilStore = {
  perfil: Perfil | null
  carregando: boolean
  carregar: () => void
  definir: (perfil: Perfil) => void
  limpar: () => void
}

export const usePerfilStore = create<PerfilStore>(set => ({
  perfil: null,
  carregando: false,
  carregar: () => set({ carregando: true }),
  definir: perfil => set({ perfil, carregando: false }),
  limpar: () => set({ perfil: null }),
}))

// Uso no componente
function MeuComponente() {
  const perfil = usePerfilStore(s => s.perfil)
  const definir = usePerfilStore(s => s.definir)
  // ...
}
```

### 7.4 Comparação

|Critério|Context + useReducer|Zustand|
|---|---|---|
|Setup|Mais código|Menos código|
|Dependência externa|Nenhuma|`zustand` (3kb)|
|Re-renders|Provider re-renderiza tudo|Seletores granulares|
|Curva de aprendizado|Média (precisa entender Context, Reducer)|Baixa|
|Testabilidade|Boa (reducer puro)|Boa (store é função)|
|DevTools|Manual|Plugin oficial|

### 7.5 Recomendação para Projetos Pequenos/Médios

- **1 domínio global:** Context + useReducer
- **2-3 domínios:** Context + useReducer ainda funciona, ou comece com Zustand
- **4+ domínios:** Zustand
- **Estado de servidor (cache de API):** React Query (não use Context para isso)

---

## 8. Como Evitar Prop Drilling Sem Cair em Estado Global

**Prop drilling** = passar prop através de 3+ camadas de componentes só para chegar no neto.

Iniciantes resolvem com Context global. **Existe alternativa melhor: composição.**

### 8.1 Problema Típico

```tsx
// ❌ Prop drilling
function PaginaPerfil() {
  const [usuario, setUsuario] = useState(null)
  return <Layout usuario={usuario} />
}

function Layout({ usuario }) {
  return (
    <>
      <Header usuario={usuario} />
      <Conteudo usuario={usuario} />
    </>
  )
}

function Header({ usuario }) {
  return <Avatar usuario={usuario} />
}

function Avatar({ usuario }) {
  return <img src={usuario.foto} />
}
```

### 8.2 Solução 1: Composição via Children

```tsx
// ✅ Layout aceita children, página passa Header pronto
function PaginaPerfil() {
  const [usuario, setUsuario] = useState(null)
  return (
    <Layout
      header={<Header><Avatar usuario={usuario} /></Header>}
      conteudo={<Conteudo usuario={usuario} />}
    />
  )
}

function Layout({ header, conteudo }) {
  return (
    <>
      {header}
      {conteudo}
    </>
  )
}
```

Agora `Layout` não precisa saber nada de `usuario`. O prop drilling some.

### 8.3 Solução 2: Context Local (não global)

Para domínios que naturalmente atravessam várias camadas (form, accordion), use Context **localizado** na feature:

```tsx
// src/components/form/FormContext.tsx
const FormContext = createContext(null)

export function Form({ children, onSubmit }) {
  const [valores, setValores] = useState({})
  return (
    <FormContext.Provider value={{ valores, setValores }}>
      <form onSubmit={onSubmit}>{children}</form>
    </FormContext.Provider>
  )
}

export function Campo({ nome }) {
  const { valores, setValores } = useContext(FormContext)
  return (
    <input
      value={valores[nome] ?? ''}
      onChange={e => setValores(v => ({ ...v, [nome]: e.target.value }))}
    />
  )
}

// Uso
<Form onSubmit={salvar}>
  <Campo nome="email" />
  <Campo nome="senha" />
</Form>
```

**A regra é:** Context é ótima ferramenta quando o escopo é claro (este formulário, este accordion). Vira problema quando vira "estado global do app".

---

## 9. Padrões de Composição

### 9.1 Children - Padrão Mais Simples

```tsx
function Card({ children }: { children: ReactNode }) {
  return <div className="border rounded p-4">{children}</div>
}

<Card>
  <h2>Título</h2>
  <p>Conteúdo</p>
</Card>
```

Use quando o pai não precisa controlar o que o filho renderiza.

### 9.2 Slots - Múltiplas Áreas Nomeadas

```tsx
function CardComplexo({
  header,
  body,
  footer,
}: {
  header?: ReactNode
  body: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="border rounded">
      {header && <div className="border-b p-2">{header}</div>}
      <div className="p-4">{body}</div>
      {footer && <div className="border-t p-2">{footer}</div>}
    </div>
  )
}

<CardComplexo
  header={<h2>Título</h2>}
  body={<p>Conteúdo</p>}
  footer={<Botao>Salvar</Botao>}
/>
```

Use quando há múltiplas áreas, cada uma com conteúdo distinto.

### 9.3 Render Props - Controle Total

```tsx
function ListaCarregavel<T>({
  url,
  renderItem,
}: {
  url: string
  renderItem: (item: T) => ReactNode
}) {
  const { data, isLoading } = useQuery({ /* ... */ })
  if (isLoading) return <Spinner />
  return <ul>{data?.map(renderItem)}</ul>
}

<ListaCarregavel<Perfil>
  url="/api/perfis"
  renderItem={perfil => <li key={perfil.id}>{perfil.nome}</li>}
/>
```

Use quando o componente cuida da lógica (loading, error) e o usuário decide como renderizar.

### 9.4 Quando Usar Qual

|Cenário|Padrão|
|---|---|
|1 área de conteúdo|`children`|
|2-5 áreas estruturais|Slots (props nomeadas)|
|Lógica + renderização variável|Render prop|
|Layout complexo extensível|Children + slots combinados|

---

## 10. Padrões Prontos para Casos Comuns

### 10.1 Renderização de Lista

```tsx
function ListaPerfis({ perfis }: { perfis: Perfil[] }) {
  if (perfis.length === 0) {
    return <EstadoVazio mensagem="Nenhum perfil encontrado." />
  }

  return (
    <ul className="space-y-2">
      {perfis.map(perfil => (
        <li key={perfil.id}>
          <CardPerfil perfil={perfil} />
        </li>
      ))}
    </ul>
  )
}
```

**Pontos:**

- `key` é o ID estável (não o índice)
- Estado vazio explícito (não retorna lista vazia silenciosa)
- `<li>` envolve o item porque está em `<ul>` (acessibilidade)

### 10.2 Modal Controlado pelo Pai

```tsx
function Modal({
  aberto,
  onFechar,
  children,
}: {
  aberto: boolean
  onFechar: () => void
  children: ReactNode
}) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
         onClick={onFechar}>
      <div className="bg-white rounded p-4" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// Uso
function MinhaPage() {
  const [confirmando, setConfirmando] = useState(false)
  return (
    <>
      <Botao onClick={() => setConfirmando(true)}>Excluir</Botao>
      <Modal aberto={confirmando} onFechar={() => setConfirmando(false)}>
        <h2>Confirmar exclusão?</h2>
        <Botao onClick={confirmarExclusao}>Sim</Botao>
        <Botao onClick={() => setConfirmando(false)}>Não</Botao>
      </Modal>
    </>
  )
}
```

**Pontos:**

- Estado do modal mora no pai (quem abre, fecha)
- Modal não conhece nada do conteúdo (passa via `children`)
- Click no overlay fecha; click no conteúdo não propaga

### 10.3 Estado Compartilhado Entre Irmãos

```tsx
function PainelFiltros() {
  // Estado mora no pai comum
  const [filtros, setFiltros] = useState<Filtros>({})

  return (
    <>
      <FiltrosBar filtros={filtros} onChange={setFiltros} />
      <ListaResultados filtros={filtros} />
    </>
  )
}
```

Irmãos coordenam via pai. Sem Context, sem estado global. **Faça isso até a dor justificar elevação.**

---

## 11. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Onde colocar estado?|Mais baixo possível|
|`useState` ou `useReducer`?|useState até a complexidade pedir|
|Page com lógica?|Extrair para hook de feature|
|`useMemo` em tudo?|Não. Só quando profiler indicar|
|`useEffect` para tudo?|Não. Só para sincronização com mundo externo|
|Estado global desde já?|Não. Eleve quando a dor justificar|
|Context ou Zustand?|Context para 1 domínio, Zustand para vários|
|Prop drilling?|Composição com children/slots antes de Context|

---

## 🔗 Módulos Relacionados

- [`11-arquitetura-e-pastas.md`](./11-arquitetura-e-pastas.md) - Onde os arquivos deste módulo vivem
- [`13-ui-e-design-system.md`](./13-ui-e-design-system.md) - Como os componentes consumidos aqui são construídos
- [`14-formularios-e-validacao.md`](./14-formularios-e-validacao.md) - Padrão de form com hook + Zod
- [`15-testes.md`](./15-testes.md) - Como testar hooks e componentes
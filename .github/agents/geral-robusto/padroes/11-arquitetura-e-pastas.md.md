---

description: "Estrutura de pastas, onde cada coisa vive, regras de camadas e decisões de organização." modulo: "11" categoria: "padroes" versao: "1.0" relacionado:

- "10-codigo-e-convencoes.md"
- "12-react-e-estado.md"
- "17-backend-node.md"

---

# 🏛️ Arquitetura e Pastas

> Esta é a planta do edifício. Antes de construir um cômodo novo, você precisa saber onde fica. Uma boa arquitetura responde rápido: _"onde colocar este arquivo?"_ — e a resposta é sempre a mesma para o mesmo tipo de arquivo.

---

## 1. Princípio Fundamental: Camadas com Responsabilidades

Toda arquitetura aqui se baseia em **separar por responsabilidade**, não por tipo de arquivo. A pergunta nunca é _"é um .ts ou um .tsx?"_, mas sim _"esse código tem efeito colateral?"_, _"conhece o negócio?"_, _"é composição ou lógica?"_.

|Camada|Responsabilidade|Conhece o negócio?|Tem efeito colateral?|
|---|---|---|---|
|`types/`|Definir o vocabulário do domínio|Sim (define o que é o domínio)|Não|
|`utils/`|Cálculos e transformações puras|Pode|Não (jamais)|
|`services/`|Isolar APIs externas, storage, integrações|Pode|Sim (é o motivo de existir)|
|`hooks/`|Encapsular estado + comportamento de feature|Sim|Sim (estado do React)|
|`context/` ou `stores/`|Estado global compartilhado|Sim|Sim|
|`components/ui/`|Elementos visuais genéricos|**Não**|Não|
|`components/layout/`|Estrutura visual da aplicação|Mínimo|Não|
|`components/[dominio]/`|UI específica do negócio|Sim|Não (delega a hooks)|
|`pages/`|Composição de tudo acima|Sim (orquestra)|Não (delega)|

Memorize a coluna "conhece o negócio?" — é o critério mais usado para decidir entre `ui/` e `[dominio]/`.

---

## 2. Estrutura Padrão de `src/`

```
src/
├── types/                  # Tipos do domínio
│   ├── perfil.ts
│   └── pedido.ts
│
├── utils/                  # Funções puras (cálculos, formatação)
│   ├── calculos.ts
│   ├── formatters.ts
│   └── validadores.ts
│
├── services/               # APIs externas e storage
│   ├── perfilStorage.ts
│   ├── apiPedidos.ts
│   └── analytics.ts
│
├── context/                # Estado global (Context + useReducer)
│   ├── PerfilContext.tsx
│   └── PedidoContext.tsx
│
├── hooks/                  # Hooks de feature e de acesso a contexto
│   ├── usePerfil.ts
│   ├── useDetalhamento.ts
│   └── useFormulario.ts
│
├── components/
│   ├── ui/                 # Wrappers do design system (sem lógica de negócio)
│   │   ├── Botao.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/             # Header, Footer, NavBar, Sidebar
│   │   ├── Header.tsx
│   │   └── NavBar.tsx
│   └── perfil/             # Componentes de domínio (conhecem o negócio)
│       ├── CardPerfil.tsx
│       └── FormularioPerfil.tsx
│
├── pages/                  # Composição pura (foco em layout, lógica nos hooks)
│   ├── PaginaPerfil.tsx
│   └── PaginaDetalhamento.tsx
│
├── data/                   # Constantes e dados estáticos
│   ├── tiposVeiculo.ts
│   └── opcoesSeguro.ts
│
├── config/                 # Feature flags, env vars
│   └── env.ts
│
└── lib/                    # Configuração de bibliotecas (shadcn, etc.)
    └── utils.ts            # Função cn() do shadcn
```

### 2.1 Por Que Essa Estrutura

- **Plana, não profunda.** Tudo está no máximo 2 níveis abaixo de `src/`. Você não navega 5 pastas para encontrar um arquivo.
- **Categorias por responsabilidade.** Como definido no princípio 1.
- **Componentes agrupados por domínio.** `components/perfil/` reúne tudo que pertence ao perfil, em vez de espalhar.

### 2.2 Convenção: a pasta `lib/`

`lib/` existe especialmente para utilitários de **bibliotecas externas** (não do seu domínio). O caso mais comum é o `cn()` do shadcn/ui:

```typescript
// src/lib/utils.ts (vem com o shadcn)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Mantenha `lib/` apenas para isso. **Cálculos do seu domínio vão em `utils/`**, não em `lib/`.

---

## 3. Tabela de Decisão: Onde Cada Coisa Vive

Esta é a tabela mais consultada deste módulo. Quando estiver em dúvida, volte aqui.

|O que é|Onde vai|Regra|
|---|---|---|
|Tipo de uma entidade do domínio|`types/[entidade].ts`|Um arquivo por entidade ou agregado|
|Função pura de cálculo|`utils/calculos.ts`|Sem side effects, testável isoladamente|
|Função de formatação (moeda, data)|`utils/formatters.ts`|Centralizada, nunca inline|
|Função de validação|`utils/validadores.ts`|Pura. Validação assíncrona vai em `services/`|
|Acesso a API externa (fetch)|`services/api[Nome].ts`|Único ponto de acesso à API|
|Persistência local (localStorage, IndexedDB)|`services/[nome]Storage.ts`|Único ponto de acesso ao storage|
|Integração com terceiros (analytics, etc.)|`services/[nome].ts`|Isola o SDK externo|
|Estado global do app|`context/[Dominio]Context.tsx`|Um contexto por domínio|
|Hook que acessa contexto|`hooks/use[Dominio].ts`|Re-exporta o hook do contexto|
|Hook de feature local|`hooks/use[Feature].ts`|Um hook por feature de UI|
|Componente UI genérico|`components/ui/[Nome].tsx`|Zero lógica de negócio|
|Componente de layout|`components/layout/[Nome].tsx`|Header, Footer, NavBar|
|Componente que usa termos do negócio|`components/[dominio]/[Nome].tsx`|Conhece o negócio|
|Rota/Página|`pages/Pagina[Nome].tsx`|Composição, foco em layout|
|Constante de configuração|`config/[contexto].ts`|Env vars, feature flags|
|Dados estáticos (lista fixa)|`data/[nome].ts`|Constantes que parecem dados|
|Utilitário de biblioteca externa|`lib/[nome].ts`|Só para isso, não para domínio|

### 3.1 Como Usar a Tabela

Quando criar um arquivo novo:

1. Identifique a **responsabilidade primária** dele (calcular? exibir? persistir? compor?)
2. Localize a linha correspondente na tabela
3. Use o caminho indicado
4. Se nenhuma linha encaixa: **pergunte ao humano**, não invente pasta nova

---

## 4. Regras de Ouro da Arquitetura

São cinco. Não negociáveis.

### 4.1 Pages são para composição, não para lógica

```tsx
// ❌ Errado — page faz tudo
export function PaginaPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    fetch('/api/perfil')
      .then(r => r.json())
      .then(setPerfil)
      .finally(() => setCarregando(false))
  }, [])

  function salvar() { /* 30 linhas */ }
  function validar() { /* 20 linhas */ }
  // ... 200+ linhas
}

// ✅ Correto — page compõe, hook faz
export function PaginaPerfil() {
  const vm = usePerfil()

  if (vm.carregando) return <Carregando />
  if (!vm.perfil) return <EstadoVazio />

  return (
    <Layout>
      <CardPerfil perfil={vm.perfil} />
      <FormularioPerfil
        valor={vm.perfil}
        onSalvar={vm.salvar}
        onCancelar={vm.cancelar}
      />
    </Layout>
  )
}
```

### 4.2 Hooks encapsulam estado + handlers + derivações

Um hook de feature contém:

- Estado local (useState)
- Derivações (useMemo)
- Handlers (useCallback, ou função normal se não for passada para filho memoizado)
- Efeitos de sincronização (useEffect) — quando inevitáveis

Detalhes completos em [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md).

### 4.3 Serviços isolam efeitos colaterais

Tudo que toca o mundo externo (rede, storage, time, console, document, window) deve viver em `services/`. Componentes e hooks **consomem** serviços, **nunca** falam direto com o mundo.

**Por quê:** trocar implementação (de localStorage para IndexedDB, de fetch para axios, de mock para API real) vira mudança em 1 arquivo, não em 50.

### 4.4 UI components não conhecem o domínio

```tsx
// ❌ Errado — Botao com termo de negócio
<Botao onClick={comprarSeguro}>Comprar Seguro</Botao>
//      ^ ok          ^ texto: ok       texto: ok
// (o texto vem como filho, ok — o problema seria se o componente
// chamasse o handler "comprarSeguro" internamente)

// ❌ Errado — Botao com prop de negócio
<Botao acaoSeguro="comprar">Comprar</Botao>

// ✅ Correto — Botao é genérico, lógica fica fora
<Botao onClick={handleComprar} variante="primario">
  Comprar Seguro
</Botao>
```

Regra prática: o nome de qualquer prop de um componente em `ui/` deve fazer sentido em **outro projeto** (qualquer um). Se a prop só faz sentido neste projeto, ela é do domínio — o componente deve estar em `components/[dominio]/`.

### 4.5 Domain components conhecem o negócio

O oposto também é regra: componentes de domínio **devem** usar termos do negócio.

```tsx
// ✅ Correto — domínio na superfície
<CardPerfil perfil={perfil} onEditar={handleEditar} />
<FormularioPedido pedido={pedido} onConfirmar={handleConfirmar} />
```

Eles **podem** importar de `ui/`, **não podem** ser importados por `ui/`. A dependência só flui de domínio → UI, nunca o contrário.

---

## 5. A Confusão Mais Comum: `ui/` vs `layout/` vs `[dominio]/`

Esta é a dúvida que mais aparece. Use este fluxo:

```
Estou criando um componente. Onde colocar?
│
├─ Ele aparece em todas (ou quase todas) as páginas e estrutura o app?
│   (Header, Footer, NavBar, Sidebar, Container)
│   └─► components/layout/
│
├─ Ele é genérico e poderia existir em outro projeto sem modificação?
│   (Botao, Input, Card, Modal, Tabs)
│   └─► components/ui/
│
└─ Ele usa termos do negócio ou conhece regras do domínio?
    (CardPerfil, FormularioPedido, PainelEstimativa)
    └─► components/[dominio]/
```

### 5.1 Teste Mental: O Critério do Outro Projeto

Pergunte-se: _"esse componente, do jeito que está, faz sentido em outro projeto?"_

- **Sim** → `ui/` (ou `layout/` se for estrutural)
- **Não** → `[dominio]/`

### 5.2 Casos Limítrofes

|Componente|Onde vai|Por quê|
|---|---|---|
|`Botao` (genérico)|`ui/Botao.tsx`|Funciona em qualquer projeto|
|`BotaoSalvarPerfil`|❌ não existe|Use `<Botao onClick={salvar}>Salvar</Botao>` na page|
|`Card` (estrutura visual)|`ui/Card.tsx`|Genérico|
|`CardPerfil`|`components/perfil/CardPerfil.tsx`|Tem campos específicos do perfil|
|`Header`|`layout/Header.tsx`|Estrutura toda página|
|`NavBarUsuario`|`layout/NavBar.tsx`|Estrutura, e o conteúdo dela é dado por props|
|`Modal`|`ui/Modal.tsx`|Genérico|
|`ModalConfirmarExclusao`|❌ Use `<Modal>` + composição na page|Não crie modal específico por caso|

---

## 6. Tamanho de Pages: Diretriz, Não Regra Rígida

A versão antiga dizia "pages com menos de 60 linhas". Era rígido demais e gerava frustração. A nova diretriz:

> **Páginas devem ser predominantemente JSX de composição. Quando você sente que está escrevendo _lógica_ dentro de uma page, é hora de extrair para um hook.**

### 6.1 O Que Importa

|Bom (mesmo com 100 linhas)|Ruim (mesmo com 50 linhas)|
|---|---|
|100 linhas de JSX organizando componentes|50 linhas com `useState`, `useEffect` e funções de cálculo|
|Imports + composição + early returns|Lógica de validação + handlers complexos + estado misturado|

### 6.2 Sinais Para Extrair

- Você tem 2+ `useState` na page
- Tem um `useEffect` que não é apenas sincronização trivial
- Tem uma função local de 10+ linhas
- A page importa de `utils/` para fazer cálculos antes de renderizar

**Quando algum desses aparecer, extraia para um hook de feature** (ver [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md)).

### 6.3 Exceção

Pages de prototipagem ou MVP **podem** começar gordas. A regra se aplica no momento de estabilização — quando você nota que a page vai ficar (não é throwaway), refatore.

---

## 7. Quando Criar Pasta Nova

Você **não** precisa criar pasta para cada conceito. Sintomas que indicam que está na hora:

|Sintoma|Ação|
|---|---|
|Você tem 5+ arquivos em `components/[dominio]/`|OK, deixe assim|
|Você tem 10+ arquivos em `components/[dominio]/`|Considere subpastas por feature dentro do domínio|
|Você tem 3+ arquivos para uma feature específica que cruza domínios|Crie `features/[nome]/` (estrutura alternativa, ver 7.1)|
|Você quer separar "telas de admin" de "telas de usuário"|Crie subpasta em `pages/` (ex: `pages/admin/`)|

### 7.1 Estrutura por Feature (Alternativa)

Em projetos grandes, a estrutura pode evoluir de "por camada" para "por feature":

```
src/
├── features/
│   ├── perfil/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── pedido/
│       ├── components/
│       ├── hooks/
│       └── services/
└── shared/
    ├── components/ui/
    ├── utils/
    └── lib/
```

**Quando migrar para isso:** quando o projeto tem 5+ domínios e a estrutura plana começa a poluir. Para projetos pequenos a médios, **mantenha a estrutura plana**.

---

## 8. Aliases de Path

### 8.1 Configuração Padrão

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

`vite.config.ts`:

```typescript
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 8.2 Quando Usar `@/` vs Relativo

Regra revisitada do módulo 10:

|Use `@/` quando...|Use relativo quando...|
|---|---|
|Importando de `services/`, `hooks/`, `utils/`|Importando arquivo na mesma pasta|
|Cruzando domínios|Dentro da mesma feature|
|Em testes que importam código de produção|Em testes que importam helpers locais|

---

## 9. Estrutura Padrão de `docs/`

Esta seção define a **estrutura de documentação do projeto** — não do agente (que vive em `.agent/`).

```
docs/
├── contexto-projeto-ai.md          # Ponto de entrada para IA — link para outros docs
├── README.md                       # Visão geral do produto (para humanos)
│
├── requisitos/
│   ├── funcionais.md               # RFs com IDs e critérios de aceite
│   ├── regras-negocio.md           # RNs com invariantes
│   └── nao-funcionais.md           # RNFs (perf, acessibilidade, PWA)
│
├── dominios/
│   ├── glossario.md                # Linguagem ubíqua
│   ├── invariantes.md              # Regras invioláveis
│   ├── divida-tecnica.md           # Dívidas conscientes com gatilhos
│   └── modelagem/                  # Entidades, agregados, value objects
│
├── design/
│   ├── telas-navegacao.md          # Mapa de telas
│   └── fluxo-onboarding.md         # Fluxos específicos
│
├── arquitetura/
│   ├── visao-geral.md              # Estrutura de pastas (deste módulo)
│   ├── convencoes.md               # Resumo do módulo 10
│   ├── rotas.md                    # Lista de rotas
│   ├── componentes-ui.md           # Componentes shadcn instalados
│   ├── tema-tailwind.md            # Design tokens
│   ├── padrao-testes.md            # Setup de testes
│   ├── setup-inicial.md            # Como rodar o projeto
│   └── ADR/                        # Architecture Decision Records
│
└── tarefas/
    ├── pendentes.md
    ├── em-andamento.md
    └── concluidas/
```

### 9.1 Princípio: o código é a verdade primária

Repetindo o que está no núcleo: **docs não duplicam o código**. Eles contêm:

- O que o código não expressa (decisões, contexto, justificativas)
- Resumos para humanos navegarem
- Acordos com stakeholders

Se você está documentando algo que o código já mostra, está fazendo errado.

---

## 10. Como Evoluir a Estrutura

A estrutura proposta é o **ponto de partida**. Projetos vivos evoluem.

### 10.1 Mudanças Aceitáveis Sem ADR

- Adicionar arquivo dentro de pasta existente
- Criar subpasta de domínio (ex: `components/perfil/` quando aparece o domínio "perfil")
- Renomear arquivo (com refactor seguro)

### 10.2 Mudanças que Exigem ADR

- Mover de "por camada" para "por feature" (seção 7.1)
- Adicionar nova pasta de primeiro nível em `src/`
- Trocar padrão de roteamento ou estado global
- Migrar de Vite para Next.js, ou similar

Quando exigir ADR, ver [`templates/32-adr.md`](https://claude.ai/templates/32-adr.md).

---

## 11. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|É puro?|`utils/`|
|Tem efeito colateral?|`services/`|
|É estado + comportamento de uma feature?|`hooks/`|
|É estado global?|`context/`|
|É genérico, funciona em outro projeto?|`components/ui/`|
|Estrutura o layout geral?|`components/layout/`|
|Conhece o negócio?|`components/[dominio]/`|
|Compõe uma página inteira?|`pages/`|
|É só dado estático?|`data/`|
|É config/env?|`config/`|
|É util de biblioteca externa?|`lib/`|

---

## 🔗 Módulos Relacionados

- [`10-codigo-e-convencoes.md`](https://claude.ai/chat/10-codigo-e-convencoes.md) — Convenções de nomenclatura usadas aqui
- [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md) — Como construir hooks e components dentro dessa estrutura
- [`13-ui-e-design-system.md`](https://claude.ai/chat/13-ui-e-design-system.md) — Padrão dos componentes em `ui/`
- [`17-backend-node.md`](https://claude.ai/chat/17-backend-node.md) — Estrutura equivalente para backend
- [`../templates/32-adr.md`](https://claude.ai/templates/32-adr.md) — Quando mudar de estrutura
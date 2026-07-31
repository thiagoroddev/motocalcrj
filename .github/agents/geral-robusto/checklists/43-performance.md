---

description: "Checklist detalhado de performance. Core Web Vitals + verificações por área (React, bundle, imagens, network)." modulo: "43" categoria: "checklists" versao: "1.0" relacionado:

- "16-performance-acessibilidade.md"
- "40-revisao-rapida.md"

---

# ⚡ Checklist: Performance

> Lista acionável de verificações de performance para frontend SPA. Para conceitos e justificativas, ver [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md). Referenciado pelo [40-revisao-rapida.md](https://claude.ai/chat/40-revisao-rapida.md) quando a mudança envolve interface ou dados.

---

## Princípio: Medir Antes de Otimizar

> _"Premature optimization is the root of all evil."_ - Donald Knuth

Antes dos itens:

1. **Sem medição, não há problema real** - apenas suspeita.
2. **Otimização tem custo cognitivo.** Cada `memo` adiciona complexidade.
3. **Concentre-se em onde escala** (imagens, bundle, listas grandes - não em ganhar 0.5ms).
4. **Performance é proporcional** - app de 10 usuários, regra diferente de app de 1 milhão.

Se você está "otimizando" sem ter medido, **pare** e meça primeiro.

---

## Core Web Vitals

Métricas que o Google usa como sinal de SEO e que correspondem a percepção real do usuário:

|Métrica|O que mede|Meta (mobile)|Crítico se|
|---|---|---|---|
|**LCP** (Largest Contentful Paint)|Tempo até o maior elemento visível renderizar|< 2.5s|> 4s|
|**INP** (Interaction to Next Paint)|Tempo entre interação e resposta visível|< 200ms|> 500ms|
|**CLS** (Cumulative Layout Shift)|Quanto o layout "pula" durante carregamento|< 0.1|> 0.25|

**Onde medir:** Lighthouse, PageSpeed Insights, web-vitals lib em produção (real user monitoring).

Métricas secundárias úteis: **FCP** (First Contentful Paint, < 1.8s), **TTFB** (Time to First Byte, < 800ms), **TBT** (Total Blocking Time, < 200ms).

---

## Versão Essencial (Toda Mudança Que Toca UI ou Dados)

> Verificações mínimas que evitam **regressões óbvias**. Item `[ ]` aqui é 🟡 Importante por padrão.

### Renderização

- [ ] **Sem `useEffect` para derivar estado** (use `useMemo` ou cálculo direto)
- [ ] **Keys de listas são estáveis** (não `index` em lista que muda)
- [ ] **Listas grandes (> 100 itens) têm paginação ou virtualização**

### Bundle e Carregamento

- [ ] **Sem importar a lib inteira** quando só precisa de uma função (`import { fn } from 'lib'`, não `import * as`)
- [ ] **Imagens não-críticas têm `loading="lazy"`**
- [ ] **Imagens com tamanho conhecido têm `width` e `height`** (evita CLS)

### Network

- [ ] **Sem requisições duplicadas** (mesma chamada disparada N vezes desnecessariamente)
- [ ] **Estados de carregamento existem** (skeleton ou spinner)

### Cuidados Básicos

- [ ] **Sem cálculo pesado em render** (filter, sort, reduce de 1000+ itens) - usar `useMemo`
- [ ] **Sem `console.log` em loop** ou em re-render frequente

Cumpriu essas? Para mudança Standard típica, está bom. Para feature de listagem grande, dashboard, ou tela com muitos elementos, prossiga para versão completa.

---

## Versão Completa por Área

### 1. Renderização React

#### Re-renders

- [ ] Componente não re-renderiza sem motivo (verifique com React DevTools Profiler)
- [ ] Filhos memoizados (`React.memo`) só onde há ganho real
- [ ] `useMemo` apenas para cálculos caros (não para `a + b`)
- [ ] `useCallback` apenas onde a função é passada para componente memoizado ou usada em dependências
- [ ] Sem objetos/arrays criados inline em props quando o componente é memoizado
- [ ] Sem funções inline em props quando o componente é memoizado

#### Estado

- [ ] Estado posicionado **o mais baixo possível** (lift state up só quando necessário)
- [ ] Estados independentes em hooks separados (não um `useReducer` gigante quando não há sincronização)
- [ ] Sem `useState` para valor derivado de prop (use cálculo direto)
- [ ] `useReducer` quando há transições de estado complexas (não `useState` com 5+ campos)

#### Side effects

- [ ] `useEffect` tem dependências corretas (não vazio sem motivo)
- [ ] Cleanup retornado quando o effect deixa "lixo" (subscriptions, timers)
- [ ] Sem effect para sincronizar estado interno
- [ ] Sem fetch em loop sem retentativa controlada

#### Context

- [ ] Context dividido em pedaços (não 1 Provider gigante que re-renderiza tudo)
- [ ] Valores do Context são memoizados (`useMemo` no `value`)
- [ ] Componentes que não precisam do Context não estão dentro do Provider

### 2. Bundle e Code Splitting

#### Tamanho

- [ ] Bundle total < 200kb gzipped (mira inicial)
- [ ] Nenhuma rota carrega lib pesada que outras não usam
- [ ] Verificar com `npm run build` + análise (vite-bundle-visualizer ou similar)

#### Imports

- [ ] Imports nomeados (`import { x } from 'lib'`) em vez de namespace (`import * as lib`)
- [ ] Lodash importado por função (`lodash/debounce`, não `lodash`)
- [ ] Date-fns importado por função (não tudo)
- [ ] Ícones importados individualmente (lucide-react já faz isso por default)

#### Code splitting

- [ ] Rotas grandes usam `React.lazy()` + `Suspense`
- [ ] Modais grandes lazy-loaded (não carregar HTML/JS de modal que abre 5% das vezes)
- [ ] Dependências pesadas só usadas em features específicas são lazy
- [ ] Páginas admin não carregam JS para usuário comum

#### Tree-shaking

- [ ] Imports são side-effect free quando possível
- [ ] `package.json` da lib tem `"sideEffects": false` se aplicável
- [ ] Build (`npm run build`) confirma tree-shaking via análise

### 3. Imagens e Mídia

#### Formato

- [ ] Imagens em formato moderno (WebP, AVIF) com fallback se necessário
- [ ] SVG inline para ícones pequenos (< 5kb)
- [ ] PNG só onde precisa (transparência, screenshots)
- [ ] JPEG para fotos com qualidade calibrada (não 100%)

#### Dimensões

- [ ] `width` e `height` no `<img>` (evita CLS)
- [ ] `srcset` e `sizes` para imagens responsivas
- [ ] Imagens não maiores que o necessário (não 4000×3000 em thumbnail)

#### Loading

- [ ] `loading="lazy"` em imagens fora da viewport inicial
- [ ] `loading="eager"` (ou ausente) em hero image / above-the-fold
- [ ] `fetchpriority="high"` em LCP image se conhecida

#### Mídia

- [ ] Vídeos não auto-play (a menos que essencial)
- [ ] Vídeos têm `poster` para evitar tela preta
- [ ] Vídeos curtos animados podem ser GIF; mais que 5s, usar `<video>` (menor)

### 4. Network e Cache

#### Requisições

- [ ] Sem requisições duplicadas (mesma URL chamada em paralelo)
- [ ] Requisições paralelas onde aplicável (Promise.all em vez de sequencial)
- [ ] Cancelamento de requisições obsoletas (AbortController) ao desmontar/refazer
- [ ] Debounce em campos de busca (não buscar a cada keystroke)
- [ ] Throttle em handlers de scroll/resize

#### Cache

- [ ] Headers de cache adequados em assets estáticos (immutable, ano)
- [ ] Bibliotecas como React Query / SWR usadas para cache em memória
- [ ] Invalidação de cache pensada (mutação invalida queries dependentes)
- [ ] Service Worker (se PWA) atualiza assets corretamente

#### Prefetch e preload

- [ ] Rotas previsíveis usam prefetch (`<Link>` do Next.js, ou manual)
- [ ] Fontes críticas têm `<link rel="preload">`
- [ ] Conexões a APIs externas têm `<link rel="preconnect">`

#### Pagination

- [ ] Listas grandes paginadas no servidor (não cliente)
- [ ] Cursor pagination em vez de offset quando aplicável (ver ADR-008 do exemplo)
- [ ] Infinite scroll com `IntersectionObserver` (não scroll listener)

### 5. Cálculos e Storage

#### Cálculos pesados

- [ ] Filter / sort / reduce de listas grandes (> 1000) com `useMemo`
- [ ] Cálculos repetidos em loop são memoizados
- [ ] Web Worker considerado para operações > 50ms (parsing, criptografia)
- [ ] Sem regex caro em render (compile uma vez, reuse)

#### Storage

- [ ] localStorage acessado raramente (operação síncrona - bloqueia main thread)
- [ ] IndexedDB para dados grandes (assíncrono, escala)
- [ ] Sem leituras de storage em loop ou em re-render frequente
- [ ] Dados grandes (10kb+) em localStorage são reconsiderados

### 6. Animações

#### Performance

- [ ] Animações usam `transform` e `opacity` (compositing) - não `width`, `height`, `top`, `left`
- [ ] `will-change` usado pontualmente (não em todos os elementos animados)
- [ ] Animações em 60fps (16ms por frame) confirmado em DevTools Performance
- [ ] Sem animação rodando quando não visível

#### CSS vs JS

- [ ] CSS para animações simples (fade, slide)
- [ ] Framer Motion ou similar para animações complexas (que precisam de JS)
- [ ] Sem `setInterval` para animação (use `requestAnimationFrame`)

#### Movimento

- [ ] Respeita `prefers-reduced-motion`
- [ ] Animações curtas (< 300ms) onde aplicável
- [ ] Easings naturais (não linear cego)

### 7. Listas Grandes

#### Virtualização

- [ ] Listas > 100 itens consideram virtualização (react-window, TanStack Virtual)
- [ ] Listas > 1000 itens **exigem** virtualização ou paginação
- [ ] Grid grande (galeria, dashboard) também virtualizado se aplicável

#### Renderização

- [ ] Keys estáveis (`item.id`, não `index`)
- [ ] Itens da lista são memoizados (`React.memo`) se filhos pesados
- [ ] Sem cálculo por item em cada render (mover para fora ou memoizar)

#### Carregamento

- [ ] Lista inicial carrega ~20-50 itens (não 500 de uma vez)
- [ ] "Carregar mais" ou paginação clara
- [ ] Loading indicator durante busca de próxima página

### 8. CLS (Cumulative Layout Shift)

#### Prevenção

- [ ] `width` e `height` em **toda** imagem e vídeo
- [ ] Espaços reservados para conteúdo que carrega tarde (skeleton)
- [ ] Anúncios e iframes têm dimensões fixas
- [ ] Fontes carregadas com `font-display: swap` ou `optional` (evita FOIT/FOUT bruscos)

#### Anti-padrões

- [ ] Sem injeção de conteúdo acima de conteúdo já renderizado (ex: banner aparecendo após scroll)
- [ ] Sem animação de altura/largura que muda layout (use `transform: scale` se possível)
- [ ] Sem mudança de fonte que altera largura do texto pós-carregamento

### 9. INP (Interaction to Next Paint)

#### Responsividade

- [ ] Handlers de evento são rápidos (< 50ms para o trabalho síncrono)
- [ ] Trabalho pesado adiado com `setTimeout(0)` ou `requestIdleCallback`
- [ ] Sem `for` síncrono que bloqueia em > 16ms (chunk com `await Promise.resolve()`)
- [ ] Componentes pesados desmontados quando não usados

#### Debounce e throttle

- [ ] Inputs de busca com debounce (300-500ms é padrão)
- [ ] Scroll / resize com throttle ou `requestAnimationFrame`
- [ ] Submit não dispara em cada keystroke

### 10. Monitoramento em Produção

Para projetos sérios - opcional em projeto solo.

- [ ] Real User Monitoring (RUM) configurado (web-vitals lib, Vercel Analytics, Datadog RUM, etc.)
- [ ] Métricas de Core Web Vitals coletadas para usuários reais
- [ ] Alertas configurados para regressão (ex: LCP subindo > 20%)
- [ ] Diferenciação entre dispositivos (desktop vs mobile vs low-end)

---

## Como Medir

### Lighthouse (Chrome DevTools)

|Como|Quando|
|---|---|
|DevTools > Lighthouse > Run|Auditoria geral antes de fechar tarefa|
|Mobile + throttling Slow 4G|Simular usuário pior caso|
|Em modo incognito|Sem extensões interferindo|

Score útil: 90+ é bom; 80-89 melhorias possíveis; < 80 problemas reais.

### React DevTools Profiler

|Como|Quando|
|---|---|
|Aba Profiler > Record > interagir > Stop|Investigar re-renders excessivos|
|"Highlight updates when components render"|Visualizar onde re-render acontece|

Procure por: componentes que renderizam quando não deveriam, renders > 16ms.

### Chrome DevTools > Performance

|Como|Quando|
|---|---|
|Performance > Record > interagir > Stop|Investigar lentidão específica|
|Filtrar por "Long tasks" (vermelho)|Achar bloqueios > 50ms|

### Network tab

|Como|Quando|
|---|---|
|DevTools > Network > Disable cache > reload|Ver tamanho real do bundle|
|Filtrar por JS / CSS / IMG|Ver onde está o peso|
|"Slow 3G" throttling|Simular pior conexão|

### web-vitals lib (produção)

```typescript
import { onCLS, onINP, onLCP } from 'web-vitals'

onCLS(metric => sendToAnalytics(metric))
onINP(metric => sendToAnalytics(metric))
onLCP(metric => sendToAnalytics(metric))
```

Métricas reais > métricas sintéticas. Lighthouse é estimativa; web-vitals lib é realidade.

---

## Trade-offs Comuns

Performance frequentemente conflita com outras qualidades. Decisões a tomar:

### Memoização vs Simplicidade

```tsx
// Sem memo: simples mas re-renderiza com pai
function CardProduto({ produto }) { ... }

// Com memo: mais código, comportamento sutil
export const CardProduto = React.memo(function CardProduto({ produto }) { ... })
```

**Quando memoizar:** filhos custosos em listas, componentes que recebem objetos/funções memoizadas. **Quando não:** componentes leves que renderizam rápido mesmo.

### Bundle vs Funcionalidade

Lib que ajuda mas custa 100kb. Vale?

- Se a feature é central: provavelmente sim
- Se é tela secundária: code split + lazy
- Se há alternativa nativa boa: usar nativa

### Imagem de Qualidade vs Tamanho

- Foto de produto em e-commerce: qualidade > tamanho (ainda assim, otimizada)
- Hero de blog: tamanho > qualidade
- Avatar de 40×40: qualidade quase irrelevante; tamanho importante

### SSR vs SPA Tradicional

- SSR (Next.js, Remix): melhor LCP, FCP, SEO
- SPA tradicional (Vite SPA): melhor INP em interações, simplicidade

Decisão arquitetural - vira ADR.

---

## Mini-FAQ

**1. Devo memoizar todos os componentes?** Não. `React.memo` tem custo (comparação de props). Vale apenas onde há ganho mensurável. Componente que renderiza rápido (1-2ms) raramente vale memoizar.

**2. `useCallback` sempre que tem função?** Não. Só onde a função é prop de componente memoizado ou dependência de hook. Função "solta" no JSX dispara não diferencia praticamente.

**3. Como sei se algo está lento?** Profiler do React DevTools mostra ms por render. Performance tab do Chrome mostra long tasks (>50ms vermelho). Lighthouse dá score geral. Comece pelo Lighthouse, aprofunde no profiler se score baixo.

**4. Bundle de 500kb é ruim?** Depende. 500kb gzipped é alto - alvo é < 200kb gzipped para inicial. Para apps complexos, code split é a saída. Não otimize bundle prematuramente; meça primeiro.

**5. SSR é sempre melhor que CSR?** Não. SSR melhora LCP e SEO, mas tem custos (infraestrutura, complexidade). Para app interno autenticado, CSR pode ser melhor. Decisão por contexto.

**6. Quando preciso virtualizar lista?** ~100 itens: pode pensar. 500 itens: provavelmente sim. 1000+: certeza. Mas teste - depende do peso de cada item. Lista de strings simples vai bem com 1000 itens; lista de cards complexos pode sofrer com 100.

**7. Imagens lazy degradam UX?** Não, se feitas certo. Use `loading="lazy"` em imagens fora da viewport. Para imagens above-the-fold (hero), use `loading="eager"` ou ausência (default). Imagens críticas para LCP podem ter `fetchpriority="high"`.

**8. Devo usar React Query / SWR?** Para apps com muito fetch, sim - cache + dedup + revalidação sai grátis. Para app simples com 2-3 endpoints, fetch nativo + hook próprio pode bastar. Decisão por escala.

**9. Animações no `transform` são sempre ok?** Quase. `transform` + `opacity` rodam na GPU (compositing), não bloqueiam main thread. Animar `width`, `height`, `top`, `left` força layout/paint - pesado. Use `transform: translateX()` em vez de `left`, etc.

**10. Otimização premature é tão ruim quanto dizem?** Sim. Código mais complexo, mais bugs, manutenção mais cara - sem ganho real. **Sempre meça primeiro**. Se não tem dado mostrando problema, provavelmente não há problema que justifique otimização.

---

## 🔗 Checklists e Módulos Relacionados

- [`40-revisao-rapida.md`](https://claude.ai/chat/40-revisao-rapida.md) - Checklist master
- [`41-seguranca.md`](https://claude.ai/chat/41-seguranca.md) - Checklist de segurança
- [`42-acessibilidade.md`](https://claude.ai/chat/42-acessibilidade.md) - Checklist de acessibilidade
- [`../padroes/16-performance-acessibilidade.md`](https://claude.ai/padroes/16-performance-acessibilidade.md) - Conceitos detalhados
- [`../padroes/12-react-e-estado.md`](https://claude.ai/padroes/12-react-e-estado.md) - Padrões React que afetam performance
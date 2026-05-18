---

description: "Performance e acessibilidade: Core Web Vitals, code splitting, imagens, re-renders, WCAG, navegação por teclado, leitores de tela." modulo: "16" categoria: "padroes" versao: "1.0" relacionado:

- "12-react-e-estado.md"
- "13-ui-e-design-system.md"
- "14-formularios-e-validacao.md"

---

# ⚡ Performance e Acessibilidade

> Performance e acessibilidade são **respeito pelo usuário**. Performance respeita o tempo dele; acessibilidade respeita como ele acessa. Os dois **nascem com a feature**, não são otimização final.

---

## 1. Por Que Tratar Junto

Os dois temas dividem mais do que parece:

- **Ambos são prejudicados por mudanças tardias.** Adicionar acessibilidade depois exige refatoração; adicionar performance depois exige código mais complexo.
- **Ambos têm métricas objetivas.** Não são "achismo" — você mede.
- **Ambos têm o mesmo conserto frequente.** Reduzir JavaScript ajuda performance E ajuda quem usa leitor de tela em hardware modesto.
- **Ambos são afetados por decisões de UI.** O mesmo componente bem feito atende os dois.

---

## 2. Core Web Vitals: As Métricas que Importam

O Google avalia sites por três métricas principais. Elas também medem o que o usuário percebe.

### 2.1 LCP — Largest Contentful Paint

**O que mede:** tempo até o maior elemento visível aparecer (geralmente uma imagem hero ou bloco de texto).

**Meta:** **< 2,5 segundos** em 4G mediano.

**O que afeta:**

- Tamanho da imagem hero
- Servidor lento
- JavaScript bloqueando render
- Fontes externas pesadas

**Conserto comum:**

```html
<!-- Hint para o browser priorizar -->
<img src="hero.jpg" fetchpriority="high" />

<!-- Preload de imagem crítica -->
<link rel="preload" as="image" href="hero.jpg" />
```

### 2.2 INP — Interaction to Next Paint

**O que mede:** latência da pior interação do usuário (clique, tecla, toque) durante a sessão.

**Meta:** **< 200ms**.

**O que afeta:**

- Handlers lentos (loops grandes, parsing pesado)
- Re-renders cascateando
- JavaScript bloqueando main thread

**Conserto comum:**

- Mover trabalho pesado para `Web Worker`
- `useDeferredValue` para inputs reativos
- Debounce em inputs caros

### 2.3 CLS — Cumulative Layout Shift

**O que mede:** o quanto o conteúdo "pula" durante o carregamento.

**Meta:** **< 0,1**.

**O que afeta:**

- Imagens sem `width`/`height`
- Fontes que mudam de tamanho ao carregar
- Anúncios e embeds que aparecem depois
- Conteúdo injetado acima do que já estava visível

**Conserto comum:**

```html
<!-- Sempre defina dimensões -->
<img src="foto.jpg" width="800" height="600" alt="..." />

<!-- Reservar espaço para conteúdo lazy -->
<div style="aspect-ratio: 16/9">
  <iframe src="..." />
</div>
```

### 2.4 Como Medir

|Ferramenta|Quando usar|
|---|---|
|**Chrome DevTools — Lighthouse**|Auditoria local antes de subir|
|**PageSpeed Insights**|Validação em URL pública|
|**web-vitals** (lib)|Monitorar em produção|

```typescript
// Em produção, reporta para analytics
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP(metric => console.log('LCP:', metric.value))
onINP(metric => console.log('INP:', metric.value))
onCLS(metric => console.log('CLS:', metric.value))
```

---

## 3. Code Splitting

Por padrão, Vite/Webpack juntam todo o código em poucos bundles grandes. Para apps acima de ~30kb de JS, isso vira problema. **Code splitting** divide o bundle em pedaços que carregam sob demanda.

### 3.1 Por Rota

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const PaginaPerfil = lazy(() => import('./pages/PaginaPerfil'))
const PaginaPedidos = lazy(() => import('./pages/PaginaPedidos'))
const PaginaConfig = lazy(() => import('./pages/PaginaConfig'))

export function App() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <Routes>
        <Route path="/perfil" element={<PaginaPerfil />} />
        <Route path="/pedidos" element={<PaginaPedidos />} />
        <Route path="/config" element={<PaginaConfig />} />
      </Routes>
    </Suspense>
  )
}
```

**Resultado:** o bundle inicial só carrega a rota atual. Outras rotas viram chunks separados, carregados quando o usuário navega.

### 3.2 Por Componente Pesado

Quando um componente específico é **pesado e não-crítico** (gráfico, editor rich-text, mapa), também vale o lazy:

```tsx
const GraficoVendas = lazy(() => import('./GraficoVendas'))

function Dashboard() {
  const [mostrandoGrafico, setMostrandoGrafico] = useState(false)

  return (
    <>
      <Botao onClick={() => setMostrandoGrafico(true)}>Ver gráfico</Botao>
      {mostrandoGrafico && (
        <Suspense fallback={<SpinnerGrafico />}>
          <GraficoVendas />
        </Suspense>
      )}
    </>
  )
}
```

### 3.3 Quando NÃO Fazer Code Splitting

- **Componentes pequenos** — o overhead de uma chunk extra é maior que o benefício
- **Componentes acima da fold inicial** — vão ser pedidos imediatamente mesmo
- **Bibliotecas inline simples** — `lodash-es` faz tree-shaking automaticamente

Code splitting **adiciona complexidade**. Use quando o ganho de performance compensar.

---

## 4. Otimização de Imagens

Imagens são frequentemente o maior peso da página. Pequenos cuidados rendem grandes ganhos.

### 4.1 Atributos Essenciais

```html
<img
  src="foto.jpg"
  width="800"
  height="600"
  alt="Descrição significativa"
  loading="lazy"
  decoding="async"
/>
```

|Atributo|Por quê|
|---|---|
|`width` / `height`|Reserva espaço, evita CLS|
|`alt`|Acessibilidade (descreve a imagem; vazio se decorativa)|
|`loading="lazy"`|Carrega só quando vai aparecer na tela|
|`decoding="async"`|Não bloqueia render durante decode|

### 4.2 Formato Moderno

|Formato|Use quando|
|---|---|
|**AVIF**|Suporte limitado, mas melhor compressão (use fallback)|
|**WebP**|Padrão moderno, suporte amplo|
|**JPEG**|Fotos quando WebP não cabe|
|**PNG**|Transparência ou ícones simples|
|**SVG**|Logos, ícones, ilustrações vetoriais|

Use `<picture>` para servir o melhor formato disponível:

```html
<picture>
  <source srcset="foto.avif" type="image/avif" />
  <source srcset="foto.webp" type="image/webp" />
  <img src="foto.jpg" alt="..." width="800" height="600" />
</picture>
```

### 4.3 Tamanho Responsivo

Para imagens que aparecem em tamanhos diferentes por dispositivo:

```html
<img
  src="foto-800.jpg"
  srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1600.jpg 1600w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="..."
/>
```

O browser baixa apenas a versão necessária.

### 4.4 Alt Text — Acessibilidade

|Cenário|`alt`|
|---|---|
|Imagem informativa|Descreva o conteúdo: `alt="Gráfico mostrando aumento de vendas em 2024"`|
|Imagem decorativa|`alt=""` (vazio, **não** omita o atributo)|
|Imagem em link/botão|Descreva a ação: `alt="Editar perfil"`|
|Imagem repetida com texto adjacente|`alt=""` (evite redundância para screen reader)|

**Nunca:** `alt="imagem"`, `alt="foto"`, `alt="logo"`. Isso é ruído para leitor de tela.

---

## 5. Performance em React

A maioria dos problemas reais de performance em React vem de **re-renders desnecessários** e **handlers caros**. Não da virtualização ou bundles.

### 5.1 Identificando o Problema

Antes de otimizar, **meça**. Use React DevTools → Profiler:

1. Grave uma interação do usuário
2. Veja quais componentes re-renderizaram
3. Veja quanto tempo cada um levou

Sem profiler, você está adivinhando.

### 5.2 `React.memo` para Listas

```tsx
// Sem memo — todo CardPerfil re-renderiza quando lista atualiza
function CardPerfil({ perfil, onEditar }: Props) {
  return <div>{perfil.nome}</div>
}

// Com memo — só re-renderiza se props mudarem
const CardPerfil = memo(function CardPerfil({ perfil, onEditar }: Props) {
  return <div>{perfil.nome}</div>
})
```

**Funciona quando:**

- Props são valores primitivos (strings, numbers) ou referências estáveis
- O componente é genuinamente caro (gráfico, lista grande)
- Está em uma lista renderizando muitos itens

**Não funciona quando:**

- Props são objetos/arrays criados a cada render do pai
- O componente é trivial (overhead da comparação > custo do render)

### 5.3 `useDeferredValue` para Inputs Reativos

Quando o usuário digita e a tela tem que reagir (busca em lista grande, filtro), você tem dois conflitos:

- **Input precisa ser responsivo** (cada tecla aparece imediatamente)
- **Tela pode demorar para atualizar** (filtrar 10k itens leva tempo)

`useDeferredValue` resolve:

```tsx
function BuscaProdutos() {
  const [busca, setBusca] = useState('')
  const buscaAdiada = useDeferredValue(busca)

  // Filtragem cara usa a versão adiada
  const produtosFiltrados = useMemo(
    () => filtrarProdutos(produtos, buscaAdiada),
    [buscaAdiada]
  )

  return (
    <>
      <input value={busca} onChange={e => setBusca(e.target.value)} />
      <ListaProdutos produtos={produtosFiltrados} />
    </>
  )
}
```

O input reflete imediatamente. A lista atualiza quando o React tem tempo.

### 5.4 Virtualização de Listas Grandes

Para listas com 100+ itens visíveis simultaneamente, use **virtualização** (renderiza só o que está na tela).

Bibliotecas populares:

- `@tanstack/react-virtual` — leve, headless
- `react-window` — clássica
- `react-virtuoso` — mais features (sticky headers, etc.)

Não implemente virtualização manualmente — é complexo e fácil de errar.

### 5.5 Quando NÃO Otimizar

Iniciantes tendem a `memo` tudo. Custos:

- `memo` faz comparação a cada render — para componentes triviais, custa mais que o ganho
- `useMemo`/`useCallback` adicionam dependências, criam bugs sutis
- Código fica menos legível

**Otimize quando:**

1. Você **mediu** que há problema
2. O custo da otimização é menor que o ganho
3. O código continua legível

---

## 6. Bundle Size

Bundle pequeno carrega rápido em qualquer conexão. Algumas práticas reduzem muito sem esforço.

### 6.1 Tree-Shaking

Vite/Webpack removem código não usado **se** os imports forem específicos.

```typescript
// ❌ Importa biblioteca toda
import _ from 'lodash'
const dobro = _.map([1, 2], x => x * 2)

// ✅ Importa só o que usa
import map from 'lodash/map'
const dobro = map([1, 2], x => x * 2)

// ✅✅ Melhor — use lodash-es
import { map } from 'lodash-es'
```

### 6.2 Análise do Bundle

```bash
# Vite
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer({ open: true })]
})

# Após build
npm run build
# Abre stats.html no browser
```

Você vê quais módulos pesam mais. Geralmente surpresa:

- Lib de date (moment.js pesa 230kb)
- Ícones (importar tudo em vez do necessário)
- Polyfills antigos

### 6.3 Substituições Comuns

|Lib pesada|Alternativa leve|
|---|---|
|moment.js|date-fns ou Luxon|
|lodash (full)|lodash-es ou nativos do JS|
|axios|fetch (nativo)|
|jquery|nativo do browser|

### 6.4 Fontes

```css
/* Sempre use font-display: swap */
@font-face {
  font-family: 'Inter';
  src: url('inter.woff2') format('woff2');
  font-display: swap;
}
```

`font-display: swap` mostra a fonte fallback enquanto a custom carrega. Sem isso, texto fica invisível até a fonte chegar (FOIT).

---

## 7. WCAG Essencial

WCAG (Web Content Accessibility Guidelines) tem 3 níveis: A, AA, AAA. **Mire AA**. É o padrão legal em muitos países e cobre o que mais importa.

### 7.1 Contraste de Cor

**Mínimo:**

- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Ícones e bordas funcionais: 3:1

**Como medir:** DevTools → Inspect → seção Color → Contrast Ratio. Ou WebAIM Contrast Checker.

```css
/* ❌ Cinza claro em fundo branco */
.texto { color: #aaa; background: white; } /* 2.32:1 — falha */

/* ✅ Cinza médio */
.texto { color: #595959; background: white; } /* 7.05:1 — passa AA e AAA */
```

### 7.2 Estrutura Semântica

Use elementos HTML pelo significado, não pelo visual:

```html
<!-- ❌ Divs para tudo -->
<div class="link" onclick="ir()">Clique aqui</div>

<!-- ✅ Elemento certo -->
<a href="/destino">Clique aqui</a>

<!-- ❌ Heading por tamanho de fonte -->
<div class="big-text">Título da Seção</div>

<!-- ✅ Heading semântico -->
<h2>Título da Seção</h2>
```

Leitores de tela usam a semântica para navegar. Botão é botão, link é link, heading é heading.

### 7.3 Labels em Formulários

Coberto em detalhe no módulo 14, mas a regra resumida:

```html
<!-- ❌ Sem label -->
<input placeholder="Email" />

<!-- ✅ Label associada -->
<label for="email">Email</label>
<input id="email" type="email" />
```

### 7.4 Imagens

```html
<!-- ✅ Informativa: descreva -->
<img src="grafico.png" alt="Vendas cresceram 35% em 2024" />

<!-- ✅ Decorativa: alt vazio -->
<img src="ornamento.png" alt="" />

<!-- ❌ Nunca: alt genérico -->
<img src="logo.png" alt="imagem" />
```

### 7.5 Ícones

```tsx
// ✅ Ícone decorativo (acompanha texto)
<button>
  <Plus aria-hidden="true" />
  Adicionar
</button>

// ✅ Ícone funcional (só ícone, sem texto)
<button aria-label="Fechar modal">
  <X />
</button>

// ❌ Ícone funcional sem label
<button onClick={fechar}>
  <X />
</button>
```

### 7.6 Cores Como Único Indicador

**Nunca** use só cor para transmitir informação. Pessoas com daltonismo (8% dos homens) e leitores de tela perdem a informação.

```html
<!-- ❌ Só cor -->
<span style="color: red">Erro</span>

<!-- ✅ Cor + texto + ícone -->
<span class="text-destructive">
  <AlertCircle aria-hidden="true" /> Erro: senha inválida
</span>
```

---

## 8. Navegação por Teclado

Todo elemento interativo **deve** funcionar com teclado. Isso é base para leitores de tela e essencial para usuários com motricidade reduzida.

### 8.1 Tecla Padrão por Elemento

|Elemento|Teclas|
|---|---|
|Link, botão|`Tab` para focar, `Enter` (ou `Space` em botões) para ativar|
|Checkbox, radio|`Tab` para focar, `Space` para alternar|
|Input, textarea|`Tab` para focar, digite normalmente|
|Select|`Tab`, setas, `Enter`|
|Modal|`Escape` para fechar|
|Menu (combobox)|Setas para navegar, `Enter` para selecionar, `Escape` para fechar|

Bibliotecas como Radix já implementam isso. **Se você usa Radix/shadcn, não reinvente.**

### 8.2 Foco Visível

Já mencionado no módulo 13, mas crítico repetir:

```tsx
// ✅ focus-visible (só aparece com teclado)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// ❌ Remover foco
className="focus:outline-none"  // sem alternativa visual
```

### 8.3 Ordem de Tab

A ordem natural do HTML (cima para baixo, esquerda para direita) é quase sempre a correta. Evite `tabindex` positivo:

```tsx
// ❌ Quebra ordem natural
<input tabindex="5" />
<input tabindex="2" />

// ✅ Use a ordem natural
<input />
<input />

// ✅ Apenas para tornar não-focável (-1) ou re-incluir (0)
<div tabindex="0" role="button">Clicável</div>
```

### 8.4 Skip Link

Para usuários de teclado, navegação repetitiva é dor. Adicione skip link no topo:

```tsx
<a href="#conteudo-principal" className="sr-only focus:not-sr-only">
  Pular para o conteúdo
</a>

{/* ... navegação longa ... */}

<main id="conteudo-principal">
  {/* conteúdo */}
</main>
```

Quando o usuário pressiona `Tab` na primeira vez, vê o link "Pular para o conteúdo" e pode saltar a navegação.

---

## 9. Leitores de Tela

Você não precisa testar com leitor de tela todo dia, mas precisa **garantir que funciona**.

### 9.1 Como Testar Rapidamente

|OS|Leitor de tela|Atalho|
|---|---|---|
|macOS|VoiceOver|Cmd+F5|
|Windows|NVDA (gratuito)|Após instalar, Ctrl+Alt+N|
|Mobile iOS|VoiceOver|Configurações → Acessibilidade|
|Mobile Android|TalkBack|Configurações → Acessibilidade|

Navegue pela página com leitor de tela ativo e Tab. Você ouve cada elemento sendo anunciado.

### 9.2 Conteúdo Dinâmico

Quando algo aparece na tela após ação do usuário (mensagem de sucesso, erro, notificação), o leitor de tela precisa ser **avisado**.

```tsx
// ✅ Avisa mudança imediatamente
<div role="alert">
  Perfil salvo com sucesso!
</div>

// ✅ Avisa quando o usuário "tiver tempo"
<div role="status" aria-live="polite">
  Carregando dados...
</div>

// ✅ Atualizações constantes (timer, contagem)
<div aria-live="polite" aria-atomic="true">
  {tempoRestante} segundos
</div>
```

|`role` / `aria-live`|Comportamento|
|---|---|
|`role="alert"`|Interrompe e anuncia imediatamente|
|`aria-live="polite"`|Anuncia quando o leitor estiver livre|
|`aria-live="assertive"`|Igual a `alert` — use com moderação|
|`aria-atomic="true"`|Re-anuncia tudo (não só a parte que mudou)|

### 9.3 Texto Para Leitor (Visualmente Oculto)

```tsx
// Pílula visual + texto para leitor
<span className="inline-block px-2 py-1 bg-destructive text-white rounded">
  3 <span className="sr-only">erros encontrados</span>
</span>
```

Classe `sr-only` (do Tailwind ou definida no projeto):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 10. Preferências do Usuário

O sistema operacional do usuário expõe preferências que você deve respeitar.

### 10.1 `prefers-reduced-motion`

Usuários com vestibular sensível (tontura, enjoo) desativam animações no OS. **Respeite.**

```css
/* Reduzir todas as animações se o usuário pediu */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Com Tailwind:

```tsx
<div className="transition-all motion-reduce:transition-none" />
```

### 10.2 `prefers-color-scheme`

Modo escuro/claro do sistema:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
  }
}
```

Com Tailwind (com `darkMode: 'media'` no config):

```tsx
<div className="bg-white dark:bg-gray-900" />
```

### 10.3 `prefers-contrast`

Usuários com baixa visão pedem alto contraste:

```css
@media (prefers-contrast: high) {
  :root {
    --foreground: 0 0% 0%;  /* preto puro */
    --background: 0 0% 100%; /* branco puro */
  }
}
```

---

## 11. Checklist Antes de Entregar Feature

### Performance

- [ ] Imagens com `width`, `height`, `loading="lazy"`, `alt`
- [ ] Code splitting nas rotas principais
- [ ] Sem `useEffect` para derivar estado (causa re-renders)
- [ ] Componentes em listas grandes têm `memo` se relevante
- [ ] Sem imports de biblioteca inteira (`import _ from 'lodash'`)
- [ ] Bundle inicial < 200kb gzipped (alvo para apps típicos)
- [ ] LCP < 2,5s no Lighthouse mobile
- [ ] INP < 200ms em interações típicas
- [ ] CLS < 0,1

### Acessibilidade

- [ ] Contraste de cor ≥ 4.5:1 para texto normal
- [ ] Todo elemento interativo navegável por teclado
- [ ] Foco visível com `focus-visible:ring`
- [ ] Labels em todos os inputs
- [ ] Imagens informativas têm `alt` descritivo
- [ ] Imagens decorativas têm `alt=""`
- [ ] Ícones funcionais têm `aria-label`
- [ ] Estrutura semântica (h1-h6, nav, main, etc.)
- [ ] Sem cor como único indicador
- [ ] Mudanças dinâmicas anunciadas (`role="alert"`, `aria-live`)
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Lighthouse Acessibilidade ≥ 95

---

## 12. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Métricas que importam?|LCP < 2.5s, INP < 200ms, CLS < 0.1|
|Code splitting onde?|Rotas + componentes pesados não-críticos|
|Imagens: o essencial?|`width`, `height`, `loading="lazy"`, `alt`|
|`React.memo` em tudo?|Não. Só onde mediu problema|
|Contraste mínimo?|4.5:1 texto normal, 3:1 texto grande|
|Foco visível?|`focus-visible:ring-2`|
|Cor como único indicador?|Nunca. Sempre combine com texto/ícone|
|Animações sempre?|Não. Respeite `prefers-reduced-motion`|
|Como medir?|Lighthouse local + PageSpeed Insights + web-vitals|

---

## 🔗 Módulos Relacionados

- [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md) — `useMemo`, `useCallback`, `useDeferredValue`
- [`13-ui-e-design-system.md`](https://claude.ai/chat/13-ui-e-design-system.md) — Acessibilidade nos componentes base
- [`14-formularios-e-validacao.md`](https://claude.ai/chat/14-formularios-e-validacao.md) — Forms acessíveis em detalhe
- [`../checklists/42-acessibilidade.md`](https://claude.ai/checklists/42-acessibilidade.md) — Checklist completo separado
- [`../checklists/43-performance.md`](https://claude.ai/checklists/43-performance.md) — Checklist completo separado
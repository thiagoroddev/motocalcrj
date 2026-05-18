---

description: "Tradução de design (Figma) para código: análise visual, spec técnica, planejamento de componentes, ordem de implementação." modulo: "24" categoria: "processos" versao: "1.0" relacionado:

- "11-arquitetura-e-pastas.md"
- "12-react-e-estado.md"
- "13-ui-e-design-system.md"
- "20-ciclo-tarefa.md"

---

# 🎨 Figma para Código

> Traduzir design para código é onde **dois mundos se encontram**: pensamento visual do designer e pensamento estrutural do dev. A maioria dos bugs de implementação não vem de falta de skill técnico — vem de **tradução descuidada**.

---

## 1. Por Que Tradução Cuidadosa Importa

### 1.1 O Erro Mais Comum

Receber design e ir direto para o código. Resultado:

- Componente novo criado quando já existia equivalente
- Estados não-feliz (vazio, erro, loading) esquecidos
- Variações responsivas inventadas (não viu, supôs)
- Acessibilidade ignorada porque "design não mostra"
- Pixel-perfect numa parte, completamente fora em outra

**O sintoma:** você termina, mostra para o designer, ouve "não era exatamente isso". Refatora. Mostra de novo. "Quase, mas...". Refatora. Frustração mútua.

### 1.2 A Solução

Três fases **antes** de digitar primeira linha de código:

```
Fase 1: Análise visual   →   Fase 2: Spec técnica   →   Fase 3: Plano de componentes
   (entender)                  (estruturar)                (decidir reuso/novo)
                                                              ↓
                                            Fase 4: Implementação (na ordem certa)
```

O custo é tempo no início. O retorno é evitar 3-5 ciclos de retrabalho.

---

## 2. Fase 1: Análise Visual

Antes de pensar em código, **entenda o design**. Como se você fosse explicar para outra pessoa o que está vendo.

### 2.1 O Que Identificar

#### Componentes reutilizáveis

> _"Quais elementos visuais aparecem 2+ vezes? Quais já existem no projeto?"_

Percorra o design olhando por padrões repetidos:

- Botões (primário, secundário, ghost, destrutivo)
- Cards (com header, com footer, simples)
- Inputs (texto, select, search, checkbox)
- Tags / badges
- Estados de loading (spinner, skeleton, progresso)

Para cada um, pergunte:

- Já existe no design system?
- É variação de algo existente?
- É componente novo?

#### Hierarquia visual

Mapeie do **macro para o micro**:

1. **Layout geral:** header, sidebar, main, footer?
2. **Seções da página:** quais blocos verticais? (cabeçalho da seção, conteúdo, ações)
3. **Agrupamentos:** quais elementos formam grupo (relacionados visualmente)?

#### Hierarquia tipográfica

- Quantos tamanhos de fonte aparecem?
- Quais pesos (regular, medium, bold)?
- Há texto secundário (cinza, menor) vs primário?
- Quantos níveis de heading (h1-h6)?

#### Espaçamento

- Há ritmo consistente (8px, 16px, 24px)?
- Padding de cards? Gap entre elementos?
- Maior espaço vertical é entre seções; menor entre elementos relacionados

#### Cores

- Quais cores aparecem? São tokens do design system ou novos?
- Cor de status (sucesso, alerta, erro) está consistente?
- Cor de texto sobre cada fundo tem contraste suficiente?

#### Responsividade

- Design tem versão mobile? Tablet?
- Como elementos mudam (stack, hide, reflow)?
- Se só tem desktop, **pergunte ao designer** antes de inventar

### 2.2 Listar Estados da Tela

Esta é a parte que **mais é esquecida**. Toda tela tem mais que um estado:

|Estado|O que mostrar|
|---|---|
|**Padrão (com dados)**|O design "normal" que você está vendo|
|**Vazio**|Quando não há dados — mensagem, ilustração, CTA|
|**Carregando**|Spinner, skeleton, indicador de progresso|
|**Erro**|Mensagem + ação (tentar novamente, reportar)|
|**Sem permissão**|Quando usuário não pode ver/fazer|
|**Parcial**|Dados incompletos, mostrar o que tem|
|**Offline**|Quando rede falha (se relevante)|

**Designer raramente desenha todos esses.** Você precisa **listar e perguntar** ou propor.

### 2.3 Saída da Fase 1

Você termina a análise com:

- Lista de componentes (reutilizáveis + novos)
- Mapa de hierarquia visual
- Tokens (cores, espaçamento, tipografia)
- Lista de estados (com vs sem design)
- Lista de perguntas para o designer

---

## 3. Fase 2: Especificação Técnica

Agora você transforma a análise visual em **documento técnico** — antes de codar.

### 3.1 Template de Spec

```markdown
## Spec: [Nome da Tela]

**Rota:** `/caminho/da/rota`
**Acesso:** [público / autenticado / admin]
**Origem do design:** [link do Figma]
**Última versão:** [data]

### Mapeamento Visual → Código
| Elemento no Figma | Componente | Props relevantes | É novo? |
|---|---|---|---|
| Botão azul "Salvar" | `Botao` | `variante="primario"` | Não, já existe |
| Campo "Email" | `CampoFormulario` | `tipo="email"` | Não |
| Card de produto | `CardProduto` | `produto={Produto}` | **Sim** |

### Campos de Formulário (se aplicável)
| Campo no Design | Variável | Tipo | Validação | Obrigatório |
|---|---|---|---|---|
| "Nome completo" | `nome` | `string` | min: 3, max: 100 | Sim |
| "Email" | `email` | `string` | formato email | Sim |
| "Telefone" | `telefone` | `string` | regex BR | Não |

### Estados da Tela
| Estado | Condição | O que renderiza | Tem design? |
|---|---|---|---|
| Padrão | `dados.length > 0` | Lista de cards | Sim |
| Vazio | `dados.length === 0` | `EstadoVazio` com CTA | **Não — propor** |
| Carregando | `isLoading` | Skeleton de 3 cards | **Não — propor** |
| Erro | `erro` | Alerta com retry | **Não — propor** |

### Navegação
| Ação do Usuário | Destino |
|---|---|
| Clicar em "Salvar" e validação OK | `/dashboard` |
| Clicar em "Cancelar" | Voltar |
| Clicar em um card | `/produtos/:id` |

### Componentes Novos (vão exigir criação)
- `CardProduto` — não existe versão equivalente. Vai em `components/produtos/`
- `EstadoVazio` — existe? Verificar antes de criar

### Perguntas Pendentes ao Designer
1. Estado vazio — qual mensagem e CTA?
2. Mobile — design tem versão? Se não, posso adaptar como?
3. Loading — spinner ou skeleton?
```

### 3.2 Por Que Spec Antes de Código

|Sem spec|Com spec|
|---|---|
|Decisões tomadas no calor do código|Decisões pensadas com calma|
|Esquecimentos só aparecem na revisão|Esquecimentos aparecem na análise|
|Difícil estimar esforço|Lista de itens permite estimar|
|Difícil paralizar trabalho|Pode dividir entre devs|
|Conversa com designer no fim|Conversa antes (mais barato)|

### 3.3 Tamanho da Spec

Não exagere. Spec é **proporcional à complexidade**:

- Tela simples (formulário com 3 campos): meia página
- Tela média (dashboard com 4-5 widgets): 1-2 páginas
- Tela complexa (lista com filtros, modais, exports): 2-3 páginas

Spec maior que 5 páginas é sintoma de tela que deveria ser **dividida em telas menores**.

---

## 4. Fase 3: Planejamento de Componentes

Para cada elemento identificado na spec, **decida onde mora**.

### 4.1 Fluxo de Decisão

```
Elemento identificado no Figma
  │
  ├─ Já existe no design system do projeto?
  │   └─► Reutilizar (sem criar nada)
  │
  ├─ É variação de algo existente?
  │   └─► Adicionar variante ao componente existente
  │       (ex: Botao tem 3 variantes, design pede 4ª)
  │
  ├─ É específico do domínio do projeto?
  │   └─► Criar em components/[dominio]/
  │       (ex: CardPerfil, FormularioPedido)
  │
  └─ É genérico, reutilizável em outros projetos?
      └─► Criar em components/ui/
          (ex: Tooltip, Skeleton)
```

### 4.2 Aplicando os Critérios do Módulo 11

Repetindo da seção 5 do módulo 11:

|Critério|Onde vai|
|---|---|
|Funciona em outro projeto sem mudar?|`components/ui/`|
|Estrutura toda página (header, footer, nav)?|`components/layout/`|
|Conhece o negócio (CardPerfil, ListaPedidos)?|`components/[dominio]/`|

### 4.3 Verificar Antes de Criar

Antes de marcar componente como "novo", **verifique**:

```bash
# Procurar por nomes similares
grep -ri "card" src/components/

# Olhar o design system
ls src/components/ui/
```

Casos comuns que parecem novos mas existem:

- "Card de produto" → talvez `Card` genérico + composição
- "Botão com ícone" → `Botao` aceita children e ícone
- "Modal de confirmação" → `Modal` + composição na page

**Reutilização > Criação.** Sempre.

---

## 5. Fase 4: Ordem de Implementação

Tem ordem certa para implementar. Inverter gera retrabalho.

### 5.1 Ordem Padrão

```
1. types/                        Defina os tipos primeiro
2. utils/ (se aplicável)         Funções puras de cálculo/formatação
3. services/ (se aplicável)      Acesso a dados, APIs
4. hooks/                        Lógica de estado + handlers
5. components/ui/ (se novo)      Componentes UI genéricos
6. components/[dominio]/         Componentes específicos do negócio
7. pages/                        Composição final
```

### 5.2 Por Que Essa Ordem

**Da fundação para o topo.** Cada camada depende da anterior:

- Page depende de componentes de domínio
- Componentes de domínio dependem de UI + hooks
- Hooks dependem de services + utils
- Services dependem de types
- Types não dependem de nada

Implementar de baixo para cima permite:

- Cada commit funciona isoladamente
- Testes podem rodar conforme avança
- Se parar no meio, o que existe está utilizável

### 5.3 Como Inverter Quebra

Imagine implementar de cima para baixo (começar pela page):

```typescript
// Page criada primeiro
function PaginaProdutos() {
  return <ListaProdutos produtos={???} />  // ListaProdutos não existe ainda
}
```

Você só consegue testar quando **tudo** estiver pronto. Bug encontrado lá embaixo significa subir refatorando.

### 5.4 Quando Pular Camadas

Para componentes puramente visuais (estática, sem estado):

```
types/ → components/ui/ ou components/[dominio]/ → page
```

Não precisa de `hooks/` ou `services/`. Pular é OK se realmente não há lógica.

---

## 6. Identificando Reuso

Esta seção merece detalhe próprio. Reuso ruim é fonte clássica de retrabalho.

### 6.1 Tipos de Reuso

#### Reuso direto

Componente existe, sem modificação:

```tsx
<Botao variante="primario">Salvar</Botao>
```

#### Reuso com nova variante

Componente existe, adicionar variante nova:

```tsx
// Antes:  variante: 'primario' | 'secundario' | 'ghost'
// Agora:  variante: 'primario' | 'secundario' | 'ghost' | 'outline'
<Botao variante="outline">Compartilhar</Botao>
```

#### Reuso por composição

Componente novo é apenas composição de existentes:

```tsx
function CardProduto({ produto }: Props) {
  return (
    <Card>
      <CardHeader>
        <Imagem src={produto.foto} />
      </CardHeader>
      <CardContent>
        <h3>{produto.nome}</h3>
        <Preco valor={produto.preco} />
      </CardContent>
      <CardFooter>
        <Botao>Comprar</Botao>
      </CardFooter>
    </Card>
  )
}
```

Você "criou" `CardProduto`, mas não criou primitivos. Reusou todos.

### 6.2 Quando NÃO Forçar Reuso

```tsx
// ❌ Reuso forçado
<Botao variante="primario" tamanho="xs" iconePrefixo="search">
  {/* virou caixa de busca?? */}
</Botao>

// ✅ Componente novo apropriado
<CampoBusca onBuscar={fn} />
```

Forçar reuso a custa de prop hell prejudica. Se você precisa de 6 props específicas para "transformar" um componente em outra coisa, **é outra coisa**.

### 6.3 Catálogo Visual

Manter um catálogo de componentes facilita reuso. Opções:

|Ferramenta|Quando usar|
|---|---|
|**Storybook**|Time grande, biblioteca crescendo|
|**Página de showcase** (`pages/dev/components.tsx`)|Projeto solo/pequeno|
|**`docs/arquitetura/componentes-ui.md`**|Lista textual mínima|

Para projeto solo, página de showcase é prática — você vê todos os componentes existentes antes de criar duplicata.

---

## 7. Estados de Tela que Designer Não Mostra

Design mostra estado "ideal". Você precisa pensar em **todos os outros**.

### 7.1 Lista de Estados Comuns

Para qualquer tela com dados:

```
1. Padrão        — design mostra
2. Vazio         — frequentemente esquecido
3. Carregando    — quase sempre esquecido (skeleton vs spinner)
4. Erro          — quase sempre esquecido
5. Sem permissão — depende do contexto
6. Parcial       — alguns dados, outros faltam
```

Para tela com formulário:

```
1. Vazio (campos limpos)
2. Preenchido (dados sendo digitados)
3. Validando (após blur, antes de submit)
4. Com erros (validação falhou)
5. Submetendo (botão carregando)
6. Sucesso (toast / redirect)
7. Erro de servidor (mensagem global)
```

### 7.2 Como Tratar

Para cada estado **não desenhado**, sua spec lista:

- A condição (`dados.length === 0`)
- O que renderizar (`<EstadoVazio>`)
- Marcar se tem ou não design

Se não tem design e é estado importante, **proponha** ao designer. Não invente sem confirmar.

### 7.3 Componentes de Estado Comuns

Você terá esses componentes recorrentes:

```
src/components/ui/
├── EstadoVazio.tsx       # "Nada por aqui ainda. [CTA]"
├── EstadoCarregando.tsx  # Skeleton ou Spinner
├── EstadoErro.tsx        # "Algo deu errado. [Tentar novamente]"
└── EstadoSemPermissao.tsx # "Você não tem acesso"
```

Criar uma vez bem feito. Reusar em toda tela.

---

## 8. Quando Conversar com Designer

Conversar com designer é **parte do trabalho**, não interrupção. Saber quando é importante.

### 8.1 Sempre Conversar

|Situação|Por quê|
|---|---|
|Estado não desenhado mas importante|Vazio, erro, loading|
|Design parece inconsistente com outras telas|Pode ser intencional ou bug do designer|
|Cor não está no design system|Confirmar se é nova oficial ou se é por engano|
|Componente parece duplicar existente|Confirmar se é mesmo um novo|
|Responsividade não está clara|Mobile/tablet — como adapta?|
|Acessibilidade comprometida|Contraste baixo, foco invisível, etc.|

### 8.2 Pode Decidir Sozinho

|Situação|Por quê|
|---|---|
|Implementação técnica do mesmo design|É escolha de código, não de design|
|Espaçamento entre componentes em listas dinâmicas|Padrão consistente vence|
|Comportamento de hover/foco padrão|Componente UI já define|
|Adaptação trivial entre breakpoints|Stack vertical no mobile, etc.|

### 8.3 Como Conversar

Formato eficaz: **mostre o problema com opções**.

```
Olá Designer,

Estou implementando a tela X. Notei dois pontos:

1. Estado vazio: quando o usuário não tem produtos, o que mostramos?
   Sugestão A: ilustração + texto + botão "Adicionar primeiro produto"
   Sugestão B: só texto + link "Saiba como adicionar"

2. Loading: skeleton dos cards ou spinner central?
   Sugestão A: 3 skeletons (mantém layout estável)
   Sugestão B: spinner centralizado (mais simples)

Implemento como você preferir.
```

Você dá opções, ele decide. Decisão é dele; implementação é sua.

---

## 9. Pixel Perfect vs Intent Perfect

Tema delicado. Há duas escolas extremas, ambas erradas:

|Escola|Defeito|
|---|---|
|**Pixel perfect**|Replica milímetros, ignora que tipografia/espaço dependem de contexto|
|**"Aproximadamente"**|Solta demais, design vira sugestão|

### 9.1 Intent Perfect (a abordagem certa)

Você implementa para reproduzir a **intenção** do designer, não os pixels.

|Aspecto|Pixel-perfect|Intent-perfect|
|---|---|---|
|Espaçamento|`padding: 23px` (medido do Figma)|`padding: 24px` (escala do design system)|
|Fonte|`font-size: 17px` (medido)|`font-size: 1rem` (token)|
|Cor|`#3D8BFF` (cor exata do Figma)|`text-primary` (token do design system)|
|Layout|Posições absolutas para combinar exato|Flexbox/Grid responsivo|

Pixel-perfect quebra quando o conteúdo muda. Intent-perfect mantém a intenção mesmo com nome mais longo, idioma diferente, fonte do sistema.

### 9.2 Quando Pixel Importa de Verdade

Algumas situações **exigem** precisão:

- Logo: tamanho exato é parte da identidade
- Ícones em escalas pequenas: 16px ≠ 17px
- Componentes de marketing/hero: tipografia gigante onde 2px conta
- Animações sincronizadas com timing específico

Para essas, peça assets do designer (SVG do logo, especificação clara) e replique.

### 9.3 Negociando com Designer

Bom designer entende intent perfect. Se algum insiste em pixels:

- Mostre o trade-off (responsividade quebra, acessibilidade sofre)
- Sugira tokens ao design system se a "exatidão" é repetida
- Use Storybook ou showcase para ele ver render real

---

## 10. Designs Incompletos ou Inconsistentes

Vai acontecer: design tem buracos. Como agir.

### 10.1 Tipos de Problema

|Problema|Exemplo|
|---|---|
|**Faltando estado**|Sem design para estado vazio|
|**Faltando interação**|"Onde clica no card?" não está documentado|
|**Inconsistência interna**|Botão azul em duas telas, mas tons diferentes|
|**Inconsistência com sistema**|Nova fonte aparece sem motivo|
|**Resolução ambígua**|Mobile não desenhado|
|**Acessibilidade ruim**|Texto cinza claro sobre fundo cinza claro|

### 10.2 Como Tratar Cada

#### Faltando estado/interação

Proponha. Lista de opções no formato da seção 8.3.

#### Inconsistência interna

Pergunte ao designer qual é a fonte da verdade. **Não escolha sozinho** — pode estar consertando o errado.

#### Inconsistência com sistema

Cor/fonte/espaçamento fora do design system geralmente é **erro do designer**. Confirme antes de implementar a divergência (e antes de "consertar" silenciosamente).

#### Resolução ambígua

Proponha adaptações com motivos: "no mobile, sugiro stack vertical porque..."

#### Acessibilidade ruim

**Cumpra os padrões mínimos (WCAG AA) mesmo que o design viole.** Documente a decisão. Mostre ao designer alternativas que mantêm a "vibe".

### 10.3 Registro de Decisões

Decisões tomadas durante tradução **viram histórico**:

```markdown
## Decisões Tomadas Durante Implementação

- **Estado vazio:** designer não definiu. Implementado como `<EstadoVazio>` padrão com mensagem "Nenhum produto cadastrado" + botão CTA. **Pendente:** confirmação do designer.
- **Mobile:** design só tinha desktop. Adaptei com stack vertical mantendo hierarquia. **Pendente:** validação visual.
- **Contraste do botão "Salvar":** design tinha 3.2:1. Aumentei para 4.5:1 (WCAG AA). Tom muito próximo do original.
```

Vai no arquivo da tarefa concluída ([módulo 20](https://claude.ai/chat/20-ciclo-tarefa.md)).

---

## 11. Exemplo Prático Completo

Vou aplicar tudo num exemplo concreto.

### 11.1 Cenário

Designer entrega Figma de uma **tela de avaliações de um produto**:

> "Tela mostra avaliações que o produto recebeu. Cada avaliação tem nota (1-5 estrelas), nome do autor, data, e comentário opcional. Tem filtro por nota no topo. Botão 'Adicionar avaliação' no rodapé."

### 11.2 Fase 1: Análise Visual

**Componentes identificados:**

- Cabeçalho da tela com título "Avaliações de [produto]"
- Filtro de notas: pílulas clicáveis 1★, 2★, 3★, 4★, 5★
- Lista de avaliações: cards verticais
- Cada card: estrelas + nome + data + comentário
- Botão fixo no rodapé: "Adicionar avaliação"

**Hierarquia visual:**

```
Página
├── Header (título)
├── FiltrosBar (pílulas de notas)
├── ListaAvaliacoes
│   └── CardAvaliacao (repetido)
└── BotaoAdicionar (footer fixo)
```

**Cores e tokens:**

- Tudo dentro do design system existente
- Estrelas dourado (#FFC107) — verificar se existe token
- Texto secundário (data) em cinza

**Estados:**

- Padrão: várias avaliações ✅ (design mostra)
- Vazio: produto sem avaliações ❌ (não tem)
- Carregando ❌ (não tem)
- Erro ❌ (não tem)

**Perguntas:**

1. Estado vazio — mensagem? CTA?
2. Loading — skeleton ou spinner?
3. Paginação — todas de uma vez ou paginado?
4. Click no card — abre detalhe ou nada?

### 11.3 Fase 2: Spec Técnica

```markdown
## Spec: Tela de Avaliações do Produto

**Rota:** `/produtos/:produtoId/avaliacoes`
**Acesso:** público (qualquer um vê avaliações)

### Mapeamento Visual → Código
| Elemento | Componente | É novo? |
|---|---|---|
| Cabeçalho | Header genérico | Não |
| Filtros de nota | `FiltroNotas` | **Sim** |
| Pílula de nota | `BotaoFiltro` (variante existente?) | Verificar |
| Card de avaliação | `CardAvaliacao` | **Sim** |
| Componente de estrelas | `ExibicaoEstrelas` | **Sim** |
| Botão "Adicionar" | `Botao variante=primario` | Não |

### Estados
| Estado | Condição | Renderiza | Design? |
|---|---|---|---|
| Padrão | avaliações.length > 0 | Lista | Sim |
| Vazio | avaliações.length === 0 | `EstadoVazio` "Sem avaliações ainda" + CTA | **Propor** |
| Carregando | isLoading | Skeleton de 3 cards | **Propor** |
| Erro | erro | `EstadoErro` com botão retry | **Propor** |

### Navegação
| Ação | Destino |
|---|---|
| Clicar "Adicionar avaliação" | `/produtos/:produtoId/avaliacoes/nova` |
| Clicar filtro de nota | Filtra in-place (não navega) |

### Componentes Novos
- `FiltroNotas` → `components/avaliacao/`
- `CardAvaliacao` → `components/avaliacao/`
- `ExibicaoEstrelas` → `components/ui/` (genérico)
```

### 11.4 Fase 3: Plano de Componentes

|Componente|Onde|Por quê|
|---|---|---|
|`ExibicaoEstrelas`|`ui/`|Genérico — pode aparecer em qualquer rating|
|`FiltroNotas`|`avaliacao/`|Específico desse domínio|
|`CardAvaliacao`|`avaliacao/`|Conhece estrutura da avaliação|
|`EstadoVazio`|`ui/`|Já existe? Verificar|
|`EstadoErro`|`ui/`|Já existe? Verificar|

### 11.5 Fase 4: Ordem de Implementação

```
1. src/types/avaliacao.ts                    Tipo da Avaliação (entidade ou já existe?)
2. src/services/avaliacaoService.ts          Buscar avaliações da API
3. src/hooks/useAvaliacoes.ts                Estado: lista, filtro, loading, erro
4. src/components/ui/ExibicaoEstrelas.tsx    Componente genérico
5. src/components/avaliacao/CardAvaliacao.tsx
6. src/components/avaliacao/FiltroNotas.tsx
7. src/pages/PaginaAvaliacoes.tsx            Composição
```

A cada passo: commit, teste, prossiga.

### 11.6 Implementação da Page (Resultado Final Esperado)

```tsx
// src/pages/PaginaAvaliacoes.tsx
import { useParams } from 'react-router-dom'
import { useAvaliacoes } from '@/hooks/useAvaliacoes'
import { FiltroNotas } from '@/components/avaliacao/FiltroNotas'
import { CardAvaliacao } from '@/components/avaliacao/CardAvaliacao'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { EstadoErro } from '@/components/ui/EstadoErro'
import { Skeleton } from '@/components/ui/Skeleton'

export function PaginaAvaliacoes() {
  const { produtoId } = useParams()
  const vm = useAvaliacoes(produtoId!)

  if (vm.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (vm.erro) {
    return <EstadoErro mensagem={vm.erro} onRetry={vm.recarregar} />
  }

  if (vm.avaliacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Sem avaliações ainda"
        mensagem="Seja o primeiro a avaliar este produto."
        cta={{ texto: 'Adicionar avaliação', href: `/produtos/${produtoId}/avaliacoes/nova` }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <FiltroNotas
        notaSelecionada={vm.filtroNota}
        onSelecionar={vm.filtrarPorNota}
      />
      <ul className="space-y-3">
        {vm.avaliacoes.map(av => (
          <li key={av.id}>
            <CardAvaliacao avaliacao={av} />
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Note:**

- Page é composição (sem useState, sem fetch, sem cálculos)
- Cada estado tratado explicitamente
- Reusou `EstadoVazio`, `EstadoErro`, `Skeleton` (existentes)
- Criou apenas `FiltroNotas` e `CardAvaliacao` (e o `ExibicaoEstrelas` interno)

---

## 12. Anti-Padrões

|Anti-padrão|Sintoma|Conserto|
|---|---|---|
|Codar antes de spec|Refatoração no fim|Spec sempre antes|
|Inventar estados sem perguntar|Designer "não era isso"|Propor opções e perguntar|
|Pixel-perfect rigoroso|Quebra responsivo|Intent perfect com tokens|
|Criar componente duplicado|`<MeuBotao>` redundante|Verificar antes de criar|
|Ignorar estados não-felizes|Tela quebra sem dados|Listar todos os estados|
|Implementar de cima para baixo|Page com `???` esperando|Ordem: types → page|
|Não documentar decisões|Designer confuso depois|"Decisões Tomadas" na tarefa|
|Implementar acessibilidade ruim "porque está no design"|WCAG violado|Cumprir AA mínimo, alertar designer|

---

## 13. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Começar codando?|Não. Análise → spec → plano → implementação|
|Estados não desenhados?|Listar e propor (não inventar silenciosamente)|
|Reuso ou novo?|Verifique existente primeiro|
|Pixel ou intent?|Intent perfect (tokens, não medidas)|
|Ordem de implementação?|Da fundação ao topo: types → page|
|Designer "errou" no contraste?|Cumpra AA mínimo. Alerte|
|Mobile não desenhado?|Pergunte. Não invente|
|Decisões durante implementação?|Documente na tarefa|

---

## 🔗 Módulos Relacionados

- [`11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Onde cada componente vai
- [`12-react-e-estado.md`](https://claude.ai/padroes/12-react-e-estado.md) — Padrão de page limpa + hook de feature
- [`13-ui-e-design-system.md`](https://claude.ai/padroes/13-ui-e-design-system.md) — Componentes UI vs domínio
- [`20-ciclo-tarefa.md`](https://claude.ai/chat/20-ciclo-tarefa.md) — Spec entra no plano da tarefa
- [`25-analise-impacto.md`](https://claude.ai/chat/25-analise-impacto.md) — Para mudanças em features existentes
# Projeto MotoCalc RJ Índice para IA
#### `docs/contexto-projeto-ai.md`

## Documentos oficiais 

## Regra 0 Antes de Qualquer Coisa

1. Ler este documento por completo
2. Ler '/docs/tarefas/em-andamento.md', depois pergunte se pode iniciar o planejamento da tarefa. Se sim, leia o arquivo `.github/agents/geral-robusto/01-nucleo.md.md` — esse é o núcleo do pacote de agente que define os princípios e processo de trabalho. Nunca agir sem seguir esses padrões e sem contexto específico do projeto atual. 
3. Obtenha contexto específico desse projeto necessário antes de agir, leia o que for preciso em docs/ ou arquivos do projeto, você já sabe onde fica cada coisa pois aqui está tudo documentado onde encotrar cada coisa. 
4. Leia os documentos principais da raiz do projeto.
5. Só então agir

## Documentos do Projeto

| Assunto | Arquivo |
|---|---|
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Glossário do domínio | `docs/dominio/_glossario.md` |
| Invariantes | `docs/dominio/invariantes.md` |
| Dívida técnica | `docs/dominio/divida-tecnica.md` |
| Modelagem detalhada do domínio | `docs/dominio/modelagem/` |
| Design de telas e navegação | `docs/design/` |
| Fluxo de onboarding | `docs/design/indices-links-tela-figma.md` |
| Arquitetura visão geral e pastas | `docs/contexto-projeto-ai.md` |
| Estado inicial e persistência | `docs/arquitetura/estado_inicial.md` |
| Componentes de UI existentes | `src/components/` |
| Rotas da aplicação | `src/App.tsx` |
| Convenções de código | `docs/arquitetura/convencoes.md` |
| Padrão de testes | `docs/padrao-testes.md` |
| Tema e tokens Tailwind | `docs/design/tema-tailwind.md` |
| Setup inicial | `docs/arquitetura/setup-inicial.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Tarefas pendentes | `docs/tarefas/pendentes.md` |
| Labels das Tarefas| `docs/tarefas/labels-tarefas.md` |
| Tarefa em andamento | `docs/tarefas/em-andamento.md` |
| Tarefas concluídas | `docs/tarefas/concluidas/` |
| Índice de tarefas concluídas | `docs/tarefas/concluidas/0-indice-concluidas.md` |
| Protocolo de testes | `docs/padrao-testes.md` |



## Como aplicar o comportamento neste projeto

- **Idioma:** tudo em português (variáveis, componentes, docs).
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes, hooks com prefixo `use`.
- **Estado:** Context + useReducer, persistido via `services/perfilStorage.ts`.
- **Cálculos:** `utils/calculos.ts` é imutável; novas funções de cálculo seguem o mesmo estilo.
- **UI:** shadcn/ui copiado para `components/ui/`, tokens usam a convenção CSS do Shadcn.
- **Testes:** Vitest com `describe/it`, nomes em português, padrão AAA.

## Instruções Específicas para a IA

- **Antes de alterar qualquer cálculo:** leia `docs/dominio/invariantes.md`.
- **Antes de criar/editar componentes:** verifique se já existe algo similar em `src/components/` e siga `docs/design/tema-tailwind.md`.
- **Nunca modifique `src/utils/calculos.ts` sem aprovação explícita.**
- **Nunca acesse `localStorage` diretamente** use `src/services/perfilStorage.ts`.
- **Ao concluir uma task que altera estado/cálculos/persistência:** rode `npm run test` e confirme que todos os testes estão verdes.
- **Registre cada ação no arquivo da tarefa** (`docs/tarefas/em-andamento.md` ou o arquivo em `concluidas/`) usando o formato padronizado (prefixo, data, revisão, testes).
- **Se gerar novas tarefas a partir de uma revisão ou ADR, use os prefixos corretos** (RF, RN, RNF, BG, REF, DOC) e adicione em `docs/tarefas/pendentes.md`.
- Toda leitura/escrita em `localStorage` usa as chaves e o fluxo definidos em `docs/arquitetura/estado_inicial.md`. Nunca acesse diretamente.
- **Spacing/sizing seguem a escala numérica padrão do Tailwind** (`p-4`, `gap-2`, `space-y-4`…). **Nunca redefina `--spacing-*` no `@theme`** nem use chaves nomeadas (`p-md`, `gap-sm`): colidem com `max-w-*` no Tailwind v4 (ADR-008). O `npm run lint` barra via `scripts/check-spacing-tokens.mjs`.


# Arquitetura Visão Geral do MotoCalc RJ

> **Propósito:** Documentar a estrutura real de pastas, decisões arquiteturais imutáveis e links para os documentos de arquitetura específicos.
> **Público:** IA e desenvolvedores. Para visitantes, ver `README.md`.

---

## Estrutura Real de Pastas (src/)

```
src/
├── App.tsx                  # Rotas e providers
├── main.tsx                 # Entry point, carrega fixtures em DEV
├── index.css                # Tailwind v4 + tokens shadcn
├── types/
│   ├── perfil.ts            # PerfilUsuario, PresetEntry, PerfilAction
│   └── calculos.ts          # GranularidadesCusto, CustosPorCategoria, FiltrosCategorias
├── utils/
│   ├── calculos.ts          # ✅ NUNCA TOCAR sem aprovação (ver `npm run test` para contagem)
│   ├── calculos.test.ts
│   └── formatters.ts        # moeda(), cpkFormatado(), kmFormatado()
├── services/
│   ├── perfilStorage.ts     # IPerfilStorage + LocalStoragePerfilStorage
│   └── fipeService.ts       # BrasilAPI com cache
├── context/
│   ├── PerfilContext.tsx    # Provider + useReducer + perfilPadrao
│   ├── PerfilContext.test.ts
│   └── ThemeContext.tsx
├── hooks/
│   ├── usePerfil.ts
│   └── useCustos.ts
├── routes/
│   └── RotaProtegida.tsx
├── data/
│   ├── dados_rj.json
│   └── catalogoModelos.ts
├── presets/
│   └── pop110i.json         # ✅ IMUTÁVEL EM RUNTIME
├── fixtures/
│   └── usuario_teste.json   # Carregado só em DEV
├── assets/
│   └── icons/               # 22 SVGs Material Symbols (referência raw — não importados diretamente)
├── components/
│   ├── ui/                  # Wrappers shadcn/ui (accordion, badge, button, card, input, label, etc.)
│   ├── icons/
│   │   └── index.tsx        # 23 exportações: 22 ícones SVG (Material Symbols) + IconMoeda
│   ├── CabecalhoVoltar.tsx  # Header compartilhado: botão voltar (shadcn Button ghost) + título
│   ├── estimativa/
│   │   ├── DonutChart.tsx
│   │   ├── CardPeriodo.tsx  # Card de período (label + km + valor). Props: label, km, valor
│   │   ├── SecaoRodagem.tsx # Seção km/dia e dias/semana. shadcn Input, Button, Label
│   │   ├── DistribuicaoCustos.tsx # Donut + legenda. Props: segmentos[]
│   │   └── CardCpk.tsx      # Card custo/km. Props: porKm, porKmSemAlimentacao?
│   ├── detalhamento/
│   │   ├── Toggle.tsx       # Toggle checkbox-styled (custom — não shadcn Switch; thumb diferente)
│   │   ├── LinhaDetalhe.tsx # Linha label + valor formatado
│   │   ├── CategoriaAccordion.tsx # Linha de categoria com toggle + chevron expand
│   │   ├── CardTotalAnual.tsx     # Resumo no topo: total anual, mensal, cpk/km
│   │   ├── SeletorPeriodo.tsx     # Barra Ano/Mês/Sem/Dia/Hora. Exporta tipo Periodo
│   │   ├── SecaoManutencao.tsx    # Revisão geral + peças com toggles individuais
│   │   └── SecaoImprevistos.tsx   # Gastos custom: accordion com toggle, delete e aviso
│   └── layout/
│       ├── LayoutApp.tsx
│       └── NavBar.tsx
└── pages/
    ├── PaginaEstimativa.tsx    # 127 linhas ✅
    ├── PaginaDetalhamento.tsx  # 199 linhas ✅
    ├── PaginaMaoDeObra.tsx
    ├── PaginaInsumos.tsx
    ├── PaginaAjustes.tsx
    ├── PaginaPerfil.tsx
    ├── PaginaOnboarding.tsx
    └── onboarding/
        ├── FluxoOnboarding.tsx
        ├── PassoLayout.tsx
        ├── onboardingUtils.ts
        └── passos/
            ├── Passo1.tsx … Passo9.tsx
            ├── Passo6Aluguel.tsx
            ├── Passo6Financiamento.tsx
            ├── Passo6Responsabilidade.tsx
            └── PassoConfirmacao.tsx
```

---

## Decisões Arquiteturais Imutáveis

- **Idioma:** Português em tudo variáveis, componentes, tipos, comentários, testes.
- **Estado global:** Context + `useReducer`. Um contexto por domínio. Não atomizar.
- **Persistência:** `localStorage` acessado exclusivamente via `services/perfilStorage.ts`.
- **Presets JSON:** Imutáveis em runtime. Toda personalização vai para overrides no perfil.
- **Cálculos:** `utils/calculos.ts` é imutável (ver `npm run test` para contagem atual). Novas funções de cálculo seguem o mesmo estilo, mas não alteram as existentes sem aprovação.
- **Roteamento:** React Router v7 (modo biblioteca — API v6 preservada).
- **UI base:** shadcn/ui instalado. Wrappers em `components/ui/`. Componentes em uso: Card, Button, Input, Label, Badge, Accordion, Dialog, Switch, Tabs, Sheet, Separator, Toggle.
- **Testes:** Vitest com `describe`/`it`, padrão AAA, nomes em português.
- **Build:** Vite + `vite-plugin-pwa` (Service Worker).

---

## Modelo de Custo Anual (Manutenção): Amortizado × Ancorado

> **Por que esta seção existe:** o app combina dois modelos de projeção de custo por peça no mesmo total anual. Entender a diferença é pré-requisito para qualquer task que toque `calcularCpkPorPeca`, `calcularCicloPeca` ou a Seção Manutenção do Detalhamento. Modelo conceitualizado aqui após uso real do app em **27/05/26** — referência canônica para futuras decisões.

### Conceito de "ano" no MotoCalc RJ

O total anual exibido **não** é "ano calendário fixo 2026" nem "rolling 12 meses do calendário". É um **híbrido**:

| Categoria | Conceito de "ano" usado |
|---|---|
| Manutenção (peças), Revisão, Combustível | Projeção amortizada de 12 meses a partir do **estado atual** da moto (`kmAnual = kmDia × diasSemana × 52`). Não vinculado a calendário. |
| IPVA / Licenciamento | Ano calendário corrente (`new Date().getFullYear()`). |

Manter essa distinção ao explicar valores ao usuário ou modificar cálculos: não existe "ano 2026 inteiro"; existe "projeção de 12 meses adiante" para custos operacionais e "ano calendário" para custos legais.

### Dois modos de cálculo por peça (`calcularCicloPeca` em [`src/utils/calculos.ts`](../src/utils/calculos.ts))

| Modo | Quando dispara | Fórmula | `trocasNoAno` típico | `custoAnual` |
|---|---|---|---|---|
| **Amortizado** | `kmUltimaTroca = 0` (usuário não informou) **ou** peça ausente de `MAPA_PECA_PARA_KM_ULTIMA_TROCA` | `trocasNoAno = kmAnual / intervalo` | Fracionário (0,18; 1,52; 3,03…) | `trocasNoAno × preço` (fração do preço cheio) |
| **Ancorado** | `kmUltimaTroca > 0` (preenchido no card "Últimas manutenções") **e** peça mapeada | Projeta eventos reais em `(kmAtual, kmAtual + kmAnual]` | Inteiro (0, 1, 2, 14…) | `n × preçoCheio` |

**custoAnual** = `trocasNoAno × preço` em ambos os modos — a diferença é o que `trocasNoAno` representa.

### Exemplo prático (Pop 110i, `kmAnual ≈ 18.200`, `kmAtual = 90.000`)

| Peça | Modo | Intervalo | `kmUltimaTroca` | `trocasNoAno` real | `custoAnual` |
|---|---|---|---|---|---|
| Óleo motor | Ancorado | 1.250 km | 80.000 | 14 | R$ 560,00 |
| Pneu traseiro | Ancorado | 16.000 km | 60.000 | 2 | R$ 490,00 |
| Pneu dianteiro | Ancorado | 25.000 km | 78.000 | 1 | R$ 209,00 |
| Kit relação | Ancorado | 18.000 km | 78.000 | 1 | R$ 230,00 |
| Vela ignição | Amortizado | 12.000 km | — | 1,52 | R$ 124,37 |
| Bateria | Amortizado (temporal) | 24 meses | — | 0,50 | R$ 164,90 |
| Kit cilindro | Amortizado | 100.000 km | — | **0,18** | **R$ 65,67** |

### Por que isto importa — pontos sensíveis

- **Convergem no longo prazo, divergem ano a ano.** Em horizonte de 10 anos os dois modelos somam o mesmo total. Em um ano específico podem divergir em ordem de grandeza.
- **Amortizado subestima/superestima conforme posição no ciclo.** Kit cilindro a 5.000 km do gatilho (100k km) provisiona R$ 65 (`0,18 × R$ 360`) quando deveria provisionar **R$ 360 cheio** — uma troca real está prevista. Moto recém-trocada provisiona o mesmo valor mesmo sem nenhuma troca prevista nos próximos 5 anos.
- **TASK-RF-6.13 estende a ancoragem:** `MAPA_PECA_PARA_KM_ULTIMA_TROCA` em `calculos.ts` cobre as peças rastreáveis do card de últimas trocas; retíficas usam mapa paralelo por serviço. Itens com km informado entram no modo ancorado, e itens sem km informado continuam no fallback amortizado.
- **TASK-RF-6.24 remove `kit_revisao` da ancoragem:** o kit revisão representa juntas/anéis/vedações recorrentes das revisões regulares. No modo independente entra automaticamente no fallback amortizado de 6.000 km; no modo autorizado fica absorvido pelo pacote Honda. Não aparece em Ajustes como última troca editável.

### Display atual — débito de UX conhecido

Em [`src/components/detalhamento/SecaoManutencao.tsx`](../src/components/detalhamento/SecaoManutencao.tsx) (linha 117) o número exibido na coluna esquerda é `Math.ceil(peca.trocasNoAno)`. Isso converte `0,18` em **`1×`** e mistura visualmente "fração amortizada" com "1 troca real prevista". A **TASK-BG-005** resolveu o problema irmão para Imprevistos exibindo `preço cheio + ≈ valor amortizado`. Seção Manutenção ainda não recebeu tratamento equivalente — abrir BG dedicada quando priorizado.

### Regras práticas para o agente

- **Ao tocar `calcularCpkPorPeca` ou `calcularCicloPeca`:** o ramo amortizado é o **fallback obrigatório**, nunca remover. Campo `kmUltimaTroca = 0` significa "modo amortizado, comportamento canônico".
- **Ao adicionar peça nova ao preset:** decidir explicitamente se ela entra em `MAPA_PECA_PARA_KM_ULTIMA_TROCA` e se precisa aparecer no card de últimas trocas. Se o usuário pode informar uma troca real, prefira rastrear; se não houver evento editável claro, mantenha amortizado. Consumíveis recorrentes de revisão, como `kit_revisao`, ficam fora do card.
- **Ao exibir `trocasNoAno` na UI:** prefira mostrar o valor real (com vírgula decimal) ou diferenciar visualmente amortizado de ancorado. `Math.ceil` esconde informação relevante e induz interpretação errada.
- **Ao escrever/reescrever testes que envolvem custos anuais:** o teste precisa explicitar se assume modo amortizado (sem `kmUltimaTrocas`) ou ancorado (`kmUltimaTrocas` definido). Os dois caminhos produzem `custoAnual` diferentes para a mesma peça.
- **Ao explicar números ao usuário:** "este custo anual é uma projeção amortizada/cíclica" — nunca "este é o custo do ano de 2026" (não é calendário) nem "é o que você vai gastar no próximo ano exato" (é estimativa com fronteira de modelo conhecida).

---

## Documentos de Arquitetura Relacionados

| Documento | Conteúdo |
|---|---|
| `estado_inicial.md` | Fluxo de leitura no arranque, chaves do localStorage, `perfilPadrao` |
| `src/components/` | Componentes existentes de interface e layout |
| `src/App.tsx` | Lista real de rotas e proteção de acesso |
| `convencoes.md` | Convenções de nomenclatura, idioma, exemplos de código correto/incorreto |
| `docs/padrao-testes.md` | Padrão de testes (Vitest, AAA, cobertura mínima, nomes em PT) |
| `docs/design/tema-tailwind.md` | Tokens de cor Shadcn, tipografia, classes customizadas |
| `setup-inicial.md` | Passo a passo para setup do projeto |
| `ADR/` | Decisões arquiteturais registradas (ADR-001, ADR-002, ...) |

---

description: "Template do contexto-projeto-ai.md: ponto de entrada de toda IA em qualquer projeto que adote este pacote." modulo: "33" categoria: "templates" versao: "1.0" arquivo_destino: "docs/contexto-projeto-ai.md" relacionado:

- "01-nucleo.md"
- "26-inicializacao-projeto.md"
- "11-arquitetura-e-pastas.md"

---

# 📇 Template: `contexto-projeto-ai.md`

> **Arquivo destino:** `docs/contexto-projeto-ai.md` **Quando usar:** ao iniciar projeto novo OU ao executar [módulo 26 (inicialização)](https://claude.ai/processos/26-inicializacao-projeto.md) em projeto existente. Este é o **único arquivo que toda IA lê em toda interação**. Trate com cuidado proporcional.

---

## Por Que Este Template É Crítico

O pacote `.agent/` é **portátil entre projetos**. Para fazer o "salto" entre regras genéricas e contexto específico, existe **um único ponto de entrada**: `docs/contexto-projeto-ai.md`.

Sem ele, a IA não sabe:

- Em qual projeto está
- Qual é a stack exata
- Que decisões já foram tomadas
- O que o produto faz (e o que **não** faz)
- Para onde olhar quando precisar de detalhe

Com ele, em 2-3 minutos de leitura, a IA tem orientação suficiente para qualquer tarefa.

---

## Princípios

### O Que ENTRA

- **Stack exata** (versões importantes, libs principais)
- **Estrutura real** de pastas (se diverge do padrão, dizer)
- **Rotas** (lista completa ou amostra representativa)
- **Decisões inegociáveis** (idioma, padrão de estado, etc.)
- **Convenções específicas** (que divergem do default do pacote)
- **O que o projeto NÃO faz** (limites claros)
- **Links para documentação detalhada**
- **Hierarquia de regras** (este arquivo vs núcleo do pacote)

### O Que NÃO ENTRA

- ❌ **Detalhes de implementação** (vão em código + ADRs)
- ❌ **Requisitos completos** (vão em `docs/requisitos/`)
- ❌ **Glossário extenso** (vai em `docs/dominios/glossario.md`)
- ❌ **Histórico de mudanças do produto** (vai em CHANGELOG ou tarefas concluídas)
- ❌ **Tutoriais de tecnologias** (vão em docs externas)
- ❌ **Roadmap de produto** (vai em ferramenta de produto)
- ❌ **Senhas, tokens, segredos** (nunca)

**Teste de inclusão:** se a informação é necessária para a IA decidir como agir corretamente em qualquer tarefa, entra. Senão, fica em arquivo dedicado e linka daqui.

### Tamanho Alvo

- **Mínimo útil:** 50 linhas
- **Médio típico:** 100-150 linhas
- **Limite saudável:** 250 linhas

Passou de 300, está duplicando coisa que devia estar em outro lugar.

---

## Estrutura Completa (Exemplo Preenchido)

Exemplo de um projeto real fictício: app de gestão de aluguel de carros (continuação do exemplo do módulo 26).

```markdown
# Contexto do Projeto: AlugaCar

> Sistema de gestão de aluguel de carros para frotas pequenas e médias (B2B).
> Web app responsivo, foco em desktop com adaptação para mobile.

## Stack Exata

| Tecnologia | Versão | Nota |
|---|---|---|
| React | 18.2 | strict mode ativo |
| TypeScript | 5.4 | strict, paths configurados |
| Vite | 5.1 | sem PWA |
| Tailwind | 3.3 | utility puro (sem shadcn) |
| React Router | 6.20 | rotas declaradas em `src/routes.tsx` |
| Zustand | 4.4 | estado global |
| react-hook-form | 7.45 | formulários |
| Zod | 3.22 | validação + schemas |
| Vitest | 1.4 | testes (em adoção — apenas 12 arquivos com teste) |
| @testing-library/react | 14.2 | testes de componentes |

## Estrutura Real de Pastas

⚠️ **Diverge do padrão do pacote `.agent/`** em alguns pontos. Documentado em [ADR-001](./arquitetura/ADR/ADR-001.md).

```

src/ ├── components/ # padrão do pacote ├── hooks/ # padrão do pacote ├── pages/ # padrão do pacote ├── stores/ # ❗ diverge: em vez de context/, usamos Zustand ├── api/ # ❗ diverge: em vez de services/, chamamos api/ ├── lib/ # utilitários de libs externas └── types/ # tipos do domínio

```

Decisão de manter o que existe (em vez de migrar) por custo benefício. Detalhes em ADR-001.

## Rotas

| Rota | Page | Acesso |
|---|---|---|
| `/login` | PaginaLogin | público |
| `/dashboard` | PaginaDashboard | autenticado |
| `/aluguel/novo` | PaginaCriarAluguel | autenticado |
| `/aluguel/:id` | PaginaDetalheAluguel | autenticado |
| `/frota` | PaginaFrota | autenticado, admin |
| `/clientes` | PaginaClientes | autenticado |

Lista completa e atualizada em [`docs/arquitetura/rotas.md`](./arquitetura/rotas.md).

## Decisões Inegociáveis

Estes pontos foram decididos e **não devem ser revistos sem ADR explícita**:

- **Idioma do código:** Português (PT). Inclui variáveis, funções, componentes, comentários, testes.
- **Estado global:** Zustand (não Context+useReducer). Stores em `src/stores/[dominio]Store.ts`.
- **Validação:** Zod schemas como fonte da verdade. Tipos derivados via `z.infer`.
- **Formulários:** react-hook-form + Zod resolver.
- **Acesso ao backend:** isolado em `src/api/`. Componentes nunca chamam `fetch` direto.
- **Imports absolutos:** via `@/` (configurado em `tsconfig.json` e `vite.config.ts`).

## Convenções Específicas (diferem do default do pacote)

- **Pasta `stores/` em vez de `context/`** — porque usamos Zustand.
- **Pasta `api/` em vez de `services/`** — convenção legada, mantida por custo de migração.
- **Hooks de feature retornam objeto chamado `vm`** quando consumidos por pages.
- **Cores de status** definidas em `tailwind.config.ts` com `success`, `warning`, `danger` (não usar cores Tailwind padrão `green-500`, `red-500` etc. diretamente para status).

## O Que Este Projeto NÃO Faz

Lista explícita para prevenir invenção de features:

- ❌ **Não tem autenticação OAuth.** Só email/senha. (Planejado para TASK-RF-9.2.)
- ❌ **Não tem testes E2E.** Decisão consciente — ver ADR-005.
- ❌ **Não é PWA.** Sem service worker, sem instalação. Foco em web tradicional.
- ❌ **Não tem modo escuro.** Decisão de produto.
- ❌ **Não suporta multi-tenant nativamente.** Cada cliente é um deploy próprio.
- ❌ **Não tem internacionalização.** Português apenas.

## Documentação de Referência

Links para arquivos detalhados:

- **Requisitos:** [`docs/requisitos/`](./requisitos/)
- **Domínio (glossário, invariantes, modelagem):** [`docs/dominios/`](./dominios/)
- **Design (telas, fluxos):** [`docs/design/`](./design/)
- **Decisões arquiteturais:** [`docs/arquitetura/ADR/`](./arquitetura/ADR/)
- **Convenções de código detalhadas:** [`docs/arquitetura/convencoes.md`](./arquitetura/convencoes.md)
- **Setup inicial:** [`docs/arquitetura/setup-inicial.md`](./arquitetura/setup-inicial.md)
- **Tarefas:** [`docs/tarefas/`](./tarefas/)

## Hierarquia de Regras

Quando duas fontes de instrução discordam, vale esta ordem:

1. **Este arquivo** (`contexto-projeto-ai.md`) vence quase sempre
2. **Núcleo do pacote** (`.agent/01-nucleo.md`) vence nas **3 exceções inegociáveis**:
   - Confirmação antes de ações destrutivas
   - Proibição de `any` sem justificativa
   - "Código é a verdade primária"
3. **Demais módulos** de `.agent/`

Detalhes da hierarquia: [`.agent/01-nucleo.md` seção 1.3](../.agent/01-nucleo.md#13-hierarquia-de-regras-resolução-de-conflito).

## Estado Atual do Projeto

- **Fase:** beta interno (clientes-piloto)
- **Maturidade:** estável em features core; instável em relatórios
- **Cobertura de testes:** ~30% (em crescimento)
- **Dívidas técnicas conhecidas:** ver [`docs/dominios/divida-tecnica.md`](./dominios/divida-tecnica.md)

## Última Atualização

- **Data:** 13/05/26
- **Por:** Inicialização via módulo 26 do pacote `.agent/`
- **Próxima revisão sugerida:** ao concluir TASK-RF-9.2 (OAuth) ou em 3 meses, o que vier primeiro.
```

---

## Template Vazio (Para Copiar)

```markdown
# Contexto do Projeto: [Nome do Projeto]

> [1-2 frases sobre o que o produto faz e para quem.]
> [Modalidade: web app / mobile / desktop / API / etc.]

## Stack Exata

| Tecnologia | Versão | Nota |
|---|---|---|
| [Framework principal] | [versão] | [strict mode? config especial?] |
| TypeScript | [versão] | [strict ativo?] |
| [Build tool] | [versão] | [config especial?] |
| [Styling] | [versão] | [biblioteca de componentes?] |
| [Estado global] | [versão] | [Context / Zustand / Redux / etc.] |
| [Formulários] | [versão] | [se aplicável] |
| [Validação] | [versão] | [se aplicável] |
| [Testes] | [versão] | [framework + libs] |

## Estrutura Real de Pastas

[Se segue o padrão de `.agent/11-arquitetura-e-pastas.md`, basta dizer "Padrão do pacote."]
[Se diverge em alguns pontos, mostre a estrutura real e linke a ADR que documenta.]

```

src/ ├── ...

```

## Rotas

| Rota | Page | Acesso |
|---|---|---|
| [exemplo] | [PaginaExemplo] | [público / autenticado / admin] |

[Para projetos com muitas rotas, liste as 5-10 principais e linke para arquivo completo em `docs/arquitetura/rotas.md`]

## Decisões Inegociáveis

[Pontos que não devem ser revistos sem ADR explícita]

- **Idioma do código:** [PT / EN]
- **Estado global:** [solução escolhida]
- **Validação:** [solução escolhida]
- **Formulários:** [solução escolhida]
- **Acesso ao backend:** [como isolado]
- **Imports:** [convenção]

## Convenções Específicas

[Apenas pontos onde o projeto diverge do default do pacote]

- [convenção 1]
- [convenção 2]

## O Que Este Projeto NÃO Faz

[Lista explícita para prevenir invenção de features]

- ❌ [feature ausente 1] (motivo / ADR / planejamento futuro)
- ❌ [feature ausente 2]

## Documentação de Referência

- **Requisitos:** [`docs/requisitos/`](./requisitos/)
- **Domínio:** [`docs/dominios/`](./dominios/)
- **Design:** [`docs/design/`](./design/)
- **ADRs:** [`docs/arquitetura/ADR/`](./arquitetura/ADR/)
- **Convenções:** [`docs/arquitetura/convencoes.md`](./arquitetura/convencoes.md)
- **Setup:** [`docs/arquitetura/setup-inicial.md`](./arquitetura/setup-inicial.md)
- **Tarefas:** [`docs/tarefas/`](./tarefas/)

## Hierarquia de Regras

Quando duas fontes de instrução discordam:

1. **Este arquivo** vence quase sempre
2. **Núcleo do pacote** (`.agent/01-nucleo.md`) vence nas 3 exceções inegociáveis:
   - Confirmação antes de ações destrutivas
   - Proibição de `any` sem justificativa
   - "Código é a verdade primária"
3. **Demais módulos** de `.agent/`

## Estado Atual do Projeto

- **Fase:** [protótipo / MVP / beta / produção]
- **Maturidade:** [estável / em construção / instável em X]
- **Cobertura de testes:** [aproximada]
- **Dívidas técnicas conhecidas:** [`docs/dominios/divida-tecnica.md`](./dominios/divida-tecnica.md)

## Última Atualização

- **Data:** DD/MM/AA
- **Por:** [tarefa / inicialização / refatoração]
- **Próxima revisão sugerida:** [evento ou data]
```

---

## Variante 1: Projeto Novo do Zero

Quando o projeto está sendo iniciado **agora**, a maior parte do conteúdo é **decisão consciente**, não engenharia reversa.

Diferenças do template padrão:

```markdown
## Estado Atual do Projeto

- **Fase:** setup inicial
- **Maturidade:** ainda não rodou em produção
- **Cobertura de testes:** infraestrutura preparada; cobertura virá com as features
- **Dívidas técnicas conhecidas:** nenhuma ainda
```

E na seção `Estrutura Real de Pastas`:

```markdown
## Estrutura Planejada

[Para projeto novo, pode descrever a estrutura **alvo** — o que será construído]

```

src/ ├── ... (em criação)

```

A estrutura segue o padrão do pacote `.agent/11-arquitetura-e-pastas.md` sem divergências.
```

Para projeto novo, costuma ser mais curto (60-100 linhas) — não tem histórico nem decisões herdadas.

---

## Variante 2: Após Inicialização (Engenharia Reversa)

Quando o projeto **já existia** e foi documentado retroativamente via módulo 26:

Adicione **nota de origem** no início:

```markdown
# Contexto do Projeto: [Nome]

> [Descrição do produto]

## ⚙️ Nota de Origem

Este `contexto-projeto-ai.md` foi criado em DD/MM/AA via [módulo 26 (inicialização)](../.agent/processos/26-inicializacao-projeto.md). O projeto **já existia** antes da adoção do pacote `.agent/`.

Alguns pontos podem ser **retrospectivos** (registrar decisão que já estava implementada) e estão marcados com `(retrospectivo)`. ADRs retrospectivas estão em `docs/arquitetura/ADR/` com status `Aceita (retrospectiva)`.

Documentação antiga (anterior à inicialização) está arquivada em [`docs/arquivo/`](./arquivo/).
```

E nas decisões inegociáveis:

```markdown
## Decisões Inegociáveis

- **Estado global:** Zustand (retrospectivo — ADR-002)
- **Acesso ao backend:** pasta `api/` (retrospectivo — ADR-001)
- ...
```

---

## Variante 3: Projeto Solo Pequeno

Para projeto pessoal/estudo, muita coisa do template inflada não faz sentido. Versão enxuta:

```markdown
# Contexto do Projeto: [Nome]

> [Descrição em 1 frase]

## Stack
- React 18, TypeScript 5, Vite, Tailwind 3
- Estado: Context + useReducer
- Forms: react-hook-form + Zod
- Testes: Vitest

## Estrutura
Padrão do pacote `.agent/`.

## Decisões
- Idioma: Português
- Imports: `@/` absoluto

## NÃO Faz
- Sem autenticação (projeto local)
- Sem testes E2E

## Documentação
- Requisitos: `docs/requisitos/`
- ADRs: `docs/arquitetura/ADR/`
- Tarefas: `docs/tarefas/`

## Hierarquia
Padrão do pacote (núcleo nas 3 inegociáveis, este arquivo no resto).

## Última atualização
13/05/26
```

40 linhas dá conta. **Não infle artificialmente.**

---

## Como Manter Atualizado

`contexto-projeto-ai.md` envelhece se não for cuidado. Critérios para atualizar:

### Sempre Atualize Quando

|Evento|Atualização|
|---|---|
|Stack muda (versão major ou lib nova)|Tabela de Stack|
|Estrutura de pastas muda|Estrutura Real|
|Rota nova ou removida|Tabela de Rotas (se principal)|
|ADR é criada/aceita|Convenções ou Decisões Inegociáveis|
|Feature importante muda status (NÃO faz → faz, ou vice-versa)|O Que NÃO Faz|
|Fase do projeto muda (MVP → beta → produção)|Estado Atual|

### Pode Esperar

- Mudanças cosméticas no UI
- Refatorações internas que não mudam interface
- Tarefas concluídas (ficam em `concluidas/`, não inflam o contexto)

### Quem Atualiza

- **Tarefas que afetam contexto** já incluem atualização na seção "Documentação atualizada" do template 31
- **IA pode propor atualização** ao detectar drift entre `contexto-projeto-ai.md` e código real

---

## Mini-FAQ

**1. Posso ter um `contexto-projeto-ai.md` em cada subpasta?** Não. Um por projeto. Se o projeto é monorepo com sub-projetos, cada sub-projeto pode ter seu próprio, mas geralmente é melhor um arquivo raiz que lista as áreas.

**2. E se o projeto tem requisitos confidenciais que não posso documentar?** Mencione a área genericamente. Ex: _"Cobre processamento de pagamentos (detalhes em sistema interno, não documentados aqui por confidencialidade)."_ Nunca documente nada que viole NDA ou política de segurança.

**3. Devo listar TODAS as rotas?** Não. Para projetos com 30+ rotas, liste as 5-10 mais importantes e linke `docs/arquitetura/rotas.md` para a lista completa.

**4. Posso usar este arquivo para onboarding humano?** Sim, é útil. Mas humanos preferem o `README.md` da raiz, que costuma ter foco em "como rodar". Este arquivo foca em "como decidir".

**5. E se duas decisões inegociáveis começam a conflitar?** Sinal de que uma delas precisa virar ADR retrospectiva nova que resolve o conflito. **Não silencie** o conflito mantendo as duas como inegociáveis.

**6. Como sei se está desatualizado?** Auditoria leve a cada 3-6 meses. Compare cada seção com o estado real do código. Drift > 20% é sinal de revisão urgente.

**7. Posso linkar para documentação externa (Notion, Confluence)?** Pode, mas com cautela. Vantagem: tudo no Git. Risco: docs externas mudam URL, ficam obsoletas. Prefira manter o essencial no próprio repo.

**8. Como apresentar este arquivo para uma nova IA num chat?** Cole o conteúdo na primeira mensagem ou referencie como contexto. A IA precisa ler este arquivo **antes** de qualquer tarefa.

---

## 🔗 Templates e Módulos Relacionados

- [`../01-nucleo.md`](https://claude.ai/01-nucleo.md) — Hierarquia de regras
- [`../processos/26-inicializacao-projeto.md`](https://claude.ai/processos/26-inicializacao-projeto.md) — Como criar do zero em projeto existente
- [`../padroes/11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Estrutura padrão linkada aqui
- [`34-readme-projeto.md`](https://claude.ai/chat/34-readme-projeto.md) — README.md complementa (foco em humanos)
- [`32-adr.md`](https://claude.ai/chat/32-adr.md) — ADRs linkadas a partir daqui
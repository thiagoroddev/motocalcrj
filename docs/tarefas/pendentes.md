# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

---

## Tarefas Prioritárias (Imediata)

_Nenhuma tarefa Imediata aberta._

> ✅ **Bloco de lançamento concluído em 28/07/26** (origem:
> [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md)). As seis tarefas cobriam o
> que estava **quebrado, exposto ou ausente** no repositório e no deploy de um app já publicado:
>
> | Tarefa | Entregou |
> |---|---|
> | `TASK-CHORE-020` (19h10) | 10 vulnerabilidades corrigidas, incluindo CVE HIGH de produção |
> | `TASK-RNF-016` (19h40) | Fonte auto-hospedada — zero requisição a terceiros |
> | `TASK-RNF-015` (20h40) | 6 headers de segurança, CSP bloqueante, **A+** no securityheaders.com |
> | `TASK-CHORE-021` (21h25) | CI no GitHub Actions, com o gate provado (verde → vermelho → verde) |
> | `TASK-DOC-020` (22h35) | 4 capturas reais no README |
> | `TASK-REF-47` (23h00) | Code-splitting: maior chunk 921 → 320 kB |
>
> | `TASK-RNF-9.1` (29/07) | Lighthouse: acessibilidade 86 → **100**, best practices 96 → **100** |
>
> **Ainda aberta e ligada a este bloco:** `TASK-RNF-9.2` (QA final, `Crítico`, nunca feita).
> Fechá-la é o que encerra de fato o assunto lançamento.

---

## Normais




### Analytics, PWA e Play Store (Fases 9 e 13)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-8.1 | Analytics (Umami) — trackEvent centralizado | Standard | Importante | Normal | M/M | - | - | `[ ]` | - |
| TASK-RNF-8.3 | TWA — publicação na Google Play Store | Standard | Desejável | Normal | G/G | - | - | `[ ]` | - |

> **TASK-RNF-8.2 (PWA) concluída** no lançamento — ver `concluidas/2026-06-15--13h45--TASK-RNF-8.2.md`. PWA entregue sem Umami, então a dependência 8.2→8.1 foi removida; a 8.3 (TWA) já pode ser feita sobre o PWA atual.

### Qualidade e Polimento (Fase 10)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Standard | Crítico | Normal | G/G | Todas as anteriores | - | `[ ]` | - |

> ⚠️ **A `9.2` continua aberta com o app já publicado** — é `Crítico` e nunca foi feita.
>
> A `9.1` foi concluída em 29/07: primeiro Lighthouse do projeto, com acessibilidade e best practices
> em 100. A revisão dela deixou duas observações para a `TASK-CHORE-024`: auditar **múltiplas rotas**
> (a medição cobre só a tela inicial) e fixar as metas atingidas como **orçamento** que reprova em
> regressão — sem isso, esses números se degradam sem ninguém notar, que é exatamente o que aconteceu
> entre a criação do `43-performance.md` e hoje.

### Higiene de repositório e portão de lançamento (origem: análise de 28/07/26)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-CHORE-022 | Dependabot semanal para dependências e GitHub Actions | Light | Importante | Normal | P/P | TASK-CHORE-021 | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-023 | Corrigir integridade de `.github/agents/`: 33 arquivos `.md.md`, 504 links mortos, frontmatter inválido | Standard | Importante | Normal | M/G | - | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-024 | `npm run gate:lancamento` — portão mecânico pré-deploy | Standard | Importante | Normal | M/G | TASK-CHORE-021 | - | `[ ]` | 28/07/26 18:30 |
| TASK-TEST-007 | Testes de aceite rastreáveis por requisito (RF crítico → teste que cita o ID) | Strict | Importante | Normal | G/G | - | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-025 | Avaliar react-router v8 e advisories de tooling (eslint, vite-plugin-pwa/workbox) | Strict | Importante | Normal | M/G | - | gerada pela TASK-CHORE-020 | `[ ]` | 28/07/26 19:00 |
| TASK-REF-48 | Carregar presets sob demanda (~345 kB de JSON hoje no chunk inicial) | Strict | Importante | Normal | G/G | - | gerada pela TASK-REF-47 | `[ ]` | 28/07/26 23:00 |

**Detalhamento:**

- **TASK-CHORE-022** — hoje nada avisa quando sai CVE nova; a `TASK-CHORE-020` existe justamente
  porque ninguém olhou por 197 tarefas. Criar `.github/dependabot.yml` com ecossistemas `npm` e
  `github-actions`, frequência semanal, PRs agrupados por patch/minor para não virar ruído.

- **TASK-CHORE-023** — o `README` e o [`docs/uso-de-ia.md`](../uso-de-ia.md) apontam publicamente para
  `.github/agents/` como prova do processo de engenharia, mas a pasta está fisicamente quebrada:
  **33 de 36** arquivos com extensão dupla `.md.md`; **504** links internos apontando para
  `https://claude.ai/...` (nenhum resolve); frontmatter YAML inválido em todo o `geral-robusto/`
  (linha em branco após `---` e campos colapsados numa linha, então o `applyTo` nunca é aplicado);
  `18-segurança-privacidade.md.md` com acento, referenciado 6× sem acento; versão do núcleo (`3.3`)
  divergindo do changelog (`1.0.0`); e dois pacotes concorrentes (`geral-leve/` × `geral-robusto/`)
  sem precedência declarada. **Escopo aqui é só a integridade dos arquivos** — a evolução do conteúdo
  do agente acontece em outro projeto. Critério de aceite: extensões `.md` corretas, todo link
  interno resolvendo para caminho relativo do repositório, frontmatter válido, versão única,
  precedência entre os dois pacotes registrada em `contexto-projeto-ai.md`.

- **TASK-CHORE-024** — script que decide, sozinho, se o projeto pode ir a público: `verify` verde +
  zero vulnerabilidade alta em produção + headers presentes + nenhum chunk acima do orçamento +
  metas de Lighthouse + nenhuma tarefa `Crítico`+`IMEDIATA` aberta. Especificação em
  [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md) §5. Aplicado ao estado de
  28/07/26, bloquearia em 5 dos 9 itens — que é exatamente o ponto.

- **TASK-CHORE-025** — gerada pela `TASK-CHORE-020`, que corrigiu as 10 vulnerabilidades originais mas
  esbarrou numa leva nova de advisories publicada no mesmo dia, toda exigindo **major**. Três grupos,
  nenhum deles corrigível dentro de uma tarefa de manutenção simples:
  - **`react-router` — "RSC Mode CSRF Bypass"** (`>=7.12.0 <8.3.0`, corrigido só em **8.3.0**). É o
    único que chega ao bundle de produção, mas **não se aplica a este app**: a vulnerabilidade é do
    modo RSC (React Server Components / server actions) e aqui não há servidor — `src/App.tsx` usa
    `<BrowserRouter>` + `<Routes>`, e `createBrowserRouter`, `RouterProvider`, `loader=`, `action=` e
    `useFetcher` têm **zero** ocorrências no `src/`. Avaliar a migração v7→v8 pelo guia oficial,
    revalidando as 15 telas que importam o router (rotas aninhadas, `RotaProtegida` e o `Routes`
    aninhado do onboarding são os pontos de risco).
  - **eslint / eslint-plugin-import / minimatch / brace-expansion** (6 advisories) — só ferramenta de
    lint, não chega ao usuário. A "correção" sugerida pela npm inclui `eslint@10` (major) e um
    **downgrade** de `eslint-plugin-import` para 1.14.0.
  - **vite-plugin-pwa / workbox-build / ejs / jake / filelist** (6 advisories) — só build-time. A
    "correção" sugerida é **downgrade** do `vite-plugin-pwa` 1.3.0 → 1.2.0, o que mexeria no PWA
    entregue na `TASK-RNF-8.2`. Não fazer sem avaliar.
  - **Nunca resolver isto com `npm audit fix --force`** sem ler o que ele faz: no estado de 28/07/26
    ele aplicaria os dois downgrades acima.

- **TASK-REF-48** — gerada pela `TASK-REF-47`, que fez o code-splitting e mediu onde o peso realmente
  estava. Depois do split, o chunk inicial ainda tem **320 kB**, e a maior parte disso são os
  **345 kB de JSON dos 16 presets**: `src/data/repositorioPresets.ts` faz
  `import.meta.glob('../presets/*.json', { eager: true })` e ainda **valida os 16 com Zod na
  inicialização** — quando o usuário usa **um**. É o maior ganho de performance restante do projeto
  (quase metade da carga inicial) e o que mais afeta o público em 4G.
  - **Por que não foi feito na REF-47:** `obterPreset()` é API **síncrona** consumida pelo reducer,
    por `criarEstadoInicial` e pelo motor de cálculo (`calculos.ts`). Torná-la assíncrona é
    refatoração da camada de domínio, na área que já gerou 38 `TASK-BG`. Exige análise de impacto
    própria — não pode ser efeito colateral de uma tarefa de build.
  - **O que investigar:** separar **metadados** (marca, modelo, anos — necessários no seletor do
    onboarding) do **corpo pesado** (FIPE por ano, peças, revisões, vida útil), carregando só o
    segundo sob demanda. Avaliar se a validação Zod pode sair da inicialização e acontecer no
    carregamento de cada preset — isso tiraria o `vendor-zod` (72 kB) do caminho crítico também.
  - **Cuidado:** `normalizarPerfilContraPreset` reconcilia o perfil persistido contra o preset
    canônico a cada cálculo; qualquer assincronia aqui muda o contrato de inicialização do estado.
    Os 466 testes existentes são a rede de proteção — nenhum deles pode ser afrouxado para "fazer
    passar".

- **TASK-TEST-007** — os 466 testes cobrem unidades, mas nada liga `docs/requisitos/` a `src/**`.
  Por isso as 38 `TASK-BG` foram, na maioria, divergências de regra de negócio encontradas pelo
  humano usando o app, não pela suíte. Nomear os testes de aceite com o ID do requisito
  (`RF-6.11: ...`) e gerar um relatório de quais RF obrigatórios ainda não têm teste.

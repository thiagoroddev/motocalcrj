Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" — vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas — absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).


#### Geradas pela Revisão Geral — 31/05/26

> Lote de 9 tarefas geradas por revisão geral do projeto (humano + IA). Cada item foi
> verificado contra o código antes de registrar. Severidades reclassificadas após
> verificação. Ordem abaixo é por prioridade combinada (Valor + risco).

## TASK-TEST-001 — Testes do fipeService (BrasilAPI: parsing, rota rápida, fallback e erro)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 31/05/26 12:20; extraída da antiga TASK-TEST-001 em 31/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  **Motivação:** mesmo descartando migrations históricas, `src/services/fipeService.ts` continua sem
  teste direto. Ele faz parsing de valor BRL, decide entre rota rápida por `codigoFipe` e rota
  completa por marca/modelo/ano, e retorna `null` em erro/timeout. Uma regressão aqui pode quebrar
  a consulta FIPE do onboarding sem afetar a suíte atual.

  **Plano proposto:** criar `src/services/fipeService.test.ts`, mockando `global.fetch` sem rede
  real, para cobrir: (1) rota rápida `/preco/v1/{codigoFipe}` com parsing de `"R$ 9.999,00"` →
  `9999`; (2) rota rápida sem ano compatível cai para rota completa; (3) rota completa marcas →
  modelos → anos → preço; (4) HTTP não-ok/fetch reject retorna `null`; (5) timeout/abort retorna
  `null`. Isolar cache interno com `vi.resetModules()` ou dados únicos por teste.

  **Aceite:** fluxos principais e falhas do `fipeService` cobertos; nenhum acesso real à BrasilAPI
  durante testes; `npm run test` verde.

## TASK-CHORE-014 — Guarda catálogo↔preset: todo id do CATALOGO precisa ter preset JSON
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 31/05/26 12:20
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  **Risco (latente hoje):** `src/hooks/useCustos.ts:22` resolve o preset por
  `PRESETS[perfil.moto.modelo]`; se `PRESETS[modelo]` for undefined, `useCustos` retorna null e a
  Estimativa inteira cai em "Modelo não encontrado" (`PaginaEstimativa.tsx:39`,
  `PaginaDetalhamento.tsx:164`). Hoje só existe `pop110i`, então não dispara — mas no dia que um
  modelo for adicionado ao `CATALOGO` (`src/data/catalogoModelos.ts:15`) SEM criar o
  `src/presets/<id>.json` correspondente, o app quebra para quem escolher esse modelo.
  **Causa-raiz:** acoplamento por convenção de string — o `id` do catálogo precisa bater com o
  nome do arquivo em `src/presets/*.json`, montado via `import.meta.glob`
  (`src/hooks/useCustos.ts:7-14`), sem garantia em compile-time nem runtime.
  **Correção sugerida:** teste automatizado (ex.: `src/data/catalogoPresets.test.ts`) que importa
  `CATALOGO` + o glob de presets e assere que **todo** id do catálogo tem preset; opcionalmente um
  fallback amigável na UI (mensagem orientando refazer onboarding) em vez de tela morta.
  **Aceite:** o teste passa hoje (pop110i) e falha se um modelo do catálogo ficar sem preset.

## TASK-TEST-002 — Smoke tests de UI (onboarding→estimativa, Detalhamento) e perfilStorage
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data-hora origem:** 31/05/26 12:20
- **Dependências:** —
- **REQ/ADR/DT:** ADR-010, RNF-10
- **Observações:**
  **Motivação (proteção):** a camada visual está 100% sem teste automatizado — os 202 testes
  cobrem lógica/contexto/schema/ErrorBoundary, nenhum componente/página. O cluster recente de bugs
  era justamente de UI (TASK-BG-017 seguro, BG-019 onboarding, BG-020 bateria), exatamente o que
  testes de componente/integração pegariam. A `TASK-RNF-9.2` é QA **manual**, não cobre isto.
  Complementa a `TASK-TEST-001` (FIPE) e a `TASK-REF-30` (contrato limpo de storage/schema).
  **Escopo sugerido:** (1) integração com `@testing-library/react` (já é devDep): fluxo de
  onboarding feliz (preencher passos → `COMMIT_ONBOARDING` → `/estimativa` renderiza SEM "Modelo
  não encontrado"); render de `PaginaEstimativa` e `PaginaDetalhamento` com preset de fixture
  (toggle de categoria reflete no total); regressões de `TASK-BG-018` (alimentação off não some o
  CPK da moto) e `TASK-BG-017` (re-editar seguro não dobra). (2) `src/services/perfilStorage.test.ts`:
  salvar/carregar presets, `setPresetAtivo(null)` remove a chave, `preservarCorrompido` grava
  `.corrupted` e NUNCA lança.
  **Nota de ambiente:** `vite.config.ts` usa `test.environment: 'node'`; testes de componente
  precisam de `jsdom` (já é devDep) — declarar `// @vitest-environment jsdom` nesses arquivos.
  Atenção à guarda `VITEST`/`NODE_ENV` (TASK-CHORE-013) que faz `React.act` funcionar nos render
  tests — seguir o padrão do `ErrorBoundary.render.test.tsx` já existente.
  **Aceite:** fluxo onboarding→estimativa coberto, `perfilStorage` coberto, `npm run test` verde.


## Decisões de UI/UX Pendentes


## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |


---

## Analytics, PWA e Play Store (Fases 9 e 13)

| ID           | Título                                         | Valor      | Urgência | Esforço | Dependências | Status |
| ------------ | ---------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RNF-8.1 | Analytics (Umami) - trackEvent centralizado    | Importante | Normal   | M       | -            | [ ]    |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Crítico    | Normal   | G       | TASK-RNF-8.1 | [ ]    |
| TASK-RNF-8.3 | TWA - publicação na Google Play Store          | Crítico    | Normal   | G       | TASK-RNF-8.2 | [ ]    |

---

## Qualidade e Polimento (Fase 10)

| ID           | Título                                                      | Valor      | Urgência | Esforço | Dependências        | Status |
| ------------ | ----------------------------------------------------------- | ---------- | -------- | ------- | ------------------- | ------ |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Importante | Normal   | G       | -                   | [ ]    |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo)         | Crítico    | Normal   | G       | Todas as anteriores | [ ]    |

---

## Documentação

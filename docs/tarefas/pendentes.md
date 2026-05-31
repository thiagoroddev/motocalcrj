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

## TASK-DOC-013 — Corrigir README (notas coladas, contagem de testes, claim "funciona offline")
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 31/05/26 12:20
- **Dependências:** —
- **REQ/ADR/DT:** RNF-8.2 (PWA completo — já no backlog)
- **Observações:**
  **Sintoma:** o `README.md` contém informação errada e rascunho pessoal vazado.
  **Detalhes:** (1) das linhas ~50 em diante há notas coladas por acidente (snippets de
  `localStorage.removeItem`, "Ou num liner só", tabela de "amortizado" com markdown quebrado) que
  não deveriam estar no README público (mover para `docs/` se útil, senão remover); (2)
  `README.md:22` diz "Vitest (92 testes)" — hoje são 202; (3) `README.md:11` afirma "Funciona
  offline após o primeiro acesso (PWA)" mas NÃO há PWA implementado: não existe `vite-plugin-pwa`
  em `package.json`, não há service worker/manifest, e `index.html:8-10` carrega a fonte Inter do
  CDN do Google (peso contra offline). A implementação real do PWA já está rastreada em
  **TASK-RNF-8.2** — esta tarefa é só alinhar o README à realidade. **Correção sugerida:** remover
  as notas vazadas, corrigir contagem de testes (ou remover número fixo), e ou remover a afirmação
  de offline ou marcá-la como "planejado (TASK-RNF-8.2)". **Aceite:** README sem rascunhos, sem
  afirmações falsas; números coerentes com o estado atual.

## TASK-TEST-001 — Testes da cadeia de migração (migrarPerfil v5→v23) e do parsing do fipeService
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 31/05/26 12:20
- **Dependências:** —
- **REQ/ADR/DT:** ADR-010
- **Observações:**
  **Motivação (proteção, não é bug vivo):** os caminhos que podem corromper dados do usuário
  silenciosamente não têm teste direto. `src/services/migracoes.ts` (395 linhas, 18 passos v5→v23)
  só é exercitado de raspão via `criarEstadoInicial.test.ts`; uma regressão num passo antigo
  estraga perfis reais sem ninguém perceber. `src/services/fipeService.ts` (parsing de
  `"R$ 9.999,00"` → número e fallback de rota) também não tem teste. **Escopo sugerido:** (1)
  `migracoes.test.ts` table-driven — para cada versão N, um blob de entrada mínimo no shape vN e a
  asserção do shape esperado vN+1 (campos adicionados/removidos/renomeados conforme cada `if`),
  além de um teste end-to-end v5→v23 e idempotência (rodar 2× = mesmo resultado); validar o
  resultado final contra `perfilSchema`. (2) `fipeService.test.ts` — mockar `fetch` e cobrir:
  parsing de valor BRL, rota rápida por código, fallback de 4 chamadas, timeout/erro → retorna null.
  **Aceite:** cobertura dos 18 passos de migração e dos ramos do fipeService; `npm run test` verde.
  **Nota:** itens de qualidade adicionais da revisão (code-splitting do bundle de 650 KB, fontes
  text-[9px], tema claro inacabado) já são cobertos por TASK-RNF-9.1; `resolverKmDia` identidade e
  memoização são triviais e ficam fora de tarefa formal.

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
  Complementa a `TASK-TEST-001` (que cobre lógica de migração/FIPE).
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

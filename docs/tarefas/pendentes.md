Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" — vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas — absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

---

~~**TASK-RNF-10**~~ — **CONCLUÍDA** em 30/05/26 (validação zod na persistência + fallback recuperável; Strict, ADR-010; 186→198 verdes). Ver `concluidas/2026-05-30--17h13--TASK-RNF-10.md`.

---

## TASK-RNF-11 — ErrorBoundary na raiz com escape hatch (resetar / exportar dados)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 30/05/26 (gerada por revisão geral de tech lead)
- **Dependências:** relaciona-se com TASK-RNF-10 (não bloqueia)
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** busca em `src` não encontrou **nenhum** ErrorBoundary (`ErrorBoundary` / `componentDidCatch` / `getDerivedStateFromError`). Qualquer erro de render em qualquer tela = app em branco, sem mensagem e **sem saída** para o usuário se recuperar. Combinado com a fragilidade de dados da RNF-10, um perfil corrompido pode deixar o usuário preso sem nem conseguir limpar os dados.
  - **Local no código:**
    - Raiz de render: [`src/main.tsx`](../../src/main.tsx) e [`src/App.tsx`](../../src/App.tsx) (onde envolver com o boundary).
    - Reset de dados já existe em infra: [`LocalStoragePerfilStorage.limpar()`](../../src/services/perfilStorage.ts#L40) — o escape hatch pode reusar isso.
  - **Fix proposto:** criar `src/components/ErrorBoundary.tsx` (class component, é o único caso onde class é exigida no React) e envolver o `App`/rotas na raiz. Fallback UI com: mensagem amigável, botão **"Resetar dados"** (chama `storage.limpar()` + reload) e, se a TASK-RF-7.1 existir, botão **"Exportar dados"** antes de resetar (não perder o que dá pra salvar). Logar o erro no console (e futuramente em analytics — TASK-RNF-8.1).
  - **Cuidados:** Standard (componente novo na raiz, sem mudança de regra). Não engolir o erro em dev — relançar ou logar para não mascarar bugs durante desenvolvimento. Testar que o fallback renderiza ao lançar erro num filho e que "Resetar" limpa o storage e recarrega. Manter baseline 186 verdes.

---

## TASK-CHORE-010 — CI mínima (GitHub Action: test + tsc + lint) gateando PR

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 30/05/26 (gerada por revisão geral de tech lead)
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** não há `.github/workflows` (confirmado). Os gates de qualidade — `npm test` (186 verdes), `npx tsc --noEmit`, `npm run lint` (eslint + `check-spacing-tokens.mjs`) — só rodam na máquina do dev. Nada impede um PR/commit regredir o baseline silenciosamente. Num projeto que preza ciclo formal de tarefas, a CI é a rede que trava esse rigor.
  - **Local no código:**
    - Scripts já prontos em [`package.json`](../../package.json) (`test`, `lint`, `build`); a Action só os orquestra.
    - **Atenção ao ambiente:** o projeto roda com `NODE_ENV=production` e tem `.npmrc` — `npm install` poda devDeps. Na Action, garantir `npm ci --include=dev` (ou equivalente) senão vitest/eslint/tsc somem. (Ver TASK-CHORE-004 e a convenção de poda de devDeps do projeto.)
  - **Fix proposto:** criar `.github/workflows/ci.yml` disparando em `push`/`pull_request`: checkout → setup-node (versão do projeto) → `npm ci --include=dev` → `npx tsc --noEmit` → `npm run lint` → `npm test`. Opcional: `npm run build` como job final. Cache de `~/.npm` para velocidade.
  - **Cuidados:** Standard (infra, sem tocar código de produção). Confirmar a versão do Node usada localmente para espelhar na Action. Validar que `check-spacing-tokens.mjs` roda no runner. Sem segredos necessários (projeto é client-side).

---

## TASK-REF-28 — Extrair cadeia de migração de `PerfilContext.tsx` para `services/migracoes.ts`

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 30/05/26 (gerada por revisão geral de tech lead)
- **Dependências:** idealmente **após** TASK-RNF-10 (validação) para não retrabalhar a fronteira duas vezes
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** [`PerfilContext.tsx`](../../src/context/PerfilContext.tsx) tem **1.317 linhas** — arquivo-Deus que concentra reducer + defaults + context + **~370 linhas de migração** (`migrarPerfil`, v5 → v23). A migração é um subdomínio coeso, com lógica densa e `as any`, que merece módulo e teste próprios. Hoje cada passo é um `if (dados.schemaVersion === N)` sequencial inline, difícil de auditar e crescer.
  - **Local no código:**
    - Origem: [`src/context/PerfilContext.tsx:906-1280`](../../src/context/PerfilContext.tsx#L906) (`migrarPerfil`) + constante `SCHEMA_VERSION`/defaults usados por ela ([`linha 210`](../../src/context/PerfilContext.tsx#L210)).
    - Testes de migração presumivelmente em [`src/context/PerfilContext.test.ts`](../../src/context/PerfilContext.test.ts) (1248 linhas) — mover/ajustar imports junto.
  - **Fix proposto:** criar `src/services/migracoes.ts` exportando `migrarPerfil` (e, se ajudar, uma tabela por versão `{ 6: migra5para6, 7: migra6para7, ... }` aplicada em loop até `SCHEMA_VERSION`). `PerfilContext` passa a só importar. Refatoração pura — comportamento idêntico, mesmos resultados de migração.
  - **Cuidados:** Standard (refatoração com escopo claro, sem mudança de regra). **Não** alterar a lógica/valores de nenhuma migração — só mover e, opcionalmente, reorganizar em tabela. Mover os testes de migração junto e garantir que continuam verdes (baseline 186). Sequência: idealmente depois da RNF-10 para a validação já nascer no lugar certo e evitar mexer na mesma fronteira duas vezes (registrado como dependência preferencial, não rígida).

---

~~**TASK-REF-27**~~ — **CONCLUÍDA** em 30/05/26 (assinatura posicional → objeto de opções em `calcularCustoFinanciamentoAnual`; refatoração pura). Ver `concluidas/2026-05-30--16h19--TASK-REF-27.md`.

---

~~**TASK-RF-6.18**~~ — **CONCLUÍDA** em 30/05/26 (decrementar parcelas restantes de financiamento; modelagem Snapshot, cálculo Afunilar, Strict + ADR-009). Ver `concluidas/2026-05-30--10h19--TASK-RF-6.18.md`.

---

### Tarefas Normais

---

## Decisões de UI/UX Pendentes

| ID          | Título                                           | Valor      | Urgência   | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------ | ---------- | ---------- | ------- | ------------ | ------ |
| ~~TASK-RF-6.4~~ | ~~Conteúdo dos pop-ups de ajuda (ícone "?")~~ **ABSORVIDA pela TASK-RF-6.16** (conteúdo escrito e aprovado em 29/05/26) | Desejável  | Quando Der | P       | -            | [x]    |
| TASK-RF-6.5 | Seletor rápido de presets (ícone moto no header) | Desejável  | Quando Der | M       | -            | [ ]    |
| TASK-RF-6.6 | Decisão: hamburguer vs nav sempre visível        | Importante | Normal     | P       | -            | [ ]    |

---

## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |
| ~~TASK-RF-7.2~~ | ~~Histórico e alertas de manutenção (próxima troca)~~ **ADIADO** com RF-5.x (ADR-003) | Importante | Normal   | G       | RF-5.x       | [ ]    |

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

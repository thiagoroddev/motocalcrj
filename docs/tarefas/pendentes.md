Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" — vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas — absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

---

~~**TASK-RNF-10**~~ — **CONCLUÍDA** em 30/05/26 (validação zod na persistência + fallback recuperável; Strict, ADR-010; 186→198 verdes). Ver `concluidas/2026-05-30--17h13--TASK-RNF-10.md`.

---

~~**TASK-RNF-11**~~ — **CONCLUÍDA** em 30/05/26 (ErrorBoundary na raiz + escape hatch "Recarregar/Resetar"; Standard; 198→200 verdes). Ver `concluidas/2026-05-30--18h31--TASK-RNF-11.md`.

---

~~**TASK-CHORE-012**~~ — **CONCLUÍDA** em 30/05/26 (CI mínima: GitHub Action `npm ci`→tsc→lint→test→build em Node 22; Standard). Ver `concluidas/2026-05-30--18h42--TASK-CHORE-012.md`.

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

## TASK-CHORE-013 — Infra de teste de render (jsdom + @testing-library/react)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** Normal
- **Esforço-H/IA:** P/M
- **Data origem:** 30/05/26 (gerada pela revisão da TASK-RNF-11)
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** o projeto **não tem nenhum teste de render** — o vitest roda em `environment: 'node'` (ver [`vite.config.ts:15`](../../vite.config.ts#L15)), sem DOM, e não há `@testing-library/react`/`jsdom`. Por isso componentes como [`ErrorBoundary.tsx`](../../src/components/ErrorBoundary.tsx) só puderam ser testados na lógica pura (método estático + helper), sem assertar o fallback renderizado. Conforme a UI cresce, faltará rede para regressões visuais/de comportamento de componente.
  - **Local no código:**
    - Config de teste: [`vite.config.ts`](../../vite.config.ts) (bloco `test`, hoje `environment: 'node'`).
    - Primeiro candidato a ganhar render-test: [`src/components/ErrorBoundary.tsx`](../../src/components/ErrorBoundary.tsx) (assertar que o fallback aparece ao lançar erro num filho; que "Resetar" dispara o reset).
  - **Fix proposto:** adicionar devDeps `jsdom` (ou `happy-dom`) + `@testing-library/react` + `@testing-library/jest-dom`; configurar `environment: 'jsdom'` (por arquivo via comentário `// @vitest-environment jsdom` para não forçar DOM nos testes puros existentes, OU global com setup). Escrever um render-test piloto do `ErrorBoundary`. Confirmar que os 200 testes atuais (node) seguem verdes.
  - **Cuidados:** Standard (infra de teste + devDeps, sem tocar produção). Preferir `environment` por-arquivo para não tornar os testes de cálculo/contexto dependentes de DOM à toa (mais lentos). Lembrar da poda de devDeps do ambiente (`--include=dev`). Sem mudança de regra de negócio.

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

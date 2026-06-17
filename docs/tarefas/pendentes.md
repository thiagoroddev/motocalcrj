# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

---

## Tarefas Prioritárias (Imediata)

## TASK-REF-47 - Code-splitting do bundle principal (chunk > 500 kB)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 16/06/26 21:05
- **Dependências:** -
- **REQ/ADR/DT:** relacionada a TASK-RNF-9.1 (Performance e acessibilidade)
- **Observações:** O build de produção (commit `3d109db`, deploy Vercel) emite o aviso do Vite "Some chunks are larger than 500 kB after minification". O bundle único `dist/assets/index-*.js` está em **920,74 kB (226,68 kB gzip)** — tudo carregado de uma vez no primeiro acesso. Como é PWA com precache (Workbox, 14 entradas / ~2,5 MB), o tamanho também infla o precache inicial do service worker; depois do 1º acesso o app é offline, então o custo é **só no primeiro carregamento** — mas é justamente o público (motoboys/entregadores em 4G/conexão móvel) que mais sente isso.
  - **O que fazer:** quebrar o chunk monolítico. Opções combináveis: (1) `build.rollupOptions.output.manualChunks` separando vendors pesados (ex.: `react`/`react-dom`, `react-router-dom`, `@radix-ui/*`, `zod`, `react-minimal-pie-chart`, ícones); (2) `import()` dinâmico em rotas/telas não-iniciais (ex.: Detalhamento, Perfil, dialogs grandes) via `React.lazy` + `Suspense`.
  - **Critérios de aceite:** nenhum chunk individual acima de ~500 kB (ou `chunkSizeWarningLimit` ajustado *conscientemente* com justificativa, não como mascaramento); build sem o aviso; rotas continuam funcionando (testes verdes, navegação manual entre as 4 abas + Detalhamento/Perfil OK); PWA ainda instala e funciona offline após 1º acesso.
  - **Cuidado:** o `vite-plugin-pwa` faz precache via `globPatterns` (`**/*.{js,css,...}`) — conferir que os novos chunks lazy entram no precache (ou são revalidados em runtime) para não quebrar o offline. Não "resolver" o aviso só elevando `chunkSizeWarningLimit` sem dividir de fato (anti-padrão: esconder o sintoma).

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
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Standard | Importante | Normal | G/G | - | - | `[ ]` | - |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Standard | Crítico | Normal | G/G | Todas as anteriores | - | `[ ]` | - |

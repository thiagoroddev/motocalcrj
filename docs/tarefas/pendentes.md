# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

Colunas padrão das tabelas: `ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem`.

---

## Tarefas Prioritárias (Imediata)

---

## Normais

> **Épico Honda fase 2 concluído:** TASK-DOM-5 (docs) + BG-034/035/036 (UI/lógica) + **TASK-DOM-6** (6 presets:
> cg160start/fan/titan, bros160, xre190, cb250f) **concluídas**.

> **Épico TASK-RF-8 (bateria por tempo) CONCLUÍDO** (XG dividido em 4): **RF-8.1** (motor) + **RF-8.2**
> (presets + card KM) + **RF-8.3** (`CardBateria` em Ajustes/onboarding) + **RF-8.4** (bateria em Serviços
> Extras com select de anos). Addendum ADR-016. _Polimento opcional registrado: próxima troca/atraso no popover do Detalhamento._

### Export/Import e Alertas (Fase 11)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RF-7.1 | Exportar/importar predefinições individuais (.json) | Standard | Importante | Normal | G/G | TASK-BG-031 | RF-PERF-03, RF-EXP-01, ADR-021 | `[ ]` | - |
| TASK-REF-43 | Tornar `IMPORTAR_PERFIL` determinístico e normalizar antes do dispatch | Standard | Importante | Normal | M/M | TASK-RF-7.1 | ADR-010 | `[ ]` | 06/06/26 14:42 |

> TASK-RF-7.1: cada arquivo representa uma `PresetEntry`; a importação cria novo UUID e resolve colisões de sufixo sem sobrescrever silenciosamente outra predefinição.

### Analytics, PWA e Play Store (Fases 9 e 13)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-8.1 | Analytics (Umami) — trackEvent centralizado | Standard | Importante | Normal | M/M | - | - | `[ ]` | - |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Standard | Crítico | Normal | G/G | TASK-RNF-8.1 | - | `[ ]` | - |
| TASK-RNF-8.3 | TWA — publicação na Google Play Store | Standard | Crítico | Normal | G/G | TASK-RNF-8.2 | - | `[ ]` | - |

### Qualidade e Polimento (Fase 10)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Standard | Importante | Normal | G/G | - | - | `[ ]` | - |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Standard | Crítico | Normal | G/G | Todas as anteriores | - | `[ ]` | - |

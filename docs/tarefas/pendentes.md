# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

Colunas padrão das tabelas: `ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem`.

---

## Tarefas Prioritárias (Imediata)

_Nenhuma no momento._

> **Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8) — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo. Peças rastreáveis no card "Últimas manutenções" (vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro, retíficas) absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

---

## Normais

> **TASK-DOM-5** (documentação fase 1 Honda) **concluída**. Fase 2 (presets Honda, **um por modelo**)
> depende de corrigir os 2 bugs de UI abaixo — "resolver em um resolve em todos".

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-BG-035 | Onboarding (passo "Valor de mão de obra"): mostrar subseções Valor Completo/Incompleto como na aba Mão de Obra | Standard | Importante | Normal | M/M | - | TASK-BG-033, TASK-DOM-5 | `[ ]` | 14/06/26 16:43 |

> **TASK-BG-034** (Insumos: ocultar peça de serviço completo) **concluída** — o flag `concessionariaIncluiPeca` já dirige Insumos + cálculo. Falta **BG-035** para a fase 2 (DOM-6).
| TASK-DOM-6 | Presets dos 5 modelos Honda (fase 2), um por modelo | Standard | Importante | Normal | G/G | TASK-DOM-5, TASK-BG-034, TASK-BG-035 | ADR-019, ADR-014 | `[ ]` | 14/06/26 16:43 |

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

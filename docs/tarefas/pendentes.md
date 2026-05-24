Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

> **TASK-REF-15** concluída em 23/05/26 — ver `docs/tarefas/concluidas/` (escopo reformulado: PaginaAjustes movida para dentro do LayoutApp; CabecalhoVoltar promovido a barra superior e usado também em PaginaPerfil).

> **TASK-REF-13** concluída em 24/05/26 — ver `docs/tarefas/concluidas/` (fechamento por validação visual implícita em uso real entre 22/05 e 24/05).

> **TASK-REF-14** concluída em 24/05/26 — ver `docs/tarefas/concluidas/` (fechamento por validação visual implícita; débitos `CampoSwitch.tsx` e segmentado "Estimativa sobre dados" já resolvidos por REF-21 e REF-18 respectivamente).

> **TASK-REF-23** concluída em 24/05/26 — ver `docs/tarefas/concluidas/` (cleanup pós-revisão: `IconRegistros` morto removido, `_descricao` da fixture, lint format em 3 arquivos).

---

## Revisão geral das telas de configuração — ADR-005 e ADR-006 (20/05/26)

> Tarefas geradas pela revisão geral de Mão de Obra, Custos & Peças, Ajustes e Perfil.
> Decisões formalizadas em `docs/arquitetura/ADR/ADR-005.md` (responsabilidades entre telas) e `ADR-006.md` (cálculo de manutenção).
> Todas marcadas como IMEDIATA: precisam ser executadas com o contexto da revisão ainda fresco. Cada tarefa inclui testes como critério de conclusão (`docs/padrao-testes.md`).

> **TASK-BG-003** e **TASK-RF-6.7** concluídas em 22/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-16** concluída em 22/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-17** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-18** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-19** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-BG-004** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-21** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-RF-6.9** concluída em 23/05/26 — escopo reformulado para lista fechada de presets editáveis (Multa, Sinistros, Outros) e valor único acumulado, ver `docs/tarefas/concluidas/` e nota no ADR-003.

> **TASK-RF-6.11** concluída em 24/05/26 — ver `docs/tarefas/concluidas/`. Modelo híbrido: popup com cards reaproveitados das páginas (sincronização via dispatch) para Combustível/Internet/Seguro/Alimentação/Financiamento/Peças+MO; direcionamento com scroll/destaque para Revisão Geral Autorizada. Documentos sem lápis (não editável). Imprevistos mantém o popup inline atual.

> **TASK-RNF-10** concluída em 24/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-DOC-008** concluída em 24/05/26 — padronizada como "Insumos" (rota `/insumos`, `PaginaInsumos`, label `INSUMOS`), ver `docs/tarefas/concluidas/`.

> **TASK-REF-22** (converter `calcularCpkPorPeca` para objeto de opções) foi **absorvida pela TASK-RF-6.7** e concluída junto — 22/05/26.

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo); adicionar bateria e sapata de freio ao card "Últimas manutenções".

---

### Tarefas Normais


## ~~Registros e Formulários (Fase 6 do roadmap original)~~ ADIADO (ADR-003)

> **ADR-003:** Removido do escopo do MVP. A ser considerado como melhoria futura após o app estar em produção. Ver `docs/arquitetura/ADR/ADR-003.md`.

---

## Mão de Obra, Preço Peças e Perfil (Fases 7, 8 e 10)

> **ADR-004:** Modelo de Eventos por Serviço — MO e peças calculadas por CPK separados, unidos pelo `intervalKm` do serviço. TASK-REF-11 e TASK-REF-12 são pré-requisitos das abas UI.

_(TASK-RF-6.3.2, 6.3.3, 6.3.4 concluídas — ver índice)_

---

## Decisões de UI/UX Pendentes

| ID          | Título                                           | Valor      | Urgência   | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------ | ---------- | ---------- | ------- | ------------ | ------ |
| TASK-RF-6.4 | Conteúdo dos pop-ups de ajuda (ícone "?")        | Desejável  | Quando Der | P       | -            | [ ]    |
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

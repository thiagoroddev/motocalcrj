Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

_(nenhuma)_

---

### Tarefas Normais


## ~~Registros e Formulários (Fase 6 do roadmap original)~~ — ADIADO (ADR-003)

> **ADR-003:** Removido do escopo do MVP. A ser considerado como melhoria futura após o app estar em produção. Ver `docs/arquitetura/ADR/ADR-003.md`.

---

## Mão de Obra, Autonomia e Perfil (Fases 7, 8 e 10)

| ID          | Título                                                     | Valor      | Urgência | Esforço | Dependências             | Status |
| ----------- | ---------------------------------------------------------- | ---------- | -------- | ------- | ------------------------ | ------ |
| TASK-RF-6.1 | Aba Mão de Obra (serviços editáveis + reset)               | Importante | Normal   | G       | -                        | [ ]    |
| TASK-RF-6.2 | Aba Autonomia / Vida Útil (combustíveis, peças, pneus)     | Importante | Normal   | G       | -                        | [ ]    |
| TASK-RF-6.3 | Tela Perfil + Ajustes de Predefinição (5 seções com reset) — **sem toggle de modo de cálculo** (ADR-003) | Importante | Normal   | G       | TASK-RF-6.1, TASK-RF-6.2 | [ ]    |

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
| ~~TASK-RF-7.2~~ | ~~Histórico e alertas de manutenção (próxima troca)~~ — **ADIADO** com RF-5.x (ADR-003) | Importante | Normal   | G       | RF-5.x       | [ ]    |

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

| ID          | Título                                                           | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ---------------------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-DOC-01 | Criar docs/design/telas-navegacao.md a partir dos specs do Figma | Importante | Normal   | M       | -            | [ ]    |
| TASK-DOC-02 | Migrar backlog antigo para o novo padrão de tarefas              | Importante | Normal   | M       | -            | [ ]    |

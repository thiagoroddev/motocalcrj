Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

## TASK-REF-07 — Onboarding Passo1-3 — shadcn + correção IPVA + dual-track FIPE

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** M/G
- **Data origem:** 18/05/26
- **Dependências:** TASK-REF-06
- **REQ/ADR/DT:** —
- **Observações:** BrasilAPI FIPE retorna HTTP 500 (serviço fora do ar) — causa raiz do bug "IPVA zerado no Detalhamento". Escopo: (1) novo endpoint `/api/fipe/preco/v1/{codigoFipe}` como rota principal (1 chamada vs 4 atuais); (2) campo `tabelaFipe: Record<number, number>` nos presets como fallback offline obrigatório — IPVA = R$ 0 é inaceitável; (3) `codigoFipe` da Pop 110i marcado "a confirmar" (descobrir via site oficial da FIPE ou quando API voltar); (4) migração Passo1, Passo2, Passo3 para shadcn Input/Button + padronização min-h-touch.

---

### Tarefas Normais

## Refatoração Onboarding com shadcn

| TASK-ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
|---|---|:---:|:---:|:---:|:---:|---|---|:---:|---|
| TASK-REF-06 | PassoLayout — shadcn Button + padrão de altura (min-h-touch) | Standard | Importante | Normal | P/P | — | — | `[ ]` | 18/05/26 |
| TASK-REF-08 | Onboarding Passo4, Passo5 — shadcn + min-h-touch | Standard | Importante | Normal | P/P | TASK-REF-06 | — | `[ ]` | 18/05/26 |
| TASK-REF-09 | Onboarding Passo6, 6Financiamento, 6Aluguel, 6Responsabilidade — shadcn + min-h-touch | Standard | Importante | Normal | P/M | TASK-REF-06 | — | `[ ]` | 18/05/26 |
| TASK-REF-10 | Onboarding Passo7, 8, 9 e PassoConfirmacao — shadcn + min-h-touch | Standard | Importante | Normal | M/M | TASK-REF-06 | — | `[ ]` | 18/05/26 |

---

## Registros e Formulários (Fase 6 do roadmap original)

| ID            | Título                                                                 | Valor      | Urgência | Esforço | Dependências  | Status |
| ------------- | ---------------------------------------------------------------------- | ---------- | -------- | ------- | ------------- | ------ |
| TASK-RF-005.1 | Registros - lista e sub-abas (Geral, Rodagem, Combustível, Manutenção) | Importante | Normal   | G       | -             | [ ]    |
| TASK-RF-5.2   | Registro de Rodagem (formulário com odômetro inicial/final)            | Importante | Normal   | M       | TASK-RF-005.1 | [ ]    |
| TASK-RF-5.3   | Registro de Abastecimento (formulário com total pago, preço/L, fotos)  | Importante | Normal   | M       | TASK-RF-005.1 | [ ]    |
| TASK-RF-5.4   | Registro de Óleo, Pneu, Revisão e Kit Relação (4 formulários)          | Importante | Normal   | G       | TASK-RF-005.1 | [ ]    |
| TASK-RF-5.5   | Edição, exclusão (swipe/long-press) e cálculo de médias reais          | Importante | Normal   | M       | TASK-RF-005.4 | [ ]    |
| TASK-RF-5.6   | Histórico por categoria - telas "Ver" (design pendente no Figma)       | Desejável  | Normal   | G       | TASK-RF-005.1 | [ ]    |

---

## Mão de Obra, Autonomia e Perfil (Fases 7, 8 e 10)

| ID          | Título                                                     | Valor      | Urgência | Esforço | Dependências             | Status |
| ----------- | ---------------------------------------------------------- | ---------- | -------- | ------- | ------------------------ | ------ |
| TASK-RF-6.1 | Aba Mão de Obra (serviços editáveis + reset)               | Importante | Normal   | G       | -                        | [ ]    |
| TASK-RF-6.2 | Aba Autonomia / Vida Útil (combustíveis, peças, pneus)     | Importante | Normal   | G       | -                        | [ ]    |
| TASK-RF-6.3 | Tela Perfil + Ajustes de Predefinição (5 seções com reset) | Importante | Normal   | G       | TASK-RF-6.1, TASK-RF-6.2 | [ ]    |

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
| TASK-RF-7.2 | Histórico e alertas de manutenção (próxima troca) | Importante | Normal   | G       | RF-5.x       | [ ]    |

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

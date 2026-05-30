Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" — vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas — absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

---

## TASK-RF-6.18 — Decrementar parcelas restantes de financiamento automaticamente a cada mês

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:**
  - **Problema:** quando o usuário tem financiamento ativo (`situacaoMoto === 'financiada'` com `parcelaMensal > 0` e nº de parcelas > 0), o contador de parcelas restantes não diminui automaticamente conforme passam os meses — o usuário precisa editar manualmente.
  - **Local provável:** `src/types/perfil.ts` (modelo de financiamento — confirmar se tem `dataInicio` + `parcelasTotais` ou só `parcelasRestantes`), `src/context/PerfilContext.tsx` (lógica de "tick" mensal), `src/utils/calculos.ts` (uso do valor para custo do período).
  - **Fix proposto:** armazenar `dataInicio` + `parcelasTotais` em vez de só `parcelasRestantes`; derivar `parcelasRestantes = parcelasTotais - mesesDecorridosDesde(dataInicio)`. Quando chegar a 0, parar de contar como custo. Schema migration necessária.
  - **Cuidados:** decisão importante — derivar do cálculo (passive, sem mutar perfil) vs. mutar o perfil periodicamente. Recomendação: derivar, evita escrita silenciosa no perfil. Confirmar com humano antes da implementação. Validar edge cases: `mesesDecorridos > parcelasTotais`, `dataInicio` no futuro, mudança de fuso horário.

---


## TASK-BG-009 — Pop-ups bugam quando largura da janela ≠ largura mínima (PC/notebook/tablet)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** os pop-ups (modais/dialogs shadcn) ficam visualmente bugados em larguras de janela que não sejam a mínima (375px) ou tela cheia. Bug visível em PC/notebook/tablet — não aparece em celular onde a largura sempre é "mínima".
  - **Local provável:** componentes `Dialog`/`Sheet` do shadcn em `src/components/ui/`, ou wrapper customizado. TASK-RF-6.11 introduziu vários pop-ups de edição em Detalhamento. TASK-RF-6.9 trouxe popup de Imprevistos.
  - **Fix proposto:** reproduzir em janela de ~768px e ~1024px; inspecionar CSS dos modais; provavelmente falta `max-width` no container do dialog ou o overlay está com `width: 100vw` sem ancoragem. Garantir comportamento responsivo entre 375px e desktop.
  - **Cuidados:** o app foi desenhado mobile-first (375px), mas precisa funcionar em larguras maiores sem quebrar. Não regredir em mobile. Testar em todos os pop-ups que existem (Imprevistos, edição por categoria em Detalhamento, confirmações de reset).

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

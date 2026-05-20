Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

## TASK-REF-13 — PaginaAjustes: gap excessivo entre label e input no componente Linha
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Identificado em revisão de TASK-BG-001. O componente `Linha` usa `flex justify-between` com inputs de `w-28` fixo (112px). Em tela de 375px, o espaço entre o fim do texto do label e o início do input é desproporcional. Destoa das demais telas do app que usam grid ou inputs de largura total/metade. Solução provável: grid de duas colunas ou `flex-1` no label com input de largura fixa menor.

---

## TASK-REF-14 — Extrair componentes inline de PaginaVidaUtil e PaginaAjustes para src/components/
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/G
- **Data origem:** 20/05/26
- **Dependências:** TASK-BG-002, TASK-REF-13 (evitar retrabalho pós-extração)
- **REQ/ADR/DT:** —
- **Observações:** Identificado em revisão de TASK-BG-001. Seis componentes com interface bem definida vivem inline nas pages: `IconeReset`, `CardCombustivel`, `CardItemPreco` (PaginaVidaUtil) e `Segmentado`, `Stepper`, `Linha` (PaginaAjustes). Violam o padrão do projeto — componentes com interface própria pertencem a `src/components/`. Dependência de BG-002 e REF-13 para não reabrir arquivos já modificados.

---

## TASK-REF-15 — Substituir header duplicado de PaginaAjustes por CabecalhoVoltar
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Identificado em revisão de TASK-BG-001. PaginaAjustes implementa seu próprio header (linhas 125–145) com SVG inline do ícone de voltar, duplicando exatamente o que `CabecalhoVoltar` em `src/components/CabecalhoVoltar.tsx` já oferece. Manutenção dobrada e risco de divergência visual futura quando CabecalhoVoltar for atualizado.

---

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


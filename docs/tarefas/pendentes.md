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

> **TASK-DOC-009** concluída em 24/05/26 — ver `docs/tarefas/concluidas/` (sincronização de docs/dominio + docs/arquitetura com código pós-ADR-003; 4 ondas, 14 arquivos tocados).

> **TASK-DOC-010** concluída em 25/05/26 — ver `docs/tarefas/concluidas/` (sincronização Híbrida de `docs/requisitos/*` + `docs/contexto-projeto-ai.md` com ADR-003; 4 ondas, 5 arquivos tocados; XII.1 substituído por pointer enxuto).

## TASK-DOC-011 — Sincronizar índice I- de Requisitos_MotoCalc_RJ_v6.md com numeração do corpo

- **Status:** Pendente
- **Modo:** Light
- **Valor:** Desejável
- **Urgência:** Imediata
- **Esforço-H/IA:** P/P
- **Data origem:** 25/05/26 00:10
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Imediata por estar fora do escopo da TASK-DOC-010 (anotado em "O Que NÃO Foi Feito") e ser correção barata enquanto o contexto da spec v6 ainda está fresco. Débito pré-existente: o índice I- numera de 1 a 15 (`1. [[#I- Visão Geral]]` etc.), mas o corpo numera de II a XVI (16 seções, começando em "II- Visão Geral"). Os links de anchor `[[#X-…]]` funcionam por nome de heading, então a navegação não está quebrada — é apenas inconsistência de numeração. Como toda a spec v6.0 está congelada (data 09/05/26), corrigir o índice agora mantém a spec internamente consistente sem alterar conteúdo.

**Escopo:**
- `docs/requisitos/Requisitos_MotoCalc_RJ_v6.md` — seção `## I- Índice` (linhas ~12–29): trocar a numeração de 1–15 para II–XVI, casando com os headings reais do corpo. Manter os labels (`[[#X- Nome]]`) como estão.

**Critérios de aceite:**
- Cada item do índice cita o número romano que aparece no heading do corpo (II, III, IV, …, XVI).
- Total de 15 itens no índice (corresponde às 15 seções de conteúdo; "I- Índice" é a própria seção do índice e não se autorreferencia).
- Links de anchor continuam funcionando (não há mudança de heading no corpo).

---

## TASK-DOC-012 — Atualizar métricas de teste em docs/contexto-projeto-ai.md

- **Status:** Pendente
- **Modo:** Light
- **Valor:** Desejável
- **Urgência:** Imediata
- **Esforço-H/IA:** P/P
- **Data origem:** 25/05/26 00:10
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Imediata por estar fora do escopo da TASK-DOC-010 (anotado em "O Que NÃO Foi Feito") e ser correção pontual enquanto o número está fresco. O arquivo `docs/contexto-projeto-ai.md` cita métricas defasadas em dois pontos: na árvore de pastas (`utils/calculos.ts` com "✅ 92 testes") e nas Decisões Arquiteturais Imutáveis ("76 testes"). Verificado em 25/05/26: `npm run test` reporta **124 testes** totais — 33 em `PerfilContext.test.ts` + 91 em `calculos.test.ts`. Como métricas decaem rápido, considerar acoplar a correção a uma instrução genérica "ver `npm run test` para contagem atual" em vez de fixar números — decisão do humano na execução.

**Escopo:**
- `docs/contexto-projeto-ai.md` — atualizar duas menções defasadas:
  - Árvore de pastas: `# ✅ 92 testes — NUNCA TOCAR sem aprovação` → considerar trocar por "✅ NUNCA TOCAR sem aprovação (ver `npm run test` para contagem atual)" para evitar re-decaimento.
  - Decisões Arquiteturais Imutáveis: "`utils/calculos.ts` é imutável (76 testes)" → mesma ideia, remover o número fixo ou atualizar para 91.

**Critérios de aceite:**
- Zero menção a "76 testes", "92 testes" ou qualquer número de testes que não corresponda à contagem atual.
- Se optar por manter número fixo: bater com `npm run test` no momento da execução (registrar o comando no arquivo da task).

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

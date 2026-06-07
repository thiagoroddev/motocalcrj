Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

#### Dívida técnica vigente (auditoria 06/06/26)

_(A TASK-REF-44 foi **cancelada** em 07/06/26 — a variação de revisão era por modelo, não por ano. Ver ADR-019 e `concluidas/2026-06-07--15h05--TASK-REF-44-CANCELADA.md`.)_

## TASK-RF-6.31 - Reformular o onboarding (ordem essencial → não-essencial; tutorial) — REGISTRO MESTRE
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/XG (quebrar nas sub-tarefas RF-6.29/6.32/6.33/6.34)
- **Data-hora origem:** 07/06/26 15:19
- **Dependências:** RF-6.33, RF-6.34, RF-6.32, RF-6.29 (telas) — esta task é o guarda-chuva/ordem
- **REQ/ADR/DT:** ADR-018, ADR-013, ADR-014, ADR-019, RNF-09
- **Observações:** **ESTE BLOCO É A SPEC COMPLETA do onboarding (decisão humana 07/06/26). Não
  perder detalhes.** Filosofia: o onboarding é uma **introdução/tutorial** — **mostra tudo o que é
  editável** para o usuário já saber o que existe, mas **só exige o essencial**; o resto é opcional e
  explicado. Nenhuma tela do bloco não-essencial pode **bloquear** o avanço. Implica reordenar rotas e
  progresso em `FluxoOnboarding.tsx` + `onboardingUtils.ts` (`MAPA_PROXIMO`, `MAPA_ANTERIOR`,
  `CONFIG_PASSOS`) e atualizar o smoke. **Ordem e conteúdo exatos:**
  .
  **BLOCO A — ESSENCIAIS (obrigatórios):**
  1. **Modelo** (obrigatório).
  2. **Ano** (obrigatório) — seletor (RF-6.30, feita).
  3. **Quilometragem atual** (obrigatório) **+ consumo editável** (ver RF-6.33): mostra o consumo do
     modelo já preenchido (`preset.consumoKmL`) e permite o usuário editar se quiser. **NÃO tem mais
     o "km da última revisão" aqui** — foi para a tela 10 (últimas manutenções).
  4. **Situação da moto** (obrigatório).
  .
  **BLOCO B — ESSENCIAIS PORÉM OPCIONAIS (não informar NÃO quebra; default = 0):** ver RF-6.34.
  5. **Seguro** · 6. **Alimentação** · 7. **Internet**. **MUDANÇA DE DEFAULT:** hoje têm valores
     informados por padrão; passam a iniciar em **0** (não preencher é válido).
  .
  **BLOCO C — CONFIGURAÇÕES QUE AFETAM OS CÁLCULOS (não-essencial, editável/explicado):**
  8. **Vida útil das peças** (atual Passo 4, RF-6.28 — feita).
  9. **Valor de mão de obra** (ver RF-6.32): explicar que o app usa os **valores oficiais informados**
     para as **revisões periódicas**, mas que para os **avulsos não há dados para todos**, e que isso
     **pode ser estimado — para todos ou cada um individualmente**. Ter o **toggle** que ativa/desativa
     a estimativa ali mesmo, **mostrando um exemplo do total de M.O. com e sem** (ao ligar/desligar).
     **Renomear o toggle** de "Valor real / Incluir estimativa" → **"Padrão / Estimado"**:
     - **"Padrão"** (é o default): estimativa geral **desligada**, mas permite **ativar a estimativa
       individualmente por item** OU **inserir um valor** por item (editável).
     - **"Estimado"**: **não** permite edição e aplica a estimativa em **todos** os itens sem valor
       oficial (tudo `~`, read-only).
  10. **Últimas manutenções do veículo** (ver RF-6.29 redefinida): mostra **destacado o km atual**
      (informado no passo 3) **ao lado do card da última revisão geral** (**0 por padrão**), com uma
      **explicação breve** de como isso impacta os cálculos (preencher ou não). **Abaixo**, exatamente
      o card que já existe em Ajustes — **'KM - últimas trocas/manutenções'** (`SecaoUltimasManutencoes`)
      — que permite **editar o km de cada peça com trocas sem km fixos**. **Remover desse card** os
      itens que já estão nos **pacotes de revisão fixa** (vela de ignição, filtro de ar). **Manter a
      troca de óleo** no card — porque o humano vai futuramente implementar trocar óleo de forma
      **avulsa/excepcional** (ele mesmo troca a cada ~1.500 km em casa).
  .
  **Pré-requisito:** esta ordem É a decisão de produto (acima). Implementar via as sub-tarefas; esta
  task coordena a sequência/rotas/progresso e o smoke final. Provável ADR de fluxo do onboarding.

## TASK-RF-6.33 - Onboarding passo essencial: km atual + consumo editável (sem última revisão)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Dependências:** -
- **REQ/ADR/DT:** ADR-019, RNF-09 (ver RF-6.31 item 3)
- **Observações:** No passo essencial de **km atual** (obrigatório), **adicionar o consumo editável**:
  exibe `preset.consumoKmL` do modelo já preenchido e permite o usuário **editar** (grava na
  autonomia do perfil, mesma fonte do cálculo de combustível). **Remover o "km da última revisão"
  deste passo** — ele passa para a tela de Últimas Manutenções (RF-6.29). Hoje km atual e km última
  revisão aparecem juntos (ver `Passo5.tsx`/`SecaoVeiculo`); separar. Input numérico padrão BG-017
  (estado local + onBlur). Atualizar smoke.

## TASK-RF-6.29 - Onboarding "Últimas manutenções do veículo" (km atual destacado + card editável)
- **Status:** Pendente (REDEFINIDA em 07/06/26 — supersede a versão "remover óleo")
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Dependências:** TASK-RF-6.28 (derivação de avulsos)
- **REQ/ADR/DT:** ADR-014, ADR-018, RF-6.3.4 (ver RF-6.31 item 10)
- **Observações:** Esta é a **tela 10** do onboarding (bloco C). Substitui o atual `Passo5Trocas.tsx`
  ("O que foi trocado?"). **Conteúdo:** (a) mostrar **destacado o km atual** informado no passo 3
  **ao lado do card da última revisão geral** (`kmUltimaRevisao`, **0 por padrão**); (b) uma
  **explicação breve** de como preencher (ou não) o km da última revisão e das trocas impacta os
  cálculos (ciclo ancorado vs amortizado — ADR-006); (c) **abaixo**, exatamente o card de Ajustes
  **'KM - últimas trocas/manutenções'** (`src/components/ajustes/SecaoUltimasManutencoes.tsx`),
  permitindo **editar o km da última troca de cada peça** com trocas sem km fixo. **Remover do card**
  os itens já cobertos pelos **pacotes de revisão fixa**: **vela de ignição** e **filtro de ar**.
  **Manter a troca de óleo** no card (o humano vai futuramente permitir troca de óleo avulsa como
  excepcional — ele troca a cada ~1.500 km em casa). Reusar o componente de Ajustes (não duplicar);
  derivação de itens consistente com a RF-6.28. **CORREÇÃO vs versão anterior:** o óleo **fica** (não
  é mais removido); a tela deixa de ser um checklist e passa a ser a edição de km (mostra tudo
  editável, não exige). Atualizar smoke.

## TASK-RF-6.32 - Onboarding "Valor de mão de obra" + toggle "Padrão / Estimado"
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Dependências:** TASK-RF-6.28 (derivação de avulsos)
- **REQ/ADR/DT:** ADR-013, ADR-014, ADR-018, INV-CALC-2 (ver RF-6.31 item 9)
- **Observações:** **Tela 9** do onboarding (bloco C) + mudança no toggle global de estimativa de M.O.
  (vale também na aba Mão de Obra). **Tela:** mostra a seção de M.O. dos serviços avulsos; explica que
  o app usa os **valores oficiais** para **revisões periódicas**, mas que para os **avulsos não há
  dados para todos**, e que isso **pode ser estimado — para todos ou cada um individualmente**.
  Mostrar um **exemplo do total de M.O. com e sem estimativa** ao ligar/desligar o toggle ali mesmo.
  **Renomear o toggle** "Valor real / Incluir estimativa" → **"Padrão / Estimado"** com esta
  semântica (CORRIGE minha nota anterior — **NÃO** é "default ligado"):
  - **"Padrão" (DEFAULT, estimativa geral DESLIGADA):** permite **ativar a estimativa individualmente
    por item** OU **inserir um valor** por item. Itens editáveis. (= comportamento atual default-off,
    `incluirEstimativaMaoDeObra: false` permanece o default — ADR-013/014 preservadas nesse ponto.)
  - **"Estimado":** **não permite edição** e aplica a estimativa em **todos** os itens sem valor
    oficial (`~`, read-only).
  Implica: o modo "Estimado" (global on) passa a **desabilitar a edição** e aplicar a todos; ajustar
  `CardServico`/`PaginaMaoDeObra` e os textos do toggle. Reusar `montarEstimativaMaoDeObra` e a
  derivação de avulsos da RF-6.28; não criar estado paralelo; o `~` e a perda para valor real
  continuam (ADR-013/014). **Atualizar ADR-013/014** com a renomeação e a semântica read-only do modo
  Estimado. Testes: exemplo com/sem, modo Padrão edita por item, modo Estimado read-only em todos.
  Validação visual humana antes de concluir.

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

#### Geradas pela Revisão Geral REV-001 31/05/26

blicos, peças originais e aviso de custo incompleto quando faltar mão de obra.

## Decisões de UI/UX Pendentes

_(A TASK-RF-6.28 saiu daqui para `em-andamento.md` em 07/06/26 — implementada, aguardando validação visual.)_

## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |

### Refatorações da fase

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-REF-43 | Tornar `IMPORTAR_PERFIL` determinístico e normalizar antes do dispatch | Standard | Importante | Normal | M/M | TASK-RF-7.1 | ADR-010 | `[ ]` | 06/06/26 14:42 |


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

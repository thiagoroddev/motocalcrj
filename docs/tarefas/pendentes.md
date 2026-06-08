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

---

## Decomposição da RF-6.31 em subtarefas (registrada 07/06/26)

> **Contexto para quem pegar isto depois.** O épico do onboarding já entregou as TELAS; falta a
> **integração** (ordem, rotas, progresso, confirmação, smoke). Telas já prontas e concluídas:
> Marca ([Passo1.tsx](../../src/pages/onboarding/passos/Passo1.tsx)), Modelo ([Passo2.tsx](../../src/pages/onboarding/passos/Passo2.tsx)),
> Ano ([Passo3.tsx](../../src/pages/onboarding/passos/Passo3.tsx)), Vida útil ([Passo4.tsx](../../src/pages/onboarding/passos/Passo4.tsx)),
> Km/consumo ([Passo5.tsx](../../src/pages/onboarding/passos/Passo5.tsx)), Últimas manutenções
> ([Passo5Manutencoes.tsx](../../src/pages/onboarding/passos/Passo5Manutencoes.tsx)), Situação
> ([Passo6.tsx](../../src/pages/onboarding/passos/Passo6.tsx) + `Passo6Financiamento`/`Passo6Aluguel`/`Passo6Responsabilidade`),
> Seguro ([Passo7.tsx](../../src/pages/onboarding/passos/Passo7.tsx)), Internet ([Passo8.tsx](../../src/pages/onboarding/passos/Passo8.tsx)),
> Alimentação ([Passo9.tsx](../../src/pages/onboarding/passos/Passo9.tsx)), Confirmação
> ([PassoConfirmacao.tsx](../../src/pages/onboarding/passos/PassoConfirmacao.tsx)) e **Mão de obra**
> ([PassoMaoDeObra.tsx](../../src/pages/onboarding/passos/PassoMaoDeObra.tsx) — pronta mas **NÃO roteada**).
>
> **Fonte da ordem/numeração:** o bloco mestre RF-6.31 acima (BLOCOS A/B/C). Roteamento/numeração vivem
> em [onboardingUtils.ts](../../src/pages/onboarding/onboardingUtils.ts) (`CONFIG_PASSOS`, `MAPA_PROXIMO`,
> `MAPA_ANTERIOR`) e [FluxoOnboarding.tsx](../../src/pages/onboarding/FluxoOnboarding.tsx) (`<Routes>`).
> O gate é `npm run verify` (rodar no Windows nativo). **Não commitar** (é do humano).

### Mapa atual → alvo

| # alvo | Tela (componente) | Rota atual | Bloco |
| --- | --- | --- | --- |
| 1 | **Modelo** (unificar Marca+Modelo) | `1` (Passo1) + `2` (Passo2) | A essencial |
| 2 | Ano (Passo3) | `3` | A |
| 3 | Km + consumo (Passo5) | `5` | A |
| 4 | Situação (Passo6 + subs) | `6`, `6/financiamento`, `6/aluguel`, `6/responsabilidade` | A |
| 5 | Seguro (Passo7) | `7` | B opcional (default 0) |
| 6 | Alimentação (Passo9) | `9` | B |
| 7 | Internet (Passo8) | `8` | B |
| 8 | Vida útil (Passo4) | `4` | C config |
| 9 | **Mão de obra** (PassoMaoDeObra) | — (não roteada) | C |
| 10 | Últimas manutenções (Passo5Manutencoes) | `5trocas` | C |
| 11 | Confirmação (PassoConfirmacao) | `confirmacao` | — |

---

### ✅ TASK-RF-6.31.1 — ADR do fluxo de onboarding + esquema de rotas e progresso (CONCLUÍDA 07/06/26)
> **Concluída** — ver `concluidas/2026-06-07--21h00--TASK-RF-6.31.1.md` e **ADR-020**.
> **Decisões travadas para as próximas subtarefas:** rotas **semânticas** (`/onboarding/modelo`, `/ano`,
> `/km`, `/situacao` + subs, `/seguro`, `/alimentacao`, `/internet`, `/vida-util`, `/mao-de-obra`,
> `/ultimas-manutencoes`, `/confirmacao`; primeira rota = `/onboarding/modelo`); progresso "PASSO X DE 10"
> + Confirmação "PASSO FINAL". Detalhes e ramificações no ADR-020.
- **Modo:** Strict · **Valor:** Crítico · **Urgência:** IMEDIATA · **Esforço:** P/M · **Dep.:** - (faz primeiro)
- **Objetivo:** registrar a decisão do fluxo numa ADR nova (próximo número livre em `docs/arquitetura/ADR/`)
  e **fixar o esquema de rotas e de progresso** que as demais subtarefas vão implementar. Sem código de telas.
- **Decidir e documentar:**
  1. **Ordem canônica** (11 passos do mapa acima) + blocos A (essencial, bloqueia avanço) / B (opcional,
     default 0, nunca bloqueia) / C (config que afeta cálculo, não bloqueia).
  2. **Esquema de rotas:** escolher entre **(a) numéricas sequenciais** (`/onboarding/1..10` + `confirmacao`)
     ou **(b) semânticas** (`/onboarding/modelo`, `/ano`, `/km`, `/situacao`, …). Recomendação: semânticas
     (robustas a futuras reordenações; eliminam o legado `5trocas`). Definir os nomes das sub-rotas de
     Situação (financiamento/aluguel/responsabilidade).
  3. **Progresso:** regra de `label` ("PASSO X DE N") e `percentual` por passo — N considerando que as
     sub-rotas de Situação contam como o mesmo passo (hoje `6/*` repete "PASSO 6"). Definir como contar.
  4. **Ramificações:** quitada → pula sub-rotas de Situação; financiada → financiamento; alugada →
     aluguel → responsabilidade. Manter a lógica de `MAPA_PROXIMO`/`MAPA_ANTERIOR` por `situacaoMoto`.
- **Critérios de aceite:** ADR criada e aceita, com a tabela de ordem, o esquema de rotas escolhido e a
  regra de progresso. Índice de ADRs atualizado se houver. **Sem mudança de código.**

### ✅ TASK-RF-6.31.2 — Unificar Marca + Modelo numa única etapa (CONCLUÍDA 07/06/26)
> **Concluída** — componente `PassoModelo.tsx` criado (não roteado; wiring na 6.31.3). Ver
> `concluidas/2026-06-07--22h35--TASK-RF-6.31.2.md`.
- **Modo:** Standard · **Valor:** Importante · **Urgência:** IMEDIATA · **Esforço:** M · **Dep.:** RF-6.31.1
- **Objetivo:** uma só tela escolhe **marca e modelo** (hoje são 2 telas). Entregar o **componente**; o
  wiring final fica na RF-6.31.3.
- **Estado atual:** `Passo1` (grid de marcas, grava `moto.marca`) → `Passo2` (lista modelos da marca via
  `getModelosPorMarca`, grava `moto.modelo`). `Passo2` já mostra `subtitulo={perfil.moto.marca}`.
- **Alvo:** criar `PassoModelo.tsx` (nome semântico) com seleção de marca (ex.: chips/seletor no topo via
  `getMarcasDisponiveis`) + lista de modelos da marca selecionada (`getModelosPorMarca`). Grava marca e
  modelo no `moto`. `podeContinuar` só com modelo selecionado. Reaproveitar a lógica de auto-seleção
  quando a marca tem 1 modelo. Manter o card só com o nome do modelo (sem consumo — ver BG-023).
- **Arquivos:** novo `PassoModelo.tsx`; `Passo1.tsx`/`Passo2.tsx` ficam para a 6.31.3 remover/rotear.
- **Critérios de aceite:** componente seleciona marca+modelo e grava no estado; `verify` verde. (Validação
  visual em fluxo só após a 6.31.3 roteá-lo.)

### ✅ TASK-RF-6.31.3 — Reordenar rotas, progresso e wiring (CONCLUÍDA 07/06/26)
> **Concluída** — rotas semânticas implementadas; `PassoModelo`/`PassoMaoDeObra` roteados; `Passo1`/
> `Passo2`/`5trocas` removidos. Ver `concluidas/2026-06-07--23h26--TASK-RF-6.31.3.md`. (Junto saiu a
> **TASK-RF-6.32.1**: cards de M.O. + total dinâmico na tela de mão de obra.)
- **Modo:** Strict · **Valor:** Crítico · **Urgência:** IMEDIATA · **Esforço:** G · **Dep.:** RF-6.31.1, RF-6.31.2
- **Objetivo:** implementar a ordem canônica da ADR (6.31.1) — é o coração da RF-6.31.
- **Fazer:**
  1. `FluxoOnboarding.tsx` `<Routes>`: registrar todas as telas na nova ordem/rotas, incluindo a
     **PassoMaoDeObra** (hoje fora) e a **PassoModelo** (6.31.2) no lugar de Passo1+Passo2. Remover a rota
     legada `5trocas` (renomear conforme a ADR). Remover Passo1/Passo2 antigos se substituídos.
  2. `onboardingUtils.ts`: reescrever `MAPA_PROXIMO`, `MAPA_ANTERIOR` (com as ramificações por
     `situacaoMoto`) e `CONFIG_PASSOS` (labels "PASSO X DE N" + percentuais) para a nova ordem.
  3. Conferir `RotaProtegida` e `PaginaPerfil` (navegam para `/onboarding/1`/primeira rota) — ajustar se as
     rotas mudarem de nome.
- **Critérios de aceite:** dá para percorrer o onboarding inteiro na ordem nova (Modelo→Ano→Km→Situação→
  Seguro→Alimentação→Internet→Vida útil→M.O.→Últimas manutenções→Confirmação); voltar funciona; ramos
  quitada/financiada/alugada corretos; progresso coerente; `verify` verde. Validação visual humana.

### TASK-RF-6.31.4 — Confirmação (links "Editar") + regra final do PassoLayout
- **Modo:** Standard · **Valor:** Importante · **Urgência:** IMEDIATA · **Esforço:** P/M · **Dep.:** RF-6.31.3
- **Estado atual:** `PassoConfirmacao` usa `editarPasso('2'|'5'|'6'|'7'|'8'|'9')` (rotas hardcoded) e tem
  seções de resumo numa ordem antiga. `PassoLayout` decide o rótulo do botão por `passo === '9'`
  ([PassoLayout.tsx:23](../../src/pages/onboarding/PassoLayout.tsx#L23)).
- **Fazer:** atualizar os `editarPasso(...)` para as novas rotas; reordenar/rever as seções de resumo
  conforme a nova ordem (incluindo o que faltar resumir, ex.: vida útil/M.O. se fizer sentido); ajustar a
  regra do `PassoLayout` para detectar o **último passo** (não mais o literal `'9'`) para o texto
  "Concluir"/percentual 100%.
- **Critérios de aceite:** cada "Editar" leva ao passo certo; botão final aparece como "Concluir" só no
  último passo; `verify` verde. Validação visual.

### TASK-RF-6.31.5 — Smoke completo da navegação + docs
- **Modo:** Standard · **Valor:** Crítico · **Urgência:** IMEDIATA · **Esforço:** M/G · **Dep.:** RF-6.31.3, RF-6.31.4
- **Fazer:**
  1. Atualizar o smoke do fluxo feliz em [App.smoke.test.tsx](../../src/App.smoke.test.tsx) para a nova
     ordem/títulos (inclui a tela de M.O. agora roteada).
  2. Adicionar **teste da matriz de navegação**: `getProximoPasso`/`getPassoAnterior` para cada passo nos
     3 ramos (`quitada`, `financiada`, `alugada`), incluindo **voltar**, garantindo ida e volta coerentes.
  3. Atualizar docs: requisitos do onboarding, `_glossario.md`, `contexto-projeto-ai.md` e a lista de
     rotas, refletindo a ordem/rotas finais.
- **Critérios de aceite:** smoke percorre o fluxo novo ponta a ponta; matriz de navegação testada nos 3
  ramos; docs sincronizadas; `verify` verde. Validação visual final do onboarding completo.

---


_(A TASK-RF-6.33 saiu daqui para `em-andamento.md` em 07/06/26.)_

_(A TASK-RF-6.29 saiu daqui para `em-andamento.md` em 07/06/26.)_

_(A TASK-RF-6.32 foi concluída em 07/06/26 — ver `concluidas/2026-06-07--20h35--TASK-RF-6.32.md`.
A tela `PassoMaoDeObra` ficou pronta como componente; o wiring no fluxo é da RF-6.31, item 9.)_

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

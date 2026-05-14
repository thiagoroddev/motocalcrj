# Tarefas Pendentes - MotoCalc RJ

> Backlog priorizado. Revisado no início de cada ciclo.

## Legenda de Prefixos

| Prefixo | Significado |
|---|---|
| RN | Regra de Negócio |
| RF | Requisito Funcional |
| RNF | Requisito Não-Funcional |
| BG | Bug |
| REF | Refatoração |
| DOC | Documentação |

## Priorização

| Campo | Valores |
|---|---|
| **Valor** | Crítico / Importante / Desejável |
| **Urgência** | Imediata / Normal |


## Template pendente 'Normal':

| TASK-ID-0.0 | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR | Status | Data origem |

| TASK-RF-5.1 | Registros - lista e sub-abas | Standard|  Importante | Normal | G/G | TASK-1 | RF-2, ADR-3, DT-14 |  PENDENTE | 10/05/26
## Template pendente 'Imediata':

TAKS-ID - Título
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro

---

## Registros e Formulários (Fase 6 do roadmap original)

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RF-5.1 | Registros - lista e sub-abas (Geral, Rodagem, Combustível, Manutenção) | Importante | Esta Semana | G | - | [ ] |
| RF-5.2 | Registro de Rodagem (formulário com odômetro inicial/final) | Importante | Esta Semana | M | RF-5.1 | [ ] |
| RF-5.3 | Registro de Abastecimento (formulário com total pago, preço/L, fotos) | Importante | Esta Semana | M | RF-5.1 | [ ] |
| RF-5.4 | Registro de Óleo, Pneu, Revisão e Kit Relação (4 formulários) | Importante | Esta Semana | G | RF-5.1 | [ ] |
| RF-5.5 | Edição, exclusão (swipe/long-press) e cálculo de médias reais | Importante | Este Mês | M | RF-5.4 | [ ] |
| RF-5.6 | Histórico por categoria - telas "Ver" (design pendente no Figma) | Desejável | Este Mês | G | RF-5.1 | [ ] |

---

## Mão de Obra, Autonomia e Perfil (Fases 7, 8 e 10)

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RF-6.1 | Aba Mão de Obra (serviços editáveis + reset) | Importante | Esta Semana | G | - | [ ] |
| RF-6.2 | Aba Autonomia / Vida Útil (combustíveis, peças, pneus) | Importante | Esta Semana | G | - | [ ] |
| RF-6.3 | Tela Perfil + Ajustes de Predefinição (5 seções com reset) | Importante | Esta Semana | G | RF-6.1, RF-6.2 | [ ] |

---

## Decisões de UI/UX Pendentes

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RF-6.4 | Conteúdo dos pop-ups de ajuda (ícone "?") | Desejável | Quando Der | P | - | [ ] |
| RF-6.5 | Seletor rápido de presets (ícone moto no header) | Desejável | Quando Der | M | - | [ ] |
| RF-6.6 | Decisão: hamburguer vs nav sempre visível | Importante | Esta Semana | P | - | [ ] |

---

## Export/Import e Alertas (Fase 11)

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RF-7.1 | Export/Import de presets (.json) | Importante | Este Mês | G | RF-6.3 | [ ] |
| RF-7.2 | Histórico e alertas de manutenção (próxima troca) | Importante | Este Mês | G | RF-5.x | [ ] |

---

## Analytics, PWA e Play Store (Fases 9 e 13)

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RNF-8.1 | Analytics (Umami) - trackEvent centralizado | Importante | Este Mês | M | - | [ ] |
| RNF-8.2 | PWA completo (manifest, service worker, cache) | Crítico | Este Mês | G | RNF-8.1 | [ ] |
| RNF-8.3 | TWA - publicação na Google Play Store | Crítico | Este Mês | G | RNF-8.2 | [ ] |

---

## Qualidade e Polimento (Fase 10)

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Importante | Este Mês | G | - | [ ] |
| RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Crítico | Este Mês | G | Todas as anteriores | [ ] |

---

## Refatorações Prioritárias

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| REF-01 | Refatorar PaginaEstimativa.tsx (230 linhas → < 150) | Importante | Esta Semana | M | - | [ ] |
| REF-02 | Refatorar PaginaDetalhamento.tsx (537 linhas → < 150) | Importante | Esta Semana | G | REF-01 | [ ] |
| REF-03 | Instalar shadcn/ui e criar wrappers em components/ui/ | Importante | Esta Semana | G | - | [ ] |

---

## Documentação

| ID | Título | Valor | Urgência | Esforço | Dependências | Status |
|---|---|---|---|---|---|---|
| DOC-01 | Criar docs/design/telas-navegacao.md a partir dos specs do Figma | Importante | Esta Semana | M | - | [ ] |
| DOC-02 | Migrar docs/Tasks.md antigo para o novo padrão de tarefas | Importante | Esta Semana | M | - | [ ] |
| DOC-03 | Atualizar contexto-projeto-ai.md com a nova estrutura de docs | Importante | Imediata | P | - | [ ] |


--------------------------------------------





TASK-5.1 - Registros (lista e tabs)

- **REQ:** RF-REG-01, RF-REG-02, RF-REG-10
- **Acao:** tabs Geral/Rodagem/Combustivel/Manutencao.
- **Criterio:** lista geral por categoria; sub-tabs funcionam.
- **Status:** [ ]
- **Observacoes:** -

TASK-5.2 - Registro de Rodagem

- **REQ:** RF-FORM-01, RN-24
- **Acao:** formulario com odometro inicial/final e eventos do dia.
- **Criterio:** salvar atualiza `kmAtual` e cria registro.
- **Status:** [ ]
- **Observacoes:** -

TASK-5.3 - Registro de Abastecimento

- **REQ:** RF-FORM-02, RF-REG-09
- **Acao:** formulario com total pago, preco/L e fotos.
- **Criterio:** consumo real calculado apos 3+ registros.
- **Status:** [ ]
- **Observacoes:** -

TASK-5.4 - Registro de Oleo, Pneu, Revisao e Kit Relacao

- **REQ:** RF-FORM-03 a RF-FORM-06, RF-REG-03 a RF-REG-07
- **Acao:** implementar formularios e persistencia.
- **Criterio:** cada registro aparece na lista correta.
- **Status:** [ ]
- **Observacoes:** -

TASK-5.5 - Edicao, exclusao e medias reais

- **REQ:** RF-REG-11, RF-REG-12, RN-25, RN-26
- **Acao:** editar/excluir via swipe/long-press e calcular medias.
- **Criterio:** medias reais exibidas e nao sobrescrevem presets.
- **Status:** [ ]
- **Observacoes:** -

TASK-5.6 - Historico por categoria (telas "Ver")

- **REQ:** RF-REG-02, RF-REG-03 a RF-REG-12 (UI/UX)
- **Acao:** criar telas de historico para cada categoria (rodagem, combustivel, oleo, revisao, pneu, kit relacao).
- **Criterio:** cada botao "Ver" abre a lista completa do tipo com ordenacao por data.
- **Status:** [ ]
- **Observacoes:** TODO - telas pendentes no Figma.

TASK-6.1 - Aba Mao de Obra

- **REQ:** RF-MO-01 a RF-MO-05
- **Acao:** campos editaveis com reset e tabela de revisoes.
- **Criterio:** alterar valores recalcula custos no painel.
- **Status:** [ ]
- **Observacoes:** -

TASK-6.2 - Aba Autonomia (Vida Util)

- **REQ:** RF-VU-01 a RF-VU-05, RN-10 a RN-12
- **Acao:** combustiveis, pecas e pneus com chips ORG/PAR e reset.
- **Criterio:** overrides por peca funcionam e respeitam anoFimOriginal.
- **Status:** [ ]
- **Observacoes:** -

TASK-6.3 - Tela Perfil + Ajustes

- **REQ:** RF-PERF-01 a RF-PERF-04
- **Acao:** perfil atual, gestao de predefinicoes e ajustes.
- **Criterio:** reset total volta ao preset; ajustes refletem no calculo.
- **Status:** [ ]
- **Observacoes:** -

TASK-6.4 - Pop-ups de ajuda (icone ?)

- **REQ:** UI/UX (Design)
- **Acao:** definir e implementar pop-ups contextuais para os icones "?" das telas.
- **Criterio:** cada tela com "?" abre um pop-up com ajuda objetiva.
- **Status:** [ ]
- **Observacoes:** TODO - conteudo pendente.

TASK-6.5 - Seletor rapido de presets (icone moto)

- **REQ:** RF-PERF-02 (UI/UX)
- **Acao:** criar menu rapido para trocar predefinicao a partir do icone da moto no header.
- **Criterio:** troca de preset nao exige ir para Perfil; atualiza o contexto da tela atual.
- **Status:** [ ]
- **Observacoes:** TODO - UX pendente.

TASK-6.6 - Decisao do hamburguer vs nav sempre visivel

- **REQ:** UI/UX (Design)
- **Acao:** definir se o menu inferior fica sempre visivel; ajustar comportamento do hamburguer.
- **Criterio:** decisoes aplicadas no layout e no comportamento do header.
- **Status:** [ ]
- **Observacoes:** TODO - decisao pendente.

TASK-7.1 - Export/Import de presets

- **REQ:** RF-EXP-01 a RF-EXP-03, RNF-LR-05, RNF-LR-06
- **Acao:** exportar JSON (todos os presets), importar com confirmacao e migracao.
- **Criterio:** schemas antigos importam com defaults.
- **Status:** [ ]
- **Observacoes:** -

TASK-7.2 - Historico e alertas de manutencao

- **REQ:** RF-EST-01, RN-18 a RN-20
- **Acao:** calcular proxima manutencao e exibir alerta unico.
- **Criterio:** alerta mostra peca mais urgente.
- **Status:** [ ]
- **Observacoes:** -

TASK-8.1 - Analytics (Umami)

- **REQ:** RNF-ANA-01 a RNF-ANA-03
- **Acao:** criar `trackEvent` central e integrar nos fluxos.
- **Criterio:** eventos do catalogo disparam sem dados pessoais.
- **Status:** [ ]
- **Observacoes:** -

TASK-8.2 - PWA e offline

- **REQ:** RNF-PWA-01 a RNF-PWA-05, RNF-01
- **Acao:** manifest, service worker e estrategia de cache.
- **Criterio:** app funciona offline apos 1o load; PWA score >= 90.
- **Status:** [ ]
- **Observacoes:** -

TASK-8.3 - TWA (Play Store)

- **REQ:** RNF-TWA-01 a RNF-TWA-06
- **Acao:** preparar Bubblewrap, assetlinks e AAB.
- **Criterio:** build pronto para Play Console.
- **Status:** [ ]
- **Observacoes:** -

TASK-9.1 - Performance e acessibilidade

- **REQ:** RNF-02, RNF-05 a RNF-09
- **Acao:** revisar tamanhos de toque, contraste e bundle.
- **Criterio:** Lighthouse perf >= 80; toques >= 48px.
- **Status:** [ ]
- **Observacoes:** -

TASK-9.2 - Revisao final e QA

- **REQ:** RNF-04, RNF-11
- **Acao:** testes manuais de fluxo + revisao de regressao.
- **Criterio:** sem erros criticos; recalculos < 200ms.
- **Status:** [ ]
- **Observacoes:** -
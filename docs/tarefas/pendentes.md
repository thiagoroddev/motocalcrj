Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

#### Dívida técnica vigente (auditoria 06/06/26)

## TASK-REF-41.1 - Consolidar contrato profissional único dos presets
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 18:00
- **Dependências:** TASK-REF-42
- **REQ/ADR/DT:** DT-18, ADR-018, ADR-011, ADR-014, INV-CALC-2
- **Observações:** após a REF-42 tornar `servicosManutencao[].intervalKm` canônico, reduzir o
  contrato técnico dos presets ao padrão profissional único. Substituir `consumoKmL` +
  `consumoKmLComBau` por um único consumo profissional por modelo. Remover
  `intervaloKmEntrega` e campos de vida útil duplicados que não forem mais fontes de runtime,
  preservando preço, driver temporal e metadados necessários. Atualizar os dois JSONs, tipos,
  schemas, catálogo e testes de contrato. Os valores escolhidos devem reproduzir o caminho
  profissional atual: consumo hoje associado ao uso com baú e intervalos efetivos dos serviços.
  Não alterar estado/UI de `PerfilUso` nesta fatia. Critério: presets validam com uma única
  referência e baselines dos dois modelos ficam caracterizados.

## TASK-REF-41.2 - Remover PerfilUso do estado e do cálculo
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 18:00
- **Dependências:** TASK-REF-41.1
- **REQ/ADR/DT:** DT-18, ADR-018, ADR-010, INV-CALC-2
- **Observações:** remover `PerfilUso`, `moto.perfilUso`, `SET_PERFIL_USO` e todos os branches de
  consumo/intervalo ligados a entrega/passageiro. O commit do onboarding passa a copiar o único
  consumo profissional do preset; o cálculo continua usando a autonomia editável persistida.
  Elevar `VERSAO_SCHEMA_ATUAL`, atualizar Zod, defaults, reducer, fixtures e testes. Não criar
  migration: não existem usuários e dados locais de desenvolvimento incompatíveis podem cair no
  fluxo inicial recuperável. Critério: zero ocorrências vivas de `PerfilUso`/`perfilUso` e cálculos
  sem parâmetros de finalidade.

## TASK-REF-41.3 - Remover seleção de uso da UI e ajustar onboarding
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data-hora origem:** 06/06/26 18:00
- **Dependências:** TASK-REF-41.2
- **REQ/ADR/DT:** DT-18, ADR-018, RNF-09
- **Observações:** remover temporariamente o Passo 4 entrega/passageiro, o segmentado "Perfil de
  trabalho" de Ajustes, labels de uso na confirmação/Detalhamento e textos de ajuda. Atualizar
  rotas, progresso, navegação e smoke do onboarding para oito passos, sem implementar ainda a
  TASK-RF-6.28. Não deixar lacuna de navegação nem referência visível aos modos removidos.
  Critério: onboarding completo funciona em menos de três minutos e Ajustes não contém controle
  sem efeito.

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

#### Geradas pela Revisão Geral REV-001 31/05/26

blicos, peças originais e aviso de custo incompleto quando faltar mão de obra.

## Decisões de UI/UX Pendentes

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-RF-6.28 | Mostrar e editar vida útil dos serviços avulsos no onboarding | Standard | Importante | Normal | M/G | TASK-REF-41.3 | ADR-014, ADR-018, RNF-09 | `[ ]` | 06/06/26 17:42 |

**Escopo da TASK-RF-6.28:** substituir o antigo Passo 4 de perfil de uso por uma revisão
transparente dos mesmos cards exibidos em `Serviços avulsos` na aba Concessionária. A lista varia
por preset/marca e aplica exatamente o filtro: `!ehExcepcional`,
`!incluidoNaRevisaoAutorizada` e `intervalKm > 0`. Cada card mostra somente nome/ícone e o input
`Vida útil estimada (km)`; não mostra preço, estimativa de mão de obra, toggle ou reset. O valor
informado representa a vida útil estimada da peça e deve ser sincronizado com o marco de revisão
mais próximo antes de virar o intervalo canônico do serviço, conforme ADR-014. Editar no onboarding
e na aba Mão de Obra altera a mesma fonte definida pela REF-42; não criar estado paralelo. Exibir
aviso de que são referências para uso profissional/intenso e preservar onboarding concluível em
menos de 3 minutos. Revisões fixas, bateria temporal e serviços excepcionais ficam fora.

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

Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

#### Dívida técnica vigente (auditoria 06/06/26)

## TASK-REF-39 - Definir e proteger hierarquia dos filtros de Manutenção (DT-10)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data-hora origem:** 06/06/26 07:38
- **Dependências:** -
- **REQ/ADR/DT:** DT-10
- **Observações:** TOGGLE_CATEGORIA (perfilReducer.ts:180-191) só inverte o booleano; o schema
  garante as 8 chaves de categoriasAtivas mas NÃO exige ≥1 ativa. Além disso a Revisão Geral usa
  filtrosManutencao.revisao (TOGGLE_REVISAO_MANUTENCAO, linha 221-231) independente do toggle pai
  `manutencao` → o card pode parecer desligado enquanto a revisão ainda compõe o total.
  PRÉ-REQUISITO: decisão de produto — o toggle Manutenção controla todo o grupo (peças+revisão)
  ou só peças, com Revisão Geral como filtro independente? Definida a regra, protegê-la no reducer
  e refletir na UI/cálculo (calculos.ts, PaginaDetalhamento.tsx). Não inventar a regra: confirmar
  com o humano antes de implementar.

## TASK-REF-40 - Normalizar perfil contra preset ativo na carga, removendo órfãos (DT-11)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 07:38
- **Dependências:** -
- **REQ/ADR/DT:** DT-11, ADR-004
- **Observações:** O schema (perfilSchema.ts:205-226) valida formato mas aceita IDs/índices livres
  sem conferir existência no preset ativo: pecasOverrides[].id, servicosIndependentes[].id,
  revisaoAutorizadaOverrides[].index, imprevistosSugeridosAtivos, filtrosManutencao.manutencaoPorPeca,
  filtrosManutencao.revisaoPorServico, perfilManutencao.estimativaMaoDeObraPorServico. Entradas
  desconhecidas são ignoradas no cálculo mas continuam persistidas → dado morto e risco de ID
  reutilizado reativar config antiga. Normalizar na fronteira de carga (PerfilContext.tsx:57-59),
  removendo referências inexistentes. Limpeza precisa de testes próprios; não pode depender só do
  schema estrutural.

## TASK-REF-41 - Separar finalidade de carga/severidade em PerfilUso (DT-18)
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/XG
- **Data-hora origem:** 06/06/26 07:38
- **Dependências:** -
- **REQ/ADR/DT:** DT-18, DT-19, ADR-014
- **Observações:** PerfilUso = 'entrega'|'passageiro' (perfil.ts:7) mistura finalidade de uso com
  condição física: entrega usa consumo com baú + intervaloKmEntrega; pneus têm vidaUtilKm única;
  carga/passageiro/baú/uso severo não são fatores independentes; não há modo casual; suspensão não
  é modelada. ADR-014 definiu intervalo canônico no serviço, mas peças ainda carregam intervaloKm e
  intervaloKmEntrega (alimenta a DT-19). ESFORÇO XG p/ IA = QUEBRAR antes de executar. Atravessa
  schema, onboarding, Ajustes, presets, cálculo e explicações da UI. EXIGE decisão de produto e
  dados confiáveis por fator. Recomendação: fonte-base de vida útil + fatores explícitos por
  componente, sem campos editáveis paralelos por modo. Provável ADR.

## TASK-REF-42 - Representar procedência do intervalo peça-serviço (DT-19)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 07:38
- **Dependências:** TASK-REF-41 (alinhar com modelagem DT-18)
- **REQ/ADR/DT:** DT-19, DT-18, ADR-014
- **Observações:** resolverServicoComIntervaloEditado (calculos.ts:188-198) decide se houve edição
  comparando intervalKm com SERVICOS_INDEPENDENTES_PADRAO (default global). Um intervalo vindo do
  preset e ≠ default global é tratado como override do usuário; se o default global virar igual, a
  peça volta ao intervalo do preset. Consumidores divergem: cálculo usa serviços normalizados pelo
  preset; PaginaInsumos.tsx:46-48 e parte de DialogEdicaoCusto.tsx:317 resolvem com
  perfil.servicosIndependentes cru. Ex.: Pop 110i pneu dianteiro vidaUtilKm 25.000, serviço efetivo
  do preset 24.000, default global 25.000 → cálculo pode adotar 24.000 e Insumos cair em 25.000.
  Recomendação: representar procedência do intervalo OU persistir só overrides reais; todos os
  consumidores recebem a mesma lista efetiva. Adicionar teste de integração comparando intervalo
  exibido × intervalo da peça no cálculo × intervalo do serviço vinculado.

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

#### Geradas pela Revisão Geral REV-001 31/05/26

blicos, peças originais e aviso de custo incompleto quando faltar mão de obra.

## Decisões de UI/UX Pendentes


## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |


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

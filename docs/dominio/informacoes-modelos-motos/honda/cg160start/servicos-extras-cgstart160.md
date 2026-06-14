# Serviços extras — Honda CG 160 Start

 Serviços Avulsos (DADOS OFICIAS DA HONDA pra M.O + peça com algumas exceções)

| Serviço | Valor / Status |
| :--- | :--- |
| **Recall** | Solicitar atendimento de recall |
| **Pneu Traseiro** | A combinar |
| **Pneu Dianteiro** | A combinar |
| **Troca de Óleo** | A partir de R$ 50,68 |
| **Bateria** | A partir de R$ 564,74 |
| **Kit Transmissão** *(Coroa, Corrente e Pinhão)* | A combinar |
| **Sapata de Freio Dianteira** | A partir de R$ 19,50 | (incompleto)
| **Sapata de Freio Traseira** | A partir de R$ 201,76 |
| **Vela Ignição** | A partir de R$ 54,07 |
| **Filtro de Ar** | A partir de R$ 86,99 |
| **Patilha de Freio Dianteira** | A partir de R$ 244,33 |




> **Fase 1 (documentação).** A Honda informa **valor completo** (peça + M.O.) para os serviços avulsos
> (`concessionariaIncluiPeca: true`, ADR-014). Onde não informou ("A combinar"), estimamos a M.O.
> Regras: [`manutencao-estimativas.md`](../../../manutencao-estimativas.md). Preços de peça (original)
> de [`precos-pecas-honda-todosmodelos.md`](../../precos-pecas-honda-todosmodelos.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Honda | — |
| Cilindrada | 162,7 cm³ | especificações |
| `fatorMaoDeObra` | **1.15** | faixa 150–180cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Honda (§1.2) |
| Freio dianteiro | **tambor** (sapata) | especificações / consolidado |
| Freio traseiro | **tambor** (sapata) | especificações / consolidado |
| Sincronização de intervalo | ×6.000 km | Honda (§2) |

## Serviços extras (vida útil + peça + M.O. estimada vs. valor oficial)

M.O. estimada = `horas × R$ 110 × 1.15`. "Valor oficial" = preço **completo** (peça + M.O.) informado pela concessionária.

| Serviço extra | Vida útil (km) | Peça orig. (R$) | M.O. est. (R$) | Valor oficial concess. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão | 18.000 | 307 | 228 | A combinar | Tempário 1,8h; baseline Honda |
| Sapata de freio dianteiro | 12.000 | 89 | **19,50** ¹ | — (incompleto) | M.O. **real** R$ 19,50 (só M.O.); peça 89 somada |
| Sapata de freio traseiro | 12.000 | 80 | 82 | 201,76 | Tempário 0,65h |
| Kit embreagem | 42.000 | 312 | 316 | — | Tempário 2,5h |
| Kit cilindro | 102.000 | 563 | 633 | — | Tempário 5h; corretiva |
| Caixa de direção | 42.000 | 120 | 190 | — | Tempário 1,5h; sync 42.000 |
| Pneu dianteiro | 24.000 | 280 | 51 | A combinar | Montagem 0,4h (Honda monta) |
| Pneu traseiro | 18.000 | 311 | 51 | A combinar | Montagem 0,4h |
| Bateria | por tempo (≈36 m) | 400,30 | 38 | 564,74 | Vida por tempo (DTZ5 4Ah) |

¹ A concessionária informou **só a mão de obra** da sapata dianteira (R$ 19,50), não o total. Tratar como **Valor Incompleto** (apenas M.O.) — diferente dos demais avulsos Honda (que vêm completos). Default da M.O. = **19,50** (≠ 0 dos outros incompletos); a peça (R$ 89) é somada à parte. Decisão do humano (14/06/26).

> **Itens da revisão** (óleo R$ 50,68; vela R$ 54,07; filtro de ar R$ 86,99 — valores oficiais) entram via `revisaoAutorizada`, não como extras.

## Notas e pendências (para a fase 2)

- **Freio a tambor nos dois eixos** → usa **sapata** dianteira e traseira (não pastilha/disco). O dado oficial coletado listava "Pastilha Dianteira R$ 244,33" — **descartado** (Start é tambor na dianteira; provável erro).
- Honda informa preço **completo** → no preset, `concessionariaIncluiPeca: true` e o valor oficial vai em `precoTotalAutorizada` (status `informado`).
- FIPE em [`fipe-cgstart160.md`](fipe-cgstart160.md).

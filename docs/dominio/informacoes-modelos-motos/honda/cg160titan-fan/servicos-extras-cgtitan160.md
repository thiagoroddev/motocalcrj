 Serviços Avulsos (DADOS OFICIAS DA HONDA pra M.O + peça com algumas exceções)
utros serviços oferecidos pela concessionária (Avulsos) 

| Serviço | Valor / Status |
| :--- | :--- |
| Recall | Solicitar atendimento de recall |
| Pneu Traseiro | A combinar |
| Pneu Dianteiro | A combinar |
| Troca de Óleo | A partir de R$ 50,68 |
| Bateria | A partir de R$ 571,74 |
| Pastilha de Freio Dianteira | A partir de R$ 240,67 |
| Pastilha de Freio Traseira | A partir de R$ 246,88 |
| Sapata de Freio Traseira | A partir de R$ 40,00 | (INCOMPLETO)
| Vela Ignição | A partir de R$ 57,57 |
| Filtro de Ar | A partir de R$ 90,49 |


# Serviços extras — Honda CG 160 Fan / Titan

> **Fase 1 (documentação).** Cobre **dois modelos** (Fan e Titan) — mesmo motor 160cc e mesmo freio
> (disco diant. + tambor tras.); divergem só no pneu traseiro. Honda informa **valor completo**
> (peça + M.O.). Regras: [`manutencao-estimativas.md`](../../../manutencao-estimativas.md). Peças:
> [`precos-pecas-honda-todosmodelos.md`](../../precos-pecas-honda-todosmodelos.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Honda | — |
| Cilindrada | 162,7 cm³ | especificações |
| `fatorMaoDeObra` | **1.15** | faixa 150–180cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Honda (§1.2) |
| Freio dianteiro | **disco** | consolidado (Grupo Street 160) |
| Freio traseiro | **tambor** (sapata) | consolidado (sapata tras. Fan/Titan) |
| Sincronização de intervalo | ×6.000 km | Honda (§2) |

## Serviços extras (vida útil + peça + M.O. estimada vs. valor oficial)

M.O. estimada = `horas × R$ 110 × 1.15`. "Valor oficial" = preço **completo** (peça + M.O.) da concessionária.

| Serviço extra | Vida útil (km) | Peça orig. (R$) | M.O. est. (R$) | Valor oficial concess. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão | 18.000 | 307 | 228 | — | Tempário 1,8h |
| Pastilha dianteira | 12.000 | 211 | 63 | 240,67 | Freio diant. a disco; tempário 0,5h |
| Disco dianteiro | 48.000 | 501 | 89 | — | Tempário 0,7h; troca por espessura |
| Sapata de freio traseiro | 12.000 | 80 | **40,00** ¹ | — (incompleto) | Freio tras. a tambor; M.O. **real** 40,00 (só M.O.); peça 80 somada |
| Kit embreagem | 42.000 | 312 | 316 | — | Tempário 2,5h |
| Kit cilindro | 102.000 | 563 | 633 | — | Tempário 5h; corretiva |
| Caixa de direção | 42.000 | 120 | 190 | — | Tempário 1,5h |
| Pneu dianteiro | 24.000 | 280 | 51 | A combinar | 80/100-18; montagem 0,4h |
| Pneu traseiro | 18.000 | **Fan 311 / Titan 324** | 51 | A combinar | Fan 90/90-18 × Titan 100/80-18 |
| Bateria | por tempo (≈36 m) | 400,30 | 38 | 571,74 | DTZ5 4Ah |

¹ A concessionária informou **só a M.O.** da sapata traseira (R$ 40,00), não o total → **Valor Incompleto** (`concessionariaIncluiPeca: false`), com a peça (R$ 80) somada à parte; default da M.O. = 40,00 (≠ 0). No app, o flag incompleto já faz a peça aparecer em Insumos e somar no cálculo (BG-034). (decisão do humano, 14/06/26)

> Itens da revisão (óleo R$ 50,68; vela R$ 57,57; filtro de ar R$ 90,49 — oficiais) entram via `revisaoAutorizada`.

## Notas e pendências (para a fase 2)

- **Dois presets** (Fan e Titan) saem deste doc; só o **pneu traseiro** difere (Fan R$ 311 / Titan R$ 324).
- **Freio traseiro a tambor** → sapata traseira (não pastilha). O dado oficial coletado listava
  "Pastilha de Freio Traseira R$ 246,88" — **descartado** (Fan/Titan são tambor atrás; provável erro).
- Honda informa preço **completo** → `concessionariaIncluiPeca: true` no preset.
- FIPE em [`fipe-cgtitan160.md`](fipe-cgtitan160.md).

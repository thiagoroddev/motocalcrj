# Conferência — dados dos novos modelos Honda (fase 1)

> Tudo lado a lado para validar **certo/errado** antes dos presets (fase 2). Gerado na **TASK-DOM-5**
> (14/06/2026). Fontes: `manutencao-estimativas.md` (tempário/regras), `precos-pecas-honda-todosmodelos.md`
> (peça, só original), API Parallelum (FIPE jun/2026). **Honda informa preço completo** (peça + M.O.,
> `concessionariaIncluiPeca: true`) — diferente da Yamaha (só M.O.).

## 1. Parâmetros

| Modelo | Pasta | Cilindrada | Fator | Freio diant. | Freio tras. |
|---|---|---|---|---|---|
| CG 160 Start | `cg160start` | 162,7 | **1.15** | tambor (sapata) | tambor (sapata) |
| CG 160 Fan | `cg160titan-fan` | 162,7 | **1.15** | disco | tambor (sapata) |
| CG 160 Titan | `cg160titan-fan` | 162,7 | **1.15** | disco | tambor (sapata) |
| NXR 160 Bros | `bros160` | 162,7 | **1.15** | disco | disco |
| XRE 190 | `xre190` | 184,4 | **1.15** ¹ | disco | disco |
| CB 250F Twister | `cb250f` | 249,5 | **1.35** | disco | disco |

¹ XRE 190 tem 184cc (logo acima da faixa 150–180); fator 1.15 adotado — **validar** (poderia ser 1.2).

## 2. Mão de obra estimada (R$ = horas × 110 × fator)

| Serviço | Horas | 160/190 (×1.15) | 250 (×1.35) |
|---|---|---|---|
| Kit transmissão | 1,8 | 228 | 267 |
| Kit embreagem | 2,5 | 316 | 371 |
| Kit cilindro | 5,0 | 633 | 743 |
| Pastilha (cada) | 0,5 | 63 | 74 |
| Disco (cada) | 0,7 | 89 | 104 |
| Sapata (cada) | 0,65 | 82 | — |
| Caixa de direção | 1,5 | 190 | 223 |
| Pneu (montagem) | 0,4 | 51 | 59 |
| Bateria | 0,3 | 38 | 45 |

## 3. Vida útil (km) e preço de peça (R$ original)

Intervalos sincronizados ×6.000 (Honda); "250 mais robusto" para o CB250F (acima do baseline 160). `—` = não se aplica ao freio do modelo.

| Item | Interv. 160/190 | Interv. 250 | Start | Fan | Titan | Bros | XRE | CB250F |
|---|---|---|---|---|---|---|---|---|
| Kit transmissão | 18.000 | **24.000** | 307 | 307 | 307 | 314 | 314 | 312 |
| Kit embreagem | 42.000 | **48.000** | 312 | 312 | 312 | 312 | 312 | 1.054 |
| Kit cilindro | 102.000 | **120.000** | 563 | 563 | 563 | 563 | 668 | 797,54 |
| Pastilha dianteira | 12.000 | 12.000 | — | 211 | 211 | 211 | 211 | 269 |
| Disco dianteiro | 48.000 | **60.000** | — | 501 | 501 | 762 | 762 | 576 |
| Pastilha traseira | 18.000 | 18.000 | — | — | — | 222 | 222 | 222 |
| Disco traseiro | 48.000 | **60.000** | — | — | — | 786 | 786 | 727 |
| Sapata dianteira | 12.000 | — | 89 | — | — | — | — | — |
| Sapata traseira | 12.000 | — | 80 | 80 | 80 | — | — | — |
| Caixa de direção | 42.000 | 42.000 | 120 | 120 | 120 | 144 | 144 | 308 |
| Pneu dianteiro | 24.000 | 24.000 | 280 | 280 | 280 | 398 | 398 | 392 |
| Pneu traseiro | 18.000 | 18.000 | 311 | 311 | **324** | 492 | 492 | 518 |
| Bateria | tempo (~36 m) | tempo (~36 m) | 400,30 | 400,30 | 400,30 | 400,30 | 472,60 | 472,60 |

## 4. Valores oficiais da concessionária (completo: peça + M.O.) — já coletados

| Serviço | Start | Fan/Titan | Bros | XRE | CB250F |
|---|---|---|---|---|---|
| Kit transmissão | A combinar | — | 210,27 | A combinar | — |
| Pastilha dianteira | — | 240,67 | 299,12 | 301,12 | — |
| Pastilha traseira | — | — | 242,68 | 244,68 | — |
| Sapata traseira | 201,76 | 40,00 | — | — | — |
| Sapata dianteira | 19,50 ¹ | — | — | — | — |
| Bateria | 564,74 | 571,74 | 563,34 | 495,37 | — |

¹ Sapata dianteira Start R$ 19,50 = **só M.O.** (incompleto), não total. No preset/UI vai na subseção "Valor Incompleto" com default 19,50 (≠ 0 dos demais); a peça (R$ 89) é somada à parte. (decisão do humano, 14/06/26)

## 5. FIPE (jun/2026)

| Modelo | `nomeFipe` | código | Faixa de anos |
|---|---|---|---|
| CG 160 Start | `CG 160 START` | 811139-1 | 2016–2026 |
| CG 160 Fan | `CG 160 FAN Flex` | 811147-2 | 2018–2026 |
| CG 160 Titan | `CG 160 TITAN FLEXONE/Ed.Especial 40 Anos` | 811133-2 (+811192-8 p/ 2026) | 2016–2026 |
| NXR 160 Bros | `NXR 160 BROS ESDD FLEXONE` | 811130-8 (+811182-0 p/ 2025–26) | 2015–2026 |
| XRE 190 | `XRE 190/ Flex` | 811141-3 | 2016–2026 |
| CB 250F | `CB 250 TWISTER/FLEXONE` | 811135-9 | 2016–2022 (descont.) |

## 6. Pendências / a validar (fase 2)

1. **Honda = preço completo** (peça + M.O.) → presets com `concessionariaIncluiPeca: true`; os valores oficiais (§4) vão em `precoTotalAutorizada` (status `informado`). Confirmar que cada valor coletado é mesmo completo.
2. **Inconsistências limpas** dos dados oficiais: descartadas "pastilha dianteira" no Start (tambor) e "pastilha traseira" no Fan/Titan (tambor tras.); sapata dianteira Start R$ 19,50 a confirmar.
3. **XRE 190 (184cc):** fator 1.15 adotado — validar.
4. **CB250F:** sem valores oficiais coletados; todos estimados.
5. **Intervalos "250 mais robusto" + sync ×6.000:** estimados, validar.
6. **Fan × Titan:** 2 presets na fase 2; só o pneu traseiro difere (311 × 324).
7. **Freio traseiro a disco** (Bros/XRE/CB250F): já suportado no app (RF-6.38/6.39).

## 7. Como validar

Confira contra a oficina/concessionária. Onde estiver errado, ajuste no `servicos-extras-<modelo>.md` (M.O./vida útil/oficial) ou no `precos-pecas-honda-todosmodelos.md` (peça). A fase 2 lê **destes arquivos**.

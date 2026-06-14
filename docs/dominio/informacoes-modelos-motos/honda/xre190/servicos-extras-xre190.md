Outros serviços oferecidos pela concessionária (Avulsos)

| Serviço | Valor / Status |
| :--- | :--- |
| **Recall** | Solicitar atendimento de recall |
| **Pneu Traseiro** | A combinar |
| **Pneu Dianteiro** | A combinar |
| **Troca de Óleo** | A partir de R$ 50,68 |
| **Bateria** | A partir de R$ 495,37 |
| **Kit Transmissão** *(Coroa, Corrente e Pinhão)* | A combinar |
| **Pastilha de Freio Dianteira** | A partir de R$ 301,12 |
| **Pastilha de freio Traseiro** | A partir de R$ 244,68 |
| **Vela Ignição** | A partir de R$ 63,17 |
| **Filtro de Ar** | A partir de R$ 177,44 |



# Serviços extras — Honda XRE 190

> **Fase 1 (documentação).** Trail 190cc, freio a **disco nos dois eixos**. Honda informa **valor
> completo** (peça + M.O.). Regras: [`manutencao-estimativas.md`](../../../manutencao-estimativas.md).
> Peças: [`precos-pecas-honda-todosmodelos.md`](../../precos-pecas-honda-todosmodelos.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Honda | — |
| Cilindrada | 184,4 cm³ | especificações |
| `fatorMaoDeObra` | **1.15** | faixa 150–180cc (§1.4) — 184cc fica no teto da faixa |
| Taxa M.O. | R$ 110/h | taxa Honda (§1.2) |
| Freio dianteiro | **disco** | consolidado (Grupo Trail) |
| Freio traseiro | **disco** | consolidado (Grupo Trail) |
| Sincronização de intervalo | ×6.000 km | Honda (§2) |

## Serviços extras (vida útil + peça + M.O. estimada vs. valor oficial)

M.O. estimada = `horas × R$ 110 × 1.15`. "Valor oficial" = preço **completo** (peça + M.O.) da concessionária.

| Serviço extra | Vida útil (km) | Peça orig. (R$) | M.O. est. (R$) | Valor oficial concess. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão | 18.000 | 314 | 228 | A combinar | Tempário 1,8h |
| Pastilha dianteira | 12.000 | 211 | 63 | 301,12 | Tempário 0,5h |
| Disco dianteiro | 48.000 | 762 | 89 | — | Tempário 0,7h |
| Pastilha traseira | 18.000 | 222 | 63 | 244,68 | Disco tras.; tempário 0,5h |
| Disco traseiro | 48.000 | 786 | 89 | — | Tempário 0,7h |
| Kit embreagem | 42.000 | 312 | 316 | — | Tempário 2,5h |
| Kit cilindro | 102.000 | 668 | 633 | — | Tempário 5h; cilindro exclusivo XRE 190 |
| Caixa de direção | 42.000 | 144 | 190 | — | Tempário 1,5h |
| Pneu dianteiro | 24.000 | 398 | 51 | A combinar | 90/90-19; montagem 0,4h |
| Pneu traseiro | 18.000 | 492 | 51 | A combinar | 110/90-17 |
| Bateria | por tempo (≈36 m) | 472,60 | 38 | 495,37 | DTZ6 5Ah |

> Itens da revisão (óleo R$ 50,68; vela R$ 63,17; filtro de ar R$ 177,44 — oficiais) entram via `revisaoAutorizada`.

## Notas e pendências (para a fase 2)

- **184cc**: dentro da faixa 150–180? Fica logo acima; `fatorMaoDeObra` adotado **1.15** (a validar — pode justificar 1.2).
- **Freio a disco diant.+tras.** → pastilha + disco nos dois eixos.
- Honda informa preço **completo** → `concessionariaIncluiPeca: true` no preset.
- FIPE em [`fipe-xre190.md`](fipe-xre190.md).

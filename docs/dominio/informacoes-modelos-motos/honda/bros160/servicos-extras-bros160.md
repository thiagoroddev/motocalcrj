 Serviços Avulsos (DADOS OFICIAS DA HONDA pra M.O + peça com algumas exceções)
Outros serviços oferecidos pela concessionária (Avulsos) 

| Serviço | Valor / Status |
| :--- | :--- |
| **Recall** | Solicitar atendimento de recall |
| **Pneu Traseiro** | A combinar |
| **Pneu Dianteiro** | A combinar |
| **Troca de Óleo** | A partir de R$ 50,68 |
| **Bateria** | A partir de R$ 563,34 |
| **Kit Transmissão (Coroa, Corrente e Pinhão)** | A partir de R$ 210,27 |
| **Pastilha de Freio Dianteira** | A partir de R$ 299,12 |
| **Pastilha de freio Traseiro** | A partir de R$ 242,68 |
| **Vela Ignição** | A partir de R$ 53,37 |
| **Filtro de Ar** | A partir de R$ 179,24 |
| **Kit Transmissão** (adicional) | A partir de R$ 52,20 |





# Serviços extras — Honda NXR 160 Bros

> **Fase 1 (documentação).** Trail 160cc, freio a **disco nos dois eixos** (versão ESDD). Honda informa
> **valor completo** (peça + M.O.). Regras: [`manutencao-estimativas.md`](../../../manutencao-estimativas.md).
> Peças: [`precos-pecas-honda-todosmodelos.md`](../../precos-pecas-honda-todosmodelos.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Honda | — |
| Cilindrada | 162,7 cm³ | especificações |
| `fatorMaoDeObra` | **1.15** | faixa 150–180cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Honda (§1.2) |
| Freio dianteiro | **disco** | consolidado (Grupo Trail) |
| Freio traseiro | **disco** | consolidado (Grupo Trail) |
| Sincronização de intervalo | ×6.000 km | Honda (§2) |

## Serviços extras (vida útil + peça + M.O. estimada vs. valor oficial)

M.O. estimada = `horas × R$ 110 × 1.15`. "Valor oficial" = preço **completo** (peça + M.O.) da concessionária.

| Serviço extra | Vida útil (km) | Peça orig. (R$) | M.O. est. (R$) | Valor oficial concess. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão | 18.000 | 314 | 228 | 210,27 | Tempário 1,8h |
| Pastilha dianteira | 12.000 | 211 | 63 | 299,12 | Tempário 0,5h |
| Disco dianteiro | 48.000 | 762 | 89 | — | Tempário 0,7h |
| Pastilha traseira | 18.000 | 222 | 63 | 242,68 | Disco tras.; tempário 0,5h |
| Disco traseiro | 48.000 | 786 | 89 | — | Tempário 0,7h |
| Kit embreagem | 42.000 | 312 | 316 | — | Tempário 2,5h |
| Kit cilindro | 102.000 | 563 | 633 | — | Tempário 5h |
| Caixa de direção | 42.000 | 144 | 190 | — | Tempário 1,5h |
| Pneu dianteiro | 24.000 | 398 | 51 | A combinar | 90/90-19; montagem 0,4h |
| Pneu traseiro | 18.000 | 492 | 51 | A combinar | 110/90-17 |
| Bateria | por tempo (≈36 m) | 400,30 | 38 | 563,34 | DTZ5 4Ah |

> Itens da revisão (óleo R$ 50,68; vela R$ 53,37; filtro de ar R$ 179,24 — oficiais) entram via `revisaoAutorizada`.

## Notas e pendências (para a fase 2)

- **Freio a disco diant.+tras.** → pastilha + disco nos dois eixos (RF-6.38 já habilitou o traseiro a disco).
- Honda informa preço **completo** → `concessionariaIncluiPeca: true` no preset.
- FIPE em [`fipe-bros160.md`](fipe-bros160.md) (`NXR 160 BROS ESDD FLEXONE`).

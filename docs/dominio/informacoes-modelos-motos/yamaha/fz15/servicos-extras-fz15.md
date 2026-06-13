# Serviços extras — Yamaha FZ15 (Fazer FZ15 ABS)

> **Fase 1 (documentação).** Estimativas de **mão de obra** e **vida útil** dos serviços
> avulsos/extras que aparecem na tela **Mão de Obra** do app. Não é preset — alimenta o
> preset da fase 2. Regras: [`manutencao-estimativas.md`](../../../manutencao-estimativas.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Yamaha | — |
| Cilindrada | 149,3 cm³ | especificações |
| `fatorMaoDeObra` | **1.15** | faixa 150–180cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Yamaha (§1.2) |
| Freio dianteiro | disco | especificações |
| Freio traseiro | **disco** | especificações → usa **pastilha + disco traseiro** (não sapata/lona) |
| Sincronização de intervalo | ×5.000 km | Yamaha (§2) |

## M.O. estimada + vida útil + peça

Fórmula: **M.O. estimada = horas × R$ 110 × 1.15**. Peça = preço médio **original** de
[`precos-pecas-yamaha-todosmodelos.md`](../../precos-pecas-yamaha-todosmodelos.md) (sem paralela).

| Serviço extra | Horas | M.O. est. (R$) | Vida útil (km) | Peça orig. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão (relação) | 1,8 | **228** | 25.000 | 405 | Tempário 1,8h; vida baseline Yamaha 125/150 (Factor) |
| Kit embreagem | 2,5 | **316** | 40.000 | 328 | Tempário 2,5h; vida baseline 150 |
| Kit cilindro | 5,0 | **633** | 115.000 | 727 | Tempário 5h; corretiva, baseline 150 |
| Pastilha dianteira | 0,8 | **101** | 10.000 | 212 | Tempário 0,8h; freio diant. faz a maior parte da frenagem (sync 10.000) |
| Disco dianteiro | 0,8 | **101** | 50.000 | 528 | Tempário 0,8h; troca por espessura mínima |
| Pastilha traseira | 0,8 | **101** | 20.000 | 259 | Disco traseiro; pastilha tras. dura mais que a diant. (sync 20.000) |
| Disco traseiro | 0,8 | **101** | 50.000 | 466 | Troca por espessura mínima |
| Caixa de direção | 1,5 | **190** | 40.000 | 364 | Tempário 1,5h (TASK-RF-6.37); sync Yamaha 40.000 |
| Pneu dianteiro (excepcional) | — | — | 22.500 | 396 | Yamaha não troca pneu → só peça; vida direta (não sincroniza) |
| Pneu traseiro (excepcional) | — | — | 15.000 | 532 | Idem; desgaste maior por tração |
| Bateria | 0,3 | **38** | por tempo (≈36 m) | 231 | Vida por tempo, não km (XTZ6L) |

> **Itens pagos pela Yamaha nas primeiras revisões** (óleo, vela, filtros) têm M.O. **real**
> (informada) e entram via `revisaoAutorizada` — não são "extras". Listados aqui só para referência:
> óleo 0,5h → ~R$ 63 (R$ 58 peça); vela/filtro 0,3h → ~R$ 38.

## Notas e pendências (para a fase 2)

- **Freio traseiro a disco** → o preset precisa de `pastilha_freio_traseiro` + `disco_freio_traseiro`
  e dos serviços `troca-pastilha-traseira` / `troca-disco-traseiro`, que **ainda não existem** nos
  presets atuais (Factor usa tambor/sapata). Exige novos ids + mapas em `calculos.ts` + ícone
  (mesmo trabalho da caixa de direção na RF-6.37).
- Vida útil dos itens herdada do baseline Yamaha 125/150 (família Factor/Fazer) — **a validar**.
- FIPE em [`fipe-fz15.md`](fipe-fz15.md).

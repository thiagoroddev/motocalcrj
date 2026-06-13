# Serviços extras — Yamaha Lander 250 (XTZ250)

> **Fase 1 (documentação).** Estimativas de **mão de obra** e **vida útil** dos serviços
> avulsos/extras da tela **Mão de Obra**. Não é preset — alimenta a fase 2. Regras:
> [`manutencao-estimativas.md`](../../../manutencao-estimativas.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Yamaha | — |
| Cilindrada | 249,5 cm³ | especificações |
| `fatorMaoDeObra` | **1.35** | faixa 250cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Yamaha (§1.2) |
| Freio dianteiro | disco | especificações |
| Freio traseiro | **disco** | especificações → **pastilha + disco traseiro** (não sapata) |
| Tipo | **trail** (pneu com câmara, aro 21"/18", Tourance) | especificações |
| Sincronização de intervalo | ×5.000 km | Yamaha (§2) |

## M.O. estimada + vida útil + peça

Fórmula: **M.O. estimada = horas × R$ 110 × 1.35**. Peça = preço médio **original** de
[`precos-pecas-yamaha-todosmodelos.md`](../../precos-pecas-yamaha-todosmodelos.md).

| Serviço extra | Horas | M.O. est. (R$) | Vida útil (km) | Peça orig. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão (relação) | 1,8 | **267** | 30.000 | 442 | Tempário 1,8h; **250cc mais robusto** → +5.000 sobre o baseline 150 |
| Kit embreagem | 2,5 | **371** | 50.000 | 1.469 | Tempário 2,5h; embreagem 250 dura mais (+10.000) |
| Kit cilindro | 5,0 | **743** | 130.000 | 676 | Tempário 5h; motor 250 mais robusto (+15.000) |
| Pastilha dianteira | 0,8 | **119** | 10.000 | 196 | Atrito — não muda com cilindrada (sync 10.000) |
| Disco dianteiro | 0,8 | **119** | 60.000 | 935 | Disco 250 mais robusto (+10.000); troca por espessura mínima |
| Pastilha traseira | 0,8 | **119** | 20.000 | 310 | Atrito — disco traseiro (sync 20.000) |
| Disco traseiro | 0,8 | **119** | 60.000 | 708 | Disco 250 mais robusto (+10.000); troca por espessura mínima |
| Caixa de direção | 1,5 | **223** | 40.000 | 1.165 | Tempário 1,5h; sync Yamaha 40.000 |
| Pneu dianteiro (excepcional) | — | — | 20.000 | 336 | Pneu trail (com câmara) → vida menor que rua; vida direta (a validar) |
| Pneu traseiro (excepcional) | — | — | 12.000 | 532 | Pneu trail 18"; tração + uso misto |
| Bateria | 0,3 | **45** | por tempo (≈36 m) | 200 | Vida por tempo (XTZ7L) |

> Itens da revisão (óleo 0,5h → ~R$ 74 / peça R$ 100; vela/filtro 0,3h → ~R$ 45) têm M.O. real e
> entram via `revisaoAutorizada`.

## Notas e pendências (para a fase 2)

- **Freio traseiro a disco** → preset precisa de `pastilha_freio_traseiro` + `disco_freio_traseiro`
  e serviços `troca-pastilha-traseira` / `troca-disco-traseiro` (novos ids + mapas + ícone).
- **Pneu trail com câmara** (aro 21"/18", Metzeler Tourance): vida e preço divergem das urbanas —
  intervalos estimados menores e **a validar**; o app não cobra montagem (excepcional Yamaha).
- Disco dianteiro (R$ 935) e caixa de direção (R$ 1.165) são os mais caros do grupo — conferir
  impacto no custo amortizado.
- **Partes metálicas com intervalo acima do baseline 150** (250cc mais robusto): transmissão 30.000,
  embreagem 50.000, cilindro 130.000, discos 60.000. Atrito e caixa de direção mantêm o baseline.
  Sincronizado ×5.000 — **a validar**.
- FIPE em [`fipe-lander250.md`](fipe-lander250.md).

# Serviços extras — Yamaha Fazer 250 (YS250, 2016)

> **Fase 1 (documentação).** Estimativas de **mão de obra** e **vida útil** dos serviços
> avulsos/extras da tela **Mão de Obra**. Não é preset — alimenta a fase 2. Regras:
> [`manutencao-estimativas.md`](../../../manutencao-estimativas.md).

## Parâmetros do modelo

| Parâmetro | Valor | Origem |
|---|---|---|
| Marca | Yamaha | — |
| Cilindrada | 249 cm³ | especificações |
| `fatorMaoDeObra` | **1.35** | faixa 250cc (§1.4) |
| Taxa M.O. | R$ 110/h | taxa Yamaha (§1.2) |
| Freio dianteiro | disco | especificações |
| Freio traseiro | **disco** | especificações → **pastilha + disco traseiro** (não sapata) |
| Sincronização de intervalo | ×5.000 km | Yamaha (§2) |

## M.O. estimada + vida útil + peça

Fórmula: **M.O. estimada = horas × R$ 110 × 1.35**. Peça = preço médio **original** de
[`precos-pecas-yamaha-todosmodelos.md`](../../precos-pecas-yamaha-todosmodelos.md).

| Serviço extra | Horas | M.O. est. (R$) | Vida útil (km) | Peça orig. (R$) | Lógica |
|---|---|---|---|---|---|
| Kit transmissão (relação) | 1,8 | **267** | 30.000 | 334 | Tempário 1,8h; **250cc mais robusto** → +5.000 sobre o baseline 150 |
| Kit embreagem | 2,5 | **371** | 50.000 | 1.469 | Tempário 2,5h; embreagem 250 dura mais (+10.000) |
| Kit cilindro | 5,0 | **743** | 130.000 | 676 | Tempário 5h; motor 250 mais robusto (+15.000) |
| Pastilha dianteira | 0,8 | **119** | 10.000 | 185 | Atrito — não muda com cilindrada (sync 10.000) |
| Disco dianteiro | 0,8 | **119** | 60.000 | 790 | Disco 250 mais robusto (+10.000); troca por espessura mínima |
| Pastilha traseira | 0,8 | **119** | 20.000 | 310 | Atrito — disco traseiro (sync 20.000) |
| Disco traseiro | 0,8 | **119** | 60.000 | 466 | Mesma média FZ15/FZ25; disco 250 mais robusto (+10.000) |
| Caixa de direção | 1,5 | **223** | 40.000 | 524,40 | Tempário 1,5h; sync Yamaha 40.000 |
| Pneu dianteiro (excepcional) | — | — | 22.500 | 396 | Yamaha não troca → só peça; vida direta |
| Pneu traseiro (excepcional) | — | — | 15.000 | 532 | Idem; desgaste maior |
| Bateria | 0,3 | **45** | por tempo (≈36 m) | 226 | Vida por tempo (XTZ-DL 6Ah) |

> Itens da revisão (óleo 0,5h → ~R$ 74 / peça R$ 100; vela/filtro 0,3h → ~R$ 45) têm M.O. real e
> entram via `revisaoAutorizada`.

## Notas e pendências (para a fase 2)

- **Freio traseiro a disco** → preset precisa de `pastilha_freio_traseiro` + `disco_freio_traseiro`
  e serviços `troca-pastilha-traseira` / `troca-disco-traseiro` (novos ids + mapas + ícone).
- **Partes metálicas com intervalo acima do baseline 150** (250cc mais robusto): transmissão 30.000,
  embreagem 50.000, cilindro 130.000, discos 60.000. Atrito e caixa de direção mantêm o baseline.
  Sincronizado ×5.000 — **a validar**.
- Disco traseiro: usa a mesma média **R$ 466** de FZ15/FZ25 (confirmado pelo humano em 12/06/26 —
  faltava só o nome na tabela consolidada).
- Modelo **descontinuado** (2006–2017): FIPE não tem anos novos — ok para histórico/usados.
- FIPE em [`fipe-fazerys250.md`](fipe-fazerys250.md).

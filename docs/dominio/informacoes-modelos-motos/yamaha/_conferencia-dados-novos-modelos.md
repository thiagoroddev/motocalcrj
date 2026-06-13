# Conferência — dados dos novos modelos Yamaha (fase 1)

> **Objetivo:** ver lado a lado, num lugar só, tudo que foi estimado/coletado para os 4 modelos
> novos, para validar **certo/errado** antes de criar os presets (fase 2).
> Gerado na **TASK-DOM-3** (12/06/2026). Fontes: `manutencao-estimativas.md` (tempário/regras),
> `precos-pecas-yamaha-todosmodelos.md` (peça, só original), API Parallelum (FIPE jun/2026).

## 1. Parâmetros

| Modelo | Pasta | Cilindrada | Fator M.O. | Freio diant. | Freio tras. | Observação |
|---|---|---|---|---|---|---|
| FZ15 (Fazer FZ15 ABS) | `fz15` | 149 cm³ | **1.15** | disco | **disco** | urbana |
| FZ25 (Fazer FZ25 ABS) | `fz25` | 249 cm³ | **1.35** | disco | **disco** | urbana |
| Fazer 250 2016 (YS250) | `fazerys250` | 249 cm³ | **1.35** | disco | **disco** | descontinuada |
| Lander 250 (XTZ250) | `lander250` | 249,5 cm³ | **1.35** | disco | **disco** | trail (câmara, 21"/18") |

> **Todos com disco traseiro** → usam **pastilha + disco traseiro** (não sapata/lona, ao contrário
> do Factor/Fazer 150). Ver §4 (pendência de fase 2).

## 2. Mão de obra estimada (R$ = horas × 110 × fator)

| Serviço | Horas | FZ15 (×1.15) | FZ25 / Fazer250 / Lander (×1.35) |
|---|---|---|---|
| Kit transmissão | 1,8 | 228 | 267 |
| Kit embreagem | 2,5 | 316 | 371 |
| Kit cilindro | 5,0 | 633 | 743 |
| Pastilha (cada) | 0,8 | 101 | 119 |
| Disco (cada) | 0,8 | 101 | 119 |
| Caixa de direção | 1,5 | 190 | 223 |
| Óleo | 0,5 | 63 | 74 |
| Vela / filtro / bateria | 0,3 | 38 | 45 |

## 3. Vida útil / intervalo (km) e preço de peça (R$ original)

Intervalos sincronizados ×5.000 (Yamaha); excepcionais (pneu) usam vida direta. **Partes metálicas
do 250 duram mais que no 150** (motor/transmissão/discos mais robustos) → intervalo maior; atrito
(pastilhas) e caixa de direção não mudam com a cilindrada.

| Item | Interv. 150 (FZ15) | Interv. 250 | FZ15 | FZ25 | Fazer250 | Lander |
|---|---|---|---|---|---|---|
| Kit transmissão (relação) | 25.000 | **30.000** | 405 | 316 | 334 | 442 |
| Kit embreagem | 40.000 | **50.000** | 328 | 1.469 | 1.469 | 1.469 |
| Kit cilindro | 115.000 | **130.000** | 727 | 676 | 676 | 676 |
| Pastilha dianteira | 10.000 | 10.000 | 212 | 253,56 | 185 | 196 |
| Disco dianteiro | 50.000 | **60.000** | 528 | 528 | 790 | 935 |
| Pastilha traseira | 20.000 | 20.000 | 259 | 310 | 310 | 310 |
| Disco traseiro | 50.000 | **60.000** | 466 | 466 | 466 | 708 |
| Caixa de direção | 40.000 | 40.000 | 364 | 1.156,40 | 524,40 | 1.165 |
| Pneu dianteiro (exc.) | 22.500 | 22.500¹ | 396 | 396 | 396 | 336 |
| Pneu traseiro (exc.) | 15.000 | 15.000¹ | 532 | 518 | 532 | 532 |
| Bateria | tempo (~36 m) | tempo (~36 m) | 231 | 200 | 226 | 200 |

¹ **Lander** (trail, pneu com câmara): vida estimada menor — diant. **20.000** / tras. **12.000** (a validar).

## 4. FIPE (jun/2026, API Parallelum)

| Modelo | `nomeFipe` | código | Faixa de anos | Preço atual de ref. |
|---|---|---|---|---|
| FZ15 | `FZ15 150 FAZER FLEX` | 827124-0 | 2023–2024 | 2024 = R$ 17.796 |
| FZ15 (Connected) | `FZ15 150 FAZER CONNECTED FLEX` | 827133-0 | 2025–2026 | 2026 = R$ 20.368 |
| FZ25 | `FZ25 250 FAZER FLEX` | 827107-0 | 2018–2024 | 2024 = R$ 22.412 |
| Fazer 250 (YS250) | `YS 250 FAZER/ FAZER L. EDITION /BLUEFLEX` | 827052-0 | 2006–2017 | 2016 = R$ 15.106 |
| Lander 250 | `XTZ 250 LANDER 249cc/LANDER BLUEFLEX/ABS` | 827059-7 | 2007–2025 | 2024 = R$ 27.165 |

Tabelas ano→valor completas em cada `fipe-<modelo>.md`.

## 5. Pendências para a fase 2 (criar presets)

1. **Freio traseiro a disco (todos):** o app/preset ainda **não** tem `pastilha_freio_traseiro`,
   `disco_freio_traseiro` nem os serviços `troca-pastilha-traseira` / `troca-disco-traseiro`.
   Criar (peça em `pecas[]`, serviço em `servicosManutencao[]`, tempário, 3 mapas de `calculos.ts`,
   chave em `KmUltimaTrocas` + schema/defaults/`SecaoUltimasManutencoes` + ícone) — mesmo trabalho da
   caixa de direção (TASK-RF-6.37).
2. ~~Disco traseiro Fazer 250 ausente~~ — **resolvido** (12/06/26): usa a mesma média R$ 466 de FZ15/FZ25.
3. **Vida útil 250cc:** ajustada para cima nos itens metálicos (regra "250 mais robusto"); validar os
   intervalos escolhidos (transmissão 30.000, embreagem 50.000, cilindro 130.000, discos 60.000).
4. **Pneu trail Lander:** vida e preço divergem das urbanas; confirmar intervalos.
5. **FZ15 ano atual:** decidir se o preset inclui 2025–2026 (variante CONNECTED, código distinto).

## 6. Como validar

Confira esta planilha contra a realidade da oficina/concessionária. Onde estiver **errado**, ajuste
direto no `servicos-extras-<modelo>.md` correspondente (M.O./vida útil) ou no
`precos-pecas-yamaha-todosmodelos.md` (peça). A fase 2 lê **destes arquivos**.

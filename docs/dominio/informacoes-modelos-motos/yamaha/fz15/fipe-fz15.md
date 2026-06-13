# FIPE — Yamaha FZ15 (Fazer FZ15 ABS)

> Fonte: API Parallelum FIPE v2 (`motorcycles`), mesma do `scripts/atualizar-fipe-presets.mjs`.
> **Mês de referência:** junho de 2026. Coleta: 12/06/2026.
> Para o preset (fase 2): `nomeFipe = "FZ15 150 FAZER FLEX"`, rodar `npm run fipe:update`.

## FZ15 150 FAZER FLEX — `codigoFipe 827124-0`

| Ano-modelo | Preço médio (R$) |
|---|---|
| 2023 | 17.265 |
| 2024 | 17.796 |

## FZ15 150 FAZER CONNECTED FLEX — `codigoFipe 827133-0` (geração 2025+)

| Ano-modelo | Preço médio (R$) |
|---|---|
| 2025 | 19.324 |
| 2026 | 20.368 |

## Notas

- O FZ15 é **recente** na FIPE: a linha FLEX cobre 2023–2024; de 2025 em diante o registro passa
  para a variante **CONNECTED FLEX** (código diferente). Para o preset MVP, usar a FLEX
  (`827124-0`); incluir 2025–2026 da CONNECTED se quisermos cobrir o ano atual.
- `nomeFipe` exato retornado pela API: **`FZ15 150 FAZER FLEX`**.

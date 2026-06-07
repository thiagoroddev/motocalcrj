# TASK-REF-44 - Selecionar revisões fixas por faixa de ano

- **Status:** CANCELADA
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** Imediata
- **Data-hora origem:** 06/06/26 22:05
- **Data-hora cancelamento:** 07/06/26 15:05
- **Dependências:** validação humana de `revisoes-pop110i.md` (feita)
- **REQ/ADR/DT:** ADR-011, ADR-018, ADR-019, INV-CALC-2, INV-CALC-3

## O Que NÃO Foi Feito (e Por Quê)

Tarefa **cancelada antes de qualquer execução**.

- **Motivo:** a premissa caiu. A "variação por faixa de ano" das revisões fixas Honda (faixas
  `2016-2024`, `2025-2026`, `2027`) que motivou esta tarefa era, na verdade, **diferença de modelo**,
  não de ano: a **Pop 110i ES (2025+) é outra geração/modelo**, não anos da Pop 110i atual. O humano
  validou `revisoes-pop110i.md` e confirmou que **dentro da Pop 110i (2016-2024) não há variação de
  preço de revisão por ano**.
- **Decisão registrada:** **ADR-019** — um preset por modelo; só o valor FIPE varia por ano; revisão
  fixa é tabela única por modelo (igual à Yamaha); modelos derivados (Pop ES) são presets próprios e
  ficam para o futuro; MVP só com Pop 110i e Factor 125i.
- As inconsistências de fonte que esta tarefa pediria confirmar (título `2017-2024` × faixa
  `2016-2024`; total de 1.000 km `120,44 + 0` registrado como `120,64`) deixam de ser bloqueio para
  o MVP: a Pop 110i usa tabela única de revisão; pontos finos do levantamento podem ser revisados se
  e quando a Pop ES virar preset próprio.
- Nenhum arquivo de código foi alterado por esta tarefa.

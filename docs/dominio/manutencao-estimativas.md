# Manutenção — estimativas de mão de obra e intervalos

> Fonte de domínio (ADR-013 e ADR-014). Reúne, num lugar só, **(1)** o método de estimativa de mão de obra por horagem × taxa × fator e **(2)** a convenção de intervalos sincronizados com a revisão. O código deve refletir esta tabela; não pode contradizê-la.

---

## 1. Estimativa de mão de obra (opt-in, `base × fator`)

A estimativa de M.O. é **opcional, off por padrão e sempre rotulada `~`** (ADR-013). Só preenche os "buracos" — onde a concessionária não informou. Onde há valor real, o real vence.

```
MO_estimada(serviço, modelo) = horas[serviço] × taxa[marca] × fatorMaoDeObra[modelo]
```

A M.O. é estimada; **a peça é sempre real** (preço do preset).

### 1.1 Tempário (horas por serviço — baseline ~125cc)

| Serviço | Horas |
|---|---|
| Kit transmissão (relação) | ~1,8h |
| Kit embreagem (tampa lateral, discos, platô) | ~2,5h |
| Kit cilindro (motor superior: cabeçote, pistão, anéis) | ~5h |
| Disco / pastilha | ~0,8h |
| Pneu (montagem) | ~0,5h |
| Vela / filtro / bateria | ~0,3h |
| Óleo | ~0,5h |
| Sapata de freio | ~0,65h |
| Caixa de direção | ~1,5h |

### 1.2 Taxa horária por marca (calibrada por dados reais)

Os 3 reais da Yamaha calibram a taxa: óleo 55 (0,5h), sapata 70 (0,8h), kit transmissão 220 (1,8h) → **≈ R$ 110/h**. (Bate: 0,5×110=55 ✓; 1,8×110=198 ≈ 220 ✓.) Hoje ambas as marcas usam 110/h.

| Marca | Taxa (R$/h) | Calibração |
|---|---|---|
| Honda | 110 | Vela R$ 13 a ~0,12h (site Honda) |
| Yamaha | 110 | Óleo 55 / Sapata 70 / Kit transmissão 220 (WhatsApp) |

### 1.3 Estimativa de M.O. por marca (fator 1.0) — só os buracos

**Negrito = valor real · `~` = estimado (horas × R$ 110)**

| Serviço | Yamaha | Honda |
|---|---|---|
| Kit transmissão | **220** | ~200 (site: "A combinar") |
| Kit embreagem | ~275 | ~275 |
| Kit cilindro | ~550 | ~550 |
| Disco / pastilha | ~90 | ~90 |
| Pneu (montagem) | — *(não faz)* | ~55 (site: "A combinar") |
| Sapata | **70** | **(site: cheio 289/212)** |
| Óleo | **55** | **(site: cheio)** |
| Caixa de direção | ~165 | ~165 (avulso incompleto: só M.O.; peça à parte) |

### 1.4 Fator por modelo (`fatorMaoDeObra`, proxy de cilindrada 110–250)

| Faixa | Fator | Exemplos |
|---|---|---|
| 110–125cc | 1.0 | Pop 110i, Factor 125i (baselines) |
| 150–180cc | 1.15 | Fan/Titan 160, Factor 150 |
| 250cc | 1.35 | Lander 250 |

> Marca diferente informa o preço de forma diferente: **Honda** dá peça+M.O. juntas (`concessionariaIncluiPeca: true` → esconde a peça em Insumos); **Yamaha** dá só M.O. (`false` → soma a peça). Estimativa e edição do usuário são sempre só M.O. (ADR-014).

---

## 2. Intervalos (vida útil sincronizada com a revisão)

A **vida útil/intervalo mora no serviço** (aba Mão de Obra); Insumos só tem o preço da peça. O intervalo é estimado pelo desgaste realista (uso de entrega) e **arredondado para a revisão fixa da marca mais próxima**, porque o avulso é feito junto de uma revisão:

- **Honda:** múltiplos de **6.000** km · **Yamaha:** múltiplos de **5.000** km.
- Empate de distância → arredonda **para baixo**.
- Excepcionais (a concessionária não executa: pneu na Yamaha, retíficas) **não** sincronizam — usam a vida direta.

### 2.1 Pop 110i — Honda (×6.000)

| Serviço | Vida realista (entrega) | Intervalo sincronizado |
|---|---|---|
| Kit transmissão | ~18.000 | **18.000** |
| Pneu dianteiro | ~25.000 | **24.000** |
| Pneu traseiro | ~16.000 | **18.000** |
| Sapata dianteira | ~12.000 | **12.000** |
| Sapata traseira | ~12.000 | **12.000** |
| Kit embreagem | ~40.000 | **42.000** |
| Kit cilindro | ~100.000 | **102.000** |
| Caixa de direção | ~40.000 | **42.000** |
| Bateria | por tempo | — (meses) |

### 2.2 Factor 125i — Yamaha (×5.000)

| Serviço | Vida realista (entrega) | Intervalo sincronizado |
|---|---|---|
| Kit transmissão | ~25.000 | **25.000** |
| Sapata traseira | ~20.000 | **20.000** |
| Pastilha dianteira | ~11.500 | **10.000** |
| Disco dianteiro | ~50.000 | **50.000** |
| Kit embreagem | ~40.000 | **40.000** |
| Kit cilindro | ~115.000 | **115.000** |
| Caixa de direção | ~40.000 | **40.000** |
| Bateria | por tempo | — (meses) |
| **Pneu diant./tras.** (excepcional) | ~22.500 / 15.000 | **22.500 / 15.000** (direto, não sincroniza) |

---

## 3. Custo da Revisão Geral: amortizado por design (⚠️ NÃO é bug)

A **Revisão Geral** (pacote da concessionária) tem custo **amortizado**, e isso é **decisão de modelagem deliberada — não um defeito**. Uma IA futura **não** deve "consertar" isso trocando para contagem ancorada sem decisão explícita do humano. (Reanalisado e confirmado em 04/06/26.)

**Por quê:** o app é um estimador de **custo de operação por km** (orçamento do motoboy). Amortizar manutenção programada é o padrão de TCO: dá um CPK **estável**, que não salta conforme a fase do odômetro. Sobre um ciclo completo, amortizado e ancorado somam **o mesmo total** — a diferença é só **temporal** (suave × em saltos). O amortizado **já considera** o custo diferente de cada revisão: soma todas em `custoCicloCompleto` e distribui a fração do km anual.

```
custoAnualRevisao  = (custoCicloCompleto / kmCiclo) × kmAnual
custoCicloCompleto = Σ precoTotal de cada revisão do ciclo (com overrides do usuário)
kmCiclo            = maior marco de km do ciclo (Honda 36.000)
```

**Regra por tipo de item (o que pode ou não ser amortizado):**

| Item | Modelo de custo | Por quê |
|---|---|---|
| **Revisão Geral** | **Sempre amortizado** (provisão) | Agenda fixa e previsível (Honda ×6.000, Yamaha ×5.000) — é provisão de TCO |
| **Itens de desgaste** (pneu, kit transmissão, sapata…) | Amortizado **sem** km da última troca; **ancorado** com (`kmUltimaTroca > 0`) | Dependem do uso; com a âncora dá pra prever eventos reais |

> A composição (quais revisões do ciclo e o custo de cada) aparece no popover **`PopoverDetalhesRevisao`** (botão "olho" da linha Revisão Geral), alimentado pelo util **`montarCicloRevisao`** (`src/utils/cicloRevisao.ts`) — só visão, não recalcula custo.

### 3.1 Implementado na TASK-BG-022 (ADR-016)

- **Ciclo por preset:** `kmCiclo = max(preset.revisaoAutorizada.intervaloKm)` substitui a constante Honda em `calculos.ts` (Honda 36.000 inalterado; **Yamaha corrigida** — antes amortizava no ciclo da Honda).
- **Detalhe ancorado:** o popover mostra "próximas revisões" **a partir da última revisão informada** (`kmUltimaRevisao`; sem ela, do km atual) até `kmAtual + kmAnual` (`projetarProximasRevisoes`, em `utils/cicloRevisao.ts`), **informativo** — o headline segue amortizado. Recorrência: 1ª (amaciamento) única; regulares a cada intervalo fixo, ciclando os custos. **Não assume revisões não confirmadas** (ex.: última 12.000 → próxima 18.000); mantido fresco pela **TASK-RF-6.27**.
- **Aviso de revisão pendente (TASK-RF-6.27):** card na Estimativa quando `kmAtual ≥ próxima revisão prevista` (`proximaRevisaoApos` = 1º marco do cronograma após `kmUltimaRevisao`, por-marca), com links para **Ajustes** (km) e **Mão de Obra** (valores). Mostra uma de cada vez (a próxima pendente). **Não afeta o cálculo** (amortizado).

---

## Como adicionar um modelo

1. Definir `fatorMaoDeObra` pela faixa de cilindrada (§1.4).
2. Para cada serviço: estimar a vida realista → sincronizar com a revisão da marca (§2); marcar avulso ou excepcional conforme a concessionária executa.
3. M.O.: preencher o real onde houver (com `concessionariaIncluiPeca` correto); o resto fica estimado (§1.3).
4. Conforme a concessionária responder, um `~` vira real aqui e no preset.

## Histórico

| Data | Mudança |
|---|---|
| 03/06/26 | Criado (TASK-REF-32.6 / ADR-013-014). Consolida estimativa de M.O. (horagem × taxa × fator, R$ 110/h, reais Honda/Yamaha) e a convenção de intervalos sincronizados. Substitui `docs/arquitetura/estimativa-mao-de-obra.md`. |
| 04/06/26 | §3 adicionada: Revisão Geral é amortizada **por design** (não é bug), com a regra de custo por tipo de item. Guardrail anti-"correção" indevida. Popover `PopoverDetalhesRevisao` + util `montarCicloRevisao`. **Implementado na TASK-BG-022** (ciclo por preset + detalhe ancorado em `kmUltimaRevisao`). |
| 12/06/26 | TASK-RF-6.37: **Caixa de direção** entra como serviço avulso incompleto (só M.O., estimada `~`; peça à parte em Insumos). Tempário 1,5 h; intervalo sincronizado Honda 42.000 / Yamaha 40.000. Adicionada aos 4 presets. |

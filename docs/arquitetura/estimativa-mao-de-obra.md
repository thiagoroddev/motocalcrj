# Estimativa de mão de obra — tempário, taxas e fatores

> Fonte única do método de estimativa de MO (ADR-013). O código que calcular estimativa deve refletir esta tabela; esta tabela não deve contradizer o código.

## Método

```
MO_estimada(serviço, modelo) = horas[serviço] × taxa[marca] × fatorMaoDeObra[modelo]
```

Regras (ADR-013):

- **Real sempre vence.** Onde a concessionária ou o usuário informou o valor, usa-se o real; a estimativa só preenche **buracos**.
- **A peça é sempre real** (preço do preset). A estimativa é **só da mão de obra**.
- **Off por padrão.** A estimativa só entra no total quando o usuário liga (global em Ajustes ou por item). Sempre exibida com `~`.
- **Excepcional = só MO** (retífica; pneu quando a concessionária não executa). A peça segue em Insumos, sem duplicar.

## Taxa horária por marca

Calibrada por dados reais. Hoje as duas marcas calibram na mesma taxa:

| Marca | Taxa (R$/h) | Calibração |
|---|---|---|
| Honda | 110 | Vela R$ 13 a ~0,12h (site Honda) |
| Yamaha | 110 | Óleo R$ 55 (0,5h), Sapata R$ 70 (0,64h), Kit transmissão R$ 220 (2,0h) — WhatsApp |

> A MO pura da Honda é barata (vela R$ 13); os avulsos Honda pareciam caros por causa da **peça**, não da mão de obra. Por isso a mesma taxa serve para ambas até aparecer evidência de divergência.

## Tempário (horas por serviço)

| Serviço | Horas | MO base (×R$110) | Âncora |
|---|---|---|---|
| Troca de óleo | 0,50 | 55 | **real Yamaha** |
| Troca de vela | 0,12 | 13 | **real Honda** |
| Filtro de ar | 0,20 | 22 | estimado |
| Filtro de combustível | 0,25 | 28 | estimado |
| Bateria | 0,20 | 22 | estimado |
| Pastilha de freio | 0,50 | 55 | estimado |
| Disco de freio | 0,70 | 77 | estimado |
| Sapata de freio | 0,65 | 70 | **real Yamaha** |
| Pneu (montagem) | 0,40 | 44 | estimado |
| Kit transmissão (relação) | 2,00 | 220 | **real Yamaha** |
| Kit embreagem | 2,50 | 275 | estimado |
| Kit cilindro (motor superior) | 5,00 | 550 | estimado |
| Retífica de cabeçote | ~6 | ~660 | estimado |
| Retífica completa | ~12 | ~1320 | estimado |

> Os 4 pontos reais (vela 13, óleo 55, sapata 70, transmissão 220) batem com horas realistas a R$ 110/h. Itens **incluídos no pacote fixo de revisão** (óleo, vela, filtros) não viram avulso — não duplicam.

## Fatores por modelo (`fatorMaoDeObra`)

Proxy de cilindrada (faixa de uso atual: 110–250cc). Cadastrar modelo novo = escrever um número.

| Faixa | Fator | Exemplos |
|---|---|---|
| 110–125cc | 1.0 | **Pop 110i**, **Factor 125i** (baselines) |
| 150–180cc | 1.15 | Fan/Titan 160, Factor 150 |
| 250cc | 1.35 | Lander 250 |

## Tabela resultante por modelo

### Pop 110i — Honda (fator 1.0)

| Serviço | Categoria | MO | Origem |
|---|---|---|---|
| Sapata dianteira | avulso `informado` | (peça+MO no site: R$ 289,45) | **real site** |
| Sapata traseira | avulso `informado` | (peça+MO no site: R$ 212,45) | **real site** |
| Bateria | avulso `informado` ⚠ temporal | (site: R$ 577,74) | **real site** |
| Pneu diant./tras. | avulso `nao_informado` | — ("A combinar") | pendente / `~44` se ligado |
| Kit transmissão | avulso `nao_informado` | — ("A combinar") | pendente / `~220` se ligado |
| Kit embreagem | avulso `~estimado` | ~275 | estimado |
| Kit cilindro | avulso `~estimado` | ~550 | estimado |
| Óleo · vela · filtro ar | pacote fixo (revisão) | — | no pacote |

### Factor 125i — Yamaha (fator 1.0)

| Serviço | Categoria | MO | Origem |
|---|---|---|---|
| Kit transmissão | avulso `informado` | R$ 220 | **real WhatsApp** |
| Sapata traseira | avulso `informado` | R$ 70 | **real WhatsApp** |
| Pastilha dianteira | avulso `~estimado` | ~55 | estimado |
| Disco dianteiro | avulso `~estimado` | ~77 | estimado |
| Bateria | avulso `~estimado` ⚠ temporal | ~22 | estimado |
| Kit embreagem | avulso `~estimado` | ~275 | estimado |
| Kit cilindro | avulso `~estimado` | ~550 | estimado |
| **Pneu diant./tras.** | **excepcional** (não executa) | ~44 só MO | estimado |
| Óleo · vela · filtros | pacote fixo (revisão) | — | no pacote |

## Cuidados

- **Bateria** (`intervalKm: 0`, temporal): não deve virar pendência de MO por km. Tratar pela regra temporal.
- **Excepcional**: soma só MO; a peça (ex.: pneu) já conta em Insumos. Não duplicar.

## Como adicionar um modelo

1. Definir `fatorMaoDeObra` no preset pela faixa de cilindrada.
2. Marcar cada serviço como avulso/excepcional conforme o que **aquela** concessionária executa.
3. Preencher `informado` onde houver valor real; o resto fica `nao_informado` (estimável) ou excepcional.
4. Conforme a concessionária responder, um `~` vira real nesta tabela e no preset.

## Histórico

| Data | Mudança |
|---|---|
| 03/06/26 | Criado (TASK-REF-32.5 / ADR-013). Calibração inicial: R$ 110/h ambas as marcas; reais vela 13 (Honda), óleo 55 / sapata 70 / kit transmissão 220 (Yamaha). |

# MotoCalc RJ — Arquitetura de Cálculos

> Status: rascunho de planejamento — nada está implementado ainda.
> Última atualização: 29/04/2026

---

## I- Princípio Unificador: Tudo Vira Anual Primeiro

O app tem custos com naturezas completamente diferentes: alguns acontecem uma vez por ano (IPVA), outros por km rodado (peças), outros por dia trabalhado (alimentação), outros mensais (internet). Somar grandezas de bases diferentes gera bug garantido.

**A solução é normalizar tudo para uma única base: o custo anual (R$/ano).**

Fluxo de cálculo:

```
Cada categoria → custo anual próprio
       ↓
Soma = Custo Total Anual
       ↓
Dilui para: mensal, semanal, diário, por hora, por km
```

Isso evita completamente a confusão de misturar "por km" com "por mês" na mesma conta.

---

## II- Classificação Completa de Todos os Custos

| Categoria | Tipo de Custo | Base de Cálculo | Editável pelo usuário? |
|---|---|---|---|
| **IPVA** | Fixo anual | Valor FIPE × alíquota estado | Não (calculado) |
| **Licenciamento** | Fixo anual | Tabela DETRAN por estado/ano | Não (tabela fixa) |
| **Revisão periódica** | Periódico por tempo/km | Ciclo 42 meses / 36.000 km | Sim |
| **Óleo do motor** | Variável por km | Preço / intervalo km | Sim |
| **Vela de ignição** | Variável por km | Preço / intervalo km | Sim |
| **Filtro de ar** | Variável por km | Preço / intervalo km | Sim |
| **Kit relação** | Variável por km | Preço / intervalo km | Sim |
| **Sapata de freio** | Variável por km | Preço / intervalo km | Sim |
| **Pneu dianteiro** | Variável por km | Preço / intervalo km | Sim |
| **Pneu traseiro** | Variável por km | Preço / intervalo km | Sim |
| **Combustível** | Variável por km | Preço gasolina / consumo | Sim |
| **Internet** | Fixo mensal | Valor mensal × 12 | Sim |
| **Seguro** | Fixo anual | Valor anual (padrão Suhai) | Sim |
| **Alimentação** | Variável por dia de trabalho | Valor/dia × dias trabalhados/ano | Sim |

> **Regra:** Se o usuário não tem seguro, o campo entra como 0. Se não tem internet de trabalho, idem. O app nunca assume custos que o usuário não confirmou.

---

## III- Inputs do Usuário (Variáveis de Entrada)

Tudo que o app precisa saber do usuário para fazer os cálculos. Estas são as perguntas do onboarding.

### III.1- Sobre a moto
```
modelo          → string (ex: "pop110i") — carrega o preset JSON
anoMoto         → number (ex: 2024) — para calcular IPVA e isenção
temBau          → boolean — altera consumo de combustível
kmAtual         → number — quilometragem atual do hodômetro ⚠️ (ver nota)
kmUltimaRevisao → number — km na última revisão geral ⚠️ (ver nota)
perfilPecas     → 'original' | 'paralela' — qual preço usar no preset
estado          → string (ex: "RJ") — para IPVA e licenciamento
```

> ⚠️ **Nota `kmAtual` e `kmUltimaRevisao`:** Esses dois campos são necessários para o app sugerir quando fazer a próxima revisão ou trocar uma peça. Sem eles, o app não consegue avisar "você está próximo dos 6.000 km de troca de óleo". Perguntar isso no onboarding é obrigatório.

### III.2- Sobre a rotina de trabalho
```
kmDia      → number (ex: 70) — km rodados em cada dia de trabalho
diasSemana → number (ex: 2)  — dias trabalhados por semana (inteiro de 1 a 7)
```

### III.3- Sobre combustível
```
precoGasolina → number (padrão: 6.61) — editável pelo usuário
```

### III.4- Sobre custos operacionais
```
temInternet     → boolean
precoInternet   → number (padrão: 30) — se temInternet = true
temSeguro       → boolean
precoSeguro     → number (padrão: 929.96/ano) — se temSeguro = true
precoAlimentacao → number (padrão: 20) — custo de alimentação por dia trabalhado
```

---

## IV- Variáveis Derivadas (Calculadas Internamente)

Antes de qualquer custo, o app calcula as grandezas de rodagem a partir dos inputs.

```
diasMes  = diasSemana × 4.33        // semanas médias no mês
diasAno  = diasSemana × 52          // dias trabalhados no ano

kmMensal = kmDia × diasMes          // ex: 70 × (2 × 4.33) = 606 km/mês
kmAnual  = kmDia × diasAno          // ex: 70 × (2 × 52)   = 7.280 km/ano

// Consumo ajustado ao baú
consumoEfetivo = temBau ? preset.consumoKmLComBau : preset.consumoKmL
                                    // ex: baú = 33 km/L; sem baú = 36 km/L
```

> **Por que 4.33?** Um mês tem em média 4.33 semanas (365 / 12 / 7 ≈ 4.33). Multiplicar diasSemana × 4.33 dá o número médio real de dias trabalhados por mês, mais preciso do que usar exatamente 4.

---

## V- Fórmulas por Categoria

### V.1- IPVA (custo fixo anual)

```
idadeMoto = anoAtual - anoMoto

SE idadeMoto >= 15:
    ipvaAnual = 0   // isento no RJ

SENÃO:
    valorFipe = buscarFIPE(codigoFipe, anoMoto)   // BrasilAPI, cacheado
    aliquota  = tabelaAliquotas[estado]             // ex: RJ = 0.02
    ipvaAnual = valorFipe × aliquota
```

Exemplo: FIPE R$11.000 × 2% = **R$220/ano**

### V.2- Licenciamento/CRLV (custo fixo anual)

```
licenciamentoAnual = tabelaLicenciamento[estado][anoAtual]
// ex: RJ 2026 = R$206
```

### V.3- Custos de Documentos (subtotal)

```
custoDocumentosAnual = ipvaAnual + licenciamentoAnual
```

---

### V.4- Revisão Periódica

Este é o custo mais complexo porque tem gatilho duplo (km OU tempo).

O ciclo completo da Honda (1k → 36k km) tem 7 revisões e custa **R$3.334,62** no total, o que equivale a 42 meses ou 36.000 km — o que vier primeiro.

**Caso A — Usuário faz revisão na concessionária:**

```
custoRevisaoCiclo    = 3334.62          // 7 revisões Honda somadas
duracaoCicloMeses    = 42

custoRevisaoMensal   = custoRevisaoCiclo / duracaoCicloMeses
                     = 3334.62 / 42 = 79.39

custoRevisaoAnual    = custoRevisaoMensal × 12 = 952.70
```

**Caso B — Usuário faz revisão em oficina independente (mais comum para motoboys):**

Neste caso, o custo de revisão não tem uma tabela fixa. O app pede ao usuário:

```
precoRevisaoGeral → number (padrão: 150) — mão de obra por revisão
frequenciaRevisaoKm → number (padrão: 6000) — a cada quantos km revisa

revisoesPorAno = kmAnual / frequenciaRevisaoKm
                 // ex: 7.280 / 6.000 = 1.21 revisões/ano

custoRevisaoAnual = revisoesPorAno × precoRevisaoGeral
                  = 1.21 × 150 = R$181.70/ano
```

> **Decisão pendente:** O onboarding deve perguntar se o usuário usa concessionária ou oficina independente, pois o resultado muda drasticamente (R$952 vs R$181).

#### V.4.1- Sugestão de próxima revisão

Usando `kmAtual` e `kmUltimaRevisao`:

```
kmDesdeUltimaRevisao = kmAtual - kmUltimaRevisao
kmParaProximaRevisao = frequenciaRevisaoKm - kmDesdeUltimaRevisao

diasParaProximaRevisao = kmParaProximaRevisao / (kmDia × diasSemana / 7)
```

Isso permite ao app mostrar: *"Próxima revisão em aprox. 1.240 km (≈ 18 dias)"*

---

### V.5- Custo de Peças por Desgaste (CPK Variável)

Para cada peça no preset, o cálculo é:

```
cpkPeca = precoRJ[perfilPecas] / intervaloKmEntrega
```

Exemplo (óleo, motoboy com peças paralelas):
```
cpkOleo = 40 / 1250 = R$0.0320/km
```

#### V.5.1- Tabela de CPK por peça (Pop 110i — perfil original)

| Peça | Preço | Intervalo km | CPK (R$/km) |
|---|---|---|---|
| Óleo motor | R$40 | 1.250 km | 0,0320 |
| Vela de ignição | R$82 | 12.000 km | 0,0068 |
| Filtro de ar | R$47 | 12.000 km | 0,0039 |
| Kit relação | R$230 | 18.000 km | 0,0128 |
| Sapata freio (par) | R$91 | 12.000 km | 0,0076 |
| Pneu dianteiro | R$209 | 25.000 km | 0,0084 |
| Pneu traseiro | R$245 | 16.000 km | 0,0153 |
| **TOTAL CPK peças** | | | **≈ R$0,0868/km** |

#### V.5.2- Tabela de CPK por peça (Pop 110i — perfil paralela)

| Peça | Preço | Intervalo km | CPK (R$/km) |
|---|---|---|---|
| Óleo motor | R$40 | 1.250 km | 0,0320 |
| Vela de ignição | R$29 | 12.000 km | 0,0024 |
| Filtro de ar | R$19 | 12.000 km | 0,0016 |
| Kit relação | R$82 | 18.000 km | 0,0046 |
| Sapata freio (par) | R$47 | 12.000 km | 0,0039 |
| Pneu dianteiro | R$130 | 25.000 km | 0,0052 |
| Pneu traseiro | R$137 | 16.000 km | 0,0086 |
| **TOTAL CPK peças** | | | **≈ R$0,0583/km** |

> **Nota óleo:** O óleo é igual em ambos os perfis (R$40 = Pro Honda recomendado). Isso porque o óleo é o único item em que "original" e "paralela" convergem para o mesmo produto recomendado. O app pode oferecer R$23 como alternativa paralela de óleo, mas o padrão é R$40.

#### V.5.3- Custo anual de peças

```
cpkPecasTotal     = soma de todos os cpkPeca
custoManutAnual   = cpkPecasTotal × kmAnual
```

Exemplo (perfil original, 7.280 km/ano):
```
custoManutAnual = 0.0868 × 7280 = R$632/ano
```

---

### V.6- Custo de Combustível

```
cpkCombustivel   = precoGasolina / consumoEfetivo
                 // ex: 6.61 / 33 = R$0.2003/km (com baú)

custoCombAnual   = cpkCombustivel × kmAnual
                 // ex: 0.2003 × 7280 = R$1.458/ano
```

---

### V.7- Internet (custo fixo mensal → anual)

```
SE temInternet:
    custoInternetAnual = precoInternet × 12
    // ex: 30 × 12 = R$360/ano
SENÃO:
    custoInternetAnual = 0
```

### V.8- Seguro (custo fixo anual)

```
SE temSeguro:
    custoSeguroAnual = precoSeguro
    // padrão: R$929.96 (Suhai)
SENÃO:
    custoSeguroAnual = 0
```

### V.9- Alimentação (custo por dia de trabalho → anual)

```
custoAlimentacaoAnual = precoAlimentacao × diasAno
                      // ex: 20 × (2 × 52) = 20 × 104 = R$2.080/ano
```

> **Atenção:** A alimentação é o maior custo operacional na maioria dos casos. Convém deixar claro no app que ela entra no cálculo.

---

## VI- Agregação Final

Com todos os custos anuais calculados, a soma é:

```
custoTotalAnual =
    custoDocumentosAnual      // IPVA + licenciamento
  + custoRevisaoAnual         // revisão periódica
  + custoManutAnual           // desgaste de peças
  + custoCombAnual            // combustível
  + custoInternetAnual        // internet
  + custoSeguroAnual          // seguro
  + custoAlimentacaoAnual     // alimentação
```

---

## VII- Granularidades (Diluição do Custo Anual)

A partir do `custoTotalAnual`, o app calcula todas as visões de tempo:

```
custoMensal  = custoTotalAnual / 12
custoSemanal = custoTotalAnual / 52
custoDiario  = custoTotalAnual / diasAno        // só dias trabalhados
custoHorario = custoDiario / horasDia           // se o usuário informar horas/dia
custoPorKm   = custoTotalAnual / kmAnual
```

> **Por que `custoSemanal = anual / 52` e não `mensal / 4`?** Porque 52 semanas é o divisor exato para o ano. Se usarmos mensal / 4, perdemos precisão (4 × 12 = 48 semanas, não 52). A divisão pelo total anual é sempre mais precisa.

> **Custo diário:** Divide pelo número de dias **trabalhados** no ano (`diasAno`), não por 365. Um motoboy que trabalha 2 dias/semana tem 104 dias/ano de trabalho. Dividir por 365 daria um custo diário artificialmente baixo e enganoso.

---

## VIII- Breakdown por Categoria (RF-21)

Além do total, o app deve mostrar quanto cada categoria representa no custo total. Isso é o "breakdown" que ajuda o motoboy a entender onde o dinheiro vai.

```
percentualDocumentos  = custoDocumentosAnual  / custoTotalAnual × 100
percentualRevisao     = custoRevisaoAnual     / custoTotalAnual × 100
percentualPecas       = custoManutAnual       / custoTotalAnual × 100
percentualCombustivel = custoCombAnual        / custoTotalAnual × 100
percentualInternet    = custoInternetAnual    / custoTotalAnual × 100
percentualSeguro      = custoSeguroAnual      / custoTotalAnual × 100
percentualAlimentacao = custoAlimentacaoAnual / custoTotalAnual × 100
```

---

## IX- Exemplo Completo com Dados Reais

**Perfil:** motoboy RJ, Pop 110i 2024, 70 km/dia, 2 dias/semana, com baú, peças originais, com seguro, com internet, alimentação R$20/dia.

```
// Rodagem
diasAno    = 2 × 52  = 104 dias
kmAnual    = 70 × 104 = 7.280 km
kmMensal   = 7.280 / 12 = 606,7 km

// Documentos
valorFipe  = R$11.000 (estimado)
ipva       = 11.000 × 0.02 = R$220
licenc     = R$206
docs       = R$426/ano

// Revisão (oficina independente)
revisoesPorAno = 7.280 / 6.000 = 1,21
revisao    = 1,21 × 150 = R$181,70/ano

// Peças (perfil original)
cpkPecas   = R$0,0868/km
manut      = 0,0868 × 7.280 = R$632/ano

// Combustível (com baú)
cpkComb    = 6,61 / 33 = R$0,2003/km
comb       = 0,2003 × 7.280 = R$1.458/ano

// Internet
internet   = 30 × 12 = R$360/ano

// Seguro
seguro     = R$929,96/ano

// Alimentação
alimentacao = 20 × 104 = R$2.080/ano

// ─────────────────────────────────────
// TOTAL ANUAL
total = 426 + 181,70 + 632 + 1.458 + 360 + 929,96 + 2.080
total = R$6.067,66/ano

// Granularidades
mensal   = 6.067,66 / 12     = R$505,64/mês
semanal  = 6.067,66 / 52     = R$116,69/semana
diario   = 6.067,66 / 104    = R$58,34/dia trabalhado
por km   = 6.067,66 / 7.280  = R$0,833/km
```

---

## X- Custos Sem Alimentação ("custo da moto")

O app deve ser capaz de exibir dois totais separados:

1. **Custo total de operação** (com alimentação) → quanto custa trabalhar como motoboy
2. **Custo exclusivo da moto** (sem alimentação) → quanto a moto consome por si só

```
custoMotoAnual = custoTotalAnual - custoAlimentacaoAnual
               = 6.067,66 - 2.080 = R$3.987,66/ano

custoMotoPorKm = custoMotoAnual / kmAnual
               = 3.987,66 / 7.280 = R$0,548/km
```

Isso permite o motoboy entender: *"Minha moto me custa R$0,55 por km. Se a plataforma paga R$1,80/km, sobram R$1,25/km para mim — menos a alimentação."*

---

## XI- Perguntas de Onboarding Identificadas (Revisão)

Lista consolidada de tudo que o app precisa perguntar, com o campo correspondente:

| Pergunta                                      | Campo               | Padrão     |
| --------------------------------------------- | ------------------- | ---------- |
| Qual o modelo da moto?                        | `modelo`            | —          |
| Qual o ano da moto?                           | `anoMoto`           | —          |
| Usa baú/bag?                                  | `temBau`            | false      |
| **Qual a quilometragem atual?**               | `kmAtual`           | —          |
| **Qual a km da última revisão geral?**        | `kmUltimaRevisao`   | —          |
| Usa peças originais ou paralelas?             | `perfilPecas`       | 'original' |
| Faz revisão na Honda ou oficina independente? | `modoRevisao`       | 'autonomo' |
| Se oficina: preço médio da revisão?           | `precoRevisaoGeral` | 400        |
| Km rodados por dia de trabalho?               | `kmDia`             | —          |
| Dias de trabalho por semana?                  | `diasSemana`        | —          |
| Preço da gasolina no seu posto?               | `precoGasolina`     | 6.61       |
| Tem internet de trabalho?                     | `temInternet`       | false      |
| Se sim: quanto paga?                          | `precoInternet`     | 30         |
| Tem seguro da moto?                           | `temSeguro`         | false      |
| Se sim: valor anual?                          | `precoSeguro`       | 929.96     |
| Gasto médio com alimentação por dia?          | `precoAlimentacao`  | 20         |
|                                               |                     |            |

---

## XII- Ambiguidades e Riscos Identificados (Bugs Potenciais)

| Risco | Descrição | Solução |
|---|---|---|
| Misturar bases | Somar R$/km com R$/mês sem converter | Converter tudo para anual antes de somar |
| Dias vs semanas | Usar 4 semanas/mês em vez de 4,33 | Sempre usar `diasAno = diasSemana × 52` |
| Custo diário por 365 | Dividir custo anual por 365 dá valor irreal | Dividir por `diasAno` (dias trabalhados) |
| Alimentação fora do escopo | Não deixar claro que alimentação entra no total | Mostrar dois totais: com e sem alimentação |
| Intervalos: manual vs entrega | Usar intervalo do manual para motoboys | Usar `intervaloKmEntrega` para motoboys |
| FIPE offline | App offline sem FIPE cacheado | Cachear FIPE no onboarding, avisar validade |
| Isenção IPVA ignorada | Calcular IPVA para moto com 15+ anos | Checar `anoAtual - anoMoto >= 15` antes |
| CPK óleo igual em ambos perfis | Óleo "original" e "paralela" têm mesmo preço | Definir explicitamente ou oferecer como edição |

---

*Documento de planejamento — serve como especificação das funções a implementar em `calculos.js`.*

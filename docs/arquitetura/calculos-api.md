> ⚠️ **DESATUALIZADO — NÃO USAR COMO REFERÊNCIA.**
> Este arquivo é a **especificação pré-implementação de 05/05/2026**. Nunca foi sincronizado após a implementação. Diverge profundamente do código atual em assinaturas (`resolverKmDia`, `resolverIntervaloPeca`, `resolverPrecoPeca`, `calcularCpkPorPeca`, `calcularCustosPorCategoria`, `calcularCustoSeguroAnual`), tipos (`RegistroManutencao`, `ModoExibicao`, `RegistroRodagem`, `FiltrosCategorias`, `CustosPorCategoria` antigo, `ResultadoCalculo`), funções inteiras removidas (toda a seção IV.8 sobre Modo Personalizado, `calcularKmMensalPorSemanas`, `agruparRegistrosPorSemana`, `temDadoSuficiente`, `calcularKmParaProximaRevisao`, `calcularDiasParaProximaRevisao`) e estrutura de UI (`<DetalhamentoCustos />` real é completamente diferente).
> Verdade primária atual: ler diretamente `src/utils/calculos.ts`, `src/types/calculos.ts` e `src/types/perfil.ts`. Reescrita completa programada na **TASK-DOC-009** (Strict).
> Mantido apenas para referência histórica.

---

# MotoCalc RJ — Arquitetura de Funções de Cálculo

> Status: especificação definitiva — pré-implementação
> Versão: 1.0 — 05/05/2026
> Baseado em: `Requisitos_MotoCalc_RJ_v5.md`, `Formulas_Calculos.md`, `Arquitetura-de-Custos.md`

---

## I- Hierarquia de Dados: De Onde Vêm os Valores

O app opera em três camadas de dados empilhadas. A camada mais baixa é sempre sobrescrita pela camada mais alta quando os dados estiverem disponíveis. Nunca há mistura de bases dentro de uma mesma grandeza — uma grandeza tem exatamente uma fonte ativa em cada momento.

```
┌─────────────────────────────────────────────────────────────┐
│  Nível 3 — REGISTROS (modo personalizado)                   │
│  Fonte: localStorage → registros.rodagem / registros.pecas  │
│  Ativa quando: usuário tem ≥ 1 registro do tipo relevante   │
│  Sobrescreve: somente a grandeza para a qual há registros   │
├─────────────────────────────────────────────────────────────┤
│  Nível 2 — ONBOARDING (PerfilUsuario)                       │
│  Fonte: localStorage → perfil.*                             │
│  Ativa quando: onboarding concluído                         │
│  Sobrescreve: valores padrão do preset                      │
├─────────────────────────────────────────────────────────────┤
│  Nível 1 — PRESET JSON (pop110i.json, etc.)                 │
│  Fonte: src/presets/*.json — imutável em runtime            │
│  Ativa sempre: é o fallback final                           │
│  Nunca é modificado — serve como referência                 │
└─────────────────────────────────────────────────────────────┘
```

### I.1- Nível 1 — Preset JSON

O arquivo `src/presets/pop110i.json` contém tudo que é específico do modelo da moto: consumo, intervalos de troca de cada peça, preços pesquisados no ML/RJ. **Nunca é alterado pelo usuário nem pelo app em runtime.**

Campos relevantes para cálculos:

```typescript
// Trecho representativo de pop110i.json
{
  "consumoKmL": 36,              // sem baú
  "consumoKmLComBau": 33,        // com baú
  "pecas": {
    "oleo_motor": {
      "intervaloKm": 6000,           // manual Honda
      "intervaloKmEntrega": 1250,    // uso real motoboy urbano
      "precoRJ": { "original": 40, "paralela": 40 }
    },
    "pneu_traseiro": {
      "intervaloKm": 20000,
      "intervaloKmEntrega": 16000,
      "precoRJ": { "original": 245, "paralela": 137 }
    }
    // ... demais peças
  }
}
```

> **Regra:** Para motoboys (`perfil.trabalho.tipo === 'entrega'`), o app usa `intervaloKmEntrega`. Para uso casual, usa `intervaloKm`.

### I.2- Nível 2 — Onboarding (PerfilUsuario)

Valores confirmados pelo usuário no onboarding. Sobrescrevem os defaults do preset para grandezas como `precoGasolina`, `temBau`, `diasSemana`, `kmDia`, preços de seguro, internet, etc.

Campos que alimentam diretamente os cálculos:

```typescript
perfil.moto.anoMoto              // → cálculo IPVA (isenção 15 anos)
perfil.moto.temBau               // → consumo efetivo de combustível
perfil.moto.perfilPecas          // → 'original' | 'paralela' — preço no CPK
perfil.moto.kmAtual              // → sugestão de próxima troca/revisão
perfil.trabalho.kmDia            // → variável central de rodagem
perfil.trabalho.diasSemana       // → variável central de rodagem
perfil.trabalho.tipo             // → 'entrega' | 'casual' — escolha do intervaloKm
perfil.financeiro.precoGasolina  // → CPK combustível
perfil.financeiro.temInternet    // → custo anual
perfil.financeiro.precoInternet
perfil.financeiro.temSeguro      // → custo anual
perfil.financeiro.precoSeguro
perfil.financeiro.precoAlimentacao
perfil.manutencao.modoRevisao    // → 'autorizadas' | 'independentes'
perfil.manutencao.precoRevisaoGeral
perfil.manutencao.frequenciaRevisaoKm
```

### I.3- Nível 3 — Registros (Modo Personalizado)

Dados medidos pelo próprio usuário, inseridos nas telas de Registros e Mão de Obra. Sobrescrevem parcialmente o Nível 2 — apenas para a grandeza específica que foi registrada. O que não foi registrado continua usando Nível 2 ou Nível 1.

Tipos de registro:

```typescript
// Registro de um dia de trabalho (tela REGISTROS)
interface RegistroRodagem {
  id: string          // nanoid
  data: string        // ISO 8601 — 'YYYY-MM-DD'
  kmRodados: number   // km naquele dia
  horasTrabalhadas?: number
}

// Registro de troca de peça (tela MÃO DE OBRA / VIDA ÚTIL)
interface RegistroManutencao {
  id: string
  data: string
  pecaId: string       // chave da peça no preset, ex: 'oleo_motor'
  kmNaTroca: number    // km do hodômetro no momento da troca
  kmDesdeAnterior: number  // calculado na inserção: kmNaTroca - kmAnteriorPara(pecaId)
  preco: number        // quanto custou (peça + mão de obra)
}
```

---

## II- Modo Predefinido vs Modo Personalizado

`perfil.configuracaoDisplay.modoExibicao: 'predefinidos' | 'personalizado'`

### II.1- Regra de Mesclagem ("qual dado vence")

A função `resolverFonte<T>` encapsula essa decisão para qualquer grandeza:

```
resolverFonte(grandeza):
  SE modoExibicao === 'personalizado' E registros[grandeza].length >= minimo:
    → retorna média dos registros
  SENÃO:
    → retorna valor do perfil (onboarding) ou preset (fallback)
```

O `minimo` varia por grandeza:
| Grandeza | Mínimo de registros para usar modo personalizado |
|---|---|
| `kmDia` | 1 registro de rodagem |
| `intervaloKm` de peça | 1 registro de manutenção para essa peça |
| `precoPeca` | 1 registro de manutenção para essa peça |

### II.2- Lógica de Rodagem com Registros Parciais

**Regra definida:** o app sempre trabalha com a granularidade mais alta disponível e projeta para as demais.

```
SE registros.rodagem.length >= 14 (≥ 2 semanas de dados):
  → base = média das semanas completas
  → kmSemanaReal = somaKmPorSemana(registros) / numSemanasCompletas
  → kmMensal = kmSemanaReal × 4.33
  → kmAnual  = kmSemanaReal × 52

SENÃO SE registros.rodagem.length >= 1 (≥ 1 dia de dado):
  → base = média diária
  → kmDiaReal = somaKm(registros) / registros.length
  → kmMensal = kmDiaReal × diasSemana × 4.33   // diasSemana vem do perfil
  → kmAnual  = kmDiaReal × diasSemana × 52

SENÃO (nenhum registro):
  → usa kmDia e diasSemana do onboarding (Nível 2)
```

> **Nota crítica:** O app não conhece os dias da semana trabalhados a partir dos registros — só o usuário sabe isso. Por isso, quando calcula a partir da média diária, ainda usa `diasSemana` do perfil. Apenas quando tem semanas completas pode inferir o padrão de rodagem sem depender do perfil.

**Exemplo — 5 registros de dias isolados:**
```
registros = [72km, 68km, 75km, 70km, 65km]
kmDiaReal = (72+68+75+70+65) / 5 = 70 km/dia
kmMensal  = 70 × 2 × 4.33 = 606 km    (diasSemana=2 do perfil)
kmAnual   = 70 × 2 × 52   = 7.280 km
```

**Exemplo — 2 semanas completas:**
```
semana1 = [72, 68] (2 dias trabalhados = 140km)
semana2 = [75, 71] (2 dias trabalhados = 146km)
kmSemanaReal = (140 + 146) / 2 = 143 km/semana
kmMensal = 143 × 4.33 = 619 km
kmAnual  = 143 × 52   = 7.436 km
```

### II.3- Lógica de Manutenção com Registros Parciais

**Regra definida:** o modo personalizado é por peça. Uma peça com registro usa seus dados reais; uma peça sem registro usa o preset. Nunca há mistura dentro da mesma peça.

```
Para cada pecaId em preset.pecas:

  registrosPeca = registros.manutencao.filter(r => r.pecaId === pecaId)

  SE registrosPeca.length >= 1:
    intervaloReal = media(registrosPeca.map(r => r.kmDesdeAnterior))
    precoReal     = media(registrosPeca.map(r => r.preco))
    cpkPeca       = precoReal / intervaloReal   ← usa dados REAIS

  SENÃO:
    intervalo = preset.pecas[pecaId].intervaloKmEntrega  (ou intervaloKm)
    preco     = preset.pecas[pecaId].precoRJ[perfilPecas]
    cpkPeca   = preco / intervalo                         ← usa PRESET
```

**Exemplo — 1 registro de troca de óleo:**
```
registro = { pecaId: 'oleo_motor', kmDesdeAnterior: 1100, preco: 42 }
cpkOleo  = 42 / 1100 = R$0,0382/km   ← usa o dado real
cpkPneuT = 245 / 16000 = R$0,0153/km ← preset (nenhum registro de pneu)
```

---

## III- Pipeline Completo de Cálculo

Visão de cima para baixo de todo o fluxo, desde os dados brutos até os valores exibidos na tela.

```
┌─────────────────────────────────────────────────────────────────┐
│  ENTRADAS                                                        │
│  preset JSON + PerfilUsuario + Registros[]                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 1 — RODAGEM (grandezas de km)                            │
│  resolverKmDia()  →  calcularKmMensal()  →  calcularKmAnual()   │
│  Saída: { kmDia, kmMensal, kmAnual, diasAno }                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 2 — CPK POR PEÇA                                         │
│  Para cada peça: resolverIntervaloPeca() + resolverPrecoPeca()  │
│  → calcularCpkPeca(preco, intervalo)                            │
│  Saída: Map<pecaId, cpk>                                        │
│                                                                  │
│  + calcularCpkCombustivel(precoGasolina, consumoEfetivo)        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 3 — CUSTO ANUAL POR CATEGORIA                            │
│                                                                  │
│  calcularCustoDocumentosAnual()   → IPVA + licenciamento        │
│  calcularCustoRevisaoAnual()      → por km ou por tempo         │
│  calcularCustoManutencaoAnual()   → cpkPecasTotal × kmAnual     │
│  calcularCustoCombustivelAnual()  → cpkComb × kmAnual           │
│  calcularCustoInternetAnual()     → precoInternet × 12          │
│  calcularCustoSeguroAnual()       → precoSeguro (se ativo)      │
│  calcularCustoAlimentacaoAnual()  → precoAlim × diasAno         │
│                                                                  │
│  Saída: CustosPorCategoria (objeto com cada categoria e valor)  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 4 — TOTAL E GRANULARIDADES                               │
│                                                                  │
│  calcularTotalFiltrado(custos, filtros)  → custoTotalAnual      │
│  calcularGranularidades(total, diasAno, kmAnual)                 │
│                                                                  │
│  Saída: { anual, mensal, semanal, diario, porKm }               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  SAÍDA PARA A UI                                                 │
│  <PainelEstimativa />  →  4 cards + custo/km                    │
│  <DetalhamentoCustos />  →  breakdown por categoria + toggle    │
│  <VidaUtil />  →  CPK por peça + próxima troca estimada         │
└─────────────────────────────────────────────────────────────────┘
```

---

## IV- Catálogo Completo de Funções

Todas as funções são **puras** — recebem parâmetros, retornam valor, sem side-effects. Organizadas em módulos dentro de `src/utils/calculos.ts` (ou separadas em arquivos por grupo, conforme decisão de implementação).

---

### IV.1- Grupo: Rodagem

Determina as grandezas de quilometragem usadas em todos os outros cálculos.

---

#### IV.1.1- `resolverKmDia`

```typescript
function resolverKmDia(
  perfil: PerfilUsuario,
  registros: RegistroRodagem[],
  modoExibicao: ModoExibicao
): number
```

**Lógica:**
```
SE modoExibicao === 'personalizado' E registros.length >= 1:
  → retorna media(registros.map(r => r.kmRodados))
SENÃO:
  → retorna perfil.trabalho.kmDia
```

**Usado em:** `calcularKmMensal`, indiretamente em todos os cálculos de custo variável.

---

#### IV.1.2- `calcularKmMensal`

```typescript
function calcularKmMensal(
  kmDia: number,
  diasSemana: number
): number
```

```
return kmDia × diasSemana × 4.33
```

**Por que 4.33:** Um mês tem em média 4,33 semanas (365 / 12 / 7). Mais preciso que multiplicar por 4.

---

#### IV.1.3- `calcularKmAnual`

```typescript
function calcularKmAnual(
  kmDia: number,
  diasSemana: number
): number
```

```
return kmDia × diasSemana × 52
```

> **Nunca derivar kmAnual de kmMensal × 12.** A multiplicação direta por 52 semanas é o caminho canônico — evita acúmulo de erro de arredondamento do 4.33.

---

#### IV.1.4- `calcularDiasAno`

```typescript
function calcularDiasAno(diasSemana: number): number
```

```
return diasSemana × 52
```

**Usado em:** `calcularCustoAlimentacaoAnual`, `calcularCustoDiario`, `calcularGranularidades`.

---

#### IV.1.5- `calcularKmMensalPorSemanas`

```typescript
function calcularKmMensalPorSemanas(
  registros: RegistroRodagem[]
): number | null
```

Agrupa os registros por semana ISO e calcula a média semanal. Retorna `null` se houver menos de 2 semanas completas (fallback para cálculo por dia).

```
semanasCompletas = agruparPorSemanaISO(registros).filter(s => s.diasRegistrados >= 2)
SE semanasCompletas.length < 2:
  return null
kmSemanaMedia = media(semanasCompletas.map(s => s.totalKm))
return kmSemanaMedia × 4.33
```

---

### IV.2- Grupo: Consumo de Combustível

---

#### IV.2.1- `resolverConsumoEfetivo`

```typescript
function resolverConsumoEfetivo(
  preset: PresetMoto,
  temBau: boolean
): number
```

```
return temBau ? preset.consumoKmLComBau : preset.consumoKmL
```

---

#### IV.2.2- `calcularCpkCombustivel`

```typescript
function calcularCpkCombustivel(
  precoGasolina: number,
  consumoKmL: number
): number
```

```
return precoGasolina / consumoKmL
// ex: 6.61 / 33 = R$0,2003/km
```

---

### IV.3- Grupo: CPK por Peça

---

#### IV.3.1- `calcularCpkPeca`

```typescript
function calcularCpkPeca(
  preco: number,
  intervaloKm: number
): number
```

```
return preco / intervaloKm
// ex: 40 / 1250 = R$0,0320/km
```

Esta é a função atômica. Todas as outras funções deste grupo preparam os parâmetros para ela.

---

#### IV.3.2- `resolverIntervaloPeca`

```typescript
function resolverIntervaloPeca(
  pecaId: string,
  preset: PresetMoto,
  perfil: PerfilUsuario,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao
): number
```

```
registrosPeca = registros.filter(r => r.pecaId === pecaId)

SE modoExibicao === 'personalizado' E registrosPeca.length >= 1:
  → return media(registrosPeca.map(r => r.kmDesdeAnterior))

SENÃO:
  intervalo = perfil.trabalho.tipo === 'entrega'
    ? preset.pecas[pecaId].intervaloKmEntrega
    : preset.pecas[pecaId].intervaloKm
  → return intervalo
```

---

#### IV.3.3- `resolverPrecoPeca`

```typescript
function resolverPrecoPeca(
  pecaId: string,
  preset: PresetMoto,
  perfil: PerfilUsuario,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao
): number
```

```
registrosPeca = registros.filter(r => r.pecaId === pecaId)

SE modoExibicao === 'personalizado' E registrosPeca.length >= 1:
  → return media(registrosPeca.map(r => r.preco))

SENÃO:
  → return preset.pecas[pecaId].precoRJ[perfil.moto.perfilPecas]
```

---

#### IV.3.4- `calcularCpkPorPeca`

```typescript
// Retorna um Map com o CPK de cada peça do preset
function calcularCpkPorPeca(
  preset: PresetMoto,
  perfil: PerfilUsuario,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao
): Map<string, number>
```

Itera sobre todas as peças do preset. Para cada uma, chama `resolverIntervaloPeca` + `resolverPrecoPeca` + `calcularCpkPeca`. Retorna o mapa `{ pecaId → cpk }`.

---

#### IV.3.5- `calcularCpkPecasTotal`

```typescript
function calcularCpkPecasTotal(cpkPorPeca: Map<string, number>): number
```

```
return Array.from(cpkPorPeca.values()).reduce((acc, cpk) => acc + cpk, 0)
```

---

### IV.4- Grupo: Custos Fixos

---

#### IV.4.1- `calcularIPVA`

```typescript
function calcularIPVA(
  valorFipe: number,
  aliquota: number,      // 0.02 para RJ
  anoMoto: number,
  anoAtual: number
): number
```

```
idadeMoto = anoAtual - anoMoto
SE idadeMoto >= 15:
  return 0   // isento no RJ
return valorFipe × aliquota
```

---

#### IV.4.2- `calcularLicenciamento`

```typescript
function calcularLicenciamento(
  estado: string,
  anoAtual: number,
  tabelaLicenciamento: Record<string, Record<number, number>>
): number
```

```
return tabelaLicenciamento[estado]?.[anoAtual] ?? 0
// ex: 'RJ'[2026] = 206
```

**Nota:** `tabelaLicenciamento` vem de `src/data/dados_rj.json`.

---

#### IV.4.3- `calcularCustoDocumentosAnual`

```typescript
function calcularCustoDocumentosAnual(
  ipva: number,
  licenciamento: number
): number
```

```
return ipva + licenciamento
```

---

### IV.5- Grupo: Revisão Periódica

Este é o cálculo de maior variação: dois modos radicalmente diferentes.

---

#### IV.5.1- `calcularCustoRevisaoAnual`

```typescript
function calcularCustoRevisaoAnual(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  opcoes: {
    // Modo 'autorizadas' (concessionária Honda)
    custoCicloCompleto?: number      // default: 3334.62
    duracaoCicloMeses?: number       // default: 42
    // Modo 'independentes'
    precoRevisaoGeral?: number       // default: 150
    frequenciaRevisaoKm?: number     // default: 6000
  }
): number
```

```
SE modoRevisao === 'autorizadas':
  custoMensal = custoCicloCompleto / duracaoCicloMeses
  return custoMensal × 12
  // = 3334.62 / 42 × 12 = R$952,75/ano

SE modoRevisao === 'independentes':
  revisoesPorAno = kmAnual / frequenciaRevisaoKm
  return revisoesPorAno × precoRevisaoGeral
  // ex: 7280 / 6000 × 150 = R$182/ano
```

> **Diferença crítica:** Concessionária = R$953/ano. Oficina independente = R$182/ano. São caminhos completamente diferentes. O onboarding deve perguntar isso explicitamente.

---

#### IV.5.2- `calcularKmParaProximaRevisao`

```typescript
function calcularKmParaProximaRevisao(
  kmAtual: number,
  kmUltimaRevisao: number,
  frequenciaRevisaoKm: number
): number
```

```
kmDesde = kmAtual - kmUltimaRevisao
return frequenciaRevisaoKm - kmDesde
```

**Usado em:** banner de aviso no `<PainelEstimativa />` e `<VidaUtil />`.

---

#### IV.5.3- `calcularDiasParaProximaRevisao`

```typescript
function calcularDiasParaProximaRevisao(
  kmParaProxima: number,
  kmDia: number,
  diasSemana: number
): number
```

```
kmDiaMedio = kmDia × diasSemana / 7   // km médios por dia (incluindo dias de folga)
return Math.ceil(kmParaProxima / kmDiaMedio)
```

---

### IV.6- Grupo: Custos Operacionais

---

#### IV.6.1- `calcularCustoCombustivelAnual`

```typescript
function calcularCustoCombustivelAnual(
  cpkCombustivel: number,
  kmAnual: number
): number
```

```
return cpkCombustivel × kmAnual
```

---

#### IV.6.2- `calcularCustoManutencaoAnual`

```typescript
function calcularCustoManutencaoAnual(
  cpkPecasTotal: number,
  kmAnual: number
): number
```

```
return cpkPecasTotal × kmAnual
```

---

#### IV.6.3- `calcularCustoInternetAnual`

```typescript
function calcularCustoInternetAnual(
  temInternet: boolean,
  precoInternet: number
): number
```

```
return temInternet ? precoInternet × 12 : 0
```

---

#### IV.6.4- `calcularCustoSeguroAnual`

```typescript
function calcularCustoSeguroAnual(
  temSeguro: boolean,
  precoSeguro: number
): number
```

```
return temSeguro ? precoSeguro : 0
```

---

#### IV.6.5- `calcularCustoAlimentacaoAnual`

```typescript
function calcularCustoAlimentacaoAnual(
  precoAlimentacao: number,
  diasAno: number
): number
```

```
return precoAlimentacao × diasAno
```

---

### IV.7- Grupo: Agregação e Granularidades

---

#### IV.7.1- `calcularCustosPorCategoria`

```typescript
// Retorna o custo anual de CADA categoria separado
function calcularCustosPorCategoria(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
  valorFipe: number,
  registros: Registros,
  modoExibicao: ModoExibicao
): CustosPorCategoria
```

Esta é a função orquestradora. Chama todas as funções dos grupos IV.1 a IV.6 e retorna um objeto estruturado:

```typescript
interface CustosPorCategoria {
  documentos: {
    total: number
    detalhes: { ipva: number; licenciamento: number }
  }
  revisao: {
    total: number
  }
  manutencao: {
    total: number
    detalhes: Map<string, { cpk: number; custoAnual: number }>
  }
  combustivel: {
    total: number
    detalhes: { cpk: number; kmAnual: number }
  }
  internet: {
    total: number
    ativo: boolean
  }
  seguro: {
    total: number
    ativo: boolean
  }
  alimentacao: {
    total: number
    ativo: boolean
  }
}
```

---

#### IV.7.2- `calcularTotalFiltrado`

```typescript
function calcularTotalFiltrado(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias
): number
```

Esta é a função usada diretamente pelo `<DetalhamentoCustos />` para recalcular o total quando o usuário ativa/desativa categorias.

```typescript
interface FiltrosCategorias {
  documentos: boolean
  revisao: boolean
  manutencao: boolean
  manutencaoPorPeca: Record<string, boolean>  // toggle por peça individualmente
  combustivel: boolean
  internet: boolean
  seguro: boolean
  alimentacao: boolean
}
```

```typescript
function calcularTotalFiltrado(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias
): number {
  let total = 0
  if (filtros.documentos)   total += custos.documentos.total
  if (filtros.revisao)      total += custos.revisao.total
  if (filtros.combustivel)  total += custos.combustivel.total
  if (filtros.internet)     total += custos.internet.total
  if (filtros.seguro)       total += custos.seguro.total
  if (filtros.alimentacao)  total += custos.alimentacao.total

  // Manutenção: soma apenas as peças ativas
  if (filtros.manutencao) {
    custos.manutencao.detalhes.forEach((detalhe, pecaId) => {
      if (filtros.manutencaoPorPeca[pecaId] !== false) {
        total += detalhe.custoAnual
      }
    })
  }
  return total
}
```

---

#### IV.7.3- `calcularGranularidades`

```typescript
function calcularGranularidades(
  custoTotalAnual: number,
  diasAno: number,
  kmAnual: number
): GranularidadesCusto
```

```typescript
interface GranularidadesCusto {
  anual: number
  mensal: number   // anual / 12
  semanal: number  // anual / 52  ← não usar mensal/4 (perde precisão)
  diario: number   // anual / diasAno  ← dias TRABALHADOS, não 365
  porKm: number    // anual / kmAnual
}
```

```typescript
return {
  anual:   custoTotalAnual,
  mensal:  custoTotalAnual / 12,
  semanal: custoTotalAnual / 52,
  diario:  custoTotalAnual / diasAno,
  porKm:   custoTotalAnual / kmAnual,
}
```

> **Armadilha:** `semanal = anual / 52`, nunca `mensal / 4`. E `diario` divide por dias trabalhados, nunca por 365.

---

#### IV.7.4- `calcularBreakdownPercentual`

```typescript
function calcularBreakdownPercentual(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias
): Record<keyof FiltrosCategorias, number>
```

Retorna o percentual de cada categoria no total filtrado. Usado no gráfico donut do `<DetalhamentoCustos />`.

```
total = calcularTotalFiltrado(custos, filtros)
percentual[categoria] = (custos[categoria].total / total) × 100
```

---

#### IV.7.5- `calcularCustoMotoAnual`

```typescript
function calcularCustoMotoAnual(
  custoTotalAnual: number,
  custoAlimentacaoAnual: number
): number
```

```
return custoTotalAnual - custoAlimentacaoAnual
```

Exibe o custo exclusivo do veículo, sem alimentação — para o motoboy entender sua margem real por km.

---

### IV.8- Grupo: Modo Personalizado (Registros)

Funções auxiliares usadas apenas quando `modoExibicao === 'personalizado'`.

---

#### IV.8.1- `calcularMediaRegistros`

```typescript
function calcularMediaRegistros<T>(
  registros: T[],
  campo: keyof T
): number
```

Utilitário genérico: calcula a média de um campo numérico em um array de registros.

---

#### IV.8.2- `agruparRegistrosPorSemana`

```typescript
function agruparRegistrosPorSemana(
  registros: RegistroRodagem[]
): Array<{ semanaISO: string; diasRegistrados: number; totalKm: number }>
```

Agrupa os registros de rodagem por semana ISO (segunda a domingo). Retorna apenas semanas com ao menos 2 registros (consideradas "representativas").

---

#### IV.8.3- `calcularIntervalMedioReal`

```typescript
function calcularIntervalMedioReal(
  registros: RegistroManutencao[],
  pecaId: string
): number | null
```

Filtra os registros da peça e calcula a média dos `kmDesdeAnterior`. Retorna `null` se nenhum registro existir.

---

#### IV.8.4- `temDadoSuficiente`

```typescript
function temDadoSuficiente(
  tipo: 'rodagem' | 'manutencao',
  registros: Registros,
  pecaId?: string
): boolean
```

Ponto único de verificação: "tenho dados suficientes para usar o modo personalizado para este tipo/peça?"

```
SE tipo === 'rodagem':
  return registros.rodagem.length >= 1

SE tipo === 'manutencao':
  return registros.manutencao.filter(r => r.pecaId === pecaId).length >= 1
```

---

## V- Detalhamento de Custos — Toggle de Categorias

Esta é a resposta direta à pergunta: **qual componente usa qual função para o toggle?**

### V.1- Componente Responsável

`<DetalhamentoCustos />` — localizado em `src/components/Detalhamento/DetalhamentoCustos.tsx`

Responsabilidades deste componente:
1. Receber `custos: CustosPorCategoria` via prop (calculado no hook `useCustos`)
2. Gerenciar o estado local `filtros: FiltrosCategorias` com `useState`
3. Renderizar cada linha de categoria com um toggle (switch)
4. Calcular o total exibido chamando `calcularTotalFiltrado(custos, filtros)` a cada render
5. Renderizar o gráfico donut chamando `calcularBreakdownPercentual(custos, filtros)`

### V.2- Estrutura do Componente

```tsx
// src/components/Detalhamento/DetalhamentoCustos.tsx

interface DetalhamentoCustosProps {
  custos: CustosPorCategoria
  granularidade: 'anual' | 'mensal' | 'semanal' | 'diario'
}

export function DetalhamentoCustos({ custos, granularidade }: DetalhamentoCustosProps) {

  const [filtros, setFiltros] = useState<FiltrosCategorias>(filtrosPadrao)

  // Recalcula automaticamente quando filtros mudam
  const totalFiltrado = calcularTotalFiltrado(custos, filtros)
  const percentuais   = calcularBreakdownPercentual(custos, filtros)
  const granularidades = calcularGranularidades(totalFiltrado, diasAno, kmAnual)

  const toggleCategoria = (categoria: keyof FiltrosCategorias) => {
    setFiltros(prev => ({ ...prev, [categoria]: !prev[categoria] }))
  }

  const togglePeca = (pecaId: string) => {
    setFiltros(prev => ({
      ...prev,
      manutencaoPorPeca: {
        ...prev.manutencaoPorPeca,
        [pecaId]: !prev.manutencaoPorPeca[pecaId]
      }
    }))
  }

  return (
    <>
      <DonutChart percentuais={percentuais} />
      <ValorTotal valor={granularidades[granularidade]} />
      {/* Lista de categorias com toggle */}
      <CategoriaRow
        label="Documentos"
        valor={custos.documentos.total}
        ativo={filtros.documentos}
        onToggle={() => toggleCategoria('documentos')}
      />
      {/* ... demais categorias */}
      {/* Manutenção com expansão por peça */}
      <CategoriaExpandivel
        label="Manutenção"
        valor={custos.manutencao.total}
        ativo={filtros.manutencao}
        onToggle={() => toggleCategoria('manutencao')}
        itens={Array.from(custos.manutencao.detalhes.entries()).map(([id, d]) => ({
          id, valor: d.custoAnual, ativo: filtros.manutencaoPorPeca[id] !== false
        }))}
        onToggleItem={togglePeca}
      />
    </>
  )
}
```

### V.3- Persistência dos Filtros

**Os filtros do Detalhamento são estado de UI — não persistidos por padrão.**

Isso significa que ao fechar o app e reabrir, todas as categorias voltam ativas (`filtrosPadrao` = tudo `true`). Isso é o comportamento esperado: o usuário filtra para explorar, não para configurar permanentemente.

**Exceção:** se futuramente o usuário quiser excluir alimentação do seu cálculo de forma permanente (ex: "não gasto com alimentação de trabalho"), isso deve ser tratado como um campo do perfil (`perfil.financeiro.temAlimentacao: boolean`), não como filtro de UI.

---

## VI- Mapeamento: Função → Componente → Tela

| Função | Hook que a chama | Componente que exibe | Tela (tab) |
|---|---|---|---|
| `resolverKmDia` | `useCustos` | — (interno) | — |
| `calcularKmAnual` | `useCustos` | — (interno) | — |
| `calcularCpkCombustivel` | `useCustos` | — (interno) | — |
| `calcularCpkPorPeca` | `useCustos` | — (interno) | — |
| `calcularCustosPorCategoria` | `useCustos` | — (retorna objeto) | — |
| `calcularGranularidades` | `useCustos` | `<CardCusto />` | ESTIMATIVA |
| `calcularTotalFiltrado` | `<DetalhamentoCustos />` | `<ValorTotal />` | ESTIMATIVA → Detalhamento |
| `calcularBreakdownPercentual` | `<DetalhamentoCustos />` | `<DonutChart />` | ESTIMATIVA → Detalhamento |
| `calcularCustoMotoAnual` | `useCustos` | `<CardCustoMoto />` | ESTIMATIVA |
| `calcularKmParaProximaRevisao` | `useProximaTroca` | `<AvisoProximaTroca />` | ESTIMATIVA |
| `calcularDiasParaProximaRevisao` | `useProximaTroca` | `<AvisoProximaTroca />` | ESTIMATIVA |
| `resolverIntervaloPeca` | `useCustos` | `<LinhaVidaUtil />` | VIDA ÚTIL |
| `resolverPrecoPeca` | `useCustos` | `<LinhaVidaUtil />` | VIDA ÚTIL |
| `calcularIPVA` | `useCustos` | `<CustoFixoItem />` | ESTIMATIVA → Detalhamento |
| `calcularCustoRevisaoAnual` | `useCustos` | `<CustoFixoItem />` | ESTIMATIVA → Detalhamento |
| `calcularMediaRegistros` | `useRegistros` | — (interno) | — |
| `agruparRegistrosPorSemana` | `useRegistros` | `<GraficoRodagem />` | REGISTROS |
| `temDadoSuficiente` | `useCustos` | `<BadgeModoAtivo />` | ESTIMATIVA |

---

## VII- Tipos TypeScript das Interfaces de Cálculo

Estes tipos ficam em `src/types/calculos.ts` (separado dos tipos de domínio em `src/types/index.ts`).

```typescript
// src/types/calculos.ts

export interface GranularidadesCusto {
  anual: number
  mensal: number
  semanal: number
  diario: number
  porKm: number
}

export interface CustosPorCategoria {
  documentos: {
    total: number
    detalhes: { ipva: number; licenciamento: number }
  }
  revisao: {
    total: number
    detalhes: {
      modo: ModoRevisao
      revisoesPorAno: number
      precoPorRevisao: number
    }
  }
  manutencao: {
    total: number
    detalhes: Map<string, CustoPeca>
  }
  combustivel: {
    total: number
    detalhes: { cpk: number; kmAnual: number; consumoEfetivo: number }
  }
  internet: { total: number; ativo: boolean }
  seguro: { total: number; ativo: boolean }
  alimentacao: { total: number; ativo: boolean }
}

export interface CustoPeca {
  pecaId: string
  label: string
  cpk: number
  custoAnual: number
  intervaloKm: number
  preco: number
  fonte: 'preset' | 'registro'  // indica se veio do preset ou de dados reais
  proximaTrocaKm?: number        // calculado se kmAtual disponível
}

export interface FiltrosCategorias {
  documentos: boolean
  revisao: boolean
  manutencao: boolean
  manutencaoPorPeca: Record<string, boolean>
  combustivel: boolean
  internet: boolean
  seguro: boolean
  alimentacao: boolean
}

export const filtrosPadrao: FiltrosCategorias = {
  documentos: true,
  revisao: true,
  manutencao: true,
  manutencaoPorPeca: {},  // vazio = todas ativas (undefined = true)
  combustivel: true,
  internet: true,
  seguro: true,
  alimentacao: true,
}

export interface ResultadoCalculo {
  custos: CustosPorCategoria
  granularidades: GranularidadesCusto
  granularidadesMoto: GranularidadesCusto  // sem alimentação
  kmAnual: number
  diasAno: number
  modoAtivo: ModoExibicao
  fontesAtivas: Record<string, 'preset' | 'registro'>  // para badge visual
}
```

---

## VIII- Estrutura de Arquivos

```
src/
├── utils/
│   ├── calculos.ts          ← todas as funções puras IV.1 a IV.8
│   └── registros.ts         ← helpers específicos de registros (IV.8)
│
├── types/
│   ├── index.ts             ← tipos de domínio (PerfilUsuario, Registro, etc.)
│   └── calculos.ts          ← tipos de saída de cálculo (seção VII)
│
├── hooks/
│   ├── usePerfil.ts         ← lê/escreve PerfilUsuario no localStorage
│   ├── useRegistros.ts      ← lê/escreve Registros no localStorage
│   ├── useCustos.ts         ← orquestra calcularCustosPorCategoria + granularidades
│   ├── useProximaTroca.ts   ← calcularKmParaProximaRevisao + diasPara...
│   └── useFipe.ts           ← busca BrasilAPI + cache no localStorage
│
├── data/
│   └── dados_rj.json        ← aliquotaIPVA, tabelaLicenciamento, precoGasolinaPadrao
│
└── presets/
    └── pop110i.json
```

---

## IX- Riscos e Armadilhas

| Risco | Descrição | Solução adotada |
|---|---|---|
| `kmAnual` derivado de `kmMensal × 12` | Acumula erro do 4.33 | Sempre `kmDia × diasSemana × 52` |
| `custoDiario` por 365 | Resultado irrealmente baixo | Dividir por `diasAno = diasSemana × 52` |
| `semanal = mensal / 4` | 4 × 12 = 48, não 52 | Sempre `anual / 52` |
| 1 registro de peça sem `kmDesdeAnterior` | Não dá para calcular intervalo | O form de registro deve capturar `kmNaTroca`; app calcula `kmDesdeAnterior` na inserção |
| Registros sem dias de semana suficientes | Média de 1 dia não representa semana | Usar `diasSemana` do perfil como multiplicador, não inferir do registro |
| IPVA de moto com 15+ anos | Aplica alíquota indevidamente | Checar `anoAtual - anoMoto >= 15` antes de calcular |
| Filtros de UI virando configuração permanente | Confusão entre estado de UI e perfil | Filtros do Detalhamento são `useState` local — nunca persistidos no perfil |
| `manutencaoPorPeca[pecaId] === undefined` | Trata como `false` e exclui | Convenção: `undefined` = `true` (ativa por padrão); só `false` explícito desativa |
| Modo personalizado ativo sem registros | Exibe 0 como CPK | `temDadoSuficiente()` decide se usa personalizado ou cai no preset |
| Alimentação no total geral | Motoboy confunde custo da moto com custo pessoal | Dois totais sempre disponíveis: `custoTotal` e `custoMoto` (sem alimentação) |

---

*Última atualização: 05/05/2026 — especificação pré-implementação.*
*Próxima etapa: implementar `src/utils/calculos.ts` e `src/hooks/useCustos.ts` após setup do projeto.*

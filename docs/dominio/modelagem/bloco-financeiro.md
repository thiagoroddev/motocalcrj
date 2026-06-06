# Bloco: Financeiro

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario` **o maior e mais complexo**.
> **Implementação:** `perfil.financeiro` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **toda a estrutura financeira** do trabalho do Motoboy: como ele paga combustível, quanto gasta com internet, se tem seguro, qual a situação da moto (financiada/alugada/quitada), gastos com alimentação, e despesas personalizadas que ele queira rastrear.

🔍 **Análise Profunda por que é tão complexo:**
A vida financeira de um Motoboy é heterogênea: cada um tem combinação única de situações (alugada com locador pagando documentos, financiada com seguro próprio, quitada sem seguro, etc.). O bloco precisa cobrir todas as combinações possíveis sem inflar a interface daí o uso intensivo de `null` para campos opcionais e estruturas condicionais (`responsabilidadeAluguel` só importa se `situacaoMoto === 'alugada'`).

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

financeiro: {
  // Combustível
  tipoGasolinaPreferida: TipoCombustivel;                            // 'comum' | 'aditivada' | 'etanol'
  combustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel>;    // 3 entradas

  // Custos fixos mensais
  internet: number;                                                   // 0 se não tem
  seguro: SeguroConfig;                                              // tem/não tem + valor
  alimentacaoDia: number;                                            // 0 se leva de casa

  // Situação da moto e financiamento/aluguel
  situacaoMoto: SituacaoMoto;                                        // 'quitada' | 'financiada' | 'alugada'
  parcelaMensal: number | null;                                      // só financiada
  parcelasRestantes: number | null;                                  // só financiada (snapshot informado)
  dataReferenciaParcelas: string | null;                             // só financiada (mês ISO do snapshot - ADR-009)
  aluguelValor: number | null;                                       // só alugada; periodicidade qualifica o valor
  aluguelPeriodicidade: PeriodicidadeAluguel | null;                 // só alugada
  responsabilidadeAluguel: ResponsabilidadeAluguel;                  // só alugada (mas sempre presente)

  // Gastos personalizados
  gastosCustom: GastoCustom[];
}
```

---

## Sub-estruturas

### `ConfiguracaoCombustivel`

```typescript
interface ConfiguracaoCombustivel {
  preco: number; // R$/litro
  autonomia: number; // km/L
}
```

Repetido 3x dentro do bloco uma para cada `TipoCombustivel`. O Motoboy configura todos para poder alternar (mas só `tipoGasolinaPreferida` é usado nos cálculos).

### `SeguroConfig`

```typescript
interface SeguroConfig {
  valorAnual: number;                // sempre anualizado; 0 = sem seguro (REF-21)
  empresa: string | null;            // nome opcional ("Porto Seguro", etc)
  periodicidade: 'anual' | 'mensal'; // como o Motoboy paga
}
```

⚠️ **Sem campo `tem` (REF-21 / ADR-005).** Presença de seguro é derivada de `valorAnual > 0`. O toggle Sim/Não no Passo 7 do Onboarding existe como UX local - quando "Não", o dispatch grava `valorAnual: 0`.

⚠️ **`periodicidade` é informação de display, não de cálculo.** O valor armazenado é sempre anual. Se o Motoboy informa mensalmente, o Onboarding multiplica por 12 antes de gravar.

### `ResponsabilidadeAluguel`

```typescript
interface ResponsabilidadeAluguel {
  documentos: ResponsabilidadeCusto; // 'eu' | 'locador' | 'dividido'
  manutencao: ResponsabilidadeCusto;
  seguro: ResponsabilidadeCusto;
}
```

Define quem paga cada bloco quando a moto é alugada. Aplicado via `fatorResponsabilidade()`:

- `'eu'` → 1.0
- `'locador'` → 0.0 (custo zerado pro Motoboy)
- `'dividido'` → 0.5

⚠️ **Observação:** o campo `responsabilidadeAluguel` está sempre presente mesmo quando `situacaoMoto !== 'alugada'`. O cálculo só usa ele quando alugada (ver `calcularCustosPorCategoria`). Para outras situações, fatores são forçados a 1.0.

### `GastoCustom`

```typescript
interface GastoCustom {
  id: string;
  nome: string;
  valorAnual: number;   // total acumulado no ano (não recorrência mensal)
  ativo: boolean;
  ehPreset: boolean;    // presets fixos não podem ser deletados
}
```

Lista **fechada** de 3 presets editáveis na seção Imprevistos do Detalhamento:

| `id`              | `nome`       | Propósito                                                       |
| ----------------- | ------------ | --------------------------------------------------------------- |
| `preset-multa`    | Multa        | Total de multas no ano (atuais + previstas).                    |
| `preset-sinistro` | Sinistros    | Prejuízos diversos por acidente, furto, queda etc.              |
| `preset-outros`   | Outros       | Coringa para custos não previstos pelos presets acima.          |

⚠️ **Regras** (definidas pela TASK-RF-6.9 - ver ADR-003 e ADR-006):

- **Sem cadastro avulso.** O usuário não adiciona nem deleta itens. A lista é fechada - quando um custo não cabe em Multa ou Sinistros, vai em "Outros".
- **Valor único acumulado.** `valorAnual` é o **total que o usuário já gastou e/ou prevê gastar no ano corrente**, somado num único campo. Não há recorrência mensal nem registro item-a-item: ao tomar nova multa, edita o valor somando ao que já estava.
- **Edição direta no Detalhamento.** Imprevistos é a **única categoria** editável direto na tela de Detalhamento, via popup acionado pelo ícone de lápis.
- **Auto-ativação por conveniência.** Ao informar valor > 0 num item desligado, o toggle ativa automaticamente (o usuário acabou de declarar o custo). Zerar o valor **não** desativa - quem zera mantém controle explícito do toggle.

---

## Comportamentos (Actions do Reducer)

| Action                           | Comportamento                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `SET_INTERNET`                   | Atualiza valor de internet mensal                                                   |
| `SET_SEGURO`                     | Atualiza configuração de seguro (Partial - pode atualizar só o que mudou)           |
| `SET_ALIMENTACAO`                | Atualiza gasto diário com alimentação                                               |
| `SET_COMBUSTIVEL`                | Atualiza preço ou autonomia de um tipo específico de combustível                    |
| `SET_TIPO_COMBUSTIVEL_PREFERIDO` | Troca o tipo principal usado nos cálculos                                           |
| `TOGGLE_GASTO_CUSTOM`            | Liga/desliga um preset (Multa, Sinistros, Outros) sem zerar o valor                 |
| `SET_GASTO_CUSTOM_VALOR`         | Atualiza `valorAnual` do preset; ativa o toggle se passar de 0 para >0              |
| `SET_SITUACAO_MOTO`              | Define `situacaoMoto` (quitada/financiada/alugada)                                  |
| `SET_PARCELA`                    | Define `parcelaMensal` + `parcelasRestantes`; re-ancora `dataReferenciaParcelas` só quando `parcelasRestantes` muda (RF-6.18 / ADR-009) |
| `SET_ALUGUEL`                    | Define `aluguelValor` + `aluguelPeriodicidade`                                      |
| `SET_RESPONSABILIDADE_ALUGUEL`   | Atualiza `responsabilidadeAluguel` (Partial - campos documentos/manutencao/seguro). Adicionado pela BG-006 |

> Não há `ADD_GASTO_CUSTOM`/`DELETE_GASTO_CUSTOM` - lista de imprevistos é **fechada** em 3 presets (Multa, Sinistros, Outros), TASK-RF-6.9 / ADR-006.

---

## Aplicação dos Fatores de Responsabilidade

⚠️ **Lógica crítica e fácil de errar:**

```typescript
// utils/calculos.ts calcularCustosPorCategoria
const fatorDoc = situacaoMoto === 'alugada'
  ? fatorResponsabilidade(responsabilidadeAluguel.documentos)
  : 1;

// Aplicado:
documentos: {
  total: calcularCustoDocumentosAnual(ipva, licenciamento) * fatorDoc,
  // ...
}
```

🔍 **Análise Profunda:**

- Fator é aplicado **multiplicativamente no total** da categoria
- `fatorDoc = 0` zera 100% do custo (locador paga tudo)
- `fatorDoc = 0.5` mostra metade (divisão)
- Toggle de categoria é **ortogonal** ao fator (RN-08): pode-se desativar a categoria mesmo com fator > 0

---

## Cálculo de Custos por Categoria deste Bloco

| Sub-bloco             | Função de cálculo                                        | Resultado anual                          |
| --------------------- | -------------------------------------------------------- | ---------------------------------------- |
| Combustível           | `calcularCpkCombustivel(preco, autonomia) × kmAnual`     | combustível anual                        |
| Internet              | `calcularCustoInternetAnual(internet > 0, internet)`     | `internet × 12` se > 0                   |
| Seguro                | `calcularCustoSeguroAnual(valorAnual) × fatorSeg`        | `valorAnual × fatorSeg` se `valorAnual > 0` (defensiva) |
| Alimentação           | `calcularCustoAlimentacaoAnual(alimentacaoDia, diasAno)` | `alimentacaoDia × diasAno`               |
| Financiamento/Aluguel | `calcularCustoFinanciamentoAnual(...)`                   | depende da situação                      |
| Gastos Custom         | `calcularCustoGastosCustomAnual(gastosCustom)`           | soma de `valorAnual` dos presets ativos  |
| Imprevistos sugeridos | derivado de `servicosIndependentes` excepcionais         | só entra no total com filtro explícito   |

### Cálculo de Financiamento/Aluguel

```typescript
// utils/calculos.ts (TASK-RF-6.18 / ADR-009)

// Deriva quantas parcelas faltam HOJE sem mutar o perfil (modelagem snapshot).
function calcularParcelasRestantesAtuais(parcelasRestantes, dataReferencia, agora = new Date()) {
  if (parcelasRestantes == null || parcelasRestantes <= 0) return 0;
  if (!dataReferencia) return parcelasRestantes;
  const mesesDecorridos = (agora.ano - ref.ano) * 12 + (agora.mes - ref.mes); // granularidade de mês
  return Math.max(0, parcelasRestantes - Math.max(0, mesesDecorridos));
}

function calcularCustoFinanciamentoAnual(situacao, parcela, restantesAtuais, aluguel, periodicidade) {
  // Afunila no último ano: projeta só as parcelas que ainda faltam (máx. 12).
  if (situacao === 'financiada' && parcela != null) return parcela * Math.min(12, Math.max(0, restantesAtuais));
  if (situacao === 'alugada' && aluguel != null) {
    return periodicidade === 'semanal' ? aluguel * 52 : aluguel * 12;
  }
  return 0;
}
```

⚠️ **Importante:** quitada → custo de financiamento é 0. Aluguel semanal → multiplica por 52, não 4.33×12. Financiamento **afunila**: quando as parcelas zeram, o custo vai a 0 automaticamente (não é mais `parcela * 12` fixo). `parcelasRestantes` é o valor informado; o número exibido/usado é o **derivado de hoje** por `calcularParcelasRestantesAtuais`.

---

## Invariantes

### INV-FIN-1: Consistência situação × campos opcionais

**Regra:**

- Se `situacaoMoto === 'financiada'`, então `parcelaMensal !== null`, `parcelasRestantes !== null` e `dataReferenciaParcelas !== null` (ADR-009).
- Se `situacaoMoto === 'alugada'`, então `aluguelValor !== null` e `aluguelPeriodicidade !== null`.
- Se `situacaoMoto === 'quitada'`, todos esses campos podem ser `null`.

**Por quê:** sistema crashar tentando ler `parcelaMensal.toFixed(2)` quando `null` em moto financiada é bug grave.

**Onde é protegida:** Onboarding P6 com branching condicional. Validação no `COMMIT_ONBOARDING`.

### INV-FIN-2: tipoGasolinaPreferida tem entrada em combustiveis

**Regra:** `combustiveis[tipoGasolinaPreferida]` sempre existe (não é undefined).

**Por quê:** o `Record<TipoCombustivel, ConfiguracaoCombustivel>` garante isso por tipagem. Os 3 tipos são sempre populados.

**Onde é protegida:** estrutura de inicialização do perfil garante `combustiveis: { comum: {...}, aditivada: {...}, etanol: {...} }` sempre completo.

### INV-FIN-3: Valores monetários não negativos

**Regra:** Todos os valores em R$ (`internet`, `seguro.valorAnual`, `alimentacaoDia`, `parcelaMensal`, `aluguelValor`, `gastosCustom[].valorAnual`, `combustiveis.*.preco`) devem ser `>= 0`.

**Onde é protegida:** validação nos formulários de UI.

### INV-FIN-4: Autonomia positiva

**Regra:** `combustiveis[tipo].autonomia > 0`.

**Por quê:** `calcularCpkCombustivel(preco, autonomia) = preco / autonomia`. Zero quebra divisão.

**Onde é protegida:** validação nos formulários (Onboarding e Ajustes).

### INV-FIN-5: Presença de seguro derivada de `valorAnual > 0`

**Regra:** Após REF-21 (ADR-005), não há mais `seguro.tem`. Custo de seguro está presente sse `seguro.valorAnual > 0`. Editar `valorAnual` em SecaoFinanceiro reflete imediatamente na Estimativa (corrige bug B-1).

**Onde é protegida:** `calcularCustoSeguroAnual(valorAnual)` é defensiva (`valorAnual > 0 ? valorAnual : 0`); o COMMIT_ONBOARDING deriva `categoriasAtivas.seguro` de `valorAnual > 0`; o Passo 7 do Onboarding mantém o toggle Sim/Não apenas como estado local de UX (quando "Não", grava `valorAnual: 0`).

### INV-FIN-6: aluguelPeriodicidade só faz sentido com aluguelValor

**Regra:** Se `aluguelValor === null`, então `aluguelPeriodicidade === null`. Não faz sentido ter periodicidade sem valor.

**Onde é protegida:** Onboarding P6c.

---

## Relacionamentos

```
PerfilUsuario.financeiro
├── tipoGasolinaPreferida + combustiveis → calcularCpkCombustivel() → custo combustível
├── internet → calcularCustoInternetAnual()
├── seguro → calcularCustoSeguroAnual() × fatorSeg
├── alimentacaoDia → calcularCustoAlimentacaoAnual()
├── situacaoMoto + parcela/aluguel → calcularCustoFinanciamentoAnual()
├── responsabilidadeAluguel → fatores aplicados em documentos/manutencao/seguro
└── gastosCustom → calcularCustoGastosCustomAnual()
```

---

## Eventos Relacionados

- `ConfiguracaoFinanceiraDefinida` fim do Onboarding (P6, P7, P8, P9)
- `SeguroAtualizado` `SET_SEGURO`
- `CombustivelAtualizado` `SET_COMBUSTIVEL` ou `SET_TIPO_COMBUSTIVEL_PREFERIDO`
- `GastoCustomAlternado` `TOGGLE_GASTO_CUSTOM`
- `GastoCustomValorEditado` `SET_GASTO_CUSTOM_VALOR`

---

## Pontos de Atenção

### Fatores de responsabilidade são aplicados após cálculo, não no input

O Motoboy informa o **valor cheio** dos custos (IPVA total, manutenção total). O fator divide depois no cálculo final. Isso significa que **alterar o fator não muda os inputs no perfil** só muda o cálculo derivado. Documentar isso é importante para evitar bugs.

### `gastosCustom` é lista fechada

Pela TASK-RF-6.9 / ADR-006, a lista é fechada em 3 presets (Multa, Sinistros, Outros). Sem mecanismo de cadastro avulso. Se uma necessidade futura justificar abrir, é decisão arquitetural - ADR nova.

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` bloco `financeiro` completo + sub-tipos
- `src/utils/calculos.ts` todas as funções de cálculo financeiro mencionadas
- `docs/requisitos/funcionais.md` - onboarding P6 a P9, RF-DET-04 e RF-DET-07 a RF-DET-10
- `docs/requisitos/regras-negocio.md` - RN-21 a RN-23
- `contexto-base.instructions.md` RN-21, RN-22, RN-23

**Divergências encontradas:** nenhuma no contrato financeiro atual. A ambiguidade de
`aluguelMensal` foi resolvida pela TASK-REF-38 com `aluguelValor` +
`aluguelPeriodicidade`.

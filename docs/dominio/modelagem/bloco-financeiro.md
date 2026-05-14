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
  parcelasRestantes: number | null;                                  // só financiada
  aluguelMensal: number | null;                                      // só alugada
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
  tem: boolean;
  valorAnual: number; // sempre normalizado para anual
  empresa: string | null; // nome opcional ("Porto Seguro", etc)
  periodicidade: 'anual' | 'mensal'; // como o Motoboy paga
}
```

⚠️ **Atenção:** mesmo que `periodicidade === 'mensal'`, o `valorAnual` está sempre **anualizado**. A periodicidade é informação de display, não de cálculo. O Onboarding P7 normaliza: se Motoboy informa mensalmente, multiplica por 12 antes de salvar em `valorAnual`.

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
  valorMensal: number;
  ativo: boolean;
}
```

Despesas que o Motoboy adiciona livremente ("manutenção do celular", "EPI"). Cada gasto pode ser ativado/desativado sem deletar.

---

## Comportamentos (Actions do Reducer)

| Action                           | Comportamento                                                           |
| -------------------------------- | ----------------------------------------------------------------------- |
| `SET_INTERNET`                   | Atualiza valor de internet mensal                                       |
| `SET_SEGURO`                     | Atualiza configuração de seguro (Partial pode atualizar só o que mudou) |
| `SET_ALIMENTACAO`                | Atualiza gasto diário com alimentação                                   |
| `SET_COMBUSTIVEL`                | Atualiza preço ou autonomia de um tipo específico de combustível        |
| `SET_TIPO_COMBUSTIVEL_PREFERIDO` | Troca o tipo principal usado nos cálculos                               |
| `ADD_GASTO_CUSTOM`               | Adiciona novo gasto personalizado                                       |
| `TOGGLE_GASTO_CUSTOM`            | Liga/desliga um gasto sem deletá-lo                                     |
| `DELETE_GASTO_CUSTOM`            | Remove um gasto personalizado                                           |

⚠️ **Não há actions específicas** para `situacaoMoto`, `parcelaMensal`, `aluguelMensal`, `responsabilidadeAluguel`. Essas mudanças precisam usar `SET_ONBOARDING_CAMPO` (Onboarding ou Ajustes). No reducer atual nao existe action dedicada para esses campos.

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

| Sub-bloco             | Função de cálculo                                        | Resultado anual                       |
| --------------------- | -------------------------------------------------------- | ------------------------------------- |
| Combustível           | `calcularCpkCombustivel(preco, autonomia) × kmAnual`     | combustível anual                     |
| Internet              | `calcularCustoInternetAnual(internet > 0, internet)`     | `internet × 12` se > 0                |
| Seguro                | `calcularCustoSeguroAnual(tem, valorAnual) × fatorSeg`   | `valorAnual × fatorSeg` se `tem`      |
| Alimentação           | `calcularCustoAlimentacaoAnual(alimentacaoDia, diasAno)` | `alimentacaoDia × diasAno`            |
| Financiamento/Aluguel | `calcularCustoFinanciamentoAnual(...)`                   | depende da situação                   |
| Gastos Custom         | `calcularCustoGastosCustomAnual(gastosCustom)`           | soma de `valorMensal × 12` dos ativos |

### Cálculo de Financiamento/Aluguel

```typescript
// utils/calculos.ts
function calcularCustoFinanciamentoAnual(situacao, parcela, aluguel, periodicidade) {
  if (situacao === 'financiada' && parcela != null) return parcela * 12;
  if (situacao === 'alugada' && aluguel != null) {
    return periodicidade === 'semanal' ? aluguel * 52 : aluguel * 12;
  }
  return 0;
}
```

⚠️ **Importante:** quitada → custo de financiamento é 0. Aluguel semanal → multiplica por 52, não 4.33×12. Detalhe que se errado quebra o cálculo.

---

## Invariantes

### INV-FIN-1: Consistência situação × campos opcionais

**Regra:**

- Se `situacaoMoto === 'financiada'`, então `parcelaMensal !== null` e `parcelasRestantes !== null`.
- Se `situacaoMoto === 'alugada'`, então `aluguelMensal !== null` e `aluguelPeriodicidade !== null`.
- Se `situacaoMoto === 'quitada'`, todos esses campos podem ser `null`.

**Por quê:** sistema crashar tentando ler `parcelaMensal.toFixed(2)` quando `null` em moto financiada é bug grave.

**Onde é protegida:** Onboarding P6 com branching condicional. Validação no `COMMIT_ONBOARDING`.

### INV-FIN-2: tipoGasolinaPreferida tem entrada em combustiveis

**Regra:** `combustiveis[tipoGasolinaPreferida]` sempre existe (não é undefined).

**Por quê:** o `Record<TipoCombustivel, ConfiguracaoCombustivel>` garante isso por tipagem. Os 3 tipos são sempre populados.

**Onde é protegida:** estrutura de inicialização do perfil garante `combustiveis: { comum: {...}, aditivada: {...}, etanol: {...} }` sempre completo.

### INV-FIN-3: Valores monetários não negativos

**Regra:** Todos os valores em R$ (`internet`, `seguro.valorAnual`, `alimentacaoDia`, `parcelaMensal`, `aluguelMensal`, `gastosCustom[].valorMensal`, `combustiveis.*.preco`) devem ser `>= 0`.

**Onde é protegida:** validação nos formulários de UI.

### INV-FIN-4: Autonomia positiva

**Regra:** `combustiveis[tipo].autonomia > 0`.

**Por quê:** `calcularCpkCombustivel(preco, autonomia) = preco / autonomia`. Zero quebra divisão.

**Onde é protegida:** validação nos formulários (Onboarding e Ajustes).

### INV-FIN-5: Seguro coerente

**Regra:** Se `seguro.tem === false`, então `valorAnual` pode ser qualquer coisa (ignorado pelo cálculo). Se `seguro.tem === true`, então `valorAnual > 0`.

**Onde é protegida:** lógica no Onboarding P7 (`seguro.tem === true → exibe input do valor`).

### INV-FIN-6: aluguelPeriodicidade só faz sentido com aluguelMensal

**Regra:** Se `aluguelMensal === null`, então `aluguelPeriodicidade === null`. Não faz sentido ter periodicidade sem valor.

**Onde é protegida:** Onboarding P6c.

⚠️ **Nota sobre o nome:** o campo se chama `aluguelMensal` mas pode armazenar valor semanal (se `aluguelPeriodicidade === 'semanal'`). Naming confuso. **Possível dívida técnica de nomenclatura** registrar.

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
- `GastoCustomCriado` `ADD_GASTO_CUSTOM`
- `GastoCustomAlternado` `TOGGLE_GASTO_CUSTOM`
- `GastoCustomRemovido` `DELETE_GASTO_CUSTOM`

---

## Pontos de Atenção

### Naming de `aluguelMensal`

Apesar do nome, pode armazenar valor semanal. Registrar como dívida técnica de nomenclatura `aluguelValor` + `aluguelPeriodicidade` seriam mais claros.

### Fatores de responsabilidade são aplicados após cálculo, não no input

O Motoboy informa o **valor cheio** dos custos (IPVA total, manutenção total). O fator divide depois no cálculo final. Isso significa que **alterar o fator não muda os inputs no perfil** só muda o cálculo derivado. Documentar isso é importante para evitar bugs.

### `gastosCustom` cresce sem limite

Sem mecanismo de arquivamento ou limite de quantidade. Se Motoboy criar 100 gastos custom ao longo dos anos, persistência fica pesada. **Não é problema agora**, mas considerar quando crescer.

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` bloco `financeiro` completo + sub-tipos
- `src/utils/calculos.ts` todas as funções de cálculo financeiro mencionadas
- `Requisitos v6` Seção V.5, V.6 (formulários P6 a P9)
- `contexto-base.instructions.md` RN-21, RN-22, RN-23

**Divergências encontradas:**

- Naming `aluguelMensal` ambíguo (registrado como dívida técnica candidata)
- Actions do reducer parecem incompletas no `PerfilAction` mostrado (verificar implementação real para `situacaoMoto`, `responsabilidadeAluguel`)

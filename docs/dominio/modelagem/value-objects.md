# Value Objects do Dominio

> **Status:** Atualizado por engenharia reversa em 2026-05-11.
> **Tipo:** Value Objects definidos pelo valor, sem identidade, imutaveis.

---

## Conceito de Value Object no MotoCalc

Value Objects sao conceitos do dominio que **nao precisam de identidade**. Eles sao definidos apenas por seus valores e podem ser copiados sem perda de significado. No codigo atual, muitos VOs sao implementados como **interfaces simples** ou objetos anonimos (sem classes), o que e idiomatico em React/TypeScript.

---

## Value Objects Implementados (codigo real)

### ConfiguracaoCombustivel

```typescript
interface ConfiguracaoCombustivel {
  preco: number;
  autonomia: number;
}
```

**Uso:** `perfil.financeiro.combustiveis[tipo]`.

**Invariantes:**

- `preco >= 0`
- `autonomia > 0` (evita divisao por zero no CPK)

---

### SeguroConfig

```typescript
interface SeguroConfig {
  tem: boolean;
  valorAnual: number;
  empresa: string | null;
  periodicidade: 'anual' | 'mensal';
}
```

**Uso:** `perfil.financeiro.seguro`.

**Invariantes:**

- Se `tem === true`, entao `valorAnual > 0`.
- `valorAnual` e sempre anualizado (mesmo que `periodicidade` seja `mensal`).

---

### ResponsabilidadeAluguel

```typescript
interface ResponsabilidadeAluguel {
  documentos: ResponsabilidadeCusto;
  manutencao: ResponsabilidadeCusto;
  seguro: ResponsabilidadeCusto;
}
```

**Uso:** `perfil.financeiro.responsabilidadeAluguel`.

**Invariantes:**

- Cada campo aceita apenas `'eu' | 'locador' | 'dividido'`.
- So e aplicado quando `situacaoMoto === 'alugada'`.

---

### CategoriaDisplay

```typescript
type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;
  documentacao: boolean;
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
};
```

**Uso:** `perfil.configuracaoDisplay.categoriasAtivas`.

**Invariantes:**

- Todas as chaves devem existir (tipo fechado).
- `documentacao` e traduzido para `documentos` nos calculos.

---

### FiltrosCategorias

```typescript
interface FiltrosCategorias {
  documentos: boolean;
  revisao: boolean;
  manutencao: boolean;
  manutencaoPorPeca: Record<string, boolean>;
  revisaoPorServico: Record<string, boolean>;
  imprevistosSugeridos: Record<string, boolean>;
  combustivel: boolean;
  internet: boolean;
  seguro: boolean;
  alimentacao: boolean;
  financiamento: boolean;
  gastosCustom: boolean;
}
```

**Uso:** calculos internos (`utils/calculos.ts`).

**Invariantes:**

- Em `manutencaoPorPeca` e `revisaoPorServico`, item ativo quando valor e `true` ou `undefined`.
- Em `imprevistosSugeridos`, item ativo apenas quando valor e `true`.
- `revisao` e derivado de `manutencao` via `categoriasParaFiltros()`.

---

### GranularidadesCusto

```typescript
interface GranularidadesCusto {
  anual: number;
  mensal: number;
  semanal: number;
  diario: number;
  porKm: number;
}
```

**Invariantes:**

- `mensal = anual / 12`
- `semanal = anual / 52`
- `diario = anual / diasAno`
- `porKm = anual / kmAnual`

---

### DadosRJ

```typescript
interface DadosRJ {
  ipva: {
    aliquotaMotos: number;
    isencaoIdadeMinimaMeses: number;
  };
  licenciamento: {
    tabela: Record<string, number>;
  };
}
```

**Uso:** `utils/calculos.ts` (IPVA e licenciamento).

**Observacao:** o arquivo `src/data/dados_rj.json` contem outras secoes (combustivel, manutencao). Elas nao sao consumidas nos calculos atuais.

---

## Value Objects Derivados de Calculo (nao persistidos)

### RegistroManutencao

```typescript
interface RegistroManutencao {
  pecaId: string;
  kmNaTroca: number;
  kmDesdeAnterior: number;
  preco: number;
}
```

Derivado de `HistoricoManutencao` por `adaptarHistoricoParaRegistros()`. Nao e persistido.

### CustoPeca

```typescript
interface CustoPeca {
  pecaId: string;
  label: string;
  cpk: number;
  custoAnual: number;
  intervaloKm: number;
  preco: number;
  fonte: 'preset' | 'registro';
  proximaTrocaKm: number;
}
```

### CustosPorCategoria

Estrutura agregada com totais e detalhes por categoria.

### ResultadoCalculo

```typescript
interface ResultadoCalculo {
  custos: CustosPorCategoria;
  granularidades: GranularidadesCusto;
  granularidadesMoto: GranularidadesCusto;
  kmAnual: number;
  diasAno: number;
  modoAtivo: ModoExibicao;
}
```

---

## Value Objects que NAO existem no codigo atual

Alguns conceitos anteriores nao existem no codigo atual e nao devem ser usados como verdade:

- `HabitosUso`
- `CustosFixos`

Se esses conceitos voltarem a ser necessarios, devem ser modelados novamente com base no codigo real.

---

## Pontos de Atencao

1. **Tipos primitivos predominam:** quilometragem, dinheiro e CPK sao `number` simples. Isso e intencional no V1, mas e uma divida tecnica conhecida.
2. **Validacao dispersa:** invariantes sao checadas em formularios e no reducer, nao em factories de VO.
3. **Imutabilidade por convencao:** TypeScript nao impede mutacao de objetos; disciplina de codigo e revisao sao essenciais.

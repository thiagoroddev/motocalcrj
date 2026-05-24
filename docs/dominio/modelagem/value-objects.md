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
  valorAnual: number;                // 0 = sem seguro (REF-21)
  empresa: string | null;
  periodicidade: 'anual' | 'mensal';
}
```

**Uso:** `perfil.financeiro.seguro`.

**Invariantes:**

- Presença de seguro derivada de `valorAnual > 0` (após REF-21 / ADR-005 — sem mais campo `tem`).
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
  imprevistos: boolean;
};
```

**Uso:** `perfil.configuracaoDisplay.categoriasAtivas`.

**Invariantes:**

- Todas as 8 chaves devem existir (tipo fechado).
- `documentacao` é traduzido para `documentos` nos calculos.
- `imprevistos` controla tanto `gastosCustom` (Multa/Sinistros/Outros) quanto `imprevistosSugeridos` no mapeamento.

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

### CustoPeca

```typescript
interface CustoPeca {
  pecaId: string;
  label: string;
  cpk: number;
  custoAnual: number;
  intervaloKm: number;
  preco: number;
  fonte: 'preset' | 'registro';  // semantica atual: 'registro' = tem override
  proximaTrocaKm: number;
  trocasNoAno: number;
}
```

⚠️ Campo `fonte: 'preset' | 'registro'` permanece com naming herdado — sua semantica hoje é "tem override?" (REF-18). Nao renomear sem ADR.

### CustoServicoRevisao

```typescript
interface CustoServicoRevisao {
  servicoId: string;
  label: string;
  custoAnual: number;
  intervalKm: number;
  precoMaoDeObra: number;
  eventosNoAno: number;
  ehExcepcional: boolean;
}
```

### CustoImprevistoSugerido

```typescript
interface CustoImprevistoSugerido {
  id: string;
  label: string;
  custoAnual: number;
  intervalKm: number;
  precoServico: number;
  eventosNoAno: number;
}
```

Usado para retíficas (`retifica-cabecote`, `retifica-completa`) em `CustosPorCategoria.gastosCustom.detalhes.sugeridos`.

### CustosPorCategoria

Estrutura agregada com totais e detalhes por categoria — `documentos`, `revisao`, `manutencao`, `combustivel`, `internet`, `seguro`, `alimentacao`, `financiamento`, `gastosCustom`. Ver `src/types/calculos.ts` para shape completo.

### ResultadoCalculo

```typescript
interface ResultadoCalculo {
  custos: CustosPorCategoria;
  granularidades: GranularidadesCusto;
  granularidadesMoto: GranularidadesCusto;
  kmAnual: number;
  diasAno: number;
}
```

Após REF-18 (modo único), nao tem mais `modoAtivo`.

---

## Value Objects que NAO existem no codigo atual

Conceitos antigos removidos ou que nunca foram materializados — nao usar como verdade:

- `HabitosUso` (nunca existiu)
- `CustosFixos` (nunca existiu como tipo)
- `RegistroManutencao` (eliminado por REF-19 — Registros mortos)
- `ModoExibicao` (eliminado por REF-18 — modo unico)

Se esses conceitos voltarem a ser necessarios, devem ser modelados novamente com base no codigo real.

---

## Pontos de Atencao

1. **Tipos primitivos predominam:** quilometragem, dinheiro e CPK sao `number` simples. Isso e intencional no V1, mas e uma divida tecnica conhecida.
2. **Validacao dispersa:** invariantes sao checadas em formularios e no reducer, nao em factories de VO.
3. **Imutabilidade por convencao:** TypeScript nao impede mutacao de objetos; disciplina de codigo e revisao sao essenciais.

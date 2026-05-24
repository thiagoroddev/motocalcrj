> ⚠️ **DESATUALIZADO — NÃO USAR COMO REFERÊNCIA.**
> Este arquivo descreve o bloco `perfil.diarioTrabalho` (registros diários com km inicial/final) e funções derivadas (`resolverKmDia(..., diarioTrabalho, modoExibicao)`, `calcularKmMensalPorSemanas`, `agruparRegistrosPorSemana`, `temDadoSuficiente`). **Tudo removido em 23/05/26 pelas TASK-REF-18 e TASK-REF-19** após decisão da ADR-003. Hoje o app opera em modo único sem diário/registros — `resolverKmDia` retorna `perfil.trabalho.kmPorDia` direto. Reescrita/exclusão programada na **TASK-DOC-009** (Strict).
> Mantido apenas para referência histórica enquanto a TASK-DOC-009 não roda.

---

# Diario de Trabalho

> **Status:** Engenharia reversa baseada em codigo real.
> **Tipo:** Lista de registros diarios dentro de `PerfilUsuario`.
> **Implementacao:** `perfil.diarioTrabalho` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

O Diario de Trabalho registra **cada dia efetivamente trabalhado** pelo Motoboy. Cada entrada guarda a quilometragem inicial e final do dia, se ele comeu fora e se abasteceu, com dados basicos do abastecimento.

Este bloco serve para:

1. **Calcular medias reais de rodagem** no modo personalizado.
2. **Permitir analise semanal** (dias registrados por semana).
3. **Atualizar km atual da moto** automaticamente com base no km final informado.

---

## Estrutura Real

```typescript
// src/types/perfil.ts

export interface DiarioEntry {
  id: string;
  data: string;
  kmInicial: number;
  kmFinal: number;
  kmPercorridos: number;
  comeu: boolean;
  abasteceu: boolean;
  litros: number | null;
  precoLitro: number | null;
}
```

---

## Comportamentos (Actions do Reducer)

| Action                | Comportamento                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ADD_DIA_TRABALHO`    | Adiciona entrada, atualiza `moto.kmAtual` com `Math.max(kmAtual, kmFinal)` e seta `modoExibicao = 'personalizado'` |
| `DELETE_DIA_TRABALHO` | Remove entrada por id                                                                                              |

---

## Como o Diario Influencia os Calculos

### Media real de km/dia

```typescript
// utils/calculos.ts
resolverKmDia(kmPorDia, diarioTrabalho, modoExibicao);
```

No codigo atual, quando `modoExibicao === 'personalizado'` **e existe pelo menos 1 entrada**, o `kmPorDia` passa a ser a media de `kmPercorridos` do diario.

### Estimativa por semanas

```typescript
// utils/calculos.ts
calcularKmMensalPorSemanas(diario);
agruparRegistrosPorSemana(diario);
```

- `calcularKmMensalPorSemanas` usa **semanas com 2+ dias registrados** e so retorna valor se houver **pelo menos 2 semanas** validas.
- `agruparRegistrosPorSemana` devolve agregados por semana ISO (uso tipico em UI e analises).

### Dado suficiente

```typescript
// utils/calculos.ts
temDadoSuficiente('rodagem', diarioTrabalho, ...)
```

No codigo atual, basta `diarioTrabalho.length >= 1`.

---

## Invariantes

### INV-DIARIO-1: kmFinal nao pode ser menor que kmInicial

**Regra:** `kmFinal >= kmInicial`.

**Onde e protegida:** validacao de formulario (nao ha guard no reducer).

### INV-DIARIO-2: kmPercorridos coerente

**Regra:** `kmPercorridos = kmFinal - kmInicial`.

**Onde e protegida:** UI deve calcular automaticamente. Nao e recalculado no reducer.

### INV-DIARIO-3: abasteceu implica litros/preco

**Regra:** se `abasteceu === true`, entao `litros` e `precoLitro` devem ser informados e > 0.

**Onde e protegida:** validacao de formulario.

### INV-DIARIO-4: nao abasteceu implica nulos

**Regra:** se `abasteceu === false`, entao `litros === null` e `precoLitro === null`.

**Onde e protegida:** validacao de formulario.

### INV-DIARIO-5: kmAtual monotonicamente crescente

**Regra:** ao adicionar um dia, `moto.kmAtual` e atualizado com `Math.max(kmAtual, kmFinal)`.

**Onde e protegida:** reducer (`ADD_DIA_TRABALHO`).

---

## Pontos de Atencao

1. **Sem edicao:** nao existe action de edit; para corrigir, precisa deletar e recriar.
2. **Sem sincronizacao com historico:** um abastecimento no diario **nao** cria automaticamente um `Abastecimento` no historico.
3. **Substituicao automatica no modo personalizado:** a media do diario substitui `kmPorDia` com 1+ registros (ver `divida-tecnica.md`).

---

## Validacao Contra Codigo Real

Documentacao validada contra:

- `src/types/perfil.ts` (`DiarioEntry`)
- `src/context/PerfilContext.tsx` (`ADD_DIA_TRABALHO`, `DELETE_DIA_TRABALHO`)
- `src/utils/calculos.ts` (`resolverKmDia`, `calcularKmMensalPorSemanas`, `agruparRegistrosPorSemana`, `temDadoSuficiente`)

**Divergencias encontradas:** nenhuma estrutural. O comportamento de uso automatico da media esta documentado como divida tecnica.

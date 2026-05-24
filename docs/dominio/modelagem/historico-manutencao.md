> ⚠️ **DESATUALIZADO — NÃO USAR COMO REFERÊNCIA.**
> Este arquivo descreve o bloco `perfil.historicoManutencao` (5 listas: trocas de óleo, revisões, pneus, kit relação, abastecimentos) que foi **removido em 23/05/26 pela TASK-REF-19** após decisão da ADR-003 (modo único, sem Registros). Hoje as "últimas trocas" são apenas km por componente em `perfil.moto.kmUltimaTrocas` (ver `bloco-moto.md` e TASK-RF-6.3.2). Reescrita completa programada na **TASK-DOC-009** (Strict).
> Mantido apenas para referência histórica enquanto a TASK-DOC-009 não roda.

---

# Histórico de Manutenção

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario` agregador de cinco listas de registros.
> **Implementação:** `perfil.historicoManutencao` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que armazena **eventos passados de manutenção** que o Motoboy registrou. É o "diário de manutenção" da moto: cada troca de óleo, cada revisão, cada pneu novo, cada abastecimento.

🔍 **Análise Profunda Para que serve no domínio:**

1. **Histórico para o Motoboy:** consultar quando foi a última troca de óleo, quanto pagou
2. **Base para cálculos personalizados:** em `modoExibicao === 'personalizado'`, médias dos registros entram nas fórmulas (substituindo Preset JSON quando há dados)
3. **Cálculo de intervalos reais:** quanto tempo realmente durou o pneu na realidade do Motoboy
4. **Alertas de manutenção:** "última troca foi em X km, próxima em Y"

⚠️ **Distinção crítica para evitar confusão:**

- `historicoManutencao` = **eventos passados** (cada troca específica, datada)
- `pecasOverrides` = **regras atuais** (preço médio que o Motoboy considera)

Os dois alimentam o cálculo personalizado, mas com semânticas diferentes.

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

historicoManutencao: {
  trocasOleo: TrocaOleo[];
  revisoes: RevisaoGeral[];
  trocasPneu: TrocaPneu[];
  trocasKitRelacao: TrocaKitRelacao[];
  abastecimentos: Abastecimento[];
}
```

---

## Sub-Entidades

### `TrocaOleo`

```typescript
interface TrocaOleo {
  id: string;
  data: string; // ISO 8601
  km: number; // odômetro no momento da troca
  valorTotal: number;
  tipoOleo: string; // ex: "10W30"
  marca: string; // ex: "Mobil"
}
```

### `RevisaoGeral`

```typescript
interface RevisaoGeral {
  id: string;
  data: string;
  km: number;
  local: 'autorizada' | 'independente';
  qualRevisao: string; // "1ª Revisão", "2ª Revisão", etc
  status: 'concluido' | 'pendente';
  itensTrocados: string[]; // lista livre
  valorMaoDeObra: number;
  valorPecas: number;
  valorTotal: number;
}
```

⚠️ **Divergência crítica documentada:**

- **Código atual:** `status: 'concluido' | 'pendente'` (2 valores)
- **Requisitos v6:** "Badge de status (CONCLUÍDO / EM DIA / PRÓXIMO)" → 3 estados (RF-REG-05)
- **Item A12 do checklist:** confirma a divergência

Esta é a divergência real do A12 não entre dois tipos, mas entre **código e requisitos** para `RevisaoGeral.status`. Registrada em `divida-tecnica.md` (DT-2 corrigida).

### `TrocaPneu`

```typescript
interface TrocaPneu {
  id: string;
  data: string;
  km: number;
  posicao: 'dianteiro' | 'traseiro';
  marca: string;
  valorTotal: number;
}
```

### `TrocaKitRelacao`

```typescript
interface TrocaKitRelacao {
  id: string;
  data: string;
  km: number;
  marca: string;
  valorPecas: number;
  valorMaoDeObra: number;
  valorTotal: number; // somatório dos dois acima
}
```

⚠️ **Redundância semântica:** `valorTotal === valorPecas + valorMaoDeObra`. Pode-se calcular ao invés de armazenar mas armazenado oferece performance e consistência se cálculo evoluir.

### `Abastecimento`

```typescript
interface Abastecimento {
  id: string;
  data: string;
  tipo: TipoCombustivel; // 'comum' | 'aditivada' | 'etanol'
  posto: string; // texto livre
  km: number;
  litros: number;
  precoLitro: number;
  valorTotal: number; // litros × precoLitro
}
```

---

## Comportamentos (Actions do Reducer)

| Action                     | Comportamento                      |
| -------------------------- | ---------------------------------- |
| `ADD_TROCA_OLEO`           | Adiciona registro de troca de óleo |
| `DELETE_TROCA_OLEO`        | Remove registro por id             |
| `ADD_REVISAO`              | Adiciona registro de revisão       |
| `DELETE_REVISAO`           | Remove registro por id             |
| `ADD_TROCA_PNEU`           | Adiciona registro de pneu          |
| `DELETE_TROCA_PNEU`        | Remove registro por id             |
| `ADD_TROCA_KIT_RELACAO`    | Adiciona registro de kit           |
| `DELETE_TROCA_KIT_RELACAO` | Remove registro por id             |
| `ADD_ABASTECIMENTO`        | Adiciona registro de abastecimento |
| `DELETE_ABASTECIMENTO`     | Remove registro por id             |

⚠️ **Observação:** **não há actions de EDIT**. Para corrigir um registro errado, deletar e recriar. Possível dívida técnica de UX (RF-REG-12 dos Requisitos diz que pode editar, mas Actions não preveem).

**Efeito colateral importante:** toda action `ADD_*`

- atualiza `moto.kmAtual` com `Math.max(kmAtual, registro.km)`
- seta `configuracaoDisplay.modoExibicao` para `'personalizado'`

---

## Adapter para Cálculos

`utils/calculos.ts` tem uma função-chave que **transforma o histórico em formato genérico** usado pelos cálculos:

```typescript
// utils/calculos.ts
export function adaptarHistoricoParaRegistros(
  historico: HistoricoManutencao,
): RegistroManutencao[] {
  // ...
}

interface RegistroManutencao {
  pecaId: string; // 'oleo_motor', 'pneu_dianteiro', 'kit_relacao', etc
  kmNaTroca: number;
  kmDesdeAnterior: number; // calculado: km - km da troca anterior
  preco: number;
}
```

🔍 **Análise:** Esta adaptação é importante porque:

1. Une listas heterogêneas **de peças e pneus** (`trocasOleo`, `trocasPneu`, `trocasKitRelacao`) em uma lista única homogênea
2. Calcula `kmDesdeAnterior` (intervalo real entre trocas consecutivas)
3. Mapeia para o `pecaId` que o sistema de cálculo entende
4. Pneus são separados por posição: `'pneu_dianteiro'` e `'pneu_traseiro'` viram pecaIds distintos

⚠️ **Observação importante:** revisões e abastecimentos **não** entram em `RegistroManutencao` eles são tratados em outros fluxos de cálculo.

---

## Como o Histórico Influencia os Cálculos

Em `modoExibicao === 'personalizado'`:

```typescript
// resolverIntervaloPeca
if (override?.intervaloKmEditado != null) return override.intervaloKmEditado;
const registrosPeca = registros.filter((r) => r.pecaId === pecaId);
if (registrosPeca.length >= 1) return media(registrosPeca.map((r) => r.kmDesdeAnterior));

// Fallback para Preset JSON

// resolverPrecoPeca (mesma lógica para preço)
```

🔍 **Análise:** Override sempre vence. Quando não há override, **basta 1 registro** (`>= 1`) para que a média deles substitua o Preset JSON.

⚠️ **Divergência com requisitos:** RF-REG-11 e RN-26 dos requisitos dizem "**Após 2+ registros**, intervalo médio é calculado e exibido como informação (não substitui automaticamente)". Mas o código `resolverIntervaloPeca` faz `>= 1` E **substitui automaticamente** no cálculo. **Divergência relevante.** Registrar.

---

## Invariantes

### INV-HIST-1: IDs únicos por lista

**Regra:** Dentro de cada lista (`trocasOleo`, `trocasPneu`, etc), os `id`s são únicos.

**Onde é protegida:** geração de id via `nanoid` (atomicamente único) na criação.

### INV-HIST-2: kmAtual monotônico crescente

**Regra:** ao adicionar registro, `moto.kmAtual` é atualizado com `Math.max(kmAtual, registro.km)`.

**Onde é protegida:** reducer em `PerfilContext.tsx` (todas as actions `ADD_*`).

**Observação:** isso permite registrar eventos com km maior que o atual, sem rejeição.

### INV-HIST-3: data não futura

**Regra:** `registro.data <= hoje`. Não há sentido em registrar manutenção futura.

**Onde é protegida:** ⚠️ **Verificar.** Provavelmente date picker da UI limita.

### INV-HIST-4: valorTotal coerente com componentes (em RevisaoGeral e TrocaKitRelacao)

**Regra:** `valorTotal === valorPecas + valorMaoDeObra` (com possível tolerância de centavos).

**Onde é protegida:** lógica de criação no formulário (calcula automaticamente).

### INV-HIST-5: posicao válida em TrocaPneu

**Regra:** `posicao ∈ {'dianteiro', 'traseiro'}`.

**Onde é protegida:** sistema de tipos.

### INV-HIST-6: kmDesdeAnterior monotônico crescente nos registros adaptados

**Regra:** Para cada `pecaId`, ao adaptar a lista para `RegistroManutencao[]`, os registros devem estar ordenados por `kmNaTroca` ascendente, e `kmDesdeAnterior` = `kmNaTroca - kmTrocaAnterior` (primeiro registro: `kmDesdeAnterior = kmNaTroca`).

**Onde é protegida:** `adaptarHistoricoParaRegistros` ordena com `.sort((a, b) => a.km - b.km)`.

---

## Cenários Práticos

### Cenário 1: Primeira troca de óleo registrada

- Motoboy roda 1500 km, troca o óleo, registra no app
- `ADD_TROCA_OLEO` cria entrada com `km: 1500`, `kmDesdeAnterior` (no adapter) = 1500
- Em modo personalizado, cálculo de CPK do óleo passa a usar **esse único registro** como base de intervalo (1500km) possivelmente errôneo se ainda for primeira troca

⚠️ Este é o problema da divergência `>= 1` vs `>= 2`. Com `>= 2`, este cenário ainda usaria o Preset JSON.

### Cenário 2: Pneu dianteiro vs traseiro

- Motoboy troca apenas o traseiro (km 8000)
- `ADD_TROCA_PNEU` com `posicao: 'traseiro'`, `km: 8000`
- No adapter, vira `pecaId: 'pneu_traseiro'`, `kmDesdeAnterior: 8000`
- O `pneu_dianteiro` permanece com Preset JSON ou override próprio (não foi tocado)

### Cenário 3: Apagar tudo

- `RESETAR_PERFIL` apaga todo o `historicoManutencao` junto com o resto do perfil

---

## Pontos de Atenção

### Sem ações de edição

Atualmente só `ADD` e `DELETE`. Para editar, deletar e recriar. RF-REG-12 dos requisitos pede edição. **Dívida técnica de funcionalidade.**

### Histórico cresce indefinidamente

Sem mecanismo de arquivamento. Motoboy ativo por anos = lista enorme. **Não é problema agora**, mas considerar (compactação JSON, IndexedDB, paginação) quando virar problema.

### Status de RevisaoGeral divergente dos requisitos

Documentado em `divida-tecnica.md` DT-2.

### Substituição automática no cálculo

Divergência `>= 1` (código) vs `>= 5` (RN-25 para diário) e `>= 2` (RN-26 para manutenção). **Registrar.**

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` `HistoricoManutencao` e todas as 5 sub-entidades
- `src/utils/calculos.ts` `adaptarHistoricoParaRegistros`, `resolverIntervaloPeca`, `resolverPrecoPeca`
- `Requisitos v6` Seção V.4, V.5, RN-25, RN-26, RF-REG-11, RF-REG-12

**Divergências encontradas:**

- `RevisaoGeral.status`: código tem 2 estados, requisitos pedem 3 (DT-2)
- `resolverIntervaloPeca` substitui automaticamente com `>= 1` registro, mas RN-26 pede `>= 2` apenas como informação. **Divergência de comportamento.** Registrar.
- Sem actions de EDIT. **Dívida técnica de funcionalidade.**

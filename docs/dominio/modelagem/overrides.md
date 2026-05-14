# Sistema de Overrides

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Conceito arquitetural fundamental + 3 estruturas em `PerfilUsuario`.
> **Implementação:** `pecasOverrides`, `servicosMaoDeObra`, `revisaoAutorizadaOverrides` em `src/types/perfil.ts`. Lógica de resolução em `src/utils/calculos.ts`.

---

## Conceito no Mundo Real

O Sistema de Overrides é **a forma pela qual o Motoboy personaliza valores sem alterar os Presets JSON**. Quando ele edita "preço do óleo" no app de R$ 30 para R$ 35 (porque na oficina dele é mais caro), o app **não modifica o JSON `pop110i.json`** ele cria um Override no `PerfilUsuario`.

🔍 **Análise Profunda Por que existir o sistema:**
Se o app modificasse os JSONs diretamente, três problemas surgiriam:

1. **Os JSONs vêm com o build** modificar em runtime não persiste entre versões do app
2. **Múltiplos Motoboys do mesmo modelo** teriam dados misturados se os JSONs servissem como "verdade modificável"
3. **Reset (↺)** seria impossível não haveria valor de referência para voltar

A solução: **JSONs imutáveis (RN-01) + camada de Overrides no perfil (RN-02)**. O sistema lê o Override quando existe, cai no JSON quando não. Reset apaga o Override.

---

## As Três Estruturas de Override

### 1. `pecasOverrides[]` Overrides por Peça

```typescript
interface PecaOverride {
  id: string; // mesmo id da peça/pneu no Preset JSON
  precoEditado: number | null; // null = sem override de preço
  intervaloKmEditado: number | null; // null = sem override de intervalo
  perfilPecasOverride: PerfilPecas | null; // null = usa perfilPecasGlobal
}
```

**Cobre:** preço, intervalo de troca, e perfil (original/paralela) **por peça individual** ou pneu.

**Exemplo:**

```typescript
pecasOverrides: [
  {
    id: 'oleo_motor',
    precoEditado: 35.0, // Motoboy editou: R$ 35 (preset diz 30)
    intervaloKmEditado: null, // intervalo padrão
    perfilPecasOverride: null, // segue o global
  },
  {
    id: 'pneu_traseiro',
    precoEditado: null, // preço padrão
    intervaloKmEditado: 8000, // Motoboy disse: dura 8000km na minha realidade
    perfilPecasOverride: 'paralela', // global é "original" mas pneu é paralelo
  },
];
```

🔍 **Granularidade tristate:** cada campo é `null` ou valor concreto. `null` significa "sem override, use o JSON". Não há `false` ou `undefined` só `null` ou número/enum.

### 2. `servicosMaoDeObra` Overrides de Mão de Obra

```typescript
interface ServicosMaoDeObra {
  trocaOleo: number;
  trocaKitTransmissao: number;
  trocaPneu: number;
  revisaoGeral: number;
  avulso: number;
}
```

**Cobre:** preço de mão de obra de 5 tipos de serviço.

⚠️ **Diferença importante:** ao contrário de `pecasOverrides[]`, **não tem `null`** aqui. O perfil **sempre** tem valores numéricos para os 5 serviços. Não há "sem override" há "valor padrão" (que vem do Onboarding).

🔍 **Análise:** isso é uma decisão arquitetural diferente do `pecasOverrides`. Aqui não existe Preset JSON com valores de mão de obra (pelo menos não estruturado igual). Os valores **só** vivem no perfil. Reset volta para um padrão hardcoded? Confirmar implementação.

### 3. `revisaoAutorizadaOverrides[]` Overrides de Revisão

```typescript
interface RevisaoAutorizadaOverride {
  index: number; // índice no array preset.revisaoAutorizada
  precoTotal: number; // valor customizado
}
```

**Cobre:** preço total de revisões na concessionária autorizada (1ª revisão, 2ª revisão, etc).

**Exemplo:**

```typescript
revisaoAutorizadaOverrides: [
  { index: 0, precoTotal: 280 }, // 1ª revisão: Motoboy edita para R$ 280
  // index 1, 2, 3... continuam usando preset
];
```

🔍 **Análise:** estrutura por índice é **frágil** se o Preset JSON adicionar/remover linhas de revisão, os índices ficam desalinhados. Possível dívida técnica.

---

## Lógica de Resolução

A "magia" do sistema acontece em duas funções de `utils/calculos.ts`:

### `resolverPrecoPeca`

```typescript
function resolverPrecoPeca(pecaId, preset, perfilPecas, registros, modoExibicao, pecasOverrides) {
  const override = pecasOverrides.find((o) => o.id === pecaId);

  if (modoExibicao === 'personalizado') {
    // 1. Override explícito vence
    if (override?.precoEditado != null) return override.precoEditado;

    // 2. Média dos registros reais (se houver)
    const registrosPeca = registros.filter((r) => r.pecaId === pecaId);
    if (registrosPeca.length >= 1) return media(registrosPeca.map((r) => r.preco));
  }

  // 3. Cai no Preset JSON
  const perfilEfetivo =
    modoExibicao === 'personalizado' ? (override?.perfilPecasOverride ?? perfilPecas) : perfilPecas;
  // ... lê do preset segundo o perfilEfetivo (original ou paralela)
}
```

🔍 **Análise três fontes de verdade em ordem de prioridade:**

1. **Override explícito** (Motoboy digitou um valor)
2. **Média dos registros reais** (Motoboy comprou peças e registrou sistema deduz)
3. **Preset JSON** (fallback)

### `resolverIntervaloPeca`

Mesma lógica, aplicada ao intervalo de troca:

1. Override explícito → 2. Média de `kmDesdeAnterior` dos registros → 3. Preset JSON (`intervaloKmEntrega` se `perfilUso === 'entrega'`, senão `intervaloKm`)

---

## Comportamentos (Actions do Reducer)

| Action                              | Comportamento                                                   |
| ----------------------------------- | --------------------------------------------------------------- |
| `SET_PECA_OVERRIDE`                 | Define um override de peça (preço, intervalo ou perfil)         |
| `RESET_PECA_OVERRIDE`               | Apaga override (campo específico ou todos) volta ao Preset JSON |
| `SET_SERVICO_MAO_DE_OBRA`           | Atualiza preço de um serviço de mão de obra                     |
| `RESET_SERVICO_MAO_DE_OBRA`         | Reset um serviço volta ao padrão (hardcoded? confirmar)         |
| `SET_REVISAO_AUTORIZADA_OVERRIDE`   | Define override de uma linha de revisão                         |
| `RESET_REVISAO_AUTORIZADA_OVERRIDE` | Apaga override de uma linha volta ao Preset JSON                |

⚠️ **`RESET_PECA_OVERRIDE` é polimórfico:** com `campo` ele reseta só aquele atributo. Sem `campo`, reseta o override inteiro (todos os atributos).

---

## Invariantes

### INV-OVR-1: Override referencia Preset JSON existente

**Regra:** Para cada `PecaOverride.id` em `pecasOverrides`, deve existir uma peça ou pneu no Preset JSON com o mesmo `id`.

**Por quê:** Override órfão (sem peça correspondente) é dado morto. `find()` em `pecasOverrides` retornaria match mas `find()` no preset retornaria `undefined`.

**Onde é protegida:** ⚠️ **Não há validação automática.** Se o Preset JSON evolui e um id é removido, overrides ficam órfãos. **Dívida técnica.**

### INV-OVR-2: Modo `predefinidos` ignora overrides

**Regra:** `modoExibicao === 'predefinidos'` → todos os overrides são ignorados pelos cálculos.

**Onde é protegida:** lógica no início de `resolverPrecoPeca`, `resolverIntervaloPeca`. **Atenção:** `perfilPecasGlobal` ainda é respeitado mesmo em modo predefinidos (afeta qual coluna do JSON é lida `precoOriginal` vs `precoParalela`).

### INV-OVR-3: Reset isolado

**Regra:** `RESET_PECA_OVERRIDE` para um campo específico **só** afeta aquele campo. Outros overrides do mesmo `id` permanecem.

**Por quê:** RN-03 explicitamente: "O botão ↺ em qualquer campo apaga apenas o override daquele campo".

**Onde é protegida:** lógica do reducer (verificar implementação).

### INV-OVR-4: anoFimOriginal força paralela

**Regra:** Se a peça no Preset JSON tem `anoFimOriginal !== undefined` E `perfil.moto.ano > anoFimOriginal`, então `perfilEfetivo = 'paralela'` independente do override individual ou global. (RN-11)

**Por quê:** Original descontinuada não existe sistema não pode oferecer.

**Onde é protegida:** parece estar implementada na `resolverPerfilPeca` (mencionada nos requisitos, mas não vi snippet confirmar).

⚠️ **Regra não implementada no código atual.** Ela aparece nos requisitos, mas não existe em `utils/calculos.ts`.

### INV-OVR-5: ServicosMaoDeObra sempre completo

**Regra:** `servicosMaoDeObra` tem **sempre** as 5 chaves (`trocaOleo`, etc) com valor numérico. Não há `null` ou ausência.

**Onde é protegida:** sistema de tipos garante.

---

## Diferença Entre Override e Registro

⚠️ **Conceitualmente fácil de confundir:**

| Override                                           | Registro                                                    |
| -------------------------------------------------- | ----------------------------------------------------------- |
| "O preço médio do óleo na minha realidade é R$ 35" | "Em 2026-04-15, paguei R$ 38 numa troca de óleo no posto X" |
| Vive em `pecasOverrides`                           | Vive em `historicoManutencao.trocasOleo`                    |
| Atemporal, é uma "regra"                           | Datado, é um "evento"                                       |
| Editado em telas de Mão de Obra / Autonomia        | Criado via formulário de Registro                           |

🔍 **Análise:** tanto Override quanto média de Registros são fontes de personalização. Em `modoExibicao === 'personalizado'`, ambos competem (override vence). Isso permite cenários:

- Motoboy quer **ditar** o valor → cria Override
- Motoboy quer **deixar o sistema deduzir** da prática → registra normal e o sistema faz a média

---

## Cenários Práticos

### Cenário 1: "Pneu paralelo dura mais que dizem"

- Motoboy compra pneu paralelo
- Vai em Autonomia, edita o `intervaloKmEditado` do `pneu_traseiro` para 8000
- Resultado: `pecasOverrides` ganha entrada com `id: 'pneu_traseiro'`, `intervaloKmEditado: 8000`
- Cálculo: CPK do pneu agora usa 8000km como base

### Cenário 2: "Voltei a usar peça original"

- Motoboy tinha `perfilPecasGlobal: 'paralela'`
- Decide voltar para original: muda em Mão de Obra → `perfilPecasGlobal: 'original'`
- Mas pneu específico ele mantém paralelo → `pecasOverrides` tem entrada com `perfilPecasOverride: 'paralela'` para `pneu_traseiro`
- Resultado: todas as peças usam original, exceto pneu traseiro

### Cenário 3: "Reset"

- Motoboy editou óleo, kit relação e pneu traseiro
- Decide voltar tudo ao padrão: clica ↺ em cada um
- Resultado: cada `RESET_PECA_OVERRIDE` apaga o override correspondente
- Após resetar todos, `pecasOverrides` fica `[]` (ou sem entradas para esses ids)

### Cenário 4: "Modo Predefinidos para comparar"

- Motoboy tem vários overrides ativos
- Quer ver "quanto seria sem minhas customizações"
- Alterna `modoExibicao` para `'predefinidos'`
- Cálculo ignora todos os overrides usa só Preset JSON
- Visualiza o "preço médio de mercado" sem perder os overrides
- Volta para `'personalizado'` → tudo retorna

---

## Pontos de Atenção

### Estrutura por índice em `revisaoAutorizadaOverrides`

Frágil se o Preset JSON adicionar/remover linhas. Migração precisa cuidar disso. **Dívida técnica.**

### Validação de orfãos

Não há mecanismo para limpar overrides cujos `id` não existem mais no Preset JSON (após mudança de schema). Pode acumular lixo. **Dívida técnica.**

### Relação com Diário e Histórico

Em modo `'personalizado'`, médias dos registros reais entram na fórmula. Isso significa que o comportamento do app muda automaticamente com o uso Motoboy registra mais → cálculo "personaliza" sozinho.

🔍 **Reflexão:** isso é poderoso mas pode confundir. "Por que o número mudou se eu não mudei nada?" porque um novo registro entrou e a média recalculou. **Considerar UX para tornar isso visível.**

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export interface PecaOverride {
  id: string;
  precoEditado: number | null;
  intervaloKmEditado: number | null;
  perfilPecasOverride: PerfilPecas | null;
}

export interface ServicosMaoDeObra {
  trocaOleo: number;
  trocaKitTransmissao: number;
  trocaPneu: number;
  revisaoGeral: number;
  avulso: number;
}

export interface RevisaoAutorizadaOverride {
  index: number;
  precoTotal: number;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` `PecaOverride`, `ServicosMaoDeObra`, `RevisaoAutorizadaOverride`
- `src/utils/calculos.ts` `resolverPrecoPeca`, `resolverIntervaloPeca`
- `Requisitos v6` RN-01 a RN-05, RN-10, RN-11
- `contexto-base.instructions.md`

**Divergências encontradas:**

- INV-OVR-1 (overrides órfãos) não parece protegida registrado como dívida técnica
- INV-OVR-4 (anoFimOriginal força paralela) mencionada nos requisitos mas não implementada no código atual
- Estrutura por índice em `revisaoAutorizadaOverrides` é frágil registrado como dívida técnica

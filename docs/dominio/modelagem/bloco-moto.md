# Bloco: Moto

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario` (não é entidade autônoma).
> **Implementação:** `perfil.moto` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **a motocicleta** dentro do Preset. Não é a Moto-modelo do catálogo (Honda Pop 110i 2024 em geral), nem o Preset JSON imutável é **a moto específica do Motoboy** com seus dados próprios (km atual, perfil de uso real).

⚠️ **Distinção importante:**

- **Preset JSON** (`src/presets/pop110i.json`): dados técnicos do modelo (consumo, peças, preços de referência). Imutável.
- **Bloco Moto** (`perfil.moto`): a moto desse Motoboy específico, com `marca`, `modelo` que apontam para qual JSON usar + dados pessoais (`kmAtual`, `kmUltimaRevisao`).

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

moto: {
  marca: string;
  modelo: string;
  ano: number;
  perfilUso: PerfilUso; // 'entrega' | 'passageiro'
  kmAtual: number;
  kmUltimaRevisao: number | null;
}
```

| Atributo          | Tipo             | Descrição                                                                                                      | Origem                                                        |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `marca`           | string           | Fabricante. Ex: `"Honda"`, `"Yamaha"`                                                                          | Onboarding P1                                                 |
| `modelo`          | string           | Identificador do modelo. Ex: `"pop110i"`, `"cg_titan160"`. **Aponta para o nome do arquivo em `src/presets/`** | Onboarding P2                                                 |
| `ano`             | number           | Ano de fabricação                                                                                              | Onboarding P3                                                 |
| `perfilUso`       | `PerfilUso`      | `'entrega'` (com baú) ou `'passageiro'` (Uber Moto)                                                            | Onboarding P4                                                 |
| `kmAtual`         | number           | Quilometragem atual do hodômetro                                                                               | Onboarding P5 + atualizado pelos Registros de Rodagem (RN-24) |
| `kmUltimaRevisao` | `number \| null` | KM da última revisão. `null` se Motoboy não soube informar                                                     | Onboarding P5                                                 |

---

## Atualização do `kmAtual`

Este atributo é **dinamicamente atualizado** após cada Registro de Rodagem segundo a regra:

```typescript
// Conceito do RN-24 (não código literal)
kmAtual = Math.max(kmAtual, novoRegistro.kmFinal);
```

O `Math.max` garante que `kmAtual` **nunca regrida** mesmo se o Motoboy registrar um dia com hodômetro em valor menor (ex: erro de digitação, foto antiga). Quilometragem só anda pra frente.

---

## Comportamentos (Actions do Reducer)

| Action                 | Comportamento                                | Quando dispara                                            |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------- |
| `SET_ONBOARDING_CAMPO` | Define qualquer campo durante o Onboarding   | Passos P1-P5                                              |
| `SET_KM_ATUAL`         | Atualiza km atual diretamente                | Tela Ajustes (manual) ou Registro de Rodagem (automático) |
| `COMMIT_ONBOARDING`    | Persiste pela primeira vez com tudo do bloco | Final do Onboarding                                       |

---

## Invariantes

### INV-MOTO-1: Modelo aponta para Preset JSON existente

**Regra:** `perfil.moto.modelo` deve corresponder a um arquivo `.json` em `src/presets/`. Modelo sem arquivo = cálculo inviável.

**Como é protegida:** o Onboarding P2 só lista modelos disponíveis (catálogo). O usuário não consegue escolher modelo sem preset.

⚠️ **Risco:** se um Preset JSON for removido entre versões do app, Motoboys com aquele modelo cadastrado terão erro. **Não há mecanismo de migração**. Registrar como dívida técnica se acontecer.

### INV-MOTO-2: kmAtual monotônico crescente

**Regra:** `kmAtual` nunca decresce. Implementada via `Math.max` no reducer.

**Por quê:** quilometragem real de uma moto não diminui (não há rebobinagem física). Decréscimo seria sempre erro de input.

**Onde é protegida:** reducer da action `SET_KM_ATUAL` aplica `Math.max(estado.moto.kmAtual, novoValor)`.

⚠️ **Atenção para Ajustes:** se o Motoboy explicitamente quiser corrigir um valor errado **maior** para um menor (ex: digitou `30000` em vez de `3000`), a invariante impede. Hoje, a única saída é "Apagar Tudo" e refazer. **Possível dívida técnica:** considerar action de "correção forçada" com confirmação.

### INV-MOTO-3: Ano plausível

**Regra:** `1980 <= ano <= anoAtual + 1`.

**Por quê:** motos do RJ não são de 1950 nem do futuro. Ano fora do plausível indica erro de input.

**Onde é protegida:** dropdown do P3 do Onboarding limita as opções. Tela Ajustes idem.

### INV-MOTO-4: kmUltimaRevisao consistente

**Regra:** Se `kmUltimaRevisao !== null`, então `kmUltimaRevisao <= kmAtual`. Não faz sentido uma revisão futura.

**Onde é protegida:** validação no input. **Verificar no código se está garantida** pode estar como dívida técnica de validação.

### INV-MOTO-5: Marca e Modelo consistentes

**Regra:** O Motoboy não pode ter `marca: "Yamaha"` com `modelo: "pop110i"`. Marca e modelo são acoplados.

**Onde é protegida:** Onboarding P1 filtra modelos por marca em P2.

---

## Relacionamentos

```
PerfilUsuario.moto
├── marca/modelo → referencia src/presets/{modelo}.json (Preset JSON)
├── ano → afeta cálculo de IPVA (isenção em moto ≥ 15 anos no RJ)
├── perfilUso → afeta cálculo de combustível (consumoKmL vs consumoKmLComBau)
├── kmAtual → entra em vários cálculos (alertas, intervalos)
└── kmUltimaRevisao → base para calcularKmParaProximaRevisao()
```

---

## Eventos Relacionados

- `MotoCadastrada` disparado por `COMMIT_ONBOARDING`
- `KmAtualizado` disparado por `SET_KM_ATUAL` (manual ou via registro)
- `MotoEditada` quando o Motoboy edita marca/modelo/ano em Ajustes (atualiza `atualizadoEm` do PresetEntry e invalida FipeCache se marca/modelo mudou)

---

## Pontos de Atenção

### Trocar marca ou modelo invalida FIPE Cache

Se o Motoboy editar `marca` ou `modelo` em Ajustes, o `fipeCache` armazenado fica inconsistente (ver INV-FIPE-1 em `perfil-usuario.md`). O sistema deve detectar e re-consultar.

### Múltiplas motos = múltiplos Presets

O modelo atual **não suporta múltiplas motos no mesmo `PerfilUsuario`**. Para um Motoboy com 2 motos, a estratégia é criar 2 `PresetEntry` separados. Se vier requisito "comparar duas motos lado a lado", **chamar `modelador-dominio`** para repensar.

### Catálogo de modelos disponíveis

Lista de marcas + modelos suportados está implícita pelos arquivos em `src/presets/`. Não há um catálogo formal listado em código o Onboarding usa `import.meta.glob('../presets/*.json')` para descobrir (ver RNF-10). Adicionar moto nova = adicionar JSON novo. Zero código.

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export type PerfilUso = 'entrega' | 'passageiro';

// Dentro de PerfilUsuario:
moto: {
  marca: string;
  modelo: string;
  ano: number;
  perfilUso: PerfilUso;
  kmAtual: number;
  kmUltimaRevisao: number | null;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` bloco `moto` dentro de `PerfilUsuario`
- `Requisitos v6` RN-24 (atualização monotônica), RF-ON-01 a 05
- `contexto-base.instructions.md` convenções

**Divergências:** nenhuma estrutural. INV-MOTO-4 marcada como "verificar no código" possível dívida técnica de validação.

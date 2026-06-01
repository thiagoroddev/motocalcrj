# Aggregate: Perfil Local (Presets + Ativo)

> **Status:** Engenharia reversa baseada em codigo real.
> **Tipo:** Aggregate Root do armazenamento local.
> **Implementacao:** `EstadoApp` em `src/context/PerfilContext.tsx` + `IPerfilStorage`.

---

## Conceito no Mundo Real

O MotoCalc guarda **um conjunto de presets** e **qual deles esta ativo**. Este conjunto e o que o Motoboy enxerga como "meus perfis". Trocar o preset ativo muda imediatamente os calculos e a tela. Apagar tudo remove todos os presets e retorna ao estado pre-onboarding.

---

## Estrutura Real

```typescript
// src/context/PerfilContext.tsx

export interface EstadoApp {
  perfil: PerfilUsuario;
  presets: PresetEntry[];
  presetAtivoId: string | null;
}
```

Persistencia em duas chaves:

- `estimamoto:v1:presets` → `PresetEntry[]`
- `estimamoto:v1:presetAtivo` → `string | null`

---

## Por que e um Aggregate

Este aggregate garante invariantes que **dependem de mais de um objeto**:

- o preset ativo deve existir na lista de presets
- a persistencia so ocorre quando ha preset ativo
- carregar um preset deve atualizar o perfil inteiro em memoria

Sem esse aggregate, seria facil ter um `presetAtivoId` apontando para algo inexistente ou carregar um perfil parcial.

---

## Comportamentos (Actions do Reducer)

| Action              | Comportamento                                                                 |
| ------------------- | ----------------------------------------------------------------------------- |
| `COMMIT_ONBOARDING` | Cria o primeiro `PresetEntry`, define `presetAtivoId` e habilita persistencia |
| `CARREGAR_PERFIL`   | Troca o perfil ativo e atualiza `presetAtivoId`                               |
| `IMPORTAR_PERFIL`   | Cria novo preset importado e o torna ativo                                    |
| `RESETAR_PERFIL`    | Limpa presets e volta para `perfilPadrao`                                     |

**Observacao:** demais actions alteram o `PerfilUsuario` **dentro** do preset ativo. O helper `comPerfil()` atualiza `preset.atualizadoEm` e substitui `preset.perfil` no array.

---

## Invariantes

### INV-AGG-1: Preset ativo consistente

**Regra:** se `presetAtivoId !== null`, entao existe um `PresetEntry` em `presets[]` com esse `presetId`.

**Onde e protegida:**

- `criarEstadoInicial()` escolhe um preset valido
- `CARREGAR_PERFIL` recebe `presetId` valido do hook `usePerfil`

### INV-AGG-2: Persistencia condicional

**Regra:** so persistir quando `presetAtivoId` existe.

**Onde e protegida:** `useEffect` do `PerfilProvider` retorna se `presetAtivoId` for nulo.

### INV-AGG-3: Estado pre-onboarding e recuperação parcial

**Regra:** se nao ha presets, o app inicia com `perfilPadrao` e exige onboarding. Se ha presets validos mas a chave de ativo esta ausente, o app recupera selecionando `presets[0]`.

**Onde e protegida:** `criarEstadoInicial()` retorna `estadoPadrao` quando `presets.length === 0`; quando ha presets validos, migra/valida e usa `presets.find(presetAtivoId) ?? presets[0]`.

---

## Relacionamentos

```
Perfil Local (Aggregate Root)
├── presets: PresetEntry[]        ← aggregate-preset.md
└── presetAtivoId                 ← referencia ao PresetEntry ativo
```

---

## Validacao Contra Codigo Real

Documentacao validada contra:

- `src/context/PerfilContext.tsx` (`EstadoApp`, reducer, persistencia)
- `src/services/perfilStorage.ts` (chaves e persistencia)
- `src/types/perfil.ts` (`PresetEntry`, `PerfilUsuario`)

**Divergencias encontradas:** nenhuma estrutural.

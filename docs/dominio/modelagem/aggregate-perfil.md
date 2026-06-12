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
  rascunhoPredefinicao: RascunhoPredefinicao | null;
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
- o rascunho de uma nova predefinicao nunca sobrescreve o preset ativo anterior
- carregar um preset deve atualizar o perfil inteiro em memoria
- referências relacionais persistidas devem existir no preset canônico da moto

Sem esse aggregate, seria facil ter um `presetAtivoId` apontando para algo inexistente ou carregar um perfil parcial.

---

## Comportamentos (Actions do Reducer)

| Action              | Comportamento                                                                 |
| ------------------- | ----------------------------------------------------------------------------- |
| `INICIAR_NOVA_PREDEFINICAO` | Cria rascunho limpo e preserva a referência ao ativo anterior |
| `CANCELAR_NOVA_PREDEFINICAO` | Descarta o rascunho e restaura o ativo anterior |
| `COMMIT_ONBOARDING` | Cria um novo `PresetEntry`, define `presetAtivoId` e encerra o rascunho |
| `CARREGAR_PERFIL`   | Troca o perfil ativo e atualiza `presetAtivoId`                               |
| `RENOMEAR_PREDEFINICAO` | Atualiza sufixo e nome técnico, respeitando unicidade por modelo |
| `DELETAR_PREDEFINICAO` | Remove uma entrada não ativa; `perfil` e `presetAtivoId` ficam intactos |
| `IMPORTAR_PERFIL`   | Cria novo preset importado e o torna ativo                                    |
| `RESETAR_PERFIL`    | Limpa presets e volta para `perfilPadrao`                                     |

**Observacao:** demais actions alteram o `PerfilUsuario` dentro do preset ativo. Quando há rascunho,
`comPerfil()` atualiza somente o perfil transitório.

---

## Invariantes

### INV-AGG-1: Preset ativo consistente

**Regra:** se `presetAtivoId !== null`, entao existe um `PresetEntry` em `presets[]` com esse `presetId`.

**Onde e protegida:**

- `criarEstadoInicial()` escolhe um preset valido
- `CARREGAR_PERFIL` recebe apenas `presetId`; o reducer resolve o preset existente e ignora id ausente

### INV-AGG-2: Persistencia condicional

**Regra:** so persistir quando `presetAtivoId` existe e não há `rascunhoPredefinicao`.

**Onde e protegida:** `useEffect` do `PerfilProvider` retorna se `presetAtivoId` for nulo ou se há
rascunho.

### INV-AGG-3: Estado pre-onboarding e recuperação parcial

**Regra:** se nao ha presets, o app inicia com `perfilPadrao` e exige onboarding. Se ha presets validos mas a chave de ativo esta ausente, o app recupera selecionando `presets[0]`.

**Onde e protegida:** `criarEstadoInicial()` retorna `estadoPadrao` quando `presets.length === 0`; quando ha presets validos, valida e usa `presets.find(presetAtivoId) ?? presets[0]`.

### INV-AGG-4: Referências relacionais canônicas

**Regra:** antes da seleção do ativo, todos os `PresetEntry` válidos são normalizados contra o
preset resolvido por `perfil.moto.modelo`.

**Onde é protegida:** `normalizarPerfilContraPreset()` remove somente referências inexistentes. Se
houver limpeza, `criarEstadoInicial()` regrava a lista em best-effort; falha nessa escrita não
transforma dado válido em corrupção.

---

## Relacionamentos

```
Perfil Local (Aggregate Root)
├── presets: PresetEntry[]        ← aggregate-preset.md
├── presetAtivoId                 ← referencia ao PresetEntry ativo
└── rascunhoPredefinicao          ← metadados transitórios, nunca persistidos
```

---

## Validacao Contra Codigo Real

Documentacao validada contra:

- `src/context/PerfilContext.tsx` (`EstadoApp`, reducer, persistencia)
- `src/services/perfilStorage.ts` (chaves e persistencia)
- `src/types/perfil.ts` (`PresetEntry`, `PerfilUsuario`)

**Divergencias encontradas:** nenhuma estrutural.

# Entidade: PresetEntry

> **Status:** Engenharia reversa baseada em codigo real.
> **Tipo:** Entidade persistida no localStorage.
> **Implementacao:** `PresetEntry` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

O PresetEntry e a **pasta de configuracao** de um Motoboy. Cada preset guarda um PerfilUsuario completo e metadados (nome, datas). O app trabalha sempre com **um preset ativo** por vez.

---

## Estrutura Real

```typescript
export interface PresetEntry {
  presetId: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
}
```

---

## Identidade

A identidade e `presetId`. Dois presets com os mesmos dados mas IDs diferentes sao entidades distintas.

---

## Comportamentos (Actions do Reducer)

| Action              | Comportamento                                   |
| ------------------- | ----------------------------------------------- |
| `COMMIT_ONBOARDING` | Cria o primeiro preset                          |
| `CARREGAR_PERFIL`   | Troca o preset ativo (carrega perfil)           |
| `IMPORTAR_PERFIL`   | Cria preset a partir de arquivo e o torna ativo |
| `RESETAR_PERFIL`    | Remove todos os presets                         |

---

## Invariantes

### INV-PRESET-1: presetId unico

**Regra:** `presetId` deve ser unico dentro da lista de presets.

### INV-PRESET-2: datas em ISO

**Regra:** `criadoEm` e `atualizadoEm` devem estar em formato ISO 8601.

### INV-PRESET-3: nome legivel

**Regra:** `nome` nao deve ser vazio (usado na UI para identificacao).

---

## Relacionamentos

- O PresetEntry contem **um** `PerfilUsuario` completo.
- O aggregate de presets e descrito em `aggregate-perfil.md`.
- Presets tecnicos (JSON) sao diferentes e descritos no glossario.

---

## Validacao Contra Codigo Real

Documentacao validada contra:

- `src/types/perfil.ts` (`PresetEntry`)
- `src/context/PerfilContext.tsx` (criacao e atualizacao)
- `src/services/perfilStorage.ts` (persistencia)

**Divergencias encontradas:** nenhuma estrutural.

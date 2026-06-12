# Entidade: PresetEntry

> **Status:** Engenharia reversa baseada em codigo real.
> **Tipo:** Entidade persistida no localStorage.
> **Implementacao:** `PresetEntry` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

O PresetEntry e a **pasta de configuracao** do usuario. Cada entrada guarda um PerfilUsuario completo,
UUID, sufixo e datas. Pode haver varias entradas para o mesmo modelo.

---

## Estrutura Real

```typescript
export interface PresetEntry {
  presetId: string;
  nome: string;
  sufixo: string;
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
| `RENOMEAR_PREDEFINICAO` | Edita o sufixo e regenera o nome técnico   |
| `DELETAR_PREDEFINICAO` | Remove uma predefinição não ativa (rejeita ativa/inexistente/rascunho) |
| `IMPORTAR_PERFIL`   | Cria preset a partir de arquivo e o torna ativo |
| `RESETAR_PERFIL`    | Remove todos os presets                         |

---

## Invariantes

### INV-PRESET-1: presetId unico

**Regra:** `presetId` deve ser unico dentro da lista de presets.

### INV-PRESET-2: datas em ISO

**Regra:** `criadoEm` e `atualizadoEm` devem estar em formato ISO 8601.

### INV-PRESET-3: sufixo valido e unico por modelo

**Regra:** `sufixo` tem no maximo 15 caracteres e nao se repete no mesmo modelo. `nome` e derivado
como `<modeloId>_<sufixo>`.

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

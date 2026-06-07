# Entidade: Moto (bloco do PerfilUsuario)

> **Status:** Engenharia reversa baseada em codigo real.
> **Tipo:** Entidade aninhada (nao possui id proprio).
> **Implementacao:** `perfil.moto` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

A Moto representa **a motocicleta concreta do Motoboy** dentro de um Preset. Ela aponta para um modelo suportado (via `modelo`) e guarda dados pessoais como `kmAtual` e `kmUltimaRevisao`.

---

## Estrutura Real

```typescript
moto: {
  marca: string;
  modelo: string;
  ano: number;
  kmAtual: number;
  kmUltimaRevisao: number | null;
}
```

---

## Comportamentos (Actions do Reducer)

| Action                 | Comportamento                                           |
| ---------------------- | ------------------------------------------------------- |
| `SET_ONBOARDING_CAMPO` | Define campos durante o onboarding                      |
| `SET_KM_ATUAL`         | Atualiza km atual manualmente                           |
| `ADD_*` (registros)    | Atualiza `kmAtual` com `Math.max(kmAtual, registro.km)` |
| `COMMIT_ONBOARDING`    | Cria o preset inicial com os dados da moto              |

---

## Invariantes

### INV-MOTO-1: modelo valido

**Regra:** `moto.modelo` deve existir no catalogo de modelos (`src/data/catalogoModelos.ts`).

### INV-MOTO-2: kmAtual monotonicamente crescente

**Regra:** `kmAtual` nao pode reduzir; todos os registros atualizam usando `Math.max`.

### INV-MOTO-3: ano plausivel

**Regra:** `1980 <= ano <= anoAtual + 1`.

### INV-MOTO-4: kmUltimaRevisao coerente

**Regra:** se `kmUltimaRevisao !== null`, entao `kmUltimaRevisao <= kmAtual`.

---

## Relacionamentos

- `moto.modelo` referencia um preset tecnico em `src/presets/*.json`.
- `moto.ano` seleciona dados que variam por ano, como consumo e tabelas de revisão autorizada.
- Peças, pneus e serviços avulsos permanecem compartilhados entre os anos do mesmo modelo.

---

## Validacao Contra Codigo Real

Documentacao validada contra:

- `src/types/perfil.ts` (estrutura do bloco)
- `src/context/PerfilContext.tsx` (atualizacao de kmAtual)
- `src/data/catalogoModelos.ts` (modelos suportados)

**Divergencias encontradas:** nenhuma estrutural.

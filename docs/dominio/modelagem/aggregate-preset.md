# Aggregate Root: Preset (PresetEntry)

> **Status:** Engenharia reversa baseada em código real (`src/types/perfil.ts`).
> **Tipo:** Aggregate Root raiz do aggregate de dados persistidos.
> **Implementação:** `interface PresetEntry` em `src/types/perfil.ts`, persistido via `services/perfilStorage.ts` na chave `estimamoto:v1:presets`.
> **Última atualização:** 2026-05-31 (TASK-REF-30).

---

## Conceito no Mundo Real

O `PresetEntry` é **o envelope de uma "configuração completa de uso" do MotoCalc**. Cada Motoboy pode ter múltiplas configurações salvas (uma para a moto principal, outra para uma reserva, outra para simular cenários) e o app trabalha sempre com **uma delas ativa por vez**.

Pense num PresetEntry como uma "pasta de configuração nomeada". Dentro da pasta vivem **todos os dados** do Motoboy para aquela situação: qual moto é, como ele trabalha, custos financeiros, histórico, ajustes pessoais. Trocar de Preset é como abrir outra pasta com outra realidade do mesmo Motoboy.

---

## Por Que é o Aggregate Root

`PresetEntry` é a raiz porque:

1. **Persistência acontece no nível dele:** o `localStorage` armazena `PresetEntry[]`, não `PerfilUsuario` solto.
2. **Contém um `PerfilUsuario` inteiro:** que por sua vez contém todos os outros agregados (moto, financeiro, histórico).
3. **É o que tem identidade externa visível:** `presetId` é o identificador que o Motoboy usa para alternar Presets.
4. **Invariantes de consistência vivem nele:** o `presetAtivoId` no localStorage precisa apontar para um `PresetEntry.presetId` existente.

---

## Estrutura Real

```typescript
// src/types/perfil.ts

export interface PresetEntry {
  presetId: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
}
```

| Atributo       | Tipo            | Descrição                                                                        |
| -------------- | --------------- | -------------------------------------------------------------------------------- |
| `presetId`     | string          | Identificador único usado em `estimamoto:v1:presetAtivo` para apontar qual está ativo |
| `nome`         | string          | Nome amigável dado pelo Motoboy ("Honda Pop 2024", "Biz Reserva")                |
| `criadoEm`     | string (ISO)    | Data de criação do PresetEntry                                                   |
| `atualizadoEm` | string (ISO)    | Última modificação                                                               |
| `perfil`       | `PerfilUsuario` | Conteúdo completo todos os dados do Motoboy                                      |

⚠️ **Observação importante:** o `PerfilUsuario` é uma estrutura grande. Ele tem suas próprias entidades aninhadas (Moto, blocos financeiros, históricos, overrides). Ver `perfil-usuario.md` para detalhamento. Aqui só descrevemos o **envelope**.

---

## Persistência

### Chaves do localStorage

| Chave                  | Conteúdo                                     |
| ---------------------- | -------------------------------------------- |
| `estimamoto:v1:presets`     | Array `PresetEntry[]` em JSON                |
| `estimamoto:v1:presetAtivo` | String com o `presetId` do PresetEntry ativo |

### Acesso isolado

**Toda leitura/escrita passa por `src/services/perfilStorage.ts`** - interface `IPerfilStorage` implementada por `LocalStoragePerfilStorage`. Componentes, hooks e contexto **nunca** acessam `localStorage` diretamente. Regra de arquitetura crítica (RNF-LR-01 / INV-PRESET-3).

### Versionamento

O namespace atual é `estimamoto:v1:*`, criado pela TASK-REF-30 como baseline público inicial. Chaves antigas `motocalc:v5:*` são ignoradas. A versão real do schema vive em `perfil.schemaVersion` dentro de cada `PresetEntry` - atual: `1`.

---

## Comportamentos (Actions do Reducer)

`PresetEntry` é manipulado via reducer. As Actions disponíveis em `PerfilAction` que afetam o aggregate são:

| Action              | Comportamento                                                                        |
| ------------------- | ------------------------------------------------------------------------------------ |
| `COMMIT_ONBOARDING` | Cria o primeiro `PresetEntry` ao final do Onboarding e dispara primeira persistência |
| `CARREGAR_PERFIL`   | Carrega um `PresetEntry` existente como ativo (alternar entre Presets)               |
| `IMPORTAR_PERFIL`   | Substitui o ativo por um perfil importado de arquivo `.json`                         |
| `RESETAR_PERFIL`    | "Apagar Tudo" remove todos os Presets do storage                                     |

**As demais Actions do reducer modificam o `PerfilUsuario` dentro do PresetEntry ativo**, atualizando `atualizadoEm` e disparando re-persistência.

🔍 **Análise Profunda Modelo Idiomático React:**
A implementação via reducer é **modelo anêmico clássico em React**. Os comportamentos vivem nas branches do `case` do reducer, não como métodos de uma classe. Isto **não é falha** é o padrão idiomático do framework. Para fins de domínio, **o conjunto de Actions = conjunto de comportamentos permitidos no aggregate**.

---

## Invariantes

### INV-PRESET-1: Consistência do Preset Ativo

**Regra:** Se a chave `estimamoto:v1:presetAtivo` no localStorage tem valor, então existe um `PresetEntry` em `estimamoto:v1:presets` cujo `presetId` é igual a esse valor.

**Por quê:** Apontar para um Preset que não existe causa tela em branco ou erro ao tentar carregar. Esta é a invariante mais crítica do aggregate.

**Onde é protegida:**

- Reducer trata operações de remoção e mantém a consistência
- `criarEstadoInicial` recupera armazenamento parcial escolhendo `presets[0]` quando a chave ativa está ausente ou aponta para id inexistente
- `PerfilContext` tem guard `if (!estado.presetAtivoId) return` antes de persistir
- `useEffect` de persistência em `PerfilContext.tsx`

### INV-PRESET-2: Persistência Condicional ao Onboarding Completo

**Regra:** O `PresetEntry` só é persistido quando `onboardingConcluido === true` (atualizado pela action `COMMIT_ONBOARDING`).

**Por quê:** Dados parciais de Onboarding incompleto **não devem poluir o storage**. Se o Motoboy abandona o Passo 4, próxima abertura mostra Onboarding do zero, não estado bagunçado. (RF-ON-06)

**Onde é protegida:**

- `useEffect` de persistência em `PerfilContext.tsx` com guard
- Actions intermediárias do Onboarding (`SET_ONBOARDING_CAMPO`) **não disparam persistência**

### INV-PRESET-3: Acesso Isolado ao localStorage

**Regra:** Toda leitura/escrita em `localStorage` para Presets passa por `services/perfilStorage.ts`. Componentes, hooks e contexto **nunca** acessam `localStorage` diretamente para esta finalidade.

**Por quê:** Centralizar permite (a) trocar implementação no futuro (IndexedDB, sync com servidor), (b) garantir formato consistente, (c) controlar versionamento de schema. (RNF-LR-01)

**Validação:** `grep -r "localStorage" src/` deve retornar zero resultados fora de `src/services/perfilStorage.ts`.

### INV-PRESET-4: Imutabilidade do Preset JSON

**Regra:** Arquivos JSON em `src/presets/*.json` (`pop110i.json` etc.) **nunca** são modificados em runtime. Toda personalização vai para Overrides dentro do `PerfilUsuario`. (RN-01, RN-02)

**Onde é protegida:** convenção do projeto + listada como Proibição Absoluta no `contexto-base`.

---

## Snippet TypeScript (Real, do código)

```typescript
// src/types/perfil.ts

export interface PresetEntry {
  presetId: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
}

// Uso típico no localStorage:
// estimamoto:v1:presets    → JSON.stringify(PresetEntry[])
// estimamoto:v1:presetAtivo → string (presetId)
```

```typescript
// Acesso isolado em src/services/perfilStorage.ts (esquemático)

export interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(id: string): void;
  limpar(): void;
}

export class LocalStoragePerfilStorage implements IPerfilStorage {
  // implementação real lê/escreve em estimamoto:v1:*
}
```

---

## Relacionamentos

```
PresetEntry (Aggregate Root)
└── perfil: PerfilUsuario                 ← conteúdo completo (ver perfil-usuario.md)
    ├── moto                              ← bloco-moto.md
    ├── trabalho                          ← bloco-trabalho.md
    ├── perfilManutencao                  ← bloco-perfil-manutencao.md
    ├── financeiro                        ← bloco-financeiro.md
    ├── configuracaoDisplay               ← bloco-configuracao-display.md
    ├── pecasOverrides[]                  ← overrides.md
    ├── servicosIndependentes[]           ← overrides.md
    ├── revisaoAutorizadaOverrides[]      ← overrides.md
    └── fipeCache                         ← perfil-usuario.md
```

⚠️ **Importante:** `PerfilUsuario` **não tem `presets[]`** dentro dele esta é uma confusão fácil de cometer. A lista de Presets vive **fora**, no localStorage como `PresetEntry[]`. Cada `PresetEntry` contém **um único `PerfilUsuario`**.

---

## Eventos Relacionados

Eventos de domínio (não implementados como event bus, mas representam o que acontece):

- `OnboardingFinalizado` disparado por `COMMIT_ONBOARDING`. Único momento da primeira persistência.
- `PresetAtivoTrocado` disparado por `CARREGAR_PERFIL`. Cálculos exibidos mudam.
- `PresetImportado` disparado por `IMPORTAR_PERFIL`. Atenção: pode envolver migração de schema.
- `PerfilResetado` disparado por `RESETAR_PERFIL`. Volta ao estado pré-Onboarding (e o Onboarding é exibido novamente).

⚠️ **Não confundir com eventos React/Redux.** Aqui são **eventos de domínio** algo significativo aconteceu na vida do Motoboy, independente de como o React os trata internamente.

---

## Pontos de Atenção para Evolução Futura

### Multi-perfil V2 com login (RNF-LR-02)

O `PerfilUsuario` já tem campo `userId: string | null`. Em V1 sempre `null`; em V2 receberá UUID do backend. **Não é necessária mudança estrutural** no aggregate para suportar isso apenas popular o campo.

### Sincronização com servidor (V2)

Invariantes de consistência local podem se quebrar se houver merge com dados remotos. **Repensar invariantes** quando V2 entrar (especialmente INV-PRESET-1 com possível race condition entre dispositivos).

### Schema migration (RNF-LR-06)

Pré-lançamento não preserva versões antigas: schema diferente da versão atual é rejeitado com fallback recuperável. Criar migração explícita apenas depois de haver dado real a preservar.

### Compactação do storage

Cada `PresetEntry` carrega histórico completo. Para Motoboy ativo por anos, pode crescer demais. Estratégias futuras: arquivamento de histórico antigo, compressão JSON, migração para IndexedDB. **Não é problema agora**, mas considerar quando crescer.

---

## Validação Contra Código Real

Esta documentação foi validada contra:

- `src/types/perfil.ts` estrutura `PresetEntry` e `PerfilUsuario`
- `src/types/perfil.ts` type `PerfilAction` (lista de comportamentos)
- `docs/Requisitos_MotoCalc_RJ_v6.md` RN-01, RF-ON-06, RNF-LR-01/02/06
- `contexto-base.instructions.md` chaves do localStorage, regras críticas

**Divergências encontradas:** nenhuma. Documentação fiel ao código.

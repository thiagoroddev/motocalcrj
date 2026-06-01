# MotoCalc RJ - Estado Inicial e Arquitetura de Persistência

> **Status:** Engenharia reversa validada contra código real.
> **Última atualização:** 2026-05-31 (TASK-REF-30).
> **Verdade primária:** `src/context/PerfilContext.tsx` (`perfilPadrao`, reducer, validação de carga) e `src/services/perfilStorage.ts` (acesso ao localStorage).
> **Schema atual:** v1 (baseline público inicial; histórico pré-lançamento descartado).

---

## I - Modelo de Persistência: Um Perfil Local com Múltiplas Predefinições

O app não tem login em V1. Existe **um perfil local** e **vários presets** (configurações nomeadas) salvos no `localStorage`. Um motoboy pode ter "Honda Pop Trabalho" e "Biz Reserva" como presets distintos, com o app trabalhando sempre **com um deles ativo por vez**.

### I.1 - Chaves do localStorage

Centralizadas em `src/services/perfilStorage.ts` (acesso isolado - INV-PRESET-3).

| Chave                     | Tipo                   | Conteúdo                                        |
| ------------------------- | ---------------------- | ----------------------------------------------- |
| `estimamoto:v1:presets`     | `PresetEntry[]` (JSON) | Array com todas as predefinições salvas         |
| `estimamoto:v1:presetAtivo` | `string`               | `presetId` do preset atualmente ativo           |

> **Nota pré-lançamento:** a TASK-REF-30 zerou o contrato de storage. Chaves antigas `motocalc:v5:*` são ignoradas; dados inválidos ou de schema diferente caem no fallback recuperável.

### I.2 - Envelope: `PresetEntry`

Não pertence ao `PerfilUsuario` - é o **wrapper** com metadados de identidade do preset:

```typescript
// src/types/perfil.ts
export interface PresetEntry {
  presetId: string;     // crypto.randomUUID() gerado em COMMIT_ONBOARDING
  nome: string;         // ex: "Honda pop110i 2024"
  criadoEm: string;     // ISO 8601
  atualizadoEm: string; // ISO 8601, atualizado a cada dispatch que toca o perfil
  perfil: PerfilUsuario;
}
```

`presetId` ≠ `perfil.userId`. O primeiro é local; o segundo é reservado para auth V2 e sempre `null` em V1.

### I.3 - Fluxo de Abertura do App

1. `PerfilProvider` (lazy init em `PerfilContext.tsx`) lê do storage via `LocalStoragePerfilStorage`.
2. Reconstrói `EstadoApp = { perfil, presets, presetAtivoId }`.
3. Valida cada `PresetEntry` com `presetEntrySchema`; não há migração histórica pré-lançamento.
4. Se a chave de ativo estiver ausente mas houver presets válidos, seleciona `presets[0]` como recuperação; se não há preset recuperável OU `perfil.onboardingConcluido === false` → `RotaProtegida` redireciona para `/onboarding/1`.
5. Caso contrário, renderiza app com `perfil` ativo.

---

## II - `perfilPadrao` (estado pré-onboarding)

O objeto inicial criado quando o usuário começa um onboarding novo. Valores reais em `src/context/PerfilContext.tsx`:

```typescript
export const perfilPadrao: PerfilUsuario = {
  schemaVersion: 1,
  userId: null,
  onboardingConcluido: false,
  apelido: null,
  aplicativos: [],

  moto: {
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    perfilUso: 'entrega',
    kmAtual: 0,
    kmUltimaRevisao: null,
    kmUltimaTrocas: {
      oleo: 0,
      pneuDianteiro: 0,
      pneuTraseiro: 0,
      kitRelacao: 0,
      velaIgnicao: 0,
      filtroAr: 0,
      sapataFreioDianteiro: 0,
      sapataFreioTraseiro: 0,
      bateria: 0,
      kitEmbreagem: 0,
      kitCilindro: 0,
      retificaCabecote: 0,
      retificaCompleta: 0,
    },
    kmMotorRefeito: null,
  },

  perfilManutencao: {
    perfilPecasGlobal: 'original',
    modoRevisao: 'independentes',
  },

  trabalho: {
    kmPorDia: 70,
    diasPorSemana: 5,
    horasPorDia: 8,
  },

  financeiro: {
    tipoGasolinaPreferida: 'comum',
    combustiveis: {
      comum:     { preco: 6.61, autonomia: 36 },
      aditivada: { preco: 6.99, autonomia: 36 },
      etanol:    { preco: 4.29, autonomia: 28 },
    },
    internet: 0,
    seguro: {
      valorAnual: 0,                 // presença derivada de > 0 (REF-21 / ADR-005)
      empresa: null,
      periodicidade: 'anual',
    },
    situacaoMoto: 'quitada',
    parcelaMensal: null,
    parcelasRestantes: null,
    dataReferenciaParcelas: null,        // mês ISO do snapshot de parcelas (ADR-009)
    aluguelMensal: null,
    aluguelPeriodicidade: null,
    alimentacaoDia: 20,
    gastosCustom: PRESETS_GASTOS_PADRAO,  // ver II.1
    responsabilidadeAluguel: {
      documentos: 'eu',
      manutencao: 'eu',
      seguro:     'eu',
    },
  },

  configuracaoDisplay: {
    categoriasAtivas: {
      combustivel:   true,
      alimentacao:   true,
      manutencao:    true,
      documentacao:  true,
      internet:      false,  // ativada por COMMIT_ONBOARDING se > 0
      seguro:        false,  // ativada se valorAnual > 0
      financiamento: false,  // ativada se situacaoMoto !== 'quitada'
      imprevistos:   true,
    },
    imprevistosSugeridosAtivos: {},  // toggle por id; padrão = false implícito
    filtrosManutencao: {
      revisao: true,
      manutencaoPorPeca: {},   // default-on; false explícito desativa
      revisaoPorServico: {},   // default-on; false explícito desativa
    },
  },

  pecasOverrides: [],
  servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO,  // ver II.2
  revisaoAutorizadaOverrides: [],
  fipeCache: null,
};
```

### II.1 - `PRESETS_GASTOS_PADRAO` (lista fechada de imprevistos)

Definida em `PerfilContext.tsx`. Lista fechada pela TASK-RF-6.9 (ADR-003/ADR-006): usuário **edita** valor e toggle, **não adiciona/remove** itens.

```typescript
export const PRESETS_GASTOS_PADRAO: GastoCustom[] = [
  { id: 'preset-multa',    nome: 'Multa',     valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-sinistro', nome: 'Sinistros', valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-outros',   nome: 'Outros',    valorAnual: 0, ativo: false, ehPreset: true },
];
```

### II.2 - `SERVICOS_INDEPENDENTES_PADRAO` (9 serviços, defaults RJ)

Definida em `PerfilContext.tsx`. Sete normais (`ativo: true`) e duas retíficas excepcionais (`ehExcepcional: true, ativo: false`). Os excepcionais só aparecem na seção Imprevistos do Detalhamento, desligados por padrão.

| `id`                    | `nome`                         | `intervalKm` | `precoMaoDeObra` | `ativo` | `ehExcepcional` |
| ----------------------- | ------------------------------ | ------------ | ---------------- | ------- | --------------- |
| `troca-oleo`            | Troca de óleo                  | 3000         | 25               | true    | false           |
| `troca-kit-transmissao` | Troca kit transmissão          | 12000        | 60               | true    | false           |
| `troca-pneu-dianteiro`  | Troca pneu dianteiro           | 25000        | 30               | true    | false           |
| `troca-pneu-traseiro`   | Troca pneu traseiro            | 15000        | 30               | true    | false           |
| `revisao-geral`         | Revisão geral (independente)   | 6000         | 80               | true    | false           |
| `troca-vela`            | Troca de vela                  | 6000         | 15               | true    | false           |
| `troca-filtro-ar`       | Troca filtro de ar             | 6000         | 15               | true    | false           |
| `retifica-cabecote`     | Retífica de cabeçote           | 80000        | 800              | false   | true            |
| `retifica-completa`     | Retífica completa              | 120000       | 1500             | false   | true            |

> No modo `independentes`, cada `ServicoIndependente.intervalKm` também é a **fonte canônica do intervalo da peça correspondente** (ADR-004 + TASK-REF-12) - `resolverIntervaloPeca` vincula peça e serviço pelo `MAPA_PECA_PARA_SERVICO` em `calculos.ts` (`oleo_motor` ↔ `troca-oleo`).

---

## III - `EstadoApp` (estado de runtime)

`PerfilContext` mantém este shape no `useReducer`:

```typescript
export interface EstadoApp {
  perfil: PerfilUsuario;       // sempre o do preset ativo (ou perfilPadrao se nenhum)
  presets: PresetEntry[];
  presetAtivoId: string | null;
}
```

O helper interno `comPerfil(novoPerfil)` do reducer mantém `perfil` e `presets[].find(presetAtivoId).perfil` **sempre em sincronia** numa mesma operação (sem janela de inconsistência).

---

## IV - Catálogo de Actions (`PerfilAction`)

Type union em `src/types/perfil.ts`. Reducer em `src/context/PerfilContext.tsx`. Todas as mutações de estado passam por aqui - componentes nunca tocam `localStorage` diretamente (INV-PRESET-3).

### IV.1 - Onboarding

| Action                | Efeito                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| `SET_ONBOARDING_CAMPO`| Set genérico de campo durante o onboarding (DT-14 - type-safety fraca) |
| `COMMIT_ONBOARDING`   | Único momento de primeira persistência. Cria `PresetEntry`, deriva `categoriasAtivas` a partir das respostas, ajusta autonomias por modelo do `CATALOGO` |

### IV.2 - Rodagem inline (Estimativa)

`SET_KM_POR_DIA`, `SET_DIAS_POR_SEMANA`, `SET_KM_ATUAL`.

### IV.3 - Display

| Action                       | Efeito                                                            |
| ---------------------------- | ----------------------------------------------------------------- |
| `TOGGLE_CATEGORIA`           | Liga/desliga uma categoria em `categoriasAtivas`                  |
| `TOGGLE_IMPREVISTO_SUGERIDO` | Liga/desliga uma retífica em `imprevistosSugeridosAtivos[id]`     |

### IV.4 - Overrides de peças

| Action                      | Efeito                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `SET_PECA_OVERRIDE`         | Define um campo (`precoOriginal`, `precoParalela` ou `intervaloKm`) de `PecaOverride[]` por `id`  |
| `RESET_PECA_OVERRIDE`       | Sem `campo`: remove o `PecaOverride` inteiro. Com `campo`: zera só aquele atributo (= null)       |

`campoOverrideMap` em `PerfilContext.tsx` faz a tradução do nome amigável (`precoOriginal`) para o nome real do tipo (`precoEditadoOriginal`).

### IV.5 - Mão de obra e revisão

| Action                                | Efeito                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `SET_SERVICO_INDEPENDENTE`            | Upsert por `id` em `servicosIndependentes[]`. Guard: rejeita `intervalKm <= 0` para serviços km-driven; permite `0` só para temporal conhecido (INV-MANUT-1) |
| `RESET_SERVICOS_INDEPENDENTES`        | Volta para `SERVICOS_INDEPENDENTES_PADRAO`                                   |
| `SET_REVISAO_AUTORIZADA_OVERRIDE`     | Upsert por `index` em `revisaoAutorizadaOverrides[]`. Calcula `precoTotal = pecas + maoDeObra` |
| `RESET_REVISAO_AUTORIZADA_OVERRIDE`   | Remove override por `index`                                                  |

### IV.6 - Financeiro

`SET_INTERNET`, `SET_SEGURO` (Partial), `SET_ALIMENTACAO`, `SET_COMBUSTIVEL`, `SET_TIPO_COMBUSTIVEL_PREFERIDO`, `TOGGLE_GASTO_CUSTOM`, `SET_GASTO_CUSTOM_VALOR`.

> Não há `ADD_GASTO_CUSTOM`/`DELETE_GASTO_CUSTOM` - lista de imprevistos é fechada (RF-6.9). `SET_GASTO_CUSTOM_VALOR` ativa o toggle automaticamente ao passar de 0 → >0.

### IV.7 - FIPE

`SET_FIPE_CACHE` (preenche o cache no Passo 3 do Onboarding).

### IV.8 - Manutenção (km como âncora - RF-6.7)

| Action                  | Efeito                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `SET_KM_ULTIMA_TROCA`   | Atualiza `moto.kmUltimaTrocas[componente]` (óleo, pneus, kit relação, bateria, kit embreagem, kit cilindro, retíficas) |
| `SET_MOTOR_REFEITO`     | Define ou limpa `moto.kmMotorRefeito` (`number \| null`)                        |
| `MARCAR_TROCAS_REVISAO` | Aplica `kmRevisao` em vários componentes de uma vez (checkpoint do Onboarding) |

### IV.9 - Ajustes de predefinição

`SET_ANO_MOTO`, `SET_KM_ULTIMA_REVISAO`, `SET_PERFIL_USO`, `SET_MODO_REVISAO`, `SET_SITUACAO_MOTO`, `SET_PARCELA`, `SET_ALUGUEL`, `SET_RESPONSABILIDADE_ALUGUEL`, `RESETAR_AJUSTES_PADRAO`.

> `RESETAR_AJUSTES_PADRAO` (BG-004): zera custos (alimentação, seguro, gastosCustom) e volta uso/modo de revisão ao padrão. **Não** mexe em moto nem em mão de obra.

### IV.10 - Presets (envelope)

`CARREGAR_PERFIL`, `RESETAR_PERFIL`, `IMPORTAR_PERFIL`.

---

## V - Persistência

`PerfilContext` declara um `useEffect` que sincroniza com `LocalStoragePerfilStorage` a cada mudança em `state.presets` ou `state.presetAtivoId`. O `useRef` inicial evita escrita na primeira montagem (que apenas reidrata do storage).

**INV-PRESET-2:** `PresetEntry` só é gravado após `COMMIT_ONBOARDING`. Actions intermediárias do onboarding (`SET_ONBOARDING_CAMPO`) mutam `state.perfil` mas **não** disparam persistência porque `presetAtivoId` ainda é `null`.

---

## VI - Schema Pré-Lançamento

A TASK-REF-30 descartou a cadeia histórica de migração porque o app ainda não tinha usuários públicos. O contrato atual é simples:

- `schemaVersion` atual é `1`.
- `perfilSchema` aceita somente a versão atual.
- `criarEstadoInicial` faz `carregar → validar`.
- Dado antigo, futuro, parcial ou corrompido volta para `estadoPadrao` e é preservado em `.corrupted` quando possível.
- Próximas migrações só devem ser criadas após lançamento público ou quando houver dado real a preservar.

---

## VII - Fixture de dev (`src/fixtures/usuario_teste.json`)

Fixture em `schemaVersion: 1`, acompanhando o baseline público inicial.

---

## VIII - Histórico deste documento

| Data       | Mudança |
| ---------- | ------- |
| 2026-05-05 | Especificação pré-implementação original (v5) |
| 2026-05-24 | Reescrita completa (TASK-DOC-009) - sincronizado com schema 14, perfilPadrao real, actions reais, migrações documentadas |
| 2026-05-27 | TASK-RF-6.13 - sincronizado com schema 19 e `kmUltimaTrocas` ampliado para peças rastreáveis e retíficas |
| 2026-05-31 | TASK-REF-30 - reset pré-lançamento: schema v1, namespace `estimamoto:v1:*`, sem migrações históricas |
| 2026-05-27 | TASK-RF-6.24 - sincronizado com schema 20; `kitRevisao` removido de `kmUltimaTrocas` |

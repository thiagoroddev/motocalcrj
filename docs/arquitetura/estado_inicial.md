> ⚠️ **DESATUALIZADO — NÃO USAR COMO REFERÊNCIA.**
> Este arquivo é a **especificação pré-implementação de 05/05/2026**. Nunca foi sincronizado. Divergências críticas:
> - `schemaVersion: 5` → real **10** (migrações v5→v6→v7→v8→v9→v10 já rodaram via TASK-REF-11, RF-6.3.2, REF-18, REF-19, REF-21).
> - Namespace `motocalc:v5:` → atual reflete schema atual.
> - `perfilPadrao` mostrado tem `historicoManutencao`, `diarioTrabalho`, `modoExibicao`, `modoOficinDisplay`, `precoMaoDeObraIndependente`, `frequenciaRevisaoKm`, `servicosMaoDeObra`, `seguro.tem` — **todos removidos**.
> - Catálogo de Actions inclui 12+ actions removidas (ADD_TROCA_OLEO, ADD_REVISAO, ADD_DIA_TRABALHO, SET_MODO_EXIBICAO, SET_MODO_OFICINA, ADD_GASTO_CUSTOM, etc).
> - Função `migrarPerfil` documentada não corresponde à atual (que está inline no PerfilContext).
> - Falta: `kmUltimaTrocas`, `kmMotorRefeito`, `servicosIndependentes`, `imprevistosSugeridosAtivos`, `responsabilidadeAluguel`, novas actions de Ajustes.
>
> Verdade primária atual: ler `src/types/perfil.ts` (`PerfilUsuario` + `PerfilAction`) e `src/context/PerfilContext.tsx` (`perfilPadrao` + migrações + reducer). Reescrita completa programada na **TASK-DOC-009** (Strict).
> Mantido apenas para referência histórica.

---

# MotoCalc RJ Estado Inicial e Arquitetura de Persistência

> Status: especificação definitiva pré-implementação
> Versão: 1.0 05/05/2026
> Baseado em: `Requisitos_MotoCalc_RJ_v5.md`, interfaces `PerfilUsuario`

---

## I- Perfil Unico com Multiplas Predefinicoes (Presets)

O app nao tem login em V1. Existe **um unico perfil local** e **varias predefinicoes (presets)** de configuracao. Um motoboy pode ter "Trabalho" e "Pessoal" como presets, ou criar variações do mesmo modelo (ex: "Pop 110i 2024 - v2"). A estrutura no localStorage reflete isso.

### I.1- Chaves do localStorage

| Chave                     | Tipo                   | Descricao                                               |
| ------------------------- | ---------------------- | ------------------------------------------------------- |
| `motocalc:v5:presets`     | `PresetEntry[]` (JSON) | Array com todas as predefinicoes. Maximo recomendado: 5 |
| `motocalc:v5:presetAtivo` | `string`               | `presetId` do preset atualmente ativo                   |

> **Convencao de namespace:** `motocalc:v5:` para isolar dados e facilitar migrations. A versao (`v5`) refere-se ao `schemaVersion`. Ao migrar para v6, o hook `migrarPerfil.ts` le `v5:presets`, transforma, e grava em `v6:presets`.

### I.2- Tipo PresetEntry (wrapper de preset)

```typescript
// Nao esta em PerfilUsuario e o envelope do localStorage
interface PresetEntry {
  presetId: string            // nanoid() gerado na criacao
  nome: string                // ex: "Trabalho Pop 110i"
  criadoEm: string            // ISO 8601
  atualizadoEm: string        // ISO 8601 atualizado a cada dispatch
  perfil: PerfilUsuario       // snapshot completo do preset
}

> **Por que nao usar `userId` do PerfilUsuario?** O `userId` e reservado para autenticacao (login V2). O `presetId` identifica o preset localmente.
> **Por que não usar `userId` do PerfilUsuario?** O `userId` é reservado para autenticação (login V2). O `perfilId` identifica o perfil localmente, é diferente.

### I.3- Fluxo de Leitura ao Abrir o App

```

App.tsx renderiza
↓
usePerfil.ts → localStorage.getItem('motocalc:v5:presetAtivo')
↓
null? → nenhum preset ativo → redirecionar para /onboarding
string → presetId encontrado
↓
usePerfil.ts → localStorage.getItem('motocalc:v5:presets')
↓
null? → array vazio → redirecionar para /onboarding
array → procurar entrada com presetId === ativo
↓
nao encontrado? → usar primeiro preset do array
encontrado → carregar preset no PerfilContext via dispatch CARREGAR_PERFIL
↓
perfil.onboardingConcluido === false → /onboarding
perfil.onboardingConcluido === true → /estimativa

````

---

## II- Objeto PerfilUsuario Padrão (Estado Pré-Onboarding)

Este é o objeto exato que o app cria ao iniciar um novo onboarding. Todos os campos têm valores seguros. O onboarding sobrescreve os campos relevantes antes de salvar.

```typescript
// src/context/PerfilContext.tsx valor inicial do useReducer
export const perfilPadrao: PerfilUsuario = {
  schemaVersion: 5,
  userId: null,
  onboardingConcluido: false,
  apelido: null,
  aplicativos: [],

  // ── Moto ──────────────────────────────────────────────────────────
  moto: {
    marca: '',
    modelo: '',           // chave do preset JSON, ex: 'pop110i'
    ano: new Date().getFullYear(),
    perfilUso: 'entrega',
    kmAtual: 0,
    kmUltimaRevisao: null,
  },

  // ── Manutenção ────────────────────────────────────────────────────
  perfilManutencao: {
    perfilPecasGlobal: 'original',
    modoRevisao: 'independentes',
    precoMaoDeObraIndependente: 150,   // dados_rj.json → manutencao.precoRevisaoIndependentePadrao
    frequenciaRevisaoKm: 6000,
  },

  // ── Trabalho ──────────────────────────────────────────────────────
  trabalho: {
    kmPorDia: 70,        // default razoável para motoboy RJ
    diasPorSemana: 5,
    horasPorDia: 8,
  },

  // ── Financeiro ────────────────────────────────────────────────────
  financeiro: {
    tipoGasolinaPreferida: 'comum',
    combustiveis: {
      comum:     { preco: 6.61, autonomia: 36 },  // dados_rj.json → combustivel.gasolinaComumPadrao
      aditivada: { preco: 6.99, autonomia: 36 },
      etanol:    { preco: 4.29, autonomia: 28  },
    },
    internet: 0,           // 0 = não tem internet de trabalho
    seguro: {
      tem: false,
      valorAnual: 929.96,  // referência Suhai editável
      empresa: null,
      periodicidade: 'anual',
    },
    situacaoMoto: 'quitada',
    parcelaMensal: null,
    parcelasRestantes: null,
    aluguelMensal: null,
    aluguelPeriodicidade: null,
    alimentacaoDia: 20,   // R$20 default perguntado no P9
    gastosCustom: [],
    responsabilidadeAluguel: {
      documentos: 'eu',   // default: todos os custos são do entregador
      manutencao: 'eu',
      seguro:     'eu',
    },
  },

  // ── Display ───────────────────────────────────────────────────────
  configuracaoDisplay: {
    modoExibicao: 'predefinidos',       // inicia com dados do preset
    modoOficinDisplay: 'independentes', // modo de revisão na UI
    categoriasAtivas: {
      combustivel:  true,
      alimentacao:  true,
      manutencao:   true,
      documentacao: true,
      internet:     false,  // começa false; ativado pelo onboarding se internet > 0
      seguro:       false,  // começa false; ativado pelo onboarding se seguro.tem
      financiamento:false,  // começa false; ativado pelo onboarding se financiada/alugada
    },
  },

  // ── Overrides ─────────────────────────────────────────────────────
  pecasOverrides: [],             // sem overrides iniciais → usa preset
  servicosMaoDeObra: {
    trocaOleo:          30,       // dados_rj.json → manutencao.servicosPadrao
    trocaKitTransmissao:50,
    trocaPneu:          30,
    revisaoGeral:       150,
    avulso:             80,
  },
  revisaoAutorizadaOverrides: [],

  // ── Cache ─────────────────────────────────────────────────────────
  fipeCache: null,                // preenchido no P3 do onboarding

  // ── Histórico ─────────────────────────────────────────────────────
  historicoManutencao: {
    trocasOleo:        [],
    revisoes:          [],
    trocasPneu:        [],
    trocasKitRelacao:  [],
    abastecimentos:    [],
  },

  diarioTrabalho: [],
}
````

---

## III- Defaults por Campo: Origem e Regra

| Campo                                                | Default          | De onde vem               | Regra de atualização                                             |
| ---------------------------------------------------- | ---------------- | ------------------------- | ---------------------------------------------------------------- |
| `moto.perfilUso`                                     | `'entrega'`      | Hardcoded                 | P4 do onboarding                                                 |
| `trabalho.kmPorDia`                                  | `70`             | Estimativa RJ             | P5 do onboarding → RF-EST-04 inline                              |
| `trabalho.diasPorSemana`                             | `5`              | Estimativa                | P5 do onboarding → RF-EST-04 stepper                             |
| `trabalho.horasPorDia`                               | `8`              | Padrão CLT                | Ajustes Predefinição                                             |
| `financeiro.combustiveis.comum.preco`                | `6.61`           | `dados_rj.json`           | Editável em VIDA ÚTIL                                            |
| `financeiro.combustiveis.comum.autonomia`            | `36`             | Preset `consumoKmL`       | Editável em VIDA ÚTIL                                            |
| `financeiro.combustiveis.comum.autonomia` (com baú)  | `33`             | Preset `consumoKmLComBau` | Automático ao marcar baú                                         |
| `financeiro.internet`                                | `0`              | Sem internet              | P8 do onboarding                                                 |
| `financeiro.seguro.valorAnual`                       | `929.96`         | Referência Suhai          | P7 do onboarding                                                 |
| `financeiro.alimentacaoDia`                          | `20`             | Estimativa RJ             | P9 do onboarding                                                 |
| `perfilManutencao.precoMaoDeObraIndependente`        | `150`            | `dados_rj.json`           | Aba MÃO DE OBRA                                                  |
| `servicosMaoDeObra.*`                                | Ver tabela acima | `dados_rj.json`           | Aba MÃO DE OBRA                                                  |
| `configuracaoDisplay.categoriasAtivas.internet`      | `false`          |                         | Muda para `true` após onboarding se `internet > 0`               |
| `configuracaoDisplay.categoriasAtivas.seguro`        | `false`          |                         | Muda para `true` após onboarding se `seguro.tem === true`        |
| `configuracaoDisplay.categoriasAtivas.financiamento` | `false`          |                         | Muda para `true` após onboarding se `situacaoMoto !== 'quitada'` |

---

## IV- Catálogo de Actions do useReducer

Todas as mudanças de estado passam por `dispatch(action)`. Nenhum componente acessa localStorage diretamente.

```typescript
// src/context/PerfilContext.tsx

type PerfilAction =
  // ── Onboarding ──────────────────────────────────────────────────
  | { type: "SET_ONBOARDING_CAMPO"; campo: string; valor: unknown }
  // Define um campo qualquer durante o onboarding (antes de salvar)
  | { type: "COMMIT_ONBOARDING" }
  // Persiste o perfil no localStorage. Único momento de escrita durante onboarding.
  // Também: ativa categoriasAtivas baseado nas respostas (internet, seguro, financiamento)

  // ── Rodagem (inline no Painel) ──────────────────────────────────
  | { type: "SET_KM_POR_DIA"; valor: number }
  | { type: "SET_DIAS_POR_SEMANA"; valor: number }
  | { type: "SET_KM_ATUAL"; valor: number }

  // ── Display ─────────────────────────────────────────────────────
  | { type: "SET_MODO_EXIBICAO"; modo: ModoExibicao }
  | { type: "SET_MODO_OFICINA"; modo: ModoRevisao }
  | { type: "TOGGLE_CATEGORIA"; categoria: keyof CategoriaDisplay }

  // ── Overrides de Peças ──────────────────────────────────────────
  | {
      type: "SET_PECA_OVERRIDE";
      id: string;
      campo: "preco" | "intervaloKm" | "perfilPecas";
      valor: number | PerfilPecas;
    }
  | {
      type: "RESET_PECA_OVERRIDE";
      id: string;
      campo?: "preco" | "intervaloKm" | "perfilPecas";
    }
  // campo undefined → reseta todos os campos daquela peça

  // ── Mão de Obra ─────────────────────────────────────────────────
  | {
      type: "SET_SERVICO_MAO_DE_OBRA";
      servico: keyof ServicosMaoDeObra;
      valor: number;
    }
  | { type: "RESET_SERVICO_MAO_DE_OBRA"; servico: keyof ServicosMaoDeObra }
  | {
      type: "SET_REVISAO_AUTORIZADA_OVERRIDE";
      index: number;
      precoTotal: number;
    }
  | { type: "RESET_REVISAO_AUTORIZADA_OVERRIDE"; index: number }

  // ── Financeiro ──────────────────────────────────────────────────
  | { type: "SET_INTERNET"; valor: number } // 0 = desativa
  | { type: "SET_SEGURO"; config: Partial<SeguroConfig> }
  | { type: "SET_ALIMENTACAO"; valorDia: number }
  | {
      type: "SET_COMBUSTIVEL";
      tipo: TipoCombustivel;
      campo: "preco" | "autonomia";
      valor: number;
    }
  | { type: "SET_TIPO_COMBUSTIVEL_PREFERIDO"; tipo: TipoCombustivel }
  | { type: "ADD_GASTO_CUSTOM"; gasto: Omit<GastoCustom, "id"> }
  | { type: "TOGGLE_GASTO_CUSTOM"; id: string }
  | { type: "DELETE_GASTO_CUSTOM"; id: string }

  // ── Registros / Diário ──────────────────────────────────────────
  | { type: "ADD_TROCA_OLEO"; registro: Omit<TrocaOleo, "id"> }
  | { type: "DELETE_TROCA_OLEO"; id: string }
  | { type: "ADD_REVISAO"; registro: Omit<RevisaoGeral, "id"> }
  | { type: "DELETE_REVISAO"; id: string }
  | { type: "ADD_TROCA_PNEU"; registro: Omit<TrocaPneu, "id"> }
  | { type: "DELETE_TROCA_PNEU"; id: string }
  | { type: "ADD_TROCA_KIT_RELACAO"; registro: Omit<TrocaKitRelacao, "id"> }
  | { type: "DELETE_TROCA_KIT_RELACAO"; id: string }
  | { type: "ADD_ABASTECIMENTO"; registro: Omit<Abastecimento, "id"> }
  | { type: "DELETE_ABASTECIMENTO"; id: string }
  | { type: "ADD_DIA_TRABALHO"; entrada: Omit<DiarioEntry, "id"> }
  | { type: "DELETE_DIA_TRABALHO"; id: string }
  // ADD_* → gera id via nanoid(), atualiza kmAtual se necessário (RN-24)

  // ── FIPE ────────────────────────────────────────────────────────
  | { type: "SET_FIPE_CACHE"; cache: FipeCache }

  // ── Presets ─────────────────────────────────────────────────────
  | { type: "CARREGAR_PERFIL"; perfil: PerfilUsuario }
  // Chamado ao abrir o app hidrata o estado com o preset ativo
  | { type: "RESETAR_PERFIL" }
  // Volta para perfilPadrao e apaga todos os presets do localStorage

  // ── Import ──────────────────────────────────────────────────────
  | { type: "IMPORTAR_PERFIL"; perfil: PerfilUsuario };
// Valida schemaVersion, aplica migrations se necessário, persiste
```

---

## V- Lógica do Reducer Regras Especiais

Alguns actions têm comportamento não óbvio que deve ser implementado corretamente:

### V.1- COMMIT_ONBOARDING

Além de persistir, este action ativa automaticamente as `categoriasAtivas` com base nas respostas:

```typescript
case 'COMMIT_ONBOARDING': {
  const novo = {
    ...state,
    onboardingConcluido: true,
    configuracaoDisplay: {
      ...state.configuracaoDisplay,
      categoriasAtivas: {
        ...state.configuracaoDisplay.categoriasAtivas,
        internet:      state.financeiro.internet > 0,
        seguro:        state.financeiro.seguro.tem,
        financiamento: state.financeiro.situacaoMoto !== 'quitada',
        alimentacao:   state.financeiro.alimentacaoDia > 0,
      },
    },
  }
  usePerfil.save(novo)   // persiste no localStorage
  return novo
}
```

### V.2- ADD\_\* de registros (atualização automática de kmAtual)

Conforme RN-24, ao adicionar qualquer registro com campo `km` ou `kmFinal`:

```typescript
case 'ADD_DIA_TRABALHO': {
  const novoKm = entrada.kmFinal
  return {
    ...state,
    moto: {
      ...state.moto,
      kmAtual: Math.max(state.moto.kmAtual, novoKm),  // nunca diminui
    },
    diarioTrabalho: [...state.diarioTrabalho, { id: nanoid(), ...entrada }],
  }
}
```

### V.3- RESET_PECA_OVERRIDE sem campo

Se `campo` não informado, remove o override inteiro da peça do array:

```typescript
case 'RESET_PECA_OVERRIDE': {
  if (!action.campo) {
    // remove override completo
    return {
      ...state,
      pecasOverrides: state.pecasOverrides.filter(o => o.id !== action.id),
    }
  }
  // reseta apenas o campo específico → null
  return {
    ...state,
    pecasOverrides: state.pecasOverrides.map(o =>
      o.id === action.id
        ? { ...o, [`${action.campo}Editado`]: null }
        : o
    ),
  }
}
```

### V.4- SET_MODO_EXIBICAO

Quando muda de `'personalizado'` para `'predefinidos'`, o app recalcula imediatamente usando apenas o preset sem apagar os overrides salvos (RN-04).

---

## VI- Hook usePerfil Interface IPerfilStorage

Conforme RNF-LR-03, a persistência é abstraída:

```typescript
// src/hooks/usePerfil.ts

interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(presetId: string): void;
  limpar(): void;
}

class LocalStoragePerfilStorage implements IPerfilStorage {
  private readonly CHAVE_PRESETS = "motocalc:v5:presets";
  private readonly CHAVE_ATIVO = "motocalc:v5:presetAtivo";

  carregarPresets(): PresetEntry[] {
    try {
      const raw = localStorage.getItem(this.CHAVE_PRESETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  salvarPresets(presets: PresetEntry[]): void {
    localStorage.setItem(this.CHAVE_PRESETS, JSON.stringify(presets));
  }

  getPresetAtivo(): string | null {
    return localStorage.getItem(this.CHAVE_ATIVO);
  }

  setPresetAtivo(presetId: string): void {
    localStorage.setItem(this.CHAVE_ATIVO, presetId);
  }

  limpar(): void {
    localStorage.removeItem(this.CHAVE_PRESETS);
    localStorage.removeItem(this.CHAVE_ATIVO);
  }
}
```

Em V2 (com login), substituir `LocalStoragePerfilStorage` por `ApiPerfilStorage` zero mudança no restante do código (RNF-LR-01).

---

## VII- Carregando o Fixture de Teste em Dev

Para iniciar o app com o usuário fictício já configurado (evita fazer onboarding toda vez durante desenvolvimento):

```typescript
// src/main.tsx ativar APENAS em dev
if (import.meta.env.DEV && !localStorage.getItem("motocalc:v5:presets")) {
  const fixture = await import("../data-testes/usuario_teste.json");
  localStorage.setItem(
    "motocalc:v5:presets",
    JSON.stringify(fixture["motocalc:v5:presets"]),
  );
  localStorage.setItem(
    "motocalc:v5:presetAtivo",
    fixture["motocalc:v5:presetAtivo"],
  );
  console.info("[DEV] Fixture carregado: Joao da Silva 2 presets");
}
```

> **Importante:** A verificação `!localStorage.getItem(...)` garante que o fixture só é carregado se não houver dados reais não apaga trabalho existente.

---

## VIII- Migrations (migrarPerfil.ts)

Ao carregar um perfil, sempre verificar e migrar se necessário:

```typescript
// src/utils/migrarPerfil.ts

export function migrarPerfil(raw: Record<string, unknown>): PerfilUsuario {
  const versao = (raw.schemaVersion as number) ?? 0;

  if (versao < 3) {
    throw new Error("Schema muito antigo (< v3). Import não suportado.");
  }

  if (versao === 3) {
    // v3 → v4: adicionar campos ausentes
    raw = migrarV3paraV4(raw);
  }

  if (versao === 4) {
    // v4 → v5: TypeScript strict renomear 'perfilUso' de 'motoboy' para 'entrega'
    if ((raw as any).moto?.perfilUso === "motoboy") {
      (raw as any).moto.perfilUso = "entrega";
    }
    raw.schemaVersion = 5;
  }

  // Completar campos ausentes com defaults (import de versão mais antiga)
  return completarComDefaults(raw as Partial<PerfilUsuario>);
}

function completarComDefaults(parcial: Partial<PerfilUsuario>): PerfilUsuario {
  return {
    ...perfilPadrao, // spread dos defaults
    ...parcial, // sobrescreve com o que veio do import
    moto: { ...perfilPadrao.moto, ...parcial.moto },
    financeiro: { ...perfilPadrao.financeiro, ...parcial.financeiro },
    // ... demais subconfigs
    schemaVersion: 5,
  };
}
```

---

_Última atualização: 05/05/2026 especificação pré-implementação._
_Próxima etapa: Fase 1 Setup do projeto (npm create vite@latest)._

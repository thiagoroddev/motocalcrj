# Sistema de Overrides

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Conceito arquitetural fundamental + 3 estruturas em `PerfilUsuario`.
> **Implementação:** `pecasOverrides`, `servicosIndependentes`, `revisaoAutorizadaOverrides` em `src/types/perfil.ts`. Lógica de resolução em `src/utils/calculos.ts`.
> **Última atualização:** 2026-06-06 (TASK-REF-42).

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

### 1. `pecasOverrides[]` - Overrides por Peça

```typescript
interface PecaOverride {
  id: string;                              // mesmo id da peça/pneu no Preset JSON
  precoEditadoOriginal: number | null;     // null = sem override de preço original
  precoEditadaParalela: number | null;     // null = sem override de preço paralela
  intervaloKmEditado: number | null;       // null = sem override de intervalo
}
```

**Cobre:** preço (original e paralela separadamente) e intervalo de troca **por peça individual** ou pneu.

**Exemplo:**

```typescript
pecasOverrides: [
  {
    id: 'oleo_motor',
    precoEditadoOriginal: 35.0,      // Motoboy editou: R$ 35 (preset diz 30)
    precoEditadaParalela: null,      // não editou a coluna paralela
    intervaloKmEditado: null,        // intervalo padrão
  },
  {
    id: 'pneu_traseiro',
    precoEditadoOriginal: null,      // preço padrão
    precoEditadaParalela: 137,       // editou só na coluna paralela
    intervaloKmEditado: 8000,        // dura 8000km na minha realidade
  },
];
```

🔍 **Granularidade tristate:** cada campo é `null` ou número. `null` significa "sem override, use o JSON". Sem `false` ou `undefined`.

🔍 **Preço por coluna:** `resolverPrecoPeca` lê `precoEditadoOriginal` ou `precoEditadaParalela` conforme `perfilPecasGlobal`. O Motoboy pode informar valores diferentes para cada coluna - útil quando ele já comprou peças nos dois perfis. (Não há mais `perfilPecasOverride` por peça - esse conceito morreu na refatoração.)

### 2. `servicosIndependentes[]` - Serviços de Mão de Obra (substituiu `servicosMaoDeObra` na REF-11)

```typescript
interface ServicoIndependente {
  id: string;                 // ex: 'troca-oleo', 'troca-kit-transmissao'
  nome: string;
  intervalKm: number;         // > 0 km-driven; 0 só para temporal conhecido (INV-MANUT-1)
  intervaloKmInformadoUsuario?: boolean; // true = override consciente sobre o preset
  precoIndependente: number;  // M.O. de oficina independente (era precoMaoDeObra, BG-011).
                              // Em excepcionais, é o preço ÚNICO peças + M.O. (ADR-007)
  precoTotalAutorizada: number;       // preço de concessionária do serviço avulso (ADR-007)
  statusPrecoAutorizada?: StatusPrecoAutorizada; // informado | nao_informado | informado_usuario
  concessionariaIncluiPeca?: boolean; // oficial inclui peça? Honda true / Yamaha false (ADR-014)
  incluidoNaRevisaoAutorizada: boolean; // já no pacote revisaoAutorizada → não soma de novo
  ativo: boolean;             // false = excluído do cálculo periódico
  ehExcepcional: boolean;     // true = aba Excepcional + Imprevistos, desligado (BG-005)
}
```

**Cobre:** intervalo + preços (independente e de concessionária) de cada serviço de manutenção. Substituiu o tipo plano `ServicosMaoDeObra`. Os campos de concessionária (`precoTotalAutorizada`, `statusPrecoAutorizada`, `concessionariaIncluiPeca`) entraram nas REF-6.22/32.x para o MVP autorizado.

🔍 **Defaults em `SERVICOS_INDEPENDENTES_PADRAO` (`src/context/perfilDefaults.ts`):** 12 serviços normais (`troca-oleo`, `troca-kit-transmissao`, `troca-pneu-dianteiro`, `troca-pneu-traseiro`, `troca-sapata-dianteira`, `troca-sapata-traseira`, `revisao-geral`, `troca-vela`, `troca-filtro-ar`, `troca-bateria` [temporal, `intervalKm: 0`], `troca-kit-embreagem`, `troca-kit-cilindro`) + 2 retíficas excepcionais (`retifica-cabecote`, `retifica-completa`, `ativo: false`). **Cada preset pode sobrepor** essa lista com `PresetMoto.servicosManutencao` (mesclagem em `resolverServicosManutencaoPerfil`).

🔍 **Vínculo peça↔serviço (MAPA_PECA_PARA_SERVICO):** `resolverIntervaloPeca` casa peça com serviço por `MAPA_PECA_PARA_SERVICO` (`kit_relacao` ↔ `troca-kit-transmissao`). Permite editar o intervalo em **um lugar só** (aba Mão de Obra) e a aba Insumos espelhar somente leitura. **A vida útil mora no serviço** (convenção ADR-014).

### 3. `revisaoAutorizadaOverrides[]` - Overrides de Revisão Honda

```typescript
interface RevisaoAutorizadaOverride {
  index: number;          // índice no array preset.revisaoAutorizada
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number;     // = precoPecas + precoMaoDeObra (calculado no reducer)
}
```

**Cobre:** preço de cada linha da tabela de revisões da concessionária Honda (1ª revisão, 2ª revisão, etc).

🔍 **Estrutura por índice é frágil** se o Preset JSON adicionar/remover linhas. Risco aceito (manual Honda é estável, 7 revisões fixas). DT-13 endereçada em 20/05/26 (REF-12 - calculador agora aplica o override).

**Exemplo:**

```typescript
revisaoAutorizadaOverrides: [
  { index: 0, precoPecas: 200, precoMaoDeObra: 80, precoTotal: 280 }, // 1ª revisão editada
  // index 1, 2, 3... continuam usando o preset
];
```

---

## Lógica de Resolução

A "magia" do sistema acontece em duas funções de `utils/calculos.ts` (modo único pós-ADR-003 - sem ramo de registros):

### `resolverPrecoPeca(pecaId, preset, perfilPecas, pecasOverrides)`

```typescript
const override = pecasOverrides.find((o) => o.id === pecaId);

// 1. Override explícito vence - lê a coluna correspondente ao perfilPecas atual
const precoEditadoEfetivo =
  perfilPecas === 'original' ? override?.precoEditadoOriginal : override?.precoEditadaParalela;
if (precoEditadoEfetivo != null) return precoEditadoEfetivo;

// 2. Cai no Preset JSON
const peca = preset.pecas.find((p) => p.id === pecaId);
if (peca) return perfilPecas === 'original' ? peca.precoOriginal : peca.precoParalela;

const pneu = preset.pneus.find((p) => p.id === pecaId);
if (pneu) return perfilPecas === 'original' ? pneu.precoOriginal : pneu.precoParalela;

return 0;  // fallback (não deveria acontecer)
```

🔍 **Duas fontes em ordem de prioridade:**
1. **Override explícito** (Motoboy digitou um valor na coluna ativa)
2. **Preset JSON** (fallback)

### `resolverIntervaloPeca(pecaId, preset, pecasOverrides, servicosIndependentes)`

```typescript
// 1. Override individual vence
const override = pecasOverrides.find((o) => o.id === pecaId);
if (override?.intervaloKmEditado != null) return override.intervaloKmEditado;

// 2. Serviço efetivo vinculado é a fonte canônica
const servico = resolverServicoPorPeca(pecaId, servicosIndependentes);
if (servico) return servico.intervalKm;

// 3. Cai na referência profissional única do Preset JSON
const peca = preset.pecas.find((p) => p.id === pecaId);
if (peca) return peca.intervaloKm;

const pneu = preset.pneus.find((p) => p.id === pecaId);
if (pneu) return pneu.vidaUtilKm;

return 1;  // evita divisão por zero
```

🔍 **Três fontes em ordem de prioridade (INV-VIDA-UTIL-1):**
1. **Override individual** (`pecasOverrides[].intervaloKmEditado`)
2. **`ServicoIndependente.intervalKm` efetivo** via `MAPA_PECA_PARA_SERVICO`. O preset fornece a
   base e o perfil só vence com `intervaloKmInformadoUsuario === true`.
3. **Preset JSON da peça/pneu**, apenas quando não houver serviço vinculado.

`ativo` não altera essa prioridade: ele controla custo, não desgaste. A procedência não depende
mais de comparação com `SERVICOS_INDEPENDENTES_PADRAO` (TASK-REF-42).

---

## Comportamentos (Actions do Reducer)

| Action                              | Comportamento                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `SET_PECA_OVERRIDE`                 | Define um override de peça (`precoOriginal`, `precoParalela` ou `intervaloKm`) |
| `RESET_PECA_OVERRIDE`               | Sem `campo`: remove o override inteiro do array. Com `campo`: zera só aquele atributo (= null) |
| `SET_SERVICO_INDEPENDENTE`          | Upsert por `id` em `servicosIndependentes[]`. Guard: rejeita `intervalKm <= 0` para serviços km-driven; permite `0` só para temporal conhecido (INV-MANUT-1) |
| `RESET_SERVICOS_INDEPENDENTES`      | Volta a lista inteira para `SERVICOS_INDEPENDENTES_PADRAO`                   |
| `SET_REVISAO_AUTORIZADA_OVERRIDE`   | Upsert por `index` em `revisaoAutorizadaOverrides[]`. `precoTotal` calculado automaticamente |
| `RESET_REVISAO_AUTORIZADA_OVERRIDE` | Apaga override de uma linha - volta ao Preset JSON                           |

⚠️ **`SET_PECA_OVERRIDE` usa o `campoOverrideMap`** em `PerfilContext.tsx` para traduzir o nome amigável (`precoOriginal`, `precoParalela`, `intervaloKm`) para o nome real do tipo (`precoEditadoOriginal`, `precoEditadaParalela`, `intervaloKmEditado`).

---

## Invariantes

### INV-OVR-1: Override referencia Preset JSON existente

**Regra:** Para cada `PecaOverride.id` em `pecasOverrides`, deve existir uma peça ou pneu no Preset JSON com o mesmo `id`.

**Por quê:** Override órfão (sem peça correspondente) é dado morto. `find()` em `pecasOverrides` retornaria match mas `find()` no preset retornaria `undefined`.

**Onde é protegida:** `normalizarPerfilContraPreset()` filtra `pecasOverrides` pela união dos IDs
de peças e pneus do preset canônico durante a carga. A lista limpa é persistida em best-effort
quando houve remoção.

### INV-OVR-2: Modo único - override sempre aplica quando presente

**Regra:** Após ADR-003 não existe mais `modoExibicao`. Overrides sempre se aplicam quando definidos. Não há mais ramo "ignorar overrides para comparar com preset".

**Onde é protegida:** ramos únicos em `resolverPrecoPeca` e `resolverIntervaloPeca` - não há ramificação por modo.

### INV-OVR-3: Reset isolado

**Regra:** `RESET_PECA_OVERRIDE` para um campo específico **só** afeta aquele campo. Outros overrides do mesmo `id` permanecem.

**Por quê:** RN-03 explicitamente: "O botão ↺ em qualquer campo apaga apenas o override daquele campo".

**Onde é protegida:** lógica do reducer (verificar implementação).

### INV-OVR-4: anoFimOriginal força paralela

**Regra:** Se a peça no Preset JSON tem `anoFimOriginal !== undefined` E `perfil.moto.ano > anoFimOriginal`, então `perfilEfetivo = 'paralela'` independente do override individual ou global. (RN-11)

**Por quê:** Original descontinuada não existe sistema não pode oferecer.

**Onde é protegida:** parece estar implementada na `resolverPerfilPeca` (mencionada nos requisitos, mas não vi snippet confirmar).

⚠️ **Regra não implementada no código atual.** Ela aparece nos requisitos, mas não existe em `utils/calculos.ts`.

### INV-OVR-5: `servicosIndependentes[]` sempre populado

**Regra:** `servicosIndependentes` tem **sempre** ao menos os defaults de `SERVICOS_INDEPENDENTES_PADRAO`. Reset (`RESET_SERVICOS_INDEPENDENTES`) volta para essa lista.

**Onde é protegida:** `perfilPadrao.servicosIndependentes = SERVICOS_INDEPENDENTES_PADRAO` na inicialização; migração v5→v6 (REF-11) garante perfis antigos.

---

> Seção "Diferença Entre Override e Registro" removida em 24/05/26 (TASK-DOC-009). Registros não existem mais após ADR-003 / REF-19 - Override é o único mecanismo de personalização sobre o Preset JSON.

---

## Cenários Práticos

### Cenário 1: "Pneu paralelo dura mais que dizem"

- Motoboy compra pneu paralelo
- Vai em Mão de Obra, edita o `intervalKm` do `troca-pneu-traseiro` para 18000
- Resultado: `servicosIndependentes` ganha entrada atualizada - `resolverIntervaloPeca('pneu_traseiro', ...)` casa pelo `MAPA_PECA_PARA_SERVICO` e devolve 18000
- Aba Insumos exibe 18000 somente leitura; CPK do pneu recalcula com 18000

### Cenário 2: "Preço diferente para original vs paralela"

- Motoboy editou `precoEditadoOriginal: 45` para `oleo_motor` (no perfil global "original")
- Trocou `perfilPecasGlobal` para `'paralela'` em Mão de Obra
- `resolverPrecoPeca` agora lê `precoEditadaParalela` - está `null` → cai no Preset JSON (`precoParalela` da peça)
- Se voltar para `'original'`, o override de 45 volta a ativar

### Cenário 3: "Reset"

- Motoboy editou óleo, kit relação e pneu traseiro
- Decide voltar tudo ao padrão: clica ↺ em cada um (DialogConfirmacao da REF-17)
- Resultado: cada `RESET_PECA_OVERRIDE` apaga o override correspondente
- Após resetar todos, `pecasOverrides` fica `[]` (ou sem entradas para esses ids)

---

## Pontos de Atenção

### Estrutura por índice em `revisaoAutorizadaOverrides`

Frágil se o Preset JSON adicionar/remover linhas. Risco aceito porque o manual Honda é estável. Ver `divida-tecnica.md` DT-13 (endereçada - calculador aplica o override pela REF-12).

### Validação de órfãos

Overrides e demais referências relacionais são limpos após migração e validação estrutural. A
normalização não preenche serviços ausentes, não deduplica entradas e não materializa a visão
efetiva de cálculo como estado persistido.

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export interface PecaOverride {
  id: string;
  precoEditadoOriginal: number | null;
  precoEditadaParalela: number | null;
  intervaloKmEditado: number | null;
}

export interface ServicoIndependente {
  id: string;
  nome: string;
  intervalKm: number;
  intervaloKmInformadoUsuario?: boolean;
  precoIndependente: number;
  precoTotalAutorizada: number;
  statusPrecoAutorizada?: StatusPrecoAutorizada;
  concessionariaIncluiPeca?: boolean;
  incluidoNaRevisaoAutorizada: boolean;
  ativo: boolean;
  ehExcepcional: boolean;
}

export interface RevisaoAutorizadaOverride {
  index: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` - `PecaOverride`, `ServicoIndependente`, `RevisaoAutorizadaOverride`
- `src/utils/calculos.ts` - `resolverPrecoPeca`, `resolverIntervaloPeca`, `MAPA_PECA_PARA_SERVICO`
- `src/context/PerfilContext.tsx` - `SERVICOS_INDEPENDENTES_PADRAO`, `campoOverrideMap`, actions
- `docs/requisitos/regras-negocio.md` - RN-01 a RN-05, RN-10 e RN-11

**Divergências encontradas:**

- INV-OVR-1 protegida na fronteira de carga pela TASK-REF-40.
- INV-OVR-4 (anoFimOriginal força paralela) mencionada em RN-11 mas não implementada em `calculos.ts`
- **Sincronizado em 04/06/26 (TASK-DOC-014):** `ServicoIndependente` corrigido (`precoIndependente` em vez de `precoMaoDeObra`, + `precoTotalAutorizada`/`statusPrecoAutorizada`/`concessionariaIncluiPeca`/`incluidoNaRevisaoAutorizada`); `resolverIntervaloPeca` passo 2 ajustado para "só quando editado" (`resolverServicoComIntervaloEditado`, REF-29) + nota DT-19; defaults atualizados (12 normais + 2 excepcionais; `servicosManutencao` por preset); removida seção duplicada de `revisaoAutorizadaOverrides`.
- **Sincronizado em 06/06/26 (TASK-REF-42):** procedência do intervalo representada por
  `intervaloKmInformadoUsuario`; serviço efetivo canônico sem comparação com default global.
- Atualização anterior em 24/05/26 (DOC-009): `PecaOverride` reescrito; `servicosMaoDeObra` → `servicosIndependentes` (REF-11); seção "Override vs Registro" removida.

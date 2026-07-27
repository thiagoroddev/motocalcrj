# Entidade Técnica: PresetMoto (o JSON do modelo)

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Entidade técnica imutável (dado de referência), **não** persistida no perfil do usuário.
> **Implementação:** `interface PresetMoto` em `src/types/calculos.ts`; arquivos em `src/presets/*.json` (`pop110i.json`, `factor125i.json`).
> **Última atualização:** 2026-06-04 (TASK-DOC-014).

---

## ⚠️ Não confundir com `PresetEntry`

Há **dois** "presets" no projeto (ver glossário):

| | `PresetMoto` (este doc) | `PresetEntry` (`entidade-preset.md`) |
|---|---|---|
| O que é | Dados técnicos de um **modelo** de moto | **Envelope** de configuração do usuário |
| Onde vive | `src/presets/*.json` (build) | `localStorage` (`motocusto:v0:presets`) |
| Mutável? | **Não** (RN-01 / INV-PRESET-2) | Sim (edita o `PerfilUsuario` dentro) |
| Contém | peças, pneus, revisão, serviços | um `PerfilUsuario` completo |

Este arquivo descreve o **PresetMoto** — a fonte única da verdade técnica do modelo (ADR-011 / TASK-REF-31).

---

## Conceito no Mundo Real

O `PresetMoto` é a **ficha técnico-financeira de um modelo de moto** no MotoCusto: quanto consome, quais peças/pneus usa e por quanto, e como a concessionária faz e cobra as revisões/serviços. É preenchido com dados públicos (manual, site da concessionária, mercado RJ) e serve de base para todos os cálculos quando o usuário não personalizou nada (Overrides).

Desde a TASK-REF-31, o **modelo/preset é a fonte única da verdade** — o catálogo (`catalogoModelos.ts`) só aponta para o preset, que carrega os dados.

---

## Estrutura Real

```typescript
// src/types/calculos.ts
export interface PresetMoto {
  // Metadados de catálogo (opcionais para mocks de teste; obrigatórios no JSON real
  // via PresetMotoCatalogo)
  marca?: string;            // 'Honda' | 'Yamaha' | ...  (usado na estimativa de M.O.)
  modelo?: string;
  nomeCurto?: string;
  nomeFipe?: string;
  codigoFipe?: string;
  tabelaFipe?: Record<string, number>;  // ano → valor (fallback offline da FIPE)
  aceitaEtanol?: boolean;

  consumoKmL: number; // referência profissional do modelo (manual/INMETRO), não varia por ano

  pecas: PecaPreset[];
  pneus: PneuPreset[];
  revisaoAutorizada: RevisaoAutorizadaPreset[];

  // MVP de manutenção (ADR-011/012):
  servicosManutencao?: ServicoIndependente[]; // avulsos de concessionária por modelo
  fatorMaoDeObra?: number;                     // multiplicador da M.O. estimada (default 1.0)
}

// Variante com metadados obrigatórios (o JSON real do catálogo)
type PresetMotoCatalogo = PresetMoto & {
  marca; modelo; nomeCurto; nomeFipe; codigoFipe; tabelaFipe; aceitaEtanol;
};
```

O repositório usa o nome do arquivo como identificador do modelo: atualmente existe um preset por
modelo suportado (`pop110i.json`, `factor125i.json`). A `tabelaFipe` traz o valor por ano (a FIPE
precifica cada ano-modelo) e é a **fonte dos anos suportados** do modelo; `consumoKmL` é do modelo
(não varia por ano). A Pop 110i ES 2025+ é outro modelo e não está neste preset.

Ao concluir o onboarding, o `consumoKmL` do modelo é copiado para
`perfil.financeiro.combustiveis.*.autonomia`. Um ano fora da `tabelaFipe` do modelo não pode ser
confirmado. Depois da inicialização, a autonomia continua editável; trocar o ano da moto reaplica
o padrão do novo ano.

Peças, pneus e `servicosManutencao` são compartilhados entre todos os anos do modelo. As revisões
fixas constituem a outra exceção anual: Honda Pop seleciona uma tabela pelas faixas 2016-2024,
2025-2026 e 2027; Yamaha Factor usa uma única tabela em todos os anos. A modelagem dessa seleção
está na TASK-REF-44 e não exige duplicar o preset completo.

### `PecaPreset`

```typescript
interface PecaPreset {
  id: string;                 // ex.: 'oleo_motor', 'kit_relacao'
  nome: string;
  intervaloKm?: number;       // fallback profissional por quilometragem
  intervaloMeses?: number;    // driver temporal (ex.: bateria); sem km
  precoOriginal: number;
  precoParalela: number;
  incluidoNaRevisaoAutorizada: boolean; // peça trocada nas revisões periódicas Honda
}
```

> **Vida útil mora no serviço (ADR-014):** a peça mantém apenas `intervaloKm` como fallback
> profissional. O **intervalo canônico é o do serviço efetivo**
> (`servicosManutencao[].intervalKm`, sincronizado com a revisão). O perfil só vence essa base com
> `intervaloKmInformadoUsuario === true`. Insumos informa só o preço. Ver INV-VIDA-UTIL-1.

### `PneuPreset`

```typescript
interface PneuPreset {
  id: string;                 // 'pneu_dianteiro' | 'pneu_traseiro'
  posicao: 'dianteiro' | 'traseiro';
  vidaUtilKm: number;
  precoOriginal: number;
  precoParalela: number;
}
```

### `RevisaoAutorizadaPreset`

```typescript
interface RevisaoAutorizadaPreset {
  intervaloKm: number;
  intervaloMeses: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number;          // precoPecas + precoMaoDeObra
  itensSubstituidos: string[];
  servicosExecutados: { categoria: string; servicos: string[] }[];
}
```

### `servicosManutencao` (avulsos por modelo)

Lista de `ServicoIndependente` específica do modelo (shape completo em `overrides.md` / glossário). É o que o cálculo do MVP usa para os serviços fora do pacote fixo: intervalo realista, `precoTotalAutorizada` e `statusPrecoAutorizada` (`informado`/`nao_informado`/`informado_usuario`), `concessionariaIncluiPeca` (Honda `true` / Yamaha `false`). A mesclagem com o perfil é feita por `resolverServicosManutencaoPerfil`.

---

## Invariantes

### INV-PRESETMOTO-1: Imutabilidade em runtime (RN-01)
Os JSONs em `src/presets/` **nunca** são modificados em runtime. Toda personalização vai para Overrides no `PerfilUsuario`. Proibição Absoluta no `contexto-base`.

### INV-PRESETMOTO-2: Fonte única da verdade (ADR-011)
O preset/modelo é a fonte da verdade técnica. Novos modelos podem trazer apenas revisão autorizada/concessionária, peças originais e `servicosManutencao` quando houver dado público (ADR-012). Dados de oficina independente/paralela são opcionais/futuros no MVP.

### INV-PRESETMOTO-3: Catálogo aponta para preset existente
Todo `id` em `CATALOGO` (`src/data/catalogoModelos.ts`) precisa ter um preset JSON correspondente (guarda travada por `catalogoPresets.test.ts`, TASK-CHORE-014).

### INV-PRESETMOTO-4: Vínculo peça↔serviço pelo mapa
Serviços e peças se ligam por `MAPA_PECA_PARA_SERVICO`. Testes de contrato garantem que todo serviço/peça apontado existe nos presets (Pop + Factor).

> ⚠️ **Validação de shape ainda por cast:** os JSONs entram por `as PresetMoto` (sem Zod). Campo ausente/inválido quebraria em runtime — endereçado pela **TASK-RNF-013** (schema de preset).

---

## Presets existentes

| Arquivo | Marca | `fatorMaoDeObra` | Particularidade |
|---|---|---|---|
| `pop110i.json` | Honda | 1.0 | Avulsos `concessionariaIncluiPeca: true` (preço inclui peça); sapatas `informado`. |
| `factor125i.json` | Yamaha | 1.0 | Avulsos `concessionariaIncluiPeca: false` (só M.O.); pneus como **excepcionais** (concessionária não troca). |

Tabelas de tempário/estimativa e intervalos consolidadas em `docs/dominio/manutencao-estimativas.md`.

---

## Validação Contra Código Real

Validado contra:

- `src/types/calculos.ts` - `PresetMoto`, `PecaPreset`, `PneuPreset`, `RevisaoAutorizadaPreset`, `PresetMotoCatalogo`
- `src/presets/pop110i.json`, `src/presets/factor125i.json`
- `src/data/repositorioPresets.ts`, `src/utils/servicosManutencaoPreset.ts`
- ADR-011 (fonte única), ADR-012 (MVP), ADR-013/014 (estimativa/composição)

**Divergências encontradas:** nenhuma. Documento criado em 04/06/26 (TASK-DOC-014) para cobrir a lacuna da entidade técnica do preset (antes só o envelope `PresetEntry` estava documentado).

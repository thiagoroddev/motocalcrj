# Entidade: PerfilUsuario

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Entidade (conteúdo do `PresetEntry`).
> **Implementação:** `interface PerfilUsuario` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

O `PerfilUsuario` é **a totalidade dos dados de um Motoboy** dentro de um Preset. Se o `PresetEntry` é a "pasta nomeada", o `PerfilUsuario` é tudo que está dentro dessa pasta: qual moto é, como o Motoboy trabalha, qual a situação financeira, todo o histórico que foi acumulando.

⚠️ **Importante:** o `PerfilUsuario` **não é o aggregate root** ele vive **dentro** de um `PresetEntry`. A persistência acontece pelo envelope, não por ele direto.

---

## Estrutura Real

`PerfilUsuario` é uma **entidade com 11 blocos coesos**. Cada bloco tem um arquivo dedicado nesta pasta. Esta página é o **mapa geral** que liga todos eles.

```typescript
// src/types/perfil.ts

export interface PerfilUsuario {
  // ─── Metadados ───
  schemaVersion: number;
  userId: string | null;        // V1: null sempre. V2: UUID do backend
  onboardingConcluido: boolean;
  apelido: string | null;
  aplicativos: string[];

  // ─── Blocos principais (cada um documentado em arquivo separado) ───
  moto: { ... };                          // → bloco-moto.md
  trabalho: { ... };                      // → bloco-trabalho.md
  perfilManutencao: { ... };              // → bloco-perfil-manutencao.md
  financeiro: { ... };                    // → bloco-financeiro.md
  configuracaoDisplay: { ... };           // → bloco-configuracao-display.md

  // ─── Overrides ───
  pecasOverrides: PecaOverride[];         // → overrides.md
  servicosMaoDeObra: ServicosMaoDeObra;   // → overrides.md
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[];  // → overrides.md

  // ─── Cache externo ───
  fipeCache: FipeCache | null;

  // ─── Histórico ───
  historicoManutencao: HistoricoManutencao;  // → historico-manutencao.md
  diarioTrabalho: DiarioEntry[];             // → diario-trabalho.md
}
```

---

## Atributos de Metadados

| Atributo              | Tipo             | Descrição                                                                            |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `schemaVersion`       | number           | Versão do schema. Atual: 5. Migrações controladas por `migrarPerfil.ts` (pendente)   |
| `userId`              | `string \| null` | Login-ready (RNF-LR-02). Sempre `null` em V1. UUID do backend em V2                  |
| `onboardingConcluido` | boolean          | Gatilho de `RotaProtegida` se `false`, app redireciona para `/onboarding/1`          |
| `apelido`             | `string \| null` | Apelido do Motoboy. Opcional. Aparece no header se preenchido                        |
| `aplicativos`         | `string[]`       | Apps de entrega que o Motoboy usa (ex: `["iFood", "Rappi"]`). Coletado durante o uso |

---

## Mapa dos Blocos

### 🏍️ `moto`

**Arquivo:** `bloco-moto.md`
**O quê:** dados da motocicleta marca, modelo, ano, perfil de uso (entrega/passageiro), km atual, km da última revisão.

### ⏰ `trabalho`

**Arquivo:** `bloco-trabalho.md`
**O quê:** rotina do Motoboy km/dia, dias/semana, horas/dia. **Bloco mais alterado dinamicamente** porque a Configuração de Rodagem na tela Estimativa edita esses valores em tempo real.

### 🔧 `perfilManutencao`

**Arquivo:** `bloco-perfil-manutencao.md`
**O quê:** preferências de manutenção peças originais ou paralelas globalmente, modo de revisão (autorizadas/independentes), preço de mão de obra independente, frequência de revisão.

### 💰 `financeiro`

**Arquivo:** `bloco-financeiro.md`
**O quê:** o **maior bloco**, com configurações de combustível por tipo (comum/aditivada/etanol), internet, seguro, situação da moto (quitada/financiada/alugada), parcelas, alimentação, gastos personalizados, responsabilidades em caso de aluguel.

### 🎨 `configuracaoDisplay`

**Arquivo:** `bloco-configuracao-display.md`
**O quê:** controle do que é exibido modo de exibição (predefinidos/personalizado), modo de oficina, quais categorias estão ativas no donut e total.

### ✏️ Overrides

**Arquivo:** `overrides.md`
**O quê:** três estruturas que materializam o sistema de overrides `pecasOverrides[]` (preço/intervalo/perfil de cada peça customizado), `servicosMaoDeObra` (preços de serviços), `revisaoAutorizadaOverrides[]` (preço por linha da tabela de revisões).

### 🌐 `fipeCache`

**Arquivo:** seção desta página (abaixo).
**O quê:** cache da consulta FIPE feita no Onboarding.

### 📋 `historicoManutencao`

**Arquivo:** `historico-manutencao.md`
**O quê:** cinco listas de registros estruturados trocas de óleo, revisões, trocas de pneu, trocas de kit relação, abastecimentos.

### 📔 `diarioTrabalho`

**Arquivo:** `diario-trabalho.md`
**O quê:** lista de dias trabalhados com km inicial/final, alimentação, abastecimento. Base para cálculo de média real de km/dia (Modo Personalizado).

---

## FipeCache

Este bloco não merece arquivo próprio (é pequeno e não evolui muito). Documentado aqui:

```typescript
export interface FipeCache {
  valor: number; // valor venal em R$
  dataConsulta: string; // ISO 8601 'YYYY-MM-DD'
  codigoFipe: string; // código retornado pela BrasilAPI
  anoModelo: number; // ano consultado
  marca: string; // ex: 'Honda'
  modelo: string; // ex: 'pop110i'
}
```

### Por que `marca` e `modelo` estão aqui

Foram adicionados na correção A06 do checklist. Sem eles, ao trocar de modelo no Ajustes, o cache da moto antiga seria reutilizado para a moto nova bug grave.

### Comportamento

- **Onboarding Passo 3:** consulta a BrasilAPI (`/api/fipe/motos/v1/{codigo}`) e popula `fipeCache`.
- **Cálculo de IPVA:** lê `fipeCache.valor` para alíquota.
- **Offline:** usa cache existente + aviso de data. Se sem cache + offline: input manual (RF-ON-07).
- **Invalidação:** se `marca` ou `modelo` no perfil divergir do cache, considera cache obsoleto e re-consulta.

### Invariante

**INV-FIPE-1:** se `fipeCache !== null`, então `fipeCache.marca === perfil.moto.marca` e `fipeCache.modelo === perfil.moto.modelo`. Cache que não bate com a moto atual não deve ser usado.

---

## Comportamentos do PerfilUsuario

Os comportamentos do `PerfilUsuario` são expressos como Actions no reducer (ver `src/types/perfil.ts` type `PerfilAction`). Listados em alto nível aqui; cada bloco tem suas Actions específicas detalhadas no arquivo dele.

| Categoria               | Actions principais                                                         |
| ----------------------- | -------------------------------------------------------------------------- |
| Onboarding              | `SET_ONBOARDING_CAMPO`, `COMMIT_ONBOARDING`                                |
| Configuração de Rodagem | `SET_KM_POR_DIA`, `SET_DIAS_POR_SEMANA`, `SET_KM_ATUAL`                    |
| Display                 | `SET_MODO_EXIBICAO`, `SET_MODO_OFICINA`, `TOGGLE_CATEGORIA`                |
| Overrides               | `SET_PECA_OVERRIDE`, `RESET_PECA_OVERRIDE`, `SET_SERVICO_MAO_DE_OBRA`, etc |
| Financeiro              | `SET_INTERNET`, `SET_SEGURO`, `SET_ALIMENTACAO`, `SET_COMBUSTIVEL`, etc    |
| Histórico               | `ADD_TROCA_OLEO`, `DELETE_TROCA_OLEO`, `ADD_REVISAO`, etc                  |
| FIPE                    | `SET_FIPE_CACHE`                                                           |
| Persistência            | `CARREGAR_PERFIL`, `RESETAR_PERFIL`, `IMPORTAR_PERFIL`                     |

---

## Invariantes Globais do PerfilUsuario

Invariantes que envolvem **múltiplos blocos simultaneamente** vivem aqui. Invariantes específicas de um bloco vivem no arquivo do bloco.

### INV-PERFIL-1: schemaVersion compatível

**Regra:** Ao carregar um `PerfilUsuario` do storage, se `schemaVersion < versão atual`, executar `migrarPerfil()`. Schema futuro nunca abre em versão antiga (deve avisar incompatibilidade).

### INV-PERFIL-2: userId condicional ao backend

**Regra:** V1 (sem backend): `userId === null` sempre. V2 (com backend): `userId !== null` após login.

### INV-PERFIL-3: Onboarding completo antes de uso

**Regra:** Se `onboardingConcluido === false`, o app **só permite acesso à rota `/onboarding/*`**. Outras rotas redirecionam (via `RotaProtegida`).

### INV-PERFIL-4: Cache FIPE consistente com moto

Ver INV-FIPE-1 acima.

### INV-PERFIL-5: Categorias de Display espelham realidade do perfil

**Regra:** Se `financeiro.seguro.tem === false`, então `configuracaoDisplay.categoriasAtivas.seguro` pode estar `true` ou `false` (independente). Mas se categoria está `true` e seguro `tem = false`, o cálculo retorna 0 sem erro.

⚠️ Esta NÃO é uma invariante forte; é mais uma observação de comportamento do `categoriasParaFiltros()`.

---

## Snippet TypeScript (Real, simplificado)

```typescript
// Estrutura geral ver bloco-*.md para detalhes de cada parte

export interface PerfilUsuario {
  schemaVersion: number;
  userId: string | null;
  onboardingConcluido: boolean;
  apelido: string | null;
  aplicativos: string[];

  moto: {
    /* bloco-moto.md */
  };
  perfilManutencao: {
    /* bloco-perfil-manutencao.md */
  };
  trabalho: {
    /* bloco-trabalho.md */
  };
  financeiro: {
    /* bloco-financeiro.md */
  };
  configuracaoDisplay: {
    /* bloco-configuracao-display.md */
  };

  pecasOverrides: PecaOverride[];
  servicosMaoDeObra: ServicosMaoDeObra;
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[];

  fipeCache: FipeCache | null;

  historicoManutencao: HistoricoManutencao;
  diarioTrabalho: DiarioEntry[];
}
```

---

## Validação Contra Código Real

Esta documentação foi validada contra:

- `src/types/perfil.ts` estrutura completa de `PerfilUsuario` e `FipeCache`
- `src/types/perfil.ts` type `PerfilAction` (Actions disponíveis)
- `docs/Requisitos_MotoCalc_RJ_v6.md` Seção XII (Estrutura de Dados)
- `contexto-base.instructions.md` chaves de localStorage, regras de COMMIT_ONBOARDING

**Divergências encontradas:** nenhuma. Documentação fiel ao código.

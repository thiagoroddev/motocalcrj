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

`PerfilUsuario` é uma **entidade com 9 blocos coesos**. Cada bloco tem um arquivo dedicado nesta pasta. Esta página é o **mapa geral** que liga todos eles.

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
  pecasOverrides: PecaOverride[];                         // → overrides.md
  servicosIndependentes: ServicoIndependente[];           // → overrides.md
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[]; // → overrides.md

  // ─── Cache externo ───
  fipeCache: FipeCache | null;
}
```

---

## Atributos de Metadados

| Atributo              | Tipo             | Descrição                                                                            |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `schemaVersion`       | number           | Versão do schema. **Atual: 3.** Versões diferentes são rejeitadas com fallback recuperável no pré-lançamento |
| `userId`              | `string \| null` | Login-ready (RNF-LR-02). Sempre `null` em V1. UUID do backend em V2                  |
| `onboardingConcluido` | boolean          | Gatilho de `RotaProtegida` se `false`, app redireciona para `/onboarding/1`          |
| `apelido`             | `string \| null` | Apelido do Motoboy. Opcional. Aparece no header se preenchido                        |
| `aplicativos`         | `string[]`       | Apps de entrega que o Motoboy usa (ex: `["iFood", "Rappi"]`). Coletado durante o uso |

---

## Mapa dos Blocos

### 🏍️ `moto`

**Arquivo:** `bloco-moto.md`
**O quê:** dados da motocicleta: marca, modelo, ano, km atual e km da última revisão. O ano
seleciona referências específicas quando o modelo as oferece.

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
**O quê:** controle do que é exibido - quais categorias estão ativas no donut e total, e quais imprevistos sugeridos (retíficas) estão ligados.

### ✏️ Overrides

**Arquivo:** `overrides.md`
**O quê:** três estruturas que materializam o sistema de overrides - `pecasOverrides[]` (preço original/paralela e intervalo customizados por peça), `servicosIndependentes[]` (intervalo + preço de mão de obra dos serviços de manutenção; substituiu `servicosMaoDeObra` pela TASK-REF-11), `revisaoAutorizadaOverrides[]` (preço por linha da tabela de revisões Honda).

### 🌐 `fipeCache`

**Arquivo:** seção desta página (abaixo).
**O quê:** cache da consulta FIPE feita no Onboarding.

---

## FipeCache

Este bloco não merece arquivo próprio (é pequeno e não evolui muito). Documentado aqui:

```typescript
export interface FipeCache {
  valor: number; // valor venal em R$
  dataConsulta: string; // ISO 8601 'YYYY-MM-DD'
  codigoFipe: string; // código FIPE do preset (tabelaFipe)
  anoModelo: number; // ano consultado
  marca: string; // ex: 'Honda'
  modelo: string; // ex: 'pop110i'
}
```

### Por que `marca` e `modelo` estão aqui

Foram adicionados na correção A06 do checklist. Sem eles, ao trocar de modelo no Ajustes, o cache da moto antiga seria reutilizado para a moto nova bug grave.

### Comportamento

- **Onboarding Passo 3:** lê o valor de `tabelaFipe[ano]` do preset (hardcoded, atualizado mensalmente por script — ADR-015) e popula `fipeCache` ao avançar. Sem consulta em runtime.
- **Cálculo de IPVA:** lê `fipeCache.valor` para alíquota.
- **Ano fora da tabela:** Passo 3 exibe "valor indisponível"; `fipeCache` não é gravado para esse ano.

### Invariante

**INV-FIPE-1:** se `fipeCache !== null`, então `fipeCache.marca === perfil.moto.marca` e `fipeCache.modelo === perfil.moto.modelo`. Cache que não bate com a moto atual não deve ser usado.

---

## Comportamentos do PerfilUsuario

Os comportamentos do `PerfilUsuario` são expressos como Actions no reducer (ver `src/types/perfil.ts` type `PerfilAction`). Catálogo completo em `docs/arquitetura/estado_inicial.md` §IV. Categorias:

| Categoria               | Actions principais                                                         |
| ----------------------- | -------------------------------------------------------------------------- |
| Onboarding              | `SET_ONBOARDING_CAMPO`, `COMMIT_ONBOARDING`                                |
| Rodagem inline          | `SET_KM_POR_DIA`, `SET_DIAS_POR_SEMANA`, `SET_KM_ATUAL`                    |
| Display                 | `TOGGLE_CATEGORIA`, `TOGGLE_IMPREVISTO_SUGERIDO`                           |
| Overrides de peça       | `SET_PECA_OVERRIDE`, `RESET_PECA_OVERRIDE`                                 |
| Mão de obra e revisão   | `SET_SERVICO_INDEPENDENTE`, `RESET_SERVICOS_INDEPENDENTES`, `SET_REVISAO_AUTORIZADA_OVERRIDE`, `RESET_REVISAO_AUTORIZADA_OVERRIDE` |
| Financeiro              | `SET_INTERNET`, `SET_SEGURO`, `SET_ALIMENTACAO`, `SET_COMBUSTIVEL`, `SET_TIPO_COMBUSTIVEL_PREFERIDO`, `TOGGLE_GASTO_CUSTOM`, `SET_GASTO_CUSTOM_VALOR` |
| Manutenção (km âncora)  | `SET_KM_ULTIMA_TROCA`, `SET_MOTOR_REFEITO`                                 |
| Ajustes                 | `SET_ANO_MOTO`, `SET_KM_ULTIMA_REVISAO`, `SET_MODO_REVISAO`, `SET_SITUACAO_MOTO`, `SET_PARCELA`, `SET_ALUGUEL`, `SET_RESPONSABILIDADE_ALUGUEL`, `RESETAR_AJUSTES_PADRAO` |
| FIPE                    | `SET_FIPE_CACHE`                                                           |
| Persistência            | `CARREGAR_PERFIL`, `RENOMEAR_PREDEFINICAO`, `DELETAR_PREDEFINICAO`, `RESETAR_PERFIL`, `IMPORTAR_PERFIL` |

---

## Invariantes Globais do PerfilUsuario

Invariantes que envolvem **múltiplos blocos simultaneamente** vivem aqui. Invariantes específicas de um bloco vivem no arquivo do bloco.

### INV-PERFIL-1: schemaVersion compatível

**Regra:** Ao carregar um `PerfilUsuario` do storage, `schemaVersion` precisa ser exatamente a versão atual. Versões antigas/futuras não são migradas no pré-lançamento; caem no fallback recuperável.

### INV-PERFIL-2: userId condicional ao backend

**Regra:** V1 (sem backend): `userId === null` sempre. V2 (com backend): `userId !== null` após login.

### INV-PERFIL-3: Onboarding completo antes de uso

**Regra:** Se `onboardingConcluido === false`, o app **só permite acesso à rota `/onboarding/*`**. Outras rotas redirecionam (via `RotaProtegida`).

### INV-PERFIL-4: Cache FIPE consistente com moto

Ver INV-FIPE-1 acima.

### INV-PERFIL-5: Categorias de Display espelham realidade do perfil

**Regra:** Categoria `true` com valor de origem `<= 0` (ex.: `categoriasAtivas.seguro: true` mas `financeiro.seguro.valorAnual === 0`) é estado tolerado. O cálculo retorna 0 sem erro - presença derivada de `valor > 0` (REF-21 / ADR-005).

⚠️ Não é invariante forte; é observação de comportamento de `categoriasParaFiltros()` e das funções de cálculo defensivas.

---

## Snippet TypeScript (Real, simplificado)

```typescript
// Estrutura geral - ver bloco-*.md para detalhes de cada parte

export interface PerfilUsuario {
  schemaVersion: number;
  userId: string | null;
  onboardingConcluido: boolean;
  apelido: string | null;
  aplicativos: string[];

  moto: { /* bloco-moto.md */ };
  perfilManutencao: { /* bloco-perfil-manutencao.md */ };
  trabalho: { /* bloco-trabalho.md */ };
  financeiro: { /* bloco-financeiro.md */ };
  configuracaoDisplay: { /* bloco-configuracao-display.md */ };

  pecasOverrides: PecaOverride[];
  servicosIndependentes: ServicoIndependente[];
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[];

  fipeCache: FipeCache | null;
}
```

---

## Validação Contra Código Real

Esta documentação foi validada contra:

- `src/types/perfil.ts` - estrutura completa de `PerfilUsuario` (schema 14) e `FipeCache`
- `src/types/perfil.ts` - type `PerfilAction` (Actions disponíveis)
- `src/context/PerfilContext.tsx` - `perfilPadrao` e reducer
- `docs/arquitetura/estado_inicial.md` - visão completa do estado e migrações

**Divergências encontradas:** nenhuma. Documentação fiel ao código pós-TASK-DOC-009 (24/05/26).

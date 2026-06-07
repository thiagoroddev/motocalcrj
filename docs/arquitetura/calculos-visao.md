# MotoCalc RJ - Visão da Camada de Cálculo

> **Propósito:** mapa de alto nível das funções de cálculo, suas assinaturas atuais e o pipeline de orquestração. **Não é referência detalhada de implementação** - para isso, ler diretamente `src/utils/calculos.ts` e `src/types/calculos.ts`.
> **Última atualização:** 2026-06-06 (TASK-REF-42) - fonte explícita da vida útil.
> **Verdade primária:** `src/utils/calculos.ts`, `src/types/calculos.ts`, `src/hooks/useCustos.ts`, `src/utils/itensManutencao.ts`, `src/utils/maoDeObraEstimada.ts`.

---

## I - Princípios

1. **Modo único (ADR-003):** não há mais Registros nem `modoExibicao`. Override sempre se aplica quando presente; sem override, cai no Preset JSON.
2. **MVP autorizado (ADR-012):** `normalizarPerfilMvp` (`useCustos.ts`) força `modoRevisao: 'autorizadas'` + `perfilPecasGlobal: 'original'` e aplica os `servicosManutencao` do preset sobre o perfil. O modo `independentes` segue no cálculo como caminho dormente.
3. **`calculos.ts` é puro:** sem side-effects, sem state externo. Todas as funções recebem dados e retornam resultados.
4. **`calculos.ts` é Proibição Absoluta de refatoração ad-hoc.** Mudanças exigem autorização explícita por ADR (INV-CALC-2). A suíte de `calculos.test.ts` é o guardião do comportamento (ver `npm run test`). Gate concedido para a série REF-32.
5. **Sem dupla contagem (ADR-006/014 / INV-CALC-3 / INV-MANUT-3):** no modo `autorizadas`, `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada: true` **e** pula a peça avulsa quando o serviço tem preço oficial que a inclui (`concessionariaIncluiPeca`).
6. **Estimativa de M.O. opt-in (ADR-013, INV-MANUT-2):** M.O. estimada (`~`) só entra quando ligada (global ou por-serviço); senão vira pendência (`custoIncompleto`).
7. **km como âncora (RF-6.7):** quando `moto.kmUltimaTrocas[componente] > 0`, o ciclo de troca daquela peça é ancorado nesse km via `calcularCicloPeca`; senão usa o cálculo amortizado.

---

## II - Pipeline (top-down)

```
ENTRADAS
  perfil (PerfilUsuario) + preset (PresetMoto) + dadosRJ + valorFipe + tabelaLicenciamento
                            │
                            ▼
ETAPA 1 - Rodagem
  calcularKmAnual(kmDia, diasSemana)          → kmAnual
  calcularDiasAno(diasSemana)                 → diasAno (não 365!)
                            │
                            ▼
ETAPA 2 - CPK por peça
  calcularCpkPorPeca({preset, perfilPecas, modoRevisao,
                      kmAtual, kmAnual, kmUltimaTrocas,
                      pecasOverrides, servicosIndependentes})
    → Map<pecaId, CustoPeca>
                            │
                            ▼
ETAPA 3 - Custos por categoria
  calcularCustosPorCategoria(perfil, preset, dadosRJ)
    // valorFipe vem de perfil.fipeCache; licenciamento de dadosRJ.licenciamento
    → CustosPorCategoria { documentos, revisao, manutencao,
                           combustivel, internet, seguro, alimentacao,
                           financiamento, gastosCustom }
                            │
                            ▼
ETAPA 4 - Resultado completo
  calcularResultado(perfil, preset, dadosRJ)
    → ResultadoCalculo { custos, granularidades, granularidadesMoto,
                         kmAnual, diasAno }
                            │
                            ▼
ETAPA 5 - Visão de manutenção (fusão peça + M.O.)
  montarItensManutencao(pecas, servicos, pendencias, nomePorPeca)
    → ItemManutencaoComposto[]   // 1 item por componente (só UI, não recalcula)
                            │
                            ▼
USO NA UI
  useCustos (hook) consome ResultadoCalculo
  componentes leem subárvores via props
```

---

## III - Catálogo de funções públicas

Todas exportadas de `src/utils/calculos.ts`. Assinaturas resumidas - ler o arquivo para corpo e edge cases.

### III.1 - Rodagem (modo único, sem registros)

```typescript
resolverKmDia(kmPorDia: number): number
calcularKmAnual(kmDia: number, diasSemana: number): number   // kmDia × diasSemana × 52
calcularDiasAno(diasSemana: number): number                  // diasSemana × 52
```

### III.2 - Combustível

```typescript
calcularCpkCombustivel(precoGasolina: number, consumoKmL: number): number
calcularCustoCombustivelAnual(cpkCombustivel: number, kmAnual: number): number
```

### III.3 - CPK por peça

```typescript
resolverIntervaloPeca(pecaId, preset, pecasOverrides?, servicosIndependentes?): number
resolverPrecoPeca(pecaId, preset, perfilPecas, pecasOverrides?): number
calcularCicloPeca(kmUltimaTroca, intervalo, kmAtual, kmAnual): { proximaTrocaKm, trocasNoAno }
calcularCpkPorPeca(opcoes: OpcoesCpkPorPeca): Map<string, CustoPeca>
calcularCpkPecasTotal(cpkPorPeca: Map<string, CustoPeca>): number
calcularCustoManutencaoAnual(cpkPecasTotal: number, kmAnual: number): number
```

**Ordem de resolução em `resolverIntervaloPeca`:**
1. Override individual (`pecasOverrides[].intervaloKmEditado`)
2. `ServicoIndependente.intervalKm` vinculado via `MAPA_PECA_PARA_SERVICO` (ADR-004)
3. Preset JSON (`intervaloKm` para peça ou `vidaUtilKm` para pneu)
4. Fallback `1` se peça não existe

**Ordem em `resolverPrecoPeca`:**
1. Override (`precoEditadoOriginal` ou `precoEditadaParalela` conforme `perfilPecas`)
2. Preset JSON (`precoOriginal` ou `precoParalela`)
3. Fallback `0`

### III.4 - Documentos

```typescript
calcularIPVA(valorFipe, aliquota, anoMoto, anoAtual): number  // 0 se moto >= 15 anos
calcularLicenciamento(anoAtual, tabela): number
calcularCustoDocumentosAnual(ipva, licenciamento): number
```

### III.5 - Revisão periódica (modo autorizado é o do MVP)

```typescript
calcularDetalhesRevisaoAnual(modoRevisao, kmAnual, opcoes): CustosPorCategoria['revisao']
// opcoes: { custoCicloCompleto?, quantidadeRevisoesCiclo?, kmCicloRevisao?,
//           servicosIndependentes?, kmAtual?, kmUltimaTrocas?, marca?, fatorMaoDeObra?,
//           incluirEstimativaMaoDeObra?, estimativaMaoDeObraPorServico? }
```

- **`autorizadas`:** `base = (custoCicloCompleto / kmCicloRevisao) × kmAnual`, com `kmCicloRevisao = max(preset.revisaoAutorizada.intervaloKm)` e fallback de 36.000 km (defaults `3334.62` / `7 revisões`) **+ serviços avulsos fora do pacote** (`servicosManutencao` ativos, `intervalKm > 0`, `!incluidoNaRevisaoAutorizada`):
  - `informado` / `informado_usuario` → soma `precoTotalAutorizada` amortizado;
  - `nao_informado` + estimativa ligada (global **ou** `estimativaMaoDeObraPorServico[id]`) → soma M.O. estimada (`~`, `maoDeObraEstimada: true`);
  - `nao_informado` sem estimativa → `PendenciaMaoDeObraConcessionaria` + `detalhes.custoIncompleto = true`.
- **`independentes` (dormente):** soma `(precoIndependente / intervalKm) × kmAnual` para cada `ServicoIndependente` com `ativo && !ehExcepcional && intervalKm > 0`.

> Excepcionais (`ehExcepcional`) saem por `calcularImprevistosSugeridosAnual` (Imprevistos), também respeitando a estimativa opt-in.

### III.6 - Custos fixos e operacionais

```typescript
calcularCustoInternetAnual(temInternet: boolean, precoInternet: number): number
calcularCustoSeguroAnual(valorAnual: number): number                // valorAnual > 0 ? valorAnual : 0
calcularCustoAlimentacaoAnual(precoAlimentacao, diasAno): number
calcularCustoFinanciamentoAnual(situacaoMoto, parcelaMensal, aluguelValor, aluguelPeriodicidade): number
fatorResponsabilidade(resp: ResponsabilidadeCusto): number          // eu=1, dividido=0.5, locador=0
calcularCustoGastosCustomAnual(gastosCustom: GastoCustom[]): number  // soma de ativos com valor > 0
```

**Financiamento/Aluguel:**
- `quitada` → 0
- `financiada` + parcela → `parcela × 12`
- `alugada` + valor → `aluguel × 12` (mensal) ou `aluguel × 52` (semanal)

### III.7 - Agregação

```typescript
calcularCustosPorCategoria(perfil, preset, dadosRJ): CustosPorCategoria
calcularResultado(perfil, preset, dadosRJ): ResultadoCalculo
calcularTotalFiltrado(custos: CustosPorCategoria, filtros: FiltrosCategorias): number
calcularBreakdownPercentual(custos, filtros): Record<string, number>
calcularGranularidades(custoTotalAnual, diasAno, kmAnual): GranularidadesCusto
categoriasParaFiltros(cat: CategoriaDisplay, imprevistosSugeridosAtivos, filtrosManutencao): FiltrosCategorias
```

### III.8 - Manutenção: estimativa e visão (fusão peça + M.O.)

A estimativa de M.O. e a fusão do item-componente vivem **fora** de `calculos.ts` (não são gated), consumidas pela UI do Detalhamento:

```typescript
// src/utils/maoDeObraEstimada.ts
estimarMaoDeObra(servicoId, marca?, fatorMaoDeObra=1): number   // horas × taxa × fator; 0 sem tempário
montarEstimativaMaoDeObra(perfil, preset?, servicoId): EstimativaMaoDeObraItem
                                                  // { globalLigado, porServicoLigado, valorEstimado }

// src/utils/itensManutencao.ts
montarItensManutencao(pecas, servicos, pendencias?, nomePorPeca?): ItemManutencaoComposto[]
// Funde peça (Insumos) + M.O. (serviço) por componente via MAPA_PECA_PARA_SERVICO.
// É SÓ VISÃO: o total continua somando os mapas separados em calculos.ts (INV-MANUT-3).
// status: 'oficial' | 'editado' | 'estimado' | 'faltando' | 'semMaoDeObra'

// src/utils/servicosManutencaoPreset.ts
resolverServicosManutencaoPerfil(perfil, preset?): ServicoIndependente[]
// Mescla preset.servicosManutencao sobre perfil.servicosIndependentes; só edição
// consciente do usuário (informado_usuario) vence o preset (B2 / ADR-014).
```

**Convenção de granularidades:**
- `mensal = anual / 12`
- `semanal = anual / 52` (nunca `mensal / 4`)
- `diario = anual / diasAno` (dias trabalhados, não 365)
- `porKm = anual / kmAnual`

---

## IV - Tipos de saída (em `src/types/calculos.ts`)

`CustosPorCategoria`, `CustoPeca`, `CustoServicoRevisao`, `CustoImprevistoSugerido`, `PendenciaMaoDeObraConcessionaria`, `GranularidadesCusto`, `FiltrosCategorias`, `ResultadoCalculo`. Ler o arquivo (curto e autoexplicativo).

**Novidades do MVP de manutenção (REF-32.x):**
- `PresetMoto` ganhou `servicosManutencao?: ServicoIndependente[]` e `fatorMaoDeObra?: number`.
- `CustoServicoRevisao` ganhou `statusPrecoAutorizada`, `maoDeObraEstimada?`, `precoServico`, `modo`, `kmUltimaTroca`, `kmDasProximasTrocas`.
- `revisao.detalhes` ganhou `custoIncompleto: boolean` e `pendenciasMaoDeObra: PendenciaMaoDeObraConcessionaria[]`.

**Convenções importantes:**
- Em `manutencaoPorPeca` e `revisaoPorServico`: item é **ativo** se valor é `true` ou `undefined` (default-active).
- Em `imprevistosSugeridos`: item só é ativo se valor é `true` explícito (default-off).
- `CustoPeca.fonte: 'preset' | 'registro'` - semântica atual é "tem override" (apesar do nome `registro` herdado). Não renomear sem nova ADR.

---

## V - Função → Componente → Tela

| Função / Tipo                        | Hook ou consumidor    | Componente / Tela            |
| ------------------------------------ | --------------------- | ---------------------------- |
| `calcularResultado`                  | `useCustos`           | tudo, via prop drilling      |
| `calcularGranularidades`             | `useCustos`           | `PaginaEstimativa` (cards)   |
| `calcularTotalFiltrado`              | `PaginaDetalhamento`  | total exibido                |
| `calcularBreakdownPercentual`        | `PaginaDetalhamento`  | donut chart                  |
| `calcularCpkPorPeca`                 | `useCustos`           | `PaginaInsumos` (CPK por peça) |
| `calcularCpkCombustivel`             | `useCustos`           | `PaginaInsumos` (card combustível) |
| `calcularCicloPeca`                  | `calcularCpkPorPeca`  | indireto - `proximaTrocaKm` em CustoPeca |
| `categoriasParaFiltros`              | `PaginaDetalhamento`  | filtros do donut e total     |

---

## VI - Riscos e armadilhas

| Risco                                            | Mitigação atual                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `kmAnual` derivado de `kmMensal × 12`            | Função canônica `kmDia × diasSemana × 52`; a suíte guarda (`npm run test`) |
| `semanal = mensal / 4`                           | Sempre `anual / 52`                                                       |
| `diario` por 365                                 | Sempre `anual / diasAno` (= `diasSemana × 52`)                            |
| IPVA de moto com 15+ anos                        | Guard explícito em `calcularIPVA`                                          |
| Dupla contagem revisão Honda + peça              | `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada` no modo autorizado (INV-CALC-3) |
| Excepcionais somando em `revisao.total`          | Filtrados em `calcularDetalhesRevisaoAnual` (`!ehExcepcional`); aparecem só em `gastosCustom.detalhes.sugeridos` desligados (BG-005) |
| Override de revisão autorizada não aplicado      | Aplicado em `calcularCustosPorCategoria` antes de derivar `custoCicloCompleto` (REF-12) |
| Mudanças não autorizadas em `calculos.ts`        | INV-CALC-2: exigir ADR explícita autorizando                              |
| Peça avulsa duplicada com o serviço (Honda)      | `ehPecaCobertaPorServicoAutorizada` pula só no `informado` oficial + `concessionariaIncluiPeca` (INV-MANUT-3) |
| M.O. estimada somada em silêncio                 | Só quando ligada (global ou por-serviço), sempre `~` (INV-MANUT-2)        |
| Recalcular na fusão do item-componente           | `montarItensManutencao` é só visão; total vem dos mapas de `calculos.ts`  |
| Intervalo peça ≠ serviço no mesmo componente     | Serviço efetivo é canônico via `resolverServicoPorPeca`; perfil só vence o preset com procedência explícita |

---

## VII - Histórico

| Data       | Mudança |
| ---------- | ------- |
| 2026-05-24 | Criação (TASK-DOC-009) - substitui `calculos-api.md` (espec pré-implementação obsoleta deletada na mesma task) |
| 2026-06-04 | TASK-DOC-014: sincronizado com o MVP de manutenção - assinaturas 3-arg, avulsos de concessionária + estimativa + pendências no autorizado, view-model `montarItensManutencao` + `maoDeObraEstimada`, tipos novos, ponteiro de testes, MVP/composição (ADR-012/013/014, DT-19) |
| 2026-06-06 | TASK-REF-42: serviço efetivo tornou-se fonte canônica explícita da vida útil; removida inferência por default global e alinhados cálculo, Insumos e Detalhamento |

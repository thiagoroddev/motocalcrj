# MotoCalc RJ — Visão da Camada de Cálculo

> **Propósito:** mapa de alto nível das funções de cálculo, suas assinaturas atuais e o pipeline de orquestração. **Não é referência detalhada de implementação** — para isso, ler diretamente `src/utils/calculos.ts` e `src/types/calculos.ts`.
> **Última atualização:** 2026-05-24 (TASK-DOC-009).
> **Verdade primária:** `src/utils/calculos.ts`, `src/types/calculos.ts`, `src/hooks/useCustos.ts`.

---

## I — Princípios

1. **Modo único (ADR-003):** não há mais Registros nem `modoExibicao`. Override sempre se aplica quando presente; sem override, cai no Preset JSON.
2. **`calculos.ts` é puro:** sem side-effects, sem state externo. Todas as funções recebem dados e retornam resultados.
3. **`calculos.ts` é Proibição Absoluta de refatoração ad-hoc.** Mudanças exigem autorização explícita por ADR (INV-CALC-2). Os 91 testes de `calculos.test.ts` são o guardião do comportamento.
4. **Sem dupla contagem (ADR-006 / INV-CALC-3):** no modo `autorizadas`, `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada: true`. Seu custo já está em `revisaoAutorizada`.
5. **km como âncora (RF-6.7):** quando `moto.kmUltimaTrocas[componente] > 0`, o ciclo de troca daquela peça é ancorado nesse km via `calcularCicloPeca`; senão usa o cálculo amortizado.

---

## II — Pipeline (top-down)

```
ENTRADAS
  perfil (PerfilUsuario) + preset (PresetMoto) + dadosRJ + valorFipe + tabelaLicenciamento
                            │
                            ▼
ETAPA 1 — Rodagem
  calcularKmAnual(kmDia, diasSemana)          → kmAnual
  calcularDiasAno(diasSemana)                 → diasAno (não 365!)
                            │
                            ▼
ETAPA 2 — CPK por peça
  calcularCpkPorPeca({preset, tipoUso, perfilPecas, modoRevisao,
                      kmAtual, kmAnual, kmUltimaTrocas,
                      pecasOverrides, servicosIndependentes})
    → Map<pecaId, CustoPeca>
                            │
                            ▼
ETAPA 3 — Custos por categoria
  calcularCustosPorCategoria(perfil, preset, dadosRJ, valorFipe,
                             tabelaLicenciamento)
    → CustosPorCategoria { documentos, revisao, manutencao,
                           combustivel, internet, seguro, alimentacao,
                           financiamento, gastosCustom }
                            │
                            ▼
ETAPA 4 — Resultado completo
  calcularResultado(...)
    → ResultadoCalculo { custos, granularidades, granularidadesMoto,
                         kmAnual, diasAno }
                            │
                            ▼
USO NA UI
  useCustos (hook) consome ResultadoCalculo
  componentes leem subárvores via props
```

---

## III — Catálogo de funções públicas

Todas exportadas de `src/utils/calculos.ts`. Assinaturas resumidas — ler o arquivo para corpo e edge cases.

### III.1 — Rodagem (modo único, sem registros)

```typescript
resolverKmDia(kmPorDia: number): number
calcularKmAnual(kmDia: number, diasSemana: number): number   // kmDia × diasSemana × 52
calcularDiasAno(diasSemana: number): number                  // diasSemana × 52
```

### III.2 — Combustível

```typescript
resolverConsumoEfetivo(preset: PresetMoto, usaBau: boolean): number
calcularCpkCombustivel(precoGasolina: number, consumoKmL: number): number
calcularCustoCombustivelAnual(cpkCombustivel: number, kmAnual: number): number
```

### III.3 — CPK por peça

```typescript
resolverIntervaloPeca(pecaId, preset, tipoUso, pecasOverrides?, servicosIndependentes?): number
resolverPrecoPeca(pecaId, preset, perfilPecas, pecasOverrides?): number
calcularCicloPeca(kmUltimaTroca, intervalo, kmAtual, kmAnual): { proximaTrocaKm, trocasNoAno }
calcularCpkPorPeca(opcoes: OpcoesCpkPorPeca): Map<string, CustoPeca>
calcularCpkPecasTotal(cpkPorPeca: Map<string, CustoPeca>): number
calcularCustoManutencaoAnual(cpkPecasTotal: number, kmAnual: number): number
```

**Ordem de resolução em `resolverIntervaloPeca`:**
1. Override individual (`pecasOverrides[].intervaloKmEditado`)
2. `ServicoIndependente.intervalKm` ativo vinculado via `MAPA_PECA_PARA_SERVICO` (ADR-004)
3. Preset JSON (`intervaloKmEntrega` se `'entrega'`, senão `intervaloKm`)
4. Fallback `1` se peça não existe

**Ordem em `resolverPrecoPeca`:**
1. Override (`precoEditadoOriginal` ou `precoEditadaParalela` conforme `perfilPecas`)
2. Preset JSON (`precoOriginal` ou `precoParalela`)
3. Fallback `0`

### III.4 — Documentos

```typescript
calcularIPVA(valorFipe, aliquota, anoMoto, anoAtual): number  // 0 se moto >= 15 anos
calcularLicenciamento(anoAtual, tabela): number
calcularCustoDocumentosAnual(ipva, licenciamento): number
```

### III.5 — Revisão periódica (dois modos)

```typescript
calcularDetalhesRevisaoAnual(modoRevisao, kmAnual, opcoes): CustosPorCategoria['revisao']
calcularCustoRevisaoAnual(modoRevisao, kmAnual, opcoes): number
```

- **`autorizadas`:** `(custoCicloCompleto / 36000) × kmAnual`. Defaults: `custoCicloCompleto = 3334.62`, `quantidadeRevisoesCicloHonda = 7`.
- **`independentes`:** soma `(precoMaoDeObra / intervalKm) × kmAnual` para cada `ServicoIndependente` com `ativo: true && !ehExcepcional`.

### III.6 — Custos fixos e operacionais

```typescript
calcularCustoInternetAnual(temInternet: boolean, precoInternet: number): number
calcularCustoSeguroAnual(valorAnual: number): number                // valorAnual > 0 ? valorAnual : 0
calcularCustoAlimentacaoAnual(precoAlimentacao, diasAno): number
calcularCustoFinanciamentoAnual(situacaoMoto, parcelaMensal, aluguelMensal, aluguelPeriodicidade): number
fatorResponsabilidade(resp: ResponsabilidadeCusto): number          // eu=1, dividido=0.5, locador=0
calcularCustoGastosCustomAnual(gastosCustom: GastoCustom[]): number  // soma de ativos com valor > 0
```

**Financiamento/Aluguel:**
- `quitada` → 0
- `financiada` + parcela → `parcela × 12`
- `alugada` + valor → `aluguel × 12` (mensal) ou `aluguel × 52` (semanal)

### III.7 — Agregação

```typescript
calcularCustosPorCategoria(perfil, preset, dadosRJ, valorFipe, tabelaLicenciamento): CustosPorCategoria
calcularResultado(perfil, preset, dadosRJ, valorFipe, tabelaLicenciamento): ResultadoCalculo
calcularTotalFiltrado(custos: CustosPorCategoria, filtros: FiltrosCategorias): number
calcularBreakdownPercentual(custos, filtros): Record<string, number>
calcularGranularidades(custoTotalAnual, diasAno, kmAnual): GranularidadesCusto
categoriasParaFiltros(cat: CategoriaDisplay, imprevistosSugeridosAtivos, filtrosManutencao): FiltrosCategorias
```

**Convenção de granularidades:**
- `mensal = anual / 12`
- `semanal = anual / 52` (nunca `mensal / 4`)
- `diario = anual / diasAno` (dias trabalhados, não 365)
- `porKm = anual / kmAnual`

---

## IV — Tipos de saída (em `src/types/calculos.ts`)

`CustosPorCategoria`, `CustoPeca`, `CustoServicoRevisao`, `CustoImprevistoSugerido`, `GranularidadesCusto`, `FiltrosCategorias`, `ResultadoCalculo`. Ler o arquivo — é curto (183 linhas) e autoexplicativo.

**Convenções importantes:**
- Em `manutencaoPorPeca` e `revisaoPorServico`: item é **ativo** se valor é `true` ou `undefined` (default-active).
- Em `imprevistosSugeridos`: item só é ativo se valor é `true` explícito (default-off).
- `CustoPeca.fonte: 'preset' | 'registro'` — semântica atual é "tem override" (apesar do nome `registro` herdado). Não renomear sem nova ADR.

---

## V — Função → Componente → Tela

| Função / Tipo                        | Hook ou consumidor    | Componente / Tela            |
| ------------------------------------ | --------------------- | ---------------------------- |
| `calcularResultado`                  | `useCustos`           | tudo, via prop drilling      |
| `calcularGranularidades`             | `useCustos`           | `PaginaEstimativa` (cards)   |
| `calcularTotalFiltrado`              | `PaginaDetalhamento`  | total exibido                |
| `calcularBreakdownPercentual`        | `PaginaDetalhamento`  | donut chart                  |
| `calcularCpkPorPeca`                 | `useCustos`           | `PaginaInsumos` (CPK por peça) |
| `calcularCpkCombustivel`             | `useCustos`           | `PaginaInsumos` (card combustível) |
| `calcularCicloPeca`                  | `calcularCpkPorPeca`  | indireto — `proximaTrocaKm` em CustoPeca |
| `categoriasParaFiltros`              | `PaginaDetalhamento`  | filtros do donut e total     |

---

## VI — Riscos e armadilhas

| Risco                                            | Mitigação atual                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `kmAnual` derivado de `kmMensal × 12`            | Função canônica `kmDia × diasSemana × 52`; 91 testes guardam             |
| `semanal = mensal / 4`                           | Sempre `anual / 52`                                                       |
| `diario` por 365                                 | Sempre `anual / diasAno` (= `diasSemana × 52`)                            |
| IPVA de moto com 15+ anos                        | Guard explícito em `calcularIPVA`                                          |
| Dupla contagem revisão Honda + peça              | `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada` no modo autorizado (INV-CALC-3) |
| Excepcionais somando em `revisao.total`          | Filtrados em `calcularDetalhesRevisaoAnual` (`!ehExcepcional`); aparecem só em `gastosCustom.detalhes.sugeridos` desligados (BG-005) |
| Override de revisão autorizada não aplicado      | Aplicado em `calcularCustosPorCategoria` antes de derivar `custoCicloCompleto` (REF-12) |
| Mudanças não autorizadas em `calculos.ts`        | INV-CALC-2: exigir ADR explícita autorizando                              |

---

## VII — Histórico

| Data       | Mudança |
| ---------- | ------- |
| 2026-05-24 | Criação (TASK-DOC-009) — substitui `calculos-api.md` (espec pré-implementação obsoleta deletada na mesma task) |

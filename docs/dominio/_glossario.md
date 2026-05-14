# Glossário do Domínio MotoCalc RJ

> Linguagem Ubíqua do projeto. Toda palavra usada no domínio do MotoCalc tem **uma única definição** que vale para código, documentação, UI e conversas.
>
> Mantido pelo `modelador-dominio`. Atualizado a cada novo conceito.
>
> **Versão atual:** 2026-05-11 engenharia reversa baseada em `src/types/perfil.ts`, `src/types/calculos.ts`, `src/utils/calculos.ts` e `docs/Requisitos_MotoCalc_RJ_v6.md`.
> **Documento de requisitos ativo:** `docs/Requisitos_MotoCalc_RJ_v6.md`. Versoes anteriores (v5) nao estao mais presentes no projeto.

---

## Como Usar Este Glossário

- Ao escrever código, comentários, documentação ou textos da UI, **use exatamente os termos definidos aqui**.
- Se um termo novo precisar entrar no projeto, primeiro **adicione-o ao glossário**, depois use.
- Se dois agentes ou pessoas usarem o mesmo termo com significados diferentes, **o glossário decide**.
- Sinônimos não são permitidos no domínio.

---

## Termos do Domínio

### Motoboy / Entregador

Usuário-alvo do produto. Pessoa que usa motocicleta para trabalho remunerado, predominantemente entregas no Município do Rio de Janeiro. Os dois termos são intercambiáveis no projeto, com leve preferência por "Motoboy" em UI e conversas, e "Entregador" em documentação formal (Requisitos v6 usa "entregador" predominantemente).

### Perfil de Usuário

Conjunto completo de dados e configurações de um Motoboy dentro do app, expresso pela interface `PerfilUsuario`. Contém moto, hábitos de trabalho, configuração financeira, histórico de manutenção, diário de trabalho, overrides e cache de FIPE. **É o conteúdo persistido**, não o envelope.

### Preset (PresetEntry)

**Envelope que persiste no localStorage**, contendo um `PerfilUsuario` e seus metadados. Estrutura:

```
PresetEntry { presetId, nome, criadoEm, atualizadoEm, perfil: PerfilUsuario }
```

Um Motoboy pode ter múltiplos Presets (ex: "Honda Pop 110i da Semana", "Biz Reserva"). Um Preset é selecionado como **Preset Ativo** para alimentar os cálculos.

⚠️ **Atenção:** o termo "Preset" também aparece no projeto referindo-se aos arquivos JSON imutáveis em `src/presets/*.json`. **Para desambiguar, neste glossário:**

- **Preset (do Motoboy):** é `PresetEntry` no localStorage. Editável.
- **Preset JSON / Preset Técnico:** é o arquivo `.json` em `src/presets/`. Imutável (RN-01).

### Preset Ativo

O `PresetEntry` atualmente selecionado. Sempre exatamente um, enquanto houver Presets cadastrados. Persistido no localStorage na chave `motocalc:v5:presetAtivo` (apenas o id, não o objeto).

### Preset JSON / Preset Técnico

Arquivo `.json` em `src/presets/` com dados técnico-financeiros pré-cadastrados de um modelo de moto (ex: `pop110i.json`). Contém: consumo, peças, pneus, revisão autorizada. **Imutável em runtime (RN-01).** Serve como referência base para os cálculos quando o Motoboy não personalizou nada.

### Override

Valor personalizado pelo Motoboy que **sobrescreve** o valor do Preset JSON em runtime. Armazenado dentro do `PerfilUsuario` (em `pecasOverrides[]`, `servicosMaoDeObra`, `revisaoAutorizadaOverrides[]`). **O Preset JSON nunca é modificado** o sistema lê o Override quando disponível e cai no Preset JSON quando não há (RN-02).

### Modo de Exibição (`ModoExibicao`)

Controla **como os Overrides são aplicados** nos cálculos. Tipo: `'predefinidos' | 'personalizado'`.

- **`predefinidos`:** ignora todos os Overrides. Calcula usando exclusivamente os valores do Preset JSON. (RN-04)
- **`personalizado`:** usa Overrides onde existem, cai no Preset JSON onde não há. Modo padrão após qualquer personalização. (RN-05)

⚠️ **Não confundir** com `Preset` (envelope) ou `Preset JSON` (arquivo). "Modo de Exibição" é uma chave do `configuracaoDisplay` dentro do `PerfilUsuario`.

### Modo de Revisão (`ModoRevisao`)

Tipo: `'autorizadas' | 'independentes'`. Controla qual cálculo de revisão periódica é usado:

- **`autorizadas`:** usa o ciclo completo de revisões da concessionária Honda (do Preset JSON), distribuído proporcionalmente por mês.
- **`independentes`:** usa preço de mão de obra customizável × frequência de revisão configurável.

### Perfil de Peças (`PerfilPecas`)

Tipo: `'original' | 'paralela'`. Define se o Motoboy compra peças originais (mais caras, vida útil maior) ou paralelas. Pode ser **global** (`perfilPecasGlobal`) ou **por peça** (override individual em `pecasOverrides`).

### Perfil de Uso (`PerfilUso`)

Tipo: `'entrega' | 'passageiro'`. Define como a moto é usada:

- **`entrega`:** entregador com baú/caixa. Usa `consumoKmLComBau` (consumo menor por causa do baú).
- **`passageiro`:** transporte de passageiros (Uber Moto, etc). Aplica fator de desgaste extra em pneus, freios, suspensão.

### Situação da Moto (`SituacaoMoto`)

Tipo: `'quitada' | 'financiada' | 'alugada'`. Determina o branch do Passo 6 do Onboarding e como o custo de "Financiamento/Aluguel" é calculado.

### Responsabilidade de Custo (`ResponsabilidadeCusto`)

Tipo: `'eu' | 'locador' | 'dividido'`. Aplica-se **apenas** quando `situacaoMoto === 'alugada'`. Define quem paga cada bloco de custo:

- **`eu`:** o Motoboy paga 100% (fator 1.0)
- **`locador`:** o locador paga 100% (fator 0.0 custo zerado para o Motoboy)
- **`dividido`:** dividem 50/50 (fator 0.5)

Aplicado em três blocos: Documentos, Manutenção, Seguro. Financiamento/Aluguel não tem fator (sempre custo do Motoboy).

### Categoria de Custo

Classificação de despesas para o cálculo. As categorias **reais do projeto** são:

| Categoria       | Descrição                                      |
| --------------- | ---------------------------------------------- |
| `documentos`    | IPVA + Licenciamento (DETRAN-RJ)               |
| `revisao`       | Revisão periódica (autorizada ou independente) |
| `manutencao`    | Peças e pneus (CPK por peça)                   |
| `combustivel`   | Gasolina/etanol baseado em consumo e km        |
| `internet`      | Plano de dados mensal                          |
| `seguro`        | Seguro da moto (anual)                         |
| `alimentacao`   | Refeições no trabalho                          |
| `financiamento` | Parcela de financiamento OU aluguel            |
| `gastosCustom`  | Gastos personalizados criados pelo Motoboy     |

⚠️ **Regra crítica (RN-27):** `revisao` **não é fatia separada no donut** da Estimativa seu custo é incorporado à fatia de `manutencao`. No detalhamento, revisão aparece como linha dentro do accordion Manutenção. Não existe toggle individual para revisão.

### Categoria Display (`CategoriaDisplay`)

Controle de quais categorias estão **ativas** no cálculo exibido. Vive em `configuracaoDisplay.categoriasAtivas`. Tipo:

```typescript
{
  (combustivel, alimentacao, manutencao, documentacao, internet, seguro, financiamento); // todas: boolean
}
```

⚠️ **Atenção a uma divergência semântica:** o campo no perfil chama-se `documentacao`, mas a categoria de custo no `FiltrosCategorias` chama-se `documentos`. A função `categoriasParaFiltros()` em `utils/calculos.ts` faz a tradução. Não confundir.

### Filtros de Categorias (`FiltrosCategorias`)

Estrutura usada **internamente nos cálculos** para decidir quais categorias entram no total. Diferente de `CategoriaDisplay` em três pontos:

1. Tem chave `documentos` (não `documentacao`)
2. Tem chave `revisao` separada (que `CategoriaDisplay` não tem espelha `manutencao`)
3. Tem `manutencaoPorPeca: Record<string, boolean>` para granularidade individual

**Invariante crítica:** em `manutencaoPorPeca`, peça é **ativa** se valor é `true` ou `undefined`. Apenas `false` explícito desativa.

### Peça

Item de manutenção mecânica em `PresetMoto.pecas[]`. Cada Peça tem: `id`, `nome`, `intervaloKm` (manual da Honda), `intervaloKmEntrega` (real para motoboy, geralmente menor), `precoOriginal`, `precoParalela`. Exemplos de IDs: `oleo_motor`, `kit_relacao`, `vela_ignicao`, `filtro_ar`.

### Pneu

Tratado separadamente das peças no Preset JSON, em `PresetMoto.pneus[]`. Tem: `id`, `posicao` (`'dianteiro' | 'traseiro'`), `vidaUtilKm`, `precoOriginal`, `precoParalela`. IDs: `pneu_dianteiro`, `pneu_traseiro`.

### Vida Útil

Quilometragem estimada de duração de uma Peça ou Pneu antes de troca. Para Peças: `intervaloKm` ou `intervaloKmEntrega`. Para Pneus: `vidaUtilKm`.

### CPK (Custo Por Quilômetro)

**Métrica central do produto.** Custo total de operação dividido pela quilometragem total. Em R$/km. Calculado em `calcularCpkPeca(preco, intervaloKm) = preco / intervaloKm` (por peça) e `calcularCpkCombustivel(preco, consumo) = preco / consumo` (combustível). Exibido no card "CUSTO DE OPERAÇÃO POR KM" em destaque na Estimativa.

### Granularidades

Output dos cálculos em diferentes períodos. Tipo:

```typescript
{
  (anual, mensal, semanal, diario, porKm);
} // todas: number
```

⚠️ **Convenção crítica:**

- `mensal = anual / 12`
- `semanal = anual / 52` (**nunca** `mensal / 4`)
- `diario = anual / diasAno` (**nunca** `anual / 365` `diasAno = diasSemana × 52`, dias trabalhados, não calendário)
- `porKm = anual / kmAnual`

### Estimativa

Tela `/estimativa`. Painel principal com cards por período, custo/km, configuração de rodagem editável, donut chart de distribuição.

### Detalhamento de Custos

Tela `/estimativa/detalhamento`. Visão expandida da Estimativa, com accordions por categoria, toggles de inclusão e edição de subitens.

### Configuração de Rodagem

Bloco visual editável na Estimativa que contém: `kmPorDia` (input) + `diasPorSemana` (stepper). Qualquer alteração recalcula tudo.

### Diário de Trabalho

`diarioTrabalho: DiarioEntry[]`. Histórico de dias trabalhados com `kmInicial`, `kmFinal`, `kmPercorridos`, alimentação e abastecimento. No código atual, em `modoExibicao === 'personalizado'` a média de `kmPercorridos` passa a ser usada quando há registros.

### Histórico de Manutenção

`historicoManutencao: HistoricoManutencao`. Agrupador de cinco listas:

- `trocasOleo[]`
- `revisoes[]`
- `trocasPneu[]`
- `trocasKitRelacao[]`
- `abastecimentos[]`

Cada lista contém registros estruturados com data, km, valores. No modo personalizado, registros de peças/pneus/kit alimentam médias reais usadas no cálculo.

### Onboarding

Fluxo de primeiro uso, dividido em 9 passos numerados (10 efetivos no fluxo aluguel devido ao Passo 6d). **Não persiste durante o fluxo** apenas a action `COMMIT_ONBOARDING` salva tudo de uma vez.

### COMMIT_ONBOARDING

Action única do reducer responsável pela primeira persistência. Antes desse commit, fechar o app perde todos os dados do Onboarding. (RF-ON-06)

### FIPE Cache (`FipeCache`)

Cache da consulta à BrasilAPI FIPE feita no Passo 3 do Onboarding. Estrutura: `{ valor, dataConsulta, codigoFipe, anoModelo, marca, modelo }`. Os campos `marca` e `modelo` permitem invalidar cache ao trocar de modelo (correção A06).

### BrasilAPI / FIPE

Serviço externo gratuito (`https://brasilapi.com.br/api/fipe/motos/v1/`) consultado uma vez no Onboarding (Passo 3) para obter o valor venal da moto. Sem chave, sem custo, anônimo.

### Dados RJ (`DadosRJ`)

Constantes regulatórias do Rio de Janeiro em `src/data/dados_rj.json`:

- `ipva.aliquotaMotos` e `ipva.isencaoIdadeMinimaMeses`
- `licenciamento.tabela` (R$ por ano)
- valores de referência de combustível e manutenção (não usados nos cálculos atuais)

Atualizado anualmente (licenciamento/aliquotas) e mensalmente (combustível).

### Catálogo de Modelos

Lista de modelos suportados no onboarding, definida em `src/data/catalogoModelos.ts`. Cada entrada informa marca, nome de exibição, nome FIPE e consumo (com e sem baú). É usada para inicializar autonomias no `COMMIT_ONBOARDING`.

### Service Worker / PWA

O app é um Progressive Web App: instalável no Android, funciona offline após primeiro carregamento, distribuível via Play Store usando TWA (Trusted Web Activity).

### Umami

Ferramenta de analytics anônima usada pelo MotoCalc. Sem cookies, compatível com LGPD.

### Toggle de Categoria

Switch booleano que ativa/desativa uma categoria no cálculo total. Persistido em `categoriasAtivas` do `configuracaoDisplay`. Ortogonal ao Fator de Responsabilidade (toggle off + locador paga = ainda zerado, claro). (RN-06, RN-07, RN-08)

### Reset (↺)

Botão que **apaga apenas o override de um campo específico**, fazendo o cálculo voltar a usar o valor do Preset JSON para aquele item. Não afeta outros campos. (RN-03)

### Apagar Tudo

Funcionalidade na tela Perfil que limpa o localStorage e reseta o estado para pré-Onboarding. Action `RESETAR_PERFIL` do reducer.

---

## Termos Técnicos (não-domínio) que aparecem na conversa

Listados aqui para evitar confusão com termos de domínio:

- **Provider, Reducer, Hook, Component:** termos do React.
- **localStorage:** mecanismo de persistência. Acesso isolado em `services/perfilStorage.ts`.
- **shadcn/ui:** biblioteca de componentes UI.
- **PWA, TWA:** formatos de distribuição.
- **Vitest:** framework de testes.
- **CPK Combustível, CPK Peça, CPK Pneu:** todos são instâncias da métrica CPK aplicada a contextos específicos.

---

## Mudanças no Glossário

| Data            | Termo                                             | Mudança                                       | Motivo                                                                                                   |
| --------------- | ------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-05-09 (v1) | (todos)                                           | Criação inicial por inferência                | Engenharia reversa apenas com `contexto-base`                                                            |
| 2026-05-09 (v2) | (todos)                                           | **Reescrita completa baseada em código real** | Validação contra `src/types/perfil.ts`, `src/types/calculos.ts`, `src/utils/calculos.ts` e Requisitos v6 |
| 2026-05-11 (v3) | Diário de Trabalho, Dados RJ, Catálogo de Modelos | Alinhamento com código real                   | Ajustes e referências v6                                                                                 |

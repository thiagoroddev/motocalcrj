# Glossário do Domínio MotoCalc RJ

> Linguagem Ubíqua do projeto. Toda palavra usada no domínio do MotoCalc tem **uma única definição** que vale para código, documentação, UI e conversas.
>
> Mantido pelo `modelador-dominio`. Atualizado a cada novo conceito.
>
> **Versão atual:** 2026-06-04 (v9) — sincronizado com o MVP de manutenção (TASK-REF-31 + pacote 32.x). Validado contra `src/types/perfil.ts`, `src/types/calculos.ts`, `src/utils/calculos.ts`, `src/utils/itensManutencao.ts`, `src/utils/maoDeObraEstimada.ts` e os presets em `src/presets/*.json`.
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

O `PresetEntry` atualmente selecionado. Sempre exatamente um, enquanto houver Presets cadastrados. Persistido no localStorage na chave `estimamoto:v1:presetAtivo` (apenas o id, não o objeto). O schema atual é o baseline público inicial v1.

### Preset JSON / Preset Técnico

Arquivo `.json` em `src/presets/` com dados técnico-financeiros pré-cadastrados de um modelo de moto (ex: `pop110i.json`). Contém: consumo, peças, pneus, revisão autorizada. **Imutável em runtime (RN-01).** Serve como referência base para os cálculos quando o Motoboy não personalizou nada.

### Override

Valor personalizado pelo Motoboy que **sobrescreve** o valor do Preset JSON em runtime. Armazenado dentro do `PerfilUsuario` (em `pecasOverrides[]`, `servicosIndependentes[]`, `revisaoAutorizadaOverrides[]`). **O Preset JSON nunca é modificado** - o sistema lê o Override quando disponível e cai no Preset JSON quando não há (RN-02). Após ADR-003 (modo único), Override sempre se aplica quando presente - não há mais modo "ignorar customizações para comparar".

### Modo de Revisão (`ModoRevisao`)

Tipo: `'autorizadas' | 'independentes'`. Controla qual cálculo de revisão periódica é usado:

- **`autorizadas`:** usa o ciclo completo de revisões da concessionária Honda (do Preset JSON), distribuído proporcionalmente por km anual, **somando os serviços avulsos fora do pacote** que têm preço de concessionária (ver _Serviços de Manutenção do Preset_ e _Status do Preço Autorizado_).
- **`independentes`:** soma `(precoIndependente / intervalKm) × kmAnual` para cada `ServicoIndependente` com `ativo: true && !ehExcepcional`. Cobre **só mão de obra**; as peças entram pelo CPK por peça.

⚠️ **MVP fixa `autorizadas` (ADR-012):** no MVP (lançamento 10/06), `normalizarPerfilMvp` em `src/hooks/useCustos.ts` força `modoRevisao: 'autorizadas'` e `perfilPecasGlobal: 'original'`. O default do perfil (`perfilPadrao`) também é `'autorizadas'`. O modo `independentes` continua no tipo e no cálculo como **caminho dormente/futuro**, não exposto na UI do MVP.

⚠️ **Sem dupla contagem (ADR-006 / INV-CALC-3):** no modo `autorizadas`, o cálculo por peça (`calcularCpkPorPeca`) **exclui** as peças com `incluidoNaRevisaoAutorizada: true` - óleo, vela e filtro de ar já estão no pacote de revisão Honda. Também pula a peça avulsa quando o serviço vinculado tem preço **oficial** que já inclui a peça (Honda — ver _Concessionária Inclui Peça_). No modo `independentes`, todas as peças entram pelo cálculo por peça (a revisão conta apenas mão de obra).

### Serviço Independente (`ServicoIndependente`)

Item de manutenção (mão de obra de troca de um componente) com intervalo de km próprio. Parte de `PerfilUsuario.servicosIndependentes[]` e também de `PresetMoto.servicosManutencao[]` (ver _Serviços de Manutenção do Preset_). Substituiu o tipo plano `ServicosMaoDeObra` na versão 6 do schema.

```typescript
interface ServicoIndependente {
  id: string;                 // ex: 'troca-oleo', 'troca-kit-transmissao'
  nome: string;
  intervalKm: number;         // > 0 km-driven; 0 só para temporal conhecido (INV-MANUT-1)
  precoIndependente: number;  // M.O. de oficina independente. Em excepcionais (retífica),
                              // é o valor ÚNICO peças + M.O. (ADR-007). (era precoMaoDeObra, BG-011)
  precoTotalAutorizada: number;       // preço da concessionária para o serviço avulso
  statusPrecoAutorizada?: StatusPrecoAutorizada; // informado | nao_informado | informado_usuario
  concessionariaIncluiPeca?: boolean; // o preço oficial inclui a peça? (Honda true / Yamaha false)
  incluidoNaRevisaoAutorizada: boolean; // já vem no pacote revisaoAutorizada (não soma de novo)
  ativo: boolean;             // false = excluído do cálculo periódico
  ehExcepcional: boolean;     // true = aba Excepcional + sugerido em Imprevistos (desligado)
}
```

Defaults em `SERVICOS_INDEPENDENTES_PADRAO` (12 serviços normais + 2 retíficas excepcionais; valores genéricos de campo RJ). Cada preset pode sobrepor essa lista com `servicosManutencao` específico do modelo. Serviços com `ehExcepcional: true` (retíficas; pneu na Yamaha) representam custos corretivos/não-executados, ficam na aba Excepcional e aparecem no Detalhamento em Imprevistos como sugestões desligadas por padrão.

### Serviços de Manutenção do Preset (`PresetMoto.servicosManutencao`)

Lista de `ServicoIndependente[]` **por modelo**, no Preset JSON (ex.: `pop110i.json`, `factor125i.json`). É a fonte da verdade dos serviços avulsos de concessionária do MVP (ADR-011/012): quais existem, intervalo realista (ver _Vida Útil_), preço oficial e seu `statusPrecoAutorizada`. A mesclagem `resolverServicosManutencaoPerfil` (`src/utils/servicosManutencaoPreset.ts`) sobrepõe esses dados sobre `perfil.servicosIndependentes`, preservando do perfil **só** edições conscientes do usuário (`informado_usuario`) — valor legado não vence o preset.

### Status do Preço Autorizado (`StatusPrecoAutorizada`)

Tipo: `'informado' | 'nao_informado' | 'informado_usuario'` (ADR-012 / TASK-REF-32.4). Diz a procedência do preço de concessionária de um serviço avulso:

- **`informado`:** preço **oficial** da concessionária (site/orçamento). Para Honda, inclui a peça.
- **`nao_informado`:** sem valor oficial. Gera **pendência** (custo incompleto) ou, com estimativa ligada, vira M.O. estimada (`~`).
- **`informado_usuario`:** o usuário editou conscientemente o valor (é sempre **só M.O.**, soma a peça). Resolvido por `resolverStatusPrecoAutorizada` em `src/utils/statusPrecoAutorizada.ts`.

### Concessionária Inclui Peça (`concessionariaIncluiPeca`)

Flag por serviço (ADR-014) que registra **como cada marca informa o preço**, sem hardcode de marca:

- **Honda → `true`** (ou ausente, compat): o preço oficial é peça + M.O. juntas → a peça avulsa **some** de Insumos quando o status é `informado` (senão duplicaria).
- **Yamaha → `false`:** a concessionária informa **só a M.O.** → a peça avulsa **permanece** e **soma** com a M.O.

Estimativa e edição do usuário são sempre só M.O. (somam a peça), independentemente da marca. O pulo da peça vive em `ehPecaCobertaPorServicoAutorizada` (`calculos.ts`): só pula no `informado` oficial + `concessionariaIncluiPeca !== false`.

### Estimativa de Mão de Obra (`~`)

Mão de obra **estimada** (não oficial), opt-in (ADR-013), sempre marcada com `~` e nunca somada em silêncio. `estimarMaoDeObra` (`src/utils/maoDeObraEstimada.ts`) calcula `horas[serviço] × taxa[marca] × fatorMaoDeObra[modelo]`. Liga-se de dois jeitos (efetivo = um OU outro):

- **Global:** `perfilManutencao.incluirEstimativaMaoDeObra` (chip do card de total / Preferências).
- **Por serviço:** `perfilManutencao.estimativaMaoDeObraPorServico[servicoId]` (toggle no `CardServico` do avulso sem valor).

Sem estimativa e sem valor oficial, o serviço vira _pendência_ e o custo da categoria fica _incompleto_.

### Fator de Mão de Obra (`fatorMaoDeObra`)

Multiplicador por modelo aplicado à M.O. estimada (proxy de cilindrada), em `PresetMoto.fatorMaoDeObra` (default `1.0`). Pop 110i e Factor 125i são o fator 1.0 das suas marcas. Ver `docs/dominio/manutencao-estimativas.md`.

### Item-componente / Composição do item de manutenção

O item exibido na categoria Manutenção do Detalhamento (ex.: "Kit relação") **não é uma entidade** — é um **resumo por componente** que funde **duas fontes**: a peça (Insumos) e a M.O. (serviço). A fusão é **só visão** (`montarItensManutencao` em `src/utils/itensManutencao.ts`): o cálculo mantém peça e M.O. em mapas separados (verdade dos totais). O item decide o status (`oficial`/`editado`/`estimado`/`faltando`/`semMaoDeObra`) e o custo (Honda oficial = total; Yamaha/estimado/editado = M.O. + peça; faltando = só peça). Ver adendo da ADR-014.

### MAPA_PECA_PARA_SERVICO

Mapa explícito (`src/utils/calculos.ts`) que liga o `id` de uma peça/pneu ao `id` do serviço que a troca (ex.: `kit_relacao` ↔ `troca-kit-transmissao`, `pneu_traseiro` ↔ `troca-pneu-traseiro`). É a fonte única do vínculo peça↔serviço, usada para resolver intervalo, pular peça no autorizado e fundir o item-componente. Endereçou a DT-15 (REF-29).

### Custo Incompleto / Pendência de Mão de Obra

Quando um serviço avulso ativo está `nao_informado` e sem estimativa, o cálculo registra uma `PendenciaMaoDeObraConcessionaria` e marca `revisao.detalhes.custoIncompleto: true`. A UI mostra "Manutenção (parcial)" + aviso citando quantos serviços faltam. A peça avulsa continua no custo; só falta a M.O. (ADR-012/013).

### Perfil de Peças (`PerfilPecas`)

Tipo: `'original' | 'paralela'`. Define se o Motoboy compra peças originais (mais caras, vida útil maior) ou paralelas. É **global** via `perfil.perfilManutencao.perfilPecasGlobal`. Override por peça existe em `pecasOverrides[]` apenas para **preço** (campos `precoEditadoOriginal` e `precoEditadaParalela`) - o perfil ativo (original ou paralela) é único para todas as peças.

### Perfil de Uso (`PerfilUso`)

Tipo: `'entrega' | 'passageiro'`. Define como a moto é usada:

- **`entrega`:** entregador com baú/caixa. Usa `consumoKmLComBau` (consumo menor por causa do baú).
- **`passageiro`:** transporte de passageiros (Uber Moto, etc). Hoje usa o consumo/intervalo base; o desgaste extra esperado em pneus, freios e suspensão está registrado como DT-18.

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
| `gastosCustom`  | Imprevistos: presets fixos editáveis (Multa, Sinistros, Outros) + sugestões corretivas desligadas por padrão |

⚠️ **Regra crítica (RN-27):** `revisao` **não é fatia separada no donut** da Estimativa; seu custo é incorporado à fatia de `manutencao`. No Detalhamento, revisão aparece como linha dentro do accordion Manutenção e pode ter toggle fino persistido, sem virar categoria própria.

### Gasto Personalizado (`GastoCustom`) - valor único acumulado

Lista fechada de 3 presets em `financeiro.gastosCustom` que o usuário edita direto na seção Imprevistos do Detalhamento: **Multa**, **Sinistros** e **Outros**. Cada item tem `valorAnual` (total acumulado no ano corrente - não recorrência mensal), `ativo` (toggle) e `ehPreset: true` (não deletável). Quando vier custo novo do mesmo tipo, o usuário **edita somando** ao valor anterior. Padrão estabelecido pela TASK-RF-6.9 (consequência da ADR-003 e ADR-006).

⚠️ Imprevistos é a **única categoria editável direto na tela de Detalhamento**. As demais (combustível, internet, seguro, alimentação, financiamento, mão de obra, custos & peças) só são editáveis nas suas telas dedicadas.

### Categoria Display (`CategoriaDisplay`)

Controle de quais categorias estão **ativas** no cálculo exibido. Vive em `configuracaoDisplay.categoriasAtivas`. Tipo:

```typescript
{
  combustivel, alimentacao, manutencao, documentacao,
  internet, seguro, financiamento, imprevistos  // todas: boolean
}
```

⚠️ **Atenção a uma divergência semântica:** o campo no perfil chama-se `documentacao`, mas a categoria de custo no `FiltrosCategorias` chama-se `documentos`. A função `categoriasParaFiltros()` em `utils/calculos.ts` faz a tradução. Não confundir.

⚠️ **`imprevistos`** (adicionado pela RF-6.9) controla tanto `gastosCustom` (presets Multa/Sinistros/Outros) quanto `imprevistosSugeridos` (retíficas) no mapeamento.

Filtros finos de Manutenção vivem em `configuracaoDisplay.filtrosManutencao`:

```typescript
{
  revisao: boolean,
  manutencaoPorPeca: Record<string, boolean>,
  revisaoPorServico: Record<string, boolean>
}
```

Eles persistem a escolha do usuário para "Revisão Geral", peças e serviços de revisão/avulsos exibidos separadamente. Desligar a categoria Manutenção não apaga esses filtros; apenas zera o bloco inteiro enquanto a categoria estiver off.

### Filtros de Categorias (`FiltrosCategorias`)

Estrutura usada **internamente nos cálculos** para decidir quais categorias entram no total. Diferente de `CategoriaDisplay` em três pontos:

1. Tem chave `documentos` (não `documentacao`)
2. Tem chave `revisao` separada (vem de `configuracaoDisplay.filtrosManutencao.revisao`)
3. Tem `manutencaoPorPeca: Record<string, boolean>` para granularidade individual de peças
4. Tem `revisaoPorServico: Record<string, boolean>` para granularidade individual de serviços de revisão exibidos separadamente
5. Tem `imprevistosSugeridos: Record<string, boolean>` para sugestões como retífica de cabeçote e retífica completa

**Invariante crítica:** em `manutencaoPorPeca` e `revisaoPorServico`, item é **ativo** se valor é `true` ou `undefined`. Apenas `false` explícito desativa. Em `imprevistosSugeridos`, a regra é inversa: apenas `true` explícito ativa; `false` ou `undefined` mantém desligado.

### Peça

Item de manutenção mecânica em `PresetMoto.pecas[]`. Cada Peça tem: `id`, `nome`, `intervaloKm` (manual da Honda), `intervaloKmEntrega` (real para motoboy, geralmente menor), `precoOriginal`, `precoParalela`, `incluidoNaRevisaoAutorizada` (se a peça é trocada nas revisões periódicas Honda - ver Modo de Revisão e INV-CALC-3). Exemplos de IDs: `oleo_motor`, `kit_relacao`, `vela_ignicao`, `filtro_ar`.

### Pneu

Tratado separadamente das peças no Preset JSON, em `PresetMoto.pneus[]`. Tem: `id`, `posicao` (`'dianteiro' | 'traseiro'`), `vidaUtilKm`, `precoOriginal`, `precoParalela`. IDs: `pneu_dianteiro`, `pneu_traseiro`.

### Vida Útil

Quilometragem estimada de duração de uma Peça ou Pneu antes de troca. Para Peças: `intervaloKm` ou `intervaloKmEntrega` (do Preset JSON). Para Pneus: `vidaUtilKm`.

**Fonte canônica do intervalo (convenção ADR-014):** a vida útil / intervalo de troca **mora no serviço** (aba Mão de Obra); **Insumos informa apenas o preço da peça, sem vida útil**. O intervalo realista do serviço é **sincronizado com a revisão fixa da marca mais próxima** (Honda ×6.000, Yamaha ×5.000; empate → arredonda para baixo), porque o avulso é executado junto de uma revisão. Excepcionais (pneu Yamaha, retíficas) usam a vida útil direta. A aba Insumos exibe o intervalo efetivo somente leitura. Prioridade de resolução: override de peça → serviço editado → preset (INV-VIDA-UTIL-1). ⚠️ A unificação peça↔serviço hoje depende de o default global estar defasado vs. o preset — fragilidade registrada na **DT-19**.

**Ciclo de troca e km da última troca (RF-6.7):** quando o Motoboy informa o km da última troca de um item no card "Últimas manutenções" (`moto.kmUltimaTrocas`), o cálculo ancora o ciclo nesse km. `CustoPeca.trocasNoAno` passa a contar as trocas dos próximos 12 meses a partir do ponto real do ciclo, e `custoAnual = trocasNoAno × preço`. Sem o km informado, usa o valor amortizado (`trocasNoAno = kmAnual / intervalo`).

### CPK (Custo Por Quilômetro)

**Métrica central do produto.** Custo total de operação dividido pela quilometragem total. Em R$/km. Calculado em `calcularCpkPeca(preco, intervaloKm) = preco / intervaloKm` (por peça) e `calcularCpkCombustivel(preco, consumo) = preco / consumo` (combustível). Exibido no card "CUSTO DE OPERAÇÃO POR KM" em destaque na Estimativa.

**CPK por Evento de Serviço (ADR-004):** formula unificada que combina mão de obra e peças de um mesmo serviço: `CPK_serviço = (precoMaoDeObra + precoPecas) / intervalKm`. O custo anual do serviço = `CPK_serviço × kmAnual`.

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
| 2026-05-19 (v4) | Override, Modo de Revisão, CPK, Vida Útil, Serviço Independente | Adição e atualização por ADR-004 | TASK-REF-11: substituição ServicosMaoDeObra → ServicoIndependente[], fórmula CPK por evento |
| 2026-05-20 (v5) | Modo de Revisão | Confirmação de implementação - fórmula km-based e CPK por serviço agora no calculador | TASK-REF-12 concluída |
| 2026-05-22 (v6) | Modo de Revisão, Peça | Nota de não-duplicação no modo autorizado; campo `incluidoNaRevisaoAutorizada` na Peça | TASK-BG-003 (ADR-006) |
| 2026-05-22 (v7) | Vida Útil | Ciclo de troca ancorado no km da última troca; `CustoPeca.trocasNoAno` | TASK-RF-6.7 (ADR-006) |
| 2026-05-24 (v8) | Modo de Exibição, Diário de Trabalho, Histórico de Manutenção | **Termos eliminados** - conceitos removidos pelas TASK-REF-18/REF-19 (ADR-003, modo único, sem Registros). `Perfil de Peças` atualizado (`perfilPecasOverride` por peça não existe mais). `Categoria Display` ganhou `imprevistos`. Override ganhou nota sobre modo único. | TASK-DOC-009 |
| 2026-06-04 (v9) | Serviço Independente, Modo de Revisão, Vida Útil + **8 termos novos** | `ServicoIndependente` corrigido (`precoIndependente`, `precoTotalAutorizada`, `statusPrecoAutorizada`, `concessionariaIncluiPeca`, `incluidoNaRevisaoAutorizada`). Adicionados: Serviços de Manutenção do Preset, Status do Preço Autorizado, Concessionária Inclui Peça, Estimativa de M.O. (~), Fator de M.O., Item-componente, MAPA_PECA_PARA_SERVICO, Custo Incompleto. Nota MVP (autorizadas) e convenção de intervalo (ADR-014) + DT-19. | TASK-DOC-014 |

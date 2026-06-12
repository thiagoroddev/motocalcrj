# Invariantes do Domínio MotoCalc

> **Status:** Documentação por engenharia reversa em 2026-05-09.
> **Propósito:** Lista centralizada de regras que **nunca podem ser violadas**. Referência para o `tech-lead-revisor` e para qualquer agente que esteja prestes a tomar decisão técnica.

---

## O Que é uma Invariante

Uma invariante é uma **afirmação que precisa ser verdadeira em todo momento da vida do sistema**. Diferente de uma validação de formulário (que checa entrada do usuário), invariante é regra interna que o código deve garantir.

Exemplo: "kmFinal > kmInicial" não é só uma validação é uma propriedade que, se violada, **o sistema entrou em estado inconsistente**.

Quando uma invariante é violada, o problema não é "input do usuário ruim" é **bug do sistema**. Por isso elas são protegidas pelas raízes de aggregate, no código, antes que dados ruins entrem.

---

## Invariantes Mapeadas

### Invariantes do Aggregate Perfil

#### INV-PERFIL-1: Consistência do Preset Ativo
**Regra:** Se `presetAtivoId !== null`, então existe um Preset em `presets[]` com esse `id`.

**Por quê:** O Preset Ativo alimenta os cálculos exibidos na tela. Apontar para um Preset que não existe causaria tela em branco ou erro. Esta é a invariante mais crítica do aggregate.

**Onde é protegida:**
- `PerfilReducer` actions que removem Preset cuidam para reposicionar `presetAtivoId`
- `CARREGAR_PERFIL` recebe apenas `presetId` e o reducer resolve o Preset internamente; id inexistente não altera o estado
- `criarEstadoInicial` recupera storage parcial selecionando `presets[0]` quando a chave ativa está ausente ou aponta para id inexistente
- `useEffect` de persistência exige `presetAtivoId` e ausência de `rascunhoPredefinicao`

**Como validar:** verificar que toda action que muda `presets` ou `presetAtivoId` mantém a propriedade.

---

#### INV-PERFIL-2: Persistência Condicional ao Onboarding Completo
**Regra:** O Perfil só é persistido quando `presetAtivoId` existe e não há
`rascunhoPredefinicao`.

**Por quê:** Dados parciais de onboarding incompleto (Motoboy abandonou no Passo 4) **não devem poluir o storage**. Próxima abertura do app deve mostrar onboarding do zero, não estado bagunçado.

**Onde é protegida:**
- `useEffect` em `PerfilContext.tsx`:
  ```typescript
  useEffect(() => {
    if (!estado.presetAtivoId || estado.rascunhoPredefinicao) return
    storageRef.current.salvarPresets(estado.presets)
  }, [estado])
  ```

⚠️ **Cuidado:** remover esse guard "para simplificar" é violação grave. Foi tomada decisão consciente de domínio.

#### INV-PERFIL-2A: Sufixo único por modelo

**Regra:** predefinições do mesmo `perfil.moto.modelo` não podem compartilhar o mesmo sufixo após
normalização de caixa e espaços. O limite é 15 caracteres.

**Onde é protegida:** helpers em `src/utils/predefinicoes.ts`, criação, renomeação e normalização da
fronteira de carga.

---

#### INV-PERFIL-3: Acesso Isolado ao localStorage
**Regra:** Toda leitura/escrita em `localStorage` para dados do Perfil passa por `services/perfilStorage.ts`. Componentes, hooks, context **nunca** acessam `localStorage` diretamente.

**Por quê:** Centralizar permite (a) trocar implementação no futuro (IndexedDB, sync com servidor), (b) garantir formato consistente, (c) controlar versionamento de schema.

**Status:** Listada como **Proibição Absoluta** no `contexto-base`. Tecnicamente é regra de arquitetura, mas tem peso de invariante de domínio porque protege integridade de dados.

---

#### INV-PERFIL-4: Domínio Numérico do Perfil
**Regra:** valores persistidos de dinheiro, KM, histórico e contadores não podem ser negativos. Campos usados como denominador de cálculo devem ser positivos (`> 0`), como autonomia de combustível, `kmPorDia`, `diasPorSemana` e intervalos km-driven.

**Exceção:** `ServicoIndependente.intervalKm === 0` é permitido apenas para serviços temporais conhecidos cujo driver não é quilometragem (ex.: bateria). Para serviços km-driven, `intervalKm` precisa ser `> 0` (ver INV-MANUT-1).

**Por quê:** custo negativo, `Infinity` ou `NaN` corrompem o resultado da estimativa e podem se propagar para breakdown, CPK e granularidades.

**Onde é protegida:**
- Inputs numéricos rejeitam negativos/zero proibido antes de despachar actions
- `perfilSchema` valida domínio numérico na fronteira de persistência (ADR-010)
- `perfilReducer` valida o perfil resultante com `perfilSchema.safeParse` antes de aceitar actions
- `utils/calculos.ts` aplica guardas defensivas para denominadores e custos

**Como validar:** testes de schema, reducer, UI e cálculos devem cobrir negativos, denominadores zero e exceção temporal da bateria.

---

#### INV-PERFIL-5: Referências persistidas pertencem ao preset canônico

**Regra:** overrides, índices de revisão e mapas de preferência do perfil só podem referenciar
peças, pneus, serviços e revisões existentes no preset resolvido por `perfil.moto.modelo`.

**Por quê:** referências órfãs são dados mortos e um ID reutilizado poderia reativar uma escolha
antiga sem intenção do usuário.

**Onde é protegida:**
- `normalizarPerfilContraPreset` filtra as sete coleções relacionais após a validação estrutural;
- `criarEstadoInicial` aplica a normalização a todos os `PresetEntry`;
- quando há remoção, a lista limpa é persistida em best-effort sem alterar timestamps.

**Como validar:** testes da transformação pura cobrem peças, pneus, serviços excepcionais,
serviços sem custo, revisões e mapas; testes da carga cobrem múltiplos perfis, no-op e falha de
persistência.

---

### Invariantes do Aggregate Preset

#### INV-PRESET-1: kmAnual é Derivada
**Regra:** `kmAnual = kmDia × diasSemana × 52`. **Nunca** calcular como `kmMensal × 12`.

**Por quê:** Decisão de domínio explícita do `contexto-base`. Calcular via mês perde fidelidade (52 semanas vs 12 meses não são equivalentes). Motoboy trabalha por dias da semana, não por mês.

**Onde é protegida:** `utils/calculos.ts`.

---

#### INV-PRESET-2: Imutabilidade de Predefinidos
**Regra:** Preset com `origem === 'predefinido'` (vindo de JSON em `src/presets/`) **nunca** pode ser modificado em runtime.

**Por quê:** Garante que o app sempre tenha um ponto de partida confiável. Edições do Motoboy geram cópias com `origem === 'personalizado'`.

**Onde é protegida:** Listada como **Proibição Absoluta** no `contexto-base`.

---

#### INV-PRESET-3: Consumo Médio Positivo
**Regra:** `preset.moto.consumoMedio > 0`.

**Por quê:** Cálculo de combustível faz divisão por consumo. Zero ou negativo quebra o sistema.

**Onde é protegida:** validação de formulário de cadastro de moto + (idealmente) factory function de Moto.

---

### Invariantes de Cálculo

#### INV-CALC-1: Filtros com Semântica Tristate
**Regra:** Em `filtros.manutencaoPorPeca` e `filtros.revisaoPorServico`, item é considerado **ativo** se valor for `true` ou `undefined`. Apenas `false` explícito desativa.

Em `filtros.imprevistosSugeridos`, a semântica é diferente: item é considerado **ativo** apenas se valor for `true`. `false` ou `undefined` mantém desligado.

**Por quê:** Permite armazenar apenas as exceções (peças desativadas) ao invés do estado completo. Estado mínimo.

**Onde é protegida:** `utils/calculos.ts`. Verificação canônica:
```typescript
if (filtros.manutencaoPorPeca[pecaId] !== false) {
  // peça ativa
}

if (filtros.revisaoPorServico[servicoId] !== false) {
  // serviço ativo
}

if (filtros.imprevistosSugeridos[imprevistoId] === true) {
  // imprevisto sugerido ativo
}
```

⚠️ **Anti-padrão a evitar:**
```typescript
// ERRADO quebra a invariante
if (filtros.manutencaoPorPeca[pecaId] === true) {
  // peças sem entrada explícita ficam de fora!
}

if (filtros.revisaoPorServico[servicoId] === true) {
  // serviços sem entrada explícita ficam de fora!
}

// ERRADO: para imprevistos sugeridos, undefined não pode ativar custo
if (filtros.imprevistosSugeridos[imprevistoId] !== false) {
  // retíficas entrariam ligadas por padrão
}
```

---

#### INV-CALC-2: utils/calculos.ts requer aprovação explícita para modificação
**Regra:** O arquivo `src/utils/calculos.ts` **nunca pode ser modificado** sem decisão explícita do usuário.

**Por quê:** núcleo de cálculo coberto por densa suíte de testes (ver `npm run test`). Modificação acidental quebraria comportamento testado e validado. O gate foi concedido explicitamente para a série REF-32 (manutenção MVP).

**Status:** Listada como **Proibição Absoluta** no `contexto-base`.

✅ **ADR-004 executado e concluído (TASK-REF-12):** fix fórmula Honda km-based, aplicação de `revisaoAutorizadaOverrides` e CPK por serviço independente implementados e testados. Qualquer outra modificação continua exigindo decisão explícita.

⚠️ **Cuidado:** isso não significa que o arquivo é "perfeito" significa que está **estável e testado**. Refatoração futura pode acontecer com aprovação explícita e plano de migração.

---

#### INV-CALC-3: Sem dupla contagem de peças no modo autorizado
**Regra:** No modo de revisão `autorizadas`, peças do Preset JSON com `incluidoNaRevisaoAutorizada === true` **não** entram no cálculo por peça (`calcularCpkPorPeca`). No modo `independentes`, todas as peças entram.

**Por quê:** O orçamento oficial Honda já inclui óleo, vela e filtro de ar nas revisões periódicas (ver `valores-mao-de-obra-honda-pop110i-2024-RJ.md`). Como o custo dessas peças já está no pacote `revisaoAutorizada`, contá-las também pelo CPK por peça inflaria o total. No modo `independentes` não há sobreposição: a revisão conta apenas mão de obra.

**Onde é protegida:**
- `src/utils/calculos.ts` - `calcularCpkPorPeca` recebe `modoRevisao` e filtra `preset.pecas` por `incluidoNaRevisaoAutorizada` quando `modoRevisao === 'autorizadas'`. Pneus nunca são filtrados (não fazem parte das revisões periódicas).

**Origem:** ADR-006 / TASK-BG-003.

---

### Invariantes de Manutenção

#### INV-MANUT-1: intervalKm de ServicoIndependente
**Regra:** serviços de manutenção com driver por km usam `ServicoIndependente.intervalKm > 0`.
Serviços temporais conhecidos, como `troca-bateria`, podem usar `intervalKm === 0` como marcador de "sem driver por km".

**Por quê:** para serviços km-driven, `intervalKm` é denominador do CPK por serviço (`precoMaoDeObra / intervalKm`). Zero ou negativo geraria divisão por zero ou custo negativo. Serviços temporais não entram nesse denominador e são tratados por caminho específico.

**Onde é protegida:** Case `SET_SERVICO_INDEPENDENTE` no `perfilReducer` (`PerfilContext.tsx`):
```typescript
if (!servicoIndependenteComIntervaloValido(action.payload)) return state; // INV-MANUT-1
```

⚠️ **Cuidado:** a action não lança erro - ela silenciosamente ignora a atualização. Componentes de UI devem validar o campo antes de despachar para dar feedback ao usuário.

---

#### INV-VIDA-UTIL-1: ServicoIndependente é fonte canônica de intervalKm para peças vinculadas
**Regra:** Para peças vinculadas via `MAPA_PECA_PARA_SERVICO`, o serviço efetivo é a fonte
canônica de `intervalKm`, esteja ativo ou não. `ativo` controla a inclusão do custo do serviço,
não a vida útil da peça. O preset fornece o intervalo-base; o perfil só o substitui quando
`intervaloKmInformadoUsuario === true`. A tela Insumos exibe o valor efetivo como somente leitura
e a aba Mão de Obra permite editá-lo. Prioridade completa: override explícito de peça → serviço
efetivo → fallback da peça/pneu no preset quando não houver serviço vinculado.

**Por quê:** Cálculo, Mão de Obra, Insumos e Detalhamento precisam usar uma única origem sem
inferir procedência pela diferença contra um default global. A flag distingue edição consciente
do usuário de valor-base publicado pelo preset.

**Onde é protegida:**
- `src/utils/servicosManutencaoPreset.ts` - mescla preset/perfil e só aceita o intervalo do perfil
  quando a flag de procedência está presente.
- `src/utils/calculos.ts` - `resolverServicoPorPeca` e `resolverIntervaloPeca` aplicam a prioridade
  canônica; `calcularCustosPorCategoria` resolve a lista efetiva na fronteira.
- `src/pages/PaginaInsumos.tsx` e `src/components/detalhamento/DialogEdicaoCusto.tsx` usam a mesma
  lista efetiva.

**Histórico:** a TASK-REF-29 criou o vínculo explícito peça-serviço. A TASK-REF-42 removeu a
inferência pelo default global, adicionou a procedência explícita e encerrou a DT-19.

---

#### INV-MANUT-2: Estimativa de M.O. é opt-in e sempre marcada (ADR-013)
**Regra:** mão de obra **estimada** nunca entra no custo silenciosamente. Só conta quando o usuário liga — global (`perfilManutencao.incluirEstimativaMaoDeObra`) **ou** por serviço (`estimativaMaoDeObraPorServico[id]`) — e é sempre rotulada com `~` (`CustoServicoRevisao.maoDeObraEstimada === true`). Sem estimativa e sem valor oficial, o serviço vira **pendência** (`custoIncompleto`), não custo presumido.

**Por quê:** honestidade do número (ADR-012/013). O usuário precisa distinguir valor real de estimativa aproximada.

**Onde é protegida:**
- `src/utils/calculos.ts` - `calcularDetalhesRevisaoAnual` e `calcularImprevistosSugeridosAnual`: `moEstimada` só estima quando `incluirEstimativa || estimativaPorServico[id]`.
- `src/utils/maoDeObraEstimada.ts` - `estimarMaoDeObra` retorna 0 sem tempário (sem base, sem estimativa).

---

#### INV-MANUT-3: Anti-duplicação peça↔serviço por componente (ADR-014)
**Regra:** no modo autorizado, a peça avulsa só é **pulada** do CPK quando o serviço vinculado tem preço **oficial que inclui a peça**: `resolverStatusPrecoAutorizada(servico) === 'informado' && concessionariaIncluiPeca !== false` (caso Honda). `informado_usuario` (edição = só M.O.), `nao_informado` e estimado **mantêm a peça** (somam). A fusão em **1 item por componente** é **só visão** — o cálculo mantém peça (`manutencao`) e M.O. (`revisao.servicos`) em mapas separados.

**Por quê:** evitar dupla contagem (Honda informa peça+M.O. juntas) sem perder a peça nos casos em que a concessionária informa só M.O. (Yamaha) ou o valor é estimado/editado/ausente.

**Onde é protegida:**
- `src/utils/calculos.ts` - `ehPecaCobertaPorServicoAutorizada` (gate do pulo).
- `src/utils/itensManutencao.ts` - `montarItensManutencao` (composição como visão, status `oficial`/`editado`/`estimado`/`faltando`/`semMaoDeObra`).

**Origem:** ADR-014 / TASK-REF-32.6.

---

### Invariantes de Conventions (Domínio + Arquitetura)

Estas invariantes tecnicamente são convenções de código, mas se violadas comprometem a integridade do domínio (mistura de linguagens, perda da Linguagem Ubíqua):

#### INV-CONV-1: Tudo em Português
**Regra:** Variáveis, funções, componentes, hooks, tipos, comentários, testes tudo em português.

**Por quê:** O domínio é em português (Motoboy, Rodagem, Preset). Misturar inglês cria duas linguagens em paralelo. **A Linguagem Ubíqua exige consistência.**

**Onde é protegida:** Convenção do `contexto-base`. ESLint/regras de revisão poderiam reforçar.

---

#### INV-CONV-2: Sem `any` no TypeScript
**Regra:** Tipo `any` é proibido. Sempre usar tipos específicos.

**Por quê:** `any` quebra todas as garantias de tipo. Em sistema de domínio rico, perder tipos = perder invariantes em compile-time.

**Onde é protegida:** `tsconfig.json` (strict: true) + revisão.

---

## Como Esta Lista é Usada

### Pelo `tech-lead-revisor`
Antes de aprovar uma task como concluída, percorrer esta lista verificando se nenhuma invariante foi violada pela implementação.

### Pelo `modelador-dominio`
Ao modelar conceito novo, identificar invariantes específicas dele e adicionar aqui.

### Pelo `software-craftsman` (futuro `engenheiro-de-design`)
Ao propor refatoração, garantir que invariantes existentes continuam protegidas após a mudança.

### Pelo `qa-engineer`
Cada invariante deveria, idealmente, ter ao menos um teste que tenta violá-la e verifica que o sistema impede.

---

## Diferença entre Invariante, Validação e Restrição

| Conceito | Onde vive | Quando dispara |
|---|---|---|
| **Invariante** | Domínio (raiz de aggregate) | Sempre o sistema garante |
| **Validação** | UI / formulário | Na entrada do usuário |
| **Restrição** | Banco / storage | Na persistência |

Exemplo prático: "kmFinal > kmInicial" pode aparecer como:
- **Invariante:** método `Rodagem.criar()` rejeita criar rodagem inválida.
- **Validação:** formulário desabilita botão se km final for menor.
- **Restrição:** schema do storage rejeita registro inválido.

Idealmente, **as três camadas concordam**. A invariante é a "última linha de defesa".

---

## Lista de Invariantes Não Mapeadas (TODO)

Quando o `modelador-dominio` for chamado para tasks específicas, expandir esta lista com:

- Invariantes de Registros de Gasto (TASK-5.x)
- Invariantes de Registros de Rodagem (TASK-5.x)
- ~~Invariantes de Vida Útil de Peças~~ - ver INV-VIDA-UTIL-1 (adicionada em 20/05/26 por TASK-DOC-005)
- ~~Invariantes de Mão de Obra~~ - adicionado INV-MANUT-1 por TASK-REF-11
- Invariantes específicas das funções de cálculo (granularidade, totalização)

---

## Histórico de Mudanças

| Data | Invariante | Mudança | Motivo |
|---|---|---|---|
| 2026-05-09 | (todas as iniciais) | Criação | Engenharia reversa |
| 2026-05-19 | INV-CALC-2 | Nota de autorização ADR-004 para TASK-REF-12 | Conflito com proibição absoluta resolvido por decisão explícita |
| 2026-05-19 | INV-MANUT-1 | Nova - `ServicoIndependente.intervalKm > 0` | TASK-REF-11: novo tipo substitui ServicosMaoDeObra |
| 2026-05-20 | INV-CALC-2 | ADR-004 concluído - 96 testes; nota de autorização convertida em confirmação de execução | TASK-REF-12 concluída |
| 2026-05-20 | INV-VIDA-UTIL-1 | Nova - fonte canônica de intervalKm para peças com ServicoIndependente vinculado | TASK-DOC-005: gap identificado na revisão geral do bloco ADR-004 |
| 2026-05-22 | INV-CALC-3 | Nova - sem dupla contagem de peças no modo autorizado | TASK-BG-003 (ADR-006) |
| 2026-06-04 | INV-MANUT-2, INV-MANUT-3 | Novas - estimativa de M.O. opt-in (`~`, ADR-013) e anti-duplicação peça↔serviço por componente (ADR-014); nota DT-19 em INV-VIDA-UTIL-1; INV-CALC-2 contagem de testes → ponteiro `npm run test` | TASK-DOC-014 |
| 2026-06-06 | INV-VIDA-UTIL-1 | Serviço efetivo passa a ser fonte explícita; procedência do usuário deixa de ser inferida pelo default global | TASK-REF-42 / ADR-018 |

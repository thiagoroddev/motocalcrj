Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

## TASK-REF-15 — Substituir header duplicado de PaginaAjustes por CabecalhoVoltar
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Identificado em revisão de TASK-BG-001. PaginaAjustes implementa seu próprio header (linhas 125–145) com SVG inline do ícone de voltar, duplicando exatamente o que `CabecalhoVoltar` em `src/components/CabecalhoVoltar.tsx` já oferece. Manutenção dobrada e risco de divergência visual futura quando CabecalhoVoltar for atualizado.

---

## Revisão geral das telas de configuração — ADR-005 e ADR-006 (20/05/26)

> Tarefas geradas pela revisão geral de Mão de Obra, Custos & Peças, Ajustes e Perfil.
> Decisões formalizadas em `docs/arquitetura/ADR/ADR-005.md` (responsabilidades entre telas) e `ADR-006.md` (cálculo de manutenção).
> Todas marcadas como IMEDIATA: precisam ser executadas com o contexto da revisão ainda fresco. Cada tarefa inclui testes como critério de conclusão (`docs/padrao-testes.md`).

## TASK-BG-003 — Modo autorizado: cálculo por peça exclui itens cobertos pela revisão Honda
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:** Bug de dupla contagem confirmado na revisão de 20/05/26. Hoje `calcularCpkPorPeca` (`src/utils/calculos.ts`) roda incondicionalmente em `calcularCustosPorCategoria` e o resultado é somado ao total nos dois modos. No modo autorizado o total já inclui o pacote Honda (`revisaoAutorizada[].precoPecas`). O doc oficial `docs/dominio/valores-mao-de-obra-honda-pop110i-2024-RJ.md` confirma a sobreposição: óleo trocado nas 7 revisões, vela em 24k/36k, filtro de ar em 18k/36k — esses consumíveis são contados 2×. **Fix:** adicionar campo booleano `incluidoNaRevisaoAutorizada` em cada peça do Preset JSON (`src/presets/pop110i.json`) e no tipo `PecaPreset` (`src/types/calculos.ts`); `calcularCpkPorPeca` pula peças com `incluidoNaRevisaoAutorizada: true` quando `modoRevisao === 'autorizadas'`. Itens que SEMPRE entram pelo cálculo por peça (fora da revisão): pneu dianteiro, pneu traseiro, kit relação/transmissão, sapata de freio, bateria (futuro), retíficas. Itens cobertos pela revisão (pular no modo autorizado): óleo, vela, filtro de ar. Modo independente fica inalterado (revisão = só MO, sem duplicação). Modifica `calculos.ts` — autorizada pela ADR-006 (INV-CALC-2). Atualizar `docs/dominio/invariantes.md` e `_glossario.md` ao concluir. Inclui testes em `calculos.test.ts`.

## TASK-RF-6.7 — km das últimas manutenções alimenta o cálculo do ciclo
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:** Hoje os campos do card "Últimas manutenções" (`moto.kmUltimaTrocas`: oleo, pneuDianteiro, pneuTraseiro, kitRelacao; e `moto.kmMotorRefeito`) são gravados no perfil mas NENHUMA função de `src/utils/calculos.ts` os lê — confirmado por busca na revisão de 20/05/26. Também `proximaTrocaKm` (em `calcularCpkPorPeca`, ~linha 255) usa `Math.ceil(kmAtual / intervalo) × intervalo`, presumindo troca em múltiplos exatos do intervalo a partir de 0 km. **Fix:** quando `kmUltimaTrocas[item] > 0`, calcular o ciclo a partir do km informado — `proximaTrocaKm = kmUltimaTrocas[item] + intervalo` — e a contagem de trocas/ano usa esse ponto de partida real; quando o km não foi informado (0), manter comportamento atual. **Atenção ao mapeamento de IDs:** as chaves de `kmUltimaTrocas` (oleo, pneuDianteiro, pneuTraseiro, kitRelacao) divergem dos IDs de peça do Preset (`oleo_motor`, `pneu_dianteiro`, `pneu_traseiro`, `kit_relacao`) — ver DT-15; precisa de um mapa explícito. Modifica `calculos.ts` — autorizada pela ADR-006. Inclui testes.

## TASK-REF-16 — Remover toggles de ativar/desativar da aba Mão de Obra
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:** A aba Mão de Obra (`src/pages/PaginaMaoDeObra.tsx`, componente `CardServico`) tem hoje um `Switch` por serviço ligado a `TOGGLE_SERVICO_INDEPENDENTE` → `ServicoIndependente.ativo`. Pela ADR-005, ativar/desativar é exclusivo do Detalhamento. **Escopo:** (1) remover o `Switch` de `CardServico`; (2) o campo `ativo` PERMANECE no modelo, mas passa a ser controlado pelo Detalhamento (`PaginaDetalhamento`/`SecaoManutencao`), no mesmo padrão de `manutencaoPorPeca` e `TOGGLE_GASTO_CUSTOM` — expor toggle por serviço independente na lista de manutenção do Detalhamento. A action `TOGGLE_SERVICO_INDEPENDENTE` continua existindo, só muda quem a dispara. Decidir como serviços excepcionais (retíficas) se comportam sem o toggle de M. Obra. Inclui testes.

## TASK-REF-17 — Reset sempre visível em todos os cards de config + confirmação
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:** Hoje o `IconeReset` (duplicado idêntico em `PaginaMaoDeObra.tsx` e `PaginaVidaUtil.tsx`) só aparece quando há override (`visivel={temOverride}`); sem override renderiza um `<div>` vazio — por isso "a maioria dos cards está sem botão de reset". Decisão do usuário: todo card tem botão de reset SEMPRE visível (desabilitado/esmaecido quando não há o que resetar), mais um reset geral ao fim de cada tela/seção. **Escopo:** (1) extrair `IconeReset` para `src/components/` (hoje copiado em 2 arquivos); (2) deixá-lo sempre visível, estado desabilitado quando `!temOverride`; (3) garantir reset geral ao fim de cada aba de M. Obra e de cada seção de Custos & Peças; (4) reset individual e geral pedem confirmação — usar `Dialog` do shadcn como já feito em `PaginaAjustes`. Cards afetados: `LinhaRevisaoHonda`, `CardServico` (M. Obra); `CardCombustivel`, `CardItemPreco` (Custos & Peças). Inclui testes.

## TASK-REF-18 — Remover modoExibicao, toggle "Estimativa sobre dados" e aba Registros
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-003, ADR-006
- **Observações:** A ADR-003 removeu Registros e o toggle de modo de cálculo, mas o mecanismo permaneceu e a TASK-REF-14 reexpôs o toggle "Estimativa sobre dados" (predefinidos/personalizado) em `SecaoPreferencias.tsx` — violando a ADR-003. Sem Registros, `modoExibicao === 'personalizado'` nunca tem dados (código morto). **Escopo:** (1) remover o 2º `Segmentado` ("Estimativa sobre dados") de `src/components/ajustes/SecaoPreferencias.tsx`; (2) remover `configuracaoDisplay.modoExibicao` + action `SET_MODO_EXIBICAO` + toda a ramificação `modoExibicao` de `calculos.ts` (`resolverKmDia`, `resolverIntervaloPeca`, `resolverPrecoPeca`, `calcularCpkPorPeca` — app passa a ter modo único baseado em preset); (3) excluir `src/pages/PaginaRegistros.tsx` (já sem rota em `App.tsx`); (4) avaliar remoção de `diarioTrabalho`/`historicoManutencao` e do adapter `adaptarHistoricoParaRegistros`, que só serviam ao modo personalizado. **Cuidado:** várias actions do reducer setam `modoExibicao: 'personalizado'` — mapear todas. Ação destrutiva (exclusão de arquivo) — confirmar antes. Modifica `calculos.ts` — autorizada pela ADR-006. Ajustar testes existentes em `calculos.test.ts`.

## TASK-REF-19 — Excluir campos mortos legados do modelo
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Campos do modelo não lidos por nenhuma UI nem pelo cálculo (confirmado na revisão de 20/05/26): (1) `configuracaoDisplay.modoOficinDisplay` + action `SET_MODO_OFICINA` — nunca despachada, nunca lida; a modelagem (`docs/dominio/modelagem/bloco-configuracao-display.md`) já marca como "redundância pendente"; (2) `perfilManutencao.precoMaoDeObraIndependente` e `perfilManutencao.frequenciaRevisaoKm` — aposentados pela ADR-004/TASK-REF-12, mantidos "por compat" mas sem uso real (`frequenciaRevisaoKm` só aparece em `calcularKmParaProximaRevisao`, função tampouco usada por UI). **Escopo:** remover os 3 campos de `PerfilUsuario` (`src/types/perfil.ts`), de `perfilPadrao` (`PerfilContext.tsx`), do reducer (case `SET_MODO_OFICINA` + tipo da action), das fixtures (`src/fixtures/usuario_teste.json`) e da função `migrarPerfil`. Bump de `schemaVersion` + migração que remove os campos de perfis salvos. Inclui testes do reducer/migração.

## TASK-BG-004 — RESETAR_AJUSTES_PADRAO deve zerar valores, não assumir custos
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:** Hoje `RESETAR_AJUSTES_PADRAO` (`PerfilContext.tsx`, ~linha 649) volta a valores COM custo embutido: `alimentacaoDia: 20`, `seguro.valorAnual: 929.96`. Pela ADR-005, o reset deve ZERAR — o app nunca presume gastos. **Escopo:** ajustar o case para zerar `internet`, `alimentacaoDia`, `seguro` (valorAnual 0) e esvaziar `gastosCustom`. Decidir o tratamento de `kmPorDia`/`diasPorSemana` (são uso, não custo — provavelmente manter um padrão de uso e não zerar, pois 0 km/dia quebra divisões no cálculo). Revisar o texto do `Dialog` de confirmação em `PaginaAjustes.tsx` para refletir o novo comportamento. Inclui testes do reducer.

## TASK-REF-21 — Unificar booleanos de presença de custo (seguro.tem)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** TASK-REF-18
- **REQ/ADR/DT:** ADR-005
- **Observações:** Pela ADR-005, um custo está presente sse `valor > 0`. O booleano `seguro.tem` (em `SeguroConfig`) duplica essa noção e hoje só pode ser ligado no onboarding (`Passo7.tsx`) — `SecaoFinanceiro` não tem como ligá-lo, então editar o valor do seguro em Ajustes não tem efeito se `tem === false` (achado B-1 da revisão de 20/05/26). **Escopo:** remover `seguro.tem`; `calcularCustoSeguroAnual` passa a depender só de `valorAnual > 0`; ajustar `SeguroConfig`, reducer, `Passo7.tsx`, `PassoConfirmacao.tsx`, `calculos.ts` e o `categoriasAtivas.seguro` derivado. Excluir `src/components/ajustes/CampoSwitch.tsx` — criado por REF-14 mas nunca usado (código morto); pela ADR-005 não há switch em Ajustes. Bump de schema + migração. Inclui testes.

## TASK-RF-6.8 — Cards de revisão Honda exibem peças substituídas e serviços executados
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:** Cada card de revisão na aba M. Obra (`LinhaRevisaoHonda` em `PaginaMaoDeObra.tsx`) deve mostrar quais peças são substituídas e quais serviços executados naquela revisão — informação ao usuário sobre o que está pagando. **Fonte:** `docs/dominio/valores-mao-de-obra-honda-pop110i-2024-RJ.md`, seção "Detalhamento por Revisão" (itens substituídos + serviços executados, revisões de 1k a 36k). **Escopo:** estruturar os dados no Preset JSON (`pop110i.json` → `revisaoAutorizada[].itensSubstituidos[]` e `.servicosExecutados[]`) e no tipo `RevisaoAutorizadaPreset` (`src/types/calculos.ts`); UI sugerida — bloco expansível/colapsável dentro do card. Predominantemente UI; inclui testes se houver lógica.

## TASK-RF-6.10 — Substituir "fazer motor" por retífica de cabeçote e retífica completa
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:** Decisão do usuário (20/05/26): o serviço hoje chamado "fazer motor" (`SERVICOS_INDEPENDENTES_PADRAO` em `PerfilContext.tsx`, id `fazer-motor`, `ehExcepcional: true`, `intervalKm: 70000`) vira DOIS itens, conforme `valores-mao-de-obra-honda-pop110i-2024-RJ.md` seção "Manutenção Corretiva": "Retífica de cabeçote" (~80.000–100.000 km, uso intenso) e "Retífica completa" (~120.000–150.000 km). **Escopo:** substituir o item `fazer-motor` por `retifica-cabecote` e `retifica-completa` em `SERVICOS_INDEPENDENTES_PADRAO`, com intervalos e preços coerentes com o doc; ajustar a `migrarPerfil` (perfis salvos têm o id antigo); revisar o aviso `kmAtual >= 70000` na aba Excepcional para os novos thresholds. Inclui testes do reducer/migração.

## TASK-RF-6.9 — Completar a categoria Imprevistos no Detalhamento
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:** A categoria Imprevistos (`src/components/detalhamento/SecaoImprevistos.tsx`) está incompleta. Finalidade (decisão do usuário): incluir um gasto arbitrário escolhendo (1) uma categoria, (2) o valor, (3) um nome livre. Hoje `GastoCustom` (`types/perfil.ts`) tem só `{id, nome, valorMensal, ativo}` — FALTA o campo de categoria. O texto-placeholder atual de `SecaoImprevistos` ainda manda o usuário ir à "aba Registros" (removida) — corrigir. **Escopo:** adicionar `categoria` a `GastoCustom`; criar o formulário de adição (nome + categoria + valor); ajustar a action `ADD_GASTO_CUSTOM`; remover a menção a Registros e ao modo Personalizado. Bump de schema + migração. Inclui testes.

## TASK-RF-6.11 — Clicar num custo no Detalhamento direciona à edição correspondente
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 20/05/26
- **Dependências:** TASK-REF-16, TASK-REF-17
- **REQ/ADR/DT:** ADR-005
- **Observações:** Pela ADR-005 o Detalhamento só ativa/desativa, não edita. Para facilitar, clicar num custo (linha de peça, serviço, combustível, etc.) deve direcionar à tela/popup de edição correspondente — M. Obra, Custos & Peças ou Ajustes, conforme o item. **A decidir na execução:** navegação para a tela com scroll/destaque do campo, ou popup inline. Tarefa de UI/navegação; depende de REF-16/17 estabilizarem onde cada custo é editado. Inclui testes se houver lógica de roteamento.

## TASK-RNF-10 — Acessibilidade dos inputs das telas de configuração
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Achado da revisão de 20/05/26: nas seções de Ajustes (`SecaoVeiculo`, `SecaoUltimasManutencoes`, `SecaoFinanceiro`, `SecaoUsoDiario`) e em Custos & Peças, os labels são `<p className="text-xs">` soltos ao lado do `<Input>`, sem associação `htmlFor`/`id` — leitor de tela não associa e toque no label não foca o campo. Faltam também `inputMode` (`numeric`/`decimal`) nos campos numéricos. **Escopo:** usar `<Label htmlFor>` do shadcn + `id` no `Input` (o componente já suporta `forwardRef`); adicionar `inputMode` apropriado. `CampoSwitch.tsx` já faz a associação certa — usar como referência (se ainda não removido pela REF-21). Predominantemente UI.

## TASK-DOC-008 — Padronizar nome da tela para "Custos & Peças"
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** ADR-004
- **Observações:** A tela tem hoje 4 nomes diferentes: rota `/vida-util` (`App.tsx`), componente `PaginaVidaUtil`, label `AUTONOMIA` na NavBar (`NavBar.tsx`) e "Preço Peças" na ADR-004. Decisão do usuário (20/05/26): padronizar como "Custos & Peças". A autonomia (km/L) PERMANECE nessa tela, junto dos combustíveis (decisão confirmada — autonomia é por tipo de combustível, separá-la duplicaria campos). **Escopo:** alinhar rota, nome do componente/arquivo (`PaginaVidaUtil.tsx` → `PaginaCustosPecas.tsx`), label da NavBar e referências em docs (ADR-004, `contexto-projeto-ai.md`, modelagem). Renomeação de arquivo — confirmar antes. Refactor mecânico/cosmético.

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo); adicionar bateria e sapata de freio ao card "Últimas manutenções".

---

### Tarefas Normais


## ~~Registros e Formulários (Fase 6 do roadmap original)~~ ADIADO (ADR-003)

> **ADR-003:** Removido do escopo do MVP. A ser considerado como melhoria futura após o app estar em produção. Ver `docs/arquitetura/ADR/ADR-003.md`.

---

## Mão de Obra, Preço Peças e Perfil (Fases 7, 8 e 10)

> **ADR-004:** Modelo de Eventos por Serviço — MO e peças calculadas por CPK separados, unidos pelo `intervalKm` do serviço. TASK-REF-11 e TASK-REF-12 são pré-requisitos das abas UI.

_(TASK-RF-6.3.2, 6.3.3, 6.3.4 concluídas — ver índice)_

---

## Decisões de UI/UX Pendentes

| ID          | Título                                           | Valor      | Urgência   | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------ | ---------- | ---------- | ------- | ------------ | ------ |
| TASK-RF-6.4 | Conteúdo dos pop-ups de ajuda (ícone "?")        | Desejável  | Quando Der | P       | -            | [ ]    |
| TASK-RF-6.5 | Seletor rápido de presets (ícone moto no header) | Desejável  | Quando Der | M       | -            | [ ]    |
| TASK-RF-6.6 | Decisão: hamburguer vs nav sempre visível        | Importante | Normal     | P       | -            | [ ]    |

---

## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |
| ~~TASK-RF-7.2~~ | ~~Histórico e alertas de manutenção (próxima troca)~~ **ADIADO** com RF-5.x (ADR-003) | Importante | Normal   | G       | RF-5.x       | [ ]    |

---

## Analytics, PWA e Play Store (Fases 9 e 13)

| ID           | Título                                         | Valor      | Urgência | Esforço | Dependências | Status |
| ------------ | ---------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RNF-8.1 | Analytics (Umami) - trackEvent centralizado    | Importante | Normal   | M       | -            | [ ]    |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Crítico    | Normal   | G       | TASK-RNF-8.1 | [ ]    |
| TASK-RNF-8.3 | TWA - publicação na Google Play Store          | Crítico    | Normal   | G       | TASK-RNF-8.2 | [ ]    |

---

## Qualidade e Polimento (Fase 10)

| ID           | Título                                                      | Valor      | Urgência | Esforço | Dependências        | Status |
| ------------ | ----------------------------------------------------------- | ---------- | -------- | ------- | ------------------- | ------ |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Importante | Normal   | G       | -                   | [ ]    |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo)         | Crítico    | Normal   | G       | Todas as anteriores | [ ]    |

---

## Documentação



## Histórico de tarefas concluidas em template antigo

TASK-DOC-4 - Auditoria de atualizacoes pendentes

- **REQ:** DOC
- **Acao:** revisar handoffs e alteracoes recentes para apontar atualizacoes pendentes em docs/contexto-base.
- **Criterio:** lista de ajustes necessarios com recomendacao de proximo passo.
- **Status:** [x]
- **Observacoes:** Concluido em 2026-05-12. Testes: N/A (docs).

TASK-DOC-3 - Manutencao do handoff e roadmap

- **REQ:** DOC
- **Acao:** atualizar SESSAO-ATIVA para o formato do protocolo e sincronizar roadmap com Tasks.
- **Criterio:** SESSAO-ATIVA segue template; roadmap sem tasks inexistentes; cabecalho aponta para docs/arquivo-antigos-apenas-consulta.
- **Status:** [x]
- **Observacoes:** Concluido em 2026-05-12. Testes: N/A (docs).

## Backlog de tarefas

TASK-DOM-1 - Atualizacao da modelagem de dominio

- **REQ:** DOC
- **Acao:** revisar codigo atual e atualizar docs/dominio (glossario, diario de trabalho, value objects, aggregate do perfil e ajustes de referencias)
- **Criterio:** documentacao de dominio alinhada ao codigo e referencias consistentes
- **Status:** [x]
- **Observacoes:** tarefa de documentacao tecnica

TASK-DOM-2 - Ajustes referencias v6 e DT-14

- **REQ:** DOC
- **Acao:** alinhar referencias ao Requisitos v6, ajustar contexto-base e instrucoes de modelagem, adicionar DT-14.
- **Criterio:** docs/dominio e instrucoes sem referencias v5 e DT-14 registrado.
- **Status:** [x]
- **Observacoes:** Concluido em 2026-05-11. Referencias v6 alinhadas em docs/dominio e DT-14 registrado. Testes: nao aplicavel (docs).

TASK-0.1 - Setup base do projeto

- **REQ:** XI, RNF-02, RNF-12
- **Acao:** inicializar Vite + React + TS strict + Tailwind + ESLint/Prettier.
- **Criterio:** `npm run dev` sobe app; `tsconfig` strict; lint ok.
- **Status:** [x]
- **Observacoes:** Vite 5 + React 18 + TS strict + Tailwind 3 + ESLint 8 + Prettier. tsconfig sem baseUrl (deprecado TS7).

TASK-0.2 - Tema e tokens de UI

- **REQ:** II (Design System), RNF-06
- **Acao:** configurar paleta, tipografia e espacamentos no Tailwind.
- **Criterio:** cores e textos batem com o design; contraste AA.
- **Status:** [x]
- **Observacoes:** Paleta completa: primary, secondary, tertiary, surface, surface-bright, surface-cont, neutral, cyan (#00C0E8), warning, danger, success, white. Radios: btn/input 4px, card 8px. Fonte Inter. Spacing 8pt grid.

TASK-0.3 - Dados estaticos iniciais

- **REQ:** RNF-10, V.9 (DOC), IX.3
- **Acao:** criar `/src/data/dados_rj.json` e presets iniciais (Pop 110i).
- **Criterio:** presets imutaveis e lidos via codigo; licenciamento e IPVA carregam do JSON.
- **Status:** [x]
- **Observacoes:** Copiados de docs/data-testes/: dados_rj.json -> src/data/, pop110i.json -> src/presets/, usuario_teste.json -> src/fixtures/.

TASK-0.4 - Setup de testes (Vitest)

- **REQ:** RNF-11
- **Acao:** configurar Vitest e script `npm run test`.
- **Criterio:** suite executa localmente (mesmo que com testes iniciais basicos).
- **Status:** [x]
- **Observacoes:** Vitest 2 configurado via vite.config.ts. `npm run test` verde.

TASK-1.1 - Estado global e persistencia

- **REQ:** RF-CONF-01, RF-CONF-02, RNF-LR-01, RNF-LR-03
- **Acao:** implementar `PerfilContext`, `useReducer` e `usePerfil`.
- **Criterio:** app reabre com estado salvo; nenhum componente acessa localStorage direto.
- **Status:** [x]
- **Observacoes:** PerfilContext com EstadoApp {perfil, presets, presetAtivoId}. Reducer com 42 actions. Lazy init do localStorage. Persistencia automatica via useEffect. Hook usePerfil exporta {perfil, dispatch, ativarPreset, temPresetAtivo}. 16 testes passando.

TASK-1.2 - Presets e rota protegida

- **REQ:** RF-PERF-02, RNF-LR-04
- **Acao:** implementar lista de presets, preset ativo e `<RotaProtegida>`.
- **Criterio:** sem preset -> onboarding; com preset -> estimativa.
- **Status:** [x]
- **Observacoes:** RotaProtegida usa temPresetAtivo; redireciona para /onboarding/1 se falso. App.tsx com BrowserRouter e todas as rotas. Fixture de dev carregado em main.tsx.

TASK-1.3 - Estrutura de tipos base

- **REQ:** XII, RNF-12
- **Acao:** criar tipos TS para perfil, presets, registros e calculos.
- **Criterio:** build sem `any`; tipagem estrita.
- **Status:** [x]
- **Observacoes:** src/types/perfil.ts com todos os tipos: PerfilUsuario, PresetEntry, PerfilAction (discriminated union), e todos os sub-tipos de registros, overrides e financeiro. Build sem erros.

TASK-2.1 - Fluxo de onboarding (estrutura)

- **REQ:** RF-ON-01, RF-ON-02, RF-ON-03
- **Acao:** rotas `/onboarding/1-9` com barra de progresso e navegacao.
- **Criterio:** voltar funciona, estado em memoria; progresso correto.
- **Status:** [x]
- **Observacoes:** FluxoOnboarding.tsx com OnboardingContext (irParaProximo, irParaAnterior, temAnterior). Route /onboarding/\* com nested Routes para 12 sub-rotas incluindo 6/financiamento, 6/aluguel, 6/responsabilidade. PassoLayout.tsx com barra de progresso dinamica, botoes Voltar/Proximo/Concluir. onboardingUtils.ts com CONFIG_PASSOS, getProximoPasso e getPassoAnterior.

TASK-2.2 - Onboarding P1-P5

- **REQ:** RF-ON-02, RF-ON-03
- **Acao:** implementar entradas de Marca, Modelo, Ano, Perfil de uso e KM.
- **Criterio:** selecoes e inputs persistem ate concluir.
- **Status:** [x]
- **Observacoes:** Passo1 (grid de marcas + custom input), Passo2 (text input de modelo), Passo3 (input de ano com validacao ANO_MIN/MAX), Passo4 (cards entrega/passageiro), Passo5 (input km + seletor dias 1-7). Estado local inicializado do perfil global; dispatch no avancar.

TASK-2.3 - Onboarding P6 (branch)

- **REQ:** RF-ON-04
- **Acao:** fluxo condicional para Quitada/Financiada/Alugada.
- **Criterio:** sub-telas corretas e validacao de campos.
- **Status:** [x]
- **Observacoes:** Passo6 usa useNavigate+getProximoPasso local (evita state stale do React). Passo6Financiamento (parcela+restantes), Passo6Aluguel (valor+periodicidade), Passo6Responsabilidade (documentos/manutencao/seguro: eu/locador/dividido). Todos com validacao podeContinuar.

TASK-2.4 - Onboarding P7-P9 + confirmacao

- **REQ:** RF-ON-05, RF-ON-06
- **Acao:** seguro, internet, alimentacao + tela de resumo editavel.
- **Criterio:** salvar somente no `Concluir Configuracao`.
- **Status:** [x]
- **Observacoes:** Passo7 (toggle sim/nao + valor/periodicidade/seguradora condicional). Passo8 (internet R$/mes + alimentacao R$/dia). Passo9 (resumo com SessaoResumo/LinhaResumo + COMMIT_ONBOARDING no concluir). COMMIT_ONBOARDING ativado no click de concluir antes de navegar para /estimativa.

TASK-2.5 - Integracao FIPE (BrasilAPI)

- **REQ:** RF-ON-07, RF-DOC-01
- **Acao:** fetch FIPE no P3 com cache e fallback offline.
- **Criterio:** sem internet usa cache; sem cache -> input manual.
- **Status:** [x]
- **Observacoes:** fipeService.ts com discovery flow (marcas → modelos → anos → preco). Cache de sessao em Map evita re-descoberta de codigos. FipeCache.anoModelo adicionado ao tipo. Passo3 faz fetch com debounce 800ms, exibe "Consultando FIPE..." e valor + mes referencia quando ok. Fallback silencioso (erro/offline = sem exibicao, nao bloqueia). Cache de 30 dias por ano do modelo. nomeFipe "POP 110I" no catalogo. BrasilAPI instavel na data da implementacao (FIPE retornando 403), endpoints confirmados no stack trace.

TASK-3.1 - Calculos de rodagem e consumo

- **REQ:** RNF-11, VI.5, XIII (calculos)
- **Acao:** implementar funcoes puras de km/dia, km/mes, consumo e medias.
- **Criterio:** funcoes isoladas e testaveis.
- **Status:** [x]
- **Observacoes:** src/utils/calculos.ts. resolverKmDia, calcularKmMensal, calcularKmAnual (canonico: × 52), calcularDiasAno, calcularKmMensalPorSemanas, agruparRegistrosPorSemana, resolverConsumoEfetivo, calcularCpkCombustivel.

TASK-3.2 - Calculos por categoria e granularidades

- **REQ:** RF-EST-06, RF-EST-07, VI.2
- **Acao:** calcular custos anuais por categoria + granularidades.
- **Criterio:** totais atualizam < 200ms ao mudar inputs.
- **Status:** [x]
- **Observacoes:** calcularCustosPorCategoria (orquestrador), calcularTotalFiltrado, calcularGranularidades (semanal=anual/52; diario=anual/diasAno), calcularBreakdownPercentual, calcularCustoMotoAnual. calcularIPVA com isencao 15 anos. calcularCustoRevisaoAnual com modos autorizadas/independentes. adaptarHistoricoParaRegistros converte HistoricoManutencao para RegistroManutencao[]. calcularResultado como orquestrador final.

TASK-3.3 - Resolver overrides e modos

- **REQ:** RN-01 a RN-05
- **Acao:** aplicar sistema de overrides e modo predefinidos/personalizado.
- **Criterio:** modo predefinidos ignora overrides; personalizado usa onde existir.
- **Status:** [x]
- **Observacoes:** resolverIntervaloPeca e resolverPrecoPeca: modo personalizado usa media dos registros quando len>=1, senao usa preset (intervaloKmEntrega para entrega, intervaloKm para passageiro; precoOriginal/precoParalela por perfilPecas). calcularCpkPorPeca itera pecas + pneus, seta fonte='registro'|'preset'. temDadoSuficiente como ponto unico de verificacao. calcularIntervalMedioReal retorna null sem dados.

TASK-3.4 - Testes unitarios de calculos

- **REQ:** RNF-11
- **Acao:** escrever testes em Vitest para funcoes criticas.
- **Criterio:** cobertura dos casos de rodagem, cpk, custos, alertas.
- **Status:** [x]
- **Observacoes:** src/utils/calculos.test.ts. 76 testes passando. Cobre: resolverKmDia (4 cases), calcularKmAnual (canonico + anti-bug mensal×12), calcularDiasAno, calcularKmMensalPorSemanas (null e media), agruparRegistrosPorSemana, resolverConsumoEfetivo, calcularCpkCombustivel, calcularCpkPeca, resolverIntervaloPeca (entrega/passageiro/pneu/registro), resolverPrecoPeca (original/paralela/registro), calcularCpkPorPeca (fonte, custoAnual, mapa), calcularIPVA (isencao 15 anos), calcularLicenciamento, calcularCustoRevisaoAnual (autorizadas vs independentes), calcularKmParaProximaRevisao, calcularDiasParaProximaRevisao, calcularCustoInternetAnual/SeguroAnual/AlimentacaoAnual, calcularTotalFiltrado (filtros + toggle peca + convencao undefined=ativo), calcularGranularidades (semanal/52 e diario/diasAno), calcularBreakdownPercentual, calcularCustoMotoAnual, calcularMediaRegistros, calcularIntervalMedioReal, temDadoSuficiente, adaptarHistoricoParaRegistros (kmDesdeAnterior; dianteiro/traseiro independentes).

TASK-4.1 - Estimativa (painel)

- **REQ:** RF-EST-01 a RF-EST-07
- **Acao:** criar painel com inputs, cards e recalculo em tempo real.
- **Criterio:** custo por km e cards atualizam instantaneamente.
- **Status:** [x]
- **Observacoes:** src/pages/PaginaEstimativa.tsx. Input km/dia (dispatch SET_KM_POR_DIA on blur), stepper dias/semana (dispatch SET_DIAS_POR_SEMANA imediato). Cards: custo/km (cpkFormatado), porHora, porDia, semanal/mensal/anual com km. porHora = anual / (diasAno × horasPorDia). useCustos hook memo em perfil. App.tsx atualizado com LayoutApp como nested layout route (header + NavBar); /detalhamento fora do LayoutApp.

TASK-4.2 - Distribuicao e donut chart

- **REQ:** RF-EST-08, RF-EST-09
- **Acao:** implementar grafico + legenda com chips clicaveis.
- **Criterio:** percentuais somam 100% e destacam fatia correta.
- **Status:** [x]
- **Observacoes:** src/components/estimativa/DonutChart.tsx. SVG com stroke-dashoffset, rotate(-90deg). Centro mostra maior categoria (%). Legenda lateral ordenada por % desc, filtrada >= 0.5%. 7 categorias com cores fixas via CATEG_CONFIG.

TASK-4.3 - Detalhamento de custos

- **REQ:** RF-DET-01 a RF-DET-11
- **Acao:** accordions por categoria, toggles e sub-itens.
- **Criterio:** toggles recalculam total imediatamente.
- **Status:** [x]
- **Observacoes:** src/pages/PaginaDetalhamento.tsx. Estado local FiltrosCategorias inicializado de filtrosPadrao. CategoriaAccordion com Toggle (stopPropagation para nao colidir com expansao). Manutenção: toggle por peca (Map<string, CustoPeca>). Documentos: IPVA + Licenciamento. Revisao: modo exibido. Combustivel: cpk + consumo efetivo. Internet/Seguro/Alimentacao: sem expansao. Total = calcularTotalFiltrado + gastosCustom ativos.

TASK-4.4 - Gasto customizado

- **REQ:** RF-DET-10, VI.2
- **Acao:** adicionar modal/inline para gasto mensal extra.
- **Criterio:** gasto aparece no total e pode ser ativado/desativado.
- **Status:** [x]
- **Observacoes:** Implementado em PaginaDetalhamento (secao "Gastos adicionais"). Lista existentes com Toggle (dispatch TOGGLE_GASTO_CUSTOM) e delete (dispatch DELETE_GASTO_CUSTOM). Form inline: input nome + input R$/mes + botao Adicionar (dispatch ADD_GASTO_CUSTOM). Total anual inclui gastos custom ativos (valorMensal × 12).

------

### Essas tarefas estão em formato antigo, este documento não deve mais ser editado, serve apenas consulta, siga o padrão de tarefas em curso
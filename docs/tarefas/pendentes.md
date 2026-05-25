Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo); adicionar sapata de freio ao card "Últimas manutenções" (bateria absorvida pela TASK-RF-6.13).

---

## TASK-RF-6.13 — Renomear card "Últimas manutenções" e adicionar Bateria, Retífica de cabeçote e Retífica completa

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** RF-6.3.3, ADR-006
- **Observações:**
  - **Problema:** o card "Últimas manutenções" em Ajustes (`SecaoUltimasManutencoes`) registra km da última troca por componente, mas (a) o título não comunica que se trata de quilometragem, e (b) faltam linhas para Bateria, Retífica de cabeçote e Retífica completa — itens que aparecem em outras telas mas não têm registro de km aqui.
  - **Local provável:** `src/components/ajustes/SecaoUltimasManutencoes.tsx` (label do título) e `src/types/perfil.ts` (`kmUltimaTrocas` + `kmMotorRefeito` — pode precisar expandir para `kmBateria`, `kmRetificaCabecote`, `kmRetificaCompleta`).
  - **Fix proposto:** renomear título do card para **"Quilometragem das últimas trocas/manutenções"**; adicionar 3 linhas (Bateria, Retífica de cabeçote, Retífica completa) ao mesmo accordion/lista; estender o modelo de dados via schema migration (próxima versão, atualmente v14 conforme BG-006).
  - **Cuidados:** TASK-RF-6.10 já substituiu "fazer motor" por retíficas no cálculo — alinhar os nomes exatos com o que está em `calculos.ts`. Confirmar com `[[project_estima_moto]]` se Bateria já tem campo de km registrado em algum lugar antes de adicionar (evitar duplicação). Nota "Escopo futuro" ainda lista sapata de freio como pendente — não absorver agora, é tarefa separada. Migration precisa de teste de retrocompatibilidade.

---

## TASK-RF-6.22 — Estender modelo de Serviços com M.O. por modo (independente + autorizada) e ativar cards autorizada para serviços fora do pacote Honda

- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data-hora origem:** 25/05/26 10:29
- **Dependências:** —
- **REQ/ADR/DT:** ADR-004, ADR-006 (complementa)
- **Observações:**
  - **Problema (issue estrutural):** hoje `ServicoIndependente` tem um único campo `precoMaoDeObra` consumido só no modo independente. No modo autorizada, [`calculos.ts:316-333`](src/utils/calculos.ts#L316-L333) calcula revisão **apenas** pelo pacote `revisaoAutorizada[]` de [`pop110i.json`](src/presets/pop110i.json) (custoCicloCompleto) e **ignora `servicosIndependentes` por completo**. Resultado: serviços que existem fora das revisões periódicas Honda (kit transmissão, pneus, e os novos bateria/embreagem/cilindro a serem adicionados pela TASK-RF-6.14) **não têm M.O. cobrada no modo autorizada** — gap de cálculo.
  - **Decisão de modelagem (do usuário, 25/05/26):** criar na aba "Mão de Obra" modo Autorizada os mesmos cards que existem na Independente para serviços fora do pacote Honda (cards com inputs de M.O. e km), com persistência separada por modo. Cada `ServicoIndependente` passa a ter `precoMaoDeObraIndependente` e `precoMaoDeObraAutorizada` (ambos numéricos, valor 0 = "não cobrado").
  - **Local provável:**
    - [`src/types/perfil.ts`](src/types/perfil.ts) (interface `ServicoIndependente` ganha 2 campos numéricos + flag `incluidoNaRevisaoAutorizada`; rename do campo atual `precoMaoDeObra` → `precoMaoDeObraIndependente`).
    - [`src/types/calculos.ts`](src/types/calculos.ts) (se houver tipos espelhados do cálculo).
    - [`src/context/PerfilContext.tsx:18-103`](src/context/PerfilContext.tsx#L18-L103) (`SERVICO_RETIFICA_CABECOTE_PADRAO`, `SERVICO_RETIFICA_COMPLETA_PADRAO`, `SERVICOS_INDEPENDENTES_PADRAO`): atualizar os 9 serviços padrão com valores por modo e a flag `incluidoNaRevisaoAutorizada` (true para troca-oleo, troca-vela, troca-filtro-ar; false para troca-kit-transmissao, troca-pneu-dianteiro, troca-pneu-traseiro, revisao-geral, retifica-cabecote, retifica-completa).
    - [`src/utils/calculos.ts:304-348`](src/utils/calculos.ts#L304-L348) (`calcularDetalhesRevisaoAnual`): no ramo `modoRevisao === 'autorizadas'`, somar ao `base` os serviços com `!incluidoNaRevisaoAutorizada && ativo && !ehExcepcional` usando `precoMaoDeObraAutorizada`.
    - [`src/utils/calculos.ts:412-429`](src/utils/calculos.ts#L412-L429) (`calcularImprevistosSugeridosAnual`): manter inalterado se imprevistos seguem ignorando modo, ou estender para usar M.O. do modo ativo (decisão a registrar na ADR).
    - [`src/pages/PaginaMaoDeObra.tsx`](src/pages/PaginaMaoDeObra.tsx) e [`src/components/mao-de-obra/CardServico.tsx`](src/components/mao-de-obra/CardServico.tsx): aba Autorizada renderiza cards para serviços `!incluidoNaRevisaoAutorizada` ao lado das revisões Honda; input atualiza o campo correto via action.
    - Action `SET_SERVICO_INDEPENDENTE` em [`src/types/perfil.ts:202`](src/types/perfil.ts#L202): payload já é `ServicoIndependente` completo → atualiza automaticamente. Se preferir granular, criar `SET_SERVICO_MO_AUTORIZADA` / `SET_SERVICO_MO_INDEPENDENTE`.
    - [`src/fixtures/usuario_teste.json`](src/fixtures/usuario_teste.json): atualizar os 2 presets de fixture para o novo formato (migration cobre, mas fixture é fonte para devs).
  - **Schema migration v14 → v15:** mapear cada `ServicoIndependente.precoMaoDeObra` antigo para `precoMaoDeObraIndependente`; preencher `precoMaoDeObraAutorizada` com defaults por id (ver tabela abaixo); preencher `incluidoNaRevisaoAutorizada` por id.
  - **Defaults sugeridos (M.O. Autorizada Honda, RJ — valores estimados, devem ser validados):**
    - troca-oleo / troca-vela / troca-filtro-ar: `incluidoNaRevisaoAutorizada=true`, M.O. autorizada = 0 (já no pacote)
    - troca-kit-transmissao: `incluidoNaRevisaoAutorizada=false`, M.O. autorizada ≈ R$ 80
    - troca-pneu-dianteiro / troca-pneu-traseiro: `incluidoNaRevisaoAutorizada=false`, M.O. autorizada ≈ R$ 40
    - revisao-geral: `incluidoNaRevisaoAutorizada=true` (revisão geral é exatamente o pacote Honda no modo autorizado → não duplica)
    - retifica-cabecote / retifica-completa: `incluidoNaRevisaoAutorizada=false`, mas `ehExcepcional=true` → continuam saindo via imprevistos sugeridos, não via cálculo regular de revisão
  - **ADR obrigatória (Strict):** "Modelo de M.O. por modo de revisão para serviços fora do pacote Honda" — registrar a decisão de campo duplo + flag `incluidoNaRevisaoAutorizada` em serviços + comportamento do cálculo autorizada. Complementa ADR-006 (cálculo de manutenção).
  - **Cuidados:**
    - **Imprevistos sugeridos (retíficas):** hoje [`calculos.ts:417-418`](src/utils/calculos.ts#L417-L418) usa `precoMaoDeObra` único. Decidir na ADR se imprevistos sugeridos passam a respeitar o modo ou seguem com valor único — recomendação: respeitar o modo (consistência), mas requer ajuste no calculador.
    - **Fixture e localStorage:** se a migration v14→v15 falhar, perfis salvos param de carregar. Teste de migration com fixture é obrigatório.
    - **Não introduzir backward-compat sutil:** seguir convenção do agente — renomear `precoMaoDeObra` → `precoMaoDeObraIndependente` no tipo (não deixar campo legado coexistindo).
    - **UI:** aba Autorizada hoje só lista revisões Honda; adicionar a seção de cards de serviços extras sem desorganizar a hierarquia visual. Cards podem ser agrupados em "Serviços fora do pacote Honda" para deixar claro ao usuário.
    - **Testes em [`src/utils/calculos.test.ts`](src/utils/calculos.test.ts) e [`src/context/PerfilContext.test.ts`](src/context/PerfilContext.test.ts):** caso "modo autorizada com kit transmissão M.O.=80 → cálculo inclui R$ 80 × (kmAnual / 12000) acima do pacote Honda"; caso "migration v14→v15 mapeia campos corretamente".
  - **Bloqueador para:** TASK-RF-6.14 (que adiciona bateria/embreagem/cilindro depende desse modelo estendido).

---

## TASK-RF-6.14 — Adicionar Bateria, Kit Embreagem, Kit Revisão 6000km e Kit Cilindro como itens de cálculo

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 25/05/26 10:29
- **Dependências:** TASK-RF-6.22
- **REQ/ADR/DT:** ADR-004, ADR-006
- **Observações:**
  - **Problema:** o cálculo de custo cíclico atual cobre óleo, vela, filtro ar, kit relação, sapatas e pneus, mas não cobre 4 itens recorrentes em uso real de motoboy RJ: Bateria, Kit Embreagem, Kit Revisão 6.000km, Kit Cilindro. Sem eles, o CPK fica subestimado.
  - **Itens e valores (fornecidos pelo usuário 25/05/26, fontes em links no histórico):**
    - **Bateria** — original R$ 329,80 (Luz Motos); paralela R$ 163,20 (Heliar HTZ5L, ML); driver: tempo (`intervaloMeses: 24`), sem `intervaloKm`; `incluidoNaRevisaoAutorizada: false`.
    - **Kit Embreagem** — original R$ 300,33 (Moto Clube Honda); paralela R$ 68,00 (Shopee); `intervaloKm: 40000`; `incluidoNaRevisaoAutorizada: false`.
    - **Kit Revisão 6000km** — original R$ 152,83 (Moto Clube Honda); paralela R$ 102,93 (ML); `intervaloKm: 6000`; `incluidoNaRevisaoAutorizada: true` (Honda 6k subsidia M.O. e este kit é o consumível dela — ver atualização de [`pop110i.json:163`](src/presets/pop110i.json#L163) `revisaoAutorizada[1].precoPecas` 127.88 → 152.83 para refletir preço real).
    - **Kit Cilindro** — original R$ 360,83 (Moto Clube Honda); paralela R$ 163,31 (Shopee); `intervaloKm: 100000`; `incluidoNaRevisaoAutorizada: false`. Tratado como peça cíclica regular + serviço de troca próprio (M.O. ~R$ 200 independente). Caminho **alternativo** à Retífica completa.
  - **Local provável:**
    - [`src/presets/pop110i.json`](src/presets/pop110i.json) `pecas[]`: adicionar 4 entradas (`bateria`, `kit_embreagem`, `kit_revisao_6000`, `kit_cilindro`). Atualizar `revisaoAutorizada[1].precoPecas` 127.88 → 152.83. Bateria usa só `intervaloMeses: 24`, omite `intervaloKm`.
    - [`src/types/calculos.ts`](src/types/calculos.ts) `PecaPreset`: confirmar se `intervaloKm` é opcional; se não, tornar opcional (peças com driver mensal).
    - [`src/context/PerfilContext.tsx`](src/context/PerfilContext.tsx) `SERVICOS_INDEPENDENTES_PADRAO`: adicionar 3 entradas (`troca-bateria`, `troca-kit-embreagem`, `troca-kit-cilindro`) usando o modelo expandido da TASK-RF-6.22 (`precoMaoDeObraIndependente` + `precoMaoDeObraAutorizada` + `incluidoNaRevisaoAutorizada: false`).
    - [`src/utils/calculos.ts:182-256`](src/utils/calculos.ts#L182-L256) `calcularCpkPorPeca`: estender para suportar peça com `intervaloMeses` sem `intervaloKm`. Fallback: `trocasNoAno = 12 / intervaloMeses`, `custoAnual = trocasNoAno * preco`, `cpk = kmAnual > 0 ? custoAnual / kmAnual : 0`. Não afetar peças existentes (todas têm `intervaloKm`).
    - [`src/pages/PaginaDetalhamento.tsx`](src/pages/PaginaDetalhamento.tsx): mutual exclusion entre `kit_cilindro` (peça regular ativada em Detalhamento) e `retifica-completa` (imprevisto sugerido excepcional). Quando usuário ativa um, o outro é desativado automaticamente com toast/aviso: *"Kit Cilindro e Retífica completa são caminhos alternativos para o mesmo serviço. Ativar um desativa o outro."*
  - **Defaults de M.O. (RJ — estimativas a confirmar em uso real):**
    - troca-bateria: independente R$ 20, autorizada R$ 30
    - troca-kit-embreagem: independente R$ 250, autorizada R$ 400
    - troca-kit-cilindro: independente R$ 200, autorizada — deixar 0 (concessionária Honda raramente faz em Pop 110i)
  - **Schema migration v15 → v16** (encadeada após v14 → v15 da TASK-RF-6.22): adicionar overrides vazios para os 4 novos `id`s em `pecasOverrides`; garantir que perfis salvos sem os novos `servicosIndependentes` recebam os defaults.
  - **Testes em [`src/utils/calculos.test.ts`](src/utils/calculos.test.ts):**
    - Caso "bateria com intervaloMeses=24 entra no cálculo pelo tempo, não pelo km" (kmAnual=30000 → 2 trocas/4 anos = 0,5 trocas/ano).
    - Caso "Kit Revisão 6000km com `incluidoNaRevisaoAutorizada: true` não duplica no modo autorizada" (já coberto pela mecânica existente da flag, mas adicionar caso explícito).
    - Caso "Kit Cilindro entra no CPK regular com `intervaloKm: 100000`".
    - Caso "mutual exclusion": com `kit_cilindro` ativado e `retifica-completa` `ativo: false`, mudança para `retifica-completa.ativo: true` zera `kit_cilindro` nas categorias ativas (ou flag equivalente) e vice-versa.
    - Caso "modo autorizada inclui M.O. autorizada de troca-kit-embreagem" (depende da TASK-RF-6.22 já mergeada).
  - **Cuidados:**
    - **TASK-RF-6.22 é dependência forte.** Sem o modelo de M.O. por modo, M.O. dos serviços novos no autorizada não tem onde morar. Não iniciar a 6.14 antes da 6.22 estar concluída.
    - **TASK-RF-6.13** (renomear card "Últimas manutenções" + adicionar Bateria) é independente desta. Bateria como peça de cálculo (aqui) ≠ Bateria como linha de km registrado (TASK-RF-6.13). Coordenar id `bateria` entre os dois para reuso futuro de `kmUltimaTrocas`.
    - **Bateria envelhece por tempo:** validar com testes que `kmAnual: 0` (ou usuário sem rodagem declarada) ainda gera `custoAnual` correto (preço da bateria a cada 24 meses). Cuidado com divisão por zero ao calcular `cpk` (`kmAnual > 0 ? ... : 0`).
    - **Kit Revisão 6000km no autorizada:** a atualização do `precoPecas` da revisão Honda 6k de 127.88 → 152.83 muda o cálculo do `custoCicloCompleto`. Recalcular o ciclo total Honda (7 revisões × preço) e ajustar default `custoCicloCompleto` em [`calculos.ts:317`](src/utils/calculos.ts#L317) (`3334.62` → novo valor) se houver constante hardcoded.
    - **Mutual exclusion:** decidir onde mora a lógica (handler do toggle em PaginaDetalhamento vs. invariante no reducer). Recomendação: no reducer (`TOGGLE_IMPREVISTO_SUGERIDO` para `retifica-completa` zera `kit_cilindro` na lista de categorias ativas; toggle de kit cilindro zera o imprevisto sugerido de retifica completa). Aviso (toast) fica na UI.

---

## TASK-RF-6.15 — Detalhamento: mostrar nº de abastecimentos calculados conforme período do toggle

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** na PaginaDetalhamento, a categoria Combustível mostra valor total, mas não comunica quantos abastecimentos compõem aquele número no período selecionado pelo toggle (dia/semana/mês/ano).
  - **Local provável:** `src/pages/PaginaDetalhamento.tsx` (renderização da seção combustível), `src/utils/calculos.ts` (provavelmente já calcula litros/km e tem tanque → dividir litros do período pelo tamanho do tanque para inferir abastecimentos).
  - **Fix proposto:** calcular `abastecimentos = litrosNoPeriodo / capacidadeTanque` (arredondar conforme convenção) e exibir como sub-label ("12 abastecimentos no ano") junto ao valor da categoria. Reagir ao toggle de período.
  - **Cuidados:** capacidade do tanque vem do preset/perfil — verificar onde está armazenada antes (`presets/pop110i.json` tem tanque para Pop 110i). Arredondar de modo que faça sentido pro usuário (inteiro ou 1 casa decimal?). Definir comportamento se km/mês for 0.

---

## TASK-RF-6.16 — Ícone "?" no cabeçalho de cada tela com conteúdo explicativo

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data origem:** 25/05/26 08:33
- **Dependências:** TASK-RF-6.4 (conteúdo dos pop-ups — atualmente em "Decisões UI/UX Pendentes")
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** o app não tem ajuda contextual. Usuário entra em telas como Detalhamento, Mão de Obra, Insumos sem saber exatamente o que cada número significa.
  - **Local provável:** `src/layouts/LayoutApp.tsx` ou `src/components/CabecalhoVoltar.tsx` (componente do header — adicionar slot de ícone "?"), criar `src/components/PopupAjuda.tsx` (modal/sheet shadcn com conteúdo por rota).
  - **Fix proposto:** componente único de ajuda parametrizado por rota; ícone "?" aparece no header de cada tela; clique abre modal/sheet com texto explicativo. Conteúdo definido pela RF-6.4 (depende dela).
  - **Cuidados:** RF-6.4 ainda está como "Quando Der" e "Desejável" — confirmar com humano se o conteúdo de cada tela já existe antes de implementar o container, ou se a UI vem primeiro com texto placeholder. Manter o ícone fora da NavBar inferior (header da tela, não navbar). Acessibilidade: `aria-label="Ajuda"`.

---

## TASK-RF-6.17 — Distribuição de custos: melhorar UI e mostrar R$ por categoria

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** a seção "Distribuição de custos" mostra apenas a porcentagem de cada categoria. Falta o valor em R$, e a UI atual não está clara o suficiente.
  - **Local provável:** `src/pages/PaginaDetalhamento.tsx` ou componente extraído (`src/components/detalhamento/DistribuicaoCustos.tsx` ou similar — confirmar pelo Grep).
  - **Fix proposto:** ao lado (ou abaixo) do `%`, exibir o valor absoluto em R$ no mesmo período do toggle ativo. Revisar visual (espaçamentos, hierarquia tipográfica, contraste das barras).
  - **Cuidados:** valores em R$ já são calculados em algum lugar do `calculos.ts` (a porcentagem deriva deles) — reaproveitar. Manter `toFixed(2)` e símbolo `R$ ` consistentes com o resto do app. Não quebrar responsividade em 375px.

---

## TASK-BG-007 — Padronizar "Gastos Extras" → "Imprevistos" em Distribuição de custos

- **Status:** Pendente
- **Modo:** Light
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** na seção "Distribuição de custos", a categoria que em todo o resto do app se chama "Imprevistos" aparece como "Gastos Extras". Inconsistência de label para o mesmo conceito.
  - **Local provável:** Grep por `"Gastos Extras"` — provavelmente em `src/pages/PaginaDetalhamento.tsx` ou componente de distribuição. TASK-RF-6.9 padronizou Imprevistos como nome canônico (presets editáveis: Multa, Sinistros, Outros).
  - **Fix proposto:** substituir o literal `"Gastos Extras"` por `"Imprevistos"` no único ponto que ainda usa. Conferir se há mais ocorrências em outras telas.
  - **Cuidados:** confirmar que o label novo ainda cabe no layout (Imprevistos é 1 caractere maior). Verificar se há teste que asserta o label antigo.

---

## TASK-BG-008 — Detalhamento: categoria Financiamento com nome fixo (deveria variar com situacaoMoto)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:**
  - **Problema:** em PaginaDetalhamento, a categoria "Financiamento" aparece com esse nome fixo, independente da `situacaoMoto` do perfil (alugada, financiada, quitada). Para moto alugada, deveria ser "Aluguel"; para quitada, a categoria provavelmente não deveria aparecer.
  - **Local provável:** `src/pages/PaginaDetalhamento.tsx`, função de render das categorias. Lógica de `situacaoMoto` já existe em `CampoFinanciamento` (ver TASK-BG-006: card só renderiza quando `situacaoMoto === 'alugada'`).
  - **Fix proposto:** derivar o label da categoria do `situacaoMoto`: `'financiada'` → "Financiamento", `'alugada'` → "Aluguel", `'quitada'` → não renderizar. Reaproveitar a lógica do `CampoFinanciamento` se já houver helper.
  - **Cuidados:** confirmar que o cálculo já usa o campo certo (`parcelaMensal` vs `aluguelMensal`) — se sim, é só a label da UI. Se o cálculo também trata como "financiamento" indistintamente, escopo aumenta. Validar com testes em `calculos.test.ts`.

---

## TASK-RF-6.18 — Decrementar parcelas restantes de financiamento automaticamente a cada mês

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** ADR-005
- **Observações:**
  - **Problema:** quando o usuário tem financiamento ativo (`situacaoMoto === 'financiada'` com `parcelaMensal > 0` e nº de parcelas > 0), o contador de parcelas restantes não diminui automaticamente conforme passam os meses — o usuário precisa editar manualmente.
  - **Local provável:** `src/types/perfil.ts` (modelo de financiamento — confirmar se tem `dataInicio` + `parcelasTotais` ou só `parcelasRestantes`), `src/context/PerfilContext.tsx` (lógica de "tick" mensal), `src/utils/calculos.ts` (uso do valor para custo do período).
  - **Fix proposto:** armazenar `dataInicio` + `parcelasTotais` em vez de só `parcelasRestantes`; derivar `parcelasRestantes = parcelasTotais - mesesDecorridosDesde(dataInicio)`. Quando chegar a 0, parar de contar como custo. Schema migration necessária.
  - **Cuidados:** decisão importante — derivar do cálculo (passive, sem mutar perfil) vs. mutar o perfil periodicamente. Recomendação: derivar, evita escrita silenciosa no perfil. Confirmar com humano antes da implementação. Validar edge cases: `mesesDecorridos > parcelasTotais`, `dataInicio` no futuro, mudança de fuso horário.

---

## TASK-RF-6.19 — Adicionar Serviços Avulsos

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** ADR-004
- **Observações:**
  - **Problema:** hoje os serviços do app são tipados (revisões Honda, serviços independentes por intervalo). Não há suporte para "serviço avulso" — uma manutenção pontual sem intervalo recorrente (ex.: troca emergencial de cabo, conserto pontual).
  - **Local provável:** `src/types/perfil.ts` (novo tipo `ServicoAvulso` ou extensão de `ServicoIndependente` com flag `eAvulso: true`), `src/utils/calculos.ts` (entra no custo total mas não no CPK cíclico), nova tela ou seção em Mão de Obra.
  - **Fix proposto:** confirmar com humano se o serviço avulso entra como custo único do mês em que ocorreu (não recorrente) ou como custo distribuído. Modelagem: lista de eventos com `data`, `descricao`, `valor`. Schema migration.
  - **Cuidados:** **escopo aberto** — precisa discussão de UX antes (onde registra? aparece em qual tela? entra em Detalhamento como categoria nova ou agregado em "Manutenção"?). Modo Standard pode virar Strict dependendo da decisão. Pedir confirmação antes de planejar a implementação.

---

## TASK-REF-24 — Padronizar label "MO" → "Mão de Obra" em toda a UI (exceto NavBar inferior)

- **Status:** Pendente
- **Modo:** Light
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** labels usam "MO" abreviado (ex.: "Preço MO (R$)" nos cards da página de Mão de Obra). Não há motivo para abreviação fora da NavBar inferior (onde há restrição de espaço).
  - **Local provável:** Grep por `"MO"` e `"Preço MO"` em `src/components/maoDeObra/*` e `src/pages/*`. NavBar fica em `src/layouts/LayoutApp.tsx` ou similar — **não tocar**.
  - **Fix proposto:** substituir todas as ocorrências de "MO" como label visível por "Mão de Obra". Exceção única: NavBar inferior principal.
  - **Cuidados:** evitar trocar identificadores de código (variáveis/funções chamadas `precoMO` podem permanecer — convenção do projeto). Trocar apenas strings exibidas na UI. Garantir que o texto novo cabe no layout dos cards (Mão de Obra é bem maior que MO).

---

## TASK-RF-6.20 — Adicionar ícones nos cards do projeto que precisam

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** muitos cards do projeto (Insumos, Mão de Obra, Detalhamento, Ajustes) não têm ícone de identificação visual, prejudicando varredura rápida.
  - **Local provável:** `src/components/insumos/*`, `src/components/maoDeObra/*`, `src/components/ajustes/*`, `src/components/detalhamento/*`. Sistema de ícones centralizado já existe (TASK-CHORE-009).
  - **Fix proposto:** **levantar antes** quais cards precisam de ícone (escopo vago no enunciado) — pedir confirmação ao humano sobre a lista exata. Usar ícones do sistema centralizado já existente.
  - **Cuidados:** **escopo aberto** — sem lista explícita do humano, o risco é trocar tudo ou nada. Pedir lista antes de implementar. Manter consistência visual com cards que já têm ícone.

---

## TASK-RF-6.21 — Header do veículo: mostrar km atual + km da última revisão, e tornar labels clicáveis

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** o header do veículo mostra apenas marca/modelo/ano/autonomia (ex.: "2024 - 50 km/L"). Falta o km atual e o km da última revisão para o usuário saber se está atualizado. Além disso, os labels não são clicáveis — usuário precisa navegar manualmente até as telas de edição.
  - **Local provável:** `src/layouts/LayoutApp.tsx` (provável local do header da moto, inserido pela TASK-REF-15) ou componente `HeaderMoto`/`HeaderVeiculo`.
  - **Fix proposto:**
    - Exibir adicionalmente: **km atual** e **km da última revisão**.
    - **"50 km/L"** → clicável, navega para tela de **Insumos** (consumo é editado lá).
    - **Nome do modelo** → clicável, navega para **Perfil** (onde se troca o modelo).
    - **Km (atual/última revisão)** → clicável, navega para a tela de edição correspondente (Ajustes → seção de km).
  - **Cuidados:** todos os elementos clicáveis precisam de área de toque ≥ 48px (toque mínimo do design system). Indicar visualmente que são clicáveis (underline, hover). Validar layout em 375px com os campos adicionais (km atual + km revisão podem espremer demais). Acessibilidade: usar `<Link>` do react-router-dom, não `<div onClick>`.

---

## TASK-BG-009 — Pop-ups bugam quando largura da janela ≠ largura mínima (PC/notebook/tablet)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** os pop-ups (modais/dialogs shadcn) ficam visualmente bugados em larguras de janela que não sejam a mínima (375px) ou tela cheia. Bug visível em PC/notebook/tablet — não aparece em celular onde a largura sempre é "mínima".
  - **Local provável:** componentes `Dialog`/`Sheet` do shadcn em `src/components/ui/`, ou wrapper customizado. TASK-RF-6.11 introduziu vários pop-ups de edição em Detalhamento. TASK-RF-6.9 trouxe popup de Imprevistos.
  - **Fix proposto:** reproduzir em janela de ~768px e ~1024px; inspecionar CSS dos modais; provavelmente falta `max-width` no container do dialog ou o overlay está com `width: 100vw` sem ancoragem. Garantir comportamento responsivo entre 375px e desktop.
  - **Cuidados:** o app foi desenhado mobile-first (375px), mas precisa funcionar em larguras maiores sem quebrar. Não regredir em mobile. Testar em todos os pop-ups que existem (Imprevistos, edição por categoria em Detalhamento, confirmações de reset).

---

## TASK-BG-010 — Detalhamento → Manutenção → Revisão Geral: ícone de lápis falta no modo Independente

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 25/05/26 08:33
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:**
  - **Problema:** na PaginaDetalhamento, dentro da categoria Manutenção, o item "Revisão Geral" só mostra o ícone de lápis (que abre a página de Mão de Obra com o toggle correto ativado) no modo **Autorizada**. No modo **Independente** o ícone não aparece, deixando o usuário sem caminho de edição direto.
  - **Local provável:** `src/pages/PaginaDetalhamento.tsx` ou componente extraído da edição por categoria (TASK-RF-6.11 introduziu a navegação com scroll/destaque para Revisão Geral Autorizada — pode ter esquecido o caminho Independente). `src/components/detalhamento/*`.
  - **Fix proposto:** exibir o ícone de lápis em ambos os modos. Ao clicar, navegar para Mão de Obra com o toggle do modo correto ativado (Independente ou Autorizada conforme o estado atual).
  - **Cuidados:** TASK-RF-6.11 trata "Revisão Autorizada" como navegação com scroll/destaque (não popup) — manter a mesma forma para Independente, por consistência. Validar com humano se o destino é exatamente a mesma tela (Mão de Obra) ou se Independente leva para outra seção.

---

## TASK-BG-011 — Revisar default de M.O. da Retífica completa (R$ 1.500 alto para M.O. pura)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 25/05/26 10:29
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:**
  - **Problema:** `SERVICO_RETIFICA_COMPLETA_PADRAO` em [`src/context/PerfilContext.tsx:27-34`](src/context/PerfilContext.tsx#L27-L34) tem `precoMaoDeObra: 1500`. O app separa preço de peça e M.O. (somando depois), então R$ 1.500 de **M.O. pura** (sem peças) está alto para a realidade de mercado RJ — preço típico inclui peças miúdas (anéis, válvulas, juntas) somadas à M.O. de retificação.
  - **Local:** [`src/context/PerfilContext.tsx:27-34`](src/context/PerfilContext.tsx#L27-L34) `SERVICO_RETIFICA_COMPLETA_PADRAO.precoMaoDeObra`. Também conferir se há valores espelhados em fixture [`src/fixtures/usuario_teste.json`](src/fixtures/usuario_teste.json) ou em testes [`src/utils/calculos.test.ts`](src/utils/calculos.test.ts) que assumam R$ 1.500.
  - **Fix proposto:** baixar para faixa R$ 800–1.000 (M.O. pura de retífica completa em oficina independente RJ, sem peças miúdas). Decisão de valor exato fica com o usuário ao iniciar a task. Se TASK-RF-6.22 já tiver sido executada, atualizar `precoMaoDeObraIndependente` (e zerar/definir `precoMaoDeObraAutorizada` — Honda autorizada raramente faz retífica completa em Pop 110i).
  - **Cuidados:** retífica completa é serviço excepcional desativado por padrão (`ativo: false`); o valor afeta o cálculo só quando o usuário ativa via Imprevistos no Detalhamento. Mudança não-quebrante, mas vale teste que valide o valor novo. Spin-off identificada durante o planejamento da TASK-RF-6.14 (25/05/26).

---

## TASK-BG-012 — Revisar default de M.O. da Revisão Geral Independente (R$ 80 abaixo do mercado RJ)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 25/05/26 10:29
- **Dependências:** —
- **REQ/ADR/DT:** ADR-006
- **Observações:**
  - **Problema:** `SERVICOS_INDEPENDENTES_PADRAO` em [`src/context/PerfilContext.tsx:77-84`](src/context/PerfilContext.tsx#L77-L84) tem `revisao-geral` com `precoMaoDeObra: 80` (e `intervalKm: 6000`). Usuário relatou (25/05/26) que uma revisão de 12k em oficina independente RJ custou R$ 400. Default R$ 80 está abaixo da média de mercado RJ. Também há ambiguidade: a "Revisão Geral Independente" hoje é única (intervalo de 6k), enquanto na vida real revisão de 12k+ é mais cara que 6k (envolve válvulas, limpeza de filtro de óleo etc. — ver tabela [`pop110i.json` `revisaoAutorizada`](src/presets/pop110i.json) que tem M.O. crescente: 0/0/280/70/370/60/290 nos km 1k/6k/12k/18k/24k/30k/36k).
  - **Local:** [`src/context/PerfilContext.tsx:77-84`](src/context/PerfilContext.tsx#L77-L84) (`revisao-geral` default). Também conferir [`src/data/dados_rj.json:50-61`](src/data/dados_rj.json#L50-L61) `manutencao.precoRevisaoIndependentePadrao: 150` e `manutencao.servicosPadrao.revisaoGeral: 150` — já indica que existe uma constante de mercado (R$ 150) mais alta que o default do serviço (R$ 80). Inconsistência interna.
  - **Fix proposto (2 opções):**
    - **(A)** Apenas subir o default de R$ 80 → R$ 150 (alinhando ao `dados_rj.json` que já tem R$ 150 como média de mercado). Fix simples, mantém modelagem atual de "revisão única".
    - **(B)** Quebrar `revisao-geral` em 3 ou 4 serviços com intervalos diferentes (6k, 12k, 18k, 24k+) e M.O. proporcional ao escopo. Mais fiel à realidade Honda. Requer migration e revisão de testes.
  - Decisão fica com o usuário ao iniciar a task. Recomendação inicial: **A** agora (pequeno), abrir nova task se quiser **B** depois.
  - **Cuidados:** valor afeta diretamente o cálculo no modo independente. Se TASK-RF-6.22 já tiver sido executada, atualizar `precoMaoDeObraIndependente`. M.O. autorizada do `revisao-geral` deve ser 0 (já no pacote Honda) — flag `incluidoNaRevisaoAutorizada: true`. Spin-off identificada durante o planejamento da TASK-RF-6.14 (25/05/26) — usuário relatou caso real.

---

### Tarefas Normais

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

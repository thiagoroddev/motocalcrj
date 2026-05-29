Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" — vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas — absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

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

## TASK-RF-6.20 — Adicionar ícones nos cards do projeto (fatiada por tela)

- **Status:** Em desmembramento — uma sub-task por tela (decisão do humano em 29/05/26, pois cruza o app todo).
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Data origem:** 25/05/26 08:33
- **Regras gerais (valem para todas as sub-tasks):**
  - Todo label de card tem ícone; cards de período usam relógio. Tamanho padronizado ~24×24.
  - Todo título de seção tem ícone.
  - Toda categoria do card "Distribuição de custos" tem ícone — o mesmo da tela de Detalhamento (mapa único categoria→ícone).
  - Ícones de categoria em **tile colorido** (fundo na cor da categoria, ícone branco), estilo do mock.
  - Ícones novos vêm do `lucide-react` (já é dependência; evita transcrever paths do Material à mão).
- **Sub-tasks:**
  - ~~**TASK-RF-6.20.1** — Estimativa + Detalhamento~~ **CONCLUÍDA** (29/05/26 16:50). Criou `icons/categorias.tsx` (mapa `ICONE_CATEGORIA` + `TileCategoria`) e `SeletorPeriodo` ganhou prop `className` — reusar nas próximas.
  - ~~**TASK-RF-6.20.2** — Mão de Obra~~ **CONCLUÍDA** (29/05/26 18:36). Criou `TituloSecao` e `icons/pecas.tsx` (`iconePeca`, mdi via unplugin-icons) — reusar nas próximas.
  - **TASK-RF-6.20.3** — Insumos (pendente).
  - **TASK-RF-6.20.4** — Ajustes (pendente).

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
| ~~TASK-RF-6.4~~ | ~~Conteúdo dos pop-ups de ajuda (ícone "?")~~ **ABSORVIDA pela TASK-RF-6.16** (conteúdo escrito e aprovado em 29/05/26) | Desejável  | Quando Der | P       | -            | [x]    |
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

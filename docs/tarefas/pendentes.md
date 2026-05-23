Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

> **TASK-REF-15** concluída em 23/05/26 — ver `docs/tarefas/concluidas/` (escopo reformulado: PaginaAjustes movida para dentro do LayoutApp; CabecalhoVoltar promovido a barra superior e usado também em PaginaPerfil).

---

## TASK-REF-13 — PaginaAjustes: gap excessivo entre label e input no componente Linha
- **Status:** Pendente (interrompida)
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Interrompida em 22/05/26 para priorizar as tarefas da revisão geral (ADR-005/006). Estava em "AGUARDANDO VALIDAÇÃO VISUAL" — o código já foi aplicado: na função `Linha` de `PaginaAjustes.tsx`, `gap-4` → `gap-2` e o `<span>` de label recebeu `flex-1 min-w-0`. Falta apenas a validação visual no browser (label não pode dar overflow em 375px; input alinhado à direita). `npm run test` 98 verdes e `tsc --noEmit` limpo no momento da interrupção. Nota: o componente `Linha` foi depois extraído para `src/components/Linha.tsx` pela REF-14.

## TASK-REF-14 — Extrair componentes inline e refatorar PaginaAjustes
- **Status:** Pendente (interrompida)
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/G
- **Data origem:** 20/05/26
- **Dependências:** TASK-REF-13
- **REQ/ADR/DT:** —
- **Observações:** Interrompida em 22/05/26 para priorizar as tarefas da revisão geral (ADR-005/006). Estava em "AGUARDANDO VALIDAÇÃO VISUAL" — o código já foi aplicado: `PaginaAjustes.tsx` reescrito de 572 → 88 linhas; criados `Segmentado.tsx`, `Stepper.tsx`, `Linha.tsx` em `src/components/`, `CampoSwitch.tsx` em `src/components/ajustes/` e 6 componentes de seção em `src/components/ajustes/`. Falta a validação visual no browser. **Atenção — pontos afetados pela revisão geral:** (1) `CampoSwitch.tsx` foi criado mas nunca usado (`SecaoFinanceiro` não o integrou) — pela ADR-005 não há switch em Ajustes, então será excluído pela TASK-REF-21, não integrado; (2) `SecaoPreferencias` ganhou o segmentado "Estimativa sobre dados", que viola a ADR-003 e será removido pela TASK-REF-18. Esses dois itens devem ser considerados já resolvidos pelo redirecionamento das ADRs — a validação visual restante cobre só o layout das seções. `npm run test` 98 verdes no momento da interrupção.

---

## Revisão geral das telas de configuração — ADR-005 e ADR-006 (20/05/26)

> Tarefas geradas pela revisão geral de Mão de Obra, Custos & Peças, Ajustes e Perfil.
> Decisões formalizadas em `docs/arquitetura/ADR/ADR-005.md` (responsabilidades entre telas) e `ADR-006.md` (cálculo de manutenção).
> Todas marcadas como IMEDIATA: precisam ser executadas com o contexto da revisão ainda fresco. Cada tarefa inclui testes como critério de conclusão (`docs/padrao-testes.md`).

> **TASK-BG-003** e **TASK-RF-6.7** concluídas em 22/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-16** concluída em 22/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-17** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-18** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-19** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-BG-004** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

> **TASK-REF-21** concluída em 23/05/26 — ver `docs/tarefas/concluidas/`.

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

> **TASK-REF-22** (converter `calcularCpkPorPeca` para objeto de opções) foi **absorvida pela TASK-RF-6.7** e concluída junto — 22/05/26.

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

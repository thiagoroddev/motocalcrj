# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

Colunas padrão das tabelas: `ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem`.

---

## Tarefas Prioritárias (Imediata)

## TASK-REF-45 - Desativar a retífica (cabeçote + completa) e simplificar o toggle Concessionária/Independente

- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 14/06/26 21:50
- **Dependências:** coordenar com **TASK-DOM-6** (em andamento — presets Honda também têm retífica)
- **REQ/ADR/DT:** **ADR-022**
- **Observações:** Decisão do humano (ADR-022): **retífica fora do MVP**, adiada para quando os "serviços independentes" forem reabertos. **Não é conserto de bug** — é desativar/remover os dois itens (`retifica-cabecote`, `retifica-completa`). Contexto do bug que motivou a decisão: a mecânica que, ao atingir o km mínimo, listava as retíficas na categoria **"Outros"** (toggle desativado) e, ao ativar, **desligava automaticamente o kit cilindro** (anti dupla-contagem) **quebrou** após a renomeação Excepcional→Independente (BG-036). Escopo: (1) remover os dois itens de retífica da experiência (sem listagem por km, sem auto-desligar kit cilindro; o reparo de motor segue no **kit cilindro** amortizado); (2) **toggle Concessionária/Independente** torna-se desnecessário para **Honda** → esconder/condicionar; **manter para Yamaha** (pneu independente); (3) presets dos modelos (incl. os da DOM-6) — definir se remove o item ou mantém inerte. Detalhar no planejamento.

> **Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8) — se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo. Peças rastreáveis no card "Últimas manutenções" (vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro, retíficas) absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

---

## Normais

> **Épico Honda fase 2 concluído:** TASK-DOM-5 (docs) + BG-034/035/036 (UI/lógica) + **TASK-DOM-6** (6 presets:
> cg160start/fan/titan, bros160, xre190, cb250f) **concluídas**. Próximo na fila: **TASK-REF-45** (retífica, Imediata).

### Cálculo e UX (avulsos)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RF-8 | Bateria: valor completo na Mão de Obra + ancoragem por data (card próprio) e vida útil em meses | Standard | Importante | Normal | G/G | - | ADR-014 (completo×incompleto); ADR-016 (ancoragem) | `[ ]` | 14/06/26 21:50 |

> **TASK-RF-8 (bateria), partes:**
> 1. **Valor completo não aparece em Mão de Obra:** quase todos os Honda têm valor **completo** (peça + M.O.) para a troca de bateria, mas o serviço **não aparece** na tela "Mão de Obra" em nenhum modelo (Honda ou Yamaha). Deve aparecer; e, quando completo, a **peça da bateria não deve aparecer em Insumos nem entrar no cálculo** (hoje sempre entra amortizada como peça — regra BG-034 não está sendo aplicada à bateria).
> 2. **Ancoragem por data:** a bateria aparece em "Ajustes › KM - últimas trocas", mas preenchê-la **não a ancora** (o app sempre pega a vida em meses ÷ 12 = período). **Remover a bateria do card de KM** e criar **card próprio** que registra a **data da última troca** + **vida útil**.
> 3. **Vida útil em meses:** card próprio também na tela **Mão de Obra**, com seletor de meses **de 6 em 6** (padrão **24**); no cálculo, esse valor é **÷ 12** para amortizar.
> Componente de bug embutido (BG-034 não aplicada à bateria) + nova mecânica (data/meses). Manter consistência entre Honda e Yamaha. Coordenar com a DOM-6 (modelagem da bateria nos presets).

### Export/Import e Alertas (Fase 11)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RF-7.1 | Exportar/importar predefinições individuais (.json) | Standard | Importante | Normal | G/G | TASK-BG-031 | RF-PERF-03, RF-EXP-01, ADR-021 | `[ ]` | - |
| TASK-REF-43 | Tornar `IMPORTAR_PERFIL` determinístico e normalizar antes do dispatch | Standard | Importante | Normal | M/M | TASK-RF-7.1 | ADR-010 | `[ ]` | 06/06/26 14:42 |

> TASK-RF-7.1: cada arquivo representa uma `PresetEntry`; a importação cria novo UUID e resolve colisões de sufixo sem sobrescrever silenciosamente outra predefinição.

### Analytics, PWA e Play Store (Fases 9 e 13)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-8.1 | Analytics (Umami) — trackEvent centralizado | Standard | Importante | Normal | M/M | - | - | `[ ]` | - |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Standard | Crítico | Normal | G/G | TASK-RNF-8.1 | - | `[ ]` | - |
| TASK-RNF-8.3 | TWA — publicação na Google Play Store | Standard | Crítico | Normal | G/G | TASK-RNF-8.2 | - | `[ ]` | - |

### Qualidade e Polimento (Fase 10)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Standard | Importante | Normal | G/G | - | - | `[ ]` | - |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Standard | Crítico | Normal | G/G | Todas as anteriores | - | `[ ]` | - |

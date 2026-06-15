# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

Colunas padrão das tabelas: `ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem`.

---

## Tarefas Prioritárias (Imediata)

## TASK-RF-10 - Avisos de origem dos dados ("podem estar desatualizados")

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 15/06/26 11:58
- **Dependências:** -
- **REQ/ADR/DT:** Lançamento web/PWA; complementa o dialog "Privacidade e Termos" (Perfil)
- **Observações:**
  - **Motivo:** "ninguém lê os Termos". Cada bloco com dado de origem externa precisa de um aviso curto **ao lado/abaixo do próprio dado** (não só enterrado nos Termos), dizendo de onde veio e que pode estar desatualizado (a maioria não será atualizada periodicamente).
  - **Formato (a decidir na execução):** recomendação = um componente único e leve (ícone ℹ️/alerta + texto curto) **por seção**, reaproveitando/estendendo o `AjudaInline` (criado na BG-032) para consistência — **não** um card pesado por campo, nem label em todo campo (poluído). 1 linha por seção.
  - **Locais + microcopy (fontes confirmadas no código):**
    1. **Onboarding — seletor de ano/FIPE** (`Passo3.tsx`): "Valor FIPE de referência; pode estar desatualizado."
    2. **Mão de Obra — Revisões da concessionária** (`PaginaMaoDeObra` / cards de revisão): "Valores do site oficial da concessionária; podem estar desatualizados."
    3. **Insumos — Combustível** (`PaginaInsumos`): "Preço de referência da ANP (gov); pode estar desatualizado." — fonte real: `dados_rj.json` → ANP, Levantamento de Preços (RJ).
    4. **Insumos — Peças e Pneus** (`PaginaInsumos`): "Preços obtidos de marketplaces; podem estar desatualizados."
    5. **Documentos — IPVA + Licenciamento** (Estimativa/Detalhamento) — ⚠️ **esquecido na lista original**: "IPVA (SEFAZ-RJ) e licenciamento (DETRAN-RJ); valores anuais, podem estar desatualizados." — fontes em `dados_rj.json`.
  - **Candidatos opcionais (avaliar na execução, baixa prioridade):** nota de "intervalos de revisão (km/meses) conforme manual do fabricante" e "autonomia (km/L) de referência do fabricante/estimativa". Podem ser dobrados nos avisos 2 e 3 para não poluir.
  - **Acessibilidade:** ícone com `aria-label`/`title`; texto legível (não só `title` no hover, pra funcionar no toque).
  - **Sem mudança de cálculo** — é só UI/conteúdo.

---

## Normais

> **Épico Honda fase 2 concluído:** TASK-DOM-5 (docs) + BG-034/035/036 (UI/lógica) + **TASK-DOM-6** (6 presets:
> cg160start/fan/titan, bros160, xre190, cb250f) **concluídas**.

> **Épico TASK-RF-8 (bateria por tempo) CONCLUÍDO.** Bateria = config `vidaUtilAnos` (2/3/4/5, default 3),
> **sempre amortizada** (valor ÷ anos); completo Honda / incompleto Yamaha nos presets + Mão de Obra; popup
> em anos. A ancoragem por data foi tentada (**RF-8.6**) e **revertida** (**RF-8.7**) — confundia em uso.
> Partes: RF-8.1 (motor) · 8.2 (presets) · 8.3 (CardBateria) · 8.4 (Serviços Extras) · 8.5 (Detalhamento/onboarding) · 8.6/8.7 (data: tentada e revertida). Addendum ADR-016.

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

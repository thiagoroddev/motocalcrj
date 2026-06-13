Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).


#### Geradas pela Revisão Geral REV-003 08/06/26


## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Exportar/importar predefinições individuais (.json) | Importante | Normal | G | TASK-BG-031 | [ ] |

> Cada arquivo representa uma `PresetEntry`; a importação cria novo UUID e resolve colisões de sufixo
> sem sobrescrever silenciosamente outra predefinição. Referências: RF-PERF-03, RF-EXP-01 e ADR-021.

### Refatorações da fase

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-REF-43 | Tornar `IMPORTAR_PERFIL` determinístico e normalizar antes do dispatch | Standard | Importante | Normal | M/M | TASK-RF-7.1 | ADR-010 | `[ ]` | 06/06/26 14:42 |

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

## Novos modelos Yamaha — habilitar e criar presets

> Geradas pela **TASK-DOM-3** (fase 1). RF-6.38 **concluída**. **DOM-4 (FZ15, pioneiro a disco) está em
> `em-andamento.md`**; depois dela, os 250s (DOM-4.2/4.3/4.4) reusam a estrutura. RF-6.39 (Ajustes
> model-aware + km-âncora) pode entrar em paralelo.

### TASK-RF-6.39 — "Últimas manutenções" (Ajustes) model-aware + km-âncora de disco/pastilha

- **Modo:** Standard+ (mexe em contrato/schema/migração + refatora a tela) · **Valor:** Importante · **Urgência:** Normal
- **Esforço-H/IA:** M/G · **Dependências:** TASK-RF-6.38 · **REQ/ADR:** ADR-014, ADR-016 (ancorado×amortizado)
- **Origem:** 12/06/26 (decisão do humano na TASK-RF-6.38). Hoje `COMPONENTES_TROCA`
  ([SecaoUltimasManutencoes.tsx](../../src/components/ajustes/SecaoUltimasManutencoes.tsx)) é **estático**
  (mesma lista p/ todo modelo) e só **sapata** tem km-âncora; disco/pastilha são sempre amortizados.
- **Escopo:** (1) tornar a lista de "Últimas manutenções" **derivada do modelo** (modelo a disco mostra
  disco+pastilha diant/tras; a tambor mostra sapata diant/tras), em vez da lista fixa. (2) Dar **km-âncora**
  a disco e pastilha (diant. **e** tras.): novas chaves em `KmUltimaTrocas`
  (`discoFreioDianteiro`, `pastilhaFreioDianteiro`, `discoFreioTraseiro`, `pastilhaFreioTraseiro`) +
  `perfilSchema` com `default(0)` (migração não-quebrável) + defaults + entradas em
  `MAPA_PECA_PARA_KM_ULTIMA_TROCA`. Disco/pastilha passam a ser **ancoráveis** quando o km é informado
  (como a sapata); permanecem amortizados sem km.
- **Critério de aceite:** em Ajustes, cada modelo mostra só os freios que possui; informar km de disco
  ou pastilha (diant/tras) ancora aquele item no Detalhamento; modelos a tambor seguem com sapata; gates verdes.
- **Nota:** decidir se a lista derivada vem do preset (`pecas`/serviços com km-âncora) ou de um catálogo
  por tipo de freio — definir no planejamento da tarefa.

> **Épico DOM-4 concluído:** FZ15 (DOM-4), FZ25 (4.2), Fazer 250 (4.3), Lander 250 (4.4) — 4 presets
> Yamaha novos a freio traseiro a disco. Resta a **RF-6.39** (Ajustes model-aware + km-âncora de
> disco/pastilha), que deixa esses freios ancoráveis.

- **Modo:** Standard · **Valor:** Importante · **Urgência:** Normal · **Esforço-H/IA:** M/M cada
- **Dependências:** **TASK-DOM-4** (FZ15 estreia o padrão a disco + o `MAPA`) · **REQ/ADR:** ADR-019, ADR-021
- **Escopo:** criar `src/presets/{fz25,fazerys250,lander250}.json` reusando a estrutura do FZ15
  (freio a disco), com os dados da DOM-3 (`servicos-extras-*`, `fipe-*`, revisões, peças do consolidado)
  e rodar `npm run fipe:update`. O `MAPA` do freio traseiro a disco já estará no lugar (DOM-4/FZ15).
- **Parâmetros confirmados (humano):** `fatorMaoDeObra` 1.35 (250cc); intervalos metálicos do 250
  (transmissão 30.000, embreagem 50.000, cilindro 130.000, discos 60.000 — ver conferência);
  **consumoKmL:** FZ25 **30**, Fazer 250 **35**, Lander 250 **29** (Lander = pneu trail, vida 20.000/12.000).
- **Critério de aceite:** cada preset válido (`presetSchema`), no onboarding, custo coerente; gates verdes.

> DOM-4.2 = FZ25 · DOM-4.3 = Fazer 250 (fazerys250) · DOM-4.4 = Lander 250.

## Documentação

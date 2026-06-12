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
## Perfil e predefinições

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-RF-6.36 | Reformular "Apagar Tudo" em "Resetar predefinição" (reset da ativa + re-onboarding) | Standard | Importante | Normal | M/M | — | RF-PERF-02, ADR-021 | `[ ]` | 12/06/26 16:10 |

> **6.36** — Substituir "Apagar Tudo" (wipe global → `RESETAR_PERFIL`) por **"Resetar predefinição"**:
> reseta **apenas a predefinição ATIVA** aos dados padrão (mantendo `presetId`/`sufixo`) e **obriga a
> refazer o onboarding** dessa predefinição. Aviso antes da ação: "todos os dados editados serão
> apagados e o onboarding será reiniciado". Remove o contrato `RESETAR_PERFIL` (o wipe global fica
> órfão após a troca do botão) e sincroniza glossário/modelagem. **Decisão de design a resolver no
> plano:** como re-entrar no onboarding gravando de volta no **mesmo** `presetId` — o fluxo atual cria
> preset novo via `INICIAR_NOVA_PREDEFINICAO` + `COMMIT_ONBOARDING`. O reset emergencial do
> ErrorBoundary (`storage.limpar`) permanece como única via de wipe total.


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

# Tarefas em Andamento

---

## TASK-DOC-009 — Sincronizar docs/dominio + docs/arquitetura com código pós-ADR-003

- **Status:** Em andamento
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** P/G
- **Data-hora origem:** 24/05/26 (revisão de docs)
- **Data-hora início:** 24/05/26 15:55
- **Dependências:** —
- **REQ/ADR/DT:** ADR-003, ADR-005, ADR-006

## Plano aprovado (resumo)

**Decisão por arquivo:**
- **Excluir (3):** `historico-manutencao.md`, `diario-trabalho.md`, `calculos-api.md`
- **Reescrever (2):** `estado_inicial.md`, novo `calculos-visao.md`
- **Atualizar (10):** README modelagem, perfil-usuario, bloco-financeiro, bloco-configuracao-display, bloco-trabalho, bloco-perfil-manutencao, overrides, value-objects, aggregate-preset, _glossario, divida-tecnica
- **Adiar:** `docs/requisitos/` → TASK-DOC-010

**Execução em 4 ondas com commit entre elas:**
1. Delete dos 3 vermelhos + README modelagem
2. Reescrita de `estado_inicial.md` + criação de `calculos-visao.md`
3. Atualização cirúrgica dos 8 arquivos do domínio
4. Glossário + dívida técnica + criar TASK-DOC-010

**Critério final:** zero referência a `modoExibicao`, `historicoManutencao`, `diarioTrabalho`, `seguro.tem`, `precoMaoDeObraIndependente`, `frequenciaRevisaoKm`, `modoOficinDisplay`, `servicosMaoDeObra`, `RegistroManutencao`, `adaptarHistoricoParaRegistros`, etc., em docs vivos. ADRs e tarefas concluídas preservam fidelidade histórica.

## Execução

- 24/05/26 15:55: Plano aprovado. Iniciando Onda 1.

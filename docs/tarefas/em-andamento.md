# Tarefas em Andamento

---

# TASK-DOC-010 — Sincronizar docs/requisitos com ADR-003

- **Status:** Em andamento
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** Normal
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 24/05/26 (gerada pela TASK-DOC-009)
- **Data-hora início:** 24/05/26 16:53
- **Dependências:** —
- **REQ/ADR/DT:** ADR-003

## Análise de Impacto

**Data da análise:** 24/05/26

### Mudança Proposta

Spin-off da TASK-DOC-009. Sincronizar `docs/requisitos/*` e `docs/contexto-projeto-ai.md` com o estado real do código pós-ADR-003 (Registros/Diário adiados) + REF-18/19/21 + RF-6.7/6.9/6.11. A DOC-009 já fez `docs/dominio` e `docs/arquitetura`; sobrou a "camada produto".

**Causa raiz:** ADR-003 foi virada arquitetural grande, e os 5 arquivos de produto/requisitos só receberam atualizações pontuais conforme cada feature tocou em algo. O resultado é desencontro acumulado: tela REGISTROS inteira documentada como Should-Have V1, schema TypeScript da v6 com `historicoManutencao`/`diarioTrabalho`/`modoExibicao`/etc., RN-24/25/26 dependendo de Registros, e `PaginaRegistros.tsx` listada numa árvore de pastas onde o arquivo não existe mais.

### Decisão de produto (capturada antes da execução)

Optou-se por estratégia **Híbrida**:
- **`Requisitos_MotoCalc_RJ_v6.md`** (spec versionada, data de fechamento 09/05/26): seções de Registros/Diário **marcadas como ADIADO via ADR-003**, conteúdo preservado para fidelidade histórica da spec v6.
- **`funcionais.md`, `regras-negocio.md`, `nao-funcionais.md`, `contexto-projeto-ai.md`** (docs operacionais, refletem o escopo atual): **referências deletadas**.

**Aprovação de cadência:** humano aprovou as 4 ondas em bloco.

### Execução em 4 ondas (com commit/verificação entre cada)

- **Onda 1 — Docs operacionais:** `funcionais.md` (remover RF-REG-* / RF-FORM-*, atualizar schema 5→14 em RF-EXP-03, ajustar status geral), `regras-negocio.md` (remover RN-24/25/26, reescrever nota DT-7), `nao-funcionais.md` (ajustar RNF-COMP-04, remover eventos `registro_*`, remover Tabs/Sheet Registros, remover `/registros` das rotas), `contexto-projeto-ai.md` (remover `PaginaRegistros.tsx` da árvore).
- **Onda 2 — `Requisitos_v6.md` parte 1:** III.1 (banner ADIADO na aba REGISTROS), III.4 (mapa de telas, rotas `/registros/*`), V.4 (RF-REG-01 a 12), V.5 (RF-FORM-01 a 06), V.8.1 (remover linha modoExibicao), VI.8 (RN-24/25/26).
- **Onda 3 — `Requisitos_v6.md` parte 2:** VIII.2.3 (eventos analytics de Registros) + XI/XII (substituir interfaces TypeScript por pointer enxuto para `src/types/perfil.ts` no estilo `calculos-visao.md`).
- **Onda 4 — `Requisitos_v6.md` parte 3:** XIV (MoSCoW: mover RF-REG/FORM para "Backlog ADR-003"), XV (Fases mencionando Registros.tsx), índice (I-), fechamento + concluidas/.

### Critérios de aceite

- `grep` por `RF-REG|RF-FORM|historicoManutencao|diarioTrabalho|modoExibicao|modoOficinDisplay|precoMaoDeObraIndependente|frequenciaRevisaoKm|PaginaRegistros` em `docs/requisitos` e `docs/contexto-projeto-ai.md` retorna apenas menções contextuais (banner ADIADO, changelog, "removido por…").
- `npm run test` / `npx tsc --noEmit` / `npm run lint` continuam verdes (zero alteração de código esperada).
- `docs/contexto-projeto-ai.md` casa com `ls src/pages/`.

**Nível de risco:** Baixo no código (zero alteração), Médio na docs (5 arquivos, alguns trechos grandes em `Requisitos_v6.md`). Mitigação: ondas com commit + verificação entre elas; substituir XI/XII por pointer em vez de tentar replicar 280 linhas de interfaces que vão decair de novo.

## Execução

- 24/05/26 16:53: Tarefa movida para `em-andamento.md`. Plano aprovado pelo humano (estratégia Híbrida, 4 ondas em bloco).

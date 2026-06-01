---

description: "Template para Revisão Geral (REV). Registra revisão completa do projeto, somente quando solicitada pelo humano, com achados e rastreabilidade para tarefas, ADRs, requisitos e dívidas." modulo: "37" categoria: "templates" versao: "1.0" arquivo_destino: "docs/arquitetura/revisoes-gerais/REV-[NUMERO].md" relacionado:

- "27-revisao-geral.md"
- "21-revisao-codigo.md"
- "32-ADR.md"

---

# 🧾 Template: Revisão Geral (REV)

> **Arquivo destino:** `docs/arquitetura/revisoes-gerais/REV-[NUMERO].md` Exemplo: `docs/arquitetura/revisoes-gerais/REV-001.md` **Quando usar:** somente quando o humano pedir uma revisão geral completa do projeto.

---

## O Que Uma REV Registra

Uma REV registra:

- Pedido humano que disparou a revisão.
- Cobertura completa do projeto e fontes consultadas.
- Achados com evidência.
- Recomendações concretas.
- Tarefas, ADRs, requisitos e dívidas geradas por cada achado.
- Decisões explícitas de não agir, quando houver.

Uma REV não substitui ADR nem tarefa concluída. Ela aponta para elas.

---

## Template Vazio (Para Copiar)

```markdown
# REV-NNN: [Tema da revisão geral]

**Data:** DD/MM/AA
**Status:** [Em andamento / Em validação humana / Concluída / Substituída]
**Revisores:** [Humano(s), IA]
**Escopo:** Projeto inteiro
**Origem:** Pedido explícito do humano: "[texto/resumo do pedido]"
**Módulos/checklists usados:** [21-revisao-codigo, 40-revisao-rapida, 41-seguranca, etc.]

---

## Contexto

[1-3 parágrafos. Por que o humano pediu esta revisão geral agora? Qual problema, suspeita, marco ou necessidade motivou a auditoria completa do projeto?]

## Objetivo

[O que a revisão geral quer responder sobre o projeto inteiro. Ex: "validar coerência entre código, docs, ADRs, requisitos e tarefas concluídas", "identificar lacunas gerais de qualidade antes do próximo marco".]

## Cobertura

### Incluído

- Código de produção
- Testes
- Documentação de arquitetura
- ADRs
- Requisitos
- Tarefas pendentes, em andamento e concluídas
- Domínio, invariantes e dívidas técnicas

### Limites Operacionais

- [o que não foi possível validar nesta execução e por quê]
- [dependências de validação humana ou execução futura]

## Fontes Consultadas

- `caminho/arquivo.ts`
- `docs/arquitetura/ADR/ADR-XXX.md`
- `docs/tarefas/concluidas/...`
- [comandos executados, se houver]

## Metodologia

- [como a revisão foi feita: leitura, grep, execução de testes, checklist, comparação docs vs código]
- [limites da revisão: o que não foi possível validar]

## Resumo Executivo

- **Total de achados:** [N]
- **Bloqueantes:** [N]
- **Importantes:** [N]
- **Sugestões:** [N]
- **Tarefas geradas:** [N]
- **ADRs geradas:** [N]
- **Veredito:** [APROVADO / APROVADO COM RESSALVAS / REQUER AÇÃO]

## Achados

### REV-NNN-A01 - [Título do achado]

- **Severidade:** [🔴 Bloqueante / 🟡 Importante / 🟢 Sugestão]
- **Área:** [código / docs / arquitetura / requisitos / testes / UX / segurança]
- **Evidência:** [`arquivo` linha X / ADR-XXX / TASK-XXX / comando / observação validada]
- **Problema:** [descrição objetiva]
- **Recomendação:** [ação concreta, decisão necessária ou melhoria sugerida]
- **Tarefa(s) gerada(s):** [TASK-XXX: descrição / `- (não criada; recomendada)` / `- (não aplicável)` / `- (aceito sem ação)`]
- **ADR(s) gerada(s):** [ADR-XXX: título / `-`]
- **Requisito/DT gerado:** [RF/RN/RNF/DT-XXX / `-`]
- **Status do achado:** [Aberto / Encaminhado / Resolvido / Aceito sem ação]

### REV-NNN-A02 - [Título do achado]

- **Severidade:** [🔴 / 🟡 / 🟢]
- **Área:** [...]
- **Evidência:** [...]
- **Problema:** [...]
- **Recomendação:** [...]
- **Tarefa(s) gerada(s):** [...]
- **ADR(s) gerada(s):** [...]
- **Requisito/DT gerado:** [...]
- **Status do achado:** [...]

## Recomendações Gerais

- [recomendação transversal que não pertence a um achado único, se houver]
- [ou `- (nenhuma recomendação geral além dos achados)`]

## Matriz de Rastreabilidade

| Achado | Severidade | Tarefa(s) | ADR(s) | Requisito/DT | Status |
|---|---|---|---|---|---|
| REV-NNN-A01 | 🔴/🟡/🟢 | TASK-XXX / - | ADR-XXX / - | RF/RN/RNF/DT / - | Aberto/Encaminhado/Resolvido |
| REV-NNN-A02 | 🔴/🟡/🟢 | TASK-XXX / - | ADR-XXX / - | RF/RN/RNF/DT / - | Aberto/Encaminhado/Resolvido |

## Tarefas Geradas

- TASK-XXX: [descrição] - origem: REV-NNN-A01
- (ou `- (nenhuma tarefa criada nesta revisão)`)

## ADRs Geradas

- ADR-XXX: [título] - origem: REV-NNN-A02
- (ou `- (nenhuma ADR criada nesta revisão)`)

## Requisitos Gerados

- [RF/RN/RNF]-XXX: [descrição] - origem: REV-NNN-A03
- (ou `- (nenhum requisito criado nesta revisão)`)

## Dívidas Técnicas Geradas

- DT-XXX: [descrição] - origem: REV-NNN-A04
- (ou `- (nenhuma dívida técnica criada nesta revisão)`)

## O Que Ficou Sem Ação

- REV-NNN-A05: [motivo de não criar tarefa/ADR/requisito]
- (ou `- (nenhum achado ficou sem ação explícita)`)

## Limites da Revisão

- [o que não foi validado]
- [riscos de falso negativo]
- [dependências de validação humana]

## Histórico

| Data | Status | Mudança |
|---|---|---|
| DD/MM/AA | Em andamento | REV criada |
| DD/MM/AA | Concluída | Achados fechados e rastreabilidade conferida |
```

---

## Regras de Preenchimento

- Não deixe achado sem evidência.
- Não deixe tarefa ou ADR criada sem aparecer no achado correspondente.
- Se a tarefa ainda não foi criada, registre explicitamente `- (não criada; recomendada)`.
- Se uma ADR surgiu da revisão, a ADR precisa citar `REV-NNN-Axx` no contexto ou histórico.
- Se uma tarefa surgiu da revisão, a tarefa precisa citar `REV-NNN-Axx` no campo `REQ/ADR/DT` ou nas observações.
- Se nada foi gerado, mantenha as seções finais com `-`. Estrutura vazia é melhor que ausência silenciosa.

---

## Exemplo Curto de Achado

```markdown
### REV-001-A03 - ADR-004 cita lista de serviços diferente do código atual

- **Severidade:** 🟡 Importante
- **Área:** docs/arquitetura
- **Evidência:** `docs/arquitetura/ADR/ADR-004.md`; `src/data/servicos.ts`
- **Problema:** a ADR descreve uma composição de serviços que não corresponde mais ao código após as tarefas de manutenção.
- **Recomendação:** atualizar ADR ou criar ADR substitutiva explicando a nova composição.
- **Tarefa(s) gerada(s):** TASK-DOC-XXX: reconciliar ADR-004 com código atual
- **ADR(s) gerada(s):** -
- **Requisito/DT gerado:** -
- **Status do achado:** Encaminhado
```

---

## 🔗 Templates e Módulos Relacionados

- [`../processos/27-revisao-geral.md`](https://claude.ai/chat/processos/27-revisao-geral.md) - processo completo de REV
- [`../processos/21-revisao-codigo.md`](https://claude.ai/chat/processos/21-revisao-codigo.md) - níveis de achados e revisão de código
- [`32-ADR.md`](https://claude.ai/chat/templates/32-ADR.md) - template para decisões arquiteturais geradas por REV

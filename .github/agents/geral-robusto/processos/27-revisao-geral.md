---
description: "Revisão geral: auditoria completa do projeto, somente quando solicitada pelo humano, com registro em REV, achados rastreáveis, tarefas e ADRs geradas."
modulo: "27"
categoria: "processos"
versao: "1.0"
relacionado:
  - "21-revisao-codigo.md"
  - "25-analise-impacto.md"
  - "../checklists/40-revisao-rapida.md"
  - "../templates/37-revisao-geral.md"
---

# 🔎 Revisão Geral

> Revisão geral é uma auditoria documentada **do projeto inteiro**, feita **somente quando o humano pede explicitamente**. Ela cria um arquivo próprio `REV-NNN.md`, com achados rastreáveis para tarefas, ADRs, requisitos ou dívidas técnicas.

---

## 1. O Que É

Uma revisão geral responde: **"o estado atual do projeto inteiro está coerente com as decisões, requisitos e padrões que já aceitamos?"**

Ela não é acionada pela IA por iniciativa própria. A IA pode sugerir que uma revisão geral seria útil, mas só cria `REV-NNN.md` quando o humano pedir algo como "faça uma revisão geral do projeto".

### 1.1 É

- Auditoria completa do projeto, com evidências verificadas em código/docs.
- Documento histórico próprio em `docs/arquitetura/revisoes-gerais/REV-NNN.md`.
- Fonte rastreável de achados que podem gerar tarefas, ADRs, requisitos ou dívidas técnicas.
- Complemento ao ciclo de tarefa, não substituto.

### 1.2 Não É

- Revisão final de uma tarefa concluída. Isso continua no arquivo da tarefa, conforme módulo 21.
- Revisão de uma área, módulo, feature, pasta ou bloco de ADRs isolado.
- Revisão acionada automaticamente pela IA sem pedido do humano.
- ADR. Se a revisão exigir uma decisão arquitetural, crie ADR separada e relacione no achado.
- Backlog solto. Achado sem evidência e sem recomendação concreta não entra como revisão.
- Lugar para inventar documentação que contradiz o código. Código segue sendo a verdade primária.

---

## 2. Quando Usar

|Situação|Usa REV?|
|---|---|
|Humano pede explicitamente revisão geral do projeto inteiro|✅ Sim|
|Humano pede auditoria completa do projeto, incluindo código, docs, ADRs, requisitos e tarefas|✅ Sim|
|IA acha que seria útil revisar tudo, mas humano não pediu|❌ Não - pode sugerir, não cria REV|
|Revisão de uma área específica, módulo, feature, pasta ou tema transversal|❌ Não - use revisão de tarefa, análise de impacto ou registro comum|
|Auditoria de docs vs código após várias tarefas, mas sem pedido humano de revisão geral completa|❌ Não - registre achados no fluxo da tarefa ou peça confirmação|
|Revisão de um bloco de ADRs e tarefas relacionadas|❌ Não - só vira REV se o humano pedir revisão geral do projeto inteiro|
|Revisão de fechamento de uma única tarefa|❌ Não - fica na tarefa concluída|
|Decisão arquitetural específica|❌ Não - vira ADR, possivelmente originada por REV|
|Lista informal de ideias sem evidência|❌ Não - registre no chat ou em pendentes só após decisão|

---

## 3. Local e Numeração

Revisões gerais vivem em:

```text
docs/arquitetura/revisoes-gerais/REV-NNN.md
```

Regras:

- Use numeração sequencial com 3 dígitos: `REV-001.md`, `REV-002.md`, `REV-003.md`.
- Antes de criar, liste a pasta e escolha o próximo número livre.
- Nunca reutilize número, mesmo que uma revisão seja cancelada ou substituída.
- O título do documento é `# REV-NNN: [tema da revisão]`.

---

## 4. Processo

```
CONFIRMAR PEDIDO → COLETAR EVIDÊNCIA → CLASSIFICAR ACHADOS → RELACIONAR SAÍDAS → FECHAR REV
```

### 4.1 Confirmar Pedido e Cobertura

Registre no início:

- Pedido explícito do humano que disparou a revisão.
- Objetivo da revisão.
- Cobertura do projeto inteiro: código, docs, ADRs, requisitos, tarefas e testes.
- Limites operacionais inevitáveis, quando houver, sem transformar a REV em revisão parcial.
- Fontes consultadas: arquivos, comandos, ADRs, tarefas, requisitos.
- Checklists/módulos usados.

Se o projeto inteiro ficar grande demais para uma única sessão, a REV continua sendo uma só: registre progresso e limites no mesmo arquivo. Não divida por área, porque REV é o artefato da revisão geral completa.

### 4.2 Coletar Evidência

Todo achado precisa apontar para evidência:

- Caminho de arquivo e linha quando possível.
- ADR, requisito, tarefa ou invariante que foi violado.
- Comando/teste que demonstrou o problema.
- Observação humana registrada, quando o achado depende de validação de produto.

Achado sem evidência vira hipótese, não achado.

### 4.3 Classificar Achados

Use os mesmos níveis do módulo 21:

|Nível|Quando usar|Ação esperada|
|---|---|---|
|🔴 Bloqueante|Risco alto, violação de regra inegociável, bug crítico, contradição grave|Criar tarefa imediata ou pausar para decisão humana|
|🟡 Importante|Problema real, mas não impede o projeto de continuar|Recomendar tarefa ou ADR, criando só se aprovado/necessário|
|🟢 Sugestão|Melhoria opcional ou refinamento|Registrar sem obrigação de tarefa|

### 4.4 Identificar Cada Achado

Cada achado tem ID local rastreável:

```text
REV-001-A01
REV-001-A02
REV-001-A03
```

Esse ID deve aparecer:

- No achado dentro da REV.
- Na tarefa gerada, quando existir.
- Na ADR gerada, quando existir.
- Em requisito ou dívida técnica criada a partir dele.

---

## 5. Saídas Rastreáveis

Uma REV pode gerar quatro tipos de saída:

|Saída|Quando criar|Onde registrar|
|---|---|---|
|Tarefa|Quando há trabalho executável claro|`docs/tarefas/pendentes.md` + achado da REV|
|ADR|Quando há decisão arquitetural com custo de reversão|`docs/arquitetura/ADR/ADR-NNN.md` + achado da REV|
|Requisito|Quando o projeto precisa formalizar comportamento novo|`docs/requisitos/...` + achado da REV|
|Dívida técnica|Quando o risco é aceito e adiado com gatilho|`docs/dominios/divida-tecnica.md` + achado da REV|

### 5.1 Tarefas Geradas

Tarefa gerada por revisão geral **não é obrigatória no mesmo momento do achado**.

Estados aceitos no campo do achado:

- `TASK-XXX` - tarefa criada e relacionada.
- `- (não criada; recomendada)` - há recomendação, mas o humano ainda não aprovou/criou.
- `- (não aplicável)` - achado não pede tarefa.
- `- (aceito sem ação)` - decisão explícita de não agir.

Quando a tarefa for criada, atualize o achado com o ID da tarefa.

### 5.2 ADRs Geradas

Se a revisão revelar uma decisão arquitetural:

1. Crie uma ADR própria em `docs/arquitetura/ADR/ADR-NNN.md`.
2. Cite a origem no contexto da ADR: `Origem: REV-001-A03`.
3. Atualize o achado na REV com `ADR-NNN`.

REV registra o problema e a recomendação; ADR registra a decisão.

### 5.3 Referência Bidirecional

Rastreabilidade mínima obrigatória:

- Na REV: achado lista `Tarefa(s) gerada(s)` e `ADR(s) gerada(s)`.
- Na tarefa: campo `REQ/ADR/DT` ou observações inclui `REV-NNN-Axx`.
- Na ADR: contexto ou histórico inclui `REV-NNN-Axx`.

Se só um lado aponta para o outro, a rastreabilidade está incompleta.

---

## 6. Formato do Achado

```markdown
### REV-001-A01 - [Título do achado]

- **Severidade:** [🔴 Bloqueante / 🟡 Importante / 🟢 Sugestão]
- **Área:** [código / docs / arquitetura / requisitos / testes / UX / segurança]
- **Evidência:** `arquivo.ts` linha X; ADR-YYY; comando; observação validada
- **Problema:** [descrição objetiva]
- **Recomendação:** [ação concreta ou decisão necessária]
- **Tarefa(s) gerada(s):** [TASK-XXX ou estado sem tarefa]
- **ADR(s) gerada(s):** [ADR-XXX ou `-`]
- **Requisito/DT gerado:** [RF/RN/RNF/DT ou `-`]
- **Status do achado:** [Aberto / Encaminhado / Resolvido / Aceito sem ação]
```

---

## 7. Encerramento da REV

Uma REV só fica `Concluída` quando:

1. Pedido humano, cobertura completa e fontes estão claros.
2. Todo achado tem evidência, recomendação e status.
3. Toda tarefa/ADR/requisito/DT criada está listada no achado correspondente.
4. A matriz de rastreabilidade confere com as seções finais.
5. O histórico registra a conclusão.

Se ainda há investigação em curso, status é `Em andamento` ou `Em validação humana`.

---

## 8. Relação com Outros Módulos

|Módulo|Como se conecta|
|---|---|
|`21-revisao-codigo.md`|Fornece filosofia, níveis de achados e critérios de veredito|
|`40-revisao-rapida.md`|Checklist base para revisar código durante uma REV|
|`25-analise-impacto.md`|Usado quando a REV identifica mudança grande ou risco de arquitetura|
|`32-ADR.md`|Usado quando um achado gera decisão arquitetural|
|`37-revisao-geral.md`|Template obrigatório do arquivo `REV-NNN.md`|

---

## 9. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Onde salvar?|`docs/arquitetura/revisoes-gerais/REV-NNN.md`|
|Formato do nome?|`REV-001.md`, `REV-002.md`, sempre 3 dígitos|
|Achado precisa de ID?|Sim: `REV-001-A01`|
|Todo achado gera tarefa?|Não. Se gerar, o ID da tarefa fica no achado|
|Todo achado gera ADR?|Não. Se gerar, a ADR cita o achado e o achado cita a ADR|
|Pode substituir revisão de tarefa?|Não. Revisão de tarefa continua na tarefa concluída|
|Pode contradizer código?|Não. Código é a verdade primária|

---

## 🔗 Módulos Relacionados

- [`21-revisao-codigo.md`](./21-revisao-codigo.md) - processo de revisão de código e classificação de achados
- [`25-analise-impacto.md`](./25-analise-impacto.md) - análise quando a REV revela mudança de alto impacto
- [`../checklists/40-revisao-rapida.md`](../checklists/40-revisao-rapida.md) - checklist base para evidências de código
- [`../templates/37-revisao-geral.md`](../templates/37-revisao-geral.md) - template do arquivo REV

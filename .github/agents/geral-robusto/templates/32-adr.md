---

description: "Template para Architecture Decision Record (ADR). Documenta decisões arquiteturais com contexto, alternativas e trade-offs." modulo: "32" categoria: "templates" versao: "1.0" arquivo_destino: "docs/arquitetura/ADR/ADR-[NUMERO].md" relacionado:

- "25-analise-impacto.md"
- "27-revisao-geral.md"
- "20-ciclo-tarefa.md"
- "31-task-concluida.md"

---

# 📜 Template: ADR (Architecture Decision Record)

> **Arquivo destino:** `docs/arquitetura/ADR/ADR-[NUMERO].md` Exemplo: `docs/arquitetura/ADR/ADR-008.md` **Quando usar:** ao tomar (ou documentar) uma decisão arquitetural com impacto não-trivial e reversão custosa. ADR responde a pergunta futura: _"por que decidimos assim, em vez de assado?"_

---

## O Que É (e O Que Não É) Uma ADR

### É

- Justificativa documentada de **uma escolha** entre alternativas reais
- Captura **contexto** (por que virou questão naquele momento)
- Honesta sobre **trade-offs aceitos**
- Lista **alternativas descartadas** e os motivos

### Não É

- Documentação de implementação ("como o componente funciona")
- Plano de feature ("o que vamos construir")
- Especificação técnica detalhada ("API tem esses endpoints")
- Decisão trivial ("vamos usar `useState` em vez de `useReducer` neste hook")

A regra: **se a decisão tem custo grande para reverter, vira ADR. Se reverter é trivial, não vira.**

---

## Quando Criar uma ADR

|Situação|Cria ADR?|
|---|---|
|Escolha entre tecnologias concorrentes (Zustand vs Context, REST vs GraphQL)|✅ Sim|
|Definição de padrão arquitetural (camadas, isolamento de storage)|✅ Sim|
|Decisão sobre imutabilidade ou criticidade de arquivos/módulos|✅ Sim|
|Resolução de uma decisão pendente identificada em análise de impacto|✅ Sim|
|Decisão arquitetural surgida de achado `REV-NNN-Axx` em revisão geral do projeto|✅ Sim|
|Adoção de padrão que impacta todo o código (idioma, formato de teste)|✅ Sim|
|Mudança de stack ou versão com impacto estrutural|✅ Sim|
|Decisão de **não** fazer algo importante (ex: "não usaremos microservices")|✅ Sim|
|Convenção trivial (espaçamento, nome de função)|❌ Não - vai em `convencoes.md`|
|Refatoração local sem impacto arquitetural|❌ Não - vira tarefa REF|
|Implementação de algo já definido em requisitos|❌ Não - já tem origem documentada|
|Escolha de biblioteca pequena para resolver problema isolado|❌ Não - registra no PR/commit|

### Teste prático

Antes de criar ADR, pergunte: _"se daqui a 1 ano alguém quiser fazer diferente, o custo de reverter é grande?"_

- **Sim** → ADR.
- **Não** → não vale a cerimônia.

---

## Anatomia de uma ADR Boa

Toda ADR tem **6 seções essenciais** + algumas opcionais:

|Seção|Obrigatória?|Conteúdo|
|---|---|---|
|Título|Sim|`ADR-NNN: [decisão em uma frase]`|
|Metadados|Sim|Data, Status, Decisores|
|Contexto|Sim|Por que isso virou questão|
|Decisão|Sim|O que foi decidido|
|Consequências|Sim|Positivas + trade-offs aceitos|
|Alternativas Descartadas|Sim|O que **não** foi escolhido e por quê|
|Requisitos Relacionados|Opcional|RFs/RNFs que motivaram|
|Tasks Geradas|Opcional|Tarefas que implementam a decisão|
|Supersede|Opcional|Se substitui ADR anterior|
|Histórico|Opcional|Mudanças no documento|

---

## Estrutura Completa (Exemplo Preenchido)

Continuação narrativa: a TASK-RF-5.1 gerou esta ADR durante a execução.

```markdown
# ADR-008: Paginação cursor-based para listas grandes

**Data:** 13/05/26
**Status:** Aceita
**Decisores:** João (humano), IA (Claude)

## Contexto

A TASK-RF-5.1 (Registros: lista e sub-abas) precisou implementar paginação de uma lista que pode chegar a milhares de itens. Durante a análise da API REST do backend, descobrimos que ela **só expõe paginação cursor-based** (retorna `{ items, count, nextCursor }`), não suporta offset.

Até este momento, todas as listas no projeto usavam paginação offset (`page` + `limit`), implementada via hook genérico `usePaginacao`. Continuar com offset exigiria:

- Modificar o backend para aceitar `page`/`limit` (não temos controle direto sobre ele)
- OU adaptar o frontend para emular offset a partir do cursor (custo médio + perdemos garantias do cursor)

A pressão de tempo (TASK-RF-5.1 era Imediata) tornou inviável esperar mudança no backend. Precisamos decidir entre adaptar o front ou trocar de padrão.

## Decisão

**Adotamos paginação cursor-based como padrão para listas grandes no projeto.**

O hook `usePaginacao` será mantido para listas pequenas/médias que carregam tudo de uma vez (sem paginação real). Para listas grandes, criamos `usePaginacaoCursor`, que se conecta diretamente ao formato da API.

Componentes de lista (`ListaRegistros`, futuras `ListaPedidos`, etc.) consomem `usePaginacaoCursor`.

## Consequências

### Positivas

- **Compatibilidade direta** com a API atual sem ginástica
- **Performance melhor** em listas que mudam frequentemente (cursor não invalida ao inserir/deletar itens)
- **UI mais simples:** "carregar mais" em vez de números de página
- **Padroniza** futuras telas de listagem grande

### Trade-offs Aceitos

- **Sem "ir para página X":** usuário não pode pular para a página 47 diretamente. Aceitamos porque o caso de uso real é navegação linear (rolar para baixo, não saltar)
- **Total nem sempre conhecido:** o componente mostra "carregando mais..." em vez de "página 3 de 10". UX um pouco diferente
- **Hook adicional para manter:** agora temos dois (`usePaginacao` e `usePaginacaoCursor`). Mitigação: documentação clara em qual usar quando

## Alternativas Descartadas

### Alternativa 1: Modificar o backend para aceitar offset

**Por que descartada:**
- Backend é serviço externo gerido por outra equipe; mudança levaria semanas
- Quebraria contrato com outros clientes que já usam cursor
- Bloqueia TASK-RF-5.1 (que era Imediata)

### Alternativa 2: Adaptar o frontend para emular offset a partir do cursor

**Por que descartada:**
- Complexidade: salvar cursores intermediários no estado para "voltar"
- Perde garantia de consistência do cursor (se itens forem inseridos entre páginas, ordem pode confundir)
- Mais código de manutenção sem ganho real para o usuário

### Alternativa 3: Não paginar e carregar tudo

**Por que descartada:**
- Listas podem ter milhares de itens; impacto direto em performance
- Bundle inflado; LCP comprometido
- Viola RNF-04 (performance Lighthouse mínima)

## Requisitos Relacionados

- **Motivada por:** TASK-RF-5.1, RF-REG-01, RF-REG-02
- **Afeta:** todas as listas grandes futuras (TASK-RF-5.2, TASK-RF-7.X)
- **Cumpre RNF:** RNF-04 (performance), RNF-11 (escalabilidade)

## Tasks Geradas

- TASK-RF-5.1: implementação inicial (concluída, consome esta ADR)
- TASK-REF-09: extrair `ExibicaoEstrelas` para `components/ui/` (não relacionada à ADR, gerada na revisão)
- TASK-DOC-05: documentar quando usar `usePaginacao` vs `usePaginacaoCursor` em `docs/arquitetura/convencoes.md`

## Supersede

- (nenhuma) - esta é uma decisão nova, não substitui ADR anterior

## Histórico

| Data | Status | Mudança |
|---|---|---|
| 13/05/26 14:00 | Proposta | Criada durante análise da TASK-RF-5.1 |
| 13/05/26 14:30 | Aceita | Aprovada pelo humano após validação das alternativas |
```

---

## Template Vazio (Para Copiar)

```markdown
# ADR-NNN: [Decisão em uma frase, no presente]

**Data:** DD/MM/AA
**Status:** [Proposta / Aceita / Rejeitada / Depreciada / Substituída]
**Decisores:** [nome(s) do(s) decisor(es)]

## Contexto

[1-3 parágrafos. Por que esta decisão precisou ser tomada AGORA? Que problema apareceu? Que restrições existem? Que opções estavam em cima da mesa?]

[Importante: contexto explica o "porque virou questão". Não é "o que é React" - é "no nosso projeto, neste momento, surgiu situação X que exige escolha"]

## Decisão

[O que foi decidido, em 1-3 parágrafos. Direto, sem ambiguidade. Quem ler em 2 anos precisa entender exatamente o que foi escolhido]

## Consequências

### Positivas

- [benefício 1]
- [benefício 2]
- [benefício 3]

### Trade-offs Aceitos

- [custo 1]: [por que aceito]
- [custo 2]: [por que aceito]
- [custo 3]: [por que aceito]

## Alternativas Descartadas

### Alternativa 1: [Nome]

**Por que descartada:**
- [motivo 1]
- [motivo 2]

### Alternativa 2: [Nome]

**Por que descartada:**
- [motivo]

[Quantas alternativas faz sentido. Mínimo: 1. Máximo razoável: 4]

## Requisitos Relacionados

- **Motivada por:** [TASK-X, RF-Y, REV-NNN-Axx, ou contexto não-tarefa]
- **Afeta:** [áreas/features/requisitos impactados]
- **Cumpre RNF:** [RNFs relacionados, se houver]

## Tasks Geradas

- [TASK-X: descrição]
- (ou `- (nenhuma tarefa gerada por esta ADR)`)

## Supersede

- [ADR-XX: título] - caso esta substitua decisão anterior
- (ou `- (decisão nova, não substitui anterior)`)

## Histórico

| Data | Status | Mudança |
|---|---|---|
| DD/MM/AA | Proposta | Criada |
| DD/MM/AA | Aceita | Aprovada |
```

---

## Variante 1: ADR Retrospectiva

Decisão **já foi tomada e implementada** no passado, mas não foi documentada. Você está criando ADR agora para registrar.

```markdown
# ADR-001: [Decisão]

**Data:** [data atual da escrita]
**Status:** Aceita (retrospectiva)
**Decisores:** [se souber, lista; senão, "desconhecido"]

## Contexto

[Note "retrospectiva" no início] Esta ADR foi criada **retrospectivamente** para documentar uma decisão já implementada no projeto. A escolha original aconteceu em [data aproximada, se souber], antes da adoção do padrão `.agent/`.

[Continue com o contexto identificado por engenharia reversa do código]

## Decisão

[O que está implementado no código atualmente. Esta seção descreve o estado real, não uma escolha sendo tomada agora]

## Consequências Observadas

[O que já vimos acontecer com a decisão. Vantagens reais, problemas reais. Diferente de "consequências previstas" da ADR normal - aqui você fala do que **aconteceu de verdade**]

## Alternativas Não Investigadas

[Para retrospectiva, não dá para listar "alternativas descartadas" com confiança (não foi decisão racional naquele momento). Liste o que poderia ter sido considerado mas hoje não dá para reconstituir]

## Confirmação

- [ ] Esta decisão foi validada com humano em [data]
- [ ] Mantemos a decisão original
- [ ] OU criamos ADR-XXX que substitui esta
```

A honestidade é importante: ADR retrospectiva **não inventa** racionalidade que não existia. Só documenta o estado atual e abre espaço para decisão consciente futura.

---

## Variante 2: ADR Rejeitada

Você propôs uma ADR, mas o humano (ou equipe) decidiu não aceitar.

```markdown
# ADR-012: [Decisão proposta]

**Data:** DD/MM/AA
**Status:** Rejeitada
**Decisores:** [quem rejeitou]

## Contexto

[Igual à ADR aceita: por que isso virou questão]

## Decisão Proposta

[O que foi proposto, em forma condicional: "se aceita, faríamos X"]

## Motivos da Rejeição

- [razão 1]
- [razão 2]

## O Que Foi Mantido / Alternativa Adotada

[Se nada mudar, dizer "o status quo foi mantido". Se outra decisão foi tomada em vez desta, referenciar a ADR-NNN que vingou]

## Aprendizado

- [o que aprendemos com essa proposta rejeitada]
```

**Por que documentar uma rejeição:** evita que daqui a 6 meses alguém proponha **a mesma coisa**, sem saber que já foi analisado. ADR rejeitada é prevenção de loop de discussão.

---

## Variante 3: ADR Que Supersede Outra

Mudou de ideia (com motivo). A decisão antiga ainda fica registrada, mas marcada como substituída.

### Passo 1: marcar a ADR antiga como "Substituída"

```markdown
# ADR-005: [Decisão antiga]

**Data:** [original]
**Status:** Substituída por ADR-014
**Decisores:** [originais]

[... resto do conteúdo original mantido ...]

## Substituição

Esta ADR foi substituída por **ADR-014** em DD/MM/AA. Motivo principal: [resumo de 1 linha].
```

### Passo 2: criar a ADR nova com referência

```markdown
# ADR-014: [Nova decisão]

**Data:** DD/MM/AA
**Status:** Aceita
**Decisores:** [decisores]

## Contexto

A ADR-005 estabelecia [...]. Após [evento/aprendizado/mudança], notamos que a decisão original [problema observado].

[Continua com contexto normal]

## Supersede

- **ADR-005: [título]** - substituída por:
  - [motivo 1]
  - [motivo 2]
  - [aprendizado adquirido entre as duas decisões]

[Resto da ADR igual ao template normal]
```

**Princípio:** ADR antiga **nunca é apagada**, mesmo substituída. Histórico de decisões importa.

---

## Numeração e Nomeação

### Numeração

- **Sequencial e nunca reutilizada.** ADR-001, ADR-002, ADR-003...
- Mesmo ADR rejeitada **mantém o número** (próxima é ADR-N+1)
- Padding com zeros à esquerda até 3 dígitos: `ADR-001`, `ADR-042`, não `ADR-1` ou `ADR-42`
- Se passar de 999, expanda para 4 dígitos (mas projetos raramente chegam lá)

### Nome do arquivo

`docs/arquitetura/ADR/ADR-NNN.md`

Sem título no nome do arquivo. O título completo está dentro, no `# H1`.

**Não:** `ADR-008-paginacao-cursor.md` **Sim:** `ADR-008.md` com `# ADR-008: Paginação cursor-based para listas grandes` dentro

Justificativa: títulos mudam (refinamentos de redação); número não. Manter nome estável facilita links.

---

## Status: Ciclo de Vida

|Status|Significado|Próximo passo|
|---|---|---|
|**Proposta**|ADR criada, aguarda análise/aprovação|Decisor analisa → aceita ou rejeita|
|**Aceita**|Aprovada e em vigor|Implementação acontece nas tasks vinculadas|
|**Rejeitada**|Analisada e descartada|Permanece como histórico; evita re-discussão|
|**Depreciada**|Já não se aplica, mas sem substituição direta|Permanece como histórico|
|**Substituída**|ADR-XXX a substituiu|Aponta para a substituta|

**Importante:** ADR não muda de "Aceita" para "Rejeitada" depois. Se decidirmos diferente, criamos **nova ADR que supersede**.

---

## Mini-FAQ

**1. Quantas ADRs um projeto típico tem?** Depende muito. Projeto solo enxuto: 5-15 ADRs em 1 ano. Projeto profissional médio: 30-80. Não persiga número - persiga relevância.

**2. Quem decide se uma decisão "merece" ADR?** Use o teste prático: _"reverter é caro?"_ Se sim, vira ADR. Quando em dúvida, **pergunte ao humano** antes de criar.

**3. ADR pode ser proposta por IA?** Sim, mas status `Proposta`. A IA escreve, o humano valida antes de virar `Aceita`. Para decisões puramente técnicas onde IA tem autonomia (registrar padrão já em uso, por exemplo), ADR retrospectiva pode ser criada como `Aceita (retrospectiva)`.

**4. Posso usar ADR para registrar decisão de produto?** Não. ADR é **arquitetural**. Decisão de produto vai em `docs/requisitos/` ou notas de produto. ADR fala de **como** construímos, não **o que** construímos.

**5. ADR e Requisito são a mesma coisa?** Não. Requisito = o que o produto precisa fazer. ADR = como decidimos implementar/estruturar para fazer. Um requisito pode gerar ADR (ex: "perfis precisam ser persistidos" → ADR de "como persistir"). Mas eles vivem em pastas diferentes.

**6. Posso ter ADR curta?** Sim, desde que cubra as 6 seções essenciais. Uma decisão simples pode caber em 30 linhas. Não infle artificialmente para parecer "profissional".

**7. Como mostro uma ADR no PR/commit?** Mencione no commit: `feat: implementar paginação cursor (ADR-008)`. No PR, link direto para o arquivo. Quem revisar PR vai ler a ADR para entender a decisão antes do código.

**8. ADR pode conter código?** Pequenos snippets para ilustrar a decisão, sim. Mas ADR não substitui documentação de implementação. Se você está escrevendo 200 linhas de código no ADR, está fazendo errado - código vai para o projeto, ADR fica enxuta.

**9. Onde fica a lista de todas as ADRs?** `docs/arquitetura/ADR/` como pasta. Opcionalmente, manter `docs/arquitetura/ADR/README.md` com índice (tabela de número, título, status, data). Útil para projetos com muitas ADRs.

---

## 🔗 Templates e Módulos Relacionados

- [`../processos/25-analise-impacto.md`](https://claude.ai/processos/25-analise-impacto.md) - Análise de impacto frequentemente gera ADR
- [`../processos/20-ciclo-tarefa.md`](https://claude.ai/processos/20-ciclo-tarefa.md) - Tarefas Strict exigem ADR
- [`31-task-concluida.md`](https://claude.ai/chat/31-task-concluida.md) - Tarefa concluída referencia ADRs geradas
- [`33-contexto-projeto-ai.md`](https://claude.ai/chat/33-contexto-projeto-ai.md) - Contexto do projeto pode referenciar ADRs importantes

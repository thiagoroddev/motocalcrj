# Uso de IA no Desenvolvimento

> **Resumo em uma frase:** o MotoCustoRJ foi desenvolvido por um humano que decidiu, especificou e
> revisou, usando assistentes de IA como executores sob um processo escrito, versionado e auditável.

Este documento existe porque acho que declarar o uso de IA é parte de fazer o trabalho direito — e
porque, num projeto assim, *como* a IA foi usada diz mais sobre a engenharia do que o fato de ela ter
sido usada.

---

## 1. Divisão de responsabilidade

| Atividade | Quem decide | Quem executa |
|---|---|---|
| Problema, público e escopo do produto | Humano | Humano |
| Decisões de arquitetura (ADRs) | Humano | Humano escreve, IA formata/revisa |
| Modelagem de domínio, invariantes e regras de negócio | Humano | Humano com IA como interlocutora |
| Pesquisa de dados reais (FIPE, ANP, IPVA, peças, revisões) | Humano | Humano — coleta e conferência manual nas fontes |
| Recorte e priorização de tarefas | Humano | Humano |
| Implementação de código e testes | Humano define o critério de aceite | IA majoritariamente |
| Refatoração e correção de bugs | Humano aponta / valida | IA majoritariamente |
| Redação de documentação | Humano define conteúdo e revisa | IA majoritariamente |
| Aceite de qualquer entrega | Humano | Humano |

Nada entrou no repositório sem passar por leitura e aceite meu. A IA nunca teve autonomia para
decidir produto, arquitetura ou dado de domínio — quando ela propunha algo nessas áreas, a proposta
virava tarefa ou ADR e era decidida por mim.

---

## 2. Como o trabalho com IA foi governado

O projeto nunca usou IA em modo conversa livre. Existe uma camada de instruções versionada no próprio
repositório, que qualquer pessoa pode ler:

| Camada | Onde | Papel |
|---|---|---|
| Comportamento do agente | [`.github/agents/`](../.github/agents/) | Como a IA deve pensar e agir: princípios inegociáveis, ciclo de tarefa, checklists de revisão, segurança, acessibilidade, padrões de código e templates |
| Contexto do produto | [`docs/contexto-projeto-ai.md`](./contexto-projeto-ai.md) | O que o projeto é, quais são as fontes de verdade e quais decisões já estão superadas |
| Fontes de verdade | [`docs/requisitos/`](./requisitos/), [`docs/arquitetura/ADR/`](./arquitetura/ADR/), [`docs/dominio/`](./dominio/) | O que o software precisa cumprir e o que nunca pode ser violado |
| Registro do trabalho | [`docs/tarefas/`](./tarefas/) | Tarefas concluídas, com data e conteúdo, e o que ficou fora do escopo |

Há uma hierarquia explícita de resolução de conflito (instrução direta do humano → ADR aceita →
requisitos → invariantes → código → histórico), justamente para que o assistente não "escolha o
texto mais conveniente" quando as fontes divergem.

### Ciclo aplicado em toda tarefa

1. Eu recortava a tarefa e registrava em `docs/tarefas/pendentes.md`, com valor, urgência,
   dependências, referências (RF/RN/RNF/ADR/DT) e critérios de aceite.
2. A tarefa ia para `em-andamento.md` com o contexto necessário.
3. A IA implementava dentro dos limites da tarefa, sem mexer no que não pertencia a ela.
4. Eu rodava `npm run verify` (typecheck + lint + testes) e testava o comportamento no app.
5. Eu revisava o diff. O que não me convencia voltava, virava ajuste ou virava dívida registrada.
6. A tarefa era arquivada em `docs/tarefas/concluidas/` com o que foi feito, o que ficou de fora e o
   raciocínio por trás.

As tarefas trazem um campo de esforço duplo — `H/IA` — porque esforço humano e esforço de IA não são
a mesma grandeza. O esforço de IA se mede por carga de contexto, número de arquivos afetados, risco
de erro e necessidade de validação, não por tempo. Servia para eu decidir o que dividir em partes
menores antes de começar. A legenda completa está em
[`docs/tarefas/labels-tarefas.md`](./tarefas/labels-tarefas.md).

---

## 3. Como auditar isso

O rastro é o ponto principal: não é preciso confiar na minha palavra sobre o processo.

- **~197 tarefas concluídas**, cada uma em arquivo próprio e datado, em
  [`docs/tarefas/concluidas/`](./tarefas/concluidas/), com índice cronológico.
- **22 ADRs** em [`docs/arquitetura/ADR/`](./arquitetura/ADR/) registrando o porquê de cada decisão
  estrutural — inclusive as que foram revertidas.
- **4 revisões gerais** de código em `docs/arquitetura/revisoes-gerais/`, com os achados anexados de
  volta às tarefas de origem como segunda passada.
- **466 testes automatizados** em 43 arquivos, cobrindo cálculo, domínio, persistência e fluxos de UI.
- **Histórico de Git** ligando commits às tarefas.

Ou seja: dá para pegar qualquer comportamento do app hoje e chegar até a decisão que o originou.

---

## 4. Onde a IA não foi usada

- **Nenhum dado de domínio foi gerado por IA.** Valor FIPE, preço de combustível, IPVA,
  licenciamento, tabelas de revisão e preços de peças vêm de fontes públicas que eu consultei e
  registrei, com link e captura, em
  [`docs/dominio/informacoes-modelos-motos/`](./dominio/informacoes-modelos-motos/). Nenhum número no
  app é "estimado pela IA" — a origem de cada dado é declarada no próprio app.
- **Nada é consultado em tempo de execução.** Não há chamada a LLM no app publicado. O produto é
  100% client-side, sem backend e sem telemetria; a IA é ferramenta de desenvolvimento, não parte do
  runtime.

---

## 5. Ferramentas

Assistentes de IA baseados em LLM, operados dentro do editor, guiados pelos pacotes de instrução
versionados em [`.github/agents/`](../.github/agents/) — que existem em duas variantes (`geral-leve`
para tarefas pequenas, `geral-robusto` para tarefas que exigem contexto e checklists completos).

---

## 6. Postura

Usei IA porque ela me deixou entregar mais, e mais rápido, do que eu entregaria sozinho no tempo que
tinha. O que não terceirizei foi o entendimento: se eu não sei explicar por que uma linha está ali,
ela não fica. Este documento e o rastro de tarefas e ADRs são o teste dessa afirmação.

Se você está avaliando este projeto e quiser sondar qualquer decisão específica, o caminho é
`docs/arquitetura/ADR/` — e eu topo conversar sobre qualquer uma delas.

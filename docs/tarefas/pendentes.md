# Tarefas Pendentes

Backlog priorizado. Uma linha por tarefa `Normal`; bloco no topo para `Imediata` (o bloco existe para
caber o campo `Observações`, que explica a urgência). Formato e campos em
[processos/20-ciclo-tarefa.md §3](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md).

Ordem: **Valor + Urgência**, maior no topo. Empate resolve pelo **menor esforço** — libera capacidade.

> **Só tarefa aberta vive aqui.** Concluída ou cancelada sai do arquivo, e sai junto **tudo que só
> existia para explicá-la**: cabeçalho de seção, nota de rodapé, bloco de detalhamento. O histórico
> fica em [`concluidas/`](./concluidas/0-indice-concluidas.md).
>
> Tarefa concluída só pode aparecer aqui como **origem** de uma aberta, na coluna `REQ/ADR/DT`.
> Descrever o que ela entregou é registro no lugar errado.
>
> **Aqui não se planeja.** O detalhamento nasce quando alguém pega a tarefa, em `em-andamento.md`
> (§3.5). Quando a análise já existe, ela fica no documento dela — e `REQ/ADR/DT` aponta para lá.

---

## Imediata

_Nenhuma._

---

## Normal

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-9.2 | Revisão final e QA — testes manuais do fluxo completo | Standard | Crítico | Normal | G/G | - | - | `[ ]` | - |
| TASK-RNF-8.1 | Analytics (Umami) — `trackEvent` centralizado | Standard | Importante | Normal | M/M | - | - | `[ ]` | - |
| TASK-CHORE-025 | Avaliar react-router v8 e advisories de tooling | Strict | Importante | Normal | M/G | - | RA-001, TASK-CHORE-020 | `[ ]` | 28/07/26 19:00 |
| TASK-TEST-007 | Testes de aceite rastreáveis por requisito | Strict | Importante | Normal | G/G | - | - | `[ ]` | 28/07/26 18:30 |
| TASK-REF-48 | Carregar presets sob demanda (~345 kB no chunk inicial) | Strict | Importante | Normal | G/G | - | TASK-REF-47 | `[ ]` | 28/07/26 23:00 |
| TASK-RNF-8.3 | TWA — publicação na Google Play Store | Standard | Desejável | Normal | G/G | - | - | `[ ]` | - |

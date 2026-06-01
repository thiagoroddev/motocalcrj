

Campos

| Campo            | Valores aceitos                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TASK-ID**      | Prefixo + número. Prefixos: RF (req funcional), RN (regra negócio), RNF (req não-funcional), BG (bug), REF (refactor), DOC (documentação), CHORE (manutenção), TEST (testes) |
| **Título**       | Frase curta descritiva. Sem ponto final                                                                                                                                      |
| **Valor**        | Crítico / Importante / Desejável                                                                                                                                             |
| **Urgência**     | Imediata / Normal                                                                                                                                                            |
| **Esforço-H**    | P (≤ 2h) / M (2-8h) / G (1-3d) / XG (> 3d)                                                                                                                                   |
| **Dependências** | IDs de outras tarefas que precisam ser concluídas antes. `-` se nenhuma                                                                                                      |
| **Status**       | `[ ]` pendente / `[x]` concluída (raramente aparece aqui - tarefa concluída sai do arquivo)                                                                                  |
| **Data origem**  | DD/MM/AA quando a tarefa foi criada                                                                                                                                          |
|                  |                                                                                                                                                                              |

## Esforço para IA 

O esforço de uma tarefa para IA não deve ser medido por tempo humano, mas por carga de contexto, risco e validação necessária.

| Esforço | Definição          | Critérios típicos                                                        |
| ------- | ------------------ | ------------------------------------------------------------------------ |
| P-IA    | Pequena e local    | 1-2 arquivos, baixo contexto, baixo risco, sem mudança arquitetural      |
| M-IA    | Média e controlada | 2-5 arquivos, contexto moderado, testes simples, impacto local           |
| G-IA    | Grande e sensível  | 5-12 arquivos, alto contexto, risco relevante, exige testes e revisão    |
| XG-IA   | Grande demais      | 12+ arquivos, muitas decisões, alto risco ou chance de estourar contexto |

Tokens são apenas sinal auxiliar. Uma tarefa com muitos tokens pode ser simples, e uma tarefa com poucos tokens pode ser arriscada.

Use XG-IA quando a tarefa precisar ser quebrada antes de executar.

## Priorização

| Campo | Valores |

|---|---|

| **Valor** | Crítico / Importante / Desejável |
| **Urgência** | Imediata / Normal |

Modos de Cerimônia (Revisitados)

Antes de entrar no ciclo, lembre dos modos definidos no [núcleo](https://claude.ai/01-nucleo.md#4-modos-de-cerim%C3%B4nia):

|Modo|Cerimônia|Onde|
|---|---|---|
|**Light**|Mensagem curta. Sem mover entre arquivos|Direto no chat ou commit|
|**Standard**|Ciclo completo: pendentes → em-andamento → concluidas|Este módulo aplica|
|**Strict**|Standard + ADR + análise de impacto antes|Standard + extras|

### 18.1 Prefixos Padrão de Task

| Prefixo | Significado |

|---|---|
| TASK-RN | Regra de Negócio |
| TASK-RF | Requisito Funcional |
| TASK-RNF | Requisito Não-Funcional |
| TASK-BG | Bug |
| TASK-REF | Refatoração |
| TASK-DOC | Documentação |

## Template pendente 'Normal':

| TASK-ID-0.0 | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR | Status | Data origem |

| TASK-RF-5.1 | Registros - lista e sub-abas | Standard|  Importante | Normal | G/G | TASK-1 | RF-2, ADR-3, DT-14 |  PENDENTE | 10/05/26
## Template pendente 'Imediata':

TAKS-ID - Título
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Críticor
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro
--------------------

Template em-andamento:

# TASK-RF-5.1 - Registros - lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
- **Data início:** 10/05/26 10/05/26 12:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro
- **Planejamento:** O plano de execução que foi mostrado e autorizado pelo humano.

## Planejamento Aprovado
[Plano detalhado que o humano aprovou]

## Execução
- 14:15: Plano aprovado
- 14:30: Iniciada implementação do componente CardRegistro
- 15:45: CardRegistro pronto. Iniciando lista paginada
- 16:00: Bloqueio - paginação API retorna formato inesperado
## Bloqueio em YYYY-MM-DD HH:MM

  **O que tentei:** [descrição]
  **Por que não funcionou:** [causa]
  **O que preciso:** [decisão / informação]
# Decisões Tomadas
- [decisão]: [motivo]
# O que NÃO foi feito (e por quê)

- [item]: [motivo]


-----------------------------
Template Concluidas
# TASK-RF-5.1 - Registros: lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 10/05/26 09:39
-  **Data início:** 10/05/26 10/05/26 12:39
-  **Data conclusão:** 10/05/26 10/05/26 13:39
- **Dependências**: TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo agora precisa disso primeiro
- **Planejamento:** O plano de execução que foi mostrado e autorizado pelo humano.
## Planejamento Aprovado
[Mesmo que estava em em-andamento.md]

## Execução
[Log completo, transferido de em-andamento.md]

## Decisões Tomadas
- [decisão]: [motivo]

## O Que NÃO Foi Feito (e Por Quê)
- [item]: [motivo]

## Revisão
[Conforme módulo 21. Pode ser N/A com justificativa para Light]

## Tarefas Geradas pela Revisão
- BG-12: [descrição]

## Requisitos Gerados pela Revisão
- RNF-13: [descrição] (adicionado em docs/requisitos/nao-funcionais.md)

## ADRs Geradas
- -

## Testes
- `npm run test`: 82 verdes
- Novos testes: `useRegistros.test.ts` (5 testes)
- Modificados: `cardRegistro.test.ts` (1 teste atualizado por nova lógica)

## Aprendizados Para o Projeto
- [algo que vale a equipe saber]
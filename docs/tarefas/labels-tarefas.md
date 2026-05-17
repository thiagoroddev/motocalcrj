# Campos da Task

| Campo | Valores aceitos |
|---|---|
| **TASK-ID(TASK + prefixo + número)** | `TASK-` + prefixo + número. Prefixos aceitos:<br><br>`RF` = requisito funcional<br>`RN` = regra de negócio<br>`RNF` = requisito não-funcional<br>`BG` = bug<br>`REF` = refactor<br>`DOC` = documentação<br>`CHORE` = manutenção<br>`TEST` = testes<br><br>Exemplo: `TASK-RF-5.1` |
| **Título** | Frase curta e descritiva, sem ponto final.<br><br>Exemplo: `Criar sistema de autenticação` |
| **Modo** | Define o nível de cerimônia da task.<br><br>Valores aceitos:<br>`Light` / `Standard` / `Strict` |
| **Valor** | Importância da task para o produto/projeto.<br><br>Valores aceitos:<br>`Crítico` / `Importante` / `Desejável` |
| **Urgência** | Prioridade temporal da execução.<br><br>Valores aceitos:<br>`Imediata` / `Normal` |
| **Esforço-H/IA** | Duas medidas separadas por `/`, representando esforço humano e esforço para IA.<br><br>Formato:<br>`H/IA`<br><br>Valores aceitos:<br>`P` / `M` / `G` / `XG`<br><br>Exemplo:<br>`M/G` = médio para humano, grande para IA |
| **Dependências** | IDs de outras tarefas que precisam ser concluídas antes desta.<br><br>Use `-` se não houver dependências.<br><br>Exemplo:<br>`TASK-RF-1.1, TASK-RN-2.1` |
| **REQ/ADR/DT** | Referências relacionadas a requisitos, decisões arquiteturais e dívidas técnicas.<br><br>Tipos aceitos:<br>`RF` = requisito funcional<br>`RN` = regra de negócio<br>`RNF` = requisito não-funcional<br>`ADR` = Architecture Decision Record<br>`DT` = dívida técnica<br><br>Use `-` se não houver referência.<br><br>Exemplo:<br>`RF-002, ADR-003, DT-014` |
| **Status** | Estado atual da task.<br><br>Valores aceitos:<br>`[ ]` pendente<br>`[x]` concluída<br><br>Observação: tarefas concluídas normalmente saem do arquivo de tasks pendentes. |
| **Data origem** | Data e hora em que a task foi criada.<br><br>Formato:<br>`DD/MM/AA HH:MM`<br><br>Exemplo:<br>`14/05/26 08:45` |
| **Observações** | Campo usado apenas quando a urgência for `Imediata`.<br><br>Serve para explicar o contexto ou motivo da urgência.<br><br>Use `-` se não houver observação. |

## Esforço para IA

O esforço de uma tarefa para IA **não deve ser medido por tempo humano**, mas por:

- carga de contexto;
- quantidade de arquivos afetados;
- risco de erro;
- necessidade de validação;
- chance de estourar o contexto da conversa;
- impacto arquitetural.

Por isso, o campo de esforço da task é duplo:
H/IA

Onde:
H = esforço estimado para humano;
IA = esforço estimado para inteligência artificial.

Exemplo:
M/G

Significa:
M = esforço médio para humano;
G = esforço grande para IA.


| Esforço   | Nome         | Definição                                    | Critérios típicos                                                                                        |
| --------- | ------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **P-IA**  | Pequena      | Pequena e local                              | Afeta 1-2 arquivos, exige baixo contexto, possui baixo risco e não altera arquitetura                    |
| **M-IA**  | Média        | Média e controlada                           | Afeta 2-5 arquivos, exige contexto moderado, possui testes simples e impacto local                       |
| **G-IA**  | Grande       | Grande e sensível                            | Afeta 5-12 arquivos, exige alto contexto, possui risco relevante e precisa de testes e revisão cuidadosa |
| **XG-IA** | Extra grande | Grande demais para uma única execução segura | Afeta 12+ arquivos, envolve muitas decisões, possui alto risco ou grande chance de estourar o contexto   |



## Legenda de Prefixos

| Prefixo | Significado |
|---|---|
| `TASK-RF` | Requisito funcional |
| `TASK-RN` | Regra de negócio |
| `TASK-RNF` | Requisito não-funcional |
| `TASK-BG` | Bug |
| `TASK-REF` | Refatoração |
| `TASK-DOC` | Documentação |
| `TASK-CHORE` | Manutenção |
| `TASK-TEST` | Testes |

Exemplos: 
Independentes:  TASK-RF-005
Derivadas: TASK-RF-005.1` 

## O que não é prefixo de tarefa

| Tipo | Como registrar |
|---|---|
| Dívida técnica | `DT-001` no campo `REQ/ADR/DT` |
| ADR | `ADR-001` no campo `REQ/ADR/DT` |
| Revisão | Registrar em `## Revisão`; tarefas geradas usam prefixos `TASK-*` aceitos |

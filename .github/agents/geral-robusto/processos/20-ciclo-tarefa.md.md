---

description: "Ciclo de vida das tarefas: pendente, em andamento, concluída. Modos de cerimônia, regras de transição, casos especiais." modulo: "20" categoria: "processos" versao: "1.0" relacionado:

- "01-nucleo.md"
- "21-revisao-codigo.md"
- "../templates/30-task-em-andamento.md"
- "../templates/31-task-concluida.md"

---

# 🔄 Ciclo de Tarefa

> Toda tarefa passa por **três estágios** com localização e estrutura próprias. **Nada vive no lugar errado.** Quem ler o repositório em 6 meses entende o que foi feito e por quê.

---

## 1. Visão Geral

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────────────────────┐
│  Pendente   │ ──► │   Em Andamento   │ ──► │             Concluída                │
├─────────────┤     ├──────────────────┤     ├─────────────────────────────────────┤
│pendentes.md │     │em-andamento.md   │     │concluidas/TASK-XX-AAAA-MM-DD-HHhMM.md│
│             │     │                  │     │                                      │
│1 linha por  │     │Cabeçalho +       │     │Template completo com:               │
│tarefa em    │     │log contínuo de   │     │- Execução                            │
│tabela       │     │ações e bloqueios │     │- Decisões                            │
│             │     │                  │     │- Revisão                             │
└─────────────┘     └──────────────────┘     │- Testes                              │
                                              │- Aprendizados                        │
                                              └─────────────────────────────────────┘
```

Cada estágio tem **uma localização única**. Tarefa nunca está em dois lugares.

---

## 2. Modos de Cerimônia (Revisitados)

Antes de entrar no ciclo, lembre dos modos definidos no [núcleo](https://claude.ai/01-nucleo.md#4-modos-de-cerim%C3%B4nia):

|Modo|Cerimônia|Onde|
|---|---|---|
|**Light**|Mensagem curta. Sem mover entre arquivos|Direto no chat ou commit|
|**Standard**|Ciclo completo: pendentes → em-andamento → concluidas|Este módulo aplica|
|**Strict**|Standard + ADR + análise de impacto antes|Standard + extras|

**Este módulo descreve o ciclo Standard.** Para Light, não há ciclo — apenas o registro mínimo no commit. Para Strict, este ciclo se aplica com adições documentadas em [`25-analise-impacto.md`](https://claude.ai/chat/25-analise-impacto.md) e [`../templates/32-adr.md`](https://claude.ai/templates/32-adr.md).

### 2.1 Exemplos Concretos

|Tarefa|Modo|Por quê|
|---|---|---|
|Corrigir typo no README|Light|Trivial, sem impacto|
|Adicionar `border-radius` num botão|Light|Cosmético, isolado|
|Renomear pasta de `utils/` para `helpers/`|Standard|Afeta imports em todo projeto|
|Adicionar campo `cpf` ao perfil|Standard|Nova feature, isolada|
|Refatorar 5 componentes para usar novo padrão|Standard|Refatoração com escopo claro|
|Trocar Vite por Next.js|Strict|Decisão arquitetural enorme|
|Adicionar autenticação por OAuth|Strict|Múltiplos sistemas, segurança|
|Mudar idioma do projeto de PT para EN|Strict|Atravessa todo o código|

---

## 3. Estágio 1 — Pendente

**Arquivo:** `docs/tarefas/pendentes.md`

A tarefa entra como **uma única linha** no backlog priorizado. Sem detalhes, sem plano. O detalhe acontece quando alguém pega para executar.

### 3.1 Formato da Linha (Tarefas Normais)

Tarefas com urgência **Normal** entram como linha em tabela no backlog priorizado:

```markdown
| TASK-ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR | Status | Data origem |
|---|---|:---:|:---:|:---:|:---:|---|---|:---:|---|
| TASK-RF-5.1 | Registros — lista e sub-abas | Standard | Importante | Normal | G/G | TASK-RF-1 | RF-2, ADR-3, DT-14 | `[ ]` | 10/05/26 09:39 |
```


## Legenda de Prefixos para tarefas

| Prefixo    | Significado             |
| ---------- | ----------------------- |
| TASK-RN    | Regra de Negócio        |
| TASK-RF    | Requisito Funcional     |
| TASK-RNF   | Requisito Não-Funcional |
| TASK-BG    | Bug                     |
| TASK-REF   | Refatoração             |
| TASK-DOC   | Documentação            |
| TASK-CHORE | Manutenção              |
| TASK-TEST  | Testes                  |
|            |                         |
Exemplos de nomes para IDs:

Independentes:  TASK-RF-005
Derivadas: TASK-RF-005.1

### 3.2 Formato Imediata (Bloco)

Tarefas com urgência **Imediata** não cabem em uma linha de tabela porque carregam contexto adicional (motivo da urgência, observações). Entram como **bloco em lista**, no topo do arquivo:

```markdown
## TASK-PREFIXO-XXX — Título
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo, agora precisa disso primeiro
```

**Por que dois formatos:** tarefa Imediata exige decisão rápida. Quem lê o backlog precisa entender **por que** é urgente sem clicar/abrir nada. Bloco em lista cabe isso; linha de tabela não.

### 3.3 Campos

| Campo                         | Valores aceitos                                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TASK-PREFIXO-XXX**          | `TASK-` + prefixo + número. Prefixos: `RF` (req funcional), `RN` (regra negócio), `RNF` (req não-funcional), `BG` (bug), `REF` (refactor), `DOC` (documentação), `CHORE` (manutenção), `TEST` (testes). Exemplo: `TASK-RF-5.1`             |
| **Título**                    | Frase curta descritiva. Sem ponto final                                                                                                                                                                                                    |
| **Modo**                      | Light / Standard / Strict (ver [seção 2](https://claude.ai/chat/7ad9cd8a-fc76-4046-a5d6-651d4752358b#2-modos-de-cerim%C3%B4nia-revisitados))                                                                                               |
| **Valor**                     | Crítico / Importante / Desejável                                                                                                                                                                                                           |
| **Urgência**                  | Imediata / Normal                                                                                                                                                                                                                          |
| **Esforço-H/IA**              | Duas medidas separadas por `/`. Humano (H) e IA. Exemplo: `M/G` = médio para humano, grande para IA. Valores: P / M / G / XG. Detalhes na [seção 3.4](https://claude.ai/chat/7ad9cd8a-fc76-4046-a5d6-651d4752358b#34-esfor%C3%A7o-para-ia) |
| **Dependências**              | IDs de outras tarefas que precisam ser concluídas antes. `—` se nenhuma                                                                                                                                                                    |
| **REQ/ADR/DT**                | Referências a requisitos (RF/RN/RNF), ADRs e dívidas técnicas (DT) relacionadas. Exemplo: `RF-2, ADR-3, DT-14`. `—` se nenhuma                                                                                                             |
| **Status**                    | `[ ]` pendente / `[x]` concluída (raramente aparece aqui — tarefa concluída sai do arquivo)                                                                                                                                                |
| **Data origem**               | `DD/MM/AA HH:MM` quando a tarefa foi criada                                                                                                                                                                                                |
| **Observações** (só Imediata) | Texto livre explicando contexto/motivo da urgência                                                                                                                                                                                         |

### 3.4 Esforço para IA

O esforço de uma tarefa para IA **não deve ser medido por tempo humano**, mas por carga de contexto, risco e validação necessária. Por isso o campo é duplo (`H/IA`).

| Esforço   | Definição          | Critérios típicos                                                        |
| --------- | ------------------ | ------------------------------------------------------------------------ |
| **P-IA**  | Pequena e local    | 1-2 arquivos, baixo contexto, baixo risco, sem mudança arquitetural      |
| **M-IA**  | Média e controlada | 2-5 arquivos, contexto moderado, testes simples, impacto local           |
| **G-IA**  | Grande e sensível  | 5-12 arquivos, alto contexto, risco relevante, exige testes e revisão    |
| **XG-IA** | Grande demais      | 12+ arquivos, muitas decisões, alto risco ou chance de estourar contexto |

**Tokens são apenas sinal auxiliar.** Uma tarefa com muitos tokens pode ser simples; uma tarefa com poucos tokens pode ser arriscada.

**Use `XG-IA` quando a tarefa precisar ser quebrada antes de executar.** É sinal de divisão obrigatória — não tente avançar com tarefa nesse tamanho.

### 3.5 Princípio: Pendentes é Catálogo, Não Plano

Não escreva detalhes de implementação aqui. A linha existe para:

- Saber que a tarefa existe
- Priorizar contra outras
- Estimar esforço aproximado

O **plano** vem depois, no estágio "Em Andamento", quando alguém vai executar.

### 3.6 Quem Adiciona

|Origem|Quem adiciona|
|---|---|
|Requisito documentado|IA, ao processar `docs/requisitos/`|
|Bug descoberto em revisão|IA, registrando em "Tarefas Geradas pela Revisão"|
|Dívida técnica que disparou gatilho|IA, ao detectar o gatilho|
|Solicitação do humano|Humano ou IA registrando em nome do humano|
|Refatoração identificada|IA ou humano|

A IA **nunca** adiciona tarefa sem confirmação se ela tem origem em requisito novo (que não existia). Para requisitos novos, ver fluxo em [`21-revisao-codigo.md`](https://claude.ai/chat/21-revisao-codigo.md#3-tarefas-geradas-por-revis%C3%A3o).

### 3.7 Ordenação no Arquivo

Tarefas são listadas por **prioridade combinada** (Valor + Urgência), não por data. Maior prioridade no topo. Quando empate, a com menor esforço vem antes (libera capacidade).


---

## 4. Estágio 2 — Em Andamento

**Arquivo:** `docs/tarefas/em-andamento.md`

Ao iniciar uma tarefa Standard, ela **sai da tabela de pendentes** (linha removida) e vira um bloco no arquivo `em-andamento.md` com cabeçalho + log contínuo.

### 4.1 Formato

Template completo em [`../templates/30-task-em-andamento.md`](https://claude.ai/templates/30-task-em-andamento.md).

Estrutura mínima:

```markdown
# TASK-RF-5.1 — Registros: lista e sub-abas

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Data início:** 10/05/26 12:39
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo, agora precisa disso primeiro

## Planejamento Aprovado
[Plano detalhado que o humano aprovou]

## Execução
- 14:15: Plano aprovado
- 14:30: Iniciada implementação do componente CardRegistro
- 15:45: CardRegistro pronto. Iniciando lista paginada
- 16:00: Bloqueio — paginação API retorna formato inesperado
  
## Testes
- `1º npm run test`: 82 verdes 
```

**Observação sobre datas:** todas as datas usam formato `DD/MM/AA HH:MM`. Inclua hora desde o início — facilita reconstruir a sequência depois.

### 4.2 Regras

| Regra                                     | Detalhe                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Máximo 3 em andamento ao mesmo tempo**  | Mais que isso, foco é diluído. Termine uma antes de iniciar outra                                |
| **Log com timestamp**                     | Cada entrada anota a hora. Permite reconstruir a sequência                                       |
| **Bloqueios documentados**                | Quando empaca, anota o que tentou e o que faltou                                                 |
| **Decisões anotadas**                     | Escolha não óbvia gera nota explicando o porquê                                                  |
| **Pode haver várias tarefas no arquivo**  | Cada uma é um bloco com seu próprio cabeçalho. Adicione no final                                 |
| **Rodar testes antes e depois da tarefa** | Para saber se já tinha teste falhando antes da tarefa e garantir que não quebre nada depois dela |
|                                           |                                                                                                  |

### 4.3 Quando Registrar no Log

Não precisa anotar cada commit. Anote:

- Início da execução (após plano aprovado)
- Conclusão de etapa significativa
- **Toda decisão** que não é óbvia
- **Todo bloqueio** (e como foi resolvido, depois)
- Mudança de plano (e por quê)
- Pausa longa (volta a registrar quando retoma)

### 4.4 Registro de Bloqueio

Bloqueio é situação onde a tarefa **não pode prosseguir** sem informação ou decisão externa.

```markdown
## Bloqueio em 2026-05-13 16:00
**O que tentei:** Implementar paginação assumindo formato `{ data, total }`.
**Por que não funcionou:** API retorna `{ items, count, nextCursor }`. Cursor-based, não offset.
**O que preciso:** Decidir se reimplementamos para cursor ou se backend muda para offset.
```

### 4.5 Regra das 2 Tentativas

Conforme o núcleo: **após 2 tentativas sem sucesso no mesmo problema, pare e peça orientação**. Não é falha — é maturidade.

```markdown
## Bloqueio em 2026-05-13 16:30 (após 2 tentativas)
**Tentativa 1 (16:00):** [...]
**Tentativa 2 (16:20):** [...]
**Conclusão:** Não consigo resolver sozinho. Pedi orientação ao humano.
```

### 4.6 Quando NÃO Está Em Andamento

Tarefa pausada por mais de 24h sem progresso **volta para pendentes**. Não fica ocupando espaço sem progresso real. Quando retomar, sai de pendentes de novo.

---

## 5. Estágio 3 — Concluída

**Local do Arquivo:** `docs/tarefas/concluidas/[YYYY-MM-DD]--[HHhMM]--[TASK-PREFIXO]-[NUMERO].md`

Quando a tarefa termina, vira um arquivo próprio com todo processo registrado. Devendo também registrar a conclusão da tarefa no índice de tasks concluídas em docs/tarefas/concluidas/indice-concluidas.md com apenas uma linha para cada, exemplo:

[TASK-PREFIXO-NUMERO] | [TITULO DESCRITIVO] | [(LINK CLICÁVEL PARA O ARQUIVO ÚNICO)] |

TASK-DOM-1 | Atualização da modelagem de domínio | [[](./2026-05-10-TASK-DOM-1.md)]
TASK-DOM-2 | Ajustes referências v6 e refistro de DT-14 | [[](./2026-05-11-TASK-DOM-2.md)]
TASK-REF-03 | Instalar shadcn/ui e criar wrappers em components/ui | [[](./2026-05-16--20h21--TASK-REF-03.md)]

### 5.1 Nome do Arquivo

Para garantir ordem cronológica dos arquivos na pasta, coloque a data no começo do nome do arquivo.

Exemplo:
````
docs/tarefas/concluidas/2026-05-13-17h30--TASK-RF-001--Criar-tela-login.md
````

Formato: `[YYYY-MM-DD]--[HHhMM]--[TASK-PREFIXO]-[NUMERO].md`

Exemplos:

- `2026-05-13-17h30--TASK-RF-5.1.md`
- `2026-05-14-09h15--TASK-BG-2.md`
- `2026-05-15-11h45--TASK-REF-03.md`

A hora usa `HHhMM` (ex: `17h30`). Sem `:` para evitar problema em alguns sistemas de arquivos.

### 5.2 Critérios Para Concluir

Uma tarefa **só pode** ser marcada como concluída quando:

1. **Testes passam.** Se quebrou algum, conserte ou registre por que está OK quebrado
2. **Código revisado.** Pelo menos auto-revisão usando [`21-revisao-codigo.md`](https://claude.ai/chat/21-revisao-codigo.md) (ou `N/A` para Light)
3. **Critérios de aceite cumpridos.** Aqueles definidos no plano
4. **Documentação atualizada.** Se afeta `docs/`, atualize antes de concluir

Se algum desses falha, a tarefa **continua em andamento**.

### 5.3 O Que Vai no Arquivo Concluída

Template completo em [`../templates/31-task-concluida.md`](https://claude.ai/templates/31-task-concluida.md).

Estrutura essencial:

```markdown
# TASK-RF-5.1 — Registros: lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Data início:** 10/05/26 12:39
- **Data conclusão:** 10/05/26 13:39
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo, agora precisa disso primeiro

## Planejamento Aprovado
[Mesmo que estava em em-andamento.md]

## Execução
[Log completo, transferido de em-andamento.md]

## Decisões Tomadas
- [decisão]: [motivo]

## O Que NÃO Foi Feito (e Por Quê)
- [item]: [motivo]

## Testes
- `1º npm run test`: 82 verdes 
- Novos testes: `useRegistros.test.ts` (5 testes)
- Modificados: `cardRegistro.test.ts` (1 teste atualizado por nova lógica)  
- último npm run test`: 88 verdes 

## Revisão
[Conforme módulo 21. Pode ser N/A com justificativa para Light]

## Tarefas Geradas pela Revisão
- TASK-BG-12: [descrição]

## Requisitos Gerados pela Revisão
- RNF-13: [descrição] (adicionado em docs/requisitos/nao-funcionais.md)

## ADRs Geradas pela Revisão
- —
## Aprendizados Para o Projeto
- [algo que vale a equipe saber]
```

### 5.4 Transição: Em Andamento → Concluída

Passos exatos quando a tarefa termina:

1. **Rodar testes.** Se quebrou, volta para em-andamento. Conserta. Repete.
2. **Auto-revisão** pelo checklist do módulo 21 (ou `N/A` para Light).
3. **Criar arquivo** em `docs/tarefas/concluidas/[DATA]-[HORA]-[ID].md`.
4. **Registrar** a conclusão da tarefa no índice de tarefas concluídas em dosc/tarefas/concluidas/0-indice-concluidas.md
5. **Copiar tudo** do bloco em `em-andamento.md` para o novo arquivo.
6. **Adicionar campos finais:** Conclusão, Decisões, Revisão, Testes, Aprendizados.
7. **Remover o bloco** de `em-andamento.md`.
8. **Atualizar `docs/requisitos/`** se a tarefa muda status de algum requisito.
9. **Adicionar tarefas geradas** em `pendentes.md`.
10. **Registrar dívidas geradas** em `docs/dominios/divida-tecnica.md` (se houver).

A ordem importa. Se você remove de em-andamento antes de criar o concluído, e a IA cai, o histórico se perde.

### 5.5 Por Que Arquivo Por Tarefa

Alternativa seria um único `concluidas.md` enorme. Por que separar?

- **Granularidade do Git:** mudanças em uma tarefa não conflitam com outras
- **Busca:** procurar "TASK-RF-5.1" cai direto no arquivo
- **Imutabilidade:** depois de concluída, o arquivo não muda. Tarefa nova = arquivo novo
- **Linkagem:** outras tarefas podem referenciar `TASK-RF-5.1-2026-05-13-17h30.md` diretamente

---

## 6. Quem Faz o Quê

|Ação|IA|Humano|
|---|---|---|
|Criar entrada em pendentes (origem em requisito)|Sim|Aprova|
|Criar entrada em pendentes (origem em solicitação)|Sim, em nome do humano|Solicita|
|Mover de pendentes para em-andamento|Sim, ao iniciar|Confirma com "pode iniciar"|
|Atualizar log em em-andamento|Sim, em tempo real|Lê quando quiser|
|Aprovar plano detalhado|—|Sim, obrigatório|
|Tomar decisões durante execução|Sim para óbvias|Sim para não-óbvias|
|Mover para concluida|Sim, após critérios atendidos|Valida transição|
|Atualizar requisitos|Sim|Aprova mudanças significativas|

**Regra de ouro:** humano aprova mudanças de **estágio** (especialmente para concluída). IA conduz a execução dentro de cada estágio.

---

## 7. Tarefas Que Geram Outras

Tarefas raramente terminam isoladas. Frequentemente geram:

|Geram|O que fazer|
|---|---|
|Outras tarefas (BG, REF)|Adicionar em `pendentes.md` E listar na concluída|
|Dívida técnica (decidiu adiar algo)|Registrar em `docs/dominios/divida-tecnica.md` com gatilho|
|Novo requisito (descobriu necessidade)|Adicionar em `docs/requisitos/` + tarefa que implementa|
|ADR (decisão arquitetural)|Criar em `docs/arquitetura/ADR/` + listar na concluída|

### 7.1 Exemplo: Tarefa Que Gera Outra

```markdown
## Tarefas Geradas pela Revisão
- TASK-BG-12: Corrigir cálculo de total quando há desconto cumulativo (encontrado durante implementação de TASK-RF-5.1)
- TASK-REF-03: Extrair lógica de paginação para hook reutilizável (após 3ª ocorrência — Regra de Três)
```

E em `pendentes.md`, novas linhas:

```markdown
| TASK-BG-12 | Corrigir cálculo de total com desconto cumulativo | Standard | Crítico | Imediata | P/P | — | — | `[ ]` | 13/05/26 09:00 |
| TASK-REF-03 | Extrair lógica de paginação para hook | Standard | Importante | Normal | M/M | — | — | `[ ]` | 13/05/26 09:00 |
```

---

## 8. Tarefas Bloqueadas

Quando bloqueio dura mais que algumas horas, a tarefa precisa de tratamento explícito.

### 8.1 Bloqueio Curto (< 24h)

Mantém em em-andamento, com registro:

```markdown
## Bloqueio em 2026-05-13 16:00
**O que tentei:** [...]
**O que preciso:** Resposta do humano sobre formato da API.
**Pausa até:** resposta do humano.
```

A tarefa fica viva, esperando.

### 8.2 Bloqueio Longo (> 24h)

Tarefa **volta para pendentes**, marcada como bloqueada:

```markdown
| TASK-RF-5.1 | Registros — lista e sub-abas (BLOQUEADO: aguardando def API) | Standard | Importante | Normal | G/G | — | — | `[!]` | 10/05/26 09:39 |
```

Status `[!]` indica bloqueio. Quando destravar, volta para `[ ]` e segue normalmente.

### 8.3 Bloqueio Externo (Não Resolúvel)

Se o bloqueio depende de algo que não vai resolver (decisão pendente do stakeholder, lib externa quebrada), a tarefa **vira dívida técnica** com gatilho.

```markdown
# Em docs/dominios/divida-tecnica.md

| ID | Descrição | Impacto | Gatilho | ADR |
|---|---|---|---|---|
| DT-04 | TASK-RF-5.1 não implementada porque API não suporta paginação cursor | Médio | Quando API for atualizada para v3 | — |
```

Tarefa sai de pendentes. Volta quando o gatilho disparar.

---

## 9. Limites Práticos

### 9.1 Tamanho de Tarefa

|Esforço estimado|Recomendação|
|---|---|
|≤ 2h (P)|OK, executar|
|2-8h (M)|OK|
|1-3d (G)|OK, considere dividir se possível|
|> 3d (XG)|**Divida.** XG quase sempre esconde múltiplas tarefas misturadas|

### 9.2 Tarefas Simultâneas

|Em andamento|Status|
|---|---|
|0-1|Ideal|
|2-3|Aceitável (ex: aguardando feedback em uma)|
|4+|Foco diluído. Termine antes de iniciar nova|

### 9.3 Tempo Em Andamento Sem Progresso

|Duração|Ação|
|---|---|
|< 1 dia|Normal|
|1-3 dias|Verificar se está bloqueada|
|> 3 dias sem log|Voltar para pendentes ou marcar como bloqueada|

---

## 10. Casos Especiais

### 10.1 Hotfix

Bug crítico em produção. Não passa pelo fluxo normal:

1. **Resolve imediatamente.** Light se for trivial, Standard se exigir mudança significativa.
2. **Cria arquivo concluído depois**, com `**Modo: Hotfix**` no cabeçalho.
3. **Pendentes recebe entrada retroativa** para rastreabilidade.
4. **Pós-mortem opcional** se o bug foi grave: arquivo em `docs/tarefas/concluidas/` com `**Tipo: Pós-mortem**`.

### 10.2 Mudança de Escopo Durante Execução

Você está executando TASK-RF-5.1 e descobre que precisa também tocar em TASK-RF-5.2.

|Situação|Ação|
|---|---|
|Escopo cresceu, mas é coeso (mesmo módulo)|OK, atualizar plano e seguir|
|Escopo cresceu, e o adicional é tarefa separada|Anotar, terminar TASK-RF-5.1, criar TASK-RF-5.2 em pendentes|
|Descobriu bug não relacionado|**Não corrija.** Anote em "Tarefas Geradas" e criar TASK-BG em pendentes|

### 10.3 Tarefa Que Vira Outra

Você começa a implementar TASK-RF-5.1 e percebe que o requisito mudou de natureza (não é mais "lista", é "tabela com filtros").

1. **Pare a execução.** Volte ao humano.
2. **Reformule** o entendimento.
3. **Se humano confirma a mudança:** atualize o requisito em `docs/requisitos/` E o plano na tarefa atual. Não crie tarefa nova — é a mesma com escopo redefinido.

### 10.4 Tarefa Cancelada

Tarefa começou mas decidiu-se não fazer:

1. **Mover de em-andamento para concluida** com `**Status: CANCELADA**`.
2. **Documentar por quê** na seção "O Que NÃO Foi Feito".
3. **Remover de pendentes** se ainda estiver lá.

Não é fracasso — é decisão. Registrar evita revisitar depois.

### 10.5 Dúvida do Humano Sobre Tarefa Antiga

"O que foi feito na TASK-RF-5.1?" → busca em `docs/tarefas/concluidas/TASK-RF-5.1-*.md`. A IA lê e responde a partir do arquivo. **Não inventa.**

Se o arquivo não existe ou está incompleto, é um sinal de que o ciclo foi quebrado em algum momento. Anote como dívida.

---

## 11. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Onde mora tarefa nova?|`docs/tarefas/pendentes.md` (1 linha)|
|Como inicia?|Move para `em-andamento.md`, plano detalhado, aprovação|
|Como termina?|Cria arquivo em `concluidas/`, copia tudo, atualiza requisitos|
|Cerimônia para typo?|Light. Sem ciclo|
|Cerimônia para feature?|Standard. Ciclo completo|
|Cerimônia para decisão arquitetural?|Strict. Standard + ADR|
|Quem aprova mudanças de estágio?|Humano (especialmente entrada em concluída)|
|Máximo em andamento?|3|
|Bloqueio longo?|Volta para pendentes com `[!]`|
|Bug não relacionado durante execução?|Não corrija. Anote e crie tarefa|
|Tarefa cancelada?|Documenta motivo, vai para concluidas com Status: CANCELADA|

---

## 🔗 Módulos Relacionados

- [`01-nucleo.md`](https://claude.ai/01-nucleo.md) — Processo `ENTENDER → PLANEJAR → APROVAR → EXECUTAR → REGISTRAR` e modos de cerimônia
- [`21-revisao-codigo.md`](https://claude.ai/chat/21-revisao-codigo.md) — Revisão obrigatória ao concluir
- [`25-analise-impacto.md`](https://claude.ai/chat/25-analise-impacto.md) — Análise prévia em tarefas Strict
- [`../templates/30-task-em-andamento.md`](https://claude.ai/templates/30-task-em-andamento.md) — Template para em-andamento
- [`../templates/31-task-concluida.md`](https://claude.ai/templates/31-task-concluida.md) — Template para concluída
- [`../templates/32-adr.md`](https://claude.ai/templates/32-adr.md) — Quando tarefa gera decisão arquitetural
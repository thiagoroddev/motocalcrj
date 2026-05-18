---

description: "Revisão de código: filosofia, quem revisa, dimensões, checklist, níveis de achados, formato padronizado, tarefas geradas." modulo: "21" categoria: "processos" versao: "1.0" relacionado:

- "20-ciclo-tarefa.md"
- "22-refatoracao.md"
- "../checklists/40-revisao-rapida.md"

---

# 🔍 Revisão de Código

> Revisão não é burocracia nem caça às bruxas. É **conversa estruturada** sobre o que ficou bom, o que falta, e o que pode ser melhor — com critério claro do que é bloqueante e do que é sugestão.

---

## 1. Filosofia da Revisão

### 1.1 Para Que Serve

|Objetivo|Como revisão serve|
|---|---|
|**Capturar problemas antes do merge**|Olhos frescos veem o que o autor não viu|
|**Disseminar conhecimento**|Quem revisa aprende como a feature funciona|
|**Manter consistência**|Aplicar convenções uniformemente|
|**Documentar decisões**|Discussões geram histórico para o futuro|

### 1.2 Para Que NÃO Serve

- **Não é prova de QI.** Encontrar problema não é vitória; **não encontrar** não é falha.
- **Não é teste.** Testes pegam regressão; revisão pega design e legibilidade.
- **Não é ego.** Não importa quem escreveu — importa que está certo.
- **Não é checklist mecânico.** Itens são guia, julgamento humano (ou da IA) ainda importa.

### 1.3 No Contexto Deste Pacote

Em projeto solo com IA executora, revisão tem dinâmica especial:

```
IA escreve código → IA auto-revisa por checklist objetivo → Humano valida ou pede ajustes
```

A IA não pode "se aprovar emocionalmente" — ela aplica **critérios documentados** contra o código que escreveu. O humano valida olhando o output da revisão, não revisando linha por linha (a menos que queira).

---

## 2. Quem Revisa o Quê

|Camada|Quem revisa|Tipo|
|---|---|---|
|Mudança Light (typo, formatação)|IA (auto, mínima)|`N/A — mudança trivial`|
|Mudança Standard (feature, bug)|IA (auto, completa) + Humano (valida)|Revisão formal|
|Mudança Strict (decisão arquitetural)|IA + Humano + (idealmente) outro humano|Revisão formal + ADR|

### 2.1 Auto-Revisão da IA

A IA aplica o checklist da seção 5 contra o código que escreveu. **Honestamente.** Marca o que cumpre, o que não cumpre, o que tem dúvida.

**Não é teatro:** se a IA marca tudo verde sem justificativa, está fazendo errado. A IA deve identificar fraquezas no próprio código com a mesma rigor que identificaria no código alheio.

### 2.2 Validação Humana

O humano lê o **resultado da revisão** (não necessariamente o código). Decide:

- **Aceitar:** revisão passa, tarefa segue para concluída
- **Pedir ajuste:** algum achado precisa ser endereçado antes
- **Revisar pessoalmente:** quer olhar o código por algum motivo

Para projetos críticos (financeiro, saúde, segurança), validação humana sempre olha o código.

---

## 3. Quando Revisão é Obrigatória

A seção `## Revisão` **sempre existe** no arquivo da tarefa concluída. Mas o conteúdo varia.

### 3.1 Tabela de Obrigatoriedade

|Situação|Revisão formal?|O que vai na seção|
|---|---|---|
|Tarefa toca cálculo, estado, persistência|✅ Sim|Revisão completa pelo checklist|
|Tarefa toca código de segurança ou autenticação|✅ Sim|Revisão + atenção extra em segurança|
|Tarefa gerada por revisão anterior|✅ Sim|A revisão que gerou é o gatilho|
|Tarefa Standard típica|✅ Sim|Revisão completa|
|Mudança Light (typo, formatação isolada)|❌ Não|`N/A — mudança trivial (especificar)`|
|Atualização de documentação isolada|❌ Não|`N/A — apenas documentação`|
|Renomear arquivo sem mudar conteúdo|❌ Não|`N/A — refactor mecânico`|

### 3.2 A Regra do "N/A com Motivo"

Se a tarefa não tem revisão formal, a seção fica:

```markdown
## Revisão
N/A — Mudança trivial (correção de typo na linha 42 do README, sem impacto funcional).
```

**Nunca** simplesmente "N/A" sem justificativa. O motivo precisa estar explícito.

**Por quê:** quem lê a tarefa no futuro saberá se houve **decisão consciente** de não revisar, ou **esquecimento**. Os dois são situações diferentes que merecem tratamento diferente.

### 3.3 Quando "N/A" é Inaceitável

Mesmo em mudança que parece trivial, se ela:

- Toca código de cálculo, estado ou persistência → revisão obrigatória
- Toca lógica de autenticação ou autorização → revisão obrigatória
- Modifica um arquivo crítico documentado em ADR → revisão obrigatória
- Adiciona dependência externa → revisão obrigatória (mesmo que pequena)

Nesses casos, "trivial" é miragem. Reviewer vai olhar de qualquer jeito.

---

## 4. Dimensões da Revisão

Revisão não é uma lista única — é **múltiplas perspectivas** sobre o mesmo código. Cada uma pode achar problemas que as outras não.

|Dimensão|O que olhar|
|---|---|
|**Convenções**|Idioma consistente, nomenclatura, formatação ([módulo 10](https://claude.ai/padroes/10-codigo-e-convencoes.md))|
|**Arquitetura**|Arquivo no lugar certo, camadas respeitadas ([módulo 11](https://claude.ai/padroes/11-arquitetura-e-pastas.md))|
|**Regras de negócio**|Invariantes documentadas são respeitadas, cálculos corretos|
|**React/Estado**|Sem `useEffect` para derivação, keys estáveis, padrão de hooks ([módulo 12](https://claude.ai/padroes/12-react-e-estado.md))|
|**UI/Acessibilidade**|Componentes acessíveis, sem violações WCAG críticas ([módulo 13](https://claude.ai/padroes/13-ui-e-design-system.md), [16](https://claude.ai/padroes/16-performance-acessibilidade.md))|
|**Segurança**|Sem exposição de dados, storage isolado, validação correta ([módulo 18](https://claude.ai/padroes/18-seguranca-privacidade.md))|
|**Testes**|Cobertura mínima, padrão AAA, testa comportamento ([módulo 15](https://claude.ai/padroes/15-testes.md))|
|**Legibilidade**|Outro dev (ou você em 6 meses) consegue entender?|

Para revisão completa, **passe por cada uma**. Nem todas precisam ser detalhadas em todo arquivo — mas todas devem ser **consideradas**.

---

## 5. Checklist Objetivo

O coração da auto-revisão. Cada item tem resposta sim/não/N/A. Detalhamento completo em [`../checklists/40-revisao-rapida.md`](https://claude.ai/checklists/40-revisao-rapida.md).

### 5.1 Checklist Mínimo

```
[ ] Idioma consistente com o projeto (PT ou EN, sem mistura)
[ ] Nenhum `any` sem justificativa documentada
[ ] Storage (localStorage, etc.) acessado apenas via serviço
[ ] Pages predominantemente JSX de composição (lógica em hooks)
[ ] Testes passando (`npm run test`)
[ ] Toque mínimo 48×48px em elementos interativos (ou exceção documentada)
[ ] `inputMode` apropriado em campos numéricos
[ ] Labels visíveis em todos os inputs
[ ] Invariantes documentadas são respeitadas
[ ] Sem `console.log` com dados sensíveis em produção
[ ] Sem dados pessoais em URLs
[ ] Sem `dangerouslySetInnerHTML` sem DOMPurify
[ ] Componentes UI aceitam `className` e usam `forwardRef`
[ ] Sem `useEffect` para derivar estado
[ ] Funções com 5+ parâmetros usam objeto de opções
[ ] Hooks de feature têm interface mínima (só o que JSX consome)
```

### 5.2 Como Aplicar

Marque cada item:

- `[x]` — cumpre
- `[ ]` — não cumpre (vira achado)
- `[~]` — parcialmente cumpre / com exceção (justifica)
- `[N/A]` — não se aplica a esta tarefa

Itens não cumpridos viram **achados** que entram no formato de revisão (seção 7).

---

## 6. Os 3 Níveis de Achados

Nem todo achado tem o mesmo peso. Três níveis com tratamentos diferentes:

### 6.1 🔴 Bloqueante

**Definição:** problema que **impede** a tarefa de seguir para concluída.

**Critérios:**

- Viola regra inegociável (`any` sem justificativa, dados sensíveis em URL)
- Quebra invariante documentada
- Bug funcional (não faz o que prometia)
- Vulnerabilidade de segurança
- Teste essencial faltando

**Ação:** corrigir antes de marcar como concluída.

### 6.2 🟡 Importante

**Definição:** problema **real** mas não-bloqueante. Deve virar tarefa para curto prazo.

**Critérios:**

- Violação de padrão sem ser crítica (ex: page com lógica que deveria estar em hook)
- Falta de teste para caminho importante
- Acessibilidade média (não bloqueante mas degrada UX)
- Performance abaixo do ideal mas funcional

**Ação:** gera tarefa (BG, REF, RNF) em `pendentes.md` para resolver depois.

### 6.3 🟢 Sugestão

**Definição:** melhoria **opcional**. Quem decide se vale é o humano.

**Critérios:**

- Alternativa estilística (uma forma é tão boa quanto outra)
- Pequena otimização sem evidência de problema
- "Ficaria mais bonito se..."

**Ação:** mencionar na revisão. **Não gera tarefa automaticamente.** Se quiser registrar, abre como dívida técnica ou descarta.

### 6.4 Por Que Separar

Sem separação, ou você corrige tudo (perde tempo em coisa que não importa) ou ignora tudo (deixa problema crítico passar). Os 3 níveis dão **ponderação proporcional**.

---

## 7. Formato Padronizado da Revisão

A seção `## Revisão` no arquivo da tarefa concluída segue formato uniforme. Isso torna possível **ler 20 tarefas em sequência** e processar rapidamente.

### 7.1 Estrutura

```markdown
## Revisão

### Modo
[Auto-revisão IA / Revisão IA + Humano / Revisão humana completa]

### ✅ Bom
- [algo que ficou bem feito — não só lista vazia]

### 🔴 Bloqueante
**[Título do problema]**
- Onde: `arquivo.tsx` linha 42
- Problema: [descrição]
- Solução: [instrução concreta]

### 🟡 Importante
**[Título do problema]**
- Onde: `arquivo.ts` linha 15
- Problema: [descrição]
- Tarefa gerada: REF-12

### 🟢 Sugestão
- [descrição breve da melhoria opcional]

### Veredito
[APROVADO / APROVADO COM RESSALVAS / REPROVADO]

### Tarefas Geradas pela Revisão
- [PREFIXO]-XXX: [descrição]

### Requisitos Gerados pela Revisão
- [RF/RNF/RN]-XXX: [descrição] (adicionado em docs/requisitos/...)

### ADRs Geradas
- ADR-XXX: [título]
```

### 7.2 Análise do Formato

**Seção `✅ Bom` não é opcional.** Tentação é pular direto para problemas. Mas registrar o que ficou bem serve para:

- Reforçar padrões que valem repetir
- Equilibrar percepção (revisão não é só lista de defeitos)
- Documentar decisões boas que devem ser preservadas em refatorações futuras

**Sempre incluir "Onde" e "Solução" em bloqueantes.** Achado vago ("o código está confuso") não ajuda ninguém. Achado preciso ("variável `x` na linha 12 deveria se chamar `total`") permite correção rápida.

**"Veredito" é resumo executivo.**

|Veredito|Significado|
|---|---|
|APROVADO|Sem bloqueantes. Pode ir para concluída|
|APROVADO COM RESSALVAS|Sem bloqueantes, mas tem importantes/sugestões que devem virar tarefas|
|REPROVADO|Tem bloqueante. Volta para em-andamento até resolver|

### 7.3 Exemplo Real

```markdown
## Revisão

### Modo
Auto-revisão IA + validação humana

### ✅ Bom
- Hook `useDetalhamento` segue padrão do módulo 12, com interface mínima
- Componente `CartaoTotal` aceita `className` corretamente
- Testes cobrem caminho feliz e caso de filtros vazios

### 🔴 Bloqueante
**Status com apenas 2 valores quando deveria ter 3**
- Onde: `types/revisao.ts` linha 5
- Problema: `RevisaoGeral.status` está `'concluido' | 'pendente'`, mas RF-REG-05 exige `'CONCLUIDO' | 'EM_DIA' | 'PROXIMO'`
- Solução: atualizar tipo para os 3 valores em UPPER_CASE conforme o requisito

### 🟡 Importante
**Page PaginaDetalhamento com 180 linhas**
- Onde: `pages/PaginaDetalhamento.tsx`
- Problema: a page tem lógica que deveria estar em hook (3 useState, 2 funções de manipulação)
- Tarefa gerada: REF-04

### 🟢 Sugestão
- Considerar extrair `formatadorDeKm` para `utils/formatters.ts`, já que aparece em 2 lugares

### Veredito
REPROVADO (bloqueante em status)

### Tarefas Geradas pela Revisão
- REF-04: Extrair lógica de PaginaDetalhamento para hook próprio (180 → < 80 linhas)

### Requisitos Gerados pela Revisão
- —

### ADRs Geradas
- —
```

---

## 8. Tarefas Geradas pela Revisão

Achados não desaparecem. Eles se transformam.

### 8.1 Os 3 Cenários

A versão do documento original já tratava bem isso. Vou consolidar.

#### Cenário 1 — Código viola requisito existente

**Exemplo:** `RevisaoGeral.status` tem 2 estados, mas `RF-REG-05` exige 3.

**Ação:** criar tarefa `BG` referenciando o requisito violado.

```markdown
| TASK-BG-07 | status da RevisaoGeral com 2 estados (viola RF-REG-05) | Crítico | Imediata | P | — | `[ ]` | 13/05/26 |
```

O requisito já existe — foi descumprido. Tarefa corrige.

#### Cenário 2 — Problema de qualidade interna

**Exemplo:** `PaginaDetalhamento.tsx` tem 537 linhas. Convenção do projeto pede composição (lógica em hooks).

**Ação:** criar tarefa `REF`.

```markdown
| TASK-REF-02 | Refatorar PaginaDetalhamento.tsx para extrair lógica em hook | Importante | Esta Semana | G | — | `[ ]` | 13/05/26 |
```

Código funciona, mas viola padrão. Refatoração programada.

#### Cenário 3 — Problema que nenhum requisito cobre

**Exemplo:** o gráfico donut não tem `aria-label`. Nenhum RNF explicitamente obriga isso.

**Ação:** criar **tarefa + requisito** no mesmo passo.

```markdown
| TASK-RNF-13 | Todos os gráficos devem ter aria-label descritivo | Importante | Este Mês | P | — | `[ ]` | 13/05/26 |
```

E em `docs/requisitos/nao-funcionais.md`, adicionar:

```markdown
| TASK-RNF-13 | Gráficos têm aria-label descritivo | A11y | [ ] | RNF-A11Y-01 | — | 13/05/26 |
```

### 8.2 Árvore de Decisão

```
Problema encontrado na revisão
│
├─ Viola requisito existente (RF, RN, RNF)?
│   └─► Cenário 1: tarefa BG/REF referenciando o requisito
│
├─ Melhoria interna (código funciona mas violou padrão)?
│   └─► Cenário 2: tarefa REF direta
│
├─ Comportamento novo que nenhum requisito previu?
│   └─► Cenário 3: tarefa + adicionar requisito ao mesmo tempo
│
└─ É trivial (typo, espaçamento)?
    └─► Corrige na própria tarefa, sem gerar nova
```

### 8.3 Rastreabilidade

O arquivo da tarefa concluída lista tudo em **"Tarefas Geradas pela Revisão"** e **"Requisitos Gerados pela Revisão"**. Quem ler 6 meses depois sabe exatamente o que a revisão produziu.

---

## 9. Limites da Auto-Revisão da IA

Auto-revisão tem limites. Reconhecê-los honestamente é parte do processo.

### 9.1 O Que a IA Faz Bem

- Verificar checklist objetivo (nomenclatura, padrões, ausência de `any`)
- Identificar violação de regras documentadas
- Comparar código contra módulos `padroes/` deste pacote
- Detectar inconsistências entre código e documentação

### 9.2 O Que a IA Faz Mal (e precisa do humano)

- **Avaliar valor de produto.** "Esse botão deveria estar aqui?" — humano sabe melhor
- **Avaliar decisões arquiteturais maiores.** "Deveria ser Context ou Zustand?" — humano decide
- **Detectar problemas em código que ela mesma escreveu errado.** Se a IA tem viés (escreveu `useEffect` para derivar), ela pode ter o mesmo viés ao revisar
- **Validar regras de negócio não-documentadas.** Se não está escrito em algum lugar, IA não sabe

### 9.3 Como Mitigar

Quando algum desses casos aparece, a IA deve **explicitamente sinalizar incerteza**:

```markdown
### 🟡 Importante (Incerto)
**Uso de Context para perfil**
- Onde: `context/PerfilContext.tsx`
- Problema: decidi usar Context, mas não sei se Zustand seria melhor para este caso
- Ação sugerida: validação humana para decisão arquitetural
```

Sinalizar incerteza não é fraqueza — é honestidade.

---

## 10. Quando Pedir Revisão Humana Explícita

Em casos específicos, auto-revisão não basta. A IA deve **pausar e pedir revisão humana** antes de marcar como concluída:

|Caso|Por quê|
|---|---|
|Toca código de autenticação ou autorização|Risco de bug crítico de segurança|
|Toca cálculo financeiro ou de medida|Erro silencioso aqui é grave|
|Primeira implementação de padrão novo no projeto|Estabelece precedente para o resto|
|Toca arquivo marcado como crítico em ADR|Foi declarado imutável por algum motivo|
|Diverge de padrão estabelecido no projeto|Quer entender se é exceção justificada|
|Modifica testes existentes (não apenas adiciona)|Pode estar mascarando bug|

Quando algum desses aparece, a IA finaliza a auto-revisão mas **deixa a tarefa em "EM AVALIAÇÃO"** até o humano dar OK.

---

## 11. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Seção Revisão sempre existe?|Sim. `N/A com motivo` é aceitável; silêncio não|
|Auto-revisão da IA é suficiente?|Para mudanças Standard típicas, sim. Para crítico, não|
|Quantos níveis de achados?|3: 🔴 Bloqueante / 🟡 Importante / 🟢 Sugestão|
|Bloqueante deixa concluir?|Não. Volta para em-andamento|
|Importante deixa concluir?|Sim, mas gera tarefa|
|Sugestão deixa concluir?|Sim. Sem ação obrigatória|
|Achado vira tarefa?|Importante sim. Sugestão opcional|
|Cenários de tarefa gerada?|3: viola requisito / qualidade interna / sem requisito|
|Quando humano revisa explícito?|Auth, finanças, padrão novo, arquivo crítico, divergência|
|"Bom" é opcional na revisão?|Não. Sempre registre o que ficou bem|

---

## 🔗 Módulos Relacionados

- [`20-ciclo-tarefa.md`](https://claude.ai/chat/20-ciclo-tarefa.md) — Revisão é etapa antes de concluir tarefa
- [`22-refatoracao.md`](https://claude.ai/chat/22-refatoracao.md) — Tarefas REF geradas pela revisão
- [`25-analise-impacto.md`](https://claude.ai/chat/25-analise-impacto.md) — Análise prévia que reduz achados de revisão
- [`../checklists/40-revisao-rapida.md`](https://claude.ai/checklists/40-revisao-rapida.md) — Checklist detalhado
- [`../templates/31-task-concluida.md`](https://claude.ai/templates/31-task-concluida.md) — Template com seção Revisão
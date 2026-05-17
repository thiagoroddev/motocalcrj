---
description: "Padrões de gestão de tarefas para agentes de IA: backlog, tarefa em andamento, conclusão, bloqueios, testes, rastreabilidade e registro histórico."
applyTo: "docs/tarefas/**/*.md"
---

# Padrões de Tarefas para Agentes de IA

> Este arquivo define **como tarefas são criadas, executadas, bloqueadas e concluídas**.
> Ele não define padrões de código, documentação geral, revisão ou segurança.

---

## Como este padrão se relaciona com os outros

| Arquivo | Relação |
|---|---|
| `Geral.agent.md` | Define o processo geral, prioridades e quando pedir aprovação. |
| `codigo-react-typescript.agent.md` | Define como implementar tecnicamente uma tarefa de código. |
| `documentacao.agent.md` | Define onde requisitos, ADRs, dívida técnica e contexto devem ser registrados. |
| `revisao.agent.md` | Define como revisar a tarefa antes/depois da conclusão. |
| `seguranca.agent.md` | Define bloqueios obrigatórios de segurança e privacidade. |

---

## 1. Objetivo do sistema de tarefas

O sistema de tarefas existe para garantir:

- clareza do que será feito;
- rastreabilidade entre requisito, execução e entrega;
- registro de decisões;
- histórico consultável por humanos e agentes de IA;
- controle de escopo;
- redução de retrabalho.

Uma tarefa não é só uma linha de backlog. Ela é uma unidade rastreável de trabalho.

---

## 2. Labels obrigatórios da task

Toda task deve usar os labels abaixo como padrão.

| Campo | Valores aceitos |
|---|---|
| **TASK-ID** | `TASK-` + prefixo + número.<br><br>Prefixos aceitos:<br>`RF` = requisito funcional<br>`RN` = regra de negócio<br>`RNF` = requisito não-funcional<br>`BG` = bug<br>`REF` = refactor<br>`DOC` = documentação<br>`CHORE` = manutenção<br>`TEST` = testes<br><br>Exemplo: `TASK-RF-5.1` |
| **Título** | Frase curta e descritiva, sem ponto final.<br><br>Exemplo: `Criar sistema de autenticação` |
| **Modo** | Define o nível de cerimônia da task.<br><br>Valores aceitos:<br>`Light` / `Standard` / `Strict` |
| **Valor** | Importância da task para o produto/projeto.<br><br>Valores aceitos:<br>`Crítico` / `Importante` / `Desejável` |
| **Urgência** | Prioridade temporal da execução.<br><br>Valores aceitos:<br>`Imediata` / `Normal` |
| **Esforço-H/IA** | Duas medidas separadas por `/`, representando esforço humano e esforço para IA.<br><br>Formato: `H/IA`<br><br>Valores aceitos:<br>`P` / `M` / `G` / `XG`<br><br>Exemplo: `M/G` = médio para humano, grande para IA |
| **Dependências** | IDs de outras tarefas que precisam ser concluídas antes desta.<br><br>Use `-` se não houver dependências.<br><br>Exemplo: `TASK-RF-1.1, TASK-RN-2.1` |
| **REQ/ADR/DT** | Referências relacionadas a requisitos, decisões arquiteturais e dívidas técnicas.<br><br>Tipos aceitos:<br>`RF` = requisito funcional<br>`RN` = regra de negócio<br>`RNF` = requisito não-funcional<br>`ADR` = Architecture Decision Record<br>`DT` = dívida técnica<br><br>Use `-` se não houver referência.<br><br>Exemplo: `RF-2, ADR-3, DT-14` |
| **Status** | Estado atual da task.<br><br>Valores aceitos:<br>`[ ]` pendente<br>`[x]` concluída<br><br>Observação: tarefas concluídas normalmente saem do arquivo de tasks pendentes. |
| **Data origem** | Data e hora em que a task foi criada.<br><br>Formato:<br>`DD/MM/AA HH:MM`<br><br>Exemplo: `14/05/26 08:45` |
| **Observações** | Campo usado apenas quando a urgência for `Imediata`.<br><br>Serve para explicar o contexto ou motivo da urgência.<br><br>Use `-` se não houver observação. |

---

## 3. Ciclo de vida

Toda tarefa passa por três estados principais:

```txt
Pendente -> Em andamento -> Concluída
```

Arquivos correspondentes:

```txt
docs/tarefas/
├── pendentes.md
├── em-andamento.md
└── concluidas/
    └── TASK-PREFIXO-XXX-YYYY-MM-DD-HHhMM.md
```

### Regra

Nada deve viver no lugar errado.

| Estado | Local |
|---|---|
| Ainda não começou | `docs/tarefas/pendentes.md` |
| Está sendo executada | `docs/tarefas/em-andamento.md` |
| Foi concluída | `docs/tarefas/concluidas/` |
| Foi adiada conscientemente | `docs/dominios/divida-tecnica.md` |
| É decisão arquitetural | `docs/arquitetura/ADR/` |
| É regra do produto | `docs/requisitos/` |

---

## 4. Prefixos de tarefa

Use prefixos para indicar a natureza da tarefa.

| Prefixo | Significado | Quando usar |
|---|---|---|
| `TASK-RF` | Requisito funcional | Implementa comportamento visível ao usuário. |
| `TASK-RN` | Regra de negócio | Implementa ou corrige regra do domínio. |
| `TASK-RNF` | Requisito não-funcional | Performance, acessibilidade, segurança, PWA, etc. |
| `TASK-BG` | Bug | Corrige comportamento errado. |
| `TASK-REF` | Refatoração | Melhora estrutura sem mudar comportamento. |
| `TASK-DOC` | Documentação | Cria ou ajusta documentação. |
| `TASK-CHORE` | Manutenção | Ajuste técnico sem impacto direto no produto. |
| `TASK-TEST` | Testes | Cria, corrige ou amplia testes. |

Exemplos:

```txt
TASK-RF-001
TASK-RF-001.1
TASK-BG-003
TASK-REF-002
TASK-DOC-004
TASK-RNF-005
```

---

## 5. Esforço para IA

O esforço de uma tarefa para IA **não deve ser medido por tempo humano**, mas por:

- carga de contexto;
- quantidade de arquivos afetados;
- risco de erro;
- necessidade de validação;
- chance de estourar o contexto da conversa;
- impacto arquitetural.

Por isso, o campo de esforço da task é duplo:

```txt
H/IA
```

Onde:

- **H** = esforço estimado para humano;
- **IA** = esforço estimado para inteligência artificial.

Exemplo:

```txt
M/G
```

Significa:

- **M** = esforço médio para humano;
- **G** = esforço grande para IA.

| Esforço | Nome | Definição | Critérios típicos |
|---|---|---|---|
| **P-IA** | Pequena | Pequena e local | Afeta 1-2 arquivos, exige baixo contexto, possui baixo risco e não altera arquitetura |
| **M-IA** | Média | Média e controlada | Afeta 2-5 arquivos, exige contexto moderado, possui testes simples e impacto local |
| **G-IA** | Grande | Grande e sensível | Afeta 5-12 arquivos, exige alto contexto, possui risco relevante e precisa de testes e revisão cuidadosa |
| **XG-IA** | Extra grande | Grande demais para uma única execução segura | Afeta 12+ arquivos, envolve muitas decisões, possui alto risco ou grande chance de estourar o contexto |

### Regra para XG

Tarefa com `XG` em qualquer lado do campo `Esforço-H/IA` deve ser quebrada antes de ser executada.

Exemplo:

```txt
TASK-RF-010 Criar sistema completo de autenticação
```

Deve virar algo como:

```txt
TASK-RF-010.1 Criar tela de login
TASK-RF-010.2 Criar validação de formulário
TASK-RF-010.3 Criar serviço de autenticação
TASK-RF-010.4 Criar proteção de rotas
TASK-RF-010.5 Criar logout
```

---

## 6. Tarefa pendente

Arquivo:

```txt
docs/tarefas/pendentes.md
```

Tarefa pendente deve ser curta. Ela representa intenção, não plano completo.

### Template de task pendente normal

Use este formato para tasks com urgência `Normal`.

```md
# Tarefas Pendentes

> Backlog priorizado. Revisado no início de cada ciclo.

| TASK-ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
|---|---|:---:|:---:|:---:|:---:|---|---|:---:|---|
| TASK-RF-5.1 | Registros - lista e sub-abas | Standard | Importante | Normal | G/G | TASK-RF-1 | RF-2, ADR-3, DT-14 | `[ ]` | 10/05/26 09:39 |
```

### Template de task pendente imediata

Use este formato para tasks com urgência `Imediata`.

```md
## TASK-ID - Título

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RNF-04, RNF-11, ADR-2, DT-14
- **Observações:** Deu problema nisso e naquilo, agora precisa disso primeiro
```

### Regras

- Uma tarefa pendente normal deve ocupar uma linha.
- Tarefa imediata pode usar bloco detalhado com `Observações`.
- Não coloque planejamento longo no backlog.
- Não misture dívida técnica com tarefa pendente.
- Não coloque tarefa sem `TASK-ID`.
- Não crie tarefa para algo trivial corrigido dentro da própria tarefa atual.

---

## 7. Priorização

Use os campos `Valor`, `Urgência` e `Esforço-H/IA`.

### Valor

| Valor | Significado |
|---|---|
| `Crítico` | Sem isso, o produto quebra ou não entrega o mínimo. |
| `Importante` | Melhora relevante ou desbloqueia outras partes. |
| `Desejável` | Bom ter, mas pode esperar. |

### Urgência

| Urgência | Significado |
|---|---|
| `Imediata` | Deve ser atacada antes de quase tudo. Exige `Observações`. |
| `Normal` | Entra no backlog priorizado regular. |

### Modo

| Modo | Significado |
|---|---|
| `Light` | Pouca cerimônia. Útil para tarefas pequenas e de baixo risco. |
| `Standard` | Cerimônia padrão. Útil para tarefas médias ou comuns. |
| `Strict` | Cerimônia alta. Útil para tarefas críticas, arriscadas ou arquiteturais. |

---

## 8. Iniciando uma tarefa

Antes de iniciar:

1. Ler a tarefa em `pendentes.md`.
2. Ler requisitos relacionados em `REQ/ADR/DT`.
3. Ler ADRs relacionadas, se houver.
4. Ler padrões técnicos relacionados.
5. Fazer análise de impacto quando necessário.
6. Reformular entendimento para o humano se houver risco ou ambiguidade.
7. Pedir aprovação quando a tarefa envolver mudança relevante.
8. Mover a tarefa para `em-andamento.md`.

### Quando pedir aprovação

Siga `Geral.agent.md`.

Em resumo, peça aprovação antes de:

- criar, deletar, mover ou renomear arquivos;
- alterar arquitetura;
- instalar dependências;
- mudar requisitos;
- modificar comportamento existente;
- fazer refatoração grande;
- mexer em dados sensíveis;
- executar ação destrutiva.

---

## 9. Tarefa em andamento

Arquivo:

```txt
docs/tarefas/em-andamento.md
```

Pode haver mais de uma tarefa em andamento, mas o limite recomendado é:

```txt
Máximo: 3 tarefas em andamento ao mesmo tempo.
```

Modelo:

```md
# Tarefas em Andamento

## TASK-RF-001 - Criar tela de login

- **Status:** Em desenvolvimento
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Normal
- **Esforço-H/IA:** M/M
- **Data origem:** 13/05/26 09:00
- **Início:** 13/05/26 14:00
- **Dependências:** -
- **REQ/ADR/DT:** RF-001, RNF-002
- **Responsável:** IA + Humano
- **Observações:** -

## Planejamento Aprovado

[Plano aprovado pelo humano ou plano executado diretamente quando a tarefa for pequena.]

## Execução

- 14:00: Tarefa iniciada.
- 14:10: Requisitos relacionados lidos.
- 14:20: Componentes necessários identificados.

## Decisões Tomadas

- [decisão]: [motivo]

## Bloqueios

Nenhum.

## O que NÃO será feito nesta tarefa

- [item]: [motivo]
```

### Regras

- Ao iniciar, remova a linha correspondente de `pendentes.md`.
- Registre decisões durante a execução.
- Registre bloqueios quando acontecerem.
- Registre explicitamente o que ficou fora do escopo.
- Não use `em-andamento.md` como backlog.

---

## 10. Planejamento da tarefa

Para tarefa média, grande, crítica ou com modo `Strict`, use este formato antes de executar:

```md
## Plano: TASK-ID - Título

### Labels

- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** Normal
- **Esforço-H/IA:** M/G
- **Dependências:** -
- **REQ/ADR/DT:** RF-001, RNF-002

### Objetivo

[O que será entregue.]

### Arquivos que serão criados/modificados

| Arquivo | Mudança |
|---|---|
| `src/pages/Login.tsx` | Criar página de login. |
| `src/hooks/useLogin.ts` | Encapsular estado e handlers. |

### Impactos possíveis

- Pode afetar rotas públicas/privadas.
- Pode exigir ajuste em testes de navegação.

### Dependências novas

Nenhuma.

### Riscos

- Validação incompleta de formulário.
- Fluxo de erro não definido.

### Fora do escopo

- Cadastro de usuário.
- Recuperação de senha.
```

---

## 11. Execução

Durante a execução:

- siga o plano aprovado;
- mantenha mudanças pequenas e coesas;
- não resolva problemas fora do escopo sem registrar;
- se o plano precisar mudar, pare e registre a mudança;
- se a mudança for relevante, peça nova aprovação;
- se encontrar bug fora do escopo, gere tarefa ou registre dívida técnica;
- rode testes/checks aplicáveis antes de concluir.

### Regra de escopo

Se encontrar algo errado fora do escopo:

| Situação | Ação |
|---|---|
| Trivial e diretamente relacionado | Corrigir e registrar. |
| Bug real | Criar tarefa `TASK-BG`. |
| Código ruim, mas funcional | Criar tarefa `TASK-REF` ou dívida técnica. |
| Decisão arquitetural necessária | Criar ou propor ADR. |
| Regra não documentada | Propor requisito ou invariante. |

---

## 12. Bloqueios

Após duas tentativas sem sucesso no mesmo problema, pare e peça orientação.

Modelo:

```md
## Bloqueio em DD/MM/AA HH:MM

**TASK-ID:** TASK-RF-001

**Contexto:** [o que estava tentando fazer]

**O que tentei:**

1. [tentativa 1]
2. [tentativa 2]

**Por que não funcionou:**

[causa provável]

**Opções:**

1. [opção A]
2. [opção B]

**Minha recomendação:**

[opção recomendada e motivo]

**O que preciso do humano:**

[decisão, arquivo, credencial, confirmação, contexto etc.]
```

### Regras

- Não tente infinitamente.
- Não esconda bloqueio.
- Não invente resultado.
- Não marque tarefa como concluída se houver bloqueio que impede entrega.

---

## 13. Concluindo uma tarefa

Antes de concluir:

1. Verificar se o objetivo foi atendido.
2. Rodar testes/checks aplicáveis.
3. Registrar resultado dos testes.
4. Atualizar requisitos relacionados, se o status mudou.
5. Registrar ADRs, se decisões arquiteturais foram tomadas.
6. Registrar dívida técnica, se algo foi conscientemente adiado.
7. Registrar tarefas geradas.
8. Mover conteúdo de `em-andamento.md` para arquivo em `concluidas/`.
9.**Registrar** a conclusão da tarefa no índice de tarefas concluídas em dosc/tarefas/concluidas/indice-concluidas.md
9. Remover a tarefa de `em-andamento.md`.

---


## 14. Arquivo de tarefa concluída

Para garantir ordem cronológica quando o explorador/listagem ordena por nome, coloque a data no começo do nome do arquivo.
Formato do título do arquivo: `[YYYY-MM-DD]-[HHhMM]-[TASK-PREFIXO]-[NUMERO]-[TITULO_CURTO].md`

Local:

```txt
docs/tarefas/concluidas/YYYY-MM-DD-HHhMM--TASK-PREFIXO-XXX.md
```

Exemplo:

```txt
docs/tarefas/concluidas/2026-05-13-17h30--TASK-RF-001.md

```
## Template do docs/tarefas/concluidas/indice-concluidas.md

Lista cronológica das tarefas concluídas. Cada linha aponta para o arquivo completo da tarefa.

[TASK-PREFIXO-NUMERO] | [TITULO DESCRITIVO] | [][LINK COM CAMINHO CLICÁVEL] |

Exemplos preenchidos ilustrativos:

TASK-DOM-1 | Atualização da modelagem de domínio | [](./2026-05-10-TASK-DOM-1.md)
TASK-DOM-2 | Ajustes referências v6 e refistro de DT-14 | [](./2026-05-11-TASK-DOM-2.md)
TASK-REF-03 | Instalar shadcn/ui e criar wrappers em components/ui | [](./2026-05-16--20h21--TASK-REF-03.md)


## Template mmodelo do conteúdo interno dos arquivos únicos de cada tarefa:

```md
# TASK-RF-001 - Criar tela de login

- **Status:** Concluída
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Normal
- **Esforço-H/IA:** M/M
- **Data origem:** 13/05/26 09:00
- **Início:** 13/05/26 14:00
- **Conclusão:** 13/05/26 17:30
- **Dependências:** -
- **REQ/ADR/DT:** RF-001, RNF-002
- **Responsável:** IA + Humano
- **Observações:** -

## Objetivo

[O que a tarefa deveria entregar.]

## Planejamento Aprovado

[Plano aprovado ou justificativa de execução direta.]

## Execução

- 14:00: Tarefa iniciada.
- 15:20: Página criada.
- 16:10: Hook extraído.
- 17:00: Testes executados.

## Arquivos Alterados

| Arquivo | Mudança |
|---|---|
| `src/pages/Login.tsx` | Criada página de login. |
| `src/hooks/useLogin.ts` | Criado hook de controle do formulário. |

## Decisões Tomadas

- [decisão]: [motivo]

## O que NÃO foi feito e por quê

- [item]: [motivo]

## Revisão

Consultar `revisao.agent.md`.

**Veredito:** Aprovado / Aprovado com ressalvas / Reprovado / N/A

## Testes

| Comando | Resultado |
|---|---|
| `npm run test` | Passou |
| `npm run lint` | Passou |
| `npx tsc --noEmit` | Passou |

## Requisitos Atualizados

- RF-001: status alterado para concluído.

## ADRs Geradas

- Nenhuma.

## Dívidas Técnicas Geradas

- Nenhuma.

## Tarefas Geradas

- TASK-BG-002: Corrigir feedback visual de erro no formulário.

## Aprendizados para o Projeto

- [algo que deve ser lembrado em tarefas futuras]
```

---

## 15. Testes e checks

O tipo de teste depende da tarefa.

### Para código TypeScript/React

Recomendado:

```bash
npm run test
npm run lint
npx tsc --noEmit
```

### Para build

```bash
npm run build
```

### Para documentação

Verificar:

```txt
- links internos;
- caminhos corretos;
- ausência de duplicação;
- coerência com código existente;
- ausência de informações inventadas.
```

### Regra

Se teste falhar, não marque a tarefa como concluída sem explicar.

Use:

```md
## Testes

| Comando | Resultado | Observação |
|---|---|---|
| `npm run test` | Falhou | 2 testes antigos falham antes desta tarefa. |
```

---

## 16. Tarefas geradas por revisão

Quando uma revisão encontra problema, registre tarefa gerada.

Use a árvore de decisão:

```txt
Problema encontrado
├── Viola requisito existente?
│   └── Criar TASK-BG ou TASK-REF referenciando requisito.
├── É qualidade interna?
│   └── Criar TASK-REF.
├── É comportamento novo não coberto?
│   └── Propor requisito + tarefa.
└── É trivial?
    └── Corrigir na própria tarefa.
```

Exemplo:

```md
## Tarefas Geradas

- TASK-BG-003: Corrigir validação de data final menor que data inicial. Viola RN-002.
- TASK-REF-004: Extrair lógica de cálculo de `PaginaResumo.tsx`.
```

---

## 17. Relação entre tarefa, requisito, ADR e dívida

Use sempre o label `REQ/ADR/DT` para registrar vínculos.

### Tarefa ligada a requisito

Use quando a tarefa implementa ou corrige algo previsto.

```md
- **REQ/ADR/DT:** RF-001, RN-002
```

### Tarefa ligada a ADR

Use quando a tarefa implementa decisão arquitetural.

```md
- **REQ/ADR/DT:** ADR-003
```

### Tarefa gerada por dívida técnica

Use quando uma dívida virou ação.

```md
- **REQ/ADR/DT:** DT-004
```

Ao concluir, atualize a dívida:

```md
DT-004: Resolvida pela tarefa TASK-REF-006 em 13/05/26.
```

---

## 18. Quando criar nova tarefa

Crie nova tarefa quando:

- o problema está fora do escopo atual;
- o ajuste exige mais de poucos minutos;
- há risco de quebrar comportamento existente;
- precisa de aprovação humana;
- envolve arquitetura;
- envolve requisito novo;
- envolve dívida técnica que agora precisa ser paga.

Não crie nova tarefa para:

- typo corrigido imediatamente;
- formatação local;
- ajuste pequeno dentro do mesmo arquivo e escopo;
- comentário removido;
- import não usado.

---

## 19. Quando criar dívida técnica em vez de tarefa

Crie dívida técnica quando:

- o problema é real;
- não será resolvido agora;
- existe um motivo consciente para adiar;
- existe um gatilho claro para revisitar.

Modelo resumido:

```md
| DT-001 | `useRelatorio` concentra lógica demais. | Dificulta testes. | Quando nova regra de relatório for adicionada. | - | Aberta |
```

Não use dívida técnica como lixeira de coisas esquecidas.

---

## 20. Relatório final para o humano

Ao concluir uma tarefa, responda com:

```md
## Concluído: TASK-ID - Título

**Resumo:** [o que foi feito]

**Arquivos alterados:**

- `arquivo`: [mudança]

**Testes/checks:**

- `npm run test`: passou
- `npm run lint`: passou

**Registros atualizados:**

- `docs/tarefas/concluidas/...`
- `docs/requisitos/...`

**Pendências:**

- [se houver]
```

Para tarefas pequenas, pode ser mais curto.

---

## 21. Anti-padrões em tarefas

Evite:

- começar tarefa sem ler requisito relacionado;
- deixar tarefa em andamento sem log;
- concluir sem rodar checks aplicáveis;
- misturar várias tarefas em uma;
- criar tarefa sem `TASK-ID`;
- criar requisito escondido dentro de tarefa;
- transformar dívida técnica em backlog automaticamente;
- apagar documentação antiga sem autorização;
- registrar "feito" quando só foi parcialmente feito;
- gerar dezenas de tarefas pequenas sem prioridade.

---

## 22. Checklist rápido

Antes de iniciar:

```md
- [ ] Li a tarefa.
- [ ] Li requisitos relacionados em REQ/ADR/DT.
- [ ] Li ADRs relacionadas, se houver.
- [ ] Entendi o escopo.
- [ ] Sei se preciso de aprovação.
```

Antes de concluir:

```md
- [ ] Objetivo atendido.
- [ ] Testes/checks aplicáveis executados.
- [ ] Resultado dos testes registrado.
- [ ] Requisitos atualizados, se necessário.
- [ ] ADR registrada, se necessário.
- [ ] Dívida técnica registrada, se necessário.
- [ ] Tarefas geradas registradas.
- [ ] Arquivo movido para `concluidas/`.
```

---

## 23. Regra final

Tarefa boa deixa rastro suficiente para alguém entender depois:

- o que foi pedido;
- o que foi feito;
- por que foi feito daquele jeito;
- o que não foi feito;
- o que precisa acontecer depois.

Se não deixa esse rastro, a tarefa ainda não está realmente concluída.

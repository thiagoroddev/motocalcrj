---
description: "Padrões de gestão de tarefas para agentes de IA: backlog, tarefa em andamento, conclusão, bloqueios, testes, rastreabilidade e registro histórico."
applyTo: "docs/tarefas/**/*.md"
---

# Padrões de Tarefas para Agentes de IA

> Este arquivo define **como tarefas são criadas, executadas, bloqueadas e concluídas**.
> Ele não define padrões de código, documentação geral, revisão ou segurança.

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

## 2. Ciclo de vida

Toda tarefa passa por três estados principais:

```txt
Pendente → Em andamento → Concluída
```

Arquivos correspondentes:

```txt
docs/tarefas/
├── pendentes.md
├── em-andamento.md
└── concluidas/
    └── PREFIXO-XXX-YYYY-MM-DD-HHhMM.md
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

## 3. Prefixos de tarefa

Use prefixos para indicar a natureza da tarefa.

| Prefixo | Significado | Quando usar |
|---|---|---|
| `RF` | Requisito Funcional | Implementa comportamento visível ao usuário. |
| `RN` | Regra de Negócio | Implementa ou corrige regra do domínio. |
| `RNF` | Requisito Não-Funcional | Performance, acessibilidade, segurança, PWA, etc. |
| `BG` | Bug | Corrige comportamento errado. |
| `REF` | Refatoração | Melhora estrutura sem mudar comportamento. |
| `DOC` | Documentação | Cria ou ajusta documentação. |
| `CHORE` | Manutenção | Ajuste técnico sem impacto direto no produto. |

Exemplos:

```txt
RF-001
RF-001.1
BG-003
REF-002
DOC-004
RNF-005
```

---

## 4. Tarefa pendente

Arquivo:

```txt
docs/tarefas/pendentes.md
```

Tarefa pendente deve ser curta. Ela representa intenção, não plano completo.

Modelo:

```md
# Tarefas Pendentes

## Legenda de Prefixos

| Prefixo | Significado |
|---|---|
| RF | Requisito Funcional |
| RN | Regra de Negócio |
| RNF | Requisito Não-Funcional |
| BG | Bug |
| REF | Refatoração |
| DOC | Documentação |
| CHORE | Manutenção |

## Priorização

| Campo | Valores |
|---|---|
| Valor | Crítico / Importante / Desejável |
| Urgência | Imediata / Esta Semana / Este Mês / Quando Der |
| Esforço | P / M / G / XG |

## Backlog

| ID | Título | Valor | Urgência | Esforço | Dependências | Status | Data de Origem |
|---|---|---|---|---|---|---|---|
| RF-001 | Criar tela de login | Crítico | Imediata | M | - | [ ] | 2026-05-13 |
```

### Regras

- Uma tarefa pendente deve ocupar uma linha.
- Não coloque planejamento longo no backlog.
- Não misture dívida técnica com tarefa pendente.
- Não coloque tarefa sem ID.
- Não crie tarefa para algo trivial corrigido dentro da própria tarefa atual.

---

## 5. Priorização

Use três campos simples.

### Valor

| Valor | Significado |
|---|---|
| Crítico | Sem isso, o produto quebra ou não entrega o mínimo. |
| Importante | Melhora relevante ou desbloqueia outras partes. |
| Desejável | Bom ter, mas pode esperar. |

### Urgência

| Urgência | Significado |
|---|---|
| Imediata | Deve ser atacada antes de quase tudo. |
| Esta Semana | Importante no ciclo atual. |
| Este Mês | Entra no planejamento próximo. |
| Quando Der | Sem pressão. |

### Esforço

| Esforço | Significado |
|---|---|
| P | Até 2 horas. |
| M | 2 a 8 horas. |
| G | 1 a 3 dias. |
| XG | Mais de 3 dias ou precisa quebrar em subtarefas. |

### Regra para XG

Tarefa `XG` deve ser quebrada antes de ser executada.

Exemplo:

```txt
RF-010 Criar sistema completo de autenticação
```

Deve virar algo como:

```txt
RF-010.1 Criar tela de login
RF-010.2 Criar validação de formulário
RF-010.3 Criar serviço de autenticação
RF-010.4 Criar proteção de rotas
RF-010.5 Criar logout
```

---

## 6. Iniciando uma tarefa

Antes de iniciar:

1. Ler a tarefa em `pendentes.md`.
2. Ler requisitos relacionados.
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

## 7. Tarefa em andamento

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

## RF-001 - Criar tela de login

**Status:** EM DESENVOLVIMENTO
**Data de Origem:** 2026-05-13
**Início:** 2026-05-13 14:00
**Requisitos:** RF-001, RNF-002
**ADR Relacionada:** -
**Responsável:** IA + Humano

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

## 8. Planejamento da tarefa

Para tarefa média ou grande, use este formato antes de executar:

```md
## Plano: [ID] - [Título]

### Objetivo

[O que será entregue.]

### Arquivos que serão criados/modificados

| Arquivo | Mudança |
|---|---|
| `src/pages/Login.tsx` | Criar página de login. |
| `src/hooks/useLogin.ts` | Encapsular estado e handlers. |

### Requisitos relacionados

- RF-001
- RNF-002

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

## 9. Execução

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
| Bug real | Criar tarefa `BG`. |
| Código ruim, mas funcional | Criar tarefa `REF` ou dívida técnica. |
| Decisão arquitetural necessária | Criar ou propor ADR. |
| Regra não documentada | Propor requisito ou invariante. |

---

## 10. Bloqueios

Após duas tentativas sem sucesso no mesmo problema, pare e peça orientação.

Modelo:

```md
## Bloqueio em YYYY-MM-DD HH:MM

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

## 11. Concluindo uma tarefa

Antes de concluir:

1. Verificar se o objetivo foi atendido.
2. Rodar testes/checks aplicáveis.
3. Registrar resultado dos testes.
4. Atualizar requisitos relacionados, se o status mudou.
5. Registrar ADRs, se decisões arquiteturais foram tomadas.
6. Registrar dívida técnica, se algo foi conscientemente adiado.
7. Registrar tarefas geradas.
8. Mover conteúdo de `em-andamento.md` para arquivo em `concluidas/`.
9. Remover a tarefa de `em-andamento.md`.

---

## 12. Arquivo de tarefa concluída

Local:

```txt
docs/tarefas/concluidas/PREFIXO-XXX-YYYY-MM-DD-HHhMM.md
```

Exemplo:

```txt
docs/tarefas/concluidas/RF-001-2026-05-13-17h30.md
```

Modelo:

```md
# RF-001 - Criar tela de login

**Status:** CONCLUÍDO
**Data de Origem:** 2026-05-13
**Início:** 2026-05-13 14:00
**Conclusão:** 2026-05-13 17:30
**Requisitos:** RF-001, RNF-002
**ADR Relacionada:** -
**Responsável:** IA + Humano

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

Resultado:

**Veredito:** APROVADO / APROVADO COM RESSALVAS / REPROVADO / N/A

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

- BG-002: Corrigir feedback visual de erro no formulário.

## Aprendizados para o Projeto

- [algo que deve ser lembrado em tarefas futuras]
```

---

## 13. Testes e checks

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

## 14. Tarefas geradas por revisão

Quando uma revisão encontra problema, registre tarefa gerada.

Use a árvore de decisão:

```txt
Problema encontrado
├── Viola requisito existente?
│   └── Criar BG ou REF referenciando requisito.
├── É qualidade interna?
│   └── Criar REF.
├── É comportamento novo não coberto?
│   └── Propor requisito + tarefa.
└── É trivial?
    └── Corrigir na própria tarefa.
```

Exemplo:

```md
## Tarefas Geradas

- BG-003: Corrigir validação de data final menor que data inicial. Viola RN-002.
- REF-004: Extrair lógica de cálculo de `PaginaResumo.tsx`.
```

---

## 15. Relação entre tarefa, requisito, ADR e dívida

### Tarefa ligada a requisito

Use quando a tarefa implementa ou corrige algo previsto.

```md
**Requisitos:** RF-001, RN-002
```

### Tarefa ligada a ADR

Use quando a tarefa implementa decisão arquitetural.

```md
**ADR Relacionada:** ADR-003
```

### Tarefa gerada por dívida técnica

Use quando uma dívida virou ação.

```md
**Origem:** DT-004
```

Ao concluir, atualize a dívida:

```md
DT-004: Resolvida pela tarefa REF-006 em 2026-05-13.
```

---

## 16. Quando criar nova tarefa

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

## 17. Quando criar dívida técnica em vez de tarefa

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

## 18. Relatório final para o humano

Ao concluir uma tarefa, responda com:

```md
## Concluído: [ID] - [Título]

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

## 19. Anti-padrões em tarefas

Evite:

- começar tarefa sem ler requisito relacionado;
- deixar tarefa em andamento sem log;
- concluir sem rodar checks aplicáveis;
- misturar várias tarefas em uma;
- criar tarefa sem ID;
- criar requisito escondido dentro de tarefa;
- transformar dívida técnica em backlog automaticamente;
- apagar documentação antiga sem autorização;
- registrar “feito” quando só foi parcialmente feito;
- gerar dezenas de tarefas pequenas sem prioridade.

---

## 20. Checklist rápido

Antes de iniciar:

```md
- [ ] Li a tarefa.
- [ ] Li requisitos relacionados.
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

## 21. Regra final

Tarefa boa deixa rastro suficiente para alguém entender depois:

- o que foi pedido;
- o que foi feito;
- por que foi feito daquele jeito;
- o que não foi feito;
- o que precisa acontecer depois.

Se não deixa esse rastro, a tarefa ainda não está realmente concluída.

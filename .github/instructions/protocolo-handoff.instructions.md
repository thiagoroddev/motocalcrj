---
applyTo: "**"
---

# Protocolo de Handoff MotoCalc RJ

> Este arquivo é lido por TODOS os agentes, em TODA ação.
> Sem seguir este protocolo, nenhuma ação é válida.

---

## Regra 0 Antes de Qualquer Coisa

Ao ser chamado, o agente DEVE:

1. Ler `SESSAO-ATIVA.md` contexto do que foi feito antes
2. Ler `contexto-base.instructions.md` estado atual do projeto
3. Ler `protocolo-handoff.instructions.md` regras de handoff (este arquivo)
4. Atualizar `SESSAO-ATIVA.md`: task = [~] EM DESENVOLVIMENTO + o que vai fazer (ver Regra 1)
5. Só então agir

> Mantenha em mente: ao concluir, você deve verificar se o `contexto-base` precisa atualização (Regra 4 do `protocolo-handoff.instructions.md`).

---

## Regra 1 Ao Iniciar uma Ação

Atualizar `SESSAO-ATIVA.md` imediatamente:

```markdown
## Sessão atual

**Agente:** [nome do agente]
**Task:** TASK-X.Y [nome]
**Status da task:** EM DESENVOLVIMENTO
**Iniciado em:** [horário aproximado ou "agora"]
**O que vou fazer:** [descrição em 1-3 linhas do plano]
```

Em seguida, atualizar `docs/Tasks.md`:

- **Mover** a task da seção "Próximas" ou "Backlog" para a seção **"Em andamento"**
- Marcar o status: `[ ]` → `[~]`

Exemplo do bloco da task em `docs/Tasks.md`:
```markdown
TASK-X.Y - [nome]
- **Status:** [~] em desenvolvimento
- **Iniciado em:** [data]
- **Agente atual:** [nome]
```

> ⚠️ Se a task **não existir** ainda em `docs/Tasks.md`, criá-la antes na seção apropriada. Não iniciar trabalho sem registro formal.

---

## Regra 2 Ao Encontrar Problema

Registrar em `SESSAO-ATIVA.md` antes de parar:

```markdown
## Problema encontrado

**Agente:** [nome]
**Task:** TASK-X.Y
**Tentativa:** [número ex: 1ª tentativa]
**O que tentei:** [descrição]
**Por que não funcionou:** [causa raiz identificada]
**Hipóteses restantes:** [o que ainda pode ser tentado]
**Precisa de:** [decisão do dev / informação / aprovação]
**Próximo agente sugerido:** [agente que pode ajudar, se houver]
```

Regra do bug: após 2 tentativas sem sucesso, parar e registrar mudança de abordagem.

---

## Regra 3 Ao Concluir uma Ação Ritual de Arquivamento

Toda conclusão de task **OBRIGATORIAMENTE** segue os 5 passos abaixo, nessa ordem. Pular qualquer passo invalida o handoff o `SESSAO-ATIVA.md` deixa de ser memória compartilhada confiável e o histórico se corrompe.

### Passo 1 Ler o handoff atual em `SESSAO-ATIVA.md`

Antes de sobrescrever, **ler** o que está lá. Pode haver alertas do agente anterior, decisões registradas ou contexto que precisa migrar para o novo handoff.

### Passo 2 Arquivar o handoff anterior

Copiar o conteúdo atual de `SESSAO-ATIVA.md` para:

```
docs/historico/handoffs/YYYY-MM-DD-TASK-XXX.md
```

Onde:
- `YYYY-MM-DD` = data de **conclusão** da task (não de início)
- `TASK-XXX` = ID da task concluída
- Se mais de uma task for concluída no mesmo dia, sufixar: `2026-05-11-TASK-DOM-2-b.md`

O conteúdo arquivado é o handoff completo escrito pelo agente, sem edição.

### Passo 3 Adicionar entrada em `docs/historico/tasks-concluidas.md`

Inserir a entrada **no topo** do arquivo (cronológico inverso mais recente em cima):

```markdown
## TASK-X.Y [nome] [YYYY-MM-DD]

**Agente:** [nome]
**Status final:** CONCLUÍDO / CONCLUÍDO COM RESSALVAS / BLOQUEADO
**Resumo:** [1-2 linhas do que foi entregue]
**Handoff arquivado:** `docs/historico/handoffs/YYYY-MM-DD-TASK-XXX.md`
```

### Passo 4 Atualizar `docs/Tasks.md`

- **Mover** a task da seção "Em andamento" para **"Recém-concluídas"** (topo)
- Marcar status: `[~]` → `[x]` (ou `[!]` se concluído com ressalvas, `[T]` se testes confirmados)
- A seção "Recém-concluídas" mantém **no máximo 3 tasks** (top-3 mais recentes). Ao adicionar a nova, se já houver 3, **remover a mais antiga** (a 4ª na ordem) ela continua acessível em `docs/historico/tasks-concluidas.md`

### Passo 5 Sobrescrever `SESSAO-ATIVA.md` com o handoff próprio

Substituir **todo o conteúdo** de `SESSAO-ATIVA.md` pelo handoff novo:

```markdown
## Handoff

**Agente que concluiu:** [nome]
**Task:** TASK-X.Y [nome]
**Status da task:** CONCLUÍDO / CONCLUÍDO COM RESSALVAS / BLOQUEADO

**O que foi feito:**
- [arquivo criado/modificado]: [o que mudou]
- [arquivo criado/modificado]: [o que mudou]

**Decisões tomadas:**
- [decisão]: [motivo]

**O que NÃO foi feito (e por quê):**
- [item pendente]: [motivo]

## Testes

**Cobertura desta entrega:**
- [arquivo de teste]: [o que cobre testes passando? quantos?]
- [arquivo de teste]: [o que cobre]

**Pendências de teste (se houver):**
- [item]: [por que ainda não testado motivo válido?]

**Comando para rodar:** `npm run test [escopo se houver]`

## Alertas e Próximo agente

**Alertas para o próximo agente:**
- ⚠️ [algo que o próximo precisa saber antes de agir]

**contexto-base desatualizado?**
- [ ] Não nenhuma mudança estrutural
- [ ] Sim seções afetadas: [lista]
  → Chamar `documentador-tecnico` antes de continuar

**PRÓXIMO AGENTE: [nome-do-agente]**
**Por quê:** [motivo em 1 linha]
**O que ele deve fazer:** [instrução direta de 1-3 linhas]

---
*Para continuar: abra o arquivo relevante e diga:*
*"@workspace Como [próximo agente], leia SESSAO-ATIVA.md e continue"*
```

> ⚠️ A seção `## Testes` é **obrigatória** em todo handoff, mesmo que o agente não escreva testes diretamente. Agentes que não testam (ex: `tradutor-figma`, `documentador-tecnico`) declaram "N/A esta task não produz código testável" e o motivo. Isso evita silêncio sobre cobertura.

---

## Regra 4 Verificação de Desatualização do contexto-base

A cada ação concluída, o agente verifica:

| O que mudou | Seção do contexto-base afetada |
|---|---|
| Nova pasta criada | "Estrutura Real de Pastas" |
| shadcn instalado | "Componentes shadcn Mapeados" |
| Nova rota | "Rotas Definidas" |
| Nova regra de negócio | "Regras de Negócio Críticas" |
| Novo arquivo de referência em `docs/` | "Documentação de Referência" |
| Política de testes alterada | "Política de Testes" / `docs/protocolo-testes.md` |

> 📌 Status de tasks **NÃO** mais é registrado no `contexto-base`. Ele vive em `docs/Tasks.md` (operacional), `docs/roadmap.md` (estratégico) e `docs/historico/tasks-concluidas.md` (histórico). Não duplicar.

Se qualquer item acima mudou → registrar no handoff e indicar `documentador-tecnico` como próximo (ou como passo paralelo antes do próximo agente de desenvolvimento).

O agente NÃO atualiza o `contexto-base` sozinho. Ele registra o que mudou e pede autorização:

```markdown
**Atualização necessária no contexto-base:**
Seção "Estrutura Real de Pastas" criado src/hooks/useRegistroRodagem.ts
Seção "Rotas Definidas" adicionada `/registros/abastecimento`

Posso atualizar agora, ou prefere que o documentador-tecnico faça?
```

---

## Regra 5 Status de Tasks

O `docs/Tasks.md` usa os seguintes status:

| Símbolo | Significado |
|---|---|
| `[ ]` | Pendente |
| `[~]` | Em desenvolvimento |
| `[x]` | Concluído (passou nos testes se task com marco) |
| `[T]` | Testes passando (confirmado pelo qa-engineer) |
| `[!]` | Concluído com ressalvas (ver observações) |
| `[✗]` | Cancelado ou bloqueado |

Fluxo normal: `[ ]` → `[~]` → `[x]` → `[T]` (se task com marco de teste)

---

## Regra 6 O Que o Próximo Agente Faz ao Ser Chamado

```
1. Ler SESSAO-ATIVA.md entender o contexto completo
2. Ler contexto-base confirmar estado do projeto
3. Confirmar para o dev: "Entendi. Vou [descrição do que vai fazer]"
4. Agir conforme o handoff indica (e seguir Regra 1 ao iniciar)
5. Ao terminar: seguir Regra 3 (Ritual de Arquivamento completo)
```

Nunca começar sem ler o `SESSAO-ATIVA.md`. O handoff anterior contém o contexto que elimina perguntas desnecessárias.
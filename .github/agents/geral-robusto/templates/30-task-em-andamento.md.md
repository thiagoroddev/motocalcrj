---

description: "Template para tarefa em andamento. Copie a estrutura, preencha conforme a tarefa, mantenha atualizado durante a execução." modulo: "30" categoria: "templates" versao: "1.0" arquivo_destino: "docs/tarefas/em-andamento.md" relacionado:

- "20-ciclo-tarefa.md"

---

# 📝 Template: Tarefa em Andamento

> **Arquivo destino:** `docs/tarefas/em-andamento.md` **Quando usar:** ao mover uma tarefa de `pendentes.md` para iniciar execução (modo Standard ou Strict). Para modo Light, pular este template — registro vai direto no chat/commit.

---

## Como Usar Este Template

1. **Copie** o bloco de exemplo abaixo
2. **Cole** no final do arquivo `docs/tarefas/em-andamento.md` (várias tarefas podem coexistir; cada uma é um bloco)
3. **Preencha** o cabeçalho com os dados da tarefa
4. **Atualize** a seção `## Execução` em tempo real conforme a tarefa progride
5. **Registre bloqueios** com a estrutura indicada
6. Ao terminar, **mova o bloco** para um arquivo próprio em `docs/tarefas/concluidas/` (ver [template 31](https://claude.ai/chat/31-task-concluida.md))

---

## Estrutura Completa (Exemplo Preenchido)

Use este exemplo como referência. Os valores são fictícios mas realistas.

```markdown
# TASK-RF-005.1 — Registros: lista e sub-abas

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Data início:** 13/05/26 12:39
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RF-REG-01, RF-REG-02, ADR-2, DT-14
- **Observações:** Bloqueada anteriormente esperando definição de paginação. Pode prosseguir agora.

## Planejamento Aprovado

**O que muda:**
- `src/types/registro.ts`: criar tipo Registro com 3 estados (CONCLUIDO, EM_DIA, PROXIMO)
- `src/hooks/useRegistros.ts`: novo hook com estado de filtro + paginação cursor
- `src/components/registros/CardRegistro.tsx`: card visual com estados
- `src/components/registros/ListaRegistros.tsx`: lista paginada
- `src/components/registros/SubAbas.tsx`: filtro por status
- `src/pages/PaginaRegistros.tsx`: composição

**Critérios de aceite:**
- Lista carrega 20 registros por página
- Filtro por status funciona (CONCLUIDO/EM_DIA/PROXIMO)
- Loading mostra skeleton, vazio mostra EstadoVazio
- Testes verdes para hook e componentes

**Impacto:** apenas o módulo `registros/`. Não toca outras features.
**Riscos:** API de paginação ainda não testada com dados reais. Mitigação: testes com mocks + validação manual no fim.
**Dependências novas:** nenhuma.

## Execução

- 13/05/26 12:45: Plano aprovado pelo humano
- 13/05/26 13:00: Iniciada implementação do tipo Registro
- 13/05/26 13:30: types/registro.ts concluído com schema Zod
- 13/05/26 14:15: Hook useRegistros inicial implementado (sem paginação)
- 13/05/26 15:00: Adicionando paginação cursor
- 13/05/26 15:45: Paginação funcionando com dados mockados
- 13/05/26 16:00: Iniciando componentes de UI

## Decisões Tomadas

- **Cursor pagination em vez de offset:** API só suporta cursor; ADR-008 documenta a escolha técnica.
- **Estado `PROXIMO` mostra contador de dias restantes:** decisão validada com humano às 14:30.

## O que NÃO foi feito (e por quê)

- **Animação de transição entre páginas:** fora do escopo aprovado. Anotada como TASK-REF-08 em pendentes.
- **Exportar lista como CSV:** mencionado no Figma mas não estava nos critérios de aceite. Confirmar com humano se entra agora ou vira tarefa nova.
  
## Testes
- `1º npm run test`: 82 verdes 
  
  
```

---

## Template Vazio (Para Copiar)

```markdown
# TASK-[PREFIXO]-[NUMERO] — [Título]

- **Status:** EM DESENVOLVIMENTO
- **Modo:** [Standard / Strict]
- **Valor:** [Crítico / Importante / Desejável]
- **Urgência:** [Imediata / Normal]
- **Esforço-H/IA:** [P/M/G/XG]/[P-IA/M-IA/G-IA/XG-IA] — formato: `H/IA` (ex: `G/M`)
- **Data origem:** DD/MM/AA HH:MM
- **Data início:** DD/MM/AA HH:MM
- **Dependências:** [TASK-IDs separados por vírgula, ou `—`]
- **REQ/ADR/DT:** [referências relacionadas, ou `—`]
- **Observações:** [contexto adicional, ou `—`]

## Planejamento Aprovado

**O que muda:**
- `caminho/arquivo1.ts`: [descrição em 1-2 linhas]
- `caminho/arquivo2.tsx`: [descrição]

**Critérios de aceite:**
- [como saber que está pronto]
- [item específico verificável]

**Impacto:** [módulos afetados]
**Riscos:** [o que pode dar errado + mitigação]
**Dependências novas:** [libs novas a instalar, ou `nenhuma`]

## Execução

- DD/MM/AA HH:MM: [evento registrado]

## Decisões Tomadas

- [decisão]: [motivo / referência ADR]

## O que NÃO foi feito (e por quê)

- [item descartado]: [motivo]
  
## Testes
- `1º npm run test`: [quantidade de testes passando antes de aplicar a tarefa]
```

---

## Variante 1: Tarefa Bloqueada

Quando a tarefa bloqueia, **continue no mesmo bloco** e adicione uma seção de bloqueio:

```markdown
## Bloqueio em DD/MM/AA HH:MM

**O que tentei:** [descrição do que foi feito]
**Por que não funcionou:** [causa raiz identificada]
**O que preciso:** [decisão / informação / ajuda]
**Aguardando:** [humano / dependência externa / definição de stakeholder]
```

### Após 2 Tentativas Sem Sucesso

Conforme regra do núcleo, pare e peça orientação:

```markdown
## Bloqueio em DD/MM/AA HH:MM (após 2 tentativas)

**Tentativa 1 (HH:MM):** [o que tentei]
**Por que falhou:** [causa]

**Tentativa 2 (HH:MM):** [outra abordagem]
**Por que falhou:** [causa]

**Conclusão:** Não consigo resolver sozinho. Pedi orientação ao humano.
**Aguardando:** [resposta]
```

---

## Variante 2: Retomando Após Pausa Longa

Se a tarefa pausou por mais de algumas horas e você retoma, registre explicitamente:

```markdown
## Retomada em DD/MM/AA HH:MM

**Pausada em:** DD/MM/AA HH:MM
**Motivo da pausa:** [bloqueio externo / fim do expediente / outra tarefa urgente]
**Estado atual:** [o que estava feito; o que falta]
**Próximo passo:** [primeiro passo ao retomar]
```

Isso evita o problema clássico de "voltar e não lembrar onde parou".

---

## Variante 3: Tarefa Strict (Com ADR)

Para tarefas em modo Strict, adicione referência à ADR antes do Planejamento:

```markdown
## ADR Vinculada

- **ADR-008:** [Título da ADR] — `docs/arquitetura/ADR/ADR-008.md`
- **Status da ADR:** [Proposta / Aprovada]

⚠️ Implementação aguarda aprovação da ADR. Se ADR ainda em status "Proposta", **não codar**.
```

---

## Múltiplas Tarefas no Mesmo Arquivo

`em-andamento.md` pode conter **várias tarefas simultaneamente** (até o limite de 3 do módulo 20).

Separe blocos com `---` e empilhe na ordem em que iniciaram:

```markdown
# TASK-RF-5.1 — [Título]
[cabeçalho + execução]

---

# TASK-BG-12 — [Título]
[cabeçalho + execução]

---

# TASK-RF-5.2 — [Título]
[cabeçalho + execução]
```

Para terminar uma, **remova o bloco inteiro** (com o `---` anterior se for o caso) e crie o arquivo correspondente em `concluidas/`.

---

## Mini-FAQ

**1. Posso editar o Planejamento depois de aprovado?** Mudanças pequenas (ajustes táticos) registre na seção `## Execução` com explicação. Mudanças grandes (redesign do que vai fazer) exigem nova aprovação do humano — volte ao passo PLANEJAR.

**2. Preciso registrar todo commit?** Não. Registre eventos significativos: aprovação, conclusão de etapa, bloqueio, decisão, retomada. Commit triviais (formatação, ajuste de nome) não precisam.

**3. E se a tarefa não tem dependências, REQ/ADR ou observações?** Use `—` (travessão) na linha do cabeçalho. **Não remova** a linha — manter a estrutura consistente facilita leitura entre tarefas.

**4. Como sei qual `Esforço-IA` colocar?** Veja [módulo 20, seção 3.4](https://claude.ai/processos/20-ciclo-tarefa.md#34-esfor%C3%A7o-para-ia). Critério rápido: P-IA = 1-2 arquivos; M-IA = 2-5; G-IA = 5-12; XG-IA = 12+ (quebrar).

**5. Tarefa Imediata também usa este template?** Sim. A diferença Normal vs Imediata é **só no `pendentes.md`** (linha de tabela vs bloco). Quando vai para em-andamento, ambas usam este formato.

**6. E se eu cancelar a tarefa antes de concluir?** Mova o bloco para `concluidas/` com `**Status: CANCELADA**` e documente o motivo na seção "O que NÃO foi feito". Veja [módulo 20, seção 10.4](https://claude.ai/processos/20-ciclo-tarefa.md#104-tarefa-cancelada).

---

## 🔗 Templates e Módulos Relacionados

- [`../processos/20-ciclo-tarefa.md`](https://claude.ai/processos/20-ciclo-tarefa.md) — Processo completo do ciclo
- [`31-task-concluida.md`](https://claude.ai/chat/31-task-concluida.md) — Template do próximo estágio
- [`32-adr.md`](https://claude.ai/chat/32-adr.md) — Para tarefas Strict que geram ADR
- [`../processos/21-revisao-codigo.md`](https://claude.ai/processos/21-revisao-codigo.md) — Revisão antes de concluir
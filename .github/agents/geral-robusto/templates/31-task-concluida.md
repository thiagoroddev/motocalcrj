---

description: "Template para tarefa concluída. Arquivo imutável de registro histórico. Auto-suficiente para leitura futura." modulo: "31" categoria: "templates" versao: "1.0" arquivo_destino: "docs/tarefas/concluidas/[TASK-PREFIXO]-[NUMERO]-[AAAA-MM-DD]-[HHhMM].md" relacionado:

- "30-task-em-andamento.md"
- "20-ciclo-tarefa.md"
- "21-revisao-codigo.md"
- "27-revisao-geral.md"

---

# 📝 Template: Tarefa Concluída

> **Arquivo destino:** `docs/tarefas/concluidas/[TASK-PREFIXO]-[NUMERO]-[DATA]-[HORA].md` Exemplo: `docs/tarefas/concluidas/TASK-RF-5.1-2026-05-13-17h30.md` **Quando usar:** ao terminar uma tarefa Standard ou Strict, **após** passar pelos critérios da [seção 5.2 do módulo 20](https://claude.ai/processos/20-ciclo-tarefa.md#52-crit%C3%A9rios-para-concluir). Para modo Light, pular este template - registro vai direto no commit.

---

## Princípio: Imutabilidade

Arquivos em `concluidas/` são **registros históricos**. Depois de criar:

- ✅ Pode corrigir erro óbvio (typo, link quebrado)
- ❌ Não reabrir para continuar trabalho - crie tarefa nova
- ❌ Não reescrever decisões depois ("achei que fosse melhor outra")

Se o trabalho continua, é **nova tarefa**. Esta arquivada documenta o que foi feito **naquele momento**.

---

## Como Usar Este Template

1. **Confirme** que a tarefa cumpre os critérios da seção 5.2 do módulo 20:
    - [ ] Testes passam
    - [ ] Auto-revisão feita (ou `N/A` com motivo)
    - [ ] Critérios de aceite cumpridos
    - [ ] Documentação atualizada
2. **Crie** o arquivo em `docs/tarefas/concluidas/` com o nome no formato indicado: [DATA]-[HORA]-[TASK-PREFIXO-XXX].md
3. **Registre** a conclusão da tarefa no índice de tarefas concluídas em dosc/tarefas/concluidas/0-indice-concluidas.md em ordem cronológica
4. **Copie** o bloco de em-andamento (cabeçalho + planejamento + execução + decisões + "o que não foi feito") para o arquivo único da tarefa concluída que foi criado
5. **Adicione** as seções finais (Conclusão, Revisão, Tarefas geradas, Requisitos gerados, ADRs, Testes, Aprendizados)
6. **Remova** o bloco de `em-andamento.md`
7. **Atualize** `docs/requisitos/` se a tarefa muda status de algum requisito
8. **Adicione** tarefas novas geradas por esta em `pendentes.md`
9. **Registre** dívidas geradas em `docs/dominios/divida-tecnica.md`


A ordem importa. Ver detalhes em [módulo 20, seção 5.4](https://claude.ai/processos/20-ciclo-tarefa.md#54-transi%C3%A7%C3%A3o-em-andamento--conclu%C3%ADda).

---


## Template  do docs/tarefas/concluidas/indice-concluidas.md

Lista cronológica das tarefas concluídas. Cada linha aponta para o arquivo completo da tarefa.

[TASK-PREFIXO-NUMERO] | [TITULO DESCRITIVO] | [(LINK CLICÁVEL PARA O ARQUIVO ÚNICO)]

Exemplos preenchidos ilustrativos:

TASK-DOM-1 | Atualização da modelagem de domínio | [[](./2026-05-10-TASK-DOM-1.md)]
TASK-DOM-2 | Ajustes referências v6 e refistro de DT-14 | [[](./2026-05-11-TASK-DOM-2.md)]
TASK-REF-03 | Instalar shadcn/ui e criar wrappers em components/ui | [[](./2026-05-16--20h21--TASK-REF-03.md)]

---
## Estrutura Completa dos arquivos únicos (Exemplo Preenchido)

Continuação da TASK-RF-5.1 que foi mostrada no template 30. Agora concluída.

```markdown
# TASK-RF-005.1 - Registros: lista e sub-abas

- **Status:** Concluído
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 10/05/26 09:39
- **Data início:** 13/05/26 12:39
- **Data conclusão:** 13/05/26 17:30
- **Dependências:** TASK-RF-21
- **REQ/ADR/DT:** RF-REG-01, RF-REG-02, ADR-2, ADR-8, DT-14
- **Observações:** Bloqueada anteriormente esperando definição de paginação. Concluída na 2ª tentativa.

## Planejamento Aprovado

**O que muda:**
- `src/types/registro.ts`: criar tipo Registro com 3 estados (CONCLUIDO, EM_DIA, PROXIMO)
- `src/hooks/useRegistros.ts`: novo hook com estado de filtro + paginação cursor
- `src/components/registros/CardRegistro.tsx`: card visual com estados
- `src/components/registros/ListaRegistros.tsx`: lista paginada
- `src/components/registros/SubAbas.tsx`: filtro por status
- `src/pages/PaginaRegistros.tsx`: composição

**Critérios de aceite:**
- Lista carrega 20 registros por página ✅
- Filtro por status funciona ✅
- Loading mostra skeleton, vazio mostra EstadoVazio ✅
- Testes verdes para hook e componentes ✅

**Impacto:** apenas o módulo `registros/`.
**Riscos:** API de paginação ainda não testada com dados reais.
**Dependências novas:** nenhuma.

## Execução

- 13/05/26 12:45: Plano aprovado pelo humano
- 13/05/26 13:00: Iniciada implementação do tipo Registro
- 13/05/26 13:30: types/registro.ts concluído com schema Zod
- 13/05/26 14:15: Hook useRegistros inicial implementado (sem paginação)
- 13/05/26 15:00: Adicionando paginação cursor
- 13/05/26 15:45: Paginação funcionando com dados mockados
- 13/05/26 16:00: Iniciando componentes de UI
- 13/05/26 16:30: CardRegistro e ListaRegistros prontos
- 13/05/26 17:00: SubAbas e composição na PaginaRegistros
- 13/05/26 17:15: Rodando testes, 2 falharam (mocks desatualizados)
- 13/05/26 17:25: Mocks corrigidos, todos os testes verdes
- 13/05/26 17:30: Auto-revisão concluída

## Decisões Tomadas

- **Cursor pagination em vez de offset:** API só suporta cursor. Documentada em ADR-008.
- **Estado `PROXIMO` mostra contador de dias restantes:** validado com humano às 14:30.
- **CardRegistro não tem ação de clique:** decidido com humano às 16:15. Detalhe abre em outra tela (TASK-RF-5.2, futura).

## O Que NÃO Foi Feito (e Por Quê)

- **Animação de transição entre páginas:** fora do escopo aprovado. Anotada como TASK-REF-08 em pendentes.
- **Exportar lista como CSV:** mencionado no Figma mas não estava nos critérios. Confirmado com humano que vira tarefa nova (TASK-RF-5.3).
- **Refresh manual da lista:** decidido adiar - paginação cursor já busca dados novos automaticamente.
  
## Testes

- `1º npm run test`: 84 verdes
- **Novos:** `useRegistros.test.ts` (5 testes: estado inicial, filtro, paginação, vazio, erro)
- **Modificados:** `cardRegistro.test.ts` (1 teste atualizado para nova prop `estado`)
- último npm run test`: 89 verdes

## Revisão

### Modo
Auto-revisão IA + validação humana

### ✅ Bom
- Hook `useRegistros` segue padrão do módulo 12 com interface mínima
- Componente `CardRegistro` aceita `className` corretamente
- Tipo Registro derivado do schema Zod (módulo 14)
- Testes cobrem caminho feliz + filtros + estado vazio

### 🟡 Importante
**ExibicaoEstrelas inline no CardRegistro**
- Onde: `src/components/registros/CardRegistro.tsx` linhas 23-31
- Problema: lógica de renderização de estrelas dentro do card. Provavelmente vai ser reutilizada.
- Tarefa gerada: TASK-REF-09 (Regra de Três aparecerá em breve em CardAvaliacao)

### 🟢 Sugestão
- Considerar extrair `formatadorDeDataRelativa` para `utils/formatters.ts` se aparecer em mais 1 lugar

### Veredito
APROVADO COM RESSALVAS - TASK-REF-09 gerada como melhoria não-bloqueante.

## Tarefas Geradas pela Revisão

- TASK-REF-09: Extrair ExibicaoEstrelas para components/ui/ (gatilho: Regra de Três)
- TASK-REF-08: Animação de transição entre páginas (anotada durante execução, não na revisão)
- TASK-RF-5.3: Exportar lista como CSV (anotada durante execução)

## Requisitos Gerados pela Revisão

- - (nenhum requisito novo)

## ADRs Geradas

- ADR-008: Paginação cursor para listas grandes (criada antes da execução, vinculada)



## Aprendizados Para o Projeto

- **Cursor pagination não é mais complexo que offset quando bem encapsulado em hook.** Considerar como padrão para listas futuras.
- **Mocks de API quebraram silenciosamente** ao adicionar campos no tipo. Vale revisar se há outros testes com mocks desatualizados.
- **Estado `PROXIMO` com dias restantes** ficou bem; padrão pode ser reutilizado em outras telas com prazos.
```

---

## Template Vazio (Para Copiar)

```markdown
# TASK-[PREFIXO]-[NUMERO] - [Título]

- **Status:** Concluído
- **Modo:** [Standard / Strict]
- **Valor:** [Crítico / Importante / Desejável]
- **Urgência:** [Imediata / Normal]
- **Esforço-H/IA:** [P/M/G/XG]/[P-IA/M-IA/G-IA/XG-IA]
- **Data origem:** DD/MM/AA HH:MM
- **Data início:** DD/MM/AA HH:MM
- **Data conclusão:** DD/MM/AA HH:MM
- **Dependências:** [TASK-IDs, ou `-`]
- **REQ/ADR/DT:** [referências, incluindo `REV-NNN-Axx` se veio de revisão geral, ou `-`]
- **Observações:** [contexto adicional, ou `-`]

## Planejamento Aprovado

[Copiado de em-andamento.md, sem alteração. Adicione ✅/❌ aos critérios de aceite conforme o resultado.]

## Execução

[Log completo copiado de em-andamento.md, sem alteração.]

## Decisões Tomadas

- [decisão]: [motivo / referência ADR]

## O Que NÃO Foi Feito (e Por Quê)

- [item descartado]: [motivo]


## Testes

- `1º npm run test`: 84 verdes
- **Novos:** `useRegistros.test.ts` (5 testes: estado inicial, filtro, paginação, vazio, erro)
- **Modificados:** `cardRegistro.test.ts` (1 teste atualizado para nova prop `estado`)
- último npm run test`: 89 verdes

## Revisão

### Modo
[Auto-revisão IA / Auto-revisão IA + validação humana / Revisão humana completa]

### ✅ Bom
- [algo que ficou bem feito - sempre liste algo, não deixe vazio]

### 🔴 Bloqueante
[Se houver. Senão, omita esta subseção. Bloqueante impede conclusão - se chegou aqui, foi corrigido]

### 🟡 Importante
**[Título do problema, se houver]**
- Onde: `arquivo.tsx` linha X
- Problema: [descrição]
- Tarefa gerada: TASK-[PREFIXO]-XXX

### 🟢 Sugestão
- [melhoria opcional, se houver]

### Veredito
[APROVADO / APROVADO COM RESSALVAS / REPROVADO]


## Tarefas Geradas pela Revisão

- TASK-[PREFIXO]-XXX: [descrição]
- (ou `- (nenhuma tarefa gerada)`)

## Requisitos Gerados pela Revisão

- [RF/RN/RNF]-XXX: [descrição] (adicionado em `docs/requisitos/...`)
- (ou `- (nenhum requisito gerado)`)

## ADRs Geradas

- ADR-XXX: [título]
- (ou `- (nenhuma ADR gerada)`)


## Aprendizados Para o Projeto

- [lição destilada para o futuro - não copia execução; destila padrão útil]
```

---

## Variante 1: Tarefa Cancelada

Tarefa começou mas decidiu-se não fazer. Ainda assim gera arquivo concluído (com status diferente):

```markdown
# TASK-RF-XXX - [Título]

- **Status:** CANCELADA
- **Modo:** [original]
- **Valor:** [original]
- **Urgência:** [original]
- **Esforço-H/IA:** [original]/[original]
- **Data origem:** [original]
- **Data início:** [original]
- **Data conclusão:** [data do cancelamento]
- **Dependências:** [original]
- **REQ/ADR/DT:** [original]
- **Observações:** Tarefa cancelada - ver "O Que NÃO Foi Feito"

## Planejamento Aprovado
[O que estava planejado, mesmo que não tenha sido feito]

## Execução
[Log até o ponto do cancelamento]

## Decisões Tomadas
- **Cancelar a tarefa:** [motivo da decisão]

## O Que NÃO Foi Feito (e Por Quê)
- **Tudo a partir do dia X:** [motivo do cancelamento - escopo mudou? prioridade caiu? bug encontrado tornou o trabalho inútil?]
  
## Testes
- `1º npm run test`: 84 verdes

## Revisão
N/A - Tarefa cancelada antes da conclusão.

## Tarefas Geradas pela Revisão
- (se cancelamento gerou nova tarefa, listar aqui)

## Aprendizados Para o Projeto
- [o que aprendemos com este cancelamento, para evitar similar no futuro]
```

---

## Variante 2: Tarefa Light (Revisão N/A)

Tarefas Light **não usam este template** - registro vai direto no commit. Mas se por algum motivo for criada (consistência de histórico), a Revisão fica:

```markdown
## Revisão
N/A - Mudança trivial: [especificar - ex: "correção de typo na linha 42 do README, sem impacto funcional"].
```

A regra: **N/A é aceitável, silêncio não**. Sempre justifique.

---

## Variante 3: Hotfix

Bug crítico em produção corrigido fora do fluxo normal:

```markdown
# TASK-BG-XXX - [Título]

- **Status:** Concluído
- **Modo:** Hotfix
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** [P-M]/[P-M] (hotfix grande é sinal de problema profundo)
- **Data origem:** [data da detecção]
- **Data início:** [imediata]
- **Data conclusão:** [imediata após correção]
- **Observações:** Hotfix - bug afetando produção, contornou fluxo normal de tarefas

## Testes
- `1º npm run test`: 62 verdes - 22 falhando

## Contexto do Hotfix
- **Bug:** [descrição do problema observado]
- **Impacto:** [quantos usuários, qual feature]
- **Detectado por:** [como foi descoberto]

## Execução
- HH:MM: Diagnóstico - causa raiz identificada
- HH:MM: Correção aplicada
- HH:MM: Deploy em produção
- HH:MM: Validado em produção

## Decisões Tomadas
- **Corrigir antes de testes completos:** risco aceito porque [motivo]

## Revisão
[Hotfix exige revisão, mesmo que rápida. Não pule]

## Pós-mortem
[Se o bug foi grave (afetou muitos usuários ou dados), considere criar pós-mortem detalhado: causa raiz profunda, por que escapou dos testes, o que mudar no processo. Salvar em `docs/pos-mortem/` ou seção dedicada nesta tarefa]

## Tarefas Geradas
- TASK-TEST-XX: Adicionar teste para o caso que causou este bug
- TASK-REF-XX: Refatorar área correlata se houver risco recorrente
```

---

## Variante 4: Tarefa Strict com ADR Vinculada

Tarefa modo Strict gerou uma ADR durante o processo:

```markdown
## ADRs Geradas

- **ADR-XXX:** [Título da ADR] - `docs/arquitetura/ADR/ADR-XXX.md`
- **Decisão central da ADR:** [resumo de 1-2 linhas do que foi decidido]
- **Implementada nesta tarefa:** Sim
```

E na seção "Decisões Tomadas":

```markdown
## Decisões Tomadas

- **[Decisão principal]:** documentada em ADR-XXX. Implementação aqui aplica a decisão.
- **[Decisões táticas durante implementação]:** [se houver]
```

A ideia: a ADR é a **decisão estratégica**; a tarefa é a **implementação dela**. As duas se referenciam.

---

## Mini-FAQ

**1. Como nomeio o arquivo se a hora exata varia?** Use a hora em que você **terminou de criar o arquivo** (não a hora do último commit). Formato `HHhMM`, ex: `17h30`.

**2. E se eu esquecer de criar o arquivo no fim da execução?** Crie quando lembrar. Use a hora real de conclusão (não a hora atual). Anote na seção "Execução" a discrepância: _"Arquivo criado em DD/MM/AA HH:MM, mas tarefa foi concluída em DD/MM/AA HH:MM."_

**3. Posso editar este arquivo depois de criado?** Apenas correções óbvias (typo, link quebrado, formatação). Mudanças de conteúdo = nova tarefa que referencia esta.

**4. O que vai em "Aprendizados Para o Projeto"?** Não copia execução. Destila lições: padrões que valem reusar, armadilhas a evitar, decisões que viraram boas. Se não houve aprendizado relevante, use `- (sem aprendizado destilável desta tarefa)`. Não invente para preencher.

**5. E se a revisão revelou bloqueante que voltei para corrigir?** Não chegue aqui com bloqueante aberto. Bloqueante → volta para em-andamento → corrige → volta para revisão → se aprovado, então conclui. A seção "Revisão" deste arquivo deve mostrar **a revisão final que aprovou**.

**6. Como linkar de outra tarefa para esta?** Use o caminho relativo: `[ver TASK-RF-5.1](../concluidas/TASK-RF-5.1-2026-05-13-17h30.md)`. Em texto corrido, basta citar o ID - quem precisa busca pelo prefixo no diretório.

**7. Se a tarefa não gerou nada (sem novas tarefas, sem ADRs, sem requisitos), preciso manter as seções vazias?** Sim. Mantenha a seção com `- (nenhuma tarefa gerada)` (ou equivalente). Manter estrutura facilita leitura comparativa entre tarefas.

**8. Como registrar tarefa criada por revisão geral?** Inclua `REV-NNN-Axx` em `REQ/ADR/DT` ou nas observações da tarefa. A REV correspondente também precisa listar esta tarefa no achado que a gerou. REV só existe quando o humano pediu revisão completa do projeto.

---

## 🔗 Templates e Módulos Relacionados

- [`30-task-em-andamento.md`](https://claude.ai/chat/30-task-em-andamento.md) - Template do estágio anterior
- [`32-adr.md`](https://claude.ai/chat/32-adr.md) - Para tarefas que geram ADR
- [`../processos/20-ciclo-tarefa.md`](https://claude.ai/processos/20-ciclo-tarefa.md) - Processo completo
- [`../processos/21-revisao-codigo.md`](https://claude.ai/processos/21-revisao-codigo.md) - Como conduzir a revisão antes de concluir
- [`../processos/27-revisao-geral.md`](https://claude.ai/processos/27-revisao-geral.md) - Origem `REV-NNN-Axx` para tarefas geradas por revisão geral

---
description: "Checklist principal de revisão de código. Versão essencial (sempre) + completa por dimensão. Aponta para checklists especializados."
modulo: "40"
categoria: "checklists"
versao: "1.0"
relacionado:
  - "21-revisao-codigo.md"
  - "27-revisao-geral.md"
  - "41-seguranca.md"
  - "42-acessibilidade.md"
  - "43-performance.md"
---

# ✅ Checklist: Revisão Rápida de Código

> Lista acionável de **o que verificar** durante revisão. Para entender **como** conduzir a revisão (níveis, formato, vereditos), ver [módulo 21](../processos/21-revisao-codigo.md). Este checklist é o **master**: aponta para checklists especializados em segurança, acessibilidade e performance.

---

## Como Usar

### Estrutura

O checklist tem duas profundidades:

|Profundidade|Quando aplicar|Itens|
|---|---|---|
|**Essencial**|Toda mudança que não seja Light|~15 itens|
|**Completo**|Mudança Standard relevante ou Strict|Essencial + grupos por dimensão|
|**Revisão Geral**|Somente quando o humano pedir revisão completa do projeto|Essencial + grupos relevantes, registrado em `REV-NNN.md`|

Para mudanças Light (typo, formatação isolada), você não precisa nem deste checklist - `N/A - mudança trivial` na revisão basta.

### Marcação

Para cada item:

- `[x]` - cumpre
- `[ ]` - não cumpre (vira **achado** na revisão)
- `[~]` - parcialmente cumpre / com exceção (precisa justificar)
- `[N/A]` - não se aplica a esta mudança

Itens marcados `[ ]` viram achados classificados conforme [módulo 21](../processos/21-revisao-codigo.md#6-os-3-n%C3%ADveis-de-achados):

- 🔴 Bloqueante (impede merge/conclusão)
- 🟡 Importante (vira tarefa para curto prazo)
- 🟢 Sugestão (opcional)

---

## Versão Essencial

> Sempre roda em mudança Standard ou Strict. Pega 80% dos problemas com 20% do esforço.

### Antes de Tudo

- [ ] Os testes da suíte passam (`npm run test`)?
- [ ] O typecheck passa (`npm run typecheck`)?
- [ ] O lint passa (`npm run lint`)?

Se algum desses falha, **pare**. Não é momento de revisar - é momento de consertar.

### Convenções Críticas

- [ ] Idioma consistente com o projeto (PT ou EN, sem mistura)?
- [ ] Nomenclatura segue o padrão (camelCase para funções, PascalCase para componentes)?
- [ ] Nenhum `any` sem comentário justificando?
- [ ] Imports usam o padrão configurado (`@/` absoluto, se for o caso)?

### Estrutura

- [ ] Arquivos foram criados nas pastas corretas conforme [módulo 11](../padroes/11-arquitetura-e-pastas.md)?
- [ ] Componentes específicos de domínio NÃO estão em `components/ui/`?

### Comportamento

- [ ] Invariantes documentadas são respeitadas?
- [ ] Não há `console.log` esquecido (especialmente com dados sensíveis)?
- [ ] Tratamento de erro existe para operações que podem falhar?

### Segurança Essencial

- [ ] Nenhum dado pessoal (PII) em URL?
- [ ] Nenhum `dangerouslySetInnerHTML` sem DOMPurify?
- [ ] Storage (localStorage etc.) acessado apenas via serviço isolado?
- [ ] Nenhuma variável de ambiente ou segredo hardcoded?

### Acessibilidade Essencial

- [ ] Inputs têm `<label>` visível associado?
- [ ] Elementos interativos são acessíveis por teclado?
- [ ] Imagens significativas têm `alt`?

**Cumpriu todos os essenciais?** Para Standard simples, está bom para concluir. Para Strict ou mudança grande, prossiga para a versão completa.

---

## Versão Completa por Dimensão

Aplique os grupos relevantes para a mudança. Nem todos se aplicam a toda revisão.

### 1. Convenções e Estilo

Detalhes: [módulo 10](../padroes/10-codigo-e-convencoes.md).

- [ ] Idioma 100% consistente (variáveis, funções, comentários, testes)
- [ ] Booleans com prefixo `is`/`has`/`tem`/`eh` conforme convenção do projeto
- [ ] Funções com 5+ parâmetros usam objeto de opções
- [ ] Sem números mágicos (`* 52`, `+ 0.05`) - constantes nomeadas
- [ ] Sem `else` quando `early return` é mais claro
- [ ] Sem comentários redundantes (`// soma a e b` em `a + b`)
- [ ] Comentários, quando existem, explicam **por quê**, não **o quê**
- [ ] Funções pequenas (idealmente até ~30 linhas)
- [ ] Componentes pequenos (até ~150 linhas)
- [ ] Sem código comentado deixado para "talvez voltar depois"

### 2. Arquitetura e Pastas

Detalhes: [módulo 11](../padroes/11-arquitetura-e-pastas.md).

- [ ] Componentes em `components/ui/` são genéricos (sem conhecer domínio)
- [ ] Componentes em `components/[domínio]/` não vivem em `ui/`
- [ ] Componentes em `components/layout/` lidam só com estrutura
- [ ] Pages são predominantemente JSX de composição
- [ ] Lógica de estado mora em `hooks/`, não na page
- [ ] Acesso a backend isolado em `services/` ou `api/`
- [ ] Acesso a storage (localStorage, IndexedDB) isolado em `services/`
- [ ] Tipos compartilhados moram em `types/`
- [ ] Constantes globais em `data/` ou `config/`

### 3. React e Estado

Detalhes: [módulo 12](../padroes/12-react-e-estado.md).

- [ ] Nenhum `useEffect` para derivar estado (use `useMemo` ou cálculo direto)
- [ ] Nenhum `useEffect` para sincronizar entre `useState` (use single source of truth)
- [ ] Hooks customizados retornam objetos com nomes claros (não array, se muitos)
- [ ] Hooks de feature têm interface mínima (só o que JSX consome)
- [ ] `useCallback` usado onde faz sentido (props para memoizados, dependências de hooks)
- [ ] `useMemo` usado para cálculos caros (não em `a + b`)
- [ ] Keys de listas são estáveis e únicas (não `index` em lista que muda)
- [ ] Componente não monta efeitos que deveriam estar em hooks ou services
- [ ] Estado mais profundo que necessário foi elevado apenas até onde compartilhado
- [ ] Sem mutação direta de state (`array.push`, `obj.x = y`) - sempre imutabilidade

### 4. UI e Design System

Detalhes: [módulo 13](../padroes/13-ui-e-design-system.md).

- [ ] Componentes UI aceitam `className` como prop
- [ ] Componentes UI usam `forwardRef` quando envolvem elemento focável/input
- [ ] Tokens do design system usados (`bg-primary`, não `bg-blue-500`)
- [ ] Variantes declaradas explicitamente (`variant="primary"`, não props booleanos múltiplos)
- [ ] Componentes têm `displayName` quando usam `forwardRef`
- [ ] Sem styles inline (a menos que valor dinâmico justifique)
- [ ] Sem `!important` no Tailwind

### 5. Formulários e Validação

Detalhes: [módulo 14](../padroes/14-formularios-e-validacao.md).

- [ ] Schema Zod existe para o formulário
- [ ] Tipos derivados via `z.infer<typeof schema>` (não duplicação manual)
- [ ] `react-hook-form` integrado com `zodResolver`
- [ ] Mensagens de erro são amigáveis (não jargão técnico)
- [ ] `inputMode` apropriado em campos numéricos/email/tel
- [ ] `autoComplete` apropriado em campos de identidade/login
- [ ] Botão de submit desabilita durante envio
- [ ] Erros de servidor são tratados (não só validação client-side)

### 6. Testes

Detalhes: [módulo 15](../padroes/15-testes.md).

- [ ] Testes novos foram adicionados para nova funcionalidade
- [ ] Testes existentes foram atualizados se comportamento mudou
- [ ] Padrão AAA (Arrange-Act-Assert) seguido
- [ ] Testes testam **comportamento** (não implementação)
- [ ] Sem mock excessivo (mockou só o que precisa)
- [ ] Edge cases cobertos (vazio, máximo, null, erro)
- [ ] Nomenclatura de teste descritiva (`it('deve fazer X quando Y')`)
- [ ] Cobertura mínima do projeto mantida ou aumentada

### 7. Performance

Resumo aqui; checklist detalhado em [`43-performance.md`](./43-performance.md).

- [ ] Sem re-renders óbvios e desnecessários
- [ ] Imagens otimizadas (formato adequado, `loading="lazy"` quando aplica)
- [ ] Listas grandes têm paginação/virtualização (>100 itens)
- [ ] Sem requisições duplicadas
- [ ] Bundle não cresceu significativamente sem motivo

### 8. Acessibilidade

Resumo aqui; checklist detalhado em [`42-acessibilidade.md`](./42-acessibilidade.md).

- [ ] Foco visível em elementos interativos (`focus-visible:ring-*`)
- [ ] Toque mínimo respeitado (48×48px ou exceção documentada)
- [ ] Contraste AA mínimo (4.5:1 texto normal, 3:1 texto grande)
- [ ] `aria-*` correto onde aplica
- [ ] Componentes anunciam estados (loading, erro, sucesso) para screen reader
- [ ] Navegação por teclado funciona

### 9. Segurança

Resumo aqui; checklist detalhado em [`41-seguranca.md`](./41-seguranca.md).

- [ ] PII nunca em URL ou querystring
- [ ] Sanitização em qualquer HTML dinâmico
- [ ] Validação no servidor mesmo se há no cliente
- [ ] Storage não armazena tokens sem flag adequada
- [ ] Sem segredos hardcoded

### 10. Documentação

Detalhes: [módulo 20](../processos/20-ciclo-tarefa.md).

- [ ] Tarefa atualizada se mudou status de requisito
- [ ] `docs/dominios/divida-tecnica.md` atualizado se gerou dívida
- [ ] `docs/arquitetura/ADR/` se decisão arquitetural foi tomada
- [ ] `docs/contexto-projeto-ai.md` atualizado se mudou stack/decisão inegociável
- [ ] Comentários inline atualizados se comportamento mudou

---

## Reportando Resultado

Após rodar o checklist em uma tarefa, transcreva achados para o formato de revisão do [módulo 21, seção 7.1](../processos/21-revisao-codigo.md#71-estrutura).

Se, e somente se, o humano pediu revisão geral completa do projeto, transcreva os achados para `docs/arquitetura/revisoes-gerais/REV-NNN.md` usando [`../templates/37-revisao-geral.md`](../templates/37-revisao-geral.md). Nesse caso, cada achado recebe ID `REV-NNN-Axx` e relaciona tarefas/ADRs geradas quando existirem.

```markdown
## Revisão

### Modo
Auto-revisão IA + validação humana

### ✅ Bom
- [pontos que ficaram bem feitos - sempre liste algo]

### 🔴 Bloqueante
**[Título]**
- Onde: `arquivo.tsx` linha X
- Problema: [item do checklist marcado [ ] que é crítico]
- Solução: [como corrigir]

### 🟡 Importante
**[Título]**
- Onde: [...]
- Tarefa gerada: TASK-XXX

### 🟢 Sugestão
- [item do checklist em [~] com observação]

### Veredito
[APROVADO / APROVADO COM RESSALVAS / REPROVADO]
```

---

## Quando um Item Não Se Aplica

Marque `[N/A]` e, se não for óbvio, justifique:

```
- [N/A] Schema Zod existe - esta mudança não toca formulário
- [N/A] aria-live em loading - componente não tem estado de loading
- [N/A] testes de hook - não há hook novo
```

`[N/A]` honesto é melhor que checklist cheio de `[x]` mentirosos.

---

## Mini-FAQ

**1. Preciso rodar TODO o checklist em toda revisão?** Não. Versão essencial sempre. Versão completa para Strict ou mudança grande. Versão essencial cobre 80% dos casos.

**2. Quanto tempo dura uma revisão com este checklist?** Essencial: 5-10 minutos. Completa: 20-30 minutos. Se passar de 1 hora, o escopo da mudança é grande demais - divida.

**3. E se um item parece "subjetivo"?** Cada item deveria ter critério objetivo. Se você está em dúvida, marque `[~]` com observação. Algum item recorrentemente vago é candidato a refinar.

**4. Posso adicionar itens específicos do meu projeto?** Sim. Crie checklist próprio (ex: `docs/arquitetura/checklist-projeto.md`) com regras específicas. Este checklist do pacote é base, não limite.

**5. Quando NÃO usar este checklist?** Mudança Light (typo, formatação isolada, comentário). `N/A - mudança trivial` na revisão basta.

**6. A IA pode rodar este checklist sozinha?** Sim, para verificações objetivas (testes passam, há `any`, idioma consistente). Para verificações subjetivas (qualidade dos nomes, decisões de design), prefira validação humana. A IA não usa este checklist para abrir uma REV sozinha; REV só existe com pedido humano de revisão completa do projeto.

**7. Item marcado `[ ]` é sempre bloqueante?** Não. Depende do item e do contexto. Item de segurança crítico `[ ]` é 🔴 Bloqueante. Item de "performance pode melhorar" `[ ]` pode ser 🟡 Importante ou 🟢 Sugestão. Use o [módulo 21](../processos/21-revisao-codigo.md) para classificar.

**8. E se um achado não está coberto pelo checklist?** Anote como achado mesmo assim. Checklist é guia, não exaustivo. Se o item se repete em revisões, considere adicionar ao checklist do projeto.

---

## 🔗 Checklists Especializados e Módulos Relacionados

- [`41-seguranca.md`](./41-seguranca.md) - Checklist detalhado de segurança
- [`42-acessibilidade.md`](./42-acessibilidade.md) - Checklist detalhado de acessibilidade
- [`43-performance.md`](./43-performance.md) - Checklist detalhado de performance
- [`../processos/21-revisao-codigo.md`](../processos/21-revisao-codigo.md) - Processo completo de revisão
- [`../processos/27-revisao-geral.md`](../processos/27-revisao-geral.md) - Revisão completa do projeto sob pedido humano
- [`../templates/31-task-concluida.md`](../templates/31-task-concluida.md) - Onde o resultado é registrado

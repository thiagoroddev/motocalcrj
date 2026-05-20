# Tarefas em Andamento

---

# TASK-BG-002 — CardItemPreco: label do toggle mostra preset em vez do preço salvo; div vida útil mais fino; Segmentado sem altura adequada

- **Status:** EM PLANEJAMENTO — aguardando decisão de produto (ver seção abaixo)
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 20/05/26
- **Data início:** 20/05/26
- **Dependências:** —
- **REQ/ADR/DT:** —
- **Observações:** Gerada em revisão de TASK-BG-001. Três problemas visuais confirmados por screenshot + reporte do usuário: (1) label do toggle sempre mostra preço fixo do preset, nunca o preço que o usuário editou; (2) div read-only de "vida útil" renderiza mais curto que o Input ao lado; (3) botões Segmentado em PaginaAjustes ainda aparecem finos apesar do `min-h-touch` adicionado em TASK-BG-001. Há também uma decisão pendente de produto sobre o comportamento de BG-01 (ver abaixo).

---

## Preciso de Decisão: comportamento do preço editado ao trocar de perfil

**Contexto:** `CardItemPreco` tem um toggle Original/Paralela. O usuário pode editar o preço de uma peça enquanto está num perfil. Ao trocar de perfil, o código atual apaga o `precoEditado` (`trocarPerfil()`, linha 175 de PaginaVidaUtil.tsx). O usuário reportou isso como bug (edição perdida sem feedback).

**Situação:** `precoEditado` é um único `number | null` em `PecaOverride` — ele não sabe para qual perfil foi editado. Se não limparmos ao trocar:
- Usuário edita Original para R$ 47 → troca para Paralela → input mostra R$ 47 (errado: deveria mostrar o preço padrão da Paralela).

**Opções:**

1. **Opção A — Manter a limpeza, corrigir apenas o label (escopo P):**
   Mantém o clear de `precoEditado` ao trocar perfil. Apenas corrige o label do botão ativo para exibir `precoEditado ?? precoBase`. O usuário vê seu preço no label enquanto o perfil está selecionado; ao trocar, o label reverte ao preset — comunica visualmente o que vai acontecer. Não resolve a "perda" do dado, mas pelo menos deixa de mentir (hoje o label mostra o preset mesmo quando o usuário mudou o valor).
   - Prós: escopo mínimo, sem mudança de tipo, sem migração de localStorage.
   - Contras: o preço editado ainda se perde ao trocar de perfil (usuário ainda pode achar frustrante).

2. **Opção B — Separar precoEditado por perfil (escopo M, mudança de modelo):**
   Substituir `precoEditado: number | null` por `precoEditadoPorPerfil: { original: number | null; paralela: number | null }` em `PecaOverride`. Atualizar types, reducer, CardItemPreco, fixtures e testes.
   - Prós: cada perfil mantém seu preço editado de forma independente — editar Paralela não afeta Original e vice-versa.
   - Contras: quebra localStorage existente (migração necessária), altera 4–5 arquivos e ~10 testes.

**Minha recomendação:** Opção A para esta tarefa. O problema central relatado pelo usuário é que o label **mente** (mostra preset quando o preço está editado). Corrigir o label resolve 80% da percepção. A Opção B pode ser uma tarefa separada se, após o fix do label, o usuário ainda sentir que a perda do edit é problemática.

**O que você decide?**

---

## Plano Proposto

> Aguardando decisão acima antes de executar. O plano abaixo assume **Opção A**.

**Arquivos tocados:**

- `src/pages/PaginaVidaUtil.tsx`:
  - **Label do toggle ativo** (linhas 204–206): substituir `(p === 'original' ? precoOriginal : precoParalela).toFixed(2)` por expressão que exibe `override?.precoEditado ?? precoBase` quando `p === perfilEfetivo`, e o preço do preset para o botão inativo.
  - **Div "vida útil"** (linha 226): adicionar `h-10` explícito para garantir mesma altura base que o `Input` shadcn (que tem `h-10` hardcoded na base class).
  - **Botões do toggle** (linhas 193–209): adicionar `min-h-touch` para garantir toque mínimo de 48px.

- `src/pages/PaginaAjustes.tsx`:
  - **Botões do Segmentado** (linha 49): adicionar `h-12` explícito (48px direto, sem depender de variável CSS) como complemento ao `min-h-touch` existente — debug de por que `min-h-touch` sozinho não está resolvendo.

**Critérios de aceite:**
- Botão ativo do toggle exibe o preço que o usuário efetivamente salvou (não o preset)
- Div "vida útil" tem altura visualmente idêntica ao `Input` ao lado
- Botões do toggle Original/Paralela têm área de toque ≥ 48px
- Botões Segmentado em PaginaAjustes têm ≥ 48px de altura
- `npx tsc --noEmit` sem erros
- `npm run test` com todos os testes passando

**Impacto:** apenas `PaginaVidaUtil.tsx` e `PaginaAjustes.tsx`
**Riscos:** baixo — mudanças de UI pura, sem lógica de estado nova
**Dependências novas:** nenhuma

## Execução

_(aguardando aprovação do plano)_

## Testes

- `1º npm run test`: —

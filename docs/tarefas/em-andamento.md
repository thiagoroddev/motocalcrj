# Tarefas em Andamento

---

# TASK-REF-13 — PaginaAjustes: gap excessivo entre label e input no componente Linha

- **Status:** AGUARDANDO VALIDAÇÃO VISUAL
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** Imediata
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 20/05/26
- **Data-hora início:** 20/05/26 19:10
- **Data-hora execução:** 20/05/26 19:35
- **Dependências:** —
- **REQ/ADR/DT:** —

## Planejamento Aprovado

Em `src/pages/PaginaAjustes.tsx` na função inline `Linha` (linhas 107–113):
- Adicionar `flex-1 min-w-0` ao `<span>` de label
- Reduzir `gap-4` para `gap-2`

Critérios: label não overflow em 375px, input permanece alinhado à direita.

## Execução

- 19:35: Aplicada a correção na função inline `Linha` de PaginaAjustes.tsx
  - `gap-4` → `gap-2`
  - `<span>` recebeu `flex-1 min-w-0`
- 19:35: Nota — `Linha` permanece inline neste ponto, pois REF-14 (dependente) a extrai na sequência

## Testes

- `npm run test`: 98 verdes (2 arquivos — PerfilContext.test.ts, calculos.test.ts)
- `npx tsc --noEmit`: sem erros

---

# TASK-REF-14 — Extrair componentes inline e refatorar PaginaAjustes

- **Status:** AGUARDANDO VALIDAÇÃO VISUAL
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** Imediata
- **Esforço-H/IA:** P/G
- **Data-hora origem:** 20/05/26
- **Data-hora início:** 20/05/26 19:10
- **Data-hora execução:** 20/05/26 19:35
- **Dependências:** TASK-REF-13
- **REQ/ADR/DT:** —

## Planejamento Aprovado

Criar:
- `src/components/Segmentado.tsx`
- `src/components/Stepper.tsx`
- `src/components/Linha.tsx`
- `src/components/ajustes/CampoSwitch.tsx`

Refatorar `src/pages/PaginaAjustes.tsx`:
- Remover inline Segmentado, Stepper, Linha → importar de components
- Renomear "Histórico de Manutenção" → "Últimas manutenções"
- Remover Accordion → Linha rows simples
- Veículo: grid 2-col para KM Atual + KM Última Revisão
- Financeiro: usar CampoSwitch para Seguro/Alimentação/Internet
- Seguro periodicidade: manter Segmentado (Select não instalado)
- Situação Legal financiada: grid 2-col para Parcela + Restantes
- Meta: < 250 linhas

## Execução

- 19:10: Plano aprovado
- 19:30: Criados os 3 componentes compartilhados: `Segmentado.tsx`, `Stepper.tsx`, `Linha.tsx` em `src/components/`
- 19:30: Criado `src/components/ajustes/CampoSwitch.tsx` — encapsula padrão Switch + label + conteúdo condicional
- 19:32: Criados 6 componentes de seção em `src/components/ajustes/`:
  - `SecaoVeiculo.tsx` — KM em grid 2-col
  - `SecaoUltimasManutencoes.tsx` — sem accordion, Linha rows simples, placeholder "Não registrado"
  - `SecaoPreferencias.tsx` — 2 Segmentados (manutenção e estimativa)
  - `SecaoUsoDiario.tsx` — Segmentado + Stepper + input
  - `SecaoFinanceiro.tsx` — 3x CampoSwitch
  - `SecaoSituacaoLegal.tsx` — grid 2-col para financiada
- 19:35: `PaginaAjustes.tsx` reescrito — **88 linhas** (antes: 572)
- Decisão: `Segmentado` mantido para Periodicidade do seguro (Select não instalado no projeto)
- Decisão: `SecaoPreferencias` inclui 2º segmentado "Estimativa sobre dados" (campo `modoExibicao` existia no modelo mas não estava exposto na UI — aproxima do Figma)

## Testes

- `npm run test`: 98 verdes
- `npx tsc --noEmit`: sem erros
- Validação visual no browser: pendente (aguardando humano)

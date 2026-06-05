# TASK-RNF-014 - Validar resposta da FIPE (BrasilAPI) com Zod/type guards

- **Status:** CANCELADA
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** Imediata
- **Data origem:** 01/06/26 19:13
- **Data cancelamento:** 04/06/26 18:35
- **Dependências:** -
- **REQ/ADR/DT:** REV-001-A07 (achado da revisão geral REV-001)

## Contexto

Tarefa pedia endurecer o parsing da resposta da **BrasilAPI FIPE** em `src/services/fipeService.ts` com Zod/type guards (fronteira externa insegura).

## O Que NÃO Foi Feito (e Por Quê)

Cancelada **sem implementação** porque o produto mudou de direção: a **BrasilAPI não será mais usada**. O valor FIPE passa a vir da `tabelaFipe` **hardcoded** nos presets, atualizada mensalmente pelo script `npm run fipe:update` (TASK-CHORE-017). Endurecer a validação de uma API que será removida não tem objeto.

- **Decidido pelo humano** em 04/06/26, após a revisão da TASK-CHORE-017.
- A remoção efetiva da BrasilAPI/`fipeService` em runtime fica na **TASK-REF-36** (pendentes), que também cobre o ajuste do onboarding Passo 3 e dos docs.
- O achado **REV-001-A07** deixa de gerar tarefa ativa; fica fechado por esta decisão (não por implementação).

## Rastreabilidade

- Substituída pela direção da TASK-CHORE-017 (script de atualização) + TASK-REF-36 (aposentar a BrasilAPI).
- Removida de `docs/tarefas/pendentes.md`.

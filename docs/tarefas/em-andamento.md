# Tarefas em Andamento

---

# TASK-RF-6.38 - Freio traseiro a disco: peça + serviço (camada de dados)

- **Status:** EM DESENVOLVIMENTO (planejamento — aguardando aprovação para executar)
- **Modo:** Standard (aditivo; espelha o freio dianteiro a disco já existente)
- **Valor:** Importante
- **Urgência:** Normal
- **Esforço-H/IA:** P/M
- **Data origem:** 12/06/26 23h05
- **Data início:** 12/06/26 23h05
- **Dependências:** -
- **REQ/ADR/DT:** ADR-014; gerada pela TASK-DOM-3; habilita TASK-DOM-4; complementada por TASK-RF-6.39
- **Observações:** Os 4 modelos Yamaha novos têm freio traseiro a **disco**; o app só conhece o traseiro a **tambor** (`sapata_freio_traseiro`). Esta tarefa adiciona disco+pastilha traseiros como **peça + serviço**, igual ao freio **dianteiro** a disco que já existe. A **km-âncora em Ajustes + model-aware** fica na **TASK-RF-6.39** (decisão do humano: dividir; disco/pastilha ancoráveis lá).

## Contexto técnico (confirmado no código)

- **M.Obra, Insumos e Detalhamento já são preset-driven e model-aware:** iteram os serviços/peças do preset → cada item vira card/linha própria automaticamente ([PaginaInsumos.tsx:48](../../src/pages/PaginaInsumos.tsx#L48), [PaginaMaoDeObra.tsx](../../src/pages/PaginaMaoDeObra.tsx), [SecaoManutencao.tsx:119](../../src/components/detalhamento/SecaoManutencao.tsx#L119)). Logo, basta o preset listar `disco_freio_traseiro` + `pastilha_freio_traseiro` para disco e pastilha (diant. e tras.) aparecerem **separados** nessas 3 telas (trocar disco ≠ trocar pastilha).
- **Freio dianteiro a disco** já existe como peça+serviço (`troca-disco-dianteiro` 0,7h / `troca-pastilha-dianteira` 0,5h), **amortizado** (sem km-âncora). RF-6.38 espelha isso no traseiro.
- **Ajustes** (`COMPONENTES_TROCA`) é estático e só ancora sapata → tratado na **RF-6.39**, não aqui.

## Planejamento

**O que muda:**
- `src/utils/calculos.ts`: em `MAPA_PECA_PARA_SERVICO`, adicionar `disco_freio_traseiro: 'troca-disco-traseiro'` e `pastilha_freio_traseiro: 'troca-pastilha-traseira'`. **Sem** entrada em `MAPA_PECA_PARA_KM_ULTIMA_TROCA` (amortizado, igual ao dianteiro — a âncora vem na RF-6.39).
- `src/utils/maoDeObraEstimada.ts`: em `HORAS_POR_SERVICO`, `'troca-pastilha-traseira': 0.5` e `'troca-disco-traseiro': 0.7` (espelha o dianteiro).
- `src/context/perfilDefaults.ts`: adicionar os 2 serviços ao catálogo default `SERVICOS_INDEPENDENTES_PADRAO` (avulsos, `nao_informado`, `ehExcepcional:false`) **na mesma forma** dos serviços de freio dianteiro já presentes — confirmar o padrão exato dos dianteiros ao executar.
- `src/components/icons/pecas.tsx`: mapear `pastilha_freio_traseiro` / `disco_freio_traseiro` (+ ids de serviço) para os mesmos ícones de freio do dianteiro.
- **Testes:** `calculos.test.ts` (asserções de `MAPA_PECA_PARA_SERVICO`, como as sapatas); `maoDeObraEstimada.test.ts` (tempário 0,5/0,7 × 110 × fator); ajustar `catalogoPresets.test.ts`/`itensManutencao.test.ts` se referenciarem o conjunto.

**NÃO muda** (fica para RF-6.39): `types/perfil.ts`, `perfilSchema.ts` (migração), `SecaoUltimasManutencoes.tsx`, `MAPA_PECA_PARA_KM_ULTIMA_TROCA`. **Nem** presets existentes (Pop/Factor são tambor; os 4 Yamaha a disco recebem peça/serviço na DOM-4).

**Critérios de aceite:**
- Um preset com `disco_freio_traseiro` + `pastilha_freio_traseiro` resolve serviço↔peça e M.O. estimada; aparecem como **cards separados** em M.Obra e Insumos e linhas no Detalhamento (amortizado).
- Modelos a tambor (Pop/Factor) **inalterados**.
- Gates: `npm run test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` — todos **APROVADO**.

**Impacto:** `calculos.ts`, `maoDeObraEstimada.ts`, `perfilDefaults.ts`, `pecas.tsx` + testes. Aditivo, baixo risco (espelha padrão existente).
**Dependências novas:** nenhuma.

> **Nota p/ DOM-4:** a M.O. de pastilha/disco nas planilhas `servicos-extras-*` usou 0,8 h genérico; alinhar ao tempário do código (pastilha 0,5 h / disco 0,7 h) ao montar os presets.

## Execução

- 12/06/26 23h05: Movida de pendentes para em-andamento.
- 12/06/26 23h15: Humano decidiu **dividir** (RF-6.38 dados / RF-6.39 Ajustes) e que disco/pastilha serão **ancoráveis** (na RF-6.39). Plano da RF-6.38 finalizado (escopo só camada de dados, amortizado). Aguardando aprovação para executar.

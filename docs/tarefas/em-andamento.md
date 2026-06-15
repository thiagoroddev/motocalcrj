# Tarefas em Andamento

---

# TASK-RF-10 - Avisos de origem dos dados + tipo de combustível no Detalhamento

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** Imediata
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 15/06/26 11:58
- **Data-hora início:** 15/06/26 12:05
- **Dependências:** -
- **REQ/ADR/DT:** Lançamento web/PWA; complementa o dialog "Privacidade e Termos" (Perfil)
- **Observações:** "ninguém lê os Termos" → aviso curto e **visível** (ícone + texto, não escondido atrás de "?") ao lado/abaixo de cada dado de origem externa. Decisão do humano (override do plano): usar texto VISÍVEL, não o `AjudaInline` (que esconde atrás de toque). Inclui também: na categoria Combustível do Detalhamento, mostrar o tipo de combustível ativo (mostrava consumo mas não dizia se é gasolina/etanol).

## Planejamento Aprovado

- Componente novo `AvisoFonte` (ícone Info + texto curto, muted, visível, acessível).
- Aplicar em: Passo3 (FIPE + IPVA), Insumos (Combustível e Peças/Pneus), Mão de Obra (Revisões concessionária), Detalhamento (Documentos IPVA+Licenciamento — item esquecido na lista original).
- Microcopy por fonte (confirmadas no código): FIPE/IPVA (FIPE + SEFAZ-RJ), Revisões (sites das concessionárias), Combustível (ANP), Peças (marketplaces), Documentos (SEFAZ-RJ/DETRAN-RJ).
- Detalhamento/Combustível: `LinhaDetalheTexto` "Tipo de combustível" com label de `tipoGasolinaPreferida`.
- Sem mudança de cálculo.

## Execução
- 12:05: RF-10 movida de pendentes p/ em-andamento. Início.
- 12:08: Componente `AvisoFonte` (ícone Info + texto visível, acessível).
- 12:09: Avisos aplicados — Passo3 (FIPE+IPVA/SEFAZ-RJ), Insumos (ANP / marketplaces), M.Obra (concessionárias), Detalhamento Documentos (SEFAZ-RJ/DETRAN-RJ).
- 12:09: Detalhamento/Combustível — linha "Tipo de combustível" (`LABEL_COMBUSTIVEL` por `tipoGasolinaPreferida`).

## Testes
- tsc `--noEmit`: APROVADO
- lint: APROVADO (após `--fix` de prettier)
- `npm run test`: 466 verdes (sem novos; mudanças são UI/conteúdo cobertas pelos smoke/render existentes)

## Pendente para conclusão
- Mover este bloco para `concluidas/` + índice (junto do commit final de lançamento, com as demais mudanças não commitadas).

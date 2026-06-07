Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

#### Dívida técnica vigente (auditoria 06/06/26)

_(A TASK-REF-44 foi **cancelada** em 07/06/26 — a variação de revisão era por modelo, não por ano. Ver ADR-019 e `concluidas/2026-06-07--15h05--TASK-REF-44-CANCELADA.md`.)_

## TASK-RF-6.29 - Onboarding "O que foi trocado?": remover óleo e incluir todas as peças avulsas
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 06/06/26 22:56
- **Dependências:** TASK-RF-6.28 (reusar a derivação de peças avulsas do preset)
- **REQ/ADR/DT:** ADR-014, ADR-018, RF-6.3.4
- **Observações:** A tela `Passo5Trocas.tsx` ("O que foi trocado?" / "Na revisão de X km") hoje
  lista uma constante hardcoded de 4 itens — `oleo`, `pneuDianteiro`, `pneuTraseiro`, `kitRelacao`
  (`src/pages/onboarding/passos/Passo5Trocas.tsx:7`). Dois ajustes pedidos pelo humano (06/06/26):
  **(1) remover "Troca de óleo"** — o óleo é sempre trocado em qualquer revisão, então perguntar é
  redundante. ATENÇÃO/decisão: como o óleo é sempre trocado, **não apenas sumir com a âncora** —
  avaliar com o humano auto-ancorar `oleo` em `kmRevisao` (despachando junto no `MARCAR_TROCAS_REVISAO`)
  para o ciclo do óleo continuar ancorado, em vez de perder o anchor. **(2) Incluir TODAS as peças
  avulsas da marca**, não os 4 fixos. Derivar a lista do preset ativo (`obterPreset(perfil.moto.modelo)`),
  com o mesmo filtro de avulso usado em Mão de Obra/Insumos
  (`!incluidoNaRevisaoAutorizada && intervalKm > 0`, ver `PaginaMaoDeObra.tsx:129` e
  `calculos.ts:490`), mapeando cada peça/serviço para sua chave de `KmUltimaTrocas` via
  `MAPA_PECA_PARA_KM_ULTIMA_TROCA` (`calculos.ts:122`); itens sem chave de anchor ficam de fora.
  A lista varia por marca (Honda Pop ≠ Yamaha Factor) — não voltar a hardcodar. Reusar a mesma
  derivação de avulsos da TASK-RF-6.28 (não criar uma segunda fonte divergente). Preservar o bloco
  "Motor refeito" atual (excepcional, `kmAtual >= 60.000`) — fora do escopo. Ícones via `iconePeca`.
  Atualizar o smoke do onboarding e cobrir: óleo ausente da lista, lista derivada por marca, dispatch
  de `MARCAR_TROCAS_REVISAO` com as chaves corretas.

_(A TASK-RF-6.30 saiu daqui para `em-andamento.md` em 07/06/26 — implementada com `<select>` nativo, aguardando validação visual.)_

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).

#### Geradas pela Revisão Geral REV-001 31/05/26

blicos, peças originais e aviso de custo incompleto quando faltar mão de obra.

## Decisões de UI/UX Pendentes

_(A TASK-RF-6.28 saiu daqui para `em-andamento.md` em 07/06/26 — implementada, aguardando validação visual.)_

## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |

### Refatorações da fase

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-REF-43 | Tornar `IMPORTAR_PERFIL` determinístico e normalizar antes do dispatch | Standard | Importante | Normal | M/M | TASK-RF-7.1 | ADR-010 | `[ ]` | 06/06/26 14:42 |


---

## Analytics, PWA e Play Store (Fases 9 e 13)

| ID           | Título                                         | Valor      | Urgência | Esforço | Dependências | Status |
| ------------ | ---------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RNF-8.1 | Analytics (Umami) - trackEvent centralizado    | Importante | Normal   | M       | -            | [ ]    |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Crítico    | Normal   | G       | TASK-RNF-8.1 | [ ]    |
| TASK-RNF-8.3 | TWA - publicação na Google Play Store          | Crítico    | Normal   | G       | TASK-RNF-8.2 | [ ]    |

---

## Qualidade e Polimento (Fase 10)

| ID           | Título                                                      | Valor      | Urgência | Esforço | Dependências        | Status |
| ------------ | ----------------------------------------------------------- | ---------- | -------- | ------- | ------------------- | ------ |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Importante | Normal   | G       | -                   | [ ]    |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo)         | Crítico    | Normal   | G       | Todas as anteriores | [ ]    |

---

## Documentação

Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

#### Dívida técnica vigente (auditoria 06/06/26)

## TASK-REF-44 - Selecionar revisões fixas por faixa de ano
- **Status:** Pendente - aguarda validação final do levantamento
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/G
- **Data-hora origem:** 06/06/26 22:05
- **Dependências:** validação humana de `revisoes-pop110i.md`
- **REQ/ADR/DT:** ADR-011, ADR-018, INV-CALC-2, INV-CALC-3
- **Observações:** manter peças, pneus e serviços avulsos compartilhados pelo modelo. Modelar
  revisões fixas Honda pelas faixas 2016-2024, 2025-2026 e 2027; Yamaha conserva tabela única para
  todos os anos. Criar resolver canônico por modelo/ano e usá-lo em cálculo, Detalhamento, Mão de
  Obra, projeção de próximas revisões e normalização de overrides. Antes de executar, confirmar
  duas inconsistências da fonte: título `2017-2024` versus faixa decidida `2016-2024`, e total de
  1.000 km em 2025-2026 (`120,44 + 0` registrado como `120,64`). Não inventar correções.

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

## TASK-RF-6.30 - Onboarding "Qual o ano da moto?": selecionar ano em vez de digitar
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 06/06/26 22:56
- **Dependências:** -
- **REQ/ADR/DT:** ADR-015, ADR-018, RNF-09
- **Observações:** Hoje o `Passo3.tsx` ("Qual o ano da moto?") usa `<Input type="number">` livre,
  com faixa `ANO_MIN=2000`/`ANO_MAX=ano+1` (`src/pages/onboarding/passos/Passo3.tsx:9-10,77-86`).
  Isso deixa digitar ano inexistente para o modelo (ex.: Pop 110i 2008 → "Ainda não há referência de
  consumo para 2008" + "Valor FIPE indisponível"), só bloqueando o avançar. Trocar por um **seletor**
  que ofereça apenas os anos válidos do modelo — assim o ano inexistente nem aparece e o bug some.
  **Fonte dos anos (decidido): chaves de `preset.tabelaFipe`**, a lista canônica dos anos reais do
  modelo, auto-mantida pelo script de atualização FIPE (endpoint `/years` traz todos os anos; ver
  ADR-015 e `scripts/atualizar-fipe-presets.mjs`). Ordenar desc. Todo ano da `tabelaFipe` também tem
  consumo — o `superRefine` do `presetSchema` exige `consumoKmLPorAno[ano]` para cada ano da FIPE —
  então qualquer ano listado permite prosseguir.
  **Implementação:** usar o wrapper de Select já existente (`@/components/ui/select`); default = o
  `perfil.moto.ano` atual se estiver na lista, senão o ano mais recente; ao escolher, manter os mesmos
  dispatches atuais (`SET_FIPE_CACHE` com cache do ano ou `null`, e `SET_ONBOARDING_CAMPO` de `moto.ano`).
  Remover `ANO_MIN`/`ANO_MAX`, o aviso "Use um ano entre…" e o aviso "Ainda não há referência de
  consumo…" (inalcançáveis com seletor). Preservar o painel de Consumo de referência / FIPE / IPVA do
  ano selecionado. **Relacionado (verificar, não obrigatório aqui):** o ano em Ajustes (`SET_ANO_MOTO`)
  hoje já rejeita ano sem referência, mas se também for input livre, alinhar para seletor pela mesma
  fonte. Atualizar smoke do onboarding: seletor lista os anos do modelo e não permite ano inexistente.

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

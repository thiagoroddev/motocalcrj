# Tarefas em Andamento

---

## TASK-RF-6.37 — Adicionar item "Caixa de direção" (serviço extra incompleto)

- **Modo:** Standard+ (mexe em schema/contrato e em `calculos.ts`; **sem ADR nova** — segue ADR-014 e `manutencao-estimativas.md`)
- **REQ/ADR:** ADR-014; `docs/dominio/manutencao-estimativas.md`
- **Dependências:** —
- **Início:** 12/06/26
- **Bloqueia/precede:** a criação dos presets faltantes (Task B) — o contrato precisa nascer com a Caixa de direção antes da produção em massa.

### Objetivo

Adicionar **"Caixa de direção"** como item de manutenção rastreável, do tipo **serviço extra
incompleto** (a concessionária não informa o preço; entra **só a mão de obra**, estimada; a **peça** é
real e vai em Insumos). Aparece nas três telas: **M. Obra** (Serviços Extras → Valor Incompleto),
**Insumos** (peça com preço/vida útil) e **Ajustes → Últimas manutenções** (km da última troca).

### Modelo de dados (como um item existe hoje)

Um item rastreável é composto por:
1. **Peça** em `preset.pecas[]` (`id`, `nome`, `intervaloKm`, `precoOriginal`, `precoParalela`, `incluidoNaRevisaoAutorizada:false`) → **Insumos**.
2. **Serviço** em `preset.servicosManutencao[]` (`id`, `nome`, `intervalKm`, `precoIndependente`, `precoTotalAutorizada:0`, `statusPrecoAutorizada:'nao_informado'`, `incluidoNaRevisaoAutorizada:false`, `ehExcepcional:false`) → **M. Obra** (Valor Incompleto).
3. **Chave em `KmUltimaTrocas`** → **Ajustes → Últimas manutenções**.
4. **3 mapas** em `calculos.ts` ligando os ids (peça↔km, peça↔serviço) para ancoragem e cálculo.

### O que muda

**Contrato + schema (migração):**
- `src/types/perfil.ts`: `caixaDirecao: number` em `KmUltimaTrocas`.
- `src/schemas/perfilSchema.ts`: `caixaDirecao: inteiroNaoNegativo` em `kmUltimaTrocas`.
- `src/context/perfilDefaults.ts`: `caixaDirecao: 0` em `KM_ULTIMA_TROCAS_PADRAO`; novo serviço
  `troca-caixa-direcao` (avulso incompleto) em `SERVICOS_INDEPENDENTES_PADRAO`.
- **Migração:** `caixaDirecao` é campo novo obrigatório → resolver a estratégia (ver Decisão 1) para
  **não zerar predefinições já salvas**.

**Dados (4 presets existentes):**
- `src/presets/{pop110i,factor125i,factor150,fazer150}.json`: nova `pecas[]` `caixa_direcao` (preço
  original/paralela das docs `precos-pecas-*-todosmodelos.md`, por modelo; `intervaloKm` sincronizado
  pela regra de `manutencao-estimativas.md` §2) e novo `servicosManutencao[]` `troca-caixa-direcao`
  (avulso, `nao_informado`, M.O. estimada; `ehExcepcional:false`).

**Mapas (`src/utils/calculos.ts`):**
- `MAPA_PECA_PARA_KM_ULTIMA_TROCA`: `caixa_direcao: 'caixaDirecao'`.
- `MAPA_PECA_PARA_SERVICO`: `caixa_direcao: 'troca-caixa-direcao'`.

**Estimativa de M.O. (`src/utils/maoDeObraEstimada.ts`):**
- `HORAS_POR_SERVICO`: `'troca-caixa-direcao': <horas>` (ver Decisão 2).

**Ícone (`src/components/icons/pecas.tsx`):**
- importar um ícone (ex.: `~icons/mdi/steering`) e mapear `caixa_direcao`, `troca-caixa-direcao` e `caixaDirecao`.

**UI (Últimas manutenções):**
- `src/components/ajustes/SecaoUltimasManutencoes.tsx`: `{ key: 'caixaDirecao', label: 'Caixa de direção' }` em `COMPONENTES_TROCA`.
- Verificar o passo de onboarding `Passo5Manutencoes` — se enumera campos próprios, incluir lá também.
- **M. Obra e Insumos surgem automaticamente** via preset (serviço → aba Concessionária/Valor Incompleto; peça → Insumos). Confirmar na implementação.

**Docs:**
- `docs/dominio/manutencao-estimativas.md`: adicionar Caixa de direção ao tempário (§1.1) e aos intervalos por modelo (§2.1/§2.2).
- `docs/dominio/informacoes-modelos-motos/como-criar-preset.md`: incluir o item no contrato campo→fonte (para a Task B já nascer com ele).
- glossário/modelagem, se listarem o conjunto de itens.

**Testes:**
- `perfilSchema`/`presetSchema`: novo campo aceito; fixtures de `kmUltimaTrocas` literais atualizadas.
- `calculos`: item aparece em manutenção e ancora por `kmUltimaTrocas.caixaDirecao`.
- M. Obra: serviço aparece em "Valor Incompleto" (status nao_informado).
- Migração: dado persistido antigo carrega com `caixaDirecao: 0` sem virar `estadoPadrao`.

### Decisões — resolvidas (humano, 12/06/26)

1. **Migração:** sem usuários reais; caminho **não-quebrável e mínimo** — `caixaDirecao:
   inteiroNaoNegativo.default(0)` no zod, **sem bump de versão**. O default preenche dados antigos na
   carga (não zera predefinições) e dispensa framework de migração.
2. **Horas/intervalo (estimados, ajustáveis):** M.O. **1,5 h** (caixa de direção ≈ serviço moderado;
   tempário entre sapata 0,65 h e kit transmissão 2,0 h). Intervalo/vida útil sincronizado: **Honda
   42.000 km (×6.000)**, **Yamaha 40.000 km (×5.000)** — rolamentos de direção duram muito; valor
   conservador para o anda-e-para do RJ.
3. **Ids/nomes:** peça `caixa_direcao` ("Caixa de direção"); serviço `troca-caixa-direcao` ("Troca da
   caixa de direção"); chave `caixaDirecao`.
4. **Avulso, não excepcional:** serviço prestado pela concessionária, mas sem valor publicado →
   `ehExcepcional:false`, `incluidoNaRevisaoAutorizada:false`, `statusPrecoAutorizada:'nao_informado'`,
   `precoTotalAutorizada:0`. Nasce zerado (incompleto) com estimativa **opcional**.

### Preço da peça por modelo (das docs `precos-pecas-*`)

- Pop 110i: **R$ 102** (original). Factor 125i / Factor 150 / Fazer 150: **R$ 208** (original).
- `precoParalela`: oculto no MVP (Insumos original-only) — adotado = original com nota, na ausência de
  cotação paralela separada nas docs.

### Critérios de aceite

- Caixa de direção aparece em M. Obra (Valor Incompleto), Insumos (peça com preço/vida útil) e Ajustes
  (km da última troca), com ícone próprio.
- M.O. estimada calcula via tempário; status nasce `nao_informado` e permanece incompleto.
- Predefinições salvas antes da mudança **continuam carregando** (sem virar `estadoPadrao`).
- Os 4 presets têm a peça com preço real das docs.
- `manutencao-estimativas.md` e `como-criar-preset.md` refletem o item (verdade primária para a Task B).
- Suíte, typecheck, lint e validação visual em verde.

### Riscos

- **Migração**: campo novo obrigatório pode zerar dados persistidos se a estratégia falhar — mitigado
  por teste de carga de dado v3 + normalização.
- **Cálculo**: esquecer um dos 3 mapas faz o item não ancorar/duplicar — coberto por teste de calculos.

### Gates

- [ ] `npm run test`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Validação visual

---

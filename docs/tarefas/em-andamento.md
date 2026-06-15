# Tarefas em Andamento

---

# TASK-RF-8 - Bateria: valor completo na Mão de Obra + ancoragem por data e vida útil em anos

- **Status:** EM DESENVOLVIMENTO (plano aprovado 15/06/26; default vida útil = 3 anos, exibido em anos; tarefa única)
- **Modo:** Standard
- **Valor:** Importante · **Urgência:** Normal · **Esforço-H/IA:** G/G (teto)
- **Data origem:** 14/06/26 21:50 · **Data início:** 15/06/26
- **Dependências:** - · **REQ/ADR/DT:** ADR-014 (completo×incompleto), ADR-016 (ancoragem) — ambas a atualizar
- **Observações:** Planejamento iniciado por outra IA (atingiu limite); retomado aqui. TASK-REF-45 já concluída.

## Planejamento Aprovado

### 4 decisões (confirmações da IA anterior) — resolvidas como recomendado

1. **Fórmula:** custo anual da bateria = **valor da troca ÷ vida útil (anos)**. A **data não altera o custo** — serve só para idade, próxima troca e atraso (Detalhamento). É o que o app já faz hoje (`12 / intervaloMeses` em `calculos.ts:394`) e é **equivalente** a "contar trocas desde o ano da moto".
2. **Sem data informada → janeiro do ano da moto** como referência estimada de idade.
3. **Completo × Incompleto:** Honda **com oficial** (Pop, Start, Fan/Titan, Bros, XRE) = **completo** (peça+M.O., esconde a peça em Insumos). **CB250F** (sem oficial coletado) + **Yamaha** = **incompleto** (peça em Insumos + M.O.). **Não inventar preço.**
4. **Vida útil padrão = 3 anos** (36 meses) para todos; seletor **2/3/4/5 anos**. **Sempre exibida em ANOS** (36 meses confunde — decisão do humano 15/06). Vem da **config do usuário** (default 3), não do preset → casa com os 13/14 presets que já usam 36; só o `pop110i` (24) passa a 3 anos por default (custo levemente menor). Sem mudança disruptiva.

### O que muda

- **`src/types/perfil.ts`**: + `perfilManutencao.bateria: { ultimaTrocaAnoMes: string | null; vidaUtilAnos: 2|3|4|5 }`; `schemaVersion` 3→4; `bateria` sai do uso ativo de `KmUltimaTrocas` (vira legado preservado).
- **`src/schemas/perfilSchema.ts`** (+ migração): schema da config; migração **v3→v4** (default `vidaUtilAnos: 2`, `ultimaTrocaAnoMes: null`; preserva perfis v3).
- **`src/context/perfilReducer.ts` / actions**: `SET_BATERIA_ULTIMA_TROCA`, `SET_BATERIA_VIDA_UTIL`; defaults em `PerfilContext`.
- **`src/utils/calculos.ts`**: **amortização dedicada da bateria** — custo/ano = (completo: valor oficial completo) **ou** (incompleto: peça + M.O.) **÷ `vidaUtilAnos`**. Tira a bateria do caminho genérico de peça amortizada (`intervaloMeses`) e do filtro que exclui `troca-bateria` do M.O. Anti dupla-contagem: completo esconde a peça (já coberto por `ehPecaCobertaPorServicoCompleto` quando `troca-bateria` for informado+`concessionariaIncluiPeca:true`). Detalhamento: próxima troca + atraso a partir da data (valor amortizado inalterado).
- **`src/components/ajustes/SecaoUltimasManutencoes.tsx`**: remover `bateria` do card "KM - últimas trocas" (LABELS + `MAPA_PECA_PARA_KM_ULTIMA_TROCA`); **novo `CardBateria`** (data AAAA-MM via input `month`/calendário + vida útil), reutilizado no **onboarding** (passo de últimas manutenções/Ajustes).
- **`src/components/mao-de-obra/` (`SecaoServicosExtras`/`CardServico`)**: bateria aparece em **Serviços Extras** (completo Honda / incompleto Yamaha+CB) com **seletor de vida útil em anos** no lugar de "intervalo em km" (CardServico ciente do tipo temporal bateria).
- **`src/pages/onboarding/passos/PassoMaoDeObra.tsx`**: bateria nas subseções (já via `SecaoServicosExtras`).
- **14 presets**: `troca-bateria` com **oficial** (informado + `concessionariaIncluiPeca:true`) para Pop/Start/Fan/Titan/Bros/XRE (valores dos `servicos-extras-*.md`: 577,74 / 564,74 / 571,74 / 563,34 / 495,37); CB250F + Yamaha = **incompleto** (`false`, M.O. estimada). Peça da bateria mantém o preço; `intervaloMeses` da bateria deixa de governar o cálculo.
- **Docs**: domínio (manutenção-estimativas/ADR-014/016 addendum) + conclusão.
- **Testes**: schema/migração v3→v4; calc (÷ anos, M.O., anti-dupla, completo×incompleto); cards (Ajustes/onboarding/M.O.); smoke do fluxo.

### Critérios de aceite

- Bateria **some** do card "KM - últimas trocas"; **novo card** de data + vida útil em Ajustes e no onboarding.
- Bateria em "Serviços Extras": **completo** (Honda c/ oficial) × **incompleto** (Yamaha + CB250F), com seletor **2/3/4/5 anos**.
- Cálculo: custo/ano = valor ÷ vida-anos; **completo não duplica** a peça (Insumos esconde); **incompleto soma** peça + M.O.
- Detalhamento mostra **próxima troca + atraso** (data), sem mudar o valor amortizado.
- `test`/`tsc`/`lint`/`build` verdes.

**Impacto:** schema/migração, cálculo, UI compartilhada (Ajustes/M.O.), onboarding, 14 presets, docs. **Riscos:** migração de perfis v3 (preservar); default 2 anos sobe o custo dos 13 presets (intencional); CardServico precisa de modo "temporal" (sem km); centralizar a amortização sem regressão no caminho de peça. **Dependências novas:** nenhuma.

## Execução

- 15/06/26: Plano elaborado (retomada da IA anterior); fatos técnicos verificados (amortização `12/intervaloMeses`; M.O. de bateria filtrada hoje; 13/14 presets a 36 meses; schema v3).
- 15/06/26: **Plano aprovado** com ajuste: default vida útil = **3 anos** (não 2), **exibida em anos**; tarefa única. Início da implementação.
- 15/06/26: **✅ Camada de dados concluída e verificada** (sem bump de versão — campo novo com `.default`, padrão RF-6.37/6.39): `BateriaConfig`/`VidaUtilBateriaAnos` + `perfilManutencao.bateria` (`types/perfil.ts`); `bateriaConfig` + `.default({null,3})` (`perfilSchema.ts`); default no `perfilPadrao` (`perfilDefaults.ts`); actions `SET_BATERIA_ULTIMA_TROCA`/`SET_BATERIA_VIDA_UTIL` + cases (`perfilReducer.ts`). **tsc limpo; 129 testes da camada de dados verdes** (compat schema↔tipo 17/17; reducer 66/66).
- 15/06/26: **Desenho do cálculo verificado** (a implementar):
  - **Peça da bateria** em `calcularCpkPorPeca`: trocar `12/intervaloMeses` (linha ~394) por `1/vidaUtilAnos` **só para a bateria** (passar `vidaUtilBateriaAnos` em `OpcoesCpkPorPeca`). `modo: amortizado`.
  - **M.O./valor-completo** em `calcularDetalhesRevisaoAnual` (passar `bateria` nas opções): localizar `troca-bateria` ativo e adicionar um `CustoServicoRevisao` com `custoAnual = valor / vidaUtilAnos`, `eventosNoAno = 1/vidaUtilAnos`, `modo amortizado`. `valor` = **autorizadas**: completo→`precoTotalAutorizada` (peça já pulada via `ehPecaCobertaPorServicoCompleto`), incompleto→`precoTotalAutorizada` (M.O.) ou estimativa; **independentes**: `precoIndependente` somado ao `base`. → `montarItensManutencao` funde com a peça (incompleto) ou vira item standalone (completo) **sem dupla contagem**.
  - **Threading:** `calcularCustosPorCategoria` (l. ~791 e a chamada de `calcularCpkPorPeca`) passa `perfil.perfilManutencao.bateria`.
  - **Próxima troca/atraso:** helper `proximaTrocaBateria(ultimaTrocaAnoMes, vidaUtilAnos, anoMoto)` → `{ proximaAnoMes, atrasoMeses }` para o Detalhamento (NÃO altera custo). Sem data → janeiro do ano da moto.
- 15/06/26: **✅ Cálculo concluído e verificado** (`calculos.ts`): peça da bateria amortiza por `vidaUtilBateriaAnos` (não `intervaloMeses`); M.O./valor-completo da bateria entra em `detalhesServicos` (autorizadas) e no `base` (independentes), `÷ vidaUtilAnos`; completo não duplica peça (pulo via `ehPecaCobertaPorServicoCompleto`); incompleto soma peça (CPK) + M.O.; pendência quando nao_informado sem estimativa. Helper exportado `proximaTrocaBateria` (próxima/atraso, só exibição). Threading em `calcularCustosPorCategoria`. Tempário já tem `troca-bateria` 0,2h. **Testes:** 3 expectativas atualizadas p/ a nova regra + 1 teste de configurabilidade (2/4/5 anos); `calculos.test` 165/165; **suíte 442 verde, 0 falhas/skips**; tsc/lint limpos.
- 15/06/26: **🔶 Checkpoint (motor pronto, recurso ainda não visível).** Falta para o usuário ver/usar:
  - **Presets (14):** `troca-bateria` oficial **completo** (informado + `concessionariaIncluiPeca:true`) — Pop 577,74 / Start 564,74 / Fan-Titan 571,74 / Bros 563,34 / XRE 495,37; **CB250F + Yamaha (7)** = incompleto (`concessionariaIncluiPeca:false`; M.O. estimada 0,2h). Remover `bateria` de `MAPA_PECA_PARA_KM_ULTIMA_TROCA` (`calculos.ts`) + `LABELS_KM_ULTIMA_TROCA` (`SecaoUltimasManutencoes.tsx`).
  - **UI:** `CardBateria` em Ajustes (input `month` da última troca + `Select` 2/3/4/5 anos) reusado no onboarding; bateria em **Serviços Extras** (Mão de Obra) com select de anos (CardServico ciente do tipo temporal); `proximaTrocaBateria` no Detalhamento.
  - **Docs/ADR-014/016** + conclusão + testes de UI/smoke.

## Decisões Tomadas

- **Default vida útil = 3 anos**, exibida em **anos** (2/3/4/5); vem da config do usuário, não do preset (casa com os 13/14 a 36 meses; só o Pop muda 2→3).
- (demais decisões: ver "4 decisões" no Planejamento Aprovado.)

## Testes

- `1º npm run test`: 446 verdes (baseline pós-DOM-6).

---

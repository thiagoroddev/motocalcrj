Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).


#### Geradas pela Revisão Geral REV-001 31/05/26

> Lote de 9 tarefas geradas por revisão geral do projeto (humano + IA). Cada item foi
> verificado contra o código antes de registrar. Severidades reclassificadas após
> verificação. Ordem abaixo é por prioridade combinada (Valor + risco).
> Origem rastreável: `docs/arquitetura/revisoes-gerais/REV-001.md` (achados REV-001-A01..A09).

### TASK-REF-31 Preset/modelo como fonte única da verdade

- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A01; ADR a avaliar em conjunto com TASK-REF-32
- **Observações:** Hoje `src/data/catalogoModelos.ts` monta o `CATALOGO` à mão e duplica campos que já vivem no preset (`consumoKmL`, `consumoKmLComBau`, `tabelaFipe`, `codigoFipe`), enquanto `nomeFipe` e `aceitaEtanol` só existem no catálogo TS. Vários consumidores remontam `import.meta.glob('../presets/*.json')` por conta própria (`src/hooks/useCustos.ts`, `src/pages/PaginaInsumos.tsx`, `src/pages/PaginaMaoDeObra.tsx`, `src/components/detalhamento/DialogEdicaoCusto.tsx`, `src/data/catalogoPresets.test.ts`). Resultado: "adicionar uma moto" exige editar `.ts` e manter metadados em dois lugares, contradizendo o objetivo "novo modelo = novo JSON" (`docs/requisitos/nao-funcionais.md`).
  - **Objetivo:** criar um repositório único de presets (ex.: `src/data/repositorioPresets.ts`) que varra os JSONs uma vez e exponha tanto `PresetMoto` quanto o catálogo derivado; mover `nomeFipe`/`aceitaEtanol`/`codigoFipe` para dentro de cada preset JSON; eliminar os `import.meta.glob` espalhados.
  - **Critério de aceite:** adicionar um 2º preset JSON deve aparecer no catálogo e no onboarding sem tocar em `.ts`. Guard `catalogoPresets.test.ts` (TASK-CHORE-014) segue verde.
  - **Cuidado:** TASK-REF-30 resetou o schema pré-lançamento; não reintroduzir migrations históricas. Coordenar com TASK-RNF-013 (presetSchema valida o shape unificado).

### TASK-REF-32 Manutenção/peças/histórico data-driven por preset

- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** XG/XG (dividir antes de executar)
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:** TASK-REF-31
- **REQ/ADR/DT:** REV-001-A02; ADR-011 a criar ("modelo como fonte única de manutenção")
- **Observações:** Dados de manutenção que deveriam variar por modelo estão espalhados e fixos na Pop 110i: `src/context/perfilDefaults.ts` (`SERVICOS_INDEPENDENTES_PADRAO` com preços/IDs da Pop, gravados em todo perfil novo), `src/types/perfil.ts` (`KmUltimaTrocas` com chaves fixas oleo/velaIgnicao/kitCilindro/retificaCabecote…), `src/schemas/perfilSchema.ts` (espelha essas chaves), `src/utils/calculos.ts` (`MAPA_PECA_PARA_KM_ULTIMA_TROCA`, `MAPA_SERVICO_PARA_KM_ULTIMA_TROCA`, `MAPA_PECA_PARA_SERVICO` + constante `KM_CICLO_REVISAO_HONDA = 36000` e fallbacks `?? 3334.62`/`?? 7`), e `src/components/mao-de-obra/LinhaRevisaoHonda.tsx` (nomenclatura de marca).
  - **Bug latente concreto:** `KM_CICLO_REVISAO_HONDA = 36000` é divisor do pacote autorizado; para qualquer moto cujo ciclo ≠ 36.000 km a revisão calcula errado. O dado correto já existe no preset: `revisaoAutorizada[última].intervaloKm`.
  - **Direção:** `KmUltimaTrocas` evolui para `Record<pecaId, km>` orientado pelo preset; serviços independentes, mapas peça↔serviço↔histórico e constantes de ciclo passam a vir do preset. Migrar incrementalmente em sub-tarefas REF-32.x XG exige divisão obrigatória (ver `20-ciclo-tarefa` §3.4).
  - **Decisão arquitetural:** criar ADR-011 antes da migração em massa (citar origem `REV-001-A02`). Não reabrir o modelo anêmico de `calculos.ts` (decisão correta ver Recomendações Gerais do REV-001).
  - **Constraint:** vocabulário "autorizada/independente" é genérico e fica; só "Honda" vaza renomear `LinhaRevisaoHonda` → `LinhaRevisaoAutorizada` faz parte. Depende de TASK-REF-31 (fundação preset-fonte-única).

### TASK-RNF-013 Validação Zod de presets e dados regionais (contrato)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A03; coordenar com TASK-REF-31
- **Observações:** O perfil do usuário é validado por Zod, mas presets e `dados_rj.json` entram por cast (`as PresetMoto`, `as unknown as DadosRJ` em `src/hooks/useCustos.ts`; `as Record<string, number>` em `src/data/catalogoModelos.ts`). Com vários JSONs, um campo ausente/inválido quebra em runtime em vez de falhar no build/teste.
  - **Objetivo:** criar `presetSchema` e `dadosLocaisSchema` (Zod), validar todos os JSONs em teste de contrato (estendendo `src/data/catalogoPresets.test.ts`), reusando o padrão de `perfilSchema` (schema amarrado ao tipo por `expectTypeOf`).
  - **Coordenação:** valida o shape unificado do preset depois que TASK-REF-31 mover os metadados para o JSON; pode começar pelo shape atual.

### TASK-REF-33 CARREGAR_PERFIL por presetId + invariantes relacionais no schema

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A04; invariante de preset ativo (`docs/dominio/invariantes.md`)
- **Observações:** `CARREGAR_PERFIL` em `src/context/PerfilContext.tsx` aceita `perfil`+`presetId` e valida só o shape via `perfilSchema.safeParse`, não se o preset existe nem a invariante de preset ativo. Como `dispatch` é exposto, consumidores futuros podem quebrar a invariante. Além disso, relações como `revisaoAutorizadaOverride.precoTotal === precoPecas + precoMaoDeObra` não são validadas pelo schema.
  - **Direção:** considerar trocar `CARREGAR_PERFIL` por action orientada a `presetId` (reducer resolve o preset internamente) e adicionar `superRefine` para invariantes relacionais relevantes prioridade antes de habilitar export/import público (TASK-RF-7.1).
  - **Antes de executar:** revalidar o estado atual do reducer (o REV-001 alerta que referências de linha podem ter mudado).

### TASK-REF-34 Isolar storage do tema e tornar escritas resilientes

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A05; `docs/contexto-projeto-ai.md`, `docs/requisitos/nao-funcionais.md`
- **Observações:** A doc promete isolamento de `localStorage` em `services/`, mas `src/context/ThemeContext.tsx` lê/escreve `localStorage` direto (anti-padrão do núcleo: acoplar UI a infraestrutura). Escritas críticas em `src/services/perfilStorage.ts` e na persistência de `src/context/PerfilContext.tsx` podem falhar por quota/modo privado sem caminho de recuperação explícito.
  - **Direção:** criar `themeStorage.ts` (ou storage genérico) e proteger escritas críticas com try/catch + comportamento documentado; OU, se decidir manter o tema inline, ajustar a regra na doc para "storage de perfil" resolver a contradição doc↔código de um jeito ou de outro.
  - **Antes de executar:** revalidar `ThemeContext.tsx` (não lido na síntese da REV).

### TASK-RNF-014 Validar resposta da FIPE (BrasilAPI) com Zod/type guards

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A07
- **Observações:** `src/services/fipeService.ts` tipa o retorno da BrasilAPI por generic/cast de `json()` (`fetchJson<T>`). API externa é fronteira insegura shape divergente passaria silenciosamente e quebraria o parsing a jusante. Adicionar validação Zod (ou type guards pequenos) às respostas das 4 rotas (marcas, veículos, anos, preço) e à rota rápida por código, mantendo cache de sessão / timeout (`AbortController`) / fallback `tabelaFipe` existentes e os 6 testes de `fipeService.test.ts` verdes. Aceitável hoje; frágil antes de lançamento público.

### TASK-CHORE-015 Alinhar constantes de negócio e documentação às fontes canônicas

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A06; fonte canônica `src/data/dados_rj.json`
- **Observações:** Fontes duplicadas de constantes de negócio e pequenos desalinhamentos doc↔código (sozinhos não quebram, mas criam ruído para decisões futuras). Itens (pode quebrar em sub-commits atômicos):
  - `src/pages/onboarding/passos/Passo3.tsx` hardcoda IPVA `* 0.02` e o label "2% a.a." → ler `dadosRJ.ipva.aliquotaMotos`.
  - `src/context/PerfilContext.tsx` hardcoda fator etanol `0.78` no `COMMIT_ONBOARDING` → ler `dados_rj.json: autonomiaEtanolFatorReducao`.
  - Revalidar referência a `vite-plugin-pwa` em `docs/contexto-projeto-ai.md` sem dependência correspondente em `package.json` (README já corrigido pela TASK-DOC-013).
  - Revalidar `Math.ceil(eventosRevisaoNoAno)` em `src/components/detalhamento/SecaoManutencao.tsx` vs. o padrão de eventos aproximados (`≈`) já aplicado a peças/serviços.

### TASK-REF-35 Extração oportunista de arquivos grandes (com gatilho)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A08
- **Observações:** 🟢 Sugestão execução OPORTUNISTA, não "largar tudo": extrair partes de `src/context/PerfilContext.tsx` (~720 linhas) e `src/pages/PaginaDetalhamento.tsx` (~560 linhas) QUANDO a próxima feature tocar nelas. Manter `src/utils/calculos.ts` (~1085 linhas) como núcleo estável por enquanto é puro, seccionado e densamente testado (145 testes); mexer sem gatilho gera mais risco que ganho. **Gatilho:** próxima feature que abrir esses arquivos. Registrada como bloco por convenção do projeto, mas tratar como Desejável/gatilho.

### TASK-CHORE-016 DX: helper de localStorage falso + bootstrap de fixture DEV (com gatilho)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A09
- **Observações:** 🟢 Sugestão pequenos atritos de DX, executar se houver recorrência: (1) `criarLocalStorageFalso` aparece duplicado em testes → extrair para `src/test/localStorageFalso.ts`; (2) a fixture de desenvolvimento é importada assíncronamente em `src/main.tsx` enquanto `PerfilProvider` já inicializa lendo o storage antes avaliar bootstrap DEV antes do render ou mover a carga da fixture para a criação do estado inicial em DEV. Sem prioridade alta; registrada por convenção do projeto.

## Decisões de UI/UX Pendentes


## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |


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

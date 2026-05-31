# Dívida Técnica do Domínio MotoCalc

> **Status:** v2 corrigida engenharia reversa baseada em código real (2026-05-09).
> **Propósito:** Registrar divergências, modelos anêmicos consolidados, e oportunidades de evolução do domínio que **não justificam refatoração agora** mas devem ser conhecidas.

---

## Sobre Esta Lista

Dívida técnica não é defeito. É **decisão consciente** de adiar uma melhoria porque o custo agora é maior que o benefício. O risco de dívida técnica não documentada é que, com o tempo, ninguém lembra que foi escolha e ela vira regra implícita ruim.

Esta lista mantém memória dessas decisões. **Cada item tem motivo do adiamento e gatilho que justificaria endereçar.**

---

## DT-1: Modelo Anêmico em utils/calculos.ts

### Situação atual

Funções de cálculo de domínio (CPK, custo total, breakdown por categoria, granularidades) vivem como funções soltas em `src/utils/calculos.ts`, fora das entidades. O `PerfilUsuario` não tem método `calcularCPK()` em vez disso existe `calcularResultado(perfil, preset, ...)`.

### Por que é dívida técnica

Em DDD clássico, comportamento de domínio pertence à entidade. Modelo anêmico tende a:

- Espalhar regras por arquivos diversos
- Dificultar refatoração quando regras evoluem
- Tornar o código orientado a função, não a domínio

### Por que NÃO refatorar agora

- O arquivo tem **96 testes passando** está estável e validado
- Está marcado como **Proibição Absoluta** no `contexto-base`
- Refatoração teria custo alto e risco de regredir comportamento crítico
- Modelo anêmico é **idiomático em React** funciona bem na prática

### Gatilho que justificaria endereçar

- Necessidade de adicionar regras radicalmente novas que não cabem na arquitetura atual
- Migração para outra arquitetura (ex: backend V2 com lógica replicada)
- Bugs recorrentes em cálculo indicando saturação da estrutura

### Como conviver com a dívida

- **Conceitos novos:** prefira modelo rico desde o começo
- **Mudanças em cálculos existentes:** mantenha o estilo atual por consistência
- Não tentar refatoração parcial sistema híbrido é pior que cada extremo

---

## ~~DT-2: Divergência RevisaoGeral.status entre Código e Requisitos~~ — ENDEREÇADA (23/05/26)

`RevisaoGeral` foi inteiramente removido pela TASK-REF-19 — conceito morto pela ADR-003 (sem Registros). A divergência deixou de existir. Os requisitos RF-REG-* serão revistos na TASK-DOC-010.

---

## DT-3: Sem Value Objects Tipados para Conceitos Frequentes

### Situação atual

Conceitos como **Quilometragem**, **Dinheiro/Preço**, **CPK** são representados como `number` em todo o código, sem tipos próprios.

### Por que é dívida técnica

- Perde validação centralizada (qualquer `number` pode virar km, mesmo negativo)
- Cálculos financeiros com `number` em JavaScript têm bugs de precisão (float)
- Perde expressividade `function calcular(a: number, b: number): number` não diz nada

### Por que NÃO refatorar agora

- Refatoração afetaria praticamente todo o codebase
- Bugs de precisão **ainda não foram observados**
- Investimento de tempo prematuro

### Gatilho que justificaria endereçar

- Bug de arredondamento em produção
- Adição de moeda alternativa
- Conceito novo que precise carregar metadados

### Recomendação

Tópico para estudar quando virar V2. Não tentar agora.

---

## DT-4: Domain Events Não Materializados

### Situação atual

Eventos de domínio (`OnboardingFinalizado`, `PresetTrocado`, `PerfilResetado`, `RodagemAtualizada`, etc) **existem conceitualmente** mas não há infraestrutura de event bus. São mudanças de estado dispersas via Actions do reducer.

### Por que é dívida técnica

Sem eventos materializados:

- Comportamentos secundários (analytics, logs, sincronização) ficam acoplados ao código que dispara mudança
- Difícil rastrear "o que acontece quando o Motoboy finaliza Onboarding?"

### Por que NÃO implementar agora

- V1 já tem analytics implementado via `utils/analytics.ts` (centralizado, RNF-ANA-02)
- Sem necessidade de sincronização (offline-first)
- Adicionar event bus para 3-4 eventos esporádicos é over-engineering

### Gatilho que justificaria endereçar

- Backend V2 com sincronização
- Comportamentos secundários complexos coordenados em mudanças de estado

---

## DT-5: Catálogo de Modelos sem Cadastro Livre

### Situação atual

`src/data/catalogoModelos.ts` (e `import.meta.glob('../presets/*.json')`) limita os Motoboys aos 5 modelos suportados. Sem cadastro livre.

### Por que é (potencial) dívida técnica

Motoboy com moto não-listada não consegue usar o app. Em V1 isso é aceitável (foco em modelos populares no RJ), mas pode virar limitação real.

### Por que NÃO endereçar agora

- V1 explicitamente foca em 5 modelos
- Cadastro livre exigiria estrutura completamente diferente (Motoboy informa todos os dados técnicos manualmente UX ruim)

### Gatilho que justificaria endereçar

- Reclamação consistente de Motoboys com moto fora do catálogo
- Decisão de produto sobre cobertura

---

## ~~DT-6: Sem Versionamento de Schema do Storage~~ ENDEREÇADA (TASK-REF-11)

> **Resolvida parcialmente em 19/05/26 por TASK-REF-11.** Migração v5→v6 implementada inline em `criarEstadoInicial` (PerfilContext.tsx). `migrarPerfil.ts` ainda não existe como arquivo separado — permanece como recomendação para TASK-8.x.

---

## ~~DT-7: Substituição Automática vs Opt-in no Modo Personalizado~~ — ENDEREÇADA (23/05/26)

ADR-003 eliminou Modo Personalizado e Registros. TASK-REF-18 removeu `modoExibicao`; TASK-REF-19 removeu `diarioTrabalho` e funções derivadas (`resolverKmDia` ficou trivial, sem `>= 1` registro). A divergência com RN-25/RN-26 deixou de existir — os requisitos serão atualizados na TASK-DOC-010.

---

## DT-8: Naming `aluguelMensal` Ambíguo (NOVA)

### Situação atual

Campo `perfil.financeiro.aluguelMensal: number | null` armazena valor que pode ser semanal **ou** mensal, dependendo de `aluguelPeriodicidade`.

### Por que é dívida técnica

Nome do campo afirma "mensal" mas semanticamente é "valor base". Programador novo pode usar `aluguelMensal × 12` confiando no nome bug.

### Por que NÃO endereçar agora

- Funciona corretamente desde que se use `calcularCustoFinanciamentoAnual` (que respeita `aluguelPeriodicidade`)
- Renomear é refatoração que afeta storage existente exige migração

### Gatilho que justificaria endereçar

- Bug detectado por uso ingênuo do campo
- Migração de schema acontecendo por outro motivo (oportunidade de incluir o rename)

### Recomendação

Renomear para `aluguelValor` quando schemaVersion subir. Combinar com migração de outras coisas para reduzir custo.

---

## ~~DT-9: Sem Action de EDIT em Histórico e Diário~~ — ENDEREÇADA (23/05/26)

Histórico de Manutenção e Diário de Trabalho foram inteiramente removidos pela TASK-REF-19 — não existe mais nem `ADD_*` nem `DELETE_*` para esses conceitos. A divergência com RF-REG-12 deixou de existir.

---

## DT-10: INV-DISPLAY-1 Não Protegida (NOVA)

### Situação atual

Não há código garantindo que **pelo menos uma categoria em `categoriasAtivas` esteja `true`**. Motoboy pode desativar todas e ficar com donut vazio + total = 0.

### Por que é dívida técnica

- UX ruim mas não crash
- Estado tecnicamente válido mas semanticamente sem sentido

### Por que NÃO endereçar agora

- Não há crash
- Provavelmente usuário não chega a esse estado intencionalmente

### Gatilho que justificaria endereçar

- Reclamação de UX
- Refatoração da tela Detalhamento (boa hora para adicionar guard)

### Recomendação

Adicionar invariante no reducer (TOGGLE_CATEGORIA não permite desativar a última) ou aviso na UI.

---

## DT-11: Overrides Órfãos (NOVA)

### Situação atual

Não há mecanismo para limpar overrides cujo `id` não existe mais no Preset JSON após mudança de schema do JSON. Pode acumular lixo no storage.

### Por que é dívida técnica

- Storage cresce sem necessidade
- Overrides órfãos são dados mortos (não afetam cálculo, mas ocupam espaço)

### Por que NÃO endereçar agora

- Preset JSON ainda é estável (só pop110i.json existe)
- Quando adicionar mais modelos (Fase 12), risco aumenta

### Gatilho que justificaria endereçar

- Migração de schema dos Presets JSON
- TASK-12 (outros modelos)

### Recomendação

Função de limpeza em `migrarPerfil.ts` quando ele for criado.

---

## ~~DT-12: Duplicidade Abastecimento Diário × Histórico~~ — ENDEREÇADA (23/05/26)

Ambos os lugares (`diarioTrabalho` e `historicoManutencao.abastecimentos`) foram removidos pela TASK-REF-19. Sem dois fluxos, sem duplicidade.

---

---

## DT-14: SET_ONBOARDING_CAMPO fora do Onboarding (PARCIALMENTE ENDEREÇADA)

### Situação atual

A action `SET_ONBOARDING_CAMPO` aceita `campo: string` e `valor: unknown`. **Várias actions específicas já foram criadas progressivamente** conforme cada bloco foi tocado pelas REFs recentes:

| Action específica                | TASK que criou           |
| -------------------------------- | ------------------------ |
| `SET_MODO_REVISAO`               | REF-19 / Ajustes         |
| `SET_SITUACAO_MOTO`              | Ajustes                  |
| `SET_PARCELA`                    | Ajustes                  |
| `SET_ALUGUEL`                    | Ajustes                  |
| `SET_RESPONSABILIDADE_ALUGUEL`   | TASK-BG-006 (24/05/26)   |
| `SET_PERFIL_USO`                 | Ajustes                  |
| `SET_ANO_MOTO`                   | Ajustes                  |
| `SET_KM_ULTIMA_REVISAO`          | Ajustes                  |

### O que ainda usa `SET_ONBOARDING_CAMPO`

Apenas o fluxo de Onboarding propriamente dito (passos 1-9) — uso legítimo. Pode permanecer como está; a action virou específica do contexto que dá nome a ela.

### Recomendação

Considerar DT-14 **endereçada na prática**. Manter apenas o uso intra-onboarding. Se aparecer nova necessidade fora do onboarding, criar action específica direto.

---

## DT-15: Vínculo Implícito entre ServicoIndependente e Peça — ENDEREÇADA

### Situação atual

`ServicoIndependente.intervalKm` define a frequência canônica de um serviço de mão de obra. A tela **Insumos** exibe a vida útil da peça como somente leitura, espelhada do serviço vinculado quando ele está ativo.

Desde a TASK-REF-29, o vínculo peça↔serviço deixou de depender de igualdade de string e passou a usar `MAPA_PECA_PARA_SERVICO` em `src/utils/calculos.ts` (`oleo_motor` → `troca-oleo`, `pneu_traseiro` → `troca-pneu-traseiro`, etc.). `resolverIntervaloPeca`, `PaginaInsumos` e `DialogEdicaoCusto` usam a mesma resolução.

### Por que deixou de ser dívida técnica

- O vínculo agora é explícito e testado.
- Editar intervalo na aba Mão de Obra reflete no CPK da peça e na vida útil exibida.
- Serviço inativo continua caindo no fallback do preset.
- Override individual de peça continua tendo prioridade sobre o serviço.

### Risco residual

O mapa ainda precisa ser mantido quando novas peças/serviços forem adicionados. Há testes cobrindo que todo serviço apontado existe e que toda peça apontada existe no preset Pop 110i.

### Gatilho futuro

- Adição de segundo modelo de moto com IDs de peça distintos.
- Necessidade de um serviço cobrir múltiplas peças fora do mapeamento atual.

### Recomendação

Manter `MAPA_PECA_PARA_SERVICO` como fonte única do vínculo enquanto houver um catálogo pequeno. Considerar `pecaIds[]` explícito no tipo se múltiplos modelos tornarem o mapa insuficiente.

---

## DT-16: Excepcionais e normais somados no mesmo revisao.total — ENDEREÇADA

### Situação atual

Após TASK-BG-005, `calcularCustoRevisaoAnual` não soma serviços com `ehExcepcional: true`. `retifica-cabecote` e `retifica-completa` são derivadas de `servicosIndependentes` para `CustosPorCategoria.gastosCustom.detalhes.sugeridos` e aparecem no Detalhamento em Imprevistos, desligadas por padrão.

### Por que deixou de ser dívida técnica

Consumidores que usam `revisao.total` recebem apenas revisão periódica. Custos corretivos excepcionais têm categoria/filtro próprios e só entram no total quando `filtros.imprevistosSugeridos[id] === true`.

### Histórico da decisão

- TASK-RF-6.12 explicitou retíficas dentro de Manutenção, mas isso ligava o custo por padrão e gerava ruído antes da quilometragem mínima.
- TASK-BG-005 moveu retíficas para Imprevistos como lembrete acionável, mantendo preço/intervalo sincronizados com Mão de Obra Excepcional.

### Gatilho futuro

- Se houver uma categoria visual própria para custos corretivos, migrar `gastosCustom.detalhes.sugeridos` para um bloco dedicado em `CustosPorCategoria`.

### Recomendação

Manter retíficas fora de `revisao.total`. O padrão de filtro de imprevistos sugeridos deve continuar desligado por ausência (`undefined` não ativa custo).

---

## ~~DT-17: Componentes UI usam classes do `tailwindcss-animate` sem o plugin instalado~~ — ENDEREÇADA (23/05/26)

### Situação resolvida

Em 23/05/26 (correção pós-conclusão da TASK-BG-005), instalada a dep `tw-animate-css` (versão Tailwind v4 do `tailwindcss-animate`) e habilitada via `@import "tw-animate-css";` em `src/index.css`.

Com o plugin ativo, todas as classes referenciadas em `dialog.tsx`, `sheet.tsx` e `select.tsx` (`animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`, `slide-in-from-*`, `slide-out-to-*`) passam a gerar CSS corretamente.

### Por que era dívida técnica (histórica)

As classes do plugin eram referenciadas mas não geravam CSS, o que tornava o dialog visualmente quebrado em Tailwind v4 (popup renderizando como faixa vertical estreita sem conteúdo visível).

### Como ficou

- `tw-animate-css@^1.4.0` em `package.json > dependencies`.
- `@import "tw-animate-css";` no topo de `src/index.css`.
- `dialog.tsx` voltou ao padrão moderno do shadcn/ui com classes de animação ativas.
- `sheet.tsx` e `select.tsx` automaticamente passam a funcionar (mesmo sem terem sido tocados).

---

## Como Esta Lista Evolui

### Adicionar item

Quando agente identificar dívida técnica que vale registrar, adicionar entrada com:

1. Situação atual
2. Por que é dívida técnica
3. Por que NÃO endereçar agora
4. Gatilho que justificaria endereçar
5. Recomendação prática

### Remover item

Quando uma dívida for endereçada (refatorada, decidida, eliminada), **mover para histórico** abaixo, não deletar.

---

## Histórico (Dívidas Endereçadas)

### ~~DT-13: Estrutura por Índice em revisaoAutorizadaOverrides~~ — ENDEREÇADA (20/05/26)

Override por índice estava definido no tipo mas **nunca era lido** pelo calculador (orphan). Em TASK-REF-12, `calcularCustosPorCategoria` passou a aplicar `revisaoAutorizadaOverrides` ao `custoCicloCompleto` antes de calcular `revisaoAnual`. O override **funciona agora**.

A fragilidade de usar índice (em vez de chave estável como `intervaloKm`) permanece como risco aceito:
- O array `preset.revisaoAutorizada` é estável (manual Honda, 7 revisões fixas)
- Mudanças no array exigiriam migração de schema — gatilho adequado para rever

**Decisão:** fechar como endereçado. A fragilidade remanescente é risco conhecido e aceitável dado a estabilidade do dado.

---

## Histórico de Versões desta Lista

| Data            | Mudança                                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-09 (v1) | Criação inicial DT-1 a DT-6                                                                                                                                                                           |
| 2026-05-09 (v2) | **Reescrita corrigida.** DT-2 substancialmente revisada (interpretação errada do A12 corrigida). Adicionados DT-7 a DT-13 baseados em divergências reais encontradas na engenharia reversa do código. |
| 2026-05-11 (v3) | Referencias atualizadas para v6 e DT-12 confirmada sem sincronizacao no reducer.                                                                                                                      |
| 2026-05-19 (v4) | DT-6 endereçada (migração v5→v6 por TASK-REF-11). DT-13 nota de deferimento para TASK-REF-12. Adicionado DT-15 (vínculo implícito ServicoIndependente↔Peça). |
| 2026-05-20 (v5) | DT-13 endereçada — override aplicado no calculador por TASK-REF-12. DT-1 atualizado (96 testes). |
| 2026-05-20 (v6) | DT-16 adicionada — excepcionais e normais somados no mesmo `revisao.total` (simplificação MVP documentada por TASK-DOC-007). |
| 2026-05-24 (v7) | **TASK-DOC-009:** DT-2, DT-7, DT-9, DT-12 marcadas como ENDEREÇADAS (conceitos eliminados pela ADR-003 / TASK-REF-18/19/21). DT-14 atualizada — várias actions específicas já criadas, DT considerada endereçada na prática. |

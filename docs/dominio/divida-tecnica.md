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

## DT-2: Divergência RevisaoGeral.status entre Código e Requisitos

### Situação atual (CORRIGIDA na v2)

⚠️ **Importante:** a v1 desta DT estava errada. Eu havia interpretado o item A12 do checklist (`Tipos ResponsabilidadeCusto e RevisaoGeral.status divergentes`) como "esses dois tipos conflitam entre si". Na verdade são tipos diferentes para coisas diferentes:

- `ResponsabilidadeCusto = 'eu' | 'locador' | 'dividido'` (responsabilidade financeira em moto alugada)
- `RevisaoGeral.status = 'concluido' | 'pendente'` (status de uma revisão registrada)

A divergência real é entre:

- **Código atual:** `RevisaoGeral.status: 'concluido' | 'pendente'` (2 valores)
- **Requisitos v6 (RF-REG-05):** "Badge de status (CONCLUÍDO / EM DIA / PRÓXIMO)" → 3 valores

### Por que é dívida técnica

- A UI exibe **3 estados de badge** mas o tipo só permite **2**
- Implementação atual está **abaixo do requisito**
- Quando a feature de Registros for tocada (TASK-5.x), inconsistência aparece

### Por que NÃO refatorar agora

- Não há feature funcional usando os 3 estados ainda
- Status `'em_dia'` e `'proximo'` provavelmente seriam **calculados** (a partir de km e data), não armazenados
- Decisão de produto: armazenar 3 estados literais OU armazenar 2 + calcular o terceiro

### Gatilho que justificaria endereçar

- TASK que toque a tela de Registros de Revisão (TASK-5.x)
- Implementação do badge de status na UI

### Recomendação

**Quando uma task tocar Revisões pela primeira vez, chamar o `modelador-dominio` para reconciliar:**

- Adicionar `'em_dia'` e `'proximo'` ao type union? (mais simples)
- Ou armazenar 2 estados + calcular o 3º como derivado? (mais elegante)
- Decisão é do produto.

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

## DT-7: Substituição Automática vs Opt-in no Modo Personalizado (NOVA)

### Situação atual

Em `modoExibicao === 'personalizado'`, a função `resolverKmDia()` em `utils/calculos.ts` substitui `kmPorDia` declarado pelo Motoboy pela **média do diário** assim que houver `>= 1` registro.

```typescript
if (modoExibicao === 'personalizado' && diarioTrabalho.length >= 1) {
  return media(diarioTrabalho.map((r) => r.kmPercorridos));
}
```

### Divergência com Requisitos v6

- **RN-25 dos Requisitos:** "Após **5+ Registros**, kmDiaMedioReal é calculado. **O usuário pode optar por usá-lo** em vez do valor do onboarding."
- **Diferença dupla:**
  1. Quantidade mínima: código usa `>= 1`, requisitos pedem `>= 5`
  2. Comportamento: código substitui automaticamente, requisitos pedem opt-in (Motoboy escolhe)

### Mesma divergência se aplica a:

- `resolverIntervaloPeca` e `resolverPrecoPeca` (`>= 1` no código vs `>= 2` em RN-26)

### Por que é dívida técnica

- Comportamento atual pode confundir Motoboy: "registrei 1 dia que rodei pouco e meu cálculo virou tudo errado"
- Divergência entre código e requisito é problema potencial de QA / produto

### Por que NÃO endereçar agora

- Não bloqueia uso atual (Motoboy ainda não tem registros suficientes para sentir o impacto)
- Decisão de produto: requisito original ou comportamento atual?

### Gatilho que justificaria endereçar

- Feedback de Motoboy reportando "valores estranhos no modo personalizado"
- TASK-5.x (registros) sendo implementada (boa hora para rever)

### Recomendação

**Próxima TASK que tocar Modo Personalizado, chamar `modelador-dominio` para decidir:**

- (a) Ajustar código para `>= 5` automático
- (b) Ajustar para `>= 5` + opt-in (mais alinhado com RN-25)
- (c) Documentar e manter `>= 1` (código vence requisito atualizar requisito)

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

## DT-9: Sem Action de EDIT em Histórico e Diário (NOVA)

### Situação atual

Para Histórico de Manutenção (5 listas) e Diário de Trabalho, o `PerfilAction` só prevê `ADD_*` e `DELETE_*`. Para corrigir um registro com erro de digitação, Motoboy precisa **deletar e recriar**.

### Divergência com Requisitos v6

- **RF-REG-12:** "Editar ou excluir qualquer registro via swipe-left ou long-press"
- Código atual só implementa "excluir"

### Por que é dívida técnica

- UX pior corrigir erro pequeno é trabalhoso
- Pode levar Motoboys a desistir de registrar (medo de errar)

### Por que NÃO endereçar agora

- Funcionalidade básica de excluir já cobre o erro grave
- Implementação fácil (paralela aos ADD), pode ser feita quando UI dos formulários de edição existir

### Gatilho que justificaria endereçar

- TASK-5.x (formulários de Registros) adicionar EDIT junto

### Recomendação

Marcar como funcionalidade pendente da TASK-5.x.

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

## DT-12: Duplicidade Abastecimento Diário × Histórico (CONFIRMADA)

### Situação atual

Motoboy pode registrar abastecimento em dois lugares:

- `perfil.diarioTrabalho[].abasteceu` + `litros` + `precoLitro` (no Diário do dia)
- `perfil.historicoManutencao.abastecimentos[]` (no Histórico, formulário separado)

### Por que é dívida técnica

- Mesmo evento físico = dois registros possíveis
- Registros são independentes (não há sincronização no reducer)
- Cálculo de consumo real usa apenas `Abastecimento[]` do Histórico; Diário é ignorado

### Por que NÃO endereçar agora

- A feature de Registros ainda não foi implementada na UI (TASK-5.x)
- Decisão de produto: manter dois fluxos ou unificar

### Gatilho que justificaria endereçar

- TASK-5.x (formularios de registros) decidir fluxo unico
- Feedback de usuario sobre duplicidade/confusao

---

---

## DT-14: SET_ONBOARDING_CAMPO fora do Onboarding (PRIORIDADE ALTA)

### Situação atual

A action `SET_ONBOARDING_CAMPO` aceita `campo: string` e `valor: unknown`. Ela e usada fora do Onboarding para atualizar campos que nao possuem actions dedicadas (ex.: `financeiro.situacaoMoto`, `financeiro.responsabilidadeAluguel`, `perfilManutencao`).

### Por que e dívida técnica

- **Type-safety perdida:** `unknown` permite valores incompatíveis sem alerta de tipo.
- **Invariantes nao protegidas:** e possivel sobrescrever blocos inteiros e violar invariantes (INV-FIN-1, INV-MANUT-\*, etc).
- **Confusao semantica:** action chamada "ONBOARDING" usada fora do Onboarding conflita com a Linguagem Ubiqua.

### Por que NÃO refatorar imediatamente

- Funciona em producao sem bug observado.
- Refatoracao exige mapear todos os usos atuais e ajustar chamadas.

### Gatilho que justificaria enderecar

- **Enderecar antes de TASK-5.1 (formularios de Registros)**, quando novas actions de update serao introduzidas.

### Recomendação

Criar actions especificas progressivamente conforme cada bloco for tocado. Lista inicial:
`SET_SITUACAO_MOTO`, `SET_RESPONSABILIDADE_ALUGUEL`, `SET_PERFIL_PECAS_GLOBAL`, `SET_MODO_REVISAO`.

---

## DT-15: Vínculo Implícito entre ServicoIndependente e Peça (NOVA)

### Situação atual

`ServicoIndependente` possui `intervalKm` que define a frequência de um serviço de mão de obra. A aba **Preço Peças** (TASK-RF-6.2) exibirá `intervalKm` de peça somente leitura espelhado de `ServicoIndependente`. O vínculo entre um serviço e suas peças é **implícito por convenção de IDs** (ex: `id: 'troca-oleo'` em `ServicoIndependente` e `id: 'oleo_motor'` em `PresetMoto.pecas[]`). Não há campo `pecaIds[]` ou tipagem de relacionamento.

### Por que é dívida técnica

- Vínculo implícito: se IDs divergirem (por rename ou novo preset), Preço Peças não encontra a peça correspondente sem erro de tipo
- Dificulta suporte a múltiplos modelos futuros com IDs de peça distintos

### Por que NÃO endereçar agora

- Há apenas 1 modelo (pop110i) com IDs estáveis
- Adicionar `pecaIds[]` a `ServicoIndependente` aumentaria complexidade antes de validação em produção

### Gatilho que justificaria endereçar

- Adição de segundo modelo de moto com IDs de peça distintos
- Bug de inconsistência ID detectado em produção

### Recomendação

Documentar a convenção de mapeamento ID em comentário na tela Preço Peças (TASK-RF-6.2). Adicionar campo `pecaIds[]` opcional quando segundo modelo entrar.

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

# Tarefas em Andamento

---

# TASK-REF-41 - Remover PerfilUso e consolidar padrão profissional editável (DT-18)

- **Status:** PLANEJADA - BLOQUEADA PELA TASK-REF-42
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 07:38
- **Data-hora início:** 06/06/26 17:17
- **Dependências:** TASK-REF-42
- **REQ/ADR/DT:** DT-18, DT-19, ADR-018, ADR-014, INV-VIDA-UTIL-1, INV-CALC-2
- **Observações:** decisão humana de 06/06/26 substituiu o plano de fatores. O MVP atende uso
  profissional/intenso com um único conjunto de referências editáveis. Não existem usuários e não
  haverá migration de perfis legados.

## ADR Vinculada

- **ADR-018:** Padrão único de uso profissional com parâmetros editáveis -
  `docs/arquitetura/ADR/ADR-018.md`
- **Status da ADR:** Aceita.

A ADR-018 autoriza esta tarefa e a TASK-REF-42 a alterarem `src/utils/calculos.ts`, mantendo o gate
de revisão, testes e aprovação explícita da INV-CALC-2.

## Decisão de Produto Registrada

1. Não haverá modo `entrega | passageiro` no MVP.
2. O app terá uma única referência inicial por modelo, orientada ao uso profissional/intenso de
   entregadores e profissionais de transporte por aplicativo.
3. Não serão aplicados fatores automáticos de baú, carga, passageiro ou severidade sem dados
   confiáveis.
4. Autonomia e preços continuam editáveis nos fluxos atuais. A vida útil em km continua editável
   somente nos cards de serviços avulsos da aba Mão de Obra.
5. Uso casual será decidido futuramente e não manterá infraestrutura especulativa agora.
6. Não existem usuários; dados locais incompatíveis de desenvolvimento podem ser descartados.
7. Suspensão não faz parte desta tarefa.
8. A exibição e edição da vida útil desses mesmos serviços avulsos no onboarding foram separadas
   na TASK-RF-6.28.

## Diagnóstico Atual

- `PerfilUso` ainda existe no tipo, schema, defaults, fixture, reducer, onboarding, Ajustes,
  Detalhamento, ajuda e testes.
- `entrega` seleciona `consumoKmLComBau` e `intervaloKmEntrega`; `passageiro` seleciona os campos
  base.
- O cálculo de combustível já usa a autonomia gravada e editável no perfil. O modo só escolhe o
  valor copiado inicialmente e o valor usado pelo botão de restaurar.
- A manutenção ainda disputa intervalo entre peça, pneu, serviço efetivo e default global. Essa
  fragilidade pertence à DT-19 e deve ser resolvida primeiro pela TASK-REF-42.
- Os `servicosManutencao[].intervalKm` atuais já são referências orientadas ao desgaste
  profissional e sincronizadas com a revisão quando aplicável.

## Análise de Impacto

| Área | Mudança | Risco | Mitigação |
|---|---|---|---|
| Perfil persistido | Remover `PerfilUso` e action associada | Tipo e schema divergirem | Alterar juntos; sem migration legada |
| Presets | Um consumo e um intervalo canônico por componente | Escolher campo-base incorreto | Usar referência profissional já adotada e caracterizar números |
| Cálculo | Remover branch entrega/passageiro | Alterar CPK silenciosamente | Baselines antes/depois e gate INV-CALC-2 |
| UI | Remover seleção do onboarding, Ajustes e labels | Passos e progresso quebrarem | Substituição do Passo 4 fica na RF-6.28; smoke do fluxo |
| Reset | Restaurar para único padrão profissional | Reset divergir do cálculo | Consumir a mesma fonte do preset |
| Documentação | Remover linguagem de perfil de uso | Docs vivos contradizerem a ADR | Atualizar glossário, modelo, cálculo e ajuda |

**Blast radius:** aproximadamente 21 arquivos em `src/`, além de documentação. A simplificação
remove decisões de produto, mas continua sendo Strict por tocar schema, presets e cálculo.

## Planejamento Proposto

### 1. Caracterizar o comportamento profissional atual

- Fixar testes dos valores efetivos usados hoje pelo caminho profissional:
  - consumo inicial atualmente associado a `consumoKmLComBau`;
  - intervalos canônicos resultantes dos serviços/presets;
  - custos de combustível e manutenção dos dois modelos.
- Registrar divergências encontradas; não escolher silenciosamente entre valores concorrentes.

### 2. Concluir primeiro a TASK-REF-42

- Representar procedência/override real do intervalo.
- Fazer cálculo, Insumos, Detalhamento e Mão de Obra consumirem a mesma fonte efetiva.
- Garantir que editar e restaurar alterem o valor realmente usado no cálculo.

### 3. Consolidar o contrato dos presets

- Substituir `consumoKmL` + `consumoKmLComBau` por um único consumo profissional.
- Remover `intervaloKmEntrega`.
- Remover campos de intervalo duplicados que deixarem de ser canônicos após a REF-42.
- Manter preço e vida útil por componente orientados por dados do preset, sem fatores no código.
- Atualizar schema e testes de contrato dos presets.

### 4. Remover PerfilUso do estado

- Remover o tipo `PerfilUso`, `moto.perfilUso`, `SET_PERFIL_USO` e defaults relacionados.
- Elevar `VERSAO_SCHEMA_ATUAL`.
- Não implementar migration: perfil local incompatível volta ao fluxo inicial conforme a
  estratégia definida para dados de desenvolvimento.
- Atualizar schema Zod, reducer, fixtures e testes.

### 5. Simplificar onboarding e Ajustes

- Remover o atual Passo 4 de escolha entrega/passageiro e recalcular navegação/progresso
  temporariamente, sem implementar antecipadamente a TASK-RF-6.28.
- Remover o segmentado "Perfil de trabalho" de Ajustes e seu reset.
- Remover labels de tipo de uso em confirmação, Detalhamento e ajuda.
- A TASK-RF-6.28 reintroduzirá o Passo 4 com os mesmos serviços avulsos da aba Concessionária,
  mostrando apenas o input de vida útil estimada em km.

### 6. Unificar consumo e restauração

- O onboarding inicializa autonomia com o único consumo profissional do modelo.
- Insumos e o diálogo de edição usam o mesmo valor como padrão de restauração.
- O cálculo continua usando a autonomia persistida/editável do usuário.
- Não criar flag de baú, finalidade ou procedência adicional para consumo.

### 7. Sincronizar documentação

- Atualizar glossário, entidade/bloco da moto, entidade do preset, estado inicial,
  `calculos-visao`, invariantes, ajuda e DT-18.
- Registrar que os defaults são referência profissional editável, não promessa de gasto exato.
- Manter uso casual e suspensão explicitamente fora do MVP.

## Critérios de Aceite

- Não existe `PerfilUso`, `perfilUso`, `SET_PERFIL_USO` ou opção entrega/passageiro no código vivo.
- Cada preset possui um único consumo profissional e uma única fonte efetiva de intervalo por
  componente.
- Não existem `consumoKmLComBau` ou `intervaloKmEntrega` no contrato de runtime.
- Nenhum fator automático de finalidade, baú, carga, passageiro ou severidade entra no cálculo.
- Autonomia continua editável no fluxo atual; a vida útil dos serviços avulsos continua editável
  na aba Mão de Obra e o reset usa o padrão profissional.
- Alterar a vida útil de um serviço avulso reflete igualmente no cálculo e nas telas consumidoras.
- O fluxo de onboarding continua concluível sem o passo removido.
- Dados locais antigos não exigem migration e não causam inicialização inválida.
- Baselines profissionais dos dois presets permanecem caracterizados; mudanças intencionais são
  documentadas.
- ADR, requisitos, glossário, invariantes, modelagem e dívida técnica ficam sincronizados.
- `npm run test`, `npm run lint` e typecheck/build passam de verdade.
- Mudanças de UI recebem validação visual humana antes da conclusão.

## Fora do Escopo

- Implementar uso casual.
- Modelar suspensão.
- Criar fatores por condição de uso.
- Preservar perfis locais antigos.
- Implementar a revisão editável de estimativas no onboarding; pertence à TASK-RF-6.28.
- Alterar fórmulas financeiras, revisão autorizada ou estimativa de mão de obra.

## Riscos Residuais

- O padrão profissional pode não representar todo usuário; a mitigação é edição explícita, não
  multiplicadores automáticos.
- O mesmo serviço avulso pode usar valores efetivos diferentes entre cálculo e UI até a REF-42
  consolidar sua fonte.
- Remover o Passo 4 antes da RF-6.28 reduz temporariamente o onboarding para oito passos.
- Um futuro modo casual exigirá revisar dados e UX, não apenas reintroduzir um enum.

## Execução

- 06/06/26 17:17: plano inicial de fatores registrado.
- 06/06/26 17:42: humano decidiu eliminar entrega/passageiro e usar padrão profissional único,
  editável, sem fatores automáticos.
- 06/06/26 17:42: confirmado que não existem usuários; migration legada removida do escopo.
- 06/06/26 17:42: ADR-018 aceita e tarefa reformulada; execução aguarda a TASK-REF-42.
- 06/06/26 17:42: TASK-RF-6.28 criada para transparência e edição das estimativas no onboarding.
- 06/06/26 17:55: escopo corrigido pelo humano: somente os serviços avulsos já editáveis em Mão
  de Obra entram no onboarding, apenas com o input de vida útil em km.

## Testes

- Não executados: esta etapa alterou somente ADR, planejamento, requisito e backlog.

---

# TASK-REF-42 - Tornar o serviço a fonte canônica explícita da vida útil (DT-19)

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 06/06/26 07:38
- **Data-hora início:** 06/06/26 18:00
- **Dependências:** -
- **REQ/ADR/DT:** DT-19, DT-18, ADR-014, ADR-018, INV-VIDA-UTIL-1, INV-CALC-2
- **Observações:** primeira entrega do pacote REF-41. Remove a inferência de edição pela diferença
  contra `SERVICOS_INDEPENDENTES_PADRAO` e prepara a fonte compartilhada pelo onboarding futuro.

## ADR Vinculada

- **ADR-014:** vida útil mora no serviço e avulsos sincronizam com a revisão.
- **ADR-018:** padrão profissional único e editável; autoriza alteração em `calculos.ts`.
- **Status:** ambas aceitas.

## Análise de Impacto

| Área | Mudança | Risco | Mitigação |
|---|---|---|---|
| Tipo/schema | Marcar explicitamente intervalo informado pelo usuário | Flag se perder em merges | Testes de schema, reducer e resolução |
| Preset/perfil | Preset fornece base; perfil só vence com flag explícita | Valor legado vencer indevidamente | Sem usuários; ausência da flag significa preset |
| Cálculo | Serviço vinculado vira fonte canônica da vida útil | Alterar custos silenciosamente | Testes por Pop/Factor e prioridade de override |
| Insumos/Detalhamento | Consumir lista efetiva, não perfil cru | Display divergir do cálculo | Helper compartilhado e teste de integração |
| Reset | Remover procedência de usuário e voltar ao preset | Reset manter flag | Dispatch do serviço-base sem flag |

## Planejamento Aprovado

1. Adicionar `intervaloKmInformadoUsuario?: boolean` a `ServicoIndependente` e ao schema.
2. Ao editar `Intervalo (km)` no `CardServico`, gravar valor e flag `true`.
3. Ao restaurar, substituir pelo serviço-base do preset, removendo a flag.
4. Em `resolverServicosManutencaoPerfil`, usar `servicoBase.intervalKm` por padrão e o valor do
   perfil somente quando a flag for `true`; preço e ativação mantêm as regras atuais.
5. Remover `INTERVALOS_PADRAO_SERVICO` e `resolverServicoComIntervaloEditado`.
6. Resolver vida útil pela ordem: override explícito de peça existente → serviço vinculado efetivo
   → fallback do preset apenas quando não houver serviço.
7. Fazer `PaginaInsumos` e `DialogEdicaoCusto` usarem
   `resolverServicosManutencaoPerfil(perfil, preset)`, igual ao cálculo.
8. Atualizar testes de cálculo, normalização, card e integração; sincronizar INV-VIDA-UTIL-1,
   modelagem e DT-19.

## Critérios de Aceite

- Nenhuma decisão de procedência compara intervalo com default global.
- Serviço-base do preset é canônico mesmo quando seu número coincide com algum default global.
- Edição consciente do usuário vence o preset por flag explícita.
- Reset remove a flag e restaura o valor do preset.
- Cálculo, Insumos, Detalhamento e Mão de Obra resolvem o mesmo intervalo.
- Override explícito de peça preserva sua prioridade enquanto existir no contrato.
- `npm run test`, `npm run lint` e typecheck/build passam realmente.

## Execução

- 06/06/26 18:00: plano aprovado pelo pedido de execução do humano; implementação iniciada.

## Testes

- Pendentes.

# Dívida Técnica do Domínio EstimaMoto

> **Status:** v12, auditada contra código, testes e ADRs em 06/06/2026.
> **Propósito:** registrar somente dívidas técnicas vigentes do domínio. Itens resolvidos,
> escolhas arquiteturais sem prejuízo comprovado e limitações de produto ficam fora da lista ativa.

---

## Critério da Lista

Um item permanece aqui quando existe:

- comportamento frágil, ambíguo ou inconsistente no código atual;
- custo futuro concreto causado pela solução atual;
- motivo explícito para não corrigir imediatamente;
- gatilho que permita reavaliar a prioridade.

O histórico detalhado dos itens removidos continua no Git, nas ADRs e nas tarefas concluídas.

---

## Resumo Atual

| ID | Dívida vigente | Prioridade relativa |
| --- | --- | --- |
| DT-11 | Overrides e filtros podem ficar órfãos após mudança de preset | Média |
| DT-18 | `PerfilUso` mistura finalidade, carga e severidade de desgaste | Média |
| DT-19 | Intervalo peça-serviço depende de comparação com default global | Alta |

---

## DT-11: Overrides e filtros podem ficar órfãos

### Situação atual

O schema valida o formato dos dados, mas aceita IDs livres e índices sem conferir se ainda
existem no preset ativo:

- `pecasOverrides[].id`;
- `servicosIndependentes[].id`;
- `revisaoAutorizadaOverrides[].index`;
- `imprevistosSugeridosAtivos`;
- `filtrosManutencao.manutencaoPorPeca`;
- `filtrosManutencao.revisaoPorServico`;
- `perfilManutencao.estimativaMaoDeObraPorServico`.

Entradas desconhecidas geralmente são ignoradas pelos consumidores ou descartadas apenas
na visão normalizada de cálculo, mas continuam persistidas no perfil.

### Por que é dívida técnica

Mudanças de IDs, remoção de itens ou alteração do ciclo de revisão podem deixar dados mortos
no storage. Além do crescimento desnecessário, um ID reutilizado no futuro pode reativar uma
configuração antiga sem intenção do usuário.

### Por que não corrigir agora

Os presets são versionados junto com o app, o volume dos registros é pequeno e ainda não há
uma política geral de migração por versão de preset.

### Gatilho

- renomear ou remover IDs de peças e serviços;
- alterar a quantidade ou ordem de revisões;
- adicionar versionamento próprio aos presets;
- implementar exportação e importação de perfis.

### Recomendação

Normalizar o perfil contra o preset ativo na fronteira de carga, removendo referências
inexistentes. A limpeza deve ser testada e não pode depender apenas do schema estrutural.

---

## DT-18: `PerfilUso` mistura finalidade, carga e severidade

### Situação atual

`PerfilUso` aceita somente `entrega | passageiro` e concentra dimensões diferentes:

- `entrega` seleciona consumo com baú e `intervaloKmEntrega` para peças;
- `passageiro` usa consumo e intervalos-base;
- pneus têm uma única `vidaUtilKm`;
- carga, passageiro frequente, baú e uso severo não são fatores independentes;
- não há modo casual;
- suspensão não está modelada como item de desgaste.

Além disso, a ADR-014 definiu que o intervalo canônico do componente deve morar no serviço,
enquanto as peças ainda carregam `intervaloKm` e `intervaloKmEntrega`. A coexistência desses
dois modelos alimenta a fragilidade da DT-19.

### Por que é dívida técnica

O enum mistura finalidade de uso com condição física da moto. Isso limita novos perfis e
pode subestimar desgaste de pneus, freios, suspensão e consumo sem permitir explicar qual
fator causou a diferença.

### Por que não corrigir agora

A mudança atravessa schema, onboarding, Ajustes, presets, cálculo e explicações da UI. A
regra correta ainda exige decisão de produto e dados confiáveis para os fatores.

### Gatilho

- adicionar uso casual;
- comparar custos entre perfis;
- incluir carga, baú ou passageiro como escolhas independentes;
- modelar suspensão;
- cadastrar modelo que exija fatores de desgaste diferentes.

### Recomendação

Separar finalidade de uso das condições de carga e severidade. Manter uma fonte-base de
vida útil e aplicar fatores explícitos por componente, evitando novos campos editáveis
paralelos para cada modo.

---

## DT-19: Intervalo peça-serviço depende do default global

### Situação atual

`normalizarPerfilMvp` mescla os serviços do preset no perfil usado pelo cálculo.
`resolverServicoComIntervaloEditado`, porém, decide se um intervalo foi editado comparando
o valor recebido com `SERVICOS_INDEPENDENTES_PADRAO`.

Com isso, um intervalo vindo do preset e diferente do default global é tratado como se fosse
override do usuário. A peça passa a usar o intervalo do serviço por consequência dessa
diferença. Se o default global for atualizado para o mesmo valor, a peça volta ao intervalo
próprio do preset.

Existe também diferença entre consumidores:

- o cálculo recebe serviços normalizados pelo preset;
- `PaginaInsumos` e parte de `DialogEdicaoCusto` resolvem o intervalo usando
  `perfil.servicosIndependentes` sem a mesma normalização.

Exemplo atual: na Pop 110i, o pneu dianteiro tem `vidaUtilKm: 25.000`, o serviço efetivo do
preset usa `24.000` e o default global usa `25.000`. O cálculo pode adotar `24.000`, enquanto
Insumos cai no fallback de `25.000`.

### Por que é dívida técnica

- a origem do intervalo não é representada no dado;
- valor de preset e edição do usuário são inferidos por comparação;
- atualizar um default aparentemente inofensivo pode alterar o cálculo;
- cálculo e UI podem apresentar intervalos diferentes para o mesmo componente.

### Por que não corrigir agora

A correção toca `src/utils/calculos.ts`, persistência de overrides e consumidores de
manutenção. Também precisa ser alinhada com a decisão de modelagem da DT-18.

### Gatilho

- corrigir a divergência de intervalo exibido e calculado;
- revisar a modelagem de `PerfilUso`;
- alterar defaults globais de serviços;
- adicionar novos modelos com intervalos diferentes.

### Recomendação

Representar explicitamente a procedência do intervalo ou persistir somente overrides reais
do usuário. Todos os consumidores devem receber a mesma lista efetiva de serviços. Adicionar
teste de integração que compare o intervalo exibido, o intervalo da peça no cálculo e o
intervalo do serviço vinculado.

---

## Resultado da Auditoria de 06/06/2026

| ID | Resultado | Evidência resumida |
| --- | --- | --- |
| DT-1 | Removida: não é dívida comprovada | Cálculos estão centralizados em funções puras, com API e testes densos; mover comportamento para `PerfilUsuario` seria outra arquitetura, não correção. |
| DT-2 | Removida: resolvida | O tipo de domínio antigo foi eliminado; ocorrências atuais de “Revisão Geral” são apenas conceito de UI/cálculo. |
| DT-3 | Removida: não é dívida comprovada | Zod e reducer já validam domínio numérico; o produto é estimador e não há defeito de precisão registrado que justifique Value Objects transversais. |
| DT-4 | Removida: não é dívida atual | Não há necessidade de event bus, backend ou sincronização. Analytics continua backlog próprio e `analytics.ts` ainda não existe. |
| DT-5 | Removida: limitação de produto | O catálogo atual deriva de dois presets validados. Cadastro livre está fora do escopo, não é falha da arquitetura vigente. |
| DT-6 | Removida: resolvida | Storage usa chaves `estimamoto:v1:*`, schema versionado, migração explícita e fallback recuperável. |
| DT-7 | Removida: resolvida | `modoExibicao`, diário e fluxo personalizado foram eliminados pela ADR-003 e tarefas relacionadas. |
| DT-8 | Removida: resolvida pela TASK-REF-38 | O contrato v2 usa `aluguelValor`; perfis v1 migram antes da validação e a fórmula mensal/semanal foi preservada. |
| DT-9 | Removida: resolvida | As coleções e actions de histórico/diário citadas pelo item não existem mais. |
| DT-10 | Removida: resolvida pela TASK-REF-39 / ADR-017 | Manutenção gateia revisão, serviços e peças; filtros finos persistem e recebem estado visual desbotado/bloqueado com o pai off. Todas as categorias desligadas é estado válido. |
| DT-11 | Mantida e ampliada | IDs e índices órfãos continuam aceitos estruturalmente e persistidos. |
| DT-12 | Removida: resolvida | Os dois fluxos de abastecimento citados foram removidos. |
| DT-13 | Removida: resolvida | Overrides de revisão autorizada são aplicados no cálculo e nas projeções. |
| DT-14 | Removida: resolvida no escopo original | `SET_ONBOARDING_CAMPO` só é usado dentro do onboarding e o reducer valida o perfil resultante. |
| DT-15 | Removida: resolvida | O vínculo peça-serviço usa `MAPA_PECA_PARA_SERVICO`; a fragilidade restante está descrita na DT-19. |
| DT-16 | Removida: resolvida | Serviços excepcionais são excluídos de `revisao.total` e tratados como imprevistos sugeridos. |
| DT-17 | Removida: resolvida | `tw-animate-css` está instalado e importado em `src/index.css`. |
| DT-18 | Mantida e atualizada | O enum e os caminhos de cálculo continuam simplificados; referências à TASK-REF-32 como trabalho futuro foram removidas. |
| DT-19 | Mantida e elevada | A dependência do default global permanece e já permite divergência entre intervalo exibido e calculado. |

---

## Como Esta Lista Evolui

### Adicionar item

Registrar:

1. situação comprovada no código atual;
2. custo ou risco concreto;
3. motivo para adiamento;
4. gatilho de reavaliação;
5. recomendação prática.

### Remover item

Quando a dívida for resolvida ou deixar de representar dívida técnica, removê-la da lista
ativa. O Git, a tarefa concluída e a ADR relacionada preservam o histórico.

---

## Histórico de Versões

| Data | Versão | Mudança |
| --- | --- | --- |
| 09/05/2026 | v1-v2 | Criação e primeira revisão por engenharia reversa. |
| 11/05 a 04/06/2026 | v3-v9 | Inclusão e fechamento incremental de DT-1 a DT-19. |
| 06/06/2026 | v10 | Auditoria integral contra o código atual; lista ativa reduzida a DT-8, DT-10, DT-11, DT-18 e DT-19. |
| 06/06/2026 | v11 | TASK-REF-38 encerra DT-8; lista ativa reduzida a DT-10, DT-11, DT-18 e DT-19. |
| 06/06/2026 | v12 | TASK-REF-39 e ADR-017 encerram DT-10; lista ativa reduzida a DT-11, DT-18 e DT-19. |

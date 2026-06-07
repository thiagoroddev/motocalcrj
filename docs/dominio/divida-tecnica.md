# Dívida Técnica do Domínio EstimaMoto

> **Status:** v15, auditada contra código, testes e ADRs em 06/06/2026.
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
| DT-18 | Onboarding ainda contém passo transitório de referência profissional | Média |

---

## DT-18: passo transitório de referência profissional no onboarding

### Situação atual

Após a TASK-REF-41.2, os presets e o cálculo possuem uma referência profissional explícita por
modelo e ano:

- `consumoKmLComBau` e `intervaloKmEntrega` foram removidos;
- `PerfilUso`, seu campo persistido, action e parâmetros de cálculo foram removidos;
- Preferências, confirmação e Detalhamento não exibem mais entrega/passageiro;
- o Passo 4 permanece temporariamente como aviso informativo até a TASK-REF-41.3 removê-lo da rota;
- não há modo casual;
- suspensão não está modelada como item de desgaste.

O serviço efetivo é a fonte canônica da vida útil. `intervaloKm` e `vidaUtilKm` permanecem apenas
como fallbacks profissionais do preset.

### Por que é dívida técnica

O núcleo da dívida foi resolvido. Resta retirar o passo transitório da navegação e apresentar os
campos editáveis de vida útil no onboarding, sem reintroduzir perfis automáticos.

### Por que não corrigir agora

A remoção foi dividida para reduzir o risco. A 41.1 consolidou os dados e a 41.2 removeu o campo
persistido e seus consumidores. A TASK-REF-41.3 encerra a parte visual.

### Gatilho

- concluir a TASK-REF-41.3.

### Recomendação

Concluir a TASK-REF-41.3 removendo o passo transitório e expondo no onboarding apenas os campos
editáveis aprovados. Uso casual e suspensão permanecem fora do MVP até existirem dados e requisito
próprios.

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
| DT-11 | Removida: resolvida pela TASK-REF-40 / ADR-010 | A carga normaliza todos os perfis contra o preset canônico e persiste a limpeza em best-effort somente quando necessário. |
| DT-12 | Removida: resolvida | Os dois fluxos de abastecimento citados foram removidos. |
| DT-13 | Removida: resolvida | Overrides de revisão autorizada são aplicados no cálculo e nas projeções. |
| DT-14 | Removida: resolvida no escopo original | `SET_ONBOARDING_CAMPO` só é usado dentro do onboarding e o reducer valida o perfil resultante. |
| DT-15 | Removida: resolvida | O vínculo peça-serviço usa `MAPA_PECA_PARA_SERVICO`; a TASK-REF-42 eliminou também a inferência de procedência que restava na DT-19. |
| DT-16 | Removida: resolvida | Serviços excepcionais são excluídos de `revisao.total` e tratados como imprevistos sugeridos. |
| DT-17 | Removida: resolvida | `tw-animate-css` está instalado e importado em `src/index.css`. |
| DT-18 | Mantida e atualizada | O enum e os caminhos de cálculo continuam simplificados; referências à TASK-REF-32 como trabalho futuro foram removidas. |
| DT-19 | Removida: resolvida pela TASK-REF-42 / ADR-018 | A procedência é explícita; serviço efetivo é canônico e cálculo, Insumos e Detalhamento usam a mesma mesclagem preset/perfil. |

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
| 06/06/2026 | v13 | TASK-REF-40 e ADR-010 encerram DT-11; lista ativa reduzida a DT-18 e DT-19. |
| 06/06/2026 | v14 | ADR-018 fecha a decisão da DT-18: padrão profissional único e editável, sem entrega/passageiro ou fatores automáticos. |
| 06/06/2026 | v15 | TASK-REF-42 encerra DT-19 com procedência explícita e serviço efetivo canônico; lista ativa reduzida à DT-18. |

# Requisitos Funcionais - MotoCalc RJ

> Documento operacional derivado da especificação consolidada em 09/05/2026 e atualizado pelas ADRs e tarefas posteriores.
> IDs dos requisitos: RF-ON-xx, RF-EST-xx, RF-DET-xx, RF-MO-xx, RF-VU-xx, RF-PERF-xx, RF-DOC-xx, RF-CONF-xx, RF-EXP-xx.
> **Nota:** RF-REG-* e RF-FORM-* (tela Registros e formulários) foram **adiados via ADR-003** e removidos deste documento operacional. A ADR é a fonte da decisão e do escopo adiado.

---

## Onboarding (RF-ON)

| ID | Descrição | Critério de Aceite | Status |
|---|---|---|---|
| RF-ON-01 | Exibir onboarding apenas no primeiro acesso. Com perfil salvo, ir direto à aba ESTIMATIVA. | `localStorage.perfil.onboardingConcluido === true` → redireciona para `/estimativa`. | ✅ CONCLUÍDO |
| RF-ON-02 | Barra de progresso visual, indicando "PASSO X DE 10" e percentual (Confirmação = "PASSO FINAL"). | Sub-rotas de Situação contam como o passo de Situação. Ordem canônica em ADR-020. | ✅ CONCLUÍDO |
| RF-ON-03 | Navegação "Voltar" funcional em todos os passos exceto o primeiro (Modelo), sem perder respostas. | Estado do onboarding mantido em memória (não persistido até `Concluir`). | ✅ CONCLUÍDO |
| RF-ON-04 | Lógica condicional no passo Situação: exibir sub-telas (financiamento/aluguel/responsabilidade) conforme a situação. | Testes automatizados validam cada ramo (`onboardingUtils.test.ts`). | ✅ CONCLUÍDO |
| RF-ON-05 | Ao concluir o último passo, exibir confirmação com resumo editável antes de salvar. | "Editar" por seção vai ao passo e **volta direto à confirmação** (ADR-020); Rodagem é editada inline na confirmação. | ✅ CONCLUÍDO |
| RF-ON-06 | Salvar perfil completo no localStorage apenas ao clicar "Concluir Configuração". Cancelar onboarding não salva nada. | `dispatch({ type: 'COMMIT_ONBOARDING' })` como ação única de persistência. | ✅ CONCLUÍDO |
| RF-ON-07 | Obter valor venal (FIPE) no passo de Ano a partir da `tabelaFipe[ano]` do preset (hardcoded, atualizada mensalmente por script — ADR-015; sem consulta em runtime). | Valor gravado em `perfil.fipeCache` ao avançar. Ano fora da tabela: o passo exibe "valor indisponível". | ✅ CONCLUÍDO |

---

## Aba ESTIMATIVA - Painel (RF-EST)

| ID | Descrição | Critério de Aceite | Status |
|---|---|---|---|
| RF-EST-01 | Exibir alerta de manutenção (card vermelho) no topo quando houver manutenção em menos de 500 km. | "Alerta - [Peça] em [X] km (estimativa: [N] dias)". Calculado com `kmAtual` e `kmDia`. Exibe apenas a mais urgente. | ✅ CONCLUÍDO |
| RF-EST-02 | Exibir toggle PREDEFINIDOS / PERSONALIZADO (modo de cálculo). | PREDEFINIDOS → usa preset puro. PERSONALIZADO → usa overrides. Alternar recalcula em < 200ms. | ✅ CONCLUÍDO |
| RF-EST-03 | Exibir toggle AUTORIZADAS / INDEPENDENTES (modo de revisão). | Alternar recalcula custo de revisão em tempo real. | ✅ CONCLUÍDO |
| RF-EST-04 | Exibir seção "CONFIGURAÇÃO DE RODAGEM" com: input KM/dia + stepper dias/semana. Valores editáveis inline. | Qualquer alteração recalcula todos os cards imediatamente. | ✅ CONCLUÍDO |
| RF-EST-05 | Exibir card "CUSTO DE OPERAÇÃO POR KM" em destaque. | Atualizado em tempo real. Ícone velocímetro como watermark. | ✅ CONCLUÍDO |
| RF-EST-06 | Exibir cards estimativos Por Hora e Por Dia em grade 2 colunas. | `porHora = custoDiario / horasDia`. `porDia = custoTotalAnual / diasAno`. | ✅ CONCLUÍDO |
| RF-EST-07 | Exibir blocos de estimativa por período: Semana, Mês, Ano. Cada bloco: KM RODADOS + CUSTO TOTAL. | Recalcular em < 200ms após qualquer alteração de input. | ✅ CONCLUÍDO |
| RF-EST-08 | Exibir gráfico de rosca (donut) com distribuição percentual por categoria. | Categorias com toggle off excluídas. Percentuais somam 100% sobre categorias ativas. Label central = categoria dominante + %. **Revisão não é fatia separada no donut - seu custo é incorporado à fatia Manutenção** (vide RN-27). | ✅ CONCLUÍDO |
| RF-EST-09 | Exibir legenda abaixo do donut com chips coloridos: categoria + %. | Chips clicáveis - clicar destaca a fatia correspondente no gráfico. | ✅ CONCLUÍDO |
| RF-EST-10 | Exibir botão "＋ Visualizar / Editar" que navega para `/estimativa/detalhamento`. | Sempre visível abaixo do donut. | ✅ CONCLUÍDO |

---

## Aba ESTIMATIVA - Detalhamento (RF-DET)

| ID | Descrição | Critério de Aceite | Status |
|---|---|---|---|
| RF-DET-01 | Exibir "DETALHAMENTO POR CATEGORIA" como lista de accordions. | Cada categoria colapsada por padrão, exceto a de maior valor. | ✅ CONCLUÍDO |
| RF-DET-02 | Cada accordion exibe: toggle on/off · ícone colorido · nome · valor anual · % do custo total · chevron. | Toggle off → `fatorCategoria = 0` → recalcula total imediatamente. | ✅ CONCLUÍDO |
| RF-DET-03 | Detalhamento expandido de **Combustível**: Preço Médio/L · Custo Mensal · Consumo Médio km/L · Nº de abastecimentos/mês. | | ✅ CONCLUÍDO |
| RF-DET-04 | Detalhamento expandido de **Alimentação**: Custo Mensal · Refeições anuais. | Refeições anuais = `diasAno` (dias trabalhados). | ✅ CONCLUÍDO |
| RF-DET-05 | Detalhamento expandido de **Manutenção**: sub-itens com toggle individual · frequência anual (Nx) · custo anual. Ex: "12x Troca de óleo - R$ 240,43". | Sub-itens derivados do preset + overrides do usuário. | ✅ CONCLUÍDO |
| RF-DET-06 | Detalhamento expandido de **Documentação**: sub-itens IPVA · CRLV · Emplacamento, cada um com chevron expansível mostrando origem do valor. | IPVA exibe "Isento" se moto ≥ 15 anos. | ✅ CONCLUÍDO |
| RF-DET-07 | Detalhamento expandido de **Internet**: Custo Mensal · Recargas/pagamentos anuais. | | ✅ CONCLUÍDO |
| RF-DET-08 | Detalhamento expandido de **Seguro**: Custo mensal equivalente · Nome da seguradora. | | ✅ CONCLUÍDO |
| RF-DET-09 | Detalhamento expandido de **Financiamento** (se `situacaoMoto === 'financiada'`): Custo mensal (parcela) · Parcelas restantes. | Label muda para "Aluguel" se `situacaoMoto === 'alugada'`. | ✅ CONCLUÍDO |
| RF-DET-10 | Botão "＋ Adicionar Novo Gasto" ao final da lista. | Abre modal/inline form: nome + valor mensal. Gasto salvo como categoria própria no total. | ✅ CONCLUÍDO |
| RF-DET-11 | Porcentagens somam 100% considerando apenas categorias com toggle ativo. | | ✅ CONCLUÍDO |

---

## Aba MÃO DE OBRA (RF-MO)

| ID | Descrição | Critério de Aceite | Status |
|---|---|---|---|
| RF-MO-01 | Exibir aviso informativo (card vermelho) sobre valores aproximados. | Visível no topo da aba. | [ ] PENDENTE |
| RF-MO-02 | Seção MÃO DE OBRA PARALELA: campos editáveis + reset (↺) por serviço. | Tipos: Troca de óleo motor · Troca de kit transmissão · Troca de pneu · Revisão geral · Manutenção avulsa. | [ ] PENDENTE |
| RF-MO-03 | Qualquer edição em MÃO DE OBRA impacta o custo de revisão anual na aba ESTIMATIVA. | Alteração → recálculo em < 200ms. | [ ] PENDENTE |
| RF-MO-04 | Seção REVISÃO GERAL AUTORIZADA: tabela de revisões Honda programadas com campos editáveis por linha. | Reset (↺) por linha reverte ao preset. | [ ] PENDENTE |
| RF-MO-05 | Botão reset (↺) por campo reverte apenas aquele campo para o valor do preset. | Confirma RN-02. | [ ] PENDENTE |

---

## Aba AUTONOMIA / Vida Útil (RF-VU)

| ID | Descrição | Status |
|---|---|---|
| RF-VU-01 | Mesmo aviso do RF-MO-01 (card vermelho no topo). | [ ] PENDENTE |
| RF-VU-02 | Seção ABASTECIMENTO E AUTONOMIA: 3 tipos de combustível com chips "Valor por litro" / "Autonomia (KM/L)" + campo editável + reset. | [ ] PENDENTE |
| RF-VU-03 | Seção PEÇAS E ELEMENTOS: lista de peças com toggle ORG/PAR · preço · vida útil · reset. | [ ] PENDENTE |
| RF-VU-04 | Toggle ORG/PAR por peça sobrescreve `perfilPecasGlobal` para aquela peça. | [ ] PENDENTE |
| RF-VU-05 | Seção PNEUS: Dianteiro e Traseiro com chips ORG/PAR · preço · vida útil · reset. | [ ] PENDENTE |

---

## Tela Perfil e Ajustes (RF-PERF)

| ID | Descrição | Status |
|---|---|---|
| RF-PERF-01 | Exibir predefinição atual: nome canônico do modelo, sufixo em badge visualmente separado, avatar, ano e autonomia. | [ ] PENDENTE |
| RF-PERF-02 | Botões: Editar predefinição, Criar nova predefinição, Alternar predefinição e Deletar predefinição. A criação aceita múltiplas entradas por modelo com sufixo único; a exclusão só permite entradas não ativas. | [ ] PENDENTE |
| RF-PERF-03 | Seção Exportar & Importar: Exportar Backup (.json) · Importar Backup. | [ ] PENDENTE |
| RF-PERF-04 | Configurações gerais: Idioma, Aparência, Privacidade e Termos, Versão do app. | [ ] PENDENTE |

---

## Custos Fixos de Documentação (RF-DOC)

| ID | Descrição | Status |
|---|---|---|
| RF-DOC-01 | IPVA = `valorFipe × aliquota`. Se moto ≥ 15 anos no RJ: exibir "Isento". FIPE cacheada. | ✅ CONCLUÍDO |
| RF-DOC-02 | Licenciamento anual conforme tabela DETRAN-RJ. 2026: R$ 206. | ✅ CONCLUÍDO |
| RF-DOC-03 | Tooltip (ícone ?) em cada custo fixo explicando a origem. | [ ] PENDENTE |

---

## Persistência e Export/Import (RF-CONF, RF-EXP)

| ID | Descrição | Status |
|---|---|---|
| RF-CONF-01 | Salvar automaticamente no localStorage a cada dispatch. Fechar/reabrir preserva estado. | ✅ CONCLUÍDO |
| RF-CONF-02 | Ao reabrir com perfil salvo, carregar estado sem ação do usuário. Onboarding nunca reexibido. | ✅ CONCLUÍDO |
| RF-EXP-01 | Exportar todos os dados como `motocalc_backup.json`. Download automático. | [ ] PENDENTE |
| RF-EXP-02 | Importar arquivo `.json` com validação e confirmação. Compatível com o schema atual e migrações públicas suportadas. | [ ] PENDENTE |
| RF-EXP-03 | Arquivo de export contém `schemaVersion` para migrações. Schema atual: 2 (ver `docs/arquitetura/estado_inicial.md`). | [ ] PENDENTE |

---

## Fluxo Detalhado de Onboarding (Anexo aos RF-ON)

> **Ordem, rotas e progresso canônicos vivem na [ADR-020](../arquitetura/ADR/ADR-020.md)** (fonte única;
> reordenado na RF-6.31). Resumo da ordem atual (rotas semânticas, "PASSO X DE 10" + Confirmação):
>
> 1. **Modelo** (`/onboarding/modelo`) — marca + modelo numa etapa.
> 2. **Ano** (`/onboarding/ano`) — FIPE/IPVA lidos da `tabelaFipe` (ADR-015), sem runtime.
> 3. **Quilometragem + consumo** (`/onboarding/km`) — KM atual (obrigatório) + consumo do modelo editável.
> 4. **Situação** (`/onboarding/situacao`) — branch: financiada → `/situacao/financiamento`; alugada →
>    `/situacao/aluguel` → `/situacao/responsabilidade`; quitada segue direto.
> 5. **Seguro** (`/onboarding/seguro`) · 6. **Alimentação** (`/onboarding/alimentacao`) ·
>    7. **Internet** (`/onboarding/internet`) — bloco opcional (default 0; não bloqueia).
> 8. **Vida útil das peças** (`/onboarding/vida-util`).
> 9. **Mão de obra** (`/onboarding/mao-de-obra`) — toggle Padrão/Estimado + cards dos avulsos sem valor.
> 10. **Últimas manutenções** (`/onboarding/ultimas-manutencoes`).
> - **Confirmação** (`/onboarding/confirmacao`) — resumo editável; **Rodagem** (km/dia, dias/semana) é
>   editada **inline** aqui (não tem passo próprio). "Editar" em qualquer seção volta direto à Confirmação.

### Estrutura visual de cada passo

- Header com logo e ajuda (?)
- Barra de progresso: "PASSO X DE 10" + percentual (Confirmação = "PASSO FINAL")
- Título da pergunta (H1, bold) + subtítulo explicativo
- Área de resposta (varia por passo)
- Botões "Voltar" (secundário) e "Próximo →" (primário); Confirmação: CTA "Concluir Configuração ✓"

---

> **Status geral:**
> - ✅ CONCLUÍDO: Onboarding, Estimativa, Detalhamento, persistence, FIPE, IPVA/Licenciamento.
> - [ ] PENDENTE: Mão de Obra, Autonomia, Perfil, Export/Import, Tooltips.
> - ⚠️ ADIADO via ADR-003: Registros (RF-REG-*) e Formulários de Registro (RF-FORM-*) - backlog futuro.

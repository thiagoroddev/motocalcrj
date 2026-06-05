# Requisitos Funcionais - MotoCalc RJ

> Documento operacional derivado da especificação consolidada em 09/05/2026 e atualizado pelas ADRs e tarefas posteriores.
> IDs dos requisitos: RF-ON-xx, RF-EST-xx, RF-DET-xx, RF-MO-xx, RF-VU-xx, RF-PERF-xx, RF-DOC-xx, RF-CONF-xx, RF-EXP-xx.
> **Nota:** RF-REG-* e RF-FORM-* (tela Registros e formulários) foram **adiados via ADR-003** e removidos deste documento operacional. A ADR é a fonte da decisão e do escopo adiado.

---

## Onboarding (RF-ON)

| ID | Descrição | Critério de Aceite | Status |
|---|---|---|---|
| RF-ON-01 | Exibir onboarding apenas no primeiro acesso. Com perfil salvo, ir direto à aba ESTIMATIVA. | `localStorage.perfil.onboardingConcluido === true` → redireciona para `/estimativa`. | ✅ CONCLUÍDO |
| RF-ON-02 | Barra de progresso visual em todos os passos, indicando "PASSO X DE 9" e percentual. | Porcentagem calculada proporcionalmente. Fluxo aluguel tem 10 passos efetivos (o P6d extra). | ✅ CONCLUÍDO |
| RF-ON-03 | Navegação "Voltar" funcional em todos os passos exceto P1, sem perder respostas preenchidas. | Estado do onboarding mantido em memória (não persistido até `Concluir`). | ✅ CONCLUÍDO |
| RF-ON-04 | Lógica condicional em P6: exibir sub-telas corretas conforme situação selecionada. | Testes automatizados validam cada ramo. | ✅ CONCLUÍDO |
| RF-ON-05 | Ao concluir P9, exibir tela de confirmação com resumo editável antes de salvar. | Botão "Editar" por seção redireciona ao passo correspondente mantendo estado. | ✅ CONCLUÍDO |
| RF-ON-06 | Salvar perfil completo no localStorage apenas ao clicar "Concluir Configuração". Cancelar onboarding não salva nada. | `dispatch({ type: 'COMMIT_ONBOARDING' })` como ação única de persistência. | ✅ CONCLUÍDO |
| RF-ON-07 | Obter valor venal (FIPE) no passo P3 a partir da `tabelaFipe[ano]` do preset (hardcoded, atualizada mensalmente por script — ADR-015; sem consulta em runtime). | Valor gravado em `perfil.fipeCache` ao avançar. Ano fora da tabela: Passo 3 exibe "valor indisponível". | ✅ CONCLUÍDO |

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
| RF-PERF-01 | Exibir predefinição atual: nome do modelo · avatar · ano · autonomia. | [ ] PENDENTE |
| RF-PERF-02 | Botões: Editar predefinição, Criar nova, Mudar predefinição, Apagar Tudo (destrutivo). | [ ] PENDENTE |
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
| RF-EXP-02 | Importar arquivo `.json` com validação e confirmação. Compatível com schemas v3+. | [ ] PENDENTE |
| RF-EXP-03 | Arquivo de export contém `schemaVersion` para migrações. Schema atual: 20 (ver `docs/arquitetura/estado_inicial.md` para tabela de migrações). | [ ] PENDENTE |

---

## Fluxo Detalhado de Onboarding (Anexo aos RF-ON)

### Estrutura visual de cada passo

- Header com logo e ajuda (?)
- Barra de progresso: "PASSO X DE 9" + percentual
- Título da pergunta (H1, bold)
- Subtítulo explicativo (body)
- Área de resposta (varia por passo)
- Imagem/ilustração opcional
- Botões "Voltar" (secundário) e "Próximo →" (primário)
- Último passo: CTA "Concluir Configuração ✓"

### Passo 1 - Marca (11%)

Cards: Honda, Yamaha, Outras Marcas. "Outras Marcas" bloqueia avanço.

### Passo 2 - Modelo (22%)

Lista de modelos com hero image da marca. Selecionado: borda azul + check.

### Passo 3 - Ano de Fabricação (33%)

Input de ano. Card informativo sobre isenção de IPVA > 15 anos. Valor FIPE lido da `tabelaFipe` do preset (ADR-015), sem consulta em runtime.

### Passo 4 - Perfil de Uso (44%)

Cards: "Apenas Entregas (Baú/Caixa)" / "Transporte de Passageiros (Uber Moto)". Card laranja com aviso de desgaste extra se "Passageiro".

### Passo 5 - Quilometragem (55%)

Campos: KM ATUAL DO HODÔMETRO (obrigatório), KM NA ÚLTIMA REVISÃO (opcional).

### Passo 6 - Situação da Moto (66%) - Branch

Cards: Quitada (avança para P7), Financiada (vai para P6b), Alugada (vai para P6c).

**P6b - Financiamento:** valor da parcela, parcelas restantes.
**P6c - Aluguel:** valor do aluguel, periodicidade (Mensal/Semanal).
**P6d - Responsabilidade (só alugada, 90%):** três seções com "Eu pago tudo" / "Locador paga tudo" / "Dividimos 50/50" para Documentação, Manutenção, Seguro.

### Passo 7 - Seguro (77%)

Cards: "Sim, sou segurado" / "Não possuo seguro". Se Sim: valor, periodicidade (Anual/Mensal).

### Passo 8 - Internet (88%)

Campo: valor mensal (R$).

### Passo 9 - Alimentação (100%)

Cards: "Sim, como na rua" / "Não, levo de casa". Se Sim: gasto médio por dia (R$). Info footer: valores podem ser atualizados depois. CTA: "Concluir Configuração ✓".

---

> **Status geral:**
> - ✅ CONCLUÍDO: Onboarding, Estimativa, Detalhamento, persistence, FIPE, IPVA/Licenciamento.
> - [ ] PENDENTE: Mão de Obra, Autonomia, Perfil, Export/Import, Tooltips.
> - ⚠️ ADIADO via ADR-003: Registros (RF-REG-*) e Formulários de Registro (RF-FORM-*) - backlog futuro.

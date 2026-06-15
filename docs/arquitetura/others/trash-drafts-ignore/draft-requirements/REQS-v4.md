# Documento de Requisitos
## I- MotoCalc RJ — Calculadora de Custo Operacional para Entregadores de Moto
### I.1- PWA • Município do Rio de Janeiro, RJ • Atividade Extensionista

| Campo | Valor |
|---|---|
| Versão | 4.0 |
| Baseado em | v3.1 (01/05/2026) + análise das telas do protótipo (maio/2026) |
| Mudanças principais v4 | Estrutura de navegação por abas (CUSTOS · REGISTROS · SERVIÇOS · PEÇAS), toggle PADRÃO/PERSONALIZADO, toggles por categoria no Detalhamento, imutabilidade dos presets + sistema de overrides + reset por item, aba SERVIÇOS (mão de obra + revisões autorizadas), aba PEÇAS com multi-combustível e toggles ORG/PAR por peça, Registros com sub-abas enriquecidas, regras de negócio formalizadas, stack atualizada |

---

## II- Visão Geral do Projeto

### II.1- Descrição

O MotoCalc RJ é um Progressive Web App (PWA) projetado para ajudar entregadores de moto do Município do Rio de Janeiro a compreenderem com precisão o custo real de operação do seu veículo. O aplicativo transforma custos invisíveis — depreciação de peças, manutenções preventivas, financiamento, seguro — em valores concretos por hora, dia, semana, mês e ano, permitindo decisões financeiras mais conscientes.

### II.2- Problema que o Projeto Resolve

A grande maioria dos entregadores de moto tem consciência apenas do custo da gasolina. Custos como troca de relação, desgaste de pneus, velas e ajuste de válvulas são "gastos do futuro" que, na prática, corroem o lucro presente. Sem uma ferramenta de visualização, o entregador superestima seu ganho líquido real, comprometendo sua saúde financeira.

### II.3- Solução Proposta

Um PWA de página única (SPA), mobile-first, que:

- Conduz o usuário por um onboarding inicial, coletando seu perfil completo;
- Oferece presets de dados técnico-financeiros por modelo de moto, baseados nos manuais do proprietário e em pesquisa de campo no RJ;
- Permite que o usuário personalize qualquer valor (preço de peça, intervalo de troca, custo de mão de obra) **sem nunca alterar os dados de preset originais**;
- Permite um reset individual por item, revertendo para o valor de preset a qualquer momento;
- Exibe o custo operacional total em 6 granularidades: anual, mensal, semanal, diário, por hora e por km;
- Persiste todas as configurações no dispositivo do usuário via localStorage;
- Funciona completamente offline após o primeiro carregamento;
- Permite exportar e importar o perfil completo (para migração entre dispositivos).

---

## III- Escopo

### III.1- Modelos de Moto Suportados (V1)

| Modelo | Cilindrada | Perfil de Uso | Prioridade |
|---|---|---|---|
| Honda Pop 110i | 110cc | Entrega leve / urbana | Alta — único modelo com preset completo na Fase 0 |
| Honda CG Titan 160 | 160cc | Entrega média / apps | Alta |
| Honda Biz 125 | 125cc | Entrega leve / econômica | Alta |
| Yamaha Factor 150 | 150cc | Versátil / apps | Média |
| Honda NXR Bros 160 | 160cc | Entrega pesada / longa | Média |

> Os presets dos modelos além do Pop 110i são adicionados na Fase 8 sem alterar código — apenas inserindo os JSONs correspondentes (RNF-09).

### III.2- Fora do Escopo — V1

- Login e autenticação de usuários (arquitetura login-ready via RNF-11);
- Backend ou banco de dados remoto;
- Comparativo de rentabilidade por plataforma de entrega;
- Notificações push de manutenção;
- Modelos de moto fora da lista acima.

---

## IV- Navegação

### IV.1- Estrutura de Abas (Bottom Navigation)

O app possui uma barra de navegação fixa na parte inferior com 4 abas principais:

| Aba | Ícone | Conteúdo |
|---|---|---|
| **CUSTOS** | 📊 | Painel de custos: rodagem, custos por período, custo/km. Abre "Detalhamento" via botão. |
| **REGISTROS** | 📋 | Histórico de manutenções, abastecimentos e rodagem diária. Sub-abas: Geral · Rodagem · Combustível · Manutenção. |
| **SERVIÇOS** | 🔧 | Configuração de mão de obra por tipo de serviço + tabela de revisões autorizadas. |
| **PEÇAS** | ⚙️ | Configuração de combustíveis, peças e pneus com toggles por item. |

> **Nota de design:** Configurações globais (onboarding, exportar/importar, redefinir perfil, ajustes de seguro, financiamento, internet) são acessadas via ícone de configuração no cabeçalho, não via aba separada. Isso mantém as 4 abas focadas nas tarefas principais do dia a dia.

### IV.2- Cabeçalho Global

Todas as telas exibem um cabeçalho fixo contendo:

- Avatar/ícone do usuário + saudação ("Olá, [Nome]!")
- Modelo e consumo da moto selecionada (ex: "POP 110I 2024 · 55 KM/L")
- Ícone de moto (navega para detalhes do veículo)
- Ícone de notificação/sino (exibe alertas de manutenção pendente)

---

## V- Fluxo de Onboarding

O onboarding ocorre uma única vez, no primeiro acesso. Após a conclusão, as respostas são persistidas e o onboarding não é exibido novamente — a menos que o usuário opte por "Redefinir Perfil".

> **Filosofia:** cada pergunta deve ser acompanhada de uma micro-explicação de por que aquela informação importa para o cálculo. O entregador precisa sentir que o app está do lado dele. Uma pergunta por tela, com botão "Próxima" — nunca um formulário longo.

### V.1- Bloco 1 — Identificação da Moto

| Nº | Pergunta | Input | Observação Técnica |
|---|---|---|---|
| 01 | Qual é a marca da sua moto? | Cards (Honda, Yamaha, Outros) | Filtra modelos do passo seguinte |
| 02 | Qual é o modelo? | Dropdown/cards por marca | Carrega o preset JSON correspondente |
| 03 | Em que ano foi fabricada? | Lista de anos do modelo | Usado para IPVA e isenção (≥ 15 anos) |
| 04 | Usa baú ou caixa de entrega? | Sim / Não | Se Sim: aplica `consumoKmLComBau` do preset (≈ −8%) |
| 04b | Qual a quilometragem atual do hodômetro? | Input numérico (km) | Necessário para sugerir próximas trocas ⚠️ |
| 04c | Qual era a km na sua última revisão geral? | Input numérico (km) | Calcula distância desde a última revisão ⚠️ |

### V.2- Bloco 2 — Perfil de Manutenção

| Nº | Pergunta | Input | Observação Técnica |
|---|---|---|---|
| 04d | Você usa peças originais ou aceita peças paralelas? | Cards: "Apenas originais Honda" / "Aceito peças paralelas" | Define `perfilPecasGlobal`. Desativado automaticamente se `anoFimOriginal` indicar que o modelo/ano não tem mais originais disponíveis (RF-10c). |
| 04e | Onde você faz as revisões gerais? | Cards: "Na concessionária" / "Em oficina independente" | Define `modoRevisao: 'dealer' \| 'autonomo'`. Impacta fortemente o custo de revisão. |
| 04f | Se oficina independente: quanto costuma pagar pela revisão? | Input numérico (R$) — padrão: R$150 | Usado em `custoRevisaoAnual`. Editável depois na aba SERVIÇOS. |

### V.3- Bloco 3 — Volume de Trabalho

| Nº | Pergunta | Input | Observação Técnica |
|---|---|---|---|
| 05 | Quantos km você roda em um dia de trabalho? | Input numérico (km) | `kmDia`. Base da projeção. Editável diretamente no painel. |
| 06 | Quantos dias por semana você trabalha? | Seleção: 1 a 7 | `diasSemana`. Editável com stepper no painel. |

### V.4- Bloco 4 — Custos Financeiros

#### V.4.1- Combustível

| Nº | Pergunta | Input |
|---|---|---|
| 07 | Qual tipo de gasolina usa com mais frequência? | Seleção: Comum / Aditivada / Etanol |
| 07b | Quanto paga por litro deste combustível? | Input numérico — padrão por tipo (ANP RJ) |

> O preset inclui preços e autonomia para os três tipos de combustível. O usuário escolhe o principal, mas pode configurar todos na aba PEÇAS.

#### V.4.2- Plano de Dados

| Nº | Pergunta | Input |
|---|---|---|
| 08 | Quanto paga no seu plano de internet por mês? | Input numérico — padrão: R$20 |

#### V.4.3- Seguro

| Nº | Pergunta | Input |
|---|---|---|
| 09 | Você tem seguro da moto? | Sim / Não |
| 10 | Como você paga? | Anual / Mensal |
| 11 | Qual o valor? | Input numérico (R$) — padrão: R$989/ano |

#### V.4.4- Situação da Moto

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 12 | Como você usa sua moto? | Cards: "Quitada" / "Financiada" / "Alugada" | Determina ramo condicional |
| 12a | Valor da parcela mensal? | Input numérico (R$/mês) | Apenas se financiada |
| 12b | Quantas parcelas restam? | Input numérico | Apenas se financiada — exibe data estimada de quitação no painel |
| 12c | Quanto paga de aluguel? | Input + seleção semanal/mensal | Apenas se alugada |
| 12d | Quem paga o IPVA e o licenciamento? | "Eu" / "O locador" / "Dividimos" | Apenas se alugada |
| 12e | Quem paga a manutenção e as peças? | "Eu" / "O locador" / "Dividimos" | Apenas se alugada |
| 12f | Quem paga o seguro? | "Eu" / "O locador" / "Dividimos" | Apenas se alugada |

#### V.4.5- Alimentação

| Nº | Pergunta | Input |
|---|---|---|
| 13 | Quanto gasta com alimentação em um dia de trabalho? | Input numérico — padrão: R$20/dia |

### V.5- Bloco 5 — Personalização

| Nº | Pergunta | Input |
|---|---|---|
| 14 | Como quer ser chamado no app? | Texto livre (opcional) |
| 15 | Em qual(is) app(s) você trabalha? | Multi-seleção: iFood, Rappi, 99, Loggi, Outros |

### V.6- Tela de Confirmação

Ao concluir o onboarding, o sistema exibe um resumo de todas as informações fornecidas. O usuário pode editar qualquer campo antes de confirmar. Ao clicar em "Confirmar e ver meus custos", o perfil é salvo e o usuário vai ao painel principal (aba CUSTOS).

---

## VI- Requisitos Funcionais

### VI.1- Onboarding

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-ON-01 | Exibir onboarding apenas no primeiro acesso. Com perfil salvo, ir direto ao painel (aba CUSTOS). | Ao reabrir o app, onboarding não aparece. |
| RF-ON-02 | Estruturar o onboarding em blocos com indicador de progresso visível. | Usuário vê em qual etapa está e quantas faltam. |
| RF-ON-03 | Implementar lógica condicional para perguntas dependentes (04f, 10, 11, 12a–12f). | Testes validam que cada ramo exibe apenas as perguntas pertinentes. |
| RF-ON-04 | Permitir navegação para a pergunta anterior sem perder respostas já dadas. | Botão "Voltar" funcional em todas exceto a primeira tela. |
| RF-ON-05 | Exibir tela de revisão ao final do onboarding com opção de editar qualquer campo. | Botão "Editar" por grupo redireciona para a tela correspondente. |

---

### VI.2- Aba CUSTOS — Painel Principal

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-CUSTOS-01 | Exibir alerta visual de manutenção no topo do painel quando o usuário estiver próximo de uma troca. | Card vermelho: "Alerta de Manutenção — [Peça] em [X] km (estimativa: [N] dias)". Calculado com base em `kmAtual` e `kmDia`. |
| RF-CUSTOS-02 | Exibir toggle PADRÃO / PERSONALIZADO. No modo PADRÃO, todos os cálculos usam valores do preset. No modo PERSONALIZADO, usam os overrides do usuário. | Alternar o toggle recalcula todos os valores em tempo real. Sem override salvo, PERSONALIZADO = PADRÃO. |
| RF-CUSTOS-03 | Exibir toggle AUTORIZADAS / INDEPENDENTES para preferência de manutenção em oficinas. Equivale a `modoRevisao`. | Alternar recalcula o custo de revisão em tempo real. |
| RF-CUSTOS-04 | Exibir seção "Configuração de Rodagem" com dois campos editáveis: km/dia (input numérico) e dias/semana (stepper com − e +). | Alterar qualquer um dos dois recalcula todos os custos imediatamente. |
| RF-CUSTOS-05 | Exibir card "Custo de Operação por Km" de destaque. | Valor sempre atualizado. Exibe ícone de velocímetro para apelo visual. |
| RF-CUSTOS-06 | Exibir cards Por Hora e Por Dia lado a lado. | Calculados a partir do custo diário (`custoTotalAnual / diasAno` e `custoDiario / horasDia`). |
| RF-CUSTOS-07 | Exibir blocos de estimativa por período mostrando KM RODADOS e CUSTO TOTAL: Semana, Mês e Ano. | Valores recalculados em menos de 200ms após qualquer alteração. |
| RF-CUSTOS-08 | Exibir botão "Visualizar detalhes" que navega para a tela de Detalhamento de Custos. | Botão visível abaixo dos blocos de estimativa. |

---

### VI.3- Aba CUSTOS — Tela Detalhamento de Custos

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-DET-01 | Exibir gráfico de rosca (donut chart) com distribuição percentual de custos. | Cada fatia representa uma categoria. Percentual central exibe a fatia selecionada. Legenda abaixo com: Combustível, Manutenção, Outros. |
| RF-DET-02 | Exibir seção "Detalhamento por Categoria" com cards expansíveis para cada categoria de custo. | Ao tocar no card, exibe subcategorias ou detalhes. Segundo toque, colapsa. |
| RF-DET-03 | Cada card de categoria possui: toggle on/off (inclui/exclui do cálculo), ícone, nome da categoria, valor anual e porcentagem do total. | Toggle desativado → `fatorCategoria = 0` → custo da categoria não entra no total. Porcentagem recalculada automaticamente. |
| RF-DET-04 | Detalhamento da categoria **Combustível** expandido exibe: Preço médio/L, Custo mensal, Consumo médio (km/L), número estimado de abastecimentos por mês. | Valores derivados das configurações e do preset de consumo. |
| RF-DET-05 | Detalhamento da categoria **Alimentação** expandido exibe: Custo mensal e número de refeições anuais. | Refeições anuais = diasAno (dias trabalhados). |
| RF-DET-06 | Detalhamento da categoria **Manutenção** expandido exibe cada item com: frequência anual (Nx), descrição e custo anual. | Ex: "12x Troca de óleo — R$ 240,43". Itens derivados do preset e overrides do usuário. |
| RF-DET-07 | Detalhamento da categoria **Documentação** expandido exibe cada item individualmente (IPVA, CRLV, Emplacamento) com possibilidade de expandir cada um. | Cada subitem mostra o valor e origem. IPVA indica "Isento" se moto ≥ 15 anos. |
| RF-DET-08 | Detalhamento da categoria **Internet** expandido exibe: Custo mensal e número de recargas/pagamentos anuais. | |
| RF-DET-09 | Detalhamento da categoria **Seguro** expandido exibe: Custo mensal equivalente e nome da seguradora (informada pelo usuário). | |
| RF-DET-10 | Detalhamento da categoria **Quitar Moto** (financiamento) expandido exibe: Custo mensal (parcela) e parcelas restantes. | Visível apenas se `situacaoMoto === 'financiada'`. Renomear para "Aluguel" se `situacaoMoto === 'alugada'`. |
| RF-DET-11 | Exibir botão "+ Adicionar Novo Gasto" ao final da lista. | Permite criar um gasto personalizado com nome e valor mensal. Entra no total e aparece como categoria própria. |
| RF-DET-12 | A soma das porcentagens no detalhamento deve refletir a proporção de cada categoria em relação ao `custoTotalAnual` incluindo apenas as categorias com toggle ativo. | Porcentagens somam 100% (dentro das categorias ativas). |

---

### VI.4- Aba REGISTROS

A aba REGISTROS é o módulo de histórico do app. Organiza todos os eventos registrados pelo usuário em 4 sub-abas.

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-REG-01 | Exibir 4 sub-abas: Geral, Rodagem, Combustível, Manutenção. | Sub-aba "Geral" exibe todos os registros recentes de todas as categorias juntos. |
| RF-REG-02 | Sub-aba **Geral**: exibir seções para cada categoria de registro (Óleo Motor, Combustível, Revisão Geral, Pneu Dianteiro, Pneu Traseiro, Kit Transmissão, Rodagem). Cada seção tem botão "+" para adicionar e "Ver" para expandir a lista completa. | Lista paginada por seção. |
| RF-REG-03 | Registros de **Óleo Motor**: campos DATA, KM, VALOR. Exibição em tabela. | |
| RF-REG-04 | Registros de **Combustível**: exibir como card com ícone, tipo de combustível (Aditivada/Comum/Etanol), valor pago, data, posto/local e km no hodômetro. | Posto/local é texto livre. |
| RF-REG-05 | Registros de **Revisão Geral**: exibir como card com nome do serviço, valor total, local (concessionária ou oficina), badge de status (CONCLUÍDO / EM DIA / PRÓXIMO), data, km, e lista de itens trocados. | Badge "PRÓXIMO" exibe quando o cálculo indica que a próxima revisão está em menos de 500 km. |
| RF-REG-06 | Registros de **Pneu Dianteiro** e **Pneu Traseiro**: campos DATA, KM, MARCA, VALOR em tabela. | |
| RF-REG-07 | Registros de **Kit Transmissão**: campos DATA, KM, MARCA, VALOR em tabela. | |
| RF-REG-08 | Sub-aba **Rodagem**: registros diários com DATA e KM percorridos. | Após 5+ registros, exibe média calculada no topo da sub-aba. |
| RF-REG-09 | Sub-aba **Combustível**: lista detalhada de abastecimentos com tipo, valor, posto, km, litros e preço/L. | Ao acumular 3+ registros, exibe consumo real calculado (km/L) no topo. |
| RF-REG-10 | Sub-aba **Manutenção**: consolida em único scroll todas as manutenções (óleo, revisão, pneus, kit) ordenadas por data. | |
| RF-REG-11 | Após acumular 2+ registros do mesmo tipo de manutenção, calcular e exibir o intervalo médio real observado. | "Seu intervalo real observado: X.XXX km (preset: Y.XXX km)". O intervalo real é usado no cálculo de CPK se disponível. |
| RF-REG-12 | Permitir editar ou excluir qualquer registro. | Swipe ou botão de longa pressão abre opções: Editar / Excluir. Confirmação antes de excluir. |

---

### VI.5- Aba SERVIÇOS

A aba SERVIÇOS centraliza a configuração de custos de mão de obra para cada tipo de serviço e a tabela de revisões agendadas.

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-SERV-01 | Exibir cabeçalho informativo: modelo da moto selecionada + aviso de que valores pré-definidos são estimativas baseadas em pesquisa de campo. | Aviso em card amarelo/laranja de alerta. |
| RF-SERV-02 | Exibir seção "MÃO DE OBRA" (modo paralela/independente) com campos de preço editáveis por tipo de serviço: Troca de óleo motor, Troca de kit transmissão, Troca de pneu, Revisão geral, Manutenção avulsa. | Cada campo tem preço em R$, ícone identificador e botão de reset (↺). |
| RF-SERV-03 | Exibir seção "REVISÃO GERAL AUTORIZADA" com tabela de revisões agendadas pelo fabricante (ex: 1ª revisão 1.000km, 2ª revisão 6.000km, etc.), com campos: intervalo (km ou meses), preço e custo total editáveis. | Cada linha de revisão tem botão reset (↺). Custo total = preço peças + mão de obra da linha. |
| RF-SERV-04 | Qualquer edição nos campos de SERVIÇOS impacta o cálculo de custo de revisão anual exibido na aba CUSTOS. | Editar preço de revisão → custo anual recalculado automaticamente. |
| RF-SERV-05 | Botão reset (↺) em cada campo de SERVIÇOS reverte apenas aquele campo para o valor do preset, sem afetar outros campos. | Comportamento confirma RN-02. |

---

### VI.6- Aba PEÇAS

A aba PEÇAS centraliza a configuração de combustíveis, peças e pneus. É o principal ponto de customização dos dados de custo por km.

#### VI.6.1- Seção Abastecimento e Autonomia

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-PECAS-01 | Exibir três tipos de combustível: Gasolina Comum, Gasolina Aditivada, Etanol. Cada um com campo de preço por litro e campo de autonomia (km/L) independentes e editáveis. | Alterar qualquer campo recalcula o custo de combustível no painel imediatamente. |
| RF-PECAS-02 | Para o tipo de combustível principal (definido no onboarding), usar os valores configurados no cálculo central. | Se usuário usa "Comum", o custo de combustível é calculado com preço e autonomia do campo "Gasolina Comum". |
| RF-PECAS-03 | Exibir botão reset (↺) em cada campo de combustível. | Reset reverte preço e autonomia do tipo para valores do preset. |

#### VI.6.2- Seção Peças e Elementos

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-PECAS-04 | Listar todas as peças do preset com: nome, toggle Original/Paralela, preço editável e vida útil (km) editável. | Cada peça tem campos independentes. |
| RF-PECAS-05 | Toggle ORG/PAR por peça sobrescreve a configuração global `perfilPecasGlobal` para aquele item específico. | Se o usuário setou global = "Paralela" mas togglou ORG numa peça específica, o preço "Original" é usado para essa peça. |
| RF-PECAS-06 | Se o toggle ORG for selecionado em uma peça mas `anoFimOriginal` indica que original não existe mais, exibir tooltip explicativo e manter o toggle em PAR. | Tooltip: "Original Honda não disponível para este modelo/ano." |
| RF-PECAS-07 | Exibir botão reset (↺) por peça. | Reset reverte preço, vida útil e toggle ORG/PAR para os valores do preset. |

#### VI.6.3- Seção Pneus

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-PECAS-08 | Exibir campos individuais para Pneu Dianteiro e Pneu Traseiro com: toggle ORG/PAR, preço e vida útil (km) editáveis. | |
| RF-PECAS-09 | Botão reset (↺) por pneu, seguindo RN-02. | |

---

### VI.7- Custos Fixos de Documentação

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-DOC-01 | Calcular IPVA: `valorFipe × aliquotaEstado`. Para motos com 15+ anos no RJ, exibir "Isento". FIPE buscada via BrasilAPI no onboarding e cacheada. | Se offline, usa valor cacheado com aviso de data da consulta. |
| RF-DOC-02 | Exibir licenciamento anual conforme tabela DETRAN-RJ vigente (2026: R$206). | Valor somente leitura editável apenas via atualização do preset/dados_rj.json. |
| RF-DOC-03 | Exibir ícone de informação (tooltip) em cada custo fixo explicando a origem do valor. | "Alíquota IPVA-RJ 2026: 2% sobre valor FIPE". |

---

### VI.8- Persistência e Configurações Globais

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-CONF-01 | Salvar automaticamente todas as configurações no localStorage a cada alteração. | Ao fechar e reabrir o app, todos os valores customizados estão exatamente como o usuário deixou. |
| RF-CONF-02 | Ao reabrir o app com perfil salvo, carregar todos os dados automaticamente sem ação do usuário. | O app nunca exibe o onboarding novamente se houver perfil salvo. |
| RF-CONF-03 | Oferecer tela de Configurações (acessada via ícone no cabeçalho) com: edição de todos os dados do onboarding, seção de moto alugada (responsabilidades), export/import de perfil, e botão "Redefinir Perfil". | |
| RF-CONF-04 | Oferecer botão "Redefinir Perfil" nas configurações, com confirmação explícita. | Após confirmação, apaga todos os dados do usuário e reinicia o onboarding. Preset nunca é afetado. |

---

### VI.9- Export / Import de Perfil

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-EXP-01 | O usuário pode exportar todos os seus dados como arquivo `.json`. | Botão "Exportar meus dados" nas Configurações. Gera download de `motocalc_backup.json`. Exibe aviso de privacidade. |
| RF-EXP-02 | O usuário pode importar um arquivo `.json` exportado anteriormente. | Aceita o arquivo `.json`. Exige confirmação se houver perfil existente. |
| RF-EXP-03 | O arquivo de export deve conter `schemaVersion` para migrações futuras. | Schema versão 4. Imports de v3 são compatíveis — campos ausentes recebem valores padrão. |

---

### VI.10- Moto Alugada — Distribuição de Custos

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-ALU-01 | Para `situacaoMoto === 'alugada'`, aplicar `fatorResponsabilidade ∈ {0, 0.5, 1.0}` individualmente a: documentação (IPVA + licenciamento), manutenção (peças + revisão) e seguro. | Custo de cada bloco multiplicado pelo fator antes de entrar no total. |
| RF-ALU-02 | No detalhamento, exibir nota indicando quais categorias foram excluídas ou divididas. | Ex: "IPVA e licenciamento pagos pelo locador (R$0 no seu custo). Manutenção dividida (50%)." |
| RF-ALU-03 | Permitir editar os fatores de responsabilidade nas Configurações sem refazer o onboarding. | |

---

### VI.11- Módulo de Diário de Trabalho (Could Have)

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-DIA-01 | Permitir registrar um dia de trabalho: data, km inicial, km final, se comeu, se abasteceu (+ litros e preço/L). | Formulário simples acessível do painel. Data padrão = hoje. |
| RF-DIA-02 | Calcular `kmPercorridos = kmFinal - kmInicial`. Atualizar `kmAtual` com o maior `kmFinal`. | `kmAtual` atualizado após cada entrada. |
| RF-DIA-03 | Após 5+ registros, exibir média real de km/dia como alternativa ao valor do onboarding. | "Média real (últimos N dias): X km/dia". Usuário escolhe qual usar. |
| RF-DIA-04 | Com abastecimentos registrados, calcular consumo real (km/L) e comparar com preset. | `consumoReal = soma(km) / soma(litros)`. Exibido na sub-aba Combustível de REGISTROS. |

---

## VII- Regras de Negócio

### VII.1- Imutabilidade dos Presets e Sistema de Overrides

| ID | Regra |
|---|---|
| RN-01 | **Os arquivos de preset (JSON) são somente leitura.** Nenhuma ação do usuário, em nenhuma tela, modifica diretamente um arquivo de preset. O app apenas lê os presets. |
| RN-02 | **Toda edição feita pelo usuário é armazenada como um "override" no perfil do usuário (localStorage), nunca no preset.** O sistema usa o override quando disponível e cai no preset quando não há override. |
| RN-03 | **O botão Reset (↺) em qualquer campo apaga apenas o override daquele campo específico**, fazendo o sistema voltar a usar o valor do preset para aquele item. Não afeta outros campos nem outras peças. |
| RN-04 | **Modo PADRÃO:** o app ignora todos os overrides do usuário e calcula usando exclusivamente os valores do preset. Útil para ver como a moto "deveria" custar segundo os dados de referência. |
| RN-05 | **Modo PERSONALIZADO:** o app usa overrides do usuário onde existirem, e cai no preset onde não houver override. Este é o modo padrão após o usuário começar a personalizar. |

### VII.2- Toggle por Categoria (Inclusão/Exclusão do Total)

| ID | Regra |
|---|---|
| RN-06 | Cada categoria no Detalhamento de Custos possui um toggle on/off. Com toggle **off**, o custo da categoria é multiplicado por 0 antes de entrar no total (`fatorCategoria = 0`). |
| RN-07 | O toggle de categoria não apaga os dados da categoria. Ao reativar, o custo retorna normalmente. |
| RN-08 | O toggle de categoria **não interage** com o fator de responsabilidade de moto alugada (RN-01 de RF-ALU-01). São camadas independentes: um é "quanto dessa categoria é minha responsabilidade", o outro é "quero incluir essa categoria no meu cálculo". |
| RN-09 | As porcentagens exibidas no Detalhamento são calculadas apenas sobre as categorias com toggle ativo, sempre somando 100%. |

### VII.3- Toggle ORG/PAR por Peça

| ID | Regra |
|---|---|
| RN-10 | O toggle ORG/PAR por peça (na aba PEÇAS) sobrescreve a configuração global `perfilPecasGlobal` para aquela peça específica. |
| RN-11 | Se `anoFimOriginal` no preset indica que não há original disponível para o modelo/ano, o toggle ORG é desabilitado para todas as peças, independentemente de seleção manual. |
| RN-12 | O toggle ORG/PAR por peça é um override armazenado no perfil (segue RN-02). O reset (↺) da peça desfaz também esse toggle. |

### VII.4- Cálculo com Multi-Combustível

| ID | Regra |
|---|---|
| RN-13 | O custo de combustível no total é calculado usando o tipo de combustível principal definido no onboarding (`tipoGasolinaPreferida`). |
| RN-14 | O usuário pode configurar preço e autonomia para os três tipos (comum, aditivada, etanol) na aba PEÇAS. Isso não muda o tipo principal; apenas atualiza os dados daquele tipo. |
| RN-15 | Para trocar o tipo de combustível principal, o usuário deve ir às Configurações e alterar `tipoGasolinaPreferida`. |

### VII.5- Gatilho Duplo (km ou tempo)

| ID | Regra |
|---|---|
| RN-16 | Para peças com intervalo em km e em meses, o sistema calcula qual gatilho será atingido primeiro com base no `kmMensal` do usuário e usa esse intervalo para o CPK. |
| RN-17 | Fórmula: `mesesParaAtingirKm = intervaloKm / kmMensal`. Se `mesesParaAtingirKm < intervaloMeses` → gatilho por km. Caso contrário → gatilho por tempo (`intervaloEfetivo = intervaloMeses × kmMensal`). |

### VII.6- Alerta de Manutenção

| ID | Regra |
|---|---|
| RN-18 | O alerta de manutenção é exibido quando `kmAtual + kmParaProxima ≤ limiarAlerta` (padrão: 500 km antes). |
| RN-19 | A estimativa de dias para a próxima troca é calculada: `diasRestantes = kmParaProxima / (kmDia × diasSemana / 7)`. |
| RN-20 | O alerta exibe apenas a manutenção mais urgente no painel. O usuário pode ver todas as pendências na tela de Detalhamento ou SERVIÇOS. |

### VII.7- Fator de Responsabilidade (Moto Alugada)

| ID | Regra |
|---|---|
| RN-21 | `fatorResponsabilidade` aceita três valores: `"eu" → 1.0`, `"locador" → 0.0`, `"dividimos" → 0.5`. |
| RN-22 | O fator é aplicado por bloco: documentação, manutenção, seguro. Financiamento/aluguel não tem fator — é sempre custo do entregador. |
| RN-23 | Se `situacaoMoto !== 'alugada'`, todos os fatores são 1.0 (sem efeito). |

---

## VIII- Requisitos Não Funcionais

### VIII.1- Desempenho e Disponibilidade

| ID | Descrição | Meta |
|---|---|---|
| RNF-01 | Funcionar completamente offline após o primeiro acesso. | Service Worker com Cache First para assets estáticos. |
| RNF-02 | Primeiro carregamento rápido em conexões 3G. | Bundle total abaixo de 500 KB gzipado. |
| RNF-03 | Instalável na tela inicial de smartphones Android e iOS. | manifest.json válido com ícones, nome e cores configurados. |
| RNF-04 | Qualquer edição de valor deve atualizar o painel em menos de 200ms. | Recalcular apenas os valores dependentes do campo alterado (`useMemo` com dependências corretas). |

### VIII.2- Usabilidade e Acessibilidade

O público-alvo usa o app em movimento, com uma mão, sob luz solar forte.

| ID | Descrição | Meta |
|---|---|---|
| RNF-05 | Elementos interativos com área de toque mínima de 48×48 px. | Botões de stepper (+ / −), reset (↺) e toggles respeitam essa medida. |
| RNF-06 | Contraste de cores no nível AA do WCAG 2.1. | Razão mínima de 4,5:1 para texto normal. O tema escuro das telas já favorece isso. |
| RNF-07 | Campos numéricos abrem teclado numérico automaticamente. | `inputMode="decimal"` em todos os inputs de km, R$ e km/L. |
| RNF-08 | Interface responsiva para telas de 360 px a 430 px. | Layout testado em Moto G e Samsung A. |
| RNF-09 | Onboarding concluível em menos de 3 minutos. | Teste com 3 entregadores reais. Tempo médio abaixo de 3 min. |

### VIII.3- Manutenção e Evolução

| ID | Descrição | Meta |
|---|---|---|
| RNF-10 | Dados de cada modelo em arquivo JSON separado da lógica de cálculo. | Adicionar novo modelo = inserir novo JSON. Zero alteração no código. |
| RNF-11 | Lógica de cálculo isolada em funções puras e testáveis. | Funções em `/utils/calculos.js` sem efeitos colaterais. Cobertura de testes unitários para as funções principais. |

### VIII.4- Arquitetura Login-Ready

| ID | Descrição | Meta |
|---|---|---|
| RNF-12 | Todo acesso a dados do usuário deve passar por um único hook de abstração (`usePerfil`). Componentes **nunca** acessam localStorage diretamente. | Auditoria de código: nenhum `localStorage.getItem/setItem` fora do hook. Em V2, substituir apenas o interior do hook por chamadas à API. |

### VIII.5- Analytics

| ID | Descrição | Meta |
|---|---|---|
| RNF-13 | Integrar Umami para rastreamento anônimo, sem cookies. | Eventos: `onboarding_iniciado`, `onboarding_concluido`, `modelo_selecionado`, `perfil_exportado`, `modo_padrao_ativado`. |
| RNF-14 | Nenhuma informação pessoal do usuário enviada ao Umami. | Apenas eventos e nomes de telas. |

---

## IX- Estrutura de Dados

### IX.1- Schema do Perfil do Usuário (localStorage key: `"motocalc_perfil"`)

```json
{
  "schemaVersion": 4,
  "onboardingConcluido": true,
  "apelido": "Ricardo",

  "moto": {
    "marca": "Honda",
    "modelo": "pop110i",
    "ano": 2024,
    "temBau": false,
    "kmAtual": 18250,
    "kmUltimaRevisao": 12000,
    "estado": "RJ"
  },

  "perfilManutencao": {
    "perfilPecasGlobal": "paralela",
    "modoRevisao": "autonomo",
    "precoMaoDeObra": 150.00,
    "frequenciaRevisaoKm": 6000
  },

  "trabalho": {
    "kmPorDia": 45,
    "diasPorSemana": 6,
    "aplicativos": ["iFood"],
    "horasPorDia": 8
  },

  "financeiro": {
    "tipoGasolinaPreferida": "comum",
    "combustiveis": {
      "comum":    { "preco": 6.61, "autonomia": 35 },
      "aditivada":{ "preco": 6.89, "autonomia": 37 },
      "etanol":   { "preco": 4.50, "autonomia": 25 }
    },
    "internet": 20.00,
    "seguro": {
      "tem": true,
      "valorAnual": 989.00,
      "empresa": "SUHAI"
    },
    "situacaoMoto": "financiada",
    "parcelaMensal": 560.00,
    "parcelasRestantes": 17,
    "aluguelMensal": null,
    "alimentacaoDia": 20.00,
    "gastosCustom": [
      { "id": "gc_uuid", "nome": "Estacionamento", "valorMensal": 50.00, "ativo": true }
    ],
    "responsabilidadeAluguel": {
      "documentos": "eu",
      "manutencao": "eu",
      "seguro": "eu"
    }
  },

  "configuracaoDisplay": {
    "modoExibicao": "personalizado",
    "modoOficinaDisplay": "independente",
    "categoriasAtivas": {
      "combustivel": true,
      "alimentacao": true,
      "manutencao": true,
      "documentacao": true,
      "internet": true,
      "seguro": true,
      "financiamento": true
    }
  },

  "pecasOverrides": [
    {
      "id": "oleo_motor",
      "precoEditado": 45.00,
      "intervaloKmEditado": 1250,
      "perfilPecasOverride": null
    },
    {
      "id": "filtro_ar",
      "precoEditado": null,
      "intervaloKmEditado": null,
      "perfilPecasOverride": "paralela"
    }
  ],

  "servicosMaoDeObra": {
    "trocaOleo": 5.00,
    "trocaKitTransmissao": 40.00,
    "trocaPneu": 30.00,
    "revisaoGeral": 350.00,
    "avulso": 0.00
  },

  "revisaoAutorizadaOverrides": [
    { "intervaloKm": 1000,  "precoEditado": 82.98 },
    { "intervaloKm": 6000,  "precoEditado": 248.06 }
  ],

  "fipeCache": {
    "valor": 11000.00,
    "dataConsulta": "2026-04-28",
    "codigoFipe": "001234-0"
  },

  "diarioTrabalho": [
    {
      "id": "uuid-v4",
      "data": "2026-05-01",
      "kmInicial": 18000,
      "kmFinal": 18045,
      "kmPercorridos": 45,
      "comeu": true,
      "abasteceu": false,
      "litros": null,
      "precoLitro": null
    }
  ],

  "historicoManutencao": {
    "trocasOleo": [
      { "id": "uuid", "data": "2026-03-01", "km": 17000, "valorTotal": 85.00 }
    ],
    "revisoes": [
      {
        "id": "uuid",
        "data": "2026-01-15",
        "km": 12000,
        "local": "Ronda Honda",
        "status": "concluido",
        "itensTrocados": ["filtro_ar", "vela_ignicao"],
        "valorTotal": 1200.00
      }
    ],
    "trocasPneu": [
      {
        "id": "uuid",
        "data": "2025-08-10",
        "km": 11800,
        "qual": "dianteiro",
        "marca": "Pirelli",
        "valorTotal": 380.00
      }
    ],
    "trocasKitRelacao": [
      { "id": "uuid", "data": "2025-06-01", "km": 12100, "marca": "DID", "valorTotal": 420.00 }
    ],
    "abastecimentos": [
      {
        "id": "uuid",
        "data": "2026-05-02",
        "tipo": "aditivada",
        "posto": "Ipiranga RJ",
        "km": 18200,
        "litros": 3.5,
        "precoLitro": 6.89,
        "valorTotal": 24.12
      }
    ]
  }
}
```

### IX.2- Resolução de Valor com Override

```
function resolverValor(id, campo, perfil, preset) {
  if (perfil.configuracaoDisplay.modoExibicao === 'padrao') {
    return preset[id][campo]  // modo PADRÃO: ignora todos os overrides
  }
  const override = perfil.pecasOverrides.find(o => o.id === id)
  if (override && override[campo + 'Editado'] !== null) {
    return override[campo + 'Editado']  // modo PERSONALIZADO: usa override
  }
  return preset[id][campo]  // fallback ao preset
}
```

### IX.3- Campo `anoFimOriginal` nos Presets

```json
// Presente apenas em presets de modelos com descontinuação de peças originais
"anoFimOriginal": 2010
```

### IX.4- Schema do Arquivo de Export

```json
{
  "schemaVersion": 4,
  "exportadoEm": "2026-05-03T14:30:00Z",
  "app": "MotoCalc RJ",
  "aviso": "Este arquivo contém dados pessoais. Não compartilhe.",
  "perfil": { /* objeto completo acima */ }
}
```

---

## X- Regras de Cálculo

> Documento completo em `docs/Formulas_Calculos.md`. Este é o resumo de referência.

### X.1- Rodagem

```
diasAno        = diasSemana × 52
kmMensal       = kmDia × diasSemana × 4,33
kmAnual        = kmDia × diasAno
consumoEfetivo = temBau ? consumoKmLComBau : combustiveis[tipoPreferido].autonomia
```

### X.2- Custo por km de cada peça (CPK)

```
intervaloEfetivo = resolverGatilhoDuplo(intervaloKm, intervaloMeses, kmMensal)
cpkPeca          = resolverValor(id, 'preco', perfil, preset) / intervaloEfetivo
```

### X.3- Custos de Manutenção Variável

```
cpkTotal        = soma(cpkPeca) para todas as peças
custoManutAnual = cpkTotal × kmAnual
```

### X.4- Custo de Combustível

```
cpkCombustivel  = combustiveis[tipoPreferido].preco / consumoEfetivo
custoCombAnual  = cpkCombustivel × kmAnual
```

### X.5- Custo de Revisão

```
// Modo dealer (autorizada):
custoRevisaoAnual = (soma dos preços das revisões na tabela autorizada) / vidaUtilCiclo × kmAnual

// Modo independente:
revisoesPorAno    = kmAnual / frequenciaRevisaoKm
custoRevisaoAnual = revisoesPorAno × precoMaoDeObra
```

### X.6- Custos Fixos

```
ipvaAnual          = (idadeMoto >= 15) ? 0 : fipeCache.valor × 0.02
licenciamentoAnual = dados_rj.licenciamento   // R$206 em 2026
custoDocumentos    = (ipvaAnual + licenciamentoAnual) × fatorResponsabilidade('documentos')
custoInternet      = financeiro.internet × 12
custoSeguro        = financeiro.seguro.tem ? financeiro.seguro.valorAnual : 0
custoFinanciamento = situacaoMoto === 'financiada' ? parcelaMensal × 12 : 0
custoAluguel       = situacaoMoto === 'alugada' ? aluguelMensal × 12 : 0
```

### X.7- Total e Granularidades

```
custoMotoAnual  = (custoDocumentos + custoRevisao + custoManutAnual + custoCombAnual
                + custoInternet + custoSeguro + custoFinanciamento + custoAluguel
                + somaGastosCustom)
                // × fatorCategoria[categoria] para categorias com toggle off = 0

custoAlimentacao = alimentacaoDia × diasAno
custoTotalAnual  = custoMotoAnual + custoAlimentacao

// Granularidades
custoMensal  = custoTotalAnual / 12
custoSemanal = custoTotalAnual / 52
custoDiario  = custoTotalAnual / diasAno      // ÷ dias TRABALHADOS, não 365
custoHorario = custoDiario / horasDia
custoPorKm   = custoTotalAnual / kmAnual
```

---

## XI- Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| Frontend (UI) | React | 18+ | Reatividade para recalcular em tempo real (RF-CUSTOS-07). |
| Estilização | Tailwind CSS | 3+ | Mobile-first rápido. Consistente com o tema escuro das telas. |
| Build e PWA | Vite + vite-plugin-pwa | latest | Service Worker automático. Build leve e rápido. |
| Roteamento | React Router DOM | 6+ | Navegação entre abas e telas sem reload. Suporte a rotas `/custos`, `/registros`, `/servicos`, `/pecas`, `/configuracoes`. |
| Estado Global | useReducer + Context API | — | `useReducer` para o perfil complexo. Context para distribuir sem prop drilling. |
| Persistência | localStorage via `usePerfil` | — | Sem backend para V1. Hook abstrai o storage (RNF-12). |
| Dados (Presets) | JSON estático | — | Separação clara dados/lógica. Novo modelo = novo JSON (RNF-10). |
| Cálculo | Funções puras em `/utils/calculos.js` | — | Testável independentemente da UI (RNF-11). |
| Gráfico | Recharts | 2+ | Donut chart na tela de Detalhamento (RF-DET-01). Leve (~120 KB). |
| IDs únicos | nanoid | 3+ | Geração de IDs para registros do diário e histórico. Leve e seguro. |
| Datas | date-fns | 3+ | Formatação e cálculo de datas (estimativa de dias, histórico). Tree-shakeable. |
| FIPE | BrasilAPI | — | `GET https://brasilapi.com.br/api/fipe/motos/v1/{codigo}`. Gratuita, sem chave. Consultada uma vez no onboarding e cacheada. |
| Analytics | Umami | cloud ou self-hosted | Sem cookies, sem dados pessoais, compatível com LGPD (RNF-13). |
| Testes | Vitest | latest | Testes unitários das funções de `calculos.js`. |

> **Por que Recharts em vez de Chart.js?** Recharts é construído sobre componentes React — `<PieChart>`, `<Cell>` etc. — tornando a integração mais natural e evitando manipulação imperativa do DOM. Para o donut chart do Detalhamento, o volume de dados é pequeno (até ~8 categorias) e a API declarativa facilita atualização reativa quando os valores mudam.

---

## XII- Priorização MoSCoW

| Prioridade | Requisitos | Justificativa |
|---|---|---|
| **Must Have (V1)** | RF-ON-01 a 05, RF-CUSTOS-01 a 08, RF-DET-01 a 12, RF-SERV-01 a 05, RF-PECAS-01 a 09, RF-DOC-01 a 03, RF-CONF-01 a 04, RF-ALU-01 a 03, RN-01 a 23, RNF-01 a 12 | Núcleo funcional. O sistema de overrides + reset (RN-01 a 05) é arquitetural — deve estar desde o início. |
| **Should Have (V1)** | RF-EXP-01 a 03, RF-REG-01 a 12, RNF-13 a 14 (Umami) | Registros e histórico transformam o app de calculadora em ferramenta viva. Export/import resolve o problema de troca de celular. |
| **Could Have (V1 ou V2)** | RF-DIA-01 a 04 (Diário de Trabalho), Diário integrado no REGISTROS | Dados reais de km e consumo melhoram os cálculos ao longo do tempo. Pode ser adicionado sem alterar o núcleo. |
| **Won't Have (V1)** | Login, sincronização entre dispositivos, notificações push, backend, API de preços em tempo real, comparativo de plataformas | Complexidade excessiva. Fundação login-ready via RNF-12 e RF-EXP-03 prepara V2. |

---

## XIII- Produção e Deploy

### XIII.1- Hospedagem

- **Plataforma:** Netlify ou Vercel (plano gratuito)
- **HTTPS:** obrigatório — incluído automaticamente. Sem HTTPS o Service Worker não funciona.
- **Deploy:** automático via push para branch `main` no GitHub.

### XIII.2- Domínio

- Domínio `.com.br` recomendado (~R$40/ano — Registro.br)
- Sem domínio próprio: `motocalc.netlify.app`

### XIII.3- Documentos Legais

- **Política de Privacidade:** página pública `/privacidade`. Declarar que o app não coleta nem transmite dados pessoais.
- **Termos de Uso:** aviso de que valores são estimativas baseadas em médias.

### XIII.4- Distribuição

| Canal | Situação |
|---|---|
| Web direto (link / QR code) | Principal. Usuário abre no celular e instala na tela inicial. |
| Google Play Store (via TWA) | Possível com Bubblewrap. Exige conta dev (~$25) e política de privacidade publicada. |
| Apple App Store | Fora do escopo V1. |

### XIII.5- Calendário de Manutenção de Dados

| Dado | Frequência |
|---|---|
| Licenciamento DETRAN-RJ | Anual (janeiro) |
| Alíquota IPVA RJ | Anual (janeiro) |
| Preço padrão da gasolina (ANP) | Mensal ou conforme variação significativa |
| Preços das peças nos presets JSON | Semestral (abril e outubro) |
| Tabela de revisões autorizadas | Anual ou conforme revisão das tabelas Honda |
| FIPE | Automático via BrasilAPI |

---

## XIV- Diferenciais — Atividade Extensionista

### XIV.1- Impacto Social

Os entregadores de moto são microempreendedores informais que raramente têm acesso a ferramentas de gestão financeira. O MotoCalc RJ promove inclusão financeira digital, capacitando o entregador a responder:

- Vale a pena aceitar uma entrega curta que paga pouco?
- Qual moto é mais econômica para o meu volume de km?
- Quanto do meu faturamento vai para os custos da moto?
- Quando minha moto for quitada, quanto meu lucro líquido vai aumentar?

### XIV.2- Conceitos de ADS Aplicados

| Conceito | Onde se Aplica |
|---|---|
| Levantamento de Requisitos | Este documento estrutura formalmente o sistema com MoSCoW, critérios de aceite e rastreabilidade por ID. |
| Modelagem de Dados (JSON) | Presets e perfil do usuário representam modelagem de entidades sem banco relacional. |
| Padrão Override/Preset | Sistema de overrides separado dos presets imutáveis é uma aplicação de Separation of Concerns. |
| State Management (React) | `useReducer` para estado complexo; `useMemo` para recalcular apenas quando as dependências mudam. |
| Padrão Repository | `usePerfil` abstrai o storage — componentes não conhecem localStorage. |
| Arquitetura PWA | Service Worker e manifest.json para aplicação offline-first. |
| Separação de Responsabilidades | Lógica em `/utils/`, dados em `/presets/`, UI em `/components/`, estado em `/hooks/`. |
| UX e Acessibilidade | Onboarding progressivo, área de toque mínima 48px, contraste WCAG. |

---

*MotoCalc RJ — Documento de Requisitos v4.0 — Atividade Extensionista — ADS*
*Última atualização: 03/05/2026 — Versão baseada na análise das telas do protótipo. Principais adições: navegação em 4 abas, sistema de overrides + imutabilidade do preset, toggles por categoria e por peça, aba SERVIÇOS, aba PEÇAS com multi-combustível, regras de negócio formalizadas (RN-01 a 23), stack com Recharts/React Router/date-fns/nanoid/Vitest.*

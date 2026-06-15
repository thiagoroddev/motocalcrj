# Documento de Requisitos
## I- MotoCalc RJ — Calculadora de Custo Operacional para Entregadores de Moto
### I.1- PWA • Município do Rio de Janeiro, RJ • Atividade Extensionista

| Campo | Valor |
|---|---|
| Versão | 3.0 |
| Baseado em | v2.0 (docx) + decisões de planejamento abr/2026 |
| Mudanças principais | Preços duplos (original/paralela), export/import, arquitetura login-ready, Umami, novas perguntas de onboarding (kmAtual, perfilPecas, modoRevisao, alimentação), granularidade por hora, custo exclusivo da moto, deploy/produção, lógica `anoFimOriginal` (motos antigas), toggles de custo para moto alugada, Módulo Diário de Trabalho, Módulo Histórico de Manutenção |

---

## II- Visão Geral do Projeto

### II.1- Descrição

O MotoCalc RJ é um Progressive Web App (PWA) projetado para ajudar entregadores de moto do Município do Rio de Janeiro a compreenderem com precisão o custo real de operação do seu veículo. O aplicativo transforma custos invisíveis — como depreciação de peças e manutenções preventivas — em valores visíveis por dia, semana, mês e ano, permitindo decisões financeiras mais conscientes.

### II.2- Problema que o Projeto Resolve

A grande maioria dos entregadores de moto tem consciência apenas do custo da gasolina. Custos como troca de relação, desgaste de pneus, velas e ajuste de válvulas são "gastos do futuro" que, na prática, corroem o lucro presente. Sem uma ferramenta de visualização, o entregador superestima seu ganho líquido real, comprometendo sua saúde financeira.

### II.3- Solução Proposta

Um PWA de página única (SPA), mobile-first, que:

- Conduz o usuário por um onboarding inicial, coletando seu perfil completo;
- Oferece presets de dados técnico-financeiros por modelo de moto, baseados nos manuais do proprietário e em pesquisa de campo no RJ;
- Permite que o usuário personalize qualquer valor (preço de peça, intervalo de troca, custo de mão de obra);
- Exibe o custo operacional total em visões: anual, mensal, semanal, diário, por hora e por km;
- Persiste todas as configurações no dispositivo do usuário via localStorage;
- Funciona completamente offline após o primeiro carregamento;
- Permite exportar e importar o perfil completo (para migração entre dispositivos);
- Registra métricas de uso anônimas via Umami.

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

> Os presets dos modelos além do Pop 110i são adicionados na Fase 8 sem alterar código — apenas inserindo os JSONs correspondentes.

### III.2- Fora do Escopo — V1

- **Login e autenticação de usuários** — fora do escopo de V1, mas a arquitetura deve suportá-lo em V2 sem refatoração (ver RNF-11);
- Backend ou banco de dados remoto;
- Comparativo de rentabilidade por plataforma de entrega;
- Notificações push de manutenção;
- Modelos de moto fora da lista acima.

---

## IV- Fluxo de Onboarding — Primeiro Acesso

O onboarding ocorre uma única vez, no primeiro acesso. Após a conclusão, as respostas são persistidas e o onboarding não é exibido novamente — a menos que o usuário opte por "redefinir perfil".

> **Filosofia:** cada pergunta deve ser acompanhada de uma micro-explicação de por que aquela informação importa para o cálculo. O entregador precisa sentir que o app está do lado dele. Uma pergunta por tela, com botão "Próxima" — nunca um formulário longo.

### IV.1- Bloco 1 — Identificação da Moto

| Nº  | Pergunta                                   | Input                         | Observação Técnica                                    |
| --- | ------------------------------------------ | ----------------------------- | ----------------------------------------------------- |
| 01  | Qual é a marca da sua moto?                | Cards (Honda, Yamaha, Outros) | Filtra os modelos do passo seguinte                   |
| 02  | Qual é o modelo?                           | Dropdown/cards por marca      | Carrega o preset JSON correspondente                  |
| 03  | Em que ano foi fabricada?                  | Lista de anos do modelo       | Usado para calcular IPVA e isenção (>=15 anos)        |
| 04  | Usa baú ou caixa de entrega?               | Sim / Não                     | Se Sim: aplica `consumoKmLComBau` do preset (≈ −8%)   |
| 04b | Qual a quilometragem atual do hodômetro?   | Input numérico (km)           | Necessário para sugerir próximas trocas e revisões ⚠️ |
| 04c | Qual era a km na sua última revisão geral? | Input numérico (km)           | Calcula distância desde a última revisão ⚠️           |

> ⚠️ **04b e 04c são obrigatórios.** Sem esses dados, o app não consegue avisar "você está próximo da troca de óleo" ou "revisão em X km". São o que diferenciam o app de uma calculadora genérica.

### IV.2- Bloco 2 — Perfil de Manutenção

| Nº | Pergunta | Input | Observação Técnica |
|---|---|---|---|
| 04d | Você usa peças originais Honda ou aceita peças paralelas de qualidade? | Cards: "Apenas originais Honda" / "Aceito peças paralelas" | Define `perfilPecas: 'original' \| 'paralela'`. Muda o CPK total calculado. A opção "Apenas originais" é **desativada automaticamente** se o preset da moto indicar `anoFimOriginal` e o ano da moto for anterior a esse campo — ver RF-10c. |
| 04e | Onde você faz as revisões gerais da moto? | Cards: "Na concessionária Honda" / "Em oficina independente" | Define `modoRevisao: 'dealer' \| 'autonomo'`. Muda o custo de revisão dramaticamente (R$952 vs ~R$181/ano). Para motos com 10+ anos, padrão pré-selecionado é "oficina independente". |
| 04f | Se oficina independente: quanto costuma pagar pela revisão? | Input numérico (R$) — padrão: R$150 | Usado em `custoRevisaoAnual = revisoesPorAno × precoRevisaoGeral`. ⚠️ **Lacuna de dados:** o valor R$150 é estimativa de campo. Não foi feita pesquisa sistemática em oficinas independentes do RJ — ao contrário dos preços de concessionária Honda (coletados em tabela oficial). Atualizar com pesquisa real antes do lançamento. |

### IV.3- Bloco 3 — Volume de Trabalho

| Nº | Pergunta | Input | Observação Técnica |
|---|---|---|---|
| 05 | Quantos km você roda em um dia de trabalho? | Input numérico (km) | `kmDia`. Base de toda a projeção de rodagem. |
| 06 | Quantos dias por semana você trabalha? | Seleção: 1 a 7 | `diasSemana`. Com `kmDia`, calcula km mensal e anual. |

```
kmMensal = kmDia × diasSemana × 4,33
kmAnual  = kmMensal × 12
```

### IV.4- Bloco 4 — Custos Financeiros

#### IV.4.1- Combustível

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 07 | Quanto você paga no litro da gasolina? | Input numérico — padrão: R$6,61 | Valor ANP semana 19–25/abr/2026. Editável. |

#### IV.4.2- Plano de Dados

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 08 | Quanto paga no seu plano de internet por mês? | Input numérico — padrão: R$30 | Custo do trabalho, somado aos fixos mensais. |

#### IV.4.3- Seguro

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 09 | Você tem seguro da moto? | Sim / Não | Se Não: exibe nota sobre recomendação para uso profissional. |
| 10 | Como você paga o seguro? | Anual / Mensal | Define conversão para custo anual. |
| 11 | Qual o valor? | Input numérico (R$) | Se mensal: × 12. Padrão: R$929,96/ano (Suhai). |

#### IV.4.4- Situação da Moto

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 12 | Como você usa sua moto? | Cards: "Quitada" / "Financiada" / "Alugada" | Determina ramo condicional. |
| 12a | Valor da parcela mensal? | Input numérico (R$/mês) | Apenas se financiada. Custo fixo mensal. |
| 12b | Quantas parcelas restam? | Input numérico | Apenas se financiada. Exibe data estimada de quitação no painel. |
| 12c | Quanto paga de aluguel? | Input + seleção semanal/mensal | Apenas se alugada. Se semanal: × 4,33. |
| 12d | Quem paga o IPVA e o licenciamento? | Cards: "Eu pago" / "O locador paga" / "Dividimos" | Apenas se alugada. Define `responsavelDocumentos`. Se "Dividimos": custo × 0,5. |
| 12e | Quem paga a manutenção e as peças? | Cards: "Eu pago" / "O locador paga" / "Dividimos" | Apenas se alugada. Define `responsavelManutencao`. Aplica fator 0, 1 ou 0,5 ao bloco de manutenção. |
| 12f | Quem paga o seguro? | Cards: "Eu pago" / "O locador paga" / "Dividimos" | Apenas se alugada. Define `responsavelSeguro`. Pode mostrar nota "moto alugada geralmente tem seguro incluso — confirme no seu contrato". |

> **Lógica dos toggles de moto alugada:** cada categoria de custo tem um fator de responsabilidade `fatorResponsabilidade ∈ {0, 0.5, 1.0}`. O custo calculado é multiplicado por esse fator antes de entrar no total. Assim, se o locador paga o IPVA, `ipvaAnual × 0 = R$0` no custo do entregador. Se dividem, `ipvaAnual × 0.5`.

#### IV.4.5- Alimentação

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 13 | Quanto gasta com alimentação em um dia de trabalho? | Input numérico — padrão: R$20 | `custoAlimentacaoAnual = valorDia × diasAno`. Aparece separado dos custos da moto. |

### IV.5- Bloco 5 — Personalização

| Nº | Pergunta | Input | Observação |
|---|---|---|---|
| 14 | Como quer ser chamado no app? | Texto livre (opcional) | Ex: "Olá, Carlos! Seu custo hoje é..." |
| 15 | Em qual(is) app(s) você trabalha? | Multi-seleção: iFood, Rappi, 99, Loggi, Outros | Não impacta cálculo. Dado para melhoria futura. |

### IV.6- Tela de Confirmação

Ao concluir o onboarding, o sistema exibe um resumo de todas as informações fornecidas. O usuário pode editar qualquer campo antes de confirmar. Ao clicar em "Confirmar e ver meus custos", o perfil é salvo e o usuário vai ao painel principal.

---

## V- Requisitos Funcionais

### V.1- Onboarding

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-ON-01 | Exibir onboarding apenas no primeiro acesso. Nos acessos seguintes, se houver perfil salvo, ir direto ao painel. | Ao reabrir o app, onboarding não aparece e painel carrega com dados salvos. |
| RF-ON-02 | Estruturar o onboarding em blocos com indicador de progresso visível. | Usuário vê em qual etapa está e quantas faltam. |
| RF-ON-03 | Implementar lógica condicional: perguntas 10, 11, 12a, 12b, 12c e 04f só aparecem quando as condições-pai forem atendidas. | Testes validam que cada ramo exibe apenas as perguntas pertinentes. |
| RF-ON-04 | Permitir navegação para a pergunta anterior sem perder respostas já dadas. | Botão "Voltar" funcional em todas as telas exceto a primeira. |
| RF-ON-05 | Exibir tela de revisão ao final do onboarding com opção de editar qualquer campo antes de salvar. | Botão "Editar" ao lado de cada grupo redireciona para a tela correspondente. |

### V.2- Seleção de Perfil e Presets

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-01 | Carregar automaticamente o preset do modelo selecionado. | Todos os campos de manutenção são preenchidos automaticamente. |
| RF-02 | Exibir no painel: nome da moto, ano, km atual, km mensal e anual calculados. | Informações visíveis sem navegar para outro menu. |
| RF-03 | Oferecer acesso às Configurações para editar qualquer dado do onboarding. | Alteração de qualquer campo recalcula os resultados em tempo real. |

### V.3- Custos Fixos de Documentação

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-04 | Calcular IPVA: `valorFipe × aliquotaEstado`. Para motos com 15+ anos no RJ, exibir "Isento". FIPE buscada via BrasilAPI no onboarding e cacheada no localStorage. | Valor correto exibido como somente leitura com nota de fonte. Se offline, usa último valor cacheado com aviso de data. |
| RF-05 | Exibir licenciamento anual conforme tabela DETRAN-RJ vigente (2026: R$206). | Valor somente leitura. |
| RF-06 | Exibir ícone de informação (tooltip) em cada custo fixo explicando a origem do valor. | Ao tocar no ícone, usuário vê nota como "Alíquota IPVA-RJ 2026: 2% sobre valor FIPE". |

### V.4- Combustível e Custos Operacionais

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-07 | Exibir preço da gasolina com padrão ANP (R$6,61). Editável pelo usuário. | Alteração reflete imediatamente no custo total. |
| RF-08 | Exibir consumo médio do veículo com valor do preset. Se tem baú, usar `consumoKmLComBau`. Editável. | Campo editável com valor inicializado corretamente. |
| RF-09 | Exibir custo do plano de internet como campo editável. Inicializado com resposta do onboarding. | Alteração impacta o custo total. |

### V.5- Plano de Manutenção por Peças

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-10 | Listar todas as peças do preset com: nome, intervalo de troca em km (editável), preço da peça (editável). | Cada item possui campos editáveis independentes. |
| RF-10b | O preço exibido inicialmente deve corresponder ao `perfilPecas` escolhido no onboarding (`original` ou `paralela`). | Usuário que escolheu "paralela" vê preços paralelos como padrão. |
| RF-10c | Se o preset do modelo incluir o campo `anoFimOriginal` e o ano da moto for anterior a esse valor, desativar a opção "Apenas peças originais" no onboarding e no módulo de manutenção. Exibir tooltip explicativo. | Tooltip: "Para este modelo neste ano, peças originais Honda não são mais fabricadas. O app usa preços de peças paralelas de qualidade." A pergunta 04d omite o card "Apenas originais" automaticamente — `perfilPecas` é forçado para `'paralela'`. |
| RF-11 | Exibir o intervalo original do manual como referência mesmo após edição. | Após edição, valor original permanece visível: "Manual: 6.000 km / Entrega: 1.250 km". |
| RF-12 | Suportar gatilho duplo (km OU meses): aplicar o que ocorrer primeiro com base no kmMensal do usuário. | Para vela/filtro etc., o sistema calcula qual gatilho será atingido primeiro. |
| RF-13 | Calcular custo anual de cada peça: `(preço / intervaloKm) × kmAnual`. | Custo anual calculado exibido ao lado de cada item. |
| RF-14 | Permitir adicionar itens personalizados de manutenção. | Botão "+ Adicionar peça". Usuário informa nome, preço e intervalo. Item entra no cálculo. |

### V.6- Revisão Geral / Mão de Obra

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-15 | Exibir campo de valor da mão de obra por revisão (editável). Inicializado com resposta do onboarding (padrão R$150 para oficina independente). | Campo numérico editável. |
| RF-16 | Exibir campo de frequência de revisões por ano (editável, padrão: baseado em `kmAnual / 6000`). | Campo de seleção numérica. Impacta custo anual. |
| RF-17 | Permitir checklist de peças trocadas em cada revisão geral, com preço individual editável. | Itens marcados são somados ao custo da revisão. |
| RF-18 | Calcular custo total da revisão: `(mão_de_obra + soma_peças_checklist) × frequência_anual`. | Fórmula aplicada corretamente e resultado visível. |

### V.7- Painel de Resultados

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-19 | Exibir custo total em 5 periodicidades: Anual, Mensal, Semanal, Diário e Por Hora. | Cálculos: `anual ÷ 12`, `anual ÷ 52`, `anual ÷ diasAno`, `diario ÷ horasDia`. O divisor do custo diário é `diasAno` (dias trabalhados), não 365. |
| RF-19b | Exibir dois totais distintos: **"Custo total de operação"** (inclui alimentação) e **"Custo exclusivo da moto"** (sem alimentação). | Ambos os totais visíveis no painel, com explicação da diferença. |
| RF-20 | Exibir custo por km rodado: `custoTotalAnual ÷ kmAnual`. | Exibido como "R$ X,XX por km". |
| RF-21 | Exibir detalhamento dos custos por categoria: Documentação, Revisão, Peças/Manutenção, Combustível, Internet, Seguro, Alimentação, Financiamento/Aluguel. | Lista ou gráfico com valor absoluto e % de cada categoria no total. |
| RF-21b | Exibir alerta visual quando o usuário estiver próximo da troca de uma peça ou revisão, com base em `kmAtual`. | "Próxima troca de óleo em X km (≈ N dias)". |
| RF-22 | Qualquer edição de valor deve atualizar o painel em tempo real, sem botão "Calcular". | Alteração em qualquer campo reflete no painel em menos de 200ms. |

### V.8- Persistência de Dados

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-23 | Salvar automaticamente todas as configurações no localStorage a cada alteração. | Ao fechar e reabrir o app, todos os valores customizados estão exatamente como o usuário deixou. |
| RF-24 | Ao reabrir o app com perfil salvo, carregar todos os dados automaticamente sem ação do usuário. | O app nunca exibe o onboarding novamente se houver perfil salvo. |
| RF-25 | Oferecer botão "Redefinir Perfil" nas configurações, com confirmação explícita. | Após confirmação, apaga tudo e reinicia o onboarding. |

### V.9- Moto Alugada — Distribuição de Custos

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-29a | Para usuários com `situacaoMoto: 'alugada'`, aplicar fator de responsabilidade individual a cada bloco de custo: documentação (IPVA + licenciamento), manutenção (peças + revisão) e seguro. | Cada bloco tem `fatorResponsabilidade ∈ {0, 0.5, 1.0}`. O custo do bloco é multiplicado pelo fator antes de compor o total. |
| RF-29b | No painel, exibir nota junto ao custo total indicando quais categorias foram excluídas ou divididas. | Nota visível abaixo do total: "IPVA e licenciamento pagos pelo locador (R$0 no seu custo). Manutenção dividida (50%)." |
| RF-29c | Permitir que o usuário reedite os toggles nas Configurações sem refazer o onboarding. | Cada toggle aparece como campo editável na tela de Configurações, na seção "Moto alugada". |

### V.10- Export / Import de Perfil

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-26 | O usuário deve poder exportar todos os seus dados como um arquivo `.json` diretamente do app. | Botão "Exportar meus dados" nas configurações. Gera download de arquivo `motocalc_backup.json`. Exibe aviso: "Este arquivo contém seus dados pessoais — não compartilhe com outras pessoas." |
| RF-27 | O usuário deve poder importar um arquivo `.json` exportado anteriormente, restaurando todo o perfil. | Botão "Importar dados" nas configurações. Aceita o arquivo `.json`. Após importação bem-sucedida, o app carrega o painel com os dados restaurados. Exige confirmação se já houver um perfil salvo: "Isso substituirá seus dados atuais." |
| RF-28 | O arquivo de export deve ser compatível com versões futuras do app (incluindo eventual login em V2). | O schema do JSON exportado é o mesmo schema do localStorage (`motocalc_perfil`). Adicionar `schemaVersion` no arquivo para facilitar migrações futuras. |

---

### V.11- Módulo Diário de Trabalho

O Diário de Trabalho é um registro de entradas diárias que o usuário faz ao final (ou início) de cada dia de serviço. Com dados reais acumulados, o app passa a usar médias observadas no lugar de estimativas do onboarding.

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-30 | Permitir que o usuário registre um "dia de trabalho" com: data, km inicial (hodômetro), km final, se comeu (S/N), se abasteceu (S/N), litros abastecidos e preço por litro pago. | Formulário simples acessível da tela principal. Campos km inicial/final são numéricos. Data padrão = hoje. Campos de abastecimento aparecem condicionalmente ao marcar "abasteci". |
| RF-31 | Calcular automaticamente `kmPercorridos = kmFinal - kmInicial` em cada entrada. Atualizar `kmAtual` no perfil com o maior `kmFinal` registrado. | `kmAtual` no perfil é atualizado após cada entrada, eliminando a necessidade de edição manual. |
| RF-32 | Após acumular pelo menos 5 dias de registro, exibir no painel a média real de km/dia calculada a partir do diário, como alternativa ao valor do onboarding. | Painel exibe "Média real (últimos N dias): X km/dia" junto ao valor informado. Usuário pode escolher qual usar no cálculo. |
| RF-33 | Se o usuário registrar abastecimentos, calcular o consumo médio real (km/L) e exibir comparação com o preset. | `consumoReal = soma(kmPercorridos nos abastecimentos) / soma(litros abastecidos)`. Exibido como "Consumo real medido: X,X km/L (preset: Y,Y km/L)". |
| RF-34 | Exibir lista/histórico paginado das entradas do diário, com possibilidade de editar ou excluir uma entrada. | Tela de histórico acessível pelo menu. Cada entrada exibe data, km percorridos e ícones de abastecimento/refeição. |

---

### V.12- Módulo Histórico de Manutenção

O Histórico de Manutenção permite registrar eventos de manutenção real. Com o tempo, substitui as estimativas de preset por dados de experiência própria do usuário.

| ID | Descrição | Critério de Aceite |
|---|---|---|
| RF-35 | Permitir registro de trocas de óleo: data, km no momento, valor pago (peça + mão de obra). | Formulário acessível do módulo de manutenção. Campos: data, km, valor total. |
| RF-36 | Permitir registro de revisões gerais: data, km, itens trocados (checklist livre), valor total pago. | Checklist pré-populado com as peças do preset. Usuário marca o que foi feito e informa valor total. |
| RF-37 | Permitir registro de troca de pneus (dianteiro e/ou traseiro): data, km, marca/modelo (texto livre), valor pago. | Campos: data, km, qual pneu (radio: dianteiro / traseiro / ambos), marca, valor. |
| RF-38 | Permitir registro de troca de kit relação: data, km, marca (texto livre), valor pago. | Formulário simples. |
| RF-39 | Após acumular pelo menos 2 registros do mesmo tipo de manutenção, calcular o intervalo médio real observado e usar como referência principal, substituindo o preset. | Sistema calcula `intervaloMédioReal = média(km entre trocas registradas)`. Exibe no módulo: "Seu intervalo real observado: X.XXX km (preset: Y.XXX km)". O intervalo real é usado no cálculo de CPK se disponível. |
| RF-40 | Exibir histórico de cada categoria de manutenção com data, km e valor. Permitir excluir entradas incorretas. | Tela de histórico por categoria. Exibe gráfico de linha simples (km × custo) se houver 3+ registros. |

---

## VI- Requisitos Não Funcionais

### VI.1- Desempenho e Disponibilidade

| ID | Descrição | Meta |
|---|---|---|
| RNF-01 | Funcionar completamente offline após o primeiro acesso. | Service Worker com estratégia Cache First para assets estáticos. |
| RNF-02 | Primeiro carregamento rápido mesmo em conexões 3G. | Bundle total abaixo de 500 KB. |
| RNF-03 | Instalável na tela inicial de smartphones Android e iOS. | manifest.json válido com ícones, nome e cores configurados. |

### VI.2- Usabilidade e Acessibilidade

O público-alvo usa o app em movimento, com uma mão, sob luz solar forte e às vezes com luvas. A interface deve priorizar usabilidade extrema em mobile.

| ID | Descrição | Meta |
|---|---|---|
| RNF-04 | Elementos interativos com área de toque mínima de 48×48 px. | Nenhum botão ou campo abaixo de 48×48 logical pixels. |
| RNF-05 | Contraste de cores no nível AA do WCAG 2.1. | Razão mínima de 4,5:1 para texto normal. |
| RNF-06 | Campos numéricos abrem teclado numérico automaticamente. | Atributo `inputmode="decimal"` nos inputs. |
| RNF-07 | Interface responsiva para telas de 360 px a 430 px de largura. | Layout testado em Moto G e Samsung A. |
| RNF-08 | Onboarding concluível em menos de 3 minutos. | Teste com 3 entregadores reais. Tempo médio abaixo de 3 min. |

### VI.3- Manutenção e Evolução

| ID | Descrição | Meta |
|---|---|---|
| RNF-09 | Dados de cada modelo em arquivo JSON separado da lógica de cálculo. | Adicionar novo modelo = inserir novo JSON. Zero alteração no código. |
| RNF-10 | Lógica de cálculo isolada em funções puras e testáveis. | Funções em `/utils/calculos.js` sem efeitos colaterais. |

### VI.4- Arquitetura Login-Ready

| ID | Descrição | Meta |
|---|---|---|
| RNF-11 | Todo acesso a dados do usuário deve passar por um único hook de abstração (`usePerfil`). Componentes React **nunca** acessam o localStorage diretamente. | Auditoria de código: nenhuma chamada a `localStorage.getItem/setItem` fora do hook `usePerfil`. Em V2, substituir apenas o interior do hook por chamadas à API — o restante do app não muda. |

### VI.5- Analytics

| ID | Descrição | Meta |
|---|---|---|
| RNF-12 | Integrar Umami para rastreamento de eventos anônimo, sem cookies, sem identificação individual. | Script do Umami no `index.html`. Eventos customizados: `onboarding_iniciado`, `onboarding_concluido`, `modelo_selecionado`, `perfil_exportado`. |
| RNF-13 | Os dados de analytics não devem conter nenhuma informação pessoal do usuário. | Nenhum campo do perfil do usuário é enviado ao Umami. Apenas eventos agregados. |

---

## VII- Estrutura de Dados

### VII.1- Schema do Perfil do Usuário (localStorage)

```json
// localStorage key: "motocalc_perfil"
{
  "schemaVersion": 4,
  "onboardingConcluido": true,
  "apelido": "Carlos",

  "moto": {
    "marca": "Honda",
    "modelo": "pop110i",
    "ano": 2024,
    "temBau": true,
    "kmAtual": 18000,
    "kmUltimaRevisao": 12000,
    "perfilPecas": "paralela",
    "modoRevisao": "autonomo",
    "estado": "RJ"
  },

  "trabalho": {
    "kmPorDia": 70,
    "diasPorSemana": 2,
    "aplicativos": ["iFood", "Rappi"]
  },

  "financeiro": {
    "gasolina": 6.61,
    "internet": 30.00,
    "seguro": {
      "tem": true,
      "valorAnual": 929.96
    },
    "situacaoMoto": "quitada",
    "parcelaMensal": null,
    "parcelasRestantes": null,
    "aluguelMensal": null,
    "alimentacaoDia": 20.00,

    // Apenas se situacaoMoto === "alugada":
    "responsabilidadeAluguel": {
      "documentos": "locador",   // "eu" | "locador" | "dividimos"
      "manutencao": "dividimos",
      "seguro": "locador"
    }
  },

  "revisaoGeral": {
    "modoRevisao": "autonomo",
    "precoMaoDeObra": 150.00,
    "frequenciaKm": 6000,
    "pecasChecklist": []
  },

  "pecasCustomizadas": [
    {
      "id": "oleo_motor",
      "precoEditado": 40.00,
      "intervaloKmEditado": 1250
    }
  ],

  "fipeCache": {
    "valor": 11000.00,
    "dataConsulta": "2026-04-28",
    "codigoFipe": "001234-0"
  },

  // Módulo Diário de Trabalho (RF-30 a RF-34)
  "diarioTrabalho": [
    {
      "id": "uuid-v4",
      "data": "2026-05-01",
      "kmInicial": 18000,
      "kmFinal": 18072,
      "kmPercorridos": 72,
      "comeu": true,
      "abasteceu": true,
      "litros": 3.5,
      "precoLitro": 6.61
    }
  ],

  // Módulo Histórico de Manutenção (RF-35 a RF-40)
  "historicoManutencao": {
    "trocasOleo": [
      { "id": "uuid-v4", "data": "2026-03-01", "km": 17000, "valorTotal": 55.00 }
    ],
    "revisoes": [
      {
        "id": "uuid-v4",
        "data": "2026-01-15",
        "km": 12000,
        "itensTrocados": ["vela_ignicao", "filtro_ar"],
        "valorTotal": 210.00
      }
    ],
    "trocasPneu": [
      { "id": "uuid-v4", "data": "2025-08-10", "km": 2000, "qual": "traseiro", "marca": "Levorin Dakar", "valorTotal": 245.00 }
    ],
    "trocasKitRelacao": [
      { "id": "uuid-v4", "data": "2025-06-01", "km": 0, "marca": "Riffel", "valorTotal": 90.00 }
    ]
  }
}
```

### VII.2- Campo `anoFimOriginal` nos Presets JSON

Cada arquivo preset de moto pode incluir o campo opcional `anoFimOriginal`:

```json
// Exemplo em pop110i.json (campo opcional — omitir se não aplicável)
"anoFimOriginal": 2010
```

Significado: para fabricação anterior ou igual a `anoFimOriginal`, peças originais OEM do fabricante não estão mais disponíveis no mercado. O app deve:
- Desabilitar o card "Apenas peças originais Honda" na pergunta 04d do onboarding (RF-10c);
- Forçar `perfilPecas: 'paralela'` no perfil salvo;
- Exibir tooltip explicativo no módulo de manutenção.

> **Nota:** para modelos recentes (como a Pop 110i 2022–2024), este campo é omitido ou nulo — a opção "original" permanece disponível.

### VII.3- Schema do Arquivo de Export

```json
// motocalc_backup.json
{
  "schemaVersion": 4,
  "exportadoEm": "2026-05-01T14:30:00Z",
  "app": "MotoCalc RJ",
  "aviso": "Este arquivo contém dados pessoais. Não compartilhe com outras pessoas.",
  "perfil": { /* objeto completo do localStorage acima, incluindo diarioTrabalho e historicoManutencao */ }
}
```

> `schemaVersion` atualizado para 4 para refletir a adição dos módulos Diário de Trabalho e Histórico de Manutenção no schema. Importações de backup com `schemaVersion: 3` são compatíveis — campos ausentes recebem array vazio `[]` como padrão.

---

## VIII- Regras de Cálculo

> Documento completo em `docs/Formulas_Calculos.md`. Este resumo serve como referência rápida.

### VIII.1- Rodagem

```
diasAno  = diasSemana × 52
kmMensal = kmDia × diasSemana × 4,33
kmAnual  = kmDia × diasAno

consumoEfetivo = temBau ? consumoKmLComBau : consumoKmL
```

### VIII.2- Custo por km de cada peça

```
cpkPeca = precoRJ[perfilPecas] / intervaloKmEntrega
```

### VIII.3- Custo anual de manutenção variável

```
cpkPecasTotal   = soma(cpkPeca de todas as peças)
custoManutAnual = cpkPecasTotal × kmAnual
```

### VIII.4- Custo de combustível

```
cpkCombustivel  = precoGasolina / consumoEfetivo
custoCombAnual  = cpkCombustivel × kmAnual
```

### VIII.5- Custo de revisão

**Caso dealer:**
```
custoRevisaoAnual = (3334,62 / 42) × 12  →  R$952,70/ano
```

**Caso oficina independente:**
```
revisoesPorAno    = kmAnual / frequenciaKm
custoRevisaoAnual = revisoesPorAno × precoMaoDeObra
```

### VIII.6- Custos fixos anuais

```
ipvaAnual            = valorFipe × aliquotaEstado  (0 se idade >= 15)
licenciamentoAnual   = tabelaDETRAN[estado][anoAtual]
custoDocumentosAnual = ipvaAnual + licenciamentoAnual

custoInternetAnual   = precoInternet × 12
custoSeguroAnual     = temSeguro ? precoSeguro : 0

Se financiada: custoFinanciamento = parcelaMensal × 12
Se alugada:    custoAluguel       = aluguelMensal × 12
```

### VIII.7- Alimentação

```
custoAlimentacaoAnual = alimentacaoDia × diasAno
```

### VIII.8- Custo total e granularidades

```
custoMotoAnual  = custoDocumentosAnual + custoRevisaoAnual
                + custoManutAnual + custoCombAnual
                + custoInternetAnual + custoSeguroAnual
                + custoFinanciamento (ou custoAluguel)

custoTotalAnual = custoMotoAnual + custoAlimentacaoAnual

// Granularidades
custoMensal  = custoTotalAnual / 12
custoSemanal = custoTotalAnual / 52
custoDiario  = custoTotalAnual / diasAno      // ÷ dias TRABALHADOS, não 365
custoHorario = custoDiario / horasDia
custoPorKm   = custoTotalAnual / kmAnual

// Dois totais distintos exibidos no painel
totalComAlimentacao    = custoTotalAnual
totalSemAlimentacao    = custoMotoAnual
```

### VIII.9- Gatilho duplo (km ou tempo)

```
mesesParaAtingirKm = intervaloKm / kmMensal

Se mesesParaAtingirKm < intervaloMeses:
    intervaloEfetivo = intervaloKm          // gatilho por km
Senão:
    intervaloEfetivo = intervaloMeses × kmMensal  // gatilho por tempo
```

### VIII.10- Fator de responsabilidade (moto alugada)

```
fatorResponsabilidade(campo) = {
  "eu"       → 1.0   // entregador arca com 100%
  "locador"  → 0.0   // custo zero para o entregador
  "dividimos"→ 0.5   // custo dividido 50/50
}

custoDocumentosEfetivo = custoDocumentosAnual × fatorResponsabilidade("documentos")
custoManutEfetivo      = (custoManutAnual + custoRevisaoAnual) × fatorResponsabilidade("manutencao")
custoSeguroEfetivo     = custoSeguroAnual × fatorResponsabilidade("seguro")
```

> Se `situacaoMoto !== 'alugada'`, todos os fatores são `1.0` (sem alteração).

### VIII.11- Médias reais do Diário de Trabalho

```
// Após 5+ entradas:
kmDiaReal = media(kmPercorridos de cada entrada)

// Para consumo real (apenas entradas com abastecimento):
consumoReal = soma(kmPercorridos de entradas com abastecimento) / soma(litros de entradas com abastecimento)
```

### VIII.12- Intervalo real do Histórico de Manutenção

```
// Para cada tipo de manutenção com 2+ registros:
intervalosObservados = [km[1] - km[0], km[2] - km[1], ...]
intervaloMedioReal   = media(intervalosObservados)

// Usado no CPK no lugar do intervalo preset:
cpkPecaReal = precoRJ[perfilPecas] / intervaloMedioReal
```

### VIII.13- Sugestão de próxima revisão/troca

```
kmDesdeUltima    = kmAtual - kmUltimaRevisao
kmParaProxima    = frequenciaKm - kmDesdeUltima
diasParaProxima  = kmParaProxima / (kmDia × diasSemana / 7)
```

---

## IX- Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend (UI) | React + Tailwind CSS | Reatividade para atualização em tempo real (RF-22). Tailwind para mobile-first rápido. |
| Build e PWA | Vite + vite-plugin-pwa | Service Worker automático. Build leve. |
| Estado Global | React useState / useReducer | `useReducer` para o objeto de perfil complexo. |
| Persistência | localStorage API (nativa) — via hook `usePerfil` | Sem backend para V1. Hook abstrai o storage para facilitar migração futura (RNF-11). |
| Dados (Presets) | Arquivos JSON estáticos | Separação clara entre dados e lógica. Novo modelo = novo JSON. |
| Cálculo | Funções JS puras em `/utils/calculos.js` | Testável independentemente da UI. |
| FIPE | BrasilAPI — `https://brasilapi.com.br/api/fipe/motos/v1/{codigo}` | Gratuita, sem chave, atualização mensal. Consultada uma vez no onboarding e cacheada. |
| Analytics | Umami (self-hosted ou cloud) | Sem cookies, sem dados pessoais, compatível com LGPD. |

---

## X- Produção e Deploy

### X.1- Hospedagem

- **Plataforma:** Netlify ou Vercel (plano gratuito)
- **HTTPS:** obrigatório — incluído automaticamente nessas plataformas. Sem HTTPS, o Service Worker não funciona.
- **Deploy:** automático via push para branch `main` no GitHub.

### X.2- Domínio

- Domínio `.com.br` recomendado (~R$40/ano — Registro.br)
- Sem domínio próprio, o endereço seria `motocalc.netlify.app`

### X.3- Documentos Legais (obrigatórios para Play Store)

- **Política de Privacidade:** página pública acessível por URL dentro do próprio app (`/privacidade`). Deve declarar que o app não coleta nem transmite dados pessoais — tudo fica no dispositivo do usuário.
- **Termos de Uso:** recomendado. Aviso de que os valores são estimativas baseadas em médias e não substituem orientação profissional.

### X.4- Distribuição

| Canal | Situação |
|---|---|
| Web direto (link / QR code) | Principal. Usuário abre no celular e instala na tela inicial. |
| Google Play Store (via TWA) | Possível com Bubblewrap. Exige conta de desenvolvedor (~$25 taxa única) e política de privacidade publicada. |
| Apple App Store | Fora do escopo — PWAs têm limitações sérias no iOS para Service Worker offline. |

### X.5- Calendário de Manutenção de Dados

| Dado | Quando atualizar | Frequência |
|---|---|---|
| Licenciamento DETRAN-RJ | Janeiro de cada ano | Anual |
| Alíquota IPVA RJ | Janeiro de cada ano | Anual |
| Preço padrão da gasolina (ANP) | Quando houver variação significativa | Mensal ou conforme necessidade |
| Preços das peças nos presets JSON | Semestral (abril e outubro) | 2× por ano |
| FIPE | Automático via BrasilAPI | — |

---

## XI- Priorização MoSCoW

| Prioridade | Requisitos | Justificativa |
|---|---|---|
| Must Have (V1) | RF-ON-01 a 05, RF-01 a RF-13, RF-10c, RF-15 a RF-16, RF-19 a RF-25, RF-29a a RF-29c, RNF-01 a RNF-07, RNF-11 | Núcleo funcional. RF-10c (motos antigas) deve estar desde V1 para não confundir usuários com motos velhas. RF-29a/b/c (moto alugada) é Must porque moto alugada é realidade frequente entre motoboys e o cálculo sem isso seria incorreto. |
| Should Have (V1) | RF-14, RF-17 a RF-18, RF-26 a RF-28 (export/import), RNF-08 a RNF-10, RNF-12 a RNF-13 (Umami) | Adicionam valor importante. Export/import resolve o problema de troca de celular sem backend. |
| Could Have (V1 ou V2) | RF-30 a RF-34 (Diário de Trabalho), RF-35 a RF-40 (Histórico de Manutenção) | Módulos que transformam o app de "calculadora estática" em "ferramenta viva" com dados reais. Alto valor a longo prazo, mas não bloqueiam o núcleo. Podem ser adicionados como módulos opcionais sem alterar o restante do app. |
| Won't Have (V1) | Login e sincronização entre dispositivos, notificações push de manutenção, backend próprio, autenticação, API de preços em tempo real, comparativo entre plataformas | Complexidade excessiva para o escopo atual. Fundação login-ready já estará pronta via RNF-11 e RF-28 para V2. |

---

## XII- Diferenciais — Atividade Extensionista

### XII.1- Impacto Social

Os entregadores de moto são microempreendedores informais que raramente têm acesso a ferramentas de gestão financeira. Ao revelar o custo invisível por km e por dia, o MotoCalc RJ promove inclusão financeira digital, capacitando o entregador a responder perguntas como:

- Vale a pena aceitar uma entrega curta que paga pouco?
- Qual moto é mais econômica para o meu volume de km?
- Quanto do meu faturamento vai para os custos da moto?
- Quando minha moto for quitada, quanto meu lucro líquido vai aumentar?

### XII.2- Metodologia de Levantamento de Dados

- Pesquisa de preços de peças no Mercado Livre e Shopee (média de 2 a 3 vendedores com frete para RJ — abr/2026);
- Consulta ao manual do proprietário de cada modelo via site oficial Honda/Yamaha;
- Consulta ao portal ANP (média do Município do RJ — semana 19–25/abr/2026);
- Tabela de revisões com preços reais de concessionária Honda (abr/2026);
- Dados reais de telemetria de uso (rodagem urbana real de motoboy RJ).

### XII.3- Conceitos de ADS Aplicados

| Conceito | Onde se Aplica |
|---|---|
| Levantamento de Requisitos | Este documento estrutura formalmente o que o sistema deve fazer, com MoSCoW, critérios de aceite e rastreabilidade por ID. |
| Modelagem de Dados (JSON) | Presets e perfil do usuário representam modelagem de entidades sem banco relacional. |
| State Management (React) | `useReducer` para estado complexo; `useMemo` para recalcular custos apenas quando as dependências mudam. |
| Persistência de Dados | localStorage como alternativa leve a banco de dados para V1, com estratégia de restauração automática. |
| Padrão Repository | Hook `usePerfil` abstrai o storage — componentes não conhecem localStorage. Permite substituição futura por API sem refatoração de UI. |
| Arquitetura PWA | Service Worker e manifest.json para aplicação offline-first. |
| Separação de Responsabilidades | Lógica em `/utils/`, dados em `/presets/`, UI em `/components/`. |
| UX e Acessibilidade | Onboarding progressivo, área de toque mínima, contraste WCAG. |
| Analytics sem dados pessoais | Umami para métricas de uso respeitando LGPD. |

---

*MotoCalc RJ — Documento de Requisitos v3.1 — Atividade Extensionista — ADS*
*Última atualização: 01/05/2026 — Adicionados: RF-10c (motos antigas), RF-29a/b/c (moto alugada), RF-30–34 (Diário de Trabalho), RF-35–40 (Histórico de Manutenção), fórmulas VIII.10–VIII.12, MoSCoW revisado.*

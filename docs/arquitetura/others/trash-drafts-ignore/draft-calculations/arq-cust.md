
> [!NOTE]
> "como calcular um custo anual, para depois converter para mensal, semanal, diario, para um motoboy que percorre 70km cada dia que trabalha, mas só trabalha 8 dias no mes, com base nas informações coletadas"

# Arquitetura de Custos: Calculando o "Cloud Billing" da sua Máquina

Tal como projetamos a infraestrutura de uma aplicação _fullstack_ (onde cada requisição a um banco PostgreSQL ou invocação de uma função serverless no Node.js consome frações de centavos em provedores como a AWS), o planejamento financeiro do seu veículo segue o mesmo princípio lógico. A estratégia ideal não é olhar para a fatura de manutenção como uma exceção ou surpresa, mas sim calcular o "custo por requisição" – que, no contexto do transporte, é o **Custo por Quilômetro (CPK)**.

O documento com os manuais preventivos que você organizou fornece o _schema_ perfeito para essa arquitetura. Vamos esmiuçar o algoritmo por trás do cálculo para que você possa documentar essa lógica estrutural no seu Obsidian.

---

## I- O Padrão "Unit of Work" (Custo Por Quilômetro)

Se tentarmos calcular o custo mensal baseando-nos apenas no que estraga ou é substituído naquele mês específico, teremos gráficos com picos de gastos (como a pesada revisão de 36.000 km custando R$ 880,20) seguidos de meses sem gasto algum. Em engenharia de software, isso se assemelha a um _memory leak_ acumulando lixo na memória até que o servidor caia de uma vez.

A solução profissional é o **provisionamento contínuo**. Pegamos o ciclo completo de vida útil projetado e dividimos pela sua extensão total.

### I.1- Extraindo os Dados (O Banco de Dados)

A partir da tabela de custos consolidados, o ciclo de integração e manutenção até os 36.000 km é a somatória das parcelas do plano:

- Revisão 1k: R$ 105,94
    
- Revisão 6k: R$ 248,06
    
- Revisão 12k: R$ 568,29
    
- Revisão 18k: R$ 506,70
    
- Revisão 24k: R$ 737,76
    
- Revisão 30k: R$ 287,67
    
- Revisão 36k: R$ 880,20
    

Calculando o custo total desse "deploy" de longo prazo:

$$C_{ciclo} = 105,94 + 248,06 + 568,29 + 506,70 + 737,76 + 287,67 + 880,20 = R\$ 3.334,62$$

A fórmula fundamental do Custo por Quilômetro (a sua taxa de latência física) é:

$$CPK = \frac{C_{ciclo}}{Distância_{ciclo}}$$

$$CPK = \frac{3334,62}{36000} \approx 0,092628 \text{ R\$/km}$$

> **Conceito Chave:** Isso significa que, para cada quilômetro rodado, o sistema "consome" invisivelmente cerca de **9,26 centavos** de amortização referentes a pneus, lonas de freio, ajustes de válvulas e afins.

---

## II- Algoritmo de Consumo: A Rotina Operacional

Agora que nossa métrica unitária ($CPK$) está definida, vamos injetar as variáveis de ambiente (_environment variables_) da rotina de entregas no algoritmo.

**Variáveis de Entrada:**

- **Quilometragem Diária ($K_{dia}$):** $70$ km/dia
    
- **Dias Trabalhados ($F_{mes}$):** $8$ dias/mês
    

### II.1- Passo A: O "Throughput" (Volume de Tráfego)

Primeiro, determinamos a rodagem no eixo do tempo.

- **Distância Mensal ($D_{mes}$):**
    
    $$D_{mes} = K_{dia} \times F_{mes}$$
    
    $$D_{mes} = 70 \times 8 = 560 \text{ km/mês}$$
    
- **Distância Anual ($D_{ano}$):**
    
    $$D_{ano} = D_{mes} \times 12$$
    
    $$D_{ano} = 560 \times 12 = 6720 \text{ km/ano}$$
    

### II.2- Passo B: O "Billing" Final (Projeção de Custos)

Com o volume mapeado, multiplicamos pelo nosso $CPK$ para obter a despesa provisionada em diferentes escopos.

- **Custo da Diária de Trabalho ($C_{dia}$):**
    
    $$C_{dia} = K_{dia} \times CPK$$
    
    $$C_{dia} = 70 \times 0,092628 = R\$ 6,48$$
    
    _(Interpretação: Cada dia de rota ativa consome R$ 6,48 do patrimônio da máquina)._
    
- **Custo Semanal Operacional:**
    
    (Considerando os 8 dias divididos de forma equilibrada no mês, cerca de 2 dias de trabalho por semana):
    
    $$C_{semana} = C_{dia} \times 2 = R\$ 12,96$$
    
- **Custo Mensal ($C_{mes}$):**
    
    $$C_{mes} = D_{mes} \times CPK$$
    
    $$C_{mes} = 560 \times 0,092628 = R\$ 51,87$$
    
    _(Este é o valor exato que o "caixa da empresa" precisa reter no fim do mês para criar o fundo de reserva das revisões)._
    
- **Custo Anual ($C_{ano}$):**
    
    $$C_{ano} = D_{ano} \times CPK$$
    
    $$C_{ano} = 6720 \times 0,092628 = R\$ 622,46$$
    

---



  

> [!NOTE]
> "Porém é por km ou por tempo. Também devemos calcular quanto é o total de gasto em 42 meses (36.000km). o total em dinheiro gasto nas 7 revisões / 42 = R$79,39 mensais.
> 
> Não ficou claro se os intens itens que estão na seção 'Verificação' foram incluidos nos preços, aparentemente não porque um par de pneus custa +400. Esses itens provavelmente tem desgates muito variáveis para serem inseridos em algum ciclo em específico seja por tempo ou km, o fator que importa é o desgaste de fato.
> 
> Esses itens precisarei descobrir um valor de desgate médio por km para incluir nos calculos anuais. Eu mesmo troquei o pneu dianteiro em 1 ano, o traseiro já fez 2 anos e não troquei ainda.
> 
> São eles:
> 
> Acelerador Amortecedores Coluna de Direção Embreagem Folga de Válvula Freios Marcha lenta Pneus Rodas Suspensão Transmissão Vela."
> 
> Correto?"
> 


Sua análise estrutural está absolutamente impecável. Você acabou de identificar a diferença clássica entre um **Custo Fixo de Infraestrutura** (a assinatura da _cloud_) e um **Custo Variável de Consumo** (_Pay-As-You-Go_).

Você está **100% correto**. A tabela da concessionária garante a lubrificação do motor, as juntas e a mão de obra básica, mas os itens de "Verificação" são apenas _health checks_. Se o mecânico roda o script de verificação e a sapata de freio retorna `status: 'degraded'`, a substituição é cobrada à parte. E, como você bem notou, um par de pneus (média de R$ 421) ou um kit relação original (R$ 230) quebrariam qualquer planejamento financeiro se não fossem provisionados.

Além disso, o desgaste dessas peças é estritamente ligado às variáveis de ambiente (asfalto quente do Rio de Janeiro, peso da _bag_, buracos, frenagens bruscas no trânsito), o que torna a vida útil delas independente do calendário.

Vamos esmiuçar essa lógica para o seu Obsidian, criando a arquitetura definitiva do seu **Custo por Quilômetro Total (CPK Total)**.

---

## III- ⏱️ O "Edge Case" do Tempo vs. Quilometragem

Antes de calcularmos as peças soltas, precisamos corrigir um bug sutil no cálculo de R$ 79,39 mensais das revisões.

O manual estipula: **36.000 km OU 42 meses** (o que ocorrer primeiro).

Se você trabalhasse como motoboy 6 dias por semana, atingiria os 36k km em cerca de 1 ano e meio. Porém, rodando apenas **560 km por mês** (70km x 8 dias), você demorará cerca de **64 meses** para bater os 36.000 km.

Isso significa que o seu _trigger_ para as revisões da Honda será sempre o **Tempo (a cada 6 meses)** e não a Quilometragem. Você fará a revisão de "6.000 km" quando sua Pop tiver apenas uns 3.300 km rodados, para não perder a garantia.

Portanto, o seu cálculo do custo fixo pelo tempo (R$ 3334,62 / 42 meses = R$ 79,39 mensais) é a abordagem mais segura e correta para o seu fluxo de uso atual. Para saber o seu "CPK Fixo", basta dividir esse valor mensal pela sua rodagem:

$$CPK_{Fixo} = \frac{79,39}{560} \approx 0,14 \text{ R\$/km}$$

---

## IV- 🛠️ Classificação dos Componentes de Desgaste (Microserviços Independentes)

Você listou os itens de "Verificação". Para fins de engenharia de custos, precisamos classificá-los em três instâncias diferentes, pois nem todos geram um custo de peça constante.

### IV.1- Consumíveis de Alto Tráfego (A Necessidade de Provisionamento)

Estas são as peças que sofrem atrito direto ("I/O intensivo"). Precisam ter um cálculo de CPK individual somado ao seu custo por quilômetro final.

- **Pneus (Dianteiro e Traseiro):** Como você notou, o pneu traseiro recebe toda a carga de tração e o peso do baú, desgastando mais rápido, enquanto o dianteiro (que você já trocou com 1 ano) sofre desgaste diferente dependendo da calibragem e frenagem. Eles devem ter orçamentos separados.
    
- **Transmissão (Kit Relação):** Coroa, corrente e pinhão. Sofrem extremo desgaste no anda-e-para urbano.
    
- **Freios (Sapatas/Lonas):** Desgaste altíssimo.
    

### IV.2- Consumíveis de Longo Prazo (Manutenção Maior)

Itens que demoram muito para desgastar, mas têm alto custo. Podem ser tratados como um "Fundo de Reserva" genérico.

- **Embreagem (Discos):** Numa Pop 110i, se bem pilotada (sem "queimar" a embreagem no semáforo), pode durar mais de 40.000 km.
    
- **Amortecedores e Suspensão (Óleo/Retentores):** O fluido da suspensão dianteira já está na lista dos 18k e 36k. O amortecedor traseiro inteiro só é trocado se estourar.
    
- **Vela de Ignição e Filtro de Ar:** Já estão inclusos nas trocas programadas de 24k e 36k, então seu custo já compõe aqueles R$ 79,39.
    

### IV.3- Ajustes de Configuração (Apenas Mão de Obra)

Estes não são peças de troca, são apenas regulagens mecânicas.

- **Acelerador e Marcha Lenta:** É apenas o ajuste da tensão do cabo e do parafuso da injeção. Custo zero de material (a menos que o cabo arrebente).
    
- **Folga de Válvula:** Ajuste com calibre de lâminas, a mão de obra já está contemplada no valor pago na revisão.
    
- **Coluna de Direção:** É reaperto ou lubrificação (inclusa nos 12k, 24k). Só se troca rolamento se houver folga crônica ou calo.
    

---

## V- 📐 Algoritmo do CPK Total Dinâmico

Para encontrar o seu custo real absoluto, a equação da sua "API de custos" agora é:

$$CPK_{Total} = CPK_{Fixo} + CPK_{Pneu D.} + CPK_{Pneu T.} + CPK_{Relação} + CPK_{Freios}$$

A fórmula para o CPK individual de cada peça é simples: **Valor da Peça dividido pela Vida Útil real (em km).**

Se uma lona de freio paralela custa R$ 30,00 e dura 10.000 km, o CPK dela é de **R$ 0,003/km**. Pode parecer pouco, mas quando somamos tudo, o impacto na sua diária de trabalho muda completamente.

Para facilitar a simulação desses cenários dinâmicos de desgaste e evitar contas manuais, criei um _dashboard_ onde você pode inserir o preço das peças e a quilometragem média que elas costumam durar com você. O sistema calculará automaticamente o seu custo real por mês e por quilômetro.

Mostrar visualização

Essa modelagem de dados é o que separa um autônomo que trabalha para pagar a moto de um microempreendedor que domina sua margem de lucro.

Para que possamos preencher o seu banco de dados de forma realista: observando as rotas e ladeiras que você costuma pegar, **quantos mil quilômetros, em média, o seu último Kit Relação e as Sapatas de Freio aguentaram antes de precisarem de troca?**

----
-----


> [!NOTE]
> Minha moto tem 18000km arredondando.
> Eu troco oleo entre cada 1000km a 1500km, demora 2 meses em média.
> Só troquei pneu traseiro com 16000km,
>  troquei tb vela de ignição e filtro de ar na revisão de 12000km (custou 450 no total)
> Eu não tenho dados proprios suficientes para saber tudo.

# O Problema do _Cold Start_: Populando o Banco de Dados com _Mocks_

É perfeitamente normal não ter todos os dados em mãos logo no início. No desenvolvimento de software, chamamos isso de **Cold Start Problem** (o problema da partida a frio) em sistemas de recomendação, ou simplesmente a fase de desenvolvimento onde a nossa base de dados está vazia.

Quando construímos um _front-end_ em React, mas a API do _back-end_ ainda não tem dados suficientes de usuários reais, nós utilizamos **Mock Data** (dados simulados baseados em médias de mercado) para preencher a interface e validar a lógica de cálculo. Com a manutenção do seu veículo, faremos exatamente o mesmo: vamos usar os seus dados reais de telemetria como base de verdade (_ground truth_) e preencher as lacunas com estimativas realistas para o trânsito urbano de entregas.

Vamos refatorar o seu plano de manutenção com essa nova arquitetura e criar um novo módulo para o seu Obsidian.

---

## I- 📊 1. Análise de Telemetria (Logs de Produção)

Os dados que você forneceu mudam completamente a arquitetura do nosso sistema. Você fez o equivalente a um `npm run eject` num projeto criado com _Create React App_: você abandonou a configuração engessada de fábrica e assumiu o controle manual da sua infraestrutura.

- **O Cron Job do Óleo:** O manual da Honda sugere trocas a cada 6.000 km após a primeira. Porém, rodando em condições severas (trânsito urbano, aceleração e frenagem constantes, peso do baú), trocar o óleo entre 1.000 km e 1.500 km é uma prática defensiva de _hardware_ muito comum. Isso cria um custo recorrente maior, mas evita falhas catastróficas no motor (_kernel panic_).
    
- **Pneu Traseiro (16.000 km):** Este é um dado de ouro. O pneu traseiro recebe a tração e o maior peso. Saber que ele durou 16 mil km nos dá um ponto de ancoragem sólido para o banco de dados.
    
- **Revisão de 12.000 km (R$ 450,00):** Você conseguiu otimizar os custos da _cloud_! O manual previa R$ 568,00 para essa quilometragem.
    

Ao adotar essa postura autônoma de manutenção (trocando peças por desgaste real em oficinas de confiança ou em casa, em vez de seguir cegamente a concessionária), o conceito de "Revisão Fixa Mensal de R$ 79,39" perde o sentido. A partir de agora, **todos os seus custos passam a ser variáveis (Pay-As-You-Go)**.

---

## II- 🧩 2. _Mockando_ as Variáveis de Desgaste (Benchmarks de Mercado)

Para as peças que você ainda não trocou, utilizaremos _benchmarks_ (médias de durabilidade) comuns para modelos de 110cc a 160cc operando em regimes de entrega.

|**Componente**|**Custo Médio Estimado**|**Vida Útil Real/Mockada**|**Justificativa do Mock**|
|---|---|---|---|
|**Óleo do Motor**|R$ 40,00|**1.250 km**|Média exata do seu relato (entre 1.000 e 1.500).|
|**Pneu Traseiro**|R$ 214,00|**16.000 km**|Seu dado real de telemetria.|
|**Pneu Dianteiro**|R$ 130,00|**25.000 km**|O pneu dianteiro atua mais na frenagem e direcionamento, sofrendo menos atrito de aceleração. Costuma durar de 1,5x a 2x mais que o traseiro.|
|**Kit Relação**|R$ 82,00|**18.000 km**|Como sua moto está com 18.000 km e você não mencionou a troca, ela provavelmente está no limite do tensionador. Uma relação bem lubrificada dura cerca de 15k a 20k no uso urbano.|
|**Sapatas Freio (Par)**|R$ 47,00|**12.000 km**|O anda-e-para urbano consome lonas rapidamente. É comum a troca a cada 10k a 15k.|
|**Vela / Filtro de Ar**|R$ 80,00|**12.000 km**|Baseado na sua troca real na revisão de 12k.|

---

## III- ⚙️ 3. Compilando o Novo _Build_ (Cálculo do CPK Variável)

Agora vamos iterar sobre nosso _Array_ de componentes para extrair o Custo por Quilômetro individual. A matemática é simplesmente dividir o custo pela vida útil.

- **Óleo:** 40 / 1250 = **R$ 0,0320 / km**
    
- **Pneu Traseiro:** 214 / 16000 = **R$ 0,0133 / km**
    
- **Pneu Dianteiro:** 130 / 25000 = **R$ 0,0052 / km**
    
- **Kit Relação:** 82 / 18000 = **R$ 0,0045 / km**
    
- **Freios:** 47 / 12000 = **R$ 0,0039 / km**
    
- **Vela/Filtro:** 80 / 12000 = **R$ 0,0066 / km**
    

Somando todas essas rotinas paralelas, chegamos ao seu **CPK Operacional Real**:

**CPK Total = R$ 0,0655 por quilômetro rodado.**

> _Nota Arquitetural:_ Isso significa que cada quilômetro que a sua roda gira, o veículo consome aproximadamente **6,5 centavos** em desgaste de peças.

---

## IV- 💰 4. Projeção Financeira com os Novos Dados

Aplicando a sua variável de ambiente de uso atual (**70 km/dia**, **8 dias trabalhados por mês**, totalizando **560 km/mês**):

|**Período de Execução**|**Distância Percorrida**|**Custo de Amortização (Fundo de Reserva)**|
|---|---|---|
|**1 Dia de Trabalho**|70 km|**R$ 4,58**|
|**1 Mês** (8 dias)|560 km|**R$ 36,68**|
|**1 Ano**|6.720 km|**R$ 440,16**|

### IV.1- A Grande Diferença do Modelo Autônomo

Lembra que o cálculo engessado da concessionária previa guardar R$ 79,39 por mês? Ao assumir a manutenção por conta própria e focar apenas no desgaste real das peças consumíveis, o custo mensal do seu "servidor" caiu para cerca de **R$ 36,68**.

Esse é o valor exato que você deve retirar da sua receita das entregas no fim do mês e colocar numa "caixinha" separada no banco. Assim, quando o pneu furar, a relação estalar ou chegar a hora do óleo, o dinheiro já estará provisionado, sem afetar o seu lucro real.

Nav-principal-oficial-Estimativa-Registros-M. de Obra-Autonomia-Ajustes
![[navbottom-oficial.png]]

- **Componente:** NavBottom principal
- **Tabs:** ESTIMATIVA, REGISTROS, M. DE OBRA, AUTONOMIA, AJUSTES
- **Estado ativo:** fundo azul + icone e label em branco
- **Estado inativo:** icone e label em cinza
- **Observacoes:** Ajustes possui tela dedicada em `Aba-Ajustes`.
- **Header (geral):**
  - Icone moto abre seletor rapido de presets.
  - Icone "?" abre pop-up de ajuda (tela pendente).
  - Hamburguer exibe o menu inferior quando ele nao estiver visivel (decisao pendente se a nav fica sempre visivel).



1-Aba Estimativa - 1 - Home
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-2480&t=0LLpFPztYEFqgtxE-4
![[1-Aba Estimativa - 1 - Home.png]]

- **Rota:** `/estimativa`
- **Header:** avatar + "Honda: Pop 110i" + "2024 - 55KM/L" + icone moto + sino
- **Acoes no header:** avatar → perfil; icone moto → presets; sino → alertas
- **Bloco Preferencias:**
  - Manutencao/Pecas: segmentado "AUTORIZADAS" (ativo) / "INDEPENDENTES"
  - Estimativa sobre dados: "PREDEFINIDOS" (ativo) / "+ REGISTROS"
- **Configuracao de Rodagem:**
  - "MEDIA DE KM RODADOS POR DIA" (input, valor 45, sufixo KM)
  - "DIAS TRABALHADOS / SEMANA" (stepper - 6 +)
- **Estimativa:**
  - Card "CUSTO DE OPERACAO POR KM" (R$ 1,42/km)
  - Cards "Por Hora" (R$ 1,43) e "Por Dia" (R$ 34,35)
  - Cards semana/mes/ano com KM e custo total
- **Distribuicao Percentual:**
  - Dropdown "HORA" ([HORA, DIA, SEMANA, MES, ANO])
  - Donut com centro "R$ 987,21" e label "MANUTENCAO"
  - Chips: Documentacao 1%, Manutencao 27%, Financiamento 57%, Alimentacao 7%, Combustivel 5%, Seguro 12%, Internet 1%, Multas 1%
- **CTA:** botao "Detalhes" com icone "+"
- **NavBottom:** ESTIMATIVA ativo

2-Aba Estimativa - Detalhes de estimativas - 1.1
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-2764&t=0LLpFPztYEFqgtxE-4
![[2-Aba Estimativa - Detalhes de estimativas -  1.1.png]]

- **Rota:** `/estimativa/detalhamento`
- **Header:** "Detalhamento de custos" + subtitulo "POP 110I 2024 - 55KM/L" + icone moto + sino
- **Acoes no header:** icone moto → presets; sino → alertas
- **Lista (accordions):**
  - **Combustivel** (ativo, expandido): Preco medio/L (R$ 6,61), Custo mensal (R$ 236,61), Consumo medio (35 km/L), Abastecimentos (7x)
  - **Alimentacao** (inativo, expandido): Custo mensal (R$ 160), Refeicoes anuais (121)
  - **Manutencao** (ativo, expandido): sub-itens com toggles (12x Troca de oleo, 1x Revisao geral, 1x Troca pneu traseiro)
  - **Documentacao** (inativo, expandido): IPVA, CRLV, Emplacamento com chevron
  - **Internet** (ativo, expandido): Custo mensal (R$ 20), Recargas feitas (12)
  - **Seguro** (ativo, expandido): Custo mensal (R$ 82,41), Empresa (SUHAI)
  - **Financiamento** (ativo, expandido): Custo mensal (R$ 560), Parcelas restantes (17)
  - **Multas** (ativo, expandido): Custo mensal (R$ 60), Quantidade no ano (3)
- **Observacoes:** toggles por categoria e por sub-item visiveis.

3-Aba Registros - 2
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-2130&t=0LLpFPztYEFqgtxE-4
![[3-Aba Registros - 2.png]]

- **Rota:** `/registros`
- **Header:** hamburguer + "Registros gerais" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Subtitulo:** "Honda POP 110i 2024"
- **Tabs:** Geral (ativo), Rodagem, Combustivel, Manutencao
- **Secoes (Geral):**
  - Rodagem: lista de dias (Data + KM) + botoes [+] e "Ver"
  - Combustivel: cards com tipo, valor, data, local e km + botoes [+] e "Ver"
  - Oleo Motor: tabela Data/KM/Valor
  - Revisao Geral: card com status "CONCLUIDO" e valor
  - Pneu Dianteiro/Traseiro: tabela Data/KM/Marca/Valor
  - Kit Transmissao: tabela Data/KM/Marca/Valor
- **NavBottom:** REGISTROS ativo
- **Observacoes:** telas de historico por categoria (botao "Ver") ainda nao mapeadas.

4-Aba Registro - Registro de rodagem do Dia (KM) - 2.1
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-2693&t=0LLpFPztYEFqgtxE-4
![[4-Aba Registro - Registro de rodagem do Dia (KM)  - 2.1.png]]

- **Rota:** `/registros/rodagem`
- **Header:** hamburguer + "Registro de Rodagem" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Titulo:** "Kilometragem do Dia"
- **Campos:**
  - ODOMETRO INICIAL (input KM) + icone camera + botao "Salvar"
  - ODOMETRO FINAL (input KM) + icone camera
- **Evento do dia:** Alimentacao (toggle)
- **Resultado:** card "TOTAL RODADO" (124.8 KM) e "MEDIA ESTIMADA" (38 km/L)
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

5-Aba Registros - Registrar Abastecimento - 2.2
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-4033&t=0LLpFPztYEFqgtxE-4
![[5-Aba Registros - Registrar Abastecimento  - 2.2.png]]

- **Rota:** `/registros/abastecimento`
- **Header:** hamburguer + "REGISTROS DE ABASTECIMENTO" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Hero:** "NOVO REGISTRO" + titulo "Abastecimento"
- **Campos:**
  - Tipo de gasolina (segmentado: COMUM ativo / ADITIVADA)
  - Data (date)
  - Odometr o (KM)
  - Total pago (R$)
  - Preco por litro (R$)
  - Volume estimado (L, read-only)
- **Evidencias:** botoes dashed "FOTO DO ODOMETRO" e "FOTO DA BOMBA"
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

6-Aba Registros - Registrar Troca de Óleo - 2.3
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-3944&t=0LLpFPztYEFqgtxE-4
![[6-Aba Registros - Registrar Troca de Óleo - 2.3.png]]

- **Rota:** `/registros/oleo`
- **Header:** hamburguer + "REGISTROS DE OLEO" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Hero:** "NOVO REGISTRO" + titulo "Troca de oleo"
- **Campos:**
  - Data da troca (date)
  - Tipo de oleo (dropdown)
  - Marca (dropdown)
  - Kilometragem (KM)
  - Valor do servico (R$)
- **Evidencia:** area dashed "TIRAR FOTO DO ODOMETRO"
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

7-Aba Registros - Registrar Nova Revisão Geral - 2.4
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-4143&t=0LLpFPztYEFqgtxE-4
![[7-Aba Registros - Registrar Nova Revisão Geral - 2.4.png]]

- **Rota:** `/registros/revisao`
- **Header:** hamburguer + "REGISTROS DE REVISAO" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Hero:** "NOVO REGISTRO" + titulo "Revisao"
- **Campos:**
  - Local da revisao (segmentado: Oficina Autorizada ativo / Independente)
  - Qual e a revisao? (dropdown)
  - Mao de obra (R$)
  - Pecas (R$)
  - Link "+ Adicionar pecas individualmente"
  - Linha dinamica com "ex: Filtro de Oleo" + "Valor" + botao "+ Adicionar mais 1 peca"
- **Resumo:** card "TOTAL ESTIMADO" (R$ 450,00) com breakdown
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

8-Aba Registros - Registrar Troca de Pneu - 2.5
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-4258&t=0LLpFPztYEFqgtxE-4
![[8-Aba Registros - Registrar Troca de Pneu - 2.5.png]]

- **Rota:** `/registros/pneu`
- **Header:** hamburguer + "REGISTROS DE PNEU" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Hero:** "NOVO REGISTRO" + titulo "Troca de pneu"
- **Campos:**
  - Data da troca (date)
  - Kilometragem atual (KM)
  - Posicao do pneu (segmentado: Dianteiro ativo / Traseiro)
  - Marca do pneu (texto)
  - Valor do pneu (R$)
  - Mao de obra (R$)
- **Evidencia:** area dashed "TIRAR FOTO DO ODOMETRO"
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

9-Aba Registro - Registrar troca de kit relação - 2.6
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-4348&t=0LLpFPztYEFqgtxE-4
![[9-Aba Registro - Registrar troca de kit relação - 2.6.png]]

- **Rota:** `/registros/kit-relacao`
- **Header:** hamburguer + "REGISTROS DE RELACAO" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Hero:** "NOVO REGISTRO" + titulo "Troca de kit relacao"
- **Info card:** "Dica Pro" com texto sobre O-ring e lubrificacao, dismiss (x)
- **Seção 1 - Dados tecnicos:** Data da troca, Odometr o (KM), Marca do kit (chips DID/VAZ)
- **Seção 2 - Valores:** Pecas (R$) e Mao de obra (R$)
- **Seção 3 - Evidencia:** "Take Photo of Odometer" (ingles)
- **CTA:** "Registrar" com icone "+"
- **NavBottom:** REGISTROS ativo

10-Aba - Mão de obra - 3
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-3060&t=0LLpFPztYEFqgtxE-4
![[10-Aba - Mão de obra - 3.png]]

- **Rota:** `/mao-de-obra`
- **Header:** hamburguer + "Mao de obra" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Observacoes:** aba de ajustes avancados.
- **Subtitulo:** "Honda Pop 110i 2024"
- **Texto:** ajustes de variaveis para calculos mais precisos no modo personalizado
- **Alerta:** card vermelho "ALERTA" sobre dados medios
- **Mao de obra paralela:** lista de servicos com campo R$ e botao reset (icone circular)
  - Troca de oleo motor, troca de kit transmissao, troca de pneu, revisao geral, manutencao avulsa
- **Revisao geral autorizada:** lista de revisoes (1a a 7a + avulsa) com campos Mao de obra, Pecas, Custo total e reset
- **NavBottom:** M. DE OBRA ativo

11-Aba - Autonomia- 4
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-3581&t=0LLpFPztYEFqgtxE-4
![[11-Aba - Autonomia- 4.png]]

- **Rota:** `/vida-util` (label na nav: Autonomia)
- **Header:** hamburguer + "Autonomia" + help
- **Acoes no header:** hamburguer → menu inferior (se oculto); help → pop-up (pendente)
- **Observacoes:** aba de ajustes avancados.
- **Subtitulo:** "Honda Pop 110i 2024"
- **Texto:** ajustes de variaveis do veiculo para modo personalizado
- **Alerta:** card vermelho "ALERTA" sobre dados medios
- **Abastecimento e autonomia:**
  - Gasolina comum (chip "Valor por litro" ativo, R$ 5,89)
  - Gasolina aditivada (chip "Valor por litro" ativo, R$ 6,15)
  - Etanol (chip "Autonomia (KM/L)" ativo, valor 55)
  - Botao reset em cada card
- **Pecas e elementos:** cards com toggle Original/Paralela, valor R$, vida util (KM) + reset
  - Oleo do motor, Vela de ignicao, Filtro de ar, Kit transmissao
- **Pneus:** cards Dianteiro/Traseiro com chips ORG/PAR, preco e vida util (KM)
- **NavBottom:** AUTONOMIA ativo

12-Aba-Ajustes - 5
https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=2033-4750&t=0LLpFPztYEFqgtxE-4
![[12-Aba-Ajustes - 5.png]]

- **Rota:** `/ajustes`
- **Header:** voltar (seta) + "Editar predefinicao" + help
- **Acoes no header:** help → pop-up (pendente)
- **Titulo:** "Honda: Pop 110i"
- **Secao Veiculo:**
  - Ano de Fabricacao (select, valor 2022)
  - KM Atual (input 12500)
  - KM Ultima Revisao (input 10000)
- **Secao Preferencias:**
  - Manutencao/Pecas (segmentado: AUTORIZADAS ativo / INDEPENDENTES)
  - Estimativa sobre dados (segmentado: PREDEFINIDOS ativo / + REGISTROS)
- **Secao Uso Diario:**
  - Perfil de Trabalho (segmentado: Entrega ativo / Passageiro)
  - Dias na Semana (stepper: - 6 +)
  - KM por Dia (Media) (input 120)
- **Secao Financeiro:**
  - Possui Seguro? (toggle on)
    - Valor Seguro (R$ 180,00)
    - Periodicidade (dropdown: Mensal)
  - Alimentacao diaria (toggle on) + Valor medio (R$ 20,00)
  - Internet mensal (toggle on) + Valor (R$ 25,00)
- **Secao Situacao Legal:**
  - Tipo de aquisicao (segmentado: QUITADA / FINANCIADA ativo / ALUGADA)
  - Valor Parcela (R$ 480,00)
  - Restantes (24)
- **CTA:** "Resetar para valores padroes"
- **NavBottom:** AJUSTES ativo

https://www.figma.com/design/xZmWLgFybbotme4B8kZpNl/MotoCalc--Copy-?node-id=1-742&t=0LLpFPztYEFqgtxE-4

Onboarding - Identificação da marca da Moto - P1
![[0-Onboarding-Identificacao-da-marca-da-Moto-P1.png]]

- **Rota:** `/onboarding/1`
- **Progresso:** "PASSO 1 DE 9" (11% concluido)
- **Titulo:** "Qual e a marca da sua moto?"
- **Subtitulo:** "Isso nos ajuda a carregar os precos e intervalos de manutencao corretos."
- **Campos/Selecoes:** cards Honda, Yamaha, Outras Marcas (full width). Selecionado com borda azul + check.
- **Acoes:** botao primario "Proximo →".
- **Observacoes:** icone de ajuda no header; imagem de fundo na parte inferior.

Onboarding - Seleção modelo - P2
![[0.1-Onboarding-Selecao-modelo-P2.png]]

- **Rota:** `/onboarding/2`
- **Progresso:** "PASSO 2 DE 9" (22% concluido)
- **Titulo:** "Qual e o modelo da sua moto?"
- **Contexto:** chip "Honda Selecionada".
- **Campos/Selecoes:** lista de modelos com chevron; item selecionado com borda azul + check.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** hero image da moto no topo da lista.

Onboarding - Ano de Fabricação (Select) - P3
![[0.2-Onboarding-Ano-de-Fabricacao-(Select)-P3.png]]

- **Rota:** `/onboarding/3`
- **Progresso:** "PASSO 3 DE 9" (33% concluido)
- **Titulo:** "Qual e o ano de fabricacao?"
- **Contexto:** chip "Honda Pop 110i".
- **Campos/Selecoes:** select "SELECIONE O ANO" com valor exibido "2024 - Atual".
- **Informativo:** card "REGRA DO RJ" sobre isencao de IPVA por idade.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).

Onboarding - Perfil de Uso - P4
![[0.3-Onboarding-Perfil-de-Uso-P4.png]]

- **Rota:** `/onboarding/4`
- **Progresso:** "PASSO 4 DE 9" (44% concluido)
- **Titulo:** "Perfil de Uso"
- **Subtitulo:** "Como voce usa a sua moto no trabalho?"
- **Campos/Selecoes:**
  - "Apenas Entregas (Bau/Caixa)"
  - "Transporte de Passageiros (Uber Moto)" (selecionado com borda azul + check)
- **Informativo:** card laranja com aviso de desgaste extra.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** texto do card informativo aparece com caracteres corrompidos no print.

Onboarding - Quilometragem - P5
![[0.4-Onboarding-Quilometragem-P5.png]]

- **Rota:** `/onboarding/5`
- **Progresso:** "PASSO 5 DE 9" (55% concluido)
- **Titulo:** "Quilometragem"
- **Campos:**
  - "KM ATUAL DO HODOMETRO \*" (placeholder "Ex: 12500", sufixo "KM")
  - "KM NA ULTIMA REVISAO" (placeholder "Opcional", sufixo "KM")
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** hero image do painel/hodometro.

Onboarding - Situação moto - P6
![[0.5-Onboarding - Situação moto - P6.png]]

- **Rota:** `/onboarding/6`
- **Progresso:** "PASSO 6 DE 9" (66% concluido)
- **Titulo:** "Situacao da Moto"
- **Subtitulo:** "Como voce usa sua moto no dia a dia?"
- **Campos/Selecoes:** cards "Quitada" (selecionado), "Financiada", "Alugada" com radio.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).

Onboarding - Financiamento - P6-1
![[0.6-Onboarding-Financiamento-P6-1.png]]

- **Rota:** `/onboarding/6/financiamento`
- **Progresso:** "PASSO 6 DE 9" (66% concluido)
- **Titulo:** "Financiamento"
- **Campos:**
  - "QUANTO VOCE PAGA DE PARCELA?" (input monetario)
  - "QUANTAS PARCELAS RESTAM?" (placeholder "Ex: 24", sufixo "meses")
- **Informativo:** card azul sobre calculo do lucro ate quitacao.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** bloco visual "Gestao de Divida" na base.

Onboarding - Aluguel - P6-2
![[0.7-Onboarding-Aluguel-P6-2.png]]

- **Rota:** `/onboarding/6/aluguel`
- **Progresso:** "PASSO 6 DE 9" (66% concluido)
- **Titulo:** "Aluguel"
- **Campos:**
  - Valor do aluguel (input monetario)
  - Periodicidade (segmented: "MENSAL" selecionado, "SEMANAL")
- **Informativo:** card laranja sobre impacto na meta diaria.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** hero image do motor ao fundo.

Onboarding - Alugal - Responsabilidades - P6 - 2.1
![[0.12-Onboarding-Alugal-Responsabilidades-P6-2.1.png]]

- **Rota:** `/onboarding/6/responsabilidade`
- **Progresso:** "PASSO 6 DE 9" (90% Completo)
- **Titulo:** "Responsabilidade de Custos"
- **Campos/Selecoes:**
  - Documentacao (IPVA + Licenciamento): "Eu pago tudo" selecionado
  - Manutencao (Pecas + Revisoes): "Dividimos (50/50)" selecionado
  - Seguro: "Locador paga tudo" selecionado
- **Informativo:** card laranja no topo explicando impacto no calculo.
- **Acoes:** "Voltar" (secundario) + "Continuar >" (primario).
- **Observacoes:** imagens decorativas no rodape.

Onboarding - Seguro - P7

![[0.9-Onboarding-Seguro-P7.png]]

- **Rota:** `/onboarding/7`
- **Progresso:** "PASSO 7 DE 9" (77% concluido)
- **Titulo:** "Seguro da Moto"
- **Campos/Selecoes:**
  - Cards: "Sim, sou segurado" (selecionado) e "Nao possuo seguro".
  - Formulario condicional: "VALOR DO SEGURO (R$)" e periodicidade "ANUAL"/"MENSAL" (ANUAL selecionado).
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).

Onboarding - Plano de Internet - P8

![[0.10-Onboarding-Plano-de-Internet-P8.png]]

- **Rota:** `/onboarding/8`
- **Progresso:** "PASSO 8 DE 9" (88% concluido)
- **Titulo:** "Plano de Internet"
- **Campos:** "VALOR MENSAL (R$)" (input monetario).
- **Informativo:** card azul sobre diluicao do custo.
- **Acoes:** "Voltar" (secundario) + "Proximo →" (primario).
- **Observacoes:** hero image com label "Conectividade Ativa".

Onboarding - Alimentação - P9
![[0.11-Onboarding-Alimentacao-P9.png]]

- **Rota:** `/onboarding/9`
- **Progresso:** "PASSO FINAL" (100%)
- **Titulo:** "Alimentacao no Trabalho"
- **Campos/Selecoes:**
  - Cards: "Sim, como na rua" (selecionado) e "Nao, levo de casa".
  - Formulario condicional: "GASTO MEDIO POR DIA (R$)" (input monetario).
- **Informativo:** card sobre custo separado + card final sobre atualizacao em configuracoes.
- **Acoes:** "Voltar" (secundario) + "Concluir Configuracao" (primario).

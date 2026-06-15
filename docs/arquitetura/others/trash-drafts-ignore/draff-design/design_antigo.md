# MotoCalc RJ — Documentação de Design (Figma)

> **Fonte:** Análise visual do arquivo Figma `MotoCalc` (node-id: 1-2095)
> **Gerado em:** 05/05/2026
> **Status do design:** Protótipo funcional com inconsistências visuais a normalizar em código (padding, cores, tipografia serão padronizados na implementação).

---

## I- Índice

1. [[#Design System]]
2. [[#Arquitetura de Informação]]
3. [[#Fluxo de Onboarding]]
4. [[#Telas Principais (App)]]
5. [[#Telas de Registro]]
6. [[#Tela de Perfil]]
7. [[#Padrões de Componentes]]
8. [[#Navegação]]

---

## II- Design System

> Frame: `UI/UX Components`
> Descrição interna: _"A technical and precise utility framework designed for motorcycle diagnostic data. Optimized for high-contrast outdoor environments and glove-friendly interaction."_

### II.1- Paleta de Cores

| Token               | Hex        | Uso                                               |
| ------------------- | ---------- | ------------------------------------------------- |
| `primary`           | `#0078FF`  | CTAs, seleção ativa, ícones de destaque, links    |
| `surface`           | `#0D1321`  | Background principal da aplicação                 |
| `surface-dim`       | `#0D1321`  | Variação ligeiramente mais escura (sobreposições) |
| `surface-bright`    | `#333948`  | Superfície de cards e inputs                      |
| `surface-cont`      | `#19192e`  | Containers secundários                            |
| `neutral`           | `#C1C6D7`  | Texto secundário, ícones inativos, bordas suaves  |
| `warning` (laranja) | `~#F59E0B` | Info cards contextuais, alertas informativos      |
| `danger`            | `~#EF4444` | Alertas críticos, botão destrutivo (Apagar Tudo)  |
| `success`           | `~#22C55E` | Status "CONCLUÍDO" nos registros                  |
| `text-primary`      | `#FFFFFF`  | Títulos e texto principal                         |
| `text-secondary`    | `#C1C6D7`  | Subtítulos, labels, helpers                       |

> ⚠️ **Atenção:** As cores exatas de `warning` e `danger` foram inferidas visualmente — confirmar no Figma ao implementar.

---

### II.2- Tipografia

Fonte: **Inter** (Google Fonts / sistema)

| Estilo                     | Uso                                                     | Peso aproximado         |
| -------------------------- | ------------------------------------------------------- | ----------------------- |
| H1 / Heading Large         | Títulos de tela no onboarding                           | Bold (700+)             |
| H2 / Heading Medium        | Subtítulos de seção                                     | SemiBold (600)          |
| Data Display / Large Stats | Valores numéricos em destaque (ex: R$1,42/km, 124.8 KM) | Bold (700)              |
| Body LG / UI Large         | Parágrafos descritivos longos                           | Regular (400)           |
| Body MD / UI Standard      | Texto de interface, listas, feedback geral              | Regular (400)           |
| Label SM / Micro           | Labels de campos, badges, rótulos de seção em caps      | Medium (500), uppercase |

---

### II.3- Espaçamento e Grid

Sistema: **8pt Grid**

| Token | Valor           |
| ----- | --------------- |
| XS    | 4px             |
| SM    | 8px             |
| MD    | 16px            |
| LG    | 24px (inferido) |
| XL    | 32px (inferido) |

- Grid de colunas: fluido, com **gutters de 16px**
- Padding lateral padrão das telas: **16px**
- Frame de tela: **390px** de largura

---

### II.4- Componentes Core

#### II.4.1- Botões (altura mínima: 48px)

| Variante       | Aparência                                                            | Uso                                               |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| Primary Action | Fundo `primary` (#0078FF), texto branco, cantos arredondados (~12px) | CTA principal da tela (Próximo, Salvar, Concluir) |
| Secondary      | Borda `primary`, texto `primary`, fundo transparente                 | Ação secundária (Voltar)                          |
| Ghost          | Apenas texto, sem borda/fundo                                        | Ação terciária, links contextuais                 |
| Destructive    | Borda `danger`, texto `danger`                                       | Ações irreversíveis (Apagar Tudo)                 |

**Padrão CTA duplo (Onboarding):**

```
[Voltar — Secondary]   [Próximo → — Primary]
```

Botão primário ocupa ~65% da largura; secundário ~30%; gap 8px.

**CTA único (Registro):**

```
[💾 SALVAR REGISTRO — Primary, full-width]
```

**CTA com ícone `+` à direita:**

```
[  Seu texto aqui  +  ]
```

Usado em botões de ação contextual (Adicionar Novo Gasto, Adicionar peça).

---

#### II.4.2- Inputs de Formulário

**Input de texto simples:**

- Background: `surface-bright` (~#1E2433)
- Borda: 1px `surface-bright` ou transparente
- Placeholder: `text-secondary`
- Ícone prefixo (opcional): calendar, odometer, money
- Sufixo textual (opcional): "KM", "km", "meses"

**Input monetário:**

- Prefixo "R$" em destaque (branco/azul)
- Valor placeholder em cinza
- Ex: `R$ | 0,00`

**Dropdown / Select:**

- Mesma aparência do input
- Ícone chevron `∨` à direita
- Em alguns casos: duplo chevron (indicando seletor nativo)

**Stepper (incremento/decremento):**

- Formato: `[—]  6  [+]`
- Botões circulares com borda, sinal dentro
- Usado para: Dias na semana, quantidade

**Campo com botão inline (Registro de Rodagem):**

- Input + botão "Salvar" lado a lado na mesma linha

---

#### II.4.3- Selection Controls

| Tipo              | Aparência                                     | Uso                                                  |
| ----------------- | --------------------------------------------- | ---------------------------------------------------- |
| Toggle Switch     | Oval, azul = on / cinza = off                 | Ativar/desativar categorias de custo, eventos do dia |
| Segmented Control | 2–3 botões em linha, selecionado = fundo azul | Tipo de gasolina, posição do pneu, periodicidade     |
| Radio Button      | Círculo, preenchido azul quando selecionado   | Responsabilidade de custos (3 opções por categoria)  |
| Chip/Tag          | Pill arredondado, `primary` fill = ativo      | Tipo de peça (Original/Paralela), combustível        |

---

#### II.4.4- Cards de Seleção (Onboarding)

Dois estilos:

**Card 2 colunas (marcas):**

- Ícone centralizado em quadrado arredondado
- Label abaixo
- Borda azul + badge de checkmark (✓ azul) no canto superior direito quando selecionado

**Card full-width (opções de perfil/situação):**

- Ícone à esquerda (em container quadrado arredondado)
- Título + subtítulo descritivo à direita
- Checkmark (✓) ou radio button à direita
- Borda azul completa quando selecionado

---

#### II.4.5- Cards Informativos (Info Box)

| Estilo            | Cor da borda/ícone         | Uso                                                |
| ----------------- | -------------------------- | -------------------------------------------------- |
| Info contextual   | Azul                       | Dicas neutras sobre o impacto de uma escolha       |
| Aviso informativo | Laranja                    | Regras do RJ, avisos de impacto operacional        |
| Alerta crítico    | Vermelho                   | Aviso sobre dados desatualizados, erros de sistema |
| Dica Pro          | Laranja (com × de dismiss) | Dicas de manutenção nas telas de registro          |

Estrutura interna:

```
[ícone ⓘ ou ⚠] Título em bold
Texto explicativo em body
```

---

#### II.4.6- Hero Image com Badge

Presente em todas as telas de registro:

- Imagem de fundo (pneu, motor, guidão) com overlay escuro
- Badge "NOVO REGISTRO" no canto inferior esquerdo (fundo semitransparente escuro, texto cinza/branco)
- Título da tela abaixo do badge (H1, branco)

---

#### II.4.7- Accordion de Categorias (Detalhamento de Custos)

Cada item:

```
[Toggle] [Ícone colorido]  Nome da Categoria   R$ Valor Total
                           XX% do custo anual        [∧/∨]
```

Quando expandido: sub-itens com seus próprios toggles e valores.
Sub-item de Documentação tem chevron adicional para expandir detalhes.

---

#### II.4.8- Bottom Navigation Bar

5 abas fixas na parte inferior do app:

| Tab        | Ícone                    | Rota                                          |
| ---------- | ------------------------ | --------------------------------------------- |
| ESTIMATIVA | Gráfico/painel           | Painel principal                              |
| REGISTROS  | Tabela com lápis         | Lista de registros                            |
| M. DE OBRA | Chave de fenda + martelo | Ajustes avançados de serviços                 |
| AUTONOMIA  | Velocímetro circular     | Ajustes avançados de peças                    |
| AJUSTES    | Perfil/usuário           | Ajustes de predefinição (dados do onboarding) |

**Estado ativo:** fundo azul arredondado, ícone e label brancos.
**Estado inativo:** ícone e label em `neutral`.

---

## III- Arquitetura de Informação

```
MotoCalc RJ
├── Onboarding (9 passos lineares, com branch no P6)
│   ├── P1 — Marca da moto
│   ├── P2 — Modelo
│   ├── P3 — Ano de fabricação
│   ├── P4 — Perfil de uso
│   ├── P5 — Quilometragem
│   ├── P6 — Situação da moto (branch)
│   │   ├── Quitada → vai para P7
│   │   ├── Financiada → sub-tela Financiamento → P7
│   │   └── Alugada → sub-tela Aluguel → P8-extra → P7
│   │       └── P8-extra — Responsabilidade de Custos
│   ├── P7 — Seguro
│   ├── P8 — Plano de Internet
│   └── P9/Final — Alimentação no Trabalho → Concluir
│
└── App Principal
    ├── [Tab] Estimativa (Painel)
    │   └── → Detalhamento de Custos (modal/tela expandida)
    ├── [Tab] Registros
    │   ├── Lista geral com histórico (tabs: Geral / Rodagem / Combustível / Manutenção)
    │   └── Formulários de registro:
    │       ├── Registro de Rodagem (KM do dia)
    │       ├── Registro de Abastecimento
    │       ├── Registro de Óleo
    │       ├── Registro de Pneu
    │       ├── Registro de Revisão Geral
    │       └── Registro de Kit Relação
    ├── [Tab] Mão de Obra
    │   └── Configuração de preços de serviços + tabela de revisões autorizadas
    ├── [Tab] Autonomia (Vida Útil)
    │   └── Configuração de preços/vida útil por peça e combustível
    ├── [Tab] Ajustes
    │   └── Ajustes de predefinição
    └── [Header] Perfil (ícone/avatar)
      ├── Predefinição atual (editar / criar / mudar / apagar)
      ├── Exportar & Importar (.json)
      └── Configurações (idioma, aparência, privacidade)
```

---

## IV- Fluxo de Onboarding

### IV.1- Estrutura visual padrão de cada passo

```
[Header: logo "MotoCalc RJ" + ícone de ajuda]
─────────────────────────────────────────────
PASSO X DE 9          XX% concluído
[Barra de progresso — blue fill]

[Chip de contexto — opcional, ex: "Honda Pop 110i"]

Título da Pergunta
Subtítulo explicativo

[Área de resposta — varia por tipo]

[Imagem atmosférica — opcional, ocupa parte inferior]

[Voltar]  [Próximo →]
```

---

### IV.2- P1 — Identificação da Marca (11%)

**Tipo de resposta:** Cards de seleção 2 colunas + 1 full-width

| Card          | Ícone                          | Label         |
| ------------- | ------------------------------ | ------------- |
| Honda         | 🚲 (bicicleta/moto estilizada) | Honda         |
| Yamaha        | 🏍                             | Yamaha        |
| Outras Marcas | …                              | Outras Marcas |

- Selecionado: borda azul + badge checkmark no canto superior direito
- Imagem de fundo: motor de moto em fundo escuro

---

### IV.3- P2 — Seleção do Modelo (22%)

**Tipo de resposta:** Lista de itens (ícone + label + chevron), hero image no topo

**Chip de contexto:** "⊙ Honda Selecionada"

Modelos disponíveis (Honda):

- Pop 110i
- CG Titan/Fan 150
- CG Titan/Fan 160
- CG Start 160
- NXR Bros 150
- NXR Bros 160

Selecionado: borda azul + checkmark (sem chevron).

---

### IV.4- P3 — Ano de Fabricação (33%)

**Tipo de resposta:** Dropdown + info card contextual

**Chip de contexto:** "Honda Pop 110i"

- Campo: "SELECIONE O ANO" → dropdown com anos disponíveis
- Info card laranja: **REGRA DO RJ** — motos com mais de 15 anos têm 100% de isenção de IPVA no RJ

---

### IV.5- P4 — Perfil de Uso (44%)

**Tipo de resposta:** Cards full-width verticais

| Card                      | Ícone      | Título                                | Impacto                                  |
| ------------------------- | ---------- | ------------------------------------- | ---------------------------------------- |
| Apenas Entregas           | 📦 (caixa) | Apenas Entregas (Baú/Caixa)           | Uso padrão para consumo e desgaste       |
| Transporte de Passageiros | 👥         | Transporte de Passageiros (Uber Moto) | Fator de desgaste extra (peso constante) |

Info card laranja contextual (aparece quando "Passageiro" selecionado): impacto em pneus, freios e suspensão.

---

### IV.6- P5 — Quilometragem (55%)

**Tipo de resposta:** Dois campos de texto + hero image (painel/hodômetro)

| Campo                 | Label                      | Obrigatório | Helper                                          |
| --------------------- | -------------------------- | ----------- | ----------------------------------------------- |
| KM atual do hodômetro | "KM ATUAL DO HODÔMETRO \*" | Sim         | "Essencial para prever as próximas manutenções" |
| KM na última revisão  | "KM NA ÚLTIMA REVISÃO"     | Não         | "Ajuda a calcular o desgaste acumulado"         |

---

### IV.7- P6 — Situação da Moto (66%) — Branch Condicional

**Tipo de resposta:** Cards full-width com radio button à direita

| Opção      | Ícone | Título     | Descrição                                                                                   | Sub-tela                    |
| ---------- | ----- | ---------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| Quitada    | ⚙️    | Quitada    | "A moto é totalmente sua. Focaremos apenas em manutenção, combustível e taxas fixas."       | Nenhuma                     |
| Financiada | 💰    | Financiada | "Você paga parcelas mensais. Incluiremos o valor do financiamento no seu cálculo de lucro." | Sub-tela Financiamento      |
| Alugada    | 🔑    | Alugada    | "Pagamento semanal ou diário. Ideal para quem usa frotas como Mottu ou similares."          | Sub-tela Aluguel + P8-extra |

---

#### IV.7.1- P6b — Sub-tela: Financiamento (condicional)

Aparece quando "Financiada" selecionada. Mesmo passo 6/9 (66%).

| Campo              | Label                          | Placeholder    |
| ------------------ | ------------------------------ | -------------- |
| Valor da parcela   | "QUANTO VOCÊ PAGA DE PARCELA?" | "R$ 0,00"      |
| Parcelas restantes | "QUANTAS PARCELAS RESTAM?"     | "Ex: 24 meses" |

Info card azul: "Saber as parcelas ajuda a calcular seu lucro real até a quitação."
Hero image: guidão com label "GESTÃO DE DÍVIDA".

---

#### IV.7.2- P6c — Sub-tela: Aluguel (condicional)

Aparece quando "Alugada" selecionada. Mesmo passo 6/9 (66%).

| Campo         | Label                          | Opções                      |
| ------------- | ------------------------------ | --------------------------- |
| Valor         | "Qual o valor do seu aluguel?" | Input "R$ 0,00"             |
| Periodicidade | —                              | Toggle "MENSAL" / "SEMANAL" |

Info card laranja: "O aluguel é um custo fixo que impacta diretamente sua meta diária."
Hero image: motor de moto.

---

#### IV.7.3- P8-extra — Responsabilidade de Custos (90%) — Só para fluxo "Alugada"

Aparece como passo adicional no fluxo de moto alugada (entre P7 e o final).

Três seções, cada uma com 3 opções de radio:

| Seção                               | Ícone | Opções                                               |
| ----------------------------------- | ----- | ---------------------------------------------------- |
| Documentação (IPVA + Licenciamento) | 📄    | Eu pago tudo / Locador paga tudo / Dividimos (50/50) |
| Manutenção (Peças + Revisões)       | 🔧    | Eu pago tudo / Locador paga tudo / Dividimos (50/50) |
| Seguro                              | 🛡️    | Eu pago tudo / Locador paga tudo / Dividimos (50/50) |

Info card no topo: explica que essas escolhas ajustam o cálculo operacional automaticamente.
CTA: "Continuar >" (não "Próximo →" — inconsistência de label a padronizar).

---

### IV.8- P7 — Seguro da Moto (77%)

**Tipo de resposta:** Cards full-width + formulário condicional

| Card              | Ícone      | Título            |
| ----------------- | ---------- | ----------------- |
| Sim, sou segurado | 🛡️ (azul)  | Sim, sou segurado |
| Não possuo seguro | 🛡️ (cinza) | Não possuo seguro |

Quando "Sim" selecionado, formulário aparece:

| Campo         | Label                        | Opções                    |
| ------------- | ---------------------------- | ------------------------- |
| Valor         | "VALOR DO SEGURO (R$)"       | Input numérico            |
| Periodicidade | "PERIODICIDADE DO PAGAMENTO" | Toggle "ANUAL" / "MENSAL" |

---

### IV.9- P8 — Plano de Internet (88%)

**Tipo de resposta:** Campo único + hero image com badge

Hero: imagem de rede/conectividade com badge "Conectividade Ativa".

| Campo        | Label                       |
| ------------ | --------------------------- |
| Valor mensal | "VALOR MENSAL (R$)" — input |

Info card azul: "Este custo será diluído para calcular seu lucro líquido real por hora e quilômetro."

---

### IV.10- P9 / Passo Final — Alimentação no Trabalho (100%)

**Tipo de resposta:** Cards 2 colunas + campo condicional

| Card              | Ícone | Label             |
| ----------------- | ----- | ----------------- |
| Sim, como na rua  | 🍴    | Sim, como na rua  |
| Não, levo de casa | 🍔    | Não, levo de casa |

Quando "Sim" selecionado:

| Campo        | Label                      |
| ------------ | -------------------------- |
| Gasto diário | "GASTO MÉDIO POR DIA (R$)" |

Info card no topo do formulário: separado dos gastos da moto, essencial para calcular lucro real.
Info card no rodapé: "Fique tranquilo! Estes valores podem ser atualizados a qualquer momento na aba de Configurações do seu perfil."

CTA final: `Concluir Configuração ✓` (botão com ícone de check — diferente dos demais passos).

---

## V- Telas Principais (App)

### V.1- Header padrão do App

```
[Avatar da moto]  Nome do Modelo       [ícone moto]  [🔔]
                  Ano - XXkm/L
```

Exemplo: "Honda: Pop 110i | 2024 - 55KM/L"

---

### V.2- Estimativa (Painel Principal)

**Rota:** Tab ESTIMATIVA

#### V.2.1- Seção 1 — Configuração de Rodagem

Editável diretamente no painel (campo e stepper interativos):

| Componente  | Label                         | Tipo                         |
| ----------- | ----------------------------- | ---------------------------- |
| KM diários  | "MÉDIA DE KM RODADOS POR DIA" | Input numérico + sufixo "KM" |
| Dias/semana | "DIAS TRABALHADOS / SEMANA"   | Stepper [— N +]              |

#### V.2.2- Seção 2 — Custo de Operação por KM

Card de destaque:

```
CUSTO DE OPERAÇÃO POR KM
R$ 1,42/km                [ícone velocímetro — background watermark]
```

#### V.2.3- Seção 3 — Cards de Estimativa por Hora e Dia

Grade 2 colunas:

```
[ESTIMADO]         [ESTIMADO]
Por Hora           Por Dia
R$ 1,43            R$ 34,35
```

#### V.2.4- Seção 4 — Cards de Estimativa por Período

Cards empilhados, cada um com:

- Label "ESTIMADO POR SEMANA/MÊS/ANO"
- "KM RODADOS [ícone velocímetro] N"
- "CUSTO TOTAL PERÍODO R$ X.XXX,XX"

Exemplo de dados reais do mockup:
| Período | KM | Custo |
|---|---|---|
| Semana | 270 | R$ 240,51 |
| Mês | 1.080 | R$ 962,04 |
| Ano | 14.040 | R$ 12.506,52 |

#### V.2.5- Seção 5 — Distribuição Percentual

- Donut chart com label central (ex: "27% MANUTENÇÃO")
- Legenda com chips coloridos e percentuais:

| Categoria     | Cor chip    | % Exemplo |
| ------------- | ----------- | --------- |
| Documentação  | Azul claro  | 1%        |
| Manutenção    | Laranja     | 27%       |
| Financiamento | Verde/Teal  | 57%       |
| Alimentação   | Amarelo     | 7%        |
| Combustível   | Verde       | 5%        |
| Seguro        | Azul        | 12%       |
| Internet      | Azul escuro | 1%        |
| Multas        | Verde oliva | 1%        |

#### V.2.6- CTA

```
[+ Visualizar / Editar]   ← abre Detalhamento de Custos
```

---

### V.3- Detalhamento de Custos

**Rota:** Aberto a partir do botão "Visualizar / Editar" na Estimativa

**Header:** "Detalhamento de custos" + subtítulo "POP 110I 2024 - 55KM/L"

Cada categoria é um accordion com toggle para ativar/desativar:

#### V.3.1- Estrutura de cada item principal:

```
[Toggle] [Ícone colorido]  Nome         R$ Valor Anual
                           X% do custo anual      [∧]
```

#### V.3.2- Categorias e campos expandidos:

**Combustível** (ícone bomba, azul)

- Preço Médio/L | Custo Mensal
- Consumo Médio (km/L) | Abastecimentos (contagem)

**Alimentação** (ícone garfo, laranja)

- Custo Mensal | Refeições Anuais

**Manutenção** (ícone chave, azul)

- Sub-itens com toggle individual: `Nx  [Nome]  R$ valor`
- Ex: 12x Troca de óleo R$240,43 | 1x Revisão geral R$540 | 1x Troca pneu traseiro R$230

**Documentação** (ícone documento, cinza)

- Sub-itens com chevron expansível:
  - 1x IPVA R$206
  - 1x CRLV R$86
  - 1x Emplacamento R$60

**Internet** (ícone barras de sinal, azul)

- Custo Mensal | Recargas Feitas

**Seguro** (ícone escudo, azul)

- Custo Mensal | Empresa (ex: SUHAI)

**Financiamento** (ícone carteira, verde)

- Custo Mensal | Parcelas Restantes

#### V.3.3- CTA inferior:

```
[+ Adicionar Novo Gasto]
```

---

### V.4- Registros Gerais

**Rota:** Tab REGISTROS → lista principal

**Header:** "Registros gerais" + subtítulo "Honda POP 110i 2024"

**Tabs horizontais:**

```
[Geral]  [Rodagem]  [Combustível]  [Manutenção]
```

**Seções na tab "Geral"** (cada uma com botões [+] e [Ver]):

| Seção           | Subtítulo                | Colunas da tabela                            |
| --------------- | ------------------------ | -------------------------------------------- |
| Óleo Motor      | Trocas preventivas       | DATA / KM / VALOR                            |
| Combustível     | Abastecimentos e consumo | Ícone tipo + nome posto + valor + data + km  |
| Revisão Geral   | Manutenção pesada        | Nome + Valor + Status (CONCLUÍDO) + detalhes |
| Pneu Dianteiro  | Trocas e calibragem      | DATA / KM / MARCA / VALOR                    |
| Pneu Traseiro   | Trocas e calibragem      | DATA / KM / MARCA / VALOR                    |
| Kit Transmissão | Corrente, coroa e pinhão | DATA / KM / MARCA / VALOR                    |
| Rodagem         | kms rodados por dia      | DATA / KM                                    |

---

### V.5- Mão de Obra

**Rota:** Tab MÃO DE OBRA

**Descrição:** "Ajuste os valores dos serviços de manutenção das oficinas com seus próprios dados para cálculos mais precisos no modo personalizado (necessário ativar o modo 'personalizado')." (ajustes avançados)

**Alerta vermelho (topo):** dados pré-definidos são médias aproximadas, podem não corresponder à realidade.

#### V.5.1- Seção: Mão de Obra Paralela

Campos editáveis com reset individual (ícone 🔄):

| Serviço                  | Valor padrão |
| ------------------------ | ------------ |
| Troca de óleo motor      | R$ 5,00      |
| Troca de kit transmissão | R$ 40,00     |
| Troca de pneu            | R$ 30,00     |
| Revisão geral            | R$ 350,00    |
| Manutenção avulsa        | R$ 0,00      |

#### V.5.2- Seção: Revisão Geral Autorizada

Tabela completa das revisões Honda programadas:

Cada revisão exibe:

- Label (ex: "1ª REVISÃO — 1000km em 6 meses")
- KM de uso (campo)
- R$ mão de obra (campo)
- Peças (campo)
- Custo total (calculado automaticamente)

| Revisão | Intervalo                        |
| ------- | -------------------------------- |
| 1ª      | 1.000 km / 6 meses               |
| 3ª      | 6.000 km / 12 meses              |
| 3ª      | 10.000 km / 18 meses             |
| 4ª      | 16.000 km / 24 meses             |
| 5ª      | 24.000 km / 30 meses             |
| 6ª      | 30.000 km / 36 meses             |
| 7ª      | 36.000 km / 42 meses             |
| Avulsa  | A partir de 36.000 km / 42 meses |

---

### V.6- Autonomia (Vida Útil)

**Rota:** Tab AUTONOMIA

**Descrição:** Ajuste de preços e vida útil das peças/elementos para modo personalizado. (ajustes avançados)

**Alerta vermelho (topo):** mesma mensagem da aba Mão de Obra.

#### V.6.1- Seção: Abastecimento e Autonomia

Cada combustível tem dois chips alternáveis: "Valor por litro" / "Autonomia (KM/L)"

| Combustível        | Valor litro padrão | Autonomia padrão |
| ------------------ | ------------------ | ---------------- |
| Gasolina comum     | R$ 5,89            | —                |
| Gasolina aditivada | R$ 6,15            | —                |
| Etanol             | —                  | ⌀ 55 km/L        |

#### V.6.2- Seção: Peças e Elementos

Cada peça tem:

- Ícone ⚡ (cor azul)
- Toggle "Original" / "Paralela" (chip)
- Campo de preço (R$)
- Campo "Vida Útil (KM)" com ícone ⌀ e reset

| Peça            | Original padrão | Paralela | Vida Útil |
| --------------- | --------------- | -------- | --------- |
| Óleo do motor   | R$ 45,00        | —        | 1.000 km  |
| Vela de ignição | R$ 30,00        | —        | 10.000 km |
| Filtro de ar    | —               | R$ 20,00 | 10.000 km |
| Kit transmissão | R$ 50,00        | —        | 22.000 km |

#### V.6.3- Seção: Pneus

Cada pneu tem chips "ORG" / "PAR" (Original/Paralela) + reset:

| Pneu      | Preço padrão | Vida Útil |
| --------- | ------------ | --------- |
| Dianteiro | R$ 180,00    | 25.000 km |
| Traseiro  | R$ 220,00    | 15.000 km |

---

## VI- Telas de Registro

Todas as telas de registro seguem este padrão estrutural:

```
[Header: NOME DO REGISTRO + hamburger + help]
[Hero Image com badge "NOVO REGISTRO" + Título]
[Info card opcional (Dica Pro, laranja, com × dismiss)]
[Card de contexto: "Novo Registro — TIPO DE MANUTENÇÃO"]

[Seções numeradas ou com labels em caps]
[Campos do formulário]
[Área de evidência fotográfica (upload dashed)]

[💾 SALVAR REGISTRO — full-width, blue]
[Bottom Nav]
```

---

### VI.1- Registro de Rodagem (KM do Dia)

**Header:** "Registro de Rodagem"
**Título:** "Kilometragem do Dia"
**Subtítulo:** "Insira os dados da sua jornada diária"

| Campo            | Label              | Tipo     | Detalhe                                 |
| ---------------- | ------------------ | -------- | --------------------------------------- |
| Odômetro inicial | "ODÔMETRO INICIAL" | Input KM | + câmera (foto) + botão "Salvar" inline |
| Odômetro final   | "ODÔMETRO FINAL"   | Input KM | + câmera (foto)                         |

**Seção "EVENTOS DO DIA":**

- Alimentação — toggle (on/off)

**Card de resultado em tempo real:**

```
TOTAL RODADO          MÉDIA ESTIMADA
124.8 KM              38 km/L (laranja)
```

**CTA:** `💾 Registrar Dia` (estilo ghost/light-blue — diferente dos outros registros)

---

### VI.2- Registro de Abastecimento

**Header:** "REGISTROS DE ABASTECIMENTO"
**Subtítulo:** "Insira os dados da bomba e do odômetro."

| Campo            | Label              | Tipo                         |
| ---------------- | ------------------ | ---------------------------- |
| Tipo de gasolina | "TIPO DE GASOLINA" | Toggle "COMUM" / "ADITIVADA" |
| Data             | "DATA"             | Date picker                  |
| Odômetro         | "ODÔMETRO (KM)"    | Input KM                     |
| Total pago       | "TOTAL PAGO (R$)"  | Input monetário              |
| Preço por litro  | "PREÇO POR LITRO"  | Input monetário              |
| Volume estimado  | "VOLUME ESTIMADO"  | Campo calculado (read-only)  |

**Evidências fotográficas (2 botões):**

- 📷 FOTO DO ODÔMETRO
- ⛽ FOTO DA BOMBA

---

### VI.3- Registro de Troca de Óleo

**Header:** "REGISTROS DE ÓLEO"

| Campo                 | Tipo                                          |
| --------------------- | --------------------------------------------- |
| Data da Troca         | Date picker                                   |
| Tipo de Óleo          | Dropdown (ex: 10W30)                          |
| Marca                 | Dropdown (ex: Mobil)                          |
| Kilometragem (KM)     | Input KM com ícone odômetro                   |
| Valor do Serviço (R$) | Input monetário com ícone                     |
| Evidência Visual      | Área upload dashed — "TIRAR FOTO DO ODÔMETRO" |

---

### VI.4- Registro de Troca de Pneu

**Header:** "REGISTROS DE PNEU"

| Campo                   | Tipo                                          |
| ----------------------- | --------------------------------------------- |
| Data da Troca           | Date picker                                   |
| Kilometragem Atual - KM | Input KM com ícone moto                       |
| Posição do Pneu         | Toggle "Dianteiro" / "Traseiro"               |
| Marca do Pneu           | Input texto (ex: Pirelli, Michelin…)          |
| Valor do Pneu - R$      | Input monetário                               |
| Mão de Obra - R$        | Input monetário                               |
| Evidência               | Área upload dashed — "TIRAR FOTO DO ODÔMETRO" |

---

### VI.5- Registro de Revisão Geral

**Header:** "REGISTROS DE REVISÃO"
**Subtítulo:** "Registre os detalhes da manutenção periódica da sua moto."

| Campo                             | Tipo                                                  |
| --------------------------------- | ----------------------------------------------------- |
| Local da Revisão                  | Toggle "Oficina Autorizada" / "Independente"          |
| Qual é a Revisão?                 | Dropdown (ex: 1ª Revisão)                             |
| Mão de Obra (R$)                  | Input monetário                                       |
| Peças (R$)                        | Input monetário                                       |
| + Adicionar peças individualmente | Link expansível → rows dinâmicas: [Nome peça] [Valor] |
| + Adicionar mais 1 peça           | Botão dashed para adicionar nova row                  |

**Card de total em tempo real:**

```
TOTAL ESTIMADO              [ícone calculadora]
R$ 450,00
Mão de Obra: R$ 150,00    Peças: R$ 300,00
```

---

### VI.6- Registro de Kit Relação

**Header:** "REGISTROS DE RELAÇÃO"

**Info card (Dica Pro, laranja, com dismiss ×):**

> "Kits com retentor (O-ring) costumam durar até 50% mais se lubrificados a cada 500km. Registre a próxima limpeza para não esquecer!"

**Seções numeradas:**

**① DADOS TÉCNICOS**
| Campo | Tipo |
|---|---|
| Data da Troca | Date picker (mm/dd/yyyy) |
| Odômetro (KM) | Input numérico |
| Marca do Kit | Input texto com chips de atalho: [DID] [VAZ] |

**② VALORES**
| Campo | Tipo |
|---|---|
| Peças (R$) | Input monetário |
| Mão de Obra (R$) | Input monetário |

**③ EVIDÊNCIA**

- "Take Photo of Odometer — Obrigatório para validação" (com chevron → câmera)

---

## VII- Tela de Perfil

**Rota:** ícone/avatar no header (ex: topo da aba Estimativa)

### VII.1- Seção: Predefinição Atual

Card com:

- Nome do modelo (H2 bold)
- Avatar/thumbnail da moto
- Ano e autonomia (km/l)

Ações disponíveis:
| Botão | Estilo | Ação |
|---|---|---|
| Editar predefinição ✏️ | Light-blue outline | Abre Ajustes de Predefinição (aba Ajustes) |
| Cria nova + | Light-blue outline | Inicia novo onboarding |
| Mudar predefinição ⌨️ | Light-blue outline | Troca para predefinição existente |
| Apagar Tudo 🔄 | Borda vermelha, texto vermelho | Exclui todos os dados |

### VII.2- Seção: Ajustes de Predefinição

Tela acessada via aba Ajustes ou via "Editar predefinição". Título: "Ajustes de predefinição | Honda: Pop 110i"

Cada seção tem reset individual (ícone 🔄):

**Veículo**

- Ano de Fabricação (dropdown)
- KM Atual (input)
- KM Última Revisão (input)

**Preferências**

- Manutenção/Peças: "AUTORIZADAS" / "INDEPENDENTES" (segmented)
- Estimativa sobre dados: "PREDEFINIDOS" / "PERSONALIZADO" (segmented)

**Uso Diário**

- Perfil de Trabalho: "Entrega" / "Passageiro" (segmented)
- Dias na Semana (stepper ⊖ N ⊕)
- KM por Dia — Média (input)

**Financeiro**

- Possui Seguro?: toggle + Valor + Periodicidade (dropdown)
- Alimentação diária: toggle + Valor médio
- Internet mensal: toggle + Valor

**Situação Legal**

- Tipo: "QUITADA" / "FINANCIADA" / "ALUGADA" (segmented)
- Valor Parcela (condicional)
- Restantes — nº meses (condicional)

**Rodapé:** `Resetar para valores padrões` (button ghost, texto centralizado)

---

### VII.3- Seção: Exportar & Importar

| Ação            | Ícone | Descrição                                         |
| --------------- | ----- | ------------------------------------------------- |
| Exportar Backup | ↓     | Gera .json com todas as configurações e histórico |
| Importar Backup | ↑     | Restaura dados de um arquivo MotoCalc anterior    |

### VII.4- Seção: Configurações Gerais

Lista com chevron:

- Idioma → Português (Brasil)
- Aparência → Modo Escuro (Padrão)
- Privacidade e Termos → Versão 2.4.0 (2024) [link externo ↗]

---

## VIII- Padrões de Componentes

### VIII.1- Padrão Header de Tela

**Onboarding:**

```
[🚲 MotoCalc RJ]                    [?]
```

Logo + nome à esquerda, help à direita.

**App principal (com contexto de moto):**

```
[Avatar]  Nome do Modelo   [🏍]  [🔔]
          Ano - XXkm/L
```

- **Avatar:** abre Perfil.
- **Ícone moto:** seletor rápido de presets salvos.
- **🔔 Sino:** alertas de manutenção.
- **?:** abre pop-up de ajuda (tela pendente).

**Telas de registro/utilitárias:**

```
[≡]   NOME DA TELA   [?]
```

Hamburguer à esquerda, título centralizado em caps, help à direita.

- **Hamburguer:** exibe o menu inferior quando não estiver visível.
- **?:** abre pop-up de ajuda (tela pendente).

---

### VIII.2- Padrão de Label de Campo

Todos os labels de campo seguem o estilo **LABEL SM/MICRO** (uppercase, weight médio):

```css
font-size: small; /* ~12px */
text-transform: uppercase;
letter-spacing: 0.05em;
color: var(--text-secondary);
margin-bottom: 4px;
```

---

### VIII.3- Padrão de Evidência Fotográfica

Área de upload com borda dashed:

```
┌ - - - - - - - - - - - - - ┐
|    [📷 ícone câmera]       |
|   TIRAR FOTO DO ODÔMETRO   |
└ - - - - - - - - - - - - - ┘
```

- Borda: dashed, 1px, `surface-bright`
- Fundo: `surface-dim` ou transparente
- Texto em caps, `text-secondary`

---

### VIII.4- Padrão de Cards de Custo Estimado

```
[ícone relógio]    ESTIMADO
Label de período
KM RODADOS         [ícone velocímetro]  N.NNN
CUSTO TOTAL PERÍODO                  R$ X.XXX,XX
```

---

### VIII.5- Inconsistências Conhecidas a Padronizar

> Estas inconsistências foram observadas no Figma e devem ser normalizadas na implementação:

1. **Labels de CTA:** "Próximo →" vs "Continuar >" vs "Concluir Configuração ✓" — padronizar para "Próximo →" em todos os passos e "Concluir →" apenas no último.
2. **Tamanho de fonte dos títulos:** variação visual entre telas de onboarding — implementar H1/H2 consistentes da tipografia do design system.
3. **Espaçamento interno dos cards:** padding varia entre 12px e 20px — padronizar em 16px.
4. **Chips "Original/Paralela":** aparecem como "Original | Paralela" em Autonomia (Vida Útil) e como "ORG | PAR" em Pneus — padronizar um dos formatos.
5. **Evidência fotográfica:** "Take Photo of Odometer" (em inglês) no Kit Relação vs "TIRAR FOTO DO ODÔMETRO" nos outros — traduzir para PT.
6. **Botão "Registrar Dia"** na tela de rodagem usa estilo light-blue/ghost vs o padrão azul forte — avaliar se intencional (menor urgência) ou inconsistência.
7. **Subtítulo do P4:** "Uso padrão para cálculo de consumo e desgaste" apresenta caracteres corrompidos (UTF-8) — corrigir na implementação.
8. **Passo 8 do fluxo Aluguel** (Responsabilidade de Custos): aparece como "8/9 — 90% Completo" mas a barra visual sugere ~88% — alinhar % com contagem de passos.
9. **Hamburguer vs nav sempre visivel:** decidir se o menu inferior fica sempre visivel; se sim, o hamburguer pode ser removido.

### VIII.6- Telas Pendentes

1. Pop-ups de ajuda acionados pelo ícone "?" nas telas.
2. Telas de histórico de registros por categoria (acesso via botões "Ver").

---

_Documento gerado por análise do protótipo Figma MotoCalc — maio/2026._
_Para atualizar: reabrir o Figma e revisar frames marcados com `→` no painel de layers._

# MotoCalc RJ — Documento de Requisitos v5.0

> **Versão:** 5.0
> **Data:** 05/05/2026
> **Baseado em:** v4.0 (03/05/2026) + análise visual completa do protótipo Figma (maio/2026)
> **Supersede:** todas as versões anteriores
> **Stack:** TypeScript · React 18 · Vite · Tailwind CSS · PWA (offline-first) · sem backend
> **Distribuição:** Web (link/QR) + Google Play Store via TWA · sem login em V1 · login-ready

---

## I- Índice

1. [[#I- Visão Geral]]
2. [[#II- Navegação e Estrutura de Telas]]
3. [[#III- Fluxo de Onboarding]]
4. [[#IV- Requisitos Funcionais]]
5. [[#V- Regras de Negócio]]
6. [[#VI- Requisitos Não Funcionais]]
7. [[#VII- Coleta de Eventos (Analytics)]]
8. [[#VIII- PWA e Distribuição na Play Store]]
9. [[#IX- Arquitetura Login-Ready]]
10. [[#X- Stack Tecnológica]]
11. [[#XI- Estrutura de Dados (TypeScript)]]
12. [[#XII- Funções de Cálculo]]
13. [[#XIII- Estrutura de Pastas]]
14. [[#XIV- Priorização MoSCoW]]
15. [[#XV- Fases de Implementação]]

---

## II- Visão Geral

### II.1- Descrição

O **MotoCalc RJ** é um Progressive Web App mobile-first para entregadores de moto do Município do Rio de Janeiro. Transforma custos invisíveis — depreciação de peças, manutenções, financiamento, seguro — em valores concretos por hora, dia, semana, mês e ano, dando ao entregador clareza real sobre sua despesa na área.

### II.2- Problema

A maioria dos entregadores tem consciência apenas do custo da gasolina. Custos como troca de relação, desgaste de pneus, velas e revisões corroem o lucro silenciosamente. Sem uma ferramenta de visualização, o entregador superestima seu ganho líquido real.

### II.3- Solução

SPA mobile-first que:

- Conduz o usuário por **9 passos de onboarding** coletando perfil completo (com branching condicional no passo 6)
- Oferece **presets de dados técnico-financeiros** por modelo de moto (Pop 110i, CG Titan 160, Biz 125, Factor 150, NXR Bros 160)
- Permite **personalização de qualquer valor** via sistema de _overrides_, sem nunca modificar os presets originais
- Exibe custo operacional em **6 granularidades:** anual, mensal, semanal, diário, por hora e por km
- Persiste tudo no dispositivo via **localStorage** (sem servidor)
- Funciona **completamente offline** após o primeiro carregamento
- Rastreia **eventos de uso anonimamente** via Umami (sem cookies, compatível LGPD)
- É **instalável como PWA** e distribuível na **Google Play Store via TWA**

### II.4- Escopo V1

**Dentro do escopo:**

- 5 modelos de moto (Pop 110i completo na Fase 0; demais na Fase 12)
- Cálculo completo de custos (variáveis + fixos + alimentação + gastos personalizados)
- Registro histórico de manutenções, abastecimentos e rodagem diária
- Configuração de mão de obra e vida útil de peças
- Export/import de perfil como `.json`
- Distribuição via web + Play Store (TWA)

**Fora do escopo V1:**

- Login e autenticação (arquitetura login-ready via [[#IX- Arquitetura Login-Ready]])
- Backend ou banco remoto
- Sincronização entre dispositivos
- Notificações push
- API de preços em tempo real
- iOS App Store

---

## III- Navegação e Estrutura de Telas

### III.1- Bottom Navigation Bar (4 abas fixas)

> **Fonte de verdade:** protótipo Figma — nomes e ícones exatos abaixo.

| Aba | Label           | Ícone                | Rota           | Conteúdo                                                                                                 |
| --- | --------------- | -------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | **ESTIMATIVA**  | Gráfico/painel       | `/estimativa`  | Painel de custos com rodagem editável, cards por período, custo/km e acesso ao detalhamento              |
| 2   | **REGISTROS**   | Tabela com lápis     | `/registros`   | Histórico de manutenções, abastecimentos e rodagem. Sub-abas: Geral · Rodagem · Combustível · Manutenção |
| 3   | **MÃO DE OBRA** | Chave + martelo      | `/mao-de-obra` | Preços de serviços paralelos editáveis + tabela de revisões autorizadas Honda                            |
| 4   | **VIDA ÚTIL**   | Velocímetro circular | `/vida-util`   | Combustíveis (preço + autonomia) · Peças (preço + vida útil · ORG/PAR) · Pneus                           |

**Estados visuais:**

- **Ativo:** fundo azul arredondado (`#0078FF`), ícone e label brancos
- **Inativo:** ícone e label em `#C1C6D7`
- Altura mínima da barra: 64px; área de toque de cada tab: ≥ 48px

### III.2- Cabeçalho Global

Todas as telas do app principal exibem:

```
[Avatar/foto moto]  Nome: Modelo        [ícone moto]  [🔔]
                    Ano · XX km/L
```

- **Avatar** → navega para tela Perfil
- **Ícone moto** → navegação contextual (detalhes do veículo)
- **🔔 Sino** → lista de alertas de manutenção pendentes

### III.3- Cabeçalho das Telas de Registro

```
[≡ hamburguer]    NOME DA TELA    [?]
```

Hamburguer → abre menu lateral ou navega para Perfil.

### III.4- Mapa Completo de Telas

```
/ (root)
├── /onboarding              → OnboardingFlow (P1–P9 + branches)
│   ├── /onboarding/1        P1 — Marca
│   ├── /onboarding/2        P2 — Modelo
│   ├── /onboarding/3        P3 — Ano de fabricação
│   ├── /onboarding/4        P4 — Perfil de uso
│   ├── /onboarding/5        P5 — Quilometragem
│   ├── /onboarding/6        P6 — Situação da moto (branch)
│   │   ├── /onboarding/6/financiamento   (condicional)
│   │   ├── /onboarding/6/aluguel         (condicional)
│   │   └── /onboarding/6/responsabilidade (condicional — só "alugada")
│   ├── /onboarding/7        P7 — Seguro
│   ├── /onboarding/8        P8 — Plano de Internet
│   └── /onboarding/9        P9 — Alimentação (passo final)
│
├── /estimativa              → PainelEstimativa
│   └── /estimativa/detalhamento → DetalhamentoCustos
│
├── /registros               → Registros (sub-abas)
│   ├── /registros/rodagem       → form RegistroRodagem
│   ├── /registros/abastecimento → form RegistroAbastecimento
│   ├── /registros/oleo          → form RegistroOleo
│   ├── /registros/pneu          → form RegistroPneu
│   ├── /registros/revisao       → form RegistroRevisao
│   └── /registros/kit-relacao   → form RegistroKitRelacao
│
├── /mao-de-obra             → MaoDeObra
│
├── /vida-util               → VidaUtil
│
├── /perfil                  → Perfil
│   └── /perfil/ajustes      → AjustesPredefinicao
│
└── /ajustes                 → Configuracoes (acesso via ≡ ou ícone no header)
```

---

## IV- Fluxo de Onboarding

### IV.1- Estrutura visual padrão de cada passo

Todo passo do onboarding exibe:

```
[Header: 🚲 MotoCalc RJ            [?]]
──────────────────────────────────────
PASSO X DE 9              XX% concluído
[Barra de progresso — preenchimento azul proporcional]

[Chip de contexto opcional — ex: "Honda Pop 110i"]

Título da Pergunta          ← H1, bold, branco
Subtítulo explicativo       ← body, cinza

[Área de resposta — varia por passo]

[Imagem atmosférica opcional]

[Voltar — Secondary]   [Próximo → — Primary]
```

- Barra de progresso: thin (4px), `primary` fill, background `surface-bright`
- Botão primário: ~65% da largura; secundário: ~30%; gap: 8px
- **Passo final:** CTA = `Concluir Configuração ✓`

### IV.2- Descrição detalhada de cada passo

#### IV.2.1- P1 — Identificação da Marca (11%)

**Tipo de input:** Cards de seleção 2 colunas + 1 full-width

| Card          | Label         | Observação                                                                      |
| ------------- | ------------- | ------------------------------------------------------------------------------- |
| Honda         | Honda         | Filtra modelos disponíveis em P2                                                |
| Yamaha        | Yamaha        | Filtra modelos disponíveis em P2                                                |
| Outras Marcas | Outras Marcas | Bloqueia avanço com mensagem "Modelo sem preset disponível — cálculo impreciso" |

Selecionado: borda `primary` + badge `✓` no canto superior direito.

#### IV.2.2- P2 — Seleção do Modelo (22%)

**Tipo de input:** Hero image (moto da marca) + lista de itens com chevron

Chip de contexto: `⊙ {Marca} Selecionada`

Modelos Honda disponíveis em V1:

- Pop 110i · CG Titan/Fan 150 · CG Titan/Fan 160 · CG Start 160 · NXR Bros 150 · NXR Bros 160

Selecionado: borda `primary` + `✓`, sem chevron.

#### IV.2.3- P3 — Ano de Fabricação (33%)

**Tipo de input:** Dropdown de anos + info card contextual

Chip de contexto: `{Marca} {Modelo}`

- Dropdown: "SELECIONE O ANO" → lista de anos do modelo selecionado
- Info card laranja (⚠️ REGRA DO RJ): "Motos com mais de 15 anos de fabricação possuem 100% de isenção de IPVA no Estado do Rio de Janeiro."

#### IV.2.4- P4 — Perfil de Uso (44%)

**Tipo de input:** Cards full-width verticais (ícone + título + subtítulo descritivo)

| Card       | Ícone | Título                                | Impacto no cálculo                                         |
| ---------- | ----- | ------------------------------------- | ---------------------------------------------------------- |
| Entregas   | 📦    | Apenas Entregas (Baú/Caixa)           | Uso padrão. Aplica `consumoKmLComBau` se baú = sim.        |
| Passageiro | 👥    | Transporte de Passageiros (Uber Moto) | Fator de desgaste extra (+X%) em pneus, freios, suspensão. |

Info card laranja contextual quando "Passageiro" selecionado.

#### IV.2.5- P5 — Quilometragem (55%)

**Tipo de input:** 2 campos de texto + hero image (painel/hodômetro)

| Campo             | Label                    | Obrigatório | Helper                                          |
| ----------------- | ------------------------ | ----------- | ----------------------------------------------- |
| `kmAtual`         | KM ATUAL DO HODÔMETRO \* | Sim         | "Essencial para prever as próximas manutenções" |
| `kmUltimaRevisao` | KM NA ÚLTIMA REVISÃO     | Não         | "Ajuda a calcular o desgaste acumulado"         |

#### IV.2.6- P6 — Situação da Moto (66%) — Branch Condicional

**Tipo de input:** Cards full-width com radio button à direita

| Opção          | Ícone | Descrição                                                                                   | Subtela exibida                              |
| -------------- | ----- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Quitada**    | ⚙️    | "A moto é totalmente sua. Focaremos apenas em manutenção, combustível e taxas fixas."       | Nenhuma — avança para P7                     |
| **Financiada** | 💰    | "Você paga parcelas mensais. Incluiremos o valor do financiamento no seu cálculo de lucro." | Sub-tela Financiamento                       |
| **Alugada**    | 🔑    | "Pagamento semanal ou diário. Ideal para quem usa frotas como Mottu ou similares."          | Sub-tela Aluguel → Sub-tela Responsabilidade |

**P6b — Sub-tela Financiamento** (condicional):

| Campo               | Label                        | Placeholder  |
| ------------------- | ---------------------------- | ------------ |
| `parcelaMensal`     | QUANTO VOCÊ PAGA DE PARCELA? | R$ 0,00      |
| `parcelasRestantes` | QUANTAS PARCELAS RESTAM?     | Ex: 24 meses |

Info azul: "Saber as parcelas ajuda a calcular seu lucro real até a quitação."

**P6c — Sub-tela Aluguel** (condicional):

| Campo                  | Label                        | Opções                  |
| ---------------------- | ---------------------------- | ----------------------- |
| `aluguelValor`         | Qual o valor do seu aluguel? | Input R$                |
| `aluguelPeriodicidade` | —                            | Toggle MENSAL / SEMANAL |

Info laranja: "O aluguel é um custo fixo que impacta diretamente sua meta diária."

**P6d — Sub-tela Responsabilidade de Custos** (condicional — só quando "Alugada"):

> Aparece como passo 8/9 — 90% (extra step no fluxo aluguel)

Três seções com radio tri-estado (Eu pago tudo / Locador paga tudo / Dividimos 50/50):

- Documentação (IPVA + Licenciamento)
- Manutenção (Peças + Revisões)
- Seguro

#### IV.2.7- P7 — Seguro da Moto (77%)

**Tipo de input:** Cards full-width + formulário condicional

| Card              | Ícone      | Título            |
| ----------------- | ---------- | ----------------- |
| Sim, sou segurado | 🛡️ (azul)  | Sim, sou segurado |
| Não possuo seguro | 🛡️ (cinza) | Não possuo seguro |

Quando "Sim" selecionado:

- VALOR DO SEGURO (R$) — input numérico
- PERIODICIDADE — toggle ANUAL / MENSAL

#### IV.2.8- P8 — Plano de Internet (88%)

Hero image: conectividade com badge "Conectividade Ativa"

| Campo            | Label             |
| ---------------- | ----------------- |
| `internetMensal` | VALOR MENSAL (R$) |

Info azul: "Este custo será diluído para calcular seu lucro líquido real por hora e quilômetro."

#### IV.2.9- P9 — Alimentação no Trabalho (100% — Passo Final)

**Tipo de input:** Cards 2 colunas + campo condicional

| Card | Ícone | Label             |
| ---- | ----- | ----------------- |
| Sim  | 🍴    | Sim, como na rua  |
| Não  | 🍔    | Não, levo de casa |

Quando "Sim":

- GASTO MÉDIO POR DIA (R$) — input numérico (padrão: R$ 20,00)

Info footer: "Fique tranquilo! Estes valores podem ser atualizados a qualquer momento na aba de Configurações do seu perfil."

CTA: `Concluir Configuração ✓`

---

## V- Requisitos Funcionais

### V.1- Onboarding

| ID       | Descrição                                                                                                            | Critério de Aceite                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| RF-ON-01 | Exibir onboarding apenas no primeiro acesso. Com perfil salvo, ir direto à aba ESTIMATIVA.                           | `localStorage.perfil.onboardingConcluido === true` → redireciona para `/estimativa`.                                                    |
| RF-ON-02 | Barra de progresso visual em todos os passos, indicando "PASSO X DE 9" e percentual.                                 | Porcentagem calculada proporcionalmente. Fluxo aluguel tem 10 passos efetivos (o P6d extra).                                            |
| RF-ON-03 | Navegação "Voltar" funcional em todos os passos exceto P1, sem perder respostas preenchidas.                         | Estado do onboarding mantido em memória (não persistido até `Concluir`).                                                                |
| RF-ON-04 | Lógica condicional em P6: exibir sub-telas corretas conforme situação selecionada.                                   | Testes automatizados validam cada ramo.                                                                                                 |
| RF-ON-05 | Ao concluir P9, exibir tela de confirmação com resumo editável antes de salvar.                                      | Botão "Editar" por seção redireciona ao passo correspondente mantendo estado.                                                           |
| RF-ON-06 | Salvar perfil completo no localStorage apenas ao clicar "Concluir Configuração". Cancelar onboarding não salva nada. | `dispatch({ type: 'COMMIT_ONBOARDING' })` como ação única de persistência.                                                              |
| RF-ON-07 | Chamar BrasilAPI FIPE no passo P3 (seleção do ano) para obter valor venal.                                           | Resultado cacheado em `perfil.fipeCache`. Se offline: usar cache anterior + aviso de data. Se sem cache e offline: exibir input manual. |

---

### V.2- Aba ESTIMATIVA — Painel

| ID        | Descrição                                                                                                 | Critério de Aceite                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| RF-EST-01 | Exibir alerta de manutenção (card vermelho) no topo quando houver manutenção em menos de 500 km.          | "Alerta — [Peça] em [X] km (estimativa: [N] dias)". Calculado com `kmAtual` e `kmDia`. Exibe apenas a mais urgente.           |
| RF-EST-02 | Exibir toggle PREDEFINIDOS / PERSONALIZADO (modo de cálculo).                                             | PREDEFINIDOS → usa preset puro. PERSONALIZADO → usa overrides. Alternar recalcula em < 200ms.                                 |
| RF-EST-03 | Exibir toggle AUTORIZADAS / INDEPENDENTES (modo de revisão).                                              | Alternar recalcula custo de revisão em tempo real.                                                                            |
| RF-EST-04 | Exibir seção "CONFIGURAÇÃO DE RODAGEM" com: input KM/dia + stepper dias/semana. Valores editáveis inline. | Qualquer alteração recalcula todos os cards imediatamente.                                                                    |
| RF-EST-05 | Exibir card "CUSTO DE OPERAÇÃO POR KM" em destaque.                                                       | Atualizado em tempo real. Ícone velocímetro como watermark.                                                                   |
| RF-EST-06 | Exibir cards estimativos Por Hora e Por Dia em grade 2 colunas.                                           | `porHora = custoDiario / horasDia`. `porDia = custoTotalAnual / diasAno`.                                                     |
| RF-EST-07 | Exibir blocos de estimativa por período: Semana, Mês, Ano. Cada bloco: KM RODADOS + CUSTO TOTAL.          | Recalcular em < 200ms após qualquer alteração de input.                                                                       |
| RF-EST-08 | Exibir gráfico de rosca (donut) com distribuição percentual por categoria.                                | Categorias com toggle off excluídas. Percentuais somam 100% sobre categorias ativas. Label central = categoria dominante + %. |
| RF-EST-09 | Exibir legenda abaixo do donut com chips coloridos: categoria + %.                                        | Chips clicáveis — clicar destaca a fatia correspondente no gráfico.                                                           |
| RF-EST-10 | Exibir botão "＋ Visualizar / Editar" que navega para `/estimativa/detalhamento`.                         | Sempre visível abaixo do donut.                                                                                               |

---

### V.3- Aba ESTIMATIVA — Detalhamento de Custos

| ID        | Descrição                                                                                                                                             | Critério de Aceite                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| RF-DET-01 | Exibir "DETALHAMENTO POR CATEGORIA" como lista de accordions.                                                                                         | Cada categoria colapsada por padrão, exceto a de maior valor.                             |
| RF-DET-02 | Cada accordion exibe: toggle on/off · ícone colorido · nome · valor anual · % do custo total · chevron.                                               | Toggle off → `fatorCategoria = 0` → recalcula total imediatamente.                        |
| RF-DET-03 | Detalhamento expandido de **Combustível**: Preço Médio/L · Custo Mensal · Consumo Médio km/L · Nº de abastecimentos/mês.                              |                                                                                           |
| RF-DET-04 | Detalhamento expandido de **Alimentação**: Custo Mensal · Refeições anuais.                                                                           | Refeições anuais = `diasAno` (dias trabalhados).                                          |
| RF-DET-05 | Detalhamento expandido de **Manutenção**: sub-itens com toggle individual · frequência anual (Nx) · custo anual. Ex: "12x Troca de óleo — R$ 240,43". | Sub-itens derivados do preset + overrides do usuário.                                     |
| RF-DET-06 | Detalhamento expandido de **Documentação**: sub-itens IPVA · CRLV · Emplacamento, cada um com chevron expansível mostrando origem do valor.           | IPVA exibe "Isento" se moto ≥ 15 anos.                                                    |
| RF-DET-07 | Detalhamento expandido de **Internet**: Custo Mensal · Recargas/pagamentos anuais.                                                                    |                                                                                           |
| RF-DET-08 | Detalhamento expandido de **Seguro**: Custo mensal equivalente · Nome da seguradora.                                                                  |                                                                                           |
| RF-DET-09 | Detalhamento expandido de **Financiamento** (se `situacaoMoto === 'financiada'`): Custo mensal (parcela) · Parcelas restantes.                        | Label muda para "Aluguel" se `situacaoMoto === 'alugada'`.                                |
| RF-DET-10 | Botão "＋ Adicionar Novo Gasto" ao final da lista.                                                                                                    | Abre modal/inline form: nome + valor mensal. Gasto salvo como categoria própria no total. |
| RF-DET-11 | Porcentagens somam 100% considerando apenas categorias com toggle ativo.                                                                              |                                                                                           |

---

### V.4- Aba REGISTROS

| ID        | Descrição                                                                                                                                                                                                                       | Critério de Aceite                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| RF-REG-01 | Exibir 4 sub-abas horizontais: **Geral · Rodagem · Combustível · Manutenção**.                                                                                                                                                  | Sub-aba "Geral" ativa por padrão.                            |
| RF-REG-02 | Sub-aba **Geral**: seções para cada categoria (Óleo Motor · Combustível · Revisão Geral · Pneu Dianteiro · Pneu Traseiro · Kit Transmissão · Rodagem). Cada seção: botão [＋] para adicionar + botão [Ver] para lista completa. |                                                              |
| RF-REG-03 | Registros de **Óleo Motor**: tabela DATA / KM / VALOR.                                                                                                                                                                          |                                                              |
| RF-REG-04 | Registros de **Combustível**: card com ícone tipo (Aditivada/Comum) · valor pago · data · posto/local · km.                                                                                                                     | Posto/local: texto livre.                                    |
| RF-REG-05 | Registros de **Revisão Geral**: card com nome do serviço · valor total · local (autorizada/independente) · badge de status (CONCLUÍDO / EM DIA / PRÓXIMO) · data · km · itens trocados.                                         | Badge "PRÓXIMO" quando próxima revisão em < 500 km.          |
| RF-REG-06 | Registros de **Pneu Dianteiro/Traseiro**: tabela DATA / KM / MARCA / VALOR.                                                                                                                                                     |                                                              |
| RF-REG-07 | Registros de **Kit Transmissão**: tabela DATA / KM / MARCA / VALOR.                                                                                                                                                             |                                                              |
| RF-REG-08 | Sub-aba **Rodagem**: lista de dias com DATA e KM. Após 5+ registros: exibir média real de km/dia no topo.                                                                                                                       |                                                              |
| RF-REG-09 | Sub-aba **Combustível**: lista detalhada (tipo · valor · posto · km · litros · preço/L). Após 3+ registros: exibir consumo real (km/L) no topo.                                                                                 | `consumoReal = soma(km) / soma(litros)`.                     |
| RF-REG-10 | Sub-aba **Manutenção**: todos os registros de manutenção ordenados por data desc.                                                                                                                                               |                                                              |
| RF-REG-11 | Após 2+ registros do mesmo tipo: calcular e exibir intervalo médio real.                                                                                                                                                        | "Seu intervalo real observado: X.XXX km (preset: Y.XXX km)". |
| RF-REG-12 | Editar ou excluir qualquer registro via swipe-left ou long-press. Confirmação antes de excluir.                                                                                                                                 |                                                              |

---

### V.5- Formulários de Registro (acessados via botão [＋])

Todos os formulários compartilham:

- Header: `REGISTROS DE [TIPO]` + hamburguer + `?`
- Hero image com badge "NOVO REGISTRO" + título
- CTA: `💾 SALVAR REGISTRO` (full-width, azul)
- Bottom nav visível

#### V.5.1- RF-FORM-01 — Registro de Rodagem (KM do Dia)

| Campo            | Tipo              | Detalhe                                       |
| ---------------- | ----------------- | --------------------------------------------- |
| Odômetro Inicial | Input numérico KM | + botão câmera (foto) + botão inline "Salvar" |
| Odômetro Final   | Input numérico KM | + botão câmera (foto)                         |
| Alimentação      | Toggle on/off     | Evento do dia                                 |

Card calculado em tempo real: TOTAL RODADO (KM) · MÉDIA ESTIMADA (km/L)

CTA alternativo: `💾 Registrar Dia` (estilo ghost-light — menor urgência visual)

#### V.5.2- RF-FORM-02 — Registro de Abastecimento

| Campo                | Tipo                                                     |
| -------------------- | -------------------------------------------------------- |
| Tipo de gasolina     | Toggle COMUM / ADITIVADA                                 |
| Data                 | Date picker                                              |
| Odômetro (KM)        | Input numérico                                           |
| Total pago (R$)      | Input monetário                                          |
| Preço por litro (R$) | Input monetário                                          |
| Volume estimado      | Calculado (read-only): `totalPago / precoPorLitro`       |
| Evidências           | 2 botões upload dashed: FOTO DO ODÔMETRO · FOTO DA BOMBA |

#### V.5.3- RF-FORM-03 — Registro de Troca de Óleo

| Campo                 | Tipo                                        |
| --------------------- | ------------------------------------------- |
| Data da Troca         | Date picker                                 |
| Tipo de Óleo          | Dropdown (ex: 10W30)                        |
| Marca                 | Dropdown (ex: Mobil)                        |
| Kilometragem (KM)     | Input com ícone odômetro                    |
| Valor do Serviço (R$) | Input monetário com ícone                   |
| Evidência Visual      | Área upload dashed — TIRAR FOTO DO ODÔMETRO |

#### V.5.4- RF-FORM-04 — Registro de Troca de Pneu

| Campo                   | Tipo                                        |
| ----------------------- | ------------------------------------------- |
| Data da Troca           | Date picker                                 |
| Kilometragem Atual - KM | Input numérico                              |
| Posição do Pneu         | Toggle Dianteiro / Traseiro                 |
| Marca do Pneu           | Input texto livre                           |
| Valor do Pneu (R$)      | Input monetário                             |
| Mão de Obra (R$)        | Input monetário                             |
| Evidência               | Área upload dashed — TIRAR FOTO DO ODÔMETRO |

#### V.5.5- RF-FORM-05 — Registro de Revisão Geral

| Campo                              | Tipo                                      |
| ---------------------------------- | ----------------------------------------- |
| Local da Revisão                   | Toggle Oficina Autorizada / Independente  |
| Qual é a Revisão?                  | Dropdown (1ª Revisão, 2ª Revisão...)      |
| Mão de Obra (R$)                   | Input monetário                           |
| Peças (R$)                         | Input monetário (total)                   |
| ＋ Adicionar peças individualmente | Link → rows dinâmicas [Nome peça] [Valor] |
| ＋ Adicionar mais 1 peça           | Botão dashed para nova row                |

Card de total em tempo real: TOTAL ESTIMADO = mão de obra + peças

#### V.5.6- RF-FORM-06 — Registro de Kit Relação

Dica Pro (info card laranja, dismissível): "Kits com retentor (O-ring) costumam durar até 50% mais se lubrificados a cada 500km."

Seções numeradas:

**① DADOS TÉCNICOS**

| Campo         | Tipo           | Detalhe                             |
| ------------- | -------------- | ----------------------------------- |
| Data da Troca | Date picker    |                                     |
| Odômetro (KM) | Input numérico |                                     |
| Marca do Kit  | Input texto    | Chips de atalho rápido: [DID] [VAZ] |

**② VALORES**

| Campo            | Tipo            |
| ---------------- | --------------- |
| Peças (R$)       | Input monetário |
| Mão de Obra (R$) | Input monetário |

**③ EVIDÊNCIA**

- "Tirar Foto do Odômetro — Obrigatório para validação" (câmera + chevron)

---

### V.6- Aba MÃO DE OBRA

| ID       | Descrição                                                                                                                                                                                                         | Critério de Aceite                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| RF-MO-01 | Exibir aviso informativo (card vermelho): "Os valores pré-definidos são apenas médias aproximadas com base em pesquisa de campo em dados públicos, podem não corresponder à realidade ou estarem desatualizados." | Visível no topo da aba, sem possibilidade de dismiss permanente.                                           |
| RF-MO-02 | Seção **MÃO DE OBRA PARALELA**: campos editáveis + reset (↺) por serviço.                                                                                                                                         | Tipos: Troca de óleo motor · Troca de kit transmissão · Troca de pneu · Revisão geral · Manutenção avulsa. |
| RF-MO-03 | Qualquer edição em MÃO DE OBRA impacta o custo de revisão anual na aba ESTIMATIVA.                                                                                                                                | Alteração → recálculo em < 200ms.                                                                          |
| RF-MO-04 | Seção **REVISÃO GERAL AUTORIZADA**: tabela de revisões Honda programadas com campos KM de uso · mão de obra · peças · custo total (calculado) editáveis por linha.                                                | Reset (↺) por linha reverte ao preset.                                                                     |
| RF-MO-05 | Botão reset (↺) por campo reverte apenas aquele campo para o valor do preset.                                                                                                                                     | Confirma RN-02.                                                                                            |

Revisões Honda exibidas (Pop 110i):

| Revisão | Intervalo             |
| ------- | --------------------- |
| 1ª      | 1.000 km / 6 meses    |
| 2ª      | 6.000 km / 12 meses   |
| 3ª      | 10.000 km / 18 meses  |
| 4ª      | 16.000 km / 24 meses  |
| 5ª      | 24.000 km / 30 meses  |
| 6ª      | 30.000 km / 36 meses  |
| 7ª      | 36.000 km / 42 meses  |
| Avulsa  | A partir de 36.000 km |

---

### V.7- Aba VIDA ÚTIL

| ID       | Descrição                                                                                                                                                                                             | Critério de Aceite                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| RF-VU-01 | Mesmo aviso do RF-MO-01 (card vermelho no topo).                                                                                                                                                      |                                                         |
| RF-VU-02 | Seção **ABASTECIMENTO E AUTONOMIA**: 3 tipos de combustível (Gasolina Comum · Aditivada · Etanol). Cada um com chips alternáveis "Valor por litro" / "Autonomia (KM/L)" + campo editável + reset (↺). | Alteração recalcula custo de combustível imediatamente. |
| RF-VU-03 | Seção **PEÇAS E ELEMENTOS**: lista de peças com toggle ORG/PAR · preço (R$) · vida útil (KM) · reset (↺).                                                                                             |                                                         |
| RF-VU-04 | Toggle ORG/PAR por peça sobrescreve a configuração global `perfilPecasGlobal` para aquela peça específica.                                                                                            | Confirma RN-10.                                         |
| RF-VU-05 | Seção **PNEUS**: Dianteiro e Traseiro com chips ORG/PAR · preço · vida útil · reset.                                                                                                                  |                                                         |

Peças exibidas (Pop 110i): Óleo do motor · Vela de ignição · Filtro de ar · Kit transmissão (+ Dianteiro + Traseiro como pneus)

---

### V.8- Tela Perfil

| ID         | Descrição                                                                                                                                                                                                               | Critério de Aceite          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| RF-PERF-01 | Exibir predefinição atual: nome do modelo · avatar · ano · autonomia.                                                                                                                                                   |                             |
| RF-PERF-02 | Botões de ação na predefinição: Editar predefinição (→ `/perfil/ajustes`) · Criar nova (→ inicia novo onboarding) · Mudar predefinição (→ modal com lista de presets salvos) · Apagar Tudo (vermelho, com confirmação). |                             |
| RF-PERF-03 | Seção Exportar & Importar: Exportar Backup (.json) · Importar Backup (aceita .json).                                                                                                                                    | RF-EXP completo nesta tela. |
| RF-PERF-04 | Itens de configuração geral: Idioma (Português Brasil) · Aparência (Modo Escuro — padrão) · Privacidade e Termos (link externo · versão do app).                                                                        |                             |

#### V.8.1- Ajustes de Predefinição (`/perfil/ajustes`)

Formulário de edição pós-onboarding com 5 seções, cada uma com reset individual (↺):

| Seção              | Campos                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Veículo**        | Ano de Fabricação (dropdown) · KM Atual · KM Última Revisão                                                      |
| **Preferências**   | Manutenção/Peças: AUTORIZADAS / INDEPENDENTES · Estimativa: PREDEFINIDOS / PERSONALIZADO                         |
| **Uso Diário**     | Perfil de Trabalho: Entrega / Passageiro · Dias na Semana (stepper ⊖ N ⊕) · KM por Dia (input)                   |
| **Financeiro**     | Seguro (toggle + valor + periodicidade) · Alimentação diária (toggle + valor) · Internet mensal (toggle + valor) |
| **Situação Legal** | Tipo: QUITADA / FINANCIADA / ALUGADA · Valor Parcela (condicional) · Restantes (condicional)                     |

Rodapé: botão `Resetar para valores padrões` (reseta a predefinição inteira para o preset original).

---

### V.9- Custos Fixos de Documentação

| ID        | Descrição                                                                | Critério de Aceite                                                            |
| --------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| RF-DOC-01 | IPVA = `valorFipe × aliquota`. Se moto ≥ 15 anos no RJ: exibir "Isento". | FIPE obtida no onboarding e cacheada. Se offline, usar cache + aviso de data. |
| RF-DOC-02 | Licenciamento anual conforme tabela DETRAN-RJ vigente. 2026: R$ 206.     | Valor definido em `dados_rj.json`. Somente leitura para o usuário.            |
| RF-DOC-03 | Tooltip (ícone ?) em cada custo fixo explicando a origem.                | Ex: "Alíquota IPVA-RJ 2026: 2% sobre valor FIPE".                             |

---

### V.10- Persistência e Export/Import

| ID         | Descrição                                                         | Critério de Aceite                                                                                |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RF-CONF-01 | Salvar automaticamente no localStorage a cada dispatch de estado. | Fechar/reabrir o app preserva tudo exatamente como estava.                                        |
| RF-CONF-02 | Ao reabrir com perfil salvo, carregar estado sem ação do usuário. | Onboarding nunca exibido novamente se `onboardingConcluido === true`.                             |
| RF-EXP-01  | Exportar todos os dados como `motocalc_backup.json`.              | Inclui aviso de privacidade. Download automático no browser / compartilhamento nativo no Android. |
| RF-EXP-02  | Importar arquivo `.json` exportado.                               | Exige confirmação se perfil existente. Compatível com schemas anteriores (v3+).                   |
| RF-EXP-03  | Arquivo de export contém `schemaVersion` para migrações futuras.  | Schema atual: 5. Imports de v3+ recebem campos ausentes com valores padrão.                       |

---

## VI- Regras de Negócio

### VI.1- Imutabilidade de Presets e Sistema de Overrides

| ID    | Regra                                                                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | **Os arquivos de preset JSON são somente leitura.** Nenhuma ação do usuário os modifica. O app apenas os lê.                                                                     |
| RN-02 | **Toda personalização é armazenada como override no perfil (localStorage)**, nunca no preset. O sistema usa o override quando disponível e cai no preset quando não há override. |
| RN-03 | **O botão ↺ (reset) em qualquer campo apaga apenas o override daquele campo**, fazendo o sistema voltar ao preset para aquele item. Não afeta outros campos.                     |
| RN-04 | **Modo PREDEFINIDOS:** ignora todos os overrides — calcula usando exclusivamente valores do preset.                                                                              |
| RN-05 | **Modo PERSONALIZADO:** usa overrides onde existem, cai no preset onde não há. Este é o modo padrão após qualquer personalização.                                                |

### VI.2- Toggles de Categoria (Inclusão/Exclusão do Total)

| ID    | Regra                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- |
| RN-06 | Toggle off em uma categoria → `fatorCategoria = 0` → custo daquela categoria não entra no total.         |
| RN-07 | Toggle off não apaga dados — ao reativar, custo retorna normalmente.                                     |
| RN-08 | Toggle de categoria é independente do fator de responsabilidade de moto alugada. São camadas ortogonais. |
| RN-09 | Porcentagens no detalhamento calculadas apenas sobre categorias com toggle ativo, somando sempre 100%.   |

### VI.3- Toggle ORG/PAR por Peça

| ID    | Regra                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------- |
| RN-10 | Toggle ORG/PAR por peça na aba VIDA ÚTIL sobrescreve o `perfilPecasGlobal` para aquela peça.                               |
| RN-11 | Se `anoFimOriginal` no preset indica que não há original para o modelo/ano, toggle ORG é desabilitado para todas as peças. |
| RN-12 | Toggle ORG/PAR por peça é um override armazenado no perfil (segue RN-02). Reset (↺) da peça desfaz também esse toggle.     |

### VI.4- Multi-Combustível

| ID    | Regra                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| RN-13 | Custo de combustível calculado usando `tipoGasolinaPreferida` definido no onboarding.                                          |
| RN-14 | Configurar preço/autonomia de outros tipos na aba VIDA ÚTIL não muda o tipo principal — apenas atualiza os dados daquele tipo. |
| RN-15 | Para trocar o tipo principal, o usuário vai a Configurações e altera `tipoGasolinaPreferida`.                                  |

### VI.5- Gatilho Duplo (km ou tempo)

| ID    | Regra                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-16 | Para peças com intervalo em km e em meses, o sistema calcula qual gatilho é atingido primeiro.                                                          |
| RN-17 | `mesesParaAtingirKm = intervaloKm / kmMensal`. Se `< intervaloMeses` → gatilho por km. Caso contrário → `intervaloEfetivo = intervaloMeses × kmMensal`. |

### VI.6- Alerta de Manutenção

| ID    | Regra                                                                                   |
| ----- | --------------------------------------------------------------------------------------- |
| RN-18 | Alerta exibido quando `kmRestante ≤ 500` (padrão configurável).                         |
| RN-19 | `diasRestantes = kmRestante / (kmDia × diasSemana / 7)`.                                |
| RN-20 | Painel exibe apenas o alerta mais urgente. Todos os pendentes visíveis no Detalhamento. |

### VI.7- Fator de Responsabilidade (Moto Alugada)

| ID    | Regra                                                                                                                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| RN-21 | `fatorResponsabilidade` aceita: `"eu" → 1.0` · `"locador" → 0.0` · `"dividimos" → 0.5`.                                           |
| RN-22 | Fator aplicado por bloco: documentação · manutenção · seguro. Financiamento/aluguel não tem fator — é sempre custo do entregador. |
| RN-23 | Se `situacaoMoto !== 'alugada'`, todos os fatores são `1.0` (sem efeito).                                                         |

### VI.8- Consistências de Dados

| ID    | Regra                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-24 | `kmAtual` é atualizado automaticamente após cada Registro de Rodagem: `kmAtual = max(kmAtual, kmFinal)`.                                                |
| RN-25 | Após 5+ Registros de Rodagem, `kmDiaMedioReal` é calculado. O usuário pode optar por usá-lo em vez do valor do onboarding.                              |
| RN-26 | Após 2+ registros do mesmo tipo de manutenção, `intervaloRealObservado` é calculado e exibido como informação (não substitui automaticamente o preset). |

---

## VII- Requisitos Não Funcionais

### VII.1- Desempenho e Disponibilidade

| ID     | Descrição                                                         | Meta                                                               |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| RNF-01 | Funcionar completamente offline após o primeiro acesso.           | Service Worker com estratégia `CacheFirst` para assets estáticos.  |
| RNF-02 | Primeiro carregamento rápido em 3G.                               | Bundle total < 500 KB gzipado. Lighthouse Performance ≥ 80.        |
| RNF-03 | Instalável como PWA em Android (e iOS via Safari com limitações). | `manifest.json` válido. `start_url` e `display: standalone`.       |
| RNF-04 | Recalcular custos em < 200ms após qualquer alteração de input.    | `useMemo` com dependências corretas. Profiling no Chrome DevTools. |

### VII.2- Usabilidade e Acessibilidade

O público usa o app em movimento, com uma mão, em plena luz solar.

| ID     | Descrição                                                          | Meta                                                          |
| ------ | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| RNF-05 | Área de toque mínima de 48×48px em todos os elementos interativos. | Botões de stepper, reset ↺, toggles e chips.                  |
| RNF-06 | Contraste de cores WCAG 2.1 nível AA.                              | Razão ≥ 4.5:1 para texto normal. O tema escuro favorece isso. |
| RNF-07 | Campos numéricos abrem teclado numérico automaticamente.           | `inputMode="decimal"` em todos os inputs de km, R$ e km/L.    |
| RNF-08 | Interface responsiva para telas de 360px a 430px.                  | Testado em Moto G e Samsung A.                                |
| RNF-09 | Onboarding concluível em menos de 3 minutos.                       | Teste com 3 entregadores reais. Tempo médio < 3 min.          |

### VII.3- Manutenção e Evolução

| ID     | Descrição                                                                   | Meta                                                                       |
| ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| RNF-10 | Dados de cada modelo em arquivo JSON separado da lógica de cálculo.         | Adicionar novo modelo = inserir novo `.json`. Zero alteração no código.    |
| RNF-11 | Lógica de cálculo isolada em funções puras e testáveis.                     | Funções em `/utils/calculos.ts`. Cobertura de testes unitários com Vitest. |
| RNF-12 | Arquivos TypeScript com tipagem estrita. `strict: true` no `tsconfig.json`. | `any` proibido. Todas as interfaces declaradas em `/types`.                |

---

## VIII- Coleta de Eventos (Analytics)

> Ferramenta: **Umami** — sem cookies, sem dados pessoais, LGPD-compatível.

### VIII.1- Requisitos de Analytics

| ID         | Descrição                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-ANA-01 | Integrar Umami para rastreamento anônimo. Nenhum dado pessoal enviado (sem nome, email, CPF, localização, hodômetro).                                                  |
| RNF-ANA-02 | Implementar função `trackEvent(nome, propriedades?)` centralizada em `/utils/analytics.ts`. Todos os componentes usam essa função — nunca `umami.track()` diretamente. |
| RNF-ANA-03 | Eventos rastreados devem ser auditáveis: arquivo `/utils/analytics.ts` lista e documenta cada evento.                                                                  |

### VIII.2- Catálogo de Eventos

#### VIII.2.1- Onboarding

| Evento                            | Quando disparar                                  | Propriedades                                                         |
| --------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `onboarding_iniciado`             | Usuário acessa `/onboarding/1` pela primeira vez | `{ versao_schema: number }`                                          |
| `onboarding_passo_concluido`      | Usuário avança de um passo                       | `{ passo: number, tempo_segundos: number }`                          |
| `onboarding_marca_selecionada`    | P1 concluído                                     | `{ marca: string }`                                                  |
| `onboarding_modelo_selecionado`   | P2 concluído                                     | `{ marca: string, modelo: string }`                                  |
| `onboarding_situacao_selecionada` | P6 concluído                                     | `{ situacao: 'quitada' \| 'financiada' \| 'alugada' }`               |
| `onboarding_concluido`            | Usuário clica "Concluir Configuração"            | `{ modelo: string, situacao: string, tempo_total_segundos: number }` |
| `onboarding_abandonado`           | Usuário fecha o app com onboarding incompleto    | `{ ultimo_passo: number }`                                           |

#### VIII.2.2- Estimativa

| Evento                           | Quando disparar                              | Propriedades                                  |
| -------------------------------- | -------------------------------------------- | --------------------------------------------- |
| `estimativa_km_alterado`         | Usuário edita km/dia no painel               | `{ novo_valor: number }`                      |
| `estimativa_dias_alterado`       | Usuário edita dias/semana                    | `{ novo_valor: number }`                      |
| `estimativa_modo_alterado`       | Toggle PREDEFINIDOS/PERSONALIZADO clicado    | `{ modo: 'predefinidos' \| 'personalizado' }` |
| `estimativa_oficina_alterada`    | Toggle AUTORIZADAS/INDEPENDENTES clicado     | `{ modo: 'autorizadas' \| 'independentes' }`  |
| `estimativa_detalhamento_aberto` | Usuário clica "Visualizar / Editar"          | —                                             |
| `estimativa_categoria_toggle`    | Toggle de categoria no detalhamento alterado | `{ categoria: string, ativo: boolean }`       |
| `estimativa_gasto_adicionado`    | Usuário adiciona gasto personalizado         | `{ valor_mensal: number }`                    |

#### VIII.2.3- Registros

| Evento                     | Quando disparar                                   | Propriedades                                                                               |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `registro_salvo`           | Qualquer formulário de registro salvo com sucesso | `{ tipo: 'rodagem' \| 'abastecimento' \| 'oleo' \| 'pneu' \| 'revisao' \| 'kit_relacao' }` |
| `registro_excluido`        | Usuário exclui um registro                        | `{ tipo: string }`                                                                         |
| `registro_foto_adicionada` | Usuário anexa foto (odômetro/bomba)               | `{ tipo_foto: 'odometro' \| 'bomba' }`                                                     |

#### VIII.2.4- Configuração

| Evento              | Quando disparar                                        | Propriedades                           |
| ------------------- | ------------------------------------------------------ | -------------------------------------- |
| `override_salvo`    | Usuário edita um valor na aba VIDA ÚTIL ou MÃO DE OBRA | `{ campo: string }`                    |
| `override_resetado` | Usuário clica ↺ em um campo                            | `{ campo: string }`                    |
| `perfil_exportado`  | Usuário clica "Exportar Backup"                        | `{ schema_version: number }`           |
| `perfil_importado`  | Usuário importa um arquivo com sucesso                 | `{ schema_version_importado: number }` |
| `perfil_resetado`   | Usuário confirma "Apagar Tudo"                         | —                                      |
| `fipe_consultada`   | Consulta BrasilAPI com sucesso                         | `{ modelo: string, ano: number }`      |
| `fipe_offline`      | Consulta BrasilAPI falhou (offline)                    | `{ usou_cache: boolean }`              |

#### VIII.2.5- Engajamento

| Evento           | Quando disparar                    | Propriedades                                      |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| `pwa_instalado`  | Evento `appinstalled` do navegador | `{ plataforma: 'android' \| 'ios' \| 'desktop' }` |
| `app_atualizado` | Service Worker ativa nova versão   | `{ versao: string }`                              |

---

## IX- PWA e Distribuição na Play Store

### IX.1- Requisitos PWA

| ID         | Descrição                                                                                                                                                   | Critério                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| RNF-PWA-01 | `manifest.json` válido com: `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, ícones 192px e 512px (maskable). | Lighthouse PWA Score ≥ 90.                        |
| RNF-PWA-02 | Service Worker registrado via `vite-plugin-pwa` com estratégia `CacheFirst` para assets estáticos e `NetworkFirst` para chamadas à BrasilAPI.               | App funcional offline após primeiro carregamento. |
| RNF-PWA-03 | App servido obrigatoriamente via HTTPS.                                                                                                                     | Netlify/Vercel fornecem HTTPS automaticamente.    |
| RNF-PWA-04 | Evento `beforeinstallprompt` capturado para exibir banner "Instalar MotoCalc" na primeira visita.                                                           | Banner surge após 2ª visita ou 30s de uso.        |
| RNF-PWA-05 | App funcional após instalação na tela inicial do Android (standalone, sem barra do browser).                                                                | Testado em Android 10+ com Chrome.                |

### IX.2- Distribuição via Google Play Store (TWA)

A distribuição na Play Store usa **Trusted Web Activity (TWA)** via `bubblewrap` da Google.

| ID         | Descrição                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-TWA-01 | Criar projeto TWA com `npx @bubblewrap/cli init --manifest https://motocalc.com.br/manifest.json`.                                                         |
| RNF-TWA-02 | Configurar `assetlinks.json` em `/.well-known/assetlinks.json` com o fingerprint SHA-256 do keystore da Play Store. Isso vincula o domínio ao app na Play. |
| RNF-TWA-03 | Publicar `.aab` (Android App Bundle) via Google Play Console. Conta de desenvolvedor: ~US$ 25 (pagamento único).                                           |
| RNF-TWA-04 | Política de Privacidade publicada em URL pública (ex: `/privacidade`). Obrigatória pela Play Store.                                                        |
| RNF-TWA-05 | `versionCode` e `versionName` no `build.gradle` do TWA devem ser incrementados a cada atualização submetida à Play.                                        |
| RNF-TWA-06 | Lighthouse PWA Score ≥ 90 e `start_url` respondendo com 200 são pré-requisitos para TWA funcionar corretamente.                                            |

**Comandos de referência:**

```bash
# Instalar Bubblewrap
npm install -g @bubblewrap/cli

# Inicializar projeto TWA (rodar após deploy do PWA)
bubblewrap init --manifest https://SEU_DOMINIO/manifest.json

# Gerar APK/AAB para publicação
bubblewrap build
```

### IX.3- Calendário de Manutenção de Dados

| Dado                        | Frequência de Atualização                              |
| --------------------------- | ------------------------------------------------------ |
| Licenciamento DETRAN-RJ     | Anual (janeiro) — atualizar `dados_rj.json`            |
| Alíquota IPVA RJ            | Anual (janeiro) — atualizar `dados_rj.json`            |
| Preço gasolina padrão (ANP) | Mensal — atualizar `dados_rj.json`                     |
| Preços de peças nos presets | Semestral (abril/outubro) — atualizar `presets/*.json` |
| Tabela revisões autorizadas | Anual — atualizar `presets/*.json`                     |
| FIPE                        | Automático via BrasilAPI (runtime)                     |
| `versionName` no app        | A cada release                                         |

---

## X- Arquitetura Login-Ready

O app não terá login em V1, mas deve ser preparado para adicioná-lo em V2 sem refatoração significativa. A preparação consiste em:

| ID        | Descrição                                                                                                                                                                  | Implementação                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| RNF-LR-01 | **Hook `usePerfil` como único ponto de acesso a dados do usuário.** Nenhum componente acessa `localStorage` diretamente.                                                   | `grep -r "localStorage" src/` deve retornar zero resultados fora de `/hooks/usePerfil.ts`.                            |
| RNF-LR-02 | **Schema do perfil inclui campo `userId: string \| null`.** Em V1, `userId = null`. Em V2, recebe UUID do backend.                                                         | Não afeta nenhuma lógica de cálculo.                                                                                  |
| RNF-LR-03 | **Separar lógica de armazenamento da lógica de estado.** O `useReducer` gerencia o estado em memória; o `usePerfil` decide onde persistir (localStorage em V1, API em V2). | Interface `IPerfilStorage` com métodos `load()`, `save()`, `clear()`. `LocalStoragePerfilStorage` implementa para V1. |
| RNF-LR-04 | **Rotas protegidas preparadas.** Implementar `<RotaProtegida>` que em V1 redireciona para onboarding se não há perfil, e em V2 redireciona para login se não autenticado.  | Substitui apenas o interior do componente `<RotaProtegida>`.                                                          |
| RNF-LR-05 | **Export/import de perfil mantido mesmo com login.** Em V2, o export serve como backup portátil independente de conta.                                                     | `RF-EXP-01 a 03` permanecem em V2.                                                                                    |
| RNF-LR-06 | **`schemaVersion` no perfil garante migrações controladas.** Cada versão do app que muda o schema incrementa `schemaVersion` e inclui função de migração.                  | Arquivo `/utils/migrarPerfil.ts`.                                                                                     |

---

## XI- Stack Tecnológica

| Camada          | Tecnologia                                 | Versão               | Justificativa                                                                                                                                  |
| --------------- | ------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Linguagem       | **TypeScript**                             | 5+                   | `strict: true`. Tipos explícitos eliminam bugs silenciosos em cálculos financeiros.                                                            |
| UI              | **React**                                  | 18+                  | Reatividade para recalcular em tempo real (RF-EST-07). Hooks para estado complexo.                                                             |
| Estilização     | **Tailwind CSS**                           | 3+                   | Mobile-first rápido. Custom colors para o tema escuro (#0D1321, #0078FF).                                                                      |
| Build + PWA     | **Vite** + `vite-plugin-pwa`               | latest               | Service Worker automático. Build leve (< 500 KB meta). HMR instantâneo em dev.                                                                 |
| Roteamento      | **React Router DOM**                       | 6+                   | Navegação SPA com `<Routes>` + `<Navigate>`. Suporte a rotas `/estimativa`, `/registros`, `/mao-de-obra`, `/vida-util`, `/perfil`, `/ajustes`. |
| Estado Global   | **`useReducer` + Context API**             | —                    | `useReducer` para o perfil complexo (evita prop drilling). Context distribui `perfil` e `dispatch`.                                            |
| Persistência    | **localStorage via `usePerfil.ts`**        | —                    | Sem backend em V1. Hook abstrai o storage (RNF-LR-01).                                                                                         |
| Dados Estáticos | **JSON** em `/src/presets/` e `/src/data/` | —                    | Separação total dados/lógica. Novo modelo = novo JSON (RNF-10).                                                                                |
| Cálculos        | **Funções puras** em `/utils/calculos.ts`  | —                    | Testável independentemente da UI (RNF-11). Nenhum efeito colateral.                                                                            |
| Gráfico         | **Recharts**                               | 2+                   | Donut chart via `<PieChart>/<Pie>/<Cell>`. Componentes React declarativos. ~120 KB.                                                            |
| IDs Únicos      | **nanoid**                                 | 3+                   | Geração de IDs para registros. Leve e criptograficamente seguro.                                                                               |
| Datas           | **date-fns**                               | 3+                   | Formatação e cálculo de datas. Tree-shakeable (zero overhead).                                                                                 |
| API FIPE        | **BrasilAPI**                              | —                    | `GET https://brasilapi.com.br/api/fipe/motos/v1/{codigo}`. Gratuita, sem chave. Consultada uma vez no onboarding e cacheada.                   |
| Analytics       | **Umami**                                  | cloud ou self-hosted | Sem cookies, sem dados pessoais, compatível LGPD (RNF-ANA-01).                                                                                 |
| Testes          | **Vitest**                                 | latest               | Testes unitários das funções de `calculos.ts`.                                                                                                 |
| Linting         | **ESLint** + `@typescript-eslint`          | latest               | Regras TypeScript estritas.                                                                                                                    |

---

## XII- Estrutura de Dados (TypeScript)

### XII.1- Interfaces Principais (`/src/types/index.ts`)

```typescript
// ─── Enums ───────────────────────────────────────────────────────────────────

export type SituacaoMoto = 'quitada' | 'financiada' | 'alugada';
export type PerfilPecas = 'original' | 'paralela';
export type ModoRevisao = 'autorizadas' | 'independentes';
export type ModoExibicao = 'predefinidos' | 'personalizado';
export type TipoCombustivel = 'comum' | 'aditivada' | 'etanol';
export type FatorResponsabilidade = 'eu' | 'locador' | 'dividimos';
export type PerfilUso = 'entrega' | 'passageiro';

// ─── Perfil do Usuário ────────────────────────────────────────────────────────

export interface PerfilUsuario {
  schemaVersion: 5;
  userId: string | null; // null em V1; UUID em V2 (login-ready)
  onboardingConcluido: boolean;
  apelido: string | null;
  aplicativos: string[];

  moto: MotoConfig;
  perfilManutencao: ManutencaoConfig;
  trabalho: TrabalhoConfig;
  financeiro: FinanceiroConfig;
  configuracaoDisplay: DisplayConfig;
  pecasOverrides: PecaOverride[];
  servicosMaoDeObra: ServicosMaoDeObra;
  revisaoAutorizadaOverrides: RevisaoOverride[];
  fipeCache: FipeCache | null;
  historicoManutencao: HistoricoManutencao;
  diarioTrabalho: DiarioEntry[];
}

export interface MotoConfig {
  marca: string;
  modelo: string; // ex: 'pop110i', 'cg_titan160'
  ano: number;
  perfilUso: PerfilUso;
  kmAtual: number;
  kmUltimaRevisao: number | null;
}

export interface ManutencaoConfig {
  perfilPecasGlobal: PerfilPecas;
  modoRevisao: ModoRevisao;
  precoMaoDeObraIndependente: number; // padrão: 150
  frequenciaRevisaoKm: number; // padrão: 6000
}

export interface TrabalhoConfig {
  kmPorDia: number;
  diasPorSemana: number; // 1–7
  horasPorDia: number; // padrão: 8
}

export interface CombustivelConfig {
  preco: number;
  autonomia: number; // km/L
}

export interface SeguroConfig {
  tem: boolean;
  valorAnual: number;
  empresa: string | null;
  periodicidade: 'anual' | 'mensal';
}

export interface ResponsabilidadeAluguel {
  documentos: FatorResponsabilidade;
  manutencao: FatorResponsabilidade;
  seguro: FatorResponsabilidade;
}

export interface GastoCustom {
  id: string;
  nome: string;
  valorMensal: number;
  ativo: boolean;
}

export interface FinanceiroConfig {
  tipoGasolinaPreferida: TipoCombustivel;
  combustiveis: Record<TipoCombustivel, CombustivelConfig>;
  internet: number;
  seguro: SeguroConfig;
  situacaoMoto: SituacaoMoto;
  parcelaMensal: number | null;
  parcelasRestantes: number | null;
  aluguelMensal: number | null;
  aluguelPeriodicidade: 'mensal' | 'semanal' | null;
  alimentacaoDia: number;
  gastosCustom: GastoCustom[];
  responsabilidadeAluguel: ResponsabilidadeAluguel;
}

export interface CategoriaDisplay {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;
  documentacao: boolean;
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
}

export interface DisplayConfig {
  modoExibicao: ModoExibicao;
  modoOficinDisplay: ModoRevisao;
  categoriasAtivas: CategoriaDisplay;
}

export interface PecaOverride {
  id: string;
  precoEditado: number | null;
  intervaloKmEditado: number | null;
  perfilPecasOverride: PerfilPecas | null;
}

export interface ServicosMaoDeObra {
  trocaOleo: number;
  trocaKitTransmissao: number;
  trocaPneu: number;
  revisaoGeral: number;
  avulso: number;
}

export interface RevisaoOverride {
  intervaloKm: number;
  precoEditado: number;
}

export interface FipeCache {
  valor: number;
  dataConsulta: string; // ISO 8601: 'YYYY-MM-DD'
  codigoFipe: string;
}

// ─── Histórico e Diário ───────────────────────────────────────────────────────

export interface TrocaOleo {
  id: string;
  data: string;
  km: number;
  valorTotal: number;
  tipoOleo?: string;
  marca?: string;
}

export interface RevisaoGeral {
  id: string;
  data: string;
  km: number;
  local: 'autorizada' | 'independente';
  qualRevisao: string;
  status: 'concluido' | 'em_dia' | 'proximo';
  itensTrocados: string[];
  valorMaoDeObra: number;
  valorPecas: number;
  valorTotal: number;
}

export interface TrocaPneu {
  id: string;
  data: string;
  km: number;
  posicao: 'dianteiro' | 'traseiro';
  marca: string;
  valorTotal: number;
}

export interface TrocaKitRelacao {
  id: string;
  data: string;
  km: number;
  marca: string;
  valorTotal: number;
  valorPecas: number;
  valorMaoDeObra: number;
}

export interface Abastecimento {
  id: string;
  data: string;
  tipo: TipoCombustivel;
  posto: string;
  km: number;
  litros: number;
  precoLitro: number;
  valorTotal: number;
}

export interface HistoricoManutencao {
  trocasOleo: TrocaOleo[];
  revisoes: RevisaoGeral[];
  trocasPneu: TrocaPneu[];
  trocasKitRelacao: TrocaKitRelacao[];
  abastecimentos: Abastecimento[];
}

export interface DiarioEntry {
  id: string;
  data: string;
  kmInicial: number;
  kmFinal: number;
  kmPercorridos: number;
  comeu: boolean;
  abasteceu: boolean;
  litros: number | null;
  precoLitro: number | null;
}

// ─── Preset ──────────────────────────────────────────────────────────────────

export interface PecaPreset {
  id: string;
  nome: string;
  intervaloKm: number;
  intervaloKmEntrega: number; // intervalo real para motoboy (< manual)
  intervaloMeses: number;
  precoOriginal: number;
  precoParalela: number;
  anoFimOriginal?: number; // se original descontinuada
}

export interface PneuPreset {
  id: string;
  posicao: 'dianteiro' | 'traseiro';
  vidaUtilKm: number;
  precoOriginal: number;
  precoParalela: number;
}

export interface RevisaoPreset {
  intervaloKm: number;
  intervaloMeses: number;
  precoTotal: number;
}

export interface MotoPreset {
  marca: string;
  modelo: string;
  nomeCurto: string;
  consumoKmL: number;
  consumoKmLComBau: number;
  codigoFipe: string;
  pecas: PecaPreset[];
  pneus: PneuPreset[];
  revisaoAutorizada: RevisaoPreset[];
}

// ─── Resultado dos Cálculos ───────────────────────────────────────────────────

export interface Granularidades {
  anual: number;
  mensal: number;
  semanal: number;
  diario: number;
  horario: number;
  porKm: number;
}

export interface DistribuicaoCustos {
  combustivel: number;
  alimentacao: number;
  manutencao: number;
  documentacao: number;
  internet: number;
  seguro: number;
  financiamento: number;
  gastosCustom: number;
  total: number;
}

export interface AlertaManutencao {
  pecaId: string;
  pecaNome: string;
  kmRestante: number;
  diasEstimados: number;
}
```

---

### XII.2- Schema do Arquivo de Export

```typescript
export interface ExportFile {
  schemaVersion: 5;
  exportadoEm: string; // ISO 8601
  app: 'MotoCalc RJ';
  aviso: 'Este arquivo contém dados pessoais. Não compartilhe.';
  perfil: PerfilUsuario;
}
```

### XII.3- Resolução de Override (algoritmo central)

```typescript
// /src/utils/resolverOverride.ts

export function resolverValorCampo(
  id: string,
  campo: 'preco' | 'intervaloKm',
  modoExibicao: ModoExibicao,
  overrides: PecaOverride[],
  preset: MotoPreset,
): number {
  if (modoExibicao === 'predefinidos') {
    return getPecaPreset(preset, id)[campo === 'preco' ? 'precoOriginal' : 'intervaloKm'];
  }
  const override = overrides.find((o) => o.id === id);
  const valorOverride = campo === 'preco' ? override?.precoEditado : override?.intervaloKmEditado;
  if (override && valorOverride !== null && valorOverride !== undefined) {
    return valorOverride;
  }
  return getPecaPreset(preset, id)[campo === 'preco' ? 'precoOriginal' : 'intervaloKm'];
}

export function resolverPerfilPeca(
  id: string,
  perfilGlobal: PerfilPecas,
  overrides: PecaOverride[],
  preset: MotoPreset,
  anoMoto: number,
): PerfilPecas {
  const peca = getPecaPreset(preset, id);
  if (peca.anoFimOriginal && anoMoto > peca.anoFimOriginal) return 'paralela';
  const override = overrides.find((o) => o.id === id);
  return override?.perfilPecasOverride ?? perfilGlobal;
}
```

---

## XIII- Funções de Cálculo (`/src/utils/calculos.ts`)

```typescript
// Rodagem
calcularKmMensal(kmDia: number, diasSemana: number): number
calcularKmAnual(kmDia: number, diasSemana: number): number
calcularDiasAno(diasSemana: number): number

// Consumo
calcularConsumoEfetivo(preset: MotoPreset, perfilUso: PerfilUso): number

// CPK por peça
calcularIntervaloEfetivo(intervaloKm: number, intervaloMeses: number, kmMensal: number): number
calcularCpkPeca(precoPeca: number, intervaloEfetivo: number): number
calcularCpkTotal(pecas: Array<{ cpk: number }>): number

// Custos anuais por categoria
calcularCustoCombustivelAnual(preco: number, autonomia: number, kmAnual: number): number
calcularCustoManutencaoAnual(cpkTotal: number, kmAnual: number): number
calcularCustoRevisaoAnualAutorizado(revisoes: RevisaoPreset[], kmAnual: number): number
calcularCustoRevisaoAnualIndependente(precoMO: number, freqKm: number, kmAnual: number): number
calcularCustoDocumentosAnual(fipe: number, aliquota: number, idadeMoto: number, licenciamento: number, fator: number): number
calcularCustoInternetAnual(mensal: number): number
calcularCustoSeguroAnual(valorAnual: number, tem: boolean, fator: number): number
calcularCustoFinanciamentoAnual(parcela: number | null, situacao: SituacaoMoto): number
calcularCustoAluguelAnual(aluguel: number | null, situacao: SituacaoMoto, periodicidade: 'mensal' | 'semanal' | null): number
calcularCustoAlimentacaoAnual(alimentacaoDia: number, diasAno: number): number
calcularCustoGastosCustomAnual(gastos: GastoCustom[]): number

// Total e granularidades
calcularDistribuicaoCustos(config: DistribuicaoInput): DistribuicaoCustos
calcularGranularidades(custoAnual: number, diasAno: number, horasDia: number, kmAnual: number): Granularidades

// IPVA
calcularIPVA(valorFipe: number, aliquota: number, idadeMoto: number): number

// Alertas
calcularProximaManutencao(kmAtual: number, kmUltimaTroca: number, intervaloKm: number, kmDia: number, diasSemana: number): AlertaManutencao

// Médias reais (baseadas em histórico)
calcularMediaKmDiaReal(registros: DiarioEntry[]): number | null      // null se < 5 registros
calcularConsumoRealKmL(abastecimentos: Abastecimento[]): number | null // null se < 3 registros
calcularIntervaloMedioReal(registros: Array<{ km: number }>): number | null // null se < 2 registros
```

---

## XIV- Estrutura de Pastas

```
motocalc/
├── public/
│   ├── manifest.json
│   ├── robots.txt
│   └── icons/
│       ├── icon-192.png
│       ├── icon-192-maskable.png
│       └── icon-512.png
│
├── src/
│   ├── types/
│   │   └── index.ts                     → todas as interfaces TypeScript
│   │
│   ├── presets/                         → JSONs imutáveis por modelo
│   │   └── pop110i.json
│   │
│   ├── data/
│   │   └── dados_rj.json                → constantes RJ (IPVA, licenciamento, gasolina padrão)
│   │
│   ├── utils/
│   │   ├── calculos.ts                  → funções puras (RNF-11)
│   │   ├── resolverOverride.ts          → lógica PREDEFINIDOS vs PERSONALIZADO
│   │   ├── migrarPerfil.ts              → migrações de schema (RNF-LR-06)
│   │   ├── analytics.ts                 → trackEvent() centralizado (RNF-ANA-02)
│   │   └── calculos.test.ts             → testes Vitest
│   │
│   ├── hooks/
│   │   ├── usePerfil.ts                 → único ponto de acesso ao storage (RNF-LR-01)
│   │   └── useCustos.ts                 → useMemo dos cálculos derivados
│   │
│   ├── context/
│   │   └── PerfilContext.tsx            → Context + Provider + useReducer
│   │
│   ├── components/
│   │   ├── ui/                          → componentes genéricos reutilizáveis
│   │   │   ├── Toggle.tsx
│   │   │   ├── SegmentedControl.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── InputNumerico.tsx
│   │   │   ├── InputMonetario.tsx
│   │   │   ├── BotaoReset.tsx           → botão ↺ (RN-02/03)
│   │   │   ├── InfoCard.tsx             → card informativo (azul/laranja/vermelho)
│   │   │   ├── HeroRegistro.tsx         → hero image + badge "NOVO REGISTRO"
│   │   │   └── UploadFoto.tsx           → área dashed de evidência fotográfica
│   │   │
│   │   ├── layout/
│   │   │   ├── Cabecalho.tsx            → header global
│   │   │   └── BottomNav.tsx            → 4 abas de navegação
│   │   │
│   │   ├── onboarding/
│   │   │   ├── OnboardingFlow.tsx
│   │   │   ├── ProgressoOnboarding.tsx
│   │   │   ├── PassoMarca.tsx           → P1
│   │   │   ├── PassoModelo.tsx          → P2
│   │   │   ├── PassoAno.tsx             → P3
│   │   │   ├── PassoPerfilUso.tsx       → P4
│   │   │   ├── PassoQuilometragem.tsx   → P5
│   │   │   ├── PassoSituacao.tsx        → P6 (branch)
│   │   │   ├── PassoFinanciamento.tsx   → P6b
│   │   │   ├── PassoAluguel.tsx         → P6c
│   │   │   ├── PassoResponsabilidade.tsx → P6d (fluxo aluguel)
│   │   │   ├── PassoSeguro.tsx          → P7
│   │   │   ├── PassoInternet.tsx        → P8
│   │   │   ├── PassoAlimentacao.tsx     → P9
│   │   │   └── TelaConfirmacao.tsx      → revisão final
│   │   │
│   │   ├── estimativa/
│   │   │   ├── PainelEstimativa.tsx     → aba ESTIMATIVA
│   │   │   ├── AlertaManutencao.tsx
│   │   │   ├── ToggleModo.tsx
│   │   │   ├── ToggleOficina.tsx
│   │   │   ├── ConfiguracaoRodagem.tsx
│   │   │   ├── CardCustoKm.tsx
│   │   │   ├── CardPeriodo.tsx
│   │   │   ├── GraficoDistribuicao.tsx  → donut chart (Recharts)
│   │   │   └── detalhamento/
│   │   │       ├── DetalhamentoCustos.tsx
│   │   │       └── CardCategoria.tsx
│   │   │
│   │   ├── registros/
│   │   │   ├── Registros.tsx            → aba REGISTROS com sub-abas
│   │   │   ├── SubAbaGeral.tsx
│   │   │   ├── SubAbaRodagem.tsx
│   │   │   ├── SubAbaCombustivel.tsx
│   │   │   ├── SubAbaManutencao.tsx
│   │   │   └── formularios/
│   │   │       ├── FormRodagem.tsx
│   │   │       ├── FormAbastecimento.tsx
│   │   │       ├── FormOleo.tsx
│   │   │       ├── FormPneu.tsx
│   │   │       ├── FormRevisao.tsx
│   │   │       └── FormKitRelacao.tsx
│   │   │
│   │   ├── maoDeObra/
│   │   │   ├── MaoDeObra.tsx            → aba MÃO DE OBRA
│   │   │   ├── SecaoMaoDeObraParalela.tsx
│   │   │   └── SecaoRevisaoAutorizada.tsx
│   │   │
│   │   ├── vidaUtil/
│   │   │   ├── VidaUtil.tsx             → aba VIDA ÚTIL
│   │   │   ├── SecaoCombustivel.tsx
│   │   │   ├── SecaoPecas.tsx
│   │   │   └── SecaoPneus.tsx
│   │   │
│   │   └── perfil/
│   │       ├── Perfil.tsx
│   │       ├── AjustesPredefinicao.tsx
│   │       └── SecaoExportImport.tsx
│   │
│   ├── App.tsx                          → Router + PerfilProvider + RotaProtegida
│   └── main.tsx                         → entry point + registro Service Worker
│
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json                        → strict: true
└── package.json
```

---

## XV- Priorização MoSCoW

| Prioridade                | Requisitos                                                                                                                                                                              | Justificativa                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Must Have (V1)**        | RF-ON-01 a 07, RF-EST-01 a 10, RF-DET-01 a 11, RF-MO-01 a 05, RF-VU-01 a 05, RF-DOC-01 a 03, RF-CONF-01 a 02, RF-PERF-01 a 04, RN-01 a 26, RNF-01 a 12, RNF-LR-01 a 06, RNF-PWA-01 a 05 | Núcleo funcional. Sistema de overrides (RN-01 a 05) é arquitetural — deve estar desde o início. |
| **Should Have (V1)**      | RF-REG-01 a 12, RF-FORM-01 a 06, RF-EXP-01 a 03, RNF-ANA-01 a 03 + catálogo de eventos, RNF-TWA-01 a 06 (Play Store)                                                                    | Registros transformam o app de calculadora em ferramenta viva. Play Store expande alcance.      |
| **Could Have (V1 ou V2)** | Diário de trabalho integrado (cálculo de consumo real), Modo comparativo (duas motos lado a lado), Alertas push via Web Push API                                                        | Melhora a precisão dos cálculos ao longo do tempo. Adicionar sem refatoração do núcleo.         |
| **Won't Have (V1)**       | Login, sincronização entre dispositivos, backend, API de preços em tempo real, comparativo de plataformas, iOS App Store                                                                | Complexidade excessiva. `RNF-LR-01 a 06` e `RF-EXP-01 a 03` preparam V2.                        |

---

## XVI- Fases de Implementação

```
──────────────────────────────────────────────────────────────────
Fase 0 — Dados ✅ CONCLUÍDA
  ✅ pop110i.json com preços original + paralela
  ✅ Valores fixos RJ: licenciamento R$206, gasolina R$6,61, IPVA 2%
  ✅ Estratégia FIPE via BrasilAPI decidida
  [ ] Adicionar seção `revisaoAutorizada` no pop110i.json
  [ ] Criar src/data/dados_rj.json

──────────────────────────────────────────────────────────────────
Fase 1 — Setup do Projeto
  npm create vite@latest motocalc -- --template react-ts
  npm install tailwindcss @tailwindcss/vite react-router-dom recharts nanoid date-fns vite-plugin-pwa workbox-window
  npm install -D vitest @vitest/ui typescript @typescript-eslint/eslint-plugin
  Configurar tailwind.config.ts + vite.config.ts + tsconfig.json (strict: true)
  Criar estrutura de pastas conforme Seção XIII
  Criar src/types/index.ts com todas as interfaces

──────────────────────────────────────────────────────────────────
Fase 2 — Lógica Pura (sem UI)
  Implementar calculos.ts com todas as funções da Seção XII
  Implementar resolverOverride.ts
  Implementar migrarPerfil.ts (schema v5)
  Implementar analytics.ts com catálogo de eventos (Seção VII)
  Escrever testes unitários em calculos.test.ts:
    - calcularKmAnual, calcularCpkPeca
    - calcularIntervaloEfetivo (gatilho duplo — RN-16/17)
    - calcularIPVA (inclusive isenção 15 anos — RF-DOC-01)
    - calcularGranularidades
    - resolverValorCampo (PREDEFINIDOS vs PERSONALIZADO — RN-04/05)
    - calcularProximaManutencao (RN-18/19)
  Rodar Vitest e validar 100% passando

──────────────────────────────────────────────────────────────────
Fase 3 — Persistência e Estado
  Implementar PerfilContext.tsx (Context + Provider + useReducer)
  Implementar usePerfil.ts com interface IPerfilStorage (RNF-LR-03)
  Implementar LocalStoragePerfilStorage
  Implementar useCustos.ts com useMemo para todos os cálculos derivados
  Testar: mudar km/dia → verificar recálculo em < 200ms

──────────────────────────────────────────────────────────────────
Fase 4 — Layout Base e Navegação
  App.tsx com React Router (rotas da Seção II.2)
  RotaProtegida.tsx (RNF-LR-04)
  Cabecalho.tsx
  BottomNav.tsx (4 abas — estados ativo/inativo exatos do Figma)
  Páginas placeholder confirmando navegação funcional

──────────────────────────────────────────────────────────────────
Fase 5 — Onboarding
  OnboardingFlow.tsx + ProgressoOnboarding.tsx
  PassoMarca.tsx → PassoModelo.tsx → PassoAno.tsx (com chamada BrasilAPI)
  PassoPerfilUso.tsx → PassoQuilometragem.tsx
  PassoSituacao.tsx (branch P6 → P6b/P6c/P6d)
  PassoSeguro.tsx → PassoInternet.tsx → PassoAlimentacao.tsx
  TelaConfirmacao.tsx (revisão final com edição por seção)
  Testar onboarding completo + persistência no localStorage
  Testar fluxo Aluguel (P6c + P6d extra)

──────────────────────────────────────────────────────────────────
Fase 6 — Aba ESTIMATIVA
  PainelEstimativa.tsx com todos os cards
  AlertaManutencao.tsx (card vermelho — RN-18/19)
  ToggleModo.tsx + ToggleOficina.tsx
  ConfiguracaoRodagem.tsx (input + stepper inline)
  CardCustoKm.tsx + CardPeriodo.tsx
  GraficoDistribuicao.tsx (Recharts donut)
  DetalhamentoCustos.tsx + CardCategoria.tsx com toggles

──────────────────────────────────────────────────────────────────
Fase 7 — Aba MÃO DE OBRA
  MaoDeObra.tsx com aviso informativo
  SecaoMaoDeObraParalela.tsx (5 serviços + reset)
  SecaoRevisaoAutorizada.tsx (tabela + reset por linha)

──────────────────────────────────────────────────────────────────
Fase 8 — Aba VIDA ÚTIL
  VidaUtil.tsx (estrutura 3 seções)
  SecaoCombustivel.tsx (comum + aditivada + etanol)
  SecaoPecas.tsx (toggle ORG/PAR + preço + vida útil + reset)
  SecaoPneus.tsx (dianteiro + traseiro)

──────────────────────────────────────────────────────────────────
Fase 9 — Aba REGISTROS
  Registros.tsx com 4 sub-abas
  SubAbaGeral.tsx com todas as seções
  SubAbaRodagem.tsx + SubAbaCombustivel.tsx + SubAbaManutencao.tsx
  FormRodagem.tsx + FormAbastecimento.tsx + FormOleo.tsx
  FormPneu.tsx + FormRevisao.tsx + FormKitRelacao.tsx
  Lógica de intervalo médio real (RF-REG-11)
  Editar/excluir registros (RF-REG-12)

──────────────────────────────────────────────────────────────────
Fase 10 — Perfil e Configurações
  Perfil.tsx (predefinição + ações + export/import + configurações)
  AjustesPredefinicao.tsx (5 seções com reset individual)
  SecaoExportImport.tsx (JSON export + import + redefinir perfil)

──────────────────────────────────────────────────────────────────
Fase 11 — PWA
  manifest.json e ícones maskable (192px e 512px)
  Configurar vite-plugin-pwa (CacheFirst para assets, NetworkFirst para BrasilAPI)
  Banner "Instalar MotoCalc" (beforeinstallprompt — RNF-PWA-04)
  Testar instalação como PWA no Android
  Testar funcionamento offline completo

──────────────────────────────────────────────────────────────────
Fase 12 — Outros Modelos
  Criar presets/cg_titan160.json
  Criar presets/biz125.json
  Criar presets/factor150.json
  Criar presets/nxr_bros160.json

──────────────────────────────────────────────────────────────────
Fase 13 — Play Store (TWA)
  Deploy em produção (Netlify/Vercel) com HTTPS
  Publicar /.well-known/assetlinks.json
  bubblewrap init + bubblewrap build
  Publicar .aab no Google Play Console
  Publicar página /privacidade

──────────────────────────────────────────────────────────────────
VERIFICAÇÃO FINAL (antes do deploy/Play Store)
  [ ] Todos os testes Vitest passando (100%)
  [ ] Lighthouse PWA Score ≥ 90
  [ ] Lighthouse Accessibility ≥ 90 (contraste WCAG)
  [ ] Bundle < 500 KB gzipado
  [ ] Teste de onboarding com 3 usuários reais (meta: < 3 min)
  [ ] Teste offline: desligar rede → reabrir → verificar funcionamento completo
  [ ] grep "localStorage" src/ → zero resultados fora de usePerfil.ts
  [ ] grep "any" src/ → zero resultados (strict TypeScript)
  [ ] Verificar que NENHUM componente importa preset diretamente (só via hook/context)
  [ ] Verificar assetlinks.json respondendo corretamente (para TWA)
  [ ] Testar instalação via Play Store em dispositivo físico
```

---

_MotoCalc RJ — Documento de Requisitos v5.0 — Atividade Extensionista — ADS_
_Criado em: 05/05/2026 — Baseado na análise das telas do protótipo Figma + v4.0_
_Principais adições v5: TypeScript com interfaces completas · Play Store via TWA (Fase 13) · Catálogo completo de eventos Umami (Seção VII) · Arquitetura login-ready formalizada (Seção IX) · Nomes das abas reconciliados com o Figma (ESTIMATIVA · REGISTROS · MÃO DE OBRA · VIDA ÚTIL) · Formulários de registro detalhados campo a campo · Mapa completo de rotas · Interfaces TypeScript de todos os tipos_

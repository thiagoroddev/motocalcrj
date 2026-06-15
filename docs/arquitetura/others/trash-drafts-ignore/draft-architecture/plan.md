# MotoCalc RJ — Planejamento Pré-Código

> Modelo inicial de referência: **Honda Pop 110i 2024**
> Versão: 2.0 — atualizado em 03/05/2026 com base nas telas do protótipo

---

## I- O que já existe

| Artefato | Situação |
|---|---|
| `docs/Requisitos_MotoCalc_RJ_v4.md` | ✅ Completo — RF, RNF, RN, onboarding, regras de cálculo, stack, MoSCoW (versão atual) |
| `presets/pop110i.json` | ✅ Completo — estrutura + intervalos + preços original e paralela preenchidos (abr/2026) |
| `docs/rascunhos-regras-de-negocio/CRLV.md` | ✅ Lógica de licenciamento RJ documentada |
| `docs/rascunhos-regras-de-negocio/IPVA.md` | ✅ Lógica de cálculo + alíquota RJ (2%) documentada |
| `docs/rascunhos-regras-de-negocio/Gasolina.md` | ✅ Estratégia ANP documentada + valor confirmado (R$6,61 — semana 19–25 abr/2026) |
| `docs/rascunhos-regras-de-negocio/Manutenção manual.md` | ✅ Tabelas de manutenção rascunho (5 modelos) |
| `docs/rascunhos-regras-de-negocio/Custo peças.md` | ✅ Método CPK documentado |
| `docs/Arquitetura-de-Custos.md` | ✅ CPK total, mock data, classificação de componentes documentados |
| `docs/precos-pop-110i-2024/` | ✅ Pesquisa ML/Shopee concluída — preços original + paralela coletados |
| `docs/precos-pop-110i-2024/preco_revisoes_ronda.md` | ✅ Tabela de revisões Honda com preços reais (1k a 36k km) |
| `docs/Formulas_Calculos.md` | ✅ Todas as fórmulas documentadas |

---

## II- Decisões Resolvidas

| # | Decisão | Resolução |
|---|---|---|
| D1 | Valores FIPE: hardcoded ou API? | ✅ **BrasilAPI em runtime** — consultada uma vez no onboarding, cacheada no localStorage |
| D2 | Valor licenciamento DETRAN-RJ 2026 | ✅ **R$206** — confirmado |
| D3 | Preço padrão gasolina | ✅ **R$6,61** (ANP semana 19–25 abr/2026) — editável |
| D4 | Mão de obra padrão revisão independente | ✅ **R$150** — editável na aba SERVIÇOS |
| D5 | Começar apenas com Pop 110i? | ✅ **Sim** — outros modelos em Fase 8 |
| D6 | Preço por peça: único ou original + paralela? | ✅ **Dois preços** (`original` + `paralela`) — toggle por peça na aba PEÇAS |
| D7 | Edição de dados: modifica o preset ou cria cópia? | ✅ **Sempre cópias (overrides)** — preset é imutável. Reset por item apaga o override. |
| D8 | Modo de exibição: comparar preset vs personalizado? | ✅ **Toggle PADRÃO/PERSONALIZADO** no painel. PADRÃO usa preset puro, PERSONALIZADO usa overrides. |
| D9 | Navegação: abas inferiores ou menu lateral? | ✅ **Bottom navigation com 4 abas**: CUSTOS · REGISTROS · SERVIÇOS · PEÇAS |
| D10 | Gráfico de distribuição de custos: qual biblioteca? | ✅ **Recharts** — componentes React nativos, leve (~120 KB), API declarativa |
| D11 | Multi-combustível (comum, aditivada, etanol)? | ✅ **Suportado** — cada tipo tem preço e autonomia configuráveis na aba PEÇAS |
| D12 | Roteamento: hash ou history? | ✅ **React Router DOM v6** com rotas `/custos`, `/registros`, `/servicos`, `/pecas`, `/configuracoes` |

---

## III- O que falta antes de codar

### III.1- DADOS — Presets JSON dos outros 4 modelos *(bloqueante para V1 completa)*

| Modelo | Prioridade | Arquivo a criar |
|---|---|---|
| Honda CG Titan 160 | Alta | `src/presets/cg_titan160.json` |
| Honda Biz 125 | Alta | `src/presets/biz125.json` |
| Yamaha Factor 150 | Média | `src/presets/factor150.json` |
| Honda NXR Bros 160 | Média | `src/presets/nxr_bros160.json` |

> **Estratégia:** Iniciar a codificação com apenas a Pop 110i funcional. Os outros modelos são adicionados na Fase 8 sem alterar código.

### III.2- DADOS — `src/data/dados_rj.json` *(bloqueante parcial)*

```json
{
  "ipva": {
    "aliquota": 0.02,
    "isencaoIdadeAnos": 15
  },
  "licenciamento": {
    "2026": 206.00
  },
  "gasolinaComumPadrao": 6.61,
  "fonte": "ANP semana 19-25/abr/2026"
}
```

### III.3- DADOS — Tabela de revisões autorizadas no preset

O arquivo `pop110i.json` precisa conter a seção `revisaoAutorizada` com as linhas da tabela Honda (já disponível em `preco_revisoes_ronda.md`):

```json
"revisaoAutorizada": [
  { "intervaloKm": 1000,  "intervaloMeses": 3,  "precoTotal": 82.98  },
  { "intervaloKm": 6000,  "intervaloMeses": 12, "precoTotal": 248.06 },
  { "intervaloKm": 12000, "intervaloMeses": 15, "precoTotal": 562.89 }
]
```

---

## IV- Estrutura de Pastas

```
motocalc/
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── src/
│   ├── presets/                      → JSONs imutáveis por modelo
│   │   └── pop110i.json
│   │
│   ├── data/
│   │   └── dados_rj.json             → constantes do RJ (IPVA, licenciamento, gasolina padrão)
│   │
│   ├── utils/
│   │   ├── calculos.js               → funções puras (RNF-11)
│   │   ├── resolverOverride.js       → lógica PADRÃO vs PERSONALIZADO (RN-01 a 05)
│   │   └── calculos.test.js          → testes Vitest
│   │
│   ├── hooks/
│   │   ├── usePerfil.js              → único ponto de acesso ao localStorage (RNF-12)
│   │   └── useCustos.js              → memo dos cálculos derivados do perfil
│   │
│   ├── components/
│   │   ├── ui/                       → componentes genéricos reutilizáveis
│   │   │   ├── Toggle.jsx
│   │   │   ├── Stepper.jsx
│   │   │   ├── InputNumerico.jsx
│   │   │   ├── BotaoReset.jsx
│   │   │   ├── AlertaCard.jsx
│   │   │   └── TooltipInfo.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Cabecalho.jsx         → header global com nome + moto + ícones
│   │   │   └── BottomNav.jsx         → 4 abas de navegação
│   │   │
│   │   ├── onboarding/
│   │   │   ├── OnboardingFlow.jsx    → gerencia etapas e navegação entre blocos
│   │   │   ├── BlocoMoto.jsx         → perguntas 01–04c (identificação + hodômetro)
│   │   │   ├── BlocoManutencao.jsx   → perguntas 04d–04f (perfil de manutenção)
│   │   │   ├── BlocoTrabalho.jsx     → perguntas 05–06 (km/dia, dias/semana)
│   │   │   ├── BlocoFinanceiro.jsx   → perguntas 07–13 (combustível, internet, seguro, situação, alimentação)
│   │   │   ├── BlocoPersonalizacao.jsx → perguntas 14–15 (apelido, apps)
│   │   │   └── TelaConfirmacao.jsx   → revisão final antes de salvar
│   │   │
│   │   ├── custos/
│   │   │   ├── PainelCustos.jsx      → aba CUSTOS: rodagem + cards de período
│   │   │   ├── ToggleModo.jsx        → PADRÃO / PERSONALIZADO
│   │   │   ├── ToggleOficina.jsx     → AUTORIZADAS / INDEPENDENTES
│   │   │   ├── ConfiguracaoRodagem.jsx → km/dia + dias/semana inline
│   │   │   ├── CardPeriodo.jsx       → card genérico (hora, dia, semana, mês, ano)
│   │   │   ├── AlertaManutencao.jsx  → card vermelho de alerta
│   │   │   └── detalhamento/
│   │   │       ├── Detalhamento.jsx  → tela de detalhamento de custos
│   │   │       ├── GraficoRosca.jsx  → donut chart (Recharts)
│   │   │       └── CardCategoria.jsx → card expansível por categoria
│   │   │
│   │   ├── registros/
│   │   │   ├── Registros.jsx         → aba REGISTROS com sub-abas
│   │   │   ├── SubAbaGeral.jsx
│   │   │   ├── SubAbaRodagem.jsx
│   │   │   ├── SubAbaCombustivel.jsx
│   │   │   ├── SubAbaManutencao.jsx
│   │   │   ├── CardRegistroCombustivel.jsx
│   │   │   ├── CardRegistroRevisao.jsx
│   │   │   └── TabelaRegistros.jsx   → tabela genérica (óleo, pneu, kit)
│   │   │
│   │   ├── servicos/
│   │   │   ├── Servicos.jsx          → aba SERVIÇOS
│   │   │   ├── SecaoMaoDeObra.jsx    → preços de mão de obra por tipo de serviço
│   │   │   └── SecaoRevisaoAutorizada.jsx → tabela de revisões do fabricante
│   │   │
│   │   ├── pecas/
│   │   │   ├── Pecas.jsx             → aba PEÇAS
│   │   │   ├── SecaoCombustivel.jsx  → comum + aditivada + etanol
│   │   │   ├── SecaoPecas.jsx        → lista de peças com toggle ORG/PAR
│   │   │   └── SecaoPneus.jsx        → dianteiro + traseiro
│   │   │
│   │   └── configuracoes/
│   │       ├── Configuracoes.jsx     → tela de configurações (via ícone no cabeçalho)
│   │       ├── SecaoPerfil.jsx       → editar dados do onboarding
│   │       ├── SecaoMotoAlugada.jsx  → responsabilidades por categoria
│   │       └── SecaoExportImport.jsx → export/import + redefinir perfil
│   │
│   ├── context/
│   │   └── PerfilContext.jsx         → Context + Provider que distribui o perfil e dispatch
│   │
│   ├── App.jsx                       → router + provider raiz
│   └── main.jsx                      → entry point
│
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## V- Mapeamento de Componentes × Requisitos

| Componente | Responsabilidade Principal | RFs Relacionados |
|---|---|---|
| `OnboardingFlow` | Gerencia etapas, validação e navegação do onboarding | RF-ON-01 a 05 |
| `BlocoMoto` | Marca, modelo, ano, baú, hodômetro | RF-ON-01 |
| `BlocoManutencao` | Perfil de peças, modo de revisão | RF-ON-02 |
| `BlocoTrabalho` | km/dia e dias/semana | RF-ON-02 |
| `BlocoFinanceiro` | Combustível, internet, seguro, situação moto, alimentação | RF-ON-03 |
| `TelaConfirmacao` | Resumo + edição antes de salvar | RF-ON-05 |
| `PainelCustos` | Cards de período + rodagem inline + alertas | RF-CUSTOS-01 a 08 |
| `ToggleModo` | PADRÃO / PERSONALIZADO | RF-CUSTOS-02, RN-04/05 |
| `ToggleOficina` | AUTORIZADAS / INDEPENDENTES | RF-CUSTOS-03 |
| `ConfiguracaoRodagem` | Input km/dia + stepper dias/semana | RF-CUSTOS-04 |
| `AlertaManutencao` | Card de alerta de manutenção próxima | RF-CUSTOS-01, RN-18/19 |
| `Detalhamento` | Tela de detalhamento com donut + categorias | RF-DET-01 a 12 |
| `GraficoRosca` | Donut chart via Recharts | RF-DET-01 |
| `CardCategoria` | Card expansível com toggle on/off | RF-DET-02, 03, RN-06 a 09 |
| `Registros` | Aba REGISTROS com 4 sub-abas | RF-REG-01 a 12 |
| `Servicos` | Aba SERVIÇOS com mão de obra e revisão autorizada | RF-SERV-01 a 05 |
| `SecaoMaoDeObra` | Preços editáveis por tipo de serviço | RF-SERV-02 |
| `SecaoRevisaoAutorizada` | Tabela de revisões agendadas editável | RF-SERV-03 |
| `Pecas` | Aba PEÇAS com combustíveis, peças e pneus | RF-PECAS-01 a 09 |
| `SecaoCombustivel` | Três tipos de combustível com preço e autonomia | RF-PECAS-01 a 03 |
| `SecaoPecas` | Lista de peças com toggle ORG/PAR e reset | RF-PECAS-04 a 07, RN-10 a 12 |
| `Configuracoes` | Edição pós-onboarding + export/import + reset perfil | RF-CONF-01 a 04, RF-EXP-01 a 03 |
| `BotaoReset` | Botão (↺) reutilizável que apaga override de um campo | RN-02, 03 |

---

## VI- Funções Puras (`/utils/calculos.js`)

```js
// Rodagem
calcularKmMensal(kmDia, diasSemana)
calcularKmAnual(kmDia, diasSemana)
calcularDiasAno(diasSemana)

// Consumo
calcularConsumoEfetivo(autonomiaPreset, temBau)

// CPK por peça
calcularIntervaloEfetivo(intervaloKm, intervaloMeses, kmMensal)     // gatilho duplo (RN-16/17)
calcularCpkPeca(precoPeca, intervaloEfetivo)
calcularCpkTotal(listaPecas)                                         // soma de todas as peças

// Custos anuais por categoria
calcularCustoCombustivelAnual(precoLitro, autonomia, kmAnual)
calcularCustoManutencaoAnual(cpkTotal, kmAnual)
calcularCustoRevisaoAnualDealer(tabelaRevisoes, kmAnual)
calcularCustoRevisaoAnualIndependente(precoMaoDeObra, frequenciaKm, kmAnual)
calcularCustoDocumentosAnual(valorFipe, aliquota, idadeMoto, licenciamento, fatorResp)
calcularCustoInternetAnual(precoMensal)
calcularCustoSeguroAnual(valorAnual, temSeguro, fatorResp)
calcularCustoFinanciamentoAnual(parcelaMensal, situacaoMoto)
calcularCustoAluguelAnual(aluguelMensal, situacaoMoto)
calcularCustoAlimentacaoAnual(alimentacaoDia, diasAno)
calcularCustoGastosCustomAnual(gastosCustom)

// Total e granularidades
calcularCustoMotoAnual(categoriasComFatores)
calcularCustoTotalAnual(custoMoto, custoAlimentacao)
calcularGranularidades(custoAnual, diasAno, horasDia, kmAnual)
  // retorna: { mensal, semanal, diario, horario, porKm }

// IPVA
calcularIPVA(valorFipe, aliquota, idadeMoto)                        // 0 se idadeMoto >= 15

// Alerta de manutenção
calcularProximaManutencao(kmAtual, kmUltimaTroca, intervaloKm, kmDia, diasSemana)
  // retorna: { kmRestante, diasEstimados }

// Médias reais (Diário de Trabalho)
calcularMediaKmDiaReal(registros)                                    // após 5+ entradas
calcularConsumoRealKmL(abastecimentos)

// Intervalo real (Histórico de Manutenção)
calcularIntervaloMedioReal(registros)                                // após 2+ do mesmo tipo
```

### VI.1- Função `resolverOverride.js`

```js
// Resolve o valor de um campo considerando PADRÃO vs PERSONALIZADO
resolverValorCampo(id, campo, modoExibicao, overrides, preset)
  // modoExibicao === 'padrao'        → retorna preset[id][campo]
  // modoExibicao === 'personalizado' → retorna override se existir, senão preset

resolverPerfilPecas(id, perfilGlobal, overrides, anoFimOriginal, anoMoto)
  // Considera: perfilPecasOverride por item, anoFimOriginal, perfilPecasGlobal
```

---

## VII- Hook `usePerfil.js`

```js
const { perfil, dispatch } = usePerfil()

// Actions do reducer
dispatch({ type: 'INIT', payload: perfilInicial })
dispatch({ type: 'SET_FIELD', path: 'trabalho.kmPorDia', value: 60 })
dispatch({ type: 'SET_OVERRIDE', id: 'oleo_motor', campo: 'preco', value: 45 })
dispatch({ type: 'RESET_OVERRIDE', id: 'oleo_motor', campo: 'preco' })
dispatch({ type: 'SET_MODO_EXIBICAO', value: 'padrao' })
dispatch({ type: 'SET_CATEGORIA_ATIVA', categoria: 'alimentacao', value: false })
dispatch({ type: 'ADD_REGISTRO_MANUTENCAO', tipo: 'trocasOleo', registro: { ... } })
dispatch({ type: 'ADD_DIA_TRABALHO', registro: { ... } })
dispatch({ type: 'RESET_PERFIL' })
```

> O hook persiste automaticamente no localStorage a cada dispatch.
> Componentes nunca acessam `localStorage` diretamente (RNF-12).

---

## VIII- Ordem de Implementação por Fases

```
Fase 0 — Dados ✅ CONCLUÍDA
  [1] ✅ Preços pop110i.json preenchidos (original + paralela)
  [2] ✅ Valores fixos RJ (licenciamento R$206, gasolina R$6,61, IPVA 2%)
  [3] ✅ FIPE via BrasilAPI (estratégia decidida)
  [4] Adicionar seção revisaoAutorizada no pop110i.json
  [5] Criar src/data/dados_rj.json

──────────────────────────────────────────────────────────────────

Fase 1 — Setup do Projeto
  [6]  Criar projeto: npm create vite@latest motocalc -- --template react
  [7]  Instalar dependências:
         npm install tailwindcss @tailwindcss/vite
         npm install react-router-dom
         npm install recharts
         npm install nanoid
         npm install date-fns
         npm install vite-plugin-pwa workbox-window
         npm install -D vitest
  [8]  Configurar tailwind.config.js + vite.config.js
  [9]  Criar estrutura de pastas conforme Seção IV
  [10] Mover pop110i.json para src/presets/
  [11] Criar src/data/dados_rj.json

Fase 2 — Lógica Pura (sem UI)
  [12] Implementar calculos.js com todas as funções da Seção VI
  [13] Implementar resolverOverride.js
  [14] Escrever testes unitários em calculos.test.js:
         - calcularKmAnual
         - calcularCpkPeca
         - calcularIntervaloEfetivo (gatilho duplo)
         - calcularIPVA (inclusive isenção 15 anos)
         - calcularGranularidades
         - resolverValorCampo (PADRÃO vs PERSONALIZADO)
  [15] Rodar Vitest e validar testes

Fase 3 — Persistência e Estado
  [16] Implementar PerfilContext.jsx (Context + Provider)
  [17] Implementar usePerfil.js com useReducer + persistência localStorage
  [18] Implementar useCustos.js com useMemo para todos os cálculos derivados
  [19] Testar manualmente: mudar km/dia → verificar recálculo

Fase 4 — Layout Base e Navegação
  [20] Implementar App.jsx com React Router (6 rotas)
  [21] Implementar Cabecalho.jsx (global)
  [22] Implementar BottomNav.jsx (4 abas)
  [23] Criar páginas placeholder para cada aba (confirmando que navegação funciona)

Fase 5 — Onboarding
  [24] OnboardingFlow.jsx + indicador de progresso
  [25] BlocoMoto.jsx (marca, modelo, ano, baú, hodômetro)
  [26] BlocoManutencao.jsx (perfil de peças, modo revisão)
  [27] BlocoTrabalho.jsx (km/dia, dias/semana)
  [28] BlocoFinanceiro.jsx (combustível multi-tipo, internet, seguro, situação, alimentação)
  [29] BlocoPersonalizacao.jsx (apelido, apps)
  [30] TelaConfirmacao.jsx (revisão final com edição)
  [31] Testar onboarding completo e validar salvamento no localStorage

Fase 6 — Aba CUSTOS
  [32] PainelCustos.jsx com todos os cards de período
  [33] ToggleModo.jsx (PADRÃO/PERSONALIZADO)
  [34] ToggleOficina.jsx (AUTORIZADAS/INDEPENDENTES)
  [35] ConfiguracaoRodagem.jsx (km/dia + stepper)
  [36] AlertaManutencao.jsx (card vermelho)
  [37] CardPeriodo.jsx genérico (hora, dia, semana, mês, ano, km)
  [38] Detalhamento.jsx + GraficoRosca.jsx (Recharts)
  [39] CardCategoria.jsx com toggle on/off e expansão

Fase 7 — Aba SERVIÇOS
  [40] Servicos.jsx com aviso de estimativas
  [41] SecaoMaoDeObra.jsx (5 tipos de serviço com preço editável + reset)
  [42] SecaoRevisaoAutorizada.jsx (tabela de revisões do fabricante + reset por linha)

Fase 8 — Aba PEÇAS
  [43] Pecas.jsx (estrutura com 3 seções)
  [44] SecaoCombustivel.jsx (comum, aditivada, etanol — preço + autonomia + reset)
  [45] SecaoPecas.jsx (lista com toggle ORG/PAR + preço + vida útil + reset)
  [46] SecaoPneus.jsx (dianteiro + traseiro com toggle + reset)

Fase 9 — Aba REGISTROS
  [47] Registros.jsx com sub-abas
  [48] SubAbaGeral.jsx com todas as seções
  [49] SubAbaRodagem.jsx
  [50] SubAbaCombustivel.jsx
  [51] SubAbaManutencao.jsx
  [52] Formulários de adição de registros (+ botão em cada seção)
  [53] Lógica de intervalo médio real (após 2+ registros)

Fase 10 — Configurações e Export/Import
  [54] Configuracoes.jsx (todas as seções)
  [55] SecaoPerfil.jsx (editar dados do onboarding)
  [56] SecaoMotoAlugada.jsx (responsabilidades)
  [57] SecaoExportImport.jsx (JSON export + import + redefinir perfil)

Fase 11 — PWA
  [58] manifest.json e ícones (192px e 512px)
  [59] Configurar vite-plugin-pwa com estratégia Cache First
  [60] Testar instalação como PWA no Android
  [61] Testar funcionamento offline completo

Fase 12 — Outros Modelos (Could Have)
  [62] Criar presets/cg_titan160.json
  [63] Criar presets/biz125.json
  [64] Criar presets/factor150.json
  [65] Criar presets/nxr_bros160.json

──────────────────────────────────────────────────────────────────

VERIFICAÇÃO FINAL (antes do deploy)
  [ ] Todos os testes Vitest passando
  [ ] Lighthouse PWA Score ≥ 90
  [ ] Bundle < 500 KB gzipado (npm run build → verificar vite output)
  [ ] Teste de onboarding com 3 usuários reais (meta: < 3 minutos)
  [ ] Teste offline: desligar rede e reabrir o app
  [ ] Validar que NENHUM componente acessa localStorage diretamente (grep: localStorage)
  [ ] Validar que o preset não é mutado em nenhum cenário (grep: preset[...] = )
  [ ] Verificar contraste de cores (Lighthouse → Accessibility)
```

---

## IX- Notas Arquiteturais

### IX.1- Sistema de Overrides: como funciona na prática

```
Usuário edita preço do óleo:
  → dispatch({ type: 'SET_OVERRIDE', id: 'oleo_motor', campo: 'preco', value: 45 })
  → pecasOverrides: [{ id: 'oleo_motor', precoEditado: 45, ... }]
  → resolverValorCampo('oleo_motor', 'preco', 'personalizado', overrides, preset) → 45

Usuário clica reset (↺) no óleo:
  → dispatch({ type: 'RESET_OVERRIDE', id: 'oleo_motor', campo: 'preco' })
  → pecasOverrides: [{ id: 'oleo_motor', precoEditado: null, ... }]
  → resolverValorCampo('oleo_motor', 'preco', ...) → preset.oleo_motor.preco (ex: 42)

Usuário ativa modo PADRÃO:
  → dispatch({ type: 'SET_MODO_EXIBICAO', value: 'padrao' })
  → resolverValorCampo ignora todos os overrides → sempre retorna preset
  → todos os custos recalculados com valores originais
```

### IX.2- `useMemo` para Performance

O hook `useCustos.js` usa `useMemo` para evitar recalcular tudo a cada render:

```js
const custosCombustivel = useMemo(() => {
  return calcularCustoCombustivelAnual(...)
}, [tipoGasolina, precoGasolina, autonomia, kmAnual])

const custosManutencao = useMemo(() => {
  return calcularCustoManutencaoAnual(...)
}, [pecasComOverrides, kmAnual])

// Custo total só recalcula se QUALQUER dependência mudar
const custoTotal = useMemo(() => {
  return calcularCustoTotalAnual(categorias)
}, [custosCombustivel, custosManutencao, custosFixos, ...])
```

### IX.3- Recharts: Implementação do Donut Chart

```jsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const dados = [
  { nome: 'Combustível', valor: 750, cor: '#3B82F6' },
  { nome: 'Manutenção', valor: 750, cor: '#6366F1' },
  { nome: 'Documentação', valor: 352, cor: '#8B5CF6' },
  // ...apenas categorias com toggle ativo
]

<PieChart width={280} height={280}>
  <Pie data={dados} innerRadius={80} outerRadius={120} dataKey="valor">
    {dados.map((entry, index) => (
      <Cell key={index} fill={entry.cor} />
    ))}
  </Pie>
  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
</PieChart>
```

### IX.4- React Router: Configuração das Rotas

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Navigate to="/custos" />} />
  <Route path="/onboarding/*" element={<OnboardingFlow />} />
  <Route path="/custos" element={<PainelCustos />} />
  <Route path="/custos/detalhamento" element={<Detalhamento />} />
  <Route path="/registros" element={<Registros />} />
  <Route path="/servicos" element={<Servicos />} />
  <Route path="/pecas" element={<Pecas />} />
  <Route path="/configuracoes" element={<Configuracoes />} />
</Routes>
```

### IX.5- FIPE via BrasilAPI: fluxo offline-first

```
Onboarding — passo de seleção do modelo:
  → Tentar GET https://brasilapi.com.br/api/fipe/motos/v1/{codigoFipe}
  → Sucesso: salvar { valor, dataConsulta, codigoFipe } em fipeCache
  → Falha (offline): usar fipeCache existente + exibir "Valor FIPE de DD/MM/AAAA"
  → Se fipeCache vazio e offline: exibir input manual + aviso

Na aba CUSTOS, IPVA sempre calculado com fipeCache.valor
```

### IX.6- Tema Visual

O design das telas usa tema escuro. Configuração Tailwind:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // ou 'media'
  theme: {
    extend: {
      colors: {
        // Azul primário (botões, destaques)
        primario: '#3B82F6',
        // Fundo principal
        fundo: '#0F172A',
        // Cards
        card: '#1E293B',
        // Texto secundário
        muted: '#94A3B8',
      }
    }
  }
}
```

---

## X- Comandos de Referência

```bash
# Criar projeto
npm create vite@latest motocalc -- --template react
cd motocalc

# Instalar todas as dependências
npm install tailwindcss @tailwindcss/vite react-router-dom recharts nanoid date-fns vite-plugin-pwa workbox-window
npm install -D vitest @vitest/ui

# Desenvolvimento
npm run dev

# Testes
npm run test           # Vitest watch
npm run test:ui        # Vitest UI no browser

# Build + verificar bundle
npm run build
npx vite preview       # testar o build localmente
```

---

*Última atualização: 03/05/2026 — Fase 0 concluída. Versão 2.0 do planejamento baseada nas telas do protótipo. Próxima etapa: Fase 1 (Setup do projeto).*

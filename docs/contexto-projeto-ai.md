# Projeto MotoCalc RJ Índice para IA
#### `docs/contexto-projeto-ai.md`

## Documentos oficiais 

## Regra 0 Antes de Qualquer Coisa

1. Ler este documento por completo
2. Ler '/docs/tarefas/em-andamento.md,depois pergute se pode iniciar o planejamento da tarefa, se sim, leia o arquivo '/.github/agents/Geral.agent.md ,esse é o documento que vai lhe dar padrões de como agir em cada situação, procure no índice deste documento o comportamento que mais adequado de incorporar em cada tarefa que for executar, escolha o mesmo ou outro comportamento padrão para cada ação que for executar, nunca agir sem seguir um desses padrões e sem contexto específico do projeto atual, você pode mudar entre os comportamentos como quiser conforme achar mais adequado sem pedir permissão, mas se precisar fazer algo que contrarie algum deles, peça permissão(logo, se for ler apenas as partes que importa, toda vez que for agir vair ter ler novamente para áreas diferentes). 
3. Obtenha contexto específico desse projeto necessário antes de agir, leia o que for preciso em docs/ ou arquivos do projeto, você já sabe onde fica cada coisa pois aqui está tudo documentado onde encotrar cada coisa. 
3. Só então agir

## Documentos do Projeto

| Assunto | Arquivo |
|---|---|
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Glossário do domínio | `docs/dominio/_glossario.md` |
| Invariantes | `docs/dominio/invariantes.md` |
| Dívida técnica | `docs/dominio/divida-tecnica.md` |
| Modelagem detalhada do domínio | `docs/dominio/modelagem/` |
| Design de telas e navegação | `docs/design/` |
| Fluxo de onboarding | `docs/design/indices-links-tela-figma.md` |
| Arquitetura visão geral e pastas | `docs/contexto-projeto-ai.md` |
| Estado inicial e persistência | `docs/arquitetura/estado_inicial.md` |
| Componentes de UI existentes | `src/components/` |
| Rotas da aplicação | `src/App.tsx` |
| Convenções de código | `docs/arquitetura/convencoes.md` |
| Padrão de testes | `docs/padrao-testes.md` |
| Tema e tokens Tailwind | `docs/design/tema-tailwind.md` |
| Setup inicial | `docs/arquitetura/setup-inicial.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Tarefas pendentes | `docs/tarefas/pendentes.md` |
| Tarefa em andamento | `docs/tarefas/em-andamento.md` |
| Tarefas concluídas | `docs/tarefas/concluidas/` |
| Protocolo de testes | `docs/padrao-testes.md` |



## Como aplicar o comportamento neste projeto

- **Idioma:** tudo em português (variáveis, componentes, docs).
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes, hooks com prefixo `use`.
- **Estado:** Context + useReducer, persistido via `services/perfilStorage.ts`.
- **Cálculos:** `utils/calculos.ts` é imutável; novas funções de cálculo seguem o mesmo estilo.
- **UI:** shadcn/ui copiado para `components/ui/`, tokens usam a convenção CSS do Shadcn.
- **Testes:** Vitest com `describe/it`, nomes em português, padrão AAA.

## Instruções Específicas para a IA

- **Antes de alterar qualquer cálculo:** leia `docs/dominio/invariantes.md`.
- **Antes de criar/editar componentes:** verifique se já existe algo similar em `src/components/` e siga `docs/design/tema-tailwind.md`.
- **Nunca modifique `src/utils/calculos.ts` sem aprovação explícita.**
- **Nunca acesse `localStorage` diretamente** use `src/services/perfilStorage.ts`.
- **Ao concluir uma task que altera estado/cálculos/persistência:** rode `npm run test` e confirme que todos os testes estão verdes.
- **Registre cada ação no arquivo da tarefa** (`docs/tarefas/em-andamento.md` ou o arquivo em `concluidas/`) usando o formato padronizado (prefixo, data, revisão, testes).
- **Se gerar novas tarefas a partir de uma revisão ou ADR, use os prefixos corretos** (RF, RN, RNF, BG, REF, DOC) e adicione em `docs/tarefas/pendentes.md`.
- Toda leitura/escrita em `localStorage` usa as chaves e o fluxo definidos em `docs/arquitetura/estado_inicial.md`. Nunca acesse diretamente.


# Arquitetura Visão Geral do MotoCalc RJ

> **Propósito:** Documentar a estrutura real de pastas, decisões arquiteturais imutáveis e links para os documentos de arquitetura específicos.
> **Público:** IA e desenvolvedores. Para visitantes, ver `README.md`.

---

## Estrutura Real de Pastas (src/)
src/
├── App.tsx # Rotas e providers
├── main.tsx # Entry point, carrega fixtures em DEV
├── index.css # Tailwind + tokens Shadcn
├── types/
│ ├── perfil.ts # PerfilUsuario, PresetEntry, PerfilAction
│ └── calculos.ts # GranularidadesCusto, CustosPorCategoria, FiltrosCategorias
├── utils/
│ ├── calculos.ts # ✅ 76 testes NUNCA TOCAR sem aprovação
│ ├── calculos.test.ts
│ └── formatters.ts # moeda(), cpkFormatado(), kmFormatado()
├── services/
│ ├── perfilStorage.ts # IPerfilStorage + LocalStoragePerfilStorage
│ └── fipeService.ts # BrasilAPI com cache
├── context/
│ ├── PerfilContext.tsx # Provider + useReducer + perfilPadrao
│ ├── PerfilContext.test.ts
│ └── ThemeContext.tsx
├── hooks/
│ ├── usePerfil.ts
│ └── useCustos.ts
├── routes/
│ └── RotaProtegida.tsx
├── data/
│ ├── dados_rj.json
│ └── catalogoModelos.ts
├── presets/
│ └── pop110i.json # ✅ IMUTÁVEL EM RUNTIME
├── fixtures/
│ └── usuario_teste.json # Carregado só em DEV
├── components/
│ ├── estimativa/
│ │ └── DonutChart.tsx
│ └── layout/
│ ├── LayoutApp.tsx
│ └── NavBar.tsx
└── pages/
├── PaginaEstimativa.tsx # ⚠️ 230 linhas refatorar
├── PaginaDetalhamento.tsx # 🔴 537 linhas refatorar
├── PaginaRegistros.tsx
├── PaginaMaoDeObra.tsx
├── PaginaVidaUtil.tsx
├── PaginaAjustes.tsx
└── onboarding/
├── FluxoOnboarding.tsx
├── PassoLayout.tsx
├── onboardingUtils.ts
└── passos/
├── Passo1.tsx … Passo9.tsx
├── Passo6Aluguel.tsx
├── Passo6Financiamento.tsx
├── Passo6Responsabilidade.tsx
└── PassoConfirmacao.tsx

text

---

## Decisões Arquiteturais Imutáveis

- **Idioma:** Português em tudo variáveis, componentes, tipos, comentários, testes.
- **Estado global:** Context + `useReducer`. Um contexto por domínio. Não atomizar.
- **Persistência:** `localStorage` acessado exclusivamente via `services/perfilStorage.ts`.
- **Presets JSON:** Imutáveis em runtime. Toda personalização vai para overrides no perfil.
- **Cálculos:** `utils/calculos.ts` é imutável (76 testes). Novas funções de cálculo seguem o mesmo estilo, mas não alteram as existentes sem aprovação.
- **Roteamento:** React Router 6 com nested routes.
- **UI base:** shadcn/ui (a instalar). Wrappers em `components/ui/`.
- **Testes:** Vitest com `describe`/`it`, padrão AAA, nomes em português.
- **Build:** Vite + `vite-plugin-pwa` (Service Worker).

---

## Documentos de Arquitetura Relacionados

| Documento | Conteúdo |
|---|---|
| `estado_inicial.md` | Fluxo de leitura no arranque, chaves do localStorage, `perfilPadrao` |
| `src/components/` | Componentes existentes de interface e layout |
| `src/App.tsx` | Lista real de rotas e proteção de acesso |
| `convencoes.md` | Convenções de nomenclatura, idioma, exemplos de código correto/incorreto |
| `docs/padrao-testes.md` | Padrão de testes (Vitest, AAA, cobertura mínima, nomes em PT) |
| `docs/design/tema-tailwind.md` | Tokens de cor Shadcn, tipografia, classes customizadas |
| `setup-inicial.md` | Passo a passo para setup do projeto |
| `ADR/` | Decisões arquiteturais registradas (ADR-001, ADR-002, ...) |

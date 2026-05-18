# Requisitos Não Funcionais — MotoCalc RJ

> Extraído de `Requisitos_MotoCalc_RJ_v6.md` (09/05/2026). Agrupa as seções VII, VIII, IX, X e XI do documento original.
> IDs: RNF-01 a RNF-12, RNF-COMP-01 a 06, RNF-ANA-01 a 03, RNF-PWA-01 a 05, RNF-TWA-01 a 06, RNF-LR-01 a 06, RNF-STACK-01 a 04.

---

## Desempenho e Disponibilidade

| ID | Descrição | Meta / Critério | Status |
|---|---|---|---|
| RNF-01 | Funcionar completamente offline após o primeiro acesso. | Service Worker com estratégia `CacheFirst` para assets estáticos. | [~] PARCIAL |
| RNF-02 | Primeiro carregamento rápido em 3G. | Bundle total < 500 KB gzipado. Lighthouse Performance ≥ 80. | [ ] PENDENTE |
| RNF-03 | Instalável como PWA em Android (e iOS via Safari com limitações). | `manifest.json` válido. `start_url` e `display: standalone`. | [ ] PENDENTE |
| RNF-04 | Recalcular custos em < 200ms após qualquer alteração de input. | `useMemo` com dependências corretas. Profiling no Chrome DevTools. | ✅ CONCLUÍDO para Estimativa e Detalhamento |

---

## Usabilidade e Acessibilidade

| ID | Descrição | Meta / Critério | Status |
|---|---|---|---|
| RNF-05 | Área de toque mínima de 48×48px em todos os elementos interativos. | Botões de stepper, reset ↺, toggles e chips. | [ ] PENDENTE (refatoração necessária) |
| RNF-06 | Contraste de cores WCAG 2.1 nível AA. | Razão ≥ 4.5:1 para texto normal. O tema escuro favorece isso. | ✅ CONCLUÍDO (tokens Shadcn) |
| RNF-07 | Campos numéricos abrem teclado numérico automaticamente. | `inputMode="decimal"` em todos os inputs de km, R$ e km/L. | [ ] PENDENTE |
| RNF-08 | Interface responsiva para telas de 360px a 430px. | Testado em Moto G e Samsung A. | [ ] PENDENTE |
| RNF-09 | Onboarding concluível em menos de 3 minutos. | Teste com 3 entregadores reais. Tempo médio < 3 min. | [ ] PENDENTE |

---

## Componentização com Shadcn/ui

| ID | Descrição | Meta / Critério | Status |
|---|---|---|---|
| RNF-COMP-01 | **Páginas são composições, não monólitos.** Cada arquivo em `src/pages/` deve ter no máximo **150 linhas** (meta revisada para ≤ 200 em TASK-REF-02 — Prettier expande JSX) e conter apenas importações, composição e estado de rota local. | `wc -l src/pages/*.tsx` → zero arquivos acima de 200 linhas. | ✅ CONCLUÍDO (PaginaEstimativa: 127, PaginaDetalhamento: 199 linhas — TASK-REF-01/02) |
| RNF-COMP-02 | **Tudo que se repete vira componente.** Qualquer JSX de card, input, label, badge, toggle, stepper, accordion, botão ou separador que aparece ≥ 2 vezes no app deve estar em `src/components/ui/`. | Revisão de código: nenhuma duplicação de estrutura JSX entre arquivos. | [ ] PENDENTE |
| RNF-COMP-03 | **`src/components/ui/` é a camada Shadcn.** Componentes customizados seguem o mesmo padrão de arquivo (export nomeado, props tipadas, sem lógica de negócio). | `ls src/components/ui/` lista tanto componentes Shadcn quanto os custom do projeto, no mesmo estilo. | ✅ CONCLUÍDO (shadcn instalado em TASK-REF-03; Card, Button, Input, Badge, Label, Accordion em uso) |
| RNF-COMP-04 | **Componentes de feature em subpasta própria.** Donut chart → `src/components/estimativa/`. Accordion de categoria → `src/components/detalhamento/`. Formulário de registro → `src/components/registros/formularios/`. | Cada componente de feature recebe dados via props ou hook dedicado — nunca acessa `PerfilContext` diretamente. | ✅ CONCLUÍDO (subpastas estimativa/ com 5 componentes e detalhamento/ com 7 componentes — TASK-REF-01/02) |
| RNF-COMP-05 | **Props tipadas com `interface` explícita.** Nenhum componente usa `any`, `object` ou `React.FC` sem tipo de props. | TypeScript strict — zero erros de tipo. | ✅ CONCLUÍDO |
| RNF-COMP-06 | **Lógica de negócio fora do JSX.** Cálculos, formatação e filtragem ficam em hooks ou utils. | Revisão de código: ausência de cálculos dentro de `return (...)`. | [ ] PENDENTE |

---

## Coleta de Eventos (Analytics)

| ID | Descrição | Status |
|---|---|---|
| RNF-ANA-01 | Integrar Umami para rastreamento anônimo. Nenhum dado pessoal enviado (sem nome, email, CPF, localização, hodômetro). | [ ] PENDENTE |
| RNF-ANA-02 | Implementar função `trackEvent(nome, propriedades?)` centralizada em `/utils/analytics.ts`. | [ ] PENDENTE |
| RNF-ANA-03 | Eventos rastreados devem ser auditáveis: arquivo `/utils/analytics.ts` lista e documenta cada evento. | [ ] PENDENTE |

### Catálogo de Eventos (resumo)

Eventos de **Onboarding**: `onboarding_iniciado`, `onboarding_passo_concluido`, `onboarding_marca_selecionada`, `onboarding_modelo_selecionado`, `onboarding_situacao_selecionada`, `onboarding_concluido`, `onboarding_abandonado`.

Eventos de **Estimativa**: `estimativa_km_alterado`, `estimativa_dias_alterado`, `estimativa_modo_alterado`, `estimativa_oficina_alterada`, `estimativa_detalhamento_aberto`, `estimativa_categoria_toggle`, `estimativa_gasto_adicionado`.

Eventos de **Registros**: `registro_salvo`, `registro_excluido`, `registro_foto_adicionada` (por tipo: rodagem, abastecimento, oleo, pneu, revisao, kit_relacao).

Eventos de **Configuração**: `override_salvo`, `override_resetado`, `perfil_exportado`, `perfil_importado`, `perfil_resetado`, `fipe_consultada`, `fipe_offline`.

Eventos de **Engajamento**: `pwa_instalado`, `app_atualizado`.

> Catálogo completo com propriedades e payloads: ver `docs/design/analytics.md` (a ser criado na implementação).

---

## PWA e Service Worker

| ID | Descrição | Critério | Status |
|---|---|---|---|
| RNF-PWA-01 | `manifest.json` válido com ícones 192px/512px maskable. | Lighthouse PWA Score ≥ 90. | [ ] PENDENTE |
| RNF-PWA-02 | Service Worker registrado via `vite-plugin-pwa` com `CacheFirst` para assets estáticos e `NetworkFirst` para BrasilAPI. | App funcional offline após primeiro carregamento. | [ ] PENDENTE |
| RNF-PWA-03 | App servido obrigatoriamente via HTTPS. | Netlify/Vercel fornecem HTTPS automaticamente. | [ ] PENDENTE |
| RNF-PWA-04 | Banner "Instalar MotoCalc" na primeira visita. | Evento `beforeinstallprompt` capturado. | [ ] PENDENTE |
| RNF-PWA-05 | App funcional em standalone (sem barra do browser) no Android. | Testado em Android 10+ com Chrome. | [ ] PENDENTE |

---

## Distribuição via Google Play Store (TWA)

| ID | Descrição | Status |
|---|---|---|
| RNF-TWA-01 | Criar projeto TWA com `@bubblewrap/cli` apontando para o `manifest.json`. | [ ] PENDENTE |
| RNF-TWA-02 | Configurar `assetlinks.json` em `/.well-known/assetlinks.json`. | [ ] PENDENTE |
| RNF-TWA-03 | Publicar `.aab` no Google Play Console. | [ ] PENDENTE |
| RNF-TWA-04 | Política de Privacidade publicada em URL pública. | [ ] PENDENTE |
| RNF-TWA-05 | `versionCode` e `versionName` incrementados a cada release. | [ ] PENDENTE |
| RNF-TWA-06 | Lighthouse PWA ≥ 90 e `start_url` respondendo com 200. | [ ] PENDENTE |

---

## Arquitetura Login-Ready

| ID | Descrição | Implementação | Status |
|---|---|---|---|
| RNF-LR-01 | **`perfilStorage.ts` como único ponto de acesso ao localStorage.** Zero acessos diretos fora dele. | `grep -r "localStorage" src/` → só `services/perfilStorage.ts`. | ✅ CONCLUÍDO |
| RNF-LR-02 | **Schema do perfil inclui campo `userId: string \| null`.** Em V1 sempre `null`. | Não afeta lógica de cálculo. | ✅ CONCLUÍDO |
| RNF-LR-03 | **Separar lógica de armazenamento da lógica de estado.** Interface `IPerfilStorage` injetada no `PerfilContext`. | Implementado com `LocalStoragePerfilStorage`. | ✅ CONCLUÍDO |
| RNF-LR-04 | **Rotas protegidas preparadas.** `<RotaProtegida>` redireciona para onboarding se não há perfil. | Substitui apenas o interior em V2. | ✅ CONCLUÍDO |
| RNF-LR-05 | **Export/import de perfil mantido com login.** Em V2, export serve como backup portátil independente. | RF-EXP-01 a 03 permanecem em V2. | [ ] PENDENTE |
| RNF-LR-06 | **`schemaVersion` no perfil garante migrações.** Arquivo `/utils/migrarPerfil.ts`. | Ainda não criado (Fase 2 pendente). | [ ] PENDENTE |

---

## Manutenção e Evolução

| ID | Descrição | Critério | Status |
|---|---|---|---|
| RNF-10 | Dados de cada modelo em arquivo JSON separado da lógica de cálculo. Adicionar novo modelo = inserir novo `.json`. | Zero alteração no código. `useCustos.ts` carrega com `import.meta.glob`. | ✅ CONCLUÍDO |
| RNF-11 | Lógica de cálculo isolada em funções puras e testáveis. | Funções em `/utils/calculos.ts`. Cobertura Vitest. | ✅ CONCLUÍDO (76 testes) |
| RNF-12 | Arquivos TypeScript com tipagem estrita. `strict: true` no `tsconfig.json`. | `any` proibido. Interfaces em `/types`. | ✅ CONCLUÍDO |

---

## Stack Tecnológica Obrigatória (RNFs de Stack)

| ID | Descrição | Status |
|---|---|---|
| RNF-STACK-01 | TypeScript com `strict: true`. `any` proibido. | ✅ CONCLUÍDO |
| RNF-STACK-02 | Acesso a `localStorage` apenas via `services/perfilStorage.ts`. | ✅ CONCLUÍDO |
| RNF-STACK-03 | ESLint + `@typescript-eslint` com regras estritas. | ✅ CONCLUÍDO |
| RNF-STACK-04 | Testes unitários com Vitest. | ✅ CONCLUÍDO (92 testes: 76 em calculos.ts + 16 em PerfilContext.test.ts) |

---

## Componentes Shadcn Mapeados (referência para implementação)

| Componente | Uso |
|---|---|
| Card | Cards de custo, cards informativos |
| Accordion | Categorias no Detalhamento |
| Switch | Toggles de categoria |
| Dialog | Modal de gasto, confirmação "Apagar Tudo" |
| Badge | Status de revisão, "Modo personalizado ativo" |
| Select | Dropdown ano, tipo de óleo, marca |
| Tabs | Sub-abas da tela Registros |
| Input | Todos os inputs |
| Button | Todos os botões |
| Separator | Divisores entre seções |
| Toggle | MENSAL/ANUAL, AUTORIZADAS/INDEPENDENTES |
| Sheet | Painel hamburguer |

---

## Rotas Definidas

/onboarding/1 a /onboarding/9
/onboarding/6/financiamento
/onboarding/6/aluguel
/onboarding/6/responsabilidade
/estimativa
/estimativa/detalhamento
/registros
/mao-de-obra
/vida-util
/ajustes
/perfil

text

---

> **Status geral:**
> - ✅ CONCLUÍDO: Cálculos (RNF-04, RNF-10, RNF-11, RNF-12), Login-ready (RNF-LR-01 a 04), Stack obrigatória (RNF-STACK-01 a 04), Componentização parcial (RNF-COMP-01, 03, 04, 05).
> - [ ] PENDENTE: Performance mobile (RNF-01, RNF-02), PWA/TWA (RNF-PWA, RNF-TWA), Acessibilidade (RNF-05 a 08), Componentização restante (RNF-COMP-02, 06), Analytics (RNF-ANA), Export/Import (RNF-LR-05, 06).
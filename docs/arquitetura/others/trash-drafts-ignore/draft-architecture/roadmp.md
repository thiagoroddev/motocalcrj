# Roadmap - MotoCalc RJ

> Mapa estratégico de execução do projeto. Documento de leitura ocasional, não operacional.
>
> Para o backlog operacional (tarefas ativas), ver `Tasks.md` em /docs
>
> **Versão dos Requisitos ativa:** `docs/Requisitos_MotoCalc_RJ_v6.md`

---

## Visão Geral

O projeto está organizado em 10 módulos sequenciais. Cada módulo agrupa tarefas com propósito comum. A ordem é sugerida - algumas tarefas podem rodar em paralelo, outras podem ser antecipadas se houver bloqueio.

## Mapa de Execução (10 módulos)

### Módulo 1 - Base do projeto, tema e dados

Setup técnico, configuração de ferramentas, dados regionais.

- TASK-0.1 ✅ Setup base (Vite + React + TS + Tailwind + ESLint + Prettier)
- TASK-1.x - Tema, design tokens, estrutura de pastas
- TASK-2.x - Dados regulatórios do RJ (`dados_rj.json`), catálogo de modelos

### Módulo 2 - Estado global, persistência e rotas

Reducer, Context, storage, navegação.

- TASK-3.x - `PerfilContext` + `persistStorage` isolado
- TASK-4.x - Rotas, `RotaProtegida`, navegação base

### Módulo 3 - Onboarding completo + FIPE

Fluxo de primeiro uso, integração com BrasilAPI.

- TASK-ON-x - 9 passos do onboarding
- TASK-FIPE-x - Consulta à FIPE com cache

### Módulo 4 - Cálculos core + testes

Funções de cálculo em `utils/calculos.ts`. **Já implementado, com 92 testes passando - marcado como Proibição Absoluta no contexto-base.**

### Módulo 5 - Estimativa e detalhamento

Telas principais - onde o Motoboy passa a maior parte do tempo.

- TASK-EST-x - Painel da Estimativa (cards por período, donut, configuração de rodagem)
- TASK-DET-x - Detalhamento (accordions por categoria, edição de subitens)
- Refatorações planejadas devem ser registradas no Tasks (backlog operacional)

### Módulo 6 - Registros e formulários

Histórico de manutenção, diário de trabalho.

- **TASK-5.1** - Formulários de Histórico de Manutenção
- TASK-5.x - Formulários de Diário de Trabalho
- Dependências e bloqueios: ver Tasks (backlog operacional)

### Módulo 7 - Mão de obra, autonomia, perfil

Telas de personalização do Motoboy.

- TASK-MO-x - Tela Mão de Obra (preços de serviços)
- TASK-AUT-x - Tela Autonomia (consumo personalizado)
- TASK-PER-x - Tela Perfil (dados pessoais, apagar tudo)

### Módulo 8 - Export/import e presets

Permitir migração entre dispositivos, múltiplos presets.

- TASK-EXP-x - Export do perfil para `.json`
- TASK-IMP-x - Import com validação de schema
- TASK-PRE-x - Gerenciamento de múltiplos PresetEntry

### Módulo 9 - Analytics, PWA, TWA

Distribuição e telemetria.

- TASK-ANA-x - Umami analytics integrado
- TASK-PWA-x - Service Worker, manifest, ícones
- TASK-TWA-x - Empacotamento para Play Store
- TASK-MIG-x - `migrarPerfil.ts` (criar antes do release público)

### Módulo 10 - QA, performance, acessibilidade

Polimento final pré-release.

- TASK-QA-x - Cobertura de testes, casos extremos
- TASK-PERF-x - Métricas de performance, otimizações
- TASK-A11Y-x - Acessibilidade (WCAG AA)

---

## Status Atual do Projeto

**Módulo 4 (Cálculos core):** ✅ Estável, com 92 testes passando. Não tocar (`utils/calculos.ts` é imutável).

**Módulo 5 (Estimativa e detalhamento):** ✅ Implementado parcialmente. Pendências e refinos devem estar no Tasks.

**Módulo 6 (Registros):** ⏸️ Pendente; ver TASK-5.x no Tasks.

**Módulos 1, 2, 3:** ✅ Concluídos em rodada anterior do projeto.

**Módulos 7-10:** Não iniciados.

---

## Política de Testes (resumo)

> **Padrão completo:** ver `docs/protocolo-testes.md`.

- **Marco de testes obrigatório:** tarefas que mexem em estado/persistência, cálculos, registros, overrides, import/export, migrações e analytics.
- Para essas tarefas, **rodar testes ao finalizar** e **só seguir se estiverem verdes** (Definition of Done).
- Mudanças apenas de UI/UX não exigem testes novos, desde que não alterem lógica, estado ou cálculos.
- Comando padrão: `npm run test` (ou `vitest run`).
- **Filosofia:** cada agente cuida dos próprios testes. QA audita periodicamente.

---

## Histórico de Versões deste Documento

| Data       | Mudança                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-11 | Criação inicial - migrado do antigo `tasks.md`. Removidas referências a documentos excluídos (Setup, rules, Convencoes, Arquitetura_Funcoes_Calculo, ESTADO_INICIAL, Design_Motocalc_Figma, mapeamento-ui-figma). |

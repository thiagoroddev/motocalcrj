# EstimaMoto

Aplicação web para motoboys do Rio de Janeiro calcularem o custo operacional real de suas motos.
Foco inicial: Honda Pop 110i.

## O Que Faz

- Onboarding guiado para configurar moto, rotina de trabalho e custos pessoais
- Estimativa de custo por km, hora, dia, semana, mês e ano
- Detalhamento por categoria: combustível, manutenção, revisão, seguro, alimentação e outros custos
- Edição de presets, preços de peças, mão de obra e últimas manutenções
- Persistência local no navegador

> PWA/offline completo ainda não está implementado. Esse trabalho está planejado no backlog como
> `TASK-RNF-8.2`.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite 6 |
| Linguagem | TypeScript 5.8 (strict) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Roteamento | React Router v7 (modo biblioteca) |
| Estado | Context + useReducer |
| Testes | Vitest |
| Lint | ESLint v9 (flat config) |

## Como Rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run test      # rodar testes
npm run build     # build de produção
npm run lint      # verificar lint
npx tsc --noEmit  # verificar tipos
```

## Documentação

| Assunto | Arquivo |
|---|---|
| Contexto do projeto para IA e devs | `docs/contexto-projeto-ai.md` |
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Convenções de código | `docs/arquitetura/convencoes.md` |
| Design e tokens | `docs/design/tema-tailwind.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Tarefas e backlog | `docs/tarefas/` |
| Glossário do domínio | `docs/dominio/_glossario.md` |

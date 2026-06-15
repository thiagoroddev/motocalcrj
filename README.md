# MotoCalcRJ

Aplicação web para motoboys do Rio de Janeiro calcularem o custo operacional real de suas motos.
Cobre modelos populares de Honda e Yamaha (ex.: Pop 110i, Factor 125i, Lander 250).

## O Que Faz

- Onboarding guiado para configurar moto, rotina de trabalho e custos pessoais
- Estimativa de custo por km, hora, dia, semana, mês e ano
- Detalhamento por categoria: combustível, manutenção, revisão, seguro, alimentação e outros custos
- Edição de presets, preços de peças, mão de obra e últimas manutenções
- Persistência local no navegador (nenhum dado sai do aparelho)
- Instalável como PWA e uso offline após o primeiro acesso (sem depender de loja de apps)

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

## Deploy

App client-only (sem backend): o `npm run build` gera a pasta `dist/`, que é servida como site
estático. Hospedado na Vercel (build automático a partir do repositório; `vercel.json` cuida do
fallback de rotas SPA). Service worker e manifest do PWA são gerados no build.

## Documentação

| Assunto | Arquivo |
|---|---|
| Contexto do projeto para IA e devs | `docs/contexto-projeto-ai.md` |
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Convenções de código | `docs/arquitetura/convencoes.md` |
| Design e tokens | `docs/design/tema-tailwind.md` |
| ADRs(decisões) | `docs/arquitetura/ADR/` |
| Tarefas e backlog | `docs/tarefas/` | (189 tarefas com todas decisões documentadas)
| Glossário do domínio | `docs/dominio/_glossario.md` |
| Dados de pesquisa | `docs/dominio/informacoes-modelos-motos/` |
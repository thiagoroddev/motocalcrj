# Atividade Extensionista - Trabalho Final - RU: 4647621

# MotoCalcRJ

Aplicação web PWA que permite acesso offline após primeiro acesso (instalando no dispositivo móvel via browser), destinada aos motoboys e entregadores do Rio de Janeiro. Uma espécia de calculadora que facilita a estimativa aproximada por média, dos diversos custos de se ter uma motocicleta para trabalho em diferentes períodos de tempo, incluindo por quilômetro rodado, sendo altamente editável e adaptável à realidade de cada um.

Cobre modelos populares de Honda e Yamaha (ex.: Pop 110i, Factor 125i, Lander 250), possuindo no momento 14 modelos disponíveis (de 110cc a 250cc).

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

## Fontes de Dados

Os valores são **referências coletadas de fontes públicas** e podem estar desatualizados (o app
exibe um aviso de origem ao lado de cada dado). Nenhuma fonte é consultada em tempo de execução - os
dados ficam embutidos nos presets/configuração e são atualizados manualmente.

| Dado | Fonte |
|---|---|
| Valor do veículo (FIPE) | **API Parallelum FIPE** (`parallelum.com.br/fipe`) - coletada por script (`scripts/atualizar-fipe-presets.mjs`) e embutida nos presets |
| Preço de combustível | **ANP** - Levantamento de Preços de Combustíveis (pesquisa semanal), município do Rio de Janeiro |
| IPVA | **SEFAZ-RJ** - Lei nº 2877/97 e alterações (alíquota de motos) |
| Licenciamento (CRLV) | **DETRAN-RJ** - valor anual do estado do RJ |
| Revisões e mão de obra (concessionária) | **Sites oficiais das concessionárias** Honda e Yamaha |
| Preços de peças e pneus | **Marketplaces** - principalmente **Mercado Livre** e **Shopee**; lojas de peças genuínas/OEM (**Tração Motos Yamaha**, **Paulinho Motos**) |

Os links e capturas de cada coleta ficam versionados em `outros/` e
`docs/dominio/informacoes-modelos-motos/` (por modelo).

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
| Tarefas e backlog | `docs/tarefas/` | 
| Glossário do domínio | `docs/dominio/_glossario.md` |
| Dados de pesquisa | `docs/dominio/informacoes-modelos-motos/` |

Há mais de 190 tarefas documentadas em arquivos únicos e registradas num índice cronológico datado, onde todas decisões tomadas por mim em cada uma delas estão anotadas e rastreadas entre tarefas e ADRs, tornando todo o raciocínio de desenvolvimento disponível, claro e útil para estudo.
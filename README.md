# Atividade Extensionista - Trabalho Final - RU: 4647621

# MotoCustoRJ

**No ar em: https://motocustorj.vercel.app**

Aplicação web PWA que permite acesso offline após primeiro acesso (instalando no dispositivo móvel via browser), destinada aos motoboys e entregadores do Rio de Janeiro. Uma espécie de calculadora que facilita fazer estimativas aproximadas por média de diversos custos existentes ao se ter uma motocicleta para trabalho, permitindo visualiza-los em diferentes períodos de tempo e também por quilômetro rodado, sendo ainda altamente editável e adaptável à realidade de cada usuário.

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

A documentação possui mais de 190 tarefas registradas em arquivos únicos e em índice cronológico datado, onde todas decisões tomadas por mim podem ser rastreadas entre tarefas e ADRs, tornando todo o raciocínio de desenvolvimento disponível, claro e útil para estudo.

## Licença

Copyright (c) 2026 Thiago Silva Rodrigues (https://github.com/thiagoroddev). Todos os direitos reservados, exceto os concedidos pela licença.

Este projeto é distribuído sob a **[PolyForm Noncommercial License 1.0.0](./LICENSE.md)** — uma licença *source-available* (código aberto à consulta, **não** open-source no sentido OSI).

**O que é permitido:** usar, estudar, modificar e compartilhar o código para **fins não comerciais** — uso pessoal, pesquisa, estudo, projetos de hobby e por organizações sem fins lucrativos, educacionais ou governamentais.

**O que NÃO é permitido:** qualquer **uso comercial** do código ou de obras derivadas dele, sem autorização expressa e por escrito do autor.

O autor mantém a titularidade integral dos direitos sobre o projeto e reserva-se o direito de explorá-lo comercialmente e de licenciá-lo sob outros termos no futuro. Para licenciamento comercial, entre em contato com o autor.

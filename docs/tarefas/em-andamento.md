# Tarefas em Andamento

## TASK-REF-03 - Instalar shadcn/ui e criar wrappers em components/ui

- **Status:** Em desenvolvimento
- **Modo:** Strict
- **Valor:** Importante
- **Urgência:** Imediata
- **Esforço-H/IA:** G/G
- **Data origem:** 14/05/26 20:18
- **Início:** 14/05/26 20:24
- **Dependências:** -
- **REQ/ADR/DT:** RNF-COMP-02, RNF-COMP-03, RNF-COMP-05, RNF-05, RNF-06, RNF-12
- **Responsável:** IA + Humano
- **Observações:** Projeto atual foi feito sem shadcn/ui e concentra telas grandes. Esta tarefa prepara a base para refatorar usando shadcn quando existir componente adequado e criando componentes próprios quando não existir.

## Planejamento Aprovado

### Objetivo

Preparar a camada `src/components/ui/` para sustentar as refatorações `TASK-REF-01` e `TASK-REF-02`, reduzindo JSX duplicado e permitindo que páginas virem composição conforme RNF-COMP-01 a RNF-COMP-06.

### O que muda

| Arquivo/Pasta | Mudança prevista |
|---|---|
| `package.json` / `package-lock.json` | Adicionar dependências necessárias do shadcn/ui e utilitários de composição, conforme o CLI exigir. |
| `components.json` | Criar configuração do shadcn/ui se o CLI gerar. |
| `src/components/ui/` | Criar a camada de componentes base. Usar componentes shadcn quando existirem; criar wrappers próprios no mesmo padrão quando não houver componente pronto. |
| `src/lib/utils.ts` ou equivalente | Criar helper de composição de classes se necessário para shadcn/ui. |
| `tailwind.config.cjs` | Ajustar configuração somente se o shadcn/ui exigir integração de tema/animações. |
| `src/index.css` | Ajustar tokens CSS somente se necessário para compatibilidade com shadcn/ui, preservando a paleta atual. |
| `docs/tarefas/em-andamento.md` | Registrar decisões, comandos executados, bloqueios e validações. |

### Componentes alvo iniciais

- `Button`
- `Input`
- `Card`
- `Badge`
- `Switch`
- `Tabs`
- `Accordion`
- `Dialog`
- `Separator`
- `Toggle`
- `Sheet`, se necessário para o fluxo de navegação/hamburguer

### Critérios de execução

- Não refatorar `PaginaEstimativa.tsx` nem `PaginaDetalhamento.tsx` nesta tarefa, salvo ajuste mínimo necessário para validar import/build.
- Não alterar regras de cálculo, persistência, filtros ou comportamento de estimativa/detalhamento.
- Preferir componentes shadcn oficiais quando existirem.
- Criar componentes próprios em `src/components/ui/` quando o shadcn não oferecer equivalente direto, mantendo export nomeado, props tipadas e sem regra de negócio.
- Preservar idioma português no código próprio.

### Impactos possíveis

- Instalação de dependências novas.
- Criação de múltiplos arquivos em `src/components/ui/`.
- Pequenos ajustes de Tailwind/CSS para compatibilidade.
- Base visual pode mudar gradualmente nas refatorações seguintes, mas esta tarefa não deve redesenhar telas.

### Riscos

- CLI do shadcn/ui alterar arquivos de configuração mais do que o necessário.
- Incompatibilidade entre tokens atuais e tokens esperados pelo shadcn.
- Aumento inicial de dependências antes da redução de duplicação nas próximas tarefas.
- Componentes próprios serem criados cedo demais sem necessidade real.

### Dependências novas

A confirmar durante execução pelo CLI do shadcn/ui. Instalação de pacotes exige confirmação operacional antes de rodar comandos com rede.

### Testes/checks previstos

- `npm run lint`
- `npm run test`
- `npx tsc --noEmit`
- `npm run build`, se houver alteração relevante em configuração ou dependências

## Execução

- 20:24: Tarefa promovida de `pendentes.md` para `em-andamento.md`.
- 20:24: Planejamento aprovado registrado com orientação humana: projeto sem shadcn/ui será refatorado usando shadcn e componentes novos quando não existirem equivalentes.

## Decisões Tomadas

- A ordem das refatorações fica: `TASK-REF-03` antes de `TASK-REF-01` e `TASK-REF-02`, porque a camada `src/components/ui/` desbloqueia a componentização.
- Componentes shadcn serão preferidos; componentes próprios só serão criados quando não houver equivalente adequado.

## Bloqueios

Nenhum bloqueio técnico identificado até agora. A execução de instalação de dependências ainda precisa de confirmação operacional no momento de rodar comandos com rede.

## O que NÃO será feito nesta tarefa

- Refatorar `PaginaEstimativa.tsx`; isso pertence à `TASK-REF-01`.
- Refatorar `PaginaDetalhamento.tsx`; isso pertence à `TASK-REF-02`.
- Alterar funções de cálculo ou comportamento de custo.
- Alterar persistência, reducers ou storage.
- Redesenhar fluxos de produto.

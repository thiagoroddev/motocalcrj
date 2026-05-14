---
description: "Padrões de documentação para projetos com agentes de IA: contexto do projeto, requisitos, domínio, arquitetura, ADRs, dívida técnica e organização da pasta docs."
applyTo: "**/*.md"
---

# Padrões de Documentação para Agentes de IA

> Este arquivo define **como documentar** um projeto.
> Ele não define comportamento geral do agente, padrões de código, fluxo de tarefas, revisão ou segurança.

## Como este padrão se relaciona com os outros

| Arquivo | Relação |
|---|---|
| `Geral.agent.md` | Define prioridades, processo geral e quando pedir aprovação. |
| `codigo-react-typescript.agent.md` | Define padrões técnicos de código. A documentação não deve duplicar o que o código já expressa. |
| `tarefas.agent.md` | Define como tarefas entram, andam e são concluídas. |
| `revisao.agent.md` | Define como registrar achados de revisão e tarefas geradas. |
| `seguranca.agent.md` | Define regras de privacidade e segurança que também devem aparecer nos requisitos quando afetarem produto. |

---

## 1. Princípio central

**O código é a fonte primária da verdade técnica.**

A documentação deve guardar aquilo que o código sozinho não explica bem:

- contexto de produto;
- regras de negócio;
- decisões arquiteturais;
- justificativas;
- trade-offs;
- requisitos;
- invariantes;
- dívida técnica;
- fluxo de telas;
- histórico de decisões importantes.

Evite documentar o óbvio.

### Não documente

- nomes de funções autoexplicativas;
- estrutura de props que o TypeScript já descreve;
- funcionamento interno simples;
- comentários que só repetem o código;
- documentação oficial de bibliotecas externas.

### Documente

- por que uma decisão foi tomada;
- qual regra de negócio precisa ser preservada;
- quais alternativas foram descartadas;
- quais limitações são conscientes;
- quais requisitos uma feature atende;
- quais riscos existem.

---

## 2. Estrutura padrão da pasta `docs/`

Use esta estrutura como padrão inicial:

```txt
docs/
├── contexto-projeto-ai.md
├── requisitos/
│   ├── funcionais.md
│   ├── regras-negocio.md
│   └── nao-funcionais.md
├── dominios/
│   ├── glossario.md
│   ├── invariantes.md
│   ├── divida-tecnica.md
│   └── modelagem/
├── design/
│   ├── telas-navegacao.md
│   └── fluxos.md
├── arquitetura/
│   ├── visao-geral.md
│   ├── estado-inicial.md
│   ├── componentes-ui.md
│   ├── rotas.md
│   ├── convencoes.md
│   ├── padrao-testes.md
│   ├── tema-tailwind.md
│   ├── setup-inicial.md
│   └── ADR/
└── tarefas/
    ├── pendentes.md
    ├── em-andamento.md
    └── concluidas/
```

### Regra de caminho único

Não crie variações paralelas para o mesmo tipo de documento.

Use sempre:

| Conteúdo | Caminho correto |
|---|---|
| Contexto de entrada para IA | `docs/contexto-projeto-ai.md` |
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não-funcionais | `docs/requisitos/nao-funcionais.md` |
| Glossário | `docs/dominios/glossario.md` |
| Invariantes | `docs/dominios/invariantes.md` |
| Dívida técnica | `docs/dominios/divida-tecnica.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Tarefas | `docs/tarefas/` |

---

## 3. `README.md`

O `README.md` da raiz é para humanos.

Ele deve conter:

- nome do projeto;
- descrição curta;
- stack principal;
- como instalar;
- como rodar;
- comandos principais;
- link para `docs/contexto-projeto-ai.md`.

Modelo:

````md
# [Nome do Projeto]

> [Descrição curta do produto e para quem ele serve.]

## Stack

| Tecnologia | Uso |
|---|---|
| React | Interface |
| TypeScript | Tipagem |
| Tailwind CSS | Estilização |
| Node.js | Backend ou scripts |

## Como rodar

```bash
npm install
npm run dev
```

## Documentação

- Contexto para IA: `docs/contexto-projeto-ai.md`
- Requisitos: `docs/requisitos/`
- Arquitetura: `docs/arquitetura/`
- Tarefas: `docs/tarefas/`
````

### Evite no README

- histórico longo de decisões;
- detalhes internos que pertencem à arquitetura;
- requisitos completos;
- listas enormes de tarefas.

---

## 4. `docs/contexto-projeto-ai.md`

Este é o **ponto de entrada da IA no projeto**.

Quando um agente entrar no projeto, deve ler este arquivo primeiro.

Ele deve conter links e contexto, não duplicar todos os documentos.

Modelo:

````md
# Contexto do Projeto: [Nome]

> Este arquivo é o ponto de entrada para agentes de IA.

## Resumo do Produto

[Descrição curta do que o sistema faz.]

## Stack Exata

| Tecnologia | Versão | Observação |
|---|---|---|
| React | [versão] | |
| TypeScript | [versão] | |
| Tailwind | [versão] | |

## Estrutura Real do Projeto

```txt
src/
├── components/
├── hooks/
├── services/
├── types/
└── pages/
```

## Documentos Principais

| Tema | Arquivo |
|---|---|
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Não-funcionais | `docs/requisitos/nao-funcionais.md` |
| Glossário | `docs/dominios/glossario.md` |
| Invariantes | `docs/dominios/invariantes.md` |
| Arquitetura | `docs/arquitetura/visao-geral.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Tarefas | `docs/tarefas/` |

## Decisões Imutáveis Atuais

- Idioma do código: [Português/Inglês]
- Gerenciador de estado: [ex: Context + useReducer]
- Testes: [ex: Vitest]
- Roteamento: [ex: React Router]

## Como trabalhar neste projeto

1. Ler este arquivo.
2. Ler requisitos relacionados à tarefa.
3. Ler ADRs relacionadas, se houver.
4. Planejar a alteração.
5. Seguir o fluxo em `tarefas.agent.md`.
````

---

## 5. Requisitos

Requisitos são a fonte de verdade sobre **o que o sistema deve fazer**.

Não crie requisito novo sem motivo claro. Quando precisar criar, explique a razão e peça aprovação se isso alterar escopo do produto.

### 5.1 Requisitos funcionais

Arquivo:

```txt
docs/requisitos/funcionais.md
```

Modelo:

```md
# Requisitos Funcionais

| ID | Descrição | Prioridade | Status | Regras Relacionadas | Tasks | Data de Origem |
|---|---|---|---|---|---|---|
| RF-001 | O usuário pode criar uma conta. | MUST | [ ] | RN-001 | RF-001.1 | 2026-05-13 |
```

Use requisitos funcionais para comportamentos visíveis ao usuário.

### 5.2 Regras de negócio

Arquivo:

```txt
docs/requisitos/regras-negocio.md
```

Modelo:

```md
# Regras de Negócio

| ID | Regra | Entidade/Domínio | Origem | ADR | Data de Origem |
|---|---|---|---|---|---|
| RN-001 | Todo pedido deve ter pelo menos um item. | Pedido | Stakeholder | - | 2026-05-13 |
```

Use regras de negócio para verdades do domínio.

### 5.3 Requisitos não-funcionais

Arquivo:

```txt
docs/requisitos/nao-funcionais.md
```

Modelo:

```md
# Requisitos Não-Funcionais

| ID | Descrição | Métrica | Status | RF Relacionado | ADR |
|---|---|---|---|---|---|
| RNF-001 | A interface deve ter acessibilidade mínima. | Lighthouse A11y >= 95 | [ ] | - | - |
```

Use RNF para performance, acessibilidade, segurança, privacidade, compatibilidade, PWA, responsividade e limites técnicos.

---

## 6. Glossário de domínio

Arquivo:

```txt
docs/dominios/glossario.md
```

Modelo:

```md
# Glossário

| Termo | Definição | Sinônimos Proibidos | ADR Relacionada |
|---|---|---|---|
| Pedido | Solicitação de compra feita por um cliente. | Order, compra | - |
```

### Regras

- Um termo deve ter um significado único.
- Se o código usa um termo, a documentação deve usar o mesmo termo.
- Se houver conflito de nomes, o glossário decide.
- Não traduza metade do domínio para português e metade para inglês.

---

## 7. Invariantes

Arquivo:

```txt
docs/dominios/invariantes.md
```

Invariante é uma regra que **nunca pode ser violada**.

Modelo:

```md
# Invariantes

| ID | Invariante | Entidade | Protegida Por | Testes |
|---|---|---|---|---|
| INV-001 | `dataFim >= dataInicio` | Periodo | `validarPeriodo()` | `periodo.test.ts` |
```

Crie uma invariante quando a regra precisa ser verdadeira em qualquer ponto do sistema.

---

## 8. Modelagem de domínio

Pasta:

```txt
docs/dominios/modelagem/
```

Use para explicar entidades, value objects, aggregates e eventos de domínio quando o projeto tiver lógica de negócio relevante.

Modelo de entidade:

```md
# Entidade: [Nome]

## Conceito

[O que isso representa no mundo real.]

## Identidade

[Como é identificado unicamente.]

## Atributos

| Atributo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | string | Sim | Identificador único. |

## Invariantes

- [regra que nunca pode ser falsa]

## Comportamentos

- `metodo()`: [o que faz]
```

### Evite

- transformar todo campo em entidade;
- criar modelagem DDD para CRUD simples;
- documentar domínio sem verificar o código existente.

---

## 9. Dívida técnica

Arquivo:

```txt
docs/dominios/divida-tecnica.md
```

Dívida técnica é algo que decidimos **não resolver agora**, com consciência.

Modelo:

```md
# Dívida Técnica

| ID | Descrição | Impacto | Gatilho | ADR | Status |
|---|---|---|---|---|---|
| DT-001 | Serviço X mistura validação e persistência. | Dificulta testes. | Quando nova regra for adicionada ao serviço X. | - | Aberta |
```

### Diferença entre dívida e tarefa

| Tipo | Significado |
|---|---|
| Dívida técnica | Problema conhecido adiado conscientemente. |
| Tarefa pendente | Ação que já decidimos executar. |

### Regra prática

- Já decidimos fazer? Vai para `docs/tarefas/pendentes.md`.
- Decidimos não fazer agora, mas não queremos esquecer? Vai para `docs/dominios/divida-tecnica.md`.
- O gatilho da dívida aconteceu? A dívida vira tarefa e sai da lista de dívidas abertas.

---

## 10. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

Use para documentar estrutura técnica que não deve ficar espalhada.

| Arquivo | Conteúdo |
|---|---|
| `visao-geral.md` | Estrutura técnica principal e decisões estáveis. |
| `estado-inicial.md` | Inicialização, persistência, hidratação, storage. |
| `componentes-ui.md` | Componentes base, wrappers e design system. |
| `rotas.md` | Rotas, páginas e proteção de acesso. |
| `convencoes.md` | Convenções específicas do projeto. |
| `padrao-testes.md` | Como testar neste projeto. |
| `tema-tailwind.md` | Tokens, cores, fontes, classes utilitárias. |
| `setup-inicial.md` | Como configurar o projeto do zero. |
| `ADR/` | Decisões arquiteturais importantes. |

---

## 11. ADRs

ADR significa **Architectural Decision Record**.

Use ADR para decisões importantes, difíceis de reverter ou que afetam a estrutura do projeto.

Pasta:

```txt
docs/arquitetura/ADR/
```

Modelo:

```md
# ADR-001: [Título]

**Data:** YYYY-MM-DD
**Status:** Proposta / Aceita / Depreciada / Substituída

## Contexto

[Por que a decisão precisou ser tomada.]

## Decisão

[O que foi decidido.]

## Consequências

### Positivas

- [benefício]

### Trade-offs aceitos

- [custo]

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| [opção] | [motivo] |

## Requisitos relacionados

- Motivada por: RF-XXX, RNF-XXX
- Afeta: RF-YYY

## Tarefas geradas

- [ID]: [descrição]

## Histórico

| Data | Mudança |
|---|---|
| YYYY-MM-DD | Criação da ADR. |
```

### Quando criar ADR

Crie ADR para:

- escolha de arquitetura;
- troca de stack;
- padrão de estado global;
- estratégia de persistência;
- decisão sobre design system;
- regra estrutural que afeta muitos arquivos;
- integração externa importante;
- decisão de segurança com impacto no produto.

### Quando não criar ADR

Não crie ADR para:

- typo;
- refatoração pequena;
- ajuste visual simples;
- componente isolado sem impacto arquitetural;
- decisão já coberta por requisito ou convenção existente.

---

## 12. Design e navegação

Pasta:

```txt
docs/design/
```

Use para mapa de telas, fluxo de navegação, tradução de Figma para componentes, estados de tela e especificação visual que o código ainda não expressa.

Modelo de tela:

```md
# Tela: [Nome]

## Objetivo

[Para que a tela existe.]

## Rota

`/rota`

## Estados

| Estado | Condição | Renderização |
|---|---|---|
| Carregando | `isLoading === true` | Skeleton |
| Vazio | sem dados | Estado vazio |
| Erro | erro de fetch | Alerta com retry |
| Pronto | dados carregados | Conteúdo principal |

## Componentes

| Elemento visual | Componente | Observação |
|---|---|---|
| Botão salvar | `Botao` | Variante primária |
```

---

## 13. Engenharia reversa de projeto existente

Quando entrar em um projeto novo ou mal documentado:

1. Leia `package.json`.
2. Leia configs principais: `tsconfig`, `vite`, `tailwind`, `eslint`.
3. Leia `src/` e identifique estrutura real.
4. Leia rotas e páginas.
5. Leia services, hooks e stores.
6. Leia testes existentes.
7. Leia docs antigas, se houver.
8. Crie ou atualize `docs/contexto-projeto-ai.md`.
9. Crie a estrutura padrão de `docs/` se ela não existir.
10. Arquive documentação antiga fora do padrão em `docs/arquivo/`.

### Regra importante

Não invente documentação.

Se o código não mostra algo com clareza, registre como:

```md
> Pendente de validação humana.
```

---

## 14. Arquivamento de documentação antiga

Nunca delete documentação antiga sem autorização explícita.

Quando houver documentos fora do padrão:

1. Crie `docs/arquivo/`.
2. Mova os documentos antigos para lá.
3. Não use esses documentos como fonte oficial depois da migração.
4. Registre no relatório final o que foi arquivado.

Modelo de registro:

```md
## Documentos arquivados

| Origem | Destino | Motivo |
|---|---|---|
| `docs/ux/` | `docs/arquivo/ux/` | Fora da estrutura padrão atual. |
```

---

## 15. Histórico de mudanças

Documentos importantes devem ter histórico quando forem usados como fonte de verdade.

Use histórico em:

- requisitos;
- glossário;
- invariantes;
- ADRs;
- dívida técnica.

Modelo:

```md
## Histórico

| Data | Mudança | Motivo |
|---|---|---|
| 2026-05-13 | Criado documento inicial. | Padronização da documentação. |
```

---

## 16. Checklist antes de concluir documentação

Antes de finalizar uma alteração em docs, verifique:

```md
- [ ] Não dupliquei informação que já existe no código.
- [ ] Usei o caminho padrão correto.
- [ ] Atualizei links relacionados.
- [ ] Não criei requisito novo sem motivo claro.
- [ ] Não misturei dívida técnica com tarefa pendente.
- [ ] Não criei ADR para decisão trivial.
- [ ] Marquei como pendente o que precisa de validação humana.
- [ ] Arquivei docs antigas em vez de deletar.
```

---

## 17. Regra final

Documentação boa reduz dúvida futura.

Documentação ruim aumenta ruído.

Se a documentação não ajuda o próximo agente ou humano a tomar uma decisão melhor, ela provavelmente não deveria existir.

---

## description: "Catálogo de todos os módulos do pacote .agent/. Mapa de navegação." versao: "3.0"

# 📑 Índice do Pacote `.agent/`

> Catálogo completo. Use para descobrir o que existe. Para **quando carregar** cada módulo, veja a tabela de carregamento no [núcleo](https://claude.ai/chat/01-nucleo.md#9-tabela-de-carregamento-de-m%C3%B3dulos).

agente/
├── 00-INDICE.md                    ← Mapa de quando carregar cada arquivo
├── 01-nucleo.md                    ← SEMPRE carregado (~2k tokens)
│
├── padroes/                        ← Carregar sob demanda conforme tarefa
│   ├── 10-codigo-e-convencoes.md
│   ├── 11-arquitetura-e-pastas.md
│   ├── 12-react-e-estado.md
│   ├── 13-ui-e-design-system.md
│   ├── 14-formularios-e-validacao.md
│   ├── 15-testes.md
│   ├── 16-performance-acessibilidade.md
│   ├── 17-backend-node.md          ← NOVO (lacuna do documento atual)
│   └── 18-seguranca-privacidade.md
│
├── processos/                      ← Carregar quando aplicável
│   ├── 20-ciclo-tarefa.md
│   ├── 21-revisao-codigo.md
│   ├── 22-refatoracao.md
│   ├── 23-modelagem-dominio.md
│   ├── 24-figma-para-codigo.md
│   ├── 25-analise-impacto.md
│   ├── 26-inicializacao-projeto.md
│   └── 27-revisao-geral.md
│
├── templates/                      ← Consulta quando vai gerar artefato
│   ├── 30-task-em-andamento.md
│   ├── 31-task-concluida.md
│   ├── 32-adr.md
│   ├── 33-contexto-projeto-ai.md   ← NOVO (lacuna identificada)
│   ├── 34-readme-projeto.md
│   ├── 35-componente-ui.md
│   ├── 36-hook-feature.md
│   └── 37-revisao-geral.md
│
├── checklists/                     ← Verificações rápidas
│   ├── 40-revisao-rapida.md
│   ├── 41-seguranca.md
│   ├── 42-acessibilidade.md
│   └── 43-performance.md
│
└── referencias/                    ← Material denso, consulta rara
    ├── 50-anti-padroes.md
    ├── 51-comandos.md
    ├── 52-glossario-termos-tecnicos.md
    └── 53-changelog.md

---

## 🎯 Convenção de Numeração

|Faixa|Categoria|
|---|---|
|00-09|Meta (índice, núcleo)|
|10-19|Padrões de código (como escrever)|
|20-29|Processos (como trabalhar)|
|30-39|Templates (formatos para preencher)|
|40-49|Checklists (verificações)|
|50-59|Referências (consulta densa)|

---

## 📂 Estrutura Completa

### Raiz `.agent/`

|Arquivo|Descrição|
|---|---|
|[`00-INDICE.md`](https://claude.ai/chat/00-INDICE.md)|Este arquivo. Catálogo de navegação.|
|[`01-nucleo.md`](https://claude.ai/chat/01-nucleo.md)|Princípios, processo, hierarquia. **Sempre carregado.**|

---

### 📁 `padroes/` - Como escrever código

Carregar quando a tarefa envolver escrever ou revisar código.

|Arquivo|Conteúdo|
|---|---|
|[`10-codigo-e-convencoes.md`](https://claude.ai/chat/padroes/10-codigo-e-convencoes.md)|Nomenclatura, idioma, formatação, proibições absolutas detalhadas|
|[`11-arquitetura-e-pastas.md`](https://claude.ai/chat/padroes/11-arquitetura-e-pastas.md)|Estrutura de pastas padrão, onde cada coisa vive, regras de ouro|
|[`12-react-e-estado.md`](https://claude.ai/chat/padroes/12-react-e-estado.md)|Padrão de hook de feature, page limpa, estado global, prop drilling|
|[`13-ui-e-design-system.md`](https://claude.ai/chat/padroes/13-ui-e-design-system.md)|Componentes UI, wrappers, shadcn/Radix, acessibilidade visual|
|[`14-formularios-e-validacao.md`](https://claude.ai/chat/padroes/14-formularios-e-validacao.md)|react-hook-form, Zod, padrão de validação, mensagens de erro|
|[`15-testes.md`](https://claude.ai/chat/padroes/15-testes.md)|Vitest, AAA, cobertura mínima, user-event, atualização de testes|
|[`16-performance-acessibilidade.md`](https://claude.ai/chat/padroes/16-performance-acessibilidade.md)|Lighthouse, code splitting, React.memo, ARIA, contraste, toque mínimo|
|[`17-backend-node.md`](https://claude.ai/chat/padroes/17-backend-node.md)|**Stub mínimo** - Node/Express/Prisma. A expandir quando entrar projeto backend.|
|[`18-seguranca-privacidade.md`](https://claude.ai/chat/padroes/18-seguranca-privacidade.md)|XSS, CSP, dados pessoais, .env, sanitização, princípio "emprestar dispositivo"|

---

### 📁 `processos/` - Como conduzir o trabalho

Carregar quando a tarefa envolver tomar decisão sobre processo, não código.

|Arquivo|Conteúdo|
|---|---|
|[`20-ciclo-tarefa.md`](https://claude.ai/chat/processos/20-ciclo-tarefa.md)|Pendente → Em Andamento → Concluída. Estrutura de arquivos.|
|[`21-revisao-codigo.md`](https://claude.ai/chat/processos/21-revisao-codigo.md)|Checklist, dimensões, formato de revisão, tarefas geradas|
|[`22-refatoracao.md`](https://claude.ai/chat/processos/22-refatoracao.md)|Code smells, SOLID em React, Regra de Três, refatorar com rede de segurança|
|[`23-modelagem-dominio.md`](https://claude.ai/chat/processos/23-modelagem-dominio.md)|DDD tático adaptado, entidade, VO, aggregate, invariantes|
|[`24-figma-para-codigo.md`](https://claude.ai/chat/processos/24-figma-para-codigo.md)|Análise visual, spec técnica, planejamento de componentes|
|[`25-analise-impacto.md`](https://claude.ai/chat/processos/25-analise-impacto.md)|Análise antes de feature em sistema existente|
|[`26-inicializacao-projeto.md`](https://claude.ai/chat/processos/26-inicializacao-projeto.md)|Engenharia reversa, criação da estrutura, arquivamento de docs antigas|
|[`27-revisao-geral.md`](https://claude.ai/chat/processos/27-revisao-geral.md)|Revisão completa do projeto, somente quando o humano pedir, registrada em `REV-NNN.md`|

---

### 📁 `templates/` - Formatos prontos para preencher

Consultar quando precisar gerar um artefato com formato padrão.

|Arquivo|Conteúdo|
|---|---|
|[`30-task-em-andamento.md`](https://claude.ai/chat/templates/30-task-em-andamento.md)|Template para `docs/tarefas/em-andamento.md`|
|[`31-task-concluida.md`](https://claude.ai/chat/templates/31-task-concluida.md)|Template para `docs/tarefas/concluidas/[PREFIXO]-XXX-YYYY-MM-DD-HHhMM.md`|
|[`32-adr.md`](https://claude.ai/chat/templates/32-adr.md)|Template para Architecture Decision Record|
|[`33-contexto-projeto-ai.md`](https://claude.ai/chat/templates/33-contexto-projeto-ai.md)|Template do arquivo de contexto que vive em cada projeto|
|[`34-readme-projeto.md`](https://claude.ai/chat/templates/34-readme-projeto.md)|Template de README.md para a raiz do projeto|
|[`35-componente-ui.md`](https://claude.ai/chat/templates/35-componente-ui.md)|Esqueleto de componente UI com forwardRef + variantes|
|[`36-hook-feature.md`](https://claude.ai/chat/templates/36-hook-feature.md)|Esqueleto de hook de feature (estado + memo + callbacks)|
|[`37-revisao-geral.md`](https://claude.ai/chat/templates/37-revisao-geral.md)|Template para `docs/arquitetura/revisoes-gerais/REV-NNN.md`|

---

### 📁 `checklists/` - Verificações antes de entregar

Carregar antes de finalizar tarefa ou abrir revisão.

|Arquivo|Conteúdo|
|---|---|
|[`40-revisao-rapida.md`](https://claude.ai/chat/checklists/40-revisao-rapida.md)|Checklist geral (idioma, any, storage, console.log, etc.)|
|[`41-seguranca.md`](https://claude.ai/chat/checklists/41-seguranca.md)|Checklist de segurança bloqueante|
|[`42-acessibilidade.md`](https://claude.ai/chat/checklists/42-acessibilidade.md)|Labels, ARIA, contraste, foco, toque mínimo|
|[`43-performance.md`](https://claude.ai/chat/checklists/43-performance.md)|LCP, INP, CLS, bundle, re-renders|

---

### 📁 `referencias/` - Consulta densa

Carregar quando precisar de detalhes específicos. Não são leitura corrida.

|Arquivo|Conteúdo|
|---|---|
|[`50-anti-padroes.md`](https://claude.ai/chat/referencias/50-anti-padroes.md)|Catálogo completo de anti-padrões (núcleo tem só os críticos)|
|[`51-comandos.md`](https://claude.ai/chat/referencias/51-comandos.md)|Comandos npm, vitest, análise estática|
|[`52-glossario-termos-tecnicos.md`](https://claude.ai/chat/referencias/52-glossario-termos-tecnicos.md)|Glossário de termos do pacote (não confundir com glossário do projeto)|
|[`53-changelog.md`](https://claude.ai/chat/referencias/53-changelog.md)|Histórico de mudanças deste pacote|

---

## 🧭 Como Navegar Eficientemente

1. **Em toda interação:** [`01-nucleo.md`](https://claude.ai/chat/01-nucleo.md) já está carregado.
2. **Diante de uma tarefa nova:** consulte a [tabela de carregamento](https://claude.ai/chat/01-nucleo.md#9-tabela-de-carregamento-de-m%C3%B3dulos) no núcleo.
3. **Diante de uma dúvida específica:** use o catálogo acima para encontrar o módulo certo.
4. **Antes de entregar:** rode o checklist apropriado em `checklists/`.

---

## 🔗 Relação com o Projeto

|Lugar|Pertence a|
|---|---|
|`.agent/` (este pacote)|O agente (portável entre projetos)|
|`docs/` (do projeto)|O projeto específico|

Os dois nunca se confundem. Mudanças no agente não afetam o projeto e vice-versa.

A única ponte entre eles é o `docs/contexto-projeto-ai.md`, que **vence** o núcleo em quase tudo (ver [hierarquia de regras](https://claude.ai/chat/01-nucleo.md#13-hierarquia-de-regras-resolu%C3%A7%C3%A3o-de-conflito)).

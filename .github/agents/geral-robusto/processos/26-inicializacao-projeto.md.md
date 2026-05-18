---

description: "Inicialização e migração de projeto: engenharia reversa, criação de contexto-projeto-ai, estrutura de docs, arquivamento." modulo: "26" categoria: "processos" versao: "1.0" relacionado:

- "01-nucleo.md"
- "11-arquitetura-e-pastas.md"
- "../templates/33-contexto-projeto-ai.md"
- "../templates/34-readme-projeto.md"

---

# 🚀 Inicialização de Projeto

> O momento mais ignorado em material técnico: **como entrar num projeto que já existe**. Tutoriais ensinam a começar do zero ou manter um projeto vivo. Raramente ensinam a aterrissar num projeto que tem código mas não tem o contrato deste pacote.

---

## 1. Quando Este Módulo Dispara

Use este módulo quando uma das três situações for verdadeira:

|Cenário|Sintoma|
|---|---|
|**A** — Projeto novo sem documentação|Não existe `docs/contexto-projeto-ai.md` nem estrutura equivalente|
|**B** — Projeto com docs fora do padrão|Existe documentação mas não segue a estrutura do [módulo 11](https://claude.ai/padroes/11-arquitetura-e-pastas.md)|
|**C** — Projeto com docs que divergem do código|Doc antiga descreve uma coisa, código faz outra|

Para todos os três, o objetivo é **chegar ao mesmo estado**: projeto com `.agent/` (este pacote) + `docs/` no padrão definido aqui.

### 1.1 Quando NÃO Aplica

- Projeto que **já tem** `docs/contexto-projeto-ai.md` no padrão deste pacote
- Você está apenas dando manutenção em projeto bem documentado
- Está adicionando feature isolada — use [módulo 20](https://claude.ai/chat/20-ciclo-tarefa.md)

---

## 2. Princípios da Engenharia Reversa

Antes de começar, internalize estas regras:

### 2.1 Código é a Verdade Primária

> **Se documentação antiga e código discordam, o código vence.**

Sem exceções. Doc antiga pode estar:

- Desatualizada (alguém mudou código sem atualizar)
- Errada desde o início (autor descreveu intenção, não realidade)
- Parcialmente correta (alguns pontos sim, outros não)

O código mostra **o que realmente acontece**. Comece pelo código; doc antiga é secundária.

### 2.2 Não Invente

> **Se o código não diz, não coloque no documento.**

Tentação clássica: você lê algo ambíguo no código e "completa" com suposição razoável. **Não.** Melhor deixar vazio que escrever errado.

Para informações que não dá para extrair do código (regra de negócio externa, motivação de decisão), **pergunte ao humano** ou marque como pendente.

### 2.3 Engenharia Reversa NÃO É Onisciência

Em projeto pequeno (< 50 arquivos de código), você consegue ler tudo. Em projeto grande, **inviável**.

|Tamanho do projeto|Estratégia|
|---|---|
|< 50 arquivos|Análise completa do código|
|50-200 arquivos|Análise dos pontos-chave + perguntas ao humano|
|200+ arquivos|**Peça resumo inicial ao humano**; valide pontos no código|

Não é desistir — é eficiência. Humano que conhece o projeto resume em 30 minutos o que você levaria 2 dias para extrair.

### 2.4 Nunca Delete Documentação Antiga

Mesmo que a doc velha esteja errada, ela **carrega contexto histórico**:

- Decisões antigas (mesmo que revogadas)
- Linguagem usada no início do projeto
- Pistas sobre evolução

**Arquive em `docs/arquivo/`.** Nunca delete sem autorização explícita.

### 2.5 Pause em Caso de Dúvida

Não tem ranking de "regras óbvias" — se algo ambíguo aparece, **pergunte ao humano**. Inicialização errada gera ruído por meses.

---

## 3. Visão Geral: 5 Fases

```
Fase 1: Analisar o código existente
    │
    ▼
Fase 2: Criar contexto-projeto-ai.md (a partir da análise)
    │
    ▼
Fase 3: Criar estrutura padrão de docs/
    │
    ▼
Fase 4: Arquivar documentação antiga
    │
    ▼
Fase 5: Relatório final ao humano
```

Cada fase tem entregável próprio. Você pode pausar entre fases para validar com o humano.

---

## 4. Fase 1: Analisar o Código Existente

Antes de escrever qualquer documento, **leia o código** e registre o que aprender.

### 4.1 Arquivos a Inspecionar Primeiro

```
package.json           # dependências, scripts, versões
tsconfig.json          # strict, paths, baseUrl
vite.config.ts         # plugins, PWA, configurações
                       # (ou next.config.js, etc.)
tailwind.config.*      # design tokens, fontes, cores
src/index.css          # variáveis CSS, base
src/main.tsx           # ponto de entrada
src/App.tsx            # estrutura raiz, providers
src/routes ou similar  # rotas configuradas
.env.example           # variáveis de ambiente
README.md              # se existir, contexto humano
```

Estes arquivos dão **80% do contexto técnico** com pouca leitura.

### 4.2 Estrutura de Pastas Real

```bash
ls src/
ls src/components/
```

Mapeie o que existe **realmente** — não o que módulo 11 diz que **deveria** existir. Se o projeto tem `src/screens/` em vez de `src/pages/`, registre isso.

### 4.3 Pontos-Chave a Mapear

Para cada item, registre o que encontrou:

|Item|Onde olhar|O que registrar|
|---|---|---|
|Stack|`package.json` deps|Versões exatas de React, TypeScript, Vite, Tailwind|
|Estrutura de pastas|`src/`|Layout real (pode divergir do padrão)|
|Rotas|`App.tsx`, `routes.tsx`, `pages/`|Lista de rotas + acesso|
|Estado global|`context/`, `stores/`, `hooks/use*.ts`|Qual padrão é usado|
|Serviços|`services/`, `api/`, `lib/`|APIs, storage, integrações|
|Componentes UI|`components/ui/`|O que já existe|
|Tema/Design|`tailwind.config`, `index.css`|Tokens, fontes, cores|
|Testes|`vitest.config`, `*.test.*`|Setup, padrão usado|
|Linter/Formatter|`.eslintrc`, `.prettierrc`|Configuração|
|Convenções|Olhar 5-10 arquivos similares|Idioma, nomenclatura|

### 4.4 Convenções Implícitas

Algumas convenções não estão em arquivo de config — estão **no código real**. Identifique:

- **Idioma:** maioria dos nomes em PT ou EN?
- **Nomenclatura:** boolean usa `is`/`has` ou `eh`/`tem`?
- **Componentes:** PascalCase em arquivos e exports?
- **Hooks:** convenção de retorno (objeto, array, contexto)?
- **Imports:** absoluto (`@/`) ou relativo?

Vasculhe 5-10 arquivos representativos. Padrão claro = convenção do projeto. Padrão ausente = candidato a registrar **decisão a tomar**.

### 4.5 Documentos Antigos (Se Existirem)

Se há documentação anterior:

- Liste todos os arquivos em `docs/` (ou onde estiver)
- Identifique o que cada um cobre
- Marque divergências com o código (sem corrigir ainda)
- Anote regras de negócio que podem ser úteis para migrar

### 4.6 Saída da Fase 1

Você termina com um **rascunho mental ou em arquivo temporário** contendo:

- Stack exata
- Estrutura de pastas real
- Lista de rotas
- Padrão de estado, serviços, componentes
- Convenções implícitas detectadas
- Lista de docs antigos a arquivar
- **Lista de pontos pendentes** (coisas que não dão para inferir do código)

Para projetos grandes, esta saída pode ser o resumo que o **humano** te deu, validado com inspeção pontual do código.

---

## 5. Fase 2: Criar `contexto-projeto-ai.md`

Com o levantamento da Fase 1, crie o arquivo principal de entrada para futuras IAs.

### 5.1 Onde Mora

```
docs/contexto-projeto-ai.md
```

Este arquivo é o **único** que toda IA que entrar no projeto vai consultar primeiro. Tudo mais é referenciado por links daqui.

### 5.2 O Que Deve Conter

Conteúdo essencial (template completo no [`templates/33`](https://claude.ai/templates/33-contexto-projeto-ai.md)):

```markdown
# Contexto do Projeto [Nome]

> Informações que o código NÃO expressa ou que são difíceis de inferir.

## Visão do Produto
[1-2 parágrafos sobre o que o produto faz e para quem]

## Stack Exata
| Tecnologia | Versão | Nota |
|---|---|---|
| React | 18.3 | strict mode |
| TypeScript | 5.6 | strict, no path alias `@/` |
| Tailwind | 3.4 | com shadcn/ui |
| Vite | 5.4 | com PWA plugin |

## Estrutura Real de Pastas
[Descrição do que existe agora]

## Rotas
| Rota | Page | Acesso |
|---|---|---|
| `/login` | PaginaLogin | público |
| `/perfil` | PaginaPerfil | autenticado |

## Decisões Arquiteturais Inegociáveis
- Idioma: Português
- Estado global: Context + useReducer
- Validação: Zod schemas
- Testes: Vitest com Testing Library

## Convenções Específicas do Projeto
- Imports absolutos via `@/` (configurado em tsconfig)
- Hooks de feature retornam objeto com nomes em português
- Forms usam `react-hook-form` + Zod
- Storage isolado em `services/[nome]Storage.ts`

## O Que Este Projeto NÃO Faz (ainda)
- Não tem autenticação por OAuth (planejado: RF-9.2)
- Não tem testes E2E (decisão consciente, ver ADR-005)
- Backend é stub mínimo, sem persistência real

## Documentação de Referência
- Requisitos: `docs/requisitos/`
- Modelagem: `docs/dominios/`
- Decisões arquiteturais: `docs/arquitetura/ADR/`
- Tarefas: `docs/tarefas/`

## Hierarquia de Conflito
1. Este arquivo vence regras gerais do pacote `.agent/`
2. **Exceções inegociáveis** (ver `.agent/01-nucleo.md` seção 1.3):
   - Confirmação antes de ações destrutivas
   - Proibição de `any` sem justificativa
   - Código é verdade primária
```

### 5.3 Princípio: Conciso

`contexto-projeto-ai.md` é o **único arquivo lido em toda interação**. Tem que ser **curto**. Detalhe vai em arquivos linkados:

- Requisitos detalhados → `docs/requisitos/`
- Decisões com motivos → `docs/arquitetura/ADR/`
- Glossário extenso → `docs/dominios/glossario.md`

Aqui apenas o **mínimo necessário** para a IA saber para onde olhar.

### 5.4 Validação com o Humano

Antes de criar a estrutura completa de docs (Fase 3), **mostre o `contexto-projeto-ai.md`** para o humano e peça validação:

> "Criei este arquivo com base na análise do código. Confirma que está fiel ao projeto? Algum ponto importante está faltando?"

Correções aqui são baratas. Corrigir depois (com 15 outros docs derivados) é caro.

---

## 6. Fase 3: Criar Estrutura Padrão de Docs

Com o `contexto-projeto-ai.md` aprovado, crie a estrutura completa de `docs/`.

### 6.1 Estrutura Alvo

Conforme [módulo 11, seção 9](https://claude.ai/padroes/11-arquitetura-e-pastas.md#9-estrutura-padr%C3%A3o-de-docs):

```
docs/
├── contexto-projeto-ai.md          # já criado na Fase 2
├── README.md                       # para humanos (pode reaproveitar existente)
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
├── arquitetura/
│   ├── visao-geral.md
│   ├── convencoes.md
│   ├── rotas.md
│   ├── componentes-ui.md
│   ├── tema-tailwind.md
│   ├── padrao-testes.md
│   ├── setup-inicial.md
│   └── ADR/
└── tarefas/
    ├── pendentes.md
    ├── em-andamento.md
    └── concluidas/
```

### 6.2 O Que Preencher Imediatamente

Nem todos os arquivos precisam estar populados na Fase 3. O essencial:

|Arquivo|Preencher na Fase 3?|Conteúdo inicial|
|---|---|---|
|`README.md`|Sim (mantenha existente se há)|Visão geral + como rodar|
|`requisitos/funcionais.md`|Parcial|RFs que dá para extrair do código|
|`requisitos/regras-negocio.md`|Parcial|RNs extraídas de validações e guards|
|`requisitos/nao-funcionais.md`|Parcial|RNFs evidentes (PWA, responsividade)|
|`dominios/glossario.md`|Mínimo|Termos que aparecem no código|
|`dominios/invariantes.md`|Mínimo|Invariantes em validações Zod ou similares|
|`dominios/divida-tecnica.md`|Vazio com cabeçalho|Pronto para receber registros futuros|
|`arquitetura/visao-geral.md`|Sim|Estrutura de pastas + decisões inegociáveis|
|`arquitetura/convencoes.md`|Sim|Resumo extraído da análise da Fase 1|
|`arquitetura/rotas.md`|Sim|Lista completa|
|`arquitetura/componentes-ui.md`|Sim|Componentes existentes|
|`arquitetura/tema-tailwind.md`|Sim|Tokens encontrados|
|`arquitetura/padrao-testes.md`|Sim|Setup atual|
|`arquitetura/setup-inicial.md`|Sim|Passo a passo para rodar|
|`arquitetura/ADR/`|Vazio|Pronto para receber ADRs futuras|
|`tarefas/pendentes.md`|Migrar|Tarefas antigas (se houver), no formato novo|
|`tarefas/em-andamento.md`|Vazio||
|`tarefas/concluidas/`|Vazio||

### 6.3 Estratégia de Preenchimento

Para cada arquivo "Sim" ou "Parcial":

1. **Extraia o que dá para extrair do código** (RFs implícitas em rotas, RNs em validações)
2. **Marque o restante como "a confirmar"**
3. **Use formato padrão** (ver templates)
4. **Não invente.** Vazio é melhor que errado.

Exemplo para `requisitos/funcionais.md`:

```markdown
# Requisitos Funcionais

> Extraídos da análise inicial do código. Validar com stakeholder/humano.

| ID | Descrição | Prioridade | Status | Origem |
|---|---|---|---|---|
| RF-01 | Usuário pode fazer login com email e senha | MUST | ✅ | Extraído de `FormularioLogin.tsx` |
| RF-02 | Usuário pode visualizar perfil | MUST | ✅ | Extraído de rota `/perfil` |
| RF-03 | Usuário pode editar perfil | ? | ? | **A confirmar** — vi botão "Editar" mas não tenho certeza do fluxo |

## Pendente de Validação
- RF-03: confirmar fluxo de edição
- Existem requisitos não-implementados? (não dá para saber pelo código)
```

### 6.4 ADRs Para Decisões Encontradas

Se durante a análise você identificou **decisões arquiteturais não-óbvias** (escolha de Context vs Zustand, isolamento de storage, padrão de testes), **crie ADRs retrospectivas**:

```markdown
# ADR-001: Estado global com Context + useReducer

**Data:** [data atual da inicialização]
**Status:** Aceita (retrospectiva)

## Contexto
Durante a inicialização do projeto, identifiquei que o estado global usa
Context + useReducer em vez de Zustand ou Redux. Esta ADR registra a
decisão para que futuras mudanças sejam conscientes.

## Decisão
Estado global é gerenciado via Context API + useReducer, com um contexto
por domínio (PerfilContext, PedidoContext).

## Consequências
**Positivas:**
- Sem dependência externa adicional
- API React idiomática

**Trade-offs:**
- Provider re-renderiza tudo (sem seletor granular)
- Boilerplate maior que Zustand

## Alternativas Não Investigadas
- Zustand (não investigado no momento da decisão original)
- Redux Toolkit (não investigado)

## Confirmação
- [ ] Esta decisão foi validada com humano em [data]
```

Marcar "retrospectiva" deixa claro que a ADR foi escrita **depois** da decisão original — não é forjar histórico.

### 6.5 Validação com o Humano

Após criar a estrutura inicial, **mostre ao humano**:

> "Criei a estrutura padrão de docs. Os arquivos têm conteúdo extraído da análise do código + marcações 'a confirmar' onde fiquei em dúvida. Pode revisar os pontos pendentes?"

Pontos pendentes resolvidos viram conteúdo definitivo. Pontos não resolvidos viram **tarefas em `pendentes.md`** para validação futura.

---

## 7. Fase 4: Arquivar Documentação Antiga

Se o projeto tinha docs fora do padrão, **arquive sem deletar**.

### 7.1 Estrutura de Arquivamento

```
docs/
├── (estrutura nova, criada na Fase 3)
└── arquivo/
    ├── README.md                # explica o que está aqui e por quê
    ├── (docs antigos preservados)
    └── ...
```

### 7.2 Como Mover

Para cada arquivo/pasta de documentação antiga:

1. **Copie** para `docs/arquivo/` (preservando estrutura original quando possível)
2. **Delete** do local original (depois de copiar)
3. **Anote** no `docs/arquivo/README.md` o que está lá e por quê

```markdown
# Documentação Arquivada

Esta pasta contém documentação **anterior à inicialização do projeto no padrão `.agent/`** (data: 2026-05-13).

**Status:** read-only — não atualizamos mais.
**Motivo do arquivamento:** estrutura antiga incompatível com padrão atual.

## Conteúdo
- `dominio/` — documentação antiga de domínio (substituída por `docs/dominios/`)
- `ux/` — documentação antiga de UX (parcialmente migrada para `docs/design/`)
- `historico/` — decisões antigas (algumas viraram ADRs em `docs/arquitetura/ADR/`)

## O Que Foi Migrado
- Glossário (extraído de `dominio/glossario.md` → `docs/dominios/glossario.md`)
- Lista de rotas (extraído de `historico/rotas.md` → `docs/arquitetura/rotas.md`)
- Regras de negócio (parcialmente — algumas precisam validação)
```

### 7.3 Regras de Arquivamento

|Regra|Por quê|
|---|---|
|**Nunca delete** sem autorização explícita|Pode haver contexto importante|
|**Preserve estrutura original** sempre que possível|Facilita rastrear histórico|
|**Marque o arquivo de origem** ao migrar conteúdo|Rastreabilidade|
|**README do arquivo explica tudo**|Quem entrar depois entende|

### 7.4 Documentos Que NÃO Vão Para Arquivo

Algumas coisas ficam onde estão:

- **README.md da raiz do projeto** — para humanos, fica
- **CONTRIBUTING.md, LICENSE, etc.** — convenções padrão de repo, ficam
- **Documentação de API gerada (OpenAPI, Swagger)** — fica (é gerada automaticamente)

Arquive apenas a documentação **conceitual** que não casa com o padrão `.agent/`.

---

## 8. Fase 5: Relatório Final

Quando todas as fases anteriores terminam, **gere um relatório** para o humano.

### 8.1 Formato

```markdown
# Inicialização do Projeto [Nome] — Concluída

**Data:** 2026-05-13
**Tempo total:** ~3 horas

## O Que Foi Feito

### Análise do Código
- Stack identificada: React 18, TypeScript 5.6, Vite 5.4, Tailwind 3.4
- 47 arquivos de código mapeados
- Convenções extraídas: idioma português, hooks retornando objeto, etc.

### Documentação Criada
- `docs/contexto-projeto-ai.md` (ponto de entrada para IAs)
- `docs/README.md` (para humanos)
- 13 arquivos em `docs/` no padrão definido

### Documentos Arquivados
- 5 documentos antigos movidos para `docs/arquivo/`
- README criado em `docs/arquivo/` explicando o conteúdo

### ADRs Retrospectivas
- ADR-001: Estado global com Context + useReducer
- ADR-002: Storage isolado em services
- ADR-003: Testes com Vitest + Testing Library

## Pontos Pendentes de Validação

1. **RF-03 (editar perfil):** vi UI mas não confirmei fluxo completo
2. **Regras de negócio sobre seguros:** encontrei lógica mas sem doc oficial
3. **Decisão sobre ADR-001:** confirmar Context vs Zustand como escolha consciente
4. **Tema do Tailwind:** algumas cores fora do padrão — confirmar se são oficiais

## Próximos Passos Sugeridos

1. Validar os 4 pontos pendentes acima (pode levar 30min-1h juntos)
2. Adicionar requisitos novos que não estão no código (se houver)
3. Revisar `docs/arquivo/` e decidir se algum conteúdo merece ser resgatado
4. Pegar primeira tarefa do `docs/tarefas/pendentes.md` no fluxo Standard

## Riscos Identificados

- **Médio:** alguns campos do código não têm validação Zod (RNF de validação não cumprido)
- **Baixo:** componentes UI não têm testes (a propor depois)
- **Médio:** sem testes E2E (decisão consciente? ADR-005?)

## Arquivos para Você Revisar Primeiro

1. `docs/contexto-projeto-ai.md` — ponto de entrada
2. `docs/requisitos/funcionais.md` — pontos "a confirmar"
3. `docs/arquivo/README.md` — entender o que foi preservado
```

### 8.2 Por Que Relatório Importa

- **Humano sabe o que aconteceu** sem ler todos os 15+ arquivos criados
- **Pontos pendentes** ficam destacados para resolução
- **Próximos passos** dão direção concreta
- **Riscos** alertam para decisões importantes

Sem relatório, humano precisa "descobrir" o que você fez — desperdício.

---

## 9. Casos Especiais

### 9.1 Projeto Muito Grande (200+ arquivos)

Engenharia reversa completa é inviável. Estratégia:

1. **Peça resumo ao humano** (30 minutos a 1 hora de conversa)
    - O que o produto faz?
    - Quais áreas/módulos principais?
    - Quais decisões arquiteturais importantes?
    - Que dores conhecidas existem?
2. **Crie `contexto-projeto-ai.md`** baseado no resumo + validação pontual no código
3. **Cubra estrutura básica de `docs/`** mas não tente preencher tudo
4. **Marque muito como "a expandir conforme o projeto evolui"**
5. **Iniciativa contínua** — cada nova tarefa contribui um pouco

### 9.2 Projeto Sem Testes

Inicialização sem rede de segurança. Cuidado especial:

- Documente intensamente — você não pode validar comportamento via teste
- Mais perguntas ao humano que normalmente
- Tarefas pendentes geradas: criar testes para áreas críticas
- Não force refatoração durante inicialização — só documente

### 9.3 Projeto com Documentação Que Diverge do Código

Quando você encontra: "doc antiga diz X, código faz Y".

1. **Código vence sempre**
2. **Documente Y no novo doc**
3. **Anote a divergência no relatório final** — humano pode querer entender o que mudou
4. **Não corrija silenciosamente.** Reporte: "doc antiga dizia X, código faz Y, registrei Y. Confirmar se Y está correto."

### 9.4 Projeto com Dependências Estranhas

Você encontra biblioteca esquisita no `package.json` (lib obscura, abandonada, versão muito antiga).

- Registre o uso atual no doc
- **Não substitua** durante inicialização (escopo!)
- Anote em `docs/dominios/divida-tecnica.md` como dívida
- Crie tarefa em pendentes (com prioridade baixa, "quando der")

### 9.5 Projeto Que Você Acabou de Criar

Você é a IA que criou o projeto do zero. Inicialização é mais fácil:

- Você sabe **tudo** sobre o código (você escreveu)
- `contexto-projeto-ai.md` reflete decisões conscientes (não engenharia reversa)
- Não há docs antigas para arquivar
- ADRs registram decisões reais, não retrospectivas

Ainda assim, **siga o processo**. Disciplina garante consistência.

---

## 10. Manutenção Contínua

Inicialização não é evento único. É **base** para manutenção.

### 10.1 O Que Mudar Quando

|Mudança no projeto|Atualizar|
|---|---|
|Nova rota|`docs/arquitetura/rotas.md`|
|Nova decisão arquitetural|Criar ADR em `docs/arquitetura/ADR/`|
|Novo termo de domínio|`docs/dominios/glossario.md`|
|Nova regra de negócio|`docs/dominios/invariantes.md` ou `requisitos/regras-negocio.md`|
|Decisão de adiar algo|`docs/dominios/divida-tecnica.md`|
|Mudança em estrutura de pastas|`docs/arquitetura/visao-geral.md`|
|Adoção de nova lib|`docs/contexto-projeto-ai.md` (stack)|

### 10.2 Princípio: Atualize Ao Decidir

Não acumule mudanças para "atualizar tudo depois". A regra:

> Toda decisão que vira código também vira atualização da doc correspondente, na **mesma tarefa**.

Tarefa concluída ([módulo 20](https://claude.ai/chat/20-ciclo-tarefa.md)) inclui:

- Código novo
- Testes novos/atualizados
- Documentação atualizada

Os três juntos. Sem separação.

### 10.3 Auditoria Periódica

A cada 3-6 meses, faça **auditoria leve**:

- Documentação está fiel ao código? (varredura por divergências)
- Tarefas concluídas estão refletidas em requisitos?
- Glossário cobre todos os termos atuais?
- Dívidas técnicas: alguma esquecida?

Auditoria não é re-inicialização. É **manutenção preventiva**.

---

## 11. Exemplo Prático

Cenário real para amarrar.

### 11.1 Contexto

Você (IA) chega em um projeto:

- App de gestão de aluguel de carros
- 80 arquivos de código
- Existe pasta `documentacao/` com 6 arquivos antigos
- Sem `docs/contexto-projeto-ai.md`

### 11.2 Fase 1 — Análise

Inspeciona arquivos-chave:

```json
// package.json (relevantes)
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  }
}
```

Identifica:

- React 18 + Vite
- Estado global: **Zustand** (não Context — registro)
- Forms: rhf + Zod
- Validação: Zod (importa em 12 arquivos)
- Idioma: misto (alguns componentes em PT, outros em EN) — **flag**

Inspeciona `src/`:

```
src/
├── components/
├── stores/        ← em vez de context/
├── hooks/
├── pages/
├── lib/
└── api/           ← em vez de services/
```

Estrutura **diverge** do padrão. Registra como decisão a manter (não força mudança).

Lê 5 componentes representativos: idioma é mesclado mesmo. Marcação de pendência.

Lê `documentacao/` antiga: 6 arquivos sobre regras de negócio antigas, algumas válidas, algumas obsoletas.

### 11.3 Fase 2 — `contexto-projeto-ai.md`

Cria arquivo:

```markdown
# Contexto do Projeto: AlugaCar

> Sistema de gestão de aluguel de carros (B2B, frotas pequenas e médias).

## Stack Exata
- React 18.2 (strict mode)
- React Router 6.20
- TypeScript 5.4 (strict)
- Zustand 4.4 (estado global)
- react-hook-form 7.45 + Zod 3.22
- Vite 5.1
- Tailwind 3.3 (sem shadcn — utility puro)

## Estrutura Real
`src/components/`, `src/stores/`, `src/hooks/`, `src/pages/`, `src/lib/`, `src/api/`
(diverge do padrão do `.agent/` em `stores/` e `api/`; documentado em ADR-001)

## Decisões Arquiteturais
- Estado global: Zustand (não Context+useReducer)
- Acesso a backend: pasta `api/` (não `services/`)
- Forms: rhf + Zod (padrão deste pacote)
- Sem design system declarado (Tailwind puro)

## Convenções
- **Idioma: PENDENTE — projeto tem mistura, precisa decidir**
- Imports absolutos via `@/`
- Stores Zustand em `stores/[dominio]Store.ts`

## O Que Este Projeto NÃO Faz
- Não tem testes (zero arquivos `.test.*`)
- Backend é externo (não há código backend neste repo)
- Sem PWA, sem offline

## Hierarquia de Conflito
1. Este arquivo vence
2. Exceções inegociáveis do `.agent/01-nucleo.md` aplicam
```

### 11.4 Fase 3 — Estrutura `docs/`

Cria os arquivos. Destaques:

- **`requisitos/funcionais.md`**: lista 8 RFs extraídas das rotas e formulários
- **`dominios/glossario.md`**: termos "Aluguel", "Veículo", "Cliente", "Reserva" (do código)
- **`arquitetura/visao-geral.md`**: registra divergência da estrutura padrão
- **`arquitetura/ADR/ADR-001.md`**: retrospectiva da escolha por `stores/` e `api/`
- **`arquitetura/ADR/ADR-002.md`**: retrospectiva da escolha por Zustand
- **`tarefas/pendentes.md`**: vazio (sem tarefas migradas)

Marca pendências:

- Idioma a decidir (PT, EN, ou padronizar)
- Ausência total de testes — risco alto
- `documentacao/` antiga a arquivar

### 11.5 Fase 4 — Arquivamento

Move `documentacao/` para `docs/arquivo/documentacao-original/`. Cria `README.md` em arquivo explicando.

### 11.6 Fase 5 — Relatório

Envia para humano:

```markdown
# Inicialização do AlugaCar — Concluída

## Pontos Pendentes Críticos
1. **Idioma do projeto** — mistura PT/EN. Padronizar?
2. **Ausência de testes** — risco alto. Adicionar tarefa de cobertura mínima?
3. **ADR-001 e ADR-002 são retrospectivas** — confirmar se as decisões foram conscientes ou herdadas

## Riscos
- Refatorar idioma depois é caro. Sugiro decidir agora.
- Sem testes, qualquer refatoração futura é arriscada.

## Próximo Passo Sugerido
Conversar 30 min sobre os 3 pontos pendentes. Depois pegar primeira tarefa em `pendentes.md`.
```

Humano responde, decisões viram conteúdo definitivo. Inicialização termina.

---

## 12. Anti-Padrões

|Anti-padrão|Sintoma|Conserto|
|---|---|---|
|Engenharia reversa "completa" em projeto grande|Você gasta semana sem entregar|Peça resumo ao humano|
|Inventar conteúdo onde código não diz|Doc errada vira fonte de bug|Marque "a confirmar"|
|Deletar documentação antiga|Contexto histórico perdido|Sempre arquive|
|Forçar estrutura do `.agent/` em projeto que diverge|Refatoração não-pedida|Documente a divergência via ADR|
|Pular validação com humano|Erros descobertos depois|Valide entre fases|
|Não gerar relatório final|Humano fica perdido|Sempre gere|
|Tratar inicialização como evento único|Doc envelhece|Manutenção contínua|

---

## 13. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Quando aplicar este módulo?|Projeto sem `contexto-projeto-ai.md` ou com docs fora do padrão|
|Quantas fases?|5: Análise → contexto → estrutura → arquivamento → relatório|
|Código vs doc antiga?|Código sempre vence|
|Inventar quando não dá para inferir?|Não. Marque "a confirmar"|
|Engenharia reversa em projeto grande?|Peça resumo ao humano|
|Deletar docs antigas?|Nunca. Arquive|
|Pular validação com humano?|Não. Valide entre fases|
|Documentar projeto que diverge do padrão?|Sim. ADR retrospectiva|

---

## 🔗 Módulos Relacionados

- [`01-nucleo.md`](https://claude.ai/01-nucleo.md) — Hierarquia de regras
- [`11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Estrutura padrão de docs
- [`20-ciclo-tarefa.md`](https://claude.ai/chat/20-ciclo-tarefa.md) — Manutenção contínua após inicialização
- [`../templates/33-contexto-projeto-ai.md`](https://claude.ai/templates/33-contexto-projeto-ai.md) — Template do arquivo de contexto
- [`../templates/34-readme-projeto.md`](https://claude.ai/templates/34-readme-projeto.md) — Template do README.md
- [`../templates/32-adr.md`](https://claude.ai/templates/32-adr.md) — Template de ADR retrospectiva
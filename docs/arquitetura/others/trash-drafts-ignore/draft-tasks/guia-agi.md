# Guia do Sistema de Agentes MotoCalc RJ

> Como usar, manter e evoluir os 16 agentes de IA do projeto.

---

## Como Funciona na Prática

Você **não precisa lembrar de nada** entre uma ação e outra. O sistema funciona assim:

1. Um agente termina e escreve em `SESSAO-ATIVA.md`:
   - O que fez
   - O que ficou pendente
   - Qual agente chamar a seguir
   - Exatamente o que pedir a esse agente

2. Você copia a instrução sugerida e executa no VS Code

3. O próximo agente lê `SESSAO-ATIVA.md` antes de qualquer coisa e já sabe tudo

**Você só precisa dizer "continue" o contexto está no arquivo.**

---

## Os 16 Agentes + 1 Protocolo

### Arquivo de base (lido por todos, sempre)
| Arquivo | Ativado quando |
|---|---|
| `contexto-base` | Qualquer arquivo em `src/**` |
| `protocolo-handoff` | Qualquer arquivo define as regras de handoff |

### Fase 1 Descoberta
| Arquivo | Quando chamar |
|---|---|
| `analista-requisitos` | Nova ideia, mudança de requisito, ambiguidade |
| `modelador-dominio` | Conceito novo no domínio, ambiguidade conceitual, engenharia reversa |
| `designer-sistema` | Feature que afeta arquitetura, registrar ADR ,**Análise de Impacto Arquitetural** |
| `documentador-tecnico` | Após task ou fase manter docs e contexto-base sincronizados |

### Fase 2 Design
| Arquivo | Quando chamar |
|---|---|
| `wireframer-ux` | Nova tela sem design no Figma |
| `tradutor-figma` | Figma pronto antes de implementar qualquer tela |
| `design-system` | Novo componente UI ou wrapper shadcn |

### Fase 3 Desenvolvimento (o dia a dia)
| Arquivo | Quando chamar |
|---|---|
| `arquiteto-frontend` | "Onde coloco esse arquivo?", nova pasta |
| `construtor-features` | Implementar tela, hook, componente **o mais usado** |
| `engenheiro-backend` | Backend V2 |
| `software-craftsman` | SOLID, Design Patterns, análise de design |
| `refatorador` | Refatorar código existente |
| `tech-lead-revisor` | Antes de marcar **qualquer task** como concluída |

### Fase 4 Qualidade
| Arquivo | Quando chamar |
|---|---|
| `qa-engineer` | Escrever e rodar testes |
| `performance-acessibilidade` | Antes de releases, TASK-9.1 |

### Fase 5 Gestão (transversal)
| Arquivo | Quando chamar |
|---|---|
| `agile-master` | Início de sprint, mudança de requisito, priorização |
| `agente-evolutivo` | Agente dando resultado errado, criar agente novo |

---

## Como Iniciar Qualquer Trabalho

### Para uma nova task

```
1. Abra docs/Tasks.md
2. Diga: "@workspace Como agile-master, leia SESSAO-ATIVA.md
         e planeje a TASK-5.2"
3. O agile-master vai:
   - Ler SESSAO-ATIVA.md e contexto-base
   - Confirmar escopo da task
   - Atualizar Tasks.md: [ ] → [~]
   - Escrever no SESSAO-ATIVA quem chamar em seguida
4. Você chama o próximo conforme indicado
```

### Para continuar de onde parou

```
1. Abra SESSAO-ATIVA.md
2. Veja o campo "PRÓXIMO AGENTE" e a instrução direta
3. Abra o arquivo relevante no VS Code
4. Diga: "@workspace Como [nome-do-agente], leia SESSAO-ATIVA.md e continue"
```

### Primeira vez no dia (nova sessão de VS Code)

```
1. Abra SESSAO-ATIVA.md veja o estado atual
2. Se tiver task [~] em desenvolvimento → continue de onde parou
3. Se não tiver task em curso → abra docs/Tasks.md e chame o agile-master
```

---

## Ciclos de Trabalho com Handoff

### Ciclo principal nova task de feature

```

analista-requisitos  (se requisito novo ou mudança de requisito)
  Lê SESSAO-ATIVA → captura/refina requisito
  Decide: modelador-dominio?
  Handoff → PRÓXIMO: modelador-dominio (se conceito novo) | designer-sistema (se trivial)
      ↓
modelador-dominio  (sob demanda quando há conceito de domínio novo ou ambíguo)
  Lê SESSAO-ATIVA → modela em docs/dominio/ → atualiza glossário
  Handoff → PRÓXIMO: designer-sistema
      ↓
designer-sistema  (se feature afeta arquitetura ou código existente)
  Lê SESSAO-ATIVA → produz ADR + Análise de Impacto Arquitetural (docs/architecture/IMPACTO-X.md)
  → diagrama Mermaid do novo fluxo
  Handoff → PRÓXIMO: agile-master (com referência ao documento de impacto)
      ↓
agile-master
  Lê SESSAO-ATIVA → planeja → Tasks.md [ ] → [~]
  Handoff → PRÓXIMO: tradutor-figma ou arquiteto-frontend
      ↓
tradutor-figma  (se tiver Figma)
  Lê SESSAO-ATIVA → converte Figma em spec técnica
  Handoff → PRÓXIMO: arquiteto-frontend
      ↓
arquiteto-frontend
  Lê SESSAO-ATIVA → define arquivos e estrutura
  Handoff → PRÓXIMO: design-system (se precisar) ou construtor-features
      ↓
design-system  (se precisar de componente ui/ novo)
  Lê SESSAO-ATIVA → cria wrapper shadcn
  Handoff → PRÓXIMO: construtor-features
      ↓
construtor-features
  Lê SESSAO-ATIVA → types → hooks → components → pages
  Tasks.md [~] → [x]
  Handoff → PRÓXIMO: qa-engineer
      ↓
qa-engineer
  Lê SESSAO-ATIVA → escreve testes → npm run test verde
  Tasks.md [x] → [T]
  Handoff → PRÓXIMO: tech-lead-revisor
      ↓
tech-lead-revisor
  Lê SESSAO-ATIVA → audita tudo
  APROVADO → Handoff → PRÓXIMO: documentador-tecnico
  REPROVAR → Handoff → PRÓXIMO: construtor-features (com lista de correções)
      ↓
documentador-tecnico
  Lê SESSAO-ATIVA → atualiza contexto-base
  Handoff → PRÓXIMO: agile-master (próxima task)
```

### Ciclo de bug

```
construtor-features encontra problema
  Registra em SESSAO-ATIVA: tentativa N, causa, hipóteses
  Após 2 tentativas sem sucesso: propõe mudança de abordagem
  Handoff → PRÓXIMO: software-craftsman (design ou refatoração)
          → PRÓXIMO: arquiteto-frontend (estrutura: onde código vai, fronteiras de módulos)
          → PRÓXIMO: você decide
```

### Ciclo de desatualização do contexto-base

```
Qualquer agente detecta mudança que afeta o contexto-base
  Registra no handoff quais seções precisam atualizar
  Pergunta: "Posso atualizar agora ou chamo o documentador-tecnico?"
  → Você responde → documentador-tecnico atualiza → escreve handoff
```

---

## Status de Tasks no docs/Tasks.md

| Símbolo | Significado | Quem atribui |
|---|---|---|
| `[ ]` | Pendente | |
| `[~]` | Em desenvolvimento | agile-master ou construtor ao iniciar |
| `[x]` | Implementado | construtor-features ao concluir |
| `[T]` | Testes passando | qa-engineer ao confirmar |
| `[!]` | Concluído com ressalvas | qualquer agente |
| `[✗]` | Cancelado ou bloqueado | agile-master |

**Fluxo normal:** `[ ]` → `[~]` → `[x]` → `[T]`

---

## Sobre a Memória dos Agentes (contexto-base)

### O problema
O `contexto-base.instructions.md` pode ficar desatualizado. Se ficar, as IAs tomam decisões com informação errada.

### Como o sistema resolve

Todo agente, ao terminar qualquer ação, verifica automaticamente se algo mudou que afeta o `contexto-base` e pergunta antes de atualizar:

```
"O contexto-base precisa ser atualizado nas seções:
- 'Estado atual das Tasks': TASK-5.2 passou para [T]
- 'Estrutura Real de Pastas': criado src/hooks/useRegistroRodagem.ts

Posso atualizar agora, ou prefere que o documentador-tecnico faça?"
```

Você responde "sim" ou "chama o documentador". O agente executa.

### Sinal de que o contexto-base está defasado

Se um agente der sugestão que contradiz o código real → chame o `agente-evolutivo`. Ele diagnostica se o problema está no `contexto-base` ou no agente específico.

---

## A Pasta docs/ O Que Manter

### Manter (referência densa não cabe nos agentes)
```
docs/
├── Tasks.md                        ← backlog vivo atualizado por todos
├── Requisitos_MotoCalc_RJ_v6.md    ← fonte de verdade dos requisitos
├── Arquitetura_Funcoes_Calculo.md  ← spec completa das funções de cálculo
├── ESTADO_INICIAL.md               ← arquitetura de persistência e estado
├── Design_MotoCalc_Figma.md        ← referência visual das telas
└── mapeamento-ui-figma/            ← links e node-ids do Figma
```

### O que vive aqui

Modelagem conceitual do projeto: glossário, entidades, value objects, aggregates, invariantes, dívida técnica.
docs/dominio/
├── README.md                  ← guia de leitura da pasta
├── _glossario.md              ← Linguagem Ubíqua
├── invariantes.md             ← regras invioláveis
├── divida-tecnica.md          ← decisões conscientes de adiar
├── aggregate-perfil.md
├── entidade-preset.md
├── entidade-moto.md
└── value-objects.md

### Quem mantém

Apenas o `modelador-dominio` edita esses arquivos. Outros agentes leem livremente. Mudança em `docs/dominio/` por outro agente que não seja correção de typo é proibida.

### Quando consultar

- Antes de implementar feature: ler entidade afetada + invariantes
- Antes de usar termo de domínio: verificar glossário
- Antes de aprovar task (`tech-lead-revisor`): conferir invariantes
- Antes de propor refatoração (`software-craftsman`): entender o domínio

### Arquivar em docs/arquivo/ (absorvidos pelos agentes)
```
rules-ai.md, Convencoes.md, Configuracao_Tailwind_CSS_Global.md,
Setup.md, eslint-rules.md
```
Mover para `docs/arquivo/` não deletar, mantém histórico.

---
---

## IX- Fronteira Conceitual `software-craftsman` × `arquiteto-frontend`

A fusão `software-craftsman + refatorador` cria risco de invadir o território do `arquiteto-frontend`. A fronteira oficial é:

| Pergunta | Agente |
|---|---|
| Esse código tem qualidade interna boa? (SOLID, smells, duplicação) | `software-craftsman` |
| Essa função/componente está bem desenhada por dentro? | `software-craftsman` |
| Vamos refatorar isso para reduzir complexidade? | `software-craftsman` |
| Onde esse arquivo deveria viver? Em qual pasta? | `arquiteto-frontend` |
| Esse hook deveria estar em `domain/` ou `ui/`? | `arquiteto-frontend` |
| Precisamos criar uma pasta nova para isso? | `arquiteto-frontend` |
| Essa fronteira entre módulos faz sentido? | `arquiteto-frontend` |

### Quando o problema atravessa as duas fronteiras

Exemplo: "esse componente tem lógica de domínio dentro e precisa ser quebrado em arquivos diferentes".

Faça **handoff coordenado**:
1. `software-craftsman` define O QUE extrair e por quê (qualidade)
2. `arquiteto-frontend` define PARA ONDE vai (estrutura)
3. `construtor-features` executa a movimentação

Não tente fazer os três trabalhos no mesmo agente perde a separação de responsabilidades.

---
---

## Estrutura Completa do Sistema

```
projeto/
├── SESSAO-ATIVA.md                    ← memória compartilhada atualizada por todos
├── GUIA-AGENTES.md                    ← este arquivo consultar quando tiver dúvida
│
├── .github/
│   └── instructions/
│       ├── protocolo-handoff.instructions.md
│       ├── contexto-base.instructions.md
│       ├── analista-requisitos.instructions.md
│       ├── modelador-dominio.instructions.md
│       ├── designer-sistema.instructions.md
│       ├── documentador-tecnico.instructions.md
│       ├── wireframer-ux.instructions.md
│       ├── tradutor-figma.instructions.md
│       ├── design-system.instructions.md
│       ├── arquiteto-frontend.instructions.md
│       ├── construtor-features.instructions.md
│       ├── engenheiro-backend.instructions.md
│       ├── software-craftsman.instructions.md   ← absorveu refatorador
│       ├── tech-lead-revisor.instructions.md    ← inclui checklist segurança LGPD
│       ├── qa-engineer.instructions.md
│       ├── performance-acessibilidade.instructions.md
│       ├── agile-master.instructions.md
│       └── agente-evolutivo.instructions.md
│
└── docs/
    ├── Tasks.md
    ├── Requisitos_MotoCalc_RJ_v6.md
    ├── Arquitetura_Funcoes_Calculo.md
    ├── ESTADO_INICIAL.md
    ├── Design_MotoCalc_Figma.md
    └── mapeamento-ui-figma/
    └── dominio/                    ← NOVA pasta de modelagem de domínio
        ├── README.md
        ├── _glossario.md
        ├── invariantes.md
        ├── divida-tecnica.md
        ├── aggregate-perfil.md
        ├── entidade-preset.md
        ├── entidade-moto.md
        └── value-objects.md
```
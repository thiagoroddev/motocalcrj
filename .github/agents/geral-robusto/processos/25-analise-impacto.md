---
description: "Análise de impacto: blast radius, áreas afetadas, features em risco, decisões pendentes, riscos não-mitigáveis."
modulo: "25"
categoria: "processos"
versao: "1.0"
relacionado:
  - "20-ciclo-tarefa.md"
  - "21-revisao-codigo.md"
  - "22-refatoracao.md"
  - "../templates/32-adr.md"
---

# 📊 Análise de Impacto Arquitetural

> A pergunta que iniciantes raramente fazem antes de codar: **"se eu mexer aqui, o que mais pode quebrar?"** A diferença entre dev junior e sênior frequentemente mora aqui. Junior pensa em fazer a mudança. Sênior pensa em **fazer a mudança sem quebrar o resto**.

---

## 1. O Que É e Por Que Importa

### 1.1 Definição

> **Análise de impacto** é o processo de mapear, **antes da implementação**, todas as áreas que uma mudança pode afetar - e decidir o que fazer com cada risco identificado.

É documento curto (1-2 páginas), produzido **antes** do plano de implementação, em tarefas Standard significativas ou Strict.

### 1.2 Por Que Vale o Tempo

Sem análise prévia:

- Você descobre dependências **durante** a implementação (caro)
- Bugs aparecem em features que pareciam não-relacionadas
- Decisões importantes são tomadas no calor do código
- Estimativa de esforço fica totalmente errada
- Refatoração intermediária aparece "de surpresa"

Com análise prévia:

- Surpresas viram **decisões conscientes**
- Riscos mitigáveis são mitigados (testes, feature flags)
- Riscos não-mitigáveis viram **dívida documentada** em vez de bug futuro
- Decisões pendentes são endereçadas **antes** de gastar tempo

O custo (1-2 horas de análise) frequentemente economiza dias de retrabalho.

### 1.3 Análise vs Plano vs Revisão

Os três são complementares:

|Etapa|Quando|Pergunta que responde|
|---|---|---|
|**Análise de impacto**|Antes do plano|"O que pode quebrar?"|
|**Plano de implementação**|Antes de codar|"Como vou fazer?"|
|**Revisão de código**|Depois de codar|"Ficou bom?"|

Análise alimenta o plano. O plano vira código. A revisão confirma.

---

## 2. Quando Análise é Obrigatória

Não toda tarefa precisa. Critério prático:

### 2.1 Sempre Faça Análise

|Situação|Por quê|
|---|---|
|Tarefa em modo **Strict**|Por definição, decisão arquitetural|
|Mudança em arquivo crítico documentado em ADR|Esse arquivo é crítico por uma razão|
|Refatoração que atravessa 5+ arquivos|Blast radius automaticamente grande|
|Mudança em cálculo, persistência ou autenticação|Erro silencioso aqui é caro|
|Adição/remoção de dependência externa|Pode introduzir vulnerabilidade ou bloat|
|Mudança em estrutura de dados persistida|Pode quebrar dados em produção|
|Reorganização de pastas (mover arquivos)|Quebra imports em massa|

### 2.2 Pode Pular Análise

|Situação|Por quê|
|---|---|
|Tarefa **Light** (typo, cosmético)|Sem impacto sistêmico|
|Bug isolado em componente UI|Escopo claramente contido|
|Adição de teste para função existente|Não muda comportamento|
|Mudança em texto/conteúdo|Sem mudança de lógica|
|Atualização de documentação|Sem mudança de código|

### 2.3 Caso Limítrofe

Se você **não sabe** se precisa de análise, faça uma **mini-análise** de 15 minutos:

```markdown
## Mini-análise

**Mudança proposta:** [descrição em 1 linha]

**Toca quais arquivos?** [grep, busca rápida no editor]

**Toca alguma área crítica (cálculo, persistência, auth)?** [Sim/Não]

**Outros componentes/features dependem da parte que vou mudar?** [Sim/Não, quais]

**Decisão:** Análise completa ou pode prosseguir direto?
```

Se a mini-análise responde "não" a tudo, prosseguir direto. Se há "sim" em qualquer linha, faça análise completa.

---

## 3. As 4 Dimensões da Análise

Análise olha o impacto sob **quatro ângulos**. Cada um pode revelar risco diferente.

### 3.1 Dimensão 1: Áreas do Código Afetadas

Quais **camadas** e **arquivos** vão mudar.

|Camada|O que olhar|
|---|---|
|`types/`|Tipos compartilhados que mudam|
|`utils/`|Funções puras que serão modificadas|
|`services/`|Mudanças em acesso a dados ou APIs externas|
|`hooks/`|Hooks que serão criados ou modificados|
|`components/ui/`|Componentes UI alterados|
|`components/[dominio]/`|Componentes de domínio alterados|
|`pages/`|Páginas afetadas|
|`docs/`|Documentação que precisa atualizar|

**Saída:** lista de arquivos que vão ser criados, modificados ou deletados.

```markdown
## Áreas Afetadas

| Camada | Arquivos | Tipo de mudança |
|---|---|---|
| types/ | `perfil.ts` | Adicionar campo |
| services/ | `perfilStorage.ts` | Migração de dados |
| hooks/ | `usePerfil.ts` | Novo handler |
| components/perfil/ | `FormularioPerfil.tsx` | Novo campo no form |
| pages/ | `PaginaPerfil.tsx` | Sem mudança |
```

### 3.2 Dimensão 2: Features Existentes em Risco

Quais features **funcionando hoje** podem quebrar.

A pergunta-guia: _"se eu fizer essa mudança e nada mais, o que para de funcionar?"_

|Feature em risco|Por quê|Mitigação|
|---|---|---|
|Cadastro existente|Schema de perfil muda|Migração automática para dados antigos|
|Sincronização de perfil|Campo novo não existe no servidor|Backend ignora se ausente|
|Exportação de dados|Layout do export muda|Atualizar template|
|Testes de integração|Mock de perfil precisa atualizar|Listar testes afetados|

Algumas features quebram **silenciosamente** (sem erro óbvio, mas funcionalmente erradas). Essas são as mais perigosas. Análise é a oportunidade de pegá-las antes.

### 3.3 Dimensão 3: Decisões em Aberto

Perguntas que **precisam de resposta antes de implementar**.

```markdown
## Decisões em Aberto

1. **Validação de CPF**
   - Frontend valida + backend revalida (padrão atual)?
   - Ou só backend para reduzir bundle?
   - **Decisão necessária de:** humano
   - **Impacto da escolha:** mudança em 2 arquivos vs 1

2. **Compatibilidade com dados antigos**
   - Migrar usuários existentes para o novo formato?
   - Ou aceitar formatos antigos como válidos?
   - **Decisão necessária de:** humano
   - **Impacto da escolha:** 1 dia de script vs aceitar dívida

3. **Validação de unicidade de CPF**
   - Cada usuário tem CPF único no sistema?
   - Ou múltiplos usuários podem ter mesmo CPF (ex: dependentes)?
   - **Decisão necessária de:** stakeholder/produto
```

Cada decisão tem:

- **Opções concretas** (não vago)
- **Quem decide** (humano/stakeholder/IA pode)
- **Impacto da escolha** (esforço, blast radius)

### 3.4 Dimensão 4: Riscos Não-Mitigáveis

Riscos que **não dão para eliminar**, mas você está consciente.

```markdown
## Riscos Não-Mitigáveis

1. **Dados antigos com CPF inválido podem existir no localStorage**
   - Por quê: nunca validamos antes; usuários podem ter digitado errado
   - Mitigação parcial: na próxima leitura, marcar como inválido e pedir correção
   - **Dívida técnica gerada:** DT-12 (migração completa de dados legados)

2. **Backend não tem validação correspondente**
   - Por quê: stub mínimo, sem validação server-side ainda
   - Mitigação: documentado para ser feito quando backend evoluir
   - **Dívida técnica gerada:** DT-13 (validação server-side de CPF)
```

Riscos não-mitigáveis viram **dívida técnica registrada** (não esquecimento).

---

## 4. Como Identificar Blast Radius

Blast radius = **alcance da explosão**. Quantos arquivos, features e usuários a mudança afeta.

### 4.1 Técnicas Práticas

#### Busca por uso

```bash
# Onde o tipo é usado?
grep -rn "Perfil" src/

# Onde a função é chamada?
grep -rn "calcularTotal(" src/

# Quem importa este arquivo?
grep -rn "from.*perfilStorage" src/
```

Cada hit é candidato a impacto.

#### Mapa de dependências

Use o editor (VSCode "Find All References" ou similar) para mapear:

- Quem **importa** o que você vai mudar?
- Quem é **importado pelo** que você vai mudar?

Os dois sentidos importam. Importação externa = quem depende de você. Importação interna = de quem você depende.

#### Análise de testes

```bash
# Quais testes importam o módulo afetado?
grep -rn "from.*perfilStorage" src/**/*.test.*
```

Cada teste que importa o módulo é um teste que **vai rodar** depois da mudança. Se mudança causa falha em testes, esses testes já te avisam.

### 4.2 Mapa de Risco

Após identificar o que será tocado:

|Nível|Quantos arquivos|Recomendação|
|---|---|---|
|Baixo|1-3 arquivos|Standard normal|
|Médio|4-10 arquivos|Análise vale o tempo|
|Alto|11-25 arquivos|Análise + considere dividir tarefa|
|Crítico|25+ arquivos|**Divida**. Tarefa monstro raramente termina bem|

### 4.3 Quando Análise Revela "Divida"

Se análise mostra 30+ arquivos afetados, **a tarefa está grande demais**. Sintoma:

```
"Refatorar useState para useReducer no projeto inteiro"
→ 47 arquivos afetados
→ Não cabe em uma tarefa
```

Divida em sub-tarefas por **camada** ou **feature**:

- REF-01: useState → useReducer em hooks de perfil (5 arquivos)
- REF-02: useState → useReducer em hooks de pedido (8 arquivos)
- REF-03: useState → useReducer em hooks de pagamento (6 arquivos)
- ...

Cada sub-tarefa tem análise menor, plano menor, risco menor.

---

## 5. Template Padronizado

A análise vira documento. Pode ir em:

- Bloco no `em-andamento.md` antes do plano detalhado
- Arquivo próprio em `docs/tarefas/analises/` (para tarefas grandes)
- Seção da ADR (quando análise vira decisão arquitetural)

### 5.1 Template Completo

```markdown
## Análise de Impacto: [Nome da Tarefa]

**Tarefa:** [ID-XXX]
**Modo:** [Standard / Strict]
**Data da análise:** [AAAA-MM-DD]

### Mudança Proposta
[1-2 parágrafos descrevendo o que muda]

### Áreas Afetadas
| Camada | Arquivos | Tipo de Mudança |
|---|---|---|
| [camada] | [arquivos] | [criação / modificação / remoção] |

**Total:** [N] arquivos afetados
**Nível de risco:** [Baixo / Médio / Alto / Crítico]

### Features Existentes em Risco
| Feature | Risco | Mitigação |
|---|---|---|
| [nome] | [o que pode quebrar] | [como evitar] |

### Decisões em Aberto
1. **[Pergunta]**
   - Opção A: [...]
   - Opção B: [...]
   - Decisão necessária de: [humano / stakeholder / IA pode decidir]
   - Impacto da escolha: [diferença em esforço/risco]

### Riscos Não-Mitigáveis
- [risco residual] → **Dívida técnica gerada:** DT-XX

### Plano de Mitigação
- [ ] [ação 1: ex: escrever testes de caracterização antes]
- [ ] [ação 2: ex: validar com humano antes de prosseguir]
- [ ] [ação 3: ex: feature flag para rollback rápido]

### Sub-Tarefas Geradas (se a análise revelou que precisa dividir)
- [SUB-01]: [descrição]
- [SUB-02]: [descrição]

### Recomendação
[Prosseguir / Pausar para decisão humana / Dividir em sub-tarefas]
```

### 5.2 Como Usar o Template

Não é check-list mecânico. Use seções que fazem sentido para sua tarefa.

- Tarefa simples Strict → seções principais (Áreas, Riscos, Decisões)
- Tarefa que pode quebrar features existentes → ênfase em "Features em Risco"
- Refatoração grande → ênfase em "Sub-Tarefas Geradas"

---

## 6. Decisões em Aberto: Como Tratar

Esta é a seção que **mais tem impacto prático**. Identificar perguntas pendentes antes de codar evita retrabalho.

### 6.1 Tipos de Decisão

|Tipo|Quem decide|
|---|---|
|**Técnica pura** (ex: Map vs Object como estrutura)|IA pode decidir, registra justificativa|
|**Trade-off de design** (ex: feature flag ou direto)|IA propõe, humano valida|
|**Regra de negócio** (ex: dependentes têm CPF próprio?)|Stakeholder/humano decide|
|**Compatibilidade legacy** (ex: migrar dados ou aceitar formato antigo?)|Humano decide|
|**Estética/UX** (ex: modal ou tela cheia?)|Designer/humano decide|

### 6.2 Como Apresentar Decisão

Formato que **facilita** a decisão do humano:

```markdown
**Pergunta:** Validar CPF no frontend ou só no backend?

**Contexto:** Estamos adicionando o campo CPF ao perfil.

**Opção A: Validar nos dois lados**
- Prós: Feedback rápido para usuário; backend protege
- Contras: Lógica duplicada (mantida em sync); +5kb no bundle
- Esforço: 4h

**Opção B: Só backend**
- Prós: Menos código; sem duplicação
- Contras: Usuário só vê erro após submit (UX pior)
- Esforço: 2h

**Minha recomendação:** Opção A. Frontend valida com Zod (mesmo schema do backend, compartilhado), backend revalida. UX vence o pequeno custo de bundle.

**Decide:** humano.
```

Decisão estruturada: opções, prós/contras, recomendação, esforço. Humano decide rápido porque tem tudo na mão.

### 6.3 Quando Não Esperar Resposta

Se a decisão tem **resposta óbvia** (ex: "vamos seguir o padrão atual"), a IA pode tomar e **registrar a decisão** na análise:

```markdown
**Decisão tomada:** Seguir padrão atual (frontend + backend) por consistência com o resto do projeto. Sem necessidade de validar com humano (decisão técnica óbvia + alinhada com padrão estabelecido).
```

Distinção: decisão **óbvia** a IA toma. Decisão **com trade-off real** vai para humano.

---

## 7. Riscos Não-Mitigáveis e Dívida Técnica

Toda mudança não-trivial tem **algum risco que você não vai eliminar**. Listar honestamente é mais útil que mascarar.

### 7.1 Exemplos Comuns

|Risco residual|Por que não-mitigável|
|---|---|
|Dados legados podem estar em formato antigo|Não temos acesso aos dados de produção; migração offline|
|Backend não valida o novo campo|Backend é stub; validação completa virá depois|
|Edge case raro pode causar exceção silenciosa|Tratamento perfeito custaria muito; aceitamos com logging|
|Performance pode degradar para usuários com 1000+ itens|Solução exigiria virtualização; aceitamos para o MVP|

### 7.2 Cada Risco Vira Dívida Documentada

```markdown
## Riscos Não-Mitigáveis

1. **Dados legados em localStorage podem ter CPF inválido**
   - **Mitigação parcial:** ao ler, validar e marcar como pendente de correção
   - **Dívida técnica:** DT-15 - migração de dados legados
   - **Gatilho:** quando 50+ usuários reportarem campo "pendente"
```

A dívida vai para `docs/dominios/divida-tecnica.md` ([módulo 23](./23-modelagem-dominio.md) e estrutura do módulo 11).

### 7.3 Por Que Documentar é Suficiente

Iniciantes pensam que "documentar = jogar para debaixo do tapete". Não é. Comparação:

|Risco não-documentado|Risco documentado|
|---|---|
|Vira bug surpresa em produção|Aparece em busca, time esperava|
|Ninguém sabe que existe até quebrar|Está na lista; pode ser priorizado|
|Atribuído a "bug aleatório"|Tem causa rastreável|
|Equipe culpa o código|Equipe paga dívida consciente|

Documentação não elimina o risco. **Elimina a surpresa.**

---

## 8. Análise vs Revisão: Diferença e Complementaridade

Os dois processos parecem similares. São complementares.

|Aspecto|Análise (módulo 25)|Revisão (módulo 21)|
|---|---|---|
|Quando|Antes de codar|Depois de codar|
|Pergunta|"O que pode quebrar?"|"Quebrou?"|
|Foco|Riscos e decisões|Qualidade do resultado|
|Saída|Plano + dívidas registradas|Achados + tarefas geradas|
|Custo|1-2 horas, evita semanas|30min-2 horas|
|Tipo|Preventivo|Verificativo|

### 8.1 Por Que Os Dois Importam

- **Só análise:** você previu bem mas executou mal. Defeitos passam.
- **Só revisão:** você executou bem mas decidiu mal. Retrabalho grande.
- **Os dois:** decisões pensadas + execução verificada.

### 8.2 Como Se Comunicam

Análise alimenta o plano. Plano vira código. Código vai para revisão.

Na revisão, você compara:

- **O que disse que ia mudar** (análise) **vs o que mudou** (código)
- **Os riscos identificados** (análise) **vs os que se materializaram** (revisão)
- **Decisões tomadas** (análise) **vs como foram implementadas** (código)

Divergências grandes entre análise e implementação são sinal de que algo escapou - e merecem atenção na revisão.

---

## 9. Quando Análise Pede Para Pausar

Em alguns casos, análise revela que **não é hora de prosseguir**. Sinais:

|Sinal|Ação|
|---|---|
|3+ decisões pendentes que precisam de humano|Pause, agende conversa|
|Blast radius muito além da estimativa|Divida em sub-tarefas antes de prosseguir|
|Risco crítico sem mitigação|Pause até ter feature flag ou rollback rápido|
|Dependência externa ainda não está pronta|Pause até dependência estar|
|Stakeholder muda escopo após análise|Refaça a análise com novo escopo|

**Pausar não é falha.** É o que análise serve. Melhor pausar 1 dia que retrabalhar 5.

---

## 10. Exemplo Prático Completo

Cenário real para amarrar tudo.

### 10.1 Cenário

Tarefa **RF-9.2:** _"Adicionar autenticação por OAuth Google ao app"_

- O app já tem autenticação por email/senha
- Vai ter os dois métodos (não vai substituir)

### 10.2 Mini-Análise (Para Decidir Se Vai Análise Completa)

```markdown
## Mini-Análise: RF-9.2

**Toca arquivos:** authService, perfilService, FormularioLogin, env vars, novo provider
**Áreas críticas:** autenticação (claro), persistência (sessão do usuário)
**Outras features dependem da auth:** sim - todo o app

**Decisão:** Análise completa obrigatória.
```

### 10.3 Análise Completa

```markdown
## Análise de Impacto: RF-9.2 - Autenticação OAuth Google

**Tarefa:** RF-9.2
**Modo:** Strict
**Data:** 2026-05-13

### Mudança Proposta
Adicionar autenticação por OAuth Google como **alternativa** ao login email/senha. Usuários podem escolher qualquer método; conta é a mesma (vinculada por email).

### Áreas Afetadas
| Camada | Arquivos | Tipo |
|---|---|---|
| services/ | `authService.ts` | Modificar (adicionar oauth) |
| services/ | `oauthGoogleService.ts` | Criar |
| services/ | `perfilStorage.ts` | Modificar (campo `provedorAuth`) |
| types/ | `auth.ts` | Modificar (novo tipo `MetodoAuth`) |
| types/ | `perfil.ts` | Modificar (campo `provedorAuth`) |
| hooks/ | `useAuth.ts` | Modificar (suporte oauth) |
| components/auth/ | `BotaoLoginGoogle.tsx` | Criar |
| components/auth/ | `FormularioLogin.tsx` | Modificar (adicionar botão) |
| pages/ | `PaginaLogin.tsx` | Modificar (layout) |
| config/ | `env.ts` | Modificar (vars Google OAuth) |
| .env.example | - | Modificar |

**Total:** 11 arquivos afetados
**Nível de risco:** Alto (autenticação)

### Features Existentes em Risco
| Feature | Risco | Mitigação |
|---|---|---|
| Login email/senha atual | Pode quebrar se mudarmos authService errado | Testes de regressão antes de mexer |
| Sessão persistida | Estrutura do token muda | Migração: sessões antigas continuam válidas |
| Auto-logout por expiração | OAuth tem expiração diferente | Unificar lógica de refresh |
| Perfil já cadastrado | Como vincular OAuth a conta existente? | **Decisão pendente** |

### Decisões em Aberto

1. **Vinculação de OAuth a conta existente**
   - Opção A: se email do Google já existe, vincular automaticamente
   - Opção B: bloquear OAuth se email já existe (forçar login email/senha)
   - **Decide:** stakeholder
   - **Impacto:** Opção A é mais conveniente; Opção B mais seguro contra account takeover

2. **Refresh token: armazenamento**
   - Opção A: cookie httpOnly (mais seguro)
   - Opção B: localStorage (mais simples)
   - **Decide:** humano (tem dimensão de arquitetura)
   - **Impacto:** mudança em armazenamento atual de todo o app

3. **Conta criada via OAuth pode definir senha depois?**
   - Sim → precisa fluxo de "definir senha"
   - Não → conta é Google-only
   - **Decide:** produto
   - **Impacto:** Sim = 1 dia extra de feature; Não = potencial frustração de usuário

### Riscos Não-Mitigáveis
1. **Conta Google deletada pelo usuário externamente**
   - Mitigação parcial: marcar conta como "inativa" no próximo login fail
   - **Dívida técnica:** DT-19 - política de contas órfãs

2. **Backend stub não valida tokens Google**
   - Mitigação parcial: validação básica no frontend
   - **Dívida técnica:** DT-20 - validação server-side de OAuth tokens

### Plano de Mitigação
- [ ] Escrever testes de regressão do login email/senha atual
- [ ] Implementar feature flag `OAUTH_GOOGLE_ENABLED` para rollback rápido
- [ ] Aguardar decisões 1, 2 e 3 antes de detalhar plano
- [ ] Criar ADR-007 documentando decisão de armazenamento de token

### Sub-Tarefas Geradas
- RF-9.2.1: Adicionar suporte a múltiplos provedores no authService
- RF-9.2.2: Implementar fluxo OAuth Google
- RF-9.2.3: UI de login com escolha de método
- RF-9.2.4: Vinculação de contas (depende de decisão 1)

### Recomendação
**Pausar.** As 3 decisões em aberto precisam de resposta antes de plano detalhado. Custo de prosseguir sem elas é refazer o trabalho.

Enviei perguntas para humano em [link/canal]. Aguardando resposta.
```

### 10.4 O Que Acontece Depois

Humano lê a análise. Toma as 3 decisões. A IA volta:

1. Atualiza análise com as decisões registradas
2. Cria ADR-007 (decisão de armazenamento de token)
3. Cria DT-19 e DT-20 em `divida-tecnica.md`
4. Divide em 4 sub-tarefas (RF-9.2.1 a 9.2.4) em `pendentes.md`
5. **Tarefa RF-9.2 pai** vira "tarefa guarda-chuva" - não tem implementação direta, só rastreia as 4 sub-tarefas

Cada sub-tarefa tem sua própria análise (menor agora) e plano.

---

## 11. Anti-Padrões

|Anti-padrão|Sintoma|Conserto|
|---|---|---|
|Pular análise em mudança grande|"Achei que era simples" → surpresa no fim|Mini-análise pelo menos|
|Análise genérica ("toca várias coisas")|Não previne nada|Liste arquivos específicos|
|Decisões "óbvias" sem documentar|Outro dev questiona depois|Registre brevemente|
|Análise sem mitigação|Lista problemas, não soluciona|Cada risco precisa de ação|
|Análise muito longa|Vira tese|1-2 páginas; foco em risco real|
|Análise depois do código|Já gastou esforço|Análise é **antes**|
|Decisões pendentes ignoradas|"Vou descobrir codando"|Pause e pergunte|

---

## 12. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Quando análise obrigatória?|Strict, áreas críticas, blast radius grande|
|Quando pode pular?|Light, escopo isolado, sem áreas críticas|
|Dimensões da análise?|Áreas / Features em risco / Decisões / Riscos residuais|
|Decisão pendente sem resposta?|Pause. Não chute|
|Risco não-mitigável?|Documenta como dívida técnica|
|Blast radius 25+ arquivos?|Divida a tarefa|
|Análise vs revisão?|Análise antes (previne); revisão depois (verifica)|
|Pode pular análise por pressão de prazo?|Não. Custo de não fazer é maior|

---

## 🔗 Módulos Relacionados

- [`20-ciclo-tarefa.md`](./20-ciclo-tarefa.md) - Análise faz parte de tarefas Strict
- [`21-revisao-codigo.md`](./21-revisao-codigo.md) - Revisão complementa análise
- [`22-refatoracao.md`](./22-refatoracao.md) - Refatoração grande precisa de análise
- [`../templates/32-adr.md`](../templates/32-adr.md) - Análises grandes viram ADR
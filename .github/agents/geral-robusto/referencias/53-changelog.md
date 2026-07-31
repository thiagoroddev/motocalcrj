---
description: "Changelog do pacote .agent/. Registra mudanças entre versões. Segue Keep a Changelog e SemVer adaptado."
modulo: "53"
categoria: "referencias"
versao: "3.3"
relacionado:
  - "00-INDICE.md"
  - "01-nucleo.md"
---

# 📋 Changelog do Pacote `.agent/`

> Registro de mudanças entre versões do pacote. Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento: [SemVer 2.0.0](https://semver.org/lang/pt-BR/) adaptado para pacote de documentação.

> ⚠️ **Duas numerações para o mesmo pacote** (reconciliado na `TASK-CHORE-023`).
> A versão corrente é a do núcleo: **3.3**. Este arquivo registrava `1.0.0` para o release de
> **2026-05-13**, que o [`01-nucleo.md`](../01-nucleo.md#11-changelog-deste-pacote) chama de **3.0** —
> mesmo evento, contagens diferentes (o núcleo continua de um sistema `2.0` anterior; este arquivo
> contava a primeira liberação *deste* pacote).
>
> **O histórico vivo está no núcleo, §11.** As versões 3.1 (2026-06-01), 3.2 (2026-06-06) e 3.3
> (2026-06-09) foram registradas lá e nunca chegaram aqui. Consolidar os dois changelogs num só é
> decisão de conteúdo, fora do escopo desta correção de integridade.

---

## Versionamento

Como pacote de instruções (não código executável), SemVer aplica adaptado:

|Tipo de mudança|Bump|
|---|---|
|**MAJOR** (X.0.0)|Mudança de regra inegociável do núcleo, reestruturação completa de pastas, quebra de convenção fundamental que invalida projetos existentes|
|**MINOR** (0.X.0)|Adição de módulo novo, expansão significativa de módulo existente, nova categoria, novo template/checklist|
|**PATCH** (0.0.X)|Correção de erro, ajuste de texto, link quebrado, melhoria de exemplo|

**Sinal prático:** se você precisa **revisar projetos existentes** ao atualizar o pacote, é MAJOR. Se pode **adicionar sem revisar**, é MINOR ou PATCH.

---

## Categorias de Mudança

Cada versão organiza mudanças em até 6 categorias (omitir as não usadas):

- **Adicionado** - funcionalidade nova
- **Mudado** - mudança em funcionalidade existente
- **Depreciado** - funcionalidade que será removida em versão futura
- **Removido** - funcionalidade removida
- **Corrigido** - correção de erro
- **Segurança** - mudança específica de segurança

---

## [1.0.0](# "Primeira liberação completa do pacote") - 2026-05-13

Primeira liberação do pacote.

### Adicionado

#### Fundação

- `00-INDICE.md` - índice navegável de todos os módulos
- `01-nucleo.md` - núcleo sempre carregado, com hierarquia de regras e 3 inegociáveis

#### Padrões (`padroes/`)

- `10-codigo-e-convencoes.md` - idioma, nomenclatura, magic numbers, Regra de Três
- `11-arquitetura-e-pastas.md` - estrutura de pastas e responsabilidades de cada camada
- `12-react-e-estado.md` - padrões de hooks, derivação direta, anti-`useEffect`
- `13-ui-e-design-system.md` - componentes UI, variantes, tokens, opção shadcn/ui
- `14-formularios-e-validacao.md` - Zod + react-hook-form, schema como fonte de verdade
- `15-testes.md` - Vitest + Testing Library, AAA, comportamento sobre implementação
- `16-performance-acessibilidade.md` - Core Web Vitals, WCAG AA, padrões para os dois
- `17-backend-node.md` - stub mínimo (Express, validação, isolamento de camadas)
- `18-seguranca-privacidade.md` - PII, storage, XSS, validação dupla, LGPD

#### Processos (`processos/`)

- `20-ciclo-tarefa.md` - ciclo pendentes → em-andamento → concluidas, modos Light/Standard/Strict, Esforço-H/IA
- `21-revisao-codigo.md` - auto-revisão IA, 3 níveis de achados, geração de tarefas
- `22-refatoracao.md` - definição estrita, code smells, SOLID em React, Regra de Três
- `23-modelagem-dominio.md` - DDD tático com estilos funcional e classe, linguagem ubíqua
- `24-figma-para-codigo.md` - análise visual, spec técnica, ordem de implementação, intent perfect
- `25-analise-impacto.md` - blast radius, decisões em aberto, dívida documentada
- `26-inicializacao-projeto.md` - 5 fases de engenharia reversa, arquivamento, ADRs retrospectivas

#### Templates (`templates/`)

- `30-task-em-andamento.md` - formato com cabeçalho em lista, variantes bloqueada/retomada/Strict
- `31-task-concluida.md` - imutável, ✅/❌ nos critérios, variantes cancelada/Light/Hotfix/Strict[[]]
- `32-adr.md` - anatomia, variantes retrospectiva/rejeitada/substituída, ciclo de vida
- `33-contexto-projeto-ai.md` - cartão de visitas para IAs, 3 variantes, hierarquia de regras
- `34-readme-projeto.md` - cartão para humanos, 3 variantes solo/OS/corporativo
- `35-componente-ui.md` - scaffold com clsx/cva, 3 variantes (sem variantes, composto, input)
- `36-hook-feature.md` - scaffold com interface mínima, 3 variantes (local, com service, composto)

#### Checklists (`checklists/`)

- `40-revisao-rapida.md` - master com versão essencial + 10 dimensões da versão completa
- `41-seguranca.md` - versão essencial inegociável + 10 categorias detalhadas
- `42-acessibilidade.md` - POUR + WCAG AA + 10 áreas + ferramentas (auto + manual)
- `43-performance.md` - Core Web Vitals + 10 áreas + como medir + trade-offs

#### Referências (`referencias/`)

- `50-anti-padroes.md` - catálogo procurável com 12 categorias e níveis 🔴🟡🟢
- `51-comandos.md` - quick reference de npm, Vite, Vitest, TypeScript, ESLint, Prettier, Git + combos
- `52-glossario-termos-tecnicos.md` - formato híbrido (índice alfabético + 11 categorias temáticas)
- `53-changelog.md` - este arquivo

### Decisões Arquiteturais Inegociáveis (Núcleo)

Estabelecidas em `01-nucleo.md` seção 1.3. Não podem ser sobrescritas por `contexto-projeto-ai.md`:

1. **Confirmação antes de ações destrutivas** - IA pergunta antes de deletar, sobrescrever sem backup, modificar arquivo crítico
2. **Proibição de `any` sem justificativa** - TypeScript strict, `any` exige comentário documentando o motivo
3. **Código é a verdade primária** - divergência entre doc e código vence o código

### Convenções Estabelecidas

Definidas ao longo do pacote, referenciadas em múltiplos arquivos:

- **Idioma:** decisão por projeto, registrada em `docs/contexto-projeto-ai.md`
- **Modos de cerimônia:** Light / Standard / Strict
- **Prefixo de tarefas:** `TASK-RF`, `TASK-BG`, `TASK-REF`, etc.
- **Urgência:** Imediata / Normal (apenas dois valores)
- **Esforço:** duplo H/IA (humano e IA medidos separadamente)
- **Datas:** `DD/MM/AA HH:MM` em campos; `AAAA-MM-DD-HHhMM` em nomes de arquivo
- **3 níveis de achados em revisão:** 🔴 Bloqueante / 🟡 Importante / 🟢 Sugestão
- **Limite simultâneo:** até 3 tarefas em `em-andamento.md`
- **WCAG mira:** nível AA por padrão
- **Pixel vs Intent perfect:** Intent perfect (tokens > medidas exatas)

### Estatísticas

- **Total de arquivos:** 33 (incluindo este changelog)
- **Total de linhas:** ~19.000
- **Total de tokens:** ~155.000 distribuídos
- **Núcleo carregado sempre:** ~3.000 tokens
- **Tempo de desenvolvimento:** primeira versão construída em uma sessão extensa com aprovação iterativa

---

## Como Atualizar o Pacote em Projetos Existentes

Quando uma versão nova do pacote sai, projetos que usam podem atualizar.

### Tipo de Atualização

|Bump|Ação|
|---|---|
|**PATCH** (1.0.0 → 1.0.1)|Substituir o pacote `.agent/` inteiro. Sem revisão necessária|
|**MINOR** (1.0.0 → 1.1.0)|Substituir o pacote. Ler a seção "Adicionado" do changelog para conhecer o que veio de novo|
|**MAJOR** (1.0.0 → 2.0.0)|**Avaliar antes de atualizar.** Ler "Mudado" e "Removido". Pode exigir revisão de tarefas/ADRs existentes|

### Processo Sugerido

```bash
# 1. Antes de atualizar, registre o estado atual
git status   # garantir que está limpo
git log --oneline -1  # registrar commit atual

# 2. Substitua o pacote
rm -rf .agent
# (copiar a versão nova)

# 3. Verifique o changelog
cat .agent/referencias/53-changelog.md   # ler o que mudou

# 4. Para MAJOR, revisar:
# - docs/contexto-projeto-ai.md (compatível com novas convenções?)
# - docs/tarefas/em-andamento.md (formato ainda válido?)
# - docs/arquitetura/ADR/ (referências ainda válidas?)

# 5. Commit
git add .agent
git commit -m "chore: atualiza pacote .agent para X.Y.Z"
```

### Quando MAJOR Justifica Não Atualizar

Você pode escolher **não atualizar** se:

- O projeto está em fase crítica (próximo a deploy importante)
- Mudança MAJOR afeta convenção que você customizou
- Custo de migração não compensa o ganho

Pacote velho continua válido. Pin de versão é estratégia válida.

---

## Histórico Futuro

Quando houver versões novas, adicionar acima desta seção, no formato:

```markdown
## [X.Y.Z] - AAAA-MM-DD

### Adicionado
- [item]

### Mudado
- [item]

### Removido
- [item]
```

**Convenção:** versões mais recentes ficam **no topo**, abaixo da seção de "Versionamento". Versão 1.0.0 fica como referência ancorada.

---

## Mini-FAQ

**1. Por que ter changelog se o pacote ainda está na versão 1.0?** Para já estabelecer o **formato** desde o início. Quando mudanças vierem, é só seguir o padrão. Sem changelog estabelecido, primeira atualização vira improviso.

**2. Quando bumpa MAJOR?** Quando alguma das 3 inegociáveis do núcleo muda, ou quando reestruturação invalida `contexto-projeto-ai.md` ou tarefas escritas no formato antigo. Conservador - MAJOR é raro.

**3. Pacote `.agent/` precisa de tag Git?** Útil mas não obrigatório. Se você versiona o pacote como Git separado, sim. Se é parte de um projeto, basta esta data no changelog.

**4. Como sei qual versão do pacote eu tenho?** Olhe o topo do `00-INDICE.md` (campo `versao` no frontmatter) ou a versão mais recente neste changelog.

**5. Posso usar versão velha do pacote em projeto novo?** Pode. Versões antigas continuam válidas. Mas você perde benefícios das versões mais recentes (módulos novos, correções, refinamentos).

**6. Quem mantém este arquivo atualizado?** Quem propõe mudança no pacote atualiza este arquivo no mesmo commit. Se a IA propõe mudança, ela deve atualizar - mas humano valida antes de mergear.

**7. E se eu quiser personalizar o pacote?** Você pode (e deve, conforme a necessidade do projeto). Fork mental: marcar no `contexto-projeto-ai.md` que você customizou e descrever divergências. Para mudanças grandes, registrar como ADR retrospectiva.

**8. Manter o changelog em PT ou EN?** Acompanha a decisão de idioma do pacote. Este pacote está em português; o changelog também. Para pacote em inglês, traduzir adequadamente.

---

## 🔗 Referências Externas

- Keep a Changelog: https://keepachangelog.com/pt-BR/1.1.0/
- SemVer (Versionamento Semântico): https://semver.org/lang/pt-BR/

---

## 🔗 Outros Arquivos do Pacote

- [`00-INDICE.md`](../00-INDICE.md) - Mapa geral
- [`01-nucleo.md`](../01-nucleo.md) - Regras inegociáveis
- [`50-anti-padroes.md`](./50-anti-padroes.md) - Catálogo de anti-padrões
- [`51-comandos.md`](./51-comandos.md) - Quick reference de comandos
- [`52-glossario-termos-tecnicos.md`](./52-glossario-termos-tecnicos.md) - Definições
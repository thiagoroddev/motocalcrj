---

description: "Template do README.md do projeto. Cartão de visitas para humanos. Complementa contexto-projeto-ai.md (que é para IAs)." modulo: "34" categoria: "templates" versao: "1.0" arquivo_destino: "README.md" relacionado:

- "33-contexto-projeto-ai.md"
- "26-inicializacao-projeto.md"

---

# 📘 Template: `README.md` do Projeto

> **Arquivo destino:** `README.md` (na raiz do repositório) **Quando usar:** ao criar projeto novo ou ao executar [módulo 26](https://claude.ai/processos/26-inicializacao-projeto.md) em projeto existente. **Audiência primária:** humanos que clonam o repo e querem rodar/contribuir.

---

## README ≠ contexto-projeto-ai

Os dois arquivos existem com **propósitos distintos**. Confundi-los gera ou redundância ou lacunas.

|`README.md`|`contexto-projeto-ai.md`|
|---|---|
|Para **humanos** que abrem o repo|Para **IAs** que vão trabalhar no projeto|
|Pergunta: "como rodar?"|Pergunta: "como decidir?"|
|Setup, scripts, comandos|Decisões, convenções, hierarquia|
|Vive na **raiz** do repositório|Vive em `docs/`|
|Pode incluir badges, screenshots|Sem decoração visual|
|Foco prático|Foco arquitetural|

**Princípio:** README responde _"o que isso é e como faço funcionar"_. Contexto-projeto-ai responde _"que regras seguir e onde olhar quando precisar de detalhe"_.

---

## Princípios

### Tamanho Alvo

- **Mínimo útil:** 30 linhas (projeto solo enxuto)
- **Médio típico:** 80-150 linhas
- **Limite saudável:** 250 linhas

Passou de 300, está sufocando o leitor. Detalhe vai para `docs/`.

### Os 4 Tempos

|Tempo|Leitor consegue|
|---|---|
|**5 segundos**|Saber o que é o projeto (lendo só o título + tagline)|
|**30 segundos**|Saber o que faz, em que estado está, e se serve para o caso dele|
|**3 minutos**|Rodar localmente (com sucesso)|
|**10 minutos**|Entender a estrutura geral e saber onde olhar para detalhes|

Se algum desses tempos falha, o README não está cumprindo seu papel.

### O Que ENTRA

- **Título e tagline** (1 frase: o que é + para quem)
- **Status do projeto** (alpha, beta, produção, etc.)
- **Visão rápida** (1-2 parágrafos do "o que faz")
- **Stack resumida** (libs principais)
- **Como rodar** (passos numerados, comandos copiáveis)
- **Scripts disponíveis** (npm run X, o que cada um faz)
- **Estrutura de pastas** (alto nível, sem entrar em detalhes)
- **Onde olhar para detalhe** (links para `docs/`)
- **Como contribuir** (se aplicável)
- **Licença** (se aplicável)

### O Que NÃO ENTRA

- ❌ **Roadmap detalhado** (vai em `docs/` ou ferramenta de produto)
- ❌ **Histórico extenso** (vai em `CHANGELOG.md` se necessário)
- ❌ **Tutoriais longos** (vão em `docs/tutorials/` ou wiki)
- ❌ **API completa** (vai em documentação dedicada)
- ❌ **Discussões de design** (vão em ADRs)
- ❌ **Segredos, tokens, configs sensíveis** (nunca)

---

## Estrutura Completa (Exemplo Preenchido)

Continuação do AlugaCar (mesmo projeto do template 33).

````markdown
# AlugaCar

> Sistema de gestão de aluguel de carros para frotas pequenas e médias. Web app responsivo com foco em desktop.

**Status:** Beta interno (clientes-piloto)
**Stack:** React 18 · TypeScript 5 · Vite 5 · Tailwind 3 · Zustand

---

## 🎯 O Que Faz

AlugaCar gerencia o ciclo completo de aluguel de carros para empresas de frota pequena (até ~50 veículos). Cobre:

- Cadastro de clientes, veículos e contratos
- Reservas e disponibilidade em tempo real
- Geração de documentos (contrato, recibo)
- Histórico de manutenção e quilometragem
- Dashboard administrativo

**Foco:** simplicidade operacional para equipes que não usavam ERP antes.

---

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 20+
- npm 10+ (ou pnpm 9+)
- Acesso ao backend (variáveis em `.env.example`)

### Setup

```bash
# 1. Clone
git clone https://github.com/[org]/alugacar.git
cd alugacar

# 2. Instale
npm install

# 3. Configure
cp .env.example .env
# (edite .env com suas credenciais)

# 4. Rode
npm run dev
````

Acesse `http://localhost:5173`. Login de teste: `admin@teste.com` / `123456`.

### Build de produção

```bash
npm run build       # gera dist/
npm run preview     # serve dist/ localmente para validar
```

---

## 📜 Scripts Disponíveis

|Comando|O Que Faz|
|---|---|
|`npm run dev`|Inicia dev server (Vite, port 5173)|
|`npm run build`|Build de produção em `dist/`|
|`npm run preview`|Servir `dist/` localmente|
|`npm run test`|Roda todos os testes (Vitest)|
|`npm run test:watch`|Testes em modo watch|
|`npm run lint`|Lint com ESLint|
|`npm run typecheck`|Validação de tipos sem build|

---

## 📁 Estrutura

```
alugacar/
├── src/
│   ├── components/     # Componentes (ui/, layout/, [domínio]/)
│   ├── hooks/          # Hooks customizados
│   ├── stores/         # Stores Zustand (estado global)
│   ├── api/            # Acesso ao backend
│   ├── pages/          # Páginas / rotas
│   ├── lib/            # Utilitários
│   └── types/          # Tipos compartilhados
├── docs/               # Documentação detalhada
├── .agent/             # Pacote de instruções para IA
├── public/             # Assets estáticos
└── .env.example        # Template de variáveis de ambiente
```

Detalhamento completo: [`docs/arquitetura/visao-geral.md`](https://claude.ai/chat/docs/arquitetura/visao-geral.md).

---

## 📚 Documentação

|Para|Onde|
|---|---|
|Visão completa do projeto|[`docs/contexto-projeto-ai.md`](https://claude.ai/chat/docs/contexto-projeto-ai.md)|
|Requisitos do produto|[`docs/requisitos/`](https://claude.ai/chat/docs/requisitos/)|
|Decisões arquiteturais|[`docs/arquitetura/ADR/`](https://claude.ai/chat/docs/arquitetura/ADR/)|
|Convenções de código|[`docs/arquitetura/convencoes.md`](https://claude.ai/chat/docs/arquitetura/convencoes.md)|
|Setup detalhado|[`docs/arquitetura/setup-inicial.md`](https://claude.ai/chat/docs/arquitetura/setup-inicial.md)|
|Tarefas em andamento|[`docs/tarefas/em-andamento.md`](https://claude.ai/chat/docs/tarefas/em-andamento.md)|

---

## 🤝 Contribuição

1. Leia [`docs/arquitetura/convencoes.md`](https://claude.ai/chat/docs/arquitetura/convencoes.md)
2. Crie branch a partir de `develop`: `git checkout -b feat/sua-feature`
3. Siga o ciclo de tarefas em [`.agent/processos/20-ciclo-tarefa.md`](https://claude.ai/chat/.agent/processos/20-ciclo-tarefa.md)
4. Abra PR para `develop` com referência à tarefa

PRs sem tarefa rastreável ou sem testes verdes não são aceitos.

---

## 📝 Licença

Proprietário. Uso interno apenas. Ver `LICENSE`.

---

## 📞 Contato

- Time: [link interno]
- Tickets: [link do issue tracker]
- Documentação completa: pasta [`docs/`](https://claude.ai/chat/docs/)

````

---

## Template Vazio (Para Copiar)

```markdown
# [Nome do Projeto]

> [1 frase: o que é + para quem]

**Status:** [Alpha / Beta / Produção / Manutenção]
**Stack:** [libs principais separadas por · — ex: React 18 · TypeScript 5 · Vite]

---

## 🎯 O Que Faz

[1-2 parágrafos descrevendo as funcionalidades principais. Lista de bullets se ajudar]

- [funcionalidade 1]
- [funcionalidade 2]

**Foco:** [diferencial / proposta de valor em 1 frase]

---

## 🚀 Como Rodar

### Pré-requisitos

- [Node X+]
- [npm/pnpm versão]
- [outros pré-requisitos: Docker, Postgres, etc.]

### Setup

```bash
git clone [URL]
cd [pasta]
npm install
cp .env.example .env
# (configure .env)
npm run dev
````

Acesse `http://localhost:PORTA`. [Credenciais de teste, se aplicável]

---

## 📜 Scripts Disponíveis

|Comando|O Que Faz|
|---|---|
|`npm run dev`|[descrição]|
|`npm run build`|[descrição]|
|`npm run test`|[descrição]|

---

## 📁 Estrutura

```
[árvore de pastas em alto nível]
```

Detalhamento completo: [`docs/arquitetura/visao-geral.md`](https://claude.ai/chat/docs/arquitetura/visao-geral.md).

---

## 📚 Documentação

|Para|Onde|
|---|---|
|Visão completa|[`docs/contexto-projeto-ai.md`](https://claude.ai/chat/docs/contexto-projeto-ai.md)|
|Requisitos|[`docs/requisitos/`](https://claude.ai/chat/docs/requisitos/)|
|Decisões arquiteturais|[`docs/arquitetura/ADR/`](https://claude.ai/chat/docs/arquitetura/ADR/)|
|Convenções|[`docs/arquitetura/convencoes.md`](https://claude.ai/chat/docs/arquitetura/convencoes.md)|

---

## 🤝 Contribuição

[Se projeto pessoal solo, pode remover esta seção] [Se projeto colaborativo, descrever o fluxo: branches, PRs, revisão]

---

## 📝 Licença

[Tipo de licença ou "Proprietário"]

````

---

## Variante 1: Projeto Solo Pequeno

Para projeto pessoal/estudo, muito do template inflado não faz sentido. Versão mínima:

```markdown
# [Nome]

> [O que é em 1 frase]

Projeto pessoal de [aprendizado / experimento / utilitário].

## Rodando

```bash
npm install
npm run dev
````

## Scripts

- `npm run dev` — dev server
- `npm run build` — build
- `npm run test` — testes

## Estrutura

Padrão do pacote [`.agent/`](https://claude.ai/chat/.agent/). Detalhes em [`docs/contexto-projeto-ai.md`](https://claude.ai/chat/docs/contexto-projeto-ai.md).

````

30 linhas. Suficiente para você voltar em 6 meses.

---

## Variante 2: Projeto Público Open Source

Adições importantes para repo público:

```markdown
# [Nome]

[badges no topo]
![Build](https://img.shields.io/...)
![License](https://img.shields.io/...)
![Version](https://img.shields.io/...)

> [Tagline]

[screenshot ou GIF de demo]

---

## 🌟 Por Que Usar Este Projeto?

[Diferencial competitivo. Por que escolher este em vez de alternativas]

- [vantagem 1]
- [vantagem 2]

## 📦 Instalação

```bash
npm install [pacote]
# ou
pnpm add [pacote]
````

## 🎬 Quick Start

```javascript
// código mínimo funcional
import { algo } from '[pacote]'

algo()
```

[Continua com seções normais]

## 💖 Contribuir

Aceitamos contribuições. Leia [`CONTRIBUTING.md`](https://claude.ai/chat/CONTRIBUTING.md) primeiro.

Issues: [link] Discord/Slack: [link]

## 📜 Licença

MIT — ver [`LICENSE`](https://claude.ai/chat/LICENSE).

## 🙏 Agradecimentos

- [pessoa/projeto inspirador]
- [biblioteca usada que merece crédito]

````

---

## Variante 3: Projeto Interno Corporativo

Foco em onboarding rápido de novos devs internos:

```markdown
# [Nome do Projeto]

> [Tagline interna]

**Time:** [time responsável]
**Squad/Tribe:** [se aplicável]
**Tier:** [crítico / importante / experimental]
**On-call:** [link do schedule]

---

## 🎯 O Que Faz

[Descrição focada em valor para o negócio interno]

## 👋 Onboarding

Se você acabou de chegar no time:

1. Leia [`docs/arquitetura/visao-geral.md`](./docs/arquitetura/visao-geral.md)
2. Configure o ambiente (próxima seção)
3. Rode `npm run dev` e explore
4. Pegue uma tarefa de [`docs/tarefas/pendentes.md`](./docs/tarefas/pendentes.md) marcada com `bom-pra-comecar`

## 🔧 Setup

[Setup com referências a credenciais internas, VPN, etc.]

## 📊 Observabilidade

- Logs: [link]
- Métricas: [link]
- Alertas: [link]

## 🚨 Incidentes

Em caso de problema em produção:
1. [Procedimento de mitigação imediata]
2. [Quem notificar]

Detalhes: [`docs/runbooks/`](./docs/runbooks/)

[Resto similar ao template padrão]
````

---

## Seções Opcionais

Use só se fizerem sentido para seu projeto.

### Badges

```markdown
![Build Status](https://img.shields.io/...)
![Coverage](https://img.shields.io/...)
![License](https://img.shields.io/...)
![Last Commit](https://img.shields.io/...)
```

Cuidado: badges quebrados (CI removido, serviço fora) ficam piores que sem badges. Mantenha.

### Screenshots / Demo

Útil para:

- UIs vistosas que precisam ser vistas
- Projetos open source vendendo a ideia
- Apps que dependem de visual

Use:

- PNG/JPG comprimido (não MB enorme)
- GIF para fluxos curtos (atenção ao tamanho)
- Link para demo ao vivo se houver

### Roadmap Resumido

```markdown
## 🗺️ Roadmap

- [x] MVP com features básicas
- [x] Beta com clientes-piloto
- [ ] Versão 1.0 (Q3/26)
- [ ] Integração com [serviço externo]

Roadmap completo: [link]
```

Mantenha curto. Roadmap detalhado vive em ferramenta de produto, não em README.

### FAQ

```markdown
## ❓ FAQ

**Por que não usaram [tecnologia X]?**
[Resposta de 2-3 linhas. Linka ADR se houver]

**Como faço Y?**
[Resposta ou link para documentação]
```

Só inclua perguntas que de fato aparecem. FAQ inventado é ruído.

---

## Mini-FAQ

**1. Posso ter README sem nenhuma das "seções obrigatórias"?** Sim, se o projeto é simples e o leitor consegue cumprir os 4 tempos (5s, 30s, 3min, 10min). README mínimo viável é melhor que README inflado.

**2. README em português ou inglês?** Siga a decisão de idioma do projeto (registrada em `contexto-projeto-ai.md`). Projeto open source visando audiência global: inglês. Projeto interno brasileiro: português.

**3. Quem atualiza o README?** Quem mexe em algo que aparece no README atualiza no mesmo PR. Comando mudou? Atualiza. Script novo? Atualiza. Estrutura mudou? Atualiza.

**4. Posso linkar de fora do repo (Notion, Confluence)?** Pode, mas com cautela. Links externos quebram. Prefira manter o essencial no próprio repo (README + `docs/`).

**5. Como sei se README está bom?** Teste: peça para alguém que nunca viu o projeto clonar e rodar **só lendo o README**. Se conseguir em 5-10 minutos, está bom. Se travar, melhore.

**6. Devo incluir comandos de Docker, Kubernetes, etc.?** Se o setup padrão depende deles, sim — mas no nível "como rodar". Detalhes de configuração avançada vão em `docs/`.

**7. Posso colocar emojis nos títulos?** Pode. Ajuda na varredura visual. Mas modere — 1 emoji por seção é suficiente.

**8. README e contexto-projeto-ai podem ter informação repetida?** Mínimo de sobreposição. **Stack** pode aparecer nos dois (resumida no README, detalhada no contexto-projeto-ai). **Decisões inegociáveis** ficam só no contexto-projeto-ai. Setup detalhado fica só no README ou em `docs/arquitetura/setup-inicial.md`.

---

## 🔗 Templates e Módulos Relacionados

- [`33-contexto-projeto-ai.md`](https://claude.ai/chat/33-contexto-projeto-ai.md) — Cartão de visitas para IAs (complementa este)
- [`../processos/26-inicializacao-projeto.md`](https://claude.ai/processos/26-inicializacao-projeto.md) — Quando criar este arquivo
- [`../padroes/11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Estrutura de pastas referenciada
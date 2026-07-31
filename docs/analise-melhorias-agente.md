# Análise e Melhorias do Agente e do Processo de Qualidade

> **Resumo em uma frase:** o processo escrito deste projeto é melhor que a média do mercado, mas ele
> só *aconteceu de verdade* onde virou comando executável — e a parte que ficou só em prosa (segurança,
> performance, aceite) não aconteceu nenhuma vez em 197 tarefas, o que já deixou uma vulnerabilidade
> **HIGH em dependência de produção** num app publicado.

**Escopo analisado:** `docs/tarefas/` (197 tarefas concluídas + backlog), `.github/agents/geral-robusto/`
(36 arquivos), `.github/agents/geral-leve/` (6 arquivos), configuração real do repositório e do deploy.

**Objetivo:** propor uma norma que impeça que qualquer pessoa — inclusive uma sem experiência,
usando IA — publique um projeto com problema de segurança ou de qualidade, **sem depender de a IA
lembrar das próprias instruções**.

---

## 1. O diagnóstico central

O pacote `.agent`/`geral-robusto` tem ~19.000 linhas descrevendo processo profissional. A pergunta que
importa não é "está bem escrito?" (está), e sim: **quais dessas regras deixaram rastro de execução?**

A resposta está nos próprios registros das 197 tarefas concluídas:

| Gate | Onde está escrito | Existe como comando? | Vezes executado em 197 tarefas |
|---|---|:---:|---:|
| Testes | `20-ciclo-tarefa.md` §5.2 | ✅ `npm run test` | **182** |
| Typecheck | `20-ciclo-tarefa.md` §5.2 | ✅ `npm run typecheck` | **141** |
| Lint | núcleo §10 | ✅ `npm run lint` | frequente |
| **`npm audit`** | `41-seguranca.md` §6, `18-*.md` §12.1 | ❌ só prosa | **0** |
| **Lighthouse / performance** | `43-performance.md` inteiro | ❌ só prosa | **0** |
| **Checklist de acessibilidade** | `42-acessibilidade.md` inteiro | ❌ só prosa | 0 sistemático |
| **Headers de segurança** | `18-*.md` §7 (seção inteira) | ❌ só prosa | **0** |

A correlação é perfeita e não é coincidência:

> ### 📐 Lei do Gate Mecânico
> **Uma regra que não vira comando não existe.** Não importa quantas páginas a descrevem, quantos
> emojis de "inegociável" ela tem, nem quantas vezes o agente promete segui-la. Se não há um comando
> que falhe quando ela é violada, ela será cumprida por acaso — e, na prática, quase nunca.

Os 314 lindos itens do `41-seguranca.md` produziram **zero** verificações. Os 3 comandos do
`package.json` produziram **323** verificações registradas. Essa é toda a análise, em duas linhas.

### O custo real, hoje, neste repositório

```
HIGH   react-router  | Open redirect via backslash em <Link> e useNavigate (bypass do CVE-2025-68470)
```

`react-router-dom@7.15.1` é **dependência de produção** — está no bundle publicado na Vercel. Junto
dela: 10 vulnerabilidades no total (1 crítica, 7 altas), todas com correção disponível via
`npm audit fix`. Nenhuma foi detectada porque o comando que as detecta nunca foi rodado, embora
esteja documentado em dois módulos diferentes desde a versão 1.0.0 do pacote.

Não é um problema de conhecimento. É exatamente o que o próprio módulo 18 diz na primeira linha:
*"a maioria dos bugs de segurança vem de falta de hábito, não de ignorância"*. O pacote diagnosticou
o problema certo e então tentou resolvê-lo com mais texto.

---

## 2. Achados

### A1 — O agente é juiz e réu do próprio trabalho

**Evidência:** não existe `.github/workflows/`, não existe hook de git (`.husky`), não existe nenhum
CI. Todo gate é declarado pelo próprio agente, no mesmo arquivo markdown que ele escreve.

O núcleo v3.2 precisou adicionar um anti-padrão explícito: *"Declarar gate verde sem executá-lo, ou
concluir com gate bloqueado"*. Isso é a confissão do problema: **a regra existe porque a falha
aconteceu**, e a resposta à falha foi mais prosa pedindo honestidade ao mesmo ator que falhou.

**Por que importa:** honestidade não é mecanismo de controle. Um agente com contexto truncado, ou uma
sessão nova, ou um modelo diferente, ou um "vibecoder" com pressa vai declarar verde de novo. A
correção certa não é pedir honestidade — é tornar a mentira impossível de sustentar, colocando o
veredito num sistema que o agente não controla.

**Correção:** camada 2 da norma (§3) — CI no GitHub Actions. O agente pode mentir no markdown; ele não
pode mentir sobre o status de um workflow que roda no servidor da GitHub.

---

### A2 — A auto-revisão se auto-aprova em ~99% dos casos

**Evidência:** em 197 tarefas concluídas, o veredito **REPROVADO** aparece em **2 arquivos** (~1%).
Todo o resto é "APROVADO" ou "APROVADO com ressalvas".

O próprio `21-revisao-codigo.md` §9.2 previu isso com precisão: *"Detectar problemas em código que ela
mesma escreveu errado. Se a IA tem viés, ela pode ter o mesmo viés ao revisar"*. O módulo identificou
o limite e então… pediu que a IA "sinalizasse incerteza". Mesmo ator, mesmo viés, mesma janela de
contexto — a mitigação não muda a estrutura do incentivo.

**Por que importa:** a taxa de 1% de reprovação não significa que o código estava 99% certo. Significa
que 38 tarefas de bug (`TASK-BG-001` a `TASK-BG-038`) foram abertas *depois*, quase todas encontradas
pelo humano usando o app — não pela revisão que havia acabado de aprovar aquele mesmo código.

**Correção:** separação de papéis (§4). Quem revisa não pode ser quem escreveu, e a revisão precisa
rodar com contexto próprio, não como continuação da conversa que produziu o código.

---

### A3 — O canal de descoberta de defeito é o usuário final

**Evidência:** 38 `TASK-BG` em 197 tarefas (19%). Lendo os títulos, o padrão domina: *"Seguro:
periodicidade mensal não remultiplica valor"*, *"CPK sem alimentação respeita filtro"*, *"Ancorados sem
troca no período deixam de sumir sem rastro"*. São **divergências entre a regra de negócio e o
comportamento**, não erros de sintaxe. E o projeto já normalizou isso a ponto de ter uma regra própria:
bug descoberto em uso real entra direto em `em-andamento.md`.

**Por que importa:** 43 arquivos de teste para 191 arquivos-fonte cobrem *unidades*. Nenhuma camada
cobre *"o requisito RF-6.11 continua valendo depois desta mudança?"*. O requisito vive em
`docs/requisitos/`, o teste vive em `src/`, e nada liga os dois. Por isso a regressão de regra de
negócio só aparece quando um humano abre o app e estranha um número.

**Correção:** rastreabilidade requisito ↔ teste — cada RF/RN de cálculo, dinheiro ou persistência ganha
um teste que cita o ID do requisito no nome, e um script passa a responder "quais requisitos não têm
teste". Especificação, medição e o porquê de a prática ser desconhecida no ecossistema web: **§7.5**.

---

### A4 — O pacote de instruções está fisicamente quebrado

Isto é o achado mais irônico do conjunto: **o mecanismo de carregamento sob demanda, que é o coração
da arquitetura modular do pacote, não funciona.**

| Problema | Medição | Consequência |
|---|---|---|
| Arquivos com extensão dupla `.md.md` | **33 de 36** | Não casam com nenhum glob `*.md` esperado; quebram links |
| Links internos apontando para `https://claude.ai/...` | **504 ocorrências** | Toda a navegação "carregue o módulo X" leva para fora do repositório. Nenhum link resolve |
| Frontmatter YAML inválido | núcleo + todos os `geral-robusto` | Linha em branco após `---` e campos colapsados numa linha (`description: "…" applyTo: "**/*" versao:`). O `applyTo` **não é aplicado por nenhuma ferramenta** |
| Nome com acento | `18-segurança-privacidade.md.md` | Referenciado 6× como `18-seguranca-privacidade.md` — nunca resolve |
| Versão divergente | núcleo diz `3.3`, changelog diz `1.0.0` | A referência de versão do próprio pacote contradiz a si mesma |
| Dois pacotes concorrentes | `geral-leve/` e `geral-robusto/` | Sem precedência declarada. Qual vale? |

O `geral-leve/` tem frontmatter **válido** (`description` + `applyTo` corretos, `.agent.md`). O
`geral-robusto/` — o pacote mais elaborado, o que contém as regras inegociáveis — é o que está
quebrado. O arquivo que se declara *"sempre carregado"* na primeira linha é, tecnicamente, o que tem
menos chance de ser carregado automaticamente.

**Por que importa:** o pacote foi escrito numa conversa de chat e colado no repositório sem uma
verificação de integridade. Ninguém rodou um link-checker — porque, de novo, **não havia comando**.
Enquanto isso, o `uso-de-ia.md` afirma publicamente que existe *"uma camada de instruções versionada
que qualquer pessoa pode ler"*. A afirmação é verdadeira quanto ao conteúdo e falsa quanto à navegação.

**Correção:** `TASK-CHORE-020` (§8) + um lint de documentação no CI que quebra o build se houver link
morto ou frontmatter inválido.

---

### A5 — O lançamento público aconteceu antes do portão de lançamento

**Evidência:** o app está publicado (Vercel + PWA, `TASK-RNF-8.2` concluída *"no lançamento"*).
Continuam **pendentes** no backlog:

- `TASK-RNF-9.1` — Performance e acessibilidade (Lighthouse, WCAG, toque 48px)
- `TASK-RNF-9.2` — **Revisão final e QA** (Crítico, "Todas as anteriores")
- `TASK-REF-47` — bundle único de **920 kB** (226 kB gzip), marcada IMEDIATA

E o `vercel.json` tem exatamente uma linha útil (`rewrites`): **nenhum header de segurança
configurado pelo projeto**. Medindo a resposta real da produção (`curl -I`), o único que chega ao
usuário é `Strict-Transport-Security`, e por padrão da plataforma — a Vercel o injeta sozinha
(`max-age=63072000; includeSubDomains; preload`), sem nenhum mérito do repositório. Continuam
ausentes **CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e
`Permissions-Policy`** — apesar de o módulo 18 dedicar duas seções inteiras (§6 e §7) ao assunto e o
checklist 41 listar os cinco headers, item por item.

> Detalhe que vale a pena registrar: a primeira versão desta análise afirmou "sem HSTS", porque foi
> escrita lendo o `vercel.json` em vez de medir a resposta servida. O erro só apareceu quando a
> `TASK-RNF-015` rodou `curl -I` — e a configuração que eu ia aplicar teria **rebaixado** o header
> da plataforma de 2 anos para 1, removendo o `preload`. É a própria tese deste documento se
> aplicando a ele mesmo: **ler o arquivo de configuração não é o mesmo que verificar o
> comportamento.**

**Por que importa:** este é literalmente o cenário do enunciado — projeto publicado com a tarefa "QA
final" ainda aberta. E note o detalhe agravante: o público-alvo são motoboys em conexão móvel, e o
próprio backlog reconhece que 920 kB *"é justamente o público que mais sente isso"*. O processo
identificou o problema, escreveu-o com precisão, classificou como IMEDIATA — e publicou assim mesmo,
porque **nada impedia publicar**.

**Correção:** Portão de Lançamento (§5) — um comando que decide, sozinho, se o projeto pode ir a
público. Deploy deixa de ser um ato de vontade e passa a ser consequência de um gate verde.

---

### A6 — As regras nasceram reativas, uma tragédia por vez

**Evidência:** changelog do núcleo. v3.2 adiciona o anti-padrão de gate não-verificado. v3.3 adiciona
a regra de numeração de IDs. Cada versão é a cicatriz de um incidente específico.

**Por que importa:** processo reativo protege contra o erro que já custou caro e deixa em aberto todos
os que ainda não aconteceram — exatamente os que um iniciante não sabe antecipar. Um pacote que serve
para "não deixar amador publicar problema" precisa carregar o conhecimento *antes* do incidente,
como gate padrão ligado desde o commit zero.

**Correção:** a norma do §3 já vem com os gates que ainda não custaram caro aqui (audit, headers,
budget de bundle, a11y) **ligados por padrão**, com desligamento explícito e justificado — inverte o
ônus: hoje ligar é esforço; passa a ser desligar.

---

## 3. A Norma: Gate Mecânico em 4 camadas

O princípio único: **toda regra de qualidade termina em um comando que falha**. Prosa explica o porquê;
o comando garante o cumprimento. Onde não der para automatizar, a regra vira uma pergunta de resposta
obrigatória — não uma recomendação.

```
Camada 1  npm run verify      (segundos)  → o agente roda a cada tarefa
Camada 2  CI GitHub Actions   (minutos)   → autoridade externa, o agente NÃO controla
Camada 3  pre-push hook       (segundos)  → impede que o erro chegue no remoto
Camada 4  npm run gate:lancamento         → decide se pode ir a público
```

### Camada 1 — `verify` expandido

O `verify` atual (`typecheck && lint && test`) é bom e por isso funcionou. Falta acoplar nele o que
hoje é prosa:

```jsonc
{
  "scripts": {
    // gate rápido, a cada tarefa
    "verify": "npm run typecheck && npm run lint && npm run test && npm run audit:prod",

    // segurança: falha se houver vulnerabilidade alta em dependência de PRODUÇÃO
    "audit:prod": "npm audit --omit=dev --audit-level=high",
    // visão completa (dev incluído) — informativa, não bloqueante
    "audit:all": "npm audit --audit-level=moderate || true",

    // integridade da documentação e do pacote de agentes
    "lint:docs": "node scripts/check-docs.mjs",

    // relatório de saúde: o que falta no projeto (§6)
    "doctor": "node scripts/doctor.mjs",

    // portão de lançamento (§5)
    "gate:lancamento": "node scripts/gate-lancamento.mjs"
  }
}
```

> **Nota sobre `--omit=dev`:** o `.npmrc` deste projeto força `include=dev` (por causa do
> `NODE_ENV=production` em algumas máquinas, `TASK-CHORE-011`), o que faz o `--omit=dev` do audit não
> surtir efeito na linha de comando. O `scripts/audit-prod.mjs` deve, portanto, ler o JSON do
> `npm audit --json` e filtrar pelas dependências que constam em `package.json:dependencies` — assim o
> gate distingue de fato produção de desenvolvimento, em vez de bloquear por uma CVE do Vitest.

### Camada 2 — CI: a autoridade que o agente não controla

Este é o item que resolve A1 e A2 de uma vez. Crie `.github/workflows/verificacao.yml`:

```yaml
name: Verificação

on:
  push:
    branches: ['**']
  pull_request:

jobs:
  gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      # --- gates bloqueantes ---
      - name: Typecheck
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Testes
        run: npm run test
      - name: Build
        run: npm run build
      - name: Auditoria de dependências de produção
        run: npm run audit:prod
      - name: Integridade da documentação
        run: npm run lint:docs

      # --- informativos: reportam, não bloqueiam ---
      - name: Auditoria completa (dev incluído)
        run: npm run audit:all
        continue-on-error: true
      - name: Relatório de saúde
        run: npm run doctor
        continue-on-error: true

      # --- orçamento de bundle: falha se o chunk crescer ---
      - name: Orçamento de bundle
        run: node scripts/check-bundle-budget.mjs
```

**A regra de conclusão muda:** uma tarefa Standard/Strict só pode ser marcada como concluída com o
**link do run do CI verde** colado na seção `## Testes`. Não "rodei e passou" — a URL. Isso torna a
declaração falsa verificável por qualquer pessoa, inclusive por outro agente, meses depois.

### Camada 3 — hook de pre-push

```bash
npm i -D husky && npx husky init
echo 'npm run verify' > .husky/pre-push
```

Barato, roda em segundos, e impede que código quebrado chegue ao remoto mesmo quando o agente
"esquece". Deliberadamente em `pre-push` e não em `pre-commit`: commit deve continuar barato para não
incentivar `--no-verify`.

### Camada 4 — Portão de Lançamento

Detalhado no §5.

---

## 4. O Agente Auditor: separar quem escreve de quem aprova

A auto-revisão falhou de forma previsível (A2) porque **contexto compartilhado propaga viés**. O agente
que decidiu usar `useEffect` para derivar estado tem exatamente o mesmo modelo mental na hora de
revisar aquele `useEffect`.

**Proposta:** um segundo agente, com definição própria, contexto limpo e **um único poder — reprovar**.

Crie `.github/agents/auditor.agent.md`:

```markdown
---
description: "Auditor independente. Revisa o diff de uma tarefa contra requisitos, invariantes e checklists. Não escreve código."
applyTo: "**/*"
---

# Agente Auditor

Você **não implementa**. Você audita um diff que outro agente produziu, sem acesso ao raciocínio
que o gerou. Sua saída é um veredito.

## Entrada
- O diff (`git diff` da tarefa)
- O arquivo da tarefa em `docs/tarefas/em-andamento.md`
- Os requisitos citados no campo REQ/ADR/DT

## Regras
1. **Não confie no que a tarefa afirma ter feito.** Verifique no diff.
2. **Todo gate declarado deve ter evidência.** Sem link de run do CI ou saída de comando colada,
   o gate é `NÃO EXECUTADO` — nunca `APROVADO`.
3. **Todo critério de aceite deve ter um teste ou uma verificação manual descrita e reproduzível.**
   "Validado visualmente" sem passos = critério não verificado.
4. Rode o checklist de segurança (`checklists/41-seguranca.md`, versão essencial) contra o diff.
5. Se a mudança toca cálculo, persistência ou migração de schema: **exija revisão humana**.

## Saída obrigatória
Veredito: APROVADO | APROVADO COM RESSALVAS | REPROVADO
Para cada achado: arquivo:linha, problema, correção concreta, nível (🔴/🟡/🟢).

## Calibração
Uma auditoria que aprova tudo é uma auditoria quebrada. Se você não achou nada, declare
explicitamente **o que você verificou e não conseguiu verificar** — a lista de "não verificado"
é a parte mais útil do seu relatório.
```

**Uso:** no Claude Code, `Agent` com `subagent_type` próprio; no Copilot, trocar de agente antes de
revisar. O ponto não é a ferramenta — é **nunca revisar na mesma conversa que implementou**.

---

## 5. Portão de Lançamento: o gate que faltava

O achado A5 (publicar com QA pendente) não se resolve com disciplina. Resolve-se com um comando que
diz **não**.

`scripts/gate-lancamento.mjs` — falha se qualquer item não for atendido:

| # | Verificação | Como o script checa | Estado hoje |
|---|---|---|:---:|
| 1 | `npm run verify` verde | executa | ✅ |
| 2 | Zero vuln. HIGH/CRITICAL em dependência de produção | `npm audit --json` filtrado | ❌ **HIGH em react-router** |
| 3 | Headers de segurança configurados | **mede a resposta servida** (`curl -I`), não o `vercel.json` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | ❌ 1 de 6 (só o HSTS que a Vercel injeta) |
| 4 | Nenhum chunk acima do orçamento | lê `dist/assets/*.js` | ❌ 920 kB |
| 5 | Lighthouse ≥ metas (Perf/A11y/Best Practices/SEO) | `lighthouse-ci` contra o preview | ❌ nunca rodado |
| 6 | Zero segredo no bundle | varre `dist/` por padrões de chave/token | — |
| 7 | Nenhuma tarefa `Crítico` + `IMEDIATA` aberta | lê `pendentes.md` | ❌ REF-47 aberta |
| 8 | Todo RF marcado "obrigatório" tem teste rastreável | cruza `docs/requisitos/` × `src/**/*.test.*` | — |
| 9 | `LICENSE`, `README`, política de privacidade presentes | existência + link no app | parcial |

**Regra:** `npm run gate:lancamento` verde é pré-condição de deploy em produção. Item desligado exige
uma entrada no **Registro de Riscos Aceitos** (§11) com **motivo, responsável e data de revisão** —
desligar fica mais caro do que corrigir, que é o incentivo correto.

Aplicado hoje, este portão teria bloqueado o lançamento em **5 dos 9 itens**. Não é crítica ao que já
foi feito: é a demonstração de que o portão pega exatamente o que a prosa não pegou.

### Sobre os headers (item 3)

Correção concreta, aplicável agora, sem depender do resto:

```jsonc
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/((?!assets/|.*\\..*).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=()" }
      ]
    }
  ]
}
```

> Validar o CSP em `Content-Security-Policy-Report-Only` primeiro — Tailwind v4 e o PWA podem exigir
> ajuste em `style-src`/`worker-src`. É o que o próprio módulo 18 §6.4 recomenda, e agora com um gate
> que confirma que foi feito.

---

## 6. Feedback contínuo: "o que falta no meu projeto"

O enunciado pede um agente que *"sempre dê feedback do que está faltando"*. Isso também não pode
depender de o agente lembrar — vira relatório.

`npm run doctor` produz uma folha de saúde, rodando no CI a cada push:

```
SAÚDE DO PROJETO — 28/07/2026

SEGURANÇA
  ✗ 1 vulnerabilidade HIGH em dependência de produção (react-router)
  ✗ Headers de segurança: 1 de 6 (só HSTS, injetado pela plataforma)
  ✓ Nenhum segredo detectado no bundle
  ✓ Nenhum console.log com dado sensível (0 ocorrências em src/)
  ✓ localStorage isolado em services/ (perfilStorage, themeStorage, backup)

QUALIDADE
  ✓ Typecheck, lint e testes verdes
  ⚠ Cobertura de requisitos: 12 de 47 RF com teste rastreável (26%)
  ✗ Bundle: 920 kB (orçamento: 500 kB)
  ⚠ 43 arquivos de teste para 191 fontes

PROCESSO
  ✗ Pacote de agentes: 504 links quebrados, 33 arquivos .md.md
  ⚠ 1 tarefa Crítico+IMEDIATA aberta há 42 dias (TASK-REF-47)
  ✓ 0 tarefas em em-andamento.md (limite: 3)

PRONTO PARA PÚBLICO? NÃO — 5 bloqueios (rode: npm run gate:lancamento)
```

Três propriedades que fazem isso funcionar onde a prosa falhou:

1. **É gerado, não lembrado.** Não depende de o agente ter carregado o módulo certo.
2. **É comparável no tempo.** Commitado a cada release, mostra se o projeto melhora ou apodrece.
3. **Termina com um veredito binário.** "Pronto para público? NÃO" é acionável; um checklist de 314
   itens não é.

---

## 7. Ajustes no pacote de agentes

Além das correções de integridade (§8), seis mudanças de conteúdo:

### 7.1 Adicionar ao núcleo: a 4ª regra inegociável

As três atuais (confirmação, `any`, código é verdade) protegem contra dano local. Falta a que protege
contra dano público:

> **4. Nenhum gate declarado sem evidência anexada.** Todo gate (`typecheck`, `lint`, `test`, `build`,
> `audit`) é rotulado `APROVADO` / `FALHOU` / `NÃO EXECUTADO`, **com a saída do comando ou o link do
> run do CI**. Declaração sem evidência equivale a `NÃO EXECUTADO` e não sustenta conclusão de tarefa.
> Nenhum `contexto-projeto-ai.md` pode anular esta regra.

Isso promove o anti-padrão da v3.2 (que claramente não bastou como anti-padrão) ao nível de regra
inegociável — e, diferente da versão atual, ela é **verificável por terceiros**.

### 7.1.1 O método: link do run como critério de conclusão

A regra do §7.1 exige evidência. Este é o **formato** dessa evidência, em ordem de preferência:

| Preferência | Forma | Quando |
|:---:|---|---|
| 1ª | **URL do run do CI** | Sempre que houver CI (o caso normal) |
| 2ª | Saída do comando colada | Sem CI, ou gate que o CI não cobre (ex.: `curl -I` em produção) |
| 3ª | `NÃO EXECUTADO` + motivo | Quando não deu para rodar — **nunca** `APROVADO` |

A URL vai na seção `## Testes` do arquivo da tarefa, junto do commit a que se refere:

```markdown
## Testes
- CI: https://github.com/<org>/<repo>/actions/runs/30410499828 (`success`, `head_sha` c001457)
```

**Por que o link, e não a saída colada.** Os dois parecem equivalentes — os dois "provam" que rodou.
Não são:

1. **A saída colada é digitável.** Um agente pode escrever `466 passed` sem ter rodado nada, e o
   texto fica idêntico ao de uma execução real. A URL aponta para um registro que ele não consegue
   forjar nem editar.
2. **O veredito mora fora do repositório.** Quem produziu o trabalho não controla o servidor que
   emitiu o resultado. É a mesma lógica do §4 (quem escreve não aprova), aplicada à evidência.
3. **O link amarra a evidência a um commit.** O run carrega o `head_sha`. Saída colada não diz
   *contra qual versão do código* aquilo passou — e "os testes passaram" numa versão que não é a
   entregue é exatamente o tipo de verdade parcial que engana sem mentir.
4. **O link mostra o que *não* rodou.** A página do run lista **todas** as etapas com seus status.
   Saída colada mostra só o que o autor escolheu mostrar: se o `lint` foi pulado, o texto de
   `npm run test` não denuncia. Evidência seletiva é o modo mais comum de um gate parecer verde.
5. **Sobrevive ao tempo e à conversa.** Seis meses depois, sem acesso à sessão que produziu o
   código, a URL ainda resolve. O bloco de texto no markdown só tem o valor da confiança em quem o
   colou — que é precisamente o que este documento inteiro tenta parar de exigir.

**Corolário prático:** um gate que o CI cobre e não tem link na tarefa deve ser tratado como
`NÃO EXECUTADO`, mesmo que haja saída colada. Não porque se presuma má-fé, mas porque a forma mais
forte de prova estava disponível e não foi usada — e essa é justamente a decisão que a regra existe
para eliminar.

> **Exemplo real neste repositório:** a `TASK-CHORE-021` registra quatro URLs — o run verde, o run
> **vermelho** provocado por um erro de tipo proposital, o verde de novo após a correção, e o verde
> do merge. Sem os links, "o CI reprova quando deve" seria uma afirmação sobre o futuro. Com eles, é
> um fato que qualquer pessoa reproduz em dois cliques.

### 7.2 Novos anti-padrões para `50-anti-padroes.md`

| Anti-padrão | Por que é crítico | O que fazer |
|---|---|---|
| Publicar com tarefa `Crítico`+`IMEDIATA` aberta | Expõe usuário real a defeito conhecido | `gate:lancamento` bloqueia |
| Elevar limite em vez de resolver (`chunkSizeWarningLimit`, `audit --audit-level` frouxo, `eslint-disable` amplo) | Apaga o sinal e mantém o problema | Corrigir, ou registrar exceção datada com responsável |
| Escrever regra nova sem comando que a verifique | Cria a ilusão de controle; produz 0 execuções | Toda regra nasce com gate ou nasce como "recomendação", explicitamente |
| Revisar na mesma sessão que implementou | Propaga o viés que gerou o erro | Agente auditor com contexto limpo |
| Colar saída de comando quando havia link de run disponível | Evidência digitável e seletiva: não amarra a um commit nem revela a etapa que foi pulada | Link do run (§7.1.1); saída colada só sem CI |
| Aceitar risco de segurança "no chat" | Sem prazo e sem responsável, exceção temporária vira permanente e ninguém percebe | Entrada em `riscos-aceitos.md` com data de revisão (§11) |
| Silenciar advisory com allowlist sem data | Vira ruído permanente; ninguém revisita | Prazo máximo de 90 dias, renovação com nova avaliação |
| Documentar link/arquivo sem verificar que resolve | Doc tóxica; quebra o carregamento modular | `lint:docs` no CI |

### 7.3 Resolver a ambiguidade entre os dois pacotes

`geral-leve/` e `geral-robusto/` coexistem sem precedência declarada. Decidir e registrar em
`contexto-projeto-ai.md`: um deles é o vigente, o outro sai do repositório ou vira `arquivo/`. Duas
fontes de verdade sobre comportamento do agente é o mesmo problema que o pacote proíbe no código.

### 7.4 Reescrever `41-seguranca.md` como gate, não como leitura

Os 314 itens não são o problema — o problema é que nada os invoca. Reestruture em três blocos:

- **Automatizado** (roda no CI): audit, segredos no bundle, headers, `dangerouslySetInnerHTML`,
  `localStorage` fora de `services/` — tudo isso é regra de lint ou script. Sai da cabeça do agente.
- **Pergunta obrigatória por tarefa** (3 a 5 itens): só o que exige julgamento sobre *esta* mudança.
- **Referência** (o resto): consulta, não checklist.

Um checklist de 5 itens que roda 197 vezes vale infinitamente mais que um de 314 que roda zero.

### 7.5 Rastreabilidade requisito ↔ teste em `padroes/15-testes.md`

O achado **A3** (o usuário é o canal de descoberta de defeito) tem uma causa mecânica que o módulo de
testes não cobre: **requisito e teste não se conhecem**. Medido neste projeto:

| | |
|---|---:|
| Requisitos documentados (IDs em tabela) | **116** |
| Arquivos de teste | 43 |
| Arquivos de teste que citam algum ID de requisito | **7** |
| Dos 10 primeiros requisitos amostrados, com teste que os cite | **0** |

Os dois lados existem e são bem escritos. Nada os liga.

#### Por que isto não vem de graça com a ferramenta

Vale registrar, porque quem for aplicar esta norma provavelmente nunca ouviu falar da prática:

- **Test runner é ferramenta, não metodologia.** Vitest, Jest e afins documentam a API (`describe`,
  `it`, `expect`, mocks, coverage). Rastreabilidade é processo, uma camada acima — nenhum runner tem
  opinião sobre isso.
- **A métrica popular é a errada para o problema.** Ferramentas medem **cobertura de código**
  (quantas linhas executaram). Ninguém entrega **cobertura de requisito**, porque o runner não tem
  como saber quais são — eles vivem num documento que ele nunca lê. *Cobertura de código responde
  "quanto do meu código foi tocado"; rastreabilidade responde "quanto do que eu prometi está
  garantido".*
- **A prática vem de software regulado**, onde é obrigação legal: aviação (DO-178C), dispositivos
  médicos (IEC 62304), automotivo (ISO 26262). A *matriz de rastreabilidade* é entregável de
  auditoria. Também vive em QA corporativo (Jira+Xray, Azure DevOps, TestRail), que existe em boa
  parte para ligar caso de teste a requisito. Daí um analista de QA conhecer o termo e um dev de
  front nunca ter ouvido.
- **Tem um pré-requisito que quase ninguém cumpre:** só dá para rastrear se os requisitos existirem
  como documento. A maioria dos projetos web não tem — a prática seria vazia. Onde existem, ela é
  quase gratuita.

#### As três consequências práticas de não ter

1. **A cobertura de requisitos é opinião, não número.** Para saber se `RF-ON-03` tem teste, alguém
   lê 43 arquivos e julga. Julgamento não vira relatório; relatório que não existe não vira gate.
   É a Lei do Gate Mecânico (§1) aplicada a testes.
2. **O teste descreve a função; o requisito descreve a promessa.** Um teste real deste projeto —
   `it('usa multiplicação direta por 52 (canônico)')` — prova que a função multiplica por 52, não que
   52 seja a regra certa. Se alguém decidir que são 48 semanas, o teste quebra e o reflexo é
   *consertar o teste*: ninguém é obrigado a abrir o documento e conferir se a regra mudou ou se a
   promessa foi rompida.
3. **Peças corretas somam comportamento errado.** `TASK-BG-003` deste projeto: *"cálculo por peça
   exclui itens cobertos pela revisão da concessionária (corrige dupla contagem)"*. Cada função
   estava certa e testada; o **invariante** ("item coberto pelo pacote não pode ser contado também
   individualmente") não existia como teste em lugar nenhum. Repetido 38 vezes, é o A3.

#### A regra para o pacote

> **Teste que guarda requisito documentado cita o ID do requisito no nome.**
>
> ```js
> // antes
> it('usa multiplicação direta por 52 (canônico)', ...)
> // depois
> it('RN-14: km anual = diasSemana × 52, não 365', ...)
> ```
>
> **Escopo:** requisitos de **cálculo, dinheiro e persistência** — onde o erro é silencioso e só
> aparece quando alguém estranha um número na tela. Requisito cosmético de UI (barra de progresso)
> fica fora: custo alto de teste, risco baixo.
>
> **A parte mecânica:** um script extrai os IDs de `docs/requisitos/` e dos nomes de teste e reporta
> a diferença. Sem o script, esta regra é mais uma recomendação — e vira zero execuções, como todas
> as outras que este documento cataloga.

#### O que isto não resolve

Rastreabilidade não melhora teste ruim. Um teste raso com `RF-XX` no nome continua raso — passa a
mentir de forma auditável. Ela torna a **ausência** visível, não a qualidade boa.

### 7.6 As três lições de segurança que só apareceram na execução

As seções anteriores foram escritas **antes** de executar o bloco de lançamento. Executá-lo produziu
três achados que nenhuma delas previa — e os três são norma, não detalhe deste projeto.

#### 1. Configuração de plataforma: a categoria que a Lei do Gate Mecânico não alcança

Três itens de segurança deste projeto **moram fora do repositório** e **nenhum script consegue
verificar sem credencial** (a API do GitHub responde `401` sem token):

| Item | Onde vive |
|---|---|
| Dependabot **alerts** ("saiu CVE que te afeta") | Settings → Code security |
| Dependabot **security updates** (PR que corrige) | Settings → Code security |
| **Branch protection** (CI impedir merge, não só informar) | Settings → Branches |

Isso é o **limite** da §1: aqui a regra genuinamente não vira comando. E o efeito colateral é pior que
o item em si — vira conhecimento que existe só na cabeça de quem clicou. Ninguém que herde o projeto
descobre que estão ligados, nem que deveriam estar.

> **Norma:** onde a regra não pode virar comando, ela vira **registro auditável** — uma seção
> "Configuração de plataforma" no `contexto-projeto-ai.md`, listando cada item, quem ligou e quando.
> E o portão passa a exigir **a existência e a data do registro**, que é a única coisa verificável
> por máquina.
>
> Não é tão bom quanto um gate de verdade. É honesto sobre não ser.

**Sinal de alerta correlato:** toda tarefa cuja conclusão depende de clicar em painel de terceiro
deve dizer isso no enunciado. A `TASK-CHORE-022` prometia resolver "nada avisa quando sai CVE" com um
arquivo YAML — e o arquivo **não faz isso**. Criar o YAML cumpriria o texto da tarefa e deixaria o
problema intacto.

#### 2. Console limpo não é ausência de problema

Sequência real deste projeto, em duas tarefas:

1. A `TASK-RNF-015` ativou CSP bloqueante. A validação foi manual: humano navegou o app com o console
   aberto, **console limpo**, conclusão "está tudo certo".
2. A `TASK-RNF-9.1` rodou Lighthouse e encontrou uma **violação de CSP em toda carga de página** —
   causada por um defeito da própria RNF-015.

Por que o console não mostrou: a biblioteca (Zod) tentava `eval`, a CSP bloqueava, e a exceção era
**capturada em `try/catch`**. Sem erro no console. A violação ia para o **painel Issues** do Chrome,
que ninguém abre.

> **Norma:** "console limpo" e "validado visualmente" **não são evidência** para gate de segurança.
> Só valem como evidência as ferramentas que leem o painel Issues — na prática, a auditoria
> `inspector-issues` do Lighthouse. Validação humana continua indispensável para *comportamento*; ela
> apenas não certifica *ausência de violação*.

Este é o caso mais desconfortável do conjunto: a validação manual foi honesta, cuidadosa, e chegou à
conclusão errada. Não foi falta de rigor — foi rigor aplicado ao instrumento errado.

#### 3. "Zero origem externa" é um gate de uma linha que ninguém escreve

O `index.html` deste projeto carregava a fonte de `fonts.googleapis.com`. Isso falsificava **três
afirmações públicas** do próprio README, por cerca de dois meses:

- "offline-first" — era requisição externa bloqueante de render
- "nenhuma API em runtime" — havia
- "local-first por privacidade" (a justificativa declarada para não ter backend) — entregava IP do
  usuário a um terceiro antes da primeira tela pintar

O comando que provaria a afirmação falsa:

```bash
grep -rl "googleapis\|gstatic" dist/     # 1 segundo
```

> **Norma:** toda afirmação de arquitetura que o projeto faz em público — "offline-first", "sem
> terceiros", "local-first", "sem telemetria" — precisa de **um comando correspondente no portão**.
> Afirmação sem comando é marketing, e envelhece mal: ninguém mentiu, só ninguém conferiu.

#### Nota: CSP também é ferramenta de diagnóstico

Vale registrar porque contraria a intuição. A CSP entrou como **defesa** (limitar dano de dependência
comprometida) e, no caminho, **revelou** que uma dependência de produção executa `eval` para compilar
schemas — informação que nenhum teste, lint ou typecheck deste projeto entregaria, e que o `grep` não
achava porque o código aliasa o construtor (`const o = Function`).

Política restritiva não só protege: ela **mede** o que o seu bundle realmente faz.

---

### 7.7 O backlog apodrece por omissão da regra, não por esquecimento

Medido neste repositório em 30/07/26: o `pendentes.md` tinha **128 linhas para descrever 6 tarefas
abertas**. O excedente:

| O que estava lá | Onde já estava registrado |
|---|---|
| Blockquote com tabela de **7 tarefas concluídas** e o que cada uma entregou | `concluidas/0-indice-concluidas.md` |
| Duas notas narrando o que a `RNF-8.2` e a `RNF-9.1` fizeram | idem |
| **57 linhas** de `**Detalhamento:**` de 3 tarefas ainda não iniciadas | ~90% duplicava documentos existentes |
| Uma tabela quebrada (linha órfã do cabeçalho, por uma linha em branco no meio) | — |
| Seções nomeadas por "Fase 9/10/13" | as Fases só existem em `trash-drafts-ignore/` |

O módulo do ciclo especifica esse arquivo com precisão — 10 colunas, conjuntos fechados de valores,
uma linha por tarefa, ordenação por prioridade. O arquivo real não parecia com a especificação, e
**ninguém percebeu por dois meses**.

#### Por que acontece — quatro mecanismos, nenhum deles "a IA esqueceu"

1. **A regra governa a linha, não o arquivo.** §4: *"sai da tabela de pendentes (linha removida)"*. É
   uma operação de **linha**. A prosa em volta — cabeçalho de seção, blockquote, bloco de
   detalhamento — não é "tarefa", então nenhuma regra a reivindica. A linha sai; o comentário que só
   existia por causa dela fica, e vira registro órfão de algo concluído.
2. **O checklist de conclusão só ADICIONA a `pendentes.md`.** §5.4 tem 10 passos; o passo 9 é
   *"Adicionar tarefas geradas em pendentes.md"*. **Nenhum passo remove.** O arquivo é *append-only
   por construção*. O único "remover de pendentes" do módulo inteiro está em §10.4 — e vale só para
   tarefa **cancelada**, que é o caso raro.
3. **§3.5 proíbe "plano", e o que entra não parece plano.** "Pendentes é Catálogo, Não Plano" mira
   detalhe de implementação. O que se acumula é *histórico* e *análise de risco* — passa pelo filtro,
   porque quem escreve não acha que está escrevendo um plano.
4. **Nada verifica.** É a tese deste documento aplicada ao próprio backlog. O schema é fechado e
   **mecanicamente checável** — e não existe comando que o cheque. O `check-docs.mjs` valida links; o
   formato das tarefas, ninguém.

**A pressão que produz o defeito, sem eufemismo:** cada nota foi escrita ao *concluir* uma tarefa,
para que quem lesse o backlog entendesse o contexto do que sobrava. Decisão local plausível, errada
no agregado — quem precisa desse contexto tem o índice de concluídas. Sete notas individualmente
pequenas, e o histórico passou a ocupar mais espaço que o backlog.

Vale reter o padrão, porque ele não é sobre backlog: **regra que descreve um objeto (a linha) não
governa o texto que orbita esse objeto.** A mesma omissão produz README que descreve uma versão
antiga e comentário que sobrevive ao código que explicava.

#### A melhoria, em três partes

**(a) Transformar §3.5 de princípio em regra falsificável.** "Catálogo, não Plano" é uma metáfora;
ninguém consegue apontar o momento em que foi violada. Trocar por:

> `pendentes.md` contém **apenas tarefas abertas**. Se um `TASK-ID` citado no arquivo tem arquivo em
> `concluidas/`, o arquivo está errado. Vale para a linha **e para tudo que só existe para
> explicá-la**. Única exceção: citar uma concluída como **origem** de uma tarefa aberta, na coluna
> `REQ/ADR/DT`. Descrever o que ela entregou é registro no lugar errado.

**(b) Adicionar o passo que falta ao §5.4**, entre o 7 (remover de em-andamento) e o 9 (adicionar
tarefas geradas):

> **7.b — Limpar de `pendentes.md` o rastro desta tarefa:** cabeçalho de seção que ficou vazio,
> blockquote que a comentava, bloco de detalhamento que a antecipava. *Se o texto sobrevive à saída
> da tarefa, ele pertence a outro arquivo.*

**(c) `scripts/check-tarefas.mjs` — o gate.** Sem ele, (a) e (b) são texto, que é exatamente o defeito
que este documento inteiro descreve. Cinco checagens, todas decidíveis por script:

| # | Reprova quando | Pega o caso |
|:---:|---|---|
| 1 | `TASK-ID` em `pendentes.md` tem arquivo em `concluidas/` | **o defeito medido acima** |
| 2 | O mesmo `TASK-ID` aparece em dois estágios | "nada vive em dois lugares" (§1) deixa de ser promessa |
| 3 | Linha de tabela sem as 10 colunas, ou com valor fora do conjunto fechado | `Dependências: "Todas as anteriores"` — não é lista de IDs |
| 4 | Tarefa `Imediata` sem bloco e sem `Observações` | §3.2 é obrigatório e nunca foi conferido |
| 5 | Linha do índice de concluídas apontando para arquivo inexistente | a outra metade do sistema |

Custo real: ~1h, no mesmo molde do `check-docs.mjs` (sem dependência, função exportada + guarda de
execução direta). Entra no `verify`, como qualquer outro gate.

#### Achado de schema, de carona

A coluna `REQ/ADR/DT` aceita `RF / RN / RNF / ADR / DT / REV`. O Registro de Riscos Aceitos (§11)
criou um **sexto** tipo de referência, `RA-NNN`, e ele é a referência mais importante da tarefa que
existe para encerrar o risco — é onde vive a análise inteira. O conjunto fechado precisa incluí-lo,
senão a tarefa não tem onde apontar para o documento que a justifica, e o texto vaza para o corpo do
arquivo. **Foi literalmente assim que as 57 linhas de detalhamento nasceram.**

---

## 8. Roadmap de adoção

Ordem escolhida por *risco removido por hora investida*. IDs seguem §4.4 do núcleo (maior número
atual + 1: CHORE 019, TEST 006, RNF 014, DOC 019).

| # | Tarefa | ID sugerido | Modo | Esforço | Remove |
|:---:|---|---|:---:|:---:|---|
| 1 | `npm audit fix` + revalidar; travar `react-router-dom` corrigido | `TASK-CHORE-020` | Standard | P/P | **CVE HIGH em produção** |
| 2 | Headers de segurança no `vercel.json` (CSP em report-only primeiro) | `TASK-RNF-015` | Standard | P/M | A5 (deploy sem headers) |
| 3 | CI GitHub Actions com os gates bloqueantes | `TASK-CHORE-021` | Strict | M/M | **A1 (agente juiz e réu)** |
| 4 | Corrigir integridade do pacote: `.md.md`, 504 links, frontmatter, acento, versão | `TASK-CHORE-022` | Standard | M/G | A4 |
| 5 | `scripts/check-docs.mjs` + `lint:docs` no CI | `TASK-CHORE-023` | Standard | P/M | Reincidência de A4 |
| 6 | `gate:lancamento` + orçamento de bundle + leitura do Registro de Riscos Aceitos (§11) | `TASK-CHORE-024` | Strict | M/G | A5 |
| 7 | Agente Auditor + regra "não revisar na sessão que implementou" | `TASK-DOC-020` | Strict | P/M | **A2 (auto-aprovação)** |
| 8 | 4ª regra inegociável + novos anti-padrões + reescrita do 41 | `TASK-DOC-021` | Strict | M/M | A6 |
| 9 | `npm run doctor` | `TASK-CHORE-025` | Standard | M/G | Falta de feedback contínuo |
| 10 | Testes de aceite rastreáveis por requisito, conforme §7.5 (RF de cálculo/dinheiro/persistência → teste que cita o ID + script que reporta a diferença) | `TASK-TEST-007` | Strict | G/G | **A3 (regressão de regra de negócio)** |
| 11 | Lighthouse CI + metas (fecha `TASK-RNF-9.1`) | `TASK-RNF-016` | Standard | M/M | Performance nunca medida |
| 12 | Dependabot/Renovate semanal | `TASK-CHORE-026` | Light | P/P | Reincidência do item 1 |
| 13 | `scripts/check-tarefas.mjs` + regras (a) e (b) da §7.7 | `TASK-CHORE-027` | Standard | P/M | Backlog virando registro histórico |

**Os itens 1 a 3 valem mais que todos os outros somados** e cabem numa tarde: eliminam a
vulnerabilidade real, protegem o deploy e — o mais importante — instalam a autoridade externa que faz
todos os gates seguintes serem cumpríveis.

---

## 9. O que **não** mudar

Análise honesta reconhece o que funciona, senão vira reescrita gratuita:

- **O ciclo `pendentes → em-andamento → concluidas`.** 197 arquivos de tarefa, rastreáveis, com decisões
  e "o que NÃO foi feito". Isso é melhor que a maioria dos projetos profissionais. Mantenha.
- **A separação `.agent/` (comportamento) × `docs/` (projeto).** Conceitualmente certa.
- **Os modos Light/Standard/Strict.** Cerimônia proporcional ao risco evita que o processo seja
  abandonado por peso — a razão nº 1 pela qual processos morrem.
- **Esforço duplo H/IA.** Insight genuinamente original; poucos frameworks reconhecem que carga para IA
  ≠ tempo humano.
- **`docs/uso-de-ia.md`.** Transparência sobre uso de IA, com divisão de responsabilidade explícita.
  Depois das correções do §8, ele fica não só honesto, mas comprovável.
- **`npm run verify`.** O único gate mecânico existente — e, não por acaso, o único cumprido. A norma
  proposta é a generalização dele, não sua substituição.

---

## 10. A norma em uma página

Para colar no topo do núcleo, ou em qualquer projeto novo:

> ### Norma do Gate Mecânico
>
> 1. **Regra sem comando não existe.** Ao escrever uma regra de qualidade, escreva junto o comando que
>    falha quando ela é violada. Sem comando, marque-a como "recomendação" — e aceite que será ignorada.
> 2. **O veredito mora fora do agente.** Gate que só existe no markdown que o agente escreve não é
>    gate. CI é a autoridade; o markdown é o relato.
> 3. **Quem escreve não aprova.** Revisão em contexto novo, por agente com o único poder de reprovar.
>    Auditoria que nunca reprova está quebrada.
> 4. **Sem evidência, é `NÃO EXECUTADO`.** Nunca `APROVADO`. A evidência preferida é o **link do run
>    do CI** (§7.1.1) — ele amarra o resultado a um commit, mostra as etapas que *não* rodaram e não
>    pode ser digitado. Saída colada serve só onde não há CI.
> 5. **Publicar é consequência de um gate verde, não um ato de vontade.** Se o portão não passa, não vai
>    a público — inclusive (e principalmente) quando você tem certeza de que está tudo bem.
> 6. **Desligar um gate custa mais que corrigi-lo.** Exceção vive em `docs/seguranca/riscos-aceitos.md`
>    (§11), com evidência, responsável nominal, tarefa de saída e data de revisão de no máximo 90 dias.
>    O gate lê esse arquivo: **exceção vencida reprova mais alto que o problema original.**
> 7. **O projeto informa o que falta, você não pergunta.** Relatório gerado a cada push, com veredito
>    binário no fim.
> 8. **Gate padrão vem ligado.** Segurança, dependências, orçamento de bundle e acessibilidade não são
>    "fase 10". São o commit zero.

---

## 11. Registro de Riscos Aceitos (o artefato que faltava)

O §5 e o §10 mandam registrar exceções "com motivo, responsável e data" — e não diziam **onde**. Sem
lugar definido, "registrar" vira "comentar no chat", que é o mesmo que não registrar. O pacote atual
também não tem esse artefato: o registro mais próximo é `docs/dominio/divida-tecnica.md`, que serve a
outro propósito e não é lido por nenhum comando.

| | Dívida Técnica (`DT-NN`) | Risco Aceito (`RA-NNN`) |
|---|---|---|
| Registra | solução interna frágil que custa caro depois | vulnerabilidade **conhecida** que se decidiu não corrigir agora |
| Efeito prático | prioriza refactor | **destrava um gate que está reprovando** |
| Prazo | gatilho (evento que pode nunca ocorrer) | **data de revisão obrigatória** (sempre chega) |
| Quem decide | quem faz a engenharia | dono do projeto, **nominalmente** |
| Formato | prosa | **legível por máquina** — o gate lê o arquivo |

São coisas diferentes e por isso ficam em arquivos diferentes. Misturar as duas faz o risco de
segurança herdar o prazo indefinido da dívida técnica — que é exatamente como exceção "temporária"
vira permanente.

### 11.1 O arquivo

**`docs/seguranca/riscos-aceitos.md`** — uma entrada por risco, em bloco YAML dentro do markdown.

A escolha do formato não é estética: se o registro fosse só prosa, esta seção estaria cometendo o
erro que o §1 deste documento denuncia — criar mais texto que ninguém executa. O bloco YAML permite
que `gate:lancamento` **leia o registro e decida**; o markdown ao redor mantém o arquivo legível por
humanos. Uma fonte só, sem risco de divergência entre a versão bonita e a versão real.

```yaml
id: RA-001
titulo: react-router RSC Mode CSRF Bypass não alcançável em SPA sem servidor
advisory: GHSA-qwww-vcr4-c8h2
pacote: react-router
faixa_afetada: '>=7.12.0 <8.3.0'
versao_instalada: 7.18.1
severidade: high
tipo: producao          # producao | dev | build
decisao: aceito         # aceito | mitigado-parcial
justificativa: >
  A vulnerabilidade é do modo RSC (React Server Components / server actions).
  O app é SPA puro, sem servidor: usa <BrowserRouter> + <Routes> (API declarativa).
  Não existe caminho de código que alcance o trecho vulnerável.
evidencia: |
  grep -rn "createBrowserRouter\|RouterProvider\|loader=\|action=\|useFetcher" src/
  # → 0 ocorrências (verificado em 28/07/26)
aceito_por: Thiago Silva Rodrigues
data_aceite: 2026-07-28
data_revisao: 2026-10-26          # obrigatório, máx. 90 dias
tarefa_de_saida: TASK-CHORE-025
condicao_de_encerramento: >
  Migração para react-router >= 8.3.0, OU adoção de data router / server
  actions no projeto — o que vier primeiro. A segunda hipótese invalida a
  justificativa imediatamente e torna a correção urgente.
```

O campo **`evidencia`** é o que separa um registro auditável de uma opinião: ele guarda o comando que
qualquer pessoa pode rodar para conferir a justificativa. Sem ele, "não se aplica" é só uma
afirmação — e afirmação sem verificação é o hábito que produziu a CVE em produção.

### 11.2 Quando criar uma entrada

Só quando um gate está reprovando **e** o bloqueio cai num destes casos:

| Caso | Exemplo real |
|---|---|
| Não alcançável nesta arquitetura | `RA-001` — advisory de RSC num app sem servidor |
| Não chega ao usuário (dev/build-time) | as 12 da cadeia do eslint e do `vite-plugin-pwa` |
| Correção exige mudança major que precisa de planejamento próprio | react-router v8 dentro de uma tarefa `P/P` |

**Nunca criar entrada para:**

- vulnerabilidade **alcançável** em produção — isso se corrige, não se registra;
- "depois eu vejo" sem análise (entrada sem `evidencia` e sem `condicao_de_encerramento` é inválida);
- fechar tarefa mais rápido — se o risco apareceu no meio da tarefa, ele é da tarefa;
- qualquer risco sem **`tarefa_de_saida`**. Aceitar sem caminho de saída não é decisão, é desistência.

### 11.3 Quando revisar (obrigatório)

1. **Na `data_revisao`** — o gate força; não depende de alguém lembrar.
2. **Quando a arquitetura muda de um jeito que possa tornar o risco alcançável.** Concreto: no dia em
   que este projeto adotar `createBrowserRouter`, loaders ou actions, a justificativa do `RA-001`
   deixa de valer **na hora** — e o risco vira urgente sem nenhum advisory novo ter sido publicado.
   Por isso a `condicao_de_encerramento` descreve as duas saídas, não só a boa.
3. **Quando sai correção sem major** — a razão de existir da entrada evaporou.
4. **Antes de qualquer lançamento** — o portão relê o registro inteiro, não confia no que passou antes.

### 11.4 Quando encerrar

A entrada **muda de seção, nunca é apagada**: vai para `## Encerrados` com a data e o desfecho
(`corrigido` / `deixou de aplicar` / `virou dívida técnica DT-NN`). O histórico é a trilha de
auditoria — apagar destrói a única prova de que a decisão foi consciente, que é justamente o que o
registro existe para provar.

### 11.5 Prazos e renovação

- **Máximo 90 dias.** Renovar exige **nova avaliação escrita** — reconferir a evidência e atualizar a
  data. Copiar-colar a justificativa anterior não é renovação, é abandono com aparência de processo.
- **Vencer não gera aviso: gera reprovação do gate.** Exceção vencida é tratada como mais grave que o
  advisory original, porque significa que o processo de revisão parou de funcionar.
- **Renovou 3 vezes seguidas?** Não é mais exceção temporária. Ou vira tarefa priorizada de verdade,
  ou vira `DT-NN` com o risco assumido explicitamente no domínio.

### 11.6 Como o gate usa o arquivo (é isto que faz a regra existir)

`scripts/gate-lancamento.mjs` passa a cruzar a saída do `npm audit` com o registro:

| Situação | Resultado |
|---|---|
| Advisory HIGH em produção **sem** entrada no registro | **Reprova** |
| Advisory coberto por entrada válida e dentro do prazo | Passa, e **imprime** o `RA-NNN` no relatório |
| Entrada **vencida** | **Reprova** — mais alto que o advisory original |
| Entrada sem `tarefa_de_saida` ou sem `evidencia` | **Reprova** (registro inválido) |
| Entrada cuja `tarefa_de_saida` já foi concluída | **Reprova** — a saída aconteceu, a exceção não deveria existir |

E os outros dois consumidores:

- **CI:** avisa quando alguma entrada vence em menos de 14 dias — tempo de agir antes de virar bloqueio.
- **`npm run doctor`:** lista as entradas ativas com a data de vencimento, no relatório de saúde do §6.

O relatório passa a dizer *"1 risco aceito, vence em 12 dias (RA-001 → TASK-CHORE-025)"* em vez de
esconder o assunto atrás de um número zerado. **Risco visível com prazo é gestão; risco invisível é
sorte.**

### 11.7 Quem aceita

**O humano, nominalmente.** A IA pode (e deve) **propor** a entrada com a análise e a evidência
prontas — foi o que aconteceu na `TASK-CHORE-020`, onde a análise do advisory de RSC ficou pronta e a
decisão foi levada ao dono do projeto. Mas o campo `aceito_por` recebe o nome de uma pessoa.

> Um agente que pode se conceder as próprias exceções não tem gate — tem sugestão.

É o mesmo princípio do §4 (quem escreve não aprova) aplicado a risco: quem produziu o código não
decide sozinho qual risco dele é tolerável.

---

## Fecho

O erro deste projeto não foi falta de rigor — o rigor está escrito com um cuidado incomum, e a maior
parte dele foi genuinamente praticada. O erro foi supor que **rigor escrito se converte em rigor
praticado** só porque quem lê é uma IA que promete obedecer.

Ele se converteu exatamente três vezes: `typecheck`, `lint`, `test`. Foram justamente os três que
alguém transformou em linha do `package.json`.

O caminho para "nenhum amador publica projeto com problema" não passa por escrever mais regras. Passa
por **transformar as regras que já existem em comandos que falham** — e por tirar o veredito final das
mãos de quem produziu o trabalho.

---

*Documento gerado em 28/07/2026 a partir da análise de `docs/tarefas/` (197 tarefas concluídas),
`.github/agents/` (42 arquivos) e do estado real do repositório e do deploy. Todas as medições
(504 links, 33 `.md.md`, 0 execuções de `npm audit`, 2 REPROVADO em 197, 10 vulnerabilidades) são
reproduzíveis nos comandos citados.*

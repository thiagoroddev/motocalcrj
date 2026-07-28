# Tarefas Pendentes

Backlog priorizado. Aplicar o template padrão do ciclo ([processos/20-ciclo-tarefa.md](../../.github/agents/geral-robusto/processos/20-ciclo-tarefa.md)) ao criar tarefas e ao passá-las para `em-andamento.md`.

Ordem: **Prioritárias (Imediata)** no topo (formato bloco) → **Normais** (formato tabela).

> Tarefas concluídas/canceladas **saem deste arquivo** — ficam em `docs/tarefas/concluidas/` (índice em `0-indice-concluidas.md`).

---

## Tarefas Prioritárias (Imediata)

> **Bloco de lançamento (origem: [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md), 28/07/26).** O app está publicado e é vitrine
> pública do projeto. As tarefas abaixo cobrem o que hoje está **quebrado, exposto ou ausente** no
> repositório e no deploy. Ordem recomendada: `CHORE-020` → `RNF-016` → `RNF-015` → `CHORE-021` →
> `DOC-020` → `REF-47`. As pré-existentes `TASK-RNF-9.1` (Lighthouse/WCAG) e `TASK-RNF-9.2` (QA final,
> Crítico) continuam abertas **depois** do lançamento — devem ser fechadas junto deste bloco.

## TASK-RNF-016 - Auto-hospedar a fonte Inter (remove CDN do Google do caminho crítico)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 28/07/26 18:30
- **Dependências:** -
- **REQ/ADR/DT:** bloqueia TASK-RNF-015 (CSP); relacionada a TASK-RNF-9.1
- **Observações:** [`index.html`](../../index.html) linhas 9-11 carregam a Inter de `fonts.googleapis.com` / `fonts.gstatic.com`. Isso **contradiz três afirmações públicas do próprio projeto** e é o tipo de inconsistência que um revisor técnico nota de imediato:
  - **Contradiz "offline-first":** o README e a ADR de arquitetura afirmam "nenhuma API em runtime" e "funciona offline em 4G ruim". A fonte é uma requisição externa bloqueante de render no primeiro acesso — exatamente no cenário de conexão ruim do público-alvo (motoboys em 4G).
  - **Contradiz "local-first por privacidade":** o README justifica a ausência de backend por privacidade, mas toda visita entrega IP e User-Agent ao Google antes de a primeira tela pintar. Servir Google Fonts por CDN já foi considerado violação de GDPR na Alemanha (LG München, 2022); o argumento vale para a LGPD.
  - **Bloqueia a CSP restritiva** da `TASK-RNF-015` — mantê-la exigiria abrir `style-src`/`font-src` para domínios do Google.
  - **O que fazer:** instalar a fonte como pacote (`@fontsource/inter` ou `@fontsource-variable/inter`), importar no CSS/entry, remover as 3 tags do `index.html`. Manter apenas os pesos realmente usados (400/500/600/700 hoje) em `woff2`. Conferir que os arquivos entram no precache do Workbox (`globPatterns` do `vite-plugin-pwa`) para valer offline de verdade.
  - **Critérios de aceite:** nenhuma requisição a domínio externo no carregamento (validar na aba Network do DevTools com "3rd-party" e no modo offline); tipografia visualmente idêntica; `npm run verify` verde; fonte disponível offline após o 1º acesso.

## TASK-RNF-015 - Headers de segurança no deploy (CSP, HSTS, X-Frame-Options)
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 28/07/26 18:30
- **Dependências:** TASK-RNF-016 (fonte auto-hospedada simplifica a CSP)
- **REQ/ADR/DT:** `padroes/18` §6 e §7, `checklists/41` §8
- **Observações:** O [`vercel.json`](../../vercel.json) tem **apenas** `rewrites` — **nenhum** dos 5 headers de segurança que `padroes/18` §7 e `checklists/41` §8 detalham item por item. O app está público sem CSP, sem HSTS, sem proteção a clickjacking. É a checagem que qualquer ferramenta automática (securityheaders.com, Lighthouse "Best Practices", Mozilla Observatory) reprova em segundos — e é o tipo de item que um recrutador técnico verifica sem abrir o código.
  - **O que fazer:** adicionar bloco `headers` no `vercel.json` com `Content-Security-Policy`, `Strict-Transport-Security` (`max-age=31536000; includeSubDomains`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` (negando geolocation/camera/microphone, que o app não usa). Proposta de CSP pronta em [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md) §5.
  - **Como fazer sem quebrar o app:** publicar **primeiro** como `Content-Security-Policy-Report-Only`, navegar o app inteiro, ler as violações no console e só então virar para o header bloqueante — é o que `padroes/18` §6.4 recomenda.
  - **Critérios de aceite:** os 6 headers presentes na resposta de produção (`curl -I https://motocustorj.vercel.app`); app 100% funcional com CSP **bloqueante** (onboarding, 4 abas, Detalhamento, Perfil, dialogs, PWA instalável e offline); nota A ou A+ em securityheaders.com; evidência (saída do `curl` + print da nota) anexada na tarefa.
  - **Cuidado:** Tailwind v4 injeta estilos inline — provavelmente exigirá `'unsafe-inline'` em `style-src` (aceitável e comum; registrar a justificativa). O service worker do PWA pode exigir `worker-src 'self'`. **Não** afrouxar `script-src` para resolver erro sem entender a causa.

## TASK-CHORE-021 - CI no GitHub Actions + badge de status no README
- **Status:** Pendente
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 28/07/26 18:30
- **Dependências:** TASK-CHORE-020 (entrar no CI já verde)
- **REQ/ADR/DT:** `01-nucleo` §5 (anti-padrão de gate não-verificado)
- **Observações:** O repositório **não tem CI nem hook de git**: todo gate (`typecheck`, `lint`, `test`, `build`) é declarado pelo próprio agente, no mesmo markdown que ele escreve. Para quem avalia o projeto de fora, não existe nenhuma prova independente de que os 466 testes passam — e é justamente essa ausência que permitiu que `npm audit` ficasse 197 tarefas sem rodar.
  - **O que fazer:** criar `.github/workflows/verificacao.yml` rodando em todo push/PR: `npm ci` → `typecheck` → `lint` → `test` → `build` → auditoria de dependências de produção. YAML pronto em [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md) §3. Adicionar o badge do workflow no topo do README (ao lado dos badges atuais) — troca "466 testes" declarado por **verificável**.
  - **Opcional no mesmo escopo:** `husky` com `pre-push` rodando `npm run verify` (2 comandos, evita push quebrado).
  - **Critérios de aceite:** workflow verde no GitHub; badge no README apontando para o workflow real; um commit de teste com erro proposital **reprova** o CI (provar que o gate morde, não só que existe); link do run verde anexado na tarefa.
  - **Ganho de processo:** a partir daqui, concluir tarefa Standard/Strict passa a exigir **link do run do CI**, não a frase "gate verde".

## TASK-DOC-020 - Capturas de tela no README (remover o `TODO(autor)`)
- **Status:** Pendente
- **Modo:** Light
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 28/07/26 18:30
- **Dependências:** -
- **REQ/ADR/DT:** -
- **Observações:** O [`README.md`](../../README.md) tem um bloco `<!-- TODO(autor): inserir aqui 2-4 capturas reais do app -->` com o scaffold pronto e **nenhuma imagem**. Duas consequências: (1) o projeto é um app visual apresentado sem um único screenshot — quem avalia precisa clicar no deploy para saber com o que se parece, e muitos não clicam; (2) um `TODO` no README é a primeira coisa visível no arquivo bruto do repositório.
  - **O que fazer:** capturar 4 telas reais em viewport de celular (sugestão já no comentário: Onboarding · Estimativa · Detalhamento · Edição), salvar em `docs/design/screenshots/`, substituir o comentário pelo bloco `<p align="center">` já escrito ali. Usar dados plausíveis e **nenhum dado pessoal real** nas capturas.
  - **Critérios de aceite:** 4 imagens no repositório, renderizando no README pelo GitHub; comentário `TODO(autor)` removido; peso total das imagens razoável (otimizar PNG/WebP).

## TASK-REF-47 - Code-splitting do bundle principal (chunk > 500 kB)
- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 16/06/26 21:05
- **Dependências:** -
- **REQ/ADR/DT:** relacionada a TASK-RNF-9.1 (Performance e acessibilidade)
- **Observações:** O build de produção (commit `3d109db`, deploy Vercel) emite o aviso do Vite "Some chunks are larger than 500 kB after minification". O bundle único `dist/assets/index-*.js` está em **920,74 kB (226,68 kB gzip)** — tudo carregado de uma vez no primeiro acesso. Como é PWA com precache (Workbox, 14 entradas / ~2,5 MB), o tamanho também infla o precache inicial do service worker; depois do 1º acesso o app é offline, então o custo é **só no primeiro carregamento** — mas é justamente o público (motoboys/entregadores em 4G/conexão móvel) que mais sente isso.
  - **O que fazer:** quebrar o chunk monolítico. Opções combináveis: (1) `build.rollupOptions.output.manualChunks` separando vendors pesados (ex.: `react`/`react-dom`, `react-router-dom`, `@radix-ui/*`, `zod`, `react-minimal-pie-chart`, ícones); (2) `import()` dinâmico em rotas/telas não-iniciais (ex.: Detalhamento, Perfil, dialogs grandes) via `React.lazy` + `Suspense`.
  - **Critérios de aceite:** nenhum chunk individual acima de ~500 kB (ou `chunkSizeWarningLimit` ajustado *conscientemente* com justificativa, não como mascaramento); build sem o aviso; rotas continuam funcionando (testes verdes, navegação manual entre as 4 abas + Detalhamento/Perfil OK); PWA ainda instala e funciona offline após 1º acesso.
  - **Cuidado:** o `vite-plugin-pwa` faz precache via `globPatterns` (`**/*.{js,css,...}`) — conferir que os novos chunks lazy entram no precache (ou são revalidados em runtime) para não quebrar o offline. Não "resolver" o aviso só elevando `chunkSizeWarningLimit` sem dividir de fato (anti-padrão: esconder o sintoma).

---

## Normais




### Analytics, PWA e Play Store (Fases 9 e 13)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-8.1 | Analytics (Umami) — trackEvent centralizado | Standard | Importante | Normal | M/M | - | - | `[ ]` | - |
| TASK-RNF-8.3 | TWA — publicação na Google Play Store | Standard | Desejável | Normal | G/G | - | - | `[ ]` | - |

> **TASK-RNF-8.2 (PWA) concluída** no lançamento — ver `concluidas/2026-06-15--13h45--TASK-RNF-8.2.md`. PWA entregue sem Umami, então a dependência 8.2→8.1 foi removida; a 8.3 (TWA) já pode ser feita sobre o PWA atual.

### Qualidade e Polimento (Fase 10)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Standard | Importante | Normal | G/G | TASK-REF-47, TASK-RNF-016 | - | `[ ]` | - |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo) | Standard | Crítico | Normal | G/G | Todas as anteriores | - | `[ ]` | - |

> ⚠️ **Estas duas continuam abertas com o app já publicado.** A `9.2` é `Crítico` e nunca foi feita;
> a `9.1` é a única fonte de medição de performance/acessibilidade do projeto (Lighthouse **nunca**
> foi rodado — 0 menções em 197 tarefas). Fechá-las é o que encerra de fato o bloco de lançamento.

### Higiene de repositório e portão de lançamento (origem: análise de 28/07/26)

| ID | Título | Modo | Valor | Urgência | Esforço-H/IA | Dependências | REQ/ADR/DT | Status | Data origem |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- | :---: | --- |
| TASK-CHORE-022 | Dependabot semanal para dependências e GitHub Actions | Light | Importante | Normal | P/P | TASK-CHORE-021 | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-023 | Corrigir integridade de `.github/agents/`: 33 arquivos `.md.md`, 504 links mortos, frontmatter inválido | Standard | Importante | Normal | M/G | - | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-024 | `npm run gate:lancamento` — portão mecânico pré-deploy | Standard | Importante | Normal | M/G | TASK-CHORE-021 | - | `[ ]` | 28/07/26 18:30 |
| TASK-TEST-007 | Testes de aceite rastreáveis por requisito (RF crítico → teste que cita o ID) | Strict | Importante | Normal | G/G | - | - | `[ ]` | 28/07/26 18:30 |
| TASK-CHORE-025 | Avaliar react-router v8 e advisories de tooling (eslint, vite-plugin-pwa/workbox) | Strict | Importante | Normal | M/G | - | gerada pela TASK-CHORE-020 | `[ ]` | 28/07/26 19:00 |

**Detalhamento:**

- **TASK-CHORE-022** — hoje nada avisa quando sai CVE nova; a `TASK-CHORE-020` existe justamente
  porque ninguém olhou por 197 tarefas. Criar `.github/dependabot.yml` com ecossistemas `npm` e
  `github-actions`, frequência semanal, PRs agrupados por patch/minor para não virar ruído.

- **TASK-CHORE-023** — o `README` e o [`docs/uso-de-ia.md`](../uso-de-ia.md) apontam publicamente para
  `.github/agents/` como prova do processo de engenharia, mas a pasta está fisicamente quebrada:
  **33 de 36** arquivos com extensão dupla `.md.md`; **504** links internos apontando para
  `https://claude.ai/...` (nenhum resolve); frontmatter YAML inválido em todo o `geral-robusto/`
  (linha em branco após `---` e campos colapsados numa linha, então o `applyTo` nunca é aplicado);
  `18-segurança-privacidade.md.md` com acento, referenciado 6× sem acento; versão do núcleo (`3.3`)
  divergindo do changelog (`1.0.0`); e dois pacotes concorrentes (`geral-leve/` × `geral-robusto/`)
  sem precedência declarada. **Escopo aqui é só a integridade dos arquivos** — a evolução do conteúdo
  do agente acontece em outro projeto. Critério de aceite: extensões `.md` corretas, todo link
  interno resolvendo para caminho relativo do repositório, frontmatter válido, versão única,
  precedência entre os dois pacotes registrada em `contexto-projeto-ai.md`.

- **TASK-CHORE-024** — script que decide, sozinho, se o projeto pode ir a público: `verify` verde +
  zero vulnerabilidade alta em produção + headers presentes + nenhum chunk acima do orçamento +
  metas de Lighthouse + nenhuma tarefa `Crítico`+`IMEDIATA` aberta. Especificação em
  [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md) §5. Aplicado ao estado de
  28/07/26, bloquearia em 5 dos 9 itens — que é exatamente o ponto.

- **TASK-CHORE-025** — gerada pela `TASK-CHORE-020`, que corrigiu as 10 vulnerabilidades originais mas
  esbarrou numa leva nova de advisories publicada no mesmo dia, toda exigindo **major**. Três grupos,
  nenhum deles corrigível dentro de uma tarefa de manutenção simples:
  - **`react-router` — "RSC Mode CSRF Bypass"** (`>=7.12.0 <8.3.0`, corrigido só em **8.3.0**). É o
    único que chega ao bundle de produção, mas **não se aplica a este app**: a vulnerabilidade é do
    modo RSC (React Server Components / server actions) e aqui não há servidor — `src/App.tsx` usa
    `<BrowserRouter>` + `<Routes>`, e `createBrowserRouter`, `RouterProvider`, `loader=`, `action=` e
    `useFetcher` têm **zero** ocorrências no `src/`. Avaliar a migração v7→v8 pelo guia oficial,
    revalidando as 15 telas que importam o router (rotas aninhadas, `RotaProtegida` e o `Routes`
    aninhado do onboarding são os pontos de risco).
  - **eslint / eslint-plugin-import / minimatch / brace-expansion** (6 advisories) — só ferramenta de
    lint, não chega ao usuário. A "correção" sugerida pela npm inclui `eslint@10` (major) e um
    **downgrade** de `eslint-plugin-import` para 1.14.0.
  - **vite-plugin-pwa / workbox-build / ejs / jake / filelist** (6 advisories) — só build-time. A
    "correção" sugerida é **downgrade** do `vite-plugin-pwa` 1.3.0 → 1.2.0, o que mexeria no PWA
    entregue na `TASK-RNF-8.2`. Não fazer sem avaliar.
  - **Nunca resolver isto com `npm audit fix --force`** sem ler o que ele faz: no estado de 28/07/26
    ele aplicaria os dois downgrades acima.

- **TASK-TEST-007** — os 466 testes cobrem unidades, mas nada liga `docs/requisitos/` a `src/**`.
  Por isso as 38 `TASK-BG` foram, na maioria, divergências de regra de negócio encontradas pelo
  humano usando o app, não pela suíte. Nomear os testes de aceite com o ID do requisito
  (`RF-6.11: ...`) e gerar um relatório de quais RF obrigatórios ainda não têm teste.

# Tarefas em Andamento

---

# TASK-CHORE-021 - CI no GitHub Actions + badge de status no README

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** M/M
- **Data-hora origem:** 28/07/26 18:30
- **Data-hora início:** 28/07/26 21:05
- **Dependências:** ✅ TASK-CHORE-020 concluída — o CI entra com os gates já verdes
- **REQ/ADR/DT:** `01-nucleo` §5 (anti-padrão de gate não-verificado); achado A1 da análise de 28/07
- **Observações:** Quarta tarefa do bloco de lançamento. Ataca o achado estrutural: em 197 tarefas concluídas, todo gate foi **declarado pelo próprio agente**, no mesmo markdown que ele escreve. Foi essa ausência de autoridade externa que permitiu o `npm audit` ficar 197 tarefas sem rodar até virar CVE em produção.

## Planejamento Aprovado

Workflow `.github/workflows/verificacao.yml` rodando em todo push, com `typecheck`, `lint`, `test` e
`build` **bloqueantes**, e auditoria de dependências **informativa**. Trocar o badge estático de
testes do README pelo badge real do workflow. Provar que o gate reprova de verdade antes de fechar.

**Decisão de escopo (humano):** a auditoria entra **informativa**, não bloqueante. `react-router` tem
advisory HIGH e é dependência de **produção** — um gate bloqueante nasceria vermelho, e CI vermelho
no dia 1 ensina a ignorar CI, destruindo o valor que se está instalando. Vira bloqueante na
`TASK-CHORE-024`, quando o Registro de Riscos Aceitos existir para distinguir "advisory analisado,
inalcançável, com prazo e responsável" de "ninguém olhou".

**Critérios de aceite:** workflow verde no GitHub; badge apontando para o workflow real; **um commit
com erro proposital reprova o CI** (provar que o gate morde, não só que existe); link do run verde
anexado.

**Fora de escopo:** husky/`pre-push` (a tarefa marca como opcional; muda o fluxo de push do humano, e
isso é decisão dele, não efeito colateral de instalar CI); `audit:prod` bloqueante, `lint:docs` e
`gate:lancamento` (CHORE-023 e CHORE-024).

## Execução

- **21:00:** Levantamento. Dois achados moldaram o desenho:
  - **Repositório é público** (`thiagoroddev/motocustorj`) → dá para consultar a API do GitHub
    Actions **sem token** e conferir os runs por comando, em vez de depender de leitura de tela.
  - **`react-router-dom` (high) é dependência de produção** → definiu a decisão de escopo acima.
- **21:05:** Constatado que o README tinha um badge **estático**
  (`img.shields.io/badge/testes-466%20passando`) — uma string digitada à mão. É exatamente o sintoma
  do A1: ninguém consegue distinguir isso de um número inventado. É esse badge que o do CI substitui.
- **21:08:** `.github/workflows/verificacao.yml` criado. Escolhas registradas no próprio YAML:
  `push` em **todas** as branches (o gate precisa valer no trabalho de preview, não só na produção),
  sem `pull_request` para evitar run duplicado; `npm ci` em vez de `install` (falha se o lockfile
  divergir); Node 22 LTS, divergindo de propósito da máquina local (v25.9.0) para que o ambiente
  limpo pegue suposição de máquina.
- **21:10:** Badge do README trocado pelo do workflow real.

## Testes

- Baseline local antes de publicar: `npm run verify` verde e `npm run build` OK (medidos nas tarefas
  CHORE-020, RNF-016 e RNF-015 desta mesma sessão).
- Run verde no GitHub Actions: **pendente**.
- Prova de que o gate reprova (commit com erro proposital): **pendente**.

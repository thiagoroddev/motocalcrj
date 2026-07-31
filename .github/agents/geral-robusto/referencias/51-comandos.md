---
description: "Padrões de gestão de tarefas para agentes de IA: backlog, tarefa em andamento, conclusão, bloqueios, testes, rastreabilidade e registro histórico."
applyTo: "docs/tarefas/**/*.md"
---
---

description: "Quick reference de comandos: npm, Vite, Vitest, Git, TypeScript, ESLint. Os 80% que você usa em 95% do tempo." modulo: "51" categoria: "referencias" versao: "1.0" relacionado:

- "20-ciclo-tarefa.md"
- "26-inicializacao-projeto.md"

---

# ⌨️ Comandos: Quick Reference

> Os comandos mais usados em projetos React/TS/Vite. Cole no terminal, ajuste o que precisar. Para documentação completa de cada ferramenta, vá direto na fonte (linkadas no rodapé).

---

## 📦 Comandos do Projeto

Scripts padrão esperados em projeto que segue este pacote:

|Comando|O que faz|Quando usar|
|---|---|---|
|`npm run dev`|Inicia dev server (Vite, porta 5173)|Trabalho diário|
|`npm run build`|Build de produção em `dist/`|Antes de deploy|
|`npm run preview`|Serve `dist/` localmente|Validar build antes de deploy|
|`npm run test`|Roda todos os testes (Vitest)|Antes de concluir tarefa|
|`npm run test:watch`|Testes em modo watch|Durante desenvolvimento|
|`npm run test:coverage`|Roda testes + relatório de cobertura|Antes de PR|
|`npm run lint`|Lint com ESLint|Antes de commit|
|`npm run lint:fix`|Lint + corrige automaticamente|Antes de commit|
|`npm run typecheck`|Validação de tipos sem build|Antes de commit|
|`npm run format`|Formatação com Prettier|Antes de commit (se não automático)|

**Convenção:** se faltar algum script, adicionar em `package.json`. Estrutura típica:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

---

## 📦 npm / pnpm

### Instalação

```bash
# Instalar todas as dependências
npm install
# (pnpm)
pnpm install

# Instalar pacote (produção)
npm install zod
npm install react-hook-form @hookform/resolvers

# Instalar pacote (desenvolvimento)
npm install -D vitest @testing-library/react
# (-D ou --save-dev)

# Instalar versão específica
npm install react@18.3.0

# Instalar global
npm install -g pnpm
```

### Gerenciamento

```bash
# Listar pacotes instalados
npm list           # nível 0
npm list --depth=1 # nível 1
npm list react     # versão específica

# Ver pacotes desatualizados
npm outdated

# Atualizar dentro do range do package.json
npm update

# Atualizar para a última (pode quebrar major)
npm install react@latest

# Remover pacote
npm uninstall react-hot-toast

# Verificar onde está pacote no projeto
npm explain lodash
```

### Audit (segurança)

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (cuidado: pode mudar versões)
npm audit fix

# Forçar fix mesmo com breaking changes (mais cuidado)
npm audit fix --force

# Ver detalhes JSON
npm audit --json
```

### Cache

```bash
# Limpar cache (útil quando dá erro estranho)
npm cache clean --force

# Verificar cache
npm cache verify
```

### Equivalentes pnpm

|npm|pnpm|
|---|---|
|`npm install`|`pnpm install` ou `pnpm i`|
|`npm install X`|`pnpm add X`|
|`npm install -D X`|`pnpm add -D X`|
|`npm uninstall X`|`pnpm remove X`|
|`npm run dev`|`pnpm dev`|
|`npm outdated`|`pnpm outdated`|

---

## ⚡ Vite

```bash
# Dev server (default: porta 5173)
npx vite

# Dev server em porta específica
npx vite --port 3000

# Dev server acessível em rede local (mobile testing)
npx vite --host

# Build de produção
npx vite build

# Preview do build (não use para servir produção real)
npx vite preview

# Build com análise de tamanho
npx vite build --report
```

### Variáveis de ambiente

```bash
# Vite expõe apenas variáveis com prefixo VITE_
# .env.development, .env.production, .env

# Forçar modo
npx vite --mode staging  # carrega .env.staging
```

---

## 🧪 Vitest

```bash
# Rodar todos os testes uma vez
npx vitest run

# Modo watch (default sem `run`)
npx vitest

# Filtrar por nome do arquivo
npx vitest perfil

# Filtrar por nome de teste
npx vitest -t "renderiza erro"

# Coverage
npx vitest run --coverage

# UI interativa (visual, no browser)
npx vitest --ui

# Apenas testes mudados desde commit
npx vitest --changed

# Re-rodar testes ao mudar arquivo (default em watch)
# pressione 'a' para rodar todos novamente
```

### Comandos úteis dentro do watch

|Tecla|Ação|
|---|---|
|`a`|Roda todos os testes|
|`f`|Roda apenas os que falharam|
|`p`|Filtra por nome de arquivo|
|`t`|Filtra por nome de teste|
|`q`|Sair|

---

## 📘 TypeScript

```bash
# Typecheck sem gerar JS (mais rápido)
npx tsc --noEmit

# Typecheck com watch (re-checa ao mudar)
npx tsc --noEmit --watch

# Listar erros em arquivo específico
npx tsc --noEmit src/components/Botao.tsx

# Mostrar opções de compilação efetivas
npx tsc --showConfig
```

---

## 🧹 ESLint

```bash
# Lintar tudo
npx eslint . --ext ts,tsx

# Lintar e corrigir automaticamente
npx eslint . --ext ts,tsx --fix

# Lintar arquivo específico
npx eslint src/pages/PaginaPerfil.tsx

# Mostrar regras ativas
npx eslint --print-config src/index.ts

# Cache (mais rápido em projetos grandes)
npx eslint . --cache
```

---

## 💅 Prettier

```bash
# Formatar tudo
npx prettier --write .

# Verificar formatação (não modifica)
npx prettier --check .

# Formatar arquivo específico
npx prettier --write src/pages/PaginaPerfil.tsx

# Ignorar arquivos via .prettierignore
```

---

## 🌿 Git

### Branches

```bash
# Listar branches locais
git branch
git branch -a   # local + remoto

# Criar branch
git checkout -b feat/nova-feature
git switch -c feat/nova-feature   # equivalente moderno

# Trocar de branch
git switch develop
git checkout develop   # equivalente clássico

# Renomear branch atual
git branch -m novo-nome

# Deletar branch local
git branch -d nome-da-branch   # safe (recusa se não merged)
git branch -D nome-da-branch   # força

# Deletar branch remota
git push origin --delete nome-da-branch
```

### Mudanças

```bash
# Ver status
git status
git status -s   # versão compacta

# Ver mudanças
git diff                    # não staged
git diff --staged           # staged
git diff arquivo.ts         # arquivo específico

# Adicionar
git add arquivo.ts          # específico
git add .                   # tudo na pasta atual
git add -p                  # interativo (escolhe partes)

# Commit
git commit -m "feat: descrição"
git commit -am "fix: descrição"   # -a adiciona modificados (não novos)

# Modificar último commit
git commit --amend
git commit --amend --no-edit   # sem mudar mensagem
```

### Histórico

```bash
# Ver histórico
git log
git log --oneline           # uma linha por commit
git log --graph --oneline   # com gráfico
git log -p                  # com diff de cada commit
git log -n 5                # últimos 5

# Ver histórico de arquivo
git log arquivo.ts
git log -p arquivo.ts       # com diffs

# Quem mudou cada linha
git blame arquivo.ts
```

### Sincronização

```bash
# Buscar mudanças remotas (sem aplicar)
git fetch

# Buscar + mergear
git pull

# Buscar + rebase em vez de merge
git pull --rebase

# Enviar local para remoto
git push
git push -u origin nome-da-branch   # primeira vez

# Forçar (cuidado!)
git push --force-with-lease   # safer
git push --force              # PERIGO - só você
```

### Desfazer

```bash
# Descartar mudanças não staged
git restore arquivo.ts        # moderno
git checkout -- arquivo.ts    # clássico

# Tirar de staged (sem perder mudanças)
git restore --staged arquivo.ts
git reset HEAD arquivo.ts     # clássico

# Reverter commit (cria commit novo invertendo)
git revert <hash>

# Reset (PERIGOSO - pode perder commits)
git reset --soft HEAD~1   # desfaz commit, mantém mudanças staged
git reset --mixed HEAD~1  # desfaz commit, mantém mudanças (default)
git reset --hard HEAD~1   # desfaz commit E mudanças - PERDE
```

### Stash (guardar mudanças temporariamente)

```bash
# Guardar mudanças
git stash
git stash save "wip: ajuste no perfil"

# Listar stashes
git stash list

# Aplicar último stash
git stash pop      # aplica e remove da lista
git stash apply    # aplica e mantém na lista

# Aplicar stash específico
git stash apply stash@{2}

# Descartar
git stash drop stash@{0}
git stash clear   # tudo
```

### Tags

```bash
# Listar tags
git tag

# Criar tag anotada
git tag -a v1.0.0 -m "Primeira release"

# Enviar tag para remoto
git push origin v1.0.0
git push --tags   # todas
```

---

## 🔍 Diagnóstico

### Bundle

```bash
# Build + tamanho (Vite mostra ao final do build)
npm run build

# Análise visual do bundle (precisa do plugin)
npm install -D vite-bundle-visualizer
# Adicionar no vite.config.ts e rodar build
```

### Dependências

```bash
# Ver árvore de dependências
npm list --all   # gigante, use com cuidado
npm list --depth=2

# Por que esse pacote está instalado?
npm explain lodash

# Tamanho dos pacotes
npx bundle-phobia react
# ou: site bundlephobia.com
```

### Performance em runtime

```bash
# Lighthouse (precisa de Chrome)
npx lighthouse http://localhost:5173 --view

# Lighthouse mobile + slow 4G
npx lighthouse http://localhost:5173 \
  --preset=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --view
```

---

## ⚠️ Comandos Perigosos

Comandos que **não podem ser revertidos** sem backup ou são **destrutivos**. Use com cuidado.

|Comando|Por que perigoso|
|---|---|
|`rm -rf node_modules`|OK (reinstalável), mas demora|
|`rm -rf dist`|OK (regenerável com build)|
|`git push --force`|Reescreve histórico remoto. **Outros podem perder commits.** Use `--force-with-lease`|
|`git reset --hard`|Perde mudanças locais permanentemente|
|`git clean -fd`|Remove arquivos não-versionados (e pastas)|
|`npm audit fix --force`|Pode atualizar majors e quebrar tudo|
|`npm install pkg@latest`|Pode trazer breaking change|
|`rm -rf .git`|Mata o repositório local|

**Regra:** se vai rodar um deles, tenha certeza. Se for IA executando: **confirmar com humano antes** (regra inegociável do núcleo).

---

## 🎯 Combos Úteis

Sequências comuns:

### Início do dia

```bash
git pull
npm install   # caso package.json tenha mudado
npm run dev
```

### Antes de commit

```bash
npm run lint:fix
npm run typecheck
npm run test
git status   # confere o que vai commitar
git diff --staged   # revisão final
```

### Antes de PR

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage   # se aplicável
npm run build           # garante que build passa
git push -u origin sua-branch
```

### Resolver "estou perdido" no Git

```bash
git status              # primeiro: ver onde estou
git log --oneline -10   # últimos 10 commits
git diff                # o que mudou e não foi adicionado
git diff --staged       # o que está pra commitar
```

### Reset de ambiente (algo está estranho)

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Atualizar dependências com segurança

```bash
npm outdated                    # ver o que está desatualizado
npm update                      # atualiza dentro do range (não major)
npm run test                    # confirma que não quebrou
# para majors, faça uma de cada vez:
npm install pacote@latest
npm run test
git commit -am "chore: atualiza pacote para v2"
```

---

## Mini-FAQ

**1. `npm` ou `pnpm`?** pnpm é mais rápido e usa menos espaço em disco (shared store). npm é universal. Para projeto solo, pnpm vale. Para projeto colaborativo, depende do time.

**2. `npx` em todo comando?** `npx` roda binário de `node_modules` sem precisar referenciar o caminho. Útil quando o pacote não está em `scripts` do `package.json`. Se está em scripts, use `npm run nome`.

**3. Qual a diferença de `npm run dev` e `npm dev`?** `npm run dev` é o correto. `npm dev` falha. Alguns scripts especiais funcionam sem `run` (`npm test`, `npm start`), mas o padrão é com `run`.

**4. Por que meu `npm install` está lento?** Cache cheio, rede lenta, ou registry remoto distante. Tente: `npm cache clean --force` e/ou `npm install --prefer-offline`. Ou migre para pnpm.

**5. `git pull --rebase` ou `git pull` normal?** Para projeto solo: tanto faz. Para projeto colaborativo: `--rebase` mantém histórico linear (mais limpo). Configure como default: `git config --global pull.rebase true`.

**6. Como volto para o último commit funcionando?** Se o commit ainda está local (não pushed): `git reset --hard HEAD~1`. Se já tinha pushed e quer reverter: `git revert <hash>` (cria commit novo invertendo).

**7. Esqueci de criar branch e commitei direto no main, e agora?**

```bash
git branch nova-feature       # cria branch com seus commits atuais
git reset --hard origin/main  # volta main ao estado remoto
git checkout nova-feature     # agora você está na branch correta
```

**8. Por que `npm run test` é diferente de `npm test`?** Para `test`, `start`, `restart`, `stop` o `run` é opcional. Para qualquer outro script, é obrigatório (`npm run dev`, não `npm dev`).

**9. Como rodo apenas o teste que estou trabalhando?**

```bash
npx vitest -t "nome do teste"
# ou modo watch e usa 'p' (filtro por arquivo) ou 't' (filtro por nome)
```

**10. Qual comando rodo antes de mover tarefa para concluída?** Sequência típica:

```bash
npm run lint:fix
npm run typecheck
npm run test
npm run build   # se quer garantir 100%
```

---

## 🔗 Referências Externas

- npm docs: https://docs.npmjs.com/
- pnpm docs: https://pnpm.io/
- Vite: https://vite.dev/
- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Git docs: https://git-scm.com/docs
- Prettier: https://prettier.io/
- ESLint: https://eslint.org/

---

## 🔗 Referências e Módulos Relacionados

- [`50-anti-padroes.md`](./50-anti-padroes.md) - Catálogo de anti-padrões
- [`52-glossario-termos-tecnicos.md`](./52-glossario-termos-tecnicos.md) - Definições
- [`../processos/20-ciclo-tarefa.md`](../processos/20-ciclo-tarefa.md) - Quando rodar testes/lint no ciclo
- [`../processos/26-inicializacao-projeto.md`](../processos/26-inicializacao-projeto.md) - Setup inicial usa estes comandos
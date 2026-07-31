# Manual de Operação

> **Para que serve:** este é o "como eu trabalho neste repositório". Se você voltou depois de semanas
> e não lembra o processo, comece aqui. Comandos são para **PowerShell** (Windows).
>
> Não é o documento de *decisões* (isso é [`contexto-projeto-ai.md`](./contexto-projeto-ai.md)) nem o
> de *processo do agente* ([`.github/agents/`](../.github/agents/)). É o operacional do dia a dia.

---

## 1. Como fazer qualquer mudança

`motocustorj` é **protegida**: não aceita push direto. Toda mudança entra por Pull Request com o CI
verde. O caminho completo:

```powershell
# 1. Partir do estado atual (o pull evita conflito bobo)
git switch motocustorj
git pull

# 2. Criar a branch da tarefa
git switch -c chore-023-integridade-agentes

# 3. Trabalhar, commitar quantas vezes quiser
git add .
git commit -m "TASK-CHORE-023: corrige extensões .md.md"

# 4. Enviar (o -u só na primeira vez desta branch)
git push -u origin chore-023-integridade-agentes

# 5. Abrir o PR, esperar o CI, mergear
gh pr create --fill
gh pr checks --watch
gh pr merge --merge --delete-branch

# 6. Voltar
git switch motocustorj
git pull
```

O `gh pr checks --watch` segura o terminal até o CI terminar. **Sem ele, o merge falha** — o check leva
~2 min e a proteção recusa merge antes de ficar verde.

### Nome da branch

O ID da tarefa **já existe antes do trabalho** (ele nasce em `pendentes.md`), então use-o:

| Situação | Branch | Commit |
|---|---|---|
| Tarefa do backlog | `chore-023-integridade-agentes` | `TASK-CHORE-023: ...` |
| Bug achado em uso | `bg-040-descricao-curta` | `TASK-BG-040: ...` |
| Modo Light (doc isolado, sem tarefa) | `docs-fluxo-git` | descritivo, sem ID |

O `gh pr create --fill` usa a **primeira mensagem de commit** como título do PR — a convenção de commit
nomeia o PR de graça.

### Uma tarefa por branch

**Padrão: uma.** O motivo é a regra de evidência: a conclusão de uma tarefa é o **link do run do CI**
colado no arquivo dela. Se um PR carrega três tarefas, o mesmo link vai para três arquivos e prova
"as três juntas passaram" — não "esta passou".

**Exceção:** tarefas inseparáveis, quando uma mexe no código que a outra criou e separar produz um PR
que não compila. Nesse caso, um PR só, com os dois IDs no corpo dele e uma linha em cada arquivo
concluído explicando que foram entregues juntas.

---

## 2. Quando algo dá errado

| Sintoma | Causa | Conserto |
|---|---|---|
| `push` rejeitado, menção a *protected branch* / *ruleset* | Você está em `motocustorj` | Ver "esqueci de criar a branch" abaixo |
| CI vermelho no PR | Algum gate falhou | Corrija, `git commit`, `git push` na **mesma branch**. O PR atualiza e o CI roda de novo |
| Botão de merge cinza | Check ainda rodando, ou vermelho | Esperar ou corrigir |
| Merge reclama de conflito | `motocustorj` andou desde que você criou a branch | `git pull origin motocustorj` de dentro da sua branch, resolva, commite, push |
| `gh` diz "no pull requests found" | Remote apontando para nome antigo do repo | `git remote set-url origin https://github.com/thiagoroddev/motocustorj.git` |
| `&&` dá erro no PowerShell | PowerShell 5.1 não tem `&&` | Use `;` ou comandos separados |

### Esqueci de criar a branch e commitei em `motocustorj`

**A ordem importa.** O passo 1 salva seus commits; só depois é seguro descartar.

```powershell
git switch -c minha-branch          # 1º: a branch nova LEVA os commits
git switch motocustorj              # 2º
git reset --hard origin/motocustorj # 3º: descarta os commits daqui
git switch minha-branch             # 4º: continua o trabalho
```

⚠️ O `reset --hard` **apaga** commits locais. Só é seguro porque o passo 1 já os salvou. **Nunca rode
o passo 3 antes do passo 1.**

---

## 3. Os PRs do Dependabot

O [Dependabot](../.github/dependabot.yml) abre PRs automaticamente toda segunda. Você **não faz nada no
terminal** — revisa e mergeia pela web ou pelo `gh`.

### Como julgar

**Pergunta 1: é segurança ou só versão nova?**

- Veio de um **alerta** (aba *Security* → *Dependabot alerts*) → **resolver**
- É só *"bump X from 1.2 to 1.3"* → **opcional para sempre**. Sem urgência nenhuma

**Pergunta 2 (se estiver vermelho): qual etapa falhou?** Clique no ❌ e olhe.

| Etapa | Significa | Ação típica |
|---|---|---|
| **Instalar dependências** | Conflito de peer dependency: o pacote exige outra versão de algo. **Não é seu código** | Fechar. Volta quando o ecossistema acompanhar |
| **Typecheck** / **Testes** | A atualização mudou comportamento ou tipos que seu código usa | Trabalho real — fechar se não for urgente |
| **Lint** | Regras da ferramenta mudaram | Config, geralmente pequeno |

**Na dúvida, feche com o motivo escrito:**

```powershell
gh pr close 6 --comment "Bloqueado: exige vite ^8 e o projeto está no 6.4.3. Depende de migração do Vite."
```

Fechar custa nada: o Dependabot reabre quando sair versão nova, e o comentário evita reinvestigar.

**Por que não deixar aberto:** PR permanentemente vermelho treina a ignorar vermelho. Aí o dia em que
um vermelho *importa*, ninguém olha.

### Ordem segura de merge

1. `actions group` — mexe só no CI, não toca `package-lock.json`, não conflita com nada
2. `desenvolvimento group` — ferramentas, não vão para o bundle do usuário
3. `producao group` — **entra no bundle**. Depois de mergear, rode o build e confira o tamanho

Os grupos 2 e 3 **conflitam entre si** (os dois mexem no `package-lock.json`). Mergeie um, espere o
Dependabot rebasear o outro (~1 min) e o CI ficar verde de novo. Se não rebasear sozinho:

```powershell
gh pr comment 2 --body "@dependabot rebase"
```

---

## 4. Comandos e quando rodar

| Comando | Quando | O que faz |
|---|---|---|
| `npm run verify` | a cada tarefa, antes de commitar | typecheck + lint + 466 testes. Roda offline |
| `npm run build` | quando mexer em dependência ou build | gera `dist/`. **Leia a saída inteira**, não filtre |
| `npm run audit:prod` | quando mexer em dependência | vulnerabilidades de produção, ciente dos riscos aceitos |
| `npm run gate:lancamento` | antes de considerar o projeto "ok para público" | 9 itens. Exige `relatorios/lighthouse.json` |

O portão consome um relatório do Lighthouse que você gera antes:

```powershell
npx -y lighthouse https://motocustorj.vercel.app/ --output=json --output-path=relatorios/lighthouse.json --chrome-flags="--headless=new" --quiet
npm run gate:lancamento
```

Ou acione **Actions → Portão de lançamento → Run workflow** no GitHub, que faz os dois e guarda o
resultado como artefato.

> ⚠️ **Não filtre a saída de comando de verificação com `grep`.** Um aviso de build ficou invisível por
> uma tarefa inteira porque a conferência usava `grep -E "built|precache"` e o aviso não casava com o
> padrão (`TASK-BG-039`). Para conferir, exclua o ruído conhecido e **olhe todo o resto**.

---

## 5. O que fica fora do repositório

Três coisas de qualidade vivem no painel do GitHub e **nenhum script consegue verificar**. Estão
registradas em [`contexto-projeto-ai.md` §11](./contexto-projeto-ai.md) com quem conferiu e quando:

- **Branch protection** (`Settings → Rules → Rulesets`) — o que faz o CI *impedir* em vez de informar
- **Dependabot alerts** e **security updates** (`Settings → Advanced Security`)

O portão reprova se esse registro passar de 90 dias sem conferência. Ao conferir, atualize a data e o
seu nome lá.

> Dica de interface: nos botões do GitHub, `Disable` significa que o recurso **está ligado** — o botão
> mostra a ação disponível, não o estado atual.

---

## 6. Glossário

Termos que aparecem nos PRs, no CI e nos documentos.

| Termo | O que é |
|---|---|
| **CI** | *Continuous Integration.* O robô que roda os testes a cada push. Aqui: [`verificacao.yml`](../.github/workflows/verificacao.yml) |
| **Check** | Um resultado de CI num commit. O nosso se chama `Gates de qualidade` |
| **Gate / portão** | Verificação obrigatória que **falha** e impede seguir. Regra que não vira comando não é gate |
| **Ruleset / branch protection** | Configuração do GitHub que exige PR e check verde para a branch entrar |
| **PR (Pull Request)** | Proposta de trazer commits de uma branch para outra. É onde o CI roda e o merge acontece |
| **CVE** | Identificador global de uma vulnerabilidade conhecida (ex.: `CVE-2026-22030`) |
| **GHSA** | O identificador do GitHub para a mesma coisa (ex.: `GHSA-qwww-vcr4-c8h2`) |
| **Advisory** | O **relatório** sobre a vulnerabilidade: faixa de versões afetada, severidade, versão corrigida |
| **`npm audit`** | Compara as versões do seu `package-lock.json` com o banco de advisories. **Não analisa seu código** — casa versão, não prova exposição |
| **Risco aceito (`RA-NNN`)** | Vulnerabilidade que se decidiu não corrigir agora, com prazo e responsável. Vive em [`seguranca/riscos-aceitos.md`](./seguranca/riscos-aceitos.md). Vencer **reprova o portão** |
| **Dívida técnica (`DT-NN`)** | Solução interna frágil que custa caro depois. Tem *gatilho*, não prazo |
| **Chunk** | Um arquivo `.js` que o build gera. O navegador baixa cada um separadamente |
| **Vendor** | Código de terceiros (o que vem do `node_modules`), em oposição ao seu |
| **Peer dependency** | Versão de outro pacote que uma dependência exige. Conflito aqui faz `npm ci` falhar |
| **Lighthouse** | Ferramenta do Google que mede performance, acessibilidade, boas práticas e SEO de uma página |
| **LCP** | *Largest Contentful Paint*: quanto tempo até o conteúdo principal aparecer. Bom < 2,5 s |
| **CSP** | *Content Security Policy*: header que limita de onde o navegador pode carregar código |
| **Precache** | Lista de arquivos que o service worker do PWA baixa para funcionar offline |

---

## 7. Se travar

1. **Nada do que está no GitHub quebra a produção.** PR aberto, PR vermelho, branch pendente — nada
   disso vai ao ar. Só o merge em `motocustorj` dispara deploy
2. **Nenhum PR tem prazo**, exceto os que vêm de alerta de segurança
3. **Trabalho local não se perde** enquanto você não rodar `reset --hard` ou apagar branch com commit
   não enviado
4. **Em último caso:** `git stash` guarda tudo o que está mexido e devolve a árvore limpa;
   `git stash pop` traz de volta

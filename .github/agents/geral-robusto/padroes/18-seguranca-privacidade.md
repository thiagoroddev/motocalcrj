---

description: "Segurança e privacidade: dados pessoais, XSS, CSP, gestão de segredos, logs seguros, cookies, validação cliente vs servidor, dependências." modulo: "18" categoria: "padroes" versao: "1.0" relacionado:

- "10-codigo-e-convencoes.md"
- "14-formularios-e-validacao.md"
- "17-backend-node.md"

---

# 🔒 Segurança e Privacidade

> Segurança é o tema onde **iniciantes subestimam o risco** e **profissionais erram por confiança excessiva**. A diferença entre código seguro e código vulnerável raramente é "sabe ou não sabe". É **"lembrou ou esqueceu"**. A maioria dos bugs de segurança vem de **falta de hábito**, não de ignorância.

---

## 1. Princípios Fundamentais

### 1.1 Privacidade vs Segurança Técnica

|Privacidade|Segurança técnica|
|---|---|
|Proteger dados do **usuário** de exposição|Impedir código malicioso de executar|
|Logs sem PII, URLs sem dados, telas seguras|XSS, injection, exfiltração|
|Quem **pode ver** o que|Quem **pode fazer** o que|

Os dois se sobrepõem mas pedem ações diferentes. Bons projetos cuidam dos dois com a mesma seriedade.

### 1.2 Defense in Depth

Nunca confie em **uma única camada** de proteção. Múltiplas camadas erram menos juntas:

- **Frontend valida** (UX, feedback rápido)
- **Backend revalida** (não confia no frontend - assuma cliente malicioso)
- **Banco tem constraints** (UNIQUE, CHECK, NOT NULL - última linha)
- **Logs filtram PII** (mesmo se algo escapar, não vaza)

Se uma camada falha, a próxima ainda protege. Não basta a primeira ser boa.

### 1.3 Princípio do Mínimo Privilégio

Código só deve ter o acesso **estritamente necessário**. Não dê mais permissão "por garantia".

- Service de leitura não tem permissão de escrita no banco
- Endpoint público não acessa dados privados de outros usuários
- Variável de ambiente acessada por todos é candidata a vazamento
- Token de API com escopo amplo é alvo de exploração

### 1.4 Pensar Como Atacante (Threat Modeling Básico)

Antes de implementar uma feature, pergunte:

1. **Quem pode atacar isso?** (usuário malicioso? rede insegura? colega de equipe?)
2. **O que eles ganham?** (dados? acesso? interrupção?)
3. **Qual o pior caso?** (vazamento? prejuízo financeiro? bloqueio?)
4. **O que defende contra isso?** (validação? criptografia? rate limit?)

Não precisa virar especialista. Precisa **fazer essas perguntas regularmente**.

---

## 2. O Que é Dado Pessoal

Antes de proteger, é preciso saber o que proteger.

### 2.1 Categorias

|Categoria|Exemplos|Sensibilidade|
|---|---|---|
|Identificação direta|CPF, RG, passaporte, CNH|Alta|
|Contato|Email, telefone, endereço|Média-alta|
|Financeira|Cartão, conta, salário|Alta|
|Comportamental|Histórico de uso, localização precisa|Média|
|Sensível (LGPD)|Saúde, religião, orientação sexual, biometria|Crítica|
|Combinada|Nome + cidade + idade pode identificar|Média (depende)|

### 2.2 A Regra do Mosaico

Dois dados isolados podem ser inofensivos. Combinados, identificam uma pessoa.

- "João" não identifica
- "João, 35 anos" não identifica
- "João, 35 anos, mora em Rio de Janeiro, trabalha na empresa X" - **identifica**

Cuidado com endpoints que retornam **muita informação correlacionada**. Quanto mais campos, mais fácil identificar.

### 2.3 Onde Vivem Dados Pessoais no Seu App

Pense em **todos** os lugares:

- Banco de dados (óbvio)
- Logs do servidor
- Console do browser
- localStorage / sessionStorage
- URLs e query strings
- Histórico do navegador
- Headers HTTP (Referer pode vazar URLs)
- Métricas e analytics
- Mensagens de erro (stack traces às vezes incluem dados)
- Service Workers e caches
- Backups
- Repositório Git (commits antigos)

A primeira ação de segurança é **inventário**. Se você não sabe onde estão, não pode protegê-los.

---

## 3. O Princípio "Emprestar o Dispositivo"

Um princípio simples e poderoso:

> _Se o usuário emprestar o dispositivo para alguém por 5 minutos, essa pessoa consegue ver dados que o usuário não compartilharia voluntariamente?_

### 3.1 Aplicações Práticas

|Situação|Risco|Mitigação|
|---|---|---|
|Email do usuário aparece em telas após login|Médio (esperado em alguns apps)|Aceitável se usuário sabe|
|Saldo bancário visível sem confirmação|Alto|Bloqueio por biometria ou ocultação por padrão|
|Histórico de pesquisas exposto|Médio|Botão de "modo privado" / limpar histórico|
|Conversas privadas em notificações|Alto|Preview oculto no lockscreen|
|Endereço completo numa tela pública do app|Alto|Mostrar parcial (Rua X, 1**, ******)|

### 3.2 Como Aplicar

Para cada tela do app, pergunte: _"alguém olhando por cima do ombro veria dados que o usuário não escolheu mostrar?"_. Se sim, há vazamento de privacidade que merece atenção.

---

## 4. Validação vs Sanitização

Iniciantes confundem os dois. **São coisas diferentes com objetivos diferentes.**

### 4.1 Diferença

|Validação|Sanitização|
|---|---|
|**Verifica** se o dado é aceitável|**Modifica** o dado para torná-lo seguro|
|Rejeita ou aceita|Sempre aceita, mas limpa|
|Resposta: erro ou OK|Resposta: dado transformado|
|Exemplo: "email deve ter @"|Exemplo: remove `<script>` do HTML|

### 4.2 Quando Usar Cada Um

- **Validação:** entradas de formulário, IDs de URL, payloads de API
- **Sanitização:** HTML que vem do usuário, queries que viram strings, nomes de arquivo

### 4.3 Não Substituem Um ao Outro

```typescript
// ❌ Errado - sanitiza mas não valida
const bio = sanitize(req.body.bio)  // remove HTML perigoso
salvar(bio)
// E se bio tiver 10MB? Sem validação de tamanho.

// ❌ Errado - valida mas não sanitiza
const bio = z.string().max(500).parse(req.body.bio)
salvar(bio)
// E se bio tiver <img onerror=...>? Validou, mas pode causar XSS.

// ✅ Certo - valida E sanitiza
const bio = z.string().max(500).parse(req.body.bio)
const bioLimpa = sanitizeHtml(bio)
salvar(bioLimpa)
```

---

## 5. XSS (Cross-Site Scripting)

XSS acontece quando código malicioso (geralmente JavaScript) é injetado e executado no contexto do seu site, na sessão do usuário.

### 5.1 Por Que É Grave

Um XSS bem-sucedido permite ao atacante:

- Ler cookies (incluindo tokens de sessão)
- Fazer ações em nome do usuário (sem ele saber)
- Roubar dados de formulários antes do submit
- Redirecionar para sites de phishing
- Injetar formulários falsos sobre os reais

### 5.2 React Protege Por Padrão

React **escapa automaticamente** valores em JSX:

```tsx
// ✅ Seguro - React escapa
const nome = "<script>alert('XSS')</script>"
return <div>{nome}</div>
// Renderiza literalmente "<script>alert('XSS')</script>" como texto
```

### 5.3 Quando o Risco Aparece

Sempre que você **contorna** a proteção do React:

```tsx
// ⚠️ Perigoso - injeta HTML cru
<div dangerouslySetInnerHTML={{ __html: conteudo }} />

// ⚠️ Perigoso - href ou src dinâmico com URL
<a href={urlDoUsuario}>Link</a>
// Se urlDoUsuario = "javascript:alert('XSS')", executa!

// ⚠️ Perigoso - manipulação direta do DOM
elementoRef.current.innerHTML = conteudo
```

### 5.4 Como Defender

**Regra de ouro:** evite `dangerouslySetInnerHTML`. Quando for inevitável (renderizar markdown, conteúdo de CMS), **sanitize antes**:

```tsx
import DOMPurify from 'dompurify'

function Conteudo({ html }: { html: string }) {
  const limpo = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: limpo }} />
}
```

**Para URLs dinâmicas**, valide o protocolo:

```tsx
function urlSegura(url: string): string {
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return '#'  // bloqueia javascript:, data:, etc.
    }
    return url
  } catch {
    return '#'
  }
}

<a href={urlSegura(urlDoUsuario)}>Link</a>
```

### 5.5 XSS Armazenado vs Refletido

|Tipo|Como funciona|Exemplo|
|---|---|---|
|**Refletido**|URL maliciosa enviada à vítima|`site.com/busca?q=<script>...</script>` exibido sem escape|
|**Armazenado**|Payload salvo no banco, executa quando outros veem|Comentário malicioso em post público|
|**DOM-based**|Código cliente lê de URL/fragment e executa|`location.hash` injetado em `innerHTML`|

Os três são prevenidos pela mesma regra: **nunca confie em entrada do usuário sem sanitizar antes de renderizar como HTML**.

---

## 6. CSP (Content Security Policy)

CSP é um header HTTP que diz ao navegador: _"só execute código dessas origens específicas"_. É **defense in depth** - se XSS conseguir injetar código, CSP pode impedir execução.

### 6.1 Header Básico

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.exemplo.com;
```

### 6.2 Diretivas Importantes

|Diretiva|O que controla|
|---|---|
|`default-src`|Default para todas as outras|
|`script-src`|De onde JavaScript pode vir|
|`style-src`|De onde CSS pode vir|
|`img-src`|De onde imagens podem vir|
|`connect-src`|URLs que fetch/XHR/WebSocket podem chamar|
|`frame-src`|De onde iframes podem vir|
|`font-src`|De onde fontes podem vir|

### 6.3 Implementação no Express

```typescript
import helmet from 'helmet'

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.exemplo.com'],
  },
}))
```

### 6.4 Aviso: CSP é Complexo

Configurar CSP exige conhecer **todas** as origens que seu app legitimamente usa. Configuração mal-feita quebra o app. Comece em **modo report-only** para descobrir o que falha sem bloquear:

```http
Content-Security-Policy-Report-Only: ...
```

Em produção, vire para `Content-Security-Policy` (bloqueia).

---

## 7. Headers de Segurança HTTP

Além de CSP, outros headers protegem contra ataques específicos. Use **Helmet** no Express para configurar tudo de uma vez:

```typescript
import helmet from 'helmet'
app.use(helmet())
```

### 7.1 Headers Configurados pelo Helmet

|Header|Proteção|
|---|---|
|`Strict-Transport-Security`|Força HTTPS por X meses|
|`X-Content-Type-Options: nosniff`|Browser não adivinha MIME type|
|`X-Frame-Options: DENY`|Impede embeded em iframe (clickjacking)|
|`X-XSS-Protection: 0`|Desabilita filter legado (CSP é melhor)|
|`Referrer-Policy`|Controla o que vai no Referer|
|`Permissions-Policy`|Quais APIs do browser são permitidas|

### 7.2 Configurar Manualmente

Para casos específicos, você pode setar diretamente:

```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
```

---

## 8. Gestão de Segredos

Já tratado no módulo 17, mas a regra merece repetição: **segredos nunca vão para o repositório**.

### 8.1 Onde Segredos NÃO Devem Estar

- ❌ Código-fonte (incluindo arquivos de exemplo committados)
- ❌ Repositório Git (mesmo apagado depois - está no histórico)
- ❌ Logs de aplicação
- ❌ Variáveis JavaScript no frontend (`process.env.X` no Vite é embarcado no bundle)
- ❌ Mensagens de erro mostradas ao usuário
- ❌ Comentários no código
- ❌ Documentação pública

### 8.2 Onde Segredos PODEM Estar

|Local|Quando|
|---|---|
|`.env` local (gitignored)|Desenvolvimento local|
|Variáveis de ambiente do provedor (Vercel, Railway, AWS)|Produção|
|Secrets managers (AWS Secrets Manager, Doppler, Infisical, Vault)|Times maiores|
|Cofre de senhas (1Password, Bitwarden)|Para humanos, não para apps|

### 8.3 O Que Fazer se Vazou

Se você commitou segredo por engano:

1. **Revogue imediatamente** o segredo (gere novo)
2. **Não confie em deletar do Git** - o histórico ainda tem
3. **Reescreva o histórico** se for repo privado e crítico (`git filter-repo`)
4. **Documente** a ocorrência para o time

`git filter-branch` ou `BFG Repo-Cleaner` removem do histórico, mas se já foi público, considere comprometido.

### 8.4 Variáveis no Frontend

Cuidado especial: **variáveis do bundle do frontend são públicas**. Tudo que vai pro Vite/Next via `VITE_*` ou `NEXT_PUBLIC_*` é embarcado no JavaScript final.

```bash
# ❌ NUNCA - vai pro bundle
VITE_DB_PASSWORD=segredo123
VITE_AWS_SECRET=...

# ✅ OK - destinado a ser público
VITE_API_URL=https://api.exemplo.com
VITE_GOOGLE_MAPS_KEY=AIza...  # chave restrita por domínio
```

Chaves de API no frontend devem ter **restrição de domínio** no provedor (Google, Mapbox, etc.). Se vazarem, só funcionam no domínio autorizado.

---

## 9. Logs Sem Dados Sensíveis

Logs são essenciais para debug e observabilidade - mas frequentemente são onde **dados pessoais vazam**.

### 9.1 O Problema

```typescript
// ❌ Vaza email e senha em produção
console.log('Login attempt:', { email, senha })

// ❌ Vaza payload inteiro (que pode ter PII)
console.log('Request:', req.body)

// ❌ Stack trace pode incluir variáveis com dados
catch (e) {
  console.error(e)  // pode imprimir { perfil: { cpf, ... } }
}
```

Logs vão para serviços de monitoramento (Sentry, Datadog, CloudWatch). Quem tem acesso ao monitoramento vê tudo que loga.

### 9.2 Logs Estruturados com Filtro

Use uma lib de logging estruturado (Pino, Winston) com filtros automáticos:

```typescript
import pino from 'pino'

const logger = pino({
  redact: {
    paths: [
      'senha',
      'email',
      'cpf',
      'cartao.numero',
      '*.senha',
      'req.body.senha',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
})

logger.info({ user: { email: 'a@b.com', senha: '123' } }, 'Login')
// Saída: { user: { email: '[REDACTED]', senha: '[REDACTED]' } }
```

### 9.3 O Que Logar (Seguro)

- IDs (sem nomes ou emails associados no mesmo log)
- Timestamps
- Códigos HTTP de resposta
- Latência de operações
- Eventos de domínio (sem detalhes pessoais)
- Erros (mensagem sim, payload não)

### 9.4 O Que NÃO Logar

- Senhas, mesmo "para debug temporário"
- Tokens (JWT, refresh, API keys)
- CPFs, RGs, números de cartão
- Conteúdo de mensagens privadas
- Geolocalização precisa
- Headers `Authorization`, `Cookie`

---

## 10. HTTPS, Cookies e SameSite

### 10.1 HTTPS Sempre

Sem HTTPS:

- Senhas trafegam em texto plano
- Tokens podem ser interceptados
- Conteúdo pode ser modificado em trânsito
- Browser exibe avisos que afastam usuários

**Em produção, HTTPS é não-negociável.** Em desenvolvimento, `localhost` é exceção aceita (mas considere mkcert).

### 10.2 Cookies Seguros

Para cookies com dados sensíveis (sessão, token):

```typescript
res.cookie('token', valorToken, {
  httpOnly: true,      // JavaScript não pode ler (protege contra XSS)
  secure: true,        // Só envia por HTTPS
  sameSite: 'lax',     // Não envia em requests cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000,  // expira em 7 dias
})
```

### 10.3 SameSite Explicado

|Valor|Comportamento|Quando usar|
|---|---|---|
|`strict`|Nunca envia em requests cross-site|Máxima segurança, mas quebra navegação a partir de links externos|
|`lax`|Envia em navegação top-level (link), não em iframes/fetch|Padrão razoável para a maioria|
|`none`|Sempre envia (exige `secure`)|Apps que precisam de cross-site (ex: SSO)|

### 10.4 Token: localStorage vs Cookie

Onde guardar token de autenticação? **Decisão com trade-offs.**

|Local|Protege contra|Vulnerável a|
|---|---|---|
|`localStorage`|CSRF|XSS (JS lê o storage)|
|Cookie `httpOnly`|XSS (JS não acessa)|CSRF (precisa CSRF token)|

Não há resposta universal. Para a maioria dos casos, **cookies `httpOnly` + CSRF token** é mais seguro. Para SPAs com refresh token rotation, localStorage com cuidado pode funcionar.

---

## 11. Validação Cliente vs Servidor

Repetindo do módulo 14 e 17 porque é **a regra de segurança mais importante**:

### 11.1 Cliente Não É Confiável

Tudo que vem do cliente pode ser:

- Modificado no DevTools antes de enviar
- Bypass de validações JavaScript
- Substituído por requests diretas (curl, Postman)
- Falsificado por bots

Validação no cliente é **UX** (feedback rápido), não **segurança**.

### 11.2 Toda Validação Repete no Servidor

```typescript
// Frontend (UX)
const schema = z.object({ email: z.string().email() })
const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })

// Backend (segurança)
app.post('/usuarios', (req, res) => {
  const dados = schema.parse(req.body)  // valida de novo
  // ...
})
```

**Mesmo schema** dos dois lados, quando possível. Em monorepo, compartilhe o schema. Em projetos separados, mantenha em paralelo.

### 11.3 Autorização Sempre no Servidor

Não confie em "esconder botão no frontend" para impedir ação.

```tsx
// ❌ Frontend só esconde - atacante pode chamar endpoint diretamente
{usuario.admin && <BotaoExcluir />}

// ✅ Frontend esconde + Backend verifica
{usuario.admin && <BotaoExcluir />}

// No backend:
app.delete('/recursos/:id', requireAdmin, controllerExcluir)
```

---

## 12. Dependências e Vulnerabilidades

Suas dependências são código que executa no seu app. Cada uma é um risco potencial.

### 12.1 Auditoria

```bash
# Lista vulnerabilidades conhecidas
npm audit

# Tenta corrigir automaticamente
npm audit fix

# Apenas alta severidade
npm audit --audit-level=high
```

Rode `npm audit` periodicamente. Em CI, configure para falhar se há vulnerabilidades altas.

### 12.2 Avalie Antes de Instalar

Antes de adicionar uma dependência:

|Pergunta|Sinal vermelho|
|---|---|
|Quando foi a última atualização?|Mais de 1 ano sem commit|
|Quantos downloads semanais?|Muito pouco para o que se propõe|
|Mantenedor é confiável?|Conta nova, sem histórico|
|Quantas dependências transitivas?|50+ subdependências por algo simples|
|Tamanho do bundle?|200kb por uma função simples|
|Tem TypeScript?|Tipos faltam ou estão errados|

Use **Bundlephobia** (`bundlephobia.com`) para avaliar peso. **npm trends** para popularidade. **GitHub** para atividade.

### 12.3 Lock File Sempre Commitado

```bash
# Sempre commitar
package-lock.json   # npm
yarn.lock           # yarn
pnpm-lock.yaml      # pnpm
```

Lock file garante que todos instalam **exatamente** as mesmas versões. Sem ele, build pode quebrar entre máquinas e produção pode receber versão diferente da desenvolvida.

### 12.4 Atualizações Regulares

Dependências desatualizadas acumulam vulnerabilidades. Mas atualizações grandes quebram código.

**Estratégia balanceada:**

|Tipo|Atualização|
|---|---|
|Patch (1.2.3 → 1.2.4)|Automático (Dependabot ou similar)|
|Minor (1.2.x → 1.3.x)|Mensal, com testes|
|Major (1.x → 2.x)|Planejado, com changelog em mãos|

Ferramentas úteis:

- **Dependabot** (GitHub) - PRs automáticos
- **Renovate** - mais configurável
- **npm outdated** - lista o que está desatualizado

---

## 13. Outras Práticas Importantes

### 13.1 Rate Limiting

Endpoints públicos precisam de limite de requisições para evitar abuso (brute force, scraping, DoS).

```typescript
import rateLimit from 'express-rate-limit'

const limitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,  // 5 tentativas por janela
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
})

app.post('/login', limitLogin, controllerLogin)
```

### 13.2 CORS Configurado, Não Aberto

```typescript
// ❌ Permite QUALQUER origem
app.use(cors({ origin: '*' }))

// ✅ Permite apenas suas origens conhecidas
app.use(cors({
  origin: ['https://app.exemplo.com', 'https://admin.exemplo.com'],
  credentials: true,
}))
```

### 13.3 Erros Sem Vazar Detalhes Internos

```typescript
// ❌ Vaza estrutura interna em produção
catch (e) {
  res.status(500).json({ erro: e.message, stack: e.stack })
}

// ✅ Mensagem genérica em produção, completa em dev
catch (e) {
  if (env.NODE_ENV === 'development') {
    return res.status(500).json({ erro: e.message, stack: e.stack })
  }
  logger.error(e)
  res.status(500).json({ erro: 'Erro interno do servidor' })
}
```

### 13.4 Senhas

Senhas **nunca** são armazenadas em texto plano. Use **bcrypt** ou **argon2**:

```typescript
import bcrypt from 'bcrypt'

// Ao cadastrar
const hash = await bcrypt.hash(senha, 12)
await db.usuario.create({ data: { email, senhaHash: hash } })

// Ao verificar
const valido = await bcrypt.compare(senha, usuario.senhaHash)
```

Hash é **unidirecional** - você não recupera a senha, só verifica se bate.

---

## 14. Checklist Mínimo Antes de Entregar

### Segurança técnica

- [ ] Sem `dangerouslySetInnerHTML` (ou sanitizado com DOMPurify)
- [ ] URLs dinâmicas validadas (sem `javascript:`)
- [ ] Helmet ativo no Express (ou headers equivalentes)
- [ ] HTTPS obrigatório em produção
- [ ] Validação repetida no backend (não confia no frontend)
- [ ] Senhas armazenadas com hash (bcrypt/argon2)
- [ ] Rate limit em endpoints públicos críticos (login, signup)
- [ ] `npm audit` sem vulnerabilidades altas

### Privacidade

- [ ] Sem `console.log` de PII em produção
- [ ] Sem dados pessoais em URLs (query params)
- [ ] Logs com filtro/redact para campos sensíveis
- [ ] Cookies de sessão com `httpOnly`, `secure`, `sameSite`
- [ ] Princípio "emprestar o dispositivo" validado para telas sensíveis
- [ ] Chaves de API com escopo mínimo necessário

### Gestão de segredos

- [ ] `.env` no `.gitignore`
- [ ] `.env.example` committado (sem valores)
- [ ] Validação de env na inicialização (Zod)
- [ ] Sem segredos no bundle frontend (`VITE_*` é público)

Detalhamento adicional em [`../checklists/41-seguranca.md`](https://claude.ai/checklists/41-seguranca.md).

---

## 15. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Validar só no cliente?|Nunca. Sempre repita no servidor|
|`dangerouslySetInnerHTML`?|Evite. Se inevitável, sanitize com DOMPurify|
|`console.log` em prod?|Sem PII. Use logger com redact|
|Senha em texto plano?|Nunca. bcrypt ou argon2|
|HTTPS?|Sempre em produção|
|`.env` no Git?|Nunca. Só `.env.example`|
|Variável do frontend é privada?|Não. `VITE_*` é embarcado no bundle|
|Cookies de sessão?|`httpOnly` + `secure` + `sameSite`|
|Confiar em dependências?|Audite. `npm audit` regular|
|CORS aberto?|Não. Origens específicas|

---

## 🔗 Módulos Relacionados

- [`10-codigo-e-convencoes.md`](https://claude.ai/chat/10-codigo-e-convencoes.md) - Proibições de código (`dangerouslySetInnerHTML`, dados em URL)
- [`14-formularios-e-validacao.md`](https://claude.ai/chat/14-formularios-e-validacao.md) - Validação no frontend que precisa repetir no servidor
- [`17-backend-node.md`](https://claude.ai/chat/17-backend-node.md) - Estrutura backend onde muitas dessas práticas aplicam
- [`../checklists/41-seguranca.md`](https://claude.ai/checklists/41-seguranca.md) - Checklist detalhado de segurança
---
description: "Checklist detalhado de segurança para frontend SPA. Versão essencial (nunca passam) + completa por categoria."
modulo: "41"
categoria: "checklists"
versao: "1.0"
relacionado:
  - "18-seguranca-privacidade.md"
  - "40-revisao-rapida.md"
---

# 🔒 Checklist: Segurança

> Lista acionável de verificações de segurança para frontend SPA. Para conceitos e justificativas, ver [módulo 18](../padroes/18-seguranca-privacidade.md). Este checklist é referenciado pelo [40-revisao-rapida.md](./40-revisao-rapida.md) quando a mudança toca área sensível.

---

## Princípios

Antes dos itens:

1. **Defesa em camadas.** Toda defesa pode falhar. Sempre tenha redundância.
2. **Nunca confie no cliente.** Validação no frontend é UX. Validação no backend é segurança.
3. **Menor privilégio.** Cliente só recebe e armazena o mínimo necessário.
4. **Falhar fechado.** Se algo não está claro (autorização, validade, formato), **bloqueie**. Aberto por descuido é vulnerabilidade.

---

## Versão Essencial (Toda Mudança Que Toca Dados ou API)

> Estas verificações são **inegociáveis**. Item `[ ]` aqui é 🔴 Bloqueante por padrão.

### PII e Dados Sensíveis

- [ ] **Nenhum CPF, RG, email, telefone, endereço em URL/querystring**
- [ ] **Nenhum token, senha ou segredo hardcoded no código**
- [ ] **Nenhum dado pessoal em `console.log` (ou logs estruturados)**
- [ ] **Variáveis de ambiente sensíveis NÃO estão em arquivos commitados** (`.env` no `.gitignore`)

### Storage

- [ ] **Tokens JWT NÃO estão em `localStorage` se sessões críticas**
- [ ] **Senhas NUNCA armazenadas em qualquer storage do navegador**
- [ ] **Storage acessado apenas via serviço isolado** (não `localStorage.getItem(...)` direto em componentes)

### XSS

- [ ] **Nenhum `dangerouslySetInnerHTML` sem DOMPurify**
- [ ] **Nenhum HTML construído por concatenação de strings com input do usuário**

### Backend

- [ ] **Validação acontece também no backend** (não confiar apenas em validação client-side)

Se algum dos itens acima falha, **a tarefa não pode ser concluída** até ser corrigida.

---

## Versão Completa por Categoria

### 1. PII (Personally Identifiable Information)

PII inclui: nome completo, CPF, RG, passaporte, email, telefone, endereço, data de nascimento, dados bancários, dados de saúde, geolocalização precisa.

#### Onde NUNCA aparecer

- [ ] URL e querystring (visível em logs de servidor, histórico do navegador, Referer header)
- [ ] localStorage / sessionStorage (acessível por qualquer JS na página)
- [ ] Cookies sem flag `Secure` e `httpOnly`
- [ ] `console.log` em produção
- [ ] Mensagens de erro mostradas ao usuário
- [ ] URLs de imagens ou recursos externos (vaza via Referer)
- [ ] Atributos `data-*` no HTML (visível no DOM)
- [ ] Code source de templates de email transacional
- [ ] Stack traces ou logs públicos

#### Quando aparecer (necessariamente)

- [ ] Enviado em body de requisição POST/PUT/PATCH (não em querystring)
- [ ] HTTPS sempre - nunca HTTP plano
- [ ] Header `Authorization` carrega token, não credenciais (não basic auth com senha)

### 2. Storage e Tokens

#### Tokens de autenticação

- [ ] Refresh tokens em **cookies httpOnly + Secure + SameSite=strict**
- [ ] Access tokens podem estar em memória (state da aplicação) - não persistir
- [ ] Se persistência for necessária, considerar **sessionStorage** (limpa ao fechar tab) em vez de **localStorage**
- [ ] Tokens expirados são limpos no logout/inatividade

#### Dados pessoais em storage

- [ ] localStorage só guarda preferências de UI (tema, idioma, layout)
- [ ] **Não guardar dados pessoais** em localStorage (mesmo "para conveniência")
- [ ] Se precisa cache offline com PII, usar **IndexedDB com criptografia** (e ainda assim avaliar risco)

#### Acesso isolado

- [ ] Storage acessado apenas via `services/[nome]Storage.ts`
- [ ] Componentes nunca chamam `localStorage.getItem(...)` direto
- [ ] Serviço de storage valida o que entra e sai (formato, tipo)
- [ ] Migração de schema tratada (se mudar formato, ler old + write new)

#### Limpeza

- [ ] Logout limpa **todo** storage relacionado à sessão
- [ ] Mecanismo de "limpar dados" funciona quando solicitado
- [ ] Dados sensíveis têm TTL (time-to-live) implícito ou explícito

### 3. XSS (Cross-Site Scripting)

#### Renderização

- [ ] React/JSX usado para tudo (escapa por padrão)
- [ ] Nenhum `dangerouslySetInnerHTML` sem **DOMPurify** ou similar
- [ ] Quando há `dangerouslySetInnerHTML`, allowlist de tags está documentada
- [ ] `eval()`, `new Function()`, `setTimeout(string)` não são usados

#### URLs e Redirecionamentos

- [ ] Links `<a href={X}>` validam URLs vindas do usuário (allowlist de protocolos: `https:`, `mailto:`)
- [ ] Sem `<a href={input}>` cego que aceita `javascript:`
- [ ] Redirecionamentos validam destino contra allowlist (impede open redirect)

#### Atributos perigosos

- [ ] `onclick`, `onload`, `onmouseover` no DOM (não em JSX) sem validação são proibidos
- [ ] `style={dynamicCSS}` valida o input (CSS injection raro mas possível)

### 4. Autenticação e Autorização

#### Login

- [ ] Login usa **HTTPS** sempre
- [ ] Senha enviada como body POST, nunca em URL
- [ ] Erro de login não revela "email não existe" vs "senha errada" (mensagem genérica)
- [ ] Sem auto-completar campo de senha em formulários sensíveis (`autocomplete="new-password"` ou `off`)
- [ ] Rate limiting no backend (frontend não tem como impor sozinho)
- [ ] CAPTCHA ou mecanismo anti-bot após tentativas falhadas (no backend)

#### Sessão

- [ ] Sessões expiram após período razoável (ex: 30min inativo, 8h total)
- [ ] Renovação de sessão (refresh token) acontece sem interação se possível
- [ ] Inatividade prolongada faz logout
- [ ] Logout em uma aba reflete em outras abas (storage event ou similar)
- [ ] Múltiplas sessões simultâneas têm política definida (permite? força logout outras?)

#### Autorização (no front)

- [ ] **Decisões de autorização nunca são apenas no frontend** - backend valida cada requisição
- [ ] Frontend esconde elementos de UI sem permissão, mas backend bloqueia mesmo se chamado
- [ ] Rotas protegidas validam permissão a cada navegação (não só no login)
- [ ] Tokens carregam o **mínimo** de informação para autorização (não dados pessoais inteiros)

### 5. Validação e Sanitização

#### Princípio

- [ ] Validação client-side existe (UX) - Zod ou similar
- [ ] Validação server-side existe (segurança) - backend revalida
- [ ] Sanitização ocorre nas **bordas** (entrada e saída), não no meio
- [ ] Tipos do TypeScript não são considerados validação (são dica de desenvolvedor)

#### Tipos comuns

- [ ] Strings têm limite de tamanho explícito (proteção contra DoS)
- [ ] Números têm range válido (`min`, `max`)
- [ ] URLs têm protocolo validado
- [ ] Datas têm formato e range
- [ ] Enums limitam valores aceitos
- [ ] Arrays têm tamanho máximo

### 6. Dependências

#### Auditoria

- [ ] `npm audit` (ou equivalente) rodado, sem CVEs críticas pendentes
- [ ] Dependências têm origem confiável (npm oficial, não fork suspeito)
- [ ] Lock file (`package-lock.json` ou `pnpm-lock.yaml`) commitado
- [ ] Dependências grandes têm avaliação prévia (não instalar lib obscura sem motivo)

#### Atualizações

- [ ] Vulnerabilidades críticas têm prazo de correção (não acumulam)
- [ ] Atualizações major foram analisadas (não só `npm update` cego)
- [ ] Dependências legadas ou abandonadas estão sendo migradas (dívida técnica)

#### Supply chain

- [ ] `postinstall` scripts de dependências não fazem ações suspeitas (verificar com `--ignore-scripts` se desconfia)
- [ ] CDN scripts (se houver) usam `integrity` (SRI) e `crossorigin`
- [ ] Sem fontes externas carregadas dinamicamente sem revisão

### 7. Mensagens, Logs e Erros

#### Para o usuário

- [ ] Mensagens de erro são genéricas para usuários ("Erro ao processar pagamento" - não "ECONNREFUSED na linha 47")
- [ ] Erros nunca expõem stack trace
- [ ] Erros nunca expõem queries SQL ou estrutura interna
- [ ] Páginas 404/500 customizadas não vazam informação técnica

#### Para logs

- [ ] Logs estruturados (não `console.log` solto)
- [ ] PII removida ou mascarada antes de logar
- [ ] Logs de produção vão para serviço dedicado (não browser console)
- [ ] Logs incluem correlation ID para rastrear sem vazar dados

### 8. CSP e Headers de Segurança

Frontend solo configura via `index.html` (meta tag) ou backend/CDN configura headers.

#### Headers esperados (no servidor que serve a SPA)

- [ ] `Content-Security-Policy` configurado
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` ou `frame-ancestors` no CSP
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` ou mais restritivo

#### CSP específico

- [ ] `default-src 'self'`
- [ ] `script-src` sem `'unsafe-inline'` se possível
- [ ] `script-src` sem `'unsafe-eval'`
- [ ] Domínios externos liberados estão listados explicitamente
- [ ] Inline scripts (se inevitáveis) usam `nonce` ou `hash`

### 9. CSRF

CSRF é menos relevante em SPAs que usam tokens via header (não cookies). Mas se autenticação inclui cookies:

- [ ] Cookies usam `SameSite=Lax` ou `SameSite=Strict`
- [ ] Operações sensíveis exigem token CSRF (`X-CSRF-Token` ou similar)
- [ ] CSRF token é validado server-side

### 10. Privacidade e LGPD/GDPR

- [ ] Coleta de dados pessoais tem **base legal** (consentimento, contrato, etc.)
- [ ] Usuário pode **ver** dados que o sistema tem dele
- [ ] Usuário pode **exportar** seus dados
- [ ] Usuário pode **solicitar exclusão** (com prazo e exceções legais documentadas)
- [ ] Cookies de tracking só ativam após consentimento
- [ ] Política de privacidade existe e é acessível

---

## Sinais de Alerta Durante Revisão

Padrões no código que merecem atenção extra:

|Padrão suspeito|O que verificar|
|---|---|
|`localStorage.setItem` em componente|Storage não isolado|
|`dangerouslySetInnerHTML`|DOMPurify presente?|
|URL com query params estranhos|PII na URL?|
|`process.env.X` em código cliente|Variável vai vazar no bundle|
|`eval()`, `Function()`|Sempre suspeito|
|Comentário "// TODO segurança"|Não pode ficar|
|Auth token sendo logado|Vazamento em logs|
|Allowlist hardcoded|Atualizado? Abrangente?|
|Mensagem de erro detalhada|Vaza informação?|

---

## Quando Consultar Especialista

Você é estudante. Em alguns casos, **pause** e consulte alguém com mais experiência (ou faça mais pesquisa) antes de prosseguir:

|Caso|Por quê|
|---|---|
|Implementando autenticação do zero|Erros aqui são catastróficos|
|Manipulação de dados de saúde, financeiros ou de menores|Regulação específica (LGPD, HIPAA, COPPA)|
|Criptografia client-side|Quase sempre é melhor evitar|
|Integração com gateway de pagamento|PCI-DSS aplica|
|Funcionalidade de "compartilhar com outros usuários"|Privacy & permission model|
|Webhooks ou comunicação assíncrona|Validação de origem|

Em casos assim, **abrir tarefa Strict** e marcar como dependente de validação humana é o caminho correto.

---

## Mini-FAQ

**1. JWT em localStorage é sempre errado?** Não absolutamente, mas é arriscado. Se o JWT dá acesso a dados sensíveis ou ações destrutivas, prefira cookie httpOnly + refresh token. Para tokens de baixa criticidade (preferências, anônimo), localStorage pode estar OK. Documente a decisão em ADR.

**2. `dangerouslySetInnerHTML` com DOMPurify é seguro?** Significativamente mais seguro, mas não 100%. Use só quando renderizar HTML é genuinamente necessário (markdown processado, conteúdo de CMS confiável). E mesmo assim, configure DOMPurify com allowlist restritiva.

**3. Como sei se uma dependência é confiável?** Verifique: histórico do mantenedor, número de downloads, última atualização, issues abertas, código no GitHub (não só publicado no npm). Para libs críticas, leia o código-fonte.

**4. Validação client-side é desnecessária se o backend valida?** Não é desnecessária - é importante para **UX** (feedback rápido). Mas não substitui validação backend. As duas convivem.

**5. CSP é obrigatório?** Em projeto sério, sim. Em projeto solo de estudo, ainda recomendado mas não bloqueante. Configurar CSP bem demora - vale registrar como dívida técnica se ainda não fez.

**6. Como sei se um dado é PII?** Regra prática: se alguém pode usar para identificar você (ou impactar você se vazar), é PII. Email, telefone, endereço, dados de saúde são óbvios. Mas combinações de dados aparentemente não-pessoais (CEP + data de nascimento + gênero) também podem identificar - cuidado.

**7. Posso fazer "Login com Google" sem expertise?** OAuth com provider conhecido (Google, GitHub, Auth0) é mais seguro que reinventar. Use bibliotecas oficiais. Mas mesmo assim, entender o fluxo é importante - não copie sem entender.

**8. Quanto tempo gasto em segurança em cada PR?** Para versão essencial: 2-5 minutos. Para versão completa em mudança sensível: 15-30 minutos. Para feature de auth ou pagamento: horas. Tempo proporcional ao risco.

**9. Auditoria de dependências em todo PR?** Não. `npm audit` semanal/mensal é razoável. Em PR específico, só se a mudança **adiciona** ou **atualiza** dependência.

**10. E se o backend for stub e não validar?** Você tem dois problemas: o stub e o frontend. Documente como **dívida técnica crítica** (`docs/dominios/divida-tecnica.md`). Não trate frontend como compensação - backend precisa ser feito.

---

## 🔗 Checklists e Módulos Relacionados

- [`40-revisao-rapida.md`](./40-revisao-rapida.md) - Checklist master que aponta para este
- [`42-acessibilidade.md`](./42-acessibilidade.md) - Checklist de acessibilidade
- [`43-performance.md`](./43-performance.md) - Checklist de performance
- [`../padroes/18-seguranca-privacidade.md`](../padroes/18-seguranca-privacidade.md) - Conceitos e justificativas detalhadas
- [`../padroes/14-formularios-e-validacao.md`](../padroes/14-formularios-e-validacao.md) - Validação com Zod
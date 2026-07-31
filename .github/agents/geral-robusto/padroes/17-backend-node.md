---
description: "Backend Node - stub mínimo. Princípios, estrutura, validação, erros, .env. A expandir quando entrar projeto backend."
modulo: "17"
categoria: "padroes"
versao: "1.0"
status: "stub"
relacionado:
  - "10-codigo-e-convencoes.md"
  - "11-arquitetura-e-pastas.md"
  - "14-formularios-e-validacao.md"
  - "18-seguranca-privacidade.md"
---

# 🖥️ Backend Node - Stub Mínimo

> ⚠️ **Este módulo é um stub deliberadamente curto.** Foi escrito em **2026-05-13** quando o autor focava em frontend. A expansão acontece quando o primeiro projeto backend real entrar em desenvolvimento, com base em decisões reais - não em especulação.

---

## 1. O Que Este Stub Cobre

|Cobre|Não cobre (ainda)|
|---|---|
|Stack default sugerida|Autenticação detalhada (JWT, OAuth, sessions)|
|Estrutura de pastas em camadas|ORMs além de menção (Prisma, Drizzle)|
|Princípio de separação route → controller → service|Migrations, seeds, queries complexas|
|Validação de entrada com Zod|WebSockets, SSE, real-time|
|Tratamento de erros centralizado|Jobs/queues (BullMQ, etc.)|
|Variáveis de ambiente|Caching (Redis)|
|Convenção de respostas HTTP|Upload de arquivos|
||Rate limiting, segurança avançada|
||Testes de backend|
||Deploy, CI/CD|

A intenção do stub é **te orientar** se precisar tocar em backend, não te dar tutorial completo. Quando você for construir backend de verdade, expandimos com base em decisões reais.

---

## 2. Stack Default Sugerida

Para um projeto backend típico em JavaScript:

|Função|Biblioteca|Motivo|
|---|---|---|
|Runtime|**Node.js 20+**|LTS, módulos nativos modernos|
|Framework HTTP|**Express 4+**|Simples, ecossistema enorme, fácil de aprender|
|ORM|**Prisma**|Schema-first, type-safe, migrations integradas|
|Validação|**Zod**|Mesmo padrão do frontend (módulo 14)|
|Banco|**PostgreSQL**|Open, robusto, ótimo suporte JSON|
|Tipos|**TypeScript 5+**|Strict mode|

### 2.1 Alternativas Aceitáveis

|Padrão|Alternativa|Quando|
|---|---|---|
|Express|**Fastify**|Performance crítica, schema-first nativo|
|Express|**Hono**|Edge runtimes (Cloudflare Workers)|
|Prisma|**Drizzle**|SQL mais explícito, menor overhead|
|Prisma|**Knex**|Query builder sem migrations integradas|

A escolha entre essas tem trade-offs. Para projeto de aprendizado, **Express + Prisma** é o caminho com mais material disponível.

---

## 3. Princípio Fundamental: Separação em Camadas

A regra mais importante de backend: **cada camada tem uma única responsabilidade**, e dependências fluem em uma direção.

```
HTTP Request
   ↓
[ Route ]         Define a URL e o método
   ↓
[ Controller ]    Recebe req, valida, chama service, formata response
   ↓
[ Service ]       Lógica de negócio. Não conhece HTTP.
   ↓
[ Repository ]    Acesso ao banco. Não conhece negócio.
   ↓
Database
```

### 3.1 Por Que Essa Separação

Cada camada pode ser **testada e trocada** isoladamente:

- **Service** não conhece HTTP - você testa sem subir servidor
- **Repository** não conhece negócio - você troca PostgreSQL por MongoDB sem refatorar service
- **Controller** é fino - apenas adapta HTTP para a chamada da camada de baixo

### 3.2 Anti-Padrão Comum

```typescript
// ❌ Controller com lógica de negócio E acesso direto ao banco
app.post('/pedidos', async (req, res) => {
  const { itens } = req.body
  if (itens.length === 0) return res.status(400).json({ erro: 'Vazio' })

  let total = 0
  for (const item of itens) {
    total += item.preco * item.quantidade
  }
  if (total > 10000) {
    total = total * 0.95  // desconto regra de negócio
  }

  const pedido = await prisma.pedido.create({ data: { total, itens } })
  res.json(pedido)
})
```

```typescript
// ✅ Camadas separadas
// route
app.post('/pedidos', criarPedidoController)

// controller (HTTP)
async function criarPedidoController(req: Request, res: Response) {
  const dados = schemaCriarPedido.parse(req.body)  // valida
  const pedido = await pedidoService.criar(dados)  // delega
  res.status(201).json(pedido)
}

// service (negócio)
export const pedidoService = {
  async criar(dados: DadosCriarPedido) {
    const total = calcularTotalComDesconto(dados.itens)
    return pedidoRepository.criar({ ...dados, total })
  },
}

// repository (banco)
export const pedidoRepository = {
  async criar(dados: PedidoCompleto) {
    return prisma.pedido.create({ data: dados })
  },
}
```

Cada arquivo é curto, focado, testável. **Refatorar a regra de desconto** vira mudança em 1 lugar (service). **Trocar banco** vira mudança em 1 lugar (repository).

---

## 4. Estrutura de Pastas Mínima

```
src/
├── routes/                # Definição de URLs e métodos
│   ├── perfilRoutes.ts
│   └── pedidoRoutes.ts
│
├── controllers/           # Adapta HTTP ↔ service
│   ├── perfilController.ts
│   └── pedidoController.ts
│
├── services/              # Lógica de negócio
│   ├── perfilService.ts
│   └── pedidoService.ts
│
├── repositories/          # Acesso a dados
│   ├── perfilRepository.ts
│   └── pedidoRepository.ts
│
├── schemas/               # Schemas Zod (entrada/saída)
│   ├── perfilSchema.ts
│   └── pedidoSchema.ts
│
├── middlewares/           # Express middlewares
│   ├── errorHandler.ts
│   └── autenticacao.ts
│
├── errors/                # Classes de erro customizadas
│   ├── AppError.ts
│   └── ValidacaoError.ts
│
├── config/                # Configurações (env, db, etc.)
│   ├── env.ts
│   └── db.ts
│
├── types/                 # Tipos compartilhados
│   └── domain.ts
│
└── server.ts              # Ponto de entrada
```

### 4.1 Variante: Por Feature

Em projetos maiores, pode evoluir para estrutura "por feature":

```
src/
├── features/
│   ├── perfil/
│   │   ├── perfilRoutes.ts
│   │   ├── perfilController.ts
│   │   ├── perfilService.ts
│   │   ├── perfilRepository.ts
│   │   └── perfilSchema.ts
│   └── pedido/
│       └── ...
└── shared/
    ├── middlewares/
    ├── errors/
    └── config/
```

Mesma decisão do módulo 11: **comece com estrutura por camada (plana). Migre para feature quando o projeto cresce.**

---

## 5. Validação de Entrada com Zod

Já no frontend (módulo 14) você usa Zod. No backend, use o **mesmo padrão**. Se possível, **o mesmo schema**.

### 5.1 Schema Compartilhável

Em monorepos ou projetos onde frontend e backend dividem código:

```typescript
// shared/schemas/pedidoSchema.ts
import { z } from 'zod'

export const schemaCriarPedido = z.object({
  itens: z.array(z.object({
    produtoId: z.string().uuid(),
    quantidade: z.number().int().positive(),
  })).min(1),
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
})

export type DadosCriarPedido = z.infer<typeof schemaCriarPedido>
```

Frontend valida antes de enviar. Backend valida ao receber. **Não confie no frontend** - sempre revalide.

### 5.2 Validação no Controller

```typescript
// controllers/pedidoController.ts
export async function criarPedidoController(req: Request, res: Response) {
  // Lança ZodError se inválido - middleware de erro pega
  const dados = schemaCriarPedido.parse(req.body)

  const pedido = await pedidoService.criar(dados)
  res.status(201).json(pedido)
}
```

### 5.3 Middleware Genérico de Validação

Para evitar repetir `.parse()` em cada controller:

```typescript
// middlewares/validate.ts
import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body)  // lança ZodError se inválido
    next()
  }

// Uso na rota
router.post('/pedidos', validate(schemaCriarPedido), criarPedidoController)
```

Agora o controller recebe `req.body` já validado e tipado.

---

## 6. Tratamento de Erros Centralizado

Erros espalhados em cada controller geram código repetido e fácil de errar. **Use um middleware de erro central.**

### 6.1 Hierarquia de Erros (revisitando módulo 10)

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public mensagem: string,
    public statusCode: number = 500,
    public detalhes?: unknown,
  ) {
    super(mensagem)
    this.name = this.constructor.name
  }
}

// errors/index.ts
export class ValidacaoError extends AppError {
  constructor(mensagem: string, detalhes?: unknown) {
    super(mensagem, 400, detalhes)
  }
}

export class NaoEncontradoError extends AppError {
  constructor(mensagem: string) {
    super(mensagem, 404)
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(mensagem = 'Não autorizado') {
    super(mensagem, 401)
  }
}

export class ConflitoError extends AppError {
  constructor(mensagem: string) {
    super(mensagem, 409)
  }
}
```

### 6.2 Middleware de Erro

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '@/errors/AppError'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erro de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: 'Validação falhou',
      detalhes: err.flatten(),
    })
  }

  // Erro conhecido da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      erro: err.mensagem,
      detalhes: err.detalhes,
    })
  }

  // Erro inesperado: logar e responder genérico
  console.error('Erro inesperado:', err)
  res.status(500).json({
    erro: 'Erro interno do servidor',
  })
}
```

### 6.3 Registro

```typescript
// server.ts
import express from 'express'
import { errorHandler } from '@/middlewares/errorHandler'
import { rotas } from '@/routes'

const app = express()
app.use(express.json())
app.use('/api', rotas)
app.use(errorHandler)  // ÚLTIMO middleware sempre

app.listen(3000)
```

### 6.4 Uso no Service

```typescript
// services/perfilService.ts
import { NaoEncontradoError } from '@/errors'

export const perfilService = {
  async obter(id: string) {
    const perfil = await perfilRepository.obterPorId(id)
    if (!perfil) {
      throw new NaoEncontradoError(`Perfil ${id} não encontrado`)
    }
    return perfil
  },
}
```

O service **lança** o erro. O middleware **captura** e formata a resposta HTTP. Service não conhece HTTP.

---

## 7. Variáveis de Ambiente

### 7.1 Regra de Ouro

**Segredos nunca vão para o repositório.** Use `.env` para valores locais, e variáveis de ambiente do provedor (Vercel, Railway, etc.) em produção.

```bash
# .env (NUNCA commitar)
DATABASE_URL=postgres://user:senha@localhost:5432/db
JWT_SECRET=segredo-super-secreto-que-ninguem-pode-ver
PORT=3000
```

```bash
# .env.example (commitar - serve de template)
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

```bash
# .gitignore
.env
.env.local
```

### 7.2 Validação de Env com Zod

Variáveis de ambiente são strings sem validação. Use Zod para validar na inicialização:

```typescript
// config/env.ts
import { z } from 'zod'
import 'dotenv/config'

const schemaEnv = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const resultado = schemaEnv.safeParse(process.env)

if (!resultado.success) {
  console.error('❌ Variáveis de ambiente inválidas:')
  console.error(resultado.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = resultado.data
```

Agora `import { env } from '@/config/env'` é tipado e seguro. Se faltar variável, o servidor **falha alto** na inicialização - não silenciosamente em produção.

### 7.3 O Que NÃO Fazer

```typescript
// ❌ Hardcoded em código
const JWT_SECRET = 'meu-segredo-123'

// ❌ Sem validação
const port = process.env.PORT  // pode ser undefined em runtime

// ❌ Logar em produção
console.log('Env:', process.env)  // vaza segredos
```

---

## 8. Convenção de Respostas HTTP

Padronize os formatos de resposta para que o frontend possa consumir sem surpresas.

### 8.1 Sucesso

```typescript
// Recurso único
res.status(200).json(perfil)

// Lista
res.status(200).json({ dados: perfis, total: 42 })

// Criação
res.status(201).json(novoPedido)

// Sem conteúdo (delete)
res.status(204).send()
```

### 8.2 Erro

```typescript
// 400 - Validação falhou
{
  "erro": "Validação falhou",
  "detalhes": { "email": ["Email inválido"] }
}

// 401 - Não autenticado
{ "erro": "Token inválido ou expirado" }

// 403 - Autenticado mas sem permissão
{ "erro": "Sem permissão para acessar este recurso" }

// 404 - Não encontrado
{ "erro": "Pedido 123 não encontrado" }

// 409 - Conflito (ex: email já cadastrado)
{ "erro": "Email já está em uso" }

// 500 - Erro inesperado (não exponha detalhes internos)
{ "erro": "Erro interno do servidor" }
```

### 8.3 Códigos HTTP Comuns

|Código|Significado|Use quando|
|---|---|---|
|200|OK|Resposta bem-sucedida com corpo|
|201|Created|Recurso criado (POST)|
|204|No Content|Sucesso sem corpo (DELETE)|
|400|Bad Request|Validação falhou|
|401|Unauthorized|Sem autenticação válida|
|403|Forbidden|Autenticado mas sem permissão|
|404|Not Found|Recurso não existe|
|409|Conflict|Conflito de estado (duplicação, race)|
|422|Unprocessable Entity|Validação semântica (alternativa ao 400)|
|429|Too Many Requests|Rate limit|
|500|Internal Server Error|Erro inesperado|

---

## 9. Princípios Cruzados (Compartilhados com Módulo 10)

As convenções do módulo 10 valem aqui também:

- **Idioma único** - backend no mesmo idioma do frontend do projeto
- **Sem `any`** - `unknown` + Zod
- **Erros nunca engolidos** - sempre lance ou trate explicitamente
- **Nomes claros** - `criarPedido` em vez de `cp`
- **Sem `console.log` em produção com dados sensíveis**

---

## 10. O Que Ainda Será Expandido

Quando o primeiro projeto backend entrar em desenvolvimento, este módulo será expandido com:

|Tema|O que cobrir|
|---|---|
|**Autenticação**|JWT, refresh tokens, sessions, OAuth|
|**Autorização**|RBAC, ABAC, middleware de permissão|
|**Prisma em profundidade**|Schema, migrations, queries complexas, transactions|
|**Testes**|Unit (service, repository), integração (API), com banco de teste|
|**Logging estruturado**|Pino, correlation IDs, levels|
|**Rate limiting**|express-rate-limit, estratégias por rota|
|**Segurança**|Helmet, CORS, CSRF, SQL injection (ORM cuida mas vale entender)|
|**Upload de arquivos**|Multer, validação, storage (S3/local)|
|**Jobs e queues**|BullMQ, cron, retry policies|
|**WebSockets**|Socket.io ou ws nativo|
|**Caching**|Redis, in-memory, estratégias|
|**Deploy**|Build, env, processos (PM2, Docker), CI/CD|
|**Observabilidade**|Métricas, traces, health checks|

Esses temas serão expandidos **com base em decisões reais** quando você for usar - não em especulação agora.

---

## 11. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Stack default?|Node + Express + Prisma + Zod + PostgreSQL|
|Separação?|Route → Controller → Service → Repository|
|Validação?|Zod, mesmo padrão do frontend|
|Erros?|Hierarquia de classes + middleware central|
|Env?|`.env` (gitignored) + validação Zod na inicialização|
|Resposta HTTP?|Códigos corretos + formato padronizado|
|Backend confia no frontend?|Nunca. Sempre revalide|
|Quando expandir este módulo?|Quando o primeiro projeto backend real começar|

---

## 🔗 Módulos Relacionados

- [`10-codigo-e-convencoes.md`](./10-codigo-e-convencoes.md) - Convenções de código aplicáveis aqui também
- [`11-arquitetura-e-pastas.md`](./11-arquitetura-e-pastas.md) - Estrutura em camadas (mesmo princípio do frontend)
- [`14-formularios-e-validacao.md`](./14-formularios-e-validacao.md) - Zod no frontend (mesmo padrão aqui)
- [`18-seguranca-privacidade.md`](./18-seguranca-privacidade.md) - Segurança no backend (próximo módulo)
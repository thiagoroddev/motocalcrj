---
applyTo: "server/**,api/**,backend/**"
---

## Início Obrigatório de Sessão

Antes de qualquer ação:

1. Leia `SESSAO-ATIVA.md` contexto do que foi feito antes
2. Leia `contexto-base.instructions.md` estado atual do projeto
3. Leia `protocolo-handoff.instructions.md` regras de handoff
4. Atualize `SESSAO-ATIVA.md`: task = [~] EM DESENVOLVIMENTO + o que vai fazer

> Mantenha em mente: ao concluir, você deve verificar se o `contexto-base` precisa atualização (Regra 4 do `protocolo-handoff.instructions.md`).

# Agente: Engenheiro Backend MotoCalc RJ

## Identidade

Você implementa o backend quando ele existir API REST em Node.js + Express + TypeScript, Prisma, autenticação JWT. No V1 do MotoCalc não há backend (tudo em localStorage). Este agente entra em ação no V2.

**Leia `contexto-base.instructions.md` antes de qualquer resposta.**

---

## Quando Você É Chamado

- V2 do MotoCalc com autenticação e sincronização entre dispositivos
- Qualquer endpoint de API necessário

---

## Stack de Backend (quando existir)

```
Runtime:    Node.js 20 LTS
Framework:  Express 4 + TypeScript
ORM:        Prisma (PostgreSQL em produção, SQLite em dev)
Auth:       JWT access token (15min) + refresh token (7d)
Validação:  Zod (compartilhado com o front quando possível)
Testes:     Vitest + Supertest
```

---

## Estrutura de Pastas do Servidor

```
server/
├── src/
│   ├── app.ts              Express app (sem listen)
│   ├── server.ts           entry point (listen aqui)
│   ├── rotas/              definição de rotas por domínio
│   ├── controladores/      recebe req/res, chama serviços
│   ├── servicos/           lógica de negócio (sem req/res)
│   ├── middleware/         auth, validação, erros
│   ├── esquemas/           Zod schemas
│   ├── tipos/              TypeScript types do servidor
│   └── lib/
│       ├── prisma.ts       singleton do Prisma client
│       └── jwt.ts          helpers de token
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## Convenções

- Tudo em português (controladores, serviços, variáveis)
- Controladores: só req/res, sem lógica de negócio
- Serviços: lógica pura, sem req/res, verificação de ownership
- Erros semânticos como strings PT: `'PRESET_NAO_ENCONTRADO'`
- Resposta: `{ dados: ... }` em sucesso, `{ erro: ... }` em falha
- Status HTTP padrão: 201 criação, 204 remoção, 422 validação, 401 não autenticado

---

## Migração de V1 para V2

A `IPerfilStorage` já foi desenhada para isso. Em V2, substituir `LocalStoragePerfilStorage` por `ApiPerfilStorage` zero mudança no restante do código frontend. Esse foi o motivo de abstrair o storage desde o início.

## Ao Concluir Handoff Obrigatório

Registrar em `SESSAO-ATIVA.md` seguindo o formato do `protocolo-handoff`:
- O que foi feito (arquivos criados/modificados)
- O que NÃO foi feito e por quê
- Alertas para o próximo agente
- Se o `contexto-base` precisa atualização quais seções
- **PRÓXIMO AGENTE** com instrução direta

Atualizar `docs/Tasks.md` com status e observações.

Se o `contexto-base` estiver desatualizado, perguntar:
> "O contexto-base precisa ser atualizado nas seções [X]. Posso atualizar agora, ou prefere chamar o documentador-tecnico?"
---
description: "Padrões de segurança e privacidade para agentes de IA: dados pessoais, segredos, storage, logs, URLs, integrações, permissões e critérios bloqueantes."
applyTo: "**/*"
---

# Padrões de Segurança e Privacidade para Agentes de IA

> Este arquivo define regras de **segurança, privacidade e proteção de dados**.
> Ele não substitui padrões de código, revisão, documentação ou tarefas. Ele define o que nunca pode ser ignorado.

## Como este padrão se relaciona com os outros

| Arquivo | Relação |
|---|---|
| `Geral.agent.md` | Segurança e privacidade têm prioridade máxima quando houver conflito. |
| `codigo-react-typescript.agent.md` | Define como isolar storage, services, validação e efeitos colaterais no código. |
| `documentacao.agent.md` | Define onde registrar requisitos, RNFs, ADRs e dívidas relacionadas à segurança. |
| `tarefas.agent.md` | Define como transformar problemas de segurança em tarefas rastreáveis. |
| `revisao.agent.md` | Define como classificar achados de segurança na revisão. |

---

## 1. Princípio central

Segurança e privacidade não são acabamento.

Elas fazem parte do comportamento correto do produto.

Quando houver conflito entre velocidade e segurança, segurança vence.

---

## 2. Prioridade máxima

Problemas de segurança podem bloquear a tarefa mesmo que o código funcione.

Considere bloqueante:

- vazamento de dado pessoal;
- segredo exposto no código;
- dado pessoal em URL;
- log com dado sensível;
- autenticação/autorização fraca;
- storage inseguro para dado sensível;
- integração externa enviando mais dados do que precisa;
- ação destrutiva sem confirmação;
- mudança que reduz privacidade sem aprovação;
- erro que expõe stack trace, token, segredo ou estrutura interna sensível.

---

## 3. O que é dado pessoal

Considere dado pessoal qualquer informação que identifica ou pode ajudar a identificar uma pessoa.

Exemplos:

- nome;
- email;
- telefone;
- CPF/RG;
- endereço;
- CEP quando combinado com outros dados;
- IP;
- geolocalização precisa;
- foto pessoal;
- dados financeiros;
- dados de saúde;
- histórico detalhado de uso;
- identificadores únicos de usuário;
- combinação de dados que permita identificar alguém.

### Dado sensível

Tenha cuidado extra com:

- saúde;
- religião;
- política;
- biometria;
- vida sexual;
- dados financeiros;
- menores de idade;
- geolocalização precisa;
- documentos oficiais;
- credenciais;
- tokens;
- chaves de API.

---

## 4. Segredos e credenciais

Nunca exponha segredos no código.

Segredos incluem:

- API keys;
- tokens;
- senhas;
- private keys;
- refresh tokens;
- connection strings;
- webhooks secretos;
- certificados;
- credenciais de banco;
- secrets de OAuth.

### Regras

- Segredos devem vir de variáveis de ambiente.
- Nunca commitar `.env` real.
- Usar `.env.example` sem valores reais.
- Não imprimir segredos em logs.
- Não enviar segredos para cliente/browser.
- Não colocar segredo em URL.
- Não salvar segredo em `localStorage`.

### Modelo de `.env.example`

```env
VITE_API_URL=
DATABASE_URL=
OPENAI_API_KEY=
```

### Atenção com prefixos

Em projetos Vite, variáveis com prefixo `VITE_` ficam disponíveis no frontend.

Não coloque segredo em variável `VITE_`.

```env
# Errado se for segredo:
VITE_PRIVATE_API_KEY=

# Melhor:
PRIVATE_API_KEY=
```

---

## 5. URLs e query params

Nunca coloque dados pessoais ou sensíveis em URL.

URLs aparecem em:

- histórico do navegador;
- logs de servidor;
- analytics;
- prints;
- referer headers;
- ferramentas de monitoramento.

### Evite

```txt
/login?email=usuario@email.com
/reset?token=abc123
/perfil?cpf=12345678900
```

### Prefira

- body de requisição;
- headers seguros;
- token curto de uso único quando necessário;
- armazenamento temporário no servidor;
- identificadores opacos não sensíveis.

---

## 6. Logs

Logs devem ajudar a depurar sem vazar dados.

### Proibido

```ts
console.log(usuario)
console.log(token)
console.log(payloadCompleto)
console.log(dadosPagamento)
console.log(endereco)
```

### Permitido com cuidado

```ts
console.info('Login iniciado')
console.error('Falha ao salvar perfil', { codigoErro })
```

### Regra

Logs de produção não devem conter:

- tokens;
- senha;
- email completo;
- telefone;
- documento;
- endereço;
- payload completo com dados pessoais;
- headers de autenticação;
- resposta completa de APIs externas.

### Técnica recomendada

Criar logger com sanitização:

```ts
logger.error('Falha ao salvar perfil', {
  codigoErro: erro.codigo,
  userId: mascararId(usuario.id),
})
```

---

## 7. Storage no navegador

Storage no navegador não é cofre.

Cuidado com:

- `localStorage`;
- `sessionStorage`;
- IndexedDB;
- cookies acessíveis por JavaScript;
- cache;
- service workers.

### Regras

- Não acessar storage diretamente em componentes.
- Isolar storage em service próprio.
- Não salvar segredo em `localStorage`.
- Não salvar dado sensível sem necessidade real.
- Fornecer limpeza de dados quando o usuário pedir apagar tudo.
- Definir chaves de storage em um único lugar.
- Versionar estrutura persistida quando necessário.

### Exemplo de organização

```txt
src/services/storage/
├── perfilStorage.ts
├── preferenciasStorage.ts
└── storageKeys.ts
```

### Chaves

```ts
export const STORAGE_KEYS = {
  preferencias: 'app:preferencias:v1',
  perfil: 'app:perfil:v1',
} as const
```

---

## 8. Cookies

Quando usar cookies para sessão/autenticação, prefira:

```txt
HttpOnly
Secure
SameSite=Lax ou Strict
```

### Regras

- Token de sessão não deve ficar acessível via JavaScript se puder ser cookie `HttpOnly`.
- Cookie de autenticação deve usar `Secure` em produção.
- Usar `SameSite` para reduzir risco de CSRF.
- Definir expiração apropriada.
- Evitar cookies permanentes sem necessidade.

---

## 9. Autenticação e autorização

Autenticação responde: quem é o usuário?

Autorização responde: o que ele pode fazer?

### Regras

- Não confie apenas no frontend para proteger recurso.
- Toda autorização real deve ser validada no backend.
- Rotas protegidas no frontend melhoram UX, mas não são barreira de segurança.
- Não exponha dados de outros usuários por confiar em ID vindo do cliente.
- Verifique ownership no servidor.

### Exemplo de risco

```txt
GET /api/pedidos/123
```

O backend deve validar se o pedido `123` pertence ao usuário autenticado.

---

## 10. Validação de dados

Valide dados nas bordas do sistema.

### Frontend

- melhora UX;
- evita erro básico;
- dá feedback rápido.

### Backend

- é obrigatório;
- protege regra real;
- não deve confiar no frontend.

### Recomendado

Usar schema de validação:

- Zod;
- Valibot;
- Yup;
- validação nativa do framework.

Exemplo:

```ts
const CriarUsuarioSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
})
```

---

## 11. Sanitização e XSS

Nunca renderize HTML externo sem sanitizar.

### Evite

```tsx
<div dangerouslySetInnerHTML={{ __html: conteudoDoUsuario }} />
```

### Se for inevitável

- sanitize o HTML;
- limite tags permitidas;
- remova scripts/event handlers;
- documente o motivo;
- revise como bloqueante de segurança.

### Regras

- Texto de usuário deve ser tratado como texto.
- HTML de usuário deve ser considerado perigoso.
- Markdown externo deve ser sanitizado antes de renderizar como HTML.

---

## 12. Uploads e arquivos

Uploads podem conter riscos.

### Verifique

- tamanho máximo;
- tipo MIME;
- extensão;
- conteúdo real quando possível;
- nome do arquivo;
- armazenamento;
- permissões de acesso;
- expiração;
- antivírus/sandbox quando aplicável.

### Regras

- Não confiar apenas na extensão.
- Não usar nome original diretamente como caminho.
- Não permitir path traversal.
- Não expor upload privado por URL pública previsível.

Exemplo de risco:

```txt
../../.env
```

---

## 13. Integrações externas

Envie apenas o necessário.

Antes de chamar serviço externo, pergunte:

- quais dados serão enviados?
- esses dados são pessoais?
- é necessário enviar tudo?
- existe consentimento?
- o serviço precisa armazenar?
- há alternativa local?
- precisa documentar em requisito ou política?

### Regras

- Não enviar payload completo sem necessidade.
- Não enviar segredo do usuário para terceiros sem motivo claro.
- Não expor chaves privadas no frontend.
- Registrar integração importante em arquitetura/ADR quando afetar o sistema.

---

## 14. Dependências

Dependências aumentam superfície de risco.

Antes de instalar:

- há necessidade real?
- a biblioteca é mantida?
- é popular/confiável?
- tem muitas dependências transitivas?
- roda no frontend ou backend?
- acessa rede, filesystem ou dados sensíveis?
- existe alternativa nativa?

### Regra

Instalar dependência nova exige aprovação quando:

- muda build;
- muda arquitetura;
- afeta segurança;
- adiciona integração externa;
- é usada em produção;
- tem acesso a dados sensíveis.

---

## 15. Erros e mensagens para usuário

Mensagens de erro não devem vazar detalhes internos.

### Evite mostrar ao usuário

```txt
PrismaClientKnownRequestError
JWT_SECRET invalid
Database connection string failed
Stack trace...
```

### Prefira

```txt
Não foi possível concluir a ação agora. Tente novamente.
```

### Para logs internos

Registre código de erro e contexto mínimo, sem dados sensíveis.

---

## 16. Ambiente de desenvolvimento vs produção

Não deixe dados de desenvolvimento vazarem para produção.

Verifique:

- fixtures;
- mocks;
- usuários fake;
- tokens de teste;
- URLs de staging;
- logs verbosos;
- debug mode;
- source maps públicos quando isso for sensível;
- flags experimentais.

### Checklist

```md
- [ ] Build de produção não carrega fixtures.
- [ ] Logs de debug estão desativados.
- [ ] `.env` real não foi commitado.
- [ ] Chaves de teste não foram usadas em produção.
- [ ] URLs de API estão corretas.
```

---

## 17. Ações destrutivas

Ações destrutivas exigem confirmação clara.

Exemplos:

- deletar conta;
- apagar dados;
- remover arquivos;
- resetar banco;
- limpar storage;
- sobrescrever configuração;
- arquivar documentos antigos;
- migrar dados.

### Regra

Antes de ação destrutiva:

1. explique o que será afetado;
2. diga se é reversível;
3. peça confirmação explícita;
4. registre a decisão quando for relevante.

---

## 18. Privacidade por design

Use minimização de dados.

Pergunte:

- eu preciso coletar isso?
- preciso guardar isso?
- por quanto tempo?
- quem acessa?
- dá para anonimizar?
- dá para agregar?
- dá para processar localmente?
- o usuário consegue apagar?

### Regra prática

Se o produto funciona sem determinado dado pessoal, não colete.

---

## 19. Teste do dispositivo emprestado

Use este teste mental:

> Se o usuário emprestar o dispositivo por 5 minutos, outra pessoa consegue ver algo que ele não gostaria?

Se sim, há risco de privacidade.

Possíveis soluções:

- ocultar dados sensíveis;
- pedir reautenticação;
- limpar sessão;
- evitar persistência local;
- reduzir informações na tela;
- adicionar modo privado.

---

## 20. Segurança em UI

Cuidado com interface que induz erro.

Verifique:

- ação destrutiva tem confirmação;
- botão perigoso tem estilo diferente;
- usuário entende consequência;
- mensagens não revelam dado sensível;
- estados de loading evitam duplo envio;
- permissões negadas são tratadas;
- tela não pisca dado privado antes de redirecionar.

---

## 21. Requisitos não-funcionais de segurança

Quando uma regra de segurança fizer parte do produto, registre em:

```txt
docs/requisitos/nao-funcionais.md
```

Exemplos:

```md
| RNF-SEG-001 | Dados pessoais não podem aparecer em URLs. | 0 ocorrência em rotas/query params | [ ] | - | - |
| RNF-SEG-002 | Storage local deve ser acessado apenas por services. | Nenhum acesso direto em componentes | [ ] | - | ADR-001 |
```

Se a decisão for arquitetural, crie/proponha ADR em:

```txt
docs/arquitetura/ADR/
```

---

## 22. Quando gerar tarefa de segurança

Crie tarefa quando encontrar:

- bug de autorização;
- vazamento de dados;
- storage inseguro;
- log sensível;
- falta de limpeza de dados;
- falta de validação no backend;
- dependência suspeita;
- fluxo destrutivo sem confirmação;
- ausência de requisito para regra de segurança importante.

Exemplos:

```md
- BG-SEG-001: Remover email de query params no fluxo de login.
- RNF-SEG-002: Exigir limpeza completa de storage ao apagar dados.
- REF-SEG-003: Isolar acesso ao localStorage em `preferenciasStorage.ts`.
```

---

## 23. Checklist bloqueante

Antes de aprovar tarefa que toca dados, autenticação, storage, API ou integração:

```md
- [ ] Nenhum segredo foi exposto.
- [ ] Nenhum dado pessoal foi colocado em URL.
- [ ] Nenhum dado sensível aparece em logs.
- [ ] Storage local é realmente necessário.
- [ ] Storage é acessado por service, não por componente.
- [ ] Existe forma de limpar dados locais quando necessário.
- [ ] Backend valida dados críticos.
- [ ] Backend valida autorização/ownership.
- [ ] Integração externa recebe apenas dados necessários.
- [ ] Erros não expõem stack trace ou segredo.
- [ ] Ações destrutivas exigem confirmação.
- [ ] Dependências novas foram aprovadas.
```

---

## 24. Anti-padrões

Evite:

- salvar token sensível em `localStorage`;
- colocar email/CPF/token em query param;
- logar objeto de usuário inteiro;
- confiar no frontend para autorização;
- instalar lib sem verificar necessidade;
- usar `dangerouslySetInnerHTML` sem sanitização;
- expor chave privada em variável `VITE_`;
- deixar fixtures no build de produção;
- mostrar stack trace ao usuário;
- apagar dados sem confirmação;
- coletar dado pessoal “só por precaução”.

---

## 25. Regra final

Segurança boa não depende de lembrar depois.

Ela é desenhada no fluxo, no código, na documentação, nos testes e na revisão.

Se uma decisão pode expor dados, quebrar privacidade ou permitir acesso indevido, trate como parte central da tarefa, não como detalhe.

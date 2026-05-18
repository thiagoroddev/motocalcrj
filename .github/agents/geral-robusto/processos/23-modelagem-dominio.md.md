---

description: "Modelagem de domínio com DDD tático: entidade, value object, aggregate, invariante, linguagem ubíqua. Quando aplicar e como." modulo: "23" categoria: "processos" versao: "1.0" relacionado:

- "11-arquitetura-e-pastas.md"
- "14-formularios-e-validacao.md"
- "17-backend-node.md"

---

# 🧬 Modelagem de Domínio

> Modelagem é onde a maioria dos desenvolvedores junior patina e os sênior se diferenciam. A diferença não está em sintaxe — está em **como você representa o problema do mundo real** no código.

---

## 1. O Que É DDD Tático

DDD (Domain-Driven Design) tem duas camadas:

|DDD Estratégico|DDD Tático|
|---|---|
|Bounded contexts, context maps|Entidades, value objects, aggregates|
|Organização de equipes, microservices|Como modelar **dentro** de um contexto|
|Para sistemas grandes/empresariais|**Aplicável em monolito pequeno**|

**Este módulo trata só do tático.** Para projeto solo ou pequeno, é o que tem retorno imediato.

### 1.1 Por Que Aprender Tático

- **Reduz bugs estruturais.** Estado inválido se torna impossível no código
- **Acelera mudanças.** Regras mudam num lugar só, não em 20 arquivos
- **Documenta vivo.** Tipos do código viram glossário executável
- **Linguagem com stakeholders.** Você fala "Pedido" e ele entende a mesma coisa

### 1.2 O Que Tático NÃO É

- Não é "OOP raiz com Java em mente"
- Não é "arquitetura hexagonal obrigatória"
- Não é "todo CRUD merece"
- Não é "padrão a aplicar sem pensar"

É um **conjunto de ferramentas de modelagem**. Use as que servem para seu caso.

---

## 2. Quando Aplicar (e Quando NÃO Vale)

### 2.1 Aplica Quando

|Sinal|Por quê|
|---|---|
|Domínio tem **regras complexas** ("se A e B, mas não C, então...")|DDD organiza essas regras|
|**Vocabulário próprio** que stakeholders usam ("aluguel", "apólice", "habilitação")|Modelar essa linguagem evita confusão|
|Estado tem **invariantes** que nunca podem ser violadas|DDD permite codificar invariantes|
|Mesmo conceito aparece em vários lugares com lógica relacionada|Centralizar no domínio reduz duplicação|
|Projeto vai durar anos com regras evoluindo|Domínio bem-modelado sobrevive a refactor de tecnologia|

### 2.2 Não Vale Quando

|Sinal|Por quê|
|---|---|
|App é CRUD simples sobre tabelas planas|Overhead sem benefício|
|Domínio tem 3-5 conceitos muito simples|Pode ser só `type` em vez de classe|
|Time/projeto não vai existir em 6 meses|Não vale o investimento|
|Você nunca aplicou DDD antes em projeto real|Comece com 1-2 entidades, não modele tudo|

### 2.3 Como Decidir

Pergunta-teste: _"se eu trocar PostgreSQL por MongoDB amanhã, quanto do meu código-domínio precisa mudar?"_

- **Pouco/nada:** seu domínio está bem isolado. DDD ajudou
- **Muito:** seu código é orientado ao banco, não ao domínio. DDD teria ajudado se você tivesse aplicado

---

## 3. Linguagem Ubíqua — O Conceito Mais Importante

> **Cada termo do negócio tem UM significado único em código, conversa, documentação e UI.**

Soa simples. Não é.

### 3.1 O Problema Sem Linguagem Ubíqua

Cenário comum num projeto de e-commerce:

- Stakeholder diz "Pedido" pensando em "carrinho ainda não confirmado"
- Dev1 chama de "Order" no código (e o que stakeholder chama de "Pedido confirmado" virou "ConfirmedOrder")
- Dev2 chama de "Cart" no banco
- Atendente chama de "Compra" no painel admin
- Marketing chama de "Conversão" em relatórios

Resultado: ninguém entende ninguém. Bugs nascem da tradução constante entre vocabulários paralelos.

### 3.2 A Solução

**Um termo. Um significado. Em todo lugar.**

```typescript
// Glossário: "Pedido = solicitação de compra feita pelo cliente, antes ou depois da confirmação"
// Estado é atributo do Pedido, não termo separado

type Pedido = {
  id: string
  itens: ItemPedido[]
  estado: 'rascunho' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado'
  // ...
}
```

Agora "Pedido em estado rascunho" é "Pedido"; "Pedido confirmado" é "Pedido". Mesmo conceito, diferentes estados.

### 3.3 Como Construir e Manter

1. **Glossário em `docs/dominios/glossario.md`** — definição única por termo
2. **Termos proibidos listados** — `order`, `compra`, `cart` viram sinônimos a evitar
3. **Code review verifica** — se aparece "order" em revisão, é flag
4. **Documentação usa os mesmos termos** — sem traduções

### 3.4 Quando Linguagem Muda

Negócios evoluem. Termos mudam. Quando isso acontece:

1. **Atualize o glossário primeiro**
2. **Refatore o código** para usar o novo termo (Standard ou Strict, dependendo do impacto)
3. **Comunique** stakeholders sobre a mudança

Mudança parcial gera **dois vocabulários no mesmo projeto** — o que é exatamente o problema que linguagem ubíqua resolve.

---

## 4. Toolkit Conceitual

DDD tático tem cinco conceitos centrais:

|Conceito|Definição curta|
|---|---|
|**Entidade**|Tem identidade única, persiste no tempo|
|**Value Object**|Definido pelo valor, imutável, sem ID|
|**Aggregate**|Conjunto tratado como unidade, com uma raiz|
|**Invariante**|Regra que **nunca** pode ser violada|
|**Domain Event**|Algo que aconteceu no domínio|

Vou detalhar cada um.

### 4.1 Entidade

> **Algo com identidade própria que persiste e muda ao longo do tempo.**

```typescript
type Pedido = {
  id: string                    // identidade — única para sempre
  cliente: string
  itens: ItemPedido[]
  total: number
  estado: EstadoPedido
  criadoEm: Date
}
```

**Características:**

- Tem `id` único e imutável
- Dois pedidos com mesmo `cliente` e mesmos `itens` são **diferentes** se têm `id`s diferentes
- O mesmo pedido continua sendo o mesmo se seus atributos mudarem (estado, total)

**Sinais de que algo é entidade:**

- Tem identidade que existe além dos atributos
- Você consulta por ID
- Persiste em banco com chave primária
- Tem ciclo de vida (criada, modificada, talvez deletada)

### 4.2 Value Object

> **Algo definido pelo seu valor, sem identidade própria.**

```typescript
type Endereco = {
  rua: string
  numero: string
  cidade: string
  cep: string
}
```

**Características:**

- Não tem `id`
- Imutável (mudar = criar novo)
- Dois endereços com mesmos atributos **são o mesmo endereço** conceitualmente
- Não tem ciclo de vida próprio (vive como atributo de uma entidade)

**Sinais de que algo é VO:**

- Você compara por valor (`enderecoA === enderecoB` se atributos iguais)
- Não faz sentido ter "histórico de mudanças" — você substitui por outro
- Não persiste com chave primária própria (vive embutido)

### 4.3 Distinção Crítica: Entidade vs Value Object

Mesmo conceito pode ser entidade **ou** VO dependendo do contexto:

|Conceito|Entidade quando...|Value Object quando...|
|---|---|---|
|Endereço|Sistema de logística rastreia endereços (precisa ID)|Endereço de entrega de um pedido (vive no pedido)|
|Dinheiro|Sistema bancário (cada conta é entidade)|Valor monetário em transação (é só montante + moeda)|
|Nome|Sistema de identificação biométrica (precisa registro próprio)|Nome de uma pessoa (atributo dela)|

**Como decidir:** pergunte se faz sentido **rastrear o histórico** desse objeto. Se sim, é entidade. Se não, VO.

### 4.4 Aggregate

> **Um conjunto de objetos relacionados tratado como unidade, com uma "raiz" (Aggregate Root) que é a porta de entrada.**

```typescript
// Pedido é a raiz do aggregate
type Pedido = {
  id: string
  itens: ItemPedido[]      // VOs dentro do aggregate
  cliente: string          // referência a outro aggregate por ID
  enderecoEntrega: Endereco
}

type ItemPedido = {        // VO dentro do aggregate Pedido
  produtoId: string
  quantidade: number
  precoUnitario: number
}
```

**Regras do aggregate:**

1. **Acesso externo só pela raiz.** Você nunca pega `ItemPedido` diretamente — sempre via `Pedido`
2. **Invariantes garantidas dentro do aggregate.** A raiz garante consistência
3. **Referências entre aggregates por ID, não por objeto.** `Pedido` referencia `cliente` por ID, não embute o objeto Cliente
4. **Transação opera em um aggregate por vez.** Salvar `Pedido` não atualiza `Cliente` simultaneamente

### 4.5 Invariante

> **Uma regra que NUNCA pode ser violada, em nenhum momento.**

Exemplos:

|Invariante|Exemplo|
|---|---|
|Pedido tem pelo menos 1 item|Pedido vazio é estado inválido|
|Total >= 0|Total negativo é estado inválido|
|Data de entrega >= data do pedido|Sequência temporal|
|CPF é válido (11 dígitos + dígito verificador)|Formato|
|Senha tem ao menos 8 caracteres|Política|

### 4.6 Como Codificar Invariantes

A regra de ouro: **estado inválido deve ser impossível de existir no código**.

```typescript
// ❌ Invariante validada "depois"
class Pedido {
  itens: ItemPedido[] = []  // pode ser vazio em algum momento

  adicionarItem(item: ItemPedido) {
    this.itens.push(item)
  }
}
// Em algum ponto pode ter `pedido.itens.length === 0` (inválido)

// ✅ Invariante impossível de violar
class Pedido {
  private constructor(
    public readonly id: string,
    public readonly itens: readonly ItemPedido[]
  ) {}

  static criar(id: string, itens: ItemPedido[]): Pedido {
    if (itens.length === 0) {
      throw new InvariantError('Pedido deve ter ao menos 1 item')
    }
    return new Pedido(id, itens)
  }

  adicionarItem(item: ItemPedido): Pedido {
    return new Pedido(this.id, [...this.itens, item])  // imutável
  }
}
// Não há Pedido com itens vazios. A invariante é estrutural.
```

### 4.7 Domain Event

> **Algo significativo que aconteceu no domínio.**

```typescript
type PedidoConfirmado = {
  tipo: 'PedidoConfirmado'
  pedidoId: string
  clienteId: string
  total: number
  ocorrido_em: Date
}
```

**Características:**

- Nome no **passado** (`PedidoConfirmado`, não `ConfirmarPedido`)
- Imutável depois de criado (já aconteceu)
- Outros componentes podem reagir (enviar email, atualizar estoque)

**Para projeto simples, eventos são opcionais.** Comece com entidades + VOs + invariantes. Eventos entram quando você precisa **desacoplar** reações.

---

## 5. Processo de Modelagem

Cinco passos:

### 5.1 Identificar Conceitos

Leia os requisitos e liste os conceitos que aparecem.

**Exemplo: app de aluguel de carros**

Conceitos brutos: Cliente, CNH, Carro, Modelo, Categoria, Aluguel, Pagamento, Apólice, Endereço, Período, Valor...

### 5.2 Classificar Cada Conceito

Para cada conceito, decida: **Entidade, Value Object, ou parte de Aggregate**.

|Conceito|Tipo|Justificativa|
|---|---|---|
|Cliente|Entidade|Tem ID, persiste, evolui (mudou endereço, mudou CNH)|
|CNH|Value Object|Atributo do Cliente. Se mudar, é outro CNH|
|Carro|Entidade|Tem placa única, persiste, tem histórico|
|Modelo|Value Object|"Civic 2024" — não tem identidade própria|
|Aluguel|Entidade (raiz de aggregate)|Tem ID, contém Carro, Cliente, Período|
|Pagamento|Entidade dentro do aggregate Aluguel|Tem ID, mas só faz sentido dentro de um Aluguel|
|Período|Value Object|`{ inicio, fim }` — sem identidade|
|Endereço|Value Object|Atributo do Cliente|
|Valor|Value Object|`{ montante, moeda }`|

### 5.3 Listar Invariantes

Para cada entidade, escreva o que **nunca** pode ser falso.

```markdown
# Invariantes do Aluguel
- período.fim > período.inicio
- valor.montante >= 0
- pagamento.total <= aluguel.valor.montante
- aluguel.cliente deve ter CNH válida na data de início
- estado segue máquina: rascunho → confirmado → em_andamento → finalizado | cancelado
```

### 5.4 Desenhar Relacionamentos

Mapeie quem se relaciona com quem e como.

```
Cliente ────┐
            │
            ▼
        Aluguel ────────► Carro
            │
            ├─► Período (VO)
            ├─► Endereço de retirada (VO)
            ├─► Pagamento (entidade interna)
            └─► Apólice (VO ou entidade?)
```

**Decisões a tomar:**

- O que é raiz de aggregate? (Aluguel)
- O que vive dentro? (Período, Pagamento)
- O que é referência externa? (Cliente, Carro — referência por ID)

### 5.5 Validar Contra Cenários

Pegue cenários reais e veja se o modelo aguenta:

- "Cliente com 2 aluguéis simultâneos" → modelo permite?
- "Aluguel sem CNH válida" → invariante pega antes de criar?
- "Pagamento parcial" → modelo de Pagamento aceita?
- "Cancelamento depois de iniciado" → máquina de estado prevê?

Se algum cenário **não cabe**, o modelo está incompleto. Itere.

---

## 6. Representando em TypeScript

Você não precisa de classes ao estilo Java. TypeScript tem ferramentas que casam bem com DDD.

### 6.1 Usando Zod para Tipos + Validação

```typescript
import { z } from 'zod'

// Value Objects (schemas + tipos derivados)
const periodoSchema = z.object({
  inicio: z.date(),
  fim: z.date(),
}).refine(p => p.fim > p.inicio, {
  message: 'Período: fim deve ser depois de início',
})
type Periodo = z.infer<typeof periodoSchema>

const valorSchema = z.object({
  montante: z.number().nonnegative('Valor não pode ser negativo'),
  moeda: z.enum(['BRL', 'USD', 'EUR']),
})
type Valor = z.infer<typeof valorSchema>

// Entidade
const aluguelSchema = z.object({
  id: z.string().uuid(),
  clienteId: z.string().uuid(),
  carroId: z.string().uuid(),
  periodo: periodoSchema,
  valor: valorSchema,
  estado: z.enum(['rascunho', 'confirmado', 'em_andamento', 'finalizado', 'cancelado']),
  criadoEm: z.date(),
})
type Aluguel = z.infer<typeof aluguelSchema>
```

Cada invariante de formato/valor entra como `.refine()` no Zod.

### 6.2 Funções de Comportamento

Comportamento mora junto com os dados. Mas em TypeScript funcional, não precisam ser métodos de classe — podem ser funções que operam sobre o tipo.

```typescript
// src/dominios/aluguel/aluguelService.ts ou aluguelDominio.ts
import type { Aluguel, Valor } from './tipos'

export function calcularValorTotal(aluguel: Aluguel): Valor {
  // lógica do domínio
}

export function podeSerCancelado(aluguel: Aluguel): boolean {
  return aluguel.estado === 'rascunho' || aluguel.estado === 'confirmado'
}

export function confirmar(aluguel: Aluguel): Aluguel {
  if (aluguel.estado !== 'rascunho') {
    throw new InvariantError('Apenas aluguéis em rascunho podem ser confirmados')
  }
  return { ...aluguel, estado: 'confirmado' }
}
```

**Observe:**

- Funções **puras**, sem `this`
- Recebem entidade, devolvem nova entidade (imutabilidade)
- Invariantes verificadas antes de qualquer mutação
- Sem dependência de infra (DB, HTTP) — domínio puro

### 6.3 Smart Constructors

Para entidades complexas, encapsule a criação em função dedicada:

```typescript
export function criarAluguel(dados: DadosCriarAluguel): Aluguel {
  // Valida invariantes de criação
  if (dados.periodo.fim <= dados.periodo.inicio) {
    throw new InvariantError('Período inválido')
  }

  // Calcula derivações
  const valor = calcularValorBase(dados.carroId, dados.periodo)

  return {
    id: crypto.randomUUID(),
    clienteId: dados.clienteId,
    carroId: dados.carroId,
    periodo: dados.periodo,
    valor,
    estado: 'rascunho',
    criadoEm: new Date(),
  }
}
```

Quem cria Aluguel chama `criarAluguel()` — não constrói o objeto manualmente. Garante que toda Aluguel passa pelas validações.

### 6.4 Alternativa: Mesma Modelagem em Classe

O mesmo Aluguel pode ser modelado em estilo OOP tradicional. Os conceitos de DDD são idênticos — muda apenas a sintaxe.

```typescript
// src/dominio/aluguel/Aluguel.ts
import { InvariantError } from '@/errors'
import type { Periodo, Valor, EstadoAluguel } from './tipos'

export class Aluguel {
  // Construtor privado força uso de smart constructor
  private constructor(
    public readonly id: string,
    public readonly clienteId: string,
    public readonly carroId: string,
    public readonly periodo: Periodo,
    public readonly valor: Valor,
    public readonly estado: EstadoAluguel,
    public readonly criadoEm: Date,
  ) {}

  // Smart constructor com validação de invariantes
  static criar(dados: {
    clienteId: string
    carroId: string
    periodo: Periodo
    valor: Valor
  }): Aluguel {
    if (dados.periodo.fim <= dados.periodo.inicio) {
      throw new InvariantError('Período: fim deve ser depois de início')
    }
    if (dados.valor.montante < 0) {
      throw new InvariantError('Valor não pode ser negativo')
    }

    return new Aluguel(
      crypto.randomUUID(),
      dados.clienteId,
      dados.carroId,
      dados.periodo,
      dados.valor,
      'rascunho',
      new Date(),
    )
  }

  // Reconstrutor: para criar a partir de dados persistidos (sem revalidar)
  static reconstituir(dados: AluguelData): Aluguel {
    return new Aluguel(
      dados.id,
      dados.clienteId,
      dados.carroId,
      dados.periodo,
      dados.valor,
      dados.estado,
      dados.criadoEm,
    )
  }

  // Comportamento: transição de estado com validação
  confirmar(): Aluguel {
    if (this.estado !== 'rascunho') {
      throw new InvariantError(
        `Aluguel em estado ${this.estado} não pode ser confirmado`
      )
    }
    return new Aluguel(
      this.id,
      this.clienteId,
      this.carroId,
      this.periodo,
      this.valor,
      'confirmado',
      this.criadoEm,
    )
  }

  podeSerCancelado(): boolean {
    return this.estado === 'rascunho' || this.estado === 'confirmado'
  }
}
```

### 6.5 Comparação: Quando Usar Cada Estilo

Os dois estilos atendem o mesmo objetivo de DDD (modelo rico, invariantes garantidas, imutabilidade). A escolha é de **estilo**, não de **substância**.

|Critério|Estilo funcional (6.2)|Estilo classe (6.4)|
|---|---|---|
|**Verbosidade**|Menos código|Mais código (construtor, getters)|
|**Familiaridade**|Casa com React/TS modernos|Familiar para quem vem de Java/C#|
|**Tipo Zod / serialização**|`z.infer` direto vira o tipo|Precisa separar tipo de dados (`AluguelData`) da classe|
|**Composição com React**|Funções entram naturalmente em hooks|Classes em React exigem cuidado (não memo, não JSON-serializa direto)|
|**Encapsulamento**|Confiança em convenção|Forçado pelo `private`|
|**Curva de aprendizado**|Mais leve para iniciantes em React|Mais leve para quem vem de OOP|

**Recomendação prática:**

|Situação|Sugestão|
|---|---|
|Projeto React/Next + Zod|**Funcional** — casa com o resto do código|
|Backend Node puro|**Qualquer um** — preferência do time|
|Domínio muito complexo com muitos invariantes|**Classe** — encapsulamento ajuda|
|Time vem de Java/C#|**Classe** — menor atrito de aprendizado|
|Time vem de JS moderno|**Funcional** — idiomático|

**Você não precisa escolher para sempre.** Pode usar funcional em entidades simples e classe em entidades complexas, no mesmo projeto. **Só não misture os dois estilos na mesma entidade** — escolha uma representação por entidade.

---

## 7. Modelo Anêmico vs Rico

### 7.1 Anti-Padrão: Modelo Anêmico

Modelo anêmico = entidade só com dados + getters/setters. Comportamento espalhado em "services" externos.

```typescript
// ❌ Anêmico
type Aluguel = {
  estado: 'rascunho' | 'confirmado' | 'em_andamento' | 'finalizado'
}

// Lógica em serviço externo
const aluguelService = {
  confirmar(aluguel: Aluguel) {
    // 50 linhas de validação espalhadas
    if (aluguel.estado !== 'rascunho') return false
    aluguel.estado = 'confirmado'  // mutação direta
    return true
  },
}
```

**Por que é ruim:**

- Estado e validação ficam separados — invariante pode ser violada manualmente
- Outras partes do código podem mudar `aluguel.estado` direto, ignorando regras
- Difícil rastrear quem pode fazer o quê

### 7.2 Modelo Rico

Comportamento mora **junto** com os dados. Validações no momento da transição.

```typescript
// ✅ Modelo rico (com funções puras)
import type { Aluguel } from './tipos'

export function confirmar(aluguel: Aluguel): Aluguel {
  if (aluguel.estado !== 'rascunho') {
    throw new InvariantError(
      `Aluguel em estado ${aluguel.estado} não pode ser confirmado`
    )
  }
  return { ...aluguel, estado: 'confirmado' }
}
```

Quem quer confirmar **precisa** chamar essa função. A invariante é garantida.

### 7.3 Por Que "Rico" Não Precisa de Classe

Em OOP tradicional, modelo rico = classe com métodos. Em TS funcional, é **função pura sobre o tipo**.

```typescript
// Equivalente em OOP (ver seção 6.4 para versão completa)
class Aluguel {
  confirmar(): Aluguel { /* ... */ }
}

// Equivalente em TS funcional
function confirmar(aluguel: Aluguel): Aluguel { /* ... */ }
```

Os dois são "ricos" — o comportamento vive próximo dos dados. A diferença é estilo, não conceito. Veja a comparação detalhada em [6.5](https://claude.ai/chat/7ad9cd8a-fc76-4046-a5d6-651d4752358b#65-compara%C3%A7%C3%A3o-quando-usar-cada-estilo).

---

## 8. Onde a Modelagem Mora

A estrutura de pastas do módulo 11 já prevê. Detalhando:

### 8.1 Tipos do Domínio

```
src/types/
├── aluguel.ts           # tipos do aggregate Aluguel + VOs internos
├── cliente.ts
└── carro.ts
```

Tipos puros, sem lógica.

### 8.2 Funções do Domínio

Duas opções estruturais válidas:

**Opção A: junto com `services/` (mais simples)**

```
src/services/
├── aluguelService.ts    # tem funções de domínio + integração com banco
```

**Opção B: pasta dedicada `dominio/` (mais separação)**

```
src/dominio/
├── aluguel/
│   ├── tipos.ts
│   ├── aluguelDominio.ts    # funções puras do domínio
│   └── aluguelRepository.ts # acesso a dados
```

Para projeto pequeno, Opção A. Para domínio complexo com várias funções, Opção B.

### 8.3 Documentação

```
docs/dominios/
├── glossario.md           # linguagem ubíqua
├── invariantes.md         # regras invioláveis
└── modelagem/
    ├── aluguel.md         # documentação do aggregate Aluguel
    ├── cliente.md
    └── carro.md
```

Cada arquivo de modelagem descreve uma entidade/aggregate em prosa, não em código (o código está em `src/`).

---

## 9. Exemplo Prático Completo

Vou modelar uma feature simples: **avaliação de produto** num e-commerce.

### 9.1 Requisitos

> "Cliente pode avaliar produto que comprou. Avaliação tem nota de 1-5 estrelas e comentário opcional. Cliente só pode avaliar uma vez por produto. Não pode editar depois de 7 dias da criação."

### 9.2 Identificar Conceitos

- Avaliação, Produto, Cliente, Compra, Nota, Comentário, Estrela

### 9.3 Classificar

|Conceito|Tipo|Justificativa|
|---|---|---|
|Avaliação|Entidade (raiz)|Tem ID, persiste, pode editar (com regras)|
|Produto|Entidade (outro aggregate)|Referência por ID|
|Cliente|Entidade (outro aggregate)|Referência por ID|
|Nota|Value Object|Número de 1-5, sem identidade|
|Comentário|Value Object|Texto opcional|

### 9.4 Listar Invariantes

```markdown
# Invariantes da Avaliação
- INV-AVAL-01: nota é número inteiro entre 1 e 5
- INV-AVAL-02: comentário tem no máximo 1000 caracteres
- INV-AVAL-03: cliente só tem 1 avaliação por produto
- INV-AVAL-04: cliente deve ter comprado o produto antes de avaliar
- INV-AVAL-05: edição permitida até 7 dias após criação
```

### 9.5 Modelar em TypeScript

```typescript
// src/types/avaliacao.ts
import { z } from 'zod'

const notaSchema = z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5')
type Nota = z.infer<typeof notaSchema>

const comentarioSchema = z.string().max(1000).optional()
type Comentario = z.infer<typeof comentarioSchema>

const avaliacaoSchema = z.object({
  id: z.string().uuid(),
  clienteId: z.string().uuid(),
  produtoId: z.string().uuid(),
  nota: notaSchema,
  comentario: comentarioSchema,
  criadaEm: z.date(),
  editadaEm: z.date().optional(),
})
type Avaliacao = z.infer<typeof avaliacaoSchema>
```

### 9.6 Funções de Domínio

```typescript
// src/dominio/avaliacao/avaliacaoDominio.ts
import { addDays, isAfter } from 'date-fns'
import { InvariantError } from '@/errors'
import type { Avaliacao, Nota, Comentario } from '@/types/avaliacao'

const DIAS_LIMITE_EDICAO = 7

export function criarAvaliacao(dados: {
  clienteId: string
  produtoId: string
  nota: Nota
  comentario?: Comentario
}): Avaliacao {
  return {
    id: crypto.randomUUID(),
    clienteId: dados.clienteId,
    produtoId: dados.produtoId,
    nota: dados.nota,
    comentario: dados.comentario,
    criadaEm: new Date(),
  }
}

export function podeSerEditada(avaliacao: Avaliacao, agora: Date = new Date()): boolean {
  const limite = addDays(avaliacao.criadaEm, DIAS_LIMITE_EDICAO)
  return !isAfter(agora, limite)
}

export function editarAvaliacao(
  avaliacao: Avaliacao,
  mudancas: { nota?: Nota; comentario?: Comentario }
): Avaliacao {
  if (!podeSerEditada(avaliacao)) {
    throw new InvariantError(
      `Avaliação não pode ser editada após ${DIAS_LIMITE_EDICAO} dias`
    )
  }

  return {
    ...avaliacao,
    nota: mudancas.nota ?? avaliacao.nota,
    comentario: mudancas.comentario ?? avaliacao.comentario,
    editadaEm: new Date(),
  }
}
```

### 9.7 Validações que Ficam Fora do Domínio

Algumas invariantes não cabem dentro da função pura:

- **INV-AVAL-03 (1 avaliação por produto):** precisa consultar banco. Vai no service/repository.
- **INV-AVAL-04 (cliente comprou):** precisa cruzar com Pedidos. Vai no service.

Essas vivem em camada acima do domínio puro:

```typescript
// src/services/avaliacaoService.ts
export async function criarAvaliacaoComValidacoes(dados) {
  // Invariante 03
  const jaExiste = await avaliacaoRepo.existePor(dados.clienteId, dados.produtoId)
  if (jaExiste) {
    throw new ConflitoError('Você já avaliou este produto')
  }

  // Invariante 04
  const comprou = await pedidoRepo.clienteComprou(dados.clienteId, dados.produtoId)
  if (!comprou) {
    throw new InvariantError('Apenas quem comprou pode avaliar')
  }

  // Cria via função pura do domínio
  const avaliacao = criarAvaliacao(dados)

  // Persiste
  await avaliacaoRepo.salvar(avaliacao)

  return avaliacao
}
```

**Domínio puro** valida o que pode validar isoladamente (formato, regras intrínsecas). **Service** orquestra validações que dependem de dados externos.

---

## 10. Anti-Padrões

|Anti-padrão|Sintoma|Conserto|
|---|---|---|
|**Modelo anêmico**|Tipos só com dados, lógica espalhada|Comportamento junto com dados (funções puras)|
|**Categorização forçada**|Tudo vira "Entity" mesmo coisas simples|Use VO ou só `type` quando bastar|
|**Domínio inflado**|Campo `observacao: string` virou entidade `Observacao`|Mantenha simples — entidade só quando tem identidade|
|**Aggregate gigante**|Pedido contém Cliente embutido, com endereços, com histórico...|Aggregates pequenos, referenciar outros por ID|
|**Vazamento de infra no domínio**|Função de domínio chama `prisma.X` direto|Domínio puro, infra em service/repository|
|**Sem invariantes documentadas**|Regras existem só na cabeça do dev|`docs/dominios/invariantes.md`|
|**Linguagem inconsistente**|Cada parte do código usa um termo diferente|Glossário + revisão|
|**Modelar antes de entender**|DDD aplicado em domínio que ainda não conheceu|Comece simples; modele quando entender|

---

## 11. Quando Pausar e Pedir Ajuda

Modelagem é arte que vem com prática. Sinais de que vale pausar:

|Sinal|O que fazer|
|---|---|
|Não sei se conceito é entidade ou VO|Esboce os dois jeitos e veja qual cabe melhor|
|Aggregate ficou gigante (5+ entidades dentro)|Provável dividir em 2 aggregates|
|Não consigo expressar uma invariante em código|Talvez seja regra de negócio externa (service)|
|Stakeholder usa termo diferente do que modelei|Atualize o glossário e o modelo|
|Modelo "não cabe" o caso de uso novo|Modelo está incompleto. Refine|

Em todos os casos, **converse com o humano antes de "consertar"**. Modelagem afeta muito código.

---

## 12. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|DDD vale sempre?|Não. Use quando domínio tem regras complexas|
|Diferença entidade / VO?|Entidade tem identidade, VO é definido pelo valor|
|O que é aggregate?|Conjunto com raiz que garante invariantes|
|O que é invariante?|Regra que nunca pode ser falsa|
|Como codificar invariante?|Estado inválido deve ser impossível de criar|
|Modelo anêmico vs rico?|Rico: comportamento junto com dados|
|Precisa de classes?|Não. Funções puras servem|
|O que é linguagem ubíqua?|Um termo = um significado em todo lugar|
|Onde mora a documentação?|`docs/dominios/` (glossário, invariantes, modelagem)|
|Domínio depende de infra?|Não. Domínio puro; infra em service|

---

## 🔗 Módulos Relacionados

- [`11-arquitetura-e-pastas.md`](https://claude.ai/padroes/11-arquitetura-e-pastas.md) — Onde a modelagem vive no projeto
- [`14-formularios-e-validacao.md`](https://claude.ai/padroes/14-formularios-e-validacao.md) — Zod usado para validar invariantes
- [`17-backend-node.md`](https://claude.ai/padroes/17-backend-node.md) — Domínio + repository + service no backend
- [`25-analise-impacto.md`](https://claude.ai/chat/25-analise-impacto.md) — Mudanças no modelo afetam muitos arquivos
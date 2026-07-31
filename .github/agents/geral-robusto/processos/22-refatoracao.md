---
description: "Refatoração: definição estrita, code smells, técnicas comuns, SOLID em React, Regra de Três, quando parar."
modulo: "22"
categoria: "processos"
versao: "1.0"
relacionado:
  - "10-codigo-e-convencoes.md"
  - "11-arquitetura-e-pastas.md"
  - "12-react-e-estado.md"
  - "15-testes.md"
  - "21-revisao-codigo.md"
---

# 🔧 Refatoração

> **Refatoração mantém comportamento.** Se mudar, é redesign. Essa distinção parece sutil mas é fundamental: refatoração é **segura** porque o comportamento externo não muda. Redesign é **arriscado** porque muda.

---

## 1. O Que É Refatoração

### 1.1 Definição Estrita

> **Refatoração:** mudança na estrutura interna do código que **não altera seu comportamento externo observável**.

|Refatoração|Redesign|Bug fix|
|---|---|---|
|Estrutura muda|Comportamento muda|Comportamento muda (era errado)|
|Testes continuam passando|Testes mudam ou novos surgem|Teste novo cobre o bug|
|Sem novo comportamento|Novo comportamento intencional|Comportamento corrigido|
|Exemplo: extrair função|Exemplo: adicionar paginação|Exemplo: corrigir cálculo|

**Por que importa:** misturar refatoração com mudança de comportamento é a fonte #1 de bugs sutis. Você refatora, testes quebram, você "corrige" - sem saber se quebraram por bug do refactor ou pela mudança de comportamento que você fez junto.

### 1.2 Regra Inegociável

> **Refatoração e mudança de comportamento não andam juntas no mesmo commit/PR/tarefa.**

Se a tarefa é "adicionar campo X", você:

1. Refatora o necessário **antes** (PR/commit separado, testes verdes)
2. Adiciona o campo X (outro PR/commit, testes novos)

Se durante a feature você descobre que precisa refatorar, **pause a feature**, faça a refatoração isolada, depois retome.

---

## 2. Por Que Refatorar

Refatoração consome tempo. Precisa ter motivo. Os motivos válidos:

|Motivo|Sinal concreto|
|---|---|
|**Preparar para mudança**|Vou adicionar X. Estrutura atual torna isso difícil|
|**Reduzir duplicação**|A mesma lógica aparece em 3+ lugares (Regra de Três)|
|**Aumentar clareza**|Outro dev (ou você em 6 meses) não vai entender|
|**Reduzir bugs futuros**|A estrutura facilita esquecer alguma coisa|
|**Remover obstáculo de teste**|Não dá para testar isso sem refatorar|
|**Aliviar dívida técnica**|Atrasou no início; agora vai pagar|

### 2.1 Motivos Inválidos

|Motivo ruim|Por que é ruim|
|---|---|
|"Achei feio"|Estética não é motivo. Funcional é|
|"Para usar [pattern]"|Pattern por pattern é dogma|
|"Outro dev escreveu"|Não importa quem escreveu|
|"Vai ficar mais 'limpo'"|"Limpo" é vago. Defina o que melhora|
|"Para mostrar que sei"|Pior motivo possível|

---

## 3. Quando NÃO Refatorar

Tão importante quanto saber quando refatorar é saber quando **não tocar**.

### 3.1 Lista de Não-Refatorar

|Situação|Por quê|
|---|---|
|Código funciona, ninguém vai mexer|Risco > benefício|
|Sem testes e sem tempo de escrever|Sem rede de segurança|
|Pressão de prazo crítico|Refatoração mal-feita pior que código velho|
|Você acabou de chegar no projeto|Não conhece contexto suficiente|
|Refatoração mudaria comportamento (na real)|Não é refatoração - é redesign|
|Vai ser deletado em breve|Trabalho jogado fora|

### 3.2 A Síndrome do "Vou Refatorar Tudo"

Tentação clássica: você abre um projeto, vê código que não gosta, quer refatorar tudo. **Resista.** Risco:

- Você quebra coisas que não entende ainda
- Outras pessoas perdem contexto porque você reorganizou
- Perde semanas em vez de entregar a feature pela qual foi contratado/tarefado

**Refatoração é cirurgia, não reforma.** Mude o que precisa. Deixe o resto.

---

## 4. Pré-Requisitos

Antes de iniciar refatoração, três coisas precisam estar prontas:

### 4.1 Rede de Segurança (Testes Verdes)

```bash
npm run test
# ✅ Tests passed: 82 | Failed: 0
```

Se não há testes para a parte que você vai refatorar, **escreva testes primeiro**. Não testes profundos - apenas suficientes para detectar se você quebrar comportamento durante a refatoração.

```typescript
// Testes mínimos antes de refatorar PaginaDetalhamento
describe('PaginaDetalhamento - antes da refatoração', () => {
  it('renderiza dados quando dados existem', () => { /* ... */ })
  it('renderiza estado vazio quando dados é null', () => { /* ... */ })
  it('chama onFiltrar quando filtro clica', () => { /* ... */ })
})
```

Esses testes vão sobreviver à refatoração. Se quebrarem, você quebrou comportamento - sinal vermelho.

### 4.2 Escopo Definido

Liste exatamente o que vai mudar:

- ✅ "Extrair lógica de PaginaDetalhamento para `useDetalhamento`"
- ❌ "Limpar a página"

Escopo vago vira refatoração que cresce indefinidamente.

### 4.3 Tempo Reservado

Refatoração não é "vou fazer entre duas features". Aloque tempo dedicado. Tipicamente:

|Refatoração|Tempo típico|
|---|---|
|Extract function/hook|30min - 2h|
|Extract component|1h - 3h|
|Reorganização de pastas|Meio dia - dia|
|Migração de padrão (ex: useState → useReducer)|Vários dias|

---

## 5. Code Smells que Justificam Refatoração

"Code smell" é sinal de que algo está errado - não é prova, mas merece olhar.

### 5.1 Tabela de Smells

|Smell|Sinal concreto|Ação típica|
|---|---|---|
|**God Component**|Componente com 200+ linhas, múltiplas responsabilidades|Extrair sub-componentes + hook|
|**Long Function**|Função com 50+ linhas ou 5+ parâmetros|Extrair funções menores ou objeto de opções|
|**Duplicate Code**|Mesma lógica em 3+ lugares (Regra de Três)|Extrair função/hook/componente|
|**`useEffect` para derivar**|`useEffect(() => setX(a+b), [a,b])`|Cálculo direto ou `useMemo`|
|**Magic Numbers**|`* 52`, `+ 0.05` solto no código|Constantes nomeadas|
|**Long Parameter List**|`fn(a, b, c, d, e, f)`|Objeto de opções|
|**Shotgun Surgery**|Pequena mudança requer alterar 10 arquivos|Centralizar responsabilidade|
|**Feature Envy**|Função X de Y manipula muito mais Z que Y|Mover função para Z|
|**Primitive Obsession**|`string` representando coisas complexas (CPF, email)|Tipo/classe dedicada|
|**Data Clumps**|Os mesmos 3-4 parâmetros sempre andam juntos|Objeto ou tipo|
|**Comments Explaining Code**|`// converte para minúsculo e remove espaços`|Função nomeada (`normalizar()`)|
|**Dead Code**|Função/import nunca chamado|Deletar (Git lembra)|

### 5.2 Como Priorizar

Quando você identifica vários smells, qual atacar primeiro?

|Prioridade|Critério|
|---|---|
|Alta|Vai facilitar a feature que você está prestes a implementar|
|Alta|Está causando bugs recorrentes|
|Média|Outros devs reclamam frequentemente|
|Média|Aparece em código que você vai tocar nos próximos meses|
|Baixa|Está esteticamente desagradável mas funciona|

**Refatoração faz mais sentido em código que vai mudar em breve.** Refatorar código que ninguém vai tocar é tempo perdido.

---

## 6. Refatorações Comuns (Receitas)

### 6.1 Extract Hook

**Quando usar:** page com 2+ `useState` e lógica não-trivial.

**Antes:**

```tsx
function PaginaDetalhamento() {
  const [filtros, setFiltros] = useState<Filtros>({})
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})

  const totalFiltrado = useMemo(() => calcularTotal(filtros), [filtros])
  const alternarFiltro = useCallback((id: string) => {
    setFiltros(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return (
    // ... 100 linhas de JSX
  )
}
```

**Depois:**

```tsx
// src/hooks/useDetalhamento.ts
export function useDetalhamento() {
  const [filtros, setFiltros] = useState<Filtros>({})
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})

  const totalFiltrado = useMemo(() => calcularTotal(filtros), [filtros])
  const alternarFiltro = useCallback((id: string) => {
    setFiltros(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return { filtros, expandido, totalFiltrado, alternarFiltro, setExpandido }
}

// src/pages/PaginaDetalhamento.tsx
function PaginaDetalhamento() {
  const vm = useDetalhamento()
  return (
    // ... JSX consumindo vm
  )
}
```

**Passos:**

1. Crie o arquivo do hook
2. Mova `useState`, `useMemo`, `useCallback` para lá
3. Retorne os valores que o JSX precisa
4. No componente, importe o hook e consuma via `vm`
5. Rode testes

### 6.2 Extract Component

**Quando usar:** componente com seções claramente distintas que poderiam ter vida própria.

**Antes:**

```tsx
function PaginaPerfil() {
  return (
    <div>
      <div className="header">
        <Avatar src={perfil.foto} />
        <h1>{perfil.nome}</h1>
        <span>{perfil.email}</span>
      </div>
      <div className="content">
        <h2>Pedidos</h2>
        <ul>
          {pedidos.map(p => <li key={p.id}>{p.titulo}</li>)}
        </ul>
      </div>
    </div>
  )
}
```

**Depois:**

```tsx
function CabecalhoPerfil({ perfil }: Props) {
  return (
    <div className="header">
      <Avatar src={perfil.foto} />
      <h1>{perfil.nome}</h1>
      <span>{perfil.email}</span>
    </div>
  )
}

function ListaPedidos({ pedidos }: Props) {
  return (
    <div className="content">
      <h2>Pedidos</h2>
      <ul>
        {pedidos.map(p => <li key={p.id}>{p.titulo}</li>)}
      </ul>
    </div>
  )
}

function PaginaPerfil() {
  return (
    <div>
      <CabecalhoPerfil perfil={perfil} />
      <ListaPedidos pedidos={pedidos} />
    </div>
  )
}
```

**Quando NÃO fazer:** se cada subcomponente é usado em **apenas um lugar** e tem **poucas linhas**, pode estar fragmentando demais. Mantenha junto.

### 6.3 Replace useEffect with useMemo/Direct Computation

**Antes:**

```tsx
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(a + b)
}, [a, b])
```

**Depois:**

```tsx
const total = a + b
```

Simples. Mas a quantidade desse smell em projetos React é assustadora. Cobrir como refatoração porque é dos consertos mais comuns.

### 6.4 Replace Magic Numbers with Constants

**Antes:**

```tsx
if (km > 30000) return 'CRÍTICO'
```

**Depois:**

```tsx
const LIMITE_KM_CRITICO = 30000

if (km > LIMITE_KM_CRITICO) return 'CRÍTICO'
```

Constantes em `UPPER_SNAKE_CASE`, em `data/` ou `config/` se aplicáveis em vários lugares.

### 6.5 Replace Long Parameter List with Options Object

**Antes:**

```tsx
function calcularPreco(km, dias, tipo, desconto, taxa, antecipado) { }
```

**Depois:**

```tsx
function calcularPreco(opcoes: {
  km: number
  dias: number
  tipo: TipoVeiculo
  desconto?: number
  taxa?: number
  antecipado?: boolean
}) { }
```

Vantagens: ordem não importa, parâmetros opcionais ficam claros, autocomplete melhor.

### 6.6 Inline Variable

Às vezes uma variável intermediária prejudica clareza:

**Antes:**

```tsx
const total = a + b
return <div>Total: {total}</div>
```

**Depois (se `total` é usado apenas uma vez):**

```tsx
return <div>Total: {a + b}</div>
```

Mas **não inline** se a variável tem nome semântico que ajuda entender (`totalComDesconto` é melhor que `subtotal * 0.9`).

---

## 7. SOLID em React

Os princípios SOLID nasceram em OOP, mas têm tradução útil para React.

### 7.1 S - Single Responsibility

> Cada componente/hook/função tem **uma única razão para mudar**.

```tsx
// ❌ Hook gigante com 3 responsabilidades
function usePagina() {
  // gerencia filtros
  // gerencia paginação
  // gerencia seleção
}

// ✅ Hooks pequenos compostos
function useFiltros() { /* ... */ }
function usePaginacao() { /* ... */ }
function useSelecao() { /* ... */ }

function usePagina() {
  return {
    filtros: useFiltros(),
    paginacao: usePaginacao(),
    selecao: useSelecao(),
  }
}
```

### 7.2 O - Open/Closed

> Componentes abertos para extensão (children, slots, props), fechados para modificação.

```tsx
// ✅ Aceita children - extensível sem mudar o Card
<Card>
  <ConteudoCustomizado />
</Card>

// ✅ Aceita render prop - extensível
<Lista renderItem={item => <ItemCustomizado dados={item} />} />
```

### 7.3 L - Liskov Substitution

> Componentes wrapper não devem quebrar o contrato do componente base.

```tsx
// ❌ Wrapper que muda comportamento de Button
function MeuBotao(props) {
  return <button onClick={() => alert('hi')} {...props} /> // ignora onClick!
}

// ✅ Wrapper que respeita o contrato
function MeuBotao({ onClick, ...rest }: Props) {
  return <button onClick={onClick} {...rest} />
}
```

### 7.4 I - Interface Segregation

> Props mínimas, não monolíticas. Componente não pede o que não usa.

```tsx
// ❌ Pede o usuário inteiro só para mostrar nome
<Cabecalho usuario={usuarioInteiro} />

// ✅ Pede só o que usa
<Cabecalho nome={usuario.nome} foto={usuario.foto} />
```

Exceção: quando o "objeto inteiro" é convenção do projeto (ex: forms passam o objeto completo para clareza).

### 7.5 D - Dependency Inversion

> Componentes/hooks dependem de **abstrações** (interfaces, contratos), não de implementações concretas.

```tsx
// ❌ Hook depende direto de localStorage
function usePerfil() {
  const perfil = localStorage.getItem('perfil')
}

// ✅ Hook depende de serviço (que pode ser localStorage, IndexedDB, API...)
function usePerfil() {
  const perfil = perfilStorage.obter()
}
```

Já vimos no módulo 11. SOLID dá a justificativa teórica.

---

## 8. Regra de Três (Revisitando)

> **Não crie abstração até a terceira ocorrência.**

Já abordada no [módulo 10](../padroes/10-codigo-e-convencoes.md#8-regra-de-tr%C3%AAs-abstra%C3%A7%C3%B5es). Mas em refatoração, a regra opera ao contrário: você está **decidindo** se vale extrair.

### 8.1 Como Aplicar Durante Refatoração

Quando você vê duplicação:

|Ocorrências|Ação|
|---|---|
|2|Pode esperar. Duplicação tolerável|
|3|**Agora é hora.** Abstraia|
|4+|Já passou da hora. Abstraia urgente|

### 8.2 Cuidado: Abstrações Erradas

Tem caso onde 3 ocorrências **parecem** duplicação mas não são. Sinais:

- As 3 vão evoluir em direções diferentes (parecem iguais hoje, divergem amanhã)
- A "lógica comum" precisa de muito parâmetro para acomodar variações
- Você precisa de `if`s no código abstraído para tratar os 3 casos

Quando vê esses sinais, **mantenha duplicado**. Abstração ruim é pior que duplicação aceita.

### 8.3 Quando Saber: 4 Anos Depois

A verdadeira validação de uma abstração é o tempo. Se 6 meses depois ela ainda atende todos os casos sem ginástica, foi boa. Se virou monstro de parâmetros opcionais, foi prematura.

---

## 9. Patterns Precisam de Justificativa

Em livros, você lê sobre Strategy, Observer, Factory, Decorator, etc. Tentação: aplicar em todo lugar para "demonstrar conhecimento".

> **Não introduza pattern sem ter um problema concreto que ele resolve melhor que código direto.**

### 9.1 Custos de Aplicar Pattern Sem Necessidade

- **Sobrecarga cognitiva.** Próximo dev precisa entender o pattern antes do código
- **Indireção desnecessária.** 3 arquivos para fazer o que 1 fazia
- **Acoplamento a abstração específica.** Difícil voltar atrás
- **Falsa sensação de "boa engenharia".** Sintoma de "engenheiro novato"

### 9.2 Quando Pattern Faz Sentido

|Pattern|Sintoma concreto|
|---|---|
|Strategy|"Tenho 3+ algoritmos diferentes para a mesma operação e preciso trocar em runtime"|
|Observer|"Vários componentes precisam reagir à mesma mudança e não devem se conhecer"|
|Factory|"Criação de objetos é complexa o suficiente para ter regras próprias"|
|Decorator|"Quero adicionar comportamento sem modificar a classe original"|

Note como cada sintoma é **concreto**, não vago.

### 9.3 React Já Te Dá Muito

Antes de pensar em pattern OOP, lembre que React tem ferramentas prontas:

- **Composição com children/slots** → resolve muito do que Decorator faria
- **Render props / hooks customizados** → resolvem Strategy de forma mais idiomática
- **Context** → resolve Observer para a maioria dos casos
- **Hooks compostos** → resolvem boa parte de Factory

Em React, **prefira soluções idiomáticas a patterns clássicos de OOP**.

---

## 10. Refatorando Código Sem Testes

Caso real e doloroso: código antigo, sem testes, e você precisa refatorar. Como não quebrar?

### 10.1 A Estratégia "Testes de Caracterização"

Antes de refatorar, escreva testes que **capturem o comportamento atual** - mesmo o errado. Esses são "testes de caracterização":

```typescript
// Não importa se o cálculo está "certo"
// importa que continue dando o mesmo resultado depois da refatoração
it('caracterização: calcular(100, 0.5) retorna 50', () => {
  expect(calcular(100, 0.5)).toBe(50)
})

it('caracterização: calcular(-10, 0.5) retorna -5', () => {
  expect(calcular(-10, 0.5)).toBe(-5)  // mesmo que -5 seja bizarro
})
```

A ideia: você não está validando que o código está certo. Está fotografando o comportamento atual. Se a refatoração mudar o resultado, os testes pegam.

### 10.2 Refatoração + Bug Fix Depois

Quando você detecta um bug através de teste de caracterização (o comportamento atual está errado):

1. **Não corrija no meio da refatoração.** Lembre da regra: refatoração não muda comportamento.
2. **Termine a refatoração** mantendo o bug.
3. **Depois** crie tarefa de bug fix separada, com teste corrigido.

Isolar as duas mudanças facilita depuração se algo der errado.

### 10.3 Refatoração de Código Crítico

Para código onde teste não é viável ou suficiente (ex: lógica que envolve banco real, side effects complexos):

- **Refatore em micro-passos.** Cada commit é uma mudança de 5-10 linhas
- **Valide em ambiente real** entre passos
- **Mantenha branch separada** com possibilidade de reverter rapidamente
- **Documente cada decisão** na descrição do commit

---

## 11. Quando Parar a Refatoração

Refatorar é como organizar gaveta - sempre tem algo a mais para arrumar. Como saber parar?

### 11.1 Sinais de Que É Hora de Parar

|Sinal|O que significa|
|---|---|
|O escopo definido na seção 4.2 foi cumprido|Você terminou o que se propôs|
|Os ganhos marginais ficaram pequenos|Lei dos retornos decrescentes|
|Você está mudando código que não vai tocar de novo em meses|Trabalho com pouco retorno|
|Está cansado e propenso a erros|Hora de parar fisicamente|
|Surgiu pressão por feature urgente|Refatoração não-essencial pode esperar|

### 11.2 O Que NÃO É Sinal de Parar

|Falso sinal|Real significado|
|---|---|
|"Estou indo bem, mas o código ainda não está perfeito"|Perfeito é inimigo do bom|
|"Apareceu mais uma coisa para refatorar"|Anote em outra tarefa, não estenda escopo|
|"Talvez deveria reorganizar isso também"|Síndrome do scope creep|

### 11.3 Refatoração "Boa o Bastante"

Critério prático: você deveria sentir que o código está **claramente melhor** que antes da refatoração, mas **não perfeito**. Se sente perfeição, refatorou demais. Se sente igual, refatorou de menos.

---

## 12. Anti-Padrões Específicos de Refatoração

|Anti-padrão|Por que é ruim|
|---|---|
|Misturar refatoração com feature no mesmo PR|Dificulta isolar bugs|
|Refatorar sem testes|Sem rede de segurança|
|Refatorar tudo de uma vez|Risco gigante de quebrar coisas|
|Mudar nomes em todo lugar sem motivo|Trabalho cosmético|
|Introduzir pattern complexo "porque sim"|Sobrecarga cognitiva|
|Refatorar código que vai ser deletado|Trabalho perdido|
|"Vou refatorar enquanto faço a feature"|Tudo fica pior|
|Esperar 6 meses para refatorar dívida pequena|Vai virar dívida grande|

---

## 13. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Refatorar e adicionar feature ao mesmo tempo?|Nunca. Separe|
|Sem testes para a parte que vai mudar?|Escreva testes primeiro|
|Comportamento muda após refatoração?|Não é refatoração - é redesign|
|Quando abstrair?|Regra de Três - 3 ocorrências|
|Aplicar pattern sem motivo concreto?|Não|
|Refatorar tudo que parece feio?|Não. Refatore o que vai mudar em breve|
|Refatoração precisa ser perfeita?|Não. "Claramente melhor" basta|
|Como saber parar?|Escopo cumprido + ganhos marginais pequenos|

---

## 🔗 Módulos Relacionados

- [`10-codigo-e-convencoes.md`](../padroes/10-codigo-e-convencoes.md) - Regra de Três e convenções
- [`11-arquitetura-e-pastas.md`](../padroes/11-arquitetura-e-pastas.md) - Para onde mover código durante refatoração
- [`12-react-e-estado.md`](../padroes/12-react-e-estado.md) - Padrão de extract hook
- [`15-testes.md`](../padroes/15-testes.md) - Rede de segurança para refatorar
- [`21-revisao-codigo.md`](./21-revisao-codigo.md) - Revisão gera tarefas REF que vêm aqui
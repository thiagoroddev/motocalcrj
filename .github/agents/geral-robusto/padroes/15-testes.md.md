---

description: "Testes: filosofia, Vitest, AAA, cobertura mínima concreta, mocking, Testing Library, user-event, renderHook, formulários." modulo: "15" categoria: "padroes" versao: "1.0" relacionado:

- "12-react-e-estado.md"
- "13-ui-e-design-system.md"
- "14-formularios-e-validacao.md"
- "22-refatoracao.md"

---

# 🧪 Testes

> Testes existem para te dar **coragem de mudar código**. Sem testes, você tem medo de refatorar. A pergunta certa não é _"o que testar?"_ mas **"que conhecimento sobre meu código eu quero registrar de forma executável?"**

---

## 1. Filosofia

### 1.1 Para Que Servem Testes

Testes bem-feitos respondem três perguntas:

1. **O código faz o que deveria?** (validação)
2. **Continuou fazendo depois das mudanças?** (regressão)
3. **Como esse código é usado?** (documentação executável)

Quando alguém lê um teste, está vendo um exemplo real de uso da função/componente. Testes são a melhor documentação que existe — porque se ficarem desatualizados, **falham**.

### 1.2 Para Que NÃO Servem Testes

- **Não servem para perseguir 100% de cobertura.** Cobertura é métrica, não objetivo. Você pode ter 100% com asserts ruins.
- **Não servem para testar a biblioteca.** Você não precisa testar que `useState` funciona — o React testa isso.
- **Não servem para "garantir qualidade".** Garantem ausência de **um conjunto específico** de bugs. Bugs novos vão escapar.
- **Não substituem revisão humana.** Testes verdes + código ruim = código ruim.

### 1.3 O Princípio Norteador

> **Teste comportamento, não implementação.**

|Teste de comportamento|Teste de implementação|
|---|---|
|"Quando o usuário clica em Salvar, o perfil é gravado"|"useState foi chamado com argumento X"|
|"Total inválido lança erro de validação"|"função interna foo() foi chamada"|
|Refatorar não quebra o teste|Refatorar quebra o teste|

Quando você testa **comportamento**, refatorar internamente o código (mudar nomes, extrair funções, otimizar) **não quebra os testes**. Quando testa **implementação**, qualquer mudança quebra. O segundo te desencoraja de refatorar — exatamente o oposto do que testes deveriam fazer.

### 1.4 Quem Testa o Quê

|Camada|Quem testa|Tipo|
|---|---|---|
|`utils/` (funções puras)|O dev que escreveu|Unit|
|`services/` (com efeitos)|O dev que escreveu|Unit com mocks|
|`hooks/` (estado + lógica)|O dev que escreveu|Unit com `renderHook`|
|`components/ui/` (primitivos)|O dev que escreveu|Visual + interação básica|
|`components/[dominio]/`|O dev que escreveu|Interação completa|
|`pages/` (composição)|Opcional|Smoke test ou e2e|
|Fluxos críticos end-to-end|Time de QA / Playwright|E2E|

**Todo desenvolvedor testa o que escreve.** QA audita, não escreve testes de unidade para features novas.

---

## 2. Stack Padrão

|Ferramenta|Função|Quando instalar|
|---|---|---|
|**Vitest**|Runner de testes|Sempre|
|**@testing-library/react**|Renderiza componentes para teste|Quando há componentes|
|**@testing-library/user-event**|Simula interações reais|Quando há interação|
|**@testing-library/jest-dom**|Matchers extras (`toBeInTheDocument`, etc.)|Quando há componentes|
|**happy-dom** ou **jsdom**|Simula DOM no Node|Quando há componentes|

### 2.1 Instalação Mínima

```bash
npm install -D vitest
```

Para componentes:

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom
```

### 2.2 Configuração Básica

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,           // describe/it/expect sem precisar importar
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
```

### 2.3 Scripts no package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:cov": "vitest run --coverage"
  }
}
```

`vitest` (sem `run`) entra em watch mode — bom para desenvolvimento. `vitest run` executa uma vez — bom para CI.

---

## 3. AAA: Arrange, Act, Assert

Todo teste tem três seções claramente separadas. Você lê de cima para baixo e entende: _o que está dado, o que aconteceu, o que esperamos_.

### 3.1 Estrutura Padrão

```typescript
import { describe, it, expect } from 'vitest'

describe('calcularTotal', () => {
  it('soma todos os custos quando há múltiplas categorias', () => {
    // Arrange — prepara o cenário
    const custos = { combustivel: 100, manutencao: 50, seguro: 30 }

    // Act — executa o comportamento
    const total = calcularTotal(custos)

    // Assert — verifica o resultado
    expect(total).toBe(180)
  })
})
```

### 3.2 Por Que Essa Estrutura

- **Legível:** quem lê o teste sabe imediatamente o que está sendo testado
- **Debugável:** quando falha, você sabe exatamente em qual seção
- **Refatorável:** dá pra extrair Arrange em helpers sem quebrar a lógica
- **Conversível em documentação:** o nome do teste vira frase declarativa do comportamento

### 3.3 Convenção de Nomenclatura

```typescript
// ❌ Vago — não diz o que está testando
it('funciona')
it('teste 1')
it('caso 2')

// ✅ Frase declarativa — descreve o comportamento esperado
it('soma todos os custos quando há múltiplas categorias')
it('retorna 0 quando não há custos')
it('lança erro de validação quando km é negativo')
```

A leitura do nome do teste, no idioma do projeto, **deve descrever o comportamento sem precisar olhar o código**.

### 3.4 Exemplos Progressivos

**Caminho feliz:**

```typescript
it('formata número como moeda brasileira', () => {
  expect(formatarMoeda(1234.56)).toBe('R$ 1.234,56')
})
```

**Caso limite:**

```typescript
it('formata zero como R$ 0,00', () => {
  expect(formatarMoeda(0)).toBe('R$ 0,00')
})
```

**Tentativa de violar invariante:**

```typescript
it('lança erro quando valor é negativo', () => {
  expect(() => formatarMoeda(-10)).toThrow(ValidacaoError)
})
```

---

## 4. O Que Testar (Cobertura Mínima Concreta)

Esta é a parte que o documento original era vago — vamos concretizar.

### 4.1 Funções Puras (`utils/`)

**Sempre teste.** São fáceis e de altíssimo valor. Para cada função:

|Cenário|Exemplo|
|---|---|
|Caminho feliz com entrada típica|`calcularTotal({ a: 10, b: 20 })` → `30`|
|Entradas-limite (zero, vazio, único)|`calcularTotal({})` → `0`|
|Cada invariante documentada|`calcularTotal({ a: -10 })` → lança erro|
|Boundary conditions explícitas|`formatarMoeda(0.001)` → `'R$ 0,00'` (truncamento)|

**Não precisa testar:**

- Tipagem (TypeScript já garante)
- Performance (a menos que seja crítica e documentada)
- Implementação interna

### 4.2 Hooks de Feature (`hooks/`)

**Teste se contém lógica não-trivial.** Use `renderHook` da Testing Library.

Para cada hook:

|Cenário|Exemplo|
|---|---|
|Estado inicial correto|`result.current.filtros` → `{}`|
|Handler atualiza estado|`act(() => result.current.alternarFiltro('a'))` → `filtros: { a: true }`|
|Derivação correta após mudança|`totalFiltrado` atualiza após mudança nos filtros|
|Reset/limpar funciona|`act(() => result.current.limpar())` → estado volta ao inicial|

**Não precisa testar:**

- `useState` (React já testa)
- Handlers triviais (`setX(v)`)

### 4.3 Componentes UI (`components/ui/`)

**Teste interação e acessibilidade. Não teste estilo.**

|Cenário|Exemplo|
|---|---|
|Renderiza children|`<Botao>Salvar</Botao>` → texto "Salvar" visível|
|Click dispara handler|`userEvent.click(botao)` → `handler` chamado 1x|
|Disabled bloqueia click|`<Botao disabled>` + click → handler não chamado|
|Variantes geram classes corretas|(opcional — só se variantes têm comportamento diferente)|
|Acessibilidade básica|Tem `role="button"`, aceita `aria-label`|

**Não precisa testar:**

- Cor exata (snapshot ou visual regression é melhor)
- Layout (use ferramentas dedicadas)

### 4.4 Componentes de Domínio (`components/[dominio]/`)

**Teste fluxo de interação completo.**

|Cenário|Exemplo|
|---|---|
|Renderiza dados passados|`<CardPerfil perfil={mock} />` → nome visível|
|Estado vazio renderiza fallback|`<CardPerfil perfil={null} />` → mensagem "sem perfil"|
|Click em ação chama callback|`click("Editar")` → `onEditar` chamado|
|Estado de erro renderiza erro|(se aplicável)|

### 4.5 Services

**Teste com mocks das dependências externas.**

|Cenário|Exemplo|
|---|---|
|Salva e recupera valor|`salvar(perfil); obter()` → mesmo perfil|
|Lida com storage vazio|`obter()` quando vazio → `null`|
|Lida com JSON inválido|Storage corrompido → `null` (não crash)|

### 4.6 Pages

**Opcional para a maioria dos casos.** Page é composição — se hooks e componentes funcionam, page funciona. Teste apenas:

- Smoke test (renderiza sem crashar)
- Integração de hook + componente em fluxo crítico

---

## 5. O Que NÃO Testar

### 5.1 Lista de Não-Testar

|Não teste|Por quê|
|---|---|
|Bibliotecas externas|Elas têm seus próprios testes|
|Tipos TypeScript|O compilador já garante|
|Estilo CSS|Use visual regression se importa|
|Implementação interna|Quebra ao refatorar|
|Cobertura por cobertura|Teste com asserts vazios não vale nada|
|Mocks de coisas que você controla|Está testando o mock, não o código|

### 5.2 Exemplo de Teste Inútil

```typescript
// ❌ Testando implementação
it('chama useState internamente', () => {
  const spy = vi.spyOn(React, 'useState')
  render(<MeuComponente />)
  expect(spy).toHaveBeenCalled()
})

// ✅ Testando comportamento
it('mostra contador inicial como 0', () => {
  render(<Contador />)
  expect(screen.getByText('0')).toBeInTheDocument()
})
```

---

## 6. Testing Library: Princípios

Testing Library tem um mantra: **"teste como o usuário usa"**.

### 6.1 Hierarquia de Queries

Use queries nesta ordem de preferência:

|Prioridade|Query|Quando|
|---|---|---|
|1|`getByRole`|Quase sempre. Reflete como leitores de tela acessam|
|2|`getByLabelText`|Formulários — campo associado a label|
|3|`getByText`|Conteúdo textual visível|
|4|`getByPlaceholderText`|Quando não há label (raro)|
|5|`getByTestId`|Último recurso. Use `data-testid`|

```typescript
// ✅ Bom — usa role acessível
screen.getByRole('button', { name: 'Salvar' })

// 🟡 OK — quando role não funciona
screen.getByText('Salvar')

// ❌ Ruim — quebra acoplamento com implementação
screen.getByTestId('botao-salvar')
```

### 6.2 Variantes: get / query / find

|Variante|Comportamento|Use quando|
|---|---|---|
|`getBy*`|Lança erro se não encontrar|Elemento **deve** estar presente|
|`queryBy*`|Retorna `null` se não encontrar|Verificar que elemento **não** está presente|
|`findBy*`|Async, espera até aparecer|Elemento aparece após ação async|

```typescript
// Esperando ausência
expect(screen.queryByText('Erro')).not.toBeInTheDocument()

// Esperando aparição assíncrona
expect(await screen.findByText('Salvo!')).toBeInTheDocument()
```

### 6.3 user-event vs fireEvent

**Use sempre `user-event`.**

```typescript
// ❌ fireEvent — dispara o evento bruto, mas não simula sequência real
fireEvent.click(botao)
fireEvent.change(input, { target: { value: 'oi' } })

// ✅ user-event — simula a sequência completa de eventos do navegador
const user = userEvent.setup()
await user.click(botao)
await user.type(input, 'oi')  // dispara keydown, keypress, input, keyup para cada tecla
```

`user-event` é mais lento mas pega bugs que `fireEvent` não pega (ex: handlers de `keypress` ignorados).

---

## 7. Mocking de Serviços

Quando o código testado usa serviços externos (storage, API, time), você precisa de mocks.

### 7.1 Mock de Módulo Inteiro

```typescript
// src/services/perfilStorage.ts (real)
export const perfilStorage = {
  obter: () => { /* lê localStorage */ },
  salvar: (p: Perfil) => { /* escreve localStorage */ },
}

// src/components/CardPerfil.test.tsx
import { vi } from 'vitest'

vi.mock('@/services/perfilStorage', () => ({
  perfilStorage: {
    obter: vi.fn(),
    salvar: vi.fn(),
  },
}))

import { perfilStorage } from '@/services/perfilStorage'

it('exibe perfil retornado pelo storage', () => {
  vi.mocked(perfilStorage.obter).mockReturnValue({ nome: 'João' })
  render(<CardPerfil />)
  expect(screen.getByText('João')).toBeInTheDocument()
})
```

### 7.2 Mock de Funções Específicas

```typescript
const onSalvarMock = vi.fn()

render(<FormularioPerfil onSalvar={onSalvarMock} />)
await user.click(screen.getByRole('button', { name: 'Salvar' }))

expect(onSalvarMock).toHaveBeenCalledWith({ nome: 'João' })
```

### 7.3 Mock de Time

```typescript
import { vi } from 'vitest'

it('exibe mensagem após 1 segundo', () => {
  vi.useFakeTimers()
  render(<Notificacao />)

  expect(screen.queryByText('Olá!')).not.toBeInTheDocument()

  vi.advanceTimersByTime(1000)

  expect(screen.getByText('Olá!')).toBeInTheDocument()

  vi.useRealTimers()  // sempre restaura
})
```

### 7.4 Quando NÃO Mockar

- **Funções puras de `utils/`** — chamar direto é mais simples e seguro
- **Componentes filhos** — render do componente inteiro com filhos reais é melhor (a menos que filhos sejam pesados)
- **Tipos** — `as` ou `satisfies` no TypeScript, não mock

---

## 8. Testes de Hooks com `renderHook`

Hooks não podem ser chamados fora de componentes. `renderHook` cria um componente wrapper invisível.

### 8.1 Exemplo Básico

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDetalhamento } from './useDetalhamento'

describe('useDetalhamento', () => {
  it('inicia com filtros vazios', () => {
    const { result } = renderHook(() => useDetalhamento())
    expect(result.current.filtros).toEqual({})
  })

  it('alterna filtro quando alternarFiltro é chamado', () => {
    const { result } = renderHook(() => useDetalhamento())

    act(() => {
      result.current.alternarFiltro('combustivel')
    })

    expect(result.current.filtros).toEqual({ combustivel: true })
  })

  it('reset volta ao estado inicial', () => {
    const { result } = renderHook(() => useDetalhamento())

    act(() => {
      result.current.alternarFiltro('a')
      result.current.alternarFiltro('b')
    })
    expect(result.current.filtros).toEqual({ a: true, b: true })

    act(() => {
      result.current.limparFiltros()
    })
    expect(result.current.filtros).toEqual({})
  })
})
```

### 8.2 Por Que `act`

`act` informa ao React: _"estou prestes a fazer uma mudança que pode causar re-render. Espere terminar antes de eu ler o estado"_.

Sem `act`, você pode ler valores intermediários. Com `act`, você lê o estado **após** todas as atualizações.

### 8.3 Hook com Contexto

Quando o hook depende de Provider:

```typescript
const wrapper = ({ children }) => (
  <PerfilProvider>{children}</PerfilProvider>
)

const { result } = renderHook(() => usePerfil(), { wrapper })
```

---

## 9. Testes de Componentes

### 9.1 Componente Simples

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Botao } from './Botao'

describe('Botao', () => {
  it('renderiza children', () => {
    render(<Botao>Salvar</Botao>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('chama onClick quando clicado', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<Botao onClick={onClick}>Salvar</Botao>)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando disabled', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<Botao onClick={onClick} disabled>Salvar</Botao>)
    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('mostra spinner quando carregando', () => {
    render(<Botao carregando>Salvar</Botao>)
    expect(screen.getByRole('button')).toBeDisabled()
    // se Spinner tem aria-label="Carregando"
    expect(screen.getByLabelText('Carregando')).toBeInTheDocument()
  })
})
```

### 9.2 Componente com Dados

```typescript
describe('CardPerfil', () => {
  const perfilMock = { id: '1', nome: 'João', email: 'joao@test.com' }

  it('exibe nome e email do perfil', () => {
    render(<CardPerfil perfil={perfilMock} />)
    expect(screen.getByText('João')).toBeInTheDocument()
    expect(screen.getByText('joao@test.com')).toBeInTheDocument()
  })

  it('exibe estado vazio quando perfil é null', () => {
    render(<CardPerfil perfil={null} />)
    expect(screen.getByText(/nenhum perfil/i)).toBeInTheDocument()
  })

  it('chama onEditar com id quando clica em editar', async () => {
    const onEditar = vi.fn()
    const user = userEvent.setup()

    render(<CardPerfil perfil={perfilMock} onEditar={onEditar} />)
    await user.click(screen.getByRole('button', { name: /editar/i }))

    expect(onEditar).toHaveBeenCalledWith('1')
  })
})
```

---

## 10. Testes de Formulários

Forms são onde `user-event` brilha. Você simula a interação completa: digita, sai do campo, vê erro, corrige, submete.

### 10.1 Form Completo (módulo 14)

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormularioLogin } from './FormularioLogin'

describe('FormularioLogin', () => {
  it('valida email no blur', async () => {
    const user = userEvent.setup()
    render(<FormularioLogin onSubmit={vi.fn()} />)

    const inputEmail = screen.getByLabelText('Email')

    // Arrange + Act
    await user.type(inputEmail, 'invalido')
    await user.tab()  // sai do campo

    // Assert
    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument()
  })

  it('chama onSubmit com dados válidos', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<FormularioLogin onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'joao@email.com')
    await user.type(screen.getByLabelText('Senha'), 'senha12345')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Form submission é async, espera
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'joao@email.com',
        senha: 'senha12345',
      })
    })
  })

  it('não submete com campos vazios', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<FormularioLogin onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
```

### 10.2 Erro de Servidor

```typescript
it('exibe erro de servidor quando login falha', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockRejectedValue(new Error('Credenciais inválidas'))

  render(<FormularioLogin onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'joao@email.com')
  await user.type(screen.getByLabelText('Senha'), 'senhaErrada')
  await user.click(screen.getByRole('button'))

  expect(await screen.findByRole('alert')).toHaveTextContent(/credenciais/i)
})
```

---

## 11. Atualização de Teste Falho

⚠️ **O erro mais grave em testes é atualizar para "fazer passar" sem entender por que falhou.**

### 11.1 Fluxograma de Decisão

```
Teste falhou.
│
├─ A mudança no código foi INTENCIONAL?
│   │
│   ├─ NÃO → É bug. CORRIJA O CÓDIGO. Não toque no teste.
│   │
│   └─ SIM → O comportamento antigo ainda é desejado?
│       │
│       ├─ SIM → Bug na mudança. Os dois comportamentos
│       │       precisam coexistir. CORRIJA O CÓDIGO.
│       │
│       └─ NÃO → ATUALIZE o teste E DOCUMENTE o motivo
│                 (commit message + comentário se necessário).
```

### 11.2 Sinais Vermelhos

|Sinal|O que significa|
|---|---|
|"É só atualizar a assertion" sem investigar|Você está mascarando bug|
|"Esse teste já vivia falhando"|Teste flaky — investigue antes|
|"Vou comentar o teste"|Nunca. Delete ou conserte|
|Atualizar valor esperado sem entender o cálculo|Bug silencioso em produção|

### 11.3 Exemplo de Decisão Correta

```typescript
// Teste original
it('calcula total considerando seguro', () => {
  expect(calcularTotal({ km: 100, seguro: 50 })).toBe(150)
})

// Mudança no código: agora seguro é prorrateado
// Resultado novo: 100 + (50 / 12) ≈ 104.17

// ❌ Errado — atualizar sem entender
it('calcula total considerando seguro', () => {
  expect(calcularTotal({ km: 100, seguro: 50 })).toBe(104.17)
})

// ✅ Certo — entender, documentar e atualizar
/**
 * Mudança feita em PR #123: seguro anual agora é prorrateado mensalmente.
 * Antes: 50 somava direto. Agora: 50/12 ≈ 4.17 por mês.
 */
it('calcula total mensal com seguro prorrateado', () => {
  expect(calcularTotal({ km: 100, seguro: 50 })).toBeCloseTo(104.17, 2)
})
```

Note: nome do teste também mudou para refletir o novo comportamento.

---

## 12. Anti-Padrões de Teste

|Anti-padrão|Por que é ruim|Faça em vez|
|---|---|---|
|Testes dependentes (um precisa do outro rodar antes)|Falha em paralelo, ordem cria fragilidade|Cada teste arrange seu próprio cenário|
|Asserts vagos (`expect(x).toBeTruthy()`)|Não diz o que esperava|`expect(x).toBe(valorEspecifico)`|
|Mock de tudo|Está testando o mock|Mock só dependências externas|
|Snapshot gigantesco|Quebra a cada mudança trivial|Snapshot só de pequenos componentes ou JSON|
|`setTimeout` no teste para "esperar"|Lento + frágil|`findBy*` ou `vi.advanceTimersByTime`|
|Comentar teste falho|Esconde problema|Conserte ou delete|
|Teste sem assert|Sempre passa, não testa nada|Pelo menos um `expect` por `it`|
|Lógica complexa no teste|Bug no teste, não no código|Teste deve ser óbvio|

---

## 13. Cobertura: Métrica vs Meta

### 13.1 O Que Cobertura Mede

|Tipo|O que mede|
|---|---|
|**Linha**|% de linhas executadas|
|**Branch**|% de caminhos de condicional|
|**Function**|% de funções chamadas|
|**Statement**|% de statements executados|

### 13.2 Armadilha

```typescript
function dividir(a: number, b: number): number {
  return a / b
}

it('divide dois números', () => {
  dividir(10, 2)  // 100% de cobertura. Zero assertions.
})
```

**100% de cobertura, mas zero verificação.** Cobertura mede execução, não validação. Por isso é métrica fraca.

### 13.3 Como Usar Cobertura Bem

- **Cobertura é dica de onde olhar**, não meta.
- Trechos com **baixa cobertura** são candidatos a testar.
- Trechos com **alta cobertura mas asserts ruins** são pior que zero cobertura — falsa confiança.
- Não force 100% — algumas linhas (error branches improváveis, defaults) não valem o esforço.

### 13.4 Meta Pragmática

Para projeto típico:

|Camada|Cobertura útil|
|---|---|
|`utils/` (cálculos)|90%+ — fácil de cobrir|
|`services/`|80%+ — vale o investimento|
|`hooks/`|70%+ — lógica complexa|
|Componentes|60%+ — foque em interação|
|Pages|Não persiga cobertura|

**Mas:** prefira menos código com asserts fortes a mais código com asserts vagos.

---

## 14. Comandos Úteis

```bash
# Watch mode (desenvolvimento)
npm run test

# Rodar uma vez (CI)
npm run test:run

# Com cobertura
npm run test:cov

# Filtrar por nome de arquivo
npx vitest perfil

# Filtrar por nome de teste
npx vitest -t "calcula total"

# Apenas testes relacionados a arquivos modificados (git)
npx vitest related --run
```

---

## 15. Checklist Antes de Commitar Teste

- [ ] Teste tem nome descritivo (frase declarativa)
- [ ] AAA visível (Arrange, Act, Assert separados)
- [ ] Pelo menos um `expect` por `it`
- [ ] Não depende de outros testes
- [ ] Usa `user-event`, não `fireEvent`
- [ ] Usa queries acessíveis (`getByRole`, `getByLabelText`)
- [ ] Mocks são mínimos (só dependências externas)
- [ ] `act` envolvendo mudanças de estado
- [ ] Roda em < 100ms (idealmente — testes lentos viram peso morto)
- [ ] Falha por motivo claro (mensagem útil)

---

## 16. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Lib de teste?|Vitest|
|Lib de componente?|Testing Library|
|Interação?|user-event (não fireEvent)|
|Cobertura ideal?|Variável. Foco em utils, hooks e fluxos críticos|
|Testar implementação?|Não. Teste comportamento|
|Atualizar teste falho?|Investigue primeiro|
|Snapshot?|Só pequenos. Não gigantes|
|Mock de tudo?|Não. Só dependências externas|

---

## 🔗 Módulos Relacionados

- [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md) — Hooks que são testados aqui
- [`13-ui-e-design-system.md`](https://claude.ai/chat/13-ui-e-design-system.md) — Componentes UI testados
- [`14-formularios-e-validacao.md`](https://claude.ai/chat/14-formularios-e-validacao.md) — Forms testados com user-event
- [`22-refatoracao.md`](https://claude.ai/processos/22-refatoracao.md) — Testes são rede de segurança para refatorar
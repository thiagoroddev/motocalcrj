---

description: "Convenções de código: idioma, nomenclatura, proibições, formatação, imports, comentários, tratamento de erros." modulo: "10" categoria: "padroes" versao: "1.0" relacionado:

- "01-nucleo.md"
- "11-arquitetura-e-pastas.md"
- "50-anti-padroes.md"

---

# 📝 Código e Convenções

> Convenções de superfície parecem detalhes, mas são o que torna um código-base **legível em escala**. Quando todo arquivo segue o mesmo padrão, seu cérebro economiza energia para o que importa: a lógica.

---

## 1. Idioma do Projeto

### 1.1 Princípio

Cada projeto adota **um único idioma** para tudo que é seu: variáveis, funções, componentes, tipos, comentários, testes, mensagens de commit, nomes de arquivos.

|Default geral do agente|Projeto atual|
|---|---|
|Inglês|Português|

**A decisão é feita uma vez, no início do projeto, e registrada em `docs/contexto-projeto-ai.md`.** Nunca se troca o idioma de um projeto vivo sem migração planejada.

### 1.2 O Que NÃO Conta como "Mistura"

APIs de bibliotecas externas vêm em inglês. Isso é inevitável e aceito:

```typescript
// ✅ Correto - projeto em português, API React em inglês
const [perfil, setPerfil] = useState<Perfil | null>(null)
const handleClickSalvar = useCallback(() => { /* ... */ }, [])

// ✅ Correto - projeto em inglês
const [profile, setProfile] = useState<Profile | null>(null)
const handleSaveClick = useCallback(() => { /* ... */ }, [])
```

A regra: **o que você nomeia é no idioma do projeto. O que a biblioteca expõe fica como ela expõe.**

### 1.3 O Que É Mistura (e Deve Ser Evitado)

```typescript
// ❌ Errado - projeto português misturado com inglês
const [userPerfil, setUserPerfil] = useState()  // userPerfil é portinglês
function calculateTotalGasto() { }              // verbo inglês + objeto português
const isAtivo = true                            // is + atributo PT

// ❌ Errado - projeto inglês com leak de português
const [profile, setPerfil] = useState()         // inconsistência interna
function calculateGastoTotal() { }              // mesma função, dois idiomas
```

### 1.4 Convenções para Boolean

|Idioma|Prefixos aceitos|Exemplo|
|---|---|---|
|Português|`eh`, `tem`, `deve`, `esta`, `pode`|`temSeguro`, `estaAtivo`, `podeEditar`|
|Inglês|`is`, `has`, `should`, `can`|`hasInsurance`, `isActive`, `canEdit`|

Booleans **nunca** começam por verbo no infinitivo (`verificar`, `validate`) - esses são nomes de função.

### 1.5 Migração de Idioma (raro mas possível)

Se o projeto precisar mudar de idioma, isso é uma decisão **Strict** (exige ADR). Nunca migre parcialmente - ou todo o código novo segue o idioma novo (com refatoração programada do antigo), ou não migra.

---

## 2. Nomenclatura

### 2.1 Tabela Completa

|Elemento|Convenção|Exemplo PT|Exemplo EN|
|---|---|---|---|
|Variável local|camelCase|`kmPorDia`|`kmPerDay`|
|Função|camelCase, verbo no início|`calcularTotal()`|`calculateTotal()`|
|Boolean|prefixo eh/tem/is/has + sujeito|`temSeguro`|`hasInsurance`|
|Componente React|PascalCase, substantivo|`PainelEstimativa`|`EstimatePanel`|
|Hook|`use` + PascalCase|`usePerfil`|`useProfile`|
|Tipo/Interface|PascalCase, sem prefixo `I`|`Perfil`|`Profile`|
|Enum|PascalCase|`StatusPedido`|`OrderStatus`|
|Constante global|UPPER_SNAKE_CASE|`LIMITE_ALERTA_KM`|`KM_ALERT_LIMIT`|
|Constante local|camelCase|`totalCalculado`|`calculatedTotal`|
|Arquivo de componente|PascalCase.tsx|`PainelEstimativa.tsx`|`EstimatePanel.tsx`|
|Arquivo de hook|usePascalCase.ts|`usePerfil.ts`|`useProfile.ts`|
|Arquivo de utilidade|camelCase.ts|`calculos.ts`|`calculations.ts`|
|Arquivo de tipos|camelCase.ts|`perfil.ts`|`profile.ts`|
|Pasta|kebab-case|`forma-pagamento/`|`payment-method/`|
|CSS class custom|kebab-case|`botao-primario`|`button-primary`|

### 2.2 Antiprefixos (não usar)

```typescript
// ❌ Não use prefixo `I` em interfaces
interface IPerfil { }   // herança Java, não é convenção TS

// ✅ Correto
interface Perfil { }

// ❌ Não use sufixo `Type` em tipos
type PerfilType = { }   // redundante

// ✅ Correto
type Perfil = { }

// ❌ Não use prefixo `_` em variáveis privadas
const _contador = 0     // TypeScript tem `private`, não precisa de convenção

// ✅ Correto
const contador = 0      // se for privado, use `private` na classe ou módulo
```

### 2.3 Convenção Especial: Error

Classes de erro **sempre** terminam em `Error`:

```typescript
// ✅ Correto
class PerfilNaoEncontradoError extends Error { }
class ValidacaoCpfError extends Error { }

// ❌ Errado
class PerfilNotFound extends Error { }      // sem sufixo Error
class CpfInvalido extends Error { }         // sem sufixo Error
```

### 2.4 Funções: Verbo + Objeto

Funções começam com verbo. Sempre.

```typescript
// ✅ Verbos no início
calcularTotal()
buscarPerfil()
validarCpf()
formatarMoeda()

// ❌ Sem verbo (parece propriedade)
total()
perfil()
cpf()
moeda()
```

---

## 3. Proibições Absolutas

Estas práticas são proibidas. Use as alternativas indicadas.

### 3.1 `any`

```typescript
// ❌ Proibido
function processar(dados: any) { }

// ✅ Use `unknown` + type guard
function processar(dados: unknown) {
  if (typeof dados !== 'object' || dados === null) {
    throw new ValidacaoError('Dados inválidos')
  }
  // agora dados é seguro
}

// ✅ Ou tipo genérico, se aplicável
function processar<T>(dados: T) { }
```

**Exceção aceita:** quando integrando com biblioteca externa sem tipos, e _com comentário explicando_:

```typescript
// any aqui porque a lib `legacy-parser` não exporta tipos.
// Vamos validar a saída com Zod logo após o parse.
const resultado = legacyParser.parse(input) as any
const validado = SchemaResultado.parse(resultado)
```

### 3.2 Acesso direto a `localStorage` / `sessionStorage`

```typescript
// ❌ Proibido em componente
function PainelPerfil() {
  const perfil = localStorage.getItem('perfil')  // acopla UI à infraestrutura
}

// ✅ Use serviço dedicado
// src/services/perfilStorage.ts
export const perfilStorage = {
  obter: (): Perfil | null => { /* ... */ },
  salvar: (perfil: Perfil): void => { /* ... */ },
  remover: (): void => { /* ... */ },
}

// No componente:
function PainelPerfil() {
  const perfil = perfilStorage.obter()
}
```

**Por quê:** trocar de localStorage para IndexedDB ou backend remoto vira mudança em 1 arquivo, não 30.

### 3.3 `useEffect` para derivar estado

```typescript
// ❌ Proibido
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(a + b)
}, [a, b])

// ✅ Cálculo direto
const total = a + b

// ✅ Ou useMemo se o cálculo for caro
const total = useMemo(() => calculoCaro(a, b), [a, b])
```

**Por quê:** `useEffect` para derivar causa re-render extra e abre janela para estado inconsistente entre `a + b` e `total`.

### 3.4 `key={index}` em listas dinâmicas

```typescript
// ❌ Proibido (se a lista pode reordenar, filtrar ou ter itens removidos)
{itens.map((item, i) => <Card key={i} dados={item} />)}

// ✅ Use ID estável
{itens.map(item => <Card key={item.id} dados={item} />)}
```

**Exceção aceita:** listas **completamente estáticas** que nunca reordenam, em renders triviais (ex: um menu com 4 itens hardcoded). Documente a decisão:

```typescript
// key={i} aceitável: lista estática, ordem nunca muda
const MENU_ITENS = ['Inicio', 'Sobre', 'Contato']
return MENU_ITENS.map((nome, i) => <li key={i}>{nome}</li>)
```

### 3.5 `dangerouslySetInnerHTML`

```typescript
// ❌ Proibido por padrão (risco de XSS)
<div dangerouslySetInnerHTML={{ __html: conteudoUsuario }} />

// ✅ Use componentes ou sanitize com biblioteca dedicada
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(conteudoUsuario) }} />
```

**Mesmo com sanitização**, exige justificativa explícita em comentário e revisão extra.

### 3.6 `console.log` em produção com dados pessoais

```typescript
// ❌ Proibido
console.log('Login:', { email, senha, cpf })  // vai parar no Sentry / DevTools

// ✅ Em dev sim, em prod nunca
if (import.meta.env.DEV) {
  console.log('Login attempt:', email)  // sem senha, sem CPF
}
```

### 3.7 Dados pessoais em URL

```typescript
// ❌ Proibido (URL fica em logs, histórico, referer)
navigate(`/perfil?cpf=${cpf}&email=${email}`)

// ✅ Use parâmetro de rota com ID opaco
navigate(`/perfil/${perfil.id}`)
```

### 3.8 Funções com 5+ parâmetros

```typescript
// ❌ Difícil de chamar, fácil de errar a ordem
function calcular(km, dias, preco, tipo, desconto, taxa) { }

// ✅ Objeto de opções
function calcular(opcoes: {
  km: number
  dias: number
  preco: number
  tipo: TipoVeiculo
  desconto?: number
  taxa?: number
}) { }
```

### 3.9 Z-index "mágicos"

```typescript
// ❌ Proibido
<div className="z-[9999]" />

// ✅ Use escala definida no tema
// tailwind.config.js: theme.extend.zIndex = { modal: 50, dropdown: 40, ... }
<div className="z-modal" />
```

### 3.10 Comentários que repetem o código

```typescript
// ❌ Ruído
// incrementa i
i++

// ✅ Comente *por que*, não *o que*
// Pulamos a primeira posição porque ela é o cabeçalho
i++
```

### 3.11 Confiar em narrowing através de closures

O TypeScript estreita o tipo após um guard no escopo onde ele aparece, mas **não propaga esse
narrowing para dentro de funções/closures definidas depois** — elas podem ser chamadas em outro
momento, então o tipo volta a incluir `undefined`. Isso passa no runtime mas quebra `tsc`.

```typescript
// ❌ Quebra o typecheck dentro do closure
const servico = lista.find((s) => s.ehAlvo)
if (!servico) throw new Error('faltou')

function montar() {
  return { id: servico.id } // erro: 'servico' é possibly 'undefined' aqui
}

// ✅ Fixe o valor garantido com um helper que retorna o tipo já estreitado
function exigir<T>(valor: T | undefined, mensagem: string): T {
  if (!valor) throw new Error(mensagem)
  return valor
}

const servico = exigir(
  lista.find((s) => s.ehAlvo),
  'serviço-alvo não encontrado',
)
// `servico` é T (sem undefined) e o tipo sobrevive dentro de qualquer closure
```

**Sinal de alerta:** sempre que um `.find()`/`.get()` seguido de guard for usado dentro de uma
função aninhada. Rode `npx tsc --noEmit` logo após escrever — não deixe para o fechamento.

---

## 4. Formatação

### 4.1 Ferramentas Padrão

|Ferramenta|Função|Configuração|
|---|---|---|
|**Prettier**|Formatação automática|`.prettierrc` na raiz|
|**ESLint**|Análise estática|`eslint.config.js` na raiz|
|**TypeScript**|Tipos|`tsconfig.json` com `strict: true`|
|**EditorConfig**|Consistência entre editores|`.editorconfig` na raiz|

### 4.2 Regras Padrão de Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Justificativa:** essas configurações são as mais comuns no ecossistema React. Se o projeto adotar outras, registre em `docs/contexto-projeto-ai.md`.

### 4.3 Largura Máxima de Linha

- **100 caracteres** é o teto recomendado.
- Linhas mais longas em strings ou URLs são aceitas.
- Linhas longas em código real são sinal de que a função/expressão precisa ser decomposta.

---

## 5. Comentários

### 5.1 Princípio

> Código bom é auto-documentado. Comentário existe para explicar **decisões**, não **mecânica**.

### 5.2 Quando Comentar

|Situação|Comente|
|---|---|
|Decisão não-óbvia ("por que assim e não assado")|✅ Sim|
|Workaround para bug de biblioteca|✅ Sim|
|Aviso de armadilha futura ("não otimize, já testamos")|✅ Sim|
|Trade-off aceito conscientemente|✅ Sim|
|Lógica que parece errada mas está certa|✅ Sim|

### 5.3 Quando NÃO Comentar

|Situação|Não comente|
|---|---|
|Código que descreve o que ele faz|❌ Não - refatore para nome claro|
|Comentário que vira mentira ao mudar código|❌ Não - sinal de que vai desatualizar|
|Marcar fim de bloco (`// fim do if`)|❌ Não - IDE faz isso|
|Mudanças com data ("alterado em 12/03")|❌ Não - usa Git para isso|

### 5.4 JSDoc - Quando Usar

Use JSDoc apenas em **APIs públicas** (funções exportadas usadas em outros módulos):

```typescript
/**
 * Calcula o custo total mensal considerando combustível, manutenção e seguro.
 *
 * @param perfil - Perfil do usuário com configurações de veículo
 * @returns Custo total em reais. Sempre >= 0.
 * @throws {ValidacaoError} Se o perfil não tiver km_por_dia definido
 */
export function calcularCustoMensal(perfil: Perfil): number { }
```

Funções privadas e componentes React **não precisam** de JSDoc - o tipo já documenta.

---

## 6. Imports

### 6.1 Ordem e Agrupamento

Imports são agrupados em blocos separados por linha em branco:

```typescript
// 1. Bibliotecas externas (node_modules)
import { useState, useEffect } from 'react'
import { z } from 'zod'

// 2. Imports absolutos do projeto (com alias @/)
import { Botao } from '@/components/ui/Botao'
import { perfilStorage } from '@/services/perfilStorage'

// 3. Imports relativos (mesma feature)
import { useDetalhamento } from './useDetalhamento'
import type { ItemDetalhamento } from './tipos'

// 4. Estilos (se houver imports de CSS)
import './estilo.css'
```

### 6.2 Paths Absolutos vs Relativos

|Use absoluto (`@/`) quando...|Use relativo (`./`) quando...|
|---|---|
|Cruzando pastas de domínio|Dentro da mesma feature/pasta|
|Importando de `services/`, `hooks/`, `utils/`|Importando componente filho|
|Importando tipos compartilhados|Importando arquivo irmão|

```typescript
// ✅ Cruzando domínios - absoluto
import { useAuth } from '@/hooks/useAuth'

// ✅ Mesma feature - relativo
import { CardItem } from './CardItem'
```

### 6.3 Barrel Imports - Cautela

Arquivos `index.ts` que reexportam tudo (`barrel files`) podem **inflar o bundle**:

```typescript
// ❌ Pode carregar 50 componentes só por causa de 1
import { Botao } from '@/components/ui'

// ✅ Import direto
import { Botao } from '@/components/ui/Botao'
```

**Exceção:** barrels são aceitáveis quando o tree-shaking do bundler está configurado e testado.

---

## 7. Tratamento de Erros

### 7.1 Princípios

1. **Nunca engula erro silenciosamente.** Sempre faça algo: relance, logue, mostre ao usuário.
2. **Erros têm classes específicas.** Não jogue `new Error('algo deu errado')` genérico.
3. **Distinga erros esperados de inesperados.** Validação de CPF é esperado; falha de rede é esperado; bug de código não é.

### 7.2 Hierarquia Recomendada

```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(public mensagem: string, public causa?: unknown) {
    super(mensagem)
    this.name = this.constructor.name
  }
}

// src/errors/ValidacaoError.ts
export class ValidacaoError extends AppError { }

// src/errors/NaoEncontradoError.ts
export class NaoEncontradoError extends AppError { }
```

### 7.3 O Que Não Fazer

```typescript
// ❌ Engolir erro
try {
  await salvarPerfil()
} catch {
  // silêncio
}

// ❌ Logar e continuar como se nada tivesse acontecido
try {
  await salvarPerfil()
} catch (e) {
  console.log(e)
}

// ❌ Lançar string
throw 'Algo deu errado'  // não é Error, perde stack trace

// ❌ Catch genérico que esconde tipos
try { } catch (e: any) { e.foo }
```

### 7.4 O Que Fazer

```typescript
// ✅ Tratar conforme o tipo
try {
  await salvarPerfil()
} catch (e) {
  if (e instanceof ValidacaoError) {
    setMensagemErro(e.mensagem)
    return
  }
  if (e instanceof NaoEncontradoError) {
    navegarPara('/login')
    return
  }
  // Erro inesperado: loga e mostra mensagem genérica
  console.error('Erro ao salvar perfil:', e)
  setMensagemErro('Não foi possível salvar. Tente novamente.')
}
```

---

## 8. Regra de Três (Abstrações)

> **Não crie abstração até a terceira duplicação.**

A primeira vez que um código aparece, escreva direto. A segunda vez, copie e cole - pode parecer feio mas é tolerável. **Só na terceira ocorrência você extrai a abstração** (função, hook, componente).

### 8.1 Por Que Esperar

Abstrações prematuras são piores que duplicação. Você tipicamente não sabe ainda _qual_ é a parte que deve ser comum e qual deve variar. Esperar a terceira ocorrência te dá três pontos de dados para identificar a verdadeira invariante.

### 8.2 Exemplo

```typescript
// 1ª vez - escreve direto
function FormCadastro() {
  return <input className="border rounded p-2" />
}

// 2ª vez - copia e cola, OK
function FormLogin() {
  return <input className="border rounded p-2" />
}

// 3ª vez - agora extrai
function CampoTexto({ className, ...props }) {
  return <input className={cn('border rounded p-2', className)} {...props} />
}
```

### 8.3 Exceção

Se você **sabe** que vai precisar 3+ vezes (ex: design system com 20 botões previstos), abstraia desde o início. A regra é guia contra _especulação_, não contra _conhecimento_.

---

## 9. Convenções de Commit

> Padrão recomendado: **Conventional Commits**.

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### 9.1 Tipos

|Tipo|Quando usar|
|---|---|
|`feat`|Nova funcionalidade|
|`fix`|Correção de bug|
|`refactor`|Refatoração (sem mudança de comportamento)|
|`docs`|Apenas documentação|
|`test`|Adicionar ou ajustar testes|
|`chore`|Manutenção (build, deps, configs)|
|`style`|Formatação, espaçamento (sem mudar lógica)|
|`perf`|Melhoria de performance|

### 9.2 Exemplos

```
feat(perfil): adicionar campo CPF com validação Zod
fix(calculos): corrigir overflow ao multiplicar km*30
refactor(pages): extrair PainelEstimativa para hook próprio
docs: atualizar README com instruções de setup
test(usePerfil): cobrir caso de perfil nulo
chore: atualizar Vite para 5.4
```

### 9.3 Por Que

- **Histórico legível** - você lê o log e entende o projeto.
- **Changelog automático** - ferramentas geram release notes.
- **Versionamento semântico** - `feat` = minor, `fix` = patch, `feat!` = major.

---

## 10. Resumo Rápido

|Categoria|Regra|
|---|---|
|Idioma|Um só por projeto, exceto APIs externas|
|Nomenclatura|camelCase para código, PascalCase para tipos/componentes|
|Tipos|Nunca `any`, sem prefixo `I`|
|Storage|Sempre via serviço, nunca direto|
|Efeitos|`useEffect` só para sincronização externa, não para derivar|
|Listas|Key estável, nunca índice (com raras exceções)|
|HTML inseguro|`dangerouslySetInnerHTML` proibido por padrão|
|Comentários|Por que sim, o que não|
|Imports|Externos → projeto → relativos → estilos|
|Erros|Classes específicas, nunca engolir|
|Abstração|Regra de Três|
|Commit|Conventional Commits|

---

## 🔗 Módulos Relacionados

- [`01-nucleo.md`](https://claude.ai/01-nucleo.md) - Princípios que orientam estas convenções
- [`11-arquitetura-e-pastas.md`](https://claude.ai/chat/11-arquitetura-e-pastas.md) - Onde colocar cada arquivo
- [`50-anti-padroes.md`](https://claude.ai/referencias/50-anti-padroes.md) - Catálogo completo de anti-padrões
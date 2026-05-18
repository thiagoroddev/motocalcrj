---

description: "Formulários e validação: react-hook-form, Zod, padrão de campo acessível, validação composta, formulários multi-step." modulo: "14" categoria: "padroes" versao: "1.0" relacionado:

- "12-react-e-estado.md"
- "13-ui-e-design-system.md"
- "15-testes.md"
- "18-seguranca-privacidade.md"

---

# 📝 Formulários e Validação

> Formulários são onde **mais bugs de UX moram**. É onde o usuário mais erra, onde mais validação acontece e onde acessibilidade mais importa. Um formulário bem construído **previne** erros, em vez de só reportá-los. Comunica claramente o que está errado e como corrigir.

---

## 1. Princípios Fundamentais

### 1.1 Controlled vs Uncontrolled

**Componente controlled:** o valor mora no React (`useState`), o React renderiza, e cada keystroke faz `setState`.

```tsx
// Controlled
const [nome, setNome] = useState('')
<input value={nome} onChange={e => setNome(e.target.value)} />
```

**Componente uncontrolled:** o valor mora no DOM, o React não sabe das mudanças. Você lê quando precisa (via `ref` ou ao submeter).

```tsx
// Uncontrolled
const ref = useRef<HTMLInputElement>(null)
<input ref={ref} defaultValue="" />
// Para ler: ref.current?.value
```

|Característica|Controlled|Uncontrolled|
|---|---|---|
|Re-render por tecla|Sim|Não|
|Validação reativa|Fácil|Manual|
|Performance em forms grandes|Pior|Melhor|
|Integração com libs externas|Mais difícil|Mais fácil|

**`react-hook-form` é uncontrolled por padrão**, com reatividade opcional onde você precisar. Isso resolve o trade-off: performance de uncontrolled + DX de controlled.

### 1.2 A Stack Recomendada

|Função|Biblioteca|Por quê|
|---|---|---|
|Gerenciamento de campos|`react-hook-form`|Uncontrolled, performático, integra com tudo|
|Validação e schemas|`zod`|Schema-first, type-safe, tipos derivados|
|Adaptador entre eles|`@hookform/resolvers`|Conecta zod ao rhf|

Alternativas existem (Formik + Yup, Final Form, Conform), mas a combinação **rhf + Zod** é a mais comum no ecossistema React moderno.

### 1.3 Princípio: Validação no Cliente E no Servidor

Validação do cliente **melhora UX**, não **garante segurança**. Tudo que vem do cliente é não-confiável. Repita a validação no servidor (mesmo schema Zod, se possível).

Detalhes de segurança em [`18-seguranca-privacidade.md`](https://claude.ai/chat/18-seguranca-privacidade.md).

---

## 2. Zod: Schemas e Tipos

Zod é uma biblioteca de validação **schema-first**: você define o formato dos dados, e a partir do schema você obtém validação **em runtime** e tipos **em compile-time**.

### 2.1 Instalação

```bash
npm install zod
```

### 2.2 Schema Básico

```typescript
import { z } from 'zod'

const schemaPerfil = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  idade: z.number().int().positive('Idade deve ser positiva').optional(),
})
```

### 2.3 A Regra de Ouro: Zod como Fonte da Verdade

Em vez de definir tipo + schema separadamente, **derive o tipo do schema**:

```typescript
// ❌ Errado — duplica a verdade
type Perfil = {
  nome: string
  email: string
  idade?: number
}

const schemaPerfil = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  idade: z.number().int().optional(),
})

// ✅ Certo — schema é a fonte da verdade
const schemaPerfil = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  idade: z.number().int().optional(),
})

type Perfil = z.infer<typeof schemaPerfil>
// Perfil é automaticamente: { nome: string, email: string, idade?: number | undefined }
```

**Por que isso importa:**

- Mudou o schema? O tipo muda junto. Sem chance de desincronizar.
- Renomeou campo? O TypeScript te avisa em todo lugar que usa.
- Adicionou validação? Não precisa atualizar tipo separadamente.

### 2.4 Mensagens em Português

Por padrão, Zod usa mensagens em inglês. Para PT, você pode passar mensagens manualmente em cada validação (visto acima) ou configurar globalmente:

```typescript
// src/lib/zodSetup.ts
import { z } from 'zod'

const mensagensPT: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') return { message: 'Campo obrigatório' }
    if (issue.expected === 'number') return { message: 'Deve ser um número' }
  }
  if (issue.code === z.ZodIssueCode.too_small && issue.type === 'string') {
    return { message: `Deve ter ao menos ${issue.minimum} caracteres` }
  }
  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === 'email') {
    return { message: 'Email inválido' }
  }
  return { message: ctx.defaultError }
}

z.setErrorMap(mensagensPT)
```

Importe esse arquivo uma vez no `main.tsx` do projeto.

### 2.5 Composição e Reuso

Schemas compõem como qualquer dado TypeScript:

```typescript
const schemaEndereco = z.object({
  rua: z.string().min(1),
  cidade: z.string().min(1),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
})

const schemaPerfilCompleto = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  endereco: schemaEndereco,  // composição
  enderecoEntrega: schemaEndereco.optional(),  // reuso opcional
})
```

### 2.6 Validações Customizadas

```typescript
// Refinement: validação customizada com mensagem própria
const schemaSenha = z.string()
  .min(8, 'Senha deve ter ao menos 8 caracteres')
  .refine(s => /[A-Z]/.test(s), 'Senha deve conter uma letra maiúscula')
  .refine(s => /\d/.test(s), 'Senha deve conter um número')

// Validação cruzada entre campos
const schemaCadastro = z.object({
  senha: z.string().min(8),
  confirmacaoSenha: z.string(),
}).refine(
  data => data.senha === data.confirmacaoSenha,
  {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha'],  // associa o erro a este campo
  }
)
```

---

## 3. react-hook-form: Conceitos Centrais

### 3.1 Instalação

```bash
npm install react-hook-form @hookform/resolvers
```

### 3.2 Anatomia de um Formulário

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Schema = fonte da verdade
const schemaLogin = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

type FormLogin = z.infer<typeof schemaLogin>

// 2. Componente
export function FormularioLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormLogin>({
    resolver: zodResolver(schemaLogin),
    mode: 'onBlur',  // valida ao sair do campo
  })

  const onSubmit = async (dados: FormLogin) => {
    await fazerLogin(dados)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          {...register('email')}
          aria-describedby={errors.email ? 'email-erro' : undefined}
          aria-invalid={!!errors.email}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.email && (
          <span id="email-erro" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          {...register('senha')}
          aria-describedby={errors.senha ? 'senha-erro' : undefined}
          aria-invalid={!!errors.senha}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.senha && (
          <span id="senha-erro" role="alert" className="text-sm text-destructive">
            {errors.senha.message}
          </span>
        )}
      </div>

      <Botao type="submit" carregando={isSubmitting}>
        Entrar
      </Botao>
    </form>
  )
}
```

### 3.3 Análise Linha por Linha

**`useForm<FormLogin>`** O genérico recebe o tipo dos dados. Como `FormLogin = z.infer<typeof schemaLogin>`, está conectado ao schema.

**`resolver: zodResolver(schemaLogin)`** O resolver é a ponte entre rhf e Zod. Quando o form vai validar, ele usa o schema Zod.

**`mode: 'onBlur'`** Quando validar. Discutido na [seção 5](https://claude.ai/chat/7ad9cd8a-fc76-4046-a5d6-651d4752358b#5-quando-validar-onblur-onchange-onsubmit).

**`{...register('email')}`** A função `register` retorna `name`, `ref`, `onChange`, `onBlur`. Espalhar no input conecta o campo ao form.

**`handleSubmit(onSubmit)`** Embrulha seu callback. Só chama `onSubmit` se o form passa na validação. Os dados vêm já tipados.

**`errors.email`** Acesso aos erros do campo. `errors.email.message` é a mensagem do Zod.

**`aria-describedby` e `aria-invalid`** Associam o erro ao campo para screen readers. Cobertos em detalhe na [seção 4](https://claude.ai/chat/7ad9cd8a-fc76-4046-a5d6-651d4752358b#4-padr%C3%A3o-de-campo-acess%C3%ADvel).

**`role="alert"`** Faz o screen reader anunciar o erro imediatamente quando aparece.

**`isSubmitting`** Estado interno do rhf. Verdadeiro enquanto o `onSubmit` (async) ainda não resolveu. Usa para desabilitar o botão.

---

## 4. Padrão de Campo Acessível

O exemplo acima tem muito código repetido (label + input + erro + aria). Vamos abstrair em um componente.

### 4.1 Componente `CampoFormulario`

```tsx
// src/components/ui/CampoFormulario.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CampoFormularioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
  dica?: string
  obrigatorio?: boolean
}

export const CampoFormulario = forwardRef<HTMLInputElement, CampoFormularioProps>(
  ({ label, erro, dica, obrigatorio, id, className, ...props }, ref) => {
    const idCampo = id ?? `campo-${label.toLowerCase().replace(/\s/g, '-')}`
    const idErro = `${idCampo}-erro`
    const idDica = `${idCampo}-dica`

    const describedBy = [
      erro && idErro,
      dica && idDica,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="space-y-1">
        <label htmlFor={idCampo} className="block text-sm font-medium">
          {label}
          {obrigatorio && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
        </label>

        {dica && !erro && (
          <p id={idDica} className="text-sm text-muted-foreground">
            {dica}
          </p>
        )}

        <input
          ref={ref}
          id={idCampo}
          aria-describedby={describedBy}
          aria-invalid={!!erro}
          aria-required={obrigatorio}
          className={cn(
            'block w-full rounded-md border px-3 py-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            erro && 'border-destructive',
            className
          )}
          {...props}
        />

        {erro && (
          <span id={idErro} role="alert" className="text-sm text-destructive">
            {erro}
          </span>
        )}
      </div>
    )
  }
)

CampoFormulario.displayName = 'CampoFormulario'
```

### 4.2 Uso Simplificado

```tsx
<CampoFormulario
  label="Email"
  type="email"
  inputMode="email"
  autoComplete="email"
  obrigatorio
  erro={errors.email?.message}
  {...register('email')}
/>
```

Comparado ao código original, é muito menos repetição. E como o componente garante ARIA correto, você não tem como esquecer.

### 4.3 Princípios do Padrão

|Princípio|Como aplicado|
|---|---|
|Label sempre visível|`<label>` antes do input, nunca confiar só em placeholder|
|Label associado|`htmlFor` apontando para o id do input|
|Erro associado|`aria-describedby` apontando para o `<span>` do erro|
|Erro anunciado|`role="alert"` faz screen reader anunciar|
|Campo inválido|`aria-invalid="true"` quando há erro|
|Campo obrigatório|`aria-required="true"` + indicador visual|
|Foco visível|`focus-visible:ring-2` claro|
|`inputMode` correto|Numérico, email, etc. — afeta teclado mobile|
|`autoComplete` semântico|Permite browser sugerir valores corretos|

### 4.4 Sobre Placeholders

Placeholders **não substituem labels**. Eles servem como exemplo, não como rótulo:

```tsx
// ❌ Placeholder como label — desaparece quando começa a digitar
<input placeholder="Email" />

// ✅ Label + placeholder com exemplo
<CampoFormulario
  label="Email"
  placeholder="exemplo@email.com"
/>
```

---

## 5. Quando Validar: onBlur, onChange, onSubmit

`react-hook-form` aceita 5 modos: `onSubmit`, `onBlur`, `onChange`, `onTouched`, `all`. Cada um tem trade-offs.

### 5.1 Comparação

|Modo|Quando valida|Sentimento|
|---|---|---|
|`onSubmit` (padrão)|Só ao tentar enviar|Permissivo. Usuário descobre erros tarde|
|`onBlur`|Ao sair do campo|Equilibrado. Erro aparece quando faz sentido|
|`onChange`|A cada tecla|Reativo. Pode ser ansiedade visual|
|`onTouched`|Após primeiro blur, depois onChange|Combinação inteligente|
|`all`|Onblur + onChange|Mais agressivo|

### 5.2 Recomendação Padrão

```typescript
useForm({
  mode: 'onBlur',
  reValidateMode: 'onChange',  // após primeiro erro, valida a cada tecla
})
```

**Por quê:**

- Usuário digita sem interrupção
- Sai do campo → vê erro se houver
- Volta a digitar para corrigir → erro some quando válido (sem precisar sair)

### 5.3 Exceções

- **Campos de senha:** `onChange` para feedback de força em tempo real
- **Validações de unicidade (email existe?):** `onBlur` com debounce
- **Forms muito longos (10+ campos):** `onSubmit` puro, valida tudo de uma vez no fim

---

## 6. Erros do Servidor

Validação client + Zod cobre formato. Mas o servidor pode rejeitar por outras razões: email já cadastrado, CPF bloqueado, regra de negócio violada.

### 6.1 Mostrar Erro Global

```tsx
const [erroServidor, setErroServidor] = useState<string | null>(null)

const onSubmit = async (dados: FormCadastro) => {
  setErroServidor(null)
  try {
    await criarConta(dados)
  } catch (e) {
    if (e instanceof ConflitoError) {
      setErroServidor(e.mensagem)
      return
    }
    setErroServidor('Erro inesperado. Tente novamente.')
  }
}

// No JSX, antes do form ou botão:
{erroServidor && (
  <div role="alert" className="p-3 rounded bg-destructive/10 text-destructive">
    {erroServidor}
  </div>
)}
```

### 6.2 Associar Erro a Campo Específico

Quando o servidor diz qual campo errou (ex: "email já cadastrado"), use `setError` do rhf:

```tsx
const { register, handleSubmit, formState, setError } = useForm()

const onSubmit = async (dados) => {
  try {
    await criarConta(dados)
  } catch (e) {
    if (e instanceof EmailJaCadastradoError) {
      setError('email', {
        type: 'server',
        message: 'Este email já está em uso',
      })
      return
    }
    // ... outros erros
  }
}
```

O erro aparece no campo certo, como se fosse validação local. UX consistente.

---

## 7. Formulários Multi-Step

Para fluxos longos, divida em etapas. Cada etapa valida sua parte; o final agrega tudo.

### 7.1 Estratégia

```typescript
// Schemas por etapa
const schemaEtapa1 = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
})

const schemaEtapa2 = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
  endereco: z.string().min(1),
})

// Schema completo (composição)
const schemaCompleto = schemaEtapa1.merge(schemaEtapa2)

type Etapa1 = z.infer<typeof schemaEtapa1>
type Etapa2 = z.infer<typeof schemaEtapa2>
type FormCompleto = z.infer<typeof schemaCompleto>
```

### 7.2 Hook que Gerencia o Estado

```typescript
// src/hooks/useCadastroMultiStep.ts
import { useState } from 'react'

export function useCadastroMultiStep() {
  const [etapa, setEtapa] = useState(1)
  const [dadosEtapa1, setDadosEtapa1] = useState<Etapa1 | null>(null)
  const [dadosEtapa2, setDadosEtapa2] = useState<Etapa2 | null>(null)

  const avancarParaEtapa2 = (dados: Etapa1) => {
    setDadosEtapa1(dados)
    setEtapa(2)
  }

  const finalizar = async (dados: Etapa2) => {
    setDadosEtapa2(dados)
    if (!dadosEtapa1) throw new Error('Etapa 1 incompleta')

    const completo: FormCompleto = { ...dadosEtapa1, ...dados }
    await enviarCadastro(completo)
  }

  const voltar = () => setEtapa(e => Math.max(1, e - 1))

  return {
    etapa,
    dadosEtapa1,
    dadosEtapa2,
    avancarParaEtapa2,
    finalizar,
    voltar,
  }
}
```

### 7.3 Cada Etapa É um Formulário Independente

```tsx
function EtapaUm({ onAvancar, valoresIniciais }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Etapa1>({
    resolver: zodResolver(schemaEtapa1),
    defaultValues: valoresIniciais ?? undefined,
  })

  return (
    <form onSubmit={handleSubmit(onAvancar)}>
      {/* ... campos ... */}
      <Botao type="submit">Avançar</Botao>
    </form>
  )
}
```

### 7.4 Boas Práticas

- **Indicador visual de progresso** (1 de 3, 2 de 3)
- **Permitir voltar** sem perder dados
- **Salvar rascunho** se o form é longo (localStorage)
- **Não esconder etapas restantes** — deixe usuário saber quanto falta

---

## 8. Padrões Adicionais

### 8.1 Campos Condicionais

```tsx
const { watch, register } = useForm()
const temConjugue = watch('temConjugue')

return (
  <>
    <input type="checkbox" {...register('temConjugue')} />
    {temConjugue && (
      <CampoFormulario label="Nome do cônjuge" {...register('nomeConjugue')} />
    )}
  </>
)
```

`watch` é reativo — re-renderiza quando o valor muda. Use com moderação em forms grandes (cada watch causa re-render).

### 8.2 Arrays Dinâmicos (`useFieldArray`)

```tsx
const { control, register } = useForm<{ telefones: { numero: string }[] }>()
const { fields, append, remove } = useFieldArray({ control, name: 'telefones' })

return (
  <>
    {fields.map((field, index) => (
      <div key={field.id}>
        <CampoFormulario
          label={`Telefone ${index + 1}`}
          {...register(`telefones.${index}.numero`)}
        />
        <button type="button" onClick={() => remove(index)}>Remover</button>
      </div>
    ))}
    <button type="button" onClick={() => append({ numero: '' })}>
      Adicionar telefone
    </button>
  </>
)
```

### 8.3 Reset do Form

```tsx
const { reset } = useForm()

// Após sucesso:
reset()  // limpa tudo

// Ou com novos valores:
reset({ nome: 'João', email: 'joao@email.com' })
```

### 8.4 Valores Padrão Assíncronos

Quando os valores vêm de uma API:

```tsx
const { data: perfil } = useQuery({ /* ... */ })

const { register, reset } = useForm<Perfil>({
  resolver: zodResolver(schemaPerfil),
})

useEffect(() => {
  if (perfil) reset(perfil)
}, [perfil, reset])
```

---

## 9. Checklist Antes de Commitar Formulário

- [ ] Schema Zod definido como fonte da verdade
- [ ] Tipo derivado via `z.infer`
- [ ] Cada campo tem `<label>` associado via `htmlFor`
- [ ] Cada erro tem `id` e está em `aria-describedby` do campo
- [ ] Campos com erro têm `aria-invalid="true"`
- [ ] Erros têm `role="alert"`
- [ ] `inputMode` correto (numeric, email, tel)
- [ ] `autoComplete` semântico em campos relevantes
- [ ] Botão de submit desabilitado durante `isSubmitting`
- [ ] Mensagens em português (com configuração Zod ou inline)
- [ ] Validação server-side existe (não confiar só no cliente)
- [ ] Erros de servidor são tratados e exibidos
- [ ] Campos sensíveis (senha, CPF) não aparecem em logs
- [ ] Sem dados pessoais em URLs

---

## 10. Resumo Rápido

|Pergunta|Resposta|
|---|---|
|Lib de form?|react-hook-form|
|Lib de validação?|Zod|
|Tipo do form?|`z.infer<typeof schema>` — nunca duplique|
|Quando validar?|`onBlur` + `reValidateMode: 'onChange'`|
|Label opcional?|Nunca. Sempre visível e associada|
|Placeholder como label?|Não. Placeholder é exemplo|
|Erro associado ao campo?|Sim, via `aria-describedby` e `aria-invalid`|
|Validar só no client?|Não. Sempre repita no server|
|Forms longos?|Divida em etapas (multi-step)|

---

## 🔗 Módulos Relacionados

- [`12-react-e-estado.md`](https://claude.ai/chat/12-react-e-estado.md) — Hooks de feature que coordenam forms complexos
- [`13-ui-e-design-system.md`](https://claude.ai/chat/13-ui-e-design-system.md) — Componentes UI consumidos pelos campos
- [`15-testes.md`](https://claude.ai/chat/15-testes.md) — Como testar formulários com user-event
- [`18-seguranca-privacidade.md`](https://claude.ai/chat/18-seguranca-privacidade.md) — Validação no servidor e dados sensíveis
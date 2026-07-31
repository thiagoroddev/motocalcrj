---

description: "Catálogo procurável de anti-padrões consolidados de todos os módulos. Cada entrada com sintoma, motivo e conserto." modulo: "50" categoria: "referencias" versao: "1.0" relacionado:

- "40-revisao-rapida.md"

---

# 🚫 Anti-Padrões: Catálogo

> Decisões repetidamente ruins que aparecem em códigos diferentes pelo mesmo motivo cognitivo. Cada entrada: **Nome → Sintoma → Por que é ruim → Conserto → Referência ao módulo**.

---

## Como Usar Este Catálogo

- **Procura por nome:** Ctrl+F com termos em inglês (`God Component`, `Magic Number`) ou portugues
- **Procura por sintoma:** ver a coluna "Sintoma" das tabelas
- **Vê referência no módulo:** para entender o padrão correto, siga o link

Cada anti-padrão tem nível de gravidade:

|Nível|Significado|
|---|---|
|🔴|**Crítico** - vira bug ou risco real|
|🟡|**Importante** - manutenção cara, bugs prováveis|
|🟢|**Cosmético** - feio mas funciona|

---

## 1. Código e Convenções

> Detalhes do padrão correto: [módulo 10](https://claude.ai/padroes/10-codigo-e-convencoes.md)

### 🟡 Mistura de Idiomas

**Sintoma:** Algumas variáveis em inglês (`name`, `total`), outras em português (`nome`, `total`) no mesmo projeto. **Por que é ruim:** Cognição constante traduzindo, bugs em refatoração, busca por nome falha (`usuario` ≠ `user`). **Conserto:** Decidir um idioma e padronizar. Convenção registrada em `docs/contexto-projeto-ai.md`.

### 🔴 `any` Sem Justificativa

**Sintoma:** `const dados: any = ...` ou `function f(x: any)`. **Por que é ruim:** Anula benefícios do TypeScript. Erros típicos passam silenciosamente. **Conserto:** Use o tipo correto. Se desconhecido, `unknown` + narrowing. `any` só com comentário justificando.

### 🟡 Magic Numbers

**Sintoma:** `if (km > 30000)`, `* 52`, `+ 0.05` direto no código. **Por que é ruim:** Quem lê não sabe o que o número significa. Mudança requer caçar ocorrências. **Conserto:** Constantes nomeadas: `const LIMITE_KM_CRITICO = 30000`. Em `data/` ou `config/` se compartilhada.

### 🟡 Long Parameter List

**Sintoma:** `function f(a, b, c, d, e, f, g)`. **Por que é ruim:** Ordem importa, parâmetros opcionais ficam confusos, autocomplete inútil. **Conserto:** Objeto de opções: `function f({ a, b, c, d, e, f, g })`. Especialmente para 5+ parâmetros.

### 🟢 Comments Explaining Code

**Sintoma:** `// soma a e b` em `return a + b`. `// converte para minúsculo` em `.toLowerCase()`. **Por que é ruim:** Ruído. Comentário não-redundante explicaria **por quê**, não o quê. **Conserto:** Renomear função/variável para auto-explicar. Comentário só onde a intenção não é óbvia.

### 🟢 Código Comentado "Para Voltar Depois"

**Sintoma:** Bloco de código entre `/* ... */` deixado no commit. **Por que é ruim:** Confunde quem lê. Git já lembra de tudo. **Conserto:** Delete. Se realmente precisa, anote em `divida-tecnica.md`.

---

## 2. Arquitetura e Pastas

> Detalhes do padrão correto: [módulo 11](https://claude.ai/padroes/11-arquitetura-e-pastas.md)

### 🟡 Componente Específico de Domínio em `components/ui/`

**Sintoma:** `components/ui/CardCliente.tsx`, `components/ui/FormularioPedido.tsx`. **Por que é ruim:** Mistura conceitos. `ui/` deveria ser portátil; componente de domínio não é. **Conserto:** Mover para `components/[dominio]/CardCliente.tsx`. Reservar `ui/` para genéricos.

### 🔴 Componente Acessando `localStorage` Direto

**Sintoma:** `localStorage.getItem('perfil')` dentro de um componente React. **Por que é ruim:** Acoplamento direto a infraestrutura, dificulta teste, mudança de storage quebra muitos arquivos. **Conserto:** Serviço isolado em `services/[nome]Storage.ts` que componente consome.

### 🟡 Lógica de Negócio na Page

**Sintoma:** `PaginaPerfil.tsx` com 200 linhas, 4 `useState`, funções de cálculo. **Por que é ruim:** Page deveria ser composição de JSX. Lógica espalhada dificulta reuso e teste. **Conserto:** Extrair lógica para hook de feature (`usePerfil`). Page consome via `vm`.

### 🟡 Tipos Espalhados em Vários Lugares

**Sintoma:** Mesmo tipo `Cliente` definido em 3 arquivos diferentes, com pequenas diferenças. **Por que é ruim:** Drift entre versões, código duplicado, refatoração frágil. **Conserto:** Tipos compartilhados em `types/`. Cada tipo tem um arquivo canônico.

### 🟡 Pasta Genérica Demais (`utils/` ou `helpers/`)

**Sintoma:** Pasta com 30+ arquivos de tudo: formatação, validação, math, string. **Por que é ruim:** Difícil encontrar, fácil duplicar. **Conserto:** Subpastas semânticas (`utils/formatters/`, `utils/validators/`) ou movimentar para domínio quando aplicável.

---

## 3. React e Estado

> Detalhes do padrão correto: [módulo 12](https://claude.ai/padroes/12-react-e-estado.md)

### 🔴 `useEffect` Para Derivar Estado

**Sintoma:**

```tsx
const [total, setTotal] = useState(0)
useEffect(() => setTotal(a + b), [a, b])
```

**Por que é ruim:** 2 renders em vez de 1, estado "fantasma" pode dessincronizar, código mais complexo. **Conserto:** Cálculo direto: `const total = a + b`. Ou `useMemo` se custoso.

### 🔴 `useEffect` Para Sincronizar `useState`s

**Sintoma:**

```tsx
const [nome, setNome] = useState('')
const [nomeMaiusculo, setNomeMaiusculo] = useState('')
useEffect(() => setNomeMaiusculo(nome.toUpperCase()), [nome])
```

**Por que é ruim:** Mesmo problema do anterior, pior - 2 fontes de verdade. **Conserto:** Uma única fonte: `const nomeMaiusculo = nome.toUpperCase()`.

### 🟡 Setter Exposto Em Vez de Handler

**Sintoma:** Hook retorna `{ filtros, setFiltros }` e a page faz `setFiltros(prev => ...)`. **Por que é ruim:** Page conhece estrutura interna; mudança no formato interno quebra muitos pontos. **Conserto:** Hook retorna handler nomeado: `{ filtros, alternarFiltro }`. Page chama `alternarFiltro(id)`.

### 🟡 Key Como `index`

**Sintoma:** `{items.map((item, i) => <li key={i}>...</li>)}` em lista que pode ser reordenada/filtrada. **Por que é ruim:** React reusa elemento errado, estado interno (foco, input) embaralha. **Conserto:** Key estável e única: `key={item.id}`. Se não há ID, gere ao criar.

### 🟡 `useEffect` Sem Dependências (`[]`)

**Sintoma:** `useEffect(() => doSomething(x, y), [])` quando o effect usa `x` e `y`. **Por que é ruim:** Stale closure: usa valores antigos de `x` e `y`. Bug silencioso. **Conserto:** Liste dependências corretamente: `[x, y]`. Linter `react-hooks/exhaustive-deps` ajuda.

### 🟡 Hook Customizado Com Retorno Gigante

**Sintoma:** Hook retorna 20 coisas (states, setters, handlers, derivações...). **Por que é ruim:** Interface confusa, page consome mais do que precisa, re-render excessivo. **Conserto:** Interface mínima - só o que JSX consome. Se realmente precisa de 20, divida em sub-hooks compostos.

### 🟡 Mutação Direta de State

**Sintoma:** `items.push(novo)`, `obj.x = y` e depois `setItems(items)`. **Por que é ruim:** React compara por referência. Mesmo array/objeto = não re-renderiza. **Conserto:** Sempre nova referência: `setItems([...items, novo])`, `setObj({ ...obj, x: y })`.

### 🟢 `useMemo` em Cálculo Trivial

**Sintoma:** `const total = useMemo(() => a + b, [a, b])`. **Por que é ruim:** Custo de memoização > custo do cálculo. Adiciona complexidade sem ganho. **Conserto:** Cálculo direto. `useMemo` apenas para cálculos caros (filter/sort/reduce de centenas de itens).

### 🟢 `useCallback` Em Tudo

**Sintoma:** Toda função handler envolvida em `useCallback`, mesmo as usadas só no JSX local. **Por que é ruim:** Custo de comparação > ganho. Complica leitura. **Conserto:** `useCallback` apenas onde a função é prop de componente memoizado ou dependência de hook.

---

## 4. UI e Design System

> Detalhes do padrão correto: [módulo 13](https://claude.ai/padroes/13-ui-e-design-system.md)

### 🟡 Componente UI Sem `className`

**Sintoma:** `<MeuBotao>` que não aceita `className` como prop. **Por que é ruim:** Não permite ajuste contextual. Fica engessado. **Conserto:** Aceitar `className` e mergiá-la com classes internas (use `cn()` utilitário).

### 🟡 Prop Hell em Vez de Variantes

**Sintoma:** `<Botao primario destrutivo grande comIcone destacado>` (muitos props booleanos). **Por que é ruim:** Combinações inválidas possíveis, explosão de casos. **Conserto:** Variantes declarativas: `<Botao variante="primario" tamanho="grande">`.

### 🟡 Cor Hex Direto

**Sintoma:** `bg-[#3D8BFF]` ou `style={{ color: '#3D8BFF' }}` espalhado. **Por que é ruim:** Mudança de tema requer caçar ocorrências. Sem consistência. **Conserto:** Tokens do design system: `bg-primary`, `text-foreground`. Definidos em `tailwind.config.ts`.

### 🟡 Inline Styles Sem Motivo

**Sintoma:** `style={{ padding: '12px', fontWeight: 600 }}` em vez de classes. **Por que é ruim:** Sem benefício de purge/JIT, inconsistência com sistema, override difícil. **Conserto:** Use classes Tailwind. Inline só para valores genuinamente dinâmicos (`style={{ width: porcento + '%' }}`).

### 🟢 `forwardRef` Em Tudo

**Sintoma:** `forwardRef` em componentes sem interação (Skeleton, Spinner). **Por que é ruim:** Ruído sem benefício. `forwardRef` faz sentido em focáveis. **Conserto:** Use `forwardRef` apenas em componentes que envolvem input/button/textarea/elementos focáveis.

---

## 5. Formulários e Validação

> Detalhes do padrão correto: [módulo 14](https://claude.ai/padroes/14-formularios-e-validacao.md)

### 🟡 Validação Manual em Vez de Zod

**Sintoma:** `if (email.includes('@'))` espalhado por formulários. **Por que é ruim:** Validação inconsistente, sem tipos derivados, erros mal-formatados. **Conserto:** Schema Zod. Validação no `zodResolver` do react-hook-form.

### 🟡 Tipo Duplicado de Form

**Sintoma:** Tipo TypeScript `CadastroFormData` escrito manualmente, e schema Zod separado. **Por que é ruim:** Duas fontes de verdade. Drift inevitável. **Conserto:** Schema Zod único. Tipo derivado: `type CadastroFormData = z.infer<typeof cadastroSchema>`.

### 🟡 Placeholder em Vez de Label

**Sintoma:** `<input placeholder="Email" />` sem `<label>` visível. **Por que é ruim:** Quando digita, placeholder some - usuário esquece o que era o campo. Inacessível. **Conserto:** `<label htmlFor="email">Email</label>` + `<input id="email" />`. Placeholder pode complementar mas não substitui.

### 🟡 Mensagem de Erro Vaga

**Sintoma:** "Inválido", "Erro", "Campo obrigatório" sem especificar. **Por que é ruim:** Usuário fica perdido sobre como corrigir. **Conserto:** Específico: "CPF deve ter 11 dígitos numéricos", "Email deve incluir @ e domínio".

---

## 6. Testes

> Detalhes do padrão correto: [módulo 15](https://claude.ai/padroes/15-testes.md)

### 🟡 Testes de Implementação

**Sintoma:** Teste que checa estado interno (`useState` específico) ou método interno (mock de função privada). **Por que é ruim:** Refatoração quebra testes mesmo com comportamento preservado. **Conserto:** Teste **comportamento**. "Quando clica em X, mostra Y" - não "chama setState com valor Z".

### 🟡 Mock Excessivo

**Sintoma:** Teste mocka 15 coisas para testar 1 função. **Por que é ruim:** Teste vira ficção. Quase nada do código real está rodando. **Conserto:** Mock apenas o necessário (rede, tempo, storage). Mantenha o resto real.

### 🟢 Nomenclatura Vaga

**Sintoma:** `it('should work')`, `it('test 1')`. **Por que é ruim:** Falha de teste não diz o que quebrou. Difícil entender intenção. **Conserto:** Nome descritivo: `it('renderiza erro quando email é inválido')`. Frase completa em português.

### 🟡 Setup Repetitivo em Cada Teste

**Sintoma:** 10 testes começam com as mesmas 20 linhas de setup. **Por que é ruim:** Manutenção cara. Mudança no setup precisa replicar em 10 lugares. **Conserto:** Extrair em `beforeEach` ou função helper. Cuidado para não esconder demais (legibilidade).

### 🟡 Sem Edge Cases

**Sintoma:** Teste só cobre "caminho feliz". **Por que é ruim:** Bugs aparecem nas bordas (vazio, null, máximo, erro). **Conserto:** Para cada função, teste: caminho feliz + vazio + null/undefined + máximo + erro de rede.

---

## 7. Performance e Acessibilidade

> Detalhes: [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md), checklists [42](https://claude.ai/chat/42-acessibilidade.md) e [43](https://claude.ai/chat/43-performance.md)

### 🟡 Otimização Prematura

**Sintoma:** Memoização agressiva, code splitting em tudo, sem medição. **Por que é ruim:** Código mais complexo, mais bugs, sem ganho real. **Conserto:** Meça primeiro (Lighthouse, Profiler). Otimize onde paga.

### 🟡 Imagem Sem Dimensão

**Sintoma:** `<img src="..." />` sem `width` e `height`. **Por que é ruim:** Causa CLS (layout shift). Métrica Core Web Vitals piora. **Conserto:** Sempre `width` e `height` (mesmo CSS responsivo aceita).

### 🟡 Listas Gigantes Sem Virtualização

**Sintoma:** `<ul>` renderiza 5000 `<li>` direto. **Por que é ruim:** DOM gigante, scroll laggy, memória alta. **Conserto:** Paginação ou virtualização (`react-window`, `TanStack Virtual`).

### 🔴 Sem Foco Visível

**Sintoma:** Botões sem `focus-visible:ring-*` ou similar. Outline padrão removido sem reposição. **Por que é ruim:** Usuários de teclado ficam perdidos. **Conserto:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`.

### 🔴 Cor Como Única Indicação

**Sintoma:** Campos com erro apenas em vermelho, sem ícone ou texto. **Por que é ruim:** Daltônicos não percebem. Acessibilidade violada. **Conserto:** Cor + ícone + texto. Defesa em camadas.

### 🟡 `<div onClick>` Em Vez de `<button>`

**Sintoma:** `<div onClick={fn}>Salvar</div>` para clicáveis. **Por que é ruim:** Sem foco por teclado, sem `Enter`/`Espaço`, screen reader não reconhece como botão. **Conserto:** Use `<button>`. CSS resolve o visual (`button { all: unset; }` se necessário).

---

## 8. Backend Node

> Detalhes: [módulo 17](https://claude.ai/padroes/17-backend-node.md)

### 🔴 Resposta Vazando Dados Sensíveis

**Sintoma:** `res.json(usuario)` retornando senha hash, tokens, dados de outros. **Por que é ruim:** Vazamento de informação. Quebra de privacidade. **Conserto:** DTO/projeção explícita. Whitelist do que retornar, não blacklist.

### 🔴 SQL Concatenado

**Sintoma:** `db.query('SELECT * FROM users WHERE id = ' + userId)`. **Por que é ruim:** SQL injection. Vulnerabilidade clássica. **Conserto:** Parâmetros separados (`db.query('... WHERE id = $1', [userId])`) ou ORM.

### 🟡 Validação Só no Frontend

**Sintoma:** Backend confia no payload sem revalidar. **Por que é ruim:** Cliente pode ser modificado. Validação é segurança, não UX. **Conserto:** Backend revalida sempre. Use mesmo schema (Zod) entre front e back se possível.

---

## 9. Segurança e Privacidade

> Detalhes: [módulo 18](https://claude.ai/padroes/18-seguranca-privacidade.md), checklist [41](https://claude.ai/chat/41-seguranca.md)

### 🔴 PII em URL

**Sintoma:** `/perfil?email=foo@bar.com` ou `/usuarios/cpf-12345678900`. **Por que é ruim:** Vaza para logs de servidor, histórico do browser, Referer header. **Conserto:** PII em body POST. Identificadores opacos (UUIDs) em URLs.

### 🔴 Token JWT em localStorage

**Sintoma:** `localStorage.setItem('jwt', token)` para token de acesso sensível. **Por que é ruim:** Qualquer XSS rouba o token. Sem httpOnly não há proteção. **Conserto:** Refresh token em cookie `httpOnly + Secure + SameSite`. Access token em memória.

### 🔴 `dangerouslySetInnerHTML` Sem Sanitização

**Sintoma:** `<div dangerouslySetInnerHTML={{ __html: userInput }} />`. **Por que é ruim:** XSS clássico. Qualquer JS injetado executa. **Conserto:** DOMPurify com allowlist restritiva. Ou repensar - talvez markdown processado serve.

### 🔴 Segredo Hardcoded

**Sintoma:** API key, senha, token escrito no código-fonte. **Por que é ruim:** Vaza em Git, em bundle do cliente, em CI logs. **Conserto:** Variável de ambiente. `.env` no `.gitignore`. Secrets em vault para produção.

### 🟡 Mensagem de Erro Detalhada

**Sintoma:** `"Erro: ECONNREFUSED ao conectar em mysql://prod-server:3306"` mostrada ao usuário. **Por que é ruim:** Vaza infraestrutura. Atacante mapeia serviços internos. **Conserto:** Mensagem genérica para usuário, log detalhado para sistema de monitoramento.

---

## 10. Processo: Tarefas e Revisão

> Detalhes: [módulo 20](https://claude.ai/processos/20-ciclo-tarefa.md), [21](https://claude.ai/processos/21-revisao-codigo.md)

### 🟡 Pular ETAPA "PLANEJAR"

**Sintoma:** IA recebe tarefa Standard e codifica direto sem mostrar plano. **Por que é ruim:** Sem alinhamento prévio, retrabalho garantido. **Conserto:** Sempre passar pelo PLANEJAR (mostrar plano, esperar aprovação) em Standard/Strict.

### 🟡 Tarefa Sem Critério de Aceite

**Sintoma:** "Implementar tela de perfil" sem dizer como saber que está pronta. **Por que é ruim:** Sem critério, "pronto" é subjetivo. **Conserto:** Critérios verificáveis no Planejamento Aprovado.

### 🟡 Concluir Sem Revisão

**Sintoma:** Mover tarefa de em-andamento para concluida sem seção `## Revisão`. **Por que é ruim:** Drift entre código real e o que se esperava. Bugs passam. **Conserto:** Sempre seção `## Revisão` - mesmo `N/A com motivo` é aceitável; silêncio não.

### 🟡 Achado Sumindo na Revisão

**Sintoma:** Revisão lista achados 🟡 Importantes que não viram tarefa. **Por que é ruim:** Problema reconhecido vira esquecido. **Conserto:** Cada 🟡 Importante gera tarefa em `pendentes.md` (ou justificativa de descarte).

### 🟢 Tarefas Gigantes Sem Quebra

**Sintoma:** Tarefa marcada com Esforço-IA "XG" sendo iniciada. **Por que é ruim:** XG é sinal de "quebrar antes". Estouro de contexto provável. **Conserto:** Dividir em sub-tarefas antes de mover para em-andamento.

---

## 11. ADRs e Análise

> Detalhes: [módulo 25](https://claude.ai/processos/25-analise-impacto.md), template [32](https://claude.ai/templates/32-adr.md)

### 🟡 Decisão Importante Sem ADR

**Sintoma:** Mudança grande de stack ou padrão (Context → Zustand) sem ADR. **Por que é ruim:** Daqui a 6 meses, ninguém lembra o motivo. Discussão se repete. **Conserto:** ADR com Contexto + Decisão + Alternativas + Consequências.

### 🟡 ADR Inflada Para Trivialidade

**Sintoma:** ADR sobre "qual cor usar no botão de salvar". **Por que é ruim:** Ruído. ADR é para decisão com custo de reversão alto. **Conserto:** Convenções vão em `docs/arquitetura/convencoes.md`. ADR só para decisões grandes.

### 🟡 Análise de Impacto Pulada

**Sintoma:** Tarefa Strict iniciada sem análise prévia das áreas afetadas. **Por que é ruim:** Descobertas no meio da implementação. Estimativa errada. **Conserto:** Análise antes do plano - mesmo "mini-análise" curta. Detalhes em [módulo 25](https://claude.ai/processos/25-analise-impacto.md).

---

## 12. Cognitivos e Decisão

> Anti-padrões sobre **como decidir**, não sobre código

### 🟡 Otimização Prematura

**Sintoma:** Memoizar tudo, code split em tudo, sem dado mostrando problema. **Por que é ruim:** Código mais complexo, manutenção cara, sem benefício real. **Conserto:** Meça primeiro. Otimize onde há evidência.

### 🟡 Abstração Prematura

**Sintoma:** Criar `Factory`, `Strategy`, `Observer` em código com 1 caso de uso. **Por que é ruim:** Padrão genérico mantém regras de uso de N casos quando só há 1. **Conserto:** Regra de Três. Não abstraia antes da 3ª ocorrência.

### 🟡 Cargo Cult Programming

**Sintoma:** Copiar padrão que viu em projeto/blog sem entender o "por quê". **Por que é ruim:** Quando o contexto muda, padrão aplicado às cegas não funciona. **Conserto:** Entenda o problema que o padrão resolve antes de aplicar.

### 🟡 Bike-Shedding

**Sintoma:** 2 horas discutindo nome de variável; 5 minutos discutindo arquitetura crítica. **Por que é ruim:** Decisões pequenas consomem mais energia que as importantes. **Conserto:** Convenções pré-definidas (lint, formatter). Reserve discussão para o que importa.

### 🟡 NIH Syndrome (Not Invented Here)

**Sintoma:** Reescrever do zero biblioteca que já existe e funciona. **Por que é ruim:** Bugs do zero, manutenção infinita, sem ganho. **Conserto:** Avalie alternativas existentes primeiro. Reescreva só com motivo concreto.

### 🟡 Otimismo Pós-Refatoração

**Sintoma:** "Refatorei mas não testei - vai funcionar." **Por que é ruim:** Refatoração sem testes é apostar. Bugs sutis aparecem em produção. **Conserto:** Rede de segurança (testes) antes de refatorar. Detalhes em [módulo 22](https://claude.ai/processos/22-refatoracao.md).

### 🟡 "Vou Atualizar a Doc Depois"

**Sintoma:** Tarefa concluída sem atualizar `contexto-projeto-ai.md` quando aplica. **Por que é ruim:** Drift entre realidade e documentação. IA orientada por doc desatualizada. **Conserto:** Atualização de doc é parte da definição de "concluído". Junto, não depois.

### 🔴 Confirmar Antes Sempre, Mesmo Em Trivial

**Sintoma:** IA pergunta confirmação antes de qualquer mudança Light. **Por que é ruim:** Frustração. Cerimônia vira ruído. **Conserto:** Confirmar apenas o que [01-nucleo.md](https://claude.ai/01-nucleo.md) considera destrutivo ou em modo Strict. Detalhes em [módulo 20](https://claude.ai/processos/20-ciclo-tarefa.md).

### 🔴 Não Confirmar Em Ação Destrutiva

**Sintoma:** IA executa `rm`, deleta tarefa, ou modifica arquivo crítico sem confirmação. **Por que é ruim:** Reversão difícil ou impossível. **Conserto:** Confirmação **sempre** para ações destrutivas - uma das 3 regras inegociáveis do núcleo.

---

## Mini-FAQ

**1. Por que catálogo separado em vez de incluir tudo nos módulos?** Os módulos cobrem anti-padrões da sua área, mas devs procuram **por sintoma**. Catálogo procurável (Ctrl+F) é otimizado para essa busca.

**2. Posso adicionar anti-padrões do meu projeto?** Sim. Crie `docs/anti-padroes-projeto.md` com regras específicas (ex: "Não usar tabela do legado X" - só faz sentido nesse projeto).

**3. Como nomeio anti-padrão novo?** Se tem nome consagrado (inglês ou português), use. Se não, nome curto e descritivo do sintoma. Ex: "Setter Exposto Em Vez de Handler".

**4. Anti-padrão vira regra de lint?** Quando possível, sim. ESLint detecta muitos (`react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`). Para os que lint não pega, vira item de checklist.

**5. Todo anti-padrão é sempre ruim?** Quase. Alguns têm exceções raras (ex: `any` em integração com lib mal-tipada - com comentário). Marque a exceção e justifique.

**6. Como ensino anti-padrões para a IA?** A IA usa este pacote como contexto. Quando este arquivo está em contexto, IA reconhece os padrões pelos nomes durante revisão.

**7. Por que alguns têm nome inglês e outros português?** Nomes consagrados (Magic Numbers, God Component) mantêm-se em inglês porque é como aparecem na literatura. Nomes específicos do pacote podem ser em português. Convenção do projeto vence.

**8. Qual anti-padrão é o mais comum?** Em projetos React: `useEffect` para derivar estado (🔴 #3). Em projetos novos: Magic Numbers (🟡 #1). Em projetos legados: mistura de idiomas (🟡 #1).

---

## 🔗 Referências e Módulos Relacionados

- [`51-comandos.md`](https://claude.ai/chat/51-comandos.md) - Quick-reference de comandos
- [`52-glossario-termos-tecnicos.md`](https://claude.ai/chat/52-glossario-termos-tecnicos.md) - Definições
- [`40-revisao-rapida.md`](https://claude.ai/checklists/40-revisao-rapida.md) - Checklist que detecta esses anti-padrões
- Módulos `padroes/` (10-18) - Padrões corretos correspondentes
- Módulos `processos/` (20-26) - Processos que previnem esses anti-padrões
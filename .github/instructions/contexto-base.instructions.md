---
applyTo: 'src/**'
---

## Início Obrigatório de Sessão

Antes de qualquer ação:

1. Leia `SESSAO-ATIVA.md` contexto do que foi feito antes
2. Leia `contexto-base.instructions.md` estado atual do projeto
3. Leia `protocolo-handoff.instructions.md` regras de handoff
4. Atualize `SESSAO-ATIVA.md`: task = [~] EM DESENVOLVIMENTO + o que vai fazer

> Mantenha em mente: ao concluir, você deve verificar se o `contexto-base` precisa atualização (Regra 4 do `protocolo-handoff.instructions.md`).

# Contexto Base MotoCalc RJ

> Este arquivo é lido por todos os agentes antes de qualquer ação.
> Mantenha-o atualizado após cada task concluída ou decisão tomada.

---

## O Produto

PWA para motoboys do RJ calcularem custo real de operação por km. Sem login (V1). Um perfil local com múltiplos presets de moto. Dois modos de cálculo: **predefinidos** (preset JSON) e **personalizado** (registros reais do usuário).

---

## Stack e Versões Exatas

| Tecnologia   | Versão                    |
| ------------ | ------------------------- |
| React        | 18.3.1                    |
| React Router | 6.27.0                    |
| TypeScript   | 5.6.3 (strict: true)      |
| Vite         | 5.4.11                    |
| Vitest       | 2.1.5                     |
| Tailwind CSS | 3.4.15                    |
| shadcn/ui    | a instalar na refatoração |

---

## Estrutura Real de Pastas

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── types/
│   ├── perfil.ts          PerfilUsuario, PresetEntry, PerfilAction (union discriminada)
│   └── calculos.ts        GranularidadesCusto, CustosPorCategoria, FiltrosCategorias
├── utils/
│   ├── calculos.ts        ✅ NUNCA TOCAR 76 testes passando
│   ├── calculos.test.ts
│   └── formatters.ts      moeda(), cpkFormatado(), kmFormatado()
├── services/
│   ├── perfilStorage.ts   IPerfilStorage + LocalStoragePerfilStorage
│   └── fipeService.ts
├── context/
│   ├── PerfilContext.tsx   reducer + provider + perfilPadrao
│   ├── PerfilContext.test.ts
│   └── ThemeContext.tsx
├── hooks/
│   ├── usePerfil.ts
│   └── useCustos.ts
├── routes/
│   └── RotaProtegida.tsx
├── data/
│   ├── dados_rj.json
│   └── catalogoModelos.ts
├── presets/
│   └── pop110i.json       ✅ IMUTÁVEL EM RUNTIME
├── fixtures/
│   └── usuario_teste.json carregado só em DEV
├── components/
│   ├── estimativa/
│   │   └── DonutChart.tsx
│   └── layout/
│       ├── LayoutApp.tsx
│       └── NavBar.tsx
└── pages/
    ├── PaginaEstimativa.tsx    ⚠️ 230 linhas refatorar
    ├── PaginaDetalhamento.tsx  🔴 537 linhas refatorar
    ├── PaginaRegistros.tsx     🟡 placeholder
    ├── PaginaMaoDeObra.tsx     🟡 placeholder
    ├── PaginaVidaUtil.tsx      🟡 placeholder
    ├── PaginaAjustes.tsx       🟡 placeholder
    └── onboarding/
        ├── FluxoOnboarding.tsx
        ├── PassoLayout.tsx
        ├── onboardingUtils.ts
        └── passos/
            ├── Passo1.tsx … Passo9.tsx
            ├── Passo6Aluguel.tsx
            ├── Passo6Financiamento.tsx
            ├── Passo6Responsabilidade.tsx
            └── PassoConfirmacao.tsx
```

---

## Documentação de Referência


---

## Documentação de Domínio

A pasta `docs/dominio/modelagem` contém a **modelagem conceitual do projeto**:

- `_glossario.md` Linguagem Ubíqua (termos com significado único)
- `invariantes.md` regras que nunca podem ser violadas
- `divida-tecnica.md` decisões conscientes de adiar melhorias
- `aggregate-perfil.md` raiz do aggregate principal
- `entidade-preset.md`, `entidade-moto.md` entidades modeladas
- `value-objects.md` Value Objects reais e saidas de calculo (ConfiguracaoCombustivel, SeguroConfig, CategoriaDisplay, Granularidades, etc)

**Quando consultar:**

- Antes de implementar feature que toque entidade do domínio: ler arquivo correspondente
- Antes de usar termo do domínio: verificar `_glossario.md`
- Antes de aprovar task como concluída (`tech-lead-revisor`): conferir `invariantes.md`

**Quem atualiza:** apenas o `modelador-dominio`. Outros agentes leem mas não editam.

**Conflito entre código e modelagem:** chamar o `modelador-dominio` para decidir qual lado atualizar. Não decidir sozinho.

---

## Política de Testes

O projeto adota a **filosofia B com padrão mínimo**: cada agente cuida dos próprios testes dentro do seu escopo; o `qa-engineer` audita o conjunto. Stack: **Vitest 2** com `describe`/`it`, padrão **AAA** (Arrange/Act/Assert) e **Nível 3** de cobertura (caminho feliz + invariantes documentadas). Nomes de testes em português.

Detalhes operacionais, padrão de nomenclatura, exemplos e gatilhos: ver `docs/protocolo-testes.md`.

---

## Convenções OBRIGATÓRIAS

**Tudo em português:** variáveis, funções, componentes, hooks, tipos, comentários, testes.

```typescript
// ✅ CORRETO
const kmPorDia = 70;
function calcularCustoAnual() {}
const temSeguro = false;
interface PerfilUsuario {}
export function usePerfil() {}
describe('calcularCusto', () => {
  it('deve retornar...');
});

// ❌ ERRADO
const dailyKm = 70;
function calculateCost() {}
const hasInsurance = false;
```

| Tipo             | Convenção             | Exemplo                       |
| ---------------- | --------------------- | ----------------------------- |
| Variável/função  | camelCase PT          | `kmPorDia`, `calcularCusto()` |
| Boolean          | `tem/esta/eh/deve`    | `temSeguro`, `estaAtivo`      |
| Componente       | PascalCase PT         | `PainelEstimativa`            |
| Hook             | `use` + PascalCase PT | `usePerfil`, `useCustos`      |
| Tipo/Interface   | PascalCase PT         | `PerfilUsuario`               |
| Constante global | UPPER_SNAKE PT        | `LIMITE_ALERTA_KM`            |

---

## Regras de Negócio Críticas

```typescript
// 1. localStorage NUNCA diretamente sempre via serviço
import { LocalStoragePerfilStorage } from '../services/perfilStorage';
// Chaves: 'motocalc:v5:presets' e 'motocalc:v5:presetAtivo'

// 2. Presets JSON IMUTÁVEIS em runtime
// pop110i.json nunca é modificado pelo código

// 3. Salvar APENAS no COMMIT_ONBOARDING
useEffect(() => {
  if (!estado.presetAtivoId) return; // guard obrigatório
  storageRef.current.salvarPresets(estado.presets);
}, [estado]);

// 4. kmAnual = kmDia × diasSemana × 52 nunca kmMensal × 12
// 5. manutencaoPorPeca: undefined = ativo (só false explícito desativa)
filtros.manutencaoPorPeca[pecaId] !== false;

// 6. utils/calculos.ts NUNCA TOCAR (76 testes)
```

---


---

## Componentes shadcn Mapeados (a instalar)

| Componente | Uso                                           |
| ---------- | --------------------------------------------- |
| Card       | Cards de custo, cards informativos            |
| Accordion  | Categorias no Detalhamento                    |
| Switch     | Toggles de categoria                          |
| Dialog     | Modal de gasto, confirmação "Apagar Tudo"     |
| Badge      | Status de revisão, "Modo personalizado ativo" |
| Select     | Dropdown ano, tipo de óleo, marca             |
| Tabs       | Sub-abas da tela Registros                    |
| Input      | Todos os inputs                               |
| Button     | Todos os botões                               |
| Separator  | Divisores entre seções                        |
| Toggle     | MENSAL/ANUAL, AUTORIZADAS/INDEPENDENTES       |
| Sheet      | Painel hamburguer                             |

---

## Rotas Definidas

```
/onboarding/1 a /onboarding/9
/onboarding/6/financiamento
/onboarding/6/aluguel
/onboarding/6/responsabilidade
/estimativa
/estimativa/detalhamento
/registros
/mao-de-obra
/vida-util
/ajustes
/perfil
```
---

## Ao Concluir Handoff Obrigatório

Toda conclusão segue o **Ritual de Arquivamento** definido na Regra 3 do `protocolo-handoff.instructions.md`. Em resumo:

1. Arquivar o handoff atual em `docs/historico/handoffs/`
2. Adicionar entrada em `docs/historico/tasks-concluidas.md`
3. Atualizar `docs/Tasks.md` (mover task para Recém-concluídas, manter top-3)
4. Sobrescrever `SESSAO-ATIVA.md` com o novo handoff (incluindo seção `## Testes`)

Se o `contexto-base` estiver desatualizado, perguntar:

> "O contexto-base precisa ser atualizado nas seções [X]. Posso atualizar agora, ou prefere chamar o documentador-tecnico?"

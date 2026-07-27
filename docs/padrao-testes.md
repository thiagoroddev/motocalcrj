markdown
# Protocolo de Testes MotoCusto RJ

> **Padrão mínimo obrigatório** que deve ser seguido ao escrever, atualizar ou rodar testes.

---

## Definition of Done

Uma tarefa **não está concluída** até que todos estes itens sejam verdadeiros:

1. ✅ Código implementado conforme o critério da task
2. ✅ Comando `npm run test` (ou `vitest run`) executado
3. ✅ Todos os testes verdes (zero falhas)
4. ✅ Cobertura mínima atingida para o escopo tocado (ver seção [Cobertura Mínima](#cobertura-mínima))
5. ✅ Seção `## Testes` do arquivo da tarefa declara explicitamente o estado dos testes 

⚠️ **Exceção:** tarefas exclusivamente de documentação (que não tocam `src/`) não exigem rodar testes. Mas **ainda precisa declarar**: `Testes executados: N/A (mudança apenas em docs)`.

---

## Estrutura de Arquivos

### Onde colocar testes

Testes ficam **ao lado do código testado**, em uma pasta `__tests__/` irmã. Esta é a convenção do Vitest e mantém código e teste juntos.
src/
├── utils/
│ ├── calculos.ts
│ └── tests/
│ └── calculos.test.ts
├── context/
│ ├── PerfilContext.tsx
│ └── tests/
│ └── PerfilContext.test.tsx
└── components/
└── detalhamento/
├── AccordionCategoria.tsx
└── tests/
└── AccordionCategoria.test.tsx

text

### Nomenclatura de arquivos

- **Padrão:** `NomeDoArquivo.test.ts` (ou `.test.tsx` para componentes React)
- **Sem espaços, sem acentos, mesma capitalização do arquivo testado**
- ✅ `calculos.test.ts` para `calculos.ts`
- ✅ `PerfilContext.test.tsx` para `PerfilContext.tsx`
- ❌ `calculos-tests.ts` (formato errado)
- ❌ `Calculos.test.ts` (capitalização errada)

---

## Estilo de Escrita

### Use `describe` + `it`

```typescript
import { describe, it, expect } from 'vitest';
import { calcularKmAnual } from '../calculos';

describe('calcularKmAnual', () => {
  it('multiplica kmDia × diasSemana × 52', () => {
    // Arrange
    const kmDia = 70;
    const diasSemana = 5;

    // Act
    const resultado = calcularKmAnual(kmDia, diasSemana);

    // Assert
    expect(resultado).toBe(18200); // 70 × 5 × 52
  });
});
🔍 Por que describe + it e não test:

describe agrupa testes relacionados você lê "calcularKmAnual: multiplica kmDia × diasSemana × 52" naturalmente

Hierarquia explícita facilita organização quando a unidade testada tem múltiplos comportamentos

É a convenção mais comum em projetos JavaScript/TypeScript, vale você se acostumar

Estrutura interna: AAA (Arrange-Act-Assert)
Todo teste segue três fases:

Arrange: preparar dados, mocks, estado inicial

Act: executar a ação que está sendo testada (geralmente uma linha)

Assert: verificar o resultado

Use comentários // Arrange, // Act, // Assert em testes com mais de 3-4 linhas para deixar a estrutura explícita.

typescript
// ✅ Teste complexo: AAA com comentários
it('aplica fator de responsabilidade dividido como 0.5', () => {
  // Arrange
  const responsabilidade: ResponsabilidadeCusto = 'dividido';
  const custoTotal = 1000;

  // Act
  const fator = fatorResponsabilidade(responsabilidade);
  const custoFinal = custoTotal * fator;

  // Assert
  expect(fator).toBe(0.5);
  expect(custoFinal).toBe(500);
});

// ✅ Teste trivial: pode dispensar comentários
it('retorna 0 para responsabilidade locador', () => {
  expect(fatorResponsabilidade('locador')).toBe(0);
});
🔍 Por que AAA com flexibilidade:

Testes simples ficam concisos

Testes complexos ficam estruturados

Você desenvolve o hábito de pensar nas 3 fases antes de escrever

Nomenclatura de describe e it
Padrão de describe: nome da função, componente, ou unidade sob teste.

typescript
describe('calcularKmAnual', ...);
describe('PerfilContext reducer', ...);
describe('<AccordionCategoria />', ...);
Padrão de it: comportamento esperado em frase afirmativa, sem "deve".

typescript
// ✅ Bom comportamento afirmativo
it('multiplica kmDia × diasSemana × 52', ...);
it('atualiza kmAtual usando Math.max ao adicionar dia', ...);
it('retorna null quando autonomia é zero', ...);

// ❌ Evitar
it('deve calcular o km anual corretamente', ...);  // muito vago, redundante "deve"
it('test 1', ...);                                  // sem informação
it('funciona', ...);                                // não diz o que funciona
🔍 Por que sem "deve": todo teste afirma "deve fazer X". Repetir "deve" em cada it é ruído. Comportamento afirmativo é mais direto: lendo "multiplica kmDia × diasSemana × 52", você sabe exatamente o que o teste verifica.

Cobertura Mínima (Nível 3)
Para cada unidade nova ou modificada, é preciso cobrir:

1. Caminho feliz
O uso típico, com entradas válidas, retornando o resultado esperado.

typescript
it('multiplica kmDia × diasSemana × 52', () => {
  expect(calcularKmAnual(70, 5)).toBe(18200);
});
2. Invariantes documentadas em docs/dominio/invariantes.md
Para cada invariante que toca a unidade sendo testada, escreva um teste que tenta violá-la e verifica que o sistema impede (ou que a invariante se mantém).

Exemplo: ao implementar SET_KM_ATUAL no reducer, INV-MOTO-2 (kmAtual monotônico crescente) está em jogo.

typescript
describe('PerfilContext reducer SET_KM_ATUAL', () => {
  it('atualiza kmAtual quando novo valor é maior (caminho feliz)', () => {
    const estadoInicial = criarEstadoComKmAtual(15000);
    const novoEstado = reducer(estadoInicial, {
      type: 'SET_KM_ATUAL',
      valor: 18000
    });
    expect(novoEstado.perfil.moto.kmAtual).toBe(18000);
  });

  // ✅ Teste de invariante INV-MOTO-2: kmAtual monotônico
  it('preserva kmAtual quando novo valor é menor (INV-MOTO-2)', () => {
    // Arrange
    const estadoInicial = criarEstadoComKmAtual(15000);

    // Act tentativa de regressão
    const novoEstado = reducer(estadoInicial, {
      type: 'SET_KM_ATUAL',
      valor: 14000  // valor MENOR que o atual
    });

    // Assert kmAtual NÃO regrediu
    expect(novoEstado.perfil.moto.kmAtual).toBe(15000);
  });
});
🔍 Por que invariantes são parte da cobertura mínima:
Você já investiu trabalho documentando invariantes no domínio. Usá-las como guia faz duas coisas ao mesmo tempo:

Testa o código (a regra realmente está protegida)

Valida a documentação (a invariante documentada é de fato implementada)

Se ao escrever o teste você descobrir que a invariante não está protegida no código, você encontrou uma dívida técnica real registre em docs/dominio/divida-tecnica.md.

O que NÃO é exigido na cobertura mínima
Não exigimos cobertura de 100% de branches/linhas. Métricas de cobertura são úteis mas viram fim em si mesmas se forem exigência.

Não exigimos teste para cada caso extremo imaginável. Casos extremos não previstos por invariantes documentadas são cobertos em auditorias periódicas.

Não exigimos testes E2E para cada feature. Esses são planejados em auditoria.

🔍 A questão certa não é "quantos testes": é "os testes que existem dão confiança suficiente pra mudar o código sem medo?". Se sim, a cobertura está adequada.

Decisão: Atualizar Teste vs Corrigir Código
Quando um teste falha após sua mudança, você tem 3 caminhos possíveis. Escolha o certo seguindo este fluxo de decisão:

text
   ┌─ TESTE VERMELHO ─┐
   │                  │
   ▼                  │
A mudança no código   │
foi INTENCIONAL?      │
   │                  │
   ├─ NÃO ──► é BUG. Corrigir o CÓDIGO.
   │
   └─ SIM
       │
       ▼
   O comportamento ANTIGO (que o teste validava)
   ainda é desejado?
       │
       ├─ SIM ──► o teste está CERTO. Corrigir o CÓDIGO
       │         para fazer ambos comportamentos coexistirem
       │         (ou repensar a mudança).
       │
       └─ NÃO ──► o comportamento mudou. ATUALIZAR o teste.
                  ⚠️ DECLARAR explicitamente no arquivo da tarefa.
Quando atualizar é permitido
✅ Você pode atualizar um teste se:

A mudança no código foi intencional (não bug)

O comportamento antigo não é mais desejado

Você documenta no arquivo da tarefa qual teste atualizou e por quê

Quando atualizar é proibido
❌ Nunca atualize um teste para:

"Fazer passar" sem entender por que está falhando

Ajustar um valor esperado para o que o código retornou, sem verificar se é correto

Remover assertions que ficaram "chatas" de manter

"Limpar testes antigos" sem revisão criteriosa

🔍 Cheiro de problema: se você se pegou pensando "ah, vou só atualizar pra passar e seguir", pare. Esse é o momento exato em que bugs entram em produção. Volte ao fluxograma.

Declaração de Testes no Arquivo da Tarefa
Toda tarefa concluída deve incluir uma seção ## Testes dentro do seu arquivo em docs/tarefas/concluidas/[PREFIXO]-XXX-YYYY-MM-DD-HHhMM.md.

Modelo da seção
markdown
## Testes

- **Executados:** ✅ 94 testes verdes (`npm run test` em 2026-05-11 14:32)
  *ou:* ❌ 92 verdes, 2 falhando (ver detalhes abaixo)
  *ou:* N/A (mudança apenas em docs)

- **Adicionados:** 3 testes novos em `src/context/__tests__/PerfilContext.test.tsx`
  - `'SET_SITUACAO_MOTO': atualiza situação para financiada`
  - `'SET_SITUACAO_MOTO': preserva campos opcionais coerentes (INV-FIN-1)`
  - `'SET_SITUACAO_MOTO': rejeita tipo inválido`

- **Atualizados:** 1 teste em `src/utils/__tests__/calculos.test.ts`
  - `'resolverKmDia: usa média do diário com 5+ registros'`
  - **Justificativa:** comportamento mudou após decisão de produto sobre DT-7 (de "1+ registro automático" para "5+ registros + opt-in"). Teste antigo validava `>= 1`; atualizado para `>= 5`. Decisão registrada em TASK-DECISAO-DT-7.

- **Cobertura do escopo tocado:**
  - Caminho feliz: ✅ todas as 6 novas actions testadas
  - Invariantes: ✅ INV-FIN-1, INV-MANUT-2, INV-PRESET-2 cobertas
  - Pendente: INV-PRESET-3 (acesso isolado ao localStorage) não testada porque é regra de convenção, não de comportamento. 
Campos obrigatórios
Campo	O que descrever	Quando é "N/A"
Executados	Resultado do npm run test (número + cor) ou indicação de docs-only	Mudança 100% documental
Adicionados	Lista de testes novos (arquivo + its)	Nenhum teste novo
Atualizados	Lista de testes modificados + justificativa de cada um	Nenhum teste atualizado
Cobertura do escopo	Resumo do que foi coberto (caminho feliz, invariantes, lacunas conhecidas)	Mudança 100% documental
⚠️ Campo "Atualizados" sem justificativa é falha de protocolo.

Auditoria de Testes
Periodicamente, o conjunto de testes deve ser auditado para verificar consistência com o padrão definido neste documento e no comportamento-geral.md (seção 8). A auditoria observa:

Cobertura de casos extremos
Entradas nulas, undefined, valores extremos

Race conditions e ordem de execução

Interações entre módulos que invariantes individuais não captam

Casos relatados por Motoboys em campo (regressão)

Testes transversais
Testes que cruzam vários módulos do projeto:

Integração: reducer + persistStorage + componente

E2E: simulação de fluxo completo (Onboarding inteiro, registro completo)

Performance: tempo de cálculo com perfil de Motoboy de 5 anos de uso

Definição de estratégia
Quais áreas precisam de cobertura adicional?

Quando vale escrever teste de snapshot vs interativo?

Quando vale mockar vs usar implementação real?

O que a auditoria NÃO faz
Não escreve testes para cada feature nova (responsabilidade de quem implementa)

Não revisa cada tarefa antes de fechar (auditoria é periódica, não bloqueante)

Não é "guardião do compilador" código compila ou não compila independente dela

Anti-padrões a evitar
❌ Teste que sempre passa
typescript
// ❌ Não testa nada de útil
it('o componente renderiza', () => {
  const { container } = render(<MeuComponente />);
  expect(container).toBeDefined();  // sempre verdadeiro
});

// ✅ Testa comportamento real
it('exibe o nome do Motoboy quando apelido está preenchido', () => {
  const { getByText } = render(<Header apelido="João" />);
  expect(getByText('João')).toBeInTheDocument();
});
❌ Teste que duplica a implementação
typescript
// ❌ Espelha a implementação se a regra mudar, ambos mudam juntos e o teste não captura
function calcularImposto(valor: number): number {
  return valor * 0.02;
}

it('calcula imposto', () => {
  expect(calcularImposto(1000)).toBe(1000 * 0.02);  // ❌ usa a mesma fórmula
});

// ✅ Verifica o valor concreto esperado
it('calcula imposto de 2% sobre o valor', () => {
  expect(calcularImposto(1000)).toBe(20);  // ✅ valor concreto
});
❌ Teste sem assertion
typescript
// ❌ Roda o código mas não verifica nada
it('atualiza o estado', () => {
  reducer(estado, { type: 'SET_KM_ATUAL', valor: 18000 });
  // ... onde está o expect?
});

// ✅ Verifica o efeito
it('atualiza kmAtual para o valor passado', () => {
  const novoEstado = reducer(estado, { type: 'SET_KM_ATUAL', valor: 18000 });
  expect(novoEstado.perfil.moto.kmAtual).toBe(18000);
});
❌ Atualização sem justificativa
Já coberto na seção Decisão. Repetindo aqui porque é o anti-padrão mais grave: atualizar teste pra passar sem entender por que estava falhando é como apagar o alarme de incêndio porque o barulho incomoda.

Comandos úteis
bash
# Roda todos os testes uma vez
npm run test
# ou
vitest run

# Modo watch (re-roda quando arquivo muda) útil durante desenvolvimento
vitest

# Roda só os testes de um arquivo específico
vitest run src/utils/__tests__/calculos.test.ts

# Roda testes que correspondem a um padrão de nome
vitest run -t "calcularKmAnual"

# Roda com cobertura (gera relatório em coverage/)
vitest run --coverage
⚠️ Em ambiente CI/CD futuro: o comando padrão é npm run test (sem watch, sai do processo com código 0 ou 1).

Resumo Visual
Pergunta	Resposta
Framework?	Vitest
Estilo?	describe + it
Estrutura interna?	AAA (Arrange-Act-Assert)
Onde colocar?	src/**/__tests__/Arquivo.test.ts
Cobertura mínima?	Nível 3: caminho feliz + invariantes documentadas
Quem escreve?	Quem tocou o código
Quem audita?	Revisão de código (seção 13 do comportamento-geral.md) + auditoria periódica
Quando atualizar teste é OK?	Quando comportamento mudou intencionalmente + justificativa no arquivo da tarefa
Definition of Done inclui testes?	Sim, sempre (exceto docs-only)
Histórico de Versões
Data	Mudança
2026-05-11	Criação inicial Leva 2 da rodada de organização
2026-05-13	Removidas referências a agentes e handoff; alinhado com comportamento-geral.md

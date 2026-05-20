# Invariantes do Domínio MotoCalc

> **Status:** Documentação por engenharia reversa em 2026-05-09.
> **Propósito:** Lista centralizada de regras que **nunca podem ser violadas**. Referência para o `tech-lead-revisor` e para qualquer agente que esteja prestes a tomar decisão técnica.

---

## O Que é uma Invariante

Uma invariante é uma **afirmação que precisa ser verdadeira em todo momento da vida do sistema**. Diferente de uma validação de formulário (que checa entrada do usuário), invariante é regra interna que o código deve garantir.

Exemplo: "kmFinal > kmInicial" não é só uma validação é uma propriedade que, se violada, **o sistema entrou em estado inconsistente**.

Quando uma invariante é violada, o problema não é "input do usuário ruim" é **bug do sistema**. Por isso elas são protegidas pelas raízes de aggregate, no código, antes que dados ruins entrem.

---

## Invariantes Mapeadas

### Invariantes do Aggregate Perfil

#### INV-PERFIL-1: Consistência do Preset Ativo
**Regra:** Se `presetAtivoId !== null`, então existe um Preset em `presets[]` com esse `id`.

**Por quê:** O Preset Ativo alimenta os cálculos exibidos na tela. Apontar para um Preset que não existe causaria tela em branco ou erro. Esta é a invariante mais crítica do aggregate.

**Onde é protegida:**
- `PerfilReducer` actions que removem Preset cuidam para reposicionar `presetAtivoId`
- `useEffect` de persistência tem guard: `if (!estado.presetAtivoId) return`

**Como validar:** verificar que toda action que muda `presets` ou `presetAtivoId` mantém a propriedade.

---

#### INV-PERFIL-2: Persistência Condicional ao Onboarding Completo
**Regra:** O Perfil só é persistido em `localStorage` quando `presetAtivoId` existe (i.e., onboarding foi completado via `COMMIT_ONBOARDING`).

**Por quê:** Dados parciais de onboarding incompleto (Motoboy abandonou no Passo 4) **não devem poluir o storage**. Próxima abertura do app deve mostrar onboarding do zero, não estado bagunçado.

**Onde é protegida:**
- `useEffect` em `PerfilContext.tsx`:
  ```typescript
  useEffect(() => {
    if (!estado.presetAtivoId) return  // guard obrigatório
    storageRef.current.salvarPresets(estado.presets)
  }, [estado])
  ```

⚠️ **Cuidado:** remover esse guard "para simplificar" é violação grave. Foi tomada decisão consciente de domínio.

---

#### INV-PERFIL-3: Acesso Isolado ao localStorage
**Regra:** Toda leitura/escrita em `localStorage` para dados do Perfil passa por `services/perfilStorage.ts`. Componentes, hooks, context **nunca** acessam `localStorage` diretamente.

**Por quê:** Centralizar permite (a) trocar implementação no futuro (IndexedDB, sync com servidor), (b) garantir formato consistente, (c) controlar versionamento de schema.

**Status:** Listada como **Proibição Absoluta** no `contexto-base`. Tecnicamente é regra de arquitetura, mas tem peso de invariante de domínio porque protege integridade de dados.

---

### Invariantes do Aggregate Preset

#### INV-PRESET-1: kmAnual é Derivada
**Regra:** `kmAnual = kmDia × diasSemana × 52`. **Nunca** calcular como `kmMensal × 12`.

**Por quê:** Decisão de domínio explícita do `contexto-base`. Calcular via mês perde fidelidade (52 semanas vs 12 meses não são equivalentes). Motoboy trabalha por dias da semana, não por mês.

**Onde é protegida:** `utils/calculos.ts` (com 92 testes).

---

#### INV-PRESET-2: Imutabilidade de Predefinidos
**Regra:** Preset com `origem === 'predefinido'` (vindo de JSON em `src/presets/`) **nunca** pode ser modificado em runtime.

**Por quê:** Garante que o app sempre tenha um ponto de partida confiável. Edições do Motoboy geram cópias com `origem === 'personalizado'`.

**Onde é protegida:** Listada como **Proibição Absoluta** no `contexto-base`.

---

#### INV-PRESET-3: Consumo Médio Positivo
**Regra:** `preset.moto.consumoMedio > 0`.

**Por quê:** Cálculo de combustível faz divisão por consumo. Zero ou negativo quebra o sistema.

**Onde é protegida:** validação de formulário de cadastro de moto + (idealmente) factory function de Moto.

---

### Invariantes de Cálculo

#### INV-CALC-1: Filtros com Semântica Tristate
**Regra:** Em `filtros.manutencaoPorPeca`, peça é considerada **ativa** se valor for `true` ou `undefined`. Apenas `false` explícito desativa.

**Por quê:** Permite armazenar apenas as exceções (peças desativadas) ao invés do estado completo. Estado mínimo.

**Onde é protegida:** `utils/calculos.ts`. Verificação canônica:
```typescript
if (filtros.manutencaoPorPeca[pecaId] !== false) {
  // peça ativa
}
```

⚠️ **Anti-padrão a evitar:**
```typescript
// ERRADO quebra a invariante
if (filtros.manutencaoPorPeca[pecaId] === true) {
  // peças sem entrada explícita ficam de fora!
}
```

---

#### INV-CALC-2: utils/calculos.ts requer aprovação explícita para modificação
**Regra:** O arquivo `src/utils/calculos.ts` **nunca pode ser modificado** sem decisão explícita do usuário.

**Por quê:** 98 testes passando. Modificação acidental quebraria comportamento testado e validado.

**Status:** Listada como **Proibição Absoluta** no `contexto-base`.

✅ **ADR-004 executado e concluído (TASK-REF-12):** fix fórmula Honda km-based, aplicação de `revisaoAutorizadaOverrides` e CPK por serviço independente implementados e testados. Qualquer outra modificação continua exigindo decisão explícita.

⚠️ **Cuidado:** isso não significa que o arquivo é "perfeito" significa que está **estável e testado**. Refatoração futura pode acontecer com aprovação explícita e plano de migração.

---

### Invariantes de Manutenção

#### INV-MANUT-1: intervalKm de ServicoIndependente sempre positivo
**Regra:** `ServicoIndependente.intervalKm > 0` sempre.

**Por quê:** `intervalKm` é denominador do CPK por serviço (`precoMaoDeObra / intervalKm`). Zero ou negativo gera divisão por zero ou custo negativo — estado logicamente impossível.

**Onde é protegida:** Case `SET_SERVICO_INDEPENDENTE` no `perfilReducer` (`PerfilContext.tsx`):
```typescript
if (action.payload.intervalKm <= 0) return state; // INV-MANUT-1
```

⚠️ **Cuidado:** a action não lança erro — ela silenciosamente ignora a atualização. Componentes de UI devem validar o campo antes de despachar para dar feedback ao usuário.

---

### Invariantes de Conventions (Domínio + Arquitetura)

Estas invariantes tecnicamente são convenções de código, mas se violadas comprometem a integridade do domínio (mistura de linguagens, perda da Linguagem Ubíqua):

#### INV-CONV-1: Tudo em Português
**Regra:** Variáveis, funções, componentes, hooks, tipos, comentários, testes tudo em português.

**Por quê:** O domínio é em português (Motoboy, Rodagem, Preset). Misturar inglês cria duas linguagens em paralelo. **A Linguagem Ubíqua exige consistência.**

**Onde é protegida:** Convenção do `contexto-base`. ESLint/regras de revisão poderiam reforçar.

---

#### INV-CONV-2: Sem `any` no TypeScript
**Regra:** Tipo `any` é proibido. Sempre usar tipos específicos.

**Por quê:** `any` quebra todas as garantias de tipo. Em sistema de domínio rico, perder tipos = perder invariantes em compile-time.

**Onde é protegida:** `tsconfig.json` (strict: true) + revisão.

---

## Como Esta Lista é Usada

### Pelo `tech-lead-revisor`
Antes de aprovar uma task como concluída, percorrer esta lista verificando se nenhuma invariante foi violada pela implementação.

### Pelo `modelador-dominio`
Ao modelar conceito novo, identificar invariantes específicas dele e adicionar aqui.

### Pelo `software-craftsman` (futuro `engenheiro-de-design`)
Ao propor refatoração, garantir que invariantes existentes continuam protegidas após a mudança.

### Pelo `qa-engineer`
Cada invariante deveria, idealmente, ter ao menos um teste que tenta violá-la e verifica que o sistema impede.

---

## Diferença entre Invariante, Validação e Restrição

| Conceito | Onde vive | Quando dispara |
|---|---|---|
| **Invariante** | Domínio (raiz de aggregate) | Sempre o sistema garante |
| **Validação** | UI / formulário | Na entrada do usuário |
| **Restrição** | Banco / storage | Na persistência |

Exemplo prático: "kmFinal > kmInicial" pode aparecer como:
- **Invariante:** método `Rodagem.criar()` rejeita criar rodagem inválida.
- **Validação:** formulário desabilita botão se km final for menor.
- **Restrição:** schema do storage rejeita registro inválido.

Idealmente, **as três camadas concordam**. A invariante é a "última linha de defesa".

---

## Lista de Invariantes Não Mapeadas (TODO)

Quando o `modelador-dominio` for chamado para tasks específicas, expandir esta lista com:

- Invariantes de Registros de Gasto (TASK-5.x)
- Invariantes de Registros de Rodagem (TASK-5.x)
- ~~Invariantes de Vida Útil de Peças~~ — ver INV-MANUT-1 (intervalKm é fonte canônica em ServicoIndependente)
- ~~Invariantes de Mão de Obra~~ — adicionado INV-MANUT-1 por TASK-REF-11
- Invariantes específicas das funções de cálculo (granularidade, totalização)

---

## Histórico de Mudanças

| Data | Invariante | Mudança | Motivo |
|---|---|---|---|
| 2026-05-09 | (todas as iniciais) | Criação | Engenharia reversa |
| 2026-05-19 | INV-CALC-2 | Nota de autorização ADR-004 para TASK-REF-12 | Conflito com proibição absoluta resolvido por decisão explícita |
| 2026-05-19 | INV-MANUT-1 | Nova — `ServicoIndependente.intervalKm > 0` | TASK-REF-11: novo tipo substitui ServicosMaoDeObra |
| 2026-05-20 | INV-CALC-2 | ADR-004 concluído — 96 testes; nota de autorização convertida em confirmação de execução | TASK-REF-12 concluída |
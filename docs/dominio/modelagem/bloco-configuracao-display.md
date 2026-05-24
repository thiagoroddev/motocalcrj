# Bloco: Configuração de Display

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.configuracaoDisplay` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que controla **como os cálculos são exibidos** ao Motoboy. Não armazena valores de cálculo armazena **preferências de visualização**:

- Modo de exibição (predefinidos vs personalizado)
- Modo de oficina (autorizadas vs independentes preferência de UI, não cálculo)
- Quais categorias de custo aparecem ativas no donut e total

🔍 **Análise Profunda qual a diferença para `perfilManutencao`?**

- `perfilManutencao.modoRevisao` é o **modo efetivo do cálculo** (qual fórmula é usada).
- `configuracaoDisplay.modoOficinDisplay` é a **preferência de exibição** (qual modo aparece selecionado nos toggles da UI).

São **separados intencionalmente** para permitir cenário: "eu estou em modo autorizadas (cálculo), mas estou comparando com independentes na tela momentaneamente".

**No reducer atual, `SET_MODO_OFICINA` altera apenas `configuracaoDisplay` e não sincroniza `perfilManutencao.modoRevisao`.**

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

configuracaoDisplay: {
  modoExibicao: ModoExibicao; // 'predefinidos' | 'personalizado'
  modoOficinDisplay: ModoRevisao; // 'autorizadas' | 'independentes'
  categoriasAtivas: CategoriaDisplay;
}
```

### `CategoriaDisplay`

```typescript
type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean; // engloba revisão (RN-27)
  documentacao: boolean; // ATENÇÃO: nome difere de 'documentos' nos cálculos
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
};
```

⚠️ **Divergência de nomenclatura crítica:**

- `CategoriaDisplay.documentacao` (no perfil persistido)
- `FiltrosCategorias.documentos` (nos cálculos)

A função `categoriasParaFiltros()` em `utils/calculos.ts` faz a tradução. Se um agente futuramente confundir e usar a chave errada, vai dar bug. **Registrado como dívida técnica de nomenclatura.**

⚠️ **Outra divergência:** `CategoriaDisplay` **não tem campo `revisao` separado** porque revisão é sub-item de manutenção (RN-27). A função `categoriasParaFiltros()` espelha: `revisao: cat.manutencao`. Toggle de manutenção liga/desliga revisão junto.

⚠️ **Mais uma:** `CategoriaDisplay` **não tem campo `gastosCustom`**. A função `categoriasParaFiltros()` mapeia `gastosCustom: cat.financiamento` o que significa que **toggle de financiamento controla também os gastos custom**. Comportamento sutil que pode confundir o Motoboy.

⚠️ **Imprevistos sugeridos não seguem esse toggle.** Retíficas aparecem em `FiltrosCategorias.imprevistosSugeridos` e só entram no total quando o item está explicitamente `true`.

---

## Comportamentos (Actions do Reducer)

| Action              | Comportamento                                               |
| ------------------- | ----------------------------------------------------------- |
| `SET_MODO_EXIBICAO` | Alterna entre `'predefinidos'` e `'personalizado'`          |
| `SET_MODO_OFICINA`  | Alterna entre `'autorizadas'` e `'independentes'`           |
| `TOGGLE_CATEGORIA`  | Liga/desliga uma categoria específica em `categoriasAtivas` |

---

## Mapeamento `categoriasAtivas` → `FiltrosCategorias`

**Esta é a função-chave** que conecta este bloco com os cálculos:

```typescript
// utils/calculos.ts
export function categoriasParaFiltros(cat: CategoriaDisplay): FiltrosCategorias {
  return {
    documentos: cat.documentacao, // tradução de nome
    revisao: cat.manutencao, // revisao espelha manutencao (RN-27)
    manutencao: cat.manutencao,
    manutencaoPorPeca: {}, // peças individuais entram aqui (filtro fino)
    revisaoPorServico: {}, // serviços de revisão individuais
    imprevistosSugeridos: {}, // desligados por padrão; true explícito ativa
    combustivel: cat.combustivel,
    internet: cat.internet,
    seguro: cat.seguro,
    alimentacao: cat.alimentacao,
    financiamento: cat.financiamento,
    gastosCustom: cat.financiamento, // gastosCustom segue financiamento
  };
}
```

🔍 **Análise:** Esta função é **a tradução semântica** entre o que o usuário vê (categorias visuais) e o que o cálculo trata (categorias granulares). Ela carrega regras de domínio:

1. `documentacao` → `documentos` (nome diferente em camadas diferentes)
2. `manutencao` controla `manutencao` E `revisao` (RN-27)
3. `financiamento` controla `financiamento` E `gastosCustom`
4. `manutencaoPorPeca` é filtro fino por peça (não vem deste bloco vem de outro mecanismo)
5. `imprevistosSugeridos` começa vazio porque sugestões corretivas, como retíficas, não entram no custo por padrão

---

## Modo de Exibição em Detalhe

```typescript
type ModoExibicao = 'predefinidos' | 'personalizado';
```

### `'predefinidos'`

- **Ignora todos os Overrides** (`pecasOverrides`, `servicosMaoDeObra`, `revisaoAutorizadaOverrides`)
- Calcula usando exclusivamente os valores do Preset JSON
- Útil para: "quanto custaria se eu seguisse os valores médios de mercado?"

### `'personalizado'`

- Usa Overrides onde existem
- Cai no Preset JSON onde não há
- Modo padrão após qualquer personalização (RN-05)
- Útil para: "qual é o meu custo real, considerando o que eu já personalizei?"

⚠️ **Nuance:** Modo personalizado **também ativa** o uso da média real do `diarioTrabalho` para `kmPorDia` (ver `bloco-trabalho.md` → `resolverKmDia`). Assim:

- `'predefinidos'` = "use só o que veio do Onboarding e do Preset JSON"
- `'personalizado'` = "use o que eu personalizei + o que registrei na prática"

---

## Invariantes

### INV-DISPLAY-1: Pelo menos uma categoria ativa

**Regra:** Pelo menos uma categoria em `categoriasAtivas` deve estar `true`.

**Por quê:** Donut chart vazio (todas off) seria UX ruim. Total = 0 também.

**Onde é protegida:** ⚠️ **Não está protegida no código** atual conforme tipos mostrados. **Possível dívida técnica.** Registrar.

⚠️ **Verificar comportamento:** se Motoboy desliga a última, o que acontece? Investigar.

### INV-DISPLAY-2: Modos sempre dentro do union

**Regra:** TypeScript garante que `modoExibicao ∈ {'predefinidos', 'personalizado'}` e `modoOficinDisplay ∈ {'autorizadas', 'independentes'}`.

**Onde é protegida:** sistema de tipos. Compilação falha se outro valor entra.

### INV-DISPLAY-3: categoriasAtivas tem todas as 7 chaves

**Regra:** O tipo `CategoriaDisplay` exige todas as 7 propriedades. Não pode ter chave faltando.

**Onde é protegida:** sistema de tipos.

---

## Relacionamentos

```
PerfilUsuario.configuracaoDisplay
├── modoExibicao → resolverKmDia + resolverIntervaloPeca + resolverPrecoPeca
│                  (decide se usa overrides ou só preset)
├── modoOficinDisplay → UI da Estimativa (toggle visual; pode ou não bater com perfilManutencao.modoRevisao)
└── categoriasAtivas → categoriasParaFiltros() → calcularTotalFiltrado()
                       (decide quais categorias entram no total exibido)
```

---

## Eventos Relacionados

- `ModoExibicaoTrocado` `SET_MODO_EXIBICAO`. Recálculo afeta praticamente tudo.
- `ModoOficinaTrocado` `SET_MODO_OFICINA`. Apenas troca o display do toggle (não muda cálculo se `perfilManutencao.modoRevisao` estiver separado).
- `CategoriaAlternada` `TOGGLE_CATEGORIA`. Recalcula total e proporções do donut.

---

## Pontos de Atenção

### Possível redundância modoOficinDisplay × perfilManutencao.modoRevisao

Os dois campos parecem ter o mesmo propósito. **Confirmar com o código** se há cenário real onde divergem. Se não há, é redundância candidata a remoção (V2).

### Toggle de financiamento controla gastosCustom

Comportamento sutil que pode confundir Motoboy: ao desativar "financiamento", os gastos custom também somem. Pode ser intencional (organizar visualmente) ou bug de UX. **Investigar.**

### Toggle de manutenção controla revisão

Comportamento explícito (RN-27). Documentado mas vale lembrar revisão não tem toggle próprio.

### Sincronização entre o que está no perfil e o que está no UI

Quando o Motoboy muda um toggle, o reducer dispara `TOGGLE_CATEGORIA` e atualiza o perfil. Recálculo automático segue via `useMemo` no `useCustos`. **Confirmar < 200ms** (RNF-04).

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export type ModoExibicao = 'predefinidos' | 'personalizado';
export type ModoRevisao = 'autorizadas' | 'independentes';

export type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;
  documentacao: boolean; // ⚠️ note: 'documentacao' aqui, 'documentos' nos filtros
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
};

// Dentro de PerfilUsuario:
configuracaoDisplay: {
  modoExibicao: ModoExibicao;
  modoOficinDisplay: ModoRevisao;
  categoriasAtivas: CategoriaDisplay;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` bloco `configuracaoDisplay` e tipo `CategoriaDisplay`
- `src/types/calculos.ts` `FiltrosCategorias`
- `src/utils/calculos.ts` `categoriasParaFiltros`
- `Requisitos v6` RN-04, RN-05, RN-06, RN-08, RN-27

**Divergências encontradas:**

- Naming `documentacao` (perfil) vs `documentos` (cálculos) registrado como dívida técnica
- Possível redundância entre `modoOficinDisplay` e `perfilManutencao.modoRevisao` pendente de investigação
- INV-DISPLAY-1 (pelo menos uma categoria ativa) não parece ter proteção explícita pendente de investigação
- Toggle financiamento controla gastosCustom pode ser confuso para o usuário, registrado como observação

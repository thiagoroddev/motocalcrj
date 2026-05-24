# Bloco: Configuração de Display

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.configuracaoDisplay` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que controla **o que é exibido** na Estimativa e no Detalhamento. Não armazena valores de cálculo — armazena **preferências de visualização**:

- Quais categorias de custo entram no donut e no total exibido
- Quais imprevistos sugeridos (retíficas) estão ligados

Após ADR-003 / TASK-REF-18 / REF-19, **não existe mais `modoExibicao` nem `modoOficinDisplay`**. O app opera em modo único — `perfilManutencao.modoRevisao` é a única fonte de "qual modo de revisão" tanto para cálculo quanto para UI.

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

configuracaoDisplay: {
  categoriasAtivas: CategoriaDisplay;
  imprevistosSugeridosAtivos: Record<string, boolean>;
}
```

### `CategoriaDisplay`

```typescript
type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;   // engloba revisão (RN-27)
  documentacao: boolean; // ATENÇÃO: nome difere de 'documentos' nos cálculos
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
  imprevistos: boolean;
};
```

⚠️ **Divergência de nomenclatura:** `CategoriaDisplay.documentacao` (no perfil persistido) vs `FiltrosCategorias.documentos` (nos cálculos). A função `categoriasParaFiltros()` em `utils/calculos.ts` faz a tradução. Registrada como dívida técnica leve de nomenclatura.

⚠️ **Sem campo `revisao` separado:** revisão é sub-item de manutenção (RN-27). `categoriasParaFiltros()` espelha: `revisao: cat.manutencao`. Toggle de manutenção liga/desliga revisão junto.

⚠️ **Sem campo `gastosCustom` próprio em `CategoriaDisplay`:** o toggle visível na UI é `imprevistos` (categoria nova adicionada pela RF-6.9). `categoriasParaFiltros()` traduz `imprevistos` para `gastosCustom: cat.imprevistos` e também para `imprevistosSugeridos` (ver abaixo).

### `imprevistosSugeridosAtivos`

```typescript
imprevistosSugeridosAtivos: Record<string, boolean>;
```

Mapa `id → boolean` por serviço excepcional (`retifica-cabecote`, `retifica-completa`). Padrão é `{}` (vazio) — qualquer id sem entrada conta como **desligado**. Apenas `true` explícito ativa o cálculo da retífica no total.

---

## Comportamentos (Actions do Reducer)

| Action                       | Comportamento                                                            |
| ---------------------------- | ------------------------------------------------------------------------ |
| `TOGGLE_CATEGORIA`           | Liga/desliga uma categoria em `categoriasAtivas`                         |
| `TOGGLE_IMPREVISTO_SUGERIDO` | Liga/desliga uma retífica em `imprevistosSugeridosAtivos[id]`            |

> Actions `SET_MODO_EXIBICAO` e `SET_MODO_OFICINA` **foram removidas** pelas TASK-REF-18 e REF-19 (ADR-003 — modo único).

---

## Mapeamento `categoriasAtivas` → `FiltrosCategorias`

**Função-chave** que conecta este bloco com os cálculos (ler implementação real em `src/utils/calculos.ts`):

```typescript
// Esboço — ver código para detalhes
export function categoriasParaFiltros(
  cat: CategoriaDisplay,
  imprevistosSugeridosAtivos: Record<string, boolean>,
): FiltrosCategorias {
  return {
    documentos: cat.documentacao,        // tradução de nome
    revisao: cat.manutencao,             // espelha manutenção (RN-27)
    manutencao: cat.manutencao,
    manutencaoPorPeca: {},               // filtro fino por peça
    revisaoPorServico: {},               // filtro fino por serviço de revisão
    imprevistosSugeridos: imprevistosSugeridosAtivos, // explícito via TOGGLE_IMPREVISTO_SUGERIDO
    combustivel: cat.combustivel,
    internet: cat.internet,
    seguro: cat.seguro,
    alimentacao: cat.alimentacao,
    financiamento: cat.financiamento,
    gastosCustom: cat.imprevistos,       // imprevistos controla gastosCustom (RF-6.9)
  };
}
```

🔍 **Regras de domínio embutidas no mapeamento:**

1. `documentacao` → `documentos` (nomes diferentes em camadas diferentes)
2. `manutencao` controla `manutencao` E `revisao` (RN-27)
3. `imprevistos` controla `gastosCustom` (lista fechada de Multa/Sinistros/Outros)
4. `imprevistosSugeridos` vem direto de `imprevistosSugeridosAtivos` — retíficas começam desligadas, ativam só com `true` explícito
5. `manutencaoPorPeca`/`revisaoPorServico` são filtros finos que **não vêm deste bloco** — são estado local do Detalhamento

---

## Invariantes

### INV-DISPLAY-1: Pelo menos uma categoria ativa

**Regra:** Pelo menos uma categoria em `categoriasAtivas` deve estar `true` para a tela fazer sentido.

**Onde é protegida:** ⚠️ **Não está protegida no código.** Estado de "tudo desligado" é tolerado (donut vazio + total = 0). Possível dívida técnica leve (DT-10 em `divida-tecnica.md`).

### INV-DISPLAY-2: `categoriasAtivas` tem todas as 8 chaves

**Regra:** O tipo `CategoriaDisplay` exige todas as 8 propriedades (`combustivel`, `alimentacao`, `manutencao`, `documentacao`, `internet`, `seguro`, `financiamento`, `imprevistos`).

**Onde é protegida:** sistema de tipos.

### INV-DISPLAY-3: `imprevistosSugeridosAtivos` é default-off

**Regra:** Item de `imprevistosSugeridosAtivos[id]` ativa custo somente quando valor é `true` explícito. `undefined` ou `false` mantém desligado. Inverso de `manutencaoPorPeca` (que é default-on).

**Por quê:** Retíficas são custos corretivos de alto km — não devem inflar o total exibido por padrão. O Motoboy liga o sugerido quando quer planejar para o evento. (BG-005)

**Onde é protegida:** lógica de `calcularTotalFiltrado` em `calculos.ts`.

---

## Relacionamentos

```
PerfilUsuario.configuracaoDisplay
├── categoriasAtivas → categoriasParaFiltros() → calcularTotalFiltrado()
│                      (decide quais categorias entram no total exibido)
└── imprevistosSugeridosAtivos → categoriasParaFiltros() → filtros.imprevistosSugeridos
                                  (ativa retíficas no total quando true)
```

---

## Eventos Relacionados

- `CategoriaAlternada` — `TOGGLE_CATEGORIA`. Recalcula total e proporções do donut.
- `ImprevistoSugeridoAlternado` — `TOGGLE_IMPREVISTO_SUGERIDO`. Liga/desliga uma retífica específica.

---

## Pontos de Atenção

### Toggle de manutenção controla revisão

Comportamento explícito (RN-27). Documentado mas vale lembrar — revisão não tem toggle próprio.

### Toggle de imprevistos controla gastosCustom

Após RF-6.9, `imprevistos` é a categoria que engloba tanto os 3 presets fixos (Multa, Sinistros, Outros) quanto as retíficas sugeridas. Desligar `imprevistos` esconde os dois grupos do total. Imprevistos é a **única categoria editável direto na tela de Detalhamento** (via lápis — RF-6.11).

### Sincronização perfil → UI

Quando o Motoboy muda um toggle, o reducer dispara `TOGGLE_CATEGORIA` ou `TOGGLE_IMPREVISTO_SUGERIDO` e atualiza o perfil. Recálculo automático segue via `useMemo` no `useCustos`. Performance esperada < 200ms (RNF-04).

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;
  documentacao: boolean; // ⚠️ note: 'documentacao' aqui, 'documentos' nos filtros
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
  imprevistos: boolean;
};

// Dentro de PerfilUsuario:
configuracaoDisplay: {
  categoriasAtivas: CategoriaDisplay;
  imprevistosSugeridosAtivos: Record<string, boolean>;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` — bloco `configuracaoDisplay` e tipo `CategoriaDisplay`
- `src/types/calculos.ts` — `FiltrosCategorias`
- `src/utils/calculos.ts` — `categoriasParaFiltros`
- `src/context/PerfilContext.tsx` — actions `TOGGLE_CATEGORIA`, `TOGGLE_IMPREVISTO_SUGERIDO`

**Divergências encontradas:** nenhuma. Documentação atualizada em 24/05/26 (TASK-DOC-009) após REF-18/REF-19 (remoção de `modoExibicao`/`modoOficinDisplay`) e RF-6.9/RF-6.11 (categoria `imprevistos`, `imprevistosSugeridosAtivos`).

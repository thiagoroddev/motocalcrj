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
  filtrosManutencao: {
    revisao: boolean;
    manutencaoPorPeca: Record<string, boolean>;
    revisaoPorServico: Record<string, boolean>;
  };
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

⚠️ **Revisão é sub-item de manutenção:** revisão não é categoria independente (RN-27). O toggle de categoria `manutencao` zera todo o bloco no cálculo, mas o toggle fino `filtrosManutencao.revisao` preserva a escolha do usuário para a linha "Revisão Geral".

⚠️ **Sem campo `gastosCustom` próprio em `CategoriaDisplay`:** o toggle visível na UI é `imprevistos` (categoria nova adicionada pela RF-6.9). `categoriasParaFiltros()` traduz `imprevistos` para `gastosCustom: cat.imprevistos` e também para `imprevistosSugeridos` (ver abaixo).

### `imprevistosSugeridosAtivos`

```typescript
imprevistosSugeridosAtivos: Record<string, boolean>;
```

Mapa `id → boolean` por serviço excepcional (`retifica-cabecote`, `retifica-completa`). Padrão é `{}` (vazio) — qualquer id sem entrada conta como **desligado**. Apenas `true` explícito ativa o cálculo da retífica no total.

### `filtrosManutencao`

```typescript
filtrosManutencao: {
  revisao: boolean;
  manutencaoPorPeca: Record<string, boolean>;
  revisaoPorServico: Record<string, boolean>;
};
```

Filtros finos persistidos da seção Manutenção no Detalhamento. `revisao` controla a linha "Revisão Geral". Os mapas controlam peças e serviços exibidos separadamente. Padrão: revisão ligada e mapas vazios. Nos mapas, `undefined` e `true` significam ativo; apenas `false` explícito desativa. Ao religar um item, a chave pode ser removida para manter estado mínimo.

---

## Comportamentos (Actions do Reducer)

| Action                       | Comportamento                                                            |
| ---------------------------- | ------------------------------------------------------------------------ |
| `TOGGLE_CATEGORIA`           | Liga/desliga uma categoria em `categoriasAtivas`                         |
| `TOGGLE_IMPREVISTO_SUGERIDO` | Liga/desliga uma retífica em `imprevistosSugeridosAtivos[id]`            |
| `TOGGLE_REVISAO_MANUTENCAO`  | Liga/desliga a linha "Revisão Geral" dentro de Manutenção                |
| `TOGGLE_MANUTENCAO_POR_PECA` | Liga/desliga uma peça específica em `filtrosManutencao.manutencaoPorPeca` |
| `TOGGLE_REVISAO_POR_SERVICO` | Liga/desliga um serviço em `filtrosManutencao.revisaoPorServico`         |

> Actions `SET_MODO_EXIBICAO` e `SET_MODO_OFICINA` **foram removidas** pelas TASK-REF-18 e REF-19 (ADR-003 — modo único).

---

## Mapeamento `categoriasAtivas` → `FiltrosCategorias`

**Função-chave** que conecta este bloco com os cálculos (ler implementação real em `src/utils/calculos.ts`):

```typescript
// Esboço — ver código para detalhes
export function categoriasParaFiltros(
  cat: CategoriaDisplay,
  imprevistosSugeridosAtivos: Record<string, boolean>,
  filtrosManutencao: FiltrosManutencaoDisplay,
): FiltrosCategorias {
  return {
    documentos: cat.documentacao,        // tradução de nome
    revisao: filtrosManutencao.revisao,
    manutencao: cat.manutencao,
    manutencaoPorPeca: filtrosManutencao.manutencaoPorPeca,
    revisaoPorServico: filtrosManutencao.revisaoPorServico,
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
2. `manutencao` controla a categoria inteira; `filtrosManutencao.revisao` controla a linha "Revisão Geral"
3. `imprevistos` controla `gastosCustom` (lista fechada de Multa/Sinistros/Outros)
4. `imprevistosSugeridos` vem direto de `imprevistosSugeridosAtivos` — retíficas começam desligadas, ativam só com `true` explícito
5. `manutencaoPorPeca`/`revisaoPorServico` vêm de `filtrosManutencao` e persistem no perfil

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

### INV-DISPLAY-4: filtros finos de Manutenção são default-on

**Regra:** Em `filtrosManutencao.manutencaoPorPeca` e `filtrosManutencao.revisaoPorServico`, item sem entrada é ativo. Apenas `false` explícito desativa.

**Por quê:** Manutenção tem vários itens derivados de preset/serviços. Persistir apenas exceções evita gravar mapa completo de itens ligados e permite que novos itens apareçam ativos por padrão.

**Onde é protegida:** `TOGGLE_MANUTENCAO_POR_PECA`, `TOGGLE_REVISAO_POR_SERVICO` e `calcularTotalFiltrado`.

---

## Relacionamentos

```
PerfilUsuario.configuracaoDisplay
├── categoriasAtivas → categoriasParaFiltros() → calcularTotalFiltrado()
│                      (decide quais categorias entram no total exibido)
├── imprevistosSugeridosAtivos → categoriasParaFiltros() → filtros.imprevistosSugeridos
│                                (ativa retíficas no total quando true)
└── filtrosManutencao → categoriasParaFiltros() → filtros.manutencaoPorPeca/revisaoPorServico
                         (preserva escolhas finas de Manutenção)
```

---

## Eventos Relacionados

- `CategoriaAlternada` — `TOGGLE_CATEGORIA`. Recalcula total e proporções do donut.
- `ImprevistoSugeridoAlternado` — `TOGGLE_IMPREVISTO_SUGERIDO`. Liga/desliga uma retífica específica.
- `FiltroManutencaoAlternado` — `TOGGLE_REVISAO_MANUTENCAO`, `TOGGLE_MANUTENCAO_POR_PECA` ou `TOGGLE_REVISAO_POR_SERVICO`.

---

## Pontos de Atenção

### Toggle de manutenção não apaga filtros finos

Comportamento explícito pós TASK-BG-014. Desligar a categoria Manutenção remove o bloco inteiro do cálculo, mas não apaga `filtrosManutencao`. Ao religar a categoria, peças/serviços/revisão previamente desligados continuam desligados.

### Toggle de imprevistos controla gastosCustom

Após RF-6.9, `imprevistos` é a categoria que engloba tanto os 3 presets fixos (Multa, Sinistros, Outros) quanto as retíficas sugeridas. Desligar `imprevistos` esconde os dois grupos do total. Imprevistos é a **única categoria editável direto na tela de Detalhamento** (via lápis — RF-6.11).

### Sincronização perfil → UI

Quando o Motoboy muda um toggle, o reducer dispara `TOGGLE_CATEGORIA`, `TOGGLE_IMPREVISTO_SUGERIDO` ou uma action de `filtrosManutencao` e atualiza o perfil. Recálculo automático segue via `useMemo` no `useCustos`. Performance esperada < 200ms (RNF-04).

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
  filtrosManutencao: FiltrosManutencaoDisplay;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` — bloco `configuracaoDisplay` e tipo `CategoriaDisplay`
- `src/types/calculos.ts` — `FiltrosCategorias`
- `src/utils/calculos.ts` — `categoriasParaFiltros`
- `src/context/PerfilContext.tsx` — actions `TOGGLE_CATEGORIA`, `TOGGLE_IMPREVISTO_SUGERIDO` e filtros finos de Manutenção

**Divergências encontradas:** nenhuma. Documentação atualizada em 25/05/26 (TASK-BG-014) após persistência dos filtros finos de Manutenção.

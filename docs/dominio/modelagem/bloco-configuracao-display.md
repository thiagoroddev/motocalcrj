# Bloco: Configuração de Display

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.configuracaoDisplay` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que controla **o que é exibido** na Estimativa e no Detalhamento. Não armazena valores de cálculo - armazena **preferências de visualização**:

- Quais categorias de custo entram no donut e no total exibido
- Quais filtros finos de manutenção estão ligados

Após ADR-003 / TASK-REF-18 / REF-19, **não existe mais `modoExibicao` nem `modoOficinDisplay`**. O app opera em modo único - `perfilManutencao.modoRevisao` é a única fonte de "qual modo de revisão" tanto para cálculo quanto para UI.

O campo `imprevistosSugeridosAtivos` continua no perfil apenas para compatibilidade com dados antigos. A ADR-022 removeu os custos sugeridos e sua UI do MVP.

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

⚠️ **Sem campo `gastosCustom` próprio em `CategoriaDisplay`:** o toggle visível na UI é `imprevistos` (categoria nova adicionada pela RF-6.9). `categoriasParaFiltros()` traduz `imprevistos` para `gastosCustom: cat.imprevistos`.

### `imprevistosSugeridosAtivos`

```typescript
imprevistosSugeridosAtivos: Record<string, boolean>;
```

Mapa legado preservado para leitura de perfis antigos. O padrão e o estado efetivo do MVP são `{}`; não há action, UI ou custo sugerido que o consuma.

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
| `TOGGLE_REVISAO_MANUTENCAO`  | Liga/desliga a linha "Revisão Geral" dentro de Manutenção                |
| `TOGGLE_MANUTENCAO_POR_PECA` | Liga/desliga uma peça específica em `filtrosManutencao.manutencaoPorPeca` |
| `TOGGLE_REVISAO_POR_SERVICO` | Liga/desliga um serviço em `filtrosManutencao.revisaoPorServico`         |

> Actions `SET_MODO_EXIBICAO` e `SET_MODO_OFICINA` **foram removidas** pelas TASK-REF-18 e REF-19 (ADR-003 - modo único).

---

## Mapeamento `categoriasAtivas` → `FiltrosCategorias`

**Função-chave** que conecta este bloco com os cálculos (ler implementação real em `src/utils/calculos.ts`):

```typescript
// Esboço - ver código para detalhes
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
    imprevistosSugeridos: imprevistosSugeridosAtivos, // contrato legado; sem provedores no MVP
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
4. `imprevistosSugeridos` permanece no contrato interno por compatibilidade, sem custos associados no MVP
5. `manutencaoPorPeca`/`revisaoPorServico` vêm de `filtrosManutencao` e persistem no perfil

---

## Invariantes

### INV-DISPLAY-1: Estado de filtro zero é válido

**Regra:** Todas as categorias podem estar desligadas simultaneamente.

**Por quê:** `categoriasAtivas` representa preferência de visualização, não validade do perfil. O
usuário pode escolher comparar um estado vazio; total, granularidades e percentuais permanecem em
zero.

**Onde é protegida:** `calcularTotalFiltrado`, `calcularBreakdownValores` e
`calcularBreakdownPercentual`.

### INV-DISPLAY-2: `categoriasAtivas` tem todas as 8 chaves

**Regra:** O tipo `CategoriaDisplay` exige todas as 8 propriedades (`combustivel`, `alimentacao`, `manutencao`, `documentacao`, `internet`, `seguro`, `financiamento`, `imprevistos`).

**Onde é protegida:** sistema de tipos.

### INV-DISPLAY-3: `imprevistosSugeridosAtivos` é legado e inerte

**Regra:** O campo pode ser lido de perfis antigos, mas não possui action nem UI e não gera custos no MVP.

**Por quê:** A ADR-022 retirou as retíficas da experiência e preservou o shape persistido para evitar uma migration sem benefício.

**Onde é protegida:** defaults vazios, normalização contra o preset e mapa `gastosCustom.detalhes.sugeridos` vazio.

---

### INV-DISPLAY-4: filtros finos de Manutenção são default-on

**Regra:** Em `filtrosManutencao.manutencaoPorPeca` e `filtrosManutencao.revisaoPorServico`, item sem entrada é ativo. Apenas `false` explícito desativa.

**Por quê:** Manutenção tem vários itens derivados de preset/serviços. Persistir apenas exceções evita gravar mapa completo de itens ligados e permite que novos itens apareçam ativos por padrão.

**Onde é protegida:** `TOGGLE_MANUTENCAO_POR_PECA`, `TOGGLE_REVISAO_POR_SERVICO` e `calcularTotalFiltrado`.

---

### INV-DISPLAY-5: chaves relacionais pertencem ao preset canônico

**Regra:** referências legadas em `imprevistosSugeridosAtivos` são filtradas contra o preset;
`manutencaoPorPeca` aceita somente peças e pneus; `revisaoPorServico` e
`estimativaMaoDeObraPorServico` aceitam somente serviços do preset, inclusive capacidades ocultas
ou sem custo.

**Onde é protegida:** `normalizarPerfilContraPreset()` na carga. Valores `true` e `false` válidos
são preservados; apenas chaves desconhecidas são removidas.

---

## Relacionamentos

```
PerfilUsuario.configuracaoDisplay
├── categoriasAtivas → categoriasParaFiltros() → calcularTotalFiltrado()
│                      (decide quais categorias entram no total exibido)
├── imprevistosSugeridosAtivos → compatibilidade de leitura; sem custo sugerido no MVP
└── filtrosManutencao → categoriasParaFiltros() → filtros.manutencaoPorPeca/revisaoPorServico
                         (preserva escolhas finas de Manutenção)
```

---

## Eventos Relacionados

- `CategoriaAlternada` - `TOGGLE_CATEGORIA`. Recalcula total e proporções do donut.
- `FiltroManutencaoAlternado` - `TOGGLE_REVISAO_MANUTENCAO`, `TOGGLE_MANUTENCAO_POR_PECA` ou `TOGGLE_REVISAO_POR_SERVICO`.

---

## Pontos de Atenção

### Toggle de manutenção não apaga filtros finos

Comportamento explícito pós TASK-BG-014 e ADR-017. Desligar a categoria Manutenção remove o bloco
inteiro do cálculo, mas não apaga `filtrosManutencao`. Os subtoggles mantêm a posição persistida,
ficam em cinza desbotado e não clicáveis. Ao religar, recuperam cor e interação sem reescrever
peças, serviços ou Revisão Geral.

### Toggle de imprevistos controla gastosCustom

Após RF-6.9, `imprevistos` controla os 3 presets fixos: Multa, Sinistros e Outros. É a **única categoria editável direto na tela de Detalhamento** (via lápis - RF-6.11).

### Sincronização perfil → UI

Quando o Motoboy muda um toggle, o reducer dispara `TOGGLE_CATEGORIA` ou uma action de `filtrosManutencao` e atualiza o perfil. Recálculo automático segue via `useMemo` no `useCustos`. Performance esperada < 200ms (RNF-04).

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

- `src/types/perfil.ts` - bloco `configuracaoDisplay` e tipo `CategoriaDisplay`
- `src/types/calculos.ts` - `FiltrosCategorias`
- `src/utils/calculos.ts` - `categoriasParaFiltros`
- `src/context/perfilReducer.ts` - actions `TOGGLE_CATEGORIA` e filtros finos de Manutenção

**Divergências encontradas:** nenhuma. Documentação atualizada em 14/06/26 pela TASK-REF-45 após remoção das retíficas do MVP.

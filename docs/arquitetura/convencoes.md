# Convencoes de Codigo (PT-BR)

Este documento define as convencoes obrigatorias do projeto. Tudo em portugues: variaveis, funcoes, comentarios e nomes de componentes.

## 1) Idioma

- Identificadores em portugues (sem acentos e sem caracteres especiais).
- Comentarios em portugues (sem acentos).
- Textos de UI em portugues (com acentos quando necessario).

## 2) Padrao de nomes

### 2.1- Variaveis e funcoes

- `camelCase` em portugues.
- Funcoes devem começar com verbo: `calcular`, `resolver`, `validar`, `carregar`, `salvar`.
- Booleans devem começar com `tem`, `esta`, `eh`, `deve`.

Exemplos:

- `kmPorDia`, `diasPorSemana`, `custoAnual`, `valorFipe`
- `calcularCustoCombustivel()`, `resolverPresetAtivo()`
- `temSeguro`, `estaAtivo`, `ehFinanciada`, `deveExibirAlerta`

### 2.2- Componentes React

- `PascalCase` em portugues.
- Substantivos claros: `PainelEstimativa`, `DetalhamentoCustos`, `FormularioAbastecimento`.

### 2.3- Hooks

- `use` + `PascalCase` em portugues: `usePerfil`, `usePresets`, `useCalculos`.

### 2.4- Tipos e interfaces

- `PascalCase` em portugues: `PerfilUsuario`, `RegistroRodagem`, `PresetEntry`.

### 2.5- Constantes

- `UPPER_SNAKE_CASE` em portugues sem acentos.
- Ex: `LIMITE_ALERTA_KM`, `DIAS_POR_SEMANA_PADRAO`.

## 3) Comentarios

- Comentarios apenas quando o motivo nao for obvio.
- Explicar o **por que**, nao o **o que**.

Exemplo:

```ts
// Evita recalculo caro em cada renderizacao
const custoTotal = useMemo(...)
```

## 4) Arquivos e pastas

- Componentes: `PascalCase.tsx` em portugues.
- Utilitarios e hooks: `camelCase.ts` em portugues.
- Pastas em `kebab-case` ou `camelCase`, mas manter um padrao por area.

## 5) Testes (Vitest)

- `describe` e `it` em portugues.
- Nomes claros e diretos.

Exemplo:

```ts
describe("calcularCustoCombustivel", () => {
  it("deve calcular custo anual corretamente", () => {
    // ...
  });
});
```

## 6) Excecoes permitidas

- APIs externas, libs e nomes oficiais podem permanecer em ingles.
- Rotas podem seguir o padrao ja definido (ex: `/estimativa`, `/registros`).

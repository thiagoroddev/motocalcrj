# Tarefas em Andamento

---

# TASK-REF-11 — Reestruturar tipos de MO: `ServicoIndependente[]`, actions, schema migration 5→6

- **Status:** EM DESENVOLVIMENTO
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** Normal
- **Esforço-H/IA:** M/G
- **Data origem:** 19/05/26
- **Data início:** 19/05/26 19:40
- **Dependências:** —
- **REQ/ADR/DT:** ADR-004, DT-6, DT-13

## Planejamento Aprovado

### Objetivo
Substituir o tipo plano `ServicosMaoDeObra` (campos fixos, nunca lidos pelo calculador) pelo array `ServicoIndependente[]`, onde cada serviço tem seu próprio `intervalKm`, `precoMaoDeObra`, `ativo` e `ehExcepcional`. Schema migra de versão 5 → 6.

### Arquivos a Modificar

| Arquivo | O que muda |
|---|---|
| `src/types/perfil.ts` | Remove `ServicosMaoDeObra`; adiciona `ServicoIndependente`; substitui campo `servicosMaoDeObra` por `servicosIndependentes: ServicoIndependente[]` |
| `src/context/PerfilContext.tsx` | Bumpa `schemaVersion` 5→6 em `perfilPadrao`; adiciona os 8 defaults em `perfilPadrao.servicosIndependentes`; 3 novos cases no reducer; migration guard se `schemaVersion < 6` |
| `src/services/perfilStorage.ts` | Migration guard ao carregar preset com `schemaVersion < 6` |
| `docs/dominio/divida-tecnica.md` | DT-6 → "Em Endereçamento por TASK-REF-11"; DT-13 → "Resolvida por TASK-REF-11"; adiciona DT-15 |
| `docs/dominio/invariantes.md` | Atualiza INV-CALC-2 (nota ADR-004); adiciona INV-MANUT-1; remove TODOs de MO e Vida Útil |
| `docs/dominio/_glossario.md` | Atualiza "Modo de Revisão", "Override", "Vida Útil"; adiciona "Serviço Independente" |

### Novo Tipo `ServicoIndependente`

```ts
interface ServicoIndependente {
  id: string;           // ex: "troca-oleo", "troca-kit-transmissao"
  nome: string;
  intervalKm: number;   // sempre > 0 (INV-MANUT-1)
  precoMaoDeObra: number;
  ativo: boolean;       // false por padrão nos excepcionais
  ehExcepcional: boolean; // true = alerta ao atingir km (ex: fazer motor)
}
```

### 8 Defaults (valores de campo RJ — docs/dominio/valores-mao-de-obra-honda-pop110i-2024-RJ.md)

| id | nome | intervalKm | precoMO | ativo | ehExcepcional |
|---|---|---|---|---|---|
| troca-oleo | Troca de óleo | 3000 | 25 | true | false |
| troca-kit-transmissao | Troca kit transmissão | 12000 | 60 | true | false |
| troca-pneu-dianteiro | Troca pneu dianteiro | 25000 | 30 | true | false |
| troca-pneu-traseiro | Troca pneu traseiro | 15000 | 30 | true | false |
| revisao-geral | Revisão geral (independente) | 6000 | 80 | true | false |
| troca-vela | Troca de vela | 6000 | 15 | true | false |
| troca-filtro-ar | Troca filtro de ar | 6000 | 15 | true | false |
| fazer-motor | Fazer motor | 70000 | 1500 | false | true |

### 3 Novas Actions do Reducer

```ts
{ type: 'SET_SERVICO_INDEPENDENTE'; payload: ServicoIndependente }
{ type: 'TOGGLE_SERVICO_INDEPENDENTE'; payload: { id: string } }
{ type: 'RESET_SERVICOS_INDEPENDENTES' }
```

### Migration (schemaVersion < 6)

- Descarta `servicosMaoDeObra` (campo nunca lido pelo calculador — orphan confirmado)
- Inicializa `servicosIndependentes` com os 8 defaults acima
- Bumpa `schemaVersion` para 6

### Critérios de Aceite

1. TypeScript compila sem erros (`tsc --noEmit`)
2. Todos os 92 testes existentes continuam verdes
3. Reducer rejeita `SET_SERVICO_INDEPENDENTE` com `intervalKm <= 0` (invariante INV-MANUT-1)
4. Migration funciona: preset com `schemaVersion: 5` carrega sem erro e recebe `servicosIndependentes` defaults
5. Docs atualizados: DT-6, DT-13, DT-15, INV-CALC-2, INV-MANUT-1, glossário

## Execução

- 19:40: 1º `npm run test` — 92 verdes. Baseline registrado.
- 19:40: Plano aprovado. Iniciando execução.
- 19:42: `src/types/perfil.ts` — `ServicosMaoDeObra` removido, `ServicoIndependente` adicionado, `servicosMaoDeObra` → `servicosIndependentes: ServicoIndependente[]`, actions antigas substituídas pelas 3 novas.
- 19:44: `src/context/PerfilContext.tsx` — `SERVICOS_INDEPENDENTES_PADRAO` adicionado, `perfilPadrao` atualizado (schemaVersion 6, servicosIndependentes), 3 novos cases no reducer com INV-MANUT-1 guard, `migrarPerfil()` + `criarEstadoInicial` com migration guard v5→v6.
- 19:47: `src/fixtures/usuario_teste.json` — schemaVersion 5→6, servicosMaoDeObra substituído por servicosIndependentes nos dois presets.
- 19:48: TSC limpo. 92/92 testes verdes.
- 19:49: Docs atualizados: `divida-tecnica.md` (DT-6 endereçada, DT-13 nota TASK-REF-12, DT-15 novo), `invariantes.md` (INV-CALC-2 nota ADR-004, INV-MANUT-1 novo, TODO atualizado), `_glossario.md` (Override, Modo de Revisão, CPK, Vida Útil, Serviço Independente).
- 19:53: TSC + testes finais — limpos. TASK-REF-11 concluída.

## Testes

- `1º npm run test`: 92 verdes (2 arquivos: calculos.test.ts + PerfilContext.test.ts)
- `último npm run test`: 92 verdes — sem regressões

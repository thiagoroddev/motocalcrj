# Bloco: Perfil de Manutenção

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.perfilManutencao` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **as preferências do Motoboy quanto à manutenção da moto**. Define globalmente:

- Se compra peças originais ou paralelas
- Se faz revisões em concessionária autorizada Honda ou em oficina independente
- Se completa a mão de obra que a concessionária não informa com **estimativa** (`~`), global e/ou por serviço (ADR-013/014)

Estas preferências afetam **todos os cálculos de manutenção e revisão**. Após REF-19 (ADR-003), o bloco virou enxuto - preço de mão de obra e intervalo vivem por serviço em `perfil.servicosIndependentes[]` (ADR-004); a 32.x acrescentou os campos de estimativa.

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

perfilManutencao: {
  perfilPecasGlobal: PerfilPecas; // 'original' | 'paralela'
  modoRevisao: ModoRevisao;       // 'autorizadas' | 'independentes'
  incluirEstimativaMaoDeObra?: boolean;                    // estimativa global (ADR-013)
  estimativaMaoDeObraPorServico?: Record<string, boolean>; // estimativa por serviço (ADR-014)
}
```

| Atributo                         | Tipo                       | Descrição                                                                       | Padrão       |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------------------- | ------------ |
| `perfilPecasGlobal`              | `PerfilPecas`              | Preferência global de peças. Pode ser sobrescrita por peça via `pecasOverrides` | `'original'` |
| `modoRevisao`                    | `ModoRevisao`              | Concessionária autorizada Honda ou oficina independente                         | `'autorizadas'` |
| `incluirEstimativaMaoDeObra?`    | `boolean`                  | Liga a estimativa de M.O. (`~`) para **todos** os avulsos sem valor oficial     | ausente (= `false`) |
| `estimativaMaoDeObraPorServico?` | `Record<string, boolean>`  | Liga a estimativa **por serviço** (`servicoId → true`). Efetivo = global OU este | ausente (= `{}`) |

> `precoMaoDeObraIndependente` e `frequenciaRevisaoKm` **foram removidos** pela TASK-REF-19. Cada serviço de manutenção em `perfil.servicosIndependentes[]` tem seu próprio `intervalKm` e `precoIndependente` (ADR-004 / TASK-REF-11; campo renomeado de `precoMaoDeObra` na BG-011).

> ⚠️ **MVP (ADR-012):** o default real é `modoRevisao: 'autorizadas'` (`perfilPadrao`), e `normalizarPerfilMvp` (`src/hooks/useCustos.ts`) **força** `'autorizadas'` + `perfilPecasGlobal: 'original'` no cálculo do MVP. O modo `independentes` segue no tipo como caminho dormente/futuro.

---

## Comportamentos (Actions do Reducer)

| Action                                  | Comportamento                                                |
| --------------------------------------- | ------------------------------------------------------------ |
| `SET_MODO_REVISAO`                      | Alterna entre `'autorizadas'` e `'independentes'` (Ajustes)  |
| `SET_PERFIL_USO`                        | Define perfil de uso (afeta `bloco-moto`, mas controla qual intervalo de peça usar: entrega vs casual) |
| `SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA`    | Liga/desliga a estimativa **global** (`incluirEstimativaMaoDeObra`). Disparada pelo Segmentado de Preferências e pelo chip do card de total (ADR-013) |
| `TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO` | Alterna a estimativa **por serviço** (`estimativaMaoDeObraPorServico[id]`). Disparada pelo toggle do `CardServico` no avulso sem valor (ADR-014) |

> `perfilPecasGlobal` é definido durante o Onboarding via `SET_ONBOARDING_CAMPO`. Não há action dedicada para mudá-lo depois (DT-14 candidata).

---

## Como `perfilPecasGlobal` Interage com Overrides

`perfilPecasGlobal` ('original' | 'paralela') é a fonte única - `resolverPrecoPeca(pecaId, preset, perfilPecas, pecasOverrides)` lê a coluna correspondente do Preset JSON (`precoOriginal` ou `precoParalela`), a menos que haja override individual.

🔍 **Override por peça é granular por preço, não por perfil:** após a estrutura atual (REF-11), `PecaOverride` tem `precoEditadoOriginal` e `precoEditadaParalela` separados - o Motoboy pode informar valores diferentes para cada coluna. **Não existe mais `perfilPecasOverride` por peça** (esse conceito antigo morreu na refatoração).

⚠️ **Caso especial (RN-11):** Se o Preset JSON da peça tem `anoFimOriginal` e o ano da moto é maior, deveria **forçar paralela** independente do `perfilPecasGlobal`. Regra documentada nos Requisitos v6 mas ainda **não implementada** em `calculos.ts`. Registrada como pendência no README da modelagem.

---

## Como `modoRevisao` Afeta Cálculos

Esboço - ler `calcularDetalhesRevisaoAnual` em `src/utils/calculos.ts` para detalhes:

```typescript
if (modoRevisao === 'autorizadas') {
  // 1) Base: ciclo Honda escalado por km rodado no ano
  const base = (custoCicloCompleto / 36000) * kmAnual;  // 36000 = KM_CICLO_REVISAO_HONDA
  // 2) + serviços AVULSOS fora do pacote (servicosManutencao):
  //    - statusPrecoAutorizada 'informado'/'informado_usuario' → soma precoTotalAutorizada
  //    - 'nao_informado' + estimativa ligada (global OU por-serviço) → soma M.O. estimada (~)
  //    - 'nao_informado' sem estimativa → vira PENDÊNCIA (custoIncompleto = true)
  return base + totalAvulsosInformadosEEstimados;
}

// Modo 'independentes' (dormente no MVP): soma dos serviços ativos não-excepcionais
return servicosIndependentes
  .filter((s) => s.ativo && !s.ehExcepcional && s.intervalKm > 0)
  .reduce((sum, s) => sum + (s.precoIndependente / s.intervalKm) * kmAnual, 0);
```

🔍 **Análise:**

- **Autorizadas (MVP):** base do pacote Honda **+** avulsos de concessionária fora do pacote. `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada: true` (INV-CALC-3 / ADR-006) e também pula a peça avulsa quando o serviço tem preço **oficial** que inclui a peça (`concessionariaIncluiPeca`, ADR-014). Serviços `nao_informado` sem estimativa viram pendência (`custoIncompleto`); com estimativa, somam M.O. `~`.
- **Independentes (dormente):** soma de cada serviço de M.O. em `servicosIndependentes[]` (`ativo && !ehExcepcional`). Cobre só M.O.; as peças entram pelo CPK por peça.

> A fusão peça + M.O. em um item por componente é **só visão** (`montarItensManutencao`) — o cálculo mantém peça (mapa `manutencao`) e M.O. (mapa `revisao.servicos`) separados. Ver `docs/arquitetura/calculos-visao.md` e o adendo da ADR-014.

---

## Invariantes

### INV-MANUT-1: `intervalKm` em `ServicoIndependente`

**Regra:** serviços km-driven usam `ServicoIndependente.intervalKm > 0`. Serviços temporais conhecidos, como `troca-bateria`, podem usar `intervalKm === 0` como marcador de "sem driver por km".

**Onde é protegida:** Action `SET_SERVICO_INDEPENDENTE` no reducer aceita `intervalKm > 0` e só aceita `intervalKm === 0` quando o serviço padrão correspondente também é temporal.

### INV-MANUT-2: `perfilPecasGlobal` é padrão, não comando

**Regra:** Mudar `perfilPecasGlobal` afeta o **preço lido do Preset JSON**. Peças com `precoEditadoOriginal` ou `precoEditadaParalela` definido usam o override correspondente à coluna global ativa.

**Onde é protegida:** `resolverPrecoPeca()` em `utils/calculos.ts`.

---

## Relacionamentos

```
PerfilUsuario.perfilManutencao
├── perfilPecasGlobal → resolverPrecoPeca() para cada peça
└── modoRevisao → calcularDetalhesRevisaoAnual()
                  + calcularCpkPorPeca() (exclui peças do pacote no modo autorizadas)
```

> A "frequência de revisão" e o "preço de mão de obra independente" agora vivem por serviço em `perfil.servicosIndependentes[]` - ver `overrides.md`.

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

export type PerfilPecas = 'original' | 'paralela';
export type ModoRevisao = 'autorizadas' | 'independentes';

// Dentro de PerfilUsuario:
perfilManutencao: {
  perfilPecasGlobal: PerfilPecas;
  modoRevisao: ModoRevisao;
  incluirEstimativaMaoDeObra?: boolean;
  estimativaMaoDeObraPorServico?: Record<string, boolean>;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` - bloco `perfilManutencao` (com os campos de estimativa) e tipos `PerfilPecas`, `ModoRevisao`
- `src/utils/calculos.ts` - `calcularDetalhesRevisaoAnual` (base + avulsos + estimativa + pendências), `calcularCpkPorPeca`
- `src/hooks/useCustos.ts` - `normalizarPerfilMvp` (força autorizadas/original no MVP)
- `src/context/PerfilContext.tsx` - `SET_MODO_REVISAO`, `SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA`, `TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO`

**Divergências encontradas:** nenhuma após esta atualização. Sincronizado em 04/06/26 (TASK-DOC-014) com o MVP de manutenção (ADR-012/013/014): campos de estimativa, default `autorizadas`, avulsos de concessionária e composição como visão. Atualização anterior em 24/05/26 (DOC-009) após REF-19/REF-11.

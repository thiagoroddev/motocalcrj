# Bloco: Perfil de Manutenção

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.perfilManutencao` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **as preferências do Motoboy quanto à manutenção da moto**. Define globalmente:

- Se compra peças originais ou paralelas
- Se faz revisões em concessionária autorizada Honda ou em oficina independente

Estas preferências afetam **todos os cálculos de manutenção e revisão**. Após REF-19 (ADR-003), o bloco virou enxuto — preço de mão de obra e intervalo agora vivem por serviço em `perfil.servicosIndependentes[]` (ADR-004).

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

perfilManutencao: {
  perfilPecasGlobal: PerfilPecas; // 'original' | 'paralela'
  modoRevisao: ModoRevisao;       // 'autorizadas' | 'independentes'
}
```

| Atributo            | Tipo          | Descrição                                                                       | Padrão           |
| ------------------- | ------------- | ------------------------------------------------------------------------------- | ---------------- |
| `perfilPecasGlobal` | `PerfilPecas` | Preferência global de peças. Pode ser sobrescrita por peça via `pecasOverrides` | `'original'`     |
| `modoRevisao`       | `ModoRevisao` | Concessionária autorizada Honda ou oficina independente                         | `'independentes'`|

> `precoMaoDeObraIndependente` e `frequenciaRevisaoKm` **foram removidos** pela TASK-REF-19. No modo `independentes`, cada serviço de manutenção em `perfil.servicosIndependentes[]` tem seu próprio `intervalKm` e `precoMaoDeObra` (ADR-004 / TASK-REF-11).

---

## Comportamentos (Actions do Reducer)

| Action             | Comportamento                                                |
| ------------------ | ------------------------------------------------------------ |
| `SET_MODO_REVISAO` | Alterna entre `'autorizadas'` e `'independentes'` (Ajustes)  |
| `SET_PERFIL_USO`   | Define perfil de uso (afeta `bloco-moto`, mas controla qual intervalo de peça usar: entrega vs casual) |

> `perfilPecasGlobal` é definido durante o Onboarding via `SET_ONBOARDING_CAMPO`. Não há action dedicada para mudá-lo depois (DT-14 candidata).

---

## Como `perfilPecasGlobal` Interage com Overrides

`perfilPecasGlobal` ('original' | 'paralela') é a fonte única — `resolverPrecoPeca(pecaId, preset, perfilPecas, pecasOverrides)` lê a coluna correspondente do Preset JSON (`precoOriginal` ou `precoParalela`), a menos que haja override individual.

🔍 **Override por peça é granular por preço, não por perfil:** após a estrutura atual (REF-11), `PecaOverride` tem `precoEditadoOriginal` e `precoEditadaParalela` separados — o Motoboy pode informar valores diferentes para cada coluna. **Não existe mais `perfilPecasOverride` por peça** (esse conceito antigo morreu na refatoração).

⚠️ **Caso especial (RN-11):** Se o Preset JSON da peça tem `anoFimOriginal` e o ano da moto é maior, deveria **forçar paralela** independente do `perfilPecasGlobal`. Regra documentada nos Requisitos v6 mas ainda **não implementada** em `calculos.ts`. Registrada como pendência no README da modelagem.

---

## Como `modoRevisao` Afeta Cálculos

Esboço — ler `calcularDetalhesRevisaoAnual` em `src/utils/calculos.ts` para detalhes:

```typescript
if (modoRevisao === 'autorizadas') {
  // Custo do ciclo Honda escalado por km rodado no ano
  const ciclo = opcoes.custoCicloCompleto ?? 3334.62;  // soma das 7 revisões padrão
  return (ciclo / 36000) * kmAnual;  // 36000 = KM_CICLO_REVISAO_HONDA
}

// Modo 'independentes': soma dos serviços ativos não-excepcionais
return servicosIndependentes
  .filter((s) => s.ativo && !s.ehExcepcional)
  .reduce((sum, s) => sum + (s.precoMaoDeObra / s.intervalKm) * kmAnual, 0);
```

🔍 **Análise:** Os dois modos calculam por lógicas diferentes:

- **Autorizadas:** custo proporcional aos km rodados, ancorado no preço do ciclo Honda (do Preset JSON). Cobre **mão de obra + peças trocadas nas revisões periódicas** — por isso `calcularCpkPorPeca` exclui peças com `incluidoNaRevisaoAutorizada: true` neste modo (INV-CALC-3 / ADR-006, sem dupla contagem).
- **Independentes:** soma de cada serviço de mão de obra cadastrado em `servicosIndependentes[]` (apenas `ativo && !ehExcepcional`). Cobre **só mão de obra** — as peças entram pelo cálculo por peça normalmente.

A comparação entre os dois modos é uma feature de produto: o Motoboy alterna em Ajustes (`SET_MODO_REVISAO`) e vê qual sai mais em conta.

---

## Invariantes

### INV-MANUT-1: `intervalKm` positivo em `ServicoIndependente`

**Regra:** `ServicoIndependente.intervalKm > 0`. Divisão por zero quebra `(precoMaoDeObra / intervalKm) × kmAnual`.

**Onde é protegida:** Action `SET_SERVICO_INDEPENDENTE` no reducer rejeita `payload.intervalKm <= 0` (guard explícito em `PerfilContext.tsx`).

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

> A "frequência de revisão" e o "preço de mão de obra independente" agora vivem por serviço em `perfil.servicosIndependentes[]` — ver `overrides.md`.

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
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` — bloco `perfilManutencao` e tipos `PerfilPecas`, `ModoRevisao`
- `src/utils/calculos.ts` — `resolverPrecoPeca`, `calcularDetalhesRevisaoAnual`, `calcularCpkPorPeca`
- `src/context/PerfilContext.tsx` — `SET_MODO_REVISAO`, `SET_PERFIL_USO`, `SET_SERVICO_INDEPENDENTE`

**Divergências encontradas:** nenhuma. Documentação atualizada em 24/05/26 (TASK-DOC-009) após REF-19 (remoção de `precoMaoDeObraIndependente` e `frequenciaRevisaoKm`) e REF-11 (migração para `servicosIndependentes[]`).

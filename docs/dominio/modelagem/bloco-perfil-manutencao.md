# Bloco: Perfil de Manutenção

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.perfilManutencao` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **as preferências do Motoboy quanto à manutenção da moto**. Define globalmente:

- Se compra peças originais ou paralelas (mais baratas)
- Se faz revisões em concessionária autorizada Honda ou em oficina independente
- Quando independente: qual o preço de mão de obra que considera padrão e a frequência das revisões

Estas preferências afetam **todos os cálculos de manutenção e revisão**.

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

perfilManutencao: {
  perfilPecasGlobal: PerfilPecas; // 'original' | 'paralela'
  modoRevisao: ModoRevisao; // 'autorizadas' | 'independentes'
  precoMaoDeObraIndependente: number; // padrão: 150
  frequenciaRevisaoKm: number; // padrão: 6000
}
```

| Atributo                     | Tipo          | Descrição                                                                       | Padrão                    |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------- | ------------------------- |
| `perfilPecasGlobal`          | `PerfilPecas` | Preferência global de peças. Pode ser sobrescrita por peça via `pecasOverrides` | (escolhido no Onboarding) |
| `modoRevisao`                | `ModoRevisao` | Concessionária autorizada Honda ou oficina independente                         | (escolhido no Onboarding) |
| `precoMaoDeObraIndependente` | number        | Preço médio de mão de obra de revisão em oficina independente                   | 150                       |
| `frequenciaRevisaoKm`        | number        | Quantos km entre revisões na oficina independente                               | 6000                      |

---

## Comportamentos (Actions do Reducer)

⚠️ **Observação:** o reducer **não tem actions específicas** para alterar este bloco diretamente. As mudanças ocorrem via:

- `SET_ONBOARDING_CAMPO` durante o Onboarding (e possivelmente em Ajustes)
- `COMMIT_ONBOARDING` para persistir

**No reducer atual, nao existe action dedicada para `perfilManutencao` fora do onboarding.**

---

## Como `perfilPecasGlobal` Interage com Overrides

Esta é a regra mais importante deste bloco:

```typescript
// Conceito (não código literal)
function resolverPerfilPeca(pecaId, perfilPecasGlobal, override): PerfilPecas {
  // Override por peça vence o global
  if (override?.perfilPecasOverride !== null) {
    return override.perfilPecasOverride;
  }
  return perfilPecasGlobal;
}
```

🔍 **Análise:** `perfilPecasGlobal` é o **padrão**. Cada peça pode ter um `perfilPecasOverride` em `pecasOverrides[]` que sobrescreve só pra ela. Isso permite o cenário real: "uso peças originais em geral, mas pneu é paralelo porque é mais barato e dura quase igual".

⚠️ **Caso especial:** Se o Preset JSON da peça tem `anoFimOriginal` e o ano da moto é maior, **força paralela** independente do override (RN-11). Original descontinuada não existe sistema não pode oferecer.

---

## Como `modoRevisao` Afeta Cálculos

```typescript
// utils/calculos.ts calcularCustoRevisaoAnual
if (modoRevisao === 'autorizadas') {
  // Soma o ciclo completo de revisões do Preset JSON
  // Distribui proporcionalmente em 12 meses
  const ciclo = preset.revisaoAutorizada.reduce((s, r) => s + r.precoTotal, 0);
  const duracao = preset.revisaoAutorizada[ultimo].intervaloMeses; // ex: 42 meses
  return (ciclo / duracao) * 12; // anualizado
}

// Modo 'independentes':
return (kmAnual / frequenciaRevisaoKm) * precoMaoDeObraIndependente;
```

🔍 **Análise:** Os dois modos calculam por lógicas radicalmente diferentes:

- **Autorizadas:** custo é "fixo" do Preset JSON, escalado por tempo. Não depende de quanto o Motoboy roda.
- **Independentes:** custo é proporcional aos km. Quanto mais roda, mais paga em revisões.

Isso significa que **a comparação entre os dois modos é uma feature de produto**: o Motoboy pode alternar e ver qual sai mais em conta para o seu padrão de uso.

---

## Invariantes

### INV-MANUT-1: perfilPecasGlobal é padrão, não comando

**Regra:** Mudar `perfilPecasGlobal` afeta apenas peças **sem override próprio**. Peças com `perfilPecasOverride !== null` mantêm sua escolha individual.

**Onde é protegida:** `resolverPerfilPeca()` em `utils/calculos.ts`.

### INV-MANUT-2: precoMaoDeObraIndependente positivo

**Regra:** `precoMaoDeObraIndependente > 0`. Caso contrário, custo de revisão independente fica zero semanticamente errado.

**Onde é protegida:** validação na tela Mão de Obra.

### INV-MANUT-3: frequenciaRevisaoKm positivo

**Regra:** `frequenciaRevisaoKm > 0`. Divisão por zero quebra `(kmAnual / frequenciaRevisaoKm)`.

**Onde é protegida:** validação na tela Mão de Obra ou em Ajustes.

### INV-MANUT-4: modoRevisao em modo predefinidos

**Regra:** No `modoExibicao === 'predefinidos'`, **`perfilPecasGlobal` é respeitado** (não sobrescrito por overrides), mas **overrides individuais de peça (`perfilPecasOverride`) também são ignorados**.

**Por quê:** Modo `predefinidos` significa "ignore tudo que customizei". Aplica-se a overrides individuais, mas a preferência global de peças continua ativa.

🔍 **Confirmar com código:** essa interpretação vem do snippet `resolverPrecoPeca` que mostra `perfilEfetivo = modoExibicao === 'personalizado' ? (override ?? global) : global`. Confirma a invariante.

---

## Relacionamentos

```
PerfilUsuario.perfilManutencao
├── perfilPecasGlobal → resolverPrecoPeca() para cada peça
├── modoRevisao → calcularCustoRevisaoAnual()
├── precoMaoDeObraIndependente → calcularCustoRevisaoAnual() (modo independentes)
└── frequenciaRevisaoKm → calcularCustoRevisaoAnual() (modo independentes) + alertas
```

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
  precoMaoDeObraIndependente: number;
  frequenciaRevisaoKm: number;
}
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` bloco `perfilManutencao` e tipos `PerfilPecas`, `ModoRevisao`
- `src/utils/calculos.ts` `resolverPrecoPeca`, `calcularCustoRevisaoAnual`
- `Requisitos v6` RN-10, RN-11, RF-MO-01 a 05

**Divergências encontradas:** nenhuma estrutural. Pendência: confirmar quais Actions do reducer atualizam este bloco fora do Onboarding (não aparece explicitamente no `PerfilAction` mostrado).

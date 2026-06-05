# Bloco: Trabalho

> **Status:** Engenharia reversa baseada em código real.
> **Tipo:** Bloco de `PerfilUsuario`.
> **Implementação:** `perfil.trabalho` em `src/types/perfil.ts`.

---

## Conceito no Mundo Real

Bloco que representa **a rotina de trabalho do Motoboy**: quanto roda por dia, quantos dias por semana, quantas horas por dia. **É o bloco mais editado dinamicamente** porque a tela Estimativa permite ajustar `kmPorDia` e `diasPorSemana` inline.

🔍 **Análise Profunda por que esse bloco é especial:**
A maioria dos blocos do `PerfilUsuario` é editada apenas em telas dedicadas (Ajustes, Mão de Obra, Insumos). Este aqui é editado **diretamente no painel principal** (tela Estimativa). Isso significa que cálculos respondem a alterações desse bloco **em tempo real (< 200ms)** sem precisar de "salvar" alterar o stepper já dispara recálculo + persistência.

---

## Estrutura Real

```typescript
// src/types/perfil.ts (dentro de PerfilUsuario)

trabalho: {
  kmPorDia: number;
  diasPorSemana: number; // 1-7
  horasPorDia: number; // padrão: 8
}
```

| Atributo        | Tipo         | Descrição                                   | Origem                                                |
| --------------- | ------------ | ------------------------------------------- | ----------------------------------------------------- |
| `kmPorDia`      | number       | Km percorridos em um dia típico de trabalho | Onboarding P5 → editável na Estimativa                |
| `diasPorSemana` | number (1-7) | Dias trabalhados por semana                 | Onboarding P4/P5 → editável na Estimativa via stepper |
| `horasPorDia`   | number       | Horas trabalhadas por dia. Padrão: 8        | Não coletado no Onboarding atual fixo em 8            |

---

## Comportamentos (Actions do Reducer)

| Action                 | Comportamento                                      |
| ---------------------- | -------------------------------------------------- |
| `SET_KM_POR_DIA`       | Atualiza `kmPorDia` e dispara recálculo            |
| `SET_DIAS_POR_SEMANA`  | Atualiza `diasPorSemana` (1-7) e dispara recálculo |
| `SET_ONBOARDING_CAMPO` | Define os 3 campos durante o Onboarding            |

⚠️ **Não existe action `SET_HORAS_POR_DIA`** no reducer atual. O campo existe mas é fixado em 8. Se virar requisito editá-lo, precisará de action nova.

---

## Uso nos Cálculos

Este bloco alimenta as funções centrais de `utils/calculos.ts`:

```typescript
// kmAnual canônico
calcularKmAnual(kmDia, diasSemana) = kmDia × diasSemana × 52

// dias trabalhados no ano (não 365!)
calcularDiasAno(diasSemana) = diasSemana × 52

// kmMensal
calcularKmMensal(kmDia, diasSemana) = kmDia × diasSemana × 4.33
```

Indiretamente alimenta praticamente todos os custos anuais (combustível, manutenção, etc) através do `kmAnual`.

---

## `resolverKmDia` (modo único)

Após ADR-003 / TASK-REF-18-19, `resolverKmDia` é trivial:

```typescript
// utils/calculos.ts
export function resolverKmDia(kmPorDia: number): number {
  return kmPorDia;
}
```

`kmPorDia` declarado pelo Motoboy é a fonte única - não há mais Diário de Trabalho nem médias automáticas substituindo o valor. A função existe ainda como ponto de extensibilidade caso isso volte numa V2.

---

## Invariantes

### INV-TRABALHO-1: kmPorDia positivo

**Regra:** `kmPorDia > 0`.

**Por quê:** quem não roda não usa o app. Cálculo com 0 quebra divisões.

**Onde é protegida:** validação no Onboarding P5 + na Estimativa.

### INV-TRABALHO-2: diasPorSemana entre 1 e 7

**Regra:** `1 <= diasPorSemana <= 7`.

**Por quê:** semana tem 7 dias. Mais ou menos não faz sentido.

**Onde é protegida:** o stepper de UI limita o range.

### INV-TRABALHO-3: kmAnual sempre derivado, nunca armazenado

**Regra:** `kmAnual` **nunca** é armazenado no perfil. É sempre calculado em runtime via `calcularKmAnual()`.

**Por quê:** se fosse armazenado, mudar `kmPorDia` exigiria recalcular e persistir, criando inconsistência potencial.

**Onde é protegida:** convenção arquitetural. O perfil **não tem campo `kmAnual`** não há como armazenar.

### INV-TRABALHO-4: Cálculo via 52 semanas, não 12 meses

**Regra:** `kmAnual = kmDia × diasSemana × 52`. **Nunca** `kmMensal × 12`.

**Por quê:** Decisão de domínio explícita do `contexto-base`. 52 semanas é mais fiel à realidade do Motoboy (ele trabalha "x dias por semana", não "y dias por mês").

**Onde é protegida:** `utils/calculos.ts` (com 92 testes garantindo).

---

## Relacionamentos

```
PerfilUsuario.trabalho
├── kmPorDia → resolverKmDia() → calcularKmAnual()
├── diasPorSemana → calcularDiasAno() → cálculos de alimentação anual
└── horasPorDia → granularidade "horario" (custo por hora) [ainda não usado em granularidades]
```

⚠️ **Observação:** o tipo `GranularidadesCusto` em `src/types/calculos.ts` **não tem campo `horario`**. Apesar do bloco `trabalho` ter `horasPorDia`, o cálculo "Custo por Hora" exibido na Estimativa **não está nas granularidades centrais**. Verificar no código onde é calculado.

---

## Eventos Relacionados

- `RodagemAtualizada` `SET_KM_POR_DIA` ou `SET_DIAS_POR_SEMANA`. Recalcula tudo.
- `OnboardingTrabalhoDefinido` fim do P5/COMMIT_ONBOARDING.

---

## Snippet TypeScript (Real)

```typescript
// src/types/perfil.ts

trabalho: {
  kmPorDia: number;
  diasPorSemana: number;
  horasPorDia: number;
}

// Uso típico em utils/calculos.ts
const kmAnual = calcularKmAnual(perfil.trabalho.kmPorDia, perfil.trabalho.diasPorSemana);
const diasAno = calcularDiasAno(perfil.trabalho.diasPorSemana);
```

---

## Validação Contra Código Real

Documentação validada contra:

- `src/types/perfil.ts` - bloco `trabalho`
- `src/utils/calculos.ts` - `calcularKmAnual`, `calcularDiasAno`, `resolverKmDia`
- `docs/requisitos/funcionais.md` - RF-EST-04 (configuração de rodagem inline)

**Divergências encontradas:**

- Bloco tem `horasPorDia` mas Onboarding não coleta. Documentado como observação.
- Documentação atualizada em 24/05/26 (TASK-DOC-009) - seção sobre Diário de Trabalho removida (eliminado pela ADR-003 / REF-19).

# Regras de Negócio MotoCalc RJ

> Extraído de `Requisitos_MotoCalc_RJ_v6.md` (09/05/2026).
> IDs: RN-01 a RN-27. Regras que definem o que é válido no domínio, independente de implementação.

---

## Imutabilidade de Presets e Sistema de Overrides

| ID | Regra |
|---|---|
| RN-01 | **Os arquivos de preset JSON são somente leitura.** Nenhuma ação do usuário os modifica. O app apenas os lê. |
| RN-02 | **Toda personalização é armazenada como override no perfil (localStorage)**, nunca no preset. O sistema usa o override quando disponível e cai no preset quando não há override. |
| RN-03 | **O botão ↺ (reset) em qualquer campo apaga apenas o override daquele campo**, fazendo o sistema voltar ao preset para aquele item. Não afeta outros campos. |
| RN-04 | **Modo PREDEFINIDOS:** ignora todos os overrides calcula usando exclusivamente valores do preset. |
| RN-05 | **Modo PERSONALIZADO:** usa overrides onde existem, cai no preset onde não há. Este é o modo padrão após qualquer personalização. |

---

## Toggles de Categoria (Inclusão/Exclusão do Total)

| ID | Regra |
|---|---|
| RN-06 | Toggle off em uma categoria → `fatorCategoria = 0` → custo daquela categoria não entra no total. |
| RN-07 | Toggle off não apaga dados ao reativar, custo retorna normalmente. |
| RN-08 | Toggle de categoria é independente do fator de responsabilidade de moto alugada. São camadas ortogonais. |
| RN-09 | Porcentagens calculadas apenas sobre categorias com toggle ativo, somando ~100%. `calcularBreakdownPercentual` retorna `0` para categorias desativadas nunca uma fatia do total filtrado. |
| RN-27 | **Revisão geral (`revisao`) é sub-item de Manutenção**, não uma categoria independente. No donut, o percentual de `revisao` é somado ao de `manutencao`. No detalhamento, revisão aparece como linha dentro do accordion Manutenção. Não existe toggle individual para revisão. |

---

## Toggle ORG/PAR por Peça

| ID | Regra |
|---|---|
| RN-10 | Toggle ORG/PAR por peça na aba AUTONOMIA sobrescreve o `perfilPecasGlobal` para aquela peça. |
| RN-11 | Se `anoFimOriginal` no preset indica que não há original para o modelo/ano, toggle ORG é desabilitado para todas as peças. |
| RN-12 | Toggle ORG/PAR por peça é um override armazenado no perfil (segue RN-02). Reset (↺) da peça desfaz também esse toggle. |

---

## Multi-Combustível

| ID | Regra |
|---|---|
| RN-13 | Custo de combustível calculado usando `tipoGasolinaPreferida` definido no onboarding. |
| RN-14 | Configurar preço/autonomia de outros tipos na aba AUTONOMIA não muda o tipo principal apenas atualiza os dados daquele tipo. |
| RN-15 | Para trocar o tipo principal, o usuário vai a Configurações e altera `tipoGasolinaPreferida`. |

---

## Gatilho Duplo (km ou tempo)

| ID | Regra |
|---|---|
| RN-16 | Para peças com intervalo em km e em meses, o sistema calcula qual gatilho é atingido primeiro. |
| RN-17 | `mesesParaAtingirKm = intervaloKm / kmMensal`. Se `< intervaloMeses` → gatilho por km. Caso contrário → `intervaloEfetivo = intervaloMeses × kmMensal`. |

---

## Alerta de Manutenção

| ID | Regra |
|---|---|
| RN-18 | Alerta exibido quando `kmRestante ≤ 500` (padrão configurável). |
| RN-19 | `diasRestantes = kmRestante / (kmDia × diasSemana / 7)`. |
| RN-20 | Painel exibe apenas o alerta mais urgente. Todos os pendentes visíveis no Detalhamento. |

---

## Fator de Responsabilidade (Moto Alugada)

| ID | Regra |
|---|---|
| RN-21 | `fatorResponsabilidade` aceita: `"eu" → 1.0` · `"locador" → 0.0` · `"dividimos" → 0.5`. |
| RN-22 | Fator aplicado por bloco: documentação · manutenção · seguro. Financiamento/aluguel não tem fator é sempre custo do entregador. |
| RN-23 | Se `situacaoMoto !== 'alugada'`, todos os fatores são `1.0` (sem efeito). |

---

## Consistências de Dados

| ID | Regra |
|---|---|
| RN-24 | `kmAtual` é atualizado automaticamente após cada Registro de Rodagem: `kmAtual = max(kmAtual, kmFinal)`. |
| RN-25 | Após 5+ Registros de Rodagem, `kmDiaMedioReal` é calculado. O usuário pode optar por usá-lo em vez do valor do onboarding. |
| RN-26 | Após 2+ registros do mesmo tipo de manutenção, `intervaloRealObservado` é calculado e exibido como informação (não substitui automaticamente o preset). |

---

## Invariantes do Domínio (RN com status de invariante)

As regras abaixo são também listadas em `docs/dominio/invariantes.md` por serem protegidas no código e nunca poderem ser violadas:

| ID | Invariante |
|---|---|
| INV-CALC-1 | `kmAnual = kmDia × diasSemana × 52`. **Nunca** `kmMensal × 12`. |
| INV-CALC-2 | `manutencaoPorPeca`: peça é ativa se valor é `true` ou `undefined`. Apenas `false` explícito desativa. |
| INV-PERSIST-1 | localStorage só acessado via `services/perfilStorage.ts`. |
| INV-PERSIST-2 | Presets JSON (`src/presets/*.json`) imutáveis em runtime. |
| INV-PERSIST-3 | Salvamento condicional: só persistir com `presetAtivoId` definido (onboarding completo). |
| INV-MOTO-1 | `kmAtual` monotônico crescente: atualizado com `Math.max()`. |

---

> **Status geral das RNs:** todas documentadas. Invariantes implementadas no código atual. RN-25 e RN-26 têm divergências registradas em `docs/dominio/divida-tecnica.md` (DT-7 e relacionadas).

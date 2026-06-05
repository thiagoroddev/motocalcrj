# Regras de Negócio MotoCalc RJ

> Documento operacional derivado da especificação consolidada em 09/05/2026 e atualizado pelas ADRs e tarefas posteriores.
> IDs ativos: RN-01 a RN-23 e RN-27. Regras que definem o que é válido no domínio, independente de implementação.
> **Nota:** RN-24, RN-25 e RN-26 dependiam da tela Registros e foram **adiadas via ADR-003**. Removidas deste documento operacional; a ADR é a fonte da decisão e do escopo adiado.

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
| RN-27 | **Revisão geral (`revisao`) é sub-item de Manutenção**, não uma categoria independente. No donut, o percentual de `revisao` é somado ao de `manutencao`. No Detalhamento, revisão aparece como linha dentro do accordion Manutenção e pode ter toggle fino persistido, sem virar categoria própria. |

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

> **Status geral das RNs:** todas documentadas. Invariantes implementadas no código atual. RN-24, RN-25 e RN-26 foram adiadas via ADR-003 (dependiam de Registros) - DT-7 já marcada ENDEREÇADA em `docs/dominio/divida-tecnica.md` pela TASK-DOC-009.

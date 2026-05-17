---
description: "Padrões de revisão para agentes de IA: checklist, severidade, veredito, registro de achados e criação de tarefas a partir de revisão."
applyTo: "**/*"
---

# Padrões de Revisão para Agentes de IA

> Este arquivo define **como revisar código, documentação e tarefas concluídas**.
> Ele não define padrões de implementação, estrutura de documentação, fluxo completo de tarefas ou regras de segurança.

## Como este padrão se relaciona com os outros

| Arquivo | Relação |
|---|---|
| `Geral.agent.md` | Define prioridade de regras, processo geral e quando pedir aprovação. |
| `codigo-react-typescript.agent.md` | Define os padrões técnicos que a revisão deve verificar em código. |
| `documentacao.agent.md` | Define onde registrar requisitos, ADRs, dívida técnica e docs afetadas pela revisão. |
| `tarefas.agent.md` | Define como registrar tarefas geradas pela revisão. |
| `seguranca.agent.md` | Define problemas de segurança/privacidade que sempre são bloqueantes. |

---

## 1. Objetivo da revisão

A revisão existe para responder:

1. O que foi feito atende ao objetivo?
2. O código/documentação respeita os padrões do projeto?
3. Alguma regra de negócio foi quebrada?
4. Há risco de segurança, privacidade, performance ou acessibilidade?
5. A entrega está pronta ou precisa gerar novas ações?

Revisão não é só procurar erro de sintaxe. É validar qualidade, intenção e impacto.

---

## 2. Quando revisar

A revisão é obrigatória quando a tarefa envolve:

- código crítico;
- cálculo;
- estado global;
- persistência;
- autenticação/autorização;
- dados pessoais;
- APIs externas;
- alteração de arquitetura;
- refatoração relevante;
- requisito funcional;
- requisito não-funcional;
- mudança em documentação oficial do projeto.

Revisão pode ser marcada como `N/A` quando a mudança for trivial.

Exemplos de `N/A`:

- correção de typo;
- ajuste de formatação;
- remoção de import não usado;
- atualização pequena de texto sem mudar significado.

Mesmo quando for `N/A`, registre explicitamente o motivo.

```md
## Revisão

N/A - Mudança trivial: correção de typo no README.
```

---

## 3. Severidade dos achados

Classifique cada problema por severidade.

| Severidade | Significado | Resultado esperado |
|---|---|---|
| 🔴 Bloqueante | Impede aprovação. Pode quebrar produto, segurança, dados ou requisito. | Corrigir antes de concluir. |
| 🟡 Importante | Não impede totalmente, mas deve virar correção ou tarefa rastreável. | Corrigir agora ou gerar tarefa. |
| 🟢 Sugestão | Melhoria opcional. | Aplicar se fizer sentido ou registrar como sugestão. |
| ⚪ Observação | Informação útil sem ação imediata. | Registrar apenas. |

---

## 4. O que é bloqueante

Considere bloqueante quando houver:

- quebra de requisito existente;
- quebra de invariante;
- erro de TypeScript relevante;
- teste falhando por causa da mudança;
- risco de vazamento de dado pessoal;
- dado pessoal em URL;
- acesso direto a storage quando o projeto exige serviço;
- alteração de comportamento não aprovada;
- dependência instalada sem aprovação;
- ação destrutiva não aprovada;
- `any` sem justificativa em área crítica;
- componente inacessível em fluxo essencial;
- build quebrado;
- documentação oficial contradizendo o código.

Problema bloqueante precisa ser corrigido antes de marcar a tarefa como concluída, salvo autorização explícita do humano para registrar como pendência.

---

## 5. Dimensões de revisão

Use estas dimensões conforme o tipo de tarefa.

| Dimensão | O que verificar |
|---|---|
| Objetivo | A entrega resolve o que a tarefa pediu? |
| Escopo | A tarefa não fez coisa demais? |
| Requisitos | RFs, RNs e RNFs relacionados foram respeitados? |
| Domínio | Termos, invariantes e regras de negócio estão corretos? |
| Arquitetura | Arquivos estão no lugar certo? Camadas foram respeitadas? |
| TypeScript | Tipos estão seguros? Não há `any` indevido? |
| React | Hooks, estado, renderização e keys estão corretos? |
| UI | Componentes são reutilizáveis e aceitam extensão? |
| Acessibilidade | Labels, foco, aria, contraste e toque mínimo foram considerados? |
| Segurança | Dados sensíveis, storage, URLs e logs estão seguros? |
| Testes | Há cobertura mínima para comportamento novo ou alterado? |
| Documentação | Docs atualizadas sem duplicar o código? |
| Tarefas | Novas pendências foram registradas corretamente? |

---

## 6. Checklist rápido de código

Use quando a tarefa mexer em código.

```md
- [ ] Idioma consistente com o projeto.
- [ ] Nenhum `any` sem justificativa.
- [ ] `unknown` usado quando entrada é incerta.
- [ ] Sem acesso direto a `localStorage`/`sessionStorage` em componente.
- [ ] Efeitos colaterais isolados em services/hooks apropriados.
- [ ] Sem `useEffect` para derivar estado simples.
- [ ] Keys de listas usam IDs estáveis.
- [ ] Pages não concentram lógica de negócio.
- [ ] Hooks têm responsabilidade clara.
- [ ] Componentes UI não conhecem regra de negócio.
- [ ] Componentes aceitam `className` quando aplicável.
- [ ] Sem `console.log` com dados sensíveis.
- [ ] Sem dados pessoais em URL.
- [ ] Erros de formulário têm `aria-describedby` e `aria-invalid`.
- [ ] Inputs têm label visível e associado.
- [ ] Elementos interativos têm área de toque adequada.
- [ ] Testes relevantes foram criados ou atualizados.
- [ ] Build/typecheck/lint/test foram executados quando aplicável.
```

---

## 7. Checklist de documentação

Use quando a tarefa mexer em docs.

```md
- [ ] Documento está no caminho padrão correto.
- [ ] Não duplica informação que o código já expressa.
- [ ] Não contradiz requisito, ADR ou código existente.
- [ ] Links internos estão atualizados.
- [ ] Requisitos novos têm motivo claro.
- [ ] ADR foi criada apenas para decisão relevante.
- [ ] Dívida técnica tem impacto e gatilho.
- [ ] O que precisa de validação humana foi marcado como pendente.
- [ ] Documentos antigos foram arquivados, não deletados.
```

---

## 8. Checklist de tarefa concluída

Use antes de mover para `docs/tarefas/concluidas/`.

```md
- [ ] Objetivo da tarefa foi atendido.
- [ ] Escopo respeitado.
- [ ] Arquivos alterados listados.
- [ ] Decisões tomadas registradas.
- [ ] O que não foi feito foi explicado.
- [ ] Testes/checks registrados.
- [ ] Revisão registrada ou marcada como N/A.
- [ ] Requisitos atualizados, se necessário.
- [ ] ADRs registradas, se necessário.
- [ ] Dívidas técnicas registradas, se necessário.
- [ ] Tarefas geradas registradas, se necessário.
```

---

## 9. Formato de revisão

Use este modelo:

```md
## Revisão: [arquivo ou tarefa]

### ✅ Bom

- [algo bem resolvido]

### 🔴 Bloqueante

**[Título do problema]**
- Onde: `arquivo.ts` linha X
- Problema: [descrição objetiva]
- Impacto: [o que pode quebrar]
- Solução: [ação concreta]

### 🟡 Importante

**[Título do problema]**
- Onde: `arquivo.ts`
- Problema: [descrição]
- Solução sugerida: [ação]

### 🟢 Sugestões

- [melhoria opcional]

### ⚪ Observações

- [informação útil]

## Veredito

APROVADO / APROVADO COM RESSALVAS / REPROVADO / N/A

## Tarefas Geradas pela Revisão

- TASK-BG-001: [descrição]
```

Se uma seção não tiver itens, use:

```md
Nenhum.
```

---

## 10. Vereditos

Use apenas estes vereditos:

| Veredito | Quando usar |
|---|---|
| `APROVADO` | Não há bloqueantes nem pendências relevantes. |
| `APROVADO COM RESSALVAS` | Funciona, mas há itens importantes rastreados. |
| `REPROVADO` | Há bloqueante ou objetivo não foi atendido. |
| `N/A` | Mudança trivial que não exigiu revisão formal. |

### Regra

Não use `APROVADO` quando houver bloqueante.

Não use `N/A` para mudança que altera comportamento, requisito, arquitetura, segurança ou dados.

---

## 11. Tarefas geradas pela revisão

Toda revisão que encontra problema acionável deve registrar uma ação.

Tarefas geradas pela revisão devem seguir o padrão de `tarefas.agent.md`: use sempre `TASK-ID` completo (`TASK-BG`, `TASK-REF`, `TASK-RNF`, `TASK-DOC`, etc.) e registre vínculos relacionados em `REQ/ADR/DT`.

Use esta árvore:

```txt
Problema encontrado
├── Viola requisito existente?
│   └── Criar TASK-BG ou TASK-REF referenciando o requisito em REQ/ADR/DT.
├── Viola regra técnica já documentada?
│   └── Criar TASK-REF, TASK-BG ou TASK-CHORE.
├── É comportamento novo não coberto?
│   └── Propor requisito + TASK-RF ou TASK-RNF.
├── É decisão arquitetural?
│   └── Propor ou criar ADR + TASK relacionada com REQ/ADR/DT apontando para a ADR.
├── É problema conhecido que não será resolvido agora?
│   └── Registrar dívida técnica com gatilho.
└── É trivial e dentro do escopo?
    └── Corrigir na própria tarefa.
```

### Quando uma revisão deve incentivar ADR

Incentive ADR quando a revisão revelar uma decisão arquitetural relevante, estrutural ou difícil de reverter.

Exemplos:

- mudança de padrão de estado global;
- nova dependência com impacto recorrente;
- reorganização de pastas/camadas;
- estratégia de persistência, autenticação, autorização ou integração externa;
- regra estrutural que afeta muitos arquivos.

Não incentive ADR para typo, ajuste visual isolado, refatoração pequena ou decisão já coberta por requisito/convenção existente.

### Exemplos

```md
## Tarefas Geradas pela Revisão

- TASK-BG-007: Corrigir status com dois estados quando RF-REG-05 exige três. REQ/ADR/DT: RF-REG-05.
- TASK-REF-003: Extrair lógica de cálculo de `PaginaResumo.tsx`. REQ/ADR/DT: DT-002.
- TASK-RNF-004: Adicionar requisito de `aria-label` em gráficos interativos. REQ/ADR/DT: RNF-004.
```

---

## 12. Quando corrigir agora e quando gerar tarefa

| Situação | Ação |
|---|---|
| Problema pequeno e dentro do escopo | Corrigir agora. |
| Problema bloqueante dentro do escopo | Corrigir antes de aprovar. |
| Problema fora do escopo | Gerar tarefa. |
| Problema grande demais para a tarefa atual | Gerar tarefa ou dívida técnica. |
| Problema arquitetural relevante | Propor ADR e tarefa `TASK-*` vinculada em `REQ/ADR/DT`. |
| Problema de segurança | Corrigir agora ou reprovar. |

---

## 13. Revisão de testes

Ao revisar testes, verifique:

```md
- [ ] Teste cobre caminho feliz.
- [ ] Teste cobre invariantes relevantes.
- [ ] Teste cobre edge cases importantes.
- [ ] Nome do teste explica comportamento.
- [ ] Teste segue Arrange-Act-Assert quando aplicável.
- [ ] Teste não depende de ordem acidental.
- [ ] Teste não testa implementação interna desnecessária.
- [ ] Teste não foi atualizado só para “passar”.
```

### Regra importante

Atualizar teste sem entender por que ele falhou é erro grave.

Fluxo:

```txt
Teste falhou
├── Mudança de comportamento foi intencional?
│   ├── Não → corrigir o código.
│   └── Sim
│       ├── Comportamento antigo ainda é desejado?
│       │   ├── Sim → ajustar código para suportar ambos.
│       │   └── Não → atualizar teste e documentar motivo.
```

---

## 14. Revisão de acessibilidade

Use quando houver UI.

```md
- [ ] Todo input tem label visível.
- [ ] Label usa `htmlFor` associado ao `id`.
- [ ] Campo com erro usa `aria-invalid`.
- [ ] Mensagem de erro usa `aria-describedby`.
- [ ] Botão só com ícone tem `aria-label`.
- [ ] Ícones decorativos usam `aria-hidden`.
- [ ] Ordem de foco é lógica.
- [ ] Foco visível existe.
- [ ] Elementos interativos têm área adequada.
- [ ] Movimento respeita `prefers-reduced-motion`, quando aplicável.
```

---

## 15. Revisão de segurança e privacidade

Use junto com `seguranca.agent.md`.

```md
- [ ] Nenhum segredo exposto no código.
- [ ] Nenhum dado pessoal em URL.
- [ ] Nenhum dado sensível em `console.log`.
- [ ] Storage é acessado por serviço apropriado.
- [ ] Dados locais são limpos quando o usuário solicita apagar tudo.
- [ ] Integrações externas enviam apenas dados necessários.
- [ ] Fixtures/dados fake não entram no build de produção.
- [ ] Erros não vazam stack trace sensível para usuário final.
```

Qualquer item crítico de segurança pode reprovar a tarefa.

---

## 16. Revisão de arquitetura

Use quando a tarefa cria estrutura, muda pastas, adiciona dependência ou altera padrão.

```md
- [ ] A mudança respeita a estrutura do projeto.
- [ ] Nova dependência tem justificativa.
- [ ] Não existe solução simples com a stack atual?
- [ ] A decisão precisa de ADR?
- [ ] A mudança não cria acoplamento desnecessário.
- [ ] Efeitos colaterais estão isolados.
- [ ] Código de domínio não depende de UI.
- [ ] UI base não conhece regra de negócio.
```

---

## 17. Revisão de refatoração

Refatoração deve manter comportamento.

```md
- [ ] Comportamento externo foi preservado.
- [ ] Testes existentes continuam passando.
- [ ] Não foi adicionada feature escondida.
- [ ] A extração reduziu complexidade real.
- [ ] Nomes ficaram mais claros.
- [ ] Não houve abstração prematura.
- [ ] Não foi introduzido pattern sem necessidade.
```

Se mudou comportamento, não é só refatoração. É redesign ou feature.

---

## 18. Registro da revisão na tarefa concluída

Toda tarefa concluída deve ter seção `## Revisão`.

Exemplo com revisão formal:

```md
## Revisão

### ✅ Bom

- Hook criado com responsabilidade clara.
- Service isolou acesso ao storage.

### 🔴 Bloqueante

Nenhum.

### 🟡 Importante

- Falta teste para cenário de erro da API.

### 🟢 Sugestões

- Considerar skeleton na tela em tarefa futura.

**Veredito:** APROVADO COM RESSALVAS

## Tarefas Geradas pela Revisão

- TASK-TEST-002: Adicionar teste para erro da API.
```

Exemplo sem revisão formal:

```md
## Revisão

N/A - Mudança trivial: correção de typo em comentário.

**Veredito:** N/A
```

---

## 19. Como revisar sem ser destrutivo

Ao revisar:

- seja objetivo;
- aponte arquivo e problema;
- explique impacto;
- proponha solução concreta;
- não reescreva tudo sem necessidade;
- não transforme gosto pessoal em bloqueante;
- diferencie erro real de preferência;
- preserve decisões já registradas em ADR/requisitos.

---

## 20. Anti-padrões de revisão

Evite:

- aprovar sem ler requisito relacionado;
- reprovar por preferência estética;
- esconder problema encontrado;
- criar tarefa sem ID;
- marcar bloqueante como sugestão;
- corrigir fora do escopo sem registrar;
- atualizar teste sem entender falha;
- revisar só o diff e ignorar impacto no sistema;
- criar ADR para decisão pequena;
- criar requisito novo sem explicar motivo.

---

## 21. Regra final

Uma boa revisão deixa claro:

- o que está bom;
- o que impede aprovação;
- o que deve melhorar;
- o que é opcional;
- qual é o veredito;
- quais ações nascem dali.

Se a revisão não gera decisão, correção ou confiança, ela está fraca.

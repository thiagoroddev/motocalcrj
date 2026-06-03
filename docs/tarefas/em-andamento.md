# Tarefas em Andamento

---

## TASK-REF-32.6 - Refinamento da UI de manutenção (estimativa por-item, status visível, edição centralizada)

- **Status:** Em andamento
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** Imediata
- **Origem:** Uso real do app (03/06/26) + ADR-014
- **REQ/ADR/DT:** ADR-012, ADR-013, **ADR-014 (criada)**
- **Observações:** Surgiu testando a Pop com perfil limpo. Inclui um bug de regressão (popup de edição no modo independente antigo) e um bug de migração (perfil legado sobrescreve o preset).

### Escopo (checklist)

- [x] **B (bug):** popup de edição renderizava `CardServico` sem `modo` (caía em `independente`, "Preço Mão de Obra R$ 60" = `precoIndependente`). Passado `modo="autorizada"`. ✅
- [x] **B2 (bug de migração):** mesclagem (`servicosManutencaoPreset`) só preserva preço de concessionária do perfil quando `statusPrecoAutorizada === 'informado_usuario'`; valor legado segue o preset. Teste B2 adicionado. ✅
- [x] **E (UI):** textos de aviso agora citam "mão de obra" e "categoria Manutenção" (banner da SecaoManutencao + CardTotalAnual). ✅
- [x] **F (UI):** vocabulário consistente - a fusão em 1 linha por componente exibe **um único nome** (o da peça quando existe), acabando com o par "Kit relação" (peça) + "Troca kit transmissão" (serviço). ✅
- [x] **A (feature):** estimativa por-item ✅ — estado `perfilManutencao.estimativaMaoDeObraPorServico` (record) + ação `TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO` + schema. Cálculo: efetivo = **global OU por-serviço** (`calcularDetalhesRevisaoAnual` e imprevistos). UI: toggle no `CardServico` (modo autorizada, `nao_informado`); ligado = preço read-only exibindo o valor estimado com `~`; com o global ligado, mostra nota "ligada em Preferências".
- [x] **C (feature):** status visível sem clique - marcador por item no Detalhamento: `!` âmbar (faltando), `~` (estimado), pill `M.O.` (editado pelo usuário), oficial sem marca. Precedência resolvida no view-model. ✅
- [x] **D (refatoração estrutural — composição do item de manutenção):** ver **adendo da ADR-014**. O cálculo segue com peça (Insumos) e M.O. (serviço) em mapas separados (onde mora a verdade dos totais); a **fusão é a visão** (`utils/itensManutencao.ts`), 1 item por componente. Sub-itens:
  - [x] **d1** Flag `concessionariaIncluiPeca` por serviço (`ServicoIndependente` + schema). Honda `true`, Yamaha `false`. Estimativa e edição do usuário são sempre só M.O. ✅ (já na 32.5)
  - [x] **d2** Dados: Factor kit transmissão = **220** / sapata = **70** (só M.O., flag `false`); Pop sapatas (flag `true`). ✅ (Leva 1)
  - [x] **d3** Composição por componente (`montarItensManutencao` + fix do CPK): Honda(inclui) = total · Yamaha(só M.O.) = M.O.+peça · estimado = `~`M.O.+peça · editado = M.O.+peça · faltando = só peça. ✅
  - [x] **d4** Peça some de Insumos **só** quando `status === 'informado' && concessionariaIncluiPeca !== false` (Honda oficial). Yamaha/estimado/**editado (informado_usuario)**/faltando: peça permanece e soma. ✅
  - [~] **d5** **Superado pela convenção da Leva 1:** vida útil mora no **serviço** (decisão do usuário), não na peça. Os intervalos de serviço foram sincronizados com a vida realista da peça em entrega (Pop ×6k / Factor ×5k), então peça e M.O. amortizam alinhados. O item não descarta intervalo — usa o de cada parte, já casados.
  - [x] **d6** Exibição: **1 item por componente** (acaba a duplicação peça+serviço do modo estimado). Nome = o da peça. ✅
- **Nota:** Todos os itens (A–F) concluídos. C/F/A entraram como atributos do item-componente de D, como planejado.

### Ajustes de coerência (descobertos nos prints de uso real, 03/06)
- [x] **Popup com intervalo efetivo:** o `DialogEdicaoCusto` lia o serviço do **perfil cru** (intervalo default 12.000), enquanto o popover da peça e o cálculo usavam o **mesclado** (preset 18.000). Passou a resolver o serviço **efetivo** (`resolverServicosManutencaoPerfil`) — popup, popover e cálculo agora batem. ✅
- [x] **F — nome do componente em itens só-serviço:** sapatas Honda (peça embutida) exibiam "Troca sapata…"; agora exibem o nome da peça ("Sapata de freio dianteiro") via `nomePorPeca` do preset. ✅
- [x] **Aba Mão de Obra sincronizada com o popup (A):** os `CardServico` dos avulsos da aba não recebiam o bundle de estimativa (ficavam zerados mesmo com a estimativa ligada). Helper compartilhado `montarEstimativaMaoDeObra` (fonte única) passado também na `PaginaMaoDeObra` → aba e popup mostram o mesmo `~` read-only e o mesmo toggle. ✅
- [x] **Popover de detalhamento dinâmico:** mostrava só a peça amortizada. Agora compõe **peça + M.O. (qualquer tipo)** — tabela "Composição por troca" (peça + M.O. + total por troca) e a amortização/projeção usando o custo por troca, batendo com o valor da linha. Sem M.O. (modo sem estimativa), cai para só a peça, igual ao item. ✅
- **Fragilidade conhecida (não bloqueante):** a unificação do intervalo peça↔serviço depende de o default global (`SERVICOS_INDEPENDENTES_PADRAO`) ser **genérico/defasado** em relação ao preset — é o que faz `resolverServicoComIntervaloEditado` adotar o intervalo sincronizado para a peça também. "Corrigir" o default para casar com o preset quebraria essa unificação. Mantido de propósito; registrado para outras IAs.

### Estado
Pronto para verificação em uso. `npm run test` (272), `tsc` e `lint` verdes.

### Critérios de aceite
- Popup de edição mostra peça (Insumos) + M.O. concessionária, sincronizados, sem card antigo.
- Perfil legado não traz mais valores chutados; o preset manda, salvo edição consciente do usuário.
- Categoria Manutenção comunica o estado de cada item sem clique.
- Estimativa ligável por item; peça informada não duplica em Insumos.
- `npm run test`, `npm run lint`, `tsc` verdes.

### Gate
- Itens A/B2/D tocam estado/cálculo (`calculos.ts`, mesclagem) - sob gate humano já concedido para a série REF-32.

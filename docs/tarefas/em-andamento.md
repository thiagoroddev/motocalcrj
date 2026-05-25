# Tarefas em Andamento

---

# TASK-BG-013 — Detalhamento: card Manutenção mostra "Revisão Geral" agregado em vez de linha por serviço (modo autorizado fica opaco pós-ADR-007)

- **Status:** PENDENTE — IMEDIATA
- **Modo:** Standard
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data origem:** 25/05/26 15:10 (uso real do app pelo usuário)
- **Data início:** —
- **Dependências:** —
- **REQ/ADR/DT:** [ADR-007](../arquitetura/ADR/ADR-007.md), RF-6.3 (Detalhamento), RF-6.3.4 (toggles por item)
- **Observações:**
  - **Problema observado pelo usuário (25/05/26 15:10):** na tela Detalhamento, com modo Autorizada ativo, o card "Manutenção" exibe **uma única linha** "4× Revisão Geral (autorizada) R$ 2.702,72" agregando o pacote Honda + todos os serviços avulsos que a TASK-RF-6.22 trouxe (kit transmissão + pneu D + pneu T + sapata D + sapata T). Sem detalhamento, não dá pra entender de onde vem o valor nem editar/desativar item específico.
  - **Estado real do código (verificado 25/05/26):** [`calcularDetalhesRevisaoAnual`](../../src/utils/calculos.ts) em `src/utils/calculos.ts:316-378` retorna `servicos: new Map()` **vazio nos DOIS modos**. A UI já tem toda a infraestrutura para linha-por-serviço:
    - Tipo `CustoServicoRevisao` definido em [src/types/calculos.ts:92-100](../../src/types/calculos.ts#L92-L100).
    - Filtros `revisaoPorServico: Record<string, boolean>` em [src/types/calculos.ts:151](../../src/types/calculos.ts#L151).
    - Componente [`SecaoManutencao.tsx:91-114`](../../src/components/detalhamento/SecaoManutencao.tsx#L91) já itera `servicosRevisao.map(...)` renderizando toggle + lápis + valor por item.
    - PaginaDetalhamento já passa `servicosRevisao={[...custos.revisao.detalhes.servicos.entries()]}` em [`src/pages/PaginaDetalhamento.tsx:199`](../../src/pages/PaginaDetalhamento.tsx#L199).
    - Handlers `onToggleServicoRevisao(id)` e `onEditarServicoRevisao(idx)` em [`src/pages/PaginaDetalhamento.tsx:136-139,212-213`](../../src/pages/PaginaDetalhamento.tsx#L136).
  - **Conclusão:** o usuário **acreditava** que o modo independente já mostra linha-por-serviço ("igual em independente"), mas na verdade os 2 modos têm o mesmo bug — o agregado é só mais notável no autorizado pós-ADR-007 porque agora soma 5 serviços avulsos. **Confirmar com o usuário no início da task** se ele quer que os 2 modos sejam corrigidos ou só o autorizado.
  - **Fix proposto (preliminar, validar no início):**
    - [`src/utils/calculos.ts`](../../src/utils/calculos.ts) `calcularDetalhesRevisaoAnual`:
      - **Modo autorizado:** `base` passa a representar **apenas** o pacote Honda escalado (`(ciclo / 36000) × kmAnual`). O `servicos` Map é populado com **1 entry para cada serviço avulso** (`!incluidoNaRevisaoAutorizada && ativo && !ehExcepcional && precoTotalAutorizada > 0`), usando `precoTotalAutorizada` como `precoMaoDeObra` no `CustoServicoRevisao` e `custoAnual = (precoTotalAutorizada / intervalKm) × kmAnual`.
      - **Modo independente:** `base` vira 0 (ou ficar como soma agregada, decidir). `servicos` Map é populado com **1 entry para cada serviço ativo não-excepcional**, usando `precoMaoDeObraIndependente`.
    - [`src/components/detalhamento/SecaoManutencao.tsx`](../../src/components/detalhamento/SecaoManutencao.tsx): linha "Revisão Geral (autorizada/independente)" deve sumir quando `base === 0` OU ser repensada para representar só o pacote Honda no autorizado (label "Revisão Honda" em vez de "Revisão Geral"?). Decisão visual a alinhar.
    - **Botão lápis (popup de edição) para serviços avulsos:** hoje `onEditarServicoRevisao(idx)` chama `irParaRevisaoHonda(idx)` que navega para Mão de Obra → aba Honda → revisão `idx` do `revisaoAutorizada[]`. **Serviços avulsos não estão em `revisaoAutorizada[]`** — estão em `servicosIndependentes`. Precisa criar um handler novo `onEditarServicoAvulsoAutorizada(servicoId)` que navegue para Mão de Obra → aba Honda → seção "Serviços avulsos da concessionária fora das revisões" com **scroll/destaque** no card do `servicoId`. Pode requerer extensão de `LocationStateMaoDeObra` em [`src/pages/PaginaMaoDeObra.tsx:14-17`](../../src/pages/PaginaMaoDeObra.tsx#L14) para aceitar `destaqueServicoId?: string` além de `destaqueIndex?: number`.
    - **Toggle individual:** já funciona via `revisaoPorServico[id]` — basta popular o `servicos` Map com ids reais.
  - **Cuidados:**
    - **Manter os totais inalterados:** `revisao.total` deve continuar sendo `base + Σ servicos.custoAnual` (no atual `total: base` o Map vazio não soma; ao popular o Map, o `total` precisa virar a soma das duas partes). Cuidado para não dobrar.
    - **Filtros existentes:** `revisaoPorServico` hoje sempre default-true. Garantir que serviço novo (sapata, kit transmissão) com `precoTotalAutorizada > 0` apareça **ativo** por default no modo autorizado.
    - **Testes que afirmam `revisao.detalhes.servicos.has(...)` ficar `false`:** os testes em [`src/utils/calculos.test.ts:1013`](../../src/utils/calculos.test.ts#L1013) (`expect(resultado.revisao.detalhes.servicos.has('retifica-cabecote')).toBe(false)`) e similares precisam ser revistos — retífica não entra mesmo (é excepcional), mas kit transmissão / pneus / sapatas passam a entrar.
    - **Snapshots de cálculo da TASK-RF-6.22:** os 3 testes novos em [`calculos.test.ts`](../../src/utils/calculos.test.ts) (`"modo autorizadas: soma precoTotalAutorizada..."`, etc.) usam `calcularCustoRevisaoAnual` que delega a `calcularDetalhesRevisaoAnual().total`. Se `total` continuar igual (base+Σservicos), os testes seguem verdes. **Verificar.**
    - **Categorização visual:** se desejável, agrupar visualmente: primeiro "Revisão Honda (4× ...)", depois subseção "Avulsos" com kit/pneus/sapatas. Decisão de UX a alinhar com usuário.
    - **Auto-revisão:** rodar `npm run test`, `npx tsc --noEmit`, `npm run lint`. Validação visual no app obrigatória (foi onde o bug apareceu).
  - **Critérios de aceite:**
    - No modo autorizado, o card "Manutenção" no Detalhamento mostra: 1 linha por revisão Honda (ou linha agregada "Revisão Honda" — decidir) + 1 linha por serviço avulso ativo com `precoTotalAutorizada > 0`. Cada linha tem toggle individual + valor + botão lápis funcional.
    - No modo independente: comportamento equivalente — 1 linha por serviço ativo. Decisão se mantém linha "Revisão Geral" agregada acima ou substitui.
    - Totais não mudam (mesmo `revisao.total` antes e depois).
    - Toggle individual respeita `filtros.revisaoPorServico[id]` e reflete no total da categoria.
    - Botão lápis em serviço avulso navega para Mão de Obra → aba Honda → card correto com scroll/destaque.
    - Testes + tsc + lint verdes.
  - **Spin-off de:** TASK-RF-6.22 (concluída 25/05/26 14:00) — o bug só ficou visível depois que a 6.22 introduziu os 5 serviços avulsos no modo autorizado. Antes da 6.22 o agregado "Revisão Geral (autorizada)" representava só o pacote Honda e era aceitável.

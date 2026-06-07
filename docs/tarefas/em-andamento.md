# Tarefas em Andamento

---

# TASK-BG-023 - Consolidar a exibição de consumo só no Passo 5 (remover do Passo 2 e Passo 3) + remover resíduo "definido pelo ano"

- **Status:** EM AVALIAÇÃO (implementada; aguarda conferência visual humana)
- **Modo:** Standard
- **Valor:** Importante
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data origem:** 07/06/26 19:20 (achado na validação visual da RF-6.29)
- **Dependências:** -
- **REQ/ADR/DT:** ADR-019 (consumo é do modelo, não por ano)
- **Observações:** No Passo 2 ("Qual o modelo?") cada card mostra o subtítulo
  **"Consumo profissional definido pelo ano"** ([Passo2.tsx:60](../../src/pages/onboarding/passos/Passo2.tsx#L60))
  — texto residual do modelo antigo de consumo-por-ano (revertido na RF-6.30/RF-6.33). Consumo é
  característica do **modelo** (hardcoded no preset, extraído de manuais/INMETRO), não varia por ano.
  **Escopo (ampliado por decisão humana 07/06/26):** o consumo aparecia em **3 lugares** (Passo 2,
  Passo 3 e Passo 5). Decisão: **o consumo fica só no Passo 5**, onde é editável. Remover a exibição
  de consumo do Passo 2 e do Passo 3 (mantendo FIPE/IPVA no Passo 3); e no Passo 5 **lembrar o modelo
  escolhido** ao qual o consumo se refere (label "Consumo médio - {marca modelo}"). Varrer a UI por
  outros resíduos de "consumo por ano". Não tocar nas notas internas de preset (`consumoNota`).

## Execução

- 07/06/26 19:25: varredura na UI (`*.tsx`) por resíduos de "consumo por ano" — **único achado
  voltado ao usuário foi o Passo 2**. Os outros "por ano" são legítimos: "Estimado por ano"
  (granularidade temporal), "km que você roda por ano" (PopoverDetalhesRevisao) e comentários
  internos do Passo 3 (corretos). Notas de preset (`consumoNota`) ficam.
- 07/06/26 19:27: `Passo2.tsx` — subtítulo "Consumo profissional definido pelo ano" trocado por
  "Consumo de referência: {consumoKmL} km/L".
- 07/06/26 19:34: decisão humana — consumo aparecia em 3 telas; consolidar **só no Passo 5**.
  Removida a exibição de consumo do **Passo 2** (card fica só com o nome do modelo) e do **Passo 3**
  (some o bloco "Consumo de referência"; FIPE/IPVA permanecem; removida a `const consumoKmL` órfã).
- 07/06/26 19:36: `Passo5.tsx` — label do campo agora é **"Consumo médio - {marca} {modelo}"**
  (via `getNomeModelo`), lembrando o modelo escolhido a que o consumo se refere.
- 07/06/26 19:37: smoke ajustado — removida a asserção `findByText('54 km/L')` do Passo 3 (consumo
  não aparece mais lá); `comum.autonomia === 54` no preset final segue válido (semeado no Passo 5).

## Testes

- **APROVADO:** `npm run verify` (typecheck + lint + test) — 32 arquivos / 379 testes verdes
  (Windows nativo). Nenhum teste dependia do texto antigo.

## Revisão

### Modo
Auto-revisão IA. Mudança de cópia em UI (sem lógica). Validação visual humana pendente.

### ✅ Bom
- **Fonte única de verdade na UI:** consumo passa a aparecer só onde é editável (Passo 5), eliminando
  a duplicação em 3 telas e o risco de leitura inconsistente. Passo 3 fica focado no que é por ano
  (FIPE/IPVA).
- **Contexto no ponto de edição:** o Passo 5 nomeia o modelo no rótulo, ligando o consumo ao veículo
  escolhido.
- Varredura confirmou que não havia outros resíduos de "consumo por ano" voltados ao usuário.

### 🔴 Bloqueante / 🟡 Importante
Nenhum.

### Veredito
APROVADO COM RESSALVA: aprovado no código e no gate; **pendente conferência visual**.

## Validação Visual

- **PENDENTE:** confirmar que (1) o **Passo 2** mostra só o nome do modelo (sem consumo); (2) o
  **Passo 3** não mostra mais "Consumo de referência" (só FIPE/IPVA); (3) o **Passo 5** mostra o campo
  "Consumo médio - {marca} {modelo}" editável, pré-preenchido com o consumo do modelo.

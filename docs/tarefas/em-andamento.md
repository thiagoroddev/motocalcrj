# Tarefas em Andamento

---

# TASK-BG-023 - Remover texto residual "Consumo profissional definido pelo ano" (Passo 2) e resíduos do consumo-por-ano

- **Status:** Pendente (a iniciar — aguarda OK para executar)
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
  **Escopo:** remover/atualizar esse subtítulo (ex.: mostrar o consumo do modelo "54 km/L" ou nada) e
  varrer a UI por **qualquer outro resíduo** de "consumo por ano" voltado ao usuário. Atualizar smoke
  se algum texto verificado mudar. Não tocar nas notas internas de preset (`consumoNota`) nem nos
  comentários de código que já descrevem corretamente "não varia por ano".

## Execução

- (a iniciar)

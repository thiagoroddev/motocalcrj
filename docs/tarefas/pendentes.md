Histórico de tarefas pendentes, manter para consulta, aplicar template padrão na criação de novas tarefas e ao passá-las para `docs/tarefas/em-andamento.md`.

Obedeça essa ordem:

- Prioritárias (Imediada)
- Normais

### Tarefas Prioritárias

**Escopo futuro (registrado, não priorizado):** ajuste manual de frequência de troca (ver ADR-006, decisão 8 se implementado, deve gravar override de intervalo, nunca campo de frequência paralelo). Peças rastreáveis no card "Últimas manutenções" vela, filtro de ar, sapatas, bateria, kit embreagem, kit cilindro e retíficas absorvidas pela TASK-RF-6.13 (escopo estendido em 27/05/26 após uso real; kit revisão removido do card pela TASK-RF-6.24).


#### Geradas pela Revisão Geral REV-001 31/05/26

> Lote de 9 tarefas geradas por revisão geral do projeto (humano + IA). Cada item foi
> verificado contra o código antes de registrar. Severidades reclassificadas após
> verificação. Ordem abaixo é por prioridade combinada (Valor + risco).
> Origem rastreável: `docs/arquitetura/revisoes-gerais/REV-001.md` (achados REV-001-A01..A09).

#### Geradas pela Revisão Geral REV-002 05/06/26

> Lote gerado pela REV-002 (auditoria de tech lead após a onda FIPE/Revisão). Veredito APROVADO COM RESSALVAS; nenhum 🔴. Origem rastreável: `docs/arquitetura/revisoes-gerais/REV-002.md`.

### Pacote TASK-REF-32 - MVP manutenção por concessionária

> TASK-REF-32 foi replanejada pela TASK-REF-32.1/ADR-012. A direção anterior "manutenção/peças/histórico totalmente data-driven por preset, incluindo independente" fica como visão futura. Para o MVP de 10/06/2026, executar apenas o escopo abaixo: concessionária/autorizada, dados públicos, peças originais e aviso de custo incompleto quando faltar mão de obra.




### TASK-REF-35 Extração oportunista de arquivos grandes (com gatilho)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** G/G
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A08
- **Observações:** 🟢 Sugestão execução OPORTUNISTA, não "largar tudo": extrair partes de `src/context/PerfilContext.tsx` (~720 linhas) e `src/pages/PaginaDetalhamento.tsx` (~560 linhas) QUANDO a próxima feature tocar nelas. Manter `src/utils/calculos.ts` (~1085 linhas) como núcleo estável por enquanto é puro, seccionado e densamente testado (145 testes); mexer sem gatilho gera mais risco que ganho. **Gatilho:** próxima feature que abrir esses arquivos. Registrada como bloco por convenção do projeto, mas tratar como Desejável/gatilho.

### TASK-CHORE-016 DX: helper de localStorage falso + bootstrap de fixture DEV (com gatilho)

- **Status:** Pendente
- **Modo:** Standard
- **Valor:** Desejável
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/P
- **Data-hora origem:** 01/06/26 19:13
- **Dependências:**
- **REQ/ADR/DT:** REV-001-A09
- **Observações:** 🟢 Sugestão pequenos atritos de DX, executar se houver recorrência: (1) `criarLocalStorageFalso` aparece duplicado em testes → extrair para `src/test/localStorageFalso.ts`; (2) a fixture de desenvolvimento é importada assíncronamente em `src/main.tsx` enquanto `PerfilProvider` já inicializa lendo o storage antes avaliar bootstrap DEV antes do render ou mover a carga da fixture para a criação do estado inicial em DEV. Sem prioridade alta; registrada por convenção do projeto.

## Decisões de UI/UX Pendentes


## Export/Import e Alertas (Fase 11)

| ID          | Título                                            | Valor      | Urgência | Esforço | Dependências | Status |
| ----------- | ------------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RF-7.1 | Export/Import de presets (.json)                  | Importante | Normal   | G       | TASK-RF-6.3  | [ ]    |


---

## Analytics, PWA e Play Store (Fases 9 e 13)

| ID           | Título                                         | Valor      | Urgência | Esforço | Dependências | Status |
| ------------ | ---------------------------------------------- | ---------- | -------- | ------- | ------------ | ------ |
| TASK-RNF-8.1 | Analytics (Umami) - trackEvent centralizado    | Importante | Normal   | M       | -            | [ ]    |
| TASK-RNF-8.2 | PWA completo (manifest, service worker, cache) | Crítico    | Normal   | G       | TASK-RNF-8.1 | [ ]    |
| TASK-RNF-8.3 | TWA - publicação na Google Play Store          | Crítico    | Normal   | G       | TASK-RNF-8.2 | [ ]    |

---

## Qualidade e Polimento (Fase 10)

| ID           | Título                                                      | Valor      | Urgência | Esforço | Dependências        | Status |
| ------------ | ----------------------------------------------------------- | ---------- | -------- | ------- | ------------------- | ------ |
| TASK-RNF-9.1 | Performance e acessibilidade (Lighthouse, WCAG, toque 48px) | Importante | Normal   | G       | -                   | [ ]    |
| TASK-RNF-9.2 | Revisão final e QA (testes manuais, fluxo completo)         | Crítico    | Normal   | G       | Todas as anteriores | [ ]    |

---

## Documentação

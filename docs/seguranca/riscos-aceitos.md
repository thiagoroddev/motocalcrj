# Registro de Riscos Aceitos

> **Propósito:** registrar, com prazo e responsável, os riscos de segurança que se decidiu **não**
> corrigir agora. Cada entrada é lida por comando — `npm run audit:prod` e `npm run gate:lancamento`
> cruzam este arquivo com a saída do `npm audit`.
>
> **Especificação completa:** [`docs/analise-melhorias-agente.md`](../analise-melhorias-agente.md) §11.

---

## Por que este arquivo existe

Sem um lugar definido, "aceitar um risco" vira um comentário no chat — que é o mesmo que não
registrar. E exceção sem prazo vira permanente sem ninguém decidir que seria permanente.

Este registro não é o mesmo que a [dívida técnica](../dominio/divida-tecnica.md):

| | Dívida Técnica (`DT-NN`) | Risco Aceito (`RA-NNN`) |
|---|---|---|
| Registra | solução interna frágil que custa caro depois | vulnerabilidade **conhecida** não corrigida agora |
| Efeito prático | prioriza refactor | **destrava um gate que está reprovando** |
| Prazo | gatilho (evento que pode nunca ocorrer) | **data de revisão obrigatória** (sempre chega) |
| Quem decide | quem faz a engenharia | dono do projeto, **nominalmente** |

## Regras (resumo operacional)

- **A IA propõe; o humano aceita.** O campo `aceito_por` recebe o nome de uma pessoa. Um agente que
  se concede as próprias exceções não tem gate, tem sugestão.
- **`data_revisao` é obrigatória e no máximo 90 dias** após o aceite. Renovar exige **nova avaliação
  escrita**, não copiar-colar a justificativa anterior.
- **Vencer não gera aviso: reprova o portão** — mais alto que o advisory original, porque significa
  que o processo de revisão parou de funcionar.
- **`evidencia` é obrigatória** e guarda o comando que qualquer pessoa roda para conferir a
  justificativa. Sem ela, "não se aplica" é opinião.
- **`tarefa_de_saida` é obrigatória.** Aceitar sem caminho de saída não é decisão, é desistência.
- **Nunca criar entrada** para vulnerabilidade **alcançável** em produção. Isso se corrige.
- **Encerrar move para `## Encerrados`, nunca apaga.** O histórico é a trilha de auditoria.

---

## Ativos

```yaml
id: RA-001
titulo: react-router RSC Mode CSRF Bypass nao alcancavel em SPA sem servidor
advisory: GHSA-qwww-vcr4-c8h2
pacote: react-router
faixa_afetada: '>=7.12.0 <8.3.0'
versao_instalada: 7.18.1
severidade: high
tipo: producao
decisao: aceito
justificativa: >
  A vulnerabilidade e do modo RSC (React Server Components / server actions).
  Este app e SPA puro, sem servidor: src/App.tsx usa <BrowserRouter> + <Routes>,
  a API declarativa. Nao existe caminho de codigo que alcance o trecho
  vulneravel. A correcao exige react-router 8.3.0 (major), que precisa de
  analise de impacto propria nas 15 telas que importam o router.
evidencia: |
  grep -rn "createBrowserRouter\|RouterProvider\|loader=\|action=\|useFetcher" src/
  # -> 0 ocorrencias (verificado em 29/07/26)
  #
  # CORROBORACAO INDEPENDENTE (29/07/26): o proprio alerta do Dependabot no
  # repositorio (Security > Dependabot alerts #1) declara:
  #   "This only affects your application if you are using the unstable RSC APIs"
  # Ou seja, a justificativa acima nao e interpretacao nossa do advisory - e o
  # que a fonte do advisory afirma. CVSS 4.0: 7.1 (High), follow-up do
  # CVE-2026-22030.
aceito_por: Thiago Silva Rodrigues
data_aceite: 2026-07-29
data_revisao: 2026-10-27
tarefa_de_saida: TASK-CHORE-025
condicao_de_encerramento: >
  Migracao para react-router >= 8.3.0, OU adocao de data router / server actions
  no projeto - o que vier primeiro. A segunda hipotese invalida a justificativa
  imediatamente e torna a correcao urgente, sem nenhum advisory novo ter sido
  publicado. O Dependabot NAO consegue corrigir sozinho: react-router-dom@7.18.1
  exige react-router@7.18.1 e o patch so existe em 8.3.0, entao o caminho de
  atualizacao tentaria degradar o react-router-dom para 0.0.0. A saida passa por
  subir o react-router-dom para v8.
```

---

## Encerrados

_Nenhum ainda._

> Entrada encerrada vem para cá com a data e o desfecho: `corrigido`, `deixou de aplicar` ou
> `virou dívida técnica DT-NN`.

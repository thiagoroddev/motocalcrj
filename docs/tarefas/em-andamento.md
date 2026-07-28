# Tarefas em Andamento

---

# TASK-RNF-015 - Headers de segurança no deploy (CSP, HSTS, X-Frame-Options)

- **Status:** EM DESENVOLVIMENTO (fase 1 de 2 — CSP em Report-Only, aguardando varredura no preview)
- **Modo:** Strict
- **Valor:** Crítico
- **Urgência:** IMEDIATA
- **Esforço-H/IA:** P/M
- **Data-hora origem:** 28/07/26 18:30
- **Data-hora início:** 28/07/26 19:50
- **Dependências:** ✅ TASK-RNF-016 concluída — fonte same-origin permite `font-src 'self'` sem exceção para o Google
- **REQ/ADR/DT:** `padroes/18` §6 e §7, `checklists/41` §8
- **Observações:** O `vercel.json` tinha **apenas** `rewrites` — nenhum dos 5 headers que `padroes/18` §7 detalha. App público sem CSP, sem HSTS, sem proteção a clickjacking.

## Planejamento Aprovado

Adicionar bloco `headers` no `vercel.json`. Publicar **primeiro** com a CSP em
`Content-Security-Policy-Report-Only` (relata violações no console sem bloquear nada), navegar o app
inteiro, e só então virar para o header bloqueante — método de `padroes/18` §6.4.

**Decisão do humano sobre publicação:** validar em **branch de preview** (`csp-headers`), não em
produção. A Vercel gera URL própria por branch com o mesmo `vercel.json`, então dá para verificar
`curl -I` e navegar o app sem a produção ver CSP não testada. O risco específico desta tarefa é que
**CSP mal configurada não dá erro bonito, dá tela branca** — descobrir isso no preview é rotina;
na produção é incidente.

**Critérios de aceite:** os 6 headers presentes na resposta de produção (`curl -I`); app 100%
funcional com CSP **bloqueante**; nota A ou A+ em securityheaders.com; evidência anexada.

## Execução

- **19:50:** Medição antes de escrever a política, para não afrouxar diretiva por chute:
  - **`<script>` inline no `dist/index.html`: zero.** Os dois scripts são arquivos externos
    (`/assets/index-*.js` e `/registerSW.js`, do `vite-plugin-pwa`). Isso permite
    **`script-src 'self'` sem `'unsafe-inline'`** — a diretiva que de fato contém XSS e supply
    chain. É o ponto forte desta CSP.
  - **`data:` URI no CSS final: zero.** Mantido `img-src 'self' data:` mesmo assim (custo baixo,
    imagem não executa) por causa de possível uso em runtime.
  - **Estilos inline em runtime: existem** — o Radix aplica `style` em portais e no posicionamento
    de Select/Popover/Dialog. Isso obriga `style-src 'unsafe-inline'`. É o **único** afrouxamento
    da política, e é o caso comum e aceito em stack Tailwind v4 + Radix.
  - **`connect-src 'self'`** sai de graça: o app não chama nenhuma API em runtime (dados bundlados
    + `localStorage`). Fecha a porta de exfiltração sem custo nenhum de funcionalidade.
  - **`font-src 'self'`** só é possível por causa da `TASK-RNF-016`, concluída há 10 minutos.
- **19:55:** Branch `csp-headers` criada a partir de `motocustorj`. `vercel.json` escrito com a CSP
  em Report-Only + os outros 5 headers já em modo bloqueante (são inócuos: não podem quebrar o app).

### Política aplicada

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self';
manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'
```

- **20:05:** Branch `csp-headers` publicada. `curl -I` na **produção** (baseline, antes de qualquer
  merge) revelou um erro da análise original e evitou uma regressão:
  - A produção **já serve** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    — injetado pela **plataforma Vercel**, não pelo repositório. A análise de 28/07 afirmou "sem
    HSTS" porque foi escrita lendo o `vercel.json` em vez de medir a resposta servida.
  - Pior: o valor que eu havia escrito (`max-age=31536000; includeSubDomains`) **substituiria** o da
    plataforma e o **rebaixaria** — de 2 anos para 1, perdendo o `preload`. Corrigido para
    `max-age=63072000; includeSubDomains; preload`, igualando o comportamento atual.
  - Estado real medido: **1 de 6** headers presentes. Faltam CSP, `X-Frame-Options`,
    `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.
  - Correção propagada para `docs/analise-melhorias-agente.md` (A5, tabela do §5 e mock do `doctor`).
  - **Aprendizado imediato:** ler arquivo de configuração ≠ verificar comportamento servido. O
    critério do portão de lançamento foi reescrito para **medir a resposta HTTP**, não inspecionar o
    `vercel.json`.

## Testes

- Medições de superfície (acima) feitas contra o `dist/` do build da RNF-016.
- `curl -I` na produção (baseline): **APROVADO como medição** — 1 de 6 headers (HSTS da plataforma).
- `curl -I` no preview: **pendente** — aguardando URL do deploy (o `gh` não está instalado nesta
  máquina e o padrão de URL do preview não foi adivinhado: 404 em
  `motocustorj-git-csp-headers-thiagoroddev` e `estima-calc-git-csp-headers-thiagoroddev`).
- Varredura de violações no console: **pendente** — humano navegando o preview.
- Nota securityheaders.com: **pendente**.

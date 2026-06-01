---

description: "Checklist detalhado de acessibilidade (a11y) para frontend. Baseado em WCAG AA. Versão essencial + completa por área." modulo: "42" categoria: "checklists" versao: "1.0" relacionado:

- "16-performance-acessibilidade.md"
- "40-revisao-rapida.md"
- "13-ui-e-design-system.md"

---

# ♿ Checklist: Acessibilidade

> Lista acionável de verificações de a11y para frontend. Para conceitos e justificativas, ver [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md). Referenciado pelo [40-revisao-rapida.md](https://claude.ai/chat/40-revisao-rapida.md) quando a mudança envolve UI.

---

## WCAG: Níveis e o Que Mirar

WCAG (Web Content Accessibility Guidelines) tem 3 níveis:

|Nível|Significado|Para quem|
|---|---|---|
|**A**|Mínimo absoluto|Apps muito legados; baseline legal mínima|
|**AA**|Padrão profissional|**Mirar isto** em projetos sérios|
|**AAA**|Excelência|Apps voltados especificamente para acessibilidade|

**Padrão do pacote:** WCAG **AA**. Se o item específico exige AAA, está marcado.

---

## Os 4 Princípios (POUR)

O checklist é organizado pelos 4 princípios WCAG:

|Princípio|Pergunta|Exemplos|
|---|---|---|
|**P**erceivable|Usuário consegue **perceber**?|Alt em imagens, contraste, legendas|
|**O**perable|Usuário consegue **operar**?|Teclado, sem armadilhas, tempo suficiente|
|**U**nderstandable|Usuário **entende**?|Linguagem clara, comportamento previsível|
|**R**obust|Funciona com **diferentes tecnologias**?|HTML semântico, ARIA correto|

---

## Versão Essencial (Toda Mudança de UI)

> Estes itens são **inegociáveis**. Item `[ ]` aqui é 🔴 Bloqueante ou 🟡 Importante por padrão.

### Perceivable

- [ ] **Imagens significativas têm `alt` descritivo**
- [ ] **Imagens decorativas têm `alt=""` (string vazia, não ausente)**
- [ ] **Contraste de texto mínimo 4.5:1** (texto normal) ou **3:1** (texto grande ≥ 18pt ou 14pt bold)
- [ ] **Informação não depende só de cor** (ex: "verde = sucesso, vermelho = erro" também tem ícone ou texto)

### Operable

- [ ] **Todos os elementos interativos são acessíveis por teclado** (Tab navega, Enter/Espaço aciona)
- [ ] **Foco visível** em qualquer elemento que pode receber foco (`focus-visible:ring-*` no Tailwind)
- [ ] **Sem armadilhas de foco** (foco preso em modal sem saída, etc.)
- [ ] **Toque mínimo 48×48px** (ou exceção documentada - ver [módulo 16](https://claude.ai/padroes/16-performance-acessibilidade.md))

### Understandable

- [ ] **Inputs têm `<label>` visível associado** (via `htmlFor`/`id` ou wrapping)
- [ ] **Mensagens de erro são claras e específicas** (não jargão técnico)
- [ ] **Idioma do documento declarado** (`<html lang="pt-BR">`)

### Robust

- [ ] **HTML semântico usado** (`<button>`, não `<div onClick>`)
- [ ] **Sem `role="button"` em `<div>` quando `<button>` resolveria**
- [ ] **Componentes interativos custom (não nativos) têm `role` apropriado**

---

## Versão Completa por Área

### 1. Semântica HTML

#### Elementos certos

- [ ] `<button>` para ações (não `<div onClick>` ou `<a>`)
- [ ] `<a href>` para navegação (não `<button>` com `window.location`)
- [ ] `<h1>`-`<h6>` para hierarquia de cabeçalhos (uma `<h1>` por página)
- [ ] `<nav>` para menus de navegação
- [ ] `<main>` para o conteúdo principal (um por página)
- [ ] `<header>` e `<footer>` para regiões respectivas
- [ ] `<article>` para conteúdo autocontido
- [ ] `<section>` para seções com cabeçalho associado
- [ ] `<aside>` para conteúdo tangencial
- [ ] `<ul>`/`<ol>`/`<li>` para listas (não `<div>` empilhadas)
- [ ] `<table>` para tabelas de dados (não para layout)

#### Estrutura

- [ ] Hierarquia de cabeçalhos não pula níveis (h2 → h4 sem h3)
- [ ] Cada região (`<main>`, `<nav>`, etc.) aparece uma vez por página
- [ ] Skip links existem para pular para conteúdo principal (em apps com muito header)

### 2. Teclado e Foco

#### Navegação

- [ ] **Tab** navega elementos interativos em ordem lógica
- [ ] **Shift+Tab** navega no sentido reverso
- [ ] **Enter** aciona links e botões
- [ ] **Espaço** aciona botões (também checkboxes)
- [ ] **Setas** navegam dentro de componentes compostos (tabs, listas, menus)
- [ ] **Esc** fecha modais, dropdowns, tooltips

#### Foco visível

- [ ] Foco visível em **todos** os elementos focáveis
- [ ] `focus:` aplicado quando vem de mouse + teclado
- [ ] `focus-visible:` aplicado quando vem **só** de teclado (preferível para anel destacado)
- [ ] Ring de foco com contraste mínimo 3:1 contra fundo
- [ ] Foco não fica invisível em nenhum estado (hover, active, disabled)

#### Ordem de tabulação

- [ ] Ordem do DOM corresponde à ordem visual esperada
- [ ] `tabindex` positivo (`tabindex="5"`) **NÃO é usado** - apenas `0` ou `-1`
- [ ] `tabindex="-1"` em elementos que recebem foco programático (modal ao abrir)
- [ ] Elementos visualmente escondidos (`display:none`, `visibility:hidden`) não recebem foco

#### Armadilhas

- [ ] Modal: foco move para dentro ao abrir
- [ ] Modal: foco fica preso dentro até fechar (focus trap)
- [ ] Modal: foco retorna ao elemento que abriu, ao fechar
- [ ] Nenhum elemento "consome" Tab sem permitir sair

### 3. Screen Readers e ARIA

#### Princípio: ARIA é último recurso

- [ ] **HTML semântico foi usado primeiro** - ARIA só onde semântica não cobre
- [ ] Nenhum `role` redundante (`<button role="button">` é erro)
- [ ] Nenhum ARIA que contradiz HTML (`<a role="button">` é confuso)

#### Labels

- [ ] Botões sem texto visível têm `aria-label` (ícone-botão "X" tem `aria-label="Fechar"`)
- [ ] Ícones decorativos têm `aria-hidden="true"`
- [ ] Ícones com significado têm `aria-label` ou texto associado
- [ ] Inputs sem `<label>` visível têm `aria-label` (raro - prefira label visível)
- [ ] Grupos de inputs (radio, checkbox) têm `<fieldset>` + `<legend>` ou `role="group"` + `aria-labelledby`

#### Estados dinâmicos

- [ ] Botão toggle tem `aria-pressed="true|false"`
- [ ] Accordion/disclosure tem `aria-expanded="true|false"`
- [ ] Tab atual tem `aria-selected="true"`
- [ ] Item selecionado em lista tem `aria-current` (`page`, `step`, `true`)
- [ ] Carregamento tem `aria-busy="true"`
- [ ] Erro associado a input via `aria-describedby` + `aria-invalid="true"`

#### Anúncios dinâmicos

- [ ] Mensagens de feedback (toast, alert) usam `role="alert"` ou `aria-live="assertive"`
- [ ] Atualizações não-críticas usam `aria-live="polite"`
- [ ] Loading anúncia "carregando" para screen reader
- [ ] Mudança de página/rota anuncia (foco em h1 ou skip link)

#### Modais e diálogos

- [ ] Modal tem `role="dialog"` ou `role="alertdialog"`
- [ ] Modal tem `aria-modal="true"`
- [ ] Modal tem `aria-labelledby` apontando para título
- [ ] Modal tem `aria-describedby` para descrição quando útil

### 4. Cor e Contraste

#### Contraste

- [ ] **Texto normal: 4.5:1** mínimo
- [ ] **Texto grande (18pt+ ou 14pt bold+): 3:1** mínimo
- [ ] **Componentes UI (bordas de input, botões): 3:1** mínimo contra adjacente
- [ ] **Estados de foco: 3:1** mínimo contra fundo
- [ ] **Ícones funcionais: 3:1** mínimo

#### Validação

- [ ] Use ferramenta para validar (Lighthouse, axe DevTools, WebAIM contrast checker)
- [ ] Validar **todos** os estados (default, hover, focus, disabled, error)
- [ ] Validar **todas** as combinações fundo + texto

#### Cor + significado

- [ ] Cor não é única indicação (formulário com erro também tem ícone/texto)
- [ ] Gráficos diferenciam séries com cor **+** padrão (hatch, símbolo)
- [ ] Estados (sucesso/erro/aviso) têm texto **+** cor **+** ícone

### 5. Tamanho de Toque, Zoom e Reflow

#### Toque

- [ ] Alvo de toque mínimo **48×48px** (WCAG AAA) - ou exceção documentada
- [ ] Espaçamento entre alvos: pelo menos 8px se algum é < 48px
- [ ] Áreas de toque podem ser maiores que o visual (padding aumenta área clicável)

#### Zoom

- [ ] Página suporta zoom até **200%** sem perda de funcionalidade
- [ ] Página suporta zoom até **400%** com reflow (sem rolagem horizontal)
- [ ] Texto pode ser aumentado em **200%** sem cortar conteúdo
- [ ] **NÃO usa `user-scalable=no` ou `maximum-scale=1`** no viewport meta

#### Reflow

- [ ] Layout reflua a 320px de largura sem scroll horizontal
- [ ] Conteúdo não é cortado por overflow indevido

### 6. Movimento, Animação e Mídia

#### Movimento

- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Sem auto-play de áudio
- [ ] Vídeo auto-play é silenciado por padrão
- [ ] Sem flashes/piscamentos > 3 vezes/segundo (risco de epilepsia)
- [ ] Carrosséis automáticos têm pausa e podem ser parados

#### Mídia

- [ ] Vídeos têm legendas (closed captions)
- [ ] Áudios têm transcrição
- [ ] Conteúdo crítico apresentado em áudio também está em texto
- [ ] Controles de mídia (play/pause/volume) são acessíveis por teclado

### 7. Formulários

#### Labels e instruções

- [ ] Cada input tem `<label>` visível
- [ ] Label associada via `htmlFor`/`id` ou wrapping (`<label>texto <input /></label>`)
- [ ] Instruções extras antes do input (não só placeholder)
- [ ] Placeholder NÃO substitui label
- [ ] Campos obrigatórios marcados visualmente **e** com `aria-required="true"` (ou `required` HTML)

#### Erros

- [ ] Mensagens de erro são específicas ("CPF deve ter 11 dígitos" - não "Inválido")
- [ ] Erro associado ao input via `aria-describedby`
- [ ] Input com erro tem `aria-invalid="true"`
- [ ] Erro também é anunciado para screen reader (`role="alert"` ou similar)
- [ ] Foco vai para primeiro erro após submit falhar

#### Sucesso e progresso

- [ ] Sucesso de submit é anunciado (`role="status"` ou similar)
- [ ] Formulários multi-step indicam progresso (`Etapa 2 de 4`)
- [ ] Botão de submit desabilita durante envio com `aria-busy="true"`

#### Input correto

- [ ] `type` apropriado (`email`, `tel`, `number`, `date`, etc.)
- [ ] `inputMode` apropriado (`numeric`, `decimal`, `tel`, `email`)
- [ ] `autocomplete` apropriado (`name`, `email`, `current-password`, etc.)
- [ ] `pattern` quando aplicável (raro - Zod valida no JS)

### 8. Estados Dinâmicos

#### Loading

- [ ] Skeleton ou spinner anunciados com `aria-busy` ou `aria-live`
- [ ] Loading não trava o usuário sem feedback
- [ ] Operações > 1s mostram indicador

#### Erro

- [ ] Erro de carregamento tem retry visível
- [ ] Mensagem de erro descreve a causa, quando possível
- [ ] Erro não derruba toda a página (boundary)

#### Vazio

- [ ] Estado vazio tem mensagem clara
- [ ] CTA quando aplicável
- [ ] Ilustração ou ícone descritivo (com `aria-hidden`)

### 9. Imagens e Mídia

- [ ] `<img>` significativas têm `alt` descritivo (informativo, não redundante)
- [ ] `<img>` decorativas têm `alt=""` (vazia, **não ausente**)
- [ ] Imagens com texto contém o mesmo texto como `alt` ou próximo
- [ ] Ícones funcionais (sem texto adjacente) têm `aria-label`
- [ ] SVG inline complexo tem `<title>` ou `aria-label`
- [ ] Imagens não são fonte única de informação (texto também transmite)

### 10. Linguagem e Comportamento Previsível

#### Linguagem

- [ ] Idioma do documento declarado (`<html lang="pt-BR">`)
- [ ] Mudanças de idioma marcadas (`<span lang="en">`)
- [ ] Linguagem clara, evita jargão técnico desnecessário
- [ ] Abreviações expandidas pelo menos na primeira ocorrência

#### Comportamento

- [ ] Foco em elemento não muda contexto inesperadamente
- [ ] Mudar valor em input não submete formulário automaticamente
- [ ] Comportamento de elementos similares é consistente (todos os botões "Salvar" agem igual)
- [ ] Mensagens de erro aparecem onde o usuário olha (próximo do problema)
- [ ] Tempo limite pode ser estendido, desativado ou ajustado

---

## Ferramentas Para Verificar

### Automáticas (pegam ~30-40% dos problemas)

|Ferramenta|O que pega|Como usar|
|---|---|---|
|**axe DevTools** (extensão)|Violações WCAG comuns|Abre DevTools > axe > Scan|
|**Lighthouse**|Score a11y, contraste, semântica|Chrome DevTools > Lighthouse|
|**WAVE** (extensão)|Estrutura, alt, contraste|Clique no ícone, vê overlays|
|**eslint-plugin-jsx-a11y**|A11y em JSX|Roda no `npm run lint`|
|**Pa11y CLI**|Auditoria em pipeline|`pa11y http://localhost:5173`|

### Manuais (essenciais - automated não pega)

|Verificação|Como fazer|
|---|---|
|**Navegação por teclado**|Desconecte o mouse. Use Tab, Enter, Esc, setas|
|**Screen reader (Mac)**|Cmd+F5 → VoiceOver|
|**Screen reader (Win)**|NVDA gratuito; Narrator built-in|
|**Zoom 200%**|Ctrl+ (5x). Tudo legível?|
|**Modo daltonismo**|Chrome DevTools > Rendering > Emulate vision deficiency|
|**Mobile real**|Toque, zoom, scroll com gestos|

**Regra:** automated pega ~30%, manual pega o resto. **Não confie só em Lighthouse**.

---

## Quando Design Viola Acessibilidade

Caso real e doloroso: design entrega tela com contraste 3.2:1 (abaixo do mínimo) ou texto cinza claro em fundo cinza claro.

### Estratégia

1. **Cumpra o mínimo WCAG AA mesmo que design viole.** Ajuste cor ou peso da fonte.
2. **Documente a divergência** ao designer:
    
    ```
    Designer, no botão secundário o contraste era 3.2:1 (mínimo AA é 4.5:1).Ajustei para #444 em fundo branco (contraste 9.7:1). Mantém a vibe mas é legível.
    ```
    
3. **Sugira alternativa** que mantém intenção: `text-foreground` em vez de `text-muted-foreground`, etc.
4. **Registre na tarefa** ([módulo 24](https://claude.ai/processos/24-figma-para-codigo.md)): "Decisão Tomada: contraste ajustado por questões de a11y. Validar com designer."

Design bom **prevê acessibilidade**. Se o designer reclama: tem fundamento WCAG documentado. Discussão pode levar a token novo no design system.

---

## Mini-FAQ

**1. WCAG AAA é necessário?** Não para a maioria dos projetos. AAA é caro (contraste 7:1, sem timeout, sem texto em imagem, etc.) e às vezes inviável. AA é o padrão profissional. Apps específicos para a11y (governo, saúde, educação inclusiva) miram AAA.

**2. Posso usar `aria-label` em vez de `<label>` visível?** Pode tecnicamente, mas **prefira label visível**. Label visível ajuda usuários cognitivos, motores, e visuais - não só screen readers. `aria-label` só quando o contexto torna desnecessário (ex: botão "X" para fechar).

**3. Botão de ícone sem texto precisa de `aria-label`?** Sim sempre. Sem ele, screen reader anuncia "botão" sem dizer **qual**. Inacessível.

**4. `tabindex` positivo nunca?** Quase nunca. Cria ordem artificial que diverge do DOM, frágil, viola "ordem natural". Use `tabindex="0"` (focável na ordem natural) ou `tabindex="-1"` (não-focável por Tab, mas focável programaticamente).

**5. Como sei que minha cor passa AA?** Use ferramenta de contraste (WebAIM, axe, ou Tailwind plugins). Cole o hex do texto + hex do fundo. Te diz se passa AA/AAA para texto normal e grande.

**6. Animação infinita é OK?** Geralmente não. Anime se necessário, com curta duração, e respeitando `prefers-reduced-motion`. Loading spinner em `<svg>` infinito está OK porque é tarefa em andamento.

**7. PWA mobile precisa de tudo isso?** Sim e mais. Touch precisa de alvos maiores, zoom de pinça precisa funcionar, orientação landscape/portrait precisa renderizar bem.

**8. Como vendo a11y para stakeholder/cliente?** Argumentos: (1) **Legal** - LGPD/LBI/ADA podem obrigar; (2) **Mercado** - ~15% das pessoas têm alguma deficiência; (3) **SEO** - semântica = melhor indexação; (4) **Qualidade** - boas práticas a11y são boas práticas gerais.

**9. Erro do usuário e erro de validação são diferentes?** Sim. Validação automática (campo CPF inválido) usa `aria-invalid` + `aria-describedby`. Erro do usuário ao tentar ação não-permitida usa toast com `role="alert"`. Ambos são acessíveis, mas com semântica diferente.

**10. Onde busco mais informação?**

- WCAG 2.1 oficial: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: tutoriais e ferramentas
- A11y Project: checklist e padrões
- MDN ARIA: referência técnica
- Inclusive Components (Heydon Pickering): livro/blog gratuito

---

## 🔗 Checklists e Módulos Relacionados

- [`40-revisao-rapida.md`](https://claude.ai/chat/40-revisao-rapida.md) - Checklist master
- [`41-seguranca.md`](https://claude.ai/chat/41-seguranca.md) - Checklist de segurança
- [`43-performance.md`](https://claude.ai/chat/43-performance.md) - Checklist de performance
- [`../padroes/16-performance-acessibilidade.md`](https://claude.ai/padroes/16-performance-acessibilidade.md) - Conceitos detalhados
- [`../padroes/13-ui-e-design-system.md`](https://claude.ai/padroes/13-ui-e-design-system.md) - Componentes UI acessíveis por design
- [`../processos/24-figma-para-codigo.md`](https://claude.ai/processos/24-figma-para-codigo.md) - Como tratar a11y vinda de design
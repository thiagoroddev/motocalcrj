# EstimaMoto - Contexto do Projeto para IA

> **Propósito:** oferecer a visão geral necessária para uma IA entender o produto, localizar as fontes de verdade e trabalhar sem reintroduzir decisões superadas.
> **Público principal:** agentes de IA. Desenvolvedores também podem usar este documento como mapa.
> **Última atualização:** 06/06/2026, após ADR-017 e TASK-REF-39; detalhado o script de atualização FIPE (ADR-015).
> **Nome atual do produto:** EstimaMoto. Documentos históricos e alguns identificadores internos ainda usam MotoCalc RJ; não renomear em massa sem tarefa própria.

---

## 0. Protocolo Antes de Agir

1. Ler este documento por completo.
2. Ler `docs/tarefas/em-andamento.md` e o arquivo da tarefa ativa, quando houver.
3. Ler `.github/agents/geral-robusto/01-nucleo.md.md` antes de planejar ou executar uma tarefa do projeto.
4. Consultar somente as fontes específicas exigidas pelo tipo de mudança, usando o mapa deste documento.
5. Conferir o estado real do código e do Git antes de editar. Não presumir que uma lista ou contagem documental continua atual.
6. Não alterar trabalho local existente que não pertença à tarefa.
7. Se a mudança tocar cálculo, persistência, modelo de domínio ou uma decisão aceita, verificar invariantes e ADRs antes de propor a implementação.

---

## 1. Visão do Produto

### 1.1 Problema

Entregadores de moto costumam perceber o gasto com combustível, mas subestimam custos menos visíveis: manutenção, desgaste de peças, revisões, documentação, seguro, financiamento, alimentação e imprevistos. Isso faz o ganho líquido parecer maior do que realmente é.

### 1.2 Solução

O EstimaMoto é uma SPA mobile-first, local-first e orientada inicialmente ao Município e ao Estado do Rio de Janeiro. O app transforma dados da moto e da rotina de trabalho em estimativas de custo:

- por quilômetro;
- por hora;
- por dia trabalhado;
- por semana;
- por mês;
- por ano.

O objetivo é dar clareza para planejamento e formação de preço. O app é um **estimador de custo operacional**, não um sistema contábil, rastreador de corridas ou promessa do gasto exato futuro.

### 1.3 Público e contexto

- Público principal: motoboys e entregadores que usam a moto como instrumento de trabalho.
- Contexto regional atual: Rio de Janeiro, com IPVA, licenciamento e preços de referência locais.
- Uso prioritário: celular Android, incluindo conexões instáveis.
- Persistência atual: somente no navegador do dispositivo, sem conta e sem backend.

### 1.4 Escopo atual do MVP

O fluxo principal inclui:

- onboarding guiado para moto, uso, rodagem e custos pessoais;
- cálculo e detalhamento dos custos operacionais;
- edição de rodagem, custos, insumos, manutenção e dados do perfil;
- presets imutáveis com personalizações gravadas no perfil;
- manutenção do MVP orientada a concessionária/autorizada;
- sinalização explícita de valores oficiais, editados, estimados ou ausentes;
- persistência local validada em runtime;
- duas motos cadastradas:
  - Honda Pop 110i;
  - Yamaha Factor 125i.

O cadastro de modelos é data-driven por `src/presets/*.json`. Não escrever no texto ou na UI que existem cinco modelos: essa era uma intenção antiga e não corresponde ao produto atual.

### 1.5 Fora do escopo atual

- tela de Registros e formulários de rodagem, abastecimento e manutenção;
- cálculo derivado de histórico diário de registros;
- modo de cálculo "Predefinidos x Personalizado";
- backend, login, sincronização entre dispositivos e banco remoto;
- consulta de FIPE ou preços por API em runtime;
- notificações push;
- publicação na iOS App Store;
- modo independente e peças paralelas expostos na UI do MVP.

Registros (`RF-REG-*`, `RF-FORM-*`) e as regras `RN-24`, `RN-25` e `RN-26` foram adiados pela ADR-003. O código pode preservar capacidades futuras dormentes, mas elas não devem reaparecer na UI sem nova decisão.

### 1.6 Prioridades de produto

Esta tabela substitui a antiga priorização MoSCoW do monólito de requisitos. O status executável continua em `docs/tarefas/`.

| Prioridade | Direção |
|---|---|
| Essencial no V1 | Estimativa confiável e explicável; onboarding; presets e overrides; persistência local; cálculo por granularidade; transparência de manutenção; duas motos estáveis. |
| Próximas frentes | Export/import, analytics, PWA/offline completo, acessibilidade/performance, QA e distribuição TWA/Play Store. |
| Evolução possível | Comparação entre motos, retorno do modo independente, peças paralelas e alertas mais avançados. |
| Fora do V1 | Login, sync remoto, backend, preços em tempo real, push e iOS App Store. |
| Backlog adiado | Registros, formulários de registro, diário de trabalho integrado e histórico baseado em eventos, conforme ADR-003. |

---

## 2. Fontes de Verdade

Não existe um único arquivo que responda corretamente a todas as perguntas. Use a fonte adequada:

| Pergunta | Fonte primária |
|---|---|
| Qual decisão arquitetural ou de produto foi aceita? | `docs/arquitetura/ADR/` |
| Qual comportamento é exigido? | `docs/requisitos/funcionais.md`, `nao-funcionais.md`, `regras-negocio.md` |
| O que nunca pode ser violado? | `docs/dominio/invariantes.md` |
| Como o domínio é conceituado? | `docs/dominio/_glossario.md` e `docs/dominio/modelagem/` |
| Como cálculos e manutenção devem ser entendidos? | `docs/arquitetura/calculos-visao.md` e `docs/dominio/manutencao-estimativas.md` |
| Como o app se comporta hoje? | Código e testes em `src/` |
| O que está pendente, em andamento ou concluído? | `docs/tarefas/` |
| Qual foi o resultado de uma revisão geral? | `docs/arquitetura/revisoes-gerais/` |
| Qual é a referência visual? | `docs/design/`, validada contra a UI atual |

### 2.1 Ordem para resolver conflitos

1. A instrução atual e explícita do humano prevalece para a tarefa em curso.
2. Uma ADR aceita mais recente prevalece sobre intenção antiga.
3. Requisitos operacionais definem o comportamento desejado.
4. Invariantes e modelagem restringem as soluções válidas.
5. Código e testes mostram o comportamento implementado, que pode divergir do desejado.
6. Tarefas e revisões explicam o histórico, o status e as divergências conhecidas.
7. Designs e documentos históricos não prevalecem sobre ADRs, requisitos vivos ou código atual.

Quando houver divergência, não "escolher o texto mais conveniente". Registrar a discrepância e corrigi-la na fonte responsável.

### 2.2 Documento legado de requisitos v6

O snapshot `docs/requisitos/Requisitos_MotoCalc_RJ_v6.md` foi removido em 05/06/2026 pela TASK-DOC-015. Sua visão de produto e priorização útil foram absorvidas por este documento; requisitos ativos vivem nos três documentos de requisitos; estrutura, cálculos e fases vivem em fontes específicas. O conteúdo original continua disponível no histórico do Git.

Não recriar o monólito nem usar versões antigas dele para implementar FIPE, manutenção, rotas, modelos, estrutura de dados ou planejamento.

---

## 3. Mapa Funcional Atual

### 3.1 Fluxo de entrada

1. O app abre dentro de `ThemeProvider` e `PerfilProvider`.
2. O estado é carregado pelo service de perfil e validado com Zod.
3. Sem preset ativo válido ou com onboarding incompleto, `RotaProtegida` envia para `/onboarding/modelo`.
4. Com perfil válido, a raiz redireciona para `/estimativa`.

O onboarding tem 10 passos (rotas semânticas) + Confirmação, com ramificações da situação da moto; a ordem canônica vive na ADR-020. A Rodagem (km/dia, dias/semana) é editada inline na Confirmação, e "Editar" em qualquer seção volta direto à Confirmação. Nada é persistido antes de `COMMIT_ONBOARDING`.

### 3.2 Rotas e telas

| Rota | Responsabilidade |
|---|---|
| `/onboarding/*` | Configuração inicial da moto, uso e custos pessoais. |
| `/estimativa` | Resumo do custo, rodagem, granularidades, distribuição e aviso de revisão pendente. |
| `/estimativa/detalhamento` | Custos por categoria, filtros, manutenção, imprevistos e explicações. |
| `/mao-de-obra` | Revisões de concessionária, serviços avulsos e excepcionais. |
| `/insumos` | Combustíveis, peças originais e pneus relevantes ao MVP. |
| `/ajustes` | Rodagem, veículo, situação financeira, preferências e últimas manutenções. |
| `/perfil` | Gestão da predefinição/perfil local. |

A navegação inferior tem quatro itens: Estimativa, Mão de Obra, Insumos e Ajustes. Não existe rota de Registros.

### 3.3 Modelo de uso

- O usuário trabalha com um preset local ativo por vez.
- Alterações do usuário são overrides ou dados do perfil; os JSONs não são modificados.
- O custo é recalculado a partir do estado atual, sem histórico de eventos.
- Gastos personalizados são valores anuais acumulados em lista fechada: Multa, Sinistros e Outros.
- O MVP normaliza o cálculo para concessionária/autorizada e peças originais. Caminhos independentes permanecem internos para evolução futura.

---

## 4. Arquitetura Atual

### 4.1 Stack

| Camada | Tecnologia |
|---|---|
| Interface | React 19 |
| Build | Vite 6 |
| Linguagem | TypeScript strict |
| Roteamento | React Router 7 em modo biblioteca |
| Estado | Context + `useReducer` |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Validação runtime | Zod |
| Testes | Vitest + Testing Library |
| Persistência | `localStorage` atrás de services |

O PWA/Service Worker ainda não está instalado. "Local-first" descreve estado e dados sem backend; "offline após primeiro carregamento" só será verdadeiro depois da frente PWA.

### 4.2 Camadas principais

```text
src/
├── pages/          composição das telas e estado local de rota
├── components/     componentes compartilhados, de feature e wrappers shadcn
├── context/        estado global, reducer e defaults
├── hooks/          acesso ao estado e orquestração dos custos
├── services/       fronteiras de persistência
├── data/           catálogo derivado dos presets e dados regionais
├── presets/        dados estáticos e versionados por modelo
├── schemas/        contratos Zod de perfil, presets e dados locais
├── types/          contratos TypeScript
├── utils/          cálculos puros e view-models de domínio
└── routes/         proteção de acesso
```

Este mapa é intencionalmente estável e não enumera cada componente. Para saber o conteúdo atual de uma pasta, consultar o sistema de arquivos.

### 4.3 Estado e persistência

- Aggregate local: `EstadoApp = { perfil, presets, presetAtivoId }`.
- Envelope persistido: `PresetEntry`, que contém metadados e um `PerfilUsuario`.
- Schema público atual: `schemaVersion: 2`; perfis v1 são migrados para v2 na carga.
- Chaves: `estimamoto:v1:presets` e `estimamoto:v1:presetAtivo`.
- Fonte primária: `src/context/PerfilContext.tsx`, `src/context/perfilDefaults.ts`, `src/types/perfil.ts`, `src/schemas/perfilSchema.ts` e `src/services/perfilStorage.ts`.
- Dados inválidos são rejeitados na fronteira de carga; o app usa fallback recuperável.
- Após migração e validação, todos os perfis são normalizados contra o preset resolvido por
  `perfil.moto.modelo`. Se referências órfãs forem removidas, a lista limpa é regravada em
  best-effort; falha nessa escrita não marca o dado como corrompido.
- Tema usa service próprio em `src/services/themeStorage.ts`.

`fipeCache` continua no perfil por compatibilidade com o cálculo, mas agora é um snapshot do valor escolhido no preset, não cache de resposta HTTP.

### 4.4 Presets e catálogo

- Os presets vivem em `src/presets/*.json`.
- `src/data/repositorioPresets.ts` carrega os JSONs com `import.meta.glob`, valida cada preset e oferece acesso centralizado.
- `src/data/catalogoModelos.ts` deriva o catálogo dos presets; não é uma segunda fonte manual.
- Metadados, consumo, FIPE, peças, revisões e serviços específicos do modelo pertencem ao preset.
- Adicionar uma moto deve ser uma operação de dados validada, não uma sequência de hardcodes espalhados.

### 4.5 Pipeline de cálculo

```text
Perfil ativo + preset + dados RJ
              |
              v
normalizarPerfilMvp
              |
              v
calcularResultado
  ├── rodagem anual e dias trabalhados
  ├── custos por categoria
  ├── CPK de peças e combustível
  ├── revisão e serviços
  └── granularidades
              |
              v
useCustos -> páginas e componentes
```

O detalhe das funções pertence a `docs/arquitetura/calculos-visao.md` e ao código. Não duplicar assinaturas extensas aqui.

---

## 5. Decisões Recentes que Toda IA Deve Conhecer

### ADR-003 - sem Registros e sem modo duplo

- Registros e formulários relacionados foram adiados.
- O app calcula a partir do perfil, preset e overrides.
- Não reintroduzir histórico, diário de trabalho ou toggle Predefinidos/Personalizado por inferência.

### ADR-010 - validação na persistência

- Dados externos ao runtime confiável são validados com Zod.
- Não contornar schemas com casts para "fazer funcionar".
- Alteração de tipo persistido exige alteração coerente de schema e testes.
- Dado estruturalmente válido com referência relacional obsoleta recebe read repair condicional;
  dado estruturalmente inválido continua no fallback preservado.

### ADR-011 - preset como fonte única do modelo

- Catálogo e dados estáticos derivam do preset.
- Não hardcodar listas de modelos ou regras por marca em componentes quando o dado pode viver no preset.

### ADR-012 a ADR-014 - manutenção honesta no MVP

- Fluxo visível do MVP: concessionária/autorizada e peças originais.
- Não inventar mão de obra ausente nem tratá-la silenciosamente como custo completo.
- Estimativa de mão de obra é opt-in, sempre marcada com `~` e perde para um valor real.
- A UI funde peça e serviço por componente para exibição, mas o cálculo mantém fontes separadas.
- `concessionariaIncluiPeca` define se o preço oficial já inclui a peça; não usar hardcode "Honda x Yamaha".

### ADR-015 - FIPE local, sem API em runtime

- `preset.tabelaFipe[ano]` é a fonte única no app.
- O onboarding lê a FIPE de forma síncrona.
- Ano ausente resulta em "valor indisponível".
- Atualização mensal: `npm run fipe:check` e `npm run fipe:update`, com revisão do diff.
- A API Parallelum é usada pelo script de manutenção, não pelo app em execução.
- BrasilAPI está aposentada.

#### Como a FIPE é atualizada (script de manutenção)

- **Onde:** `scripts/atualizar-fipe-presets.mjs` (rodado por `npm run fipe:update`; `fipe:check` é dry-run).
- **Pra que serve:** atualizar os dados FIPE hardcoded de cada preset, fora do runtime do app — a
  FIPE muda devagar (referência mensal) e não pode estar no caminho crítico do onboarding.
- **Como funciona:** chama a REST da **Parallelum FIPE v2** (`https://parallelum.com.br/fipe/api/v2`),
  a API FIPE open-source (repo `parallelum/fipe-go`), com `fetch` nativo — **sem SDK nem dependência
  npm** (não introduzir Go no toolchain). Resolve `codigoFipe`, consulta o endpoint `/years` (que
  retorna **todos os anos** do modelo) e o preço de cada ano, e grava `tabelaFipe` (ano → valor) +
  `codigoFipe` direto no JSON do preset. Mensal e versionado no Git.
- **Implicação reusável:** `preset.tabelaFipe` é, portanto, a **lista canônica e auto-mantida dos
  anos reais de um modelo**. Usar suas chaves como fonte dos anos suportados (ex.: seletor de ano do
  onboarding). Detalhe completo em ADR-015 e no próprio script.

### ADR-016 - Revisão Geral amortizada

- O custo principal da Revisão Geral é amortizado por design.
- O comprimento do ciclo vem do maior marco de `preset.revisaoAutorizada`.
- O popover mostra a composição do ciclo e próximas revisões ancoradas, mas não substitui o headline amortizado.
- O aviso de revisão pendente usa `kmUltimaRevisao` e é informativo; não altera o cálculo.

### ADR-017 - hierarquia dos filtros de Manutenção

- Manutenção é o toggle pai de Revisão Geral, serviços e peças.
- Desligar o pai não reescreve os filtros finos; ao religar, as preferências anteriores retornam.
- Com o pai desligado, subtoggles preservam a posição, ficam em cinza desbotado e não clicáveis.
- Todas as categorias podem ficar desligadas; total e percentuais zero são um estado válido.

### ADR-008 - spacing Tailwind

- Usar a escala numérica padrão: `p-4`, `gap-2`, `space-y-4`.
- Não criar tokens `--spacing-*` nem classes como `p-md`.
- `npm run lint` executa o guard `scripts/check-spacing-tokens.mjs`.

---

## 6. Regras de Domínio e Cálculo

### 6.1 Conceito de ano

O total exibido combina dois horizontes:

| Categoria | Horizonte |
|---|---|
| Combustível, peças, revisão, alimentação e custos operacionais | Projeção de 12 meses baseada no estado atual e em `kmAnual = kmDia × diasSemana × 52`. |
| IPVA e licenciamento | Ano-calendário corrente. |

Não descrever o total como "o que será gasto exatamente em 2026" ou "o gasto exato dos próximos 12 meses". É uma estimativa de planejamento.

### 6.2 Presets e overrides

- Preset JSON é imutável em runtime.
- Personalização fica no perfil.
- Reset remove o override e revela novamente o valor do preset.
- O preset ativo e seu perfil no array persistido devem permanecer sincronizados.
- IDs e índices persistidos são filtrados pelo universo canônico do modelo na carga; não
  materializar a lista efetiva de serviços como se fosse override do usuário.

### 6.3 Manutenção: amortizado x ancorado

- Revisão Geral: sempre amortizada no headline.
- Peças sem km da última troca: custo amortizado.
- Peças com `kmUltimaTroca > 0`: eventos ancorados na janela projetada.
- A ausência de âncora não é zero custo; é fallback amortizado.
- Retíficas estão fora do MVP; reparo de motor permanece representado pelo kit cilindro.
- A estimativa de mão de obra nunca pode parecer valor oficial.

Antes de alterar esse domínio, ler `docs/dominio/manutencao-estimativas.md`, `docs/dominio/invariantes.md`, ADR-012 a ADR-016 e os testes associados.

### 6.4 Categorias

O cálculo agrega:

- combustível;
- alimentação;
- manutenção por peças;
- revisão e serviços;
- documentação;
- internet;
- seguro;
- financiamento ou aluguel;
- imprevistos.

Revisão é subitem de Manutenção na apresentação, não fatia independente no donut. Filtros de manutenção são default-on. A categoria Outros agrega apenas Multa, Sinistros e Outros.

---

## 7. Guardrails de Engenharia

- **Idioma:** código de domínio, componentes, testes e documentação em português, preservando nomes de bibliotecas e APIs.
- **Cálculos:** não modificar `src/utils/calculos.ts` sem aprovação explícita e plano compatível com INV-CALC-2.
- **Persistência:** nunca acessar `localStorage` diretamente fora dos services dedicados.
- **Presets:** nunca mutar JSON em runtime.
- **Dados de manutenção:** não inventar preço oficial ou esconder custo incompleto.
- **FIPE:** não adicionar fetch no onboarding nem service de consulta runtime.
- **Estado:** manter Context + `useReducer`; não introduzir outra biblioteca de estado sem decisão arquitetural.
- **UI:** procurar componente existente antes de criar outro; reutilizar wrappers de `src/components/ui/`.
- **Cálculo no JSX:** lógica de negócio pertence a hooks/utils, não ao `return`.
- **Tipos:** TypeScript strict, sem `any`; manter tipo e schema Zod alinhados.
- **Testes:** nomes em português, `describe`/`it`, padrão AAA quando aplicável.
- **Documentação:** preferir ponteiro para fonte canônica a copiar estruturas, assinaturas e contagens voláteis.

---

## 8. Mapa de Leitura por Tipo de Tarefa

| Se a tarefa toca... | Ler antes |
|---|---|
| Cálculo ou total exibido | `invariantes.md`, `calculos-visao.md`, `manutencao-estimativas.md`, ADR relacionada e testes de `calculos.ts`. |
| Manutenção, peças ou revisão | ADR-006, ADR-007, ADR-011 a ADR-016, modelagem e preset do modelo. |
| Estado ou reducer | `estado_inicial.md`, `PerfilContext.tsx`, `perfilDefaults.ts`, tipos e schemas. |
| Persistência/importação | services, schemas, INV-PERFIL e ADR-010. |
| Modelo de moto | `repositorioPresets.ts`, schemas de preset, presets existentes e RNF-10. |
| Onboarding | requisitos RF-ON, fluxo em `pages/onboarding/`, catálogo e ADR-015. |
| Componentes ou layout | componente semelhante, `tema-tailwind.md`, ADR-008 e requisitos de acessibilidade. |
| Rotas | `src/App.tsx`, `RotaProtegida.tsx` e requisitos não funcionais. |
| Requisito ou regra de negócio | os três docs em `docs/requisitos/`, ADRs e tarefas relacionadas. |
| Revisão geral | pacote `geral-robusto`, REV anterior e modelo de rastreabilidade do projeto. |

---

## 9. Estado do Produto em 05/06/2026

### Implementado e visível

- onboarding e persistência local;
- Estimativa e Detalhamento;
- Mão de Obra, Insumos, Ajustes e Perfil;
- Pop 110i e Factor 125i;
- catálogo e presets validados;
- FIPE por tabela local;
- manutenção de concessionária com custo incompleto e estimativa opt-in;
- cálculo de peças amortizado/ancorado;
- revisão geral amortizada com detalhe ancorado;
- aviso de revisão pendente;
- schemas runtime, ErrorBoundary, CI e suíte automatizada.

### Frentes ainda abertas

- export/import;
- analytics;
- PWA, cache offline e instalação;
- TWA/Play Store;
- auditoria final de acessibilidade, performance e QA;
- tarefas de higiene e testes registradas em `docs/tarefas/pendentes.md`;
- dívidas com gatilho em `docs/dominio/divida-tecnica.md`.

O status detalhado deve ser consultado nas tarefas e no código. Não repetir contagens de testes, linhas ou componentes neste documento.

---

## 10. Comandos de Verificação

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Para FIPE:

```bash
npm run fipe:check
npm run fipe:update
```

`fipe:update` altera presets e exige revisão humana do diff. Não executar como parte de outra tarefa sem necessidade explícita.

---

## 11. Índice de Documentos Ativos

| Assunto | Arquivo |
|---|---|
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Glossário | `docs/dominio/_glossario.md` |
| Invariantes | `docs/dominio/invariantes.md` |
| Modelagem | `docs/dominio/modelagem/` |
| Dívida técnica | `docs/dominio/divida-tecnica.md` |
| Manutenção e estimativas | `docs/dominio/manutencao-estimativas.md` |
| Visão dos cálculos | `docs/arquitetura/calculos-visao.md` |
| Estado inicial e persistência | `docs/arquitetura/estado_inicial.md` |
| Convenções | `docs/arquitetura/convencoes.md` |
| Padrão de testes | `docs/padrao-testes.md` |
| Tema Tailwind | `docs/design/tema-tailwind.md` |
| ADRs | `docs/arquitetura/ADR/` |
| Revisões gerais | `docs/arquitetura/revisoes-gerais/` |
| Tarefas | `docs/tarefas/` |
| Rotas atuais | `src/App.tsx` |
| Tipos do perfil | `src/types/perfil.ts` |
| Tipos de cálculo | `src/types/calculos.ts` |
| Presets | `src/presets/` |
| Núcleo de cálculo | `src/utils/calculos.ts` |

---

## 12. Como Manter Este Documento Saudável

- Atualizar a visão quando público, problema, proposta de valor ou escopo mudarem.
- Atualizar a lista de modelos quando presets forem adicionados ou removidos.
- Atualizar decisões recentes quando uma ADR substituir outra.
- Manter apenas mapas estáveis; detalhes voláteis devem apontar para o código.
- Não registrar listas exaustivas de componentes, números de testes ou linhas de arquivo.
- Não transformar este documento em requisito, ADR, modelagem detalhada ou diário de tarefas.
- Se uma informação já tem fonte canônica, resumir a implicação e criar o link conceitual, sem copiar o documento inteiro.

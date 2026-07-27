# docs/dominio Modelagem de Dominio MotoCusto

> Ponto de entrada da modelagem de dominio do projeto. Mantido pelo agente `modelador-dominio`.

---

## O Que Vive Aqui

Esta pasta contem **a modelagem conceitual** do MotoCusto o "mundo do motoboy" expresso em entidades, value objects, aggregates, eventos e invariantes **validada contra o codigo real**.

**Nao e documentacao de codigo.** Para isso, veja `contexto-base.instructions.md`.

**Nao e documentacao de requisitos.** Para isso, veja `docs/requisitos/funcionais.md`, `docs/requisitos/nao-funcionais.md` e `docs/requisitos/regras-negocio.md`.

**Documentos ativos:** os tres documentos operacionais em `docs/requisitos/`. Decisoes posteriores vivem nas ADRs.

E a camada **entre os dois**: como os conceitos do mundo real do motoboy se expressam tecnicamente no projeto, com referencia cruzada as divergencias entre codigo e requisitos quando existem.

---

## Estrutura

```
docs/dominio/
├── README.md                          ← este arquivo
├── _glossario.md                      ← Linguagem Ubiqua: termos com significado unico
├── invariantes.md                     ← Indice central de regras inviolaveis
├── divida-tecnica.md                  ← Decisoes conscientes de adiar melhorias
├── manutencao-estimativas.md          ← Tempario/estimativa de M.O. + convenção de intervalos (ADR-013/014)
│
├── aggregate-perfil.md                ← Aggregate Root: presets + preset ativo
├── aggregate-preset.md                ← Aggregate Root: PresetEntry
├── perfil-usuario.md                  ← Entidade central: PerfilUsuario (mapa para os blocos)
│
├── bloco-moto.md                      ← perfil.moto
├── bloco-trabalho.md                  ← perfil.trabalho
├── bloco-perfil-manutencao.md         ← perfil.perfilManutencao
├── bloco-financeiro.md                ← perfil.financeiro
├── bloco-configuracao-display.md      ← perfil.configuracaoDisplay
│
├── overrides.md                       ← Sistema de overrides (pecasOverrides, servicosIndependentes, revisaoAutorizadaOverrides)
├── value-objects.md                   ← Value Objects do dominio e saidas de calculo
│
├── entidade-moto.md                   ← Entidade Moto (bloco do perfil)
├── entidade-preset.md                 ← Entidade PresetEntry (envelope persistido no localStorage)
└── entidade-preset-moto.md            ← Entidade técnica PresetMoto (o JSON do modelo em src/presets/)
```

A medida que o projeto evoluir, novos arquivos serao adicionados conforme conceitos novos forem modelados.

---

## Mapa Conceitual

```
Perfil Local (Aggregate Root)
├── presets: PresetEntry[]             ← aggregate-perfil.md
└── presetAtivoId
    └── PresetEntry (Aggregate Root)   ← aggregate-preset.md
        └── perfil: PerfilUsuario      ← perfil-usuario.md
            ├── moto                   ← bloco-moto.md
            ├── trabalho               ← bloco-trabalho.md
            ├── perfilManutencao       ← bloco-perfil-manutencao.md
            ├── financeiro             ← bloco-financeiro.md
            ├── configuracaoDisplay    ← bloco-configuracao-display.md
            │
            ├── pecasOverrides[]               ┐
            ├── servicosIndependentes[]        ├── overrides.md
            └── revisaoAutorizadaOverrides[]   ┘
            │
            └── fipeCache              ← perfil-usuario.md (secao FipeCache)
```


## Principios

### Linguagem Ubiqua e Lei

Todo termo aqui usado tem **um unico significado** que vale para codigo, docs, UI e conversas. Se houver conflito, o glossario decide.

### Invariantes Sao Ultima Linha de Defesa

Validacoes de UI e restricoes de storage podem variar. Invariantes do dominio **nunca**. Quando ha conflito, vence a invariante.

### Modelagem e Validada Contra Codigo

Cada arquivo de entidade/bloco aqui foi validado contra arquivos reais (`src/types/perfil.ts`, `src/types/calculos.ts`, `src/utils/calculos.ts`). Quando ha divergencia entre modelagem e codigo, ela e registrada explicitamente.

### Dominio Existe no Mundo Real

Se um conceito nao existe na cabeca do Motoboy, **nao e dominio**. E detalhe tecnico. Nao pertence aqui.

---

## Pendencias Conhecidas

Itens que exigem decisao ou validacao de produto:

1. **RN-11 (anoFimOriginal):** regra citada em requisitos nao esta implementada no codigo de calculo; decidir se vira regra oficial.

> Pendencias 2 e 3 (Modo Personalizado e modoOficinDisplay) eliminadas pela ADR-003: modo unico, sem Registros. Implementadas em TASK-REF-18, REF-19 e REF-21.

---

## Historico

| Data            | Mudanca                                                               |
| --------------- | --------------------------------------------------------------------- |
| 2026-05-09 (v1) | Criacao inicial por inferencia apenas do contexto-base                |
| 2026-05-09 (v2) | Reescrita baseada em codigo real (PresetEntry envelopa PerfilUsuario) |
| 2026-05-11 (v3) | Inclusao do aggregate-perfil e alinhamento com reducer                |
| 2026-05-24 (v4) | TASK-DOC-009: removidos `historico-manutencao.md` e `diario-trabalho.md` (conceitos eliminados pela ADR-003 / REF-19). `servicosMaoDeObra` substituido por `servicosIndependentes[]` (REF-11). |
| 2026-06-04 (v5) | TASK-DOC-014: sincronizado com o MVP de manutenção (REF-31/32.x). Criado `entidade-preset-moto.md`; glossário, `bloco-perfil-manutencao`, `overrides`, `invariantes` e `arquitetura/calculos-visao` atualizados (estimativa, `statusPrecoAutorizada`, `concessionariaIncluiPeca`, composição como visão, DT-19). |
| 2026-06-06 (v6) | TASK-REF-42: procedência explícita do intervalo, serviço efetivo canônico e encerramento da DT-19. |

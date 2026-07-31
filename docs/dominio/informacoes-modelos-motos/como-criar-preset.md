# Como criar um preset de modelo

> **Objetivo:** poder dizer _"IA, pegue estes arquivos e crie o preset da `<moto>`"_.
> Este documento define o **conjunto mínimo de arquivos de entrada** e **quais dados
> cada um precisa ter** para gerar um preset completo, sem pesquisa redundante.
>
> O preset final é um JSON em [`src/presets/<modelo>.json`](../../../src/presets/),
> validado em runtime por [`presetSchema.ts`](../../../src/schemas/presetSchema.ts)
> (chave do modelo = nome do arquivo; descoberta automática via `import.meta.glob`).

---

## TL;DR — o que reunir

| Tipo | Arquivos | Muda por modelo? |
|---|---|---|
| **Por modelo (3)** | especificações · preços de peças · preços de revisões | sim |
| **Compartilhados (2)** | vida útil das peças · mão de obra | **não** — reusar |
| **Automático** | FIPE | só informar `nomeFipe` e rodar o script |

---

## Mapa: campo do preset → fonte

| Campo do preset | De onde vem | Escopo |
|---|---|---|
| `marca`, `modelo`, `nomeCurto` | você define (naming) | modelo |
| `consumoKmL` | **especificações** (manual) | modelo |
| `aceitaEtanol` | **especificações** (combustível flex?) | modelo |
| `fatorMaoDeObra` | cilindrada → faixa (§ Mão de obra) | modelo (derivado) |
| `nomeFipe` | você informa a string exata da FIPE | modelo |
| `codigoFipe`, `tabelaFipe` | **script** `npm run fipe:update` | automático |
| `pecas[].precoOriginal` / `precoParalela` | **preços de peças** (scrape) | compartilhável |
| `pecas[].intervaloKm` / `intervaloMeses` | **vida útil** (compartilhada) | compartilhado |
| `pneus[].vidaUtilKm` | **vida útil** (compartilhada) | compartilhado |
| `pneus[].precoOriginal` / `precoParalela` | **preços de peças** (scrape) | compartilhável |
| `revisaoAutorizada[]` | **preços de revisões** (site concessionária) | modelo |
| `servicosManutencao[]` (M.O. real) | **preços de revisões** + WhatsApp concessionária | modelo |

---

## Entradas POR MODELO

### 1. `especificacoes-<modelo>.md` — do manual

Só **4 dados são realmente lidos** pelo app; o resto é referência de compatibilidade
(ajuda a decidir que a peça de um modelo serve em outro, economizando pesquisa):

| Dado | Vira | Obrigatório |
|---|---|---|
| Consumo (km/L) | `consumoKmL` | sim |
| Combustível (flex / só gasolina) | `aceitaEtanol` | sim |
| Cilindrada | escolhe `fatorMaoDeObra` (faixa) | sim |
| Tipo de freio traseiro (tambor × disco) | quais peças de freio traseiro existem | sim (ver Cuidados) |
| `nomeFipe` (string exata da FIPE) | `nomeFipe` | sim |
| Dimensões de pneu, modelo de bateria, óleo, etc. | compatibilidade entre modelos | não (referência) |

### 2. `precos-pecas-<modelo>.md` — scrape de mercado

`precoOriginal` (genuíno/OEM) **e** `precoParalela` (mercado) de cada peça e pneu.
Fechar com uma **tabela-resumo de médias** (como no doc do Factor 125i) — é dela que
saem os números do preset.

> Muita peça Yamaha é a mesma entre modelos ("Factor 125 150 Fazer 150"). O alvo é
> que [`pecas-yamaha-compartilhadas.md`](yamaha/pecas-yamaha-compartilhadas.md) seja a
> fonte principal e o arquivo por-modelo liste só o que **diverge**.

### 3. `precos-revisoes-periodicas-<modelo>.md` — site da concessionária

Cada pacote de revisão: intervalo (km / meses), preço total, itens substituídos,
serviços por categoria (Verificação/Ajuste/Limpeza/Lubrificação). Alimenta
`revisaoAutorizada[]` e os valores **reais** de M.O. em `servicosManutencao[]`.

- O rateio peças × mão de obra do total pode ser estimado quando a concessionária só dá o total (manter a nota `"Rateio estimado"`).

---

## Entradas COMPARTILHADAS (não duplicar por modelo)

### 4. Vida útil das peças — **por marca + família/classe**

Intervalos de troca do que **não está no manual** (kit relação, embreagem, cilindro,
pastilha/disco, sapata/lona, pneus, bateria, caixa de direção...).

**Chave = marca + família/classe**, não cilindrada pura nem modelo. Motivo: dentro da
mesma família o desgaste é igual (Factor 125i e 150 → **mesma tabela**), mas modelos de
cilindrada parecida de marcas/famílias diferentes divergem (Pop 110i × Factor 125i: kit
transmissão 18.000 × 25.000 km). O intervalo realista é **sincronizado ao múltiplo da
revisão da marca** (Honda ×6.000, Yamaha ×5.000) — regra detalhada em
[`manutencao-estimativas.md` § 2](../manutencao-estimativas.md). Excepcionais (pneu na
Yamaha, retíficas) **não** sincronizam: usam a vida direta.

> Hoje isto ainda vive por modelo em
> [`vida-util-pecas-factor-125i.md`](yamaha/factor125i/vida-util-pecas-factor-125i.md).
> Pendência: promover para um único arquivo por família (ex.: `yamaha/vida-util-yamaha-factor.md`).

### 5. Mão de obra — **por marca + tempário global**

A M.O. **estimada não fica no preset**: é calculada em
[`maoDeObraEstimada.ts`](../../../src/utils/maoDeObraEstimada.ts) como

```
M.O._estimada = horas[serviço] × taxa[marca] × fatorMaoDeObra[modelo]
```

- **horas** (tempário): **global**, baseline ~125cc — vale para todo modelo.
- **taxa**: **por marca** (Honda/Yamaha hoje R$ 110/h).
- **`fatorMaoDeObra`**: **único campo de M.O. por modelo** no preset (pela cilindrada).
- **M.O. real** (quando a concessionária informou): essa **fica no preset**, em
  `revisaoAutorizada[].precoMaoDeObra` e `servicosManutencao[].precoTotalAutorizada`.

Faixas de `fatorMaoDeObra` (§ 1.4 do doc de manutenção):

| Cilindrada | Fator | Exemplos |
|---|---|---|
| 110–125cc | 1.0 | Pop 110i, Factor 125i |
| 150–180cc | 1.15 | Factor 150, Fan/Titan 160 |
| 250cc | 1.35 | Lander 250 |

Convenção de marca (ADR-014): **Honda** informa peça+M.O. juntas
(`concessionariaIncluiPeca: true`); **Yamaha** informa só M.O. (`false` → soma a peça).

---

## FIPE — automático (não é mais documento)

1. Descobrir a string exata do modelo na FIPE (API Parallelum) e pôr em `nomeFipe`.
2. Criar o preset com uma `tabelaFipe` placeholder (ao menos um ano `"AAAA": valor`).
3. Rodar `npm run fipe:update` → o script resolve `codigoFipe` e preenche `tabelaFipe`
   (anos + valores). Use `npm run fipe:check` para o dry-run.

Os `fipe-<modelo>.md` antigos são **legado** (pesquisa manual anterior ao script).

---

## Cuidados (não-óbvios)

- **Freio traseiro depende do modelo.** Tambor (Factor 125i/150) → *lona/sapata
  traseira*; **não** tem "pastilha/disco traseiro". Disco → *pastilha + disco traseiro*.
  A especificação decide. Não copie cegamente o bloco de freio entre modelos.
- **Peça nova sem tempário → M.O. estimada = R$ 0.** Para incluir uma peça nova é preciso
  adicionar em `pecas[]`, uma linha de horas no tempário
  ([`maoDeObraEstimada.ts`](../../../src/utils/maoDeObraEstimada.ts)) **e**, se for serviço
  avulso, em `servicosManutencao[]` + nos 3 mapas de `calculos.ts` (peça↔km, peça↔serviço) +
  na chave de `KmUltimaTrocas` (tipo, schema, defaults, `SecaoUltimasManutencoes`) + no ícone.
  _Exemplo já feito (TASK-RF-6.37): **caixa de direção** (1,5 h). Ainda faltam: disco/pastilha
  traseiro etc._
- **Óleo:** a vida útil dele **está no manual** (revisão 5.000 km) — só o preço vem do
  scrape. Não precisa entrar na tabela de vida útil compartilhada.
- **Pneus na Yamaha** são `ehExcepcional: true` (a concessionária não troca).

---

## Checklist por modelo

```
[ ] especificacoes-<modelo>.md   → consumo, flex, cilindrada, freio traseiro, nomeFipe
[ ] precos-pecas-<modelo>.md      → original + paralela por peça/pneu (+ tabela de médias)
                                     (ou reusar pecas-<marca>-compartilhadas.md)
[ ] precos-revisoes-<modelo>.md   → pacotes de revisão (intervalo, total, itens, serviços)
[ ] vida útil  → reusar a tabela da família (marca + classe); criar só se família nova
[ ] mão de obra → escolher fatorMaoDeObra pela cilindrada; nada mais por modelo
[ ] FIPE → pôr nomeFipe no preset e rodar `npm run fipe:update`
```

## Como pedir pra IA

> "Crie o preset da `<moto>`. Especificações em `especificacoes-<modelo>.md`, preços em
> `precos-pecas-<modelo>.md` (ou nos compartilhados da marca), revisões em
> `precos-revisoes-periodicas-<modelo>.md`. Vida útil: reusar a da família `<família>`.
> Mão de obra: fator pela cilindrada. FIPE: `nomeFipe = "<string FIPE>"`, rodar o script."

---

## Estado atual e pendências de padronização

- **Vida útil ainda por modelo** ([`vida-util-pecas-factor-125i.md`](yamaha/factor125i/vida-util-pecas-factor-125i.md)) → promover a arquivo por família.
- **`especificacoes-factor-150`** está **sem a extensão `.md`** → renomear.
- **Preços de peças** ainda por modelo → migrar o comum para [`pecas-yamaha-compartilhadas.md`](yamaha/pecas-yamaha-compartilhadas.md).
- **`fipe-<modelo>.md`** são legado (script substituiu).

# EstimaMoto MotoCalc RJ

PWA para motoboys do Rio de Janeiro calcularem o custo operacional real de suas motos. Foco inicial: Honda Pop 110i.

## O que faz

- Onboarding guiado para configurar o perfil da moto e do trabalho
- Estimativa de custo por km, dia, semana, mês e ano
- Detalhamento por categoria (combustível, manutenção, seguro, etc.)
- Suporte a múltiplos presets de moto
- Funciona offline após o primeiro acesso (PWA)

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite 6 |
| Linguagem | TypeScript 5.8 (strict) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Roteamento | React Router v7 (modo biblioteca) |
| Estado | Context + useReducer |
| Testes | Vitest (92 testes) |
| Lint | ESLint v9 (flat config) |

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run test      # rodar testes
npm run build     # build de produção
npm run lint      # verificar lint
npx tsc --noEmit  # verificar tipos
```

## Documentação

| Assunto | Arquivo |
|---|---|
| Contexto do projeto (para IA e devs) | `docs/contexto-projeto-ai.md` |
| Requisitos funcionais | `docs/requisitos/funcionais.md` |
| Regras de negócio | `docs/requisitos/regras-negocio.md` |
| Requisitos não funcionais | `docs/requisitos/nao-funcionais.md` |
| Convenções de código | `docs/arquitetura/convencoes.md` |
| Design e tokens | `docs/design/tema-tailwind.md` |
| ADRs (decisões arquiteturais) | `docs/arquitetura/ADR/` |
| Tarefas e backlog | `docs/tarefas/` |
| Glossário do domínio | `docs/dominio/_glossario.md` |


// Reset completo — volta para o onboarding
localStorage.removeItem('motocalc:v5:presets')
localStorage.removeItem('motocalc:v5:presetAtivo')
location.reload()
Ou num liner só:


['motocalc:v5:presets','motocalc:v5:presetAtivo'].forEach(k=>localStorage.removeItem(k));location.reload()



1. O que é "amortizado" em todos os contextos do app
Não é "365 dias corridos" nem "até o fim de 2026". É uma projeção anual de 52 semanas baseada no seu padrão de rodagem atual:


kmAnual = kmPorDia × diasPorSemana × 52
diasAno = diasPorSemana × 52   ← dias TRABALHADOS, não 365
(Definido em calculos.ts:31-38.)

Então se você anda 70 km/dia, 5 dias/semana → seu "ano" no app é 18.200 km e 260 dias trabalhados. É uma janela rolante para a frente, partindo do estado atual do perfil — não tem relação com calendário.


O que é amortizado e o que não é
Categoria	Amortizado?	Como
Peças (óleo, pneu, kit, vela…)	Sim	(preço/intervalo) × kmAnual, ou cíclico ancorado no km da última troca quando informado
Revisão Honda (autorizada)	Sim	(custoCicloCompleto / 36.000) × kmAnual
Revisão independente	Sim	(precoMO/intervalo) × kmAnual
Imprevistos sugeridos (retíficas)	Sim	Mesmo método das revisões
Combustível	Sim, por km	cpk × kmAnual
IPVA + Licenciamento	Não	Já são valores anuais por natureza
Internet	Não amortizado, só anualizado	mensal × 12
Seguro	Não amortizado, só anualizado	já é valor anual
Alimentação	Não amortizado, só anualizado	dia × diasTrabalhados
Financiamento / aluguel	Não amortizado, só anualizado	mensal × 12 ou semanal × 52
Gastos customizados	Não amortizado, só anualizado	mensal × 12
Resumo: tudo que tem intervalo em km (peças, retíficas, revisões) é amortizado (espalhado pela vida útil). Tudo que tem periodicidade mensal/anual fixa (seguro, internet, IPVA) é só anualizado (multiplicado para virar valor anual).

Depois o seletor de período (Ano/Mês/Sem/Dia/Hora) faz uma segunda divisão em cima do valor anual, mas isso é só conversão de exibição.
# Manual de Manutenção Preventiva: O "Ciclo de Vida" da Máquina

Tal como no desenvolvimento de uma aplicação *fullstack* (onde o *front-end* em React comunica com um *back-end* robusto em Node/Express e uma base de dados PostgreSQL), uma mota requer manutenções periódicas para evitar acumulação de "dívida técnica". Negligenciar a lubrificação ou o ajuste de válvulas é o equivalente físico a ignorar *memory leaks* ou *queries* lentas na base de dados: o sistema continua a funcionar a curto prazo, mas eventualmente o servidor vai abaixo em ambiente de produção (no meio da estrada).

Este documento compila as tabelas de manutenção periódica (1.000 km a 36.000 km), estruturadas de forma a facilitar a integração em ferramentas de *Knowledge Management* como o Obsidian.

---

## I- 💰 1. Custos de Revisão (A "Subscrição da Cloud")

Manter a mota operacional tem custos fixos e variáveis, tal como manter servidores ativos. As primeiras revisões têm a mão de obra subsidiada, semelhante a um *free tier* inicial da AWS ou Vercel.

| Quilometragem (Tempo) | Peças | Mão de Obra | Custo Total |
| :--- | :--- | :--- | :--- |
| **1.000 km** (ou 6 meses) | R$ 105,94 | **GRATUITA** | **R$ 105,94** |
| **6.000 km** (ou 12 meses) | R$ 248,06 | **GRATUITA** | **R$ 248,06** |
| **12.000 km** (ou 18 meses) | R$ 352,29 | R$ 216,00 | **R$ 568,29** |
| **18.000 km** (ou 24 meses) | R$ 402,70 | R$ 104,00 | **R$ 506,70** |
| **24.000 km** (ou 30 meses) | R$ 449,76 | R$ 288,00 | **R$ 737,76** |
| **30.000 km** (ou 36 meses) | R$ 247,67 | R$ 40,00 | **R$ 287,67** |
| **36.000 km** (ou 42 meses) | R$ 600,20 | R$ 280,00 | **R$ 880,20** |

---

## II- ⚙️ 2. Itens Substituídos: O "Garbage Collection" e Refatoração

A substituição de peças é o equivalente a atualizar dependências antigas (*npm update*) e limpar a *cache*. O óleo do motor é o *event loop* do sistema: se estiver sujo, a performance degrada-se rapidamente.

| Componente                    | 1k  | 6k  | 12k | 18k | 24k | 30k | 36k |
| :---------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Anel de vedação               |  -  |  -  |  -  | ✔️  | ✔️  | ✔️  | ✔️  |
| Borracha de Fixação           |  -  |  -  |  -  | ✔️  | ✔️  | ✔️  | ✔️  |
| Buchas do garfo traseiro      |  -  |  -  |  -  | ✔️  |  -  |  -  |  -  |
| Eixo                          |  -  |  -  |  -  | ✔️  |  -  |  -  |  -  |
| Elemento Filtro de Ar         |  -  |  -  |  -  | ✔️  |  -  |  -  | ✔️  |
| Fluido da Suspensão dianteira |  -  |  -  |  -  | ✔️  |  -  |  -  | ✔️  |
| Guarnição registro drenagem   | ✔️  |  -  |  -  | ✔️  | ✔️  | ✔️  | ✔️  |
| Junta Rotor Filtro Óleo       |  -  |  -  |  -  |  -  | ✔️  |  -  | ✔️  |
| Junta Tampa Lateral Direita   |  -  |  -  |  -  |  -  | ✔️  |  -  | ✔️  |
| Junta Tampa cabeçote          |  -  |  -  |  -  | ✔️  | ✔️  | ✔️  | ✔️  |
| Junta Tubo Escape             |  -  |  -  | ✔️  |  -  | ✔️  |  -  | ✔️  |
| Kit Revisão                   |  -  | ✔️  | ✔️  |  -  |  -  |  -  |  -  |
| Pro Honda Kit Limpeza         | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  |
| Retentor Guidão               |  -  |  -  |  -  |  -  | ✔️  |  -  | ✔️  |
| Vela de Ignição               |  -  |  -  |  -  |  -  | ✔️  |  -  | ✔️  |
| Óleo Pro Honda                | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  | ✔️  |

---

## III- 🛠️ 3. Serviços Executados: *Health Checks* e *Monitoring*

Estes são os testes unitários (`jest`, `vitest`) e rotinas de *Continuous Integration* do seu veículo. Avaliam folgas (desvios de estado) e garantem que tudo opera dentro dos parâmetros esperados.

### III.1- Ajuste & Limpeza (Otimização de Performance)
| Serviço | 1k | 6k | 12k | 18k | 24k | 30k | 36k |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Corrente de transmissão** (Ajuste) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Facho do farol** (Ajuste) | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Filtro Centrífugo Óleo** (Limpeza) | - | - | ✔️ | - | ✔️ | - | ✔️ |
| **Respiro do motor** (Limpeza) | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Tela do filtro de Óleo** (Limpeza) | - | - | ✔️ | - | ✔️ | - | ✔️ |

### III.2- Lubrificação (Prevenção de *Deadlocks* e Fricção)
| Serviço | 1k | 6k | 12k | 18k | 24k | 30k | 36k |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Coluna de Direção (Graxa 1)** | - | - | ✔️ | - | ✔️ | - | - |
| **Coluna de Direção (Graxa 2)** | - | - | - | ✔️ | - | - | ✔️ |
| **Eixo e buchas (Garfo traseiro)** | - | - | - | ✔️ | - | - | ✔️ |

### III.3- Verificação (*End-to-End Testing*)
| Componente | 1k | 6k | 12k | 18k | 24k | 30k | 36k |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Acelerador** | - | ✔️ | - | ✔️ | - | ✔️ | - |
| **Amortecedores** | - | - | ✔️ | - | ✔️ | - | ✔️ |
| **Coluna de Direção** | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Embreagem** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Folga de Válvula** | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Freios** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Marcha lenta** | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Pneus e Rodas** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Suspensão** | - | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Transmissão** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| **Vela** | - | ✔️ | - | ✔️ | - | ✔️ | - |

---
*Documento formatado para Obsidian. As tabelas acima representam o ciclo de vida ideal do equipamento, reduzindo a probabilidade de falhas críticas de hardware em tempo de execução.*

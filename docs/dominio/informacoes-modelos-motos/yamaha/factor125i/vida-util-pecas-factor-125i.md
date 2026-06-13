## Vida Útil por estimativa 


## ⏱️ Componentes Baseados em Tempo (`intervaloMeses`)

Para componentes onde a quilometragem é irrelevante, o seu modelo já possui a chave `intervaloMeses`. Caso a sua interface gráfica exija a exibição de um custo por km para _todos_ os itens de forma forçada, uma boa prática de UX/UI é calcular a quilometragem média anual do usuário (ex: se ele roda 2.000 km/mês, 12 meses = 24.000 km) e diluir o valor do componente nessa projeção.

|**ID do Componente (id)**|**Nome do Componente**|**intervaloMeses (Teto Manual)**|**intervaloMesesEntrega (Rotina)**|**Justificativa do Mock**|
|---|---|---|---|---|
|`fluido_freio`|Fluido de freio|**24**|**24**|O manual manda trocar a cada 2 anos devido à absorção de umidade (higroscopia).|
|`mangueira_freio`|Mangueira do freio|**48**|**48**|O manual estipula a troca a cada 4 anos devido ao ressecamento da borracha.|
|`bateria`|Bateria 12V 5Ah|**36**|**27**|Baterias OEM (Yuasa) podem durar 3 anos no uso leve. No uso logístico (muitas partidas e GPS), o estresse químico corta a vida útil para cerca de 27 meses.|


### ⏱️ Tabela de Ciclo de Vida (TTL) Médio por Componente

Para a construção do seu banco de dados ou da lógica de alertas do seu aplicativo, os intervalos e limites práticos (focados no uso severo urbano/entregas) foram convertidos em uma média aritmética simples (valor central entre o mínimo e o máximo estipulado anteriormente).

|**Componente (Hardware)**|**Média de Troca Estimada**|**Intervalo Base Considerado**|
|---|---|---|
|**Óleo de Motor (Uso Severo/Urbano)**|**1.750 km**|1.500 a 2.000 km|
|**Vela de Ignição (Padrão NGK)**|**10.000 km**|Fixo pelo manual (10.000 km)|
|**Vela de Ignição (Upgrade Irídio)**|**35.000 km**|30.000 a 40.000 km|
|**Filtro de Ar (Urbano/Poluição)**|**11.000 km**|10.000 a 12.000 km|
|**Pastilhas de Freio Dianteiro**|**11.500 km**|8.000 a 15.000 km|
|**Lona/Sapata de Freio Traseiro**|**20.000 km**|15.000 a 25.000 km|
|**Disco de Freio Dianteiro**|**50.000 km**|40.000 a 60.000 km|
|**Kit Relação (Genérica s/ Retentor)**|**10.000 km**|8.000 a 12.000 km|
|**Kit Relação (Premium c/ Retentor)**|**25.000 km**|20.000 a 30.000 km|
|**Pneu Dianteiro**|**22.500 km**|20.000 a 25.000 km|
|**Pneu Traseiro**|**15.000 km**|12.000 a 18.000 km|
|**Kit Embreagem (Completo)**|**40.000 km**|30.000 a 50.000 km|
|**Kit Cilindro (Motor Superior)**|**115.000 km**|80.000 a 150.000 km|
|**Bateria (VRLA/AGM)**|**27 meses** (Tempo)|18 a 36 meses (Não medido por km)|

> **Nota de Implementação (Lógica de Negócio):**
> 
> Na sua aplicação de gestão, trate a **Bateria** com um gatilho de _Data/Timestamp_ (meses) e não por odômetro (km), pois a degradação química do chumbo-ácido ocorre pelo tempo e quantidade de ciclos de ignição (partidas), independentemente da distância percorrida.


# Arquitetura de Manutenção: Cron Jobs e Ciclo de Vida (TTL) dos Componentes

Na engenharia de _software_, definimos o _Time-To-Live_ (TTL) de um cache ou a frequência de execução de um _Cron Job_ para garantir que a aplicação não sofra um vazamento de memória (_memory leak_) ou um gargalo de processamento. A engenharia mecânica da Yamaha segue a mesma lógica através do seu plano de revisões.

No entanto, é crucial separar o _Hardware_ da moto em duas categorias distintas:

1. **Hard-coded TTL (Substituição Fixa por KM):** Peças que o manual manda trocar obrigatoriamente ao atingir a quilometragem, independentemente da aparência visual.
    
2. **Event-driven TTL (Substituição Condicional / Desgaste):** Peças que entram no _loop_ de verificação a cada 5.000 km, mas cuja troca é "acionada por evento" (quando o limite físico de uso é atingido).
    

Abaixo, estruturei a documentação oficial da Yamaha para os 12 itens do nosso banco de dados, traduzindo o manual de serviços para a realidade do asfalto.

### 📦 1. Componentes com TTL Fixo (Hard-coded)

_Estes componentes possuem uma rotina de substituição obrigatória definida no código-fonte da montadora (Manual)._

#### 1. Óleo de Motor (Yamalube)

- **Recomendação Oficial (Manual):** Troca a cada **5.000 km** ou 6 meses. _Nota: A primeira troca ocorre aos 1.000 km para remover limalhas do amaciamento._
    
- **Conceito Prático:** O óleo é o _Garbage Collector_ do motor. Embora a Yamaha homologue o motor para rodar 5.000 km com o mesmo óleo, a rotina de um entregador em trânsito urbano pesado (para-e-anda sob calor extremo) caracteriza "uso severo". Na prática profissional, a comunidade de mecânicos costuma antecipar esse evento para **1.500 km a 2.000 km** para evitar a carbonização prematura do cabeçote.
    

#### 2. Vela de Ignição

- **Recomendação Oficial (Manual):** Substituição a cada **10.000 km**.
    
- **Conceito Prático:** A vela é o seu _Clock Processor_. Aos 10.000 km, o eletrodo central já sofreu erosão suficiente para aumentar a latência da centelha, gerando _packet loss_ (combustão imperfeita e aumento de consumo). Caso você utilize a vela de Irídio (Upgrade Premium), esse TTL salta para cerca de **30.000 a 40.000 km**.
    

#### 3. Filtro de Ar

- **Recomendação Oficial (Manual):** Substituição a cada **15.000 km**.
    
- **Regra de Exceção:** O manual possui uma cláusula condicional (_If/Else_): O filtro de ar precisa ser inspecionado com mais frequência se conduzir em áreas com muita poeira ou umidade. Em regiões urbanas com muita fuligem de ônibus, a saturação do papel viscoso costuma ocorrer entre **10.000 e 12.000 km**.
    

### 🔄 2. Componentes Condicionais (Event-driven / Desgaste)

_Para estes itens, a Yamaha não estipula um KM exato para jogar a peça fora. A instrução oficial (o "Cron Job") é fazer a **verificação ou ajuste a cada 5.000 km**. A troca ocorre mediante o desgaste físico (_Event Trigger_)._

#### 4. Pastilhas de Freio Dianteiro

- **Recomendação Oficial:** Verificação a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **8.000 a 15.000 km**, dependendo do tipo de frenagem. A troca é acionada quando o material de atrito chega à ranhura indicadora de desgaste.
    

#### 5. Lona de Freio Traseiro

- **Recomendação Oficial:** Ajuste a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **15.000 a 25.000 km**. Como a lona funciona em ambiente fechado (tambor) e a maior carga de parada fica na frente, ela dura consideravelmente mais. A troca ocorre quando o ponteiro do freio traseiro atinge a marcação limite no cubo.
    

#### 6. Disco de Freio Dianteiro

- **Recomendação Oficial:** Verificação a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **40.000 a 60.000 km**. O disco é um _hardware_ espesso. A troca só ocorre quando a espessura da pista de frenagem atinge o limite mínimo gravado no metal (geralmente 3.0mm ou 3.5mm) ou se ele empenar devido a choque térmico.
    

#### 7. Kit Transmissão (Relação)

- **Recomendação Oficial:** Ajuste da corrente a cada **5.000 km** nas revisões. _(Nota: embora a revisão seja a cada 5k, a lubrificação da corrente deve ser feita pelo usuário a cada 500 km)._
    
- **Vida Útil Estimada (Realidade):** Kits genéricos sem retentor duram cerca de **8.000 a 12.000 km**. Kits Premium com retentor (O-Ring) chegam facilmente a **20.000 a 30.000 km**. A troca é mandatória quando o esticador da roda traseira chega ao fim do curso ou os dentes da coroa ficam "pontiagudos".
    

#### 8 e 9. Pneu Dianteiro e Traseiro

- **Recomendação Oficial:** Verificação de pressão e integridade a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **12.000 a 18.000 km** para o pneu traseiro (que sofre mais tração e carga) e **20.000 a 25.000 km** para o dianteiro. O limite absoluto e legal da troca é o indicador TWI (_Tread Wear Indicator_), um pequeno ressalto de borracha no sulco do pneu. Quando a banda de rodagem se iguala ao TWI, o pneu está "careca" e a troca é emergencial.
    

#### 10. Kit Embreagem

- **Recomendação Oficial:** Ajuste da folga do manete e articulação a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **30.000 a 50.000 km**. Não há KM exata. A embreagem é como um _pool_ de conexões: ela falha baseada no volume de requisições mal formatadas. Se o piloto "queima" muita embreagem, ela vitrifica cedo. A troca ocorre quando a moto começa a "patinar" (o RPM sobe, mas a velocidade não acompanha).
    

#### 11. Bateria

- **Recomendação Oficial:** Verificação do sistema elétrico e luzes a cada **5.000 km**.
    
- **Vida Útil Estimada (Realidade):** **1,5 a 3 anos**. A bateria VRLA/AGM não obedece a quilometragem, mas sim a Ciclos de Carga/Descarga e degradação química pelo tempo. A substituição é feita quando a corrente de partida a frio (CCA) cai a ponto de o motor de partida girar pesado ou a injeção reiniciar sozinha.
    

#### 12. Kit Cilindro (Motor Superior)

- **Recomendação Oficial:** Não há substituição programada. O manual apenas manda ajustar as válvulas a cada **5.000 km** a partir dos 10.000 km.
    
- **Vida Útil Estimada (Realidade):** **80.000 a 150.000 km** (se as trocas de óleo e filtro de ar forem rigorosas). O cilindro é o chassi do processador. Você só retifica essa peça quando há um colapso arquitetural: perda crônica de compressão ou quando os anéis desgastam e o motor começa a queimar óleo do cárter (fumaça contínua no escape).
    

### 💡 Resumo do Fluxo de Dados (_Para o seu Banco de Dados_)

- **Troca Rígida (Configurar Alerta Exato no App):** Óleo (5k - _ou menos_), Vela (10k), Filtro de Ar (15k).
    
- **Inspeção/Manutenção (Configurar _Warning_ no App a cada 5k):** Freios, Pneus, Relação, Embreagem.




### 📦 Tabela 1: Vida Útil - Componentes Originais (OEM Yamaha)

Esta tabela mapeia o ciclo de vida rigoroso das peças originais (genuínas e Y-TEQ). O `intervaloKm` reflete o limite de engenharia estipulado no manual de serviços para condições de passeio (condições ideais). O `intervaloKmEntrega` reflete a redução dessa vida útil sob estresse térmico e mecânico constante (trânsito urbano e peso do baú).

| **ID do Componente**       | **Nome do Componente**     | **intervaloKm (Teto Manual/Passeio)** | **intervaloKmEntrega (Rotina Entregas)** | **Contexto de Degradação (Original)**                                                                         |
| -------------------------- | -------------------------- | ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `oleo_motor`               | Óleo do motor              | **5000**                              | **1750**                                 | Limite do Yamalube mantido rigorosamente; a antecipação nas entregas evita carbonização do cabeçote.          |
| `filtro_oleo`              | Filtro de óleo             | **10000**                             | **10000**                                | Troca sincronizada com o manual de serviços oficial.                                                          |
| `filtro_combustivel`       | Filtro de combustível      | **15000**                             | **15000**                                | Peça de segurança crítica; não se altera a quilometragem para evitar a queima da bomba injetora.              |
| `vela_ignicao`             | Vela de ignição            | **10000**                             | **10000**                                | Desgaste do eletrodo NGK padrão homologado pela Yamaha.                                                       |
| `filtro_ar`                | Filtro de ar (Viscoso)     | **15000**                             | **11000**                                | Papel viscoso original satura mais cedo devido à alta concentração de fuligem no trânsito diário.             |
| `pastilha_freio_dianteiro` | Pastilha de freio diant.   | **15000**                             | **11500**                                | O composto Y-TEQ suporta muito bem a abrasão, mas o uso severo no "para-e-anda" reduz o tempo de vida.        |
| `sapata_freio_traseiro`    | Sapata de freio tras.      | **25000**                             | **20000**                                | Material original não vitrifica fácil e tem desgaste mais lento por ser um tambor vedado.                     |
| `kit_relacao`              | Kit relação (Transmissão)  | **30000**                             | **25000**                                | Kit D.I.D original com retentor. Se lubrificado a cada 500 km, suporta o torque das entregas prolongadamente. |
| `pneu_dianteiro`           | Pneu dianteiro             | **30000**                             | **22500**                                | Michelin/Metzeler originais possuem alta densidade de sílica, suportando desgaste longitudinal.               |
| `pneu_traseiro`            | Pneu traseiro              | **20000**                             | **15000**                                | Sofre a maior carga de inércia, torque do motor e o peso constante do baú/passageiro.                         |
| `disco_freio_dianteiro`    | Disco de freio dianteiro   | **60000**                             | **50000**                                | Aço tratado termicamente pela Yamaha. Chega à espessura mínima de segurança (3.5mm) de forma progressiva.     |
| `kit_embreagem`            | Kit embreagem              | **60000**                             | **40000**                                | Fricção FCC original tem alta resiliência, suportando o controle de embreagem em ladeiras sem patinar cedo.   |
| `kit_cilindro`             | Kit cilindro (Motor)       | **150000**                            | **115000**                               | Tolerância máxima da engenharia (camisa e anéis) antes de começar a queimar óleo do cárter.                   |
| `fluido_freio`             | Fluido de freio (Meses)    | **24**                                | **24**                                   | A higroscopia (absorção de umidade) ocorre por tempo, não por quilometragem.                                  |
| `mangueira_freio`          | Mangueira do freio (Meses) | **48**                                | **48**                                   | Ressecamento estrutural da borracha flexível.                                                                 |
| `bateria`                  | Bateria 12V 5Ah (Meses)    | **36**                                | **27**                                   | Bateria OEM (Yuasa/Heliar) sofre degradação química acelerada pelo alto número de partidas/dia no delivery.   |
| `filtro_oleo`              | Filtro de Óleo             | 10000                                 | 10000                                    | Troca sincronizada com o manual de serviços oficial                                                           |

### 🛠️ Tabela 2: Vida Útil - Componentes Paralelos (Média Geral)

Neste ambiente, amalgamamos o desempenho das peças paralelas (_Premium_ e _Genéricas_). Como você identificou na arquitetura de preços, componentes paralelos costumam empregar ligas metálicas mais moles, polímeros de borracha menos duráveis e compostos de fricção que não dissipam calor com a mesma eficiência da peça OEM. Logo, os ciclos de troca (`intervaloKm`) são menores, gerando uma taxa de manutenção (_downtime_) mais frequente.

| **ID do Componente**       | **Nome do Componente**     | **intervaloKm (Teto/Passeio)** | **intervaloKmEntrega (Rotina Entregas)** | **Contexto de Degradação (Paralela Média)**                                                                                   |
| -------------------------- | -------------------------- | ------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `oleo_motor`               | Óleo do motor              | **4000**                       | **1500**                                 | Óleos paralelos sofrem quebra de cisalhamento (afinam) mais rápido sob o calor extremo do motor.                              |
| `filtro_oleo`              | Filtro de óleo             | **10000**                      | **8000**                                 | O papel celulósico genérico filtra menos micras, exigindo trocas preventivas menores para poupar o motor.                     |
| `filtro_combustivel`       | Filtro de combustível      | **15000**                      | **12000**                                | Elemento interno de marcas genéricas satura antes, aumentando a pressão sobre a bomba de combustível.                         |
| `vela_ignicao`             | Vela de ignição            | **15000**                      | **10000**                                | Eletrodos de níquel de segunda linha corroem velozmente, desregulando o _gap_ e causando falhas na ignição.                   |
| `filtro_ar`                | Filtro de ar               | **12000**                      | **8000**                                 | A falta do óleo viscoso original na trama do papel permite a passagem de micro-areia se não trocado rápido.                   |
| `pastilha_freio_dianteiro` | Pastilha de freio diant.   | **12000**                      | **8000**                                 | Média entre compostos macios (que gastam rápido) e compostos duros (que não gastam, mas vitrificam).                          |
| `sapata_freio_traseiro`    | Sapata de freio tras.      | **18000**                      | **14000**                                | Molas de retorno paralelas perdem a carga térmica (tensão) mais cedo, exigindo ajuste no varão frequentemente.                |
| `kit_relacao`              | Kit relação (Transmissão)  | **20000**                      | **15000**                                | Média matemática entre correntes Premium (com retentor) e Genéricas (Aço 1045 sem retentor). Aço sofre fadiga (_stretching_). |
| `pneu_dianteiro`           | Pneu dianteiro             | **22000**                      | **16000**                                | Borracha com menor índice de sílica resseca e atinge o TWI (indicador de desgaste) prematuramente.                            |
| `pneu_traseiro`            | Pneu traseiro              | **15000**                      | **10000**                                | Estrutura de nylon paralela "quadra" rapidamente no asfalto quente sob o estresse das frenagens logísticas.                   |
| `disco_freio_dianteiro`    | Disco de freio dianteiro   | **45000**                      | **35000**                                | Ligas de aço-carbono de reposição são suscetíveis a empenamento e ranhuras por pastilhas genéricas.                           |
| `kit_embreagem`            | Kit embreagem              | **40000**                      | **25000**                                | Maior teor de papelão nos discos de fricção resulta em patinação ("queima") antecipada sob uso severo.                        |
| `kit_cilindro`             | Kit cilindro (Motor)       | **100000**                     | **75000**                                | A camisa do cilindro genérico possui menor capacidade de dissipação de calor, dilatando e desgastando os anéis mais cedo.     |
| `fluido_freio`             | Fluido de freio (Meses)    | **24**                         | **24**                                   | Sendo um insumo químico universal (DOT4), a higroscopia mantém o mesmo ciclo da tabela original.                              |
| `mangueira_freio`          | Mangueira do freio (Meses) | **48**                         | **48**                                   | O desgaste do teflon/borracha por dilatação hidráulica acompanha o tempo médio padrão.                                        |
| `bateria`                  | Bateria 12V 5Ah (Meses)    | **24**                         | **18**                                   | Grades de chumbo mais finas sofrem com a vibração estrutural da moto, segurando menos o CCA (_Cold Cranking Amps_).           |
| `filtro_oleo`              | Filtro de Óleo             | 10000                          | 8000                                     | Troca sincronizada com o manual de serviços oficial + desgaste estimado                                                       |


## 📊 Tabela de Dados Parametrizados (Inteiros) para a Calculadora

|**ID do Componente (id)**|**Nome do Componente**|**intervaloKm (Teto Manual/Passeio)**|**intervaloKmEntrega (Rotina Entregas)**|**Justificativa do Mock (Estimativa)**|
|---|---|---|---|---|
|`oleo_motor`|Óleo do motor|**5000**|**1750**|Estipulado rigidamente pela Yamaha.|
|`filtro_oleo`|Filtro de óleo|**10000**|**10000**|Estipulado rigidamente pela Yamaha.|
|`filtro_combustivel`|Filtro de combustível|**15000**|**15000**|Estipulado rigidamente pela Yamaha.|
|`vela_ignicao`|Vela de ignição|**10000**|**10000**|Estipulado rigidamente pela Yamaha.|
|`filtro_ar`|Filtro de ar|**15000**|**11000**|Estipulado rigidamente pela Yamaha.|
|`pastilha_freio_dianteiro`|Pastilha de freio diant.|**15000**|**11500**|Estimativa de uso brando sem frenagens bruscas contínuas.|
|`sapata_freio_traseiro`|Sapata de freio tras.|**25000**|**20000**|Estimativa de uso brando; o freio traseiro tem menor carga de inércia.|
|`kit_relacao`|Kit relação (Transmissão)|**30000**|**25000**|Teto de um kit original (D.I.D c/ retentor) lubrificado rigorosamente a cada 500 km, conforme o manual.|
|`pneu_dianteiro`|Pneu dianteiro|**30000**|**22500**|Teto de rodagem de um pneu de primeira linha sem o peso contínuo do baú carregado.|
|`pneu_traseiro`|Pneu traseiro|**20000**|**15000**|Teto de rodagem de um pneu de primeira linha sem estresse de tração severa.|
|`disco_freio_dianteiro`|Disco de freio dianteiro|**60000**|**50000**|Vida útil física do aço até atingir a espessura mínima de descarte (cerca de 3.5mm).|
|`kit_embreagem`|Kit embreagem|**60000**|**40000**|Em condições de passeio (sem ladeiras e engarrafamentos diários), os discos vitrificam muito mais tarde.|
|`kit_cilindro`|Kit cilindro (Motor)|**150000**|**115000**|Limite máximo estimado antes da perda natural de compressão dos anéis no uso perfeito do manual.|
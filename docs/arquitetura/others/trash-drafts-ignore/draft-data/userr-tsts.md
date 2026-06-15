{
  "_descricao": "Fixture de teste — simula o conteúdo do localStorage após onboarding completo com registros",
  "_uso": "Carregar via usePerfil.ts em modo dev: if (import.meta.env.DEV) localStorage.setItem('motocalc:v5:presets', JSON.stringify(fixture['motocalc:v5:presets']))",
  "_usuario": "João da Silva — motoboy fictício RJ, Pop 110i 2024",

  "motocalc:v5:presetAtivo": "preset_trabalho_001",

  "motocalc:v5:presets": [
    {
      "presetId": "preset_trabalho_001",
      "nome": "Trabalho — Pop 110i",
      "criadoEm": "2026-04-01",
      "atualizadoEm": "2026-05-05",
      "perfil": {
        "schemaVersion": 5,
        "userId": null,
        "onboardingConcluido": true,
        "apelido": "Trabalho — Pop 110i",
        "aplicativos": ["iFood", "Rappi"],

        "moto": {
          "marca": "Honda",
          "modelo": "pop110i",
          "ano": 2024,
          "perfilUso": "entrega",
          "kmAtual": 18500,
          "kmUltimaRevisao": 12000
        },

        "perfilManutencao": {
          "perfilPecasGlobal": "paralela",
          "modoRevisao": "independentes",
          "precoMaoDeObraIndependente": 150,
          "frequenciaRevisaoKm": 6000
        },

        "trabalho": {
          "kmPorDia": 70,
          "diasPorSemana": 5,
          "horasPorDia": 9
        },

        "financeiro": {
          "tipoGasolinaPreferida": "comum",
          "combustiveis": {
            "comum": { "preco": 6.61, "autonomia": 33 },
            "aditivada": { "preco": 6.99, "autonomia": 33 },
            "etanol": { "preco": 4.29, "autonomia": 26 }
          },
          "internet": 50,
          "seguro": {
            "tem": true,
            "valorAnual": 929.96,
            "empresa": "Suhai",
            "periodicidade": "anual"
          },
          "situacaoMoto": "quitada",
          "parcelaMensal": null,
          "parcelasRestantes": null,
          "aluguelMensal": null,
          "aluguelPeriodicidade": null,
          "alimentacaoDia": 20,
          "gastosCustom": [
            {
              "id": "gasto_001",
              "nome": "Bag térmica (amortização)",
              "valorMensal": 8.33,
              "ativo": true
            }
          ],
          "responsabilidadeAluguel": {
            "documentos": "eu",
            "manutencao": "eu",
            "seguro": "eu"
          }
        },

        "configuracaoDisplay": {
          "modoExibicao": "personalizado",
          "modoOficinDisplay": "independentes",
          "categoriasAtivas": {
            "combustivel": true,
            "alimentacao": true,
            "manutencao": true,
            "documentacao": true,
            "internet": true,
            "seguro": true,
            "financiamento": false
          }
        },

        "pecasOverrides": [
          {
            "id": "oleo_motor",
            "precoEditado": 42,
            "intervaloKmEditado": null,
            "perfilPecasOverride": null
          }
        ],

        "servicosMaoDeObra": {
          "trocaOleo": 30,
          "trocaKitTransmissao": 60,
          "trocaPneu": 35,
          "revisaoGeral": 150,
          "avulso": 80
        },

        "revisaoAutorizadaOverrides": [],

        "fipeCache": {
          "valor": 11000,
          "dataConsulta": "2026-04-28",
          "codigoFipe": "810285-3"
        },

        "historicoManutencao": {
          "trocasOleo": [
            {
              "id": "oleo_001",
              "data": "2025-08-10",
              "km": 15000,
              "valorTotal": 72,
              "tipoOleo": "10W30",
              "marca": "Pro Honda"
            },
            {
              "id": "oleo_002",
              "data": "2025-10-05",
              "km": 16250,
              "valorTotal": 72,
              "tipoOleo": "10W30",
              "marca": "Pro Honda"
            },
            {
              "id": "oleo_003",
              "data": "2025-12-01",
              "km": 17200,
              "valorTotal": 72,
              "tipoOleo": "10W30",
              "marca": "Pro Honda"
            },
            {
              "id": "oleo_004",
              "data": "2026-01-28",
              "km": 18100,
              "valorTotal": 72,
              "tipoOleo": "10W30",
              "marca": "Pro Honda"
            },
            {
              "id": "oleo_005",
              "data": "2026-03-20",
              "km": 18900,
              "valorTotal": 72,
              "tipoOleo": "10W30",
              "marca": "Pro Honda"
            }
          ],
          "revisoes": [
            {
              "id": "rev_001",
              "data": "2025-06-15",
              "km": 12000,
              "local": "independente",
              "qualRevisao": "3ª Revisão (12.000 km)",
              "status": "concluido",
              "itensTrocados": ["filtro de ar", "vela de ignição", "óleo"],
              "valorMaoDeObra": 150,
              "valorPecas": 180,
              "valorTotal": 330
            }
          ],
          "trocasPneu": [
            {
              "id": "pneu_001",
              "data": "2025-04-20",
              "km": 16000,
              "posicao": "traseiro",
              "marca": "Levorin Dakar",
              "valorTotal": 280
            }
          ],
          "trocasKitRelacao": [],
          "abastecimentos": [
            {
              "id": "abast_001",
              "data": "2026-04-28",
              "tipo": "comum",
              "posto": "Auto Posto Candelária",
              "km": 18400,
              "litros": 3.2,
              "precoLitro": 6.61,
              "valorTotal": 21.15
            },
            {
              "id": "abast_002",
              "data": "2026-04-25",
              "tipo": "comum",
              "posto": "Auto Posto Candelária",
              "km": 18200,
              "litros": 3.5,
              "precoLitro": 6.59,
              "valorTotal": 23.07
            },
            {
              "id": "abast_003",
              "data": "2026-04-21",
              "tipo": "comum",
              "posto": "Posto Shell Méier",
              "km": 18000,
              "litros": 3.1,
              "precoLitro": 6.65,
              "valorTotal": 20.62
            }
          ]
        },

        "diarioTrabalho": [
          {
            "id": "dia_001",
            "data": "2026-04-28",
            "kmInicial": 18360,
            "kmFinal": 18432,
            "kmPercorridos": 72,
            "comeu": true,
            "abasteceu": true,
            "litros": 3.2,
            "precoLitro": 6.61
          },
          {
            "id": "dia_002",
            "data": "2026-04-27",
            "kmInicial": 18290,
            "kmFinal": 18360,
            "kmPercorridos": 70,
            "comeu": true,
            "abasteceu": false,
            "litros": null,
            "precoLitro": null
          },
          {
            "id": "dia_003",
            "data": "2026-04-25",
            "kmInicial": 18220,
            "kmFinal": 18290,
            "kmPercorridos": 70,
            "comeu": false,
            "abasteceu": true,
            "litros": 3.5,
            "precoLitro": 6.59
          },
          {
            "id": "dia_004",
            "data": "2026-04-24",
            "kmInicial": 18155,
            "kmFinal": 18220,
            "kmPercorridos": 65,
            "comeu": true,
            "abasteceu": false,
            "litros": null,
            "precoLitro": null
          },
          {
            "id": "dia_005",
            "data": "2026-04-23",
            "kmInicial": 18083,
            "kmFinal": 18155,
            "kmPercorridos": 72,
            "comeu": true,
            "abasteceu": false,
            "litros": null,
            "precoLitro": null
          },
          {
            "id": "dia_006",
            "data": "2026-04-22",
            "kmInicial": 18015,
            "kmFinal": 18083,
            "kmPercorridos": 68,
            "comeu": false,
            "abasteceu": false,
            "litros": null,
            "precoLitro": null
          },
          {
            "id": "dia_007",
            "data": "2026-04-21",
            "kmInicial": 17949,
            "kmFinal": 18015,
            "kmPercorridos": 66,
            "comeu": true,
            "abasteceu": true,
            "litros": 3.1,
            "precoLitro": 6.65
          }
        ]
      }
    },
    {
      "presetId": "preset_pessoal_002",
      "nome": "Pessoal — Pop 110i",
      "criadoEm": "2026-04-10",
      "atualizadoEm": "2026-05-05",
      "perfil": {
        "schemaVersion": 5,
        "userId": null,
        "onboardingConcluido": true,
        "apelido": "Pessoal — Pop 110i",
        "aplicativos": [],

        "moto": {
          "marca": "Honda",
          "modelo": "pop110i",
          "ano": 2024,
          "perfilUso": "passageiro",
          "kmAtual": 18500,
          "kmUltimaRevisao": 12000
        },

        "perfilManutencao": {
          "perfilPecasGlobal": "original",
          "modoRevisao": "autorizadas",
          "precoMaoDeObraIndependente": 150,
          "frequenciaRevisaoKm": 6000
        },

        "trabalho": {
          "kmPorDia": 30,
          "diasPorSemana": 3,
          "horasPorDia": 4
        },

        "financeiro": {
          "tipoGasolinaPreferida": "aditivada",
          "combustiveis": {
            "comum": { "preco": 6.61, "autonomia": 36 },
            "aditivada": { "preco": 6.99, "autonomia": 36 },
            "etanol": { "preco": 4.29, "autonomia": 28 }
          },
          "internet": 0,
          "seguro": {
            "tem": true,
            "valorAnual": 929.96,
            "empresa": "Suhai",
            "periodicidade": "anual"
          },
          "situacaoMoto": "quitada",
          "parcelaMensal": null,
          "parcelasRestantes": null,
          "aluguelMensal": null,
          "aluguelPeriodicidade": null,
          "alimentacaoDia": 0,
          "gastosCustom": [],
          "responsabilidadeAluguel": {
            "documentos": "eu",
            "manutencao": "eu",
            "seguro": "eu"
          }
        },

        "configuracaoDisplay": {
          "modoExibicao": "predefinidos",
          "modoOficinDisplay": "autorizadas",
          "categoriasAtivas": {
            "combustivel": true,
            "alimentacao": false,
            "manutencao": true,
            "documentacao": true,
            "internet": false,
            "seguro": true,
            "financiamento": false
          }
        },

        "pecasOverrides": [],
        "servicosMaoDeObra": {
          "trocaOleo": 30,
          "trocaKitTransmissao": 50,
          "trocaPneu": 30,
          "revisaoGeral": 150,
          "avulso": 80
        },
        "revisaoAutorizadaOverrides": [],
        "fipeCache": {
          "valor": 11000,
          "dataConsulta": "2026-04-28",
          "codigoFipe": "810285-3"
        },
        "historicoManutencao": {
          "trocasOleo": [],
          "revisoes": [],
          "trocasPneu": [],
          "trocasKitRelacao": [],
          "abastecimentos": []
        },
        "diarioTrabalho": []
      }
    }
  ]
}

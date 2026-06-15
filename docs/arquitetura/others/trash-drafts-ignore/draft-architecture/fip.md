https://brasilapi.com.br/docs#tag/FIPE/paths/~1fipe~1preco~1v1~1%7BcodigoFipe%7D/get


Sim 👍 existem APIs da Tabela FIPE gratuitas (ou com plano free). Vou te explicar as opções reais que dá pra usar no app.

---

# 💰 Primeiro: o que é a FIPE “oficial”

A **Fundação Instituto de Pesquisas Econômicas** NÃO fornece API pública gratuita oficial.

Ou seja:

- não existe API oficial aberta
    
- todas as APIs que existem são **não oficiais** (scraping ou espelho dos dados)
    

Mas isso é super comum e MUITA gente usa.

---

# 🟢 1️⃣ API FIPE gratuita (mais usada)

## I- 🌐 BrasilAPI – FIPE

A melhor opção gratuita hoje.

👉 [https://brasilapi.com.br/docs#tag/FIPE](https://brasilapi.com.br/docs#tag/FIPE)

Essa API é mantida pela comunidade e é MUITO usada.

### I.1- Vantagens

- Gratuita
    
- Sem chave API
    
- Sem limite pesado
    
- Dados atualizados mensalmente
    
- Confiável pra app
    

---

## II- Como funciona na prática

### II.1- 1️⃣ Listar tipos de veículos

```
GET https://brasilapi.com.br/api/fipe
```

Retorna:

- carros
    
- motos
    
- caminhões
    

---

### II.2- 2️⃣ Listar marcas de motos

```
GET https://brasilapi.com.br/api/fipe/motos/marcas
```

Exemplo resposta:

```
[
 { "codigo": "80", "nome": "HONDA" },
 { "codigo": "101", "nome": "YAMAHA" }
]
```

---

### II.3- 3️⃣ Listar modelos da marca

Exemplo Yamaha:

```
GET https://brasilapi.com.br/api/fipe/motos/marcas/101/modelos
```

---

### II.4- 4️⃣ Listar anos do modelo

```
GET /motos/marcas/{marca}/modelos/{modelo}/anos
```

---

### II.5- 5️⃣ Obter preço FIPE 🎯 (o que você precisa)

```
GET /motos/marcas/{marca}/modelos/{modelo}/anos/{ano}
```

Resposta exemplo:

```
{
  "valor": "R$ 18.450,00",
  "marca": "YAMAHA",
  "modelo": "FACTOR 150",
  "anoModelo": 2024,
  "mesReferencia": "abril de 2026"
}
```

👉 Pronto. Esse valor já serve pra calcular IPVA.

---

# 🟡 2️⃣ Outra API gratuita (backup)

## I- Parallelum FIPE

[https://deividfortuna.github.io/fipe/](https://deividfortuna.github.io/fipe/)

Muito famosa também.

Endpoints são quase iguais:

```
https://parallelum.com.br/fipe/api/v1/motos/marcas
```

Essa é tipo a “API FIPE raiz da comunidade”.

---

# 🎯 Qual usar no app?

Use assim no seu projeto:

|Função|API|
|---|---|
|Produção|BrasilAPI|
|Backup|Parallelum|

Se uma cair → usa a outra.

---

# 💡 Agora liga com o IPVA (importante)

Seu fluxo no app será:

1️⃣ Usuário escolhe moto  
2️⃣ App busca valor FIPE automaticamente  
3️⃣ App calcula IPVA

Exemplo RJ:

```
IPVA = valor_fipe × 2%
```

Se FIPE = 18.450  
IPVA = 369 reais/ano

👉 Isso já fica automático no app.

---

Se quiser, posso montar o fluxo de endpoints e banco de dados pra integrar FIPE + IPVA + Licenciamento. Isso já fecha a parte de impostos do app.
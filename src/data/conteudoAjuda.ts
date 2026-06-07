// Conteúdo dos pop-ups de ajuda contextual (ícone "?" no header).
// Texto da RF-6.4 absorvido pela RF-6.16. Mantido como dado, separado do
// componente de apresentação (PopupAjuda).

export type ChaveAjuda = 'estimativa' | 'detalhamento' | 'maoDeObra' | 'insumos' | 'ajustes';

export interface SecaoAjuda {
  titulo: string;
  texto: string;
}

export interface ConteudoAjuda {
  titulo: string;
  intro: string;
  secoes: SecaoAjuda[];
}

export const CONTEUDO_AJUDA: Record<ChaveAjuda, ConteudoAjuda> = {
  estimativa: {
    titulo: 'Estimativa',
    intro:
      'Mostra quanto sua moto custa para rodar. Você diz quantos km roda por dia e quantos dias por semana, e o app projeta o custo em vários períodos.',
    secoes: [
      {
        titulo: 'Rodagem (km/dia · dias/semana)',
        texto: 'A base de tudo. Todo cálculo parte daqui.',
      },
      {
        titulo: 'Custo por km (CPK)',
        texto:
          'Quanto cada quilômetro custa, somando combustível, manutenção e custos fixos diluídos. É o número-chave para saber se a corrida compensa. Se você separa alimentação, mostramos também o CPK só da moto.',
      },
      {
        titulo: 'Por hora / dia / semana / mês / ano',
        texto: 'O mesmo custo total em cada janela de tempo, para comparar com o que você fatura.',
      },
      {
        titulo: 'Distribuição de custos',
        texto: 'O peso de cada categoria no total - onde seu dinheiro vai.',
      },
      {
        titulo: 'Visualizar / Editar',
        texto: 'Abre o Detalhamento, com a quebra item a item e a edição de cada valor.',
      },
    ],
  },
  detalhamento: {
    titulo: 'Detalhamento',
    intro:
      'A quebra do seu custo item a item. Aqui você confere de onde vem cada número, simula cenários e edita qualquer valor.',
    secoes: [
      {
        titulo: 'Total do período',
        texto: 'O custo somado, no período que você escolher; mostra também o custo por km.',
      },
      {
        titulo: 'Seletor de período',
        texto:
          'Troca a janela de tempo de todos os valores da tela de uma vez (ano, mês, semana, dia, hora).',
      },
      {
        titulo: 'Categorias',
        texto:
          'Documentos, Manutenção, Combustível, Internet, Seguro, Alimentação, Financiamento/Aluguel e Imprevistos. Cada uma abre e mostra o cálculo detalhado. O interruptor liga/desliga a categoria - desligada, ela sai do total (ótimo para simular cenários). O lápis edita os valores.',
      },
      {
        titulo: 'Itens individuais',
        texto: 'Em Manutenção e Imprevistos você ainda liga/desliga peças e serviços individuais.',
      },
      {
        titulo: 'Combustível é projeção',
        texto: 'É uma projeção por km rodado, não a soma de abastecimentos reais.',
      },
    ],
  },
  maoDeObra: {
    titulo: 'Mão de Obra',
    intro:
      'Aqui você ajusta os valores das revisões de concessionária e dos serviços excepcionais. Esses valores alimentam a categoria Manutenção da estimativa.',
    secoes: [
      {
        titulo: 'Aba Concessionária',
        texto:
          'As revisões da tabela da concessionária, por km (1.000, 6.000, 12.000...). Use para conferir ou ajustar os valores publicados/informados pela concessionária.',
      },
      {
        titulo: 'Aba Excepcional',
        texto:
          'Serviços raros e caros, fora da rotina (ex.: retífica de motor). Vêm desligados e você ativa quando precisar.',
      },
      {
        titulo: 'Edição',
        texto:
          'Cada card mostra o preço e, quando aplicável, o intervalo. "Restaurar tudo" devolve os padrões do preset.',
      },
    ],
  },
  insumos: {
    titulo: 'Insumos',
    intro:
      'O cadastro de preços dos itens de consumo - combustível e peças/pneus. Junto com os intervalos de troca, viram o custo de combustível e de manutenção na estimativa.',
    secoes: [
      {
        titulo: 'Combustível',
        texto:
          'Para cada tipo (comum, aditivada, etanol) informe o preço por litro e a autonomia (km/L). O marcado como Preferido é o usado nos cálculos - toque em "Usar este" para trocar. Quanto maior a autonomia, menor o custo por km.',
      },
      {
        titulo: 'Peças e Pneus',
        texto:
          'No MVP, cada item mostra apenas o preço original. Peças cobertas pelas revisões fixas da concessionária ficam fora desta lista; pneus e itens de desgaste fora do pacote continuam editáveis.',
      },
    ],
  },
  ajustes: {
    titulo: 'Ajustes',
    intro:
      'Os dados gerais do seu perfil e os custos fixos. Mudanças aqui afetam toda a estimativa.',
    secoes: [
      {
        titulo: 'Veículo',
        texto:
          'Modelo, ano, km atual e km da última revisão. O km atual é a referência para saber quais revisões já venceram.',
      },
      {
        titulo: 'Últimas manutenções',
        texto:
          'Quando trocou peças rastreáveis (vela, filtro, pneus...). Ajuda a prever a próxima troca.',
      },
      {
        titulo: 'Preferências',
        texto: 'Configura como as revisões e estimativas de mão de obra entram no cálculo.',
      },
      {
        titulo: 'Uso diário',
        texto: 'Km/dia e dias/semana usados para projetar a rodagem e os custos da Estimativa.',
      },
      {
        titulo: 'Financeiro',
        texto: 'Custos fixos - internet, alimentação, seguro e parcela/aluguel da moto.',
      },
      {
        titulo: 'Situação legal e responsabilidade',
        texto:
          'Se a moto é própria, financiada ou alugada, e quem paga o quê. Decide se aparece Financiamento ou Aluguel nos custos.',
      },
      {
        titulo: 'Restaurar valores padrões',
        texto: 'Zera os custos e o uso; não mexe nos dados da moto nem nos serviços.',
      },
    ],
  },
};

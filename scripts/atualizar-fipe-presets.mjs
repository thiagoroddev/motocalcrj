import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = 'https://parallelum.com.br/fipe/api/v2';
const TIPO_VEICULO = 'motorcycles';
const TIMEOUT_MS = 15000;
const PRESETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/presets');

const MESES = new Map([
  ['janeiro', '01'],
  ['fevereiro', '02'],
  ['marco', '03'],
  ['março', '03'],
  ['abril', '04'],
  ['maio', '05'],
  ['junho', '06'],
  ['julho', '07'],
  ['agosto', '08'],
  ['setembro', '09'],
  ['outubro', '10'],
  ['novembro', '11'],
  ['dezembro', '12'],
]);

const dryRun = process.argv.includes('--dry-run');

function normalizarNome(valor) {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function parseValorBRL(valor) {
  const numero = Number(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  if (!Number.isFinite(numero) || numero <= 0) {
    throw new Error(`Valor FIPE inválido: ${valor}`);
  }
  return numero;
}

function parseMesReferencia(valor) {
  const match = /^([a-zç]+)\s+de\s+(\d{4})$/i.exec(valor.trim());
  if (!match) return null;

  const mes = MESES.get(match[1].toLowerCase());
  if (!mes) return null;

  return `${match[2]}-${mes}`;
}

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(url, { signal: ctrl.signal });
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} em ${url}`);
    }
    return await resposta.json();
  } finally {
    clearTimeout(timer);
  }
}

async function resolverCodigoFipe(preset) {
  if (preset.codigoFipe) {
    return preset.codigoFipe;
  }

  const marcas = await fetchJson(`${API_BASE}/${TIPO_VEICULO}/brands`);
  const marca = marcas.find((item) => normalizarNome(item.name) === normalizarNome(preset.marca));
  if (!marca) {
    throw new Error(`Marca não encontrada na FIPE: ${preset.marca}`);
  }

  const modelos = await fetchJson(`${API_BASE}/${TIPO_VEICULO}/brands/${marca.code}/models`);
  const modelo = modelos.find(
    (item) => normalizarNome(item.name) === normalizarNome(preset.nomeFipe),
  );
  if (!modelo) {
    throw new Error(`Modelo não encontrado na FIPE: ${preset.marca} ${preset.nomeFipe}`);
  }

  const anos = await fetchJson(
    `${API_BASE}/${TIPO_VEICULO}/brands/${marca.code}/models/${modelo.code}/years`,
  );
  const primeiroAno = anos.find((ano) => /^\d{4}-\d+$/.test(ano.code));
  if (!primeiroAno) {
    throw new Error(`Nenhum ano válido para descobrir código FIPE: ${preset.nomeFipe}`);
  }

  const detalhe = await fetchJson(
    `${API_BASE}/${TIPO_VEICULO}/brands/${marca.code}/models/${modelo.code}/years/${primeiroAno.code}`,
  );
  if (typeof detalhe.codeFipe !== 'string' || !detalhe.codeFipe) {
    throw new Error(`Resposta sem codeFipe para ${preset.nomeFipe}`);
  }

  return detalhe.codeFipe;
}

async function buscarTabelaFipe(codigoFipe) {
  const anos = await fetchJson(`${API_BASE}/${TIPO_VEICULO}/${codigoFipe}/years`);
  const tabela = {};
  let mesReferencia = null;
  let modeloFipe = null;

  // A FIPE usa o pseudo-ano "32000" para a referência de 0 km. Ignoramos anos fora
  // da faixa de ano-modelo real para não poluir a tabela (e quebrar o schema YYYY).
  const anoMaximoPlausivel = new Date().getFullYear() + 1;

  for (const ano of anos) {
    const anoModelo = Number.parseInt(ano.name, 10);
    if (!Number.isInteger(anoModelo) || anoModelo < 1900 || anoModelo > anoMaximoPlausivel) {
      continue;
    }

    const detalhe = await fetchJson(`${API_BASE}/${TIPO_VEICULO}/${codigoFipe}/years/${ano.code}`);
    tabela[String(anoModelo)] = parseValorBRL(detalhe.price);
    mesReferencia = detalhe.referenceMonth;
    modeloFipe = detalhe.model;
  }

  const entradas = Object.entries(tabela).sort(([anoA], [anoB]) => Number(anoA) - Number(anoB));
  if (entradas.length === 0) {
    throw new Error(`Nenhum preço FIPE encontrado para ${codigoFipe}`);
  }

  return {
    tabela: Object.fromEntries(entradas),
    mesReferencia,
    modeloFipe,
  };
}

function formatarTabelaFipe(tabela) {
  const linhas = Object.entries(tabela).map(([ano, valor], index, lista) => {
    const sufixo = index === lista.length - 1 ? '' : ',';
    return `    ${JSON.stringify(ano)}: ${valor}${sufixo}`;
  });

  return `  "tabelaFipe": {\n${linhas.join('\n')}\n  }`;
}

function substituirObrigatorio(texto, regex, valor, descricao) {
  if (!regex.test(texto)) {
    throw new Error(`Não foi possível atualizar ${descricao}`);
  }
  return texto.replace(regex, valor);
}

function atualizarTextoPreset(texto, { codigoFipe, tabela, mesReferencia, modeloFipe }) {
  const anos = Object.keys(tabela).map(Number);
  const anoInicio = Math.min(...anos);
  const anoFim = Math.max(...anos);
  const dataColeta = parseMesReferencia(mesReferencia) ?? new Date().toISOString().slice(0, 7);
  const notaCodigoFipe = `Coletado via API Parallelum FIPE em ${mesReferencia}. Código: ${codigoFipe}. Modelo: ${modeloFipe}.`;

  let atualizado = substituirObrigatorio(
    texto,
    /[ ]{2}"codigoFipe": "[^"]*"/,
    `  "codigoFipe": ${JSON.stringify(codigoFipe)}`,
    'codigoFipe',
  );

  atualizado = substituirObrigatorio(
    atualizado,
    /[ ]{2}"tabelaFipe": \{\n(?:[ ]{4}"[^"]+": [0-9.]+,?\n)+[ ]{2}\}/,
    formatarTabelaFipe(tabela),
    'tabelaFipe',
  );

  atualizado = substituirObrigatorio(
    atualizado,
    /"dataColeta": "[^"]*"/,
    `"dataColeta": ${JSON.stringify(dataColeta)}`,
    '_fonte.dataColeta',
  );

  atualizado = substituirObrigatorio(
    atualizado,
    /"codigoFipeNota": "[^"]*"/,
    `"codigoFipeNota": ${JSON.stringify(notaCodigoFipe)}`,
    '_fonte.codigoFipeNota',
  );

  return substituirObrigatorio(
    atualizado,
    /[ ]{4}"anoModelo": \{\s*"inicio": \d+,\s*"fim": \d+\s*\}/,
    `    "anoModelo": {\n      "inicio": ${anoInicio},\n      "fim": ${anoFim}\n    }`,
    '_fonte.anoModelo',
  );
}

async function atualizarPreset(arquivo) {
  const caminho = path.join(PRESETS_DIR, arquivo);
  const texto = await readFile(caminho, 'utf8');
  const preset = JSON.parse(texto);

  if (!preset.nomeFipe || !preset.tabelaFipe) {
    return null;
  }

  const codigoFipe = await resolverCodigoFipe(preset);
  const { tabela, mesReferencia, modeloFipe } = await buscarTabelaFipe(codigoFipe);
  const novoTexto = atualizarTextoPreset(texto, { codigoFipe, tabela, mesReferencia, modeloFipe });

  if (!dryRun && novoTexto !== texto) {
    await writeFile(caminho, novoTexto, 'utf8');
  }

  return {
    arquivo,
    codigoFipe,
    modeloFipe,
    mesReferencia,
    anos: Object.keys(tabela).join(', '),
    alterado: novoTexto !== texto,
  };
}

const arquivos = (await readdir(PRESETS_DIR)).filter((arquivo) => arquivo.endsWith('.json')).sort();
const resultados = [];

for (const arquivo of arquivos) {
  const resultado = await atualizarPreset(arquivo);
  if (resultado) {
    resultados.push(resultado);
  }
}

for (const resultado of resultados) {
  const status = resultado.alterado ? (dryRun ? 'alteraria' : 'atualizado') : 'sem mudanças';
  console.info(
    `${status}: ${resultado.arquivo} | ${resultado.codigoFipe} | ${resultado.modeloFipe} | ${resultado.mesReferencia} | anos ${resultado.anos}`,
  );
}

if (dryRun) {
  console.info('dry-run: nenhum arquivo foi escrito.');
}

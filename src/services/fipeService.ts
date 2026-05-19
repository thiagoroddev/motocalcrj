const BASE = 'https://brasilapi.com.br/api/fipe';
const TIPO = 'motos';
const TIMEOUT_MS = 8000;

// Cache de sessão: evita re-descobrir brand/model codes a cada chamada
const _cacheMarca = new Map<string, string>(); // nome.upper → código
const _cacheModelo = new Map<string, number>(); // `${codMarca}:nome.upper` → código

async function fetchJson<T>(path: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function resolverMarca(marcaNome: string): Promise<string> {
  const chave = marcaNome.toUpperCase();
  if (_cacheMarca.has(chave)) {
    return _cacheMarca.get(chave)!;
  }

  const lista = await fetchJson<Array<{ nome: string; valor: string }>>(`/marcas/v1/${TIPO}`);
  for (const m of lista) {
    _cacheMarca.set(m.nome.toUpperCase(), m.valor);
  }

  const codigo = _cacheMarca.get(chave);
  if (!codigo) {
    throw new Error(`Marca não encontrada: ${marcaNome}`);
  }
  return codigo;
}

async function resolverModelo(codigoMarca: string, nomeFipe: string): Promise<number> {
  const chave = `${codigoMarca}:${nomeFipe.toUpperCase()}`;
  if (_cacheModelo.has(chave)) {
    return _cacheModelo.get(chave)!;
  }

  const data = await fetchJson<{ modelos: Array<{ nome: string; valor: number }> }>(
    `/veiculos/v1/${TIPO}/${codigoMarca}`,
  );
  for (const m of data.modelos) {
    _cacheModelo.set(`${codigoMarca}:${m.nome.toUpperCase()}`, m.valor);
  }

  const codigo = _cacheModelo.get(chave);
  if (!codigo) {
    throw new Error(`Modelo não encontrado: ${nomeFipe}`);
  }
  return codigo;
}

async function resolverAno(
  codigoMarca: string,
  codigoModelo: number,
  ano: number,
): Promise<string> {
  const anos = await fetchJson<Array<{ nome: string; valor: string }>>(
    `/veiculos/v1/${TIPO}/${codigoMarca}/${codigoModelo}`,
  );
  const match = anos.find((a) => a.nome.startsWith(String(ano)));
  if (!match) {
    throw new Error(`Ano ${ano} não disponível na FIPE`);
  }
  return match.valor;
}

export interface ResultadoFipe {
  valor: number;
  codigoFipe: string;
  mesReferencia: string;
  anoModelo: number;
}

async function buscarPrecoPorCodigo(
  codigoFipe: string,
  ano: number,
): Promise<ResultadoFipe | null> {
  const lista = await fetchJson<
    Array<{ valor: string; codigoFipe: string; mesReferencia: string; anoModelo: number }>
  >(`/preco/v1/${codigoFipe}`);

  const entrada = lista.find((e) => e.anoModelo === ano);
  if (!entrada) {
    return null;
  }

  const valorNum = parseFloat(
    entrada.valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  );
  if (isNaN(valorNum)) {
    return null;
  }

  return {
    valor: valorNum,
    codigoFipe: entrada.codigoFipe,
    mesReferencia: entrada.mesReferencia,
    anoModelo: entrada.anoModelo,
  };
}

export async function buscarPrecoFipe(
  marcaNome: string,
  nomeFipe: string,
  ano: number,
  codigoFipe?: string,
): Promise<ResultadoFipe | null> {
  try {
    // Rota rápida: 1 chamada via código FIPE (quando disponível)
    if (codigoFipe) {
      const resultado = await buscarPrecoPorCodigo(codigoFipe, ano);
      if (resultado) {
        return resultado;
      }
    }

    // Rota completa: 4 chamadas (marcas → veículos → anos → preço)
    const codigoMarca = await resolverMarca(marcaNome);
    const codigoModelo = await resolverModelo(codigoMarca, nomeFipe);
    const codigoAno = await resolverAno(codigoMarca, codigoModelo, ano);

    const preco = await fetchJson<{
      valor: string;
      codigoFipe: string;
      mesReferencia: string;
      anoModelo: number;
    }>(`/veiculos/v1/${TIPO}/${codigoMarca}/${codigoModelo}/${codigoAno}`);

    const valorNum = parseFloat(
      preco.valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
    );
    if (isNaN(valorNum)) {
      throw new Error('Valor FIPE inválido');
    }

    return {
      valor: valorNum,
      codigoFipe: preco.codigoFipe,
      mesReferencia: preco.mesReferencia,
      anoModelo: preco.anoModelo,
    };
  } catch {
    return null;
  }
}

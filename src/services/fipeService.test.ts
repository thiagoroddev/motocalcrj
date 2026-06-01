import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResultadoFipe } from './fipeService';

const BASE = 'https://brasilapi.com.br/api/fipe';

type FetchMock = ReturnType<typeof vi.fn<(url: string, init?: RequestInit) => Promise<Response>>>;

function respostaJson(dados: unknown, ok = true, status = ok ? 200 : 500): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(dados),
  } as Response;
}

async function importarServicoFipe() {
  vi.resetModules();
  return import('./fipeService');
}

function criarFetchMock(rotas: Record<string, unknown>): FetchMock {
  return vi.fn((url: string) => {
    const rota = url.replace(BASE, '');
    if (!(rota in rotas)) {
      return Promise.reject(new Error(`Rota nao mockada: ${rota}`));
    }
    return Promise.resolve(respostaJson(rotas[rota]));
  });
}

describe('fipeService', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('usa rota rapida por codigoFipe e parseia valor BRL', async () => {
    const fetchMock = criarFetchMock({
      '/preco/v1/811111-1': [
        {
          valor: 'R$ 9.999,00',
          codigoFipe: '811111-1',
          mesReferencia: 'maio de 2026',
          anoModelo: 2024,
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const resultado = await buscarPrecoFipe('Honda', 'POP 110I', 2024, '811111-1');

    expect(resultado).toEqual<ResultadoFipe>({
      valor: 9999,
      codigoFipe: '811111-1',
      mesReferencia: 'maio de 2026',
      anoModelo: 2024,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/preco/v1/811111-1`, expect.any(Object));
  });

  it('cai da rota rapida para rota completa quando nao encontra ano compativel', async () => {
    const fetchMock = criarFetchMock({
      '/preco/v1/811111-1': [
        {
          valor: 'R$ 8.500,00',
          codigoFipe: '811111-1',
          mesReferencia: 'maio de 2026',
          anoModelo: 2023,
        },
      ],
      '/marcas/v1/motos': [{ nome: 'Honda', valor: '80' }],
      '/veiculos/v1/motos/80': {
        modelos: [{ nome: 'POP 110I', valor: 1234 }],
      },
      '/veiculos/v1/motos/80/1234': [{ nome: '2024 Gasolina', valor: '2024-1' }],
      '/veiculos/v1/motos/80/1234/2024-1': {
        valor: 'R$ 10.250,50',
        codigoFipe: '811111-1',
        mesReferencia: 'junho de 2026',
        anoModelo: 2024,
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const resultado = await buscarPrecoFipe('Honda', 'POP 110I', 2024, '811111-1');

    expect(resultado).toEqual<ResultadoFipe>({
      valor: 10250.5,
      codigoFipe: '811111-1',
      mesReferencia: 'junho de 2026',
      anoModelo: 2024,
    });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('consulta rota completa por marca, modelo, ano e preco quando nao recebe codigoFipe', async () => {
    const fetchMock = criarFetchMock({
      '/marcas/v1/motos': [{ nome: 'Honda', valor: '80' }],
      '/veiculos/v1/motos/80': {
        modelos: [{ nome: 'POP 110I', valor: 1234 }],
      },
      '/veiculos/v1/motos/80/1234': [
        { nome: '2023 Gasolina', valor: '2023-1' },
        { nome: '2024 Gasolina', valor: '2024-1' },
      ],
      '/veiculos/v1/motos/80/1234/2024-1': {
        valor: 'R$ 11.111,11',
        codigoFipe: '811111-1',
        mesReferencia: 'julho de 2026',
        anoModelo: 2024,
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const resultado = await buscarPrecoFipe('Honda', 'POP 110I', 2024);

    expect(resultado).toEqual<ResultadoFipe>({
      valor: 11111.11,
      codigoFipe: '811111-1',
      mesReferencia: 'julho de 2026',
      anoModelo: 2024,
    });
    expect(fetchMock.mock.calls.map(([url]) => String(url).replace(BASE, ''))).toEqual([
      '/marcas/v1/motos',
      '/veiculos/v1/motos/80',
      '/veiculos/v1/motos/80/1234',
      '/veiculos/v1/motos/80/1234/2024-1',
    ]);
  });

  it('retorna null quando a BrasilAPI responde HTTP nao-ok', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(respostaJson({ erro: true }, false, 500)));
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const resultado = await buscarPrecoFipe('Honda', 'POP 110I', 2024, '811111-1');

    expect(resultado).toBeNull();
  });

  it('retorna null quando o fetch rejeita', async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('rede indisponivel')));
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const resultado = await buscarPrecoFipe('Honda', 'POP 110I', 2024, '811111-1');

    expect(resultado).toBeNull();
  });

  it('retorna null em timeout abortado', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Abortado por timeout', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { buscarPrecoFipe } = await importarServicoFipe();
    const promessa = buscarPrecoFipe('Honda', 'POP 110I', 2024, '811111-1');

    await vi.advanceTimersByTimeAsync(8000);

    await expect(promessa).resolves.toBeNull();
  });
});

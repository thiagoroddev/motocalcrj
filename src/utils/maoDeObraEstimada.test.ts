import { describe, expect, it } from 'vitest';
import {
  estimarMaoDeObra,
  montarEstimativaMaoDeObra,
  somarMaoDeObraEfetiva,
  taxaHoraDaMarca,
} from './maoDeObraEstimada';
import { perfilPadrao } from '../context/perfilDefaults';
import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import type { PresetMoto } from '../types/calculos';

function servico(over: Partial<ServicoIndependente> & { id: string }): ServicoIndependente {
  return {
    nome: over.id,
    intervalKm: 18000,
    precoIndependente: 0,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
    ...over,
  };
}

describe('estimarMaoDeObra', () => {
  it('estima horas × taxa × fator (kit transmissão 2h × 110 × 1.0 = 220)', () => {
    expect(estimarMaoDeObra('troca-kit-transmissao', 'Yamaha', 1)).toBe(220);
  });

  it('bate o real da vela calibrado (0,12h × 110 ≈ 13)', () => {
    expect(estimarMaoDeObra('troca-vela', 'Honda', 1)).toBeCloseTo(13.2, 1);
  });

  it('aplica o fator do modelo (250cc = 1.35)', () => {
    expect(estimarMaoDeObra('troca-kit-transmissao', 'Yamaha', 1.35)).toBeCloseTo(297, 0);
  });

  it('retorna 0 para serviço sem tempário', () => {
    expect(estimarMaoDeObra('servico-desconhecido', 'Honda', 1)).toBe(0);
  });

  it('usa a taxa padrão para marca desconhecida e fator inválido vira 1', () => {
    expect(taxaHoraDaMarca('Suzuki')).toBe(110);
    expect(estimarMaoDeObra('troca-sapata-traseira', undefined, 0)).toBeCloseTo(71.5, 1);
  });
});

describe('somarMaoDeObraEfetiva', () => {
  const preset = { marca: 'Yamaha', fatorMaoDeObra: 1 } as PresetMoto;

  function perfilCom(global: boolean, porServico: Record<string, boolean> = {}): PerfilUsuario {
    return {
      ...perfilPadrao,
      perfilManutencao: {
        ...perfilPadrao.perfilManutencao,
        incluirEstimativaMaoDeObra: global,
        estimativaMaoDeObraPorServico: porServico,
      },
    };
  }

  it('zero quando nada informado nem estimado', () => {
    const lista = [servico({ id: 'troca-kit-transmissao' })];
    expect(somarMaoDeObraEfetiva(lista, perfilCom(false), preset)).toEqual({
      total: 0,
      temEstimado: false,
    });
  });

  it('estima todos quando o global está ligado (modo Estimado)', () => {
    const lista = [
      servico({ id: 'troca-kit-transmissao' }),
      servico({ id: 'troca-sapata-traseira' }),
    ];
    const r = somarMaoDeObraEfetiva(lista, perfilCom(true), preset);
    expect(r.total).toBeCloseTo(291.5, 1); // 220 + 71,5
    expect(r.temEstimado).toBe(true);
  });

  it('estima só o serviço com flag por-item', () => {
    const lista = [
      servico({ id: 'troca-kit-transmissao' }),
      servico({ id: 'troca-sapata-traseira' }),
    ];
    const r = somarMaoDeObraEfetiva(
      lista,
      perfilCom(false, { 'troca-kit-transmissao': true }),
      preset,
    );
    expect(r.total).toBe(220);
    expect(r.temEstimado).toBe(true);
  });

  it('usa o valor real digitado pelo usuário e não estima esse serviço', () => {
    const lista = [
      servico({
        id: 'troca-kit-transmissao',
        statusPrecoAutorizada: 'informado_usuario',
        precoTotalAutorizada: 150,
      }),
    ];
    const r = somarMaoDeObraEfetiva(lista, perfilCom(true), preset);
    expect(r.total).toBe(150);
    expect(r.temEstimado).toBe(false);
  });
});

describe('montarEstimativaMaoDeObra', () => {
  const preset = { marca: 'Yamaha', fatorMaoDeObra: 1 } as PresetMoto;

  function perfilCom(over: Partial<PerfilUsuario['perfilManutencao']>): PerfilUsuario {
    return {
      ...perfilPadrao,
      perfilManutencao: { ...perfilPadrao.perfilManutencao, ...over },
    };
  }

  it('reflete global, por-serviço e valor estimado do preset', () => {
    const perfil = perfilCom({
      incluirEstimativaMaoDeObra: false,
      estimativaMaoDeObraPorServico: { 'troca-kit-transmissao': true },
    });

    expect(montarEstimativaMaoDeObra(perfil, preset, 'troca-kit-transmissao')).toEqual({
      globalLigado: false,
      porServicoLigado: true,
      valorEstimado: 220,
    });
  });

  it('porServicoLigado=false quando o serviço não está no mapa', () => {
    const perfil = perfilCom({ incluirEstimativaMaoDeObra: true });
    const bundle = montarEstimativaMaoDeObra(perfil, preset, 'troca-kit-embreagem');

    expect(bundle.globalLigado).toBe(true);
    expect(bundle.porServicoLigado).toBe(false);
    expect(bundle.valorEstimado).toBeGreaterThan(0);
  });
});

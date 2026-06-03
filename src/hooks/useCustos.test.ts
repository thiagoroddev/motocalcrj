import { describe, expect, it } from 'vitest';
import { perfilPadrao } from '../context/PerfilContext';
import { PRESETS } from '../data/repositorioPresets';
import { normalizarPerfilMvp } from './useCustos';

describe('normalizarPerfilMvp', () => {
  it('força modo autorizadas e peças originais para perfis legados escondidos no MVP', () => {
    const perfil = {
      ...perfilPadrao,
      perfilManutencao: {
        ...perfilPadrao.perfilManutencao,
        modoRevisao: 'independentes' as const,
        perfilPecasGlobal: 'paralela' as const,
      },
    };

    const normalizado = normalizarPerfilMvp(perfil);

    expect(normalizado.perfilManutencao.modoRevisao).toBe('autorizadas');
    expect(normalizado.perfilManutencao.perfilPecasGlobal).toBe('original');
  });

  it('preserva a mesma referência quando o perfil já está no recorte MVP', () => {
    expect(normalizarPerfilMvp(perfilPadrao)).toBe(perfilPadrao);
  });

  it('usa a lista de serviços do preset e trata pneus da Yamaha como excepcional', () => {
    const perfil = {
      ...perfilPadrao,
      moto: {
        ...perfilPadrao.moto,
        marca: 'Yamaha',
        modelo: 'factor125i',
      },
    };

    const normalizado = normalizarPerfilMvp(perfil, PRESETS.factor125i);
    const kitRelacao = normalizado.servicosIndependentes.find(
      (servico) => servico.id === 'troca-kit-transmissao',
    );
    const pneuDianteiro = normalizado.servicosIndependentes.find(
      (servico) => servico.id === 'troca-pneu-dianteiro',
    );

    // Yamaha não troca pneu: excepcional desligado, não avulso de concessionária.
    expect(pneuDianteiro).toMatchObject({ ehExcepcional: true, ativo: false });
    expect(kitRelacao?.intervalKm).toBe(25000);
  });

  it('mantém pneus avulsos da Honda como pendência de concessionária', () => {
    const perfil = {
      ...perfilPadrao,
      moto: {
        ...perfilPadrao.moto,
        marca: 'Honda',
        modelo: 'pop110i',
      },
    };

    const normalizado = normalizarPerfilMvp(perfil, PRESETS.pop110i);
    const pneuDianteiro = normalizado.servicosIndependentes.find(
      (servico) => servico.id === 'troca-pneu-dianteiro',
    );
    const pneuTraseiro = normalizado.servicosIndependentes.find(
      (servico) => servico.id === 'troca-pneu-traseiro',
    );

    expect(pneuDianteiro?.statusPrecoAutorizada).toBe('nao_informado');
    expect(pneuTraseiro?.statusPrecoAutorizada).toBe('nao_informado');
  });

  it('preserva preço informado pelo usuário ao aplicar serviços do preset', () => {
    const perfil = {
      ...perfilPadrao,
      servicosIndependentes: perfilPadrao.servicosIndependentes.map((servico) =>
        servico.id === 'troca-kit-transmissao'
          ? {
              ...servico,
              precoTotalAutorizada: 410,
              statusPrecoAutorizada: 'informado_usuario' as const,
            }
          : servico,
      ),
    };

    const normalizado = normalizarPerfilMvp(perfil, PRESETS.factor125i);
    const kitRelacao = normalizado.servicosIndependentes.find(
      (servico) => servico.id === 'troca-kit-transmissao',
    );

    expect(kitRelacao?.precoTotalAutorizada).toBe(410);
    expect(kitRelacao?.statusPrecoAutorizada).toBe('informado_usuario');
    expect(kitRelacao?.intervalKm).toBe(25000);
    expect(kitRelacao?.precoIndependente).toBe(0);
  });
});

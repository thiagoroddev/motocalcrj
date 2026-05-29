import type { ComponentType, SVGProps } from 'react';
import IconeOleo from '~icons/mdi/oil';
import IconeVela from '~icons/mdi/flash';
import IconeFiltroAr from '~icons/mdi/air-filter';
import IconeBateria from '~icons/mdi/car-battery';
import IconePneu from '~icons/mdi/tire';
import IconeSapata from '~icons/mdi/disc';
import IconeTransmissao from '~icons/mdi/car-shift-pattern';
import IconeEmbreagem from '~icons/mdi/car-clutch';
import IconeCilindro from '~icons/mdi/piston';
import IconeMotor from '~icons/mdi/engine';
import IconeRevisao from '~icons/mdi/car-wrench';
import IconeGenerico from '~icons/mdi/wrench';

type IconePeca = ComponentType<SVGProps<SVGSVGElement>>;

// Mapa id do serviço/peça → ícone ilustrativo (mdi via unplugin-icons, bundled
// offline). Usado nos cards de Mão de Obra e reusável nos Insumos (6.20.3).
const ICONES: Record<string, IconePeca> = {
  'troca-oleo': IconeOleo,
  'troca-vela': IconeVela,
  'troca-filtro-ar': IconeFiltroAr,
  'troca-bateria': IconeBateria,
  'troca-pneu-dianteiro': IconePneu,
  'troca-pneu-traseiro': IconePneu,
  'troca-sapata-dianteira': IconeSapata,
  'troca-sapata-traseira': IconeSapata,
  'troca-kit-transmissao': IconeTransmissao,
  'troca-kit-embreagem': IconeEmbreagem,
  'troca-kit-cilindro': IconeCilindro,
  'retifica-cabecote': IconeMotor,
  'retifica-completa': IconeMotor,
  'revisao-geral': IconeRevisao,
};

// Ícone da peça/serviço pelo id; cai no genérico (chave inglesa) se não mapeado.
export function iconePeca(id: string): IconePeca {
  return ICONES[id] ?? IconeGenerico;
}

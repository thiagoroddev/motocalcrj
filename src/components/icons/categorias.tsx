import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Wrench,
  Fuel,
  Wifi,
  Shield,
  Utensils,
  Banknote,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapa único categoria→ícone. Usado tanto na legenda da Distribuição de custos
// (Estimativa) quanto nos accordions do Detalhamento, para que as duas telas
// mostrem o MESMO ícone por categoria. Chave = id da categoria.
export const ICONE_CATEGORIA: Record<string, LucideIcon> = {
  documentos: FileText,
  manutencao: Wrench,
  combustivel: Fuel,
  internet: Wifi,
  seguro: Shield,
  alimentacao: Utensils,
  financiamento: Banknote, // serve para Financiamento e Aluguel
  gastosCustom: TriangleAlert, // Imprevistos
};

interface PropsTileCategoria {
  categoriaId: string;
  // Cor de fundo do tile: hex (Distribuição) OU classe Tailwind (Detalhamento).
  corHex?: string;
  corClasse?: string;
  className?: string;
}

// Quadradinho arredondado na cor da categoria, com o ícone em branco.
export function TileCategoria({ categoriaId, corHex, corClasse, className }: PropsTileCategoria) {
  const Icone = ICONE_CATEGORIA[categoriaId];
  if (!Icone) return null;
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-lg shrink-0 w-9 h-9',
        corClasse,
        className,
      )}
      style={corHex ? { backgroundColor: corHex } : undefined}
      aria-hidden="true"
    >
      <Icone className="w-5 h-5 text-white" />
    </span>
  );
}

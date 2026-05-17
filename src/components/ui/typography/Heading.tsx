import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função utilitária padrão do Shadcn para mesclar classes Tailwind sem conflitos.
 * Em um projeto real, isso geralmente fica em um arquivo "lib/utils.ts".
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Definindo o "cardápio" de estilos com CVA.
 * Aqui centralizamos todas as regras de negócio visuais da nossa tipografia.
 */
const headingVariants = cva(
  // Estilos base que todos os títulos terão em comum
  'text-foreground scroll-m-20 tracking-tight',
  {
    variants: {
      // Define a aparência visual do título, independente da tag HTML
      variant: {
        h1: 'text-4xl font-extrabold lg:text-5xl',
        h2: 'text-3xl font-semibold first:mt-0',
        h3: 'text-2xl font-semibold',
        h4: 'text-xl font-semibold',
        h5: 'text-lg font-semibold',
        h6: 'text-base font-semibold',
      },
      // Permite alterar o peso da fonte sob demanda
      weight: {
        default: '',
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-bold',
      },
      // Permite centralizar ou alinhar o texto rapidamente
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      variant: 'h1',
      weight: 'default',
      align: 'left',
    },
  },
);

/**
 * Extraímos os tipos das props baseados nas variantes que definimos no CVA.
 * O React.HTMLAttributes permite que o componente aceite props nativas (como id, className, onClick).
 */
export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Prop polimórfica: decide qual tag renderizar no DOM
}

/**
 * forwardRef: Um conceito avançado do React que permite que o componente pai
 * acesse o elemento DOM real deste componente, útil para animações ou foco de acessibilidade.
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, weight, align, as, children, ...props }, ref) => {
    // Se a tag 'as' não for fornecida, usamos a própria 'variant' como tag padrão.
    // Se nem 'variant' for fornecida, o padrão cai para 'h1' (definido no defaultVariants do CVA).
    const Comp = as || (variant ? variant : 'h1');

    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ variant, weight, align, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

// Boa prática do React para depuração no React DevTools
Heading.displayName = 'Heading';

export { Heading, headingVariants };

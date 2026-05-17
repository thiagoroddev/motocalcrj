import { Heading } from '@/components/ui/typography/Heading';

export function PaginaMaoDeObra() {
  return (
    <div className="p-md">
      <h1 className="text-foreground font-bold text-xl">Mão de Obra</h1>
      <Heading>Bem-vindo ao Sistema</Heading>

      {/* 2. Alterando a variante visual (Renderiza <H3> com visual de H3) */}
      <Heading variant="h3">Últimas Atualizações</Heading>

      {/* 3. A Separação Semântica (A Mágica!)
          Renderiza um <H2> para os robôs do Google e Leitores de Tela, 
          mas visualmente tem o tamanho de um H4, centralizado e com fonte normal. */}
      <Heading as="h2" variant="h4" weight="normal" align="center">
        Detalhes do painel administrativo
      </Heading>

      {/* 4. Sobrescrevendo com Tailwind usando className (O tailwind-merge resolve o conflito) */}
      <Heading variant="h2" className="text-red-500 underline">
        Atenção: Ação Irreversível
      </Heading>
    </div>
  );
}

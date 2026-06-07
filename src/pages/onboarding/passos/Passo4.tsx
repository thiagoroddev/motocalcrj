import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo4() {
  const { irParaProximo } = useOnboarding();

  return (
    <PassoLayout titulo="Referência de uso" aoProximo={irParaProximo}>
      <div className="rounded-lg border border-muted bg-card p-4">
        <p className="text-foreground font-semibold">Uso profissional e intenso</p>
        <p className="text-muted-foreground text-sm mt-1">
          As estimativas iniciais consideram desgaste profissional. Os valores de consumo, rodagem e
          manutenção continuam editáveis para refletir a sua realidade.
        </p>
      </div>
    </PassoLayout>
  );
}

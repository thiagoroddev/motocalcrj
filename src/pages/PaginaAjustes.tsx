import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { NavBar } from '../components/layout/NavBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import type {
  KmUltimaTrocas,
  ModoRevisao,
  PerfilUso,
  PeriodicidadeAluguel,
  PeriodicidadeSeguro,
  SituacaoMoto,
} from '../types/perfil';

function Segmentado({
  opcoes,
  valor,
  onChange,
  className,
}: {
  opcoes: { label: string; valor: string }[];
  valor: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-md overflow-hidden border border-muted${className ? ` ${className}` : ''}`}
    >
      {opcoes.map((op, i) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => onChange(op.valor)}
          className={`flex-1 min-h-touch flex items-center justify-center text-[10px] font-medium tracking-wide uppercase transition-colors${i > 0 ? ' border-l border-muted' : ''} ${
            valor === op.valor
              ? 'bg-primary text-foreground'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  valor,
  min,
  max,
  onChange,
}: {
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={valor <= min}
        onClick={() => onChange(valor - 1)}
        className="w-10 h-10 rounded border border-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors text-lg"
        aria-label="Diminuir"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-foreground">{valor}</span>
      <button
        type="button"
        disabled={valor >= max}
        onClick={() => onChange(valor + 1)}
        className="w-10 h-10 rounded border border-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors text-lg"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

const COMPONENTES_TROCA: { key: keyof KmUltimaTrocas; label: string }[] = [
  { key: 'oleo', label: 'Troca de óleo' },
  { key: 'pneuDianteiro', label: 'Pneu dianteiro' },
  { key: 'pneuTraseiro', label: 'Pneu traseiro' },
  { key: 'kitRelacao', label: 'Kit relação' },
];

function Linha({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function PaginaAjustes() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const [dialogReset, setDialogReset] = useState(false);

  const { moto, perfilManutencao, trabalho, financeiro, configuracaoDisplay } = perfil;
  const { seguro, situacaoMoto } = financeiro;
  const cats = configuracaoDisplay.categoriasAtivas;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center gap-3 px-md py-3 bg-card border-b border-muted shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voltar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-foreground font-semibold text-base flex-1">Ajustes</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-md space-y-3">
          {/* ── Veículo ── */}
          <section className="bg-card rounded-lg p-md space-y-3">
            <p className="label-neutro">Veículo</p>
            <p className="text-xs text-muted-foreground/60">
              {moto.marca} · {moto.modelo}
            </p>
            <Linha label="Ano">
              <Input
                type="number"
                value={moto.ano}
                min={1990}
                max={new Date().getFullYear() + 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1990) dispatch({ type: 'SET_ANO_MOTO', ano: v });
                }}
                className="w-28 text-right"
              />
            </Linha>
            <Linha label="KM atual">
              <Input
                type="number"
                value={moto.kmAtual}
                min={0}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) dispatch({ type: 'SET_KM_ATUAL', valor: v });
                }}
                className="w-28 text-right"
              />
            </Linha>
            <Linha label="KM da última revisão">
              <Input
                type="number"
                value={moto.kmUltimaRevisao ?? ''}
                min={0}
                placeholder="—"
                onChange={(e) => {
                  const raw = e.target.value;
                  const v = parseInt(raw, 10);
                  dispatch({
                    type: 'SET_KM_ULTIMA_REVISAO',
                    km: raw === '' ? null : isNaN(v) ? null : v,
                  });
                }}
                className="w-28 text-right"
              />
            </Linha>
          </section>

          {/* ── Histórico de Manutenção ── */}
          <section className="bg-card rounded-lg p-md space-y-3">
            <p className="label-neutro">Histórico de Manutenção</p>
            <Accordion type="multiple" className="w-full">
              {COMPONENTES_TROCA.map(({ key, label }) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between flex-1 pr-2 text-left">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {moto.kmUltimaTrocas[key] === 0
                          ? 'não registrado'
                          : moto.kmUltimaTrocas[key].toLocaleString('pt-BR') + ' km'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Linha label="KM da última troca">
                      <Input
                        type="number"
                        value={moto.kmUltimaTrocas[key] || ''}
                        min={0}
                        placeholder="Ex: 12000"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const v = parseInt(raw, 10);
                          dispatch({
                            type: 'SET_KM_ULTIMA_TROCA',
                            componente: key,
                            km: raw === '' || isNaN(v) ? 0 : v,
                          });
                        }}
                        className="w-28 text-right"
                      />
                    </Linha>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {moto.kmAtual >= 60_000 && (
                <AccordionItem value="motor">
                  <AccordionTrigger>
                    <div className="flex items-center justify-between flex-1 pr-2 text-left">
                      <span className="text-sm font-medium text-foreground">Fazer motor</span>
                      <span className="text-xs text-muted-foreground">
                        {moto.kmMotorRefeito == null
                          ? 'não registrado'
                          : moto.kmMotorRefeito.toLocaleString('pt-BR') + ' km'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Linha label="KM em que foi feito">
                      <Input
                        type="number"
                        value={moto.kmMotorRefeito ?? ''}
                        min={0}
                        placeholder="Ex: 70000"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const v = parseInt(raw, 10);
                          dispatch({
                            type: 'SET_MOTOR_REFEITO',
                            km: raw === '' ? null : isNaN(v) ? null : v,
                          });
                        }}
                        className="w-28 text-right"
                      />
                    </Linha>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </section>

          {/* ── Preferências de Manutenção ── */}
          <section className="bg-card rounded-lg p-md space-y-3">
            <p className="label-neutro">Preferências de Manutenção</p>
            <p className="text-sm text-foreground">Tipo de revisão</p>
            <Segmentado
              opcoes={[
                { label: 'Autorizada', valor: 'autorizadas' },
                { label: 'Independente', valor: 'independentes' },
              ]}
              valor={perfilManutencao.modoRevisao}
              onChange={(v) => dispatch({ type: 'SET_MODO_REVISAO', modo: v as ModoRevisao })}
            />
          </section>

          {/* ── Uso Diário ── */}
          <section className="bg-card rounded-lg p-md space-y-3">
            <p className="label-neutro">Uso Diário</p>
            <p className="text-sm text-foreground">Perfil de uso</p>
            <Segmentado
              opcoes={[
                { label: 'Entrega', valor: 'entrega' },
                { label: 'Passageiro', valor: 'passageiro' },
              ]}
              valor={moto.perfilUso}
              onChange={(v) => dispatch({ type: 'SET_PERFIL_USO', perfilUso: v as PerfilUso })}
            />
            <Linha label="Dias por semana">
              <Stepper
                valor={trabalho.diasPorSemana}
                min={1}
                max={7}
                onChange={(v) => dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: v })}
              />
            </Linha>
            <Linha label="KM por dia">
              <Input
                type="number"
                value={trabalho.kmPorDia}
                min={1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v > 0) dispatch({ type: 'SET_KM_POR_DIA', valor: v });
                }}
                className="w-28 text-right"
              />
            </Linha>
          </section>

          {/* ── Financeiro ── */}
          <section className="bg-card rounded-lg p-md space-y-4">
            <p className="label-neutro">Financeiro</p>

            {/* Seguro */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="switch-seguro" className="text-sm text-foreground">
                  Seguro
                </label>
                <Switch
                  id="switch-seguro"
                  checked={seguro.tem}
                  onCheckedChange={(v) =>
                    dispatch({
                      type: 'SET_SEGURO',
                      config: { tem: v, empresa: v ? seguro.empresa : null },
                    })
                  }
                />
              </div>
              {seguro.tem && (
                <div className="space-y-2 pl-2 pt-1">
                  <Linha label="Valor (R$)">
                    <Input
                      type="number"
                      value={seguro.valorAnual}
                      min={0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) dispatch({ type: 'SET_SEGURO', config: { valorAnual: v } });
                      }}
                      className="w-28 text-right"
                    />
                  </Linha>
                  <Linha label="Periodicidade">
                    <Segmentado
                      opcoes={[
                        { label: 'Anual', valor: 'anual' },
                        { label: 'Mensal', valor: 'mensal' },
                      ]}
                      valor={seguro.periodicidade}
                      onChange={(v) =>
                        dispatch({
                          type: 'SET_SEGURO',
                          config: { periodicidade: v as PeriodicidadeSeguro },
                        })
                      }
                      className="w-40"
                    />
                  </Linha>
                </div>
              )}
            </div>

            {/* Alimentação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="switch-alim" className="text-sm text-foreground">
                  Alimentação
                </label>
                <Switch
                  id="switch-alim"
                  checked={cats.alimentacao}
                  onCheckedChange={() =>
                    dispatch({ type: 'TOGGLE_CATEGORIA', categoria: 'alimentacao' })
                  }
                />
              </div>
              <Linha label="Valor por dia (R$)">
                <Input
                  type="number"
                  value={financeiro.alimentacaoDia}
                  min={0}
                  disabled={!cats.alimentacao}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) dispatch({ type: 'SET_ALIMENTACAO', valorDia: v });
                  }}
                  className="w-28 text-right"
                />
              </Linha>
            </div>

            {/* Internet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="switch-net" className="text-sm text-foreground">
                  Internet
                </label>
                <Switch
                  id="switch-net"
                  checked={cats.internet}
                  onCheckedChange={() =>
                    dispatch({ type: 'TOGGLE_CATEGORIA', categoria: 'internet' })
                  }
                />
              </div>
              <Linha label="Valor por mês (R$)">
                <Input
                  type="number"
                  value={financeiro.internet}
                  min={0}
                  disabled={!cats.internet}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) dispatch({ type: 'SET_INTERNET', valor: v });
                  }}
                  className="w-28 text-right"
                />
              </Linha>
            </div>
          </section>

          {/* ── Situação Legal ── */}
          <section className="bg-card rounded-lg p-md space-y-3">
            <p className="label-neutro">Situação Legal</p>
            <p className="text-sm text-foreground">Situação da moto</p>
            <Segmentado
              opcoes={[
                { label: 'Quitada', valor: 'quitada' },
                { label: 'Financiada', valor: 'financiada' },
                { label: 'Alugada', valor: 'alugada' },
              ]}
              valor={situacaoMoto}
              onChange={(v) => dispatch({ type: 'SET_SITUACAO_MOTO', situacao: v as SituacaoMoto })}
            />
            {situacaoMoto === 'financiada' && (
              <div className="space-y-2 pt-1">
                <Linha label="Parcela mensal (R$)">
                  <Input
                    type="number"
                    value={financeiro.parcelaMensal ?? ''}
                    min={0}
                    placeholder="0"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const v = parseFloat(raw);
                      dispatch({
                        type: 'SET_PARCELA',
                        parcelaMensal: raw === '' ? null : isNaN(v) ? null : v,
                        parcelasRestantes: financeiro.parcelasRestantes,
                      });
                    }}
                    className="w-28 text-right"
                  />
                </Linha>
                <Linha label="Parcelas restantes">
                  <Input
                    type="number"
                    value={financeiro.parcelasRestantes ?? ''}
                    min={0}
                    placeholder="0"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const v = parseInt(raw, 10);
                      dispatch({
                        type: 'SET_PARCELA',
                        parcelaMensal: financeiro.parcelaMensal,
                        parcelasRestantes: raw === '' ? null : isNaN(v) ? null : v,
                      });
                    }}
                    className="w-28 text-right"
                  />
                </Linha>
              </div>
            )}
            {situacaoMoto === 'alugada' && (
              <div className="space-y-2 pt-1">
                <Linha label="Aluguel (R$)">
                  <Input
                    type="number"
                    value={financeiro.aluguelMensal ?? ''}
                    min={0}
                    placeholder="0"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const v = parseFloat(raw);
                      dispatch({
                        type: 'SET_ALUGUEL',
                        aluguelMensal: raw === '' ? null : isNaN(v) ? null : v,
                        aluguelPeriodicidade: financeiro.aluguelPeriodicidade,
                      });
                    }}
                    className="w-28 text-right"
                  />
                </Linha>
                <Linha label="Periodicidade">
                  <Segmentado
                    opcoes={[
                      { label: 'Mensal', valor: 'mensal' },
                      { label: 'Semanal', valor: 'semanal' },
                    ]}
                    valor={financeiro.aluguelPeriodicidade ?? 'mensal'}
                    onChange={(v) =>
                      dispatch({
                        type: 'SET_ALUGUEL',
                        aluguelMensal: financeiro.aluguelMensal,
                        aluguelPeriodicidade: v as PeriodicidadeAluguel,
                      })
                    }
                    className="w-40"
                  />
                </Linha>
              </div>
            )}
          </section>

          {/* ── CTA Reset ── */}
          <div className="pb-2">
            <Button
              variant="outline"
              className="w-full min-h-touch text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDialogReset(true)}
            >
              Restaurar valores padrões
            </Button>
          </div>
        </div>
      </main>

      <NavBar />

      <Dialog open={dialogReset} onOpenChange={setDialogReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar valores padrões?</DialogTitle>
            <DialogDescription>
              Uso, manutenção e financeiro voltam ao padrão. Dados da moto (modelo, KM) e serviços
              da aba M. Obra não são alterados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                dispatch({ type: 'RESETAR_AJUSTES_PADRAO' });
                setDialogReset(false);
              }}
            >
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

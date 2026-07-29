import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PerfilProvider } from './context/PerfilContext';
import { ThemeProvider } from './context/ThemeContext';
import { RotaProtegida } from './routes/RotaProtegida';
import { LayoutApp } from './components/layout/LayoutApp';
import { PaginaEstimativa } from './pages/PaginaEstimativa';

// Estimativa é a tela de destino de quem já usa o app, então entra no chunk
// inicial junto com o LayoutApp. As demais são carregadas sob demanda
// (TASK-REF-47): o service worker precacheia esses chunks em segundo plano, de
// modo que o custo é só no primeiro acesso — e, depois dele, o app segue
// offline como antes.
const FluxoOnboarding = lazy(() =>
  import('./pages/onboarding/FluxoOnboarding').then((m) => ({ default: m.FluxoOnboarding })),
);
const PaginaDetalhamento = lazy(() =>
  import('./pages/PaginaDetalhamento').then((m) => ({ default: m.PaginaDetalhamento })),
);
const PaginaMaoDeObra = lazy(() =>
  import('./pages/PaginaMaoDeObra').then((m) => ({ default: m.PaginaMaoDeObra })),
);
const PaginaInsumos = lazy(() =>
  import('./pages/PaginaInsumos').then((m) => ({ default: m.PaginaInsumos })),
);
const PaginaAjustes = lazy(() =>
  import('./pages/PaginaAjustes').then((m) => ({ default: m.PaginaAjustes })),
);
const PaginaPerfil = lazy(() =>
  import('./pages/PaginaPerfil').then((m) => ({ default: m.PaginaPerfil })),
);

function App() {
  return (
    <ThemeProvider>
      <PerfilProvider>
        <BrowserRouter>
          {/* Moldura central: no celular ocupa 100% (viewport < 480px); na web
              vira uma coluna "de celular" centralizada, sem esticar a UI mobile. */}
          <div className="flex min-h-screen justify-center bg-muted/20">
            <div className="relative w-full max-w-3xl bg-background text-foreground shadow-2xl">
              {/* Fallback intencionalmente vazio: os chunks de rota são pequenos
                  e ficam precacheados pelo service worker após o 1º acesso, então
                  um spinner apareceria por milissegundos e só produziria flicker.
                  O `min-h-screen` segura a altura e evita salto de layout. */}
              <Suspense fallback={<div className="min-h-screen" />}>
                <Routes>
                  {/* Onboarding - nao protegido */}
                  <Route path="/onboarding/*" element={<FluxoOnboarding />} />

                  {/* App principal - protegido */}
                  <Route element={<RotaProtegida />}>
                    {/* Rotas com header + NavBar */}
                    <Route element={<LayoutApp />}>
                      <Route path="/estimativa" element={<PaginaEstimativa />} />
                      <Route path="/mao-de-obra" element={<PaginaMaoDeObra />} />
                      <Route path="/insumos" element={<PaginaInsumos />} />
                      <Route path="/ajustes" element={<PaginaAjustes />} />
                    </Route>
                    {/* Subpáginas com CabecalhoVoltar (header próprio com botão voltar) */}
                    <Route path="/perfil" element={<PaginaPerfil />} />
                    <Route path="/estimativa/detalhamento" element={<PaginaDetalhamento />} />
                  </Route>

                  {/* Raiz redireciona para estimativa (RotaProtegida redireciona p/ onboarding se necessario) */}
                  <Route path="/" element={<Navigate to="/estimativa" replace />} />
                  <Route path="*" element={<Navigate to="/estimativa" replace />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </BrowserRouter>
      </PerfilProvider>
    </ThemeProvider>
  );
}

export default App;

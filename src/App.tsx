import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PerfilProvider } from './context/PerfilContext';
import { ThemeProvider } from './context/ThemeContext';
import { RotaProtegida } from './routes/RotaProtegida';
import { LayoutApp } from './components/layout/LayoutApp';
import { FluxoOnboarding } from './pages/onboarding/FluxoOnboarding';
import { PaginaEstimativa } from './pages/PaginaEstimativa';
import { PaginaDetalhamento } from './pages/PaginaDetalhamento';
import { PaginaRegistros } from './pages/PaginaRegistros';
import { PaginaMaoDeObra } from './pages/PaginaMaoDeObra';
import { PaginaVidaUtil } from './pages/PaginaVidaUtil';
import { PaginaAjustes } from './pages/PaginaAjustes';

function App() {
  return (
    <ThemeProvider>
      <PerfilProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface text-white">
          <Routes>
            {/* Onboarding — nao protegido */}
            <Route path="/onboarding/*" element={<FluxoOnboarding />} />

            {/* App principal — protegido */}
            <Route element={<RotaProtegida />}>
              {/* Rotas com header + NavBar */}
              <Route element={<LayoutApp />}>
                <Route path="/estimativa" element={<PaginaEstimativa />} />
                <Route path="/registros" element={<PaginaRegistros />} />
                <Route path="/mao-de-obra" element={<PaginaMaoDeObra />} />
                <Route path="/vida-util" element={<PaginaVidaUtil />} />
                <Route path="/ajustes" element={<PaginaAjustes />} />
              </Route>
              {/* Rotas sem NavBar (sub-telas de detalhe) */}
              <Route path="/detalhamento" element={<PaginaDetalhamento />} />
            </Route>

            {/* Raiz redireciona para estimativa (RotaProtegida redireciona p/ onboarding se necessario) */}
            <Route path="/" element={<Navigate to="/estimativa" replace />} />
            <Route path="*" element={<Navigate to="/estimativa" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
      </PerfilProvider>
    </ThemeProvider>
  );
}

export default App;

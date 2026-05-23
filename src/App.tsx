import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PerfilProvider } from './context/PerfilContext';
import { ThemeProvider } from './context/ThemeContext';
import { RotaProtegida } from './routes/RotaProtegida';
import { LayoutApp } from './components/layout/LayoutApp';
import { FluxoOnboarding } from './pages/onboarding/FluxoOnboarding';
import { PaginaEstimativa } from './pages/PaginaEstimativa';
import { PaginaDetalhamento } from './pages/PaginaDetalhamento';
import { PaginaMaoDeObra } from './pages/PaginaMaoDeObra';
import { PaginaVidaUtil } from './pages/PaginaVidaUtil';
import { PaginaAjustes } from './pages/PaginaAjustes';
import { PaginaPerfil } from './pages/PaginaPerfil';

function App() {
  return (
    <ThemeProvider>
      <PerfilProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Onboarding — nao protegido */}
              <Route path="/onboarding/*" element={<FluxoOnboarding />} />

              {/* App principal — protegido */}
              <Route element={<RotaProtegida />}>
                {/* Rotas com header + NavBar */}
                <Route element={<LayoutApp />}>
                  <Route path="/estimativa" element={<PaginaEstimativa />} />
                  <Route path="/mao-de-obra" element={<PaginaMaoDeObra />} />
                  <Route path="/vida-util" element={<PaginaVidaUtil />} />
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
          </div>
        </BrowserRouter>
      </PerfilProvider>
    </ThemeProvider>
  );
}

export default App;

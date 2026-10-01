import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SolicitacoesListPage } from "./pages/SolicitacoesListPage";
import { SolicitacaoFormPage } from "./pages/SolicitacaoFormPage";
import { SolicitacaoDetailPage } from "./pages/SolicitacaoDetailPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/solicitacoes" element={<SolicitacoesListPage />} />
            <Route path="/solicitacoes/novo" element={<SolicitacaoFormPage />} />
            <Route path="/solicitacoes/:id" element={<SolicitacaoDetailPage />} />
            <Route path="/solicitacoes/:id/editar" element={<SolicitacaoFormPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

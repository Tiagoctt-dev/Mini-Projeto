import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-title">Portal de Solicitações Internas</span>
          <nav className="app-nav">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/solicitacoes">Solicitações</NavLink>
            <NavLink to="/solicitacoes/novo">Nova Solicitação</NavLink>
          </nav>
          <div className="app-user">
            <span>{usuario?.nome}</span>
            <button type="button" onClick={() => logout()} className="botao-link">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

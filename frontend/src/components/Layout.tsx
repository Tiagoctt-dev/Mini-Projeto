import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ChartIcon, ClipboardIcon, LogoIcon, LogoutIcon, PlusIcon } from "./icons";

function iniciais(nome?: string): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Layout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const emListaOuDetalhe =
    location.pathname.startsWith("/solicitacoes") && location.pathname !== "/solicitacoes/novo";

  return (
    <div className="app-shell">
      <aside className="barra-lateral">
        <div className="barra-lateral-marca">
          <span className="app-logo">
            <LogoIcon className="icone" />
          </span>
          <span className="app-title">Portal de Solicitações Internas</span>
        </div>

        <nav className="barra-lateral-nav">
          <NavLink to="/solicitacoes" className={() => (emListaOuDetalhe ? "active" : "")}>
            <ClipboardIcon className="icone" />
            Solicitações
          </NavLink>
          <NavLink to="/solicitacoes/novo" end>
            <PlusIcon className="icone" />
            Nova Solicitação
          </NavLink>
          <NavLink to="/" end>
            <ChartIcon className="icone" />
            Dashboard
          </NavLink>
        </nav>

        <div className="barra-lateral-rodape">
          <div className="app-user">
            <span className="avatar" aria-hidden="true">
              {iniciais(usuario?.nome)}
            </span>
            <span className="app-user-nome">{usuario?.nome}</span>
          </div>
          <button type="button" onClick={() => logout()} className="botao-link botao-sair">
            <LogoutIcon className="icone" />
            Sair
          </button>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

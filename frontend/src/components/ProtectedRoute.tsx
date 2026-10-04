import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoadingState } from "./LoadingState";

export function ProtectedRoute() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="tela-carregando">
        <LoadingState label="Carregando sessão..." />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

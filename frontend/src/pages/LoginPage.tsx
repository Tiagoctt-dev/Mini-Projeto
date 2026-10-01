import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { extrairMensagemErro } from "../api/client";

export function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("ana.silva@empresa.com");
  const [senha, setSenha] = useState("senha123");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    const destino = (location.state as { from?: string })?.from ?? "/";
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(email, senha);
      navigate("/", { replace: true });
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-login">
      <form className="cartao-login" onSubmit={handleSubmit}>
        <h1>Portal de Solicitações Internas</h1>
        <p className="subtitulo">Entre com seu usuário para continuar</p>

        {erro && <div className="alerta-erro">{erro}</div>}

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="dica-demo">
          Usuários de demonstração: <strong>ana.silva@empresa.com</strong> ou{" "}
          <strong>bruno.costa@empresa.com</strong>, senha <strong>senha123</strong>
        </p>
      </form>
    </div>
  );
}

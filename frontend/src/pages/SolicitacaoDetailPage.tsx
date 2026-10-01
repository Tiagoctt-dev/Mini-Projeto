import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { alterarStatus, buscarSolicitacao, excluirSolicitacao } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { STATUS_LIST } from "../types";
import type { Solicitacao, StatusSolicitacao } from "../types";

export function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function carregar() {
    if (!id) return;
    setCarregando(true);
    buscarSolicitacao(Number(id))
      .then(setSolicitacao)
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [id]);

  async function handleMudarStatus(novoStatus: StatusSolicitacao) {
    if (!solicitacao) return;
    setAtualizandoStatus(true);
    setErro(null);
    try {
      const atualizada = await alterarStatus(solicitacao.id, novoStatus);
      setSolicitacao(atualizada);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAtualizandoStatus(false);
    }
  }

  async function handleExcluir() {
    if (!solicitacao) return;
    if (!window.confirm("Tem certeza que deseja excluir esta solicitação?")) return;
    setExcluindo(true);
    setErro(null);
    try {
      await excluirSolicitacao(solicitacao.id);
      navigate("/solicitacoes");
    } catch (error) {
      setErro(extrairMensagemErro(error));
      setExcluindo(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (erro && !solicitacao) return <div className="alerta-erro">{erro}</div>;
  if (!solicitacao) return null;

  const podeEditar = usuario?.id === solicitacao.solicitanteId && solicitacao.status === "ABERTO";

  return (
    <div className="pagina-detalhe">
      <p>
        <Link to="/solicitacoes">← Voltar para a listagem</Link>
      </p>

      <div className="cabecalho-detalhe">
        <h1>
          #{solicitacao.id} — {solicitacao.titulo}
        </h1>
        <StatusBadge status={solicitacao.status} />
      </div>

      {erro && <div className="alerta-erro">{erro}</div>}

      <dl className="lista-detalhes">
        <dt>Categoria</dt>
        <dd>{solicitacao.categoria}</dd>

        <dt>Solicitante</dt>
        <dd>
          {solicitacao.solicitante.nome} ({solicitacao.solicitante.email})
        </dd>

        <dt>Data de abertura</dt>
        <dd>{new Date(solicitacao.criadoEm).toLocaleString("pt-BR")}</dd>

        <dt>Última atualização</dt>
        <dd>{new Date(solicitacao.atualizadoEm).toLocaleString("pt-BR")}</dd>

        <dt>Descrição</dt>
        <dd className="descricao">{solicitacao.descricao}</dd>
      </dl>

      <div className="secao-status">
        <label htmlFor="alterar-status">Alterar status</label>
        <select
          id="alterar-status"
          value={solicitacao.status}
          disabled={atualizandoStatus}
          onChange={(e) => handleMudarStatus(e.target.value as StatusSolicitacao)}
        >
          {STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {podeEditar && (
        <div className="acoes-formulario">
          <Link to={`/solicitacoes/${solicitacao.id}/editar`}>
            <button type="button">Editar</button>
          </Link>
          <button type="button" className="botao-perigo" disabled={excluindo} onClick={handleExcluir}>
            {excluindo ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      )}
    </div>
  );
}

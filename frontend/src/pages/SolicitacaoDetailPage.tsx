import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { alterarStatus, buscarSolicitacao, excluirSolicitacao } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClipboardIcon,
  EditIcon,
  RefreshIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "../components/icons";
import { CATEGORIA_VISUAL } from "../components/categoriaVisual";
import { STATUS_LIST } from "../types";
import type { Solicitacao, StatusSolicitacao } from "../types";

function rotuloStatus(status: StatusSolicitacao): string {
  return STATUS_LIST.find((s) => s.value === status)?.label ?? status;
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [statusPendente, setStatusPendente] = useState<StatusSolicitacao | null>(null);
  const modalExclusaoRef = useRef<HTMLDivElement>(null);
  const modalStatusRef = useRef<HTMLDivElement>(null);

  function carregar() {
    if (!id) return;
    setCarregando(true);
    buscarSolicitacao(Number(id))
      .then(setSolicitacao)
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [id]);

  const algumModalAberto = confirmarExclusao || statusPendente !== null;

  useEffect(() => {
    if (!algumModalAberto) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setConfirmarExclusao(false);
      setStatusPendente(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [algumModalAberto]);

  useEffect(() => {
    if (confirmarExclusao) modalExclusaoRef.current?.focus();
  }, [confirmarExclusao]);

  useEffect(() => {
    if (statusPendente) modalStatusRef.current?.focus();
  }, [statusPendente]);

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
      setStatusPendente(null);
    }
  }

  async function handleExcluir() {
    if (!solicitacao) return;
    setExcluindo(true);
    setErro(null);
    try {
      await excluirSolicitacao(solicitacao.id);
      navigate("/solicitacoes");
    } catch (error) {
      setErro(extrairMensagemErro(error));
      setExcluindo(false);
      setConfirmarExclusao(false);
    }
  }

  if (carregando) return <LoadingState />;
  if (erro && !solicitacao) return <div className="alerta-erro">{erro}</div>;
  if (!solicitacao) return null;

  const podeEditar = usuario?.id === solicitacao.solicitanteId && solicitacao.status === "ABERTO";
  const statusMudou = solicitacao.status !== "ABERTO";
  const codigo = `#${String(solicitacao.id).padStart(4, "0")}`;
  const categoriaVisual = CATEGORIA_VISUAL[solicitacao.categoria];

  return (
    <div className="pagina-detalhe">
      <Link to="/solicitacoes" className="link-voltar">
        <ChevronLeftIcon className="icone" />
        Voltar para a listagem
      </Link>

      {erro && <div className="alerta-erro">{erro}</div>}

      <div className="detalhe-banner">
        <span className="detalhe-banner-codigo">{codigo}</span>
        <div className="detalhe-banner-titulo">
          <h1>{solicitacao.titulo}</h1>
          <StatusBadge status={solicitacao.status} />
        </div>
      </div>

      <div className="detalhe-grid">
        <div className="detalhe-principal">
          <div className="detalhe-info-grid">
            <div className={`detalhe-info-item ${categoriaVisual.classe}`}>
              <span className="detalhe-info-label">
                <categoriaVisual.Icone className="icone" />
                Categoria
              </span>
              <span className="detalhe-info-valor">{solicitacao.categoria}</span>
            </div>
            <div className="detalhe-info-item">
              <span className="detalhe-info-label">
                <UserIcon className="icone" />
                Solicitante
              </span>
              <span className="detalhe-info-valor">{solicitacao.solicitante.nome}</span>
            </div>
            <div className="detalhe-info-item">
              <span className="detalhe-info-label">
                <CalendarIcon className="icone" />
                Data de abertura
              </span>
              <span className="detalhe-info-valor">{formatarDataHora(solicitacao.criadoEm)}</span>
            </div>
            <div className="detalhe-info-item">
              <span className="detalhe-info-label">
                <ClipboardIcon className="icone" />
                Atualizado em
              </span>
              <span className="detalhe-info-valor">{formatarDataHora(solicitacao.atualizadoEm)}</span>
            </div>
          </div>

          <section className="cartao-secao">
            <h2>Descrição</h2>
            <p className="caixa-descricao">{solicitacao.descricao}</p>
          </section>

          <section className="cartao-secao">
            <h2>Linha do tempo</h2>
            <ul className="linha-do-tempo">
              <li>
                <span className="linha-do-tempo-ponto" data-status="ABERTO" />
                <div>
                  <div className="linha-do-tempo-topo">
                    <StatusBadge status="ABERTO" />
                    <span className="linha-do-tempo-data">{formatarDataHora(solicitacao.criadoEm)}</span>
                  </div>
                  <p>Solicitação criada por {solicitacao.solicitante.nome}.</p>
                </div>
              </li>
              {statusMudou && (
                <li>
                  <span className="linha-do-tempo-ponto" data-status={solicitacao.status} />
                  <div>
                    <div className="linha-do-tempo-topo">
                      <StatusBadge status={solicitacao.status} />
                      <span className="linha-do-tempo-data">{formatarDataHora(solicitacao.atualizadoEm)}</span>
                    </div>
                    <p>Status atual: {rotuloStatus(solicitacao.status)}.</p>
                  </div>
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="detalhe-sidebar">
          <section className="cartao-secao">
            <h2>Ações</h2>

            <label htmlFor="alterar-status">Alterar status</label>
            <select
              id="alterar-status"
              value={solicitacao.status}
              disabled={atualizandoStatus}
              onChange={(e) => setStatusPendente(e.target.value as StatusSolicitacao)}
            >
              {STATUS_LIST.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {podeEditar && (
              <div className="acoes-formulario acoes-formulario-coluna">
                <Link to={`/solicitacoes/${solicitacao.id}/editar`}>
                  <button type="button">
                    <EditIcon className="icone" />
                    Editar
                  </button>
                </Link>
                <button
                  type="button"
                  className="botao-perigo"
                  disabled={excluindo}
                  onClick={() => setConfirmarExclusao(true)}
                >
                  <TrashIcon className="icone" />
                  Excluir
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>

      {confirmarExclusao && (
        <div className="modal-overlay" onClick={() => !excluindo && setConfirmarExclusao(false)}>
          <div
            className="modal modal-confirmacao"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-excluir"
            tabIndex={-1}
            ref={modalExclusaoRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecalho">
              <span className="modal-icone modal-icone-perigo">
                <TrashIcon className="icone" />
              </span>
              <div>
                <h2 id="titulo-modal-excluir">Excluir solicitação?</h2>
                <p>Essa ação não pode ser desfeita. A solicitação será removida permanentemente.</p>
              </div>
              <button
                type="button"
                className="botao-fechar-modal"
                aria-label="Fechar"
                disabled={excluindo}
                onClick={() => setConfirmarExclusao(false)}
              >
                <XIcon className="icone" />
              </button>
            </div>

            <div className="modal-rodape modal-rodape-fim">
              <div className="modal-rodape-acoes">
                <button
                  type="button"
                  className="botao-secundario"
                  disabled={excluindo}
                  onClick={() => setConfirmarExclusao(false)}
                >
                  Cancelar
                </button>
                <button type="button" className="botao-perigo" disabled={excluindo} onClick={handleExcluir}>
                  <TrashIcon className="icone" />
                  {excluindo ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusPendente && (
        <div className="modal-overlay" onClick={() => !atualizandoStatus && setStatusPendente(null)}>
          <div
            className="modal modal-confirmacao"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-status"
            tabIndex={-1}
            ref={modalStatusRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecalho">
              <span className="modal-icone">
                <RefreshIcon className="icone" />
              </span>
              <div>
                <h2 id="titulo-modal-status">Alterar status?</h2>
                <p>
                  O status será alterado de <strong>{rotuloStatus(solicitacao.status)}</strong> para{" "}
                  <strong>{rotuloStatus(statusPendente)}</strong>.
                </p>
              </div>
              <button
                type="button"
                className="botao-fechar-modal"
                aria-label="Fechar"
                disabled={atualizandoStatus}
                onClick={() => setStatusPendente(null)}
              >
                <XIcon className="icone" />
              </button>
            </div>

            <div className="modal-rodape modal-rodape-fim">
              <div className="modal-rodape-acoes">
                <button
                  type="button"
                  className="botao-secundario"
                  disabled={atualizandoStatus}
                  onClick={() => setStatusPendente(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={atualizandoStatus}
                  onClick={() => handleMudarStatus(statusPendente)}
                >
                  <CheckCircleIcon className="icone" />
                  {atualizandoStatus ? "Alterando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

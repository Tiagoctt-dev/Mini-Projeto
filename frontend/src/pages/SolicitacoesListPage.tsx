import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listarSolicitacoes } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { SolicitacaoCard } from "../components/SolicitacaoCard";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FilterIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TagIcon,
  XIcon,
} from "../components/icons";
import { CATEGORIAS, STATUS_LIST } from "../types";
import type { Categoria, FiltrosSolicitacoes, Solicitacao, StatusSolicitacao } from "../types";

const FILTROS_INICIAIS: FiltrosSolicitacoes = { page: 1, pageSize: 10 };
const DEBOUNCE_TEXTO_MS = 400;

type FiltrosAvancados = Pick<FiltrosSolicitacoes, "categoria" | "status" | "dataInicio" | "dataFim">;

const FILTROS_AVANCADOS_VAZIOS: FiltrosAvancados = {
  categoria: undefined,
  status: undefined,
  dataInicio: undefined,
  dataFim: undefined,
};

function contarFiltrosAtivos(f: FiltrosAvancados): number {
  return [f.categoria, f.status, f.dataInicio, f.dataFim].filter(Boolean).length;
}

export function SolicitacoesListPage() {
  const [filtros, setFiltros] = useState<FiltrosSolicitacoes>(FILTROS_INICIAIS);
  const [textoInput, setTextoInput] = useState("");
  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [filtroAberto, setFiltroAberto] = useState(false);
  const [rascunho, setRascunho] = useState<FiltrosAvancados>(FILTROS_AVANCADOS_VAZIOS);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCarregando(true);
    listarSolicitacoes(filtros)
      .then((resultado) => {
        setItens(resultado.itens);
        setTotalPaginas(resultado.paginacao.totalPaginas);
        setErro(null);
      })
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }, [filtros]);

  // Busca por título é debounced para não disparar uma requisição a cada tecla;
  // os demais filtros aplicam na hora, assim que o valor muda.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltros((f) => ({ ...f, texto: textoInput.trim() || undefined, page: 1 }));
    }, DEBOUNCE_TEXTO_MS);
    return () => clearTimeout(timeout);
  }, [textoInput]);

  useEffect(() => {
    if (!filtroAberto) return;
    modalRef.current?.focus();
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFiltroAberto(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtroAberto]);

  function abrirFiltros() {
    setRascunho({
      categoria: filtros.categoria,
      status: filtros.status,
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    });
    setFiltroAberto(true);
  }

  function atualizarRascunho<K extends keyof FiltrosAvancados>(campo: K, valor: FiltrosAvancados[K]) {
    setRascunho((r) => ({ ...r, [campo]: valor }));
  }

  function aplicarFiltros() {
    setFiltros((f) => ({ ...f, ...rascunho, page: 1 }));
    setFiltroAberto(false);
  }

  function limparFiltrosAvancados() {
    setRascunho(FILTROS_AVANCADOS_VAZIOS);
    setFiltros((f) => ({ ...f, ...FILTROS_AVANCADOS_VAZIOS, page: 1 }));
  }

  function mudarPagina(novaPagina: number) {
    setFiltros((atual) => ({ ...atual, page: novaPagina }));
  }

  const paginaAtual = filtros.page ?? 1;
  const filtrosAplicadosCount = contarFiltrosAtivos(filtros);
  const filtrosRascunhoCount = contarFiltrosAtivos(rascunho);

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Solicitações</h1>
          <p className="subtitulo-pagina">Acompanhe e gerencie suas solicitações internas de forma simples e rápida.</p>
        </div>
        <Link to="/solicitacoes/novo" className="botao-cta">
          <PlusIcon className="icone" />
          Nova Solicitação
        </Link>
      </div>

      <div className="barra-busca">
        <div className="campo-busca">
          <SearchIcon className="icone" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
          />
        </div>
        <button type="button" className="botao-secundario botao-filtros" onClick={abrirFiltros}>
          <FilterIcon className="icone" />
          Filtros
          {filtrosAplicadosCount > 0 && <span className="contador-filtros">{filtrosAplicadosCount}</span>}
        </button>
      </div>

      {erro && <div className="alerta-erro">{erro}</div>}

      {carregando ? (
        <LoadingState />
      ) : itens.length === 0 ? (
        <p className="texto-vazio">Nenhuma solicitação encontrada com esses filtros.</p>
      ) : (
        <>
          <div className="lista-solicitacoes">
            {itens.map((item) => (
              <SolicitacaoCard key={item.id} solicitacao={item} />
            ))}
          </div>

          <div className="paginacao">
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <div className="paginacao-botoes">
              <button
                type="button"
                className="botao-secundario botao-paginacao"
                disabled={paginaAtual <= 1}
                onClick={() => mudarPagina(paginaAtual - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeftIcon className="icone" />
              </button>
              <button
                type="button"
                className="botao-secundario botao-paginacao"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => mudarPagina(paginaAtual + 1)}
                aria-label="Próxima página"
              >
                <ChevronRightIcon className="icone" />
              </button>
            </div>
          </div>
        </>
      )}

      {filtroAberto && (
        <div className="modal-overlay" onClick={() => setFiltroAberto(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-filtros"
            tabIndex={-1}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecalho">
              <span className="modal-icone">
                <FilterIcon className="icone" />
              </span>
              <div>
                <h2 id="titulo-modal-filtros">Filtros</h2>
                <p>Refine os resultados combinando uma ou mais opções abaixo.</p>
              </div>
              <button
                type="button"
                className="botao-fechar-modal"
                aria-label="Fechar"
                onClick={() => setFiltroAberto(false)}
              >
                <XIcon className="icone" />
              </button>
            </div>

            <div className="modal-corpo">
              <section className="modal-secao">
                <div className="modal-secao-titulo">
                  <span className="modal-secao-icone">
                    <TagIcon className="icone" />
                  </span>
                  <div>
                    <h3>Classificação</h3>
                    <p>Combine categoria e status para reduzir a lista.</p>
                  </div>
                </div>
                <div className="modal-secao-grade">
                  <div className="campo-filtro">
                    <label htmlFor="categoria">Categoria</label>
                    <div className="campo-com-icone">
                      <TagIcon className="icone" />
                      <select
                        id="categoria"
                        value={rascunho.categoria ?? ""}
                        onChange={(e) =>
                          atualizarRascunho("categoria", (e.target.value || undefined) as Categoria | undefined)
                        }
                      >
                        <option value="">Todas as categorias</option>
                        {CATEGORIAS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="campo-filtro">
                    <label htmlFor="status">Status</label>
                    <div className="campo-com-icone">
                      <ClockIcon className="icone" />
                      <select
                        id="status"
                        value={rascunho.status ?? ""}
                        onChange={(e) =>
                          atualizarRascunho("status", (e.target.value || undefined) as StatusSolicitacao | undefined)
                        }
                      >
                        <option value="">Todos</option>
                        {STATUS_LIST.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="modal-secao modal-secao-destaque">
                <div className="modal-secao-titulo">
                  <span className="modal-secao-icone">
                    <CalendarIcon className="icone" />
                  </span>
                  <div>
                    <h3>Intervalo de datas</h3>
                    <p>Filtre pela data de abertura da solicitação.</p>
                  </div>
                </div>
                <div className="modal-datas">
                  <div className="campo-filtro">
                    <label htmlFor="dataInicio">Data inicial</label>
                    <div className="campo-com-icone">
                      <CalendarIcon className="icone" />
                      <input
                        id="dataInicio"
                        type="date"
                        value={rascunho.dataInicio ?? ""}
                        onChange={(e) => atualizarRascunho("dataInicio", e.target.value || undefined)}
                      />
                    </div>
                  </div>
                  <ArrowRightIcon className="icone modal-datas-seta" />
                  <div className="campo-filtro">
                    <label htmlFor="dataFim">Data final</label>
                    <div className="campo-com-icone">
                      <CalendarIcon className="icone" />
                      <input
                        id="dataFim"
                        type="date"
                        value={rascunho.dataFim ?? ""}
                        onChange={(e) => atualizarRascunho("dataFim", e.target.value || undefined)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="modal-rodape">
              <span className={`modal-status-filtros${filtrosRascunhoCount > 0 ? " ativo" : ""}`}>
                <span className="modal-status-ponto" />
                {filtrosRascunhoCount === 0
                  ? "Nenhum filtro aplicado."
                  : `${filtrosRascunhoCount} filtro${filtrosRascunhoCount > 1 ? "s" : ""} aplicado${
                      filtrosRascunhoCount > 1 ? "s" : ""
                    }.`}
              </span>
              <div className="modal-rodape-acoes">
                <button type="button" className="botao-secundario" onClick={limparFiltrosAvancados}>
                  <RefreshIcon className="icone" />
                  Limpar filtros
                </button>
                <button type="button" onClick={aplicarFiltros}>
                  <CheckCircleIcon className="icone" />
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

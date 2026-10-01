import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarSolicitacoes } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { CATEGORIAS, STATUS_LIST } from "../types";
import type { Categoria, FiltrosSolicitacoes, Solicitacao, StatusSolicitacao } from "../types";

const FILTROS_INICIAIS: FiltrosSolicitacoes = { page: 1, pageSize: 10 };

export function SolicitacoesListPage() {
  const [filtrosForm, setFiltrosForm] = useState<FiltrosSolicitacoes>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosSolicitacoes>(FILTROS_INICIAIS);
  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    listarSolicitacoes(filtrosAplicados)
      .then((resultado) => {
        setItens(resultado.itens);
        setTotalPaginas(resultado.paginacao.totalPaginas);
        setErro(null);
      })
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }, [filtrosAplicados]);

  function aplicarFiltros(event: FormEvent) {
    event.preventDefault();
    setFiltrosAplicados({ ...filtrosForm, page: 1 });
  }

  function limparFiltros() {
    setFiltrosForm(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
  }

  function mudarPagina(novaPagina: number) {
    setFiltrosAplicados((atual) => ({ ...atual, page: novaPagina }));
  }

  const paginaAtual = filtrosAplicados.page ?? 1;

  return (
    <div>
      <h1>Solicitações</h1>

      <form className="filtros" onSubmit={aplicarFiltros}>
        <div className="campo-filtro">
          <label htmlFor="texto">Título</label>
          <input
            id="texto"
            type="text"
            placeholder="Buscar por título..."
            value={filtrosForm.texto ?? ""}
            onChange={(e) => setFiltrosForm((f) => ({ ...f, texto: e.target.value }))}
          />
        </div>

        <div className="campo-filtro">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={filtrosForm.categoria ?? ""}
            onChange={(e) =>
              setFiltrosForm((f) => ({
                ...f,
                categoria: (e.target.value || undefined) as Categoria | undefined,
              }))
            }
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-filtro">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filtrosForm.status ?? ""}
            onChange={(e) =>
              setFiltrosForm((f) => ({
                ...f,
                status: (e.target.value || undefined) as StatusSolicitacao | undefined,
              }))
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

        <div className="campo-filtro">
          <label htmlFor="dataInicio">De</label>
          <input
            id="dataInicio"
            type="date"
            value={filtrosForm.dataInicio ?? ""}
            onChange={(e) => setFiltrosForm((f) => ({ ...f, dataInicio: e.target.value }))}
          />
        </div>

        <div className="campo-filtro">
          <label htmlFor="dataFim">Até</label>
          <input
            id="dataFim"
            type="date"
            value={filtrosForm.dataFim ?? ""}
            onChange={(e) => setFiltrosForm((f) => ({ ...f, dataFim: e.target.value }))}
          />
        </div>

        <div className="campo-filtro acoes-filtro">
          <button type="submit">Filtrar</button>
          <button type="button" className="botao-secundario" onClick={limparFiltros}>
            Limpar
          </button>
        </div>
      </form>

      {erro && <div className="alerta-erro">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Solicitante</th>
                  <th>Data de Abertura</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={7} className="tabela-vazia">
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.titulo}</td>
                    <td>{item.categoria}</td>
                    <td>{item.solicitante.nome}</td>
                    <td>{new Date(item.criadoEm).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <Link to={`/solicitacoes/${item.id}`}>Ver detalhes</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paginacao">
            <button
              type="button"
              disabled={paginaAtual <= 1}
              onClick={() => mudarPagina(paginaAtual - 1)}
            >
              ← Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => mudarPagina(paginaAtual + 1)}
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

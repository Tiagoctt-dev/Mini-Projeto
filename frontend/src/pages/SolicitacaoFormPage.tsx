import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { atualizarSolicitacao, buscarSolicitacao, criarSolicitacao } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { CATEGORIAS } from "../types";
import type { Categoria, SolicitacaoFormData } from "../types";

const DADOS_INICIAIS: SolicitacaoFormData = { titulo: "", descricao: "", categoria: "TI" };

export function SolicitacaoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState<SolicitacaoFormData>(DADOS_INICIAIS);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    buscarSolicitacao(Number(id))
      .then((solicitacao) => {
        setDados({
          titulo: solicitacao.titulo,
          descricao: solicitacao.descricao,
          categoria: solicitacao.categoria,
        });
      })
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      if (modoEdicao && id) {
        await atualizarSolicitacao(Number(id), dados);
        navigate(`/solicitacoes/${id}`);
      } else {
        const criada = await criarSolicitacao(dados);
        navigate(`/solicitacoes/${criada.id}`);
      }
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className="pagina-formulario">
      <h1>{modoEdicao ? "Editar Solicitação" : "Nova Solicitação"}</h1>

      <form className="formulario" onSubmit={handleSubmit}>
        {erro && <div className="alerta-erro">{erro}</div>}

        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          type="text"
          value={dados.titulo}
          onChange={(e) => setDados((d) => ({ ...d, titulo: e.target.value }))}
          maxLength={160}
          required
        />

        <label htmlFor="categoria">Categoria</label>
        <select
          id="categoria"
          value={dados.categoria}
          onChange={(e) => setDados((d) => ({ ...d, categoria: e.target.value as Categoria }))}
          required
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows={6}
          value={dados.descricao}
          onChange={(e) => setDados((d) => ({ ...d, descricao: e.target.value }))}
          maxLength={4000}
          required
        />

        <div className="acoes-formulario">
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" className="botao-secundario" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { atualizarSolicitacao, buscarSolicitacao, criarSolicitacao } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { CATEGORIA_VISUAL } from "../components/categoriaVisual";
import { CalendarIcon, CheckCircleIcon, ChevronLeftIcon, ClipboardIcon, FileTextIcon, TagIcon, UserIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { CATEGORIAS } from "../types";
import type { SolicitacaoFormData } from "../types";

const DADOS_INICIAIS: SolicitacaoFormData = { titulo: "", descricao: "", categoria: "TI" };
const LIMITE_TITULO = 160;
const LIMITE_DESCRICAO = 4000;

export function SolicitacaoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
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

  if (carregando) return <LoadingState />;

  const categoriaVisual = CATEGORIA_VISUAL[dados.categoria];

  return (
    <div>
      <Link to={modoEdicao ? `/solicitacoes/${id}` : "/solicitacoes"} className="link-voltar">
        <ChevronLeftIcon className="icone" />
        {modoEdicao ? "Voltar para a solicitação" : "Voltar para a listagem"}
      </Link>

      <div className="cabecalho-pagina">
        <div>
          <h1>{modoEdicao ? "Editar Solicitação" : "Nova Solicitação"}</h1>
          <p className="subtitulo-pagina">
            {modoEdicao
              ? "Atualize as informações da solicitação selecionada."
              : "Preencha os campos abaixo para registrar uma nova solicitação."}
          </p>
        </div>
      </div>

      <form className="formulario-grid" onSubmit={handleSubmit}>
        <div className="cartao-secao formulario-principal">
          {erro && <div className="alerta-erro">{erro}</div>}

          <label htmlFor="titulo" className="rotulo-com-icone">
            <ClipboardIcon className="icone" />
            Título
          </label>
          <div className="campo-com-contagem">
            <input
              id="titulo"
              type="text"
              placeholder="Ex: Solicitação de novo notebook"
              value={dados.titulo}
              onChange={(e) => setDados((d) => ({ ...d, titulo: e.target.value }))}
              maxLength={LIMITE_TITULO}
              required
            />
            <span className="contagem-caracteres">
              {dados.titulo.length}/{LIMITE_TITULO}
            </span>
          </div>

          <label className="rotulo-com-icone">
            <TagIcon className="icone" />
            Categoria
          </label>
          <div className="selecao-categoria">
            {CATEGORIAS.map((c) => {
              const visual = CATEGORIA_VISUAL[c.value];
              const ativa = dados.categoria === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  className={`opcao-categoria ${visual.classe}${ativa ? " ativa" : ""}`}
                  aria-pressed={ativa}
                  onClick={() => setDados((d) => ({ ...d, categoria: c.value }))}
                >
                  {ativa && <CheckCircleIcon className="icone opcao-categoria-check" />}
                  <span className="opcao-categoria-icone">
                    <visual.Icone className="icone" />
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>

          <label htmlFor="descricao" className="rotulo-com-icone">
            <FileTextIcon className="icone" />
            Descrição
          </label>
          <div className="campo-com-contagem">
            <textarea
              id="descricao"
              rows={7}
              placeholder="Descreva com detalhes o que você precisa..."
              value={dados.descricao}
              onChange={(e) => setDados((d) => ({ ...d, descricao: e.target.value }))}
              maxLength={LIMITE_DESCRICAO}
              required
            />
            <span className="contagem-caracteres">
              {dados.descricao.length}/{LIMITE_DESCRICAO}
            </span>
          </div>

          <div className="acoes-formulario">
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="botao-secundario" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </div>

        <aside className="detalhe-sidebar">
          <section className="cartao-secao">
            <h2>Pré-visualização</h2>
            <div className={`item-solicitacao somente-leitura ${categoriaVisual.classe}`}>
              <span className="item-solicitacao-icone">
                <categoriaVisual.Icone className="icone" />
              </span>
              <div className="item-solicitacao-corpo">
                <div className="item-solicitacao-cabecalho">
                  <span className="item-solicitacao-codigo">{modoEdicao ? `#${id}` : "#novo"}</span>
                  <span className="item-solicitacao-titulo">{dados.titulo || "Título da solicitação"}</span>
                </div>
                <p className="item-solicitacao-descricao">
                  {dados.descricao || "A descrição que você escrever aparecerá aqui."}
                </p>
                <div className="item-solicitacao-meta">
                  <span>
                    <TagIcon className="icone" />
                    {dados.categoria}
                  </span>
                  <span>
                    <UserIcon className="icone" />
                    {usuario?.nome ?? "Você"}
                  </span>
                  <span>
                    <CalendarIcon className="icone" />
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
            <p className="texto-ajuda">
              É assim que sua solicitação vai aparecer para a equipe responsável. Capriche no título e na
              descrição para agilizar o atendimento.
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}

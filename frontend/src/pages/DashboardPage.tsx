import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarIndicadores } from "../api/dashboard";
import { listarSolicitacoes } from "../api/solicitacoes";
import { extrairMensagemErro } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { SolicitacaoCard } from "../components/SolicitacaoCard";
import { CategoriaChart } from "../components/CategoriaChart";
import { ArrowRightIcon, CheckCircleIcon, ClipboardIcon, ClockIcon, PlusIcon, RefreshIcon } from "../components/icons";
import type { Indicadores, Solicitacao } from "../types";
import { useAuth } from "../contexts/AuthContext";

const PREVIEW_SIZE = 4;

export function DashboardPage() {
  const { usuario } = useAuth();
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [recentes, setRecentes] = useState<Solicitacao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarIndicadores()
      .then(setIndicadores)
      .catch((error) => setErro(extrairMensagemErro(error)));
    listarSolicitacoes({ page: 1, pageSize: PREVIEW_SIZE })
      .then((resultado) => setRecentes(resultado.itens))
      .catch(() => setRecentes([]));
  }, []);

  if (erro) return <div className="alerta-erro">{erro}</div>;
  if (!indicadores) return <LoadingState label="Carregando indicadores..." />;

  const cartoes = [
    { label: "Total de Solicitações", valor: indicadores.total, classe: "cartao-total", Icone: ClipboardIcon },
    { label: "Abertas", valor: indicadores.abertas, classe: "cartao-aberto", Icone: ClockIcon },
    { label: "Em Atendimento", valor: indicadores.emAtendimento, classe: "cartao-atendimento", Icone: RefreshIcon },
    { label: "Concluídas", valor: indicadores.concluidas, classe: "cartao-concluido", Icone: CheckCircleIcon },
  ];

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Bem-vindo{usuario ? `, ${usuario.nome.split(" ")[0]}` : ""}</h1>
          <p className="subtitulo-pagina">Acompanhe os indicadores e as solicitações internas da equipe.</p>
        </div>
        <Link to="/solicitacoes/novo" className="botao-cta">
          <PlusIcon className="icone" />
          Nova Solicitação
        </Link>
      </div>

      <div className="grade-indicadores">
        {cartoes.map(({ label, valor, classe, Icone }) => (
          <div key={label} className={`cartao-indicador ${classe}`}>
            <div className="cartao-indicador-topo">
              <span className="cartao-label">{label}</span>
              <span className="cartao-icone">
                <Icone className="icone" />
              </span>
            </div>
            <span className="cartao-valor">{valor}</span>
          </div>
        ))}
      </div>

      <div className="secao-inferior">
        <div className="secao-recentes">
          <div className="secao-recentes-cabecalho">
            <h2>Solicitações recentes</h2>
            <Link to="/solicitacoes" className="link-com-icone">
              Ver todas
              <ArrowRightIcon className="icone" />
            </Link>
          </div>

          {recentes === null ? (
            <LoadingState label="Carregando solicitações..." />
          ) : recentes.length === 0 ? (
            <p className="texto-vazio">Nenhuma solicitação registrada ainda.</p>
          ) : (
            <div className="lista-solicitacoes">
              {recentes.map((item) => (
                <SolicitacaoCard key={item.id} solicitacao={item} />
              ))}
            </div>
          )}
        </div>

        <div className="grafico-categorias">
          <div className="secao-recentes-cabecalho">
            <h2>Chamados por setor</h2>
          </div>
          <div className="cartao-secao">
            <CategoriaChart dados={indicadores.porCategoria} />
          </div>
        </div>
      </div>
    </div>
  );
}

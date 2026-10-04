import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { CATEGORIA_VISUAL } from "./categoriaVisual";
import { CalendarIcon, ChevronRightIcon, TagIcon, UserIcon } from "./icons";
import type { Solicitacao } from "../types";

export function SolicitacaoCard({ solicitacao }: { solicitacao: Solicitacao }) {
  const { Icone, classe } = CATEGORIA_VISUAL[solicitacao.categoria];

  return (
    <Link to={`/solicitacoes/${solicitacao.id}`} className={`item-solicitacao ${classe}`}>
      <span className="item-solicitacao-icone">
        <Icone className="icone" />
      </span>
      <div className="item-solicitacao-corpo">
        <div className="item-solicitacao-cabecalho">
          <span className="item-solicitacao-codigo">#{solicitacao.id}</span>
          <span className="item-solicitacao-titulo">{solicitacao.titulo}</span>
          <StatusBadge status={solicitacao.status} />
        </div>
        <p className="item-solicitacao-descricao">{solicitacao.descricao}</p>
        <div className="item-solicitacao-meta">
          <span>
            <TagIcon className="icone" />
            {solicitacao.categoria}
          </span>
          <span>
            <UserIcon className="icone" />
            {solicitacao.solicitante.nome}
          </span>
          <span>
            <CalendarIcon className="icone" />
            {new Date(solicitacao.criadoEm).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>
      <ChevronRightIcon className="icone item-solicitacao-seta" />
    </Link>
  );
}

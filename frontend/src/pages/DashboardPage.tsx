import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarIndicadores } from "../api/dashboard";
import { extrairMensagemErro } from "../api/client";
import type { Indicadores } from "../types";

export function DashboardPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarIndicadores()
      .then(setIndicadores)
      .catch((error) => setErro(extrairMensagemErro(error)));
  }, []);

  if (erro) return <div className="alerta-erro">{erro}</div>;
  if (!indicadores) return <p>Carregando indicadores...</p>;

  const cartoes = [
    { label: "Total de Solicitações", valor: indicadores.total, classe: "cartao-total" },
    { label: "Abertas", valor: indicadores.abertas, classe: "cartao-aberto" },
    { label: "Em Atendimento", valor: indicadores.emAtendimento, classe: "cartao-atendimento" },
    { label: "Concluídas", valor: indicadores.concluidas, classe: "cartao-concluido" },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grade-indicadores">
        {cartoes.map((cartao) => (
          <div key={cartao.label} className={`cartao-indicador ${cartao.classe}`}>
            <span className="cartao-valor">{cartao.valor}</span>
            <span className="cartao-label">{cartao.label}</span>
          </div>
        ))}
      </div>
      <p>
        <Link to="/solicitacoes">Ver todas as solicitações →</Link>
      </p>
    </div>
  );
}

import type { StatusSolicitacao } from "../types";

const ESTILOS: Record<StatusSolicitacao, { label: string; className: string }> = {
  ABERTO: { label: "Aberto", className: "badge badge-aberto" },
  EM_ATENDIMENTO: { label: "Em Atendimento", className: "badge badge-atendimento" },
  CONCLUIDO: { label: "Concluído", className: "badge badge-concluido" },
};

export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  const estilo = ESTILOS[status];
  return <span className={estilo.className}>{estilo.label}</span>;
}

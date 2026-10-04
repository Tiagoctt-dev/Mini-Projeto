export type Categoria = "TI" | "RH" | "COMPRAS" | "FINANCEIRO" | "INFRAESTRUTURA";

export type StatusSolicitacao = "ABERTO" | "EM_ATENDIMENTO" | "CONCLUIDO";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Solicitacao {
  id: number;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  status: StatusSolicitacao;
  solicitanteId: number;
  solicitante: Usuario;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Paginacao {
  page: number;
  pageSize: number;
  total: number;
  totalPaginas: number;
}

export interface ListaSolicitacoes {
  itens: Solicitacao[];
  paginacao: Paginacao;
}

export interface Indicadores {
  total: number;
  abertas: number;
  emAtendimento: number;
  concluidas: number;
  porCategoria: { categoria: Categoria; total: number }[];
}

export interface FiltrosSolicitacoes {
  status?: StatusSolicitacao;
  categoria?: Categoria;
  texto?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
}

export interface SolicitacaoFormData {
  titulo: string;
  descricao: string;
  categoria: Categoria;
}

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "TI", label: "TI" },
  { value: "RH", label: "RH" },
  { value: "COMPRAS", label: "Compras" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "INFRAESTRUTURA", label: "Infraestrutura" },
];

export const STATUS_LIST: { value: StatusSolicitacao; label: string }[] = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { value: "CONCLUIDO", label: "Concluído" },
];

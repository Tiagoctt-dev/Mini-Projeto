import { apiClient } from "./client";
import type {
  FiltrosSolicitacoes,
  ListaSolicitacoes,
  Solicitacao,
  SolicitacaoFormData,
  StatusSolicitacao,
} from "../types";

export async function listarSolicitacoes(filtros: FiltrosSolicitacoes): Promise<ListaSolicitacoes> {
  const { data } = await apiClient.get<ListaSolicitacoes>("/solicitacoes", { params: filtros });
  return data;
}

export async function buscarSolicitacao(id: number): Promise<Solicitacao> {
  const { data } = await apiClient.get<{ solicitacao: Solicitacao }>(`/solicitacoes/${id}`);
  return data.solicitacao;
}

export async function criarSolicitacao(dados: SolicitacaoFormData): Promise<Solicitacao> {
  const { data } = await apiClient.post<{ solicitacao: Solicitacao }>("/solicitacoes", dados);
  return data.solicitacao;
}

export async function atualizarSolicitacao(
  id: number,
  dados: SolicitacaoFormData
): Promise<Solicitacao> {
  const { data } = await apiClient.put<{ solicitacao: Solicitacao }>(`/solicitacoes/${id}`, dados);
  return data.solicitacao;
}

export async function excluirSolicitacao(id: number): Promise<void> {
  await apiClient.delete(`/solicitacoes/${id}`);
}

export async function alterarStatus(id: number, status: StatusSolicitacao): Promise<Solicitacao> {
  const { data } = await apiClient.patch<{ solicitacao: Solicitacao }>(
    `/solicitacoes/${id}/status`,
    { status }
  );
  return data.solicitacao;
}

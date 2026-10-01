import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

export interface ApiErrorResponse {
  message: string;
  errors?: { campo: string; mensagem: string }[];
}

export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.mensagem).join(" ");
    }
    if (data?.message) {
      return data.message;
    }
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

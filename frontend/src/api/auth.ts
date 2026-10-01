import { apiClient } from "./client";
import type { Usuario } from "../types";

export async function login(email: string, senha: string): Promise<Usuario> {
  const { data } = await apiClient.post<{ usuario: Usuario }>("/auth/login", { email, senha });
  return data.usuario;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function buscarUsuarioAtual(): Promise<Usuario> {
  const { data } = await apiClient.get<{ usuario: Usuario }>("/auth/me");
  return data.usuario;
}

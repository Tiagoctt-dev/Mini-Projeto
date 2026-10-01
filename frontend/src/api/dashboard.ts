import { apiClient } from "./client";
import type { Indicadores } from "../types";

export async function buscarIndicadores(): Promise<Indicadores> {
  const { data } = await apiClient.get<Indicadores>("/dashboard");
  return data;
}

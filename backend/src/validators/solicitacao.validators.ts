import { z } from "zod";

export const categoriaEnum = z.enum(["TI", "RH", "COMPRAS", "FINANCEIRO", "INFRAESTRUTURA"]);
export const statusEnum = z.enum(["ABERTO", "EM_ATENDIMENTO", "CONCLUIDO"]);

export const createSolicitacaoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "O título deve ter ao menos 3 caracteres.")
    .max(160, "O título deve ter no máximo 160 caracteres."),
  descricao: z
    .string()
    .trim()
    .min(10, "A descrição deve ter ao menos 10 caracteres.")
    .max(4000, "A descrição deve ter no máximo 4000 caracteres."),
  categoria: categoriaEnum,
});

export const updateSolicitacaoSchema = createSolicitacaoSchema;

export const changeStatusSchema = z.object({
  status: statusEnum,
});

export const listSolicitacoesQuerySchema = z.object({
  status: statusEnum.optional(),
  categoria: categoriaEnum.optional(),
  texto: z.string().trim().max(160).optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Id inválido."),
});

export type CreateSolicitacaoInput = z.infer<typeof createSolicitacaoSchema>;
export type ListSolicitacoesQuery = z.infer<typeof listSolicitacoesQuerySchema>;

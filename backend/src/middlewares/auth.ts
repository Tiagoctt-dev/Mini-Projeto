import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { AuthUser } from "../types/express";

const TOKEN_COOKIE = "portal_token";

export { TOKEN_COOKIE };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) {
    throw AppError.unauthorized("Você precisa estar autenticado para acessar este recurso.");
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = { id: payload.id, nome: payload.nome, email: payload.email };
    next();
  } catch {
    throw AppError.unauthorized("Sessão inválida ou expirada. Faça login novamente.");
  }
}

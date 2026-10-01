import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { LoginInput } from "../validators/auth.validators";

export async function login({ email, senha }: LoginInput) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw AppError.unauthorized("E-mail ou senha inválidos.");
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    throw AppError.unauthorized("E-mail ou senha inválidos.");
  }

  const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

  return { token, usuario: payload };
}

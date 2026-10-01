import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { login } from "../services/auth.service";
import { TOKEN_COOKIE } from "../middlewares/auth";
import { isProduction } from "../config/env";

const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas, alinhado ao JWT_EXPIRES_IN padrão

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const { token, usuario } = await login(req.body);

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });

  res.json({ usuario });
});

export const postLogout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(TOKEN_COOKIE);
  res.status(204).send();
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ usuario: req.user });
});

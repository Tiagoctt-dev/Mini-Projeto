import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { obterIndicadores } from "../services/dashboard.service";

export const getIndicadores = asyncHandler(async (_req: Request, res: Response) => {
  const indicadores = await obterIndicadores();
  res.json(indicadores);
});

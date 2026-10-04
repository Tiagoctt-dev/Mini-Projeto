import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

const OITO_HORAS_EM_SEGUNDOS = 8 * 60 * 60;

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  // Fonte única da duração da sessão: usada tanto para assinar o JWT quanto
  // para o maxAge do cookie (ver auth.service.ts e auth.controller.ts),
  // evitando que as duas durações fiquem dessincronizadas.
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? OITO_HORAS_EM_SEGUNDOS),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};

export const isProduction = env.nodeEnv === "production";

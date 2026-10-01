export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }

  static notFound(message = "Recurso não encontrado") {
    return new AppError(message, 404);
  }

  static unauthorized(message = "Não autenticado") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Operação não permitida") {
    return new AppError(message, 403);
  }

  static conflict(message = "Conflito de dados") {
    return new AppError(message, 409);
  }
}

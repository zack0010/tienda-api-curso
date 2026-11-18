import type { ErrorRequestHandler, RequestHandler } from 'express';

/**
 * Error de negocio con su código HTTP. El manejador de errores lo convierte en
 * una respuesta { error: { code, message, details? } }.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `No existe la ruta ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details === undefined ? {} : { details: err.details }),
      },
    });
    return;
  }

  // Cuerpo JSON mal formado: lo detecta express.json()
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es un JSON válido' },
    });
    return;
  }

  console.error(err);
  res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
};

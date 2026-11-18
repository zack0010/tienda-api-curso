import type { Request, RequestHandler } from 'express';
import { AppError } from '../shared/errors.ts';
import { findUserById } from './repository.ts';
import { verifyToken } from './token.ts';

/** Exige la cabecera `Authorization: Bearer <token>` y guarda el usuario en req.userId. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Falta el token de acceso');
  }

  const userId = await verifyToken(token);
  if (userId === null || !findUserById(userId)) {
    throw new AppError(401, 'UNAUTHORIZED', 'El token no es válido o ha caducado');
  }

  req.userId = userId;
  next();
};

/** Usuario autenticado de la petición. Solo en rutas protegidas con requireAuth. */
export function currentUserId(req: Request): number {
  if (req.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Falta el token de acceso');
  }
  return req.userId;
}

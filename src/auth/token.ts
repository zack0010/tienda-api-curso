import { jwtVerify, SignJWT } from 'jose';
import { config } from '../config.ts';

const secret = new TextEncoder().encode(config.tokenSecret);

/** Token JWT (HS256) con el id del usuario en `sub`. Caduca según TOKEN_TTL_MINUTES. */
export async function createToken(userId: number): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${config.tokenTtlMinutes}m`)
    .sign(secret);
}

/** Devuelve el id del usuario, o null si el token no es válido o ha caducado. */
export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    return Number.isInteger(userId) ? userId : null;
  } catch {
    return null;
  }
}

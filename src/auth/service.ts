import { AppError } from '../shared/errors.ts';
import { verifyPassword } from './password.ts';
import { findUserByEmail } from './repository.ts';
import { createToken } from './token.ts';

export async function login(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }
  return {
    token: await createToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

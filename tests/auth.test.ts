import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/auth/password.ts';
import { ANA, api, authHeader } from './helpers.ts';

describe('POST /api/auth/login', () => {
  it('devuelve un token y el usuario con credenciales correctas', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'ana@tienda.test', password: 'ana-1234' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: ANA, name: 'Ana García', email: 'ana@tienda.test' });
  });

  it('no distingue mayúsculas en el email', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'ANA@tienda.test', password: 'ana-1234' });

    expect(res.status).toBe(200);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'ana@tienda.test', password: 'otra' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rechaza un email que no existe', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'nadie@tienda.test', password: 'ana-1234' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('valida los datos de entrada', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'no-es-un-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toEqual([
      'email',
      'password',
    ]);
  });
});

describe('rutas protegidas', () => {
  it('responden 401 sin token', async () => {
    const res = await api().get('/api/cart');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('responden 401 con un token no válido', async () => {
    const res = await api().get('/api/cart').set('Authorization', 'Bearer no-es-un-token');

    expect(res.status).toBe(401);
  });

  it('aceptan el token del login', async () => {
    const login = await api()
      .post('/api/auth/login')
      .send({ email: 'luis@tienda.test', password: 'luis-1234' });

    const res = await api().get('/api/cart').set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
  });

  it('aceptan un token generado para el usuario', async () => {
    const res = await api()
      .get('/api/cart')
      .set(await authHeader(ANA));

    expect(res.status).toBe(200);
  });
});

describe('contraseñas', () => {
  it('verifica una contraseña contra su hash', () => {
    const hash = hashPassword('secreta');

    expect(verifyPassword('secreta', hash)).toBe(true);
    expect(verifyPassword('otra', hash)).toBe(false);
  });

  it('rechaza un hash con formato desconocido', () => {
    expect(verifyPassword('secreta', 'md5$abc')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { api } from './helpers.ts';

describe('app', () => {
  it('GET /api/health responde ok', async () => {
    const res = await api().get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('responde 404 en una ruta que no existe', async () => {
    const res = await api().get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('responde 400 si el cuerpo no es un JSON válido', async () => {
    const res = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

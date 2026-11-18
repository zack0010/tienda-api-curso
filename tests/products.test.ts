import { describe, expect, it } from 'vitest';
import { api } from './helpers.ts';

describe('GET /api/products', () => {
  it('devuelve el catálogo completo', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toEqual({
      id: 1,
      name: 'Teclado mecánico',
      category: 'electronica',
      priceCents: 8990,
      stock: 12,
    });
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto', async () => {
    const res = await api().get('/api/products/4');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cuaderno A5 de tapa dura');
  });

  it('responde 404 si no existe', async () => {
    const res = await api().get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si el id no es un número', async () => {
    const res = await api().get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

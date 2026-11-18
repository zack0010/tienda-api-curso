import { describe, expect, it } from 'vitest';
import { ANA, api, authHeader, createCoupon, LUIS } from './helpers.ts';

async function addToCart(userId: number, productId: number, quantity = 1) {
  return api()
    .post('/api/cart/items')
    .set(await authHeader(userId))
    .send({ productId, quantity });
}

describe('GET /api/cart', () => {
  it('empieza vacío', async () => {
    const res = await api()
      .get('/api/cart')
      .set(await authHeader(ANA));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: [],
      couponCode: null,
      subtotalCents: 0,
      discountCents: 0,
      totalCents: 0,
    });
  });

  it('cada usuario tiene su propio carrito', async () => {
    await addToCart(ANA, 1);

    const res = await api()
      .get('/api/cart')
      .set(await authHeader(LUIS));

    expect(res.body.items).toEqual([]);
  });
});

describe('POST /api/cart/items', () => {
  it('añade el producto y calcula los totales', async () => {
    const res = await addToCart(ANA, 4, 2);

    expect(res.status).toBe(201);
    expect(res.body.items).toEqual([
      {
        productId: 4,
        name: 'Cuaderno A5 de tapa dura',
        unitPriceCents: 1295,
        quantity: 2,
        lineTotalCents: 2590,
      },
    ]);
    expect(res.body.totalCents).toBe(2590);
  });

  it('suma unidades si el producto ya está en el carrito', async () => {
    await addToCart(ANA, 4, 2);
    const res = await addToCart(ANA, 4, 1);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it('usa 1 unidad si no se indica la cantidad', async () => {
    const res = await api()
      .post('/api/cart/items')
      .set(await authHeader(ANA))
      .send({ productId: 6 });

    expect(res.body.items[0].quantity).toBe(1);
  });

  it('responde 404 si el producto no existe', async () => {
    const res = await addToCart(ANA, 999);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si la cantidad no es válida', async () => {
    const res = await addToCart(ANA, 4, 0);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('no permite más de 99 unidades de un producto', async () => {
    await addToCart(ANA, 4, 60);
    const res = await addToCart(ANA, 4, 40);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('QUANTITY_LIMIT');
  });
});

describe('PATCH /api/cart/items/:productId', () => {
  it('cambia la cantidad', async () => {
    await addToCart(ANA, 2, 1);

    const res = await api()
      .patch('/api/cart/items/2')
      .set(await authHeader(ANA))
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(4);
    expect(res.body.subtotalCents).toBe(9980);
  });

  it('responde 404 si el producto no está en el carrito', async () => {
    const res = await api()
      .patch('/api/cart/items/2')
      .set(await authHeader(ANA))
      .send({ quantity: 4 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CART_ITEM_NOT_FOUND');
  });
});

describe('DELETE /api/cart/items/:productId', () => {
  it('quita el producto', async () => {
    await addToCart(ANA, 2);
    await addToCart(ANA, 6);

    const res = await api()
      .delete('/api/cart/items/2')
      .set(await authHeader(ANA));

    expect(res.status).toBe(200);
    expect(res.body.items.map((item: { productId: number }) => item.productId)).toEqual([6]);
  });

  it('responde 404 si el producto no está en el carrito', async () => {
    const res = await api()
      .delete('/api/cart/items/2')
      .set(await authHeader(ANA));

    expect(res.status).toBe(404);
  });
});

describe('cupones', () => {
  it('aplica un cupón de porcentaje', async () => {
    await addToCart(ANA, 7, 2);

    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'BIENVENIDA10' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      couponCode: 'BIENVENIDA10',
      subtotalCents: 6900,
      discountCents: 690,
      totalCents: 6210,
    });
  });

  it('no distingue mayúsculas en el código', async () => {
    await addToCart(ANA, 7);

    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'bienvenida10' });

    expect(res.body.couponCode).toBe('BIENVENIDA10');
  });

  it('responde 404 si el cupón no existe', async () => {
    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'NOEXISTE' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('COUPON_NOT_FOUND');
  });

  it('responde 422 si el cupón ha caducado', async () => {
    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'NAVIDAD2025' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('COUPON_EXPIRED');
  });

  it('acepta un cupón que todavía no ha caducado', async () => {
    createCoupon({ code: 'FUTURO', expiresAt: '2999-01-01T00:00:00.000Z' });
    await addToCart(ANA, 7);

    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'FUTURO' });

    expect(res.status).toBe(200);
  });

  it('responde 422 si no se llega al pedido mínimo', async () => {
    await addToCart(ANA, 4);

    const res = await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'DESCUENTO5' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('COUPON_MIN_SUBTOTAL');
    expect(res.body.error.message).toContain('30,00');
  });

  it('quita el cupón', async () => {
    await addToCart(ANA, 7);
    await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'BIENVENIDA10' });

    const res = await api()
      .delete('/api/cart/coupon')
      .set(await authHeader(ANA));

    expect(res.body.couponCode).toBeNull();
    expect(res.body.discountCents).toBe(0);
  });
});

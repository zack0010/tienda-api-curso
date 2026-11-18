import { describe, expect, it } from 'vitest';
import { db } from '../src/db/memory.ts';
import { ANA, api, authHeader, createProduct } from './helpers.ts';

async function addToCart(userId: number, productId: number, quantity = 1) {
  return api()
    .post('/api/cart/items')
    .set(await authHeader(userId))
    .send({ productId, quantity });
}

async function checkout(userId: number) {
  return api()
    .post('/api/orders')
    .set(await authHeader(userId));
}

describe('POST /api/orders', () => {
  it('crea el pedido con el contenido del carrito', async () => {
    await addToCart(ANA, 4, 2);
    await addToCart(ANA, 6, 1);

    const res = await checkout(ANA);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 4,
      userId: ANA,
      items: [
        { productId: 4, name: 'Cuaderno A5 de tapa dura', unitPriceCents: 1295, quantity: 2 },
        { productId: 6, name: 'Taza de cerámica', unitPriceCents: 995, quantity: 1 },
      ],
      subtotalCents: 3585,
      discountCents: 0,
      totalCents: 3585,
      couponCode: null,
      status: 'pending',
    });
  });

  it('guarda el descuento del cupón', async () => {
    await addToCart(ANA, 7, 2);
    await api()
      .post('/api/cart/coupon')
      .set(await authHeader(ANA))
      .send({ code: 'BIENVENIDA10' });

    const res = await checkout(ANA);

    expect(res.body).toMatchObject({
      couponCode: 'BIENVENIDA10',
      discountCents: 690,
      totalCents: 6210,
    });
  });

  it('descuenta el stock y vacía el carrito', async () => {
    const product = createProduct({ stock: 5 });
    await addToCart(ANA, product.id, 2);

    await checkout(ANA);

    expect(db.products.find((p) => p.id === product.id)?.stock).toBe(3);
    const cart = await api()
      .get('/api/cart')
      .set(await authHeader(ANA));
    expect(cart.body.items).toEqual([]);
  });

  it('responde 422 si el carrito está vacío', async () => {
    const res = await checkout(ANA);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('CART_EMPTY');
  });

  it('responde 409 si no hay stock y no cambia nada', async () => {
    const product = createProduct({ stock: 1 });
    await addToCart(ANA, 4, 1);
    await addToCart(ANA, product.id, 2);

    const res = await checkout(ANA);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
    expect(db.products.find((p) => p.id === 4)?.stock).toBe(50);
    const cart = await api()
      .get('/api/cart')
      .set(await authHeader(ANA));
    expect(cart.body.items).toHaveLength(2);
  });
});

describe('GET /api/orders', () => {
  it('devuelve los pedidos del usuario, del más reciente al más antiguo', async () => {
    const res = await api()
      .get('/api/orders')
      .set(await authHeader(ANA));

    expect(res.status).toBe(200);
    expect(res.body.map((order: { id: number }) => order.id)).toEqual([3, 1]);
  });
});

describe('GET /api/orders/:id', () => {
  it('devuelve el pedido', async () => {
    const res = await api()
      .get('/api/orders/1')
      .set(await authHeader(ANA));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, status: 'delivered', totalCents: 8990 });
  });

  it('responde 404 si no existe', async () => {
    const res = await api()
      .get('/api/orders/999')
      .set(await authHeader(ANA));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
  });
});

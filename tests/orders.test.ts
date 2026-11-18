import { describe, expect, it } from 'vitest';
import { db } from '../src/db/memory.ts';
import { ANA, LUIS, api, authHeader, createProduct } from './helpers.ts';

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

async function cancel(userId: number, orderId: number | string) {
  return api()
    .post(`/api/orders/${orderId}/cancel`)
    .set(await authHeader(userId));
}

function stockOf(productId: number) {
  return db.products.find((p) => p.id === productId)?.stock;
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

describe('POST /api/orders/:id/cancel', () => {
  it('cancela el pedido pendiente y responde con el pedido actualizado', async () => {
    await addToCart(ANA, 4, 2);
    const order = (await checkout(ANA)).body;

    const res = await cancel(ANA, order.id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...order, status: 'cancelled' });
    const stored = await api()
      .get(`/api/orders/${order.id}`)
      .set(await authHeader(ANA));
    expect(stored.body.status).toBe('cancelled');
  });

  it('devuelve al stock las unidades de cada producto', async () => {
    const lamp = createProduct({ stock: 5 });
    const mug = createProduct({ stock: 4 });
    await addToCart(ANA, lamp.id, 2);
    await addToCart(ANA, mug.id, 3);
    const order = (await checkout(ANA)).body;
    expect([stockOf(lamp.id), stockOf(mug.id)]).toEqual([3, 1]);

    await cancel(ANA, order.id);

    expect([stockOf(lamp.id), stockOf(mug.id)]).toEqual([5, 4]);
  });

  it.each([
    { id: 1, status: 'delivered' },
    { id: 3, status: 'shipped' },
  ])('responde 409 si el pedido está $status y no cambia nada', async ({ id, status }) => {
    const productId = db.orders.find((order) => order.id === id)!.items[0]!.productId;
    const stockBefore = stockOf(productId);

    const res = await cancel(ANA, id);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ORDER_NOT_CANCELLABLE');
    expect(db.orders.find((order) => order.id === id)?.status).toBe(status);
    expect(stockOf(productId)).toBe(stockBefore);
  });

  it('responde 409 si el pedido ya está cancelado y no devuelve el stock dos veces', async () => {
    const product = createProduct({ stock: 5 });
    await addToCart(ANA, product.id, 2);
    const order = (await checkout(ANA)).body;
    await cancel(ANA, order.id);

    const res = await cancel(ANA, order.id);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ORDER_NOT_CANCELLABLE');
    expect(stockOf(product.id)).toBe(5);
  });

  it('responde 404 si no existe', async () => {
    const res = await cancel(ANA, 999);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('responde 404 si el pedido es de otro usuario y no lo cancela', async () => {
    // El pedido 2 del seed es de Luis y está pendiente
    const res = await cancel(ANA, 2);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    expect(db.orders.find((order) => order.id === 2)?.status).toBe('pending');

    const own = await cancel(LUIS, 2);
    expect(own.status).toBe(200);
    expect(own.body.status).toBe('cancelled');
  });

  it('responde 400 si el id no es válido', async () => {
    const res = await cancel(ANA, 'abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

import request from 'supertest';
import { createApp } from '../src/app.ts';
import { createToken } from '../src/auth/token.ts';
import { db } from '../src/db/memory.ts';
import type { Coupon, Product } from '../src/db/schema.ts';

const app = createApp();

/** Usuarios de src/db/seed.ts */
export const ANA = 1;
export const LUIS = 2;

/** Cliente HTTP contra la app, sin levantar el servidor. */
export function api() {
  return request(app);
}

/** Cabecera Authorization con un token válido para el usuario. */
export async function authHeader(userId: number) {
  return { Authorization: `Bearer ${await createToken(userId)}` };
}

/** Añade un producto solo para el test actual (la base de datos se reinicia en cada test). */
export function createProduct(data: Partial<Omit<Product, 'id'>> = {}): Product {
  const product: Product = {
    id: Math.max(...db.products.map((p) => p.id)) + 1,
    name: 'Producto de prueba',
    category: 'pruebas',
    priceCents: 1000,
    stock: 10,
    ...data,
  };
  db.products.push(product);
  return product;
}

/** Añade un cupón solo para el test actual. */
export function createCoupon(data: Partial<Coupon> & Pick<Coupon, 'code'>): Coupon {
  const coupon: Coupon = {
    type: 'percent',
    value: 10,
    minSubtotalCents: 0,
    expiresAt: null,
    ...data,
  };
  db.coupons.push(coupon);
  return coupon;
}

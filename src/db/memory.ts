import type { Cart, Coupon, Order, Product, User } from './schema.ts';
import * as seed from './seed.ts';

// Base de datos en memoria: se pierde al reiniciar el servidor.
// Solo los repositorios (src/*/repository.ts) acceden a ella.

interface Database {
  users: User[];
  products: Product[];
  coupons: Coupon[];
  carts: Map<number, Cart>;
  orders: Order[];
  nextOrderId: number;
}

function createDatabase(): Database {
  const orders = structuredClone(seed.orders);
  return {
    users: structuredClone(seed.users),
    products: structuredClone(seed.products),
    coupons: structuredClone(seed.coupons),
    carts: new Map(),
    orders,
    nextOrderId: Math.max(0, ...orders.map((order) => order.id)) + 1,
  };
}

export const db: Database = createDatabase();

/** Vuelve a los datos iniciales. Los tests lo llaman antes de cada caso. */
export function resetDatabase(): void {
  Object.assign(db, createDatabase());
}

import { db } from '../db/memory.ts';
import type { Cart } from '../db/schema.ts';

/** Carrito del usuario. Si no tiene, lo crea vacío. */
export function getOrCreateCart(userId: number): Cart {
  let cart = db.carts.get(userId);
  if (!cart) {
    cart = { userId, items: [], couponCode: null };
    db.carts.set(userId, cart);
  }
  return cart;
}

export function clearCart(userId: number): void {
  db.carts.delete(userId);
}

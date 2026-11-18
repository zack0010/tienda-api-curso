import { validateCoupon } from '../coupons/service.ts';
import { findCouponByCode } from '../coupons/repository.ts';
import type { Cart } from '../db/schema.ts';
import { getProduct } from '../products/service.ts';
import { AppError } from '../shared/errors.ts';
import { clearCart, getOrCreateCart } from './repository.ts';
import { calculateTotals, type Totals } from './total.ts';

const MAX_QUANTITY_PER_PRODUCT = 99;

export interface CartLine {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface CartView extends Totals {
  items: CartLine[];
  couponCode: string | null;
}

function toView(cart: Cart): CartView {
  const items = cart.items.map((item) => {
    const product = getProduct(item.productId);
    return {
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
      lineTotalCents: product.priceCents * item.quantity,
    };
  });
  const coupon = cart.couponCode ? (findCouponByCode(cart.couponCode) ?? null) : null;
  return { items, couponCode: cart.couponCode, ...calculateTotals(items, coupon) };
}

function findItem(cart: Cart, productId: number) {
  const item = cart.items.find((line) => line.productId === productId);
  if (!item) {
    throw new AppError(
      404,
      'CART_ITEM_NOT_FOUND',
      `El producto ${productId} no está en el carrito`,
    );
  }
  return item;
}

export function getCart(userId: number): CartView {
  return toView(getOrCreateCart(userId));
}

export function addItem(userId: number, productId: number, quantity: number): CartView {
  getProduct(productId);
  const cart = getOrCreateCart(userId);
  const existing = cart.items.find((line) => line.productId === productId);
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (newQuantity > MAX_QUANTITY_PER_PRODUCT) {
    throw new AppError(
      422,
      'QUANTITY_LIMIT',
      `No se pueden añadir más de ${MAX_QUANTITY_PER_PRODUCT} unidades de un producto`,
    );
  }
  if (existing) {
    existing.quantity = newQuantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  return toView(cart);
}

export function updateItemQuantity(userId: number, productId: number, quantity: number): CartView {
  const cart = getOrCreateCart(userId);
  findItem(cart, productId).quantity = quantity;
  return toView(cart);
}

export function removeItem(userId: number, productId: number): CartView {
  const cart = getOrCreateCart(userId);
  const item = findItem(cart, productId);
  cart.items = cart.items.filter((line) => line !== item);
  return toView(cart);
}

export function applyCoupon(userId: number, code: string): CartView {
  const cart = getOrCreateCart(userId);
  const coupon = validateCoupon(code, toView(cart).subtotalCents);
  cart.couponCode = coupon.code;
  return toView(cart);
}

export function removeCoupon(userId: number): CartView {
  const cart = getOrCreateCart(userId);
  cart.couponCode = null;
  return toView(cart);
}

export function emptyCart(userId: number): void {
  clearCart(userId);
}

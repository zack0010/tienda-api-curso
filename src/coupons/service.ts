import type { Coupon } from '../db/schema.ts';
import { AppError } from '../shared/errors.ts';
import { formatEuros } from '../shared/money.ts';
import { findCouponByCode } from './repository.ts';

/** Comprueba que el cupón existe, no ha caducado y se cumple su pedido mínimo. */
export function validateCoupon(code: string, subtotalCents: number, now = new Date()): Coupon {
  const coupon = findCouponByCode(code);
  if (!coupon) {
    throw new AppError(404, 'COUPON_NOT_FOUND', `El cupón ${code} no existe`);
  }
  if (coupon.expiresAt !== null && new Date(coupon.expiresAt) <= now) {
    throw new AppError(422, 'COUPON_EXPIRED', `El cupón ${coupon.code} ha caducado`);
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    throw new AppError(
      422,
      'COUPON_MIN_SUBTOTAL',
      `El cupón ${coupon.code} necesita un pedido mínimo de ${formatEuros(coupon.minSubtotalCents)}`,
    );
  }
  return coupon;
}

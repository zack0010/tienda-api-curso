import { db } from '../db/memory.ts';
import type { Coupon } from '../db/schema.ts';

export function findCouponByCode(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return db.coupons.find((coupon) => coupon.code === normalized);
}

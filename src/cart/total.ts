import type { Coupon } from '../db/schema.ts';

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

/** Calcula subtotal, descuento del cupón y total. Se usa en el carrito y al crear el pedido. */
export function calculateTotals(lines: PricedLine[], coupon: Coupon | null): Totals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  // El descuento nunca supera el subtotal: el total no puede quedar en negativo.
  const discountCents = coupon ? Math.min(couponDiscount(coupon, subtotalCents), subtotalCents) : 0;
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}

function couponDiscount(coupon: Coupon, subtotalCents: number): number {
  if (subtotalCents < coupon.minSubtotalCents) return 0;
  if (coupon.type === 'percent') {
    return Math.round((subtotalCents * coupon.value) / 100);
  }
  return coupon.value;
}

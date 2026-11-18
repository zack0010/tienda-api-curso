import { describe, expect, it } from 'vitest';
import { calculateTotals } from '../src/cart/total.ts';
import type { Coupon } from '../src/db/schema.ts';

const coupon = (data: Partial<Coupon>): Coupon => ({
  code: 'TEST',
  type: 'percent',
  value: 10,
  minSubtotalCents: 0,
  expiresAt: null,
  ...data,
});

describe('calculateTotals', () => {
  it('devuelve ceros con el carrito vacío', () => {
    expect(calculateTotals([], null)).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      totalCents: 0,
    });
  });

  it('suma precio por cantidad de cada línea', () => {
    const totals = calculateTotals(
      [
        { unitPriceCents: 1295, quantity: 2 },
        { unitPriceCents: 995, quantity: 1 },
      ],
      null,
    );

    expect(totals).toEqual({ subtotalCents: 3585, discountCents: 0, totalCents: 3585 });
  });

  it('redondea al céntimo el descuento de porcentaje', () => {
    const totals = calculateTotals([{ unitPriceCents: 995, quantity: 3 }], coupon({ value: 10 }));

    // 10 % de 29,85 € = 2,985 € → 2,99 €
    expect(totals).toEqual({ subtotalCents: 2985, discountCents: 299, totalCents: 2686 });
  });

  it('resta el importe de un cupón fijo', () => {
    const totals = calculateTotals(
      [{ unitPriceCents: 4200, quantity: 1 }],
      coupon({ type: 'fixed', value: 500 }),
    );

    expect(totals).toEqual({ subtotalCents: 4200, discountCents: 500, totalCents: 3700 });
  });

  it('limita el descuento de un cupón fijo al subtotal', () => {
    const totals = calculateTotals(
      [{ unitPriceCents: 1295, quantity: 1 }],
      coupon({ type: 'fixed', value: 2500 }),
    );

    expect(totals).toEqual({ subtotalCents: 1295, discountCents: 1295, totalCents: 0 });
  });

  it('no descuenta nada si no se llega al pedido mínimo', () => {
    const totals = calculateTotals(
      [{ unitPriceCents: 1295, quantity: 1 }],
      coupon({ type: 'fixed', value: 500, minSubtotalCents: 3000 }),
    );

    expect(totals).toEqual({ subtotalCents: 1295, discountCents: 0, totalCents: 1295 });
  });
});

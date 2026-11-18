const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

/** 1295 → "12,95 €" */
export function formatEuros(cents: number): string {
  return euros.format(cents / 100);
}

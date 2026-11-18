import type { Coupon, Order, Product, User } from './schema.ts';

// Datos iniciales. Contraseñas de los usuarios de prueba: ana-1234 y luis-1234.

export const users: User[] = [
  {
    id: 1,
    email: 'ana@tienda.test',
    name: 'Ana García',
    passwordHash:
      'scrypt$79344bd9505bc7f19a16de366fa23538$4a54fdbec32cb6f5d8a33fa913de5772982ad803de6a45f28f606657fa2226e7',
  },
  {
    id: 2,
    email: 'luis@tienda.test',
    name: 'Luis Martín',
    passwordHash:
      'scrypt$4b3a4b9f753b6729e5d52a201d01e53a$5dbfbb8fd2e2437b49a2a5a6de0dcb50152ad2681c55127801dcdd75734a533f',
  },
];

export const products: Product[] = [
  { id: 1, name: 'Teclado mecánico', category: 'electronica', priceCents: 8990, stock: 12 },
  { id: 2, name: 'Ratón inalámbrico', category: 'electronica', priceCents: 2495, stock: 30 },
  {
    id: 3,
    name: 'Auriculares con cancelación de ruido',
    category: 'electronica',
    priceCents: 12900,
    stock: 3,
  },
  { id: 4, name: 'Cuaderno A5 de tapa dura', category: 'papeleria', priceCents: 1295, stock: 50 },
  { id: 5, name: 'Bolígrafos de gel (10 uds.)', category: 'papeleria', priceCents: 790, stock: 0 },
  { id: 6, name: 'Taza de cerámica', category: 'hogar', priceCents: 995, stock: 25 },
  { id: 7, name: 'Lámpara de escritorio LED', category: 'hogar', priceCents: 3450, stock: 8 },
  { id: 8, name: 'Libro: Refactoring', category: 'libros', priceCents: 4200, stock: 5 },
];

export const coupons: Coupon[] = [
  { code: 'BIENVENIDA10', type: 'percent', value: 10, minSubtotalCents: 0, expiresAt: null },
  { code: 'DESCUENTO5', type: 'fixed', value: 500, minSubtotalCents: 3000, expiresAt: null },
  // Tarjeta regalo: descuento fijo sin pedido mínimo
  { code: 'REGALO25', type: 'fixed', value: 2500, minSubtotalCents: 0, expiresAt: null },
  {
    code: 'NAVIDAD2025',
    type: 'percent',
    value: 15,
    minSubtotalCents: 0,
    expiresAt: '2026-01-07T00:00:00.000Z',
  },
];

export const orders: Order[] = [
  {
    id: 1,
    userId: 1,
    items: [{ productId: 1, name: 'Teclado mecánico', unitPriceCents: 8990, quantity: 1 }],
    subtotalCents: 8990,
    discountCents: 0,
    totalCents: 8990,
    couponCode: null,
    status: 'delivered',
    createdAt: '2026-10-02T10:15:00.000Z',
  },
  {
    id: 2,
    userId: 2,
    items: [
      { productId: 2, name: 'Ratón inalámbrico', unitPriceCents: 2495, quantity: 2 },
      { productId: 6, name: 'Taza de cerámica', unitPriceCents: 995, quantity: 1 },
    ],
    subtotalCents: 5985,
    discountCents: 599,
    totalCents: 5386,
    couponCode: 'BIENVENIDA10',
    status: 'pending',
    createdAt: '2026-11-03T18:40:00.000Z',
  },
  {
    id: 3,
    userId: 1,
    items: [{ productId: 8, name: 'Libro: Refactoring', unitPriceCents: 4200, quantity: 1 }],
    subtotalCents: 4200,
    discountCents: 0,
    totalCents: 4200,
    couponCode: null,
    status: 'shipped',
    createdAt: '2026-11-05T09:05:00.000Z',
  },
];

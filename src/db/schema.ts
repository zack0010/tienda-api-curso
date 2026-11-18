// Entidades que guarda la base de datos en memoria.
// Todos los importes van en céntimos (enteros) para evitar errores de redondeo.

export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  /** Porcentaje (0-100) si type es 'percent'; céntimos si es 'fixed'. */
  value: number;
  minSubtotalCents: number;
  /** Fecha ISO a partir de la cual el cupón deja de valer. null: no caduca. */
  expiresAt: string | null;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  userId: number;
  items: CartItem[];
  couponCode: string | null;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  couponCode: string | null;
  status: OrderStatus;
  createdAt: string;
}

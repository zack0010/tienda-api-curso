import { db } from '../db/memory.ts';
import type { Order } from '../db/schema.ts';

export function insertOrder(data: Omit<Order, 'id'>): Order {
  const order: Order = { id: db.nextOrderId++, ...data };
  db.orders.push(order);
  return order;
}

/** Pedidos del usuario, del más reciente al más antiguo. */
export function findOrdersByUser(userId: number): Order[] {
  return db.orders.filter((order) => order.userId === userId).sort((a, b) => b.id - a.id);
}

export function findOrderById(id: number): Order | undefined {
  return db.orders.find((order) => order.id === id);
}

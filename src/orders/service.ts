import { emptyCart, getCart } from '../cart/service.ts';
import type { Order } from '../db/schema.ts';
import { findProductById, updateStock } from '../products/repository.ts';
import { getProduct } from '../products/service.ts';
import { AppError } from '../shared/errors.ts';
import { findOrderById, findOrdersByUser, insertOrder, updateOrderStatus } from './repository.ts';

/** Crea un pedido con el contenido del carrito, descuenta el stock y vacía el carrito. */
export function checkout(userId: number): Order {
  const cart = getCart(userId);
  if (cart.items.length === 0) {
    throw new AppError(422, 'CART_EMPTY', 'El carrito está vacío');
  }

  for (const line of cart.items) {
    const product = getProduct(line.productId);
    if (product.stock < line.quantity) {
      throw new AppError(
        409,
        'OUT_OF_STOCK',
        `No hay stock suficiente de «${product.name}» (quedan ${product.stock})`,
      );
    }
  }

  for (const line of cart.items) {
    const product = getProduct(line.productId);
    updateStock(product.id, product.stock - line.quantity);
  }

  const order = insertOrder({
    userId,
    items: cart.items.map(({ productId, name, unitPriceCents, quantity }) => ({
      productId,
      name,
      unitPriceCents,
      quantity,
    })),
    subtotalCents: cart.subtotalCents,
    discountCents: cart.discountCents,
    totalCents: cart.totalCents,
    couponCode: cart.couponCode,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  emptyCart(userId);
  return order;
}

export function listOrders(userId: number): Order[] {
  return findOrdersByUser(userId);
}

export function getOrder(orderId: number): Order {
  const order = findOrderById(orderId);
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', `No existe el pedido ${orderId}`);
  }
  return order;
}

/**
 * Cancela un pedido del usuario que todavía no se ha enviado y devuelve sus
 * unidades al stock. Los pedidos de otros usuarios se tratan como inexistentes.
 */
export function cancelOrder(userId: number, orderId: number): Order {
  const order = findOrderById(orderId);
  if (!order || order.userId !== userId) {
    throw new AppError(404, 'ORDER_NOT_FOUND', `No existe el pedido ${orderId}`);
  }
  if (order.status !== 'pending') {
    throw new AppError(
      409,
      'ORDER_NOT_CANCELLABLE',
      `El pedido ${orderId} no se puede cancelar porque su estado es «${order.status}»`,
    );
  }

  for (const item of order.items) {
    const product = findProductById(item.productId);
    if (product) updateStock(product.id, product.stock + item.quantity);
  }

  updateOrderStatus(order.id, 'cancelled');
  return order;
}

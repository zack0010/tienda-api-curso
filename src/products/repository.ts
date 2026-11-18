import { db } from '../db/memory.ts';
import type { Product } from '../db/schema.ts';

export function findAllProducts(): Product[] {
  return db.products;
}

export function findProductById(id: number): Product | undefined {
  return db.products.find((product) => product.id === id);
}

export function updateStock(productId: number, stock: number): void {
  const product = findProductById(productId);
  if (product) product.stock = stock;
}

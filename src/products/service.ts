import type { Product } from '../db/schema.ts';
import { AppError } from '../shared/errors.ts';
import { findAllProducts, findProductById } from './repository.ts';

export function listProducts(): Product[] {
  return findAllProducts();
}

export function getProduct(id: number): Product {
  const product = findProductById(id);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', `No existe el producto ${id}`);
  }
  return product;
}

import { z } from 'zod';

const quantity = z.number().int().min(1).max(99);

export const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: quantity.default(1),
});

export const updateItemSchema = z.object({
  quantity,
});

export const productIdParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1),
});

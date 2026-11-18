import express from 'express';
import { currentUserId } from '../auth/middleware.ts';
import { parse } from '../shared/validation.ts';
import {
  addItemSchema,
  applyCouponSchema,
  productIdParamsSchema,
  updateItemSchema,
} from './schemas.ts';
import {
  addItem,
  applyCoupon,
  getCart,
  removeCoupon,
  removeItem,
  updateItemQuantity,
} from './service.ts';

// Todas las rutas requieren autenticación (ver app.ts)
export const cartRouter = express.Router();

cartRouter.get('/', (req, res) => {
  res.json(getCart(currentUserId(req)));
});

cartRouter.post('/items', (req, res) => {
  const { productId, quantity } = parse(addItemSchema, req.body);
  res.status(201).json(addItem(currentUserId(req), productId, quantity));
});

cartRouter.patch('/items/:productId', (req, res) => {
  const { productId } = parse(productIdParamsSchema, req.params);
  const { quantity } = parse(updateItemSchema, req.body);
  res.json(updateItemQuantity(currentUserId(req), productId, quantity));
});

cartRouter.delete('/items/:productId', (req, res) => {
  const { productId } = parse(productIdParamsSchema, req.params);
  res.json(removeItem(currentUserId(req), productId));
});

cartRouter.post('/coupon', (req, res) => {
  const { code } = parse(applyCouponSchema, req.body);
  res.json(applyCoupon(currentUserId(req), code));
});

cartRouter.delete('/coupon', (req, res) => {
  res.json(removeCoupon(currentUserId(req)));
});

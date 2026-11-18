import express from 'express';
import { currentUserId } from '../auth/middleware.ts';
import { idParamsSchema, parse } from '../shared/validation.ts';
import { cancelOrder, checkout, getOrder, listOrders } from './service.ts';

// Todas las rutas requieren autenticación (ver app.ts)
export const ordersRouter = express.Router();

ordersRouter.get('/', (req, res) => {
  res.json(listOrders(currentUserId(req)));
});

ordersRouter.get('/:id', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(getOrder(id));
});

ordersRouter.post('/', (req, res) => {
  res.status(201).json(checkout(currentUserId(req)));
});

ordersRouter.post('/:id/cancel', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(cancelOrder(currentUserId(req), id));
});

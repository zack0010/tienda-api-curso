import express from 'express';
import { idParamsSchema, parse } from '../shared/validation.ts';
import { getProduct, listProducts } from './service.ts';

export const productsRouter = express.Router();

productsRouter.get('/', (_req, res) => {
  res.json(listProducts());
});

productsRouter.get('/:id', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(getProduct(id));
});

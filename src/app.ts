import express from 'express';
import { z } from 'zod';
import { requireAuth } from './auth/middleware.ts';
import { authRouter } from './auth/routes.ts';
import { cartRouter } from './cart/routes.ts';
import { ordersRouter } from './orders/routes.ts';
import { productsRouter } from './products/routes.ts';
import { errorHandler, notFoundHandler } from './shared/errors.ts';

// Mensajes de validación de Zod en español
z.config(z.locales.es());

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/cart', requireAuth, cartRouter);
  app.use('/api/orders', requireAuth, ordersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

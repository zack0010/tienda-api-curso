import express from 'express';
import { parse } from '../shared/validation.ts';
import { loginSchema } from './schemas.ts';
import { login } from './service.ts';

export const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);
  res.json(await login(email, password));
});

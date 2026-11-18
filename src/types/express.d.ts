declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado. Lo rellena el middleware requireAuth. */
      userId?: number;
    }
  }
}

export {};

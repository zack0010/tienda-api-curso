import { beforeEach } from 'vitest';
import { resetDatabase } from '../src/db/memory.ts';

// Cada test empieza con los datos iniciales de src/db/seed.ts
beforeEach(() => {
  resetDatabase();
});

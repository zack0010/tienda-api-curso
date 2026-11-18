import { db } from '../db/memory.ts';
import type { User } from '../db/schema.ts';

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return db.users.find((user) => user.email === normalized);
}

export function findUserById(id: number): User | undefined {
  return db.users.find((user) => user.id === id);
}

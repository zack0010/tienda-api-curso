import { z } from 'zod';
import { AppError } from './errors.ts';

/** Valida `data` con el esquema. Si no es válido, lanza un error 400 con el detalle. */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos', details);
  }
  return result.data;
}

/** Parámetro `:id` numérico de las rutas. */
export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

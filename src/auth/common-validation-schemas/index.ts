import { z } from 'zod';

export const passwordShema = z
  .string()
  .min(5, { message: 'Минимальное количество символов: 5' });

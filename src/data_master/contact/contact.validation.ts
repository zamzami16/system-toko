import { ZodType, z } from 'zod';

export class ContactValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().min(1),
    alamat: z.string().min(1).optional(),
    email: z.string().email().min(1).optional(),
    no_hp: z.string().min(8).optional(),
  });
}

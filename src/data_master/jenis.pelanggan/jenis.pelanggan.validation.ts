import { ZodType, z } from 'zod';

export class JenisPelangganValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().trim().min(1),
    isDefault: z.boolean().default(false),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    nama: z.string().trim().min(1),
    isDefault: z.boolean().default(false),
  });

  static readonly SEARCH: ZodType = z.object({
    nama: z.string().optional(),
    isDefault: z.boolean().optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });
}

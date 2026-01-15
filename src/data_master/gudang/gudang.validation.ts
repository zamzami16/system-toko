import { z } from 'zod';

export class GudangValidation {
  static readonly CREATE = z.object({
    nama: z.string().min(1),
    alamat: z.string().optional(),
    keterangan: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  static readonly UPDATE = z.object({
    id: z.number().positive(),
    nama: z.string().min(1).optional(),
    alamat: z.string().optional(),
    keterangan: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  static readonly SEARCH = z.object({
    nama: z.string().optional(),
    alamat: z.string().optional(),
    keterangan: z.string().optional(),
    isActive: z.boolean().optional(),
    page: z.number().min(1),
    size: z.number().min(1),
  });
}

import { JenisBarang } from '@prisma/client';
import { ZodType, z } from 'zod';

export class KategoriValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().min(1).max(200),
    jenis_barang: z.nativeEnum(JenisBarang),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    nama: z.string().min(1).max(200),
    jenis_barang: z.nativeEnum(JenisBarang),
  });

  static readonly SEARCH: ZodType = z.object({
    id: z.number().positive().optional(),
    nama: z.string().optional(),
    jenis_barang: z.nativeEnum(JenisBarang).optional(),
    page: z.number().positive().min(1),
    size: z.number().positive().min(1),
  });
}

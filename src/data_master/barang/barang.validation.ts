import { JenisBarang } from '@prisma/client';
import { ZodType, z } from 'zod';

export class BarangValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().min(1).max(500),
    jenisBarang: z.nativeEnum(JenisBarang),
    satuanId: z.number().positive(),
    kategoriId: z.number().positive(),
    subkategoriId: z.number().positive(),
    hpp: z.number().default(0),
    hargaBeliAkhir: z.number().default(0),
    hargaBeli_3: z.number().default(0),
    hargaJual_1: z.number().default(0),
    hargaJual_2: z.number().default(0),
    hargaJual_3: z.number().default(0),
    barcode: z.string().default('OTOMATIS').nullable(),
    expired: z.date().optional(),
    diskonRp: z.number().default(0),
    diskonPersen: z.number().default(0),
    jumlahStok: z.number().default(0),
    jumlahAwal: z.number().default(0),
    keterangan: z.string().default(''),
    isActive: z.boolean(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    nama: z.string().min(1).max(500),
    jenisBarang: z.nativeEnum(JenisBarang),
    satuanId: z.number().positive(),
    kategoriId: z.number().positive(),
    subkategoriId: z.number().positive(),
    hpp: z.number(),
    hargaBeliAkhir: z.number(),
    hargaBeli_3: z.number(),
    hargaJual_1: z.number(),
    hargaJual_2: z.number(),
    hargaJual_3: z.number(),
    barcode: z.string(),
    expired: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    diskonRp: z.number(),
    diskonPersen: z.number(),
    jumlahStok: z.number(),
    jumlahAwal: z.number(),
    keterangan: z.string().default(''),
    isActive: z.boolean(),
  });

  static readonly SEARCH: ZodType = z.object({
    id: z.number().min(0).optional(),
    nama: z.string().optional(),
    kategori: z.string().optional(),
    subkategori: z.string().optional(),
    satuan: z.string().optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });
}

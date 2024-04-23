import { JenisBarang } from '@prisma/client';
import { ZodType, z } from 'zod';

export class BarangValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().min(1).max(500),
    jenis_barang: z.nativeEnum(JenisBarang),
    satuan_id: z.number().positive(),
    kategori_id: z.number().positive(),
    subkategori_id: z.number().positive(),
    hpp: z.number().default(0),
    harga_beli_akhir: z.number().default(0),
    harga_beli_3: z.number().default(0),
    harga_jual_1: z.number().default(0),
    harga_jual_2: z.number().default(0),
    harga_jual_3: z.number().default(0),
    barcode: z.string().default('OTOMATIS').nullable(),
    expired: z.date().optional(),
    diskon_rp: z.number().default(0),
    diskon_persen: z.number().default(0),
    jumlah_stok: z.number().default(0),
    jumlah_awal: z.number().default(0),
    keterangan: z.string().default(''),
    is_active: z.boolean(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    nama: z.string().min(1).max(500),
    jenis_barang: z.nativeEnum(JenisBarang),
    satuan_id: z.number().positive(),
    kategori_id: z.number().positive(),
    subkategori_id: z.number().positive(),
    hpp: z.number(),
    harga_beli_akhir: z.number(),
    harga_beli_3: z.number(),
    harga_jual_1: z.number(),
    harga_jual_2: z.number(),
    harga_jual_3: z.number(),
    barcode: z.string(),
    expired: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    diskon_rp: z.number(),
    diskon_persen: z.number(),
    jumlah_stok: z.number(),
    jumlah_awal: z.number(),
    keterangan: z.string().default(''),
    is_active: z.boolean(),
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

import { JenisBarang } from '@prisma/client';
import { z } from 'zod';

export const CreateDetailSatuanSchema = z.object({
  satuanId: z.number().positive(),
  amount: z.number().positive(),
});

export const UpdateDetailSatuanSchema = z.object({
  barangId: z.number().positive(),
  satuanId: z.number().positive(),
  amount: z.number().positive(),
});

export const CreateDetailGudangSchema = z.object({
  satuanId: z.number().positive(),
  gudangId: z.number().positive(),
  jumlah: z.number().positive(),
});

const uniqueDetailSatuan = (details: { satuanId: any; amount: any }[]) => {
  const uniqueItems = new Set(
    details.map(({ satuanId, amount }) => `${satuanId}-${amount}`),
  );
  return uniqueItems.size === details.length;
};

const hasOneDefaultDetailSatuan = (data: any, ctx: any) => {
  const hasCorrectAmount = data.detailSatuans.filter(
    (item: { satuanId: any; amount: number }) =>
      item.satuanId === data.satuanId && item.amount === 1,
  );

  if (hasCorrectAmount.length !== 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['detailSatuans'],
      message:
        'detailSatuans must contain exactly one item with satuanId equal to the main satuanId and amount = 1',
    });
  }
};

const validateUpdateDetailSatuanConditions = (data: any, ctx: any) => {
  hasOneDefaultDetailSatuan(data, ctx);

  const hasDifferentBarangId = data.detailSatuans.filter(
    (item: { barangId: any }) => item.barangId !== data.id,
  );

  if (hasDifferentBarangId.length !== 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['detailSatuans'],
      message: 'All detailSatuans must have the same barangId',
    });
  }
};

const uniqueDetailGudang = (
  details: { satuanId: number; gudangId: number }[],
) => {
  if (!details) {
    return true;
  }

  const uniqueItems = new Set(
    details.map(({ satuanId, gudangId }) => `${satuanId}-${gudangId}`),
  );
  return uniqueItems.size === details.length;
};

const detailGudangsShouldSameOnSatuanId = (data: any, ctx: any) => {
  const otherSatuanId = data.detailGudangs.filter(
    (item: { satuanId: number }) => item.satuanId !== data.satuanId,
  );

  if (otherSatuanId.length !== 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['detailGudangs'],
      message: 'All detailGudangs must have the same satuanId',
    });
  }
};

const validateCreateBarangConditions = (data: any, ctx: any) => {
  hasOneDefaultDetailSatuan(data, ctx);
  if (data.detailGudangs) {
    detailGudangsShouldSameOnSatuanId(data, ctx);
  }
};

export class BarangValidation {
  static readonly CREATE = z
    .object({
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
      supplierContactId: z.number().positive(),
      detailSatuans: z
        .array(CreateDetailSatuanSchema)
        .refine(uniqueDetailSatuan, {
          message:
            'Each item in detailSatuans must be unique based on satuanId and amount',
        }),
      detailGudangs: z
        .array(CreateDetailGudangSchema)
        .optional()
        .refine(uniqueDetailGudang, {
          message:
            'Each item in detailGudangs must be unique based on satuanId and gudangId',
        }),
    })
    .superRefine(validateCreateBarangConditions);

  static readonly UPDATE = z
    .object({
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
      supplierContactId: z.number().positive(),
      detailSatuans: z
        .array(UpdateDetailSatuanSchema)
        .refine(uniqueDetailSatuan, {
          message:
            'Each item in detailSatuans must be unique based on satuanId and amount',
        }),
    })
    .superRefine(validateUpdateDetailSatuanConditions);

  static readonly SEARCH = z.object({
    id: z.number().min(0).optional(),
    nama: z.string().optional(),
    kategori: z.string().optional(),
    subkategori: z.string().optional(),
    satuan: z.string().optional(),
    page: z.number().positive(),
    size: z.number().positive(),
    supplierContactId: z.number().positive().optional(),
  });
}

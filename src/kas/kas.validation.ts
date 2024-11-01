import { z } from 'zod';
import { TypeKas } from '../model/akun.model';

export class KasValidation {
  static readonly CREATE = z.object({
    nama: z.string().min(1),
    typeKas: z.nativeEnum(TypeKas),
    kodeAkunKartuKredit: z
      .string()
      .length(6)
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    nomorRekening: z
      .string()
      .min(1)
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    pemilik: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    saldoKas: z.number().default(0),
    keterangan: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
  });

  static readonly UPDATE = z.object({
    id: z.number().positive(),
    nama: z.string().min(1),
    kodeAkunKartuKredit: z
      .string()
      .length(6)
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    nomorRekening: z
      .string()
      .min(1)
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    pemilik: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    saldoKas: z.number().default(0),
    keterangan: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
  });

  static readonly DELETE = z.object({
    id: z.number().positive(),
  });
}

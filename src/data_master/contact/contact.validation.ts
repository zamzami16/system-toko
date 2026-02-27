import { z } from 'zod';

export class ContactValidation {
  static readonly CREATE = z.object({
    nama: z.string().min(1),
    alamat: z.string().min(1).optional(),
    email: z.string().email().min(1).optional(),
    noHp: z.string().min(8).optional(),
  });

  static readonly UPDATE = z.object({
    id: z.number().positive(),
    nama: z.string().min(1).optional(),
    alamat: z.string().min(1).optional(),
    email: z.string().email().min(1).optional(),
    noHp: z.string().min(8).optional(),
  });

  static readonly SEARCH = z.object({
    nama: z.string().min(1).optional(),
    alamat: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    noHp: z.string().min(1).optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });

  static readonly SEARCH_SCHEMA = z.object({
    nama: z.string().min(1).optional(),
    alamat: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    noHp: z.string().min(1).optional(),
    page: z.number().positive(),
    size: z.number().positive(),
  });
}

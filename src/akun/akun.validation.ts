import { StatusArusKas, TypeAkun } from '@prisma/client';
import { z } from 'zod';

export class AkunValidation {
  static readonly CREATE = z.object({
    kodeAkunInduk: z.string().length(6).optional(),
    nama: z.string().min(1),
    levelAkun: z.number().positive().default(0).optional(),
    saldoAwal: z.number().default(0),
    typeAkun: z.nativeEnum(TypeAkun),
    statusArusKas: z.nativeEnum(StatusArusKas),
    isActive: z.boolean().default(true),
  });
}

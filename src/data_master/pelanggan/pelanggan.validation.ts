import { ZodType, z } from 'zod';
import { ContactValidation } from '../contact/contact.validation';
import { JenisPajak } from '@prisma/client';

export class PelangganValidation {
  static readonly CREATE: ZodType = z.object({
    contactId: z.number().positive().optional(),
    contact: ContactValidation.CREATE.optional(),
    jenisPelangganId: z.number().positive(),
    isCanCredit: z.boolean().optional().default(false),
    saldoPiutang: z.number().optional().default(0),
    maxPiutang: z.number().optional().default(0),
    limitHariPiutang: z.number().optional().default(0),
    jatuhTempo: z.number().optional().default(0),
    jenisPajak: z.nativeEnum(JenisPajak).optional().default(JenisPajak.None),
  });

  static readonly UPDATE: ZodType = z.object({
    contactId: z.number().positive().optional(),
    jenisPelangganId: z.number().positive().optional(),
    isCanCredit: z.boolean().optional(),
    saldoPiutang: z.number().optional(),
    maxPiutang: z.number().optional(),
    limitHariPiutang: z.number().optional(),
    jatuhTempo: z.number().optional(),
    jenisPajak: z.nativeEnum(JenisPajak).optional(),
  });

  static readonly SEARCH: ZodType = ContactValidation.SEARCH_SCHEMA.extend({
    jenisPelanggan: z.string().optional(),
    isCanCredit: z.boolean().optional(),
    jenisPajak: z.nativeEnum(JenisPajak).optional(),
  });
}

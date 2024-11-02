import { ZodType, z } from 'zod';
import { ContactValidation } from '../contact/contact.validation';

export class SupplierValidation {
  static readonly CREATE: ZodType = z.object({
    contactId: z.number().positive().optional(),
    contact: ContactValidation.CREATE.optional(),
    saldoHutang: z.number().optional().default(0),
    maxHutang: z.number().optional().default(0),
    saldoAwalHutang: z.number().optional().default(0),
    jatuhTempo: z.number().optional().default(0),
  });

  static readonly UPDATE: ZodType = z.object({
    contactId: z.number().positive(),
    saldoHutang: z.number().optional(),
    maxHutang: z.number().optional(),
    saldoAwalHutang: z.number().optional(),
    jatuhTempo: z.number().optional(),
  });

  static readonly SEARCH: ZodType = ContactValidation.SEARCH;
}

import { ZodType, z } from 'zod';
import { ContactValidation } from '../contact/contact.validation';

export class SupplierValidation {
  static readonly CREATE: ZodType = z.object({
    contact_id: z.number().positive().optional(),
    contact: ContactValidation.CREATE.optional(),
    saldo_hutang: z.number().optional().default(0),
    max_hutang: z.number().optional().default(0),
    saldo_awal_hutang: z.number().optional().default(0),
    jatuh_tempo: z.number().optional().default(0),
  });

  static readonly UPDATE: ZodType = z.object({
    contact_id: z.number().positive(),
    saldo_hutang: z.number().optional(),
    max_hutang: z.number().optional(),
    saldo_awal_hutang: z.number().optional(),
    jatuh_tempo: z.number().optional(),
  });

  static readonly SEARCH: ZodType = ContactValidation.SEARCH;
}

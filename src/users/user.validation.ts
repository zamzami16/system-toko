import { ZodType, z } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(1).max(200),
    nama: z.string().min(1).max(200),
    alamat: z.string().min(1).max(200).optional(),
    email: z.string().email().min(1).max(100).optional(),
    noHp: z.string().min(1).max(20).optional(),
  });
}

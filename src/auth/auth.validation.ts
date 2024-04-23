import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly SIGN_IN: ZodType = z.object({
    username: z.string().min(1).max(200),
    password: z.string().min(1).max(200),
  });
}

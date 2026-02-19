import { z } from 'zod';

export class AuthValidation {
  static readonly SIGN_IN = z.object({
    username: z.string().min(1).max(200),
    password: z.string().min(1).max(200),
  });
}

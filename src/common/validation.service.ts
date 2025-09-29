import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ValidationService {
  validate<T>(zodType: z.ZodType<T>, data: unknown): T {
    return zodType.parse(data);
  }
}

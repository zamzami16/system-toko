import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '@src/common/validation.service';

@Injectable()
export class ContactService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
}

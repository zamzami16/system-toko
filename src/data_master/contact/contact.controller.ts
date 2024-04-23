import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('/api/contacts')
export class ContactController {}

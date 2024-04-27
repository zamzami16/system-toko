import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Contact')
@ApiBearerAuth()
@Controller('/api/contacts')
export class ContactController {}

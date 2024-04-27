import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import {
  CreateContactRequest,
  SearchContactRequest,
} from '../../model/contact.model';
import { WebResponse } from '../../model/web.response';
import {
  ContactResponse,
  UpdateContactRequest,
} from '../../model/contact.model';
import { ValidationService } from '../../common/validation.service';

@ApiTags('Contact')
@ApiBearerAuth()
@Controller('/api/contacts')
export class ContactController {
  constructor(
    private contactService: ContactService,
    private validationService: ValidationService,
  ) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:contact_id')
  @HttpCode(200)
  async detail(
    @Param('contact_id', ParseIntPipe) contact_id: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.detail(contact_id);
    return {
      data: result,
    };
  }

  @Delete('/:contact_id')
  @HttpCode(200)
  async delete(
    @Param('contact_id', ParseIntPipe) contact_id: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.delete(contact_id);
    return {
      data: result,
    };
  }

  @Put('/:contact_id')
  @HttpCode(200)
  async update(
    @Param('contact_id', ParseIntPipe) contact_id: number,
    @Body() request: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contact_id;
    const result = await this.contactService.update(request);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'nama', required: false, type: String })
  @ApiQuery({ name: 'alamat', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'no_hp', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async list(
    @Query('nama') nama?: string,
    @Query('alamat') alamat?: string,
    @Query('email') email?: string,
    @Query('no_hp') no_hp?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const search: SearchContactRequest = {
      nama: nama,
      alamat: alamat,
      email: email,
      no_hp: no_hp,
      page: page || 1,
      size: size || 10,
    };
    const result = await this.contactService.search(search);
    return result;
  }
}

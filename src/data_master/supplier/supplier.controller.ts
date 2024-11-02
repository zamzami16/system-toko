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
import { SupplierService } from './supplier.service';
import {
  CreateSupplierRequest,
  SearchSupplierRequest,
  SupplierResponse,
  UpdateSupplierRequest,
} from '../../model/data.master/supplier.model';
import { WebResponse } from '../../model/web.response';

@ApiTags('Supplier')
@ApiBearerAuth()
@Controller('/api/suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateSupplierRequest,
  ): Promise<WebResponse<SupplierResponse>> {
    const result = await this.supplierService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async detail(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<SupplierResponse>> {
    const result = await this.supplierService.detail(contactId);
    return {
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async delete(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<SupplierResponse>> {
    const result = await this.supplierService.delete(contactId);
    return {
      data: result,
    };
  }

  @Put('/:contactId')
  @HttpCode(200)
  async update(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateSupplierRequest,
  ): Promise<WebResponse<SupplierResponse>> {
    request.contactId = contactId;
    const result = await this.supplierService.update(request);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'nama', required: false, type: String })
  @ApiQuery({ name: 'alamat', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'noHp', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async list(
    @Query('nama') nama?: string,
    @Query('alamat') alamat?: string,
    @Query('email') email?: string,
    @Query('noHp') noHp?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<SupplierResponse[]>> {
    const search: SearchSupplierRequest = {
      nama: nama,
      alamat: alamat,
      email: email,
      noHp: noHp,
      page: page || 1,
      size: size || 10,
    };
    const result = await this.supplierService.search(search);
    return result;
  }
}

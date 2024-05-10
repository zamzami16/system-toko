import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PelangganService } from './pelanggan.service';
import {
  CreatePelangganRequest,
  PelangganResponse,
  SearchPelangganRequest,
  UpdatePelangganRequest,
} from '../../model/data.master/pelanggan.model';
import { WebResponse } from '../../model/web.response';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JenisPajak } from '@prisma/client';

@ApiTags('Pelanggan')
@ApiBearerAuth()
@Controller('/api/pelanggans')
export class PelangganController {
  constructor(private pelangganService: PelangganService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreatePelangganRequest,
  ): Promise<WebResponse<PelangganResponse>> {
    const result = await this.pelangganService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:contact_id')
  @HttpCode(200)
  async detail(
    @Param('contact_id', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<PelangganResponse>> {
    const result = await this.pelangganService.detail(contactId);
    return {
      data: result,
    };
  }

  @Delete('/:contact_id')
  @HttpCode(200)
  async delete(
    @Param('contact_id', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<PelangganResponse>> {
    const result = await this.pelangganService.delete(contactId);
    return {
      data: result,
    };
  }

  @Put('/:contact_id')
  @HttpCode(200)
  async update(
    @Param('contact_id', ParseIntPipe) contactId: number,
    @Body() request: UpdatePelangganRequest,
  ): Promise<WebResponse<PelangganResponse>> {
    request.contactId = contactId;
    const result = await this.pelangganService.update(request);
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
  @ApiQuery({ name: 'isCanCredit', required: false, type: Boolean })
  @ApiQuery({ name: 'jenisPelanggan', required: false, type: String })
  @ApiQuery({ name: 'jenisPajak', required: false, enum: JenisPajak })
  async search(
    @Query('nama') nama?: string,
    @Query('alamat') alamat?: string,
    @Query('email') email?: string,
    @Query('no_hp') no_hp?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
    @Query('isCanCredit', new ParseBoolPipe({ optional: true }))
    isCanCredit?: boolean,
    @Query('jenisPajak', new ParseEnumPipe(JenisPajak, { optional: true }))
    jenisPajak?: JenisPajak,
    @Query('jenisPelanggan') jenisPelanggan?: string,
  ): Promise<WebResponse<PelangganResponse[]>> {
    const request: SearchPelangganRequest = {
      nama: nama,
      alamat: alamat,
      email: email,
      no_hp: no_hp,
      page: page || 1,
      size: size || 10,
      isCanCredit: isCanCredit,
      jenisPajak: jenisPajak,
      jenisPelanggan: jenisPelanggan,
    };

    return await this.pelangganService.search(request);
  }
}

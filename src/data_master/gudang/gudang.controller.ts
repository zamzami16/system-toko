import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { GudangService } from './gudang.service';
import {
  CreateGudangRequest,
  GudangResponse,
  SearchGudangRequest,
  UpdateGudangRequest,
} from '../../model/data.master/gudang.model';
import { WebResponse } from '../../model/web.response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Gudang')
@ApiBearerAuth()
@Controller('/api/gudangs')
export class GudangController {
  constructor(private gudangService: GudangService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateGudangRequest,
  ): Promise<WebResponse<GudangResponse>> {
    const result = await this.gudangService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:gudang_id')
  @HttpCode(200)
  async detail(@Param('gudang_id', ParseIntPipe) gudang_id: number) {
    const gudang = await this.gudangService.detail(gudang_id);
    return {
      data: gudang,
    };
  }

  @Delete('/:gudang_id')
  @HttpCode(200)
  async delete(@Param('gudang_id', ParseIntPipe) gudang_id: number) {
    const gudang = await this.gudangService.delete(gudang_id);
    return {
      data: gudang,
    };
  }

  @Put('/:gudang_id')
  @HttpCode(200)
  async update(
    @Param('gudang_id', ParseIntPipe) gudang_id: number,
    @Body() request: UpdateGudangRequest,
  ) {
    request.id = gudang_id;
    const gudang = await this.gudangService.update(request);
    return {
      data: gudang,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Query('nama') nama?: string,
    @Query('alamat') alamat?: string,
    @Query('keterangan') keterangan?: string,
    @Query('is_active', new ParseBoolPipe({ optional: true }))
    is_active?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<GudangResponse[]>> {
    const request: SearchGudangRequest = {
      nama: nama,
      alamat: alamat,
      keterangan: keterangan,
      is_active: is_active,
      page: page || 1,
      size: size || 10,
    };

    const result = await this.gudangService.search(request);
    return result;
  }
}
